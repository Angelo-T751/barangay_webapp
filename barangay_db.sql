
-- =====================================================
-- BARANGAY AINS WEB APPLICATION DATABASE
-- Compatible with: MariaDB 10.5+ / MySQL 8.0+
-- Normalization: 2NF (Second Normal Form)
-- UPDATED: Tracking codes handled by backend, not database
-- =====================================================

-- Create database
CREATE DATABASE IF NOT EXISTS barangay_ains 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE barangay_ains;

-- =====================================================
-- 1. USERS TABLE (Stores both residents and admins)
-- =====================================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_uuid VARCHAR(36) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    middle_name VARCHAR(50),
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type ENUM('resident', 'admin') DEFAULT 'resident',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_user_type (user_type)
);

-- =====================================================
-- 2. ADDRESSES TABLE (1:1 with users - normalized)
-- =====================================================
CREATE TABLE addresses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    house_number VARCHAR(20) NOT NULL,
    street VARCHAR(100) NOT NULL,
    barangay VARCHAR(50) NOT NULL DEFAULT 'AINS',
    city VARCHAR(50) NOT NULL,
    zip_code VARCHAR(10),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- =====================================================
-- 3. CERTIFICATE_TYPES TABLE (Lookup table)
-- =====================================================
CREATE TABLE certificate_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type_code VARCHAR(30) UNIQUE NOT NULL,
    type_name VARCHAR(100) NOT NULL,
    description TEXT,
    base_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    processing_days INT DEFAULT 3,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    INDEX idx_type_code (type_code)
);

-- =====================================================
-- 4. APPLICATIONS TABLE (Core transactions)
-- =====================================================
CREATE TABLE applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tracking_code VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    certificate_type_id INT NOT NULL,
    purpose TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
    admin_remarks TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    processed_by INT NULL,
    scheduled_pickup_date DATE NULL,
    pickup_status ENUM('pending', 'ready', 'claimed') DEFAULT 'pending',
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (certificate_type_id) REFERENCES certificate_types(id),
    FOREIGN KEY (processed_by) REFERENCES users(id),
    INDEX idx_tracking_code (tracking_code),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_submitted_at (submitted_at)
);

-- =====================================================
-- 5. APPLICATION_DOCUMENTS TABLE (1:many with applications)
-- =====================================================
CREATE TABLE application_documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    document_path VARCHAR(500) NOT NULL,
    file_size INT,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    INDEX idx_application_id (application_id)
);

-- =====================================================
-- 6. PAYMENTS TABLE (1:1 with applications - normalized)
-- =====================================================
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT UNIQUE NOT NULL,
    payment_method ENUM('gcash', 'paymaya', 'credit_card', 'cash_onsite') NOT NULL,
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    amount DECIMAL(10, 2) NOT NULL,
    paymongo_payment_intent_id VARCHAR(255),
    paymongo_payment_method_id VARCHAR(255),
    receipt_number VARCHAR(50),
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id),
    INDEX idx_application_id (application_id),
    INDEX idx_payment_status (payment_status),
    INDEX idx_paymongo_intent (paymongo_payment_intent_id)
);

select * from users;