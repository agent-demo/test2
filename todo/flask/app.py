"""Server-rendered Flask version of Toradora."""

from __future__ import annotations

import os
import sys
from pathlib import Path

from flask import Flask, flash, redirect, render_template, request, url_for

PYTHON_TRACK = Path(__file__).resolve().parents[1] / "python"
sys.path.insert(0, str(PYTHON_TRACK))

# The reusable Toradora implementation lives in ../python/toradora.py.
# Flask supplies the web interface; TodoStore keeps the task behavior shared.
from toradora import TodoStore, grouped_active_tasks  # noqa: E402


def create_app(test_config: dict | None = None) -> Flask:
    app = Flask(__name__)
    app.config.from_mapping(
        SECRET_KEY="dev-key-change-me",
        DATABASE=os.environ.get("TORADORA_DB", str(Path.home() / ".toradora.db")),
    )
    if test_config:
        app.config.update(test_config)

    def store() -> TodoStore:
        return TodoStore(app.config["DATABASE"])

    @app.get("/")
    def index():
        todo_store = store()
        show_all = request.args.get("show") == "all"
        tasks = todo_store.all() if show_all else todo_store.active()
        return render_template(
            "index.html",
            groups=grouped_active_tasks(tasks) if not show_all else None,
            tasks=tasks,
            show_all=show_all,
        )

    @app.post("/tasks")
    def add_task():
        try:
            task = store().add(
                request.form.get("task", ""),
                int(request.form.get("priority", 2)),
                request.form.get("long_term") == "on",
            )
            flash(f"Task {task.id} added.", "success")
        except (TypeError, ValueError) as error:
            flash(str(error), "error")
        return redirect(url_for("index"))

    @app.post("/tasks/<int:task_id>/complete")
    def complete_task(task_id: int):
        if not store().complete(task_id):
            flash("Task not found.", "error")
        return redirect(url_for("index"))

    @app.post("/tasks/<int:task_id>/delete")
    def delete_task(task_id: int):
        if not store().delete(task_id):
            flash("Task not found.", "error")
        return redirect(url_for("index"))

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
