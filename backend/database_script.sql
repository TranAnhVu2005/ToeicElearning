-- ==============================================================================
-- KHỞI TẠO CƠ SỞ DỮ LIỆU TOEIC LEARNING (CÓ SẴN TEST 1: PART 1 & PART 2 HOÀN CHỈNH)
-- ==============================================================================
DROP DATABASE IF EXISTS toeiclearning;
CREATE DATABASE toeiclearning CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
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

-- Khởi tạo các Role với UUID cố định
INSERT INTO role (id, role_name) VALUES 
('0d0bcedb-aeaa-11f1-b6c1-c0e43471a03a', 'ROLE_ADMIN'), 
('0d0bf593-aeaa-11f1-b6c1-c0e43471a03a', 'ROLE_USER'), 
('0d0bf686-aeaa-11f1-b6c1-c0e43471a03a', 'ROLE_TEACHER');

CREATE TABLE part (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name_part VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Khởi tạo 7 Part chuẩn TOEIC với UUID cố định
INSERT INTO part (id, name_part) VALUES 
('0d104916-aeaa-11f1-b6c1-c0e43471a03a', 'Part 1'), 
('0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 'Part 2'), 
('0d10551f-aeaa-11f1-b6c1-c0e43471a03a', 'Part 3'), 
('0d105559-aeaa-11f1-b6c1-c0e43471a03a', 'Part 4'), 
('0d10565f-aeaa-11f1-b6c1-c0e43471a03a', 'Part 5'), 
('0d1056cd-aeaa-11f1-b6c1-c0e43471a03a', 'Part 6'), 
('0d105702-aeaa-11f1-b6c1-c0e43471a03a', 'Part 7');

CREATE TABLE test (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title_test VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT (bản nháp), PUBLISHED (đã xuất bản)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 2. BẢNG NGƯỜI DÙNG (USER)
-- ==============================================================================
CREATE TABLE `user` (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL UNIQUE,
    user_numberphone VARCHAR(20) NOT NULL UNIQUE,
    user_password VARCHAR(255) NOT NULL,
    user_avatar VARCHAR(500),
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

-- Thêm sẵn 2 tài khoản người dùng
INSERT INTO `user` (
    id, 
    user_name, 
    user_email, 
    user_numberphone, 
    user_password, 
    user_avatar, 
    is_locked, 
    current_streak, 
    highest_streak, 
    total_score, 
    last_active_date, 
    role_id
) VALUES
(
    'd1b3a271-e75e-492a-8803-1ffec9e54bbe',
    'Trần Anh Vũ Đẹp Trai',
    'trananhvu314159@gmail.com',
    '0927447532',
    '$2a$10$YLHLkZAjLueikLFgcRmgJORbkHG7j4FjF7yudMlWl1QdZf9O/gRcK',
    NULL,
    FALSE,
    0,
    0,
    0,
    NULL,
    '0d0bf593-aeaa-11f1-b6c1-c0e43471a03a'
),
(
    'fc67189e-31b2-4e3f-bf19-d023a25f19df',
    'Trần Anh Vũ',
    'vub2306603@student.ctu.edu.vn',
    '0359906510',
    '$2a$10$sLPsskj9u/kmrfTl99L8Q.8eHifM0P6A3LIa8VcIyQ6UJVv9uz.CK',
    'https://res.cloudinary.com/ovs0odtq/image/upload/v1789218770/toeic-learning/avatars/jjar8htr37ju2bkx4kns.jpg',
    FALSE,
    0,
    0,
    0,
    NULL,
    '0d0bcedb-aeaa-11f1-b6c1-c0e43471a03a'
);

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
    CONSTRAINT fk_assign_test FOREIGN KEY (test_id) REFERENCES test(id) ON DELETE SET NULL
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
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_cq_test FOREIGN KEY (test_id) REFERENCES test(id) ON DELETE CASCADE,
    CONSTRAINT fk_cq_part FOREIGN KEY (part_id) REFERENCES part(id)
);
CREATE INDEX idx_context_question_order_follow_test_id ON context_question(test_id, order_index);

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
    question_number INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_question_cq FOREIGN KEY (context_question_id) REFERENCES context_question(id) ON DELETE CASCADE
);
CREATE INDEX idx_question_order_follow_context_question_id ON question(context_question_id, question_number);

-- ==============================================================================
-- 5. BẢNG LỊCH SỬ LÀM BÀI & BÀI TẬP
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
    
    CONSTRAINT fk_tr_user FOREIGN KEY (user_id) REFERENCES `user`(id) ON DELETE CASCADE,
    CONSTRAINT fk_tr_test FOREIGN KEY (test_id) REFERENCES test(id) ON DELETE CASCADE,
    CONSTRAINT fk_tr_part FOREIGN KEY (part_id) REFERENCES part(id),
    CONSTRAINT fk_tr_assignment FOREIGN KEY (assignment_id) REFERENCES assignment(id) ON DELETE SET NULL
);

CREATE TABLE user_answer (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    selected_answer CHAR(1),          
    is_correct BOOLEAN NOT NULL,
    time_spent INT DEFAULT 0,
    test_result_id VARCHAR(36),
    question_id VARCHAR(36),
    
    CONSTRAINT fk_ua_test_result FOREIGN KEY (test_result_id) REFERENCES test_result(id) ON DELETE CASCADE,
    CONSTRAINT fk_ua_question FOREIGN KEY (question_id) REFERENCES question(id) ON DELETE CASCADE
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

-- ==============================================================================
-- 7. DỮ LIỆU MẪU ĐỀ THI: ETS TOEIC 2026 - TEST 01 (PART 1 VÀ PART 2 HOÀN CHỈNH)
-- ==============================================================================
-- 7.1 Thêm Đề thi
INSERT INTO test (id, title_test, status, created_at, updated_at) VALUES 
('ddaaa16f-8d39-4669-9e60-6c9de8270c00', 'ETS TOEIC 2026 - Test 01', 'PUBLISHED', '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- 7.2 Thêm 6 cụm câu hỏi Part 1 (order_index lưu số thứ tự câu bắt đầu của cụm: 1 -> 6)
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, test_id, part_id, order_index, created_at, updated_at) VALUES
('fa05e688-bdf3-4d30-a484-f5d61b1044b9', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789536335/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/p8gzlbtidsrmobptni6i.mp3', 'https://res.cloudinary.com/ovs0odtq/image/upload/v1789534179/Resource/toeic-learning/exams/ets-toeic-2026-test-01/images/rdapoakesjzbvig2nduz.png', '<!--CQ_SEQ:P1:I0-->', '(A) The woman is carrying a tray of food.\n(B) The woman is wearing a jacket.\n(C) The woman is tying up her hair.\n(D) The woman is removing her hat.', 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d104916-aeaa-11f1-b6c1-c0e43471a03a', 1, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('a2d4872e-98ed-4c2e-9b3d-67799707fff7', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789536340/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/pqnp80jzi5pcipsjnc3i.mp3', 'https://res.cloudinary.com/ovs0odtq/image/upload/v1789534183/Resource/toeic-learning/exams/ets-toeic-2026-test-01/images/dhla5kx8k6mbyhfmqhva.png', '<!--CQ_SEQ:P1:I1-->', '(A) Some people are standing next to a filing cabinet.\n(B) Some people are searching through a desk.\n(C) Some people are watching a presentation.\n(D) Some people are looking at a book.', 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d104916-aeaa-11f1-b6c1-c0e43471a03a', 2, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('1695710e-0326-4d3a-b091-45c57d6ace20', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789536344/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/kjgcviubepfby0hrntxl.mp3', 'https://res.cloudinary.com/ovs0odtq/image/upload/v1789534186/Resource/toeic-learning/exams/ets-toeic-2026-test-01/images/zbzi8baqjtnr1jxzfuwx.png', '<!--CQ_SEQ:P1:I2-->', '(A) A woman is holding a phone up to her ear.\n(B) A woman is pouring a beverage into a glass.\n(C) Some light fixtures are hanging from the ceiling.\n(D) Some tiles are being installed in a hallway.', 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d104916-aeaa-11f1-b6c1-c0e43471a03a', 3, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('1be4482b-495e-4e57-aa81-dab25c5c2b46', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789536348/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/v8sy20hueqx23sszw6ep.mp3', 'https://res.cloudinary.com/ovs0odtq/image/upload/v1789534190/Resource/toeic-learning/exams/ets-toeic-2026-test-01/images/xh8lfjggcmwquzmhhynr.png', '<!--CQ_SEQ:P1:I3-->', '(A) A wooden crate is filled with vegetables.\n(B) One of the men is putting vegetables into a shopping bag.\n(C) A backpack has been set on the ground.\n(D) One of the men is reaching into a bucket.', 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d104916-aeaa-11f1-b6c1-c0e43471a03a', 4, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('f2eff0b8-2446-414f-9db9-eac22872564b', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789536353/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/cqjeucng95gubbl6cie9.mp3', 'https://res.cloudinary.com/ovs0odtq/image/upload/v1789534193/Resource/toeic-learning/exams/ets-toeic-2026-test-01/images/p631pfg5kvjzmq4zugd4.png', '<!--CQ_SEQ:P1:I4-->', '(A) Painting supplies have been laid out on the floor.\n(B) He\'s laying a brush down on a windowsill.\n(C) He\'s lifting a can of paint by its handle.\n(D) Cans of paint have been placed on a step stool.', 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d104916-aeaa-11f1-b6c1-c0e43471a03a', 5, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('dd4fb079-5ef9-47f5-a88f-31df8429966f', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789536357/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/oyqrnhwsigmhy6qsepxl.mp3', 'https://res.cloudinary.com/ovs0odtq/image/upload/v1789534209/Resource/toeic-learning/exams/ets-toeic-2026-test-01/images/c8kzudmcsvjygltudthd.png', '<!--CQ_SEQ:P1:I5-->', '(A) A path is covered with fallen branches.\n(B) A tree is lying across a grassy area.\n(C) Some water has pooled on a path.\n(D) Some cyclists are riding through a field.', 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d104916-aeaa-11f1-b6c1-c0e43471a03a', 6, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- 7.3 Thêm 6 câu hỏi tương ứng cho Part 1 (Câu 1 -> 6, Thứ tự question_number: 1 -> 6)
INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
('fb8f0447-b253-4ad1-8dc7-20dcd6fac25d', 'Select the statement that best describes what you see in the picture.', '(A)', '(B)', '(C)', '(D)', 'B', '(A) Người phụ nữ đang bưng một khay thức ăn.\n(B) Người phụ nữ đang mặc một chiếc áo khoác.\n(C) Người phụ nữ đang buộc tóc lên.\n(D) Người phụ nữ đang tháo mũ ra.', 'fa05e688-bdf3-4d30-a484-f5d61b1044b9', 1, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('f17c3286-9a2d-40fc-a494-fac36f334fe2', 'Select the statement that best describes what you see in the picture.', '(A)', '(B)', '(C)', '(D)', 'D', '(A) Một vài người đang đứng cạnh một tủ đựng hồ sơ.\n(B) Một vài người đang lục tìm trong một chiếc bàn làm việc.\n(C) Một vài người đang xem một buổi thuyết trình.\n(D) Một vài người đang nhìn vào một cuốn sách.', 'a2d4872e-98ed-4c2e-9b3d-67799707fff7', 2, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('518c0ae5-0120-4257-b7f4-37d61883b985', 'Select the statement that best describes what you see in the picture.', '(A)', '(B)', '(C)', '(D)', 'C', '(A) Một người phụ nữ đang giữ điện thoại áp vào tai.\n(B) Một người phụ nữ đang rót đồ uống vào một chiếc ly.\n(C) Một vài thiết bị chiếu sáng đang được treo trên trần nhà.\n(D) Một vài viên gạch đang được lắp đặt trong một hành lang.', '1695710e-0326-4d3a-b091-45c57d6ace20', 3, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('6c86ff1a-fc30-4240-a2b9-0eee24406fb3', 'Select the statement that best describes what you see in the picture.', '(A)', '(B)', '(C)', '(D)', 'A', '(A) Một cái thùng gỗ được chất đầy rau củ.\n(B) Một trong những người đàn ông đang cho rau củ vào một chiếc túi mua sắm.\n(C) Một chiếc ba lô đã được đặt trên mặt đất.\n(D) Một trong những người đàn ông đang thò tay vào một cái xô.', '1be4482b-495e-4e57-aa81-dab25c5c2b46', 4, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('e21f217c-9c3d-44a0-a384-46b1ec4f24d3', 'Select the statement that best describes what you see in the picture.', '(A)', '(B)', '(C)', '(D)', 'A', '(A) Dụng cụ sơn đã được bày ra trên sàn nhà.\n(B) Anh ấy đang đặt một cây cọ xuống bậu cửa sổ.\n(C) Anh ấy đang nhấc một lon sơn bằng quai xách của nó.\n(D) Những lon sơn đã được đặt trên một chiếc ghế đẩu.', 'f2eff0b8-2446-414f-9db9-eac22872564b', 5, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('4c660c12-4bf6-4dd4-8c1e-d41d20ec0b37', 'Select the statement that best describes what you see in the picture.', '(A)', '(B)', '(C)', '(D)', 'C', '(A) Một con đường mòn bị bao phủ bởi những cành cây rơi.\n(B) Một cái cây đang nằm ngang qua một bãi cỏ.\n(C) Một ít nước đã đọng lại trên một con đường mòn.\n(D) Một vài người đi xe đạp đang đạp xe qua một cánh đồng.', 'dd4fb079-5ef9-47f5-a88f-31df8429966f', 6, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- 7.4 Thêm 25 cụm câu hỏi Part 2 (order_index lưu số thứ tự câu bắt đầu của cụm: 7 -> 31)
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, test_id, part_id, order_index, created_at, updated_at) VALUES
('25ad56cc-da23-4d73-9b15-320614d4e075', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539676/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/z3pk8umqurxknrdiv6uq.mp3', NULL, '<!--CQ_SEQ:P2:I0-->', 'Question: Where is the conference being held?\n(A) A three-day vacation.\n(B) At the Riverview Hotel.\n(C) In the supply cabinet.', 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 7, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('d0a4a583-731f-447d-9321-a66e813fe58d', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539705/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/iu15uceggskl6j4vtmoz.mp3', NULL, '<!--CQ_SEQ:P2:I1-->', 'Question: When does the warehouse manager arrive?\n(A) Sure, no problem.\n(B) About twelve shipping boxes.\n(C) Not until this afternoon.', 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 8, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('dc29aac7-e5f2-4844-b3f8-59e35135cacf', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539712/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/thbccapqpgmrurtfl5ie.mp3', NULL, '<!--CQ_SEQ:P2:I2-->', 'Question: There’s a nice park nearby, right?\n(A) Did you order paper for the copier?\n(B) Yes—it’s next to Greendale Lake.\n(C) They’re in the parking garage.', 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 9, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('359d1ff2-4358-4557-b7ca-9b1fd4b763a1', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539739/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/y1rbzjv6gqntogsdday1.mp3', NULL, '<!--CQ_SEQ:P2:I3-->', 'Question: Who sent the meeting minutes to the accounting department?\n(A) Our office assistant.\n(B) They have a savings account.\n(C) Cash and credit cards.', 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 10, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('16197577-0bbc-40ce-9fa5-50961e961163', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539744/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/qi4szl4ut97lkjnzp4hm.mp3', NULL, '<!--CQ_SEQ:P2:I4-->', 'Question: I’d like to know what you think of our new finance analyst.\n(A) I’ve prepared the decorations for tomorrow.\n(B) He seems very competent.\n(C) It’s finally stopped raining.', 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 11, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('fcfd2f2d-e63b-4165-a471-5edca9960ef4', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539748/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/fqksqbnaiukgwhid9zqv.mp3', NULL, '<!--CQ_SEQ:P2:I5-->', 'Question: Let’s go on the company retreat.\n(A) Oh, did he?\n(B) Yes, that’s a good idea.\n(C) He tried to solve that problem.', 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 12, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('a379d10d-32d5-4261-8f19-2ec9f3987ab7', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539755/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/qqprenlg96t5t0isoflw.mp3', NULL, '<!--CQ_SEQ:P2:I6-->', 'Question: What time can I pick up my glasses?\n(A) No, it’s not very heavy.\n(B) About twenty meters.\n(C) We close at six o’clock.', 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 13, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('ebc6e860-7915-4623-a28a-44bbe6d2339d', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539759/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/fcku2x0w2pajkljfsqvt.mp3', NULL, '<!--CQ_SEQ:P2:I7-->', 'Question: The sales team knows how to use the tracking software, don’t they?\n(A) It’s on the lower shelf.\n(B) A twelve-thirty departure.\n(C) I haven’t seen them using it yet.', 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 14, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('4029b20d-1309-45c0-b300-4dce9fb06edd', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539764/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/en1pxshksionpg7sgdfp.mp3', NULL, '<!--CQ_SEQ:P2:I8-->', 'Question: Are you going to the hardware store on Mill Street?\n(A) That store hasn’t opened yet.\n(B) The blue package you sent me.\n(C) Some nails and a hammer.', 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 15, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('0e995264-2f51-48ea-9a5e-3ee9c9d89072', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539785/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/edoyavu2gwlzxkvldiy3.mp3', NULL, '<!--CQ_SEQ:P2:I9-->', 'Question: Would you be able to write the introduction for the workshop?\n(A) That was a great book.\n(B) He’s been working there for years.\n(C) He doesn’t have any more.', 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 16, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('4dfe5cba-132e-432d-9957-52795e0eefb2', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539799/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/o87yiugq8nfybnume38d.mp3', NULL, '<!--CQ_SEQ:P2:I10-->', 'Question: I picked up some flowers for Tunji’s retirement party.\n(A) No, pick any day.\n(B) That was thoughtful.\n(C) A delivery driver.', 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 17, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('9541ee88-7553-4b35-95fa-64f53bc7702a', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539806/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/dvxycf5p2q3wq315dg2t.mp3', NULL, '<!--CQ_SEQ:P2:I11-->', 'Question: Which meeting room did you tell the interns to go to?\n(A) The Jefferson Room.\n(B) The meeting was fun, thanks.\n(C) Yes, it’s a conference call.', 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 18, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('aa4119b1-b8e4-4c0a-be44-94913e6b973f', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539816/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/vtlh6evvp3rs0mugfgd3.mp3', NULL, '<!--CQ_SEQ:P2:I12-->', 'Question: Is your dental appointment next Tuesday?\n(A) You can borrow mine.\n(B) I’ll have to check my calendar.\n(C) Yes, it was a good meeting.', 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 19, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('7b134e64-1cec-4e7d-adc8-70e104a2e270', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539819/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/lggzo0k109yemrcq47ll.mp3', NULL, '<!--CQ_SEQ:P2:I13-->', 'Question: Why aren’t there any brochures in the lobby?\n(A) No, I haven’t received my confirmation e-mail yet.\n(B) My winter coat.\n(C) Because someone just took the last one.', 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 20, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('048b7c34-eea2-4fdf-b892-4f04a861fa62', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539826/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/ajfh7t1wppfc20sdrcap.mp3', NULL, '<!--CQ_SEQ:P2:I14-->', 'Question: What’s the process for submitting my expense report?\n(A) I sent it to the finance department.\n(B) The end of the day.\n(C) That’s correct.', 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 21, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('38a71bc3-67ea-49cd-89ae-05102ef936a6', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539832/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/g3ftolpk34qxywyw3ymm.mp3', NULL, '<!--CQ_SEQ:P2:I15-->', 'Question: Do you sell your products online or in stores?\n(A) About twenty percent off.\n(B) A product demonstration.\n(C) Only online.', 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 22, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('e741878e-0fac-4936-9864-199a8fa49ef5', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539837/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/fniauvzafxq9g6en73zj.mp3', NULL, '<!--CQ_SEQ:P2:I16-->', 'Question: How often do you charge this device?\n(A) Whenever the lights turn red.\n(B) A wireless one.\n(C) At the hardware store.', 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 23, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('086f1276-c27e-4cab-b0a5-36d7f80c2a49', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539843/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/kfpld17abxk3gr5q2qdv.mp3', NULL, '<!--CQ_SEQ:P2:I17-->', 'Question: The tickets to Friday night’s concert cost ten dollars each.\n(A) Actually, they’re fifteen.\n(B) No, I can’t play the guitar.\n(C) It’s in aisle five.', 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 24, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('f38407d2-935e-4d36-9ef8-a5056dafced9', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539849/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/yevxjrklycbx3mfoxy7q.mp3', NULL, '<!--CQ_SEQ:P2:I18-->', 'Question: Can’t you update the database today?\n(A) I did it yesterday.\n(B) That’s an interesting movie.\n(C) No, just me.', 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 25, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('203b0a64-0080-4228-934e-061784ad95ac', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539859/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/syizk1tc2t3jxfv5qtm3.mp3', NULL, '<!--CQ_SEQ:P2:I19-->', 'Question: How are we going to fit the extra supplies in that closet?\n(A) I’ve already read them.\n(B) Natalie’s in charge of supplies.\n(C) It’s the door at the end of the hallway.', 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 26, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('af888d9a-bd12-401b-ae0d-29ccc2b17ff7', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539861/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/itwjjifrmfzavvybxgkh.mp3', NULL, '<!--CQ_SEQ:P2:I20-->', 'Question: Have all the new windows been installed?\n(A) Sure, I’ll close the blinds.\n(B) The construction is almost finished.\n(C) They’re no longer available.', 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 27, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('76f98b08-8bec-4b1e-8ee4-e0c1e30b9919', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539883/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/fxb2i8bjaltmfk9n2eoj.mp3', NULL, '<!--CQ_SEQ:P2:I21-->', 'Question: Would you rather go to lunch now or at noon?\n(A) I’m taking a client to lunch.\n(B) On the corner of Fourth and Main.\n(C) The daily special is soup and a sandwich.', 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 28, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('74fc71b2-f7cc-453b-9533-b3287f6fd1ba', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539888/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/as2gptwqib8fihib8ilb.mp3', NULL, '<!--CQ_SEQ:P2:I22-->', 'Question: You’re taking the training in the afternoon, aren’t you?\n(A) The new head of the accounting department.\n(B) No, I take my coffee black.\n(C) Well, it depends on my schedule.', 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 29, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('4c5cc4dc-b2e5-4e0e-aecd-cc4459c040c0', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539892/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/a81lpejmdkxrbaxnijwh.mp3', NULL, '<!--CQ_SEQ:P2:I23-->', 'Question: When are you going to choose a new project manager?\n(A) The projector’s not working correctly.\n(B) Next to the front entrance.\n(C) I’m really busy this week.', 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 30, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('03849f30-ece8-42ff-a59d-18ad53face8f', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539898/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/kclfeimngabobw931lkv.mp3', NULL, '<!--CQ_SEQ:P2:I24-->', 'Question: When are you going to choose a new project manager?\n(A) The projector\'s not working correctly.\n(B) Next to the front entrance.\n(C) I\'m really busy this week.', 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 31, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- 7.5 Thêm 25 câu hỏi tương ứng cho Part 2 (Câu 7 -> 31, Thứ tự question_number: 7 -> 31)
INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
('3e7b55fb-fa0e-423e-8a85-d84c5cb7b6ee', 'Mark your answer on your answer sheet.', '(A)', '(B)', '(C)', '', 'B', 'Câu hỏi: Hội nghị được tổ chức ở đâu?\n(A) Một kỳ nghỉ ba ngày.\n(B) Tại khách sạn Riverview.\n(C) Trong tủ cung cấp.', '25ad56cc-da23-4d73-9b15-320614d4e075', 7, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('07490856-bc11-427f-8612-cef579eb92fe', 'Mark your answer on your answer sheet.', '(A)', '(B)', '(C)', '', 'C', 'Câu hỏi: Khi nào quản lý kho đến?\n(A) Chắc chắn rồi, không vấn đề gì.\n(B) Khoảng mười hai thùng hàng.\n(C) Không phải cho đến chiều nay.', 'd0a4a583-731f-447d-9321-a66e813fe58d', 8, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('55e6ad18-b618-4e88-a8b1-d34dee232df2', 'Mark your answer on your answer sheet.', '(A)', '(B)', '(C)', '', 'B', 'Câu hỏi: Có một công viên đẹp gần đây, phải không?\n(A) Bạn đã đặt giấy cho máy photocopy chưa?\n(B) Vâng—nó nằm cạnh Hồ Greendale.\n(C) Chúng ở trong gara đỗ xe.', 'dc29aac7-e5f2-4844-b3f8-59e35135cacf', 9, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('405a1aab-df79-40d6-866f-228bf2c7e1d8', 'Mark your answer on your answer sheet.', '(A)', '(B)', '(C)', '', 'A', 'Câu hỏi: Ai đã gửi biên bản cuộc họp cho bộ phận kế toán?\n(A) Trợ lý văn phòng của chúng tôi.\n(B) Họ có một tài khoản tiết kiệm.\n(C) Tiền mặt và thẻ tín dụng.', '359d1ff2-4358-4557-b7ca-9b1fd4b763a1', 10, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('82ac08a4-c413-4269-9553-2771a70d5c1f', 'Mark your answer on your answer sheet.', '(A)', '(B)', '(C)', '', 'B', 'Câu hỏi: Tôi muốn biết bạn nghĩ gì về chuyên viên phân tích tài chính mới của chúng ta.\n(A) Tôi đã chuẩn bị đồ trang trí cho ngày mai.\n(B) Anh ấy có vẻ rất có năng lực.\n(C) Trời cuối cùng đã ngừng mưa.', '16197577-0bbc-40ce-9fa5-50961e961163', 11, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('8e365e2a-42dd-45e3-b071-65e0d1795132', 'Mark your answer on your answer sheet.', '(A)', '(B)', '(C)', '', 'B', 'Câu hỏi: Hãy đi nghỉ dưỡng cùng công ty đi.\n(A) Ồ, anh ấy đã làm vậy sao?\n(B) Vâng, đó là một ý tưởng hay.\n(C) Anh ấy đã cố gắng giải quyết vấn đề đó.', 'fcfd2f2d-e63b-4165-a471-5edca9960ef4', 12, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('6bb8f458-6d1d-4c16-9ffb-ab987e440dbf', 'Mark your answer on your answer sheet.', '(A)', '(B)', '(C)', '', 'C', 'Câu hỏi: Mấy giờ tôi có thể lấy kính của mình?\n(A) Không, nó không nặng lắm.\n(B) Khoảng hai mươi mét.\n(C) Chúng tôi đóng cửa lúc sáu giờ.', 'a379d10d-32d5-4261-8f19-2ec9f3987ab7', 13, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('8e8013e4-fd8c-47bf-a087-ff7e3d41551e', 'Mark your answer on your answer sheet.', '(A)', '(B)', '(C)', '', 'C', 'Câu hỏi: Đội ngũ kinh doanh biết cách sử dụng phần mềm theo dõi, phải không?\n(A) Nó ở trên kệ dưới.\n(B) Khởi hành lúc mười hai giờ ba mươi.\n(C) Tôi chưa thấy họ sử dụng nó.', 'ebc6e860-7915-4623-a28a-44bbe6d2339d', 14, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('64fb0a59-65c1-4a64-ac03-b5edfb11d0e5', 'Mark your answer on your answer sheet.', '(A)', '(B)', '(C)', '', 'A', 'Câu hỏi: Bạn có định đến cửa hàng kim khí trên phố Mill không?\n(A) Cửa hàng đó vẫn chưa mở.\n(B) Gói hàng màu xanh bạn gửi cho tôi.\n(C) Một ít đinh và một cái búa.', '4029b20d-1309-45c0-b300-4dce9fb06edd', 15, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('575da2bc-0d7b-49e4-b152-5c30b4962afd', 'Mark your answer on your answer sheet.', '(A)', '(B)', '(C)', '', 'B', 'Câu hỏi: Bạn có thể viết phần giới thiệu cho hội thảo không?\n(A) Đó là một cuốn sách tuyệt vời.\n(B) Anh ấy đã làm việc ở đó nhiều năm.\n(C) Anh ấy không còn nữa.', '0e995264-2f51-48ea-9a5e-3ee9c9d89072', 16, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('8aa8ab39-1112-4965-9141-da342abf155d', 'Mark your answer on your answer sheet.', '(A)', '(B)', '(C)', '', 'B', 'Câu hỏi: Tôi đã mua một ít hoa cho bữa tiệc nghỉ hưu của Tunji.\n(A) Không, chọn bất kỳ ngày nào.\n(B) Điều đó thật chu đáo.\n(C) Một tài xế giao hàng.', '4dfe5cba-132e-432d-9957-52795e0eefb2', 17, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('82efc332-b44a-45ce-bfac-4d7eafa87449', 'Mark your answer on your answer sheet.', '(A)', '(B)', '(C)', '', 'A', 'Câu hỏi: Bạn đã bảo các thực tập sinh đến phòng họp nào?\n(A) Phòng Jefferson.\n(B) Cuộc họp rất vui, cảm ơn.\n(C) Vâng, đó là một cuộc gọi hội nghị.', '9541ee88-7553-4b35-95fa-64f53bc7702a', 18, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('7aedc2d8-25e8-4d99-acbd-7a329c4fbab2', 'Mark your answer on your answer sheet.', '(A)', '(B)', '(C)', '', 'B', 'Câu hỏi: Lịch hẹn nha sĩ của bạn là thứ Ba tới phải không?\n(A) Bạn có thể mượn của tôi.\n(B) Tôi sẽ phải kiểm tra lịch của mình.\n(C) Vâng, đó là một cuộc họp tốt.', 'aa4119b1-b8e4-4c0a-be44-94913e6b973f', 19, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('821f2306-61e1-4c08-8258-53dc89a0b3a0', 'Mark your answer on your answer sheet.', '(A)', '(B)', '(C)', '', 'C', 'Câu hỏi: Tại sao không có tờ rơi nào ở sảnh chờ?\n(A) Chưa, tôi vẫn chưa nhận được email xác nhận.\n(B) Áo khoác mùa đông của tôi.\n(C) Bởi vì ai đó vừa lấy cái cuối cùng.', '7b134e64-1cec-4e7d-adc8-70e104a2e270', 20, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('548038b6-354f-487d-8c32-0193eccdc164', 'Mark your answer on your answer sheet.', '(A)', '(B)', '(C)', '', 'A', 'Câu hỏi: Quy trình nộp báo cáo chi phí của tôi là gì?\n(A) Tôi đã gửi nó cho bộ phận tài chính.\n(B) Cuối ngày.\n(C) Đúng vậy.', '048b7c34-eea2-4fdf-b892-4f04a861fa62', 21, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('1c21720f-2660-4ea7-b639-fdafd93c110a', 'Mark your answer on your answer sheet.', '(A)', '(B)', '(C)', '', 'C', 'Câu hỏi: Bạn bán sản phẩm trực tuyến hay tại cửa hàng?\n(A) Giảm khoảng hai mươi phần trăm.\n(B) Một buổi trình diễn sản phẩm.\n(C) Chỉ trực tuyến.', '38a71bc3-67ea-49cd-89ae-05102ef936a6', 22, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('8a4eff46-d9b0-4695-af4d-272045f200c9', 'Mark your answer on your answer sheet.', '(A)', '(B)', '(C)', '', 'A', 'Câu hỏi: Bạn sạc thiết bị này bao lâu một lần?\n(A) Bất cứ khi nào đèn chuyển sang màu đỏ.\n(B) Một cái không dây.\n(C) Tại cửa hàng kim khí.', 'e741878e-0fac-4936-9864-199a8fa49ef5', 23, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('11136d7c-f5f2-47e9-a428-edb99ab4442a', 'Mark your answer on your answer sheet.', '(A)', '(B)', '(C)', '', 'A', 'Câu hỏi: Vé cho buổi hòa nhạc tối thứ Sáu có giá mười đô la mỗi vé.\n(A) Thực ra, chúng mười lăm.\n(B) Không, tôi không thể chơi guitar.\n(C) Nó ở dãy số năm.', '086f1276-c27e-4cab-b0a5-36d7f80c2a49', 24, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('61abe0ec-731b-401d-a89a-306855ad3b55', 'Mark your answer on your answer sheet.', '(A)', '(B)', '(C)', '', 'A', 'Câu hỏi: Bạn không thể cập nhật cơ sở dữ liệu ngày hôm nay sao?\n(A) Tôi đã làm điều đó ngày hôm qua.\n(B) Đó là một bộ phim thú vị.\n(C) Không, chỉ mình tôi.', 'f38407d2-935e-4d36-9ef8-a5056dafced9', 25, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('c6929f56-2fcb-4d01-9400-fd766bd4f33d', 'Mark your answer on your answer sheet.', '(A)', '(B)', '(C)', '', 'B', 'Câu hỏi: Làm thế nào chúng ta sẽ nhét thêm vật tư vào tủ đó?\n(A) Tôi đã đọc chúng rồi.\n(B) Natalie phụ trách vật tư.\n(C) Đó là cửa ở cuối hành lang.', '203b0a64-0080-4228-934e-061784ad95ac', 26, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('016e942f-4f4e-41b0-b4fd-af208d3a65a1', 'Mark your answer on your answer sheet.', '(A)', '(B)', '(C)', '', 'B', 'Câu hỏi: Tất cả cửa sổ mới đã được lắp đặt chưa?\n(A) Chắc chắn rồi, tôi sẽ đóng rèm cửa.\n(B) Việc xây dựng gần như đã hoàn thành.\n(C) Chúng không còn nữa.', 'af888d9a-bd12-401b-ae0d-29ccc2b17ff7', 27, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('7fabbd7d-a587-4611-8cab-09c0616505e4', 'Mark your answer on your answer sheet.', '(A)', '(B)', '(C)', '', 'A', 'Câu hỏi: Bạn muốn đi ăn trưa ngay bây giờ hay vào buổi trưa?\n(A) Tôi đang đưa một khách hàng đi ăn trưa.\n(B) Ở góc đường Fourth và Main.\n(C) Món đặc biệt hàng ngày là súp và bánh sandwich.', '76f98b08-8bec-4b1e-8ee4-e0c1e30b9919', 28, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('aa4e1231-4c81-48a0-9948-70a3df20c4ea', 'Mark your answer on your answer sheet.', '(A)', '(B)', '(C)', '', 'C', 'Câu hỏi: Bạn sẽ tham gia buổi đào tạo vào buổi chiều, phải không?\n(A) Trưởng phòng kế toán mới.\n(B) Không, tôi uống cà phê đen.\n(C) Chà, nó phụ thuộc vào lịch trình của tôi.', '74fc71b2-f7cc-453b-9533-b3287f6fd1ba', 29, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('0cc82916-dc33-45e6-ba10-cc13353d4868', 'Mark your answer on your answer sheet.', '(A)', '(B)', '(C)', '', 'C', 'Câu hỏi: Khi nào bạn sẽ chọn một quản lý dự án mới?\n(A) Máy chiếu không hoạt động chính xác.\n(B) Cạnh lối vào phía trước.\n(C) Tôi thực sự bận rộn trong tuần này.', '4c5cc4dc-b2e5-4e0e-aecd-cc4459c040c0', 30, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

('89397d44-073c-4c72-90e5-cd8870fef20c', 'Mark your answer on your answer sheet.', '(A)', '(B)', '(C)', '', 'C', 'Câu hỏi: Khi nào bạn sẽ chọn một quản lý dự án mới?\n(A) Máy chiếu không hoạt động chính xác.\n(B) Cạnh lối vào phía trước.\n(C) Tôi thực sự bận rộn trong tuần này.', '03849f30-ece8-42ff-a59d-18ad53face8f', 31, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ==============================================================================
-- 8. CÂU LỆNH TRUY VẤN XEM CẤU TRÚC ĐỀ THI ĐẦY ĐỦ THEO THỨ TỰ
-- ==============================================================================
SELECT 
    t.id AS ID_De_Thi,
    t.title_test AS Ten_De_Thi,
    t.status AS Trang_Thai_De,
    p.name_part AS Ten_Part,
    cq.order_index AS Thu_Tu_Doan,
    cq.id AS ID_Cum_Cau_Hoi,
    cq.audio_url AS Link_Audio,
    cq.image_url AS Link_Hinh_Anh,
    cq.paragraph AS Doan_Van_Doc,
    cq.transcript AS Loi_Thoai_Transcript,
    q.question_number AS So_Thu_Tu_Cau,
    q.id AS ID_Cau_Hoi,
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
LEFT JOIN question q ON cq.id = q.context_question_id
ORDER BY 
    t.created_at DESC,
    p.name_part ASC,
    cq.order_index ASC,
    q.question_number ASC;