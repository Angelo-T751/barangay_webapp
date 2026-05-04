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

Step 2: Navigate to Project Folder
bash

    cd barangay_webapp

Step 3: Create Virtual Environment

Windows:
bash

    python3 -m venv venv
    venv\Scripts\activate

Linux/Mac:
bash

    python3 -m venv venv
    source venv/bin/activate

Step 4: Install Dependencies
bash

    pip install -r requirements.txt

Step 4.5: Create Environment
Install the correspondng setup file for your OS. open terminal in your project folder and run:

Linux Ubuntu

    # Step 1: Make the setup script executable
    chmod +x setup.sh

    # Step 2: Run the setup script
    ./setup.sh

    # Step 3: Activate the virtual environment (if not already activated)
    source venv\bin\activate

    # Step 4: Verify Flask is installed
    pip list | grep Flask

    # Step 5: Create the database
    mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS barangay_db;"

    # Step 6: Initialize database tables
    python config/database.py

    # Step 7: Run the application
    python run.py

Windows

    # Step 1: Go to your project folder
    cd /media/ace-ofdiamonds/Data/LinuxMint/PythonProjects/barangay_webapp

    # Step 2: Activate virtual environment
    source venv/bin/activate

    # Step 3: Install all dependencies
    pip install -r requirements.txt

    # Step 4: Create the database (enter your MySQL password when prompted)
    mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS barangay_db;"

    # Step 5: Initialize database tables
    python config/database.py
    
    # Step 6: Run the application
    python run.py

    
    

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
