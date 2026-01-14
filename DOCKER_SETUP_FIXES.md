# Docker Setup Fixes - Gayatri Homeo Clinic v2

This document outlines all the changes needed to fix Docker Compose setup issues. Apply these changes to replicate the setup on another laptop.

---

## Change 1: Create `.env` File

**Location:** Root directory (same level as `docker-compose.yml`)  
**File Name:** `.env`  
**Status:** NEW FILE - Create this file

```dotenv
# PostgreSQL Configuration
DB_PASSWORD=homeopathy_secure_password_123

# Flask Configuration
FLASK_ENV=production
SECRET_KEY=your-very-long-random-secret-key-minimum-32-characters-change-this
DATABASE_URL=postgresql://homeopathy_user:homeopathy_secure_password_123@postgres:5432/homeopathy_db

# Frontend Configuration
VITE_API_URL=http://localhost:5000
```

### Why This Fix:
- Docker Compose references `${DB_PASSWORD}` in `docker-compose.yml`, but this variable wasn't defined
- Without this file, PostgreSQL couldn't initialize with a password
- The `.env` file provides environment variables to Docker Compose

---

## Change 2: Update `backend/app/__init__.py`

**Location:** `backend/app/__init__.py`  
**Lines:** 80-98  
**Status:** MODIFY EXISTING CODE

### Original Code (Remove):
```python
        # Initialize default settings if not exist
        default_settings = [
            ('clinic_name', 'Gayatri Homeo Clinic'),
            ('clinic_address', ''),
            ('clinic_contact', ''),
            ('clinic_email', ''),
            ('doctor_registration_number', ''),
            ('doctor_qualifications', ''),
            ('letterhead_path', '')
        ]
        
        for key, value in default_settings:
            existing = Settings.query.filter_by(key=key).first()
            if not existing:
                setting = Settings(key=key, value=value)
                db.session.add(setting)
        
        db.session.commit()
```

### Updated Code (Replace With):
```python
        # Initialize default settings if not exist
        default_settings = [
            ('clinic_name', 'Gayatri Homeo Clinic'),
            ('clinic_address', ''),
            ('clinic_contact', ''),
            ('clinic_email', ''),
            ('doctor_registration_number', ''),
            ('doctor_qualifications', ''),
            ('letterhead_path', '')
        ]
        
        try:
            for key, value in default_settings:
                existing = Settings.query.filter_by(key=key).first()
                if not existing:
                    setting = Settings(key=key, value=value)
                    db.session.add(setting)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            print(f"Settings initialization error: {e}")
```

### What Changed:
- Wrapped the settings initialization in a `try-except` block
- Added error handling to prevent crashes if duplicate keys exist
- Rolls back the transaction on error instead of crashing the app

### Why This Fix:
- When multiple backend workers start simultaneously, they may try to insert the same settings
- Without error handling, this causes SQLAlchemy IntegrityError
- The try-except gracefully handles duplicate key conflicts

---

## Change 3: Update `backend/init.sql`

**Location:** `backend/init.sql`  
**Lines:** 107-119  
**Status:** MODIFY EXISTING CODE

### Original Code (Remove):
```sql
-- Step 5: Create settings table
-- ====================================================================

CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

COMMENT ON TABLE settings IS 'Application settings and configuration';
```

### Updated Code (Replace With):
```sql
-- Step 5: Create settings table
-- ====================================================================

CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clear existing settings on initialization to prevent duplicate key errors
TRUNCATE TABLE settings CASCADE;

CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

COMMENT ON TABLE settings IS 'Application settings and configuration';
```

### What Changed:
- Added `TRUNCATE TABLE settings CASCADE;` after table creation
- This line clears all existing settings data on database initialization

### Why This Fix:
- When `docker-compose down -v` is run, old data persists in the volume
- Without truncating, old settings conflict with new insertions
- Ensures a clean slate for default settings initialization

---

## Summary of Changes

| File | Type | Change |
|------|------|--------|
| `.env` | NEW | Create environment variables file |
| `backend/app/__init__.py` | MODIFY | Add try-except error handling |
| `backend/init.sql` | MODIFY | Add TRUNCATE settings table |

---

## Steps to Apply These Changes

### On a New Laptop:

1. **Copy the modified files** from your working setup:
   - `.env`
   - `backend/app/__init__.py`
   - `backend/init.sql`

2. **Or manually apply changes** using the code snippets above

3. **Clean Docker environment:**
   ```bash
   docker-compose down -v
   docker system prune -a --volumes -f
   docker builder prune -a -f
   ```

4. **Start Docker Compose:**
   ```bash
   docker-compose up --build
   ```

5. **Verify all containers are running:**
   ```bash
   docker-compose ps
   ```

---

## Troubleshooting

### If you still see "duplicate key value" errors:
```bash
docker-compose down -v
docker system prune -a --volumes -f
docker builder prune -a -f
docker-compose up --build
```

### If PostgreSQL fails to start:
- Check `.env` file exists in root directory
- Verify `DB_PASSWORD` is set correctly
- Ensure `docker-compose down -v` removed the volume

### If backend shows "Settings initialization error":
- This is normal if the table already has data
- The error is caught and app continues to run
- Check logs with: `docker-compose logs homeopathy_backend`

---

## Production Notes

⚠️ **Security:** Before deploying to production:
- Change `DB_PASSWORD` to a strong, random password
- Change `SECRET_KEY` to a long, random string (minimum 32 characters)
- Use proper secrets management (AWS Secrets Manager, HashiCorp Vault, etc.)
- Never commit `.env` to version control (add to `.gitignore`)

---

## Related Documentation

- Docker Compose: https://docs.docker.com/compose/
- PostgreSQL Docker: https://hub.docker.com/_/postgres
- Flask-SQLAlchemy: https://flask-sqlalchemy.palletsprojects.com/

---

**Last Updated:** January 15, 2026  
**Version:** 1.0
