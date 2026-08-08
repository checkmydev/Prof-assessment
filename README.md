# Évaluation des professeurs

Application web permettant aux élèves d'une école secondaire d'évaluer leurs
professeurs selon plusieurs critères (notation par étoiles + commentaire
libre), avec un dashboard affichant les moyennes obtenues par chaque
professeur.

- **Frontend** : HTML / CSS / JavaScript vanilla (aucune étape de build,
  hébergeable tel quel sur GitHub Pages).
- **Backend** : [Supabase](https://supabase.com) (base de données Postgres +
  API auto-générée), interrogé directement depuis le navigateur avec la clé
  publique `anon`.

## Fonctionnement

1. **`index.html`** — L'élève entre son nom et choisit un professeur dans une
   liste (chargée depuis Supabase).
2. **`evaluer.html`** — Formulaire avec une note par étoiles (1 à 5) pour
   chaque critère + un commentaire libre facultatif. L'envoi crée une ligne
   dans la table `evaluations`.
3. **`dashboard.html`** — Affiche, pour chaque professeur, la moyenne
   générale et la moyenne par critère, calculées côté base de données.

### Critères d'évaluation

Définis dans [`assets/criteria.js`](assets/criteria.js) — modifiables
librement :

1. Clarté des explications
2. Disponibilité & écoute
3. Respect & ambiance de classe
4. Organisation du cours
5. Équité de l'évaluation
6. Capacité à motiver

## Mise en place

### 1. Créer le projet Supabase

1. Créez un compte / projet sur [supabase.com](https://supabase.com).
2. Dans **SQL Editor**, exécutez le contenu de
   [`supabase/schema.sql`](supabase/schema.sql). Cela crée :
   - la table `teachers` (liste des professeurs),
   - la table `evaluations` (une ligne par évaluation, avec une contrainte
     d'unicité `(professeur, élève)` pour éviter les doublons),
   - la vue `teacher_stats` (moyennes agrégées, utilisée par le dashboard),
   - les policies **Row Level Security** : le rôle public (`anon`) peut lire
     la liste des professeurs, insérer une évaluation et lire les moyennes
     agrégées, mais **ne peut pas** lire les évaluations brutes (noms
     d'élèves, commentaires) — ces informations restent privées.
3. Ajoutez vos professeurs, soit via **Table Editor → teachers**, soit en
   adaptant le bloc `insert into teachers (...)` (commenté) en bas du fichier
   SQL.
4. Récupérez `Project URL` et la clé `anon public` dans **Project Settings →
   API**.

### 2. Configurer le frontend

Éditez [`assets/config.js`](assets/config.js) et remplacez les deux valeurs :

```js
export const SUPABASE_URL = 'https://VOTRE-PROJET.supabase.co';
export const SUPABASE_ANON_KEY = 'VOTRE_CLE_ANON_PUBLIC';
```

> La clé `anon public` est conçue pour être publique côté client : c'est la
> Row Level Security (RLS) côté Supabase qui protège réellement les données,
> pas le secret de cette clé.

### 3. Déployer sur GitHub Pages

Le dépôt contient un workflow GitHub Actions
([`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml))
qui publie automatiquement le contenu du dépôt à chaque push sur `main`.

1. Dans **Settings → Pages** du dépôt GitHub, réglez **Source** sur
   **GitHub Actions**.
2. Poussez (ou mergez) vos changements sur `main`.
3. Le site est publié à l'URL indiquée dans l'onglet **Actions** /
   **Settings → Pages**.

Aucune étape de build n'est nécessaire : le site est composé de fichiers
statiques servis tels quels.

## Tester en local

Comme les pages utilisent des modules ES (`type="module"`), elles doivent
être servies via HTTP (pas ouvertes directement en `file://`). Par exemple :

```bash
python3 -m http.server 8080
# puis ouvrir http://localhost:8080
```

## Limites connues / pistes d'amélioration

- L'identification de l'élève se fait par simple saisie de son nom (pas
  d'authentification réelle). La contrainte d'unicité `(professeur, nom
  d'élève)` limite les doublons mais n'empêche pas qu'un élève se fasse
  passer pour un autre. Pour une identification plus robuste, on pourrait
  brancher [Supabase Auth](https://supabase.com/docs/guides/auth) (ex. via
  l'email scolaire).
- La gestion des professeurs (ajout/suppression) se fait actuellement dans
  le Table Editor de Supabase ; une page d'administration dédiée pourrait
  être ajoutée si besoin.
