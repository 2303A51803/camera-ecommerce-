const loginForm = document.getElementById('login-form');
const savePasswordBtn = document.getElementById('save-password');

let toastTimer = null;

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

if (loginForm) {
    loginForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();

        if (!email || !password) {
            showMessage('Please fill in all required fields.', 'error');
            return;
        }

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                showMessage(data.message || 'Login failed. Please check your credentials.', 'error');
                return;
            }

            localStorage.setItem('cameraStoreUser', JSON.stringify(data.user));
            showMessage(data.message || 'Login successful. Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 700);
        } catch (error) {
            console.error('Login error:', error);
            showMessage('Unable to connect to server. Please try again.', 'error');
        }
    });
}

if (savePasswordBtn) {
    savePasswordBtn.addEventListener('click', function () {
        showMessage('For security, use your browser or password manager to save credentials.', 'warning');
    });
}

