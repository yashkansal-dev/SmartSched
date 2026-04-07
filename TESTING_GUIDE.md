# SmartSched - Testing & Validation Guide

This guide verifies the current SmartSched stack end-to-end:

- Frontend: React + Vite + TypeScript
- Backend: Django + DRF
- Auth: JWT + optional Google OAuth
- Database: PostgreSQL / Neon

## Prerequisites

- Python 3.9+
- Node.js 18+
- PostgreSQL or Neon
- Google OAuth credentials only if you want to test Google sign-in

## 1) Backend Setup

### 1.1 Configure `.env`

Create `backend/.env` from `backend/.env.example` and set either `DATABASE_URL` or `DB_*` values.

Required key examples:

```env
DEBUG=True
SECRET_KEY=your-dev-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=postgresql://user:password@host/dbname
# or DB_NAME / DB_USER / DB_PASSWORD / DB_HOST / DB_PORT

# Optional Google OAuth
VITE_GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-google-client-secret

# Demo users
DEMO_DEFAULT_PASSWORD=demo123
```

### 1.2 Install and initialize

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data
python manage.py seed_demo_users
```

### 1.3 Run backend

```bash
python manage.py runserver
```

Expected: backend available at `http://localhost:8000`

---

## 2) Frontend Setup

### 2.1 Configure `.env`

Create root `.env` from `.env.example`.

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### 2.2 Install and run

```bash
npm install
npm run dev
```

Expected: frontend available at `http://localhost:5173`

---

## 3) Functional Tests

### 3.1 Demo login

Use any seeded account:

- `coordinator@smartsched.edu` / `demo123`
- `faculty@smartsched.edu` / `demo123`
- `student@smartsched.edu` / `demo123`
- `examiner@smartsched.edu` / `demo123`
- `hod@smartsched.edu` / `demo123`
- `principal@smartsched.edu` / `demo123`

Expected:

- Correct role dashboard opens
- JWT tokens are stored in localStorage
- `GET /api/auth/users/me/` succeeds with the returned access token

### 3.2 Optional Google sign-in

If configured, Google login should call:

- `POST /api/auth/google/`

Expected:

- Token is returned
- User profile is created or reused
- Dashboard opens normally

### 3.3 Connection status check

Use a management-role account such as `coordinator@smartsched.edu`.

Call:

```bash
curl http://localhost:8000/api/auth/connection-status/ \
  -H "Authorization: Bearer <access-token>"
```

Expected:

- `database: connected`
- user counts and role counts returned

### 3.4 Timetable APIs

Read access:

- `GET /api/timetable/faculties/`
- `GET /api/timetable/subjects/`
- `GET /api/timetable/sections/`
- `GET /api/timetable/timetable/`

Management actions (management roles only):

- `POST /api/timetable/timetable/generate/`
- `GET /api/timetable/timetable/export/?section_id=1`
- CSV upload: `POST /api/csv/upload/`

### 3.5 CSV upload

Upload the sample CSV files from `backend/sample_data/`:

- `faculties.csv`
- `subjects.csv`
- `sections.csv`

Expected:

- Import succeeds
- Records appear in Django admin
- Timetable generation can use the seeded data

---

## 4) API Smoke Tests

### Login

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"faculty@smartsched.edu","password":"demo123"}'
```

### Current user

```bash
curl http://localhost:8000/api/auth/users/me/ \
  -H "Authorization: Bearer <access-token>"
```

### Generate timetable

```bash
curl -X POST http://localhost:8000/api/timetable/timetable/generate/ \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d '{"section_id": 1}'
```

---

## 5) Validation checklist

- [ ] Backend starts without errors
- [ ] Frontend loads at `localhost:5173`
- [ ] Demo login works for at least one role
- [ ] Google OAuth works if configured
- [ ] Connection status endpoint returns `connected`
- [ ] CSV uploads succeed for management roles
- [ ] Timetable generation works
- [ ] Excel export downloads
- [ ] No browser console errors
- [ ] No backend terminal errors
