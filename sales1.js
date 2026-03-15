let cart = [];
let toastTimer = null;

const cartIcon = document.getElementById('cart-icon');
const cartCount = document.getElementById('cart-count');
const cartDetails = document.getElementById('cart-details');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');

function ensureToastContainer() {
    let toast = document.getElementById('app-toast');
    if (toast) {
        return toast;
    }

    const style = document.createElement('style');
    style.textContent = `
        .app-toast {
            position: fixed;
            right: 24px;
            bottom: 24px;
            max-width: 430px;
            background: #ffffff;
            color: #1f2937;
            border-left: 5px solid #1f2937;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
            border-radius: 8px;
            padding: 14px 16px;
            line-height: 1.45;
            opacity: 0;
            transform: translateY(16px);
            pointer-events: none;
            transition: opacity 0.25s ease, transform 0.25s ease;
            z-index: 9999;
        }

        .app-toast.show {
            opacity: 1;
            transform: translateY(0);
        }

        .app-toast.success {
            border-left-color: #1e8449;
        }

        .app-toast.warning {
            border-left-color: #d35400;
        }

        .app-toast.error {
            border-left-color: #c0392b;
        }
    `;
    document.head.appendChild(style);

    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'app-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);

    return toast;
}

function showMessage(message, type = 'warning') {
    const toast = ensureToastContainer();
    toast.textContent = message;
    toast.className = `app-toast ${type} show`;

    if (toastTimer) {
        clearTimeout(toastTimer);
    }

    toastTimer = setTimeout(() => {
        toast.className = 'app-toast';
    }, 4200);
}

function getLoggedInUser() {
    try {
        const userData = localStorage.getItem('cameraStoreUser');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('User parse error:', error);
        return null;
    }
}

function calculateCartTotal() {
    return cart.reduce((sum, product) => sum + Number(product.price), 0);
}

function updateCartIcon() {
    cartCount.textContent = cart.length;
    cartIcon.style.display = cart.length > 0 ? 'block' : 'none';
}

async function showCartDetails() {
    cartItemsContainer.innerHTML = '';
    const user = getLoggedInUser();
    if (!user || !user.id) {
        cartItemsContainer.innerHTML = '<p>Please log in to view your cart.</p>';
        cartTotal.textContent = 'Total: $0.00';
        return;
    }
    try {
        const res = await fetch(`/api/cart/${user.id}`);
        const data = await res.json();
        if (!res.ok || !Array.isArray(data.cart)) {
            cartItemsContainer.innerHTML = '<p>Could not load cart items.</p>';
            cartTotal.textContent = 'Total: $0.00';
            return;
        }
        if (data.cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
            cartTotal.textContent = 'Total: $0.00';
            return;
        }
        let total = 0;
        data.cart.forEach((item) => {
            total += Number(item.price) * Number(item.quantity);
            const productDiv = document.createElement('div');
            productDiv.classList.add('cart-item');
            productDiv.innerHTML = `
                <p>${item.item_name} - $${Number(item.price).toFixed(2)} x ${item.quantity}</p>
                <button type="button" onclick="removeFromCartDb(${item.id})">Remove</button>
            `;
            cartItemsContainer.appendChild(productDiv);
        });
        cartTotal.textContent = `Total: $${total.toFixed(2)}`;
    } catch (err) {
        cartItemsContainer.innerHTML = '<p>Error loading cart.</p>';
        cartTotal.textContent = 'Total: $0.00';
    }
}

async function addToCart(productName, price) {
    cart.push({ name: productName, price: Number(price) });
    updateCartIcon();
    showCartDetails();
    showMessage('Item added to cart.', 'success');

    // Store in database
    const user = getLoggedInUser();
    if (user && user.id) {
        try {
            await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    name: productName,
                    price: Number(price),
                    quantity: 1
                })
            });
        } catch (err) {
            console.error('Failed to store cart item in DB:', err);
        }
    }
}


async function removeFromCartDb(itemId) {
    try {
        await fetch(`/api/cart/${itemId}`, { method: 'DELETE' });
        showMessage('Item removed from cart.', 'success');
        showCartDetails();
    } catch (err) {
        showMessage('Failed to remove item from cart.', 'error');
    }
}

window.removeFromCartDb = removeFromCartDb;

async function confirmPurchase() {
    if (cart.length === 0) {
        showMessage('Your cart is empty. Please add at least one item.', 'error');
        return;
    }

    const user = getLoggedInUser();
    if (!user || !user.id) {
        showMessage('Please login first. Redirecting to login page...', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 900);
        return;
    }

    checkoutBtn.disabled = true;
    checkoutBtn.textContent = 'Processing...';

    try {
        const response = await fetch('/api/purchases/confirm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: user.id,
                items: cart.map((item) => ({
                    name: item.name,
                    price: item.price,
                    quantity: 1
                }))
            })
        });

        const data = await response.json();
        if (!response.ok) {
            showMessage(data.message || 'Unable to complete purchase.', 'error');
            return;
        }

        showMessage(`Purchase confirmed. Order #${data.purchaseId} saved to database.`, 'success');
        cart = [];
        updateCartIcon();
        showCartDetails();
    } catch (error) {
        console.error('Purchase error:', error);
        showMessage('Unable to connect to server. Please try again.', 'error');
    } finally {
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = 'Confirm Purchase';
    }
}

document.querySelectorAll('.add-to-cart').forEach((button) => {
    button.addEventListener('click', (event) => {
        const productCard = event.target.closest('.product-card');
        const productName = productCard.querySelector('h3').textContent;
        const price = parseFloat(productCard.querySelector('p').textContent.replace('$', ''));
        addToCart(productName, price);
    });
});

cartIcon.addEventListener('click', () => {
    const isHidden = cartDetails.style.display === 'none' || !cartDetails.style.display;
    cartDetails.style.display = isHidden ? 'block' : 'none';
    if (isHidden) {
        showCartDetails();
    }
});

checkoutBtn.addEventListener('click', confirmPurchase);
