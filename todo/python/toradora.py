#!/usr/bin/env python3
"""Small SQLite-backed command-line todo list.

The store in this module is also used by the Flask implementation.  Keeping
database operations here means both Python tracks exercise the same behavior.
"""

from __future__ import annotations

import argparse
import sqlite3
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import Iterable


PRIORITY_LABELS = {1: "[!]", 2: "[~]", 3: "[ ]"}
DEFAULT_DB_PATH = Path.home() / ".toradora.db"


@dataclass(frozen=True)
class Task:
    id: int
    task: str
    status: int
    priority: int
    long_term: bool
    created_at: str

    @classmethod
    def from_row(cls, row: sqlite3.Row) -> "Task":
        return cls(
            id=row["id"],
            task=row["task"],
            status=row["status"],
            priority=row["priority"],
            long_term=bool(row["daily"]),
            created_at=row["created_at"],
        )


class TodoStore:
    """SQLite persistence for Toradora tasks."""

    def __init__(self, database_path: str | Path = DEFAULT_DB_PATH):
        self.database_path = Path(database_path).expanduser()
        self.database_path.parent.mkdir(parents=True, exist_ok=True)
        self._initialise()

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.database_path)
        connection.row_factory = sqlite3.Row
        return connection

    def _initialise(self) -> None:
        with self._connect() as connection:
            connection.execute(
                """CREATE TABLE IF NOT EXISTS tasks (
                    id INTEGER PRIMARY KEY,
                    task TEXT NOT NULL,
                    status INTEGER NOT NULL DEFAULT 0,
                    priority INTEGER NOT NULL DEFAULT 2,
                    daily INTEGER NOT NULL DEFAULT 0,
                    created_at TEXT NOT NULL DEFAULT CURRENT_DATE
                )"""
            )
            # Keep databases made by the original C app usable.
            columns = {
                row["name"]
                for row in connection.execute("PRAGMA table_info(tasks)")
            }
            if "priority" not in columns:
                connection.execute(
                    "ALTER TABLE tasks ADD COLUMN priority INTEGER NOT NULL DEFAULT 2"
                )
            if "daily" not in columns:
                connection.execute(
                    "ALTER TABLE tasks ADD COLUMN daily INTEGER NOT NULL DEFAULT 0"
                )
            if "created_at" not in columns:
                connection.execute(
                    "ALTER TABLE tasks ADD COLUMN created_at TEXT NOT NULL DEFAULT CURRENT_DATE"
                )

    def add(self, task: str, priority: int = 2, long_term: bool = False) -> Task:
        task = task.strip()
        if not task:
            raise ValueError("Task text cannot be empty")
        if priority not in PRIORITY_LABELS:
            raise ValueError("Priority must be 1, 2, or 3")
        with self._connect() as connection:
            cursor = connection.execute(
                "INSERT INTO tasks (task, priority, daily) VALUES (?, ?, ?)",
                (task, priority, int(long_term)),
            )
            row = connection.execute(
                "SELECT * FROM tasks WHERE id = ?", (cursor.lastrowid,)
            ).fetchone()
        return Task.from_row(row)

    def active(self) -> list[Task]:
        with self._connect() as connection:
            rows = connection.execute(
                """SELECT * FROM tasks
                   WHERE status = 0
                   ORDER BY daily DESC, priority ASC, id ASC"""
            ).fetchall()
        return [Task.from_row(row) for row in rows]

    def all(self) -> list[Task]:
        with self._connect() as connection:
            rows = connection.execute(
                "SELECT * FROM tasks ORDER BY priority ASC, id ASC"
            ).fetchall()
        return [Task.from_row(row) for row in rows]

    def complete(self, task_id: int) -> bool:
        with self._connect() as connection:
            cursor = connection.execute(
                "UPDATE tasks SET status = 1 WHERE id = ?", (task_id,)
            )
        return cursor.rowcount == 1

    def edit(self, task_id: int, task: str) -> bool:
        task = task.strip()
        if not task:
            raise ValueError("Task text cannot be empty")
        with self._connect() as connection:
            cursor = connection.execute(
                "UPDATE tasks SET task = ? WHERE id = ?", (task, task_id)
            )
        return cursor.rowcount == 1

    def delete(self, task_id: int) -> bool:
        with self._connect() as connection:
            cursor = connection.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
        return cursor.rowcount == 1


def priority_label(priority: int) -> str:
    return PRIORITY_LABELS.get(priority, "[~]")


def grouped_active_tasks(tasks: Iterable[Task]) -> dict[str, list[Task]]:
    today = date.today().isoformat()
    groups = {"Long-term": [], "Today's Tasks": [], "Backlog": []}
    for task in tasks:
        if task.long_term:
            groups["Long-term"].append(task)
        elif task.created_at == today:
            groups["Today's Tasks"].append(task)
        else:
            groups["Backlog"].append(task)
    return groups


def print_task(task: Task) -> None:
    marker = "[x]" if task.status else priority_label(task.priority)
    print(f"  {marker} {task.id}. {task.task}")


def print_active(tasks: Iterable[Task]) -> None:
    print("----------------------------------------------")
    for name, grouped in grouped_active_tasks(tasks).items():
        print(f">>> {name} <<<")
        for task in grouped:
            print_task(task)
        print()
    print("----------------------------------------------")


def print_all(tasks: Iterable[Task]) -> None:
    print("----------------------------------------------")
    print(">>> All tasks ever recorded <<<")
    for task in tasks:
        print_task(task)
    print("----------------------------------------------")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="A small terminal todo list")
    parser.add_argument(
        "--db", type=Path, default=DEFAULT_DB_PATH, help="SQLite path (default: ~/.toradora.db)"
    )
    actions = parser.add_mutually_exclusive_group()
    actions.add_argument("-a", "--add", metavar="TASK", help="add a task")
    actions.add_argument(
        "-d", "--daily", "--long-term", dest="long_term", metavar="TASK",
        help="add a long-term task (always shown)",
    )
    actions.add_argument("-c", "--complete", type=int, metavar="ID", help="complete a task")
    actions.add_argument(
        "-e", "--edit", nargs=2, metavar=("ID", "TASK"), help="edit a task"
    )
    actions.add_argument("--delete", type=int, metavar="ID", help="delete a task")
    actions.add_argument("-z", "--all", action="store_true", help="show all tasks")
    parser.add_argument(
        "-p", "--priority", type=int, choices=(1, 2, 3), default=2,
        help="1=high, 2=medium, 3=low (default: 2)",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    store = TodoStore(args.db)

    try:
        if args.add is not None:
            task = store.add(args.add, args.priority)
            print(f"Task {task.id} added with priority {priority_label(task.priority)}")
        elif args.long_term is not None:
            task = store.add(args.long_term, args.priority, long_term=True)
            print(f"Long-term task {task.id} added with priority {priority_label(task.priority)}")
        elif args.complete is not None:
            print(
                f"Task {args.complete} marked as complete"
                if store.complete(args.complete)
                else "No task found with that id"
            )
        elif args.edit is not None:
            task_id, text = args.edit
            if store.edit(int(task_id), text):
                print(f"Task {task_id} updated")
            else:
                print("No task found with that id")
        elif args.delete is not None:
            print(
                f"Task {args.delete} deleted"
                if store.delete(args.delete)
                else "No task found with that id"
            )
        elif args.all:
            print_all(store.all())
        else:
            print_active(store.active())
    except (ValueError, sqlite3.Error) as error:
        parser.error(str(error))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
