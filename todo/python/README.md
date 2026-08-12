# Toradora — Python

This is the beginner-friendly CLI track. It uses only Python's standard library and SQLite, so there is no framework or database server to install.

## Setup

```bash
cd todo/python
python3 toradora.py --help
```

Tasks are stored in `~/.toradora.db`. Use `--db /path/to/test.db` when experimenting or writing tests.

```bash
python3 toradora.py -a "Read the contribution guide"
python3 toradora.py -a "Fix the urgent bug" --priority 1
python3 toradora.py --long-term "Practice Python every week"
python3 toradora.py
python3 toradora.py --complete 1
python3 toradora.py --delete 2
```

Priority `1` is high (`[!]`), `2` is medium (`[~]`), and `3` is low (`[ ]`). Long-term tasks are always shown, while other tasks move from today to the backlog as their date changes. The `-d`/`--daily` spelling is kept as a compatibility alias for the original C version.

## Good first issues

- Add a `--list` alias for the default task view.
- Add a command that changes a task's priority.
- Add a `--version` option using the original Toradora version.
- Write unit tests for `grouped_active_tasks()`.
- Add a friendlier error when someone completes a non-number ID.
- Add an option to choose a custom database path through an environment variable.

## License

This track is licensed under the [BSD 2-Clause License](LICENSE).
