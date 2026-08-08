import { supabase, isConfigured } from './supabaseClient.js';
import { CRITERIA } from './criteria.js';
import { escapeHtml } from './dom.js';
import { avatarImgHtml } from './avatar.js';

const evalHeader = document.getElementById('eval-header');
const pageSubtitle = document.getElementById('page-subtitle');
const alertBox = document.getElementById('alert-box');
const form = document.getElementById('eval-form');
const criteriaContainer = document.getElementById('criteria-container');
const commentInput = document.getElementById('comment');
const commentCount = document.getElementById('comment-count');
const submitBtn = document.getElementById('submit-btn');

const studentName = sessionStorage.getItem('studentName');
const teacherId = sessionStorage.getItem('teacherId');
const teacherLabel = sessionStorage.getItem('teacherLabel') || 'ce professeur';
const teacherName = sessionStorage.getItem('teacherName') || teacherLabel;
const teacherAvatar = sessionStorage.getItem('teacherAvatar') || '';

if (!isConfigured) {
  showAlert(
    'error',
    "L'application n'est pas configurée : renseignez SUPABASE_URL et SUPABASE_ANON_KEY dans assets/config.js."
  );
  form.hidden = true;
} else if (!studentName || !teacherId) {
  window.location.href = 'index.html';
} else {
  evalHeader.innerHTML = avatarImgHtml(teacherName, teacherAvatar, 'avatar avatar-lg');
  pageSubtitle.innerHTML = `Élève : <strong>${escapeHtml(studentName)}</strong> — Professeur : <strong>${escapeHtml(
    teacherLabel
  )}</strong>`;
  renderCriteria();
}

function renderCriteria() {
  criteriaContainer.innerHTML = CRITERIA.map((criterion, index) => {
    const stars = [5, 4, 3, 2, 1]
      .map(
        (value) => `
          <input type="radio" id="${criterion.key}-${value}" name="${criterion.column}" value="${value}" required />
          <label for="${criterion.key}-${value}" title="${value} étoile${value > 1 ? 's' : ''}">★</label>
        `
      )
      .join('');

    return `
      <fieldset class="criterion">
        <legend>${index + 1}. ${escapeHtml(criterion.label)}</legend>
        <p class="criterion-desc">${escapeHtml(criterion.description)}</p>
        <div class="star-rating" role="radiogroup" aria-label="${escapeHtml(criterion.label)}">
          ${stars}
        </div>
      </fieldset>
    `;
  }).join('');
}

commentInput.addEventListener('input', () => {
  commentCount.textContent = String(commentInput.value.length);
});

function showAlert(type, message) {
  const cls = type === 'error' ? 'alert-error' : type === 'success' ? 'alert-success' : 'alert-info';
  alertBox.innerHTML = `<div class="alert ${cls}">${message}</div>`;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  alertBox.innerHTML = '';

  const formData = new FormData(form);
  const payload = { teacher_id: teacherId, student_name: studentName };

  for (const criterion of CRITERIA) {
    const value = formData.get(criterion.column);
    if (!value) {
      showAlert('error', 'Merci de donner une note pour chaque critère.');
      return;
    }
    payload[criterion.column] = Number(value);
  }

  const comment = commentInput.value.trim();
  if (comment) payload.comment = comment;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Envoi en cours…';

  const { error } = await supabase.from('evaluations').insert(payload);

  submitBtn.disabled = false;
  submitBtn.textContent = "Envoyer l'évaluation";

  if (error) {
    if (error.code === '23505') {
      showAlert('error', `Tu as déjà évalué ${escapeHtml(teacherLabel)}. Merci, ta réponse est déjà enregistrée !`);
    } else {
      showAlert('error', "Une erreur est survenue lors de l'envoi. Réessaie dans un instant.");
    }
    return;
  }

  form.hidden = true;
  showAlert(
    'success',
    `Merci ${escapeHtml(studentName)} ! Ton évaluation de ${escapeHtml(teacherLabel)} a bien été enregistrée.`
  );

  const actions = document.createElement('div');
  actions.className = 'actions';
  actions.innerHTML = `
    <a href="index.html" class="btn btn-primary">Évaluer un autre professeur</a>
    <a href="dashboard.html" class="btn btn-secondary">Voir le dashboard</a>
  `;
  alertBox.appendChild(actions);
});
