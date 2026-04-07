# SmartSched

SmartSched is a full-stack academic scheduling platform with role-based access for coordinators, faculty, students, exam in-charge, HOD, and principal.

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Backend:** Django + Django REST Framework
- **Auth:** JWT (SimpleJWT) + optional Google OAuth
- **Database:** PostgreSQL (local or hosted, e.g. Neon)

## Monorepo Structure

- `src/` → frontend app
- `backend/` → Django API + scheduling modules

## Quick Start

### 1) Frontend

1. Copy environment template:
   - `cp .env.example .env`
2. Install and run:
   - `npm install`
   - `npm run dev`

Frontend default URL: `http://localhost:5173`

### 2) Backend

1. Go to backend:
   - `cd backend`
2. Create/activate venv and install dependencies:
   - `python3 -m venv venv`
   - `source venv/bin/activate`
   - `pip install -r requirements.txt`
3. Copy backend env template:
   - `cp .env.example .env`
4. Update DB config in `backend/.env` (`DATABASE_URL` or `DB_*` values)
5. Run migrations and seed:
   - `python manage.py migrate`
   - `python manage.py seed_data`
   - `python manage.py seed_demo_users`
6. Start API server:
   - `python manage.py runserver`

Backend default URL: `http://localhost:8000`

## Demo Credentials (Seeded)

Password for all demo users: `demo123` (or `DEMO_DEFAULT_PASSWORD` from backend `.env`)

- `coordinator@smartsched.edu` → `tt_coordinator`
- `faculty@smartsched.edu` → `faculty`
- `student@smartsched.edu` → `student`
- `examiner@smartsched.edu` → `exam_incharge`
- `hod@smartsched.edu` → `hod`
- `principal@smartsched.edu` → `principal`

## API Highlights

- `POST /api/auth/login/` → credential login (email/password)
- `POST /api/auth/google/` → Google login (optional)
- `POST /api/auth/refresh/` → refresh JWT
- `GET /api/auth/users/me/` → current profile
- `GET /api/auth/connection-status/` → backend + DB status (management roles)

## Security Notes

- Do **not** commit real credentials in `.env`.
- Use `.env.example` as template and keep real secrets in local env or deployment secrets manager.
- Backend now enforces role-based permissions for sensitive endpoints.

## Current Status

- Frontend ↔ backend JWT auth integrated
- Role-based demo users seeded
- RBAC enforced server-side for sensitive management actions
- Automatic frontend token refresh on 401
