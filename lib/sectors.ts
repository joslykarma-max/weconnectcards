export const SECTORS = [
  'Technologie & Développement',
  'Marketing & Communication',
  'Commerce & Vente',
  'Finance & Comptabilité',
  'Santé & Médecine',
  'Éducation & Formation',
  'Droit & Juridique',
  'Architecture & BTP',
  'Design & Création',
  'Agriculture & Agroalimentaire',
  'Transport & Logistique',
  'Tourisme & Hôtellerie',
  'Arts & Culture',
  'ONG & Associations',
  'Immobilier',
  'Industrie & Manufacture',
  'Autre',
] as const;

export type Sector = (typeof SECTORS)[number];
