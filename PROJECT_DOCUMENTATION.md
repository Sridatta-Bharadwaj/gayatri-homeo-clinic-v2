# Gayatri Homeo Clinic Management System
## Complete Project Documentation v2.0

**Last Updated**: January 14, 2026  
**Status**: Production Ready  
**Type**: Full-Stack Web Application  

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Architecture](#architecture)
5. [Authentication & Authorization](#authentication--authorization)
6. [Access Control System](#access-control-system)
7. [Database Schema](#database-schema)
8. [API Documentation](#api-documentation)
9. [Setup & Installation](#setup--installation)
10. [User Roles & Permissions](#user-roles--permissions)
11. [Security Features](#security-features)
12. [Testing](#testing)

---

## 📖 Project Overview

A comprehensive offline-first patient management system designed specifically for homeopathy clinics. The system provides complete patient record management, visit tracking, prescription generation, and multi-doctor collaboration with role-based access control.

### Key Highlights
- **Multi-user Support**: Admin and Doctor roles with distinct permissions
- **Patient Access Control**: Doctors can only see patients they created or have been shared with
- **Secure Authentication**: Flask-Login based session management
- **Collaborative Features**: Share patient records between doctors
- **PDF Generation**: Automated prescription and report generation
- **Offline-First**: All data stored locally on clinic laptop
- **Dark Mode**: Persistent theme preference

---

## ✨ Features

### Core Features
- ✅ **Patient Management**: Complete CRUD with search, sort, and filtering
- ✅ **Visit Tracking**: Full medical history with editable records
- ✅ **Dashboard Analytics**: Statistics, top complaints, age distribution
- ✅ **PDF Generation**: Prescriptions, certificates, and reports
- ✅ **Settings Management**: Customizable clinic information

### Advanced Features (v2.0)
- ✅ **Authentication System**: Secure login/logout with session management
- ✅ **User Management**: Admin can create/edit/delete doctor accounts
- ✅ **Role-Based Access Control**: Admin, Doctor, and Staff roles
- ✅ **Patient Access Control**: Isolation between doctors' patients
- ✅ **Patient Sharing**: Share specific patients with other doctors
- ✅ **Access Revocation**: Remove shared access anytime
- ✅ **Admin Bypass**: Admins can access all patients
- ✅ **Audit Trail**: Track who created and who has access to each patient

---

## 🛠 Technology Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Flask | 3.0+ | Web framework |
| Flask-Login | 0.6.3 | Authentication |
| SQLAlchemy | 3.1+ | ORM |
| PostgreSQL | 15/16 | Database |
| psycopg | 3.1+ | PostgreSQL adapter |
| ReportLab | 4.0+ | PDF generation |
| Flask-CORS | 4.0+ | Cross-origin support |
| Werkzeug | 3.0+ | Password hashing |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2+ | UI framework |
| Vite | 5.0+ | Build tool |
| React Router | 6.20+ | Routing |
| Tailwind CSS | 3.4+ | Styling |
| shadcn/ui | Latest | UI components |
| Zustand | 4.4+ | State management |
| Axios | 1.6+ | HTTP client |
| Radix UI | Latest | Dialog components |
| Lucide React | Latest | Icons |

---

## 🏗 Architecture

### System Architecture
```
┌─────────────────────────────────────────────────────┐
│                   Client Browser                     │
│              (React + Tailwind + Zustand)           │
└──────────────────┬──────────────────────────────────┘
                   │ HTTP/REST API
                   │ Session Cookies
┌──────────────────▼──────────────────────────────────┐
│               Flask Backend                          │
│  ┌────────────────────────────────────────────┐    │
│  │  Authentication Layer (Flask-Login)        │    │
│  └────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────┐    │
│  │  Access Control Layer                      │    │
│  └────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────┐    │
│  │  Business Logic (Routes + Models)          │    │
│  └────────────────────────────────────────────┘    │
└──────────────────┬──────────────────────────────────┘
                   │ SQLAlchemy ORM
┌──────────────────▼──────────────────────────────────┐
│            PostgreSQL Database                       │
│  Tables: users, patients, visits, patient_access,   │
│          settings                                    │
└─────────────────────────────────────────────────────┘
```

### Frontend Architecture
```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── layout/          # Header, navigation
│   ├── SharePatientDialog.jsx
│   ├── PatientAccessList.jsx
│   ├── AddUserDialog.jsx
│   ├── AdminRoute.jsx
│   └── ProtectedRoute.jsx
├── pages/               # Route pages
│   ├── LoginPage.jsx
│   ├── SetupPage.jsx
│   ├── UsersPage.jsx
│   ├── PatientDetailPage.jsx
│   └── ...
├── store/               # Zustand state
│   ├── authStore.js
│   └── themeStore.js
└── lib/
    └── api.js           # Axios instance + API functions
```

### Backend Architecture
```
backend/
├── app/
│   ├── __init__.py          # Flask app + Login Manager
│   ├── models.py            # SQLAlchemy models
│   ├── routes/
│   │   ├── auth.py          # Authentication endpoints
│   │   ├── users.py         # User management (admin)
│   │   ├── patients.py      # Patient CRUD + access
│   │   ├── visits.py        # Visit management
│   │   ├── analytics.py     # Dashboard stats
│   │   ├── reports.py       # PDF generation
│   │   └── settings.py      # Settings management
│   └── utils/
│       ├── access_control.py # Access control functions
│       └── pdf_generator.py  # PDF utilities
├── migrate_and_reset.sql    # Database migration
└── run.py                   # Entry point
```

---

## 🔐 Authentication & Authorization

### Authentication Flow

#### First-Time Setup
1. User accesses application
2. Backend checks if users table is empty
3. Frontend redirects to `/setup` page
4. Admin creates initial account
5. Auto-login after setup

#### Login Flow
```
User Login
    ↓
Flask-Login validates credentials
    ↓
Session cookie created (server-side)
    ↓
Frontend stores user info in Zustand
    ↓
All API requests include session cookie
    ↓
Backend validates session for each request
```

### Session Management
- **Implementation**: Flask session cookies
- **Timeout**: 30 minutes of inactivity
- **Storage**: Server-side sessions
- **Security**: HTTP-only cookies, CSRF protection
- **Persistence**: Session survives page refresh

### Password Security
- **Hashing**: Werkzeug PBKDF2-SHA256
- **Minimum Length**: 8 characters
- **Change Password**: Available in settings
- **First Setup**: Password confirmation required

---

## 🔒 Access Control System

### Patient Access Control

#### Ownership Model
- **Creator**: User who creates a patient record
- **Owner Permissions**:
  - Full read/write access
  - Can share with other doctors
  - Can revoke access
  - Can delete patient
  - Can delete visits

#### Sharing Model
```
┌──────────────────────────────────────────────┐
│   Dr. A creates Patient "John Doe"           │
│   ↓                                          │
│   Dr. A owns the patient                     │
│   ↓                                          │
│   Dr. A shares with Dr. B (with comment)     │
│   ↓                                          │
│   Both can view/edit patient                 │
│   ↓                                          │
│   Only Dr. A can delete or revoke access     │
└──────────────────────────────────────────────┘
```

#### Access Check Flow
```python
def has_patient_access(patient_id, user_id):
    1. Check if user is admin → GRANT ACCESS
    2. Check if user is creator → GRANT ACCESS
    3. Check patient_access table → GRANT if found
    4. Otherwise → DENY ACCESS
```

### Database Schema for Access Control

#### patient_access Table
```sql
CREATE TABLE patient_access (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    granted_by INT REFERENCES users(id),
    access_comment TEXT,
    granted_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(patient_id, user_id)
);
```

#### Patients Table (Extended)
```sql
ALTER TABLE patients ADD COLUMN created_by INT REFERENCES users(id);
```

---

## 🗄 Database Schema

### Complete Schema

#### users
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    role VARCHAR(50) DEFAULT 'doctor',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);
```

#### patients
```sql
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    patient_id VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) NOT NULL,
    contact_number VARCHAR(15) NOT NULL,
    email VARCHAR(100),
    address TEXT,
    occupation VARCHAR(100),
    allergies TEXT,
    chronic_conditions TEXT,
    current_medications TEXT,
    family_history TEXT,
    emergency_contact_name VARCHAR(200),
    emergency_contact_number VARCHAR(15),
    created_at TIMESTAMP DEFAULT NOW(),
    created_by INT REFERENCES users(id)
);
```

#### visits
```sql
CREATE TABLE visits (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
    visit_date DATE NOT NULL,
    chief_complaint TEXT NOT NULL,
    symptoms TEXT,
    examination_findings TEXT,
    diagnosis TEXT,
    prescription TEXT,
    follow_up_date DATE,
    doctor_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    last_edited_at TIMESTAMP
);
```

#### settings
```sql
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT
);
```

#### patient_access
*(See Access Control section)*

---

## 🌐 API Documentation

### Authentication Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/auth/check-setup` | No | Check if setup needed |
| POST | `/api/auth/setup` | No | Create first admin user |
| POST | `/api/auth/login` | No | Login user |
| POST | `/api/auth/logout` | Yes | Logout user |
| GET | `/api/auth/me` | Yes | Get current user |
| POST | `/api/auth/change-password` | Yes | Change password |

### User Management (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| GET | `/api/users/doctors` | List doctors for sharing |
| POST | `/api/users` | Create new user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

### Patient Management

| Method | Endpoint | Access Control | Description |
|--------|----------|----------------|-------------|
| GET | `/api/patients` | Filtered | List accessible patients |
| GET | `/api/patients/:id` | Checked | Get patient details |
| POST | `/api/patients` | Auto-assign creator | Create patient |
| PUT | `/api/patients/:id` | Checked | Update patient |
| DELETE | `/api/patients/:id` | Creator/Admin only | Delete patient |

### Patient Access Control

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/api/patients/:id/access` | View access | Get access list |
| POST | `/api/patients/:id/access` | Creator/Admin | Share patient |
| DELETE | `/api/patients/:id/access/:user_id` | Creator/Admin | Revoke access |

**Request Body for Sharing:**
```json
{
  "user_ids": [2, 3, 4],
  "comment": "Second opinion needed"
}
```

**Response:**
```json
{
  "creator": {
    "id": 1,
    "full_name": "Dr. John Doe",
    "username": "johndoe"
  },
  "shared_with": [
    {
      "id": 5,
      "user_id": 2,
      "user_name": "Dr. Jane Smith",
      "access_comment": "Second opinion needed",
      "granted_at": "2026-01-14T10:30:00",
      "granted_by_name": "Dr. John Doe"
    }
  ]
}
```

### Visit Management

All visit endpoints inherit patient access control.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patients/:id/visits` | List patient visits |
| GET | `/api/visits/:id` | Get single visit |
| POST | `/api/patients/:id/visits` | Create visit |
| PUT | `/api/visits/:id` | Update visit |

### Analytics & Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/dashboard` | Dashboard stats |
| POST | `/api/reports/patient/:id` | Patient report PDF |
| POST | `/api/reports/prescription/:id` | Prescription PDF |
| POST | `/api/reports/certificate` | Medical certificate PDF |

---

## ⚙️ Setup & Installation

### Complete Setup Guide
See [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md) for detailed instructions.

### Quick Setup

**1. Database**
```bash
cd backend
psql -U homeopathy_user -d homeopathy_db -f migrate_and_reset.sql
```

**2. Backend**
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Create .env file with database credentials
python run.py
```

**3. Frontend**
```bash
cd frontend
npm install
npm run dev
```

**4. Access**
```
http://localhost:5173
```

---

## 👥 User Roles & Permissions

### Role Matrix

| Feature | Admin | Doctor | Staff* |
|---------|-------|--------|--------|
| Login/Logout | ✅ | ✅ | ✅ |
| View own patients | ✅ | ✅ | ✅ |
| View ALL patients | ✅ | ❌ | ❌ |
| Create patients | ✅ | ✅ | ❌ |
| Edit own patients | ✅ | ✅ | ❌ |
| Delete own patients | ✅ | ✅ | ❌ |
| Share patients | ✅ | ✅ (own) | ❌ |
| Revoke access | ✅ | ✅ (own) | ❌ |
| Manage users | ✅ | ❌ | ❌ |
| Access `/users` page | ✅ | ❌ | ❌ |
| Change own password | ✅ | ✅ | ✅ |
| Generate reports | ✅ | ✅ | ✅ |
| Update settings | ✅ | ✅ | ✅ |

*Staff role implemented but not fully differentiated (future)

### Admin Safeguards
- Cannot delete own account
- Cannot delete last admin user
- Cannot be locked out of system
- Bypasses all patient access restrictions

---

## 🔐 Security Features

### Authentication Security
- ✅ Password hashing (PBKDF2-SHA256)
- ✅ Minimum password length (8 chars)
- ✅ Session-based authentication
- ✅ HTTP-only session cookies
- ✅ CSRF protection
- ✅ Session timeout (30 min)

### Authorization Security
- ✅ Role-based access control (RBAC)
- ✅ Route-level protection
- ✅ API endpoint protection
- ✅ Admin-only decorators
- ✅ Access control checks on every operation

### Data Security
- ✅ Input validation on all forms
- ✅ SQL injection prevention (SQLAlchemy ORM)
- ✅ XSS prevention (React escaping)
- ✅ Environment variables for secrets
- ✅ `.env` file gitignored

### Access Control Security
- ✅ Patient isolation by default
- ✅ Explicit access grants only
- ✅ Creator-only deletion
- ✅ Audit trail (created_by, granted_by)
- ✅ Cascade deletion (patient deletes → access revoked)

---

## 🧪 Testing

### Test Coverage

**Authentication (12 test cases)**
- Setup flow validation
- Login/logout
- Session persistence
- Password change
- Invalid credentials handling

**User Management (8 test cases)**
- Create doctor accounts
- Edit user details
- Delete users (with safeguards)
- Role-based UI visibility
- Access denial for non-admins

**Patient Access Control (15 test cases)**
- Doctor isolation
- Patient sharing
- Multi-doctor sharing
- Access revocation
- Admin bypass
- Creator privileges
- Access inheritance for visits

**Patient Management (10 test cases)**
- CRUD operations
- Search and filter
- Pagination
- Validation

**Visit Management (8 test cases)**
- Add visits
- Edit visits
- Visit history
- Access control

**Reports (5 test cases)**
- PDF generation
- Data accuracy
- Error handling

### Testing Guide
See [TESTING_PLAN.md](./TESTING_PLAN.md) and [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md) for complete testing procedures.

---

## 📈 Performance Considerations

- **Database Indexing**: Foreign keys and frequently queried fields indexed
- **Query Optimization**: Filtered queries to reduce data transfer
- **Lazy Loading**: Patient lists paginated
- **Session Storage**: Efficient server-side sessions
- **Frontend Bundling**: Vite for optimized builds
- **Code Splitting**: React Router lazy loading

---

## 🚀 Deployment

### Production Checklist
- [ ] Set `FLASK_ENV=production`
- [ ] Generate strong `SECRET_KEY`
- [ ] Configure PostgreSQL for production
- [ ] Build frontend (`npm run build`)
- [ ] Set up reverse proxy (nginx)
- [ ] Configure SSL certificates
- [ ] Set up backup strategy
- [ ] Test all features in production

### Backup Strategy
```bash
# Database backup
pg_dump -U homeopathy_user homeopathy_db > backup_$(date +%Y%m%d).sql

# Restore
psql -U homeopathy_user -d homeopathy_db < backup_20260114.sql
```

---

## 📝 Changelog

### v2.0 (2026-01-14)
- ✅ Authentication system
- ✅ User management (admin)
- ✅ Patient access control
- ✅ Patient sharing
- ✅ Role-based permissions
- ✅ Admin bypass for all patients
- ✅ Access revocation
- ✅ Navigation menu
- ✅ Comprehensive documentation

### v1.0 (Initial Release)
- ✅ Patient management
- ✅ Visit tracking
- ✅ Dashboard analytics
- ✅ PDF generation
- ✅ Settings management
- ✅ Dark mode

---

## 🤝 Contributing

This is a private project for Gayatri Homeo Clinic. For feature requests or bug reports, contact the development team.

---

## 📄 License

Private use for Gayatri Homeo Clinic

---

## 📞 Support & Documentation Files

- **Setup Guide**: [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md)
- **Testing Plan**: [TESTING_PLAN.md](./TESTING_PLAN.md)
- **Auth Implementation**: [auth_implementation.md](./auth_implementation.md)
- **MVP Specification**: [homeopathy_mvp_final.md](./homeopathy_mvp_final.md)

---

**Built with ❤️ for Gayatri Homeo Clinic**  
**Version 2.0 | January 2026**
