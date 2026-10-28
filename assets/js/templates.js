// Turns resume data into HTML for each template. All user text is escaped.
import { PHOTO_RE } from './resume-data.js';

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}
const esc = escapeHtml;
const clean = (v) => String(v || '').trim();
const hasContent = (item) => Object.entries(item).some(([k, v]) => k !== 'id' && clean(v));
const splitList = (text) => clean(text).split(',').map((s) => s.trim()).filter(Boolean);

function bullets(text) {
  const rows = String(text || '')
    .split('\n')
    .map((s) => s.replace(/^\s*[-•*]\s*/, '').trim())
    .filter(Boolean);
  return rows.length ? `<ul class="r-bullets">${rows.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>` : '';
}

const dateRange = (i) => esc([clean(i.start), clean(i.end)].filter(Boolean).join(' – '));

const section = (title, body) =>
  body ? `<section class="r-sec"><h2 class="r-h">${esc(title)}</h2><div class="r-sec__body">${body}</div></section>` : '';

function entry(title, subParts, date, body) {
  const sub = subParts.map(clean).filter(Boolean).map(esc).join(', ');
  return `<article class="r-item"><header class="r-item__head"><div class="r-item__main">` +
    (title ? `<h3 class="r-item__title">${esc(title)}</h3>` : '') +
    (sub ? `<p class="r-item__sub">${sub}</p>` : '') +
    `</div>${date ? `<p class="r-item__date">${date}</p>` : ''}</header>${body}</article>`;
}

function tagList(text) {
  const tags = splitList(text);
  return tags.length ? `<ul class="r-tags">${tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : '';
}

function contactList(d) {
  const p = d.personal;
  const rows = [p.email, p.phone, p.location, p.website].map(clean).filter(Boolean);
  return rows.length ? `<ul class="r-contact">${rows.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>` : '';
}

const B = {
  summary: (d) => section('Profile', clean(d.summary) ? `<p class="r-p">${esc(clean(d.summary))}</p>` : ''),
  experience: (d) => section('Experience', d.experience.filter(hasContent)
    .map((e) => entry(e.role, [e.company, e.location], dateRange(e), bullets(e.description))).join('')),
  education: (d) => section('Education', d.education.filter(hasContent)
    .map((e) => entry(e.degree, [e.school], dateRange(e), bullets(e.details))).join('')),
  projects: (d) => section('Projects', d.projects.filter(hasContent)
    .map((p) => entry(p.name, [p.link], '', bullets(p.description))).join('')),
  skills: (d) => section('Skills', tagList(d.skills)),
  languages: (d) => section('Languages', tagList(d.languages)),
  contact: (d) => section('Contact', contactList(d)),
};

const name = (d) => clean(d.personal.fullName)
  ? esc(clean(d.personal.fullName))
  : '<span class="r-placeholder">Your name</span>';
const role = (d) => clean(d.personal.jobTitle) ? `<p class="r-role">${esc(clean(d.personal.jobTitle))}</p>` : '';
const hasPhoto = (d) => PHOTO_RE.test(d.personal.photo || '');
const photo = (d) => hasPhoto(d) ? `<img class="r-photo" src="${d.personal.photo}" alt="">` : '';
const photoClass = (d) => hasPhoto(d) ? ' has-photo' : '';

const TEMPLATE_HTML = {
  classic: (d) => `<div class="resume resume--classic${photoClass(d)}">
    <header class="r-top"><div class="r-top__text"><h1 class="r-name">${name(d)}</h1>${role(d)}${contactList(d)}</div>${photo(d)}</header>
    ${B.summary(d)}${B.experience(d)}${B.education(d)}${B.projects(d)}${B.skills(d)}${B.languages(d)}
  </div>`,

  modern: (d) => `<div class="resume resume--modern${photoClass(d)}">
    <aside class="r-side">${photo(d)}${B.contact(d)}${B.skills(d)}${B.languages(d)}</aside>
    <div class="r-main">
      <header class="r-top"><h1 class="r-name">${name(d)}</h1>${role(d)}</header>
      ${B.summary(d)}${B.experience(d)}${B.education(d)}${B.projects(d)}
    </div>
  </div>`,

  minimal: (d) => `<div class="resume resume--minimal${photoClass(d)}">
    <header class="r-top"><div><h1 class="r-name">${name(d)}</h1>${role(d)}</div>${photo(d)}</header>
    ${contactList(d)}
    ${B.summary(d)}${B.experience(d)}${B.education(d)}${B.projects(d)}${B.skills(d)}${B.languages(d)}
  </div>`,

  professional: (d) => `<div class="resume resume--professional${photoClass(d)}">
    <header class="r-top"><div><h1 class="r-name">${name(d)}</h1>${role(d)}</div>${photo(d)}</header>
    <div class="r-cols">
      <div class="r-main">${B.summary(d)}${B.experience(d)}${B.projects(d)}</div>
      <aside class="r-side">${B.contact(d)}${B.skills(d)}${B.languages(d)}${B.education(d)}</aside>
    </div>
  </div>`,
};

export function renderResume(data) {
  return (TEMPLATE_HTML[data.template] || TEMPLATE_HTML.classic)(data);
}
