# Toradora — Vanilla JavaScript

This track is a purely client-side version of Toradora. The browser renders the page and saves tasks in `localStorage`; there is no backend, database, or build step.

## Setup

Open [`index.html`](index.html) directly in a browser, or serve this folder with any simple static server:

```bash
cd todo/js
python3 -m http.server 8000
```

Then visit <http://localhost:8000>. Data is private to the browser profile and can be cleared from the browser's site storage.

## Good first issues

- Add a filter for high, medium, and low priority tasks.
- Replace the edit prompt with an inline edit form.
- Add a button to clear all completed tasks.
- Show a small task count next to each section heading.
- Add keyboard-friendly focus styles to the controls.
- Add a one-click export/import option using JSON files.

## License

This track is licensed under the [BSD 2-Clause License](LICENSE).
