const form = document.getElementById('form');
const input = document.getElementById('input');
const categorySelect = document.getElementById('category');
const prioritySelect = document.getElementById('priority');
const dueInput = document.getElementById('due');
const search = document.getElementById('search');
const categoryFilter = document.getElementById('categoryFilter');
const priorityFilter = document.getElementById('priorityFilter');
const tabs = document.getElementById('tabs');
const list = document.getElementById('list');
const empty = document.getElementById('empty');
const count = document.getElementById('count');
const themeBtn = document.getElementById('theme');
const clearBtn = document.getElementById('clear');
const exportBtn = document.getElementById('export');
const importBtn = document.getElementById('import');
const fileInput = document.getElementById('file');
const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toastMsg');
const undoBtn = document.getElementById('undo');

const ORDER = { high: 0, medium: 1, low: 2 };
const PRIORITIES = ['high', 'medium', 'low'];
const CATEGORIES = ['work', 'personal', 'shopping', 'health'];
const MAX_TEXT_LENGTH = 5000;

let todos = load().map(normalize);
let statusFilter = 'all';
let dragId = null;
let lastRemoved = null;
let toastTimer = null;

function escapeAriaLabel(text) {
  return String(text).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function normalize(t, i) {
  return {
    id: typeof t.id === 'number' ? t.id : Date.now() + Math.random() * 10000,
    text: String(t.text || '').trim().substring(0, MAX_TEXT_LENGTH),
    done: !!t.done,
    priority: PRIORITIES.includes(t.priority) ? t.priority : 'medium',
    category: CATEGORIES.includes(t.category) ? t.category : '',
    due: /^\d{4}-\d{2}-\d{2}$/.test(t.due || '') ? t.due : ''
  };
}

function load() {
  try {
    const data = JSON.parse(localStorage.getItem('todos'));
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

function save() {
  try {
    localStorage.setItem('todos', JSON.stringify(todos));
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      showToast('Warning: Storage full. Unable to save changes.');
      console.warn('localStorage quota exceeded');
    } else {
      console.error('Failed to save todos:', e);
    }
  }
}

function today() {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

function visibleTodos() {
  const q = search.value.trim().toLowerCase();
  return todos
    .slice()
    .sort((a, b) => ORDER[a.priority] - ORDER[b.priority])
    .filter(t => {
      if (statusFilter === 'active' && t.done) return false;
      if (statusFilter === 'done' && !t.done) return false;
      if (categoryFilter.value !== 'all' && t.category !== categoryFilter.value) return false;
      if (priorityFilter.value !== 'all' && t.priority !== priorityFilter.value) return false;
      if (q && !t.text.toLowerCase().includes(q)) return false;
      return true;
    });
}

function render() {
  list.innerHTML = '';
  const now = today();
  const visible = visibleTodos();

  visible.forEach(todo => {
    const li = document.createElement('li');
    li.classList.add(todo.priority);
    if (todo.category) li.classList.add(todo.category);
    li.dataset.id = todo.id;
    if (todo.done) li.classList.add('done');
    if (todo.due && todo.due < now && !todo.done) li.classList.add('overdue');

    // Drag handle (mouse drag, or Up/Down arrow keys within the same priority)
    const handle = document.createElement('button');
    handle.type = 'button';
    handle.className = 'handle';
    handle.textContent = '⠿';
    handle.setAttribute('aria-label', 'Reorder task (drag, or use Up and Down arrow keys)');
    handle.addEventListener('mousedown', () => { li.draggable = true; });
    handle.addEventListener('mouseup', () => { li.draggable = false; });
    handle.addEventListener('keydown', e => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        moveWithinPriority(todo, e.key === 'ArrowUp' ? -1 : 1);
      }
    });
    li.addEventListener('dragstart', e => {
      dragId = todo.id;
      li.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(todo.id));
    });
    li.addEventListener('dragend', () => {
      dragId = null;
      li.draggable = false;
      li.classList.remove('dragging');
      list.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    });
    li.addEventListener('dragover', e => {
      const dragged = todos.find(t => t.id === dragId);
      if (dragged && dragged.id !== todo.id && dragged.priority === todo.priority) {
        e.preventDefault();
        li.classList.add('drag-over');
      }
    });
    li.addEventListener('dragleave', () => li.classList.remove('drag-over'));
    li.addEventListener('drop', e => {
      e.preventDefault();
      const dragged = todos.find(t => t.id === dragId);
      if (dragged && dragged.id !== todo.id && dragged.priority === todo.priority) {
        const from = todos.indexOf(dragged);
        const movingDown = from < todos.indexOf(todo);
        todos.splice(from, 1);
        todos.splice(todos.indexOf(todo) + (movingDown ? 1 : 0), 0, dragged);
        save();
        render();
      }
    });

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = todo.done;
    box.setAttribute('aria-label', `Mark "${escapeAriaLabel(todo.text)}" as done`);
    box.addEventListener('change', () => {
      todo.done = box.checked;
      save();
      render();
    });

    const text = document.createElement('span');
    text.className = 'text';
    text.textContent = todo.text;
    text.title = 'Double-click to edit';
    text.addEventListener('dblclick', () => startEdit(todo, text));

    const overdue = document.createElement('span');
    overdue.className = 'overdue-label';
    overdue.textContent = 'Overdue';

    const due = document.createElement('input');
    due.type = 'date';
    due.className = 'due';
    due.value = todo.due;
    due.setAttribute('aria-label', 'Due date');
    due.addEventListener('change', () => {
      todo.due = due.value;
      save();
      render();
    });

    const categorySelect = document.createElement('select');
    categorySelect.className = 'badge';
    categorySelect.setAttribute('aria-label', 'Change category');
    const noCatOpt = document.createElement('option');
    noCatOpt.value = '';
    noCatOpt.textContent = 'No cat.';
    categorySelect.appendChild(noCatOpt);
    CATEGORIES.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      categorySelect.appendChild(opt);
    });
    categorySelect.value = todo.category;
    categorySelect.addEventListener('change', () => {
      todo.category = categorySelect.value;
      save();
      render();
    });

    const categoryBadge = document.createElement('span');
    categoryBadge.className = 'category-badge';
    if (todo.category) {
      categoryBadge.textContent = todo.category;
    } else {
      categoryBadge.style.display = 'none';
    }

    const badge = document.createElement('select');
    badge.className = 'badge';
    badge.setAttribute('aria-label', 'Change priority');
    PRIORITIES.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p;
      opt.textContent = p;
      badge.appendChild(opt);
    });
    badge.value = todo.priority;
    badge.addEventListener('change', () => {
      todo.priority = badge.value;
      save();
      render();
    });

    const edit = document.createElement('button');
    edit.type = 'button';
    edit.className = 'small';
    edit.textContent = 'Edit';
    edit.setAttribute('aria-label', `Edit "${escapeAriaLabel(todo.text)}"`);
    edit.addEventListener('click', () => startEdit(todo, text));

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'small';
    del.textContent = 'Delete';
    del.setAttribute('aria-label', `Delete "${escapeAriaLabel(todo.text)}"`);
    del.addEventListener('click', () => removeTodos([todo], 'Task deleted.'));

    li.append(handle, box, text, overdue, due, categoryBadge, categorySelect, badge, edit, del);
    list.appendChild(li);
  });

  if (visible.length === 0) {
    empty.hidden = false;
    empty.textContent = todos.length === 0 ? 'No tasks yet. Add one above.' : 'No tasks match the current filters.';
  } else {
    empty.hidden = true;
  }

  const left = todos.filter(t => !t.done).length;
  count.textContent = left + (left === 1 ? ' item left' : ' items left');
  clearBtn.disabled = !todos.some(t => t.done);
}

function startEdit(todo, span) {
  const field = document.createElement('input');
  field.type = 'text';
  field.className = 'edit';
  field.value = todo.text;
  field.setAttribute('aria-label', 'Edit task text');
  let finished = false;

  function finish(commit) {
    if (finished) return;
    finished = true;
    if (commit) {
      const v = field.value.trim();
      if (v) {
        todo.text = v;
        save();
      }
    }
    render();
  }

  field.addEventListener('keydown', e => {
    if (e.key === 'Enter') finish(true);
    else if (e.key === 'Escape') finish(false);
  });
  field.addEventListener('blur', () => finish(true));

  span.replaceWith(field);
  field.focus();
  field.select();
}

function moveWithinPriority(todo, dir) {
  let i = todos.indexOf(todo) + dir;
  while (i >= 0 && i < todos.length && todos[i].priority !== todo.priority) i += dir;
  if (i < 0 || i >= todos.length) return;
  const from = todos.indexOf(todo);
  [todos[from], todos[i]] = [todos[i], todos[from]];
  save();
  render();
  const handle = list.querySelector('li[data-id="' + todo.id + '"] .handle');
  if (handle) handle.focus();
}

function removeTodos(items, message) {
  lastRemoved = items.map(t => ({ todo: t, index: todos.indexOf(t) }));
  todos = todos.filter(t => !items.includes(t));
  save();
  render();
  showToast(message);
}

function showToast(message) {
  toastMsg.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, 6000);
}

function hideToast() {
  toast.hidden = true;
  lastRemoved = null;
}

undoBtn.addEventListener('click', () => {
  if (!lastRemoved) return;
  lastRemoved
    .slice()
    .sort((a, b) => a.index - b.index)
    .forEach(r => todos.splice(Math.min(r.index, todos.length), 0, r.todo));
  clearTimeout(toastTimer);
  hideToast();
  save();
  render();
});

form.addEventListener('submit', e => {
  e.preventDefault();
  const text = input.value.trim().substring(0, MAX_TEXT_LENGTH);
  if (!text) return;
  todos.push({
    id: Date.now() + Math.random() * 10000,
    text,
    done: false,
    category: categorySelect.value,
    priority: prioritySelect.value,
    due: dueInput.value
  });
  input.value = '';
  categorySelect.value = '';
  dueInput.value = '';
  save();
  render();
});

search.addEventListener('input', render);
categoryFilter.addEventListener('change', render);
priorityFilter.addEventListener('change', render);

tabs.addEventListener('click', e => {
  const btn = e.target.closest('button[data-filter]');
  if (!btn) return;
  statusFilter = btn.dataset.filter;
  tabs.querySelectorAll('button').forEach(b => {
    b.setAttribute('aria-pressed', String(b === btn));
  });
  render();
});

clearBtn.addEventListener('click', () => {
  const done = todos.filter(t => t.done);
  if (done.length) removeTodos(done, done.length + (done.length === 1 ? ' completed task cleared.' : ' completed tasks cleared.'));
});

exportBtn.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(todos, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'todos-' + today() + '.json';
  a.click();
  URL.revokeObjectURL(url);
});

importBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  fileInput.value = '';
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    let data;
    try {
      data = JSON.parse(reader.result);
    } catch (e) {
      alert('Import failed: that file is not valid JSON.');
      return;
    }
    if (!Array.isArray(data)) {
      alert('Import failed: the file does not look like a To Do export.');
      return;
    }
    const isValidTodo = (t) => {
      return t &&
        typeof t.text === 'string' &&
        t.text.trim().length > 0 &&
        t.text.length <= MAX_TEXT_LENGTH &&
        (!t.priority || ['high', 'medium', 'low'].includes(t.priority)) &&
        (!t.due || /^\d{4}-\d{2}-\d{2}$/.test(t.due)) &&
        (!t.done || typeof t.done === 'boolean');
    };
    if (!data.every(isValidTodo)) {
      alert('Import failed: the file does not match the expected format.');
      return;
    }
    if (!confirm('Replace your current ' + todos.length + ' task(s) with ' + data.length + ' imported task(s)?')) return;
    todos = data.map(normalize).filter(t => t.text);
    save();
    render();
  };
  reader.readAsText(file);
});

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeBtn.textContent = theme === 'dark' ? '☀️ Light' : '🌙 Dark';
  try {
    localStorage.setItem('theme', theme);
  } catch (e) {}
}

themeBtn.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

applyTheme(document.documentElement.getAttribute('data-theme') || 'light');
render();
