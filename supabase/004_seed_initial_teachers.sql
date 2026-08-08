-- ============================================================================
-- Ajoute les 4 premiers professeurs, avec un avatar généré automatiquement à
-- partir de leur nom (aucune photo à héberger).
-- À exécuter dans : Supabase Dashboard → SQL Editor → New query
-- (à ne faire qu'une fois — les suivants s'ajoutent depuis /admin.html)
-- ============================================================================

insert into teachers (name, photo_url) values
  ('Van der Ton', 'https://api.dicebear.com/9.x/initials/svg?seed=Van%20der%20Ton'),
  ('Deayhe', 'https://api.dicebear.com/9.x/initials/svg?seed=Deayhe'),
  ('Buzian', 'https://api.dicebear.com/9.x/initials/svg?seed=Buzian'),
  ('Bouzan', 'https://api.dicebear.com/9.x/initials/svg?seed=Bouzan');

-- La page /admin.html ne permet pour l'instant que d'ajouter/supprimer un
-- professeur. Pour renseigner la matière de chacun, faites-le ici, par
-- exemple :
-- update teachers set subject = 'Mathématiques' where name = 'Van der Ton';
