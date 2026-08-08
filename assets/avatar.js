import { escapeHtml } from './dom.js';

function initials(name) {
  const letters = (name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.replace(/[^\p{L}\p{N}]/gu, '').charAt(0).toUpperCase())
    .join('');
  return letters || '?';
}

const PALETTE = ['#3457d5', '#1f9d63', '#d1425a', '#b8860b', '#7b4fd1', '#0891b2'];

function colorForName(name) {
  let hash = 0;
  for (const char of name || '') hash = char.charCodeAt(0) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

// Avatar généré entièrement côté client (SVG en data URI, couleur + initiales
// dérivées du nom) : aucune photo à héberger ni à stocker en base.
function avatarDataUrl(name) {
  const label = initials(name);
  const color = colorForName(name);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96">` +
    `<rect width="96" height="96" rx="48" fill="${color}" />` +
    `<text x="50%" y="50%" dy=".35em" text-anchor="middle" ` +
    `font-family="Segoe UI, Arial, sans-serif" font-size="36" fill="#fff">${label}</text>` +
    `</svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

export function avatarImgHtml(name, className = 'avatar') {
  return `<img class="${className}" src="${avatarDataUrl(name)}" alt="Avatar de ${escapeHtml(
    name
  )}" loading="lazy" />`;
}
