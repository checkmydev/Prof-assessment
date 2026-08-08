-- ============================================================================
-- Schéma Supabase pour l'application d'évaluation des professeurs
-- À exécuter dans : Supabase Dashboard → SQL Editor → New query
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- Table des professeurs
-- ----------------------------------------------------------------------------
create table if not exists teachers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Table des évaluations
-- Une note (1 à 5) par critère + un commentaire libre facultatif.
-- Un élève (identifié par son nom) ne peut évaluer qu'une fois le même prof.
-- ----------------------------------------------------------------------------
create table if not exists evaluations (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references teachers(id) on delete cascade,
  student_name text not null check (char_length(trim(student_name)) > 0),
  student_name_normalized text generated always as (lower(trim(student_name))) stored,
  rating_clarity smallint not null check (rating_clarity between 1 and 5),
  rating_availability smallint not null check (rating_availability between 1 and 5),
  rating_respect smallint not null check (rating_respect between 1 and 5),
  rating_organisation smallint not null check (rating_organisation between 1 and 5),
  rating_equite smallint not null check (rating_equite between 1 and 5),
  rating_motivation smallint not null check (rating_motivation between 1 and 5),
  comment text check (char_length(comment) <= 1000),
  created_at timestamptz not null default now(),
  unique (teacher_id, student_name_normalized)
);

create index if not exists evaluations_teacher_id_idx on evaluations (teacher_id);

-- ----------------------------------------------------------------------------
-- Vue agrégée : moyennes par professeur (aucune donnée nominative exposée)
-- Les vues s'exécutent avec les droits de leur propriétaire, ce qui permet
-- d'exposer des moyennes calculées sur "evaluations" sans donner accès en
-- lecture directe à la table (qui contient les noms d'élèves / commentaires).
-- ----------------------------------------------------------------------------
create or replace view teacher_stats as
select
  t.id as teacher_id,
  t.name as teacher_name,
  t.subject,
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
group by t.id, t.name, t.subject;

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table teachers enable row level security;
alter table evaluations enable row level security;

-- Tout le monde (clé anonyme) peut lire la liste des profs (pour le formulaire)
drop policy if exists "public_read_teachers" on teachers;
create policy "public_read_teachers"
  on teachers for select
  using (true);

-- Tout le monde peut insérer une évaluation, mais pas la lire/modifier/supprimer
drop policy if exists "public_insert_evaluations" on evaluations;
create policy "public_insert_evaluations"
  on evaluations for insert
  with check (true);

-- Droits nécessaires pour le rôle "anon" utilisé par la clé publique Supabase
grant usage on schema public to anon, authenticated;
grant select on teachers to anon, authenticated;
grant insert on evaluations to anon, authenticated;
grant select on teacher_stats to anon, authenticated;

-- ----------------------------------------------------------------------------
-- Données d'exemple (facultatif : à adapter avec les vrais professeurs)
-- ----------------------------------------------------------------------------
-- insert into teachers (name, subject) values
--   ('Mme Dubois', 'Mathématiques'),
--   ('M. Lefèvre', 'Français'),
--   ('Mme Alaoui', 'Sciences');
--
-- L'application génère automatiquement un avatar (initiales + couleur) pour
-- chaque professeur : aucune photo à fournir ni à stocker en base.
