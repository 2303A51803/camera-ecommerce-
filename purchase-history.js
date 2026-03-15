const historyContent = document.getElementById('history-content');
const refreshBtn = document.getElementById('refresh-history');
const toast = document.getElementById('toast');

let toastTimer = null;

function showMessage(message, type = 'error') {
    toast.textContent = message;
    toast.className = `toast ${type} show`;

    if (toastTimer) {
        clearTimeout(toastTimer);
    }

    toastTimer = setTimeout(() => {
        toast.className = 'toast';
    }, 4200);
}

function getLoggedInUser() {
    try {
        const data = localStorage.getItem('cameraStoreUser');
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('User parse error:', error);
        return null;
    }
}

function formatDate(value) {
    return new Date(value).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function renderHistory(purchases) {
    if (!Array.isArray(purchases) || purchases.length === 0) {
        historyContent.innerHTML = `
            <div class="empty-state">
                <h3>No purchases found</h3>
                <p>You have not purchased any camera items yet.</p>
            </div>
        `;
        return;
    }

    historyContent.innerHTML = purchases.map((purchase) => {
        const itemsRows = purchase.items.map((item) => `
            <tr>
                <td>${item.name}</td>
                <td>$${Number(item.price).toFixed(2)}</td>
                <td>${item.quantity}</td>
                <td>$${Number(item.lineTotal).toFixed(2)}</td>
            </tr>
        `).join('');

        return `
            <div class="purchase-card">
                <div class="purchase-header">
                    <div><strong>Order #${purchase.purchaseId}</strong></div>
                    <div><strong>Status:</strong> ${purchase.status}</div>
                    <div><strong>Date:</strong> ${formatDate(purchase.createdAt)}</div>
                    <div><strong>Total:</strong> $${Number(purchase.totalAmount).toFixed(2)}</div>
                </div>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Price</th>
                            <th>Qty</th>
                            <th>Line Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsRows}
                    </tbody>
                </table>
            </div>
        `;
    }).join('');
}

async function loadPurchaseHistory() {
    const user = getLoggedInUser();
    if (!user || !user.id) {
        showMessage('Please login first. Redirecting to login page...', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 900);
        return;
    }

    try {
        historyContent.innerHTML = '<div class="empty-state"><p>Loading purchase history...</p></div>';

        const response = await fetch(`/api/purchases/history/${user.id}`);
        const data = await response.json();

        if (!response.ok) {
            showMessage(data.message || 'Unable to fetch purchase history.', 'error');
            historyContent.innerHTML = '<div class="empty-state"><p>Unable to load purchase history.</p></div>';
            return;
        }

        renderHistory(data.purchases || []);
        showMessage('Purchase history loaded successfully.', 'success');
    } catch (error) {
        console.error('Purchase history load error:', error);
        showMessage('Unable to connect to server. Please try again.', 'error');
        historyContent.innerHTML = '<div class="empty-state"><p>Unable to load purchase history.</p></div>';
    }
}

refreshBtn.addEventListener('click', loadPurchaseHistory);
loadPurchaseHistory();
