// QuickResume entry point: wires the form, preview, pickers, storage and export together.
import { ACCENTS, TEMPLATES, emptyData, sampleData, normalize } from './resume-data.js';
import { loadData, saveData } from './storage.js';
import { initForm } from './form.js';
import { initPreview } from './resume-preview.js';
import { initPhotoUpload } from './photo-upload.js';
import { initPdfExport } from './pdf-export.js';
import { escapeHtml as esc } from './templates.js';

const $ = (sel) => document.querySelector(sel);
const state = { data: normalize(loadData() || sampleData()) };

/* Toast and save status */
let toastTimer;
function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 3500);
}
function setStatus(kind) {
  $('#save-status').textContent = kind === 'saved'
    ? 'Saved on this device'
    : "Couldn't save. Browser storage is full or blocked.";
}

/* Preview */
const preview = initPreview({
  sheet: $('#resume-sheet'),
  frame: $('#sheet-frame'),
  stage: $('#stage'),
});

function update() {
  preview.render(state.data);
  saveData(state.data, setStatus);
}

/* Form */
const form = initForm({ root: $('#editor'), getData: () => state.data, onChange: update });

/* Template and accent pickers */
function renderPickers() {
  const { template, accent } = state.data;

  $('#template-picker').innerHTML = TEMPLATES.map((t) =>
    `<label class="tpl"><input class="visually-hidden" type="radio" name="template" value="${t.id}"${t.id === template ? ' checked' : ''}>` +
    `<img src="${t.image}" alt="" width="120" height="170" loading="lazy"><span>${esc(t.name)}</span></label>`
  ).join('');

  $('#accent-picker').innerHTML = ACCENTS.map((a) =>
    `<label class="swatch"><input class="visually-hidden" type="radio" name="accent" value="${a.value}"${a.value === accent ? ' checked' : ''}>` +
    `<span class="swatch__dot"></span><span class="visually-hidden">${esc(a.name)}</span></label>`
  ).join('');

  document.querySelectorAll('.swatch').forEach((label, i) => {
    label.querySelector('.swatch__dot').style.background = ACCENTS[i].value;
  });
}

$('#template-picker').addEventListener('change', (e) => {
  if (e.target.name === 'template') { state.data.template = e.target.value; update(); }
});
$('#accent-picker').addEventListener('change', (e) => {
  if (e.target.name === 'accent') { state.data.accent = e.target.value; update(); }
});

/* Photo */
const photo = initPhotoUpload({
  input: $('#photo-input'),
  img: $('#photo-img'),
  empty: $('#photo-empty'),
  removeBtn: $('#photo-remove'),
  getPhoto: () => state.data.personal.photo,
  setPhoto: (url) => { state.data.personal.photo = url; update(); },
  onError: toast,
});

/* Load example / clear */
function replaceContent(next) {
  next.template = state.data.template;
  next.accent = state.data.accent;
  state.data = next;
  form.fill();
  photo.sync();
  update();
}
$('#example-btn').addEventListener('click', () => {
  if (window.confirm('Replace what you have now with the example resume?')) replaceContent(sampleData());
});
$('#reset-btn').addEventListener('click', () => {
  if (window.confirm("Clear every field? This can't be undone.")) replaceContent(emptyData());
});

/* PDF */
const pdf = initPdfExport(() => state.data);
$('#download-btn').addEventListener('click', pdf.exportPdf);

/* Edit / Preview tabs (phones and tablets) */
function setView(view) {
  $('#app').dataset.view = view;
  $('#tab-edit').setAttribute('aria-selected', String(view === 'edit'));
  $('#tab-preview').setAttribute('aria-selected', String(view === 'preview'));
  if (view === 'preview') requestAnimationFrame(() => { preview.fit(); window.scrollTo(0, 0); });
}
$('#tab-edit').addEventListener('click', () => setView('edit'));
$('#tab-preview').addEventListener('click', () => setView('preview'));

/* Start */
renderPickers();
form.fill();
photo.sync();
preview.render(state.data);
