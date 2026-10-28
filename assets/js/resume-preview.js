// Draws the resume into the sheet and scales the sheet to fit the screen.
import { renderResume } from './templates.js';

export function initPreview({ sheet, frame, stage }) {
  function fit() {
    const width = sheet.offsetWidth;
    if (!width) return;
    const scale = Math.min(1, stage.clientWidth / width);
    sheet.style.transform = `scale(${scale})`;
    frame.style.width = `${width * scale}px`;
    frame.style.height = `${sheet.offsetHeight * scale}px`;
  }

  function render(data) {
    sheet.style.setProperty('--accent', data.accent);
    sheet.innerHTML = renderResume(data);
    fit();
  }

  new ResizeObserver(fit).observe(stage);
  return { render, fit };
}
