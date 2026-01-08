@echo off
echo Setting up Homeopathy Management System Backend...
echo.

REM Create virtual environment
echo Creating virtual environment...
python -m venv venv

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Create necessary directories
echo Creating directories...
if not exist "instance" mkdir instance
if not exist "static" mkdir static

echo.
echo Setup complete!
echo To start the backend server, run: python run.py
echo.
pause
