-- ============================================================================
-- Ajoute les 4 premiers professeurs. L'application génère automatiquement un
-- avatar (initiales + couleur) pour chacun, pas besoin de photo.
-- À exécuter dans : Supabase Dashboard → SQL Editor → New query
-- (à ne faire qu'une fois — les suivants s'ajoutent depuis /admin.html)
-- ============================================================================

insert into teachers (name) values
  ('Van der Ton'),
  ('Deayhe'),
  ('Buzian'),
  ('Bouzan');

-- La page /admin.html ne permet pour l'instant que d'ajouter/supprimer un
-- professeur. Pour renseigner la matière de chacun, faites-le ici, par
-- exemple :
-- update teachers set subject = 'Mathématiques' where name = 'Van der Ton';
