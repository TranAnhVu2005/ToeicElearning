-- Tạo và sử dụng database
CREATE DATABASE IF NOT EXISTS toeiclearning;
USE toeiclearning;

-- ==============================================================================
-- 1. BẢNG CẤU HÌNH (Đã chuyển sang UUID để đồng bộ hoàn toàn)
-- ==============================================================================

CREATE TABLE role (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    role_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE part (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name_part VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 2. BẢNG DỮ LIỆU CỐT LÕI (Sử dụng UUID)
-- ==============================================================================

CREATE TABLE test (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title_test VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Dùng backticks `user` vì user là từ khóa riêng trong MySQL
CREATE TABLE `user` (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL UNIQUE,
    user_numberphone VARCHAR(10) NOT NULL UNIQUE,
    user_password VARCHAR(255) NOT NULL,
    user_avatar VARCHAR(255),
    is_locked BOOLEAN DEFAULT FALSE,
    role_id VARCHAR(36), -- Khớp kiểu VARCHAR(36) với bảng role
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES role(id)
);
update `user` add columns 

CREATE TABLE context_question (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    audio_url VARCHAR(255),
    image_url VARCHAR(255),
    paragraph TEXT,      
    transcript TEXT,     
    test_id VARCHAR(36),
    part_id VARCHAR(36), -- Khớp kiểu VARCHAR(36) với bảng part
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
    
    CONSTRAINT fk_question_cq FOREIGN KEY (context_question_id) REFERENCES context_question(id)
);

-- ==============================================================================
-- 3. BẢNG LỊCH SỬ LÀM BÀI
-- ==============================================================================

CREATE TABLE test_result (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    listening_score INT DEFAULT 0,
    reading_score INT DEFAULT 0,
    total_score INT DEFAULT 0,
    correct_count INT DEFAULT 0,
    total_count INT NOT NULL,
    total_time INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(36),
    test_id VARCHAR(36),                   
    part_id VARCHAR(36), -- Khớp kiểu VARCHAR(36) với bảng part                 
    
    CONSTRAINT fk_tr_user FOREIGN KEY (user_id) REFERENCES `user`(id),
    CONSTRAINT fk_tr_test FOREIGN KEY (test_id) REFERENCES test(id),
    CONSTRAINT fk_tr_part FOREIGN KEY (part_id) REFERENCES part(id)
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

select * from `user`;