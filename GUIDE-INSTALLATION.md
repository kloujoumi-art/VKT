# GUIDE D'INSTALLATION — VOLKA TV SYSTEME

## STRUCTURE DU PROJET

```
VOLKA TV SYSTEME/
├── server.js              ← Serveur Node.js (backend)
├── package.json           ← Dependances
├── products.json          ← ⚡ LISTE DES PRODUITS (facile a modifier)
├── .env                   ← Configuration (emails, API...)
├── .gitignore
├── public/
│   ├── index.html         ← Page produit (grille)
│   ├── style.css          ← Design
│   ├── script.js          ← Logique frontend
│   ├── logo.png           ← VOTRE LOGO (a ajouter)
│   ├── product-orca.jpg   ← Images produits (a ajouter)
│   ├── product-iron.jpg
│   ├── product-fosto.jpg
│   ├── product-neox2.jpg
│   ├── product-atlas.jpg
│   └── product-xplayer.jpg
```

---

## ETAPE 1 — Installer Node.js

1. Aller sur https://nodejs.org
2. Telecharger la version **LTS**
3. Installer (suivre l'assistant)
4. Verifier : ouvrir un terminal, taper `node -v`

---

## ETAPE 2 — Installer les dependances

Ouvrir un terminal dans le dossier du projet :
```bash
npm install
```

---

## ETAPE 3 — Configurer le fichier .env

Ouvrir `.env` et remplir :

```env
PORT=3000

# Email Gmail
EMAIL_USER=votre_email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx   ← MOT DE PASSE APPLICATION

ADMIN_EMAIL=votre_email@gmail.com

# WhatsApp API (optionnel, voir etape 3b)
ULTRAMSG_INSTANCE_ID=
ULTRAMSG_TOKEN=

COMPANY_NAME=VOLKA TV
WHATSAPP_SUPPORT=+212714779887
```

### Obtenir le mot de passe application Gmail :
1. https://myaccount.google.com
2. Securite → Verification en 2 etapes (activer)
3. Securite → Mots de passe des applications
4. "Autre" → "VOLKA TV" → Copier le code 16 caracteres

---

## ETAPE 3b — Configurer l'envoi WhatsApp automatique (UltraMsg)

Sans cette etape, seul l'email est envoye (WhatsApp est optionnel).

1. Creer un compte sur https://ultramsg.com (gratuit)
2. Creer une instance et scanner le QR avec votre WhatsApp Business
3. Copier **Instance ID** et **Token** dans `.env`

```env
ULTRAMSG_INSTANCE_ID=instance12345
ULTRAMSG_TOKEN=votretoken
```

---

## ETAPE 4 — Ajouter vos images

Copier vos images produits dans `public/` avec ces noms exacts :
- `logo.png` ← votre logo VOLKA TV
- `product-orca.jpg`
- `product-iron.jpg`
- `product-fosto.jpg`
- `product-neox2.jpg`
- `product-atlas.jpg`
- `product-xplayer.jpg`

---

## ETAPE 5 — Lancer le serveur

```bash
npm start
```

Ouvrir http://localhost:3000

Pour le developpement (redemarrage auto) :
```bash
npm run dev
```

---

## MODIFIER LES PRODUITS FACILEMENT

Tout se passe dans `products.json`. Exemple pour modifier un produit :

```json
{
  "id": "orca",
  "name": "ORCA Pro",
  "subtitle": "12 Mois",
  "description": "Votre description...",
  "price": "24.99",
  "currency": "€",
  "image": "product-orca.jpg",
  "gumroad": "https://khalidlj.gumroad.com/l/GDT-ORC2024",
  "features": ["13500+ Live", "VOD", "HD 4K"],
  "badge": "POPULAIRE",
  "color": "#9b59b6"
}
```

- `badge` : "POPULAIRE", "NOUVEAU" ou "" (vide)
- `color` : couleur de l'accent de la carte
- Redemarrer le serveur apres modification

---

## DEPLOIEMENT EN LIGNE

### Option A : Railway (recommande)
1. https://railway.app → Nouveau projet
2. Glisser-deposer le dossier OU connecter GitHub
3. Variables d'env → copier le contenu de `.env`
4. Deploy → obtenir votre URL publique

### Option B : Render.com (gratuit)
1. https://render.com → New Web Service
2. Build : `npm install` | Start : `npm start`
3. Ajouter les variables d'environnement
4. Deploy

### Option C : VPS (serveur dedie)
```bash
npm install -g pm2
pm2 start server.js --name "volkatv"
pm2 startup && pm2 save
```

---

## CONFIGURER GUMROAD WEBHOOK (post-paiement)

Pour envoyer l'email de confirmation apres paiement :

1. https://app.gumroad.com → Settings → Advanced
2. **Ping URL** : `https://VOTRE-DOMAINE/api/webhook/gumroad`
3. Sauvegarder

Gumroad appellera automatiquement cette URL apres chaque achat.

---

## FLUX COMPLET

```
1. Client visite la page
2. Choisit un produit → clique Acheter
3. Remplit : Nom + Email + WhatsApp
4. Recoit :
   → Email avec lien Gumroad
   → Message WhatsApp avec lien Gumroad
5. Paie sur Gumroad
6. Webhook → email de confirmation automatique
7. Client contacte WhatsApp pour son code d'acces
```

---

Support : WhatsApp +212714779887
