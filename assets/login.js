import { supabase, isConfigured } from './supabaseClient.js';
import { escapeHtml } from './dom.js';
import { avatarImgHtml } from './avatar.js';

const configWarning = document.getElementById('config-warning');
const loadError = document.getElementById('load-error');
const form = document.getElementById('login-form');
const nameInput = document.getElementById('student-name');
const teacherPicker = document.getElementById('teacher-picker');
const submitBtn = document.getElementById('submit-btn');

let teachers = [];

function showError(message) {
  loadError.textContent = message;
  loadError.hidden = false;
}

function showPickerMessage(message) {
  teacherPicker.innerHTML = `<p class="hint">${escapeHtml(message)}</p>`;
}

async function init() {
  if (!isConfigured) {
    configWarning.hidden = false;
    showPickerMessage('Configuration manquante.');
    return;
  }

  const savedName = localStorage.getItem('studentName');
  if (savedName) nameInput.value = savedName;

  showPickerMessage('Chargement des professeurs…');

  const { data, error } = await supabase
    .from('teachers')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    showError('Impossible de charger la liste des professeurs. Réessaie plus tard.');
    showPickerMessage('Erreur de chargement.');
    return;
  }

  teachers = data || [];

  if (teachers.length === 0) {
    showPickerMessage('Aucun professeur enregistré pour le moment.');
    return;
  }

  teacherPicker.innerHTML = teachers
    .map(
      (t, index) => `
        <label class="teacher-option">
          <input type="radio" name="teacher-id" value="${t.id}" required ${
            index === 0 ? 'data-first' : ''
          } />
          ${avatarImgHtml(t.name, t.avatar_key, 'avatar')}
          <span class="teacher-option-name">${escapeHtml(t.name)}</span>
          ${t.subject ? `<span class="teacher-option-subject">${escapeHtml(t.subject)}</span>` : ''}
        </label>
      `
    )
    .join('');

  submitBtn.disabled = false;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const studentName = nameInput.value.trim();
  const selected = teacherPicker.querySelector('input[name="teacher-id"]:checked');

  if (!studentName || !selected) return;

  const teacher = teachers.find((t) => t.id === selected.value);
  if (!teacher) return;

  localStorage.setItem('studentName', studentName);
  sessionStorage.setItem('studentName', studentName);
  sessionStorage.setItem('teacherId', teacher.id);
  sessionStorage.setItem(
    'teacherLabel',
    teacher.name + (teacher.subject ? ' — ' + teacher.subject : '')
  );
  sessionStorage.setItem('teacherName', teacher.name);
  sessionStorage.setItem('teacherAvatar', teacher.avatar_key || '');

  window.location.href = 'evaluer.html';
});

init();
