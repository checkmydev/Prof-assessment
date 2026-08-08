import { supabase, isConfigured } from './supabaseClient.js';
import { CRITERIA } from './criteria.js';
import { escapeHtml } from './dom.js';
import { avatarImgHtml } from './avatar.js';

const configWarning = document.getElementById('config-warning');
const loadError = document.getElementById('load-error');
const loading = document.getElementById('loading');
const grid = document.getElementById('teacher-grid');
const emptyState = document.getElementById('empty-state');
const sortSelect = document.getElementById('sort-select');

let stats = [];

function starDisplay(avg) {
  const clamped = Math.max(0, Math.min(5, avg || 0));
  const pct = (clamped / 5) * 100;
  return `
    <span class="star-display">
      <span class="stars-empty">★★★★★</span>
      <span class="stars-filled" style="width:${pct}%">★★★★★</span>
    </span>
  `;
}

function renderTeacherCard(row) {
  const hasData = row.total_evaluations > 0;

  const bars = CRITERIA.map((criterion) => {
    const avgKey = 'avg_' + criterion.column.replace('rating_', '');
    const value = hasData ? Number(row[avgKey]) : 0;
    const pct = (value / 5) * 100;
    return `
      <div class="criteria-bar-row">
        <span class="bar-label">${escapeHtml(criterion.label)}</span>
        <span class="criteria-bar-track">
          <span class="criteria-bar-fill" style="width:${pct}%"></span>
        </span>
        <span class="criteria-bar-value">${hasData ? value.toFixed(1) : '—'}</span>
      </div>
    `;
  }).join('');

  return `
    <article class="teacher-card">
      <div class="teacher-card-head">
        <div class="teacher-card-identity">
          ${avatarImgHtml(row.teacher_name, row.avatar_key, 'avatar')}
          <div>
            <h3>${escapeHtml(row.teacher_name)}</h3>
            ${row.subject ? `<div class="subject">${escapeHtml(row.subject)}</div>` : ''}
          </div>
        </div>
        <div class="overall-score">
          ${
            hasData
              ? `<div class="score-number">${Number(row.avg_overall).toFixed(1)}/5</div>${starDisplay(
                  row.avg_overall
                )}`
              : `<div class="score-number">—</div>`
          }
          <span class="score-count">${row.total_evaluations} évaluation${row.total_evaluations > 1 ? 's' : ''}</span>
        </div>
      </div>
      <div class="criteria-bars">${bars}</div>
    </article>
  `;
}

function render() {
  if (stats.length === 0) {
    grid.innerHTML = '';
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;

  const sorted = [...stats];
  const mode = sortSelect.value;

  if (mode === 'overall-desc') {
    sorted.sort((a, b) => (b.avg_overall || 0) - (a.avg_overall || 0));
  } else if (mode === 'overall-asc') {
    sorted.sort((a, b) => (a.avg_overall || 0) - (b.avg_overall || 0));
  } else if (mode === 'name') {
    sorted.sort((a, b) => a.teacher_name.localeCompare(b.teacher_name, 'fr'));
  } else if (mode === 'count-desc') {
    sorted.sort((a, b) => b.total_evaluations - a.total_evaluations);
  }

  grid.innerHTML = sorted.map(renderTeacherCard).join('');
}

sortSelect.addEventListener('change', render);

async function init() {
  if (!isConfigured) {
    configWarning.hidden = false;
    loading.hidden = true;
    return;
  }

  const { data, error } = await supabase
    .from('teacher_stats')
    .select('*');

  loading.hidden = true;

  if (error) {
    loadError.textContent = 'Impossible de charger les résultats. Réessaie plus tard.';
    loadError.hidden = false;
    return;
  }

  stats = data || [];
  render();
}

init();
