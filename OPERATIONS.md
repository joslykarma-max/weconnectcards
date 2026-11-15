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

Tous les paiements (cartes, passage Pro, abonnement mensuel) passent par
`lib/payments.ts`. Ce qui est acheté est enregistré dans `payments/{idTransactionFedaPay}`
**avant** le paiement ; la confirmation ne lit que cet enregistrement et la réponse de FedaPay
(statut + montant), jamais les paramètres de l'URL. Une transaction n'est livrée qu'une fois.

### Activer les paiements (Vercel → Settings → Environment Variables)
| Variable | Valeur |
|----------|--------|
| `FEDAPAY_ENV` | `sandbox` pour tester, `production` pour encaisser |
| `FEDAPAY_SECRET_KEY` | Clé secrète du même environnement (`sk_sandbox_…` ou `sk_live_…`) |
| `FEDAPAY_WEBHOOK_SECRET` | Secret du webhook (voir ci-dessous) |

Sans `FEDAPAY_SECRET_KEY`, les boutons de paiement affichent « paiement en ligne pas encore disponible ».

### Configurer le webhook (indispensable)
1. Dashboard FedaPay → **Webhooks** → Nouveau webhook
2. URL : `https://weconnect.cards/api/webhooks/fedapay`
3. Événements : `transaction.approved`, `transaction.declined`, `transaction.canceled`
4. Copier la **clé secrète** du webhook dans `FEDAPAY_WEBHOOK_SECRET` (Vercel) → Redéployer

Le webhook livre la commande même si le client ferme la page après avoir payé. Le retour
navigateur (`GET /api/webhooks/fedapay?id=…`) fait la même vérification ; les deux peuvent
arriver dans n'importe quel ordre.

### Vérifier un paiement
Firestore → `payments/{idTransaction}` :
- `pending` : pas encore confirmé par FedaPay
- `paid` : livré (`cardId` = carte créée pour une commande)
- `failed` : refusé / annulé, ou `fedapayStatus: amount_mismatch` (montant différent — à examiner)

Si un paiement approuvé est resté `pending` (webhook pas encore configuré), ouvrir
`https://weconnect.cards/api/webhooks/fedapay?id=ID_TRANSACTION` : la vérification est refaite
auprès de FedaPay et la commande livrée si le paiement est bien approuvé.

---

## Pass Événement (cartes, bracelets, badges NFC)

We Connect n'est pas une billetterie : nous fournissons les supports NFC et le contrôle des entrées.

1. **Admin → Événements** : créer l'événement (l'organisateur doit avoir un compte We Connect),
   définir les zones (Entrée principale, VIP…) et les catégories (couleur, zones autorisées,
   règle d'entrée, association au billet obligatoire ou non, fenêtre de validité).
2. **Créer les lots** (catégorie, support, quantité, préfixe imprimé) puis **Exporter pour
   l'encodage** : chaque puce reçoit l'URL `https://weconnect.cards/p/<code>` de sa ligne ;
   le numéro (ex. `VIP-0042`) est imprimé sur le support.
3. **Tests sur place** : activer un téléphone de contrôle, scanner quelques pass, puis
   « Remettre les entrées à zéro » dans l'admin.
4. **L'organisateur** (tableau de bord → Événements) crée le lien staff (QR / WhatsApp),
   suit les entrées en direct, désactive un pass perdu, exporte la fréquentation.

Téléphones de contrôle : aucun compte ni application. Le lien staff pose un cookie sur le
navigateur ; le pass tapé s'ouvre dans ce navigateur et affiche vert / rouge / orange.
Mode « Guichet » : scanner le QR du billet (ou saisir son numéro) puis l'associer au pass tapé.

---

## Sécurité — codes et tentatives

- **Codes jamais exposés** : la page publique d'un module (`lib/module-public.ts`) retire le code
  tampon fidélité, le PIN des zones d'accès et le dossier médical protégé ; ils sont vérifiés côté serveur.
- **PIN médical** : enregistré chiffré (scrypt + sel, `lib/pin.ts`) ; le propriétaire ne le revoit pas,
  il peut le changer ou le retirer.
- **Tentatives** : compteurs partagés entre serveurs dans Firestore `rateLimits` (`lib/attempts.ts`) —
  code tampon (10 erreurs / 15 min par appareil, 100 / h par commerce), inscription (20 / 10 min par IP),
  contacts (30 / 10 min par IP). Le PIN médical (5 erreurs → 15 min) et les zones d'accès ont leurs propres verrous.
- **Nettoyage conseillé** : Firebase Console → Firestore → Rétention (TTL) → collection `rateLimits`,
  champ `expireAt`, pour supprimer automatiquement les vieux compteurs.

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
