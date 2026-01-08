#!/bin/bash
# ============================================
# Linux/Mac Setup Script
# Homeopathy Practice Management System
# ============================================

echo "============================================"
echo "Homeopathy Clinic - Linux/Mac Setup"
echo "============================================"
echo ""

# Check if running in backend directory
if [ ! -d "venv" ]; then
    echo "ERROR: Please run this script from the backend directory"
    echo "Usage: cd backend && bash setup.sh"
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "WARNING: .env file not found!"
    echo ""
    echo "Please create .env file with your database credentials."
    echo "You can copy .env.example and update the values."
    echo ""
    exit 1
fi

echo "Step 1: Activating virtual environment..."
source venv/bin/activate
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to activate virtual environment"
    echo "Please create one first: python -m venv venv"
    exit 1
fi
echo "   ✓ Done!"
echo ""

echo "Step 2: Installing/Updating dependencies..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi
echo "   ✓ Done!"
echo ""

echo "Step 3: Initializing database..."
python init_db.py
if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Database initialization failed"
    echo "Please check the error messages above."
    echo ""
    echo "Make sure:"
    echo "1. PostgreSQL is installed and running"
    echo "2. Database 'homeopathy_db' exists"
    echo "3. .env file has correct credentials"
    echo "4. You ran setup_database.sql first"
    exit 1
fi

echo ""
echo "============================================"
echo "✅ Setup completed successfully!"
echo "============================================"
echo ""
echo "To start the backend server:"
echo "   python run.py"
echo ""
echo "To start the frontend:"
echo "   cd ../frontend"
echo "   npm run dev"
echo ""
