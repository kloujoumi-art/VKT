require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');
const axios   = require('axios');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Sert depuis /public en local, depuis la racine sur Render
const publicDir = fs.existsSync(path.join(__dirname, 'public'))
  ? path.join(__dirname, 'public')
  : __dirname;
app.use(express.static(publicDir));

// ─── Produits ─────────────────────────────────
function getProducts() {
  const raw = fs.readFileSync(path.join(__dirname, 'products.json'), 'utf8');
  return JSON.parse(raw).products;
}

function getProduct(id) {
  return getProducts().find(p => p.id === id) || null;
}

// ─── Envoi WhatsApp via UltraMsg ──────────────
async function sendWhatsApp(to, message) {
  const instanceId = process.env.ULTRAMSG_INSTANCE_ID;
  const token      = process.env.ULTRAMSG_TOKEN;

  if (!instanceId || !token) {
    console.log('[WhatsApp] ULTRAMSG non configuré dans .env');
    return { skipped: true };
  }

  // Normaliser le numéro (ex: +212614779887)
  let phone = to.replace(/\s/g, '').replace(/[^0-9+]/g, '');
  if (!phone.startsWith('+')) phone = '+' + phone;

  console.log(`[WhatsApp] Envoi vers ${phone}...`);

  const response = await axios.post(
    `https://api.ultramsg.com/${instanceId}/messages/chat`,
    { token, to: phone, body: message },
    { headers: { 'Content-Type': 'application/json' } }
  );

  console.log('[WhatsApp] Réponse UltraMsg :', response.data);
  return response.data;
}

// ─── API : liste produits ─────────────────────
app.get('/api/products', (req, res) => {
  try {
    res.json({ success: true, products: getProducts() });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur chargement produits.' });
  }
});

// ─── API : commande ───────────────────────────
app.post('/api/checkout', async (req, res) => {
  const { name, phone, productId } = req.body;

  console.log(`[Commande] Reçue : nom=${name} | tel=${phone} | produit=${productId}`);

  if (!name || !phone || !productId) {
    return res.status(400).json({ success: false, message: 'Tous les champs sont requis.' });
  }

  const product = getProduct(productId);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Produit introuvable.' });
  }

  const message = buildWhatsAppMessage(name, product);
  let whatsappSent = false;

  try {
    const result = await sendWhatsApp(phone, message);
    whatsappSent = result && !result.skipped && !result.error;
  } catch (err) {
    console.error('[WhatsApp] Erreur :', err.message);
  }

  res.json({
    success:      true,
    whatsappSent: whatsappSent,
    message:      whatsappSent ? 'Message WhatsApp envoyé !' : 'Commande reçue.',
  });
});

// ─── Page principale ──────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Message WhatsApp ─────────────────────────
function buildWhatsAppMessage(name, product) {
  return `🔥 *VOLKA TV — Commande confirmée*

Bonjour *${name}* 👋

Votre commande *${product.name} — ${product.subtitle}* est prête.

━━━━━━━━━━━━━━━━

💳 *Procédez au paiement ici :*
${product.gumroad}

⚠️ Sur votre relevé bancaire, la transaction apparaîtra sous le nom *"Gumroad"* — c'est normal.

━━━━━━━━━━━━━━━━

📌 *Après votre paiement :*

1️⃣ Téléchargez le *PDF reçu par email*
2️⃣ Contactez-nous sur WhatsApp avec votre preuve de paiement pour recevoir votre *code d'accès*

📱 *${process.env.WHATSAPP_SUPPORT}*

Merci pour votre confiance 🙏
*VOLKA TV Officiel*`;
}

// ─── Démarrage ────────────────────────────────
const server = app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║     🔥 VOLKA TV — SYSTEME DE VENTE      ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log(`║  ✅ Port : ${PORT}                           ║`);
  console.log(`║  🌐 http://localhost:${PORT}               ║`);
  console.log(`║  📱 WhatsApp : ${process.env.WHATSAPP_SUPPORT}  ║`);
  console.log('╚══════════════════════════════════════════╝');
  console.log('');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`\n⚠️  Port ${PORT} occupé — tentative sur le port ${+PORT + 1}...\n`);
    app.listen(+PORT + 1, () => {
      console.log(`✅ Serveur démarré sur http://localhost:${+PORT + 1}`);
    });
  }
});
