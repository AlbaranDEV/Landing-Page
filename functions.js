// Contador estimado de "Clientes satisfechos"
function diasEntre(fecha1, fecha2) {
    const msPorDia = 1000 * 60 * 60 * 24;
    return Math.floor((fecha2 - fecha1) / msPorDia);
}

// Parámetros para estimar clientes satisfechos
const OPEN_DATE = new Date("2020-05-10"); // fecha de apertura
const AVERAGE_CUSTOMERS_PER_DAY = 40; // estimación media diaria (ajustada)
const BASE_CUSTOMERS = 1500; // clientes previos al cálculo (offset) (ajustado)

document.addEventListener('DOMContentLoaded', () => {
    const counterEl = document.getElementById('counter-number');
    if (!counterEl) return;

    // Calcular objetivo
    const daysOpen = Math.max(0, diasEntre(OPEN_DATE, new Date()));
    const targetCustomers = BASE_CUSTOMERS + daysOpen * AVERAGE_CUSTOMERS_PER_DAY;

    // Animación: incrementar suavemente hasta el objetivo
    let current = 0;
    const steps = 240; // número de pasos de animación
    const increment = Math.max(1, Math.floor(targetCustomers / steps));
    const intervalMs = 20; // velocidad de la animación

    const intervalId = setInterval(() => {
        current += increment;
        if (current >= targetCustomers) {
            current = targetCustomers;
            clearInterval(intervalId);
        }
        counterEl.innerText = current.toLocaleString();
    }, intervalMs);
});

// --- Menú hamburguesa móvil ---
document.addEventListener('DOMContentLoaded', function () {
    const hamburger = document.getElementById('hamburger-menu');
    const menuList = document.querySelector('.menu ul');
    if (hamburger && menuList) {
        hamburger.addEventListener('click', function () {
            const expanded = hamburger.getAttribute('aria-expanded') === 'true';
            hamburger.setAttribute('aria-expanded', !expanded);
            hamburger.classList.toggle('active');
            menuList.classList.toggle('active');
        });
        // Cerrar menú al hacer click en un enlace (opcional)
        menuList.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                menuList.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });
    }
});

// ------------------ Carrito de compras ------------------
const CART_KEY = 'burger_house_cart_v1';

function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
}

function addToCart(item) {
    const cart = getCart();
    const existing = cart.find(i => i.name === item.name);
    if (existing) {
        existing.qty = (existing.qty || 1) + (item.qty || 1);
    } else {
        cart.push({ name: item.name, price: item.price, qty: item.qty || 1 });
    }
    saveCart(cart);
    renderCart();
}

function removeFromCart(name) {
    let cart = getCart();
    cart = cart.filter(i => i.name !== name);
    saveCart(cart);
    renderCart();
}

function clearCart() {
    saveCart([]);
    renderCart();
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((s, i) => s + (i.qty || 1), 0);
    const el = document.getElementById('cart-count');
    if (el) el.innerText = count;
}

function parsePriceToNumber(priceStr) {
    if (!priceStr) return 0;
    const cleaned = priceStr.toString().replace(/[^0-9.,-]/g, '').replace(/\./g, '').replace(/,/g, '.');
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
}

function renderCart() {
    const cart = getCart();
    const ul = document.getElementById('cart-items');
    if (!ul) return;
    ul.innerHTML = '';
    let total = 0;
    cart.forEach(it => {
        const li = document.createElement('li');
        li.className = 'cart-item';
        const priceNum = parsePriceToNumber(it.price);
        total += priceNum * (it.qty || 1);
        li.innerHTML = `
            <span class="cart-name">${it.name}</span>
            <span class="cart-price">${it.price}</span>
            <input type="number" min="1" value="${it.qty || 1}" class="cart-qty" data-name="${encodeURIComponent(it.name)}" />
            <button class="remove-item" data-name="${encodeURIComponent(it.name)}">Eliminar</button>
        `;
        ul.appendChild(li);
    });
    const totalEl = document.getElementById('cart-total');
    if (totalEl) totalEl.innerText = `$${total.toLocaleString()}`;

    // listeners
    document.querySelectorAll('.remove-item').forEach(b => {
        b.addEventListener('click', e => {
            const name = decodeURIComponent(e.currentTarget.dataset.name);
            removeFromCart(name);
        });
    });

    document.querySelectorAll('.cart-qty').forEach(input => {
        input.addEventListener('change', e => {
            const name = decodeURIComponent(e.currentTarget.dataset.name);
            let qty = parseInt(e.currentTarget.value) || 1;
            if (qty < 1) qty = 1;
            const cart = getCart();
            const item = cart.find(i => i.name === name);
            if (item) {
                item.qty = qty;
                saveCart(cart);
                renderCart();
            }
        });
    });
    updateCartCount();
}

function extractNameAndPriceFromElement(el) {
    // Busca span con nombre o primer texto antes de ':'
    let name = '';
    let price = '';
    const span = el.querySelector('span');
    if (span && span.innerText.trim()) {
        // Nombre puede estar en span seguido de ':'
        name = span.innerText.replace(/:\s*$/, '').trim();
    }
    const precioEl = el.querySelector('.precio');
    if (precioEl) price = precioEl.innerText.trim();
    else {
        // buscar $ en el texto
        const text = el.innerText;
        const m = text.match(/\$[0-9\.,]+/);
        if (m) price = m[0];
    }
    if (!name) {
        const p = el.querySelector('.parrafo-2') || el.querySelector('p');
        if (p) {
            const txt = p.innerText.split('\n')[0];
            name = txt.split(':')[0].trim();
        }
    }
    return { name: name || 'Producto', price: price || '$0' };
}

document.addEventListener('DOMContentLoaded', () => {
    // Escanea items y añade botón 'Agregar' si no existe
    const selectors = ['.hamburguesa-item', '.hamburguesareina-item', '.postre-item'];
    selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(itemEl => {
            if (itemEl.querySelector('.agregar-btn')) return; // ya tiene
            const info = extractNameAndPriceFromElement(itemEl);
            const btn = document.createElement('button');
            btn.className = 'agregar-btn';
            btn.innerText = 'Agregar al carrito';
            btn.dataset.name = info.name;
            btn.dataset.price = info.price;
            btn.addEventListener('click', () => {
                addToCart({ name: info.name, price: info.price, qty: 1 });
            });
            // Insertar al final del item
            itemEl.appendChild(btn);
        });
    });

    // Botones para abrir/cerrar carrito
    const viewCartBtn = document.getElementById('view-cart-btn');
    const cartModal = document.getElementById('cart-modal');
    const closeCart = document.getElementById('close-cart');
    const checkoutBtn = document.getElementById('checkout-btn');
    const clearCartBtn = document.getElementById('clear-cart-btn');

    if (viewCartBtn && cartModal) {
        viewCartBtn.addEventListener('click', () => {
            cartModal.classList.remove('hidden');
            renderCart();
        });
    }
    if (closeCart) closeCart.addEventListener('click', () => cartModal.classList.add('hidden'));
    if (clearCartBtn) clearCartBtn.addEventListener('click', () => clearCart());
    if (checkoutBtn) checkoutBtn.addEventListener('click', () => {
        // Scroll suave hacia sección de checkout si existe, si no hacia arriba
        const target = document.getElementById('checkout-section') || { getBoundingClientRect: () => ({ top: 0 }), offsetTop: 0 };
        const scrollTargetY = target.id === 'checkout-section' ? target.offsetTop : 0;
        window.scrollTo({ top: scrollTargetY, behavior: 'smooth' });
        // esperar a que el usuario vea el scroll, luego simular pago
        setTimeout(() => {
            alert('Simulación de pago: Gracias por su compra.');
            clearCart();
            if (cartModal) cartModal.classList.add('hidden');
        }, 600);
    });

    // Cerrar modal al click fuera del contenido
    if (cartModal) {
        cartModal.addEventListener('click', e => {
            if (e.target === cartModal) cartModal.classList.add('hidden');
        });
    }

    renderCart();
});

// Efectos táctiles (press/pulse) para botones importantes
function addPressEffect(el) {
    if (!el) return;
    el.addEventListener('pointerdown', () => el.classList.add('pressed'));
    const clear = () => el.classList.remove('pressed');
    el.addEventListener('pointerup', clear);
    el.addEventListener('pointercancel', clear);
    el.addEventListener('pointerleave', clear);
}

function addPulseOnClick(el) {
    if (!el) return;
    el.addEventListener('click', () => {
        el.classList.remove('pulse');
        // forzar reflow para reiniciar la animación
        void el.offsetWidth;
        el.classList.add('pulse');
        setTimeout(() => el.classList.remove('pulse'), 500);
    });
}

// Ripple effect for buttons (better for tactile feedback)
function addRippleEffect(button) {
    if (!button) return;
    // ensure positioning
    if (getComputedStyle(button).position === 'static') button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.addEventListener('click', function (e) {
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 1.1;
        const span = document.createElement('span');
        span.className = 'ripple';
        // compute position relative to button
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        span.style.width = span.style.height = size + 'px';
        span.style.left = x + 'px';
        span.style.top = y + 'px';
        button.appendChild(span);
        // remove after animation
        setTimeout(() => {
            try { span.remove(); } catch (err) { if (span.parentNode) span.parentNode.removeChild(span); }
        }, 650);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // aplicar efecto al botón hamburguesa (si existe)
    const hamb = document.getElementById('hamburger-menu');
    if (hamb) addPressEffect(hamb);

    // aplicar efecto al botón de checkout (simulación) en el modal
    const checkout = document.getElementById('checkout-btn');
    if (checkout) {
        addPressEffect(checkout);
        addPulseOnClick(checkout);
    }

    // también aplicar al botón 'Ver carrito' para respuesta táctil
    const viewCartBtn = document.getElementById('view-cart-btn');
    if (viewCartBtn) addPressEffect(viewCartBtn);
});

// Aplicar efecto táctil global a todos los botones y pulso a botones 'Agregar'
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('button').forEach(btn => addPressEffect(btn));
    // aplicar ripple a botones de agregar
    document.querySelectorAll('.agregar-btn').forEach(btn => addRippleEffect(btn));
});