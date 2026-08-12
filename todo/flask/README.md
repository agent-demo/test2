# Toradora — Flask

This track serves the same SQLite-backed Python todo logic as `todo/python/`, but uses Flask routes and Jinja templates to render HTML on the server. It is intentionally the architectural opposite of `todo/js/`: there is no client-side framework and no browser-managed task state.

## Setup

```bash
cd todo/flask
python3 -m venv .venv
. .venv/bin/activate       # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
flask --app app run --debug
```

Open <http://127.0.0.1:5000>. Tasks use `~/.toradora.db` by default, the same database as the Python CLI. Set `TORADORA_DB=/path/to/test.db` to use a different file while developing.

The app has server-rendered routes for listing, adding, completing, and deleting tasks. The Python store also keeps the original edit and priority behavior available to the other track.

## Good first issues

- Add a server-rendered edit form and `POST /tasks/<id>/edit` route.
- Add a confirmation page before deleting a task.
- Add a task-count summary to the page.
- Add a route that changes a task's priority.
- Move the priority marker mapping from the template into a Jinja helper.
- Add a small Flask test for the add-and-complete flow.
