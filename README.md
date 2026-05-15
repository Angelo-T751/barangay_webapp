# barangay_webapp
Barangay WebApp with proper cross-platform compatibility:


# Barangay WebApp - Environment Setup Instructions

## 📋 Prerequisites

Before starting, make sure you have installed:

- **Python 3.8 or higher** - [Download Python](https://www.python.org/downloads/)
- **MariaDB/MySQL** - [Download MariaDB](https://mariadb.org/download/) or [Download MySQL](https://dev.mysql.com/downloads/)
- **Git** (optional) - [Download Git](https://git-scm.com/downloads/)
- **Folder Structure** - [Download .py file setup](https://github.com/Angelo-T751/barangay_webapp/blob/main/create_project_structure.py)
- **requirements.txt** - [Download .txt file setup](https://github.com/Angelo-T751/barangay_webapp/blob/main/requirements.txt)
- **environment setup (Ubuntu)** - [Download .sh file setup](https://github.com/Angelo-T751/barangay_webapp/blob/main/setup.sh)
- **environment setup (Windows)** - [Download .bat file setup](https://github.com/Angelo-T751/barangay_webapp/blob/main/setup.bat)

---

## 🚀 Setup Instructions

### Step 1: Generate Project Structure

Run the structure generator script to create all folders and files:

    python create_project_structure.py

### Step 2: Navigate to Project Folder
bash

    cd barangay_webapp

### Step 3: Create Virtual Environment

Windows:
bash

    python3 -m venv venv
    venv\Scripts\activate

Linux/Mac:
bash

    python3 -m venv venv
    source venv/bin/activate

### Step 4: Install Dependencies
bash

    pip install -r requirements.txt

### Use this to flush the cache if requirements.txt is not downloading

    pip cache purge

If imports are not recognized: 
    Ctrl + Shift + P to open the hotbar and type:

        Python: Select Interpreter
        
Select the one with .venv/bin/python. This is the Virtual Environment you setup in Step 3
    

### Step 5: Configure Environment Variables

Open the .env file and update the values:
env

    DB_USER=root
    DB_PASSWORD=your_database_password
    DB_HOST=localhost
    DB_PORT=3306
    DB_NAME=barangay_ains

    SECRET_KEY=your-secure-secret-key-here

    MAIL_SERVER=smtp.gmail.com
    MAIL_PORT=587
    MAIL_USE_TLS=True
    MAIL_USERNAME=your-email@gmail.com
    MAIL_PASSWORD=your-app-password

    PAYMENT_API_KEY=your-payment-api-key
    PAYMENT_SECRET_KEY=your-payment-secret-key

### Step 6: Create Database

Log in to MariaDB/MySQL and create the database:
sql

    CREATE DATABASE IF NOT EXISTS barangay_ains;

Or via command line:
bash

    mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS barangay_ains;"

### Step 7: Initialize Database Tables
bash

    python config/database.py

### Step 8: Run the Application
bash

    python run.py

### Step 9: Access the Application

    User Side: http://localhost:5000/user/dashboard

    Admin Login: http://localhost:5000/admin/login

Default Admin Account:

    Email: admin@barangay.gov.ph

    Password: Admin@123

# START UP 

## LINUX - Open & Work on Project
bash

Step 1. Navigate to project

    cd ~/barangay_webapp


Step 2. Activate virtual environment

    source venv/bin/activate


Step 3. Run the app

    python3 run.py

## WINDOWS - Open & Work on Project
cmd

Step 1. Navigate to project

    cd C:\Users\YourName\barangay_webapp


Step 2. Activate virtual environment

    venv\Scripts\activate


Step 3. Run the app

    python3 run.py
    

🛠️ Troubleshooting

Issue	Solution
pip not found	Install Python and check "Add Python to PATH" during installation
mysql not found	Add MySQL/MariaDB to system PATH
Port 5000 in use	Change port in run.py: app.run(debug=True, port=5001)
Database connection error	Verify credentials in .env file
Module not found error	Make sure virtual environment is activated and run pip install -r requirements.txt
