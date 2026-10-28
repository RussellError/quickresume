// Saves the resume in this browser only (localStorage). Nothing is sent anywhere.

const KEY = 'quickresume:v1';
let timer;

export function loadData() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && parsed.v === 1 ? parsed.data : null;
  } catch {
    return null;
  }
}

export function saveData(data, onStatus) {
  clearTimeout(timer);
  timer = setTimeout(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ v: 1, data }));
      onStatus && onStatus('saved');
    } catch {
      onStatus && onStatus('error');
    }
  }, 400);
}
