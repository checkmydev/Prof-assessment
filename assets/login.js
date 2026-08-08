import { supabase, isConfigured } from './supabaseClient.js';

const configWarning = document.getElementById('config-warning');
const loadError = document.getElementById('load-error');
const form = document.getElementById('login-form');
const nameInput = document.getElementById('student-name');
const teacherSelect = document.getElementById('teacher-select');
const submitBtn = document.getElementById('submit-btn');

function showError(message) {
  loadError.textContent = message;
  loadError.hidden = false;
}

async function init() {
  if (!isConfigured) {
    configWarning.hidden = false;
    teacherSelect.innerHTML = '<option value="">Configuration manquante</option>';
    return;
  }

  const savedName = localStorage.getItem('studentName');
  if (savedName) nameInput.value = savedName;

  const { data: teachers, error } = await supabase
    .from('teachers')
    .select('id, name, subject')
    .order('name', { ascending: true });

  if (error) {
    showError("Impossible de charger la liste des professeurs. Réessaie plus tard.");
    teacherSelect.innerHTML = '<option value="">Erreur de chargement</option>';
    return;
  }

  if (!teachers || teachers.length === 0) {
    teacherSelect.innerHTML = '<option value="">Aucun professeur enregistré</option>';
    return;
  }

  teacherSelect.innerHTML =
    '<option value="">— Choisir un professeur —</option>' +
    teachers
      .map(
        (t) =>
          `<option value="${t.id}">${escapeHtml(t.name)}${
            t.subject ? ' — ' + escapeHtml(t.subject) : ''
          }</option>`
      )
      .join('');

  teacherSelect.disabled = false;
  submitBtn.disabled = false;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const studentName = nameInput.value.trim();
  const teacherId = teacherSelect.value;
  const teacherLabel = teacherSelect.options[teacherSelect.selectedIndex]?.text || '';

  if (!studentName || !teacherId) return;

  localStorage.setItem('studentName', studentName);
  sessionStorage.setItem('studentName', studentName);
  sessionStorage.setItem('teacherId', teacherId);
  sessionStorage.setItem('teacherLabel', teacherLabel);

  window.location.href = 'evaluer.html';
});

init();
