# SmartSched - Quick Troubleshooting Reference

## Error by Component

### Authentication Errors

#### Error: "Invalid Google Token"
```
Status: 400
Message: "Invalid Google token"
```
- **Cause**: GOOGLE_CLIENT_ID mismatch or token expired
- **Fix**: 
  - Verify VITE_GOOGLE_CLIENT_ID matches in frontend/.env
  - Verify GOOGLE_CLIENT_ID matches in backend/.env
  - Google ID tokens expire in 1 hour
  - Ensure Google OAuth app is authorized in Google Cloud Console

#### Error: "CORS Error: No 'Access-Control-Allow-Origin'"
```
Browser console: CORS policy: No 'Access-Control-Allow-Origin' header
```
- **Cause**: Backend CORS not configured for frontend URL
- **Fix**:
  ```python
  # backend/config/settings.py
  CORS_ALLOWED_ORIGINS = [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://yourdomain.com",
  ]
  ```
- **Verify**: Restart backend server after changing

#### Error: "401 Unauthorized"
```
Status: 401
Message: "Authentication credentials were not provided"
```
- **Cause**: JWT token missing or expired
- **Fix**: 
  - Check localStorage has access_token (DevTools → Application → localStorage)
  - If expired, use refresh_token to get new access_token
  - Login again to get fresh tokens

---

### CSV Upload Errors

#### Error: "Invalid CSV Format"
```
Status: 400
Message: "Column 'email' not found"
```
- **Cause**: CSV headers don't match expected columns
- **Fix**: Verify exact column names (case-sensitive):
  - **Faculty CSV**: name, email, department, max_hours_per_week
  - **Subject CSV**: name, code, subject_type, hours_per_week, faculty_email
  - **Section CSV**: name, semester, total_students

#### Error: "Faculty not found" (when uploading subjects)
```
Status: 404
Message: "Faculty with email 'john@edu.com' not found"
```
- **Cause**: faculty_email in CSV doesn't exist in database
- **Fix**:
  1. First upload faculties CSV
  2. Verify email addresses match exactly
  3. Check database: Django admin → Faculties

#### Error: "Duplicate entry"
```
Status: 400
Message: "Subject with code 'CS301' already exists"
```
- **Cause**: Attempting to import duplicate data
- **Fix**:
  - Delete existing data in Django admin if re-importing
  - Or modify CSV to use different codes/names

---

### Timetable Generation Errors

#### Error: "No feasible timetable found"
```
Status: 400
Message: "Could not generate timetable after maximum attempts"
```
- **Cause**: Constraints too tight (impossible schedule)
- **Fixes**:
  1. Reduce max_hours_per_week for faculties
  2. Reduce hours_per_week for subjects
  3. Add more time slots (modify TIME_SLOTS in utils.py)
  4. Assign subjects to more faculties (reduce per-faculty load)

#### Error: "Timetable generation timeout"
```
Status: 504
Message: "Gateway Timeout"
```
- **Cause**: Algorithm takes too long for large dataset
- **Fixes**:
  1. Increase timeout in nginx/gunicorn config (60s → 120s)
  2. Optimize database queries (add indexes)
  3. Use smaller sections for testing

---

### Database Connection Errors

#### Error: "psycopg2.OperationalError: could not connect to server"
```
psycopg2.OperationalError: could not connect to server: 
    No such file or directory
        Is the server running on host "localhost" (127.0.0.1)?
```
- **Cause**: Neon PostgreSQL not accessible
- **Fixes**:
  1. Check DATABASE_URL format: `postgresql://user:password@host/dbname`
  2. Verify host is correct (neon.tech endpoint)
  3. Check network: `ping host.neon.tech`
  4. Verify credentials in Neon console
  5. Check IP whitelist in Neon (usually allows all by default)

#### Error: "ProgrammingError: relation 'timetable_faculty' does not exist"
```
django.db.utils.ProgrammingError: relation "timetable_faculty" does not exist
```
- **Cause**: Migrations not applied
- **Fix**:
  ```bash
  python manage.py migrate
  python manage.py migrate timetable
  python manage.py migrate accounts
  python manage.py migrate csv_handler
  ```

#### Error: "Integrity Constraint Violation"
```
IntegrityError: duplicate key value violates unique constraint "timetable_faculty_uc"
```
- **Cause**: Trying to create duplicate timetable entry (same time, room, faculty)
- **Fix**:
  1. Check algorithm doesn't have duplicate loop (utils.py)
  2. Clear timetable table: Django admin → delete all entries
  3. Regenerate timetable

---

### Frontend Issues

#### Issue: Components not rendering
```
Blank page or no content visible
```
- **Cause**: React app not loading correctly
- **Fixes**:
  1. Check console (F12 → Console tab) for errors
  2. Verify Vite dev server running: `npm run dev`
  3. Check VITE_API_BASE_URL in .env is correct
  4. Clear browser cache (Ctrl+Shift+Delete)

#### Issue: API responses don't appear
```
Loading spinner spins forever
```
- **Cause**: API call hanging or network error
- **Fixes**:
  1. Check backend is running: `curl http://localhost:8000/api/`
  2. Check network tab in DevTools (F12 → Network)
  3. Look for 504/500 errors
  4. Check backend logs for exceptions

#### Issue: Dark mode / styling broken
```
CSS not loading, page looks unstyled
```
- **Cause**: Tailwind CSS not built
- **Fix**:
  ```bash
  npm run build
  npm run dev
  ```

---

### Deployment Issues

#### Issue: Application crashes on production
```
Error logs: ModuleNotFoundError, ImportError
```
- **Cause**: Dependencies not installed
- **Fix**:
  ```bash
  # Ensure requirements.txt has all packages
  pip freeze > requirements.txt
  # Deploy with requirements.txt
  pip install -r requirements.txt
  ```

#### Issue: "DEBUG=True" warning in logs
```
WARNING: DEBUG is True. Set to False in production
```
- **Cause**: Security issue
- **Fix**: In deployed backend/.env:
  ```
  DEBUG=False
  ```

#### Issue: Static files 404 in production
```
404 Not Found for /static/app.js
```
- **Cause**: Static files not collected
- **Fix** (for Render.com deployment):
  ```bash
  python manage.py collectstatic --noinput
  ```

---

## Common Solutions Quick Reference

| Problem | Command to Fix |
|---------|----------------|
| Backend not responding | `python manage.py runserver` |
| Frontend not starting | `npm install && npm run dev` |
| Database connection failed | `cat backend/.env \| grep DATABASE_URL` |
| Migrations pending | `python manage.py migrate` |
| Need test data | `python manage.py seed_data` |
| Clear database | `python manage.py reset_db --noinput` (requires django-extensions) |
| Check imports | `python -m import backend.config` |
| Python version issue | `python --version` (need 3.9+) |

---

## Debugging Checklist

When troubleshooting, check in order:

- [ ] **Network**: Is backend/frontend running? `curl http://localhost:8000/` and visit http://localhost:5173/
- [ ] **Environment**: Are .env files configured? `cat backend/.env` and `cat .env`
- [ ] **Dependencies**: Are packages installed? `pip list` and `npm list`
- [ ] **Database**: Can you connect? `python manage.py shell` should work
- [ ] **Migrations**: Have all run? `python manage.py migrate --plan`
- [ ] **Logs**: What errors appear? Check terminal for backend, DevTools for frontend
- [ ] **Ports**: Are ports free? `lsof -i :8000` and `lsof -i :5173` (macOS/Linux)
- [ ] **CORS**: Is origin whitelisted? Check CORS_ALLOWED_ORIGINS in settings.py
- [ ] **Tokens**: Is JWT valid? `base64 -d <<< "token_payload"` to decode
- [ ] **Firewall**: Can you reach external services? `nc -zv host port`

---

## Getting More Help

1. **Check backend logs**: Terminal where you ran `python manage.py runserver`
2. **Check frontend logs**: Browser DevTools (F12)
3. **Check server logs** (production): 
   - Render.com: Logs tab in dashboard
   - Vercel: Deployments → Logs
   - Netlify: Deploys → Logs
4. **Django debug toolbar**: Add to INSTALLED_APPS (development only)
5. **API testing**: Use curl/Postman to isolate issues

---

## Performance Optimization

Run these if system is slow:

```bash
# 1. Check database queries
python manage.py shell
from django.db import connection
from django.db.connection import CursorDebugWrapper
# Generate timetable and check:
print(len(connection.queries))  # Number of queries
print(connection.queries[-1]['time'])  # Last query time

# 2. Add database indexes
# In timetable/models.py, add Meta:
class Meta:
    indexes = [
        models.Index(fields=['section', 'day']),
        models.Index(fields=['faculty', 'day']),
    ]

# 3. Enable query caching
# Install django-cachalot: pip install django-cachalot
```

---

Last updated: 2024
