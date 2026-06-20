// One-time script: bulk-imports sales agents for inastravelgaf@gmail.com.
// Usage: node scripts/seed-inastravel-agents.mjs
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const envFile = join(__dirname, '..', '.env.local');
const lines = readFileSync(envFile, 'utf8').split('\n');
for (const line of lines) {
  const match = line.match(/^([A-Z0-9_]+)="?([\s\S]*?)"?\s*$/);
  if (match) process.env[match[1]] = match[2];
}

const { default: admin } = await import('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId:   process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey:  process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

const auth = admin.auth();
const db   = admin.firestore();

const ACCOUNT_EMAIL = 'inastravelgaf@gmail.com';

const AGENTS = [
  { fullName: 'Adahe Pricilia',          phone: '0152523982', zone: 'Aïtchedji' },
  { fullName: 'Hovinou Osias',           phone: '0161926750', zone: 'Togba' },
  { fullName: 'Hovinou Stephania',       phone: '0190542123', zone: 'Togba' },
  { fullName: 'Bentho Marie Josephe',    phone: '0159718103', zone: 'Pahou' },
  { fullName: 'Sakoto Merveille',        phone: '0146439656', zone: 'Iita' },
  { fullName: 'Gbehinto Morelle',        phone: '0148095912', zone: 'Djadjo' },
  { fullName: 'Ahouandjinou Merveille',  phone: '0128101501', zone: 'Womey' },
  { fullName: 'Ahissou Dona Benoite',    phone: '0191225602', zone: 'Malia Gleta' },
  { fullName: 'Gbaguidi Lumière',        phone: '0198513425', zone: 'Pahou' },
  { fullName: 'Akpo Séraphine',          phone: '0156601136', zone: 'Zinvié' },
  { fullName: 'Dahgoli Ornellia',        phone: '0159141819', zone: 'Bidossessi' },
  { fullName: 'Bossou Gertrude',         phone: '0129284283', zone: 'Womey' },
  { fullName: 'Sekloka Florida',         phone: '0164131986', zone: 'Agla' },
  { fullName: 'Sekloka Frédérica',       phone: '0140936226', zone: 'Agla' },
  { fullName: 'Badara Silifath',         phone: '0162018621', zone: 'Aconvile' },
  { fullName: 'Gangbo Raymonde',         phone: '0145579101', zone: 'Kpota' },
  { fullName: 'Gbehinto Brunette',       phone: '0140760542', zone: 'Djadjo' },
  { fullName: 'Tebe Elvis',              phone: '67020556',   zone: 'Hevie' },
];

function generateAgentCode(phone) {
  const fromPhone = (phone ?? '').replace(/\D/g, '').slice(-6);
  const suffix    = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${fromPhone || 'AG'}${suffix}`;
}

try {
  const user = await auth.getUserByEmail(ACCOUNT_EMAIL);
  console.log('✅ Compte trouvé —', ACCOUNT_EMAIL, '· uid:', user.uid);

  const batch = db.batch();
  const used  = new Set();
  const now   = new Date().toISOString();
  const created = [];

  for (const a of AGENTS) {
    let code = generateAgentCode(a.phone).replace(/[^a-zA-Z0-9]/g, '');
    while (used.has(code)) code = generateAgentCode(a.phone).replace(/[^a-zA-Z0-9]/g, '');
    used.add(code);

    const agent = {
      id:        code,
      profileId: user.uid,
      fullName:  a.fullName,
      function:  '',
      mit:       code,
      phone:     a.phone,
      zone:      a.zone,
      isActive:  true,
      createdAt: now,
    };
    batch.set(db.collection('agentCards').doc(`${user.uid}_${code}`), agent);
    created.push(agent);
  }

  await batch.commit();

  console.log(`\n✅ ${created.length} agents importés pour ${ACCOUNT_EMAIL}\n`);
  for (const a of created) {
    console.log(`  ${a.fullName.padEnd(28)} ${a.phone.padEnd(14)} ${a.zone.padEnd(14)} code: ${a.mit}`);
  }
  console.log('\nQR codes disponibles dans Équipe → Membres → Agents → bouton "⬛ QR" sur chaque fiche.\n');
} catch (err) {
  console.error('❌ Erreur :', err.message);
  process.exit(1);
}

process.exit(0);
