-- ============================================================================
-- Migration : ajoute la colonne "avatar_key" utilisée par la galerie
-- d'avatars de /admin.html (émoji + couleur prédéfinis — jamais une URL de
-- photo à héberger).
-- À exécuter dans : Supabase Dashboard → SQL Editor → New query
-- (à faire une seule fois, si votre base a été créée avant cet ajout)
-- ============================================================================

alter table teachers add column if not exists avatar_key text;

-- La vue doit être recréée pour exposer la nouvelle colonne
-- (Postgres n'autorise pas d'insérer une colonne au milieu d'une vue existante).
drop view if exists teacher_stats;

create view teacher_stats as
select
  t.id as teacher_id,
  t.name as teacher_name,
  t.subject,
  t.avatar_key,
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
group by t.id, t.name, t.subject, t.avatar_key;

grant select on teacher_stats to anon, authenticated;

-- Tant que cette migration n'est pas exécutée, l'application continue de
-- fonctionner normalement (elle affiche un avatar avec les initiales pour
-- chaque professeur) : /admin.html permettra juste de choisir un avatar
-- dans la galerie une fois la colonne ajoutée.
