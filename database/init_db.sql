/*
  Database Schema for Access Gate App
  Created by: Assistant
  Date: 2026-02-04
  Description: Schema compatible with existing Backend API models (User, VisitorRequest, etc.)
  Includes support for required Roles: Guard, HSE, Receptionist, Admin, User.
  
  Instructions:
  1. Open MySQL Workbench.
  2. Connect to your local database server.
  3. File > Open SQL Script > Select this file.
  4. Run the script (Lightning bolt icon).
*/

CREATE DATABASE IF NOT EXISTS access_gate_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE access_gate_app;

-- =============================================
-- 1. FACTORIES (Nhà máy)
-- =============================================
CREATE TABLE IF NOT EXISTS factories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE COMMENT 'Mã nhà máy',
    name VARCHAR(255) NOT NULL COMMENT 'Tên nhà máy',
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- 2. GATES (Cổng)
-- =============================================
CREATE TABLE IF NOT EXISTS gates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    factory_id INT NOT NULL,
    name VARCHAR(100) NOT NULL COMMENT 'Tên cổng (e.g. Cổng Chính)',
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (factory_id) REFERENCES factories(id) ON DELETE CASCADE
);

-- =============================================
-- 3. USERS (Người dùng)
-- =============================================
-- Roles Mapping:
-- 'admin': Admin (Full Access)
-- 'hse': HSE Staff (Full Access like Admin)
-- 'receptionist': Lễ tân (Full Access like Admin)
-- 'guard': Bảo vệ (Only Checkin Page)
-- 'user': Nhân viên thường (Request, Dashboard, Profile)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL COMMENT 'Mật khẩu đã mã hóa (hoặc plain cho dev)',
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    role ENUM('admin', 'hse', 'receptionist', 'guard', 'user') DEFAULT 'user',
    factory_id INT COMMENT 'User thuộc nhà máy nào (nếu có)',
    position VARCHAR(100) COMMENT 'Chức vụ',
    avatar VARCHAR(255) COMMENT 'URL ảnh đại diện',
    manager_id INT COMMENT 'ID của Manager (người duyệt đơn)',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (factory_id) REFERENCES factories(id) ON DELETE SET NULL,
    FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
);

-- =============================================
-- 4. VISITORS (Khách/Người ra vào) - Master Data
-- =============================================
-- Shared list of visitors to reuse information
CREATE TABLE IF NOT EXISTS visitors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    id_card_number VARCHAR(50) COMMENT 'CMND/CCCD/Passport',
    phone_number VARCHAR(20),
    company VARCHAR(255) COMMENT 'Công ty của khách',
    photo_url VARCHAR(255) COMMENT 'Ảnh chân dung khách (nếu có)',
    is_blacklisted BOOLEAN DEFAULT FALSE COMMENT 'Có bị cấm vào không',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_id_card (id_card_number)
);

-- =============================================
-- 5. VISITOR REQUESTS (Yêu cầu ra vào)
-- =============================================
CREATE TABLE IF NOT EXISTS visitor_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_code VARCHAR(50) UNIQUE COMMENT 'Mã đơn (e.g. REQ-2026-001)',
    type VARCHAR(50) DEFAULT 'visitor',
    status ENUM('submitted', 'manager_approved', 'plant_manager_approved', 'ready', 'checked_in', 'checked_out', 'rejected', 'cancelled') DEFAULT 'submitted',
    
    factory_id INT NOT NULL,
    purpose TEXT COMMENT 'Mục đích ra vào',
    access_area VARCHAR(100) COMMENT 'Khu vực được vào (Office, Factory...)',
    
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    
    -- Host Info (Người tiếp đón)
    host_user_id INT COMMENT 'Link đến User nội bộ nếu có',
    host_name VARCHAR(255) COMMENT 'Tên người tiếp đón (nếu nhập tay)',
    host_department VARCHAR(100),
    host_phone VARCHAR(20),
    host_manager_name VARCHAR(255) COMMENT 'Tên Manager của Host',
    host_manager_email VARCHAR(255) COMMENT 'Email Manager của Host',

    vehicle_plate VARCHAR(50),
    notes TEXT,
    
    -- Approval Workflow
    requested_by INT NOT NULL COMMENT 'Người tạo đơn',
    manager_approver_id INT COMMENT 'Manager được chỉ định duyệt đơn này',
    approved_by INT COMMENT 'Manager thực tế đã duyệt',
    plant_manager_approver_id INT COMMENT 'Plant Manager được chỉ định duyệt',
    plant_manager_approved_by INT COMMENT 'Plant Manager thực tế đã duyệt',
    rejected_by INT COMMENT 'Người thực tế đã từ chối',
    rejection_reason TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (factory_id) REFERENCES factories(id),
    FOREIGN KEY (host_user_id) REFERENCES users(id),
    FOREIGN KEY (requested_by) REFERENCES users(id),
    FOREIGN KEY (manager_approver_id) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    FOREIGN KEY (plant_manager_approver_id) REFERENCES users(id),
    FOREIGN KEY (plant_manager_approved_by) REFERENCES users(id),
    FOREIGN KEY (rejected_by) REFERENCES users(id)
);

-- =============================================
-- 6. REQUEST VISITORS (Liên kết Đơn -> Khách)
-- =============================================
-- One Request can have multiple Visitors
CREATE TABLE IF NOT EXISTS request_visitors (
    request_id INT NOT NULL,
    visitor_id INT NOT NULL,
    PRIMARY KEY (request_id, visitor_id),
    FOREIGN KEY (request_id) REFERENCES visitor_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (visitor_id) REFERENCES visitors(id) ON DELETE CASCADE
);

-- =============================================
-- 7. ACCESS LOGS (Lịch sử ra vào cổng)
-- =============================================
CREATE TABLE IF NOT EXISTS access_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT COMMENT 'Link đến đơn, có thể NULL nếu khách vãng lai đặc biệt',
    visitor_id INT NOT NULL COMMENT 'Người vãng lai',
    
    gate_id INT,
    guard_id INT COMMENT 'Bảo vệ xác nhận',
    
    action ENUM('checkin', 'checkout') NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    vehicle_plate VARCHAR(50) COMMENT 'Biển số xe thực tế lúc qua cổng',
    image_snapshot VARCHAR(255) COMMENT 'Ảnh chụp tại cổng',
    notes TEXT,
    
    -- Denormalized fields for quick access/snapshot history
    visitor_name VARCHAR(255),
    gate_name VARCHAR(100),
    guard_name VARCHAR(255),
    company VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (request_id) REFERENCES visitor_requests(id),
    FOREIGN KEY (visitor_id) REFERENCES visitors(id),
    FOREIGN KEY (gate_id) REFERENCES gates(id),
    FOREIGN KEY (guard_id) REFERENCES users(id)
);

-- =============================================
-- SEED DATA (Dữ liệu mẫu)
-- =============================================

-- Factories
INSERT INTO factories (code, name, address) VALUES 
('FAC01', 'Nhà máy Bình Dương', 'KCN VSIP 1, Bình Dương'),
('FAC02', 'Nhà máy Long An', 'KCN Tân Đức, Long An');

-- Gates
INSERT INTO gates (factory_id, name) VALUES 
(1, 'Cổng Chính (FAC1)'),
(1, 'Cổng Phụ (FAC1)'),
(2, 'Cổng Chính (FAC2)');

-- Users (Password: 123456)
-- Note: In production, use hashed passwords.
INSERT INTO users (username, password, full_name, role, factory_id, position, manager_id) VALUES 
('admin', '123456', 'System Administrator', 'admin', 1, 'Admin', NULL),
('hse_user', '123456', 'Nguyễn HSE', 'hse', 1, 'HSE Officer', 1),
('le_tan', '123456', 'Lễ Tân Chính', 'receptionist', 1, 'Front Desk', 1),
('bao_ve', '123456', 'Bác Bảo Vệ', 'guard', 1, 'Security', 1),
('nhan_vien', '123456', 'Nhân Viên A', 'user', 1, 'Sales', 2); -- Nhân viên A có manager là hse_user

-- Visitors
INSERT INTO visitors (full_name, id_card_number, company) VALUES 
('Nguyễn Văn Khách', '001122334455', 'Công ty ABC'),
('Trần Thị Đối Tác', '998877665544', 'Công ty XYZ');

-- Requests
INSERT INTO visitor_requests (request_code, factory_id, requested_by, manager_approver_id, status, purpose, scheduled_date, scheduled_time, host_name) VALUES
('REQ-001', 1, 5, 2, 'submitted', 'Họp dự án', CURDATE(), '09:00:00', 'Manager X'),
('REQ-002', 1, 5, 2, 'ready', 'Giao hàng', CURDATE(), '14:00:00', 'Kho');

-- Link Visitors to Requests
INSERT INTO request_visitors (request_id, visitor_id) VALUES 
(1, 1),
(2, 2);
