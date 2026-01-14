-- ====================================================================
-- Database Migration and Reset Script
-- Gayatri Homeo Clinic - Patient Access Control
-- ====================================================================

-- Step 1: Create patient_access table (if it doesn't exist)
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patient_access_patient ON patient_access(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_access_user ON patient_access(user_id);

COMMENT ON TABLE patient_access IS 'Tracks which users have access to which patient records';


-- Step 2: Add created_by column to patients table (if it doesn't exist)
-- ====================================================================

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'patients' AND column_name = 'created_by'
    ) THEN
        ALTER TABLE patients ADD COLUMN created_by INTEGER;
        ALTER TABLE patients ADD CONSTRAINT fk_patients_created_by 
            FOREIGN KEY (created_by) REFERENCES users(id);
        CREATE INDEX idx_patients_created_by ON patients(created_by);
        
        RAISE NOTICE 'Added created_by column to patients table';
    ELSE
        RAISE NOTICE 'created_by column already exists in patients table';
    END IF;
END $$;


-- Step 3: Clear all data from tables
-- ====================================================================

RAISE NOTICE 'Clearing all data from tables...';

-- Disable foreign key checks temporarily
SET session_replication_role = 'replica';

-- Clear all tables in correct order
TRUNCATE TABLE patient_access CASCADE;
TRUNCATE TABLE visits CASCADE;
TRUNCATE TABLE patients CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE settings CASCADE;

-- Re-enable foreign key checks
SET session_replication_role = 'origin';

RAISE NOTICE 'All tables cleared successfully!';


-- Step 4: Reset auto-increment sequences
-- ====================================================================

RAISE NOTICE 'Resetting auto-increment sequences...';

ALTER SEQUENCE patients_id_seq RESTART WITH 1;
ALTER SEQUENCE visits_id_seq RESTART WITH 1;
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE patient_access_id_seq RESTART WITH 1;
ALTER SEQUENCE settings_id_seq RESTART WITH 1;

RAISE NOTICE 'Sequences reset successfully!';


-- Step 5: Verify everything is clean
-- ====================================================================

RAISE NOTICE 'Verification - Current table counts:';

SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'patients', COUNT(*) FROM patients
UNION ALL
SELECT 'visits', COUNT(*) FROM visits
UNION ALL
SELECT 'patient_access', COUNT(*) FROM patient_access
UNION ALL
SELECT 'settings', COUNT(*) FROM settings;


-- ====================================================================
-- Migration Complete!
-- ====================================================================
-- 
-- Next steps:
-- 1. Run: python run.py (in backend directory)
-- 2. Navigate to: http://localhost:5173
-- 3. Complete the setup wizard to create your first user
-- 4. Start testing!
--
-- ====================================================================
