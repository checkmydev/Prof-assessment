-- ============================================================================
-- Migration : ajout d'une photo par professeur.
-- À exécuter dans : Supabase Dashboard → SQL Editor → New query
-- (à faire une seule fois, si votre base a été créée avant cet ajout)
-- ============================================================================

alter table teachers add column if not exists photo_url text;

-- La vue doit être recréée pour exposer la nouvelle colonne
-- (Postgres n'autorise pas d'insérer une colonne au milieu d'une vue existante).
drop view if exists teacher_stats;

create view teacher_stats as
select
  t.id as teacher_id,
  t.name as teacher_name,
  t.subject,
  t.photo_url,
  count(e.id) as total_evaluations,
  round(avg(e.rating_clarity)::numeric, 2) as avg_clarity,
  round(avg(e.rating_availability)::numeric, 2) as avg_availability,
  round(avg(e.rating_respect)::numeric, 2) as avg_respect,
  round(avg(e.rating_organisation)::numeric, 2) as avg_organisation,
  round(avg(e.rating_equite)::numeric, 2) as avg_equite,
  round(avg(e.rating_motivation)::numeric, 2) as avg_motivation,
  round(
    avg(
      (
        e.rating_clarity + e.rating_availability + e.rating_respect +
        e.rating_organisation + e.rating_equite + e.rating_motivation
      ) / 6.0
    )::numeric,
    2
  ) as avg_overall
from teachers t
left join evaluations e on e.teacher_id = t.id
group by t.id, t.name, t.subject, t.photo_url;

grant select on teacher_stats to anon, authenticated;

-- Pour ajouter une photo à un professeur existant, dans Table Editor → teachers,
-- collez une URL d'image dans la colonne "photo_url". Exemple d'avatar généré
-- automatiquement à partir du nom (aucun fichier à héberger) :
--   https://api.dicebear.com/9.x/initials/svg?seed=Nom%20Du%20Professeur
--
-- Si "photo_url" reste vide, l'application affiche automatiquement un avatar
-- généré à partir des initiales du professeur.
