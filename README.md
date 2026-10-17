# MediQR — Medical Health Care Management System
### React (Vite) + Python Django REST Framework + Supabase PostgreSQL

A complete, secure, production-oriented Medical Health Care Management System built exclusively for:
1. **Hospital Registration & Profile Management**
2. **Patient Registration & Reference ID Allocation**
3. **Hospital Details Management (CRUD)**
4. **Dynamic Cryptographic QR Code Generation**
5. **High-Resolution ReportLab PDF Export**

---

## 1. System Architecture

```
[ React + Vite Frontend (Port 5173) ]
                 │
                 ▼  (HTTPS / JWT Bearer Tokens)
[ Django REST Framework API (Port 8000) ]
                 │
                 ▼  (Django ORM / SSL)
[ Supabase PostgreSQL Database ]
```

- **Frontend:** React 19, Vite, Tailwind CSS v4, Lucide Icons, React Router DOM, Axios, React Hook Form, Zod, QRCode.react.
- **Backend:** Python 3.14+, Django 6.1 / 5.1+, Django REST Framework, SimpleJWT (access + refresh tokens), Django CORS Headers, python-decouple, dj-database-url, psycopg2-binary, ReportLab, QRCode, Pillow.
- **Database:** Supabase PostgreSQL with SSL (falls back to local SQLite when `DATABASE_URL` is empty for rapid offline development).
- **Security:** Strict server-side RBAC (Hospital vs Patient), object-level record ownership, token rotation, password hashing, zero patient-data leakage in public QR scans.

---

## 2. Default Seed / Demo Accounts

| Role | Email | Password | Details |
|---|---|---|---|
| **Hospital** | `apollo@hospital.com` | `Password123!` | Apollo Specialty Hospital (Reg: `HOSP-TN-2024-8891`) |
| **Patient** | `john@patient.com` | `Password123!` | John Doe (Ref ID: `PAT-7E4A9B1C`) |

*(The Sign In page also includes one-click demo credentials fill buttons for instant testing).*

---

## 3. Quick Start Guide (Windows PowerShell)

### Prerequisites
- Python 3.10+ (or Python 3.14+)
- Node.js v18+ and npm

### Step 1: Start Backend (Django REST API)

```powershell
# Open a terminal in the project root:
cd "backend"

# If virtual environment is not already active:
.\venv\Scripts\Activate.ps1

# Run migrations (already generated for accounts, hospitals, patients, records):
python manage.py migrate

# Seed demo hospital and patient accounts:
python manage.py seed_demo_data

# Start the Django development server:
python manage.py runserver 127.0.0.1:8000
```
API Health Check is live at: `http://127.0.0.1:8000/`

### Step 2: Start Frontend (React + Vite)

```powershell
# In a second terminal window:
cd "frontend"

# Install dependencies if not already installed:
npm install

# Start Vite development server:
npm run dev -- --host 127.0.0.1 --port 5173
```
Frontend Web Portal is live at: `http://127.0.0.1:5173/`

---

## 4. Quick Start Guide (Linux / macOS)

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo_data
python manage.py runserver 127.0.0.1:8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 5. Supabase PostgreSQL Configuration

1. Log into your [Supabase Dashboard](https://supabase.com).
2. Create a new project or select an existing project.
3. Navigate to **Project Settings** → **Database** → **Connection String** → **URI**.
4. Select either **Transaction Pooler** (recommended for production) or **Direct Connection**:
   ```env
   # Transaction Pooler (Port 6543):
   DATABASE_URL=postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require

   # Or Direct Connection (Port 5432):
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?sslmode=require
   ```
5. Paste this connection string into `backend/.env`:
   ```ini
   DATABASE_URL=postgresql://postgres:yourpassword@db.yourref.supabase.co:5432/postgres?sslmode=require
   ```
6. Run migrations to provision tables in Supabase:
   ```bash
   python manage.py migrate
   python manage.py seed_demo_data
   ```

*(Note: When `DATABASE_URL` is empty, Django automatically uses `db.sqlite3` locally so you can develop and run test suites without an active internet connection).*

---

## 6. API Endpoints Reference

### Authentication (`/api/auth/`)
- `POST /api/auth/register/hospital/` — Register hospital user & create HospitalProfile.
- `POST /api/auth/register/patient/` — Register patient user, allocate unique Reference ID & create PatientProfile.
- `POST /api/auth/login/` — Authenticate and receive JWT access and refresh tokens.
- `POST /api/auth/token/refresh/` — Rotate and obtain fresh access token.
- `POST /api/auth/logout/` — Invalidate refresh token.
- `GET /api/auth/me/` — Retrieve authenticated user data and profile.
- `PUT /api/auth/me/` — Update user profile.
- `POST /api/auth/change-password/` — Change user password.
- `POST /api/auth/password-reset/` — Request password reset token.
- `POST /api/auth/password-reset/confirm/` — Reset password using token.

### Hospital Records (`/api/patient-hospital-records/`)
- `GET /api/patient-hospital-records/` — List records (strictly isolated to owner patient or matching hospital).
- `POST /api/patient-hospital-records/` — Create hospital record.
- `GET /api/patient-hospital-records/<uuid>/` — Retrieve authorized record.
- `PUT /api/patient-hospital-records/<uuid>/` — Update owned record.
- `DELETE /api/patient-hospital-records/<uuid>/` — Delete owned record.
- `GET /api/patient-hospital-records/dashboard-stats/` — Summary metrics for dashboard.

### Hospital Directory (`/api/hospitals/`)
- `GET /api/hospitals/` — Search & list verified hospital profiles.
- `GET /api/hospitals/me/` — Retrieve current hospital profile.
- `PUT /api/hospitals/me/` — Update current hospital profile.
- `GET /api/hospitals/<uuid>/` — View single hospital details.

### Patient Profile (`/api/patients/`)
- `GET /api/patients/me/` — Retrieve current patient profile with Reference ID.
- `PUT /api/patients/me/` — Update patient details.

### QR & PDF Engine (`/api/records/`)
- `GET /api/records/<uuid>/qr/` — Secure record QR payload and preview URLs.
- `GET /api/records/<uuid>/pdf/?download=0` — Inline ReportLab PDF certificate stream for browser preview.
- `GET /api/records/<uuid>/pdf/?download=1` — Binary ReportLab PDF file download (`attachment`).
- `GET /api/records/verify/<uuid>/` — **Public QR Scan Verification Target**: Verifies hospital credentials and active record status without disclosing private patient identity.

---

## 7. Automated Test Suite

A comprehensive test suite covering registration, JWT issuance, object-level isolation between patients, QR endpoints, and ReportLab PDF streaming is included.

Run tests:
```powershell
cd backend
.\venv\Scripts\python manage.py test accounts
```
Expected output:
```
Ran 7 tests in ~20s
OK
```

---

## 8. Production Deployment

### Frontend (e.g. Vercel / Netlify)
1. Set root directory to `frontend`.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set Environment Variable:
   - `VITE_API_URL=https://your-django-backend-domain.com/api`

### Backend (e.g. Render / Railway / AWS EC2)
1. Root directory: `backend`
2. Build command: `pip install -r requirements.txt && python manage.py migrate`
3. Start command: `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`
4. Environment variables in hosting dashboard:
   - `DJANGO_SECRET_KEY=...`
   - `DJANGO_DEBUG=False`
   - `DJANGO_ALLOWED_HOSTS=your-backend.com,localhost`
   - `DATABASE_URL=postgresql://...` (from Supabase)
   - `FRONTEND_URL=https://your-frontend.vercel.app`
   - `FRONTEND_APP_URL=https://your-frontend.vercel.app`
   - `JWT_SIGNING_KEY=...`
