# To Do app: work log

A record of everything done to the app so far, in order. Files live in this folder:
`index.html`, `style.css`, `app.js`, `specs.md`.

## Baseline (before this work)
- Add a task, tick it done, delete it, and see an "items left" count.
- Tasks saved in browser localStorage.

## 1. Task priority
- Priority dropdown (High / Medium / Low) in the add form, default Medium.
- List sorted High, then Medium, then Low.
- Colour-coded left border and a priority label on each task.
- Older saved tasks without a priority are treated as Medium.
- Files: `index.html`, `style.css`, `app.js`.

## 2. Dark mode
- Toggle button in the top-right of the card.
- First visit follows the system light/dark setting; the choice is then saved in localStorage.
- Theme is set from a small script in the page head to avoid a white flash on load.
- Colours moved to CSS variables, switched by a `data-theme` attribute on `<html>`.
- Files: `index.html`, `style.css`, `app.js`.

## 3. Specs updated
- `specs.md` now lists priority and dark mode, plus the technology notes for them.

## 4. Change priority after adding
- The priority label on each task became a dropdown.
- Changing it saves the task and re-sorts the list.
- Files: `app.js`, `style.css`, `specs.md`.

## 5. Ten suggested improvements (proposed, then all built)
Suggestions were ranked by value and ease. All ten were then implemented:

| # | Feature | How it works |
|---|---------|--------------|
| 1 | Edit task text | Double-click the text or press Edit. Enter saves, Esc cancels. Empty text is ignored. |
| 2 | Clear completed | Removes all ticked tasks. Disabled when none are ticked. |
| 3 | Filter tabs | All / Active / Done. |
| 4 | Undo | Deleting a task or clearing completed shows a 6-second toast with Undo. Tasks return to their original positions. |
| 5 | Due dates | Optional date when adding, editable per task. Not-done tasks past due turn red with an "Overdue" label. |
| 6 | Priority filter | Dropdown next to the search box. Combines with tabs and search. |
| 7 | Search | Filters by task text as you type. |
| 8 | Accessibility | Focus outlines, labels on all controls, live regions for the count and toast. |
| 9 | Drag to reorder | Drag the handle to reorder within the same priority. Up/Down arrow keys on the handle also work. |
| 10 | Export / Import | Export downloads JSON. Import replaces current tasks after a confirmation and rejects invalid files. |

Other changes made along the way:
- Card widened from 480px to 640px; task controls wrap on narrow screens.
- Saved data is normalised on load (missing priority, due date or id are filled in).
- `specs.md` rewritten to list all 14 specifications.

## Known limits
- Filters and search are not saved; they reset on reload.
- Tasks stay grouped by priority, so reordering only works within a group.
- Import replaces tasks rather than merging.
- Nothing has been tested in a browser yet. Drag-and-drop and import in particular need a manual check.
