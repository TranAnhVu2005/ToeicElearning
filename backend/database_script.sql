-- ==============================================================================
-- KHỞI TẠO DATABASE
-- ==============================================================================
DROP DATABASE IF EXISTS toeiclearning; -- Xóa database cũ nếu có để làm sạch hoàn toàn
CREATE DATABASE toeiclearning;
USE toeiclearning;

-- ==============================================================================
-- 1. BẢNG CẤU HÌNH & DANH MỤC ĐỘC LẬP
-- ==============================================================================
CREATE TABLE role (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    role_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO role (role_name) VALUES ('ROLE_ADMIN'), ('ROLE_USER'), ('ROLE_TEACHER');

CREATE TABLE part (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name_part VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Thêm dữ liệu mặc định cho 7 phần thi chuẩn TOEIC
INSERT INTO part (name_part) VALUES 
('Part 1'), 
('Part 2'), 
('Part 3'), 
('Part 4'), 
('Part 5'), 
('Part 6'), 
('Part 7');

select * from part;
CREATE TABLE test (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title_test VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT (bản nháp), PUBLISHED (đã xuất bản)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 2. BẢNG NGƯỜI DÙNG (Cập nhật Rank & Streak)
-- ==============================================================================
CREATE TABLE `user` (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL UNIQUE,
    user_numberphone VARCHAR(10) NOT NULL UNIQUE,
    user_password VARCHAR(255) NOT NULL,
    user_avatar VARCHAR(255),
    is_locked BOOLEAN DEFAULT FALSE,
    current_streak INT DEFAULT 0,
    highest_streak INT DEFAULT 0,
    total_score INT DEFAULT 0,
    last_active_date DATE,
    role_id VARCHAR(36), 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES role(id)
);

-- DỮ LIỆU MẪU NGƯỜI DÙNG (MẬT KHẨU TẤT CẢ LÀ: 123456)
-- Mã hash BCrypt của 123456: $2a$10$7EqJtq98hPqEX7fNZaFWoOhiM58d2m0N/lJ4MfsVvIqFf4Yt1y9tC
INSERT INTO `user` (user_name, user_email, user_numberphone, user_password, user_avatar, is_locked, role_id) VALUES
-- 1. Tài khoản Quản trị viên
('Quản Trị Viên', 'admin@toeic.com', '0901234567', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhiM58d2m0N/lJ4MfsVvIqFf4Yt1y9tC', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300', FALSE, (SELECT id FROM role WHERE role_name = 'ROLE_ADMIN' LIMIT 1)),

-- 2. Tài khoản Giáo viên
('Giáo Viên TOEIC', 'teacher@toeic.com', '0902345678', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhiM58d2m0N/lJ4MfsVvIqFf4Yt1y9tC', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300', FALSE, (SELECT id FROM role WHERE role_name = 'ROLE_TEACHER' LIMIT 1)),

-- 3. Tài khoản Học viên (Người dùng thông thường)
('Trần Anh Vũ', 'student@toeic.com', '0903456789', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhiM58d2m0N/lJ4MfsVvIqFf4Yt1y9tC', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300', FALSE, (SELECT id FROM role WHERE role_name = 'ROLE_USER' LIMIT 1)),

-- 4. Tài khoản Học viên bị khóa (Dùng test tính năng khóa/mở khóa)
('Tài Khoản Bị Khóa', 'locked@toeic.com', '0904567890', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhiM58d2m0N/lJ4MfsVvIqFf4Yt1y9tC', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=300', TRUE, (SELECT id FROM role WHERE role_name = 'ROLE_USER' LIMIT 1));

-- ==============================================================================
-- 3. NHÓM LỚP HỌC & BÀI TẬP VỀ NHÀ (Dành cho Giáo viên & Học sinh)
-- ==============================================================================
CREATE TABLE classroom (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    class_name VARCHAR(255) NOT NULL,
    class_code VARCHAR(50) UNIQUE NOT NULL,
    teacher_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_class_teacher FOREIGN KEY (teacher_id) REFERENCES `user`(id)
);

CREATE TABLE class_member (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    class_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_member_class FOREIGN KEY (class_id) REFERENCES classroom(id),
    CONSTRAINT fk_member_student FOREIGN KEY (student_id) REFERENCES `user`(id)
);

CREATE TABLE material (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    class_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_material_class FOREIGN KEY (class_id) REFERENCES classroom(id)
);

CREATE TABLE assignment (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    deadline DATETIME NOT NULL,
    class_id VARCHAR(36) NOT NULL,
    test_id VARCHAR(36), -- NULL nếu giáo viên upload bài ngoài
    external_file_url VARCHAR(255), 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_assign_class FOREIGN KEY (class_id) REFERENCES classroom(id),
    CONSTRAINT fk_assign_test FOREIGN KEY (test_id) REFERENCES test(id)
);

-- ==============================================================================
-- 4. BẢNG DỮ LIỆU ĐỀ THI (Test Data)
-- ==============================================================================
CREATE TABLE context_question (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    audio_url VARCHAR(255),
    image_url VARCHAR(255),
    paragraph TEXT,      
    transcript TEXT,     
    test_id VARCHAR(36),
    part_id VARCHAR(36), 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_cq_test FOREIGN KEY (test_id) REFERENCES test(id),
    CONSTRAINT fk_cq_part FOREIGN KEY (part_id) REFERENCES part(id)
);

CREATE TABLE question (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    question_content TEXT,            
    option_a VARCHAR(500),            
    option_b VARCHAR(500),
    option_c VARCHAR(500),
    option_d VARCHAR(500),
    correct_answer CHAR(1) NOT NULL,
    explanation TEXT,                 
    context_question_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_question_cq FOREIGN KEY (context_question_id) REFERENCES context_question(id) ON DELETE CASCADE
);

-- ==============================================================================
-- 5. BẢNG LỊCH SỬ LÀM BÀI & BÀI TẬP (Cập nhật chấm điểm của Giáo viên)
-- ==============================================================================
CREATE TABLE test_result (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    listening_score INT DEFAULT 0,
    reading_score INT DEFAULT 0,
    total_score INT DEFAULT 0,
    correct_count INT DEFAULT 0,
    total_count INT NOT NULL,
    total_time INT NOT NULL,
    teacher_comment TEXT, -- Giáo viên nhận xét bài tập
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(36),
    test_id VARCHAR(36),                   
    part_id VARCHAR(36),                   
    assignment_id VARCHAR(36), -- Gắn với bài tập nếu có
    
    CONSTRAINT fk_tr_user FOREIGN KEY (user_id) REFERENCES `user`(id),
    CONSTRAINT fk_tr_test FOREIGN KEY (test_id) REFERENCES test(id),
    CONSTRAINT fk_tr_part FOREIGN KEY (part_id) REFERENCES part(id),
    CONSTRAINT fk_tr_assignment FOREIGN KEY (assignment_id) REFERENCES assignment(id)
);

CREATE TABLE user_answer (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    selected_answer CHAR(1),          
    is_correct BOOLEAN NOT NULL,
    time_spent INT DEFAULT 0,
    test_result_id VARCHAR(36),
    question_id VARCHAR(36),
    
    CONSTRAINT fk_ua_test_result FOREIGN KEY (test_result_id) REFERENCES test_result(id),
    CONSTRAINT fk_ua_question FOREIGN KEY (question_id) REFERENCES question(id)
);

-- ==============================================================================
-- 6. GIAO DỊCH VNPAY & THÔNG BÁO HỆ THỐNG
-- ==============================================================================
CREATE TABLE payment_transaction (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    vnp_txn_ref VARCHAR(100) UNIQUE NOT NULL, 
    status VARCHAR(20) NOT NULL, -- SUCCESS, FAILED, PENDING
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_payment_user FOREIGN KEY (user_id) REFERENCES `user`(id)
);

CREATE TABLE notification (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    type VARCHAR(50), -- ASSIGNMENT, SYSTEM, PAYMENT
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_noti_user FOREIGN KEY (user_id) REFERENCES `user`(id)
);


/*Câu lệnh test đề thi lại*/
SELECT 
    t.title_test AS Ten_De_Thi,
    p.name_part AS Ten_Part,
    cq.id AS ID_Cum_Cau_Hoi,
    cq.audio_url,
    cq.image_url,
    cq.paragraph AS Doan_Van_Doc,
    q.question_content AS Noi_Dung_Cau_Hoi,
    q.option_a AS Dap_An_A,
    q.option_b AS Dap_An_B,
    q.option_c AS Dap_An_C,
    q.option_d AS Dap_An_D,
    q.correct_answer AS Dap_An_Dung,
    q.explanation AS Giai_Thich
FROM test t
LEFT JOIN context_question cq ON t.id = cq.test_id
LEFT JOIN part p ON cq.part_id = p.id
LEFT JOIN question q ON cq.id = q.context_question_id;