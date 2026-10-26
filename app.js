// ============================================================
// app.js — منطق التطبيق
// ============================================================

// --- Cart State ---
let cart = [];

// --- Init ---
document.addEventListener("DOMContentLoaded", () => {
  renderPackages();
  renderComponents("all");
  setupScrollEffects();
});

// ============================================================
// HELPER — render product image or emoji fallback
// ============================================================
function renderProductImg(p, height = "180px") {
  if (p.image) {
    return `<div class="product-img" style="height:${height};padding:0;background:#fff;">
      <img src="${p.image}" alt="${p.name}"
        style="width:100%;height:100%;object-fit:cover;border-radius:0;"
        onerror="this.parentElement.innerHTML='<span style=font-size:3.5rem>${p.emoji}</span>'" />
    </div>`;
  }
  return `<div class="product-img" style="height:${height}">${p.emoji}</div>`;
}

// ============================================================
// RENDER PACKAGES
// ============================================================
function renderPackages() {
  const grid = document.getElementById("packagesGrid");
  if (!grid) return;
  grid.innerHTML = packages.map(p => createPackageCard(p)).join("");
}

function createPackageCard(p) {
  const badge = p.badge ? `<div class="product-badge ${p.badge}">${p.badgeText}</div>` : "";
  const oldPrice = p.oldPrice ? `<span class="price-old">${p.oldPrice} جنيه</span>` : "";
  const contents = p.contents.map(c => `<span class="content-tag">${c}</span>`).join("");

  return `
    <div class="product-card" id="card-${p.id}">
      ${badge}
      ${renderProductImg(p, "220px")}
      <div class="product-body">
        <div class="product-cat">باكدج كامل</div>
        <div class="product-name">${p.name}</div>
        <div class="product-desc">${p.desc}</div>
        <div style="margin-bottom:8px;font-size:.8rem;font-weight:700;color:#64748b">المحتويات:</div>
        <div class="product-contents">${contents}</div>
      </div>
      <div class="product-footer">
        <div class="product-price">
          ${oldPrice}
          <span class="price-current">${p.price.toLocaleString()}</span>
          <span class="price-currency">جنيه مصري</span>
        </div>
        <button class="btn-add-cart" onclick="addToCart('${p.id}','pkg')">
          <i class="fas fa-cart-plus"></i> أضف
        </button>
      </div>
    </div>
  `;
}

// ============================================================
// RENDER COMPONENTS
// ============================================================
function renderComponents(category) {
  const grid = document.getElementById("componentsGrid");
  if (!grid) return;
  const filtered = category === "all"
    ? components
    : components.filter(c => c.category === category);
  grid.innerHTML = filtered.map(c => createComponentCard(c)).join("");
  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:#64748b">
      <i class="fas fa-box-open" style="font-size:2.5rem;margin-bottom:12px;display:block;opacity:.3"></i>
      <p>لا توجد منتجات في هذا القسم حالياً</p>
    </div>`;
  }
}

function createComponentCard(c) {
  const badge = c.badge ? `<div class="product-badge ${c.badge}">${c.badgeText}</div>` : "";
  const oldPrice = c.oldPrice ? `<span class="price-old">${c.oldPrice} جنيه</span>` : "";
  const catLabels = {
    arduino: "أردوينو", sensors: "سينسور",
    modules: "موديول", basics: "أساسيات", displays: "شاشات"
  };

  return `
    <div class="product-card" id="card-${c.id}">
      ${badge}
      ${renderProductImg(c)}
      <div class="product-body">
        <div class="product-cat">${catLabels[c.category] || c.category}</div>
        <div class="product-name">${c.name}</div>
        <div class="product-desc">${c.desc}</div>
      </div>
      <div class="product-footer">
        <div class="product-price">
          ${oldPrice}
          <span class="price-current">${c.price.toLocaleString()}</span>
          <span class="price-currency">جنيه مصري</span>
        </div>
        <button class="btn-add-cart" onclick="addToCart('${c.id}','comp')">
          <i class="fas fa-cart-plus"></i> أضف
        </button>
      </div>
    </div>
  `;
}

// ============================================================
// FILTER
// ============================================================
function filterProducts(category, btn) {
  // Update active tab
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  if (btn) btn.classList.add("active");
  renderComponents(category);
}

// ============================================================
// CART
// ============================================================
function addToCart(id, type) {
  const product = type === "pkg"
    ? packages.find(p => p.id === id)
    : components.find(c => c.id === id);
  if (!product) return;

  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  updateCartBadge();
  renderCartItems();
  // Flash button
  const card = document.getElementById("card-" + id);
  if (card) {
    const btn = card.querySelector(".btn-add-cart");
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> تمت الإضافة';
    btn.style.background = "linear-gradient(135deg, #22c55e, #16a34a)";
    setTimeout(() => {
      btn.innerHTML = original;
      btn.style.background = "";
    }, 1500);
  }
  // Auto open cart
  openCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  updateCartBadge();
  renderCartItems();
  if (cart.length === 0) closeCartIfOpen();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(id);
  } else {
    updateCartBadge();
    renderCartItems();
  }
}

function updateCartBadge() {
  const total = cart.reduce((acc, i) => acc + i.qty, 0);
  document.getElementById("cartBadge").textContent = total;
}

function renderCartItems() {
  const container = document.getElementById("cartItems");
  const footer = document.getElementById("cartFooter");

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <i class="fas fa-shopping-cart"></i>
        <p>السلة فارغة</p>
      </div>`;
    footer.style.display = "none";
    return;
  }

  const total = cart.reduce((acc, i) => acc + i.price * i.qty, 0);
  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-emoji">${item.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${(item.price * item.qty).toLocaleString()} جنيه</div>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" onclick="changeQty('${item.id}',-1)">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty('${item.id}',1)">+</button>
        <button class="btn-remove-item" onclick="removeFromCart('${item.id}')"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join("");

  document.getElementById("cartTotal").textContent = total.toLocaleString();
  footer.style.display = "block";

  // Build WhatsApp message
  let msg = "مرحبا، عايز أطلب:\n\n";
  cart.forEach(item => {
    msg += `• ${item.name} x${item.qty} = ${(item.price * item.qty).toLocaleString()} جنيه\n`;
  });
  msg += `\n💰 الإجمالي: ${total.toLocaleString()} جنيه`;
  document.getElementById("cartWhatsapp").href =
    "https://wa.me/201006825554?text=" + encodeURIComponent(msg);
}

// ============================================================
// CART SIDEBAR TOGGLE
// ============================================================
function toggleCart() {
  const sidebar = document.getElementById("cartSidebar");
  const overlay = document.getElementById("cartOverlay");
  sidebar.classList.toggle("open");
  overlay.classList.toggle("active");
  document.body.style.overflow = sidebar.classList.contains("open") ? "hidden" : "";
}
function openCart() {
  document.getElementById("cartSidebar").classList.add("open");
  document.getElementById("cartOverlay").classList.add("active");
  document.body.style.overflow = "hidden";
}
function closeCartIfOpen() {
  if (cart.length === 0) {
    document.getElementById("cartSidebar").classList.remove("open");
    document.getElementById("cartOverlay").classList.remove("active");
    document.body.style.overflow = "";
  }
}

// ============================================================
// MENU TOGGLE (MOBILE)
// ============================================================
function toggleMenu() {
  document.getElementById("nav").classList.toggle("open");
}

// Close menu when clicking a link
document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", () => {
    document.getElementById("nav").classList.remove("open");
    // Update active
    document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
    link.classList.add("active");
  });
});

// ============================================================
// SCROLL EFFECTS
// ============================================================
function setupScrollEffects() {
  const header = document.getElementById("header");
  const backToTop = document.getElementById("backToTop");

  window.addEventListener("scroll", () => {
    const y = window.scrollY;

    // Header shadow
    if (y > 10) header.classList.add("scrolled");
    else header.classList.remove("scrolled");

    // Back to top
    if (y > 400) backToTop.classList.add("visible");
    else backToTop.classList.remove("visible");

    // Active nav link based on section
    const sections = ["home","packages","components","about","contact"];
    let current = "";
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 100) current = id;
    });
    document.querySelectorAll(".nav-link").forEach(link => {
      link.classList.toggle("active", link.getAttribute("href") === "#" + current);
    });
  });
}
