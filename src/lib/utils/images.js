const urlBase = (import.meta.env.VITE_IMAGE_BASE || '/images').replace(/\/$/, '');

export const imagePath = (file) => `${urlBase}/${file}`;

