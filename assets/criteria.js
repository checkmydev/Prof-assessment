// Liste centrale des critères d'évaluation.
// La propriété "column" doit correspondre au nom de colonne dans la table
// "evaluations" (voir supabase/schema.sql).
export const CRITERIA = [
  {
    key: 'clarity',
    column: 'rating_clarity',
    label: 'Clarté des explications',
    description: "Le professeur explique la matière de façon claire et compréhensible.",
  },
  {
    key: 'availability',
    column: 'rating_availability',
    label: 'Disponibilité & écoute',
    description: "Le professeur est disponible pour répondre aux questions et écoute les élèves.",
  },
  {
    key: 'respect',
    column: 'rating_respect',
    label: 'Respect & ambiance de classe',
    description: "Le professeur instaure un climat de respect et une bonne ambiance en classe.",
  },
  {
    key: 'organisation',
    column: 'rating_organisation',
    label: 'Organisation du cours',
    description: "Les cours sont bien préparés, structurés et le rythme est adapté.",
  },
  {
    key: 'fairness',
    column: 'rating_equite',
    label: "Équité de l'évaluation",
    description: "Les évaluations et les notes sont justes, cohérentes et bien expliquées.",
  },
  {
    key: 'motivation',
    column: 'rating_motivation',
    label: 'Capacité à motiver',
    description: "Le professeur donne envie d'apprendre et suscite l'intérêt pour la matière.",
  },
];
