# Camera Store Backend + Database Setup

## 1) What was added
- `backend/server.js` → Express API server
- `backend/db.js` → SQLite database initialization
- `backend/package.json` → backend dependencies and scripts
- Frontend connected:
  - `register.html` via `reglog1.js` to `POST /api/auth/register`
  - `login.html` via `log.js` to `POST /api/auth/login`

## 2) Install backend dependencies
Open terminal in project root and run:

```powershell
cd backend
npm install
```

## 3) Start backend server

```powershell
npm start
```

Server runs at:
- `http://localhost:3000`

## 4) Open frontend correctly (important)
Do **not** open HTML files directly with `file:///...`.
Open through the backend server so API calls work:

- `http://localhost:3000/index.html`
- `http://localhost:3000/register.html`
- `http://localhost:3000/login.html`

## 5) How frontend links to backend
In browser JS:
- Register sends `fetch('/api/auth/register', { method: 'POST', ... })`
- Login sends `fetch('/api/auth/login', { method: 'POST', ... })`

Because frontend and backend use same origin (`localhost:3000`), no CORS setup is needed right now.

## 6) Database details
- SQLite file is auto-created at: `backend/data/store.db`
- Current table:
  - `users (id, name, email, password_hash, created_at)`

## 7) Recommended next backend additions
1. Add JWT authentication for protected routes.
2. Add `products` and `cart_items` tables.
3. Create APIs:
   - `GET /api/products`
   - `POST /api/cart`
   - `GET /api/cart/:userId`
4. Replace `alert()` messages with inline UI notifications.
5. Add validation + rate limiting for security.

## 8) Rental confirmation + reminder emails (new)
The backend now supports:
- Rental confirmation API: `POST /api/rentals/confirm`
- Professional confirmation email (includes return deadline and damage policy)
- Automatic "rental ending soon" reminder email to registered users

To enable email sending, configure SMTP environment variables before `npm start`:

```powershell
$env:SMTP_HOST="smtp.gmail.com"
$env:SMTP_PORT="587"
$env:SMTP_SECURE="false"
$env:SMTP_USER="your-email@example.com"
$env:SMTP_PASS="your-app-password"
$env:EMAIL_FROM="Camera Store <your-email@example.com>"
npm start
```

If SMTP is not configured, rental confirmation still works, but emails are skipped.

## 9) MySQL setup for camera purchase storage (new)
Camera **buy** details are now saved in MySQL through:
- `POST /api/purchases/confirm`
- `GET /api/purchases/history/:userId`

The backend auto-creates these MySQL tables:
- `purchases`
- `purchase_items`

Set MySQL environment variables before starting backend:

```powershell
$env:MYSQL_HOST="localhost"
$env:MYSQL_PORT="3306"
$env:MYSQL_USER="root"
$env:MYSQL_PASSWORD="your_mysql_password"
$env:MYSQL_DATABASE="camera_store"
npm start
```

If MySQL is not configured, purchase API will return a clear service-unavailable message.

Frontend page for users:
- `http://localhost:3000/purchase-history.html`
