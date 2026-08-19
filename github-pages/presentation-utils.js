const serviceIcons = {
  Clapperboard: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h16v10H4zM4 9l2-5h12l2 5M7 4l3 5m2-5l3 5M4 13h16"/></svg>',
  Palette: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18h1.2a1.8 1.8 0 0 0 1.55-2.71 1.8 1.8 0 0 1 1.55-2.69H18a3 3 0 0 0 3-3c0-5.3-4-9.6-9-9.6Z"/><path d="M7.5 11.1h.01M9.1 7.7h.01M13.4 6.7h.01M17.1 9h.01"/></svg>',
  Sparkles: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 1.35 4.65L18 9l-4.65 1.35L12 15l-1.35-4.65L6 9l4.65-1.35L12 3ZM19 14l.7 2.3L22 17l-2.3.7L19 20l-.7-2.3L16 17l2.3-.7L19 14ZM5 15l.7 2.3L8 18l-2.3.7L5 21l-.7-2.3L2 18l2.3-.7L5 15Z"/></svg>',
  WandSparkles: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 19 10-10 3 3L8 22H5v-3ZM14 4v3m-1.5-1.5h3M19 5v2m-1-1h2M20 10v3m-1.5-1.5h3"/></svg>',
};

const clientLogoFiles = [
  'zulal-logo_cf5571f9.svg',
  'mas-logo_4943c824.svg',
  'ahmad-logo_26c40037.svg',
  'abraj-logo_c121eb40.svg',
];

export function getServiceIconMarkup(iconName) {
  return serviceIcons[iconName] || serviceIcons.Clapperboard;
}

export function getClientLogoFallback(index, assetBaseUrl) {
  const file = clientLogoFiles[index];
  return file ? `${assetBaseUrl}/manus-storage/${file}` : null;
}

export function getCarouselScrollAmount(containerWidth, direction) {
  return Math.max(280, Math.round(containerWidth * 0.78)) * (direction < 0 ? -1 : 1);
}
