@echo off
REM ============================================
REM Windows Setup Script (Complete)
REM Homeopathy Practice Management System
REM ============================================

echo ============================================
echo Homeopathy Clinic - Complete Setup
echo ============================================
echo.

REM Check if .env exists
if not exist ".env" (
    echo Step 1: Creating .env file from template...
    if exist ".env.example" (
        copy .env.example .env
        echo    Done! IMPORTANT: Edit .env and update your database password
        echo.
    ) else (
        echo ERROR: .env.example not found
        exit /b 1
    )
) else (
    echo Step 1: .env file already exists
    echo.
)

echo Step 2: Creating virtual environment...
if not exist "venv\" (
    python -m venv venv
    echo    Done!
) else (
    echo    Virtual environment already exists
)
echo.

echo Step 3: Activating virtual environment...
call venv\Scripts\activate
if %errorlevel% neq 0 (
    echo ERROR: Failed to activate virtual environment
    pause
    exit /b 1
)
echo    Done!
echo.

echo Step 4: Installing dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo    Done!
echo.

echo Step 5: Initializing database...
python init_db.py
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Database initialization failed
    echo.
    echo Troubleshooting:
    echo 1. Make sure PostgreSQL is running
    echo 2. Run setup_database.sql in PostgreSQL first:
    echo    psql -U postgres -f ../setup_database.sql
    echo 3. Check .env file has correct credentials
    pause
    exit /b 1
)

echo.
echo ============================================
echo Setup completed successfully!
echo ============================================
echo.
echo Next steps:
echo 1. Start backend:  python run.py
echo 2. Start frontend: cd ..\frontend ^&^& npm run dev
echo 3. Open browser:  http://localhost:5173
echo.
pause
