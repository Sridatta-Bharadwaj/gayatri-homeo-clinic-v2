# 🚀 Quick Setup Guide

This directory contains automated setup scripts to quickly set up the Homeopathy Practice Management System on a new device.

## 📋 Prerequisites

Before running the setup scripts, ensure you have:

1. ✅ **PostgreSQL installed** (version 15 or 16)
2. ✅ **Python 3.11 or 3.12 installed**
3. ✅ **Node.js 18+ installed** (for frontend)

---

## ⚡ Quick Setup (3 Steps)

### Step 1: Create PostgreSQL Database

**Option A: Using psql (Command Line)**
```bash
psql -U postgres -f setup_database.sql
```

**Option B: Using pgAdmin (GUI)**
1. Open pgAdmin
2. Open Query Tool (Tools → Query Tool)
3. Open file `setup_database.sql`
4. Execute (F5)

**⚠️ Important:** Change the default password!
```sql
ALTER USER homeopathy_user WITH PASSWORD 'your_secure_password';
```

---

### Step 2: Run Backend Setup

**Windows:**
```bash
cd backend
setup.bat
```

**Linux/Mac:**
```bash
cd backend
chmod +x setup.sh
./setup.sh
```

This will:
- Create `.env` file (from template)
- Create virtual environment
- Install Python dependencies
- Initialize database tables

**After running:** Edit `backend/.env` and update your database password!

---

### Step 3: Setup Frontend

```bash
cd frontend
npm install
```

**Important:** Add your clinic logo as `frontend/public/logo.png`

---

## 🎯 Running the Application

### Start Backend
```bash
cd backend
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
python run.py
```

### Start Frontend (New Terminal)
```bash
cd frontend
npm run dev
```

### Open Browser
Navigate to: **http://localhost:5173**

---

## 📁 What Each Script Does

### `setup_database.sql`
- Creates `homeopathy_db` database
- Creates `homeopathy_user` with permissions
- Grants all necessary privileges
- Sets up schema permissions

### `backend/init_db.py`
- Creates database tables (patients, visits, settings)
- Initializes default settings
- Tests database connection
- Provides helpful error messages

### `backend/setup.bat` (Windows)
- Creates virtual environment
- Installs Python dependencies
- Runs database initialization
- Complete automated setup

### `backend/setup.sh` (Linux/Mac)
- Same as setup.bat but for Unix systems
- Make executable with: `chmod +x setup.sh`

---

## 🔧 Manual Setup (If Scripts Fail)

If the automated scripts don't work, follow the manual steps in [README.md](./README.md)

---

## ❓ Troubleshooting

### "Permission denied for schema public"
**Solution:** Make sure you ran `setup_database.sql` first!

### "Could not connect to server"
**Solution:** 
1. Check PostgreSQL is running (Windows Services)
2. Verify credentials in `backend/.env`

### "Database homeopathy_db does not exist"
**Solution:** Run `setup_database.sql` to create it

### Python version errors
**Solution:** Use Python 3.11 or 3.12 (not 3.13)

---

## 📝 Configuration

After setup, configure these in `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=homeopathy_db
DB_USER=homeopathy_user
DB_PASSWORD=your_actual_password  # ← Change this!

FLASK_ENV=development
SECRET_KEY=generate_random_key    # ← Change this!
```

Generate a secret key:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

---

## ✅ Setup Checklist

- [ ] PostgreSQL installed and running
- [ ] Ran `setup_database.sql`
- [ ] Changed default password for `homeopathy_user`
- [ ] Ran backend setup script (`setup.bat` or `setup.sh`)
- [ ] Edited `backend/.env` with your password
- [ ] Installed frontend dependencies (`npm install`)
- [ ] Added logo to `frontend/public/logo.png`
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Application accessible in browser

---

**Complete documentation:** See [README.md](./README.md)
