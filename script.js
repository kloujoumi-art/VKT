// ============================================
// VOLKA TV — LOGIQUE FRONTEND
// ============================================

let products      = [];
let selectedProduct = null;

// ─── Init ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', loadProducts);

async function loadProducts() {
  try {
    const res  = await fetch('/api/products');
    const data = await res.json();
    if (data.success) {
      products = data.products;
      renderProducts(products);
    }
  } catch (err) {
    document.getElementById('productsGrid').innerHTML =
      '<p style="color:#e74c3c;text-align:center;grid-column:1/-1;padding:40px;">Erreur de chargement. Rechargez la page.</p>';
  }
}

// ─── Rendu de la grille produits ──────────────
function renderProducts(list) {
  const grid = document.getElementById('productsGrid');
  if (!list.length) {
    grid.innerHTML = '<p style="text-align:center;color:#666;grid-column:1/-1;padding:40px;">Aucun produit disponible.</p>';
    return;
  }

  grid.innerHTML = list.map(p => `
    <div class="product-card" onclick="openModal('${p.id}')">
      ${p.badge ? `<span class="card-badge ${p.badge.toLowerCase()}">${p.badge}</span>` : ''}

      <div class="card-img-wrap">
        <img src="${p.image}"
             alt="${p.name}"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <div class="card-img-placeholder" style="display:none;">
          <div class="ph-icon">📺</div>
          <p>${p.name}</p>
        </div>
      </div>

      <div class="card-body">
        <div class="card-name">${p.name}</div>
        <div class="card-sub">📅 ${p.subtitle}</div>
        <p class="card-desc">${p.description}</p>
        <div class="card-features">
          ${p.features.map(f => `<span class="feat-chip">✓ ${f}</span>`).join('')}
        </div>
        <div class="card-footer">
          <div class="card-price">${p.price}${p.currency}</div>
          <button class="btn-card-buy" onclick="event.stopPropagation();openModal('${p.id}')">
            🛒 Acheter
          </button>
        </div>
      </div>
    </div>
  `).join('');

  // Animation d'entrée
  document.querySelectorAll('.product-card').forEach((card, i) => {
    card.style.opacity   = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = `opacity 0.4s ease ${i * 0.07}s, transform 0.4s ease ${i * 0.07}s`;
    requestAnimationFrame(() => {
      card.style.opacity   = '1';
      card.style.transform = 'translateY(0)';
    });
  });
}

// ─── Modal ────────────────────────────────────
function openModal(productId) {
  selectedProduct = products.find(p => p.id === productId);
  if (!selectedProduct) return;

  // Remplir le résumé produit
  document.getElementById('modalProductInfo').innerHTML = `
    <img src="${selectedProduct.image}"
         class="mpi-img"
         alt="${selectedProduct.name}"
         onerror="this.style.display='none';document.querySelector('.mpi-placeholder').style.display='flex'">
    <div class="mpi-placeholder" style="display:none;">📺</div>
    <div class="mpi-text">
      <div class="mpi-name">${selectedProduct.name}</div>
      <div class="mpi-sub">📅 ${selectedProduct.subtitle}</div>
      <div class="mpi-price">${selectedProduct.price}${selectedProduct.currency}</div>
    </div>
  `;

  // Remplir le résumé prix
  document.getElementById('formSummary').innerHTML = `
    <span>${selectedProduct.name} — ${selectedProduct.subtitle}</span>
    <span class="summary-price">${selectedProduct.price}${selectedProduct.currency}</span>
  `;

  // Reset form + afficher step1
  document.getElementById('checkoutForm').reset();
  document.getElementById('step1').classList.remove('hidden');
  document.getElementById('step2').classList.add('hidden');
  removeError();
  setLoading(false);

  document.getElementById('modalOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('name').focus(), 300);
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

function closeModalOnOverlay(e) {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// ─── Soumission du formulaire ─────────────────
async function submitForm(e) {
  e.preventDefault();
  removeError();

  const name  = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();

  // Validation front
  if (!name)  return showError('Veuillez entrer votre nom.');
  if (!phone || phone.replace(/\D/g,'').length < 8)
    return showError('Numéro WhatsApp invalide.');

  setLoading(true);

  try {
    const res  = await fetch('/api/checkout', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, phone, productId: selectedProduct.id }),
    });

    const data = await res.json();

    if (data.success) {
      // Badge WhatsApp
      const waBadge = document.getElementById('waBadge');
      if (data.whatsappSent) {
        waBadge.textContent = '💬 WhatsApp envoyé ✓';
        waBadge.className   = 'channel-badge whatsapp';
      } else {
        waBadge.textContent = '💬 WhatsApp (vérifier config)';
        waBadge.className   = 'channel-badge skipped';
      }

      // Bouton paiement direct
      // Afficher step 2
      document.getElementById('step1').classList.add('hidden');
      document.getElementById('step2').classList.remove('hidden');

    } else {
      showError(data.message || 'Une erreur est survenue. Réessayez.');
    }

  } catch (err) {
    showError('Problème de connexion. Vérifiez votre internet et réessayez.');
  } finally {
    setLoading(false);
  }
}

// ─── Helpers UI ───────────────────────────────
function setLoading(on) {
  document.getElementById('submitBtn').disabled    = on;
  document.getElementById('submitText').classList.toggle('hidden', on);
  document.getElementById('submitLoader').classList.toggle('hidden', !on);
}

function showError(msg) {
  removeError();
  const div = document.createElement('div');
  div.className   = 'form-error';
  div.id          = 'formError';
  div.textContent = '⚠️ ' + msg;
  document.getElementById('submitBtn').insertAdjacentElement('beforebegin', div);
  setTimeout(removeError, 6000);
}

function removeError() {
  const el = document.getElementById('formError');
  if (el) el.remove();
}

// ─── Animations scroll ────────────────────────
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity   = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.step-card').forEach(el => {
  el.style.opacity   = '0';
  el.style.transform = 'translateY(18px)';
  el.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
  observer.observe(el);
});
