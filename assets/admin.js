import { supabase, isConfigured } from './supabaseClient.js';
import { escapeHtml } from './dom.js';
import { avatarImgHtml, avatarPickerHtml } from './avatar.js';

const configWarning = document.getElementById('config-warning');
const loginCard = document.getElementById('login-card');
const loginError = document.getElementById('login-error');
const loginForm = document.getElementById('login-form');
const loginBtn = document.getElementById('login-btn');

const adminArea = document.getElementById('admin-area');
const adminEmailLabel = document.getElementById('admin-email-label');
const logoutBtn = document.getElementById('logout-btn');

const addForm = document.getElementById('add-teacher-form');
const addBtn = document.getElementById('add-btn');
const formAlert = document.getElementById('form-alert');
const nameInput = document.getElementById('teacher-name');
const subjectInput = document.getElementById('teacher-subject');
const avatarPicker = document.getElementById('avatar-picker');

avatarPicker.innerHTML = avatarPickerHtml('avatar-key');

const listAlert = document.getElementById('list-alert');
const listLoading = document.getElementById('teacher-list-loading');
const list = document.getElementById('teacher-list');
const listEmpty = document.getElementById('teacher-list-empty');

function showAlert(el, type, message) {
  el.innerHTML = message ? `<div class="alert alert-${type}">${escapeHtml(message)}</div>` : '';
}

function setSignedIn(session) {
  if (session) {
    loginCard.hidden = true;
    adminArea.hidden = false;
    adminEmailLabel.textContent = session.user.email;
    loadTeachers();
  } else {
    loginCard.hidden = false;
    adminArea.hidden = true;
  }
}

async function loadTeachers() {
  listAlert.innerHTML = '';
  listLoading.hidden = false;
  list.innerHTML = '';
  listEmpty.hidden = true;

  const { data, error } = await supabase
    .from('teachers')
    .select('*')
    .order('name', { ascending: true });

  listLoading.hidden = true;

  if (error) {
    showAlert(listAlert, 'error', 'Impossible de charger la liste des professeurs.');
    return;
  }

  if (!data || data.length === 0) {
    listEmpty.hidden = false;
    return;
  }

  list.innerHTML = data
    .map(
      (t) => `
        <li class="admin-teacher-row" data-id="${t.id}">
          ${avatarImgHtml(t.name, t.avatar_key, 'avatar')}
          <div class="admin-teacher-info">
            <div class="admin-teacher-name">${escapeHtml(t.name)}</div>
            ${t.subject ? `<div class="subject">${escapeHtml(t.subject)}</div>` : ''}
          </div>
          <button type="button" class="btn-secondary admin-delete-btn" data-id="${t.id}" data-name="${escapeHtml(
        t.name
      )}">Supprimer</button>
        </li>
      `
    )
    .join('');
}

list.addEventListener('click', async (event) => {
  const btn = event.target.closest('.admin-delete-btn');
  if (!btn) return;

  const id = btn.dataset.id;
  const name = btn.dataset.name;
  if (!confirm(`Supprimer ${name} ? Toutes ses évaluations seront aussi supprimées.`)) return;

  btn.disabled = true;
  const { error } = await supabase.from('teachers').delete().eq('id', id);

  if (error) {
    showAlert(listAlert, 'error', "La suppression a échoué. Vérifie que ton compte a bien les droits d'administration.");
    btn.disabled = false;
    return;
  }

  loadTeachers();
});

addForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  formAlert.innerHTML = '';

  const name = nameInput.value.trim();
  const subject = subjectInput.value.trim();
  const avatarKey = avatarPicker.querySelector('input[name="avatar-key"]:checked')?.value;

  if (!name) return;

  addBtn.disabled = true;
  addBtn.textContent = 'Ajout en cours…';

  const { error } = await supabase.from('teachers').insert({
    name,
    subject: subject || null,
    avatar_key: avatarKey || null,
  });

  addBtn.disabled = false;
  addBtn.textContent = 'Ajouter';

  if (error) {
    showAlert(
      formAlert,
      'error',
      error.code === '42703'
        ? "Il manque la colonne avatar_key en base : exécute supabase/002_add_teacher_avatar.sql dans Supabase, puis réessaie."
        : "Impossible d'ajouter ce professeur. Vérifie que ton compte a bien les droits d'administration (voir supabase/003_admin_access.sql)."
    );
    return;
  }

  addForm.reset();
  showAlert(formAlert, 'success', `${name} a été ajouté.`);
  loadTeachers();
});

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  loginError.hidden = true;

  const email = document.getElementById('admin-email').value.trim();
  const password = document.getElementById('admin-password').value;

  loginBtn.disabled = true;
  loginBtn.textContent = 'Connexion…';

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  loginBtn.disabled = false;
  loginBtn.textContent = 'Se connecter';

  if (error) {
    loginError.textContent = 'Connexion impossible : identifiants invalides.';
    loginError.hidden = false;
  }
});

logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut();
});

async function init() {
  if (!isConfigured) {
    configWarning.hidden = false;
    return;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  setSignedIn(session);

  supabase.auth.onAuthStateChange((_event, session) => {
    setSignedIn(session);
  });
}

init();
