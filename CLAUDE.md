# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A single-page To Do app in `TODO/` (the repo root `d:\CCCCLass` is only a container; there is no git repo). Plain HTML + CSS + vanilla JS with no build step, no dependencies, no package.json, no tests and no linter. Run it by opening `TODO/index.html` in a browser; reload to see changes. Verification is manual in the browser.

`specs.md` is the feature spec and `CHANGELOG.md` is the work log. Update both when adding or changing features.

## Architecture

Three files that must be read together:

- `index.html` declares every control the script uses (form, filters, tabs, footer actions, toast). `app.js` grabs them all by id at the top, so renaming or removing an id breaks the script.
- `app.js` is one file with a single mutable `todos` array as the source of truth. The pattern is: mutate `todos` -> `save()` (localStorage key `todos`) -> `render()`. `render()` rebuilds the whole `<ul>` from scratch each time, creating each row's controls and listeners inline, so any new per-task control belongs inside `render()`'s `forEach`.
- `style.css` uses CSS variables on `:root`, overridden under `:root[data-theme="dark"]`. New colours must be defined in both blocks.

Things that are easy to get wrong:

- **Array order vs display order.** `todos` holds the manual order; `visibleTodos()` sorts a copy by priority (stable) and then applies status, category, priority and search filters. Drag-and-drop and `moveWithinPriority()` reorder the underlying `todos` array and only allow moves within the same priority group. Do not sort `todos` itself.
- **Filters are UI-only state** (`statusFilter`, the select values, the search box). They are not saved and reset on reload.
- **Data normalisation.** `normalize()` runs on everything loaded from localStorage or imported, filling defaults for `priority` (medium), `category` (empty), `due` (empty) and `id`. Add new task fields there and in the add-form `submit` handler, and also in the import validator `isValidTodo`. Older saved data lacks new fields, so defaults must be safe.
- **Undo** works through `lastRemoved`, which stores `{todo, index}` pairs. Both single delete and "Clear completed" go through `removeTodos()`, which also shows the toast.
- **Inline edit** (`startEdit`) swaps the text span for an input outside of `render()`. The `finished` flag stops the blur and Enter/Esc handlers from both committing.
- **Theme** is applied twice: an inline script in `<head>` sets `data-theme` before first paint to avoid a flash, and `applyTheme()` in `app.js` handles the toggle and saves the choice (localStorage key `theme`). Keep both in sync.
- **Task text in aria-labels** is passed through `escapeAriaLabel()`. Task text itself is always set with `textContent`, never `innerHTML`.

Task shape: `{ id, text, done, priority: 'high'|'medium'|'low', category: ''|'work'|'personal'|'shopping'|'health', due: 'YYYY-MM-DD' or '' }`. Ids are numeric but non-integer (`Date.now() + Math.random() * 10000`), so treat them as opaque numbers.
