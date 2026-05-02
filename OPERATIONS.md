# We Connect Cards — Guide Opérationnel

## Déploiement Vercel

### Variables d'environnement requises
Voir `.env.example` pour la liste complète. Variables **obligatoires** :

| Variable | Description |
|----------|-------------|
| `FIREBASE_PROJECT_ID` | ID du projet Firebase |
| `FIREBASE_CLIENT_EMAIL` | Email du compte de service Firebase |
| `FIREBASE_PRIVATE_KEY` | Clé privée RSA (avec `\n` littéraux, sans guillemets) |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Clé API Firebase côté client |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Domaine d'auth Firebase |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ID projet (côté client) |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Bucket Storage (`projet.appspot.com`) |
| `NEXT_PUBLIC_APP_URL` | `https://weconnect.cards` |
| `FEDAPAY_SECRET_KEY` | Clé secrète FedaPay |
| `FEDAPAY_ENV` | `sandbox` (test) ou `production` (live) |
| `ADMIN_UIDS` | UIDs admins séparés par virgules |

Variables **optionnelles** :
- `POSTMARK_SERVER_TOKEN` — emails d'invitation équipe

---

## Firebase

### Rotation de la clé privée
1. Firebase Console → Paramètres du projet → Comptes de service
2. "Générer une nouvelle clé privée"
3. Mettre à jour `FIREBASE_PRIVATE_KEY` dans Vercel → Redéployer

### Activer Firebase Storage
1. Firebase Console → Storage → "Commencer"
2. Choisir `europe-west1` (ou région proche des clients)
3. Mode production (les règles API Admin SDK ignorent les rules)

### Déployer Firestore Rules
```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

### Créer un index composite requis
Dans Firebase Console → Firestore → Index composites :
- Collection: `cards` | Champs: `userId ASC`, `status ASC` | Scope: Collection

---

## FedaPay — Paiements

### Basculer sandbox → production
1. Changer `FEDAPAY_ENV=production` dans Vercel
2. Changer `FEDAPAY_SECRET_KEY` pour la clé live
3. Dans le dashboard FedaPay : configurer l'URL de callback webhook :
   `https://weconnect.cards/api/webhooks/fedapay`
4. Redéployer

### Vérifier un paiement manquant
Si un client a payé mais n'a pas reçu sa carte :
1. Firebase Console → Firestore → `payments` — chercher par `uid`
2. Si absent : le webhook n'a pas été appelé. Relancer manuellement :
   `GET https://weconnect.cards/api/webhooks/fedapay?uid=UID&cardType=pro&id=TRANSACTION_ID&source=card`

---

## Administration

### Accéder au panel admin
URL : `https://weconnect.cards/admin`  
Nécessite : être dans `ADMIN_UIDS` env var **ou** avoir un doc dans la collection `admins/{uid}`.

### Ajouter un admin via script
```bash
FIREBASE_PROJECT_ID=xxx FIREBASE_CLIENT_EMAIL=xxx FIREBASE_PRIVATE_KEY="xxx" \
node scripts/create-admin.mjs <email>
```

### Backfill (migration champs nouveaux)
À exécuter une seule fois après mise à jour :
```bash
FIREBASE_PROJECT_ID=xxx FIREBASE_CLIENT_EMAIL=xxx FIREBASE_PRIVATE_KEY="xxx" \
node scripts/backfill-users.mjs
```

---

## Domaine & DNS (Hostinger → Vercel)

| Type | Nom | Valeur |
|------|-----|--------|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

Firebase Authorized Domains : Firebase Console → Authentication → Settings → Domaines autorisés → ajouter `weconnect.cards`.

---

## Monitoring

Aucun monitoring automatique n'est configuré actuellement.  
En cas de problème :
- Logs Vercel : Dashboard → Deployments → Logs en temps réel (24h)
- Erreurs critiques : chercher `[webhook/fedapay]`, `[cards/order]`, `[register]` dans les logs
