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

const DEFAULT_PALETTE = ['#3457d5', '#1f9d63', '#d1425a', '#b8860b', '#7b4fd1', '#0891b2'];

function colorForName(name) {
  let hash = 0;
  for (const char of name || '') hash = char.charCodeAt(0) + ((hash << 5) - hash);
  return DEFAULT_PALETTE[Math.abs(hash) % DEFAULT_PALETTE.length];
}

// Galerie d'avatars prédéfinis (émoji + couleur) à choisir dans /admin.html —
// aucune photo à héberger ni URL à saisir.
export const AVATAR_PRESETS = [
  { key: 'owl', emoji: '🦉', color: '#3457d5' },
  { key: 'fox', emoji: '🦊', color: '#e07a1f' },
  { key: 'koala', emoji: '🐨', color: '#5a8f6f' },
  { key: 'panda', emoji: '🐼', color: '#2f2f38' },
  { key: 'lion', emoji: '🦁', color: '#c9962c' },
  { key: 'turtle', emoji: '🐢', color: '#1f9d63' },
  { key: 'penguin', emoji: '🐧', color: '#1c3d5a' },
  { key: 'butterfly', emoji: '🦋', color: '#7b4fd1' },
  { key: 'dolphin', emoji: '🐬', color: '#0891b2' },
  { key: 'unicorn', emoji: '🦄', color: '#d1618f' },
  { key: 'bee', emoji: '🐝', color: '#d1a012' },
  { key: 'octopus', emoji: '🐙', color: '#d1425a' },
];

function presetById(key) {
  return AVATAR_PRESETS.find((p) => p.key === key);
}

function svgDataUrl({ background, content, fontSize = 44 }) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96">` +
    `<rect width="96" height="96" rx="48" fill="${background}" />` +
    `<text x="50%" y="50%" dy=".35em" text-anchor="middle" ` +
    `font-family="Segoe UI, Arial, sans-serif" font-size="${fontSize}" fill="#fff">${content}</text>` +
    `</svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

// Avatar généré entièrement côté client : soit l'émoji choisi dans la
// galerie (avatarKey), soit à défaut les initiales du professeur.
function avatarDataUrl(name, avatarKey) {
  const preset = avatarKey && presetById(avatarKey);
  if (preset) return svgDataUrl({ background: preset.color, content: preset.emoji });
  return svgDataUrl({ background: colorForName(name), content: initials(name), fontSize: 36 });
}

export function avatarImgHtml(name, avatarKey, className = 'avatar') {
  return `<img class="${className}" src="${avatarDataUrl(name, avatarKey)}" alt="Avatar de ${escapeHtml(
    name
  )}" loading="lazy" />`;
}

// Grille de sélection (radio buttons) pour /admin.html.
export function avatarPickerHtml(inputName, selectedKey) {
  return AVATAR_PRESETS.map((preset, index) => {
    const checked = selectedKey ? selectedKey === preset.key : index === 0;
    return `
      <label class="avatar-option">
        <input type="radio" name="${inputName}" value="${preset.key}" ${checked ? 'checked' : ''} />
        <img class="avatar" src="${svgDataUrl({ background: preset.color, content: preset.emoji })}" alt="" />
      </label>
    `;
  }).join('');
}
