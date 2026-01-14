-- ====================================================================
-- Docker Database Initialization Script
-- Gayatri Homeo Clinic Management System
-- ====================================================================
-- This script is safe to run multiple times - it only creates tables
-- if they don't exist. Unlike migrate_and_reset.sql, this does NOT
-- truncate any data.
-- ====================================================================

-- Step 1: Create users table
-- ====================================================================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(120) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'doctor', 'staff')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

COMMENT ON TABLE users IS 'System users with role-based access';


-- Step 2: Create patients table
-- ====================================================================

CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    age INTEGER,
    gender VARCHAR(10),
    contact VARCHAR(15),
    address TEXT,
    medical_history TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    CONSTRAINT fk_patients_created_by FOREIGN KEY (created_by) 
        REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(name);
CREATE INDEX IF NOT EXISTS idx_patients_contact ON patients(contact);
CREATE INDEX IF NOT EXISTS idx_patients_created_by ON patients(created_by);

COMMENT ON TABLE patients IS 'Patient demographic and medical history information';


-- Step 3: Create visits table
-- ====================================================================

CREATE TABLE IF NOT EXISTS visits (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    visit_date DATE NOT NULL,
    symptoms TEXT,
    diagnosis TEXT,
    prescription TEXT,
    notes TEXT,
    doctor_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_visits_patient FOREIGN KEY (patient_id) 
        REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT fk_visits_doctor FOREIGN KEY (doctor_id) 
        REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_visits_patient ON visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_visits_date ON visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_visits_doctor ON visits(doctor_id);

COMMENT ON TABLE visits IS 'Patient visit records including symptoms, diagnosis, and prescriptions';


-- Step 4: Create patient_access table
-- ====================================================================

CREATE TABLE IF NOT EXISTS patient_access (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    granted_by INTEGER NOT NULL,
    access_comment TEXT,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_patient_access_patient FOREIGN KEY (patient_id) 
        REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT fk_patient_access_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_patient_access_granted_by FOREIGN KEY (granted_by) 
        REFERENCES users(id),
    CONSTRAINT uq_patient_user_access UNIQUE (patient_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_patient_access_patient ON patient_access(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_access_user ON patient_access(user_id);

COMMENT ON TABLE patient_access IS 'Tracks which users have access to which patient records';


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


-- ====================================================================
-- Database Initialization Complete!
-- ====================================================================
-- 
-- Tables created:
--   - users (system users with roles)
--   - patients (patient demographics)
--   - visits (visit records)
--   - patient_access (access control)
--   - settings (application settings)
--
-- Note: The Flask application will automatically populate default
-- settings on first run. Use the setup wizard at http://localhost
-- to create the first admin user.
--
-- ====================================================================
