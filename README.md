# barangay_webapp
Barangay WebApp with proper cross-platform compatibility:


# Barangay WebApp - Environment Setup Instructions

## 📋 Prerequisites

Before starting, make sure you have installed:

- **Python 3.8 or higher** - [Download Python](https://www.python.org/downloads/)
- **MariaDB/MySQL** - [Download MariaDB](https://mariadb.org/download/) or [Download MySQL](https://dev.mysql.com/downloads/)
- **Git** (optional) - [Download Git](https://git-scm.com/downloads/)

---

## 🚀 Setup Instructions

### Step 1: Generate Project Structure

Run the structure generator script to create all folders and files:

```bash
python create_project_structure.py

Step 2: Navigate to Project Folder
bash

cd barangay_webapp

Step 3: Create Virtual Environment

Windows:
bash

python -m venv venv
venv\Scripts\activate

Linux/Mac:
bash

python -m venv venv
source venv/bin/activate

Step 4: Install Dependencies
bash

pip install -r requirements.txt

Step 5: Configure Environment Variables

Open the .env file and update the values:
env

DB_USER=root
DB_PASSWORD=your_database_password
DB_HOST=localhost
DB_PORT=3306
DB_NAME=barangay_db

SECRET_KEY=your-secure-secret-key-here

MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

PAYMENT_API_KEY=your-payment-api-key
PAYMENT_SECRET_KEY=your-payment-secret-key

Step 6: Create Database

Log in to MariaDB/MySQL and create the database:
sql

CREATE DATABASE IF NOT EXISTS barangay_db;

Or via command line:
bash

mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS barangay_db;"

Step 7: Initialize Database Tables
bash

python config/database.py

Step 8: Run the Application
bash

python run.py

Step 9: Access the Application

    User Side: http://localhost:5000/user/dashboard

    Admin Login: http://localhost:5000/admin/login

Default Admin Account:

    Email: admin@barangay.gov.ph

    Password: Admin@123

🛠️ Troubleshooting
Issue	Solution
pip not found	Install Python and check "Add Python to PATH" during installation
mysql not found	Add MySQL/MariaDB to system PATH
Port 5000 in use	Change port in run.py: app.run(debug=True, port=5001)
Database connection error	Verify credentials in .env file
Module not found error	Make sure virtual environment is activated and run pip install -r requirements.txt
