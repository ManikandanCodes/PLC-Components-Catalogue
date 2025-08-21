
const detailsModal = document.getElementById('detailsModal');
const modalImage = document.getElementById('modalImage');
const modalName = document.getElementById('modalName');
const modalPrice = document.getElementById('modalPrice');
const modalDesc = document.getElementById('modalDesc');
const closeModalBtn = document.getElementById('closeModal');
const modalAddCartBtn = document.getElementById('modalAddCart');

let currentProduct = null;


function showProductDetails(card) {
  currentProduct = {
    name: card.getAttribute('data-name'),
    price: Number(card.getAttribute('data-price')) || 0,
    type: card.getAttribute('data-type'),
    img: card.getAttribute('data-img'),
    desc: card.getAttribute('data-desc') || ''
  };

  const thumb = card.querySelector('.thumb-img');
  modalImage.src = thumb ? thumb.src : currentProduct.img;
  modalImage.alt = currentProduct.name;
  modalName.textContent = currentProduct.name;
  modalPrice.innerHTML = `Price: ₹${currentProduct.price.toLocaleString('en-IN')}`;

  
  let descHtml = currentProduct.desc.replace(/(Overview:)/i, '$1');
  modalDesc.innerHTML = descHtml;
  modalDesc.classList.add('modal-desc-align');

  detailsModal.classList.add('active');
  document.body.classList.add('modal-open');
}


function closeDetailsModal() {
  detailsModal.classList.remove('active');
  document.body.classList.remove('modal-open');
}
closeModalBtn && (closeModalBtn.onclick = closeDetailsModal);
detailsModal && (detailsModal.onclick = (e) => { if (e.target === detailsModal) closeDetailsModal(); });
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && detailsModal.classList.contains('active')) closeDetailsModal();
});


const observer = new MutationObserver(() => {
  if (!currentProduct) return;
  const card = Array.from(document.querySelectorAll('.component-card'))
    .find(c => c.getAttribute('data-name') === currentProduct.name);
  if (!card) return;
  const thumb = card.querySelector('.thumb-img');
  if (detailsModal.classList.contains('active') && thumb) {
    modalImage.src = thumb.src;
  }
});
document.querySelectorAll('.component-card .thumb-img').forEach(img => {
  observer.observe(img, { attributes: true, attributeFilter: ['src'] });
});


modalAddCartBtn && modalAddCartBtn.addEventListener('click', () => {
  if (!currentProduct) return;
  addToCart({ name: currentProduct.name, price: currentProduct.price, img: currentProduct.img });
  closeDetailsModal();
});


const searchBox = document.getElementById('searchBox');
const filterSelect = document.getElementById('filterSelect');
const componentCards = document.querySelectorAll('.component-card');

function filterAndSearch() {
  const searchTerm = (searchBox.value || '').toLowerCase();
  const filterValue = filterSelect.value;

  componentCards.forEach(card => {
    const name = (card.getAttribute('data-name') || '').toLowerCase();
    const type = card.getAttribute('data-type');
    
    const matchesFilter = (filterValue === 'all') || (type === filterValue);
    
    const matchesSearch = name.includes(searchTerm);


    if (matchesFilter && matchesSearch) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
}

if (searchBox) searchBox.addEventListener('input', filterAndSearch);
if (filterSelect) filterSelect.addEventListener('change', filterAndSearch);

const cartBtn = document.getElementById('cartBtn');
const cartBadge = document.getElementById('cartBadge');
const cartModal = document.getElementById('cartModal');
const closeCartBtn = document.getElementById('closeCart');
const cartItemsDiv = document.getElementById('cartItems');
const subtotalSpan = document.getElementById('subtotal');
const gstSpan = document.getElementById('gst');
const totalSpan = document.getElementById('total');
const checkoutBtn = document.getElementById('checkoutBtn');

let cart = [];


window.getCart = () => cart;


cartBtn && cartBtn.addEventListener('click', () => {
  cartModal.classList.add('active');
  document.body.classList.add('modal-open');
  updateCartDisplay();
});
closeCartBtn && closeCartBtn.addEventListener('click', closeCartModal);
cartModal && cartModal.addEventListener('click', (e) => {
  if (e.target === cartModal) closeCartModal();
});
function closeCartModal() {
  cartModal.classList.remove('active');
  document.body.classList.remove('modal-open');
}


function addToCart(product) {
  const found = cart.find(item => item.name === product.name);
  if (found) {
    found.qty += 1;
  } else {
    cart.push({
      name: product.name,
      price: Number(product.price) || 0,
      img: product.img || '',
      qty: 1
    });
  }
  updateCartDisplay();
  showCartBadge();
}

function showCartBadge() {
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  if (totalQty > 0) {
    cartBadge.style.display = 'inline-block';
    cartBadge.textContent = totalQty;
    cartBadge.classList.remove('cart-bounce-anim');
    void cartBadge.offsetWidth; // reflow for animation
    cartBadge.classList.add('cart-bounce-anim');
  } else {
    cartBadge.style.display = 'none';
  }
}


function updateCartDisplay() {
  cartItemsDiv.innerHTML = '';

  if (cart.length === 0) {
    cartItemsDiv.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
    subtotalSpan.textContent = '₹0';
    gstSpan.textContent = '₹0.00';
    totalSpan.textContent = '₹0.00';
    return;
  }

  let subtotal = 0;

  cart.forEach((item, idx) => {
    subtotal += item.price * item.qty;

    const row = document.createElement('div');
    row.className = 'cart-item-row';
    row.innerHTML = `
      <div class="cart-item-name">${item.name}</div>
      <div class="cart-item-qty-bar">
        <button data-idx="${idx}" class="dec">-</button>
        <span>${item.qty}</span>
        <button data-idx="${idx}" class="inc">+</button>
      </div>
      <div class="cart-item-price">₹${(item.price * item.qty).toLocaleString('en-IN')}</div>
      <button data-idx="${idx}" class="cart-item-remove">×</button>
    `;
    cartItemsDiv.appendChild(row);
  });

  const gst = subtotal * 0.18;
  const total = subtotal + gst;
  subtotalSpan.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
  gstSpan.textContent = `₹${gst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  totalSpan.textContent = `₹${total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

  
  cartItemsDiv.querySelectorAll('.dec').forEach(b => b.addEventListener('click', (e) => {
    const i = Number(e.currentTarget.dataset.idx);
    cart[i].qty = Math.max(1, cart[i].qty - 1);
    updateCartDisplay();
    showCartBadge();
  }));

  cartItemsDiv.querySelectorAll('.inc').forEach(b => b.addEventListener('click', (e) => {
    const i = Number(e.currentTarget.dataset.idx);
    cart[i].qty += 1;
    updateCartDisplay();
    showCartBadge();
  }));

  cartItemsDiv.querySelectorAll('.cart-item-remove').forEach(b => b.addEventListener('click', (e) => {
    const i = Number(e.currentTarget.dataset.idx);
    cart.splice(i, 1);
    updateCartDisplay();
    showCartBadge();
  }));
}

document.querySelectorAll('.component-card .add-cart-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const card = e.currentTarget.closest('.component-card');
    if (!card) return;
    const product = {
      name: card.getAttribute('data-name'),
      price: Number(card.getAttribute('data-price')) || 0,
      img: (card.querySelector('.thumb-img') || {}).src || card.getAttribute('data-img') || ''
    };
    addToCart(product);
  });
});

document.querySelectorAll('.component-card .view-details-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const card = e.currentTarget.closest('.component-card');
    if (card) showProductDetails(card);
  });
});

function encodeCartForUrl(items) {
  try {
    const json = JSON.stringify(items.map(it => ({
      name: it.name,
      price: Number(it.price) || 0,
      qty: Number(it.qty) || 1
    })));
    
    const b64 = btoa(unescape(encodeURIComponent(json)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/,'');
    return b64;
  } catch (e) {
    return '';
  }
}

checkoutBtn && checkoutBtn.addEventListener('click', () => {
  const cartSnapshot = Array.isArray(cart) ? cart : [];
  const payload = encodeCartForUrl(cartSnapshot);
  const url = payload ? `Bill/Bill.html#cart=${payload}` : `Bill/Bill.html`;


  if (cartModal && cartModal.classList.contains('active')) {
    cartModal.classList.remove('active');
    document.body.classList.remove('modal-open');
  }
  
  window.open(url, '_blank'); 

});
