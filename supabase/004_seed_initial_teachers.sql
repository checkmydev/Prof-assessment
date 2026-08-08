-- ============================================================================
-- Ajoute les 4 premiers professeurs avec un avatar de la galerie prédéfinie
-- (voir AVATAR_PRESETS dans assets/avatar.js) — nécessite d'avoir exécuté
-- supabase/002_add_teacher_avatar.sql au préalable.
-- À exécuter dans : Supabase Dashboard → SQL Editor → New query
-- (à ne faire qu'une fois — les suivants s'ajoutent depuis /admin.html)
-- ============================================================================

insert into teachers (name, avatar_key) values
  ('Van der Ton', 'owl'),
  ('Deayhe', 'fox'),
  ('Buzian', 'lion'),
  ('Bouzan', 'dolphin');

-- La page /admin.html ne permet pour l'instant que d'ajouter/supprimer un
-- professeur. Pour renseigner la matière de chacun, faites-le ici, par
-- exemple :
-- update teachers set subject = 'Mathématiques' where name = 'Van der Ton';
