# SmartSched Full-Stack Setup Guide

## Quick Start (5 minutes)

### Prerequisites
- Node.js 18+
- Python 3.9+
- PostgreSQL/Neon account
- Git

### Terminal 1: Frontend Setup
```bash
cd /path/to/SmartSched
npm install
npm run dev
```
Frontend runs at: `http://localhost:5173`

### Terminal 2: Backend Setup
```bash
cd /path/to/SmartSched/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env with your Neon PostgreSQL URL

python manage.py migrate
python manage.py seed_data
python manage.py runserver
```
Backend runs at: `http://localhost:8000`

---

## Full Installation Guide

### Part 1: Frontend Setup

#### 1.1 Install Dependencies
```bash
cd /path/to/SmartSched
npm install
```

#### 1.2 Update Environment Variables
Edit `./env`:
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

#### 1.3 Run Development Server
```bash
npm run dev
```
Access at: `http://localhost:5173`

#### 1.4 Build for Production
```bash
npm run build
```
Output in: `./dist/`

---

### Part 2: Backend Setup

#### 2.1 Create Virtual Environment
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

#### 2.2 Install Dependencies
```bash
pip install-r requirements.txt
```

Packages installed:
- Django 4.2.7
- djangorestframework 3.14.0
- psycopg2-binary (PostgreSQL driver)
- python-dotenv
- pandas (CSV parsing)
- openpyxl (Excel export)
- google-auth (OAuth)
- djangorestframework-simplejwt (JWT tokens)
- django-cors-headers

#### 2.3 Configure Database

**Option A: Use Neon (Recommended)**
1. Sign up at https://neon.tech
2. Create database
3. Copy connection string
4. Edit `.env`:
```env
DATABASE_URL=postgresql://user:password@host:port/dbname?sslmode=require
```

**Option B: Local PostgreSQL**
Edit `.env`:
```env
DB_NAME=smartsched
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

#### 2.4 Environment Configuration
Copy and edit the `.env`:
```bash
cp .env.example .env
```

**Required fields:**
```env
# Django
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1,localhost:8000

# Database
DATABASE_URL=postgresql://...

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-google-secret

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# JWT
JWT_ACCESS_LIFETIME=3600
JWT_REFRESH_LIFETIME=86400
```

#### 2.5 Run Migrations
```bash
python manage.py migrate
```

This creates all database tables.

#### 2.6 Seed Sample Data
```bash
python manage.py seed_data
```

Creates:
- 5 faculties
- 6 subjects  
- 3 sections

#### 2.7 Create Superuser (Optional)
```bash
python manage.py createsuperuser
```

#### 2.8 Run Development Server
```bash
python manage.py runserver
```

Backend runs at: `http://localhost:8000`  
Admin panel: `http://localhost:8000/admin/`

---

## Feature Integration Testing

### 1. Test Google OAuth
Frontend:
1. Go to http://localhost:5173
2. Click "Sign in with Google"
3. Select Google account
4. Should redirect to dashboard

Backend verification:
```bash
curl -X GET http://localhost:8000/api/auth/users/me/ \\
  -H "Authorization: Bearer <access-token>"
```

### 2. Test CSV Import
Frontend:
1. Navigate to a CSV upload component
2. Select CSV file (e.g., faculties.csv)
3. Click upload
4. Should show success message

Sample CSV formats:

**faculties.csv:**
```csv
name,email,department,max_hours_per_week
Dr. Sarah Johnson,sarah@university.edu,Computer Science,24
Prof. Michael Chen,michael@university.edu,Computer Science,24
```

**subjects.csv:**
```csv
name,code,subject_type,hours_per_week,faculty_email
Database Management,CS301,theory,4,sarah@university.edu
Web Development,IT401,lab,6,michael@university.edu
```

**sections.csv:**
```csv
name,semester,total_students
CSE-3A,3,50
CSE-3B,3,48
```

### 3. Test Timetable Generation
Frontend:
1. Navigate to "Timetable Generation"
2. Select a section
3. Click "Generate AI Timetable"
4. Should show generated schedule

Backend API:
```bash
curl -X POST http://localhost:8000/api/timetable/timetable/generate/ \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{"section_id": 1}'
```

### 4. Test Excel Export
Frontend:
1. After generating timetable
2. Click "Export"
3. Browser downloads Excel file

Backend API:
```bash
curl -X GET http://localhost:8000/api/timetable/timetable/export/?section_id=1 \\
  -H "Authorization: Bearer <token>" \\
  -o timetable.xlsx
```

---

## Project Structure

```
SmartSched/
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── services/         # API client (api.ts)
│   │   ├── contexts/         # AuthContext
│   │   ├── types/            # TypeScript interfaces
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── .env
│   └── index.html
│
├── backend/
│   ├── config/               # Django settings
│   │   ├── settings.py       # Main config
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── accounts/             # User auth app
│   │   ├── models.py         # CustomUser
│   │   ├── views.py          # Auth endpoints
│   │   └── serializers.py
│   ├── timetable/            # Timetable app
│   │   ├── models.py         # Faculty, Subject, Section, Timetable
│   │   ├── views.py          # CRUD + generation
│   │   ├── utils.py          # Scheduling algorithm
│   │   └── management/commands/
│   │       └── seed_data.py
│   ├── csv_handler/          # CSV import app
│   │   ├── models.py         # CSVUpload
│   │   ├── views.py          # Upload endpoint
│   │   └── utils.py          # CSV parser
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env
│   └── README.md
│
└── README.md
```

---

## Common Issues & Solutions

### Issue: Port Already in Use
```bash
# Find and kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Find and kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Issue: CORS Errors
Solution: Update `backend/.env`:
```env
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```
Then restart backend.

### Issue: Database Connection Failed
```bash
# Check environment variable
echo $DATABASE_URL

# Test connection
python -c "import psycopg2; conn = psycopg2.connect('$DATABASE_URL'); print('OK')"
```

### Issue: Migrations Failed
```bash
# Reset migrations (development only!)
python manage.py migrate accounts zero
python manage.py migrate
```

### Issue: Frontend Can't Reach Backend
Check:
1. Backend is running: `http://localhost:8000/`
2. VITE_API_BASE_URL is correct in `.env`
3. No CORS errors in browser console
4. Restart frontend: `npm run dev`

### Issue: Google OAuth Not Working
Check:
1. `VITE_GOOGLE_CLIENT_ID` in frontend `.env`
2. `VITE_GOOGLE_CLIENT_ID` in backend `.env`
3. Redirect URI registered in Google Cloud Console
4. Restart both servers

---

## Deployment

### Frontend Deployment (Netlify/Vercel)

```bash
# Build
npm run build

# Deploy dist/ folder to Netlify/Vercel
```

Update `VITE_API_BASE_URL` in production environment variables to production backend URL.

### Backend Deployment (Render/Railway/Heroku)

```bash
# Set environment variables on platform
DEBUG=False
SECRET_KEY=<generate-new>
DATABASE_URL=<production-url>
ALLOWED_HOSTS=yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com

# Deploy backend folder
```

### Using Docker

**Dockerfile (backend):**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
```

**Build and run:**
```bash
docker build -t smartsched-backend .
docker run -p 8000:8000 -e DATABASE_URL=... smartsched-backend
```

---

## Next Steps

1. **Test CSV Import**: Upload sample CSV files
2. **Generate Timetables**: Create schedules for sections
3. **Export Timetables**: Download Excel files
4. **User Roles**: Test different role permissions
5. **Performance**: Load test with large datasets

---

## Documentation

- **Backend API**: See `backend/README.md`
- **Frontend Components**: Check component comments
- **Database Schema**: Look at `backend/timetable/models.py`

---

## Support & Troubleshooting

1. Check Django logs: `python manage.py runserver 2>&1 | tee debug.log`
2. Check frontend console: DevTools (F12)
3. Access admin: `http://localhost:8000/admin/`
4. Check API endpoints: `http://localhost:8000/api/`

---

**Status**: ✅ Full-stack integration complete  
**Last Updated**: March 31, 2026  
**Version**: 1.0.0
