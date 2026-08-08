// Remplacez ces deux valeurs par celles de votre projet Supabase :
// Dashboard Supabase → Project Settings → API
//
// La clé "anon public" est conçue pour être exposée côté client (elle sera
// visible dans le code source de la page sur GitHub Pages) : ce n'est pas un
// problème, c'est la Row Level Security définie dans supabase/schema.sql qui
// protège réellement les données (lecture des commentaires/noms impossible,
// une seule évaluation par élève et par prof, etc.).

export const SUPABASE_URL = 'https://VOTRE-PROJET.supabase.co';
export const SUPABASE_ANON_KEY = 'VOTRE_CLE_ANON_PUBLIC';
