-- ============================================
-- PostgreSQL Database Setup Script
-- Homeopathy Practice Management System
-- ============================================

-- This script creates the database, user, and sets up permissions
-- Run this as postgres superuser

-- Create database
CREATE DATABASE homeopathy_db;

-- Create user
CREATE USER homeopathy_user WITH PASSWORD 'changeme123';

-- Connect to the database
\c homeopathy_db

-- Grant all privileges on database
GRANT ALL PRIVILEGES ON DATABASE homeopathy_db TO homeopathy_user;

-- Grant schema permissions
GRANT USAGE ON SCHEMA public TO homeopathy_user;
GRANT CREATE ON SCHEMA public TO homeopathy_user;

-- Grant table and sequence permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO homeopathy_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO homeopathy_user;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT ALL PRIVILEGES ON TABLES TO homeopathy_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT ALL PRIVILEGES ON SEQUENCES TO homeopathy_user;

-- Make homeopathy_user the owner of the database
ALTER DATABASE homeopathy_db OWNER TO homeopathy_user;

-- Display success message
\echo '✓ Database created successfully!'
\echo '✓ User homeopathy_user created'
\echo '✓ Permissions granted'
\echo ''
\echo 'IMPORTANT: Change the password!'
\echo 'Run: ALTER USER homeopathy_user WITH PASSWORD ''your_secure_password'';'
