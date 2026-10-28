// Builds and wires the editor form: plain fields, plus add / remove / reorder lists.
import { newItem } from './resume-data.js';
import { escapeHtml as esc } from './templates.js';

const LISTS = {
  experience: {
    untitled: 'New job',
    title: (i) => [i.role, i.company].filter(Boolean).join(' at '),
    fields: [
      { key: 'role', label: 'Job title', autocomplete: 'organization-title' },
      { key: 'company', label: 'Company', autocomplete: 'organization' },
      { key: 'location', label: 'Location' },
      { key: 'start', label: 'Start date', placeholder: 'Jan 2021' },
      { key: 'end', label: 'End date', placeholder: 'Present' },
      { key: 'description', label: 'What you did', type: 'textarea', rows: 5, full: true,
        hint: 'One achievement per line. Start with a verb and add a number if you can.' },
    ],
  },
  education: {
    untitled: 'New school',
    title: (i) => [i.degree, i.school].filter(Boolean).join(', '),
    fields: [
      { key: 'degree', label: 'Degree or course', full: true },
      { key: 'school', label: 'School', full: true, autocomplete: 'organization' },
      { key: 'start', label: 'Start year', placeholder: '2014' },
      { key: 'end', label: 'End year', placeholder: '2018' },
      { key: 'details', label: 'Details', type: 'textarea', rows: 3, full: true,
        hint: 'Grades, honors, relevant courses. One per line.' },
    ],
  },
  projects: {
    untitled: 'New project',
    title: (i) => i.name,
    fields: [
      { key: 'name', label: 'Project name' },
      { key: 'link', label: 'Link', placeholder: 'example.com/project' },
      { key: 'description', label: 'What it is', type: 'textarea', rows: 4, full: true,
        hint: 'One point per line.' },
    ],
  },
};

const getPath = (obj, path) => path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);
const setPath = (obj, path, value) => {
  const keys = path.split('.');
  const last = keys.pop();
  keys.reduce((o, k) => o[k], obj)[last] = value;
};

function itemHtml(list, item, isOpen, index, total) {
  const cfg = LISTS[list];
  const fields = cfg.fields.map((f) => {
    const id = `${list}-${item.id}-${f.key}`;
    const attrs = `id="${id}" data-list="${list}" data-id="${item.id}" data-field="${f.key}"`;
    const ph = f.placeholder ? ` placeholder="${esc(f.placeholder)}"` : '';
    const control = f.type === 'textarea'
      ? `<textarea ${attrs} rows="${f.rows || 4}"${ph}>${esc(item[f.key])}</textarea>`
      : `<input type="text" ${attrs} value="${esc(item[f.key])}"${ph} autocomplete="${f.autocomplete || 'off'}">`;
    return `<div class="field${f.full ? ' field--full' : ''}"><label for="${id}">${esc(f.label)}</label>${control}` +
      `${f.hint ? `<p class="hint">${esc(f.hint)}</p>` : ''}</div>`;
  }).join('');

  const tool = (action, label, disabled) =>
    `<button type="button" class="btn btn--text${action === 'remove' ? ' btn--danger' : ''}" ` +
    `data-action="${action}" data-list="${list}" data-id="${item.id}"${disabled ? ' disabled' : ''}>${label}</button>`;

  return `<li class="item"><details data-id="${item.id}"${isOpen ? ' open' : ''}>` +
    `<summary><span class="item__title">${esc(cfg.title(item) || cfg.untitled)}</span></summary>` +
    `<div class="item__body grid">${fields}</div>` +
    `<div class="item__tools">${tool('up', 'Move up', index === 0)}${tool('down', 'Move down', index === total - 1)}${tool('remove', 'Remove')}</div>` +
    `</details></li>`;
}

export function initForm({ root, getData, onChange }) {
  const openIds = new Set();

  function renderList(name) {
    const items = getData()[name];
    root.querySelector(`#list-${name}`).innerHTML =
      items.map((it, idx) => itemHtml(name, it, openIds.has(it.id), idx, items.length)).join('');
  }

  function fill() {
    const data = getData();
    root.querySelectorAll('[data-path]').forEach((el) => { el.value = getPath(data, el.dataset.path) || ''; });
    Object.keys(LISTS).forEach(renderList);
  }

  root.addEventListener('input', (e) => {
    const el = e.target;
    const data = getData();
    if (el.dataset.path) {
      setPath(data, el.dataset.path, el.value);
      onChange();
    } else if (el.dataset.list) {
      const item = data[el.dataset.list].find((i) => i.id === el.dataset.id);
      if (!item) return;
      item[el.dataset.field] = el.value;
      const cfg = LISTS[el.dataset.list];
      const title = el.closest('details').querySelector('.item__title');
      title.textContent = cfg.title(item) || cfg.untitled;
      onChange();
    }
  });

  root.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const { action, list, id } = btn.dataset;
    const items = getData()[list];

    if (action === 'add') {
      const item = newItem[list]();
      items.push(item);
      openIds.add(item.id);
      renderList(list);
      const first = root.querySelector(`#${list}-${item.id}-${LISTS[list].fields[0].key}`);
      if (first) first.focus();
    } else {
      const idx = items.findIndex((i) => i.id === id);
      if (idx < 0) return;
      if (action === 'remove') {
        items.splice(idx, 1);
        openIds.delete(id);
      } else {
        const to = action === 'up' ? idx - 1 : idx + 1;
        if (to < 0 || to >= items.length) return;
        [items[idx], items[to]] = [items[to], items[idx]];
      }
      renderList(list);
      if (action !== 'remove') {
        const summary = root.querySelector(`details[data-id="${id}"] summary`);
        if (summary) summary.focus();
      }
    }
    onChange();
  });

  // "toggle" doesn't bubble, so listen in the capture phase to remember which items are open.
  root.addEventListener('toggle', (e) => {
    const id = e.target.dataset && e.target.dataset.id;
    if (!id) return;
    if (e.target.open) openIds.add(id); else openIds.delete(id);
  }, true);

  return { fill };
}
