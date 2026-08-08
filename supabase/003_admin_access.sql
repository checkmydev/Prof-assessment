-- ============================================================================
-- Migration : gestion des professeurs depuis la page /admin.html de l'app,
-- au lieu de passer par le Table Editor de Supabase.
-- À exécuter dans : Supabase Dashboard → SQL Editor → New query
-- ============================================================================
--
-- Étape préalable (à faire une seule fois, dans le Dashboard, PAS en SQL) :
--   Authentication → Users → Add user
--     - Email : l'adresse avec laquelle vous vous connecterez sur /admin.html
--     - Password : un mot de passe fort
--     - Cochez "Auto Confirm User" pour pouvoir vous connecter immédiatement
--
--   Puis, pour empêcher n'importe qui de créer un compte et devenir admin :
--   Authentication → Providers → Email → décochez "Allow new users to sign up"
--   (la page /admin.html ne propose de toute façon qu'un formulaire de
--   connexion, jamais d'inscription — mais mieux vaut fermer la porte aussi
--   côté Supabase).
--
-- Remplacez ADMIN_EMAIL_ICI ci-dessous par l'email exact que vous venez de
-- créer, puis exécutez ce script.
-- ============================================================================

drop policy if exists "admin_insert_teachers" on teachers;
create policy "admin_insert_teachers"
  on teachers for insert
  with check ((auth.jwt() ->> 'email') = 'ADMIN_EMAIL_ICI');

drop policy if exists "admin_update_teachers" on teachers;
create policy "admin_update_teachers"
  on teachers for update
  using ((auth.jwt() ->> 'email') = 'ADMIN_EMAIL_ICI')
  with check ((auth.jwt() ->> 'email') = 'ADMIN_EMAIL_ICI');

drop policy if exists "admin_delete_teachers" on teachers;
create policy "admin_delete_teachers"
  on teachers for delete
  using ((auth.jwt() ->> 'email') = 'ADMIN_EMAIL_ICI');

grant insert, update, delete on teachers to authenticated;
