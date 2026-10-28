// Photo picker: crops to a square, shrinks it, and stores it as a small JPEG data URL.

const MAX_FILE_BYTES = 10 * 1024 * 1024;

async function toSquareDataUrl(file, size = 360) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('decode'));
      el.src = url;
    });
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const sx = (img.naturalWidth - side) / 2;
    const sy = (img.naturalHeight - side) / 2;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
    return canvas.toDataURL('image/jpeg', 0.86);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function initPhotoUpload({ input, img, empty, removeBtn, getPhoto, setPhoto, onError }) {
  function sync() {
    const photo = getPhoto();
    img.hidden = !photo;
    empty.hidden = !!photo;
    removeBtn.hidden = !photo;
    if (photo) img.src = photo; else img.removeAttribute('src');
  }

  input.addEventListener('change', async () => {
    const file = input.files && input.files[0];
    input.value = '';
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      onError('Use a JPG, PNG or WebP image.');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      onError('That image is over 10 MB. Pick a smaller one.');
      return;
    }
    try {
      setPhoto(await toSquareDataUrl(file));
      sync();
    } catch {
      onError("We couldn't read that image. Try a different file.");
    }
  });

  removeBtn.addEventListener('click', () => {
    setPhoto('');
    sync();
  });

  return { sync };
}
