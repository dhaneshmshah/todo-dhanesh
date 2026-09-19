# Plan for a To Do app

Specifications
1. simple to do app. No frills. basic
2. it should run in browser
3. each task has a priority (High, Medium or Low), chosen when the task is added
   - Medium is the default
   - the list is sorted High first, then Medium, then Low
   - priority can be changed after adding, using the dropdown on each task (the list re-sorts)
   - each task shows a colour-coded left border and a priority label
   - tasks saved without a priority are treated as Medium
4. dark mode
   - a toggle button in the top-right of the card switches between light and dark
   - the first visit follows the system light/dark setting
   - the chosen theme is remembered in localStorage
5. edit task text: double-click the text or press the Edit button; Enter saves, Esc cancels
6. clear completed: one button removes all ticked tasks
7. filter tabs: All / Active / Done
8. filter by priority: dropdown (All / High / Medium / Low), works together with the tabs and search
9. search box: filters tasks by text as you type
10. undo: deleting a task or clearing completed tasks shows a toast with an Undo button (6 seconds)
11. due dates (optional)
    - set when adding a task, or changed later on each task
    - not-done tasks past their due date are highlighted red and labelled "Overdue"
12. drag-and-drop reordering within the same priority group
    - keyboard alternative: focus the drag handle and press Up / Down arrow
13. export / import
    - Export downloads all tasks as a JSON file
    - Import replaces the current tasks with a JSON file (asks for confirmation first)
14. accessibility: visible focus outlines, labels on all controls, live regions for the count and undo toast


Techonology
- Plain HTML + CSS + vanilla JavaScript (no build step, no backend)
- Tasks and theme choice saved in browser localStorage
- Filters and search are not saved (they reset on reload)
- Themes done with CSS variables and a data-theme attribute on the html element
- Run by opening index.html in a browser
