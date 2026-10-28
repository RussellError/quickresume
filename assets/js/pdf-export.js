// "Download PDF" opens the browser's print dialog, where "Save as PDF" is the default
// destination on most devices. This keeps the text selectable and searchable, and
// needs no extra libraries. print.css makes sure only the resume is printed.

export function initPdfExport(getData) {
  const originalTitle = document.title;

  window.addEventListener('beforeprint', () => {
    const name = (getData().personal.fullName || '').trim();
    document.title = name ? `${name} - Resume` : 'Resume';
  });
  window.addEventListener('afterprint', () => {
    document.title = originalTitle;
  });

  return { exportPdf: () => window.print() };
}
