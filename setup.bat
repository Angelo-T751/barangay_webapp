@echo off
REM setup.bat - Barangay WebApp Setup Script for Windows

echo =========================================
echo   Barangay WebApp - Setup (Windows)
echo =========================================
echo.

REM Check Python installation
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.8+ first.
    exit /b 1
)
echo ✅ Python found:

python --version

REM Create virtual environment
echo.
echo 📦 Creating virtual environment...
python -m venv venv
if %errorlevel% neq 0 (
    echo ❌ Failed to create virtual environment.
    exit /b 1
)
echo ✅ Virtual environment created.

REM Activate virtual environment
echo.
echo 🔌 Activating virtual environment...
call venv\Scripts\activate.bat
if %errorlevel% neq 0 (
    echo ❌ Failed to activate virtual environment.
    exit /b 1
)
echo ✅ Virtual environment activated.

REM Upgrade pip
echo.
echo ⬆️  Upgrading pip...
pip install --upgrade pip

REM Install dependencies
echo.
echo 📥 Installing dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies.
    exit /b 1
)
echo ✅ Dependencies installed.

echo.
echo =========================================
echo   Setup Complete!
echo =========================================
echo.
echo Next steps:
echo   1. Configure .env file with your settings
echo   2. Create database: mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS barangay_db;"
echo   3. Initialize database: python config/database.py
echo   4. Run application: python run.py
echo.
echo Access the application:
echo   User Side: http://localhost:5000/user/dashboard
echo   Admin Login: http://localhost:5000/admin/login
echo   Default Admin: admin@barangay.gov.ph / Admin@123
echo.

pause