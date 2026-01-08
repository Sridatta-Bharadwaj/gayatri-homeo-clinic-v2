# Homeopathy Practice Management System

Complete offline-first patient management system for homeopathy clinics.

## 📋 Features

- **Patient Management** - Complete CRUD operations with search and sorting
- **Visit Tracking** - Full medical history with editable records
- **Dashboard Analytics** - Patient statistics, top complaints, age distribution
- **PDF Generation** - Prescriptions, medical certificates, and visit reports
- **Settings Management** - Customizable clinic information and letterhead
- **Dark Mode** - Persistent theme preference
- **Offline-First** - All data stored locally on the clinic laptop

---

## 🛠 Tech Stack

### Backend
- **Flask 3.0** - Web framework
- **SQLAlchemy 3.1** - ORM
- **PostgreSQL** - Production database
- **psycopg v3** - PostgreSQL adapter
- **ReportLab** - PDF generation
- **Flask-CORS** - Cross-origin support

### Frontend
- **React 18** - UI framework
- **Vite 5** - Build tool
- **React Router v6** - Routing
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Zustand** - State management
- **@react-pdf/renderer** - PDF generation
- **Axios** - HTTP client

---

## 📦 Prerequisites

### Required Software

1. **PostgreSQL 15 or 16**
   - Download: https://www.postgresql.org/download/
   - Includes pgAdmin (GUI tool)

2. **Python 3.11 or 3.12**
   - Download: https://www.python.org/downloads/
   - ⚠️ **Note:** Python 3.13 is not recommended (compatibility issues)

3. **Node.js 18+**
   - Download: https://nodejs.org/

---

## 🚀 Installation & Setup

### Step 1: PostgreSQL Setup

#### 1.1 Install PostgreSQL
- Run the installer
- Remember the `postgres` superuser password
- Keep default port: `5432`

#### 1.2 Create Database

**Option A: Using pgAdmin (Recommended)**
1. Open pgAdmin
2. Connect to PostgreSQL Server
3. Right-click "Databases" → Create → Database
4. Name: `homeopathy_db`
5. Save

**Option B: Using Command Line**
```bash
psql -U postgres
CREATE DATABASE homeopathy_db;
CREATE USER homeopathy_user WITH PASSWORD 'your_password';
\q
```

#### 1.3 Grant Permissions

In pgAdmin Query Tool or psql:
```sql
\c homeopathy_db

GRANT ALL PRIVILEGES ON DATABASE homeopathy_db TO homeopathy_user;
GRANT USAGE ON SCHEMA public TO homeopathy_user;
GRANT CREATE ON SCHEMA public TO homeopathy_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO homeopathy_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO homeopathy_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO homeopathy_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO homeopathy_user;

ALTER DATABASE homeopathy_db OWNER TO homeopathy_user;
```

---

### Step 2: Backend Setup

#### 2.1 Navigate to Backend
```bash
cd backend
```

#### 2.2 Create Virtual Environment
```bash
python -m venv venv
```

#### 2.3 Activate Virtual Environment
- **Windows:** `venv\Scripts\activate`
- **Linux/Mac:** `source venv/bin/activate`

#### 2.4 Install Dependencies
```bash
pip install -r requirements.txt
```

#### 2.5 Configure Environment Variables

Create a `.env` file in the `backend` folder:

```env
# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=homeopathy_db
DB_USER=homeopathy_user
DB_PASSWORD=your_password_here

# Flask Configuration
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
```

**⚠️ Important:**
- Replace `your_password_here` with your actual PostgreSQL password
- Replace `your-secret-key-here` with a random secret key
- Never commit `.env` to version control (already in `.gitignore`)

**Generate a secret key:**
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

#### 2.6 Initialize Database Tables
```bash
python -c "from app import create_app; from app.models import db; app = create_app(); app.app_context().push(); db.create_all(); print('✓ Database initialized!')"
```

#### 2.7 Start Backend Server
```bash
python run.py
```

Backend will run on **http://localhost:5000**

---

### Step 3: Frontend Setup

#### 3.1 Navigate to Frontend
```bash
cd frontend
```

#### 3.2 Install Dependencies
```bash
npm install
```

#### 3.3 Add Logo (Required)
Place your clinic logo as `logo.png` in the `frontend/public/` folder.

#### 3.4 Start Development Server
```bash
npm run dev
```

Frontend will run on **http://localhost:5173**

---

## 🎯 Usage

1. **Start Backend** - `cd backend && venv\Scripts\activate && python run.py`
2. **Start Frontend** - `cd frontend && npm run dev`
3. **Open Browser** - Navigate to http://localhost:5173
4. **Configure Settings** - Go to Settings page to add clinic details

---

## 📁 Project Structure

```
homeopathy-system/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # Flask app + PostgreSQL config
│   │   ├── models.py            # SQLAlchemy models (Patient, Visit, Settings)
│   │   ├── routes/              # API endpoints
│   │   │   ├── patients.py      # Patient CRUD
│   │   │   ├── visits.py        # Visit management
│   │   │   ├── analytics.py     # Dashboard stats
│   │   │   ├── reports.py       # PDF generation
│   │   │   └── settings.py      # Settings management
│   │   └── utils/
│   │       └── pdf_generator.py # PDF utilities
│   ├── static/                  # Uploaded files (letterhead)
│   ├── .env                     # Environment variables (NOT in Git)
│   ├── .env.example             # Template for .env
│   ├── requirements.txt         # Python dependencies
│   └── run.py                   # Entry point
│
├── frontend/
│   ├── public/
│   │   └── logo.png            # Clinic logo (REQUIRED)
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── ui/            # shadcn/ui components
│   │   │   ├── layout/        # Header, Navbar
│   │   │   ├── patients/      # Patient components
│   │   │   └── visits/        # Visit components
│   │   ├── pages/             # Page components
│   │   ├── lib/               # Utilities (API client)
│   │   ├── store/             # Zustand stores
│   │   └── App.jsx            # Main app component
│   └── package.json
│
├── homeopathy_mvp_final.md    # Complete MVP specification
└── README.md                  # This file
```

---

## 🔧 Configuration

### Database Configuration
All database settings are in `backend/.env`:
- `DB_HOST` - PostgreSQL server address (default: localhost)
- `DB_PORT` - PostgreSQL port (default: 5432)
- `DB_NAME` - Database name
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password

### Clinic Settings
Configure from the Settings page in the app:
- Clinic Name (default: "Gayatri Homeo Clinic")
- Clinic Address
- Contact Information
- Doctor Registration Number
- Doctor Qualifications
- Letterhead Image (for medical certificates)

---

## 🌐 API Endpoints

Base URL: `http://localhost:5000/api`

### Patients
- `GET /patients` - List all patients (search, sort)
- `GET /patients/:id` - Get patient details with latest visit
- `POST /patients` - Create new patient
- `PUT /patients/:id` - Update patient
- `DELETE /patients/:id` - Delete patient (cascades to visits)

### Visits
- `GET /patients/:patient_id/visits` - All visits for patient
- `GET /visits/:id` - Get single visit
- `POST /patients/:patient_id/visits` - Create visit
- `PUT /visits/:id` - Update visit

### Analytics
- `GET /analytics/dashboard` - Dashboard statistics

### Reports
- `POST /reports/patient/:patient_id` - Patient report PDF
- `POST /reports/certificate` - Medical certificate PDF
- `POST /reports/prescription/:visit_id` - Prescription PDF

### Settings
- `GET /settings` - Get all settings
- `PUT /settings/:key` - Update setting
- `POST /settings/letterhead` - Upload letterhead image

---

## 🐛 Troubleshooting

### Database Connection Error

**Error:** `could not connect to server`

**Solution:**
1. Ensure PostgreSQL service is running (Windows Services)
2. Verify credentials in `.env` file
3. Check database exists: `psql -U postgres -l`

### Permission Denied Error

**Error:** `permission denied for schema public`

**Solution:** Run the permission grant commands from Step 1.3

### ModuleNotFoundError: psycopg

**Error:** `No module named 'psycopg'`

**Solution:**
```bash
pip install "psycopg[binary]>=3.1.0"
```

### Python Version Issues

**Error:** `Microsoft Visual C++ 14.0 required`

**Solution:** Use Python 3.11 or 3.12 (not 3.13)

### Logo Not Appearing

**Solution:** Ensure `logo.png` exists in `frontend/public/` folder

---

## 🏭 Production Deployment

For deployment on the clinic laptop:

### 1. Build Frontend
```bash
cd frontend
npm run build
```

### 2. Configure for Production
Update `.env`:
```env
FLASK_ENV=production
```

### 3. Run Backend
```bash
cd backend
venv\Scripts\activate
python run.py
```

### 4. Access Application
Open browser to `http://localhost:5173` (if using dev server) or configure Flask to serve the built frontend.

---

## 📊 Database Schema

### Patients Table
- Patient ID (auto-generated: P-001, P-002...)
- Personal Information (name, DOB, age, gender, contact)
- Medical History (allergies, chronic conditions, current medications)
- Emergency Contact Information

### Visits Table
- Visit Date
- Chief Complaint
- Symptoms
- Examination Findings
- Diagnosis
- Prescription (free text)
- Follow-up Date
- Doctor's Notes
- Edit History (last_edited_at timestamp)

### Settings Table
- Key-value pairs for clinic configuration
- Clinic information
- Doctor credentials
- Letterhead path

---

## 🔒 Security Notes

- `.env` file is gitignored - never commit it
- Database credentials stored in environment variables
- All data stored locally - no cloud sync
- URL encoding applied to handle special characters in passwords

---

## 📝 Important Notes

1. **Logo Required:** Place `logo.png` in `frontend/public/` before running
2. **Letterhead Optional:** Upload from Settings page for medical certificates
3. **Patient ID:** Auto-generated in format P-001, P-002, etc.
4. **Age Calculation:** Always calculated from date of birth (not stored)
5. **Visit Editing:** Updates `last_edited_at` timestamp automatically
6. **Dark Mode:** Preference persists via localStorage
7. **Search:** Case-insensitive search by name, patient ID, or phone
8. **Sorting:** By name, patient ID, or creation date

---

## 📞 Support

For detailed MVP specifications, see [homeopathy_mvp_final.md](./homeopathy_mvp_final.md)

---

## 📄 License

Private use for Gayatri Homeo Clinic

---

## ✅ Quick Start Checklist

- [ ] PostgreSQL installed and running
- [ ] Database `homeopathy_db` created
- [ ] User `homeopathy_user` created with permissions
- [ ] Python 3.11/3.12 installed
- [ ] Backend `.env` file configured
- [ ] Backend dependencies installed
- [ ] Database tables initialized (`db.create_all()`)
- [ ] Logo placed in `frontend/public/logo.png`
- [ ] Frontend dependencies installed
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Application accessible in browser

---

**Built with ❤️ for Gayatri Homeo Clinic**
