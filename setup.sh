#!/bin/bash
# setup.sh - Barangay WebApp Setup Script for Linux/Mac

echo "========================================="
echo "  Barangay WebApp - Setup (Linux/Mac)"
echo "========================================="
echo ""

# Check Python installation
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi
echo "✅ Python found: $(python3 --version)"

# Create virtual environment
echo ""
echo "📦 Creating virtual environment..."
python3 -m venv venv
if [ $? -ne 0 ]; then
    echo "❌ Failed to create virtual environment."
    exit 1
fi
echo "✅ Virtual environment created."

# Activate virtual environment
echo ""
echo "🔌 Activating virtual environment..."
source venv/bin/activate
if [ $? -ne 0 ]; then
    echo "❌ Failed to activate virtual environment."
    exit 1
fi
echo "✅ Virtual environment activated."

# Upgrade pip
echo ""
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo ""
echo "📥 Installing dependencies..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies."
    exit 1
fi
echo "✅ Dependencies installed."

echo ""
echo "========================================="
echo "  Setup Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "  1. Configure .env file with your settings"
echo "  2. Create database: mysql -u root -p -e \"CREATE DATABASE IF NOT EXISTS barangay_db;\""
echo "  3. Initialize database: python config/database.py"
echo "  4. Run application: python run.py"
echo ""
echo "Access the application:"
echo "  User Side: http://localhost:5000/user/dashboard"
echo "  Admin Login: http://localhost:5000/admin/login"
echo "  Default Admin: admin@barangay.gov.ph / Admin@123"
echo ""