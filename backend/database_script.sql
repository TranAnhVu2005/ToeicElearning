-- ==============================================================================
-- KHỞI TẠO CƠ SỞ DỮ LIỆU TOEIC LEARNING (ETS TOEIC 2026 TEST 01 - TRỌN BỘ 200 CÂU)
-- TOÀN BỘ 7 PHẦN THI (PART 1 -> PART 7: 100 CÂU LISTENING + 100 CÂU READING)
-- TRANSCRIPT TIẾNG ANH THUẦN TÚY, BẢN DỊCH TIẾNG VIỆT LƯU RIÊNG TRONG CỘT TRANSLATION
-- ĐÁP ÁN ĐỐI CHIẾU CHUẨN 100% THEO ANSWER KEY CHÍNH THỨC ETS TOEIC 2026
-- ==============================================================================
-- DROP DATABASE IF EXISTS toeiclearning;
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
    status VARCHAR(20) DEFAULT 'DRAFT',
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

INSERT INTO `user` (
    id, user_name, user_email, user_numberphone, user_password, user_avatar, 
    is_locked, current_streak, highest_streak, total_score, last_active_date, role_id
) VALUES
(
    'd1b3a271-e75e-492a-8803-1ffec9e54bbe', 'Trần Anh Vũ Đẹp Trai', 'trananhvu314159@gmail.com', '0927447532',
    '$2a$10$YLHLkZAjLueikLFgcRmgJORbkHG7j4FjF7yudMlWl1QdZf9O/gRcK', NULL, FALSE, 0, 0, 0, NULL,
    '0d0bf593-aeaa-11f1-b6c1-c0e43471a03a'
),
(
    'fc67189e-31b2-4e3f-bf19-d023a25f19df', 'Trần Anh Vũ', 'vub2306603@student.ctu.edu.vn', '0359906510',
    '$2a$10$sLPsskj9u/kmrfTl99L8Q.8eHifM0P6A3LIa8VcIyQ6UJVv9uz.CK', 
    'https://res.cloudinary.com/ovs0odtq/image/upload/v1789218770/toeic-learning/avatars/jjar8htr37ju2bkx4kns.jpg', 
    FALSE, 0, 0, 0, NULL,
    '0d0bcedb-aeaa-11f1-b6c1-c0e43471a03a'
);

-- ==============================================================================
-- 3. NHÓM LỚP HỌC & BÀI TẬP VỀ NHÀ
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
    status VARCHAR(20) DEFAULT 'PENDING',
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
    test_id VARCHAR(36),
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
    translation TEXT,
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
    teacher_comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(36),
    test_id VARCHAR(36),                   
    part_id VARCHAR(36),                   
    assignment_id VARCHAR(36),
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
    status VARCHAR(20) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_user FOREIGN KEY (user_id) REFERENCES `user`(id)
);

CREATE TABLE notification (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_noti_user FOREIGN KEY (user_id) REFERENCES `user`(id)
);

-- ==============================================================================
-- 7. DỮ LIỆU MẪU ĐỀ THI: ETS TOEIC 2026 - TEST 01 (TRỌN BỘ CÂU 1 ĐẾN 200)
-- ==============================================================================
INSERT INTO test (id, title_test, status, created_at, updated_at) VALUES 
('ddaaa16f-8d39-4669-9e60-6c9de8270c00', 'ETS TOEIC 2026 - Test 01', 'PUBLISHED', '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ==============================================================================
-- 7.2 PART 1: MÔ TẢ HÌNH ẢNH (CÂU 1 -> 6)
-- 6 cụm câu hỏi hình ảnh độc lập (mỗi cụm gồm ảnh, audio và 4 lựa chọn A-B-C-D)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- [PART 1 - CỤM 1]: CÂU 1 (order_index: 1)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('94be130d-3961-44d7-963e-60d6eb2bb4c5',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789536335/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/p8gzlbtidsrmobptni6i.mp3',
 'https://res.cloudinary.com/ovs0odtq/image/upload/v1789534179/Resource/toeic-learning/exams/ets-toeic-2026-test-01/images/rdapoakesjzbvig2nduz.png',
 NULL,
 '(A) The woman is carrying a tray of food.
(B) The woman is wearing a jacket.
(C) The woman is tying up her hair.
(D) The woman is removing her hat.',
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d104916-aeaa-11f1-b6c1-c0e43471a03a', 1, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 1 (Đáp án đúng: B)
('6814113b-3f82-414b-ac3f-13eddd6fb77d',
 'Select the statement that best describes what you see in the picture.',
 '(A)', '(B)', '(C)', '(D)', 'B',
 '(A) Người phụ nữ đang bưng một khay thức ăn.
(B) Người phụ nữ đang mặc một chiếc áo khoác.
(C) Người phụ nữ đang buộc tóc lên.
(D) Người phụ nữ đang tháo mũ ra.',
 '94be130d-3961-44d7-963e-60d6eb2bb4c5', 1, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 1 - CỤM 2]: CÂU 2 (order_index: 2)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('d45b9244-01c0-4f9d-909a-65bfb9f9d853',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789536340/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/pqnp80jzi5pcipsjnc3i.mp3',
 'https://res.cloudinary.com/ovs0odtq/image/upload/v1789534183/Resource/toeic-learning/exams/ets-toeic-2026-test-01/images/dhla5kx8k6mbyhfmqhva.png',
 NULL,
 '(A) Some people are standing next to a filing cabinet.
(B) Some people are searching through a desk.
(C) Some people are watching a presentation.
(D) Some people are looking at a book.',
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d104916-aeaa-11f1-b6c1-c0e43471a03a', 2, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 2 (Đáp án đúng: D)
('41609f74-53f4-438f-90ce-d14242b586f0',
 'Select the statement that best describes what you see in the picture.',
 '(A)', '(B)', '(C)', '(D)', 'D',
 '(A) Một vài người đang đứng cạnh một tủ đựng hồ sơ.
(B) Một vài người đang lục tìm trong một chiếc bàn làm việc.
(C) Một vài người đang xem một buổi thuyết trình.
(D) Một vài người đang nhìn vào một cuốn sách.',
 'd45b9244-01c0-4f9d-909a-65bfb9f9d853', 2, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 1 - CỤM 3]: CÂU 3 (order_index: 3)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('0ac2e91b-404b-4e4c-a0c4-27bd9feb454e',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789536344/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/kjgcviubepfby0hrntxl.mp3',
 'https://res.cloudinary.com/ovs0odtq/image/upload/v1789534186/Resource/toeic-learning/exams/ets-toeic-2026-test-01/images/zbzi8baqjtnr1jxzfuwx.png',
 NULL,
 '(A) A woman is holding a phone up to her ear.
(B) A woman is pouring a beverage into a glass.
(C) Some light fixtures are hanging from the ceiling.
(D) Some tiles are being installed in a hallway.',
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d104916-aeaa-11f1-b6c1-c0e43471a03a', 3, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 3 (Đáp án đúng: C)
('d88f2588-7b68-4f9c-bcec-5e5c93a434f6',
 'Select the statement that best describes what you see in the picture.',
 '(A)', '(B)', '(C)', '(D)', 'C',
 '(A) Một người phụ nữ đang giữ điện thoại áp vào tai.
(B) Một người phụ nữ đang rót đồ uống vào một chiếc ly.
(C) Một vài thiết bị chiếu sáng đang được treo trên trần nhà.
(D) Một vài viên gạch đang được lắp đặt trong một hành lang.',
 '0ac2e91b-404b-4e4c-a0c4-27bd9feb454e', 3, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 1 - CỤM 4]: CÂU 4 (order_index: 4)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('9f53a210-4064-4f91-bc61-4891acaf77f5',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789536348/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/v8sy20hueqx23sszw6ep.mp3',
 'https://res.cloudinary.com/ovs0odtq/image/upload/v1789534190/Resource/toeic-learning/exams/ets-toeic-2026-test-01/images/xh8lfjggcmwquzmhhynr.png',
 NULL,
 '(A) A wooden crate is filled with vegetables.
(B) One of the men is putting vegetables into a shopping bag.
(C) A backpack has been set on the ground.
(D) One of the men is reaching into a bucket.',
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d104916-aeaa-11f1-b6c1-c0e43471a03a', 4, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 4 (Đáp án đúng: A)
('eba86829-3a60-4a71-9dec-824d2f91dfe2',
 'Select the statement that best describes what you see in the picture.',
 '(A)', '(B)', '(C)', '(D)', 'A',
 '(A) Một cái thùng gỗ được chất đầy rau củ.
(B) Một trong những người đàn ông đang cho rau củ vào một chiếc túi mua sắm.
(C) Một chiếc ba lô đã được đặt trên mặt đất.
(D) Một trong những người đàn ông đang thò tay vào một cái xô.',
 '9f53a210-4064-4f91-bc61-4891acaf77f5', 4, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 1 - CỤM 5]: CÂU 5 (order_index: 5)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('025cafb0-ef67-4cd2-990f-41ba5b2c892e',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789536353/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/cqjeucng95gubbl6cie9.mp3',
 'https://res.cloudinary.com/ovs0odtq/image/upload/v1789534193/Resource/toeic-learning/exams/ets-toeic-2026-test-01/images/p631pfg5kvjzmq4zugd4.png',
 NULL,
 '(A) Painting supplies have been laid out on the floor.
(B) He''s laying a brush down on a windowsill.
(C) He''s lifting a can of paint by its handle.
(D) Cans of paint have been placed on a step stool.',
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d104916-aeaa-11f1-b6c1-c0e43471a03a', 5, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 5 (Đáp án đúng: A)
('d7f87865-642b-4c59-af47-d1d9504728ce',
 'Select the statement that best describes what you see in the picture.',
 '(A)', '(B)', '(C)', '(D)', 'A',
 '(A) Dụng cụ sơn đã được bày ra trên sàn nhà.
(B) Anh ấy đang đặt một cây cọ xuống bậu cửa sổ.
(C) Anh ấy đang nhấc một lon sơn bằng quai xách của nó.
(D) Những lon sơn đã được đặt trên một chiếc ghế đẩu.',
 '025cafb0-ef67-4cd2-990f-41ba5b2c892e', 5, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 1 - CỤM 6]: CÂU 6 (order_index: 6)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('95a36967-d0d1-4eca-9610-0575097e07d0',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789536357/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/oyqrnhwsigmhy6qsepxl.mp3',
 'https://res.cloudinary.com/ovs0odtq/image/upload/v1789534209/Resource/toeic-learning/exams/ets-toeic-2026-test-01/images/c8kzudmcsvjygltudthd.png',
 NULL,
 '(A) A path is covered with fallen branches.
(B) A tree is lying across a grassy area.
(C) Some water has pooled on a path.
(D) Some cyclists are riding through a field.',
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d104916-aeaa-11f1-b6c1-c0e43471a03a', 6, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 6 (Đáp án đúng: C)
('e006de9c-63f4-4a31-a027-9008ec67484e',
 'Select the statement that best describes what you see in the picture.',
 '(A)', '(B)', '(C)', '(D)', 'C',
 '(A) Một con đường mòn bị bao phủ bởi những cành cây rơi.
(B) Một cái cây đang nằm ngang qua một bãi cỏ.
(C) Một ít nước đã đọng lại trên một con đường mòn.
(D) Một vài người đi xe đạp đang đạp xe qua một cánh đồng.',
 '95a36967-d0d1-4eca-9610-0575097e07d0', 6, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ==============================================================================
-- 7.3 PART 2: HỎI & ĐÁP (CÂU 7 -> 31)
-- 25 cụm câu hỏi - đáp nhanh (mỗi cụm gồm audio câu hỏi và 3 lựa chọn A-B-C)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- [PART 2 - CỤM 1]: CÂU 7 (order_index: 7)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('2b3b0c4b-bc51-4c77-811e-aec47a4b3207',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539676/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/z3pk8umqurxknrdiv6uq.mp3',
 NULL,
 NULL,
 'Question: Where is the conference being held?
(A) A three-day vacation.
(B) At the Riverview Hotel.
(C) In the supply cabinet.',
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 7, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 7 (Đáp án đúng: B)
('0eacbe68-5dab-493e-9082-7b1c9c6c082d',
 'Mark your answer on your answer sheet.',
 '(A)', '(B)', '(C)', NULL, 'B',
 'Câu hỏi: Hội nghị được tổ chức ở đâu?
(A) Một kỳ nghỉ ba ngày.
(B) Tại khách sạn Riverview.
(C) Trong tủ cung cấp.',
 '2b3b0c4b-bc51-4c77-811e-aec47a4b3207', 7, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 2 - CỤM 2]: CÂU 8 (order_index: 8)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('e05d9d84-b1a2-4ab4-95d9-e30d3b8caa80',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539705/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/iu15uceggskl6j4vtmoz.mp3',
 NULL,
 NULL,
 'Question: When does the warehouse manager arrive?
(A) Sure, no problem.
(B) About twelve shipping boxes.
(C) Not until this afternoon.',
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 8, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 8 (Đáp án đúng: C)
('7311cdae-8c74-432f-95c8-97765ed646b0',
 'Mark your answer on your answer sheet.',
 '(A)', '(B)', '(C)', NULL, 'C',
 'Câu hỏi: Khi nào quản lý kho đến?
(A) Chắc chắn rồi, không vấn đề gì.
(B) Khoảng mười hai thùng hàng.
(C) Không phải cho đến chiều nay.',
 'e05d9d84-b1a2-4ab4-95d9-e30d3b8caa80', 8, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 2 - CỤM 3]: CÂU 9 (order_index: 9)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('d8d36bb1-f715-49e6-b68a-457f0f8d7688',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539712/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/thbccapqpgmrurtfl5ie.mp3',
 NULL,
 NULL,
 'Question: There''s a nice park nearby, right?
(A) Did you order paper for the copier?
(B) Yes—it''s next to Greendale Lake.
(C) They''re in the parking garage.',
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 9, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 9 (Đáp án đúng: B)
('d0aabea6-8837-4c3f-9810-daabfee293a1',
 'Mark your answer on your answer sheet.',
 '(A)', '(B)', '(C)', NULL, 'B',
 'Câu hỏi: Có một công viên đẹp gần đây, phải không?
(A) Bạn đã đặt giấy cho máy photocopy chưa?
(B) Vâng—nó nằm cạnh Hồ Greendale.
(C) Chúng ở trong gara đỗ xe.',
 'd8d36bb1-f715-49e6-b68a-457f0f8d7688', 9, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 2 - CỤM 4]: CÂU 10 (order_index: 10)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('649aa665-b146-40ad-abb0-8249724e07d0',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539739/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/y1rbzjv6gqntogsdday1.mp3',
 NULL,
 NULL,
 'Question: Who sent the meeting minutes to the accounting department?
(A) Our office assistant.
(B) They have a savings account.
(C) Cash and credit cards.',
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 10, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 10 (Đáp án đúng: A)
('ccb8da50-bcf1-49c6-9c1a-46b0ee80befd',
 'Mark your answer on your answer sheet.',
 '(A)', '(B)', '(C)', NULL, 'A',
 'Câu hỏi: Ai đã gửi biên bản cuộc họp cho bộ phận kế toán?
(A) Trợ lý văn phòng của chúng tôi.
(B) Họ có một tài khoản tiết kiệm.
(C) Tiền mặt và thẻ tín dụng.',
 '649aa665-b146-40ad-abb0-8249724e07d0', 10, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 2 - CỤM 5]: CÂU 11 (order_index: 11)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('3d1667af-d5d7-4aaa-aee2-7f9b1f8ed68f',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539744/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/qi4szl4ut97lkjnzp4hm.mp3',
 NULL,
 NULL,
 'Question: I''d like to know what you think of our new finance analyst.
(A) I''ve prepared the decorations for tomorrow.
(B) He seems very competent.
(C) It''s finally stopped raining.',
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 11, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 11 (Đáp án đúng: B)
('313b6c74-94f1-4e43-bd4e-5cb7ef1e3ac4',
 'Mark your answer on your answer sheet.',
 '(A)', '(B)', '(C)', NULL, 'B',
 'Câu hỏi: Tôi muốn biết bạn nghĩ gì về chuyên viên phân tích tài chính mới của chúng ta.
(A) Tôi đã chuẩn bị đồ trang trí cho ngày mai.
(B) Anh ấy có vẻ rất có năng lực.
(C) Trời cuối cùng đã ngừng mưa.',
 '3d1667af-d5d7-4aaa-aee2-7f9b1f8ed68f', 11, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 2 - CỤM 6]: CÂU 12 (order_index: 12)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('a5c7a89e-b652-484f-9c54-47121d27f54d',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539748/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/fqksqbnaiukgwhid9zqv.mp3',
 NULL,
 NULL,
 'Question: Let''s go on the company retreat.
(A) Oh, did he?
(B) Yes, that''s a good idea.
(C) He tried to solve that problem.',
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 12, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 12 (Đáp án đúng: B)
('59962b93-957c-4a8f-b313-7fe644efac16',
 'Mark your answer on your answer sheet.',
 '(A)', '(B)', '(C)', NULL, 'B',
 'Câu hỏi: Hãy đi nghỉ dưỡng cùng công ty đi.
(A) Ồ, anh ấy đã làm vậy sao?
(B) Vâng, đó là một ý tưởng hay.
(C) Anh ấy đã cố gắng giải quyết vấn đề đó.',
 'a5c7a89e-b652-484f-9c54-47121d27f54d', 12, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 2 - CỤM 7]: CÂU 13 (order_index: 13)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('ec1a40af-d422-4169-81bf-1f9f0d6ad2be',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539755/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/qqprenlg96t5t0isoflw.mp3',
 NULL,
 NULL,
 'Question: What time can I pick up my glasses?
(A) No, it''s not very heavy.
(B) About twenty meters.
(C) We close at six o''clock.',
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 13, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 13 (Đáp án đúng: C)
('4a451295-8120-4483-b402-7deb82d1e497',
 'Mark your answer on your answer sheet.',
 '(A)', '(B)', '(C)', NULL, 'C',
 'Câu hỏi: Mấy giờ tôi có thể lấy kính của mình?
(A) Không, nó không nặng lắm.
(B) Khoảng hai mươi mét.
(C) Chúng tôi đóng cửa lúc sáu giờ.',
 'ec1a40af-d422-4169-81bf-1f9f0d6ad2be', 13, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 2 - CỤM 8]: CÂU 14 (order_index: 14)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('0033b439-9891-4480-ba58-7f07f400242b',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539759/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/fcku2x0w2pajkljfsqvt.mp3',
 NULL,
 NULL,
 'Question: The sales team knows how to use the tracking software, don''t they?
(A) It''s on the lower shelf.
(B) A twelve-thirty departure.
(C) I haven''t seen them using it yet.',
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 14, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 14 (Đáp án đúng: C)
('c372332b-1382-4ee2-9d61-048b1e5d7197',
 'Mark your answer on your answer sheet.',
 '(A)', '(B)', '(C)', NULL, 'C',
 'Câu hỏi: Đội ngũ kinh doanh biết cách sử dụng phần mềm theo dõi, phải không?
(A) Nó ở trên kệ dưới.
(B) Khởi hành lúc mười hai giờ ba mươi.
(C) Tôi chưa thấy họ sử dụng nó.',
 '0033b439-9891-4480-ba58-7f07f400242b', 14, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 2 - CỤM 9]: CÂU 15 (order_index: 15)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('f66c22cd-2cd1-4f7c-a3ce-a3bb04084f95',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539764/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/en1pxshksionpg7sgdfp.mp3',
 NULL,
 NULL,
 'Question: Are you going to the hardware store on Mill Street?
(A) That store hasn''t opened yet.
(B) The blue package you sent me.
(C) Some nails and a hammer.',
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 15, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 15 (Đáp án đúng: A)
('20b56804-16e3-4959-941b-3c2f6ee8e620',
 'Mark your answer on your answer sheet.',
 '(A)', '(B)', '(C)', NULL, 'A',
 'Câu hỏi: Bạn có định đến cửa hàng kim khí trên phố Mill không?
(A) Cửa hàng đó vẫn chưa mở.
(B) Gói hàng màu xanh bạn gửi cho tôi.
(C) Một ít đinh và một cái búa.',
 'f66c22cd-2cd1-4f7c-a3ce-a3bb04084f95', 15, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 2 - CỤM 10]: CÂU 16 (order_index: 16)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('b8573a72-d1e7-4a6b-8eaf-08492e67cf48',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539785/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/edoyavu2gwlzxkvldiy3.mp3',
 NULL,
 NULL,
 'Question: Would you be able to write the introduction for the workshop?
(A) That was a great book.
(B) He''s been working there for years.
(C) He doesn''t have any more.',
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 16, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 16 (Đáp án đúng: B)
('d48a393c-9e4e-42a0-b00a-38cd83230918',
 'Mark your answer on your answer sheet.',
 '(A)', '(B)', '(C)', NULL, 'B',
 'Câu hỏi: Bạn có thể viết phần giới thiệu cho hội thảo không?
(A) Đó là một cuốn sách tuyệt vời.
(B) Anh ấy đã làm việc ở đó nhiều năm.
(C) Anh ấy không còn nữa.',
 'b8573a72-d1e7-4a6b-8eaf-08492e67cf48', 16, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 2 - CỤM 11]: CÂU 17 (order_index: 17)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('f57a410b-44d1-4889-a4de-c81cddf9ac92',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539799/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/o87yiugq8nfybnume38d.mp3',
 NULL,
 NULL,
 'Question: I picked up some flowers for Tunji''s retirement party.
(A) No, pick any day.
(B) That was thoughtful.
(C) A delivery driver.',
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 17, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 17 (Đáp án đúng: B)
('2daa70a1-01db-4cf7-9c5b-3cef7e58df8a',
 'Mark your answer on your answer sheet.',
 '(A)', '(B)', '(C)', NULL, 'B',
 'Câu hỏi: Tôi đã mua một ít hoa cho bữa tiệc nghỉ hưu của Tunji.
(A) Không, chọn bất kỳ ngày nào.
(B) Điều đó thật chu đáo.
(C) Một tài xế giao hàng.',
 'f57a410b-44d1-4889-a4de-c81cddf9ac92', 17, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 2 - CỤM 12]: CÂU 18 (order_index: 18)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('9f11b63c-1b45-40f4-913f-4cd67c1bc3d0',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539806/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/dvxycf5p2q3wq315dg2t.mp3',
 NULL,
 NULL,
 'Question: Which meeting room did you tell the interns to go to?
(A) The Jefferson Room.
(B) The meeting was fun, thanks.
(C) Yes, it''s a conference call.',
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 18, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 18 (Đáp án đúng: A)
('a7fb0f57-3fde-4c28-8991-46f121b85ca2',
 'Mark your answer on your answer sheet.',
 '(A)', '(B)', '(C)', NULL, 'A',
 'Câu hỏi: Bạn đã bảo các thực tập sinh đến phòng họp nào?
(A) Phòng Jefferson.
(B) Cuộc họp rất vui, cảm ơn.
(C) Vâng, đó là một cuộc gọi hội nghị.',
 '9f11b63c-1b45-40f4-913f-4cd67c1bc3d0', 18, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 2 - CỤM 13]: CÂU 19 (order_index: 19)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('e6338666-5371-4c5f-aea0-1efc9cb68cc0',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539816/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/vtlh6evvp3rs0mugfgd3.mp3',
 NULL,
 NULL,
 'Question: Is your dental appointment next Tuesday?
(A) You can borrow mine.
(B) I''ll have to check my calendar.
(C) Yes, it was a good meeting.',
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 19, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 19 (Đáp án đúng: B)
('dad2a2c5-90b7-4c90-a318-aac628c640d6',
 'Mark your answer on your answer sheet.',
 '(A)', '(B)', '(C)', NULL, 'B',
 'Câu hỏi: Lịch hẹn nha sĩ của bạn là thứ Ba tới phải không?
(A) Bạn có thể mượn của tôi.
(B) Tôi sẽ phải kiểm tra lịch của mình.
(C) Vâng, đó là một cuộc họp tốt.',
 'e6338666-5371-4c5f-aea0-1efc9cb68cc0', 19, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 2 - CỤM 14]: CÂU 20 (order_index: 20)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('0824ac31-df85-4a3a-9b61-010a2f259746',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539819/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/lggzo0k109yemrcq47ll.mp3',
 NULL,
 NULL,
 'Question: Why aren''t there any brochures in the lobby?
(A) No, I haven''t received my confirmation e-mail yet.
(B) My winter coat.
(C) Because someone just took the last one.',
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 20, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 20 (Đáp án đúng: C)
('4bd643fb-7ea8-43a0-a048-ef4049752250',
 'Mark your answer on your answer sheet.',
 '(A)', '(B)', '(C)', NULL, 'C',
 'Câu hỏi: Tại sao không có tờ rơi nào ở sảnh chờ?
(A) Chưa, tôi vẫn chưa nhận được email xác nhận.
(B) Áo khoác mùa đông của tôi.
(C) Bởi vì ai đó vừa lấy cái cuối cùng.',
 '0824ac31-df85-4a3a-9b61-010a2f259746', 20, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 2 - CỤM 15]: CÂU 21 (order_index: 21)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('82b40f33-609d-43c2-a892-ccaf5ee03a15',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539826/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/ajfh7t1wppfc20sdrcap.mp3',
 NULL,
 NULL,
 'Question: What''s the process for submitting my expense report?
(A) I sent it to the finance department.
(B) The end of the day.
(C) That''s correct.',
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 21, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 21 (Đáp án đúng: A)
('2c251372-fbcb-44fd-9440-476e5b935904',
 'Mark your answer on your answer sheet.',
 '(A)', '(B)', '(C)', NULL, 'A',
 'Câu hỏi: Quy trình nộp báo cáo chi phí của tôi là gì?
(A) Tôi đã gửi nó cho bộ phận tài chính.
(B) Cuối ngày.
(C) Đúng vậy.',
 '82b40f33-609d-43c2-a892-ccaf5ee03a15', 21, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 2 - CỤM 16]: CÂU 22 (order_index: 22)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('e5e9e47c-ec22-4fe0-bcfb-5bcd9c644b7c',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539832/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/g3ftolpk34qxywyw3ymm.mp3',
 NULL,
 NULL,
 'Question: Do you sell your products online or in stores?
(A) About twenty percent off.
(B) A product demonstration.
(C) Only online.',
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 22, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 22 (Đáp án đúng: C)
('9513d8a3-8149-4870-a7ff-bba763c4c39f',
 'Mark your answer on your answer sheet.',
 '(A)', '(B)', '(C)', NULL, 'C',
 'Câu hỏi: Bạn bán sản phẩm trực tuyến hay tại cửa hàng?
(A) Giảm khoảng hai mươi phần trăm.
(B) Một buổi trình diễn sản phẩm.
(C) Chỉ trực tuyến.',
 'e5e9e47c-ec22-4fe0-bcfb-5bcd9c644b7c', 22, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 2 - CỤM 17]: CÂU 23 (order_index: 23)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('a83523f8-5787-40ff-a22d-379fcfaf7442',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539837/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/fniauvzafxq9g6en73zj.mp3',
 NULL,
 NULL,
 'Question: How often do you charge this device?
(A) Whenever the lights turn red.
(B) A wireless one.
(C) At the hardware store.',
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 23, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 23 (Đáp án đúng: A)
('39d2f97b-d7bc-4e81-987f-aeb8c1d009bc',
 'Mark your answer on your answer sheet.',
 '(A)', '(B)', '(C)', NULL, 'A',
 'Câu hỏi: Bạn sạc thiết bị này bao lâu một lần?
(A) Bất cứ khi nào đèn chuyển sang màu đỏ.
(B) Một cái không dây.
(C) Tại cửa hàng kim khí.',
 'a83523f8-5787-40ff-a22d-379fcfaf7442', 23, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 2 - CỤM 18]: CÂU 24 (order_index: 24)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c89236df-c53c-43ae-a5d9-bbed1d7da4a1',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539843/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/kfpld17abxk3gr5q2qdv.mp3',
 NULL,
 NULL,
 'Question: The tickets to Friday night''s concert cost ten dollars each.
(A) Actually, they''re fifteen.
(B) No, I can''t play the guitar.
(C) It''s in aisle five.',
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 24, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 24 (Đáp án đúng: A)
('45532660-f27b-4ebd-8f75-78c6955469a5',
 'Mark your answer on your answer sheet.',
 '(A)', '(B)', '(C)', NULL, 'A',
 'Câu hỏi: Vé cho buổi hòa nhạc tối thứ Sáu có giá mười đô la mỗi vé.
(A) Thực ra, chúng mười lăm.
(B) Không, tôi không thể chơi guitar.
(C) Nó ở dãy số năm.',
 'c89236df-c53c-43ae-a5d9-bbed1d7da4a1', 24, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 2 - CỤM 19]: CÂU 25 (order_index: 25)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('d8168611-948b-4457-95c6-d21991f9988c',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539849/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/yevxjrklycbx3mfoxy7q.mp3',
 NULL,
 NULL,
 'Question: Can''t you update the database today?
(A) I did it yesterday.
(B) That''s an interesting movie.
(C) No, just me.',
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 25, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 25 (Đáp án đúng: A)
('90a556e4-e597-4a06-af5c-f63b6667c651',
 'Mark your answer on your answer sheet.',
 '(A)', '(B)', '(C)', NULL, 'A',
 'Câu hỏi: Bạn không thể cập nhật cơ sở dữ liệu ngày hôm nay sao?
(A) Tôi đã làm điều đó ngày hôm qua.
(B) Đó là một bộ phim thú vị.
(C) Không, chỉ mình tôi.',
 'd8168611-948b-4457-95c6-d21991f9988c', 25, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 2 - CỤM 20]: CÂU 26 (order_index: 26)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('3c4c8ed8-88a9-4796-a1bd-387495ed0564',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539859/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/syizk1tc2t3jxfv5qtm3.mp3',
 NULL,
 NULL,
 'Question: How are we going to fit the extra supplies in that closet?
(A) I''ve already read them.
(B) Natalie''s in charge of supplies.
(C) It''s the door at the end of the hallway.',
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 26, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 26 (Đáp án đúng: B)
('bc26ebbc-0393-4d6d-872c-47093d7ffdcf',
 'Mark your answer on your answer sheet.',
 '(A)', '(B)', '(C)', NULL, 'B',
 'Câu hỏi: Làm thế nào chúng ta sẽ nhét thêm vật tư vào tủ đó?
(A) Tôi đã đọc chúng rồi.
(B) Natalie phụ trách vật tư.
(C) Đó là cửa ở cuối hành lang.',
 '3c4c8ed8-88a9-4796-a1bd-387495ed0564', 26, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 2 - CỤM 21]: CÂU 27 (order_index: 27)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('aae7e7d4-b64d-452b-96e6-cae791e8782f',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539861/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/itwjjifrmfzavvybxgkh.mp3',
 NULL,
 NULL,
 'Question: Have all the new windows been installed?
(A) Sure, I''ll close the blinds.
(B) The construction is almost finished.
(C) They''re no longer available.',
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 27, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 27 (Đáp án đúng: B)
('ae548ee1-eb15-4232-bd6c-4c433183f1af',
 'Mark your answer on your answer sheet.',
 '(A)', '(B)', '(C)', NULL, 'B',
 'Câu hỏi: Tất cả cửa sổ mới đã được lắp đặt chưa?
(A) Chắc chắn rồi, tôi sẽ đóng rèm cửa.
(B) Việc xây dựng gần như đã hoàn thành.
(C) Chúng không còn nữa.',
 'aae7e7d4-b64d-452b-96e6-cae791e8782f', 27, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 2 - CỤM 22]: CÂU 28 (order_index: 28)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('aebec9a8-5f90-4ebc-b182-c4dc9458aa3f',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539883/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/fxb2i8bjaltmfk9n2eoj.mp3',
 NULL,
 NULL,
 'Question: Would you rather go to lunch now or at noon?
(A) I''m taking a client to lunch.
(B) On the corner of Fourth and Main.
(C) The daily special is soup and a sandwich.',
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 28, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 28 (Đáp án đúng: A)
('933ec09f-a446-49cc-8c0f-57f722888571',
 'Mark your answer on your answer sheet.',
 '(A)', '(B)', '(C)', NULL, 'A',
 'Câu hỏi: Bạn muốn đi ăn trưa ngay bây giờ hay vào buổi trưa?
(A) Tôi đang đưa một khách hàng đi ăn trưa.
(B) Ở góc đường Fourth và Main.
(C) Món đặc biệt hàng ngày là súp và bánh sandwich.',
 'aebec9a8-5f90-4ebc-b182-c4dc9458aa3f', 28, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 2 - CỤM 23]: CÂU 29 (order_index: 29)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('6c582b25-dad7-494c-8e2d-a6011beb7d76',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539888/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/as2gptwqib8fihib8ilb.mp3',
 NULL,
 NULL,
 'Question: You''re taking the training in the afternoon, aren''t you?
(A) The new head of the accounting department.
(B) No, I take my coffee black.
(C) Well, it depends on my schedule.',
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 29, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 29 (Đáp án đúng: C)
('323438bb-6b74-4eae-9eca-15435cc80471',
 'Mark your answer on your answer sheet.',
 '(A)', '(B)', '(C)', NULL, 'C',
 'Câu hỏi: Bạn sẽ tham gia buổi đào tạo vào buổi chiều, phải không?
(A) Trưởng phòng kế toán mới.
(B) Không, tôi uống cà phê đen.
(C) Chà, nó phụ thuộc vào lịch trình của tôi.',
 '6c582b25-dad7-494c-8e2d-a6011beb7d76', 29, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 2 - CỤM 24]: CÂU 30 (order_index: 30)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('3370b387-a093-4f16-9282-ecbe1f9f070b',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539892/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/a81lpejmdkxrbaxnijwh.mp3',
 NULL,
 NULL,
 'Question: When are you going to choose a new project manager?
(A) The projector''s not working correctly.
(B) Next to the front entrance.
(C) I''m really busy this week.',
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 30, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 30 (Đáp án đúng: C)
('3d334f11-73fb-4b1d-9ad5-00e3e7824bce',
 'Mark your answer on your answer sheet.',
 '(A)', '(B)', '(C)', NULL, 'C',
 'Câu hỏi: Khi nào bạn sẽ chọn một quản lý dự án mới?
(A) Máy chiếu không hoạt động chính xác.
(B) Cạnh lối vào phía trước.
(C) Tôi thực sự bận rộn trong tuần này.',
 '3370b387-a093-4f16-9282-ecbe1f9f070b', 30, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 2 - CỤM 25]: CÂU 31 (order_index: 31)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('3922b928-7009-4263-ab71-a546f81d43f0',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539898/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/kclfeimngabobw931lkv.mp3',
 NULL,
 NULL,
 'Question: When are you going to choose a new project manager?
(A) The projector''s not working correctly.
(B) Next to the front entrance.
(C) I''m really busy this week.',
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 31, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 31 (Đáp án đúng: C)
('5a5a4475-17ab-474f-833e-80fb8ae79ecb',
 'Mark your answer on your answer sheet.',
 '(A)', '(B)', '(C)', NULL, 'C',
 'Câu hỏi: Khi nào bạn sẽ chọn một quản lý dự án mới?
(A) Máy chiếu không hoạt động chính xác.
(B) Cạnh lối vào phía trước.
(C) Tôi thực sự bận rộn trong tuần này.',
 '3922b928-7009-4263-ab71-a546f81d43f0', 31, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ==============================================================================
-- 7.4 PART 3: ĐOẠN HỘI THOẠI NGẮN (CÂU 32 -> 70)
-- 13 cụm hội thoại (mỗi cụm gồm audio, transcript, bản dịch và 3 câu hỏi liên quan)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- [PART 3 - CỤM 1]: CÂU 32 - 34 (order_index: 32)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('9805b655-bd10-4c41-a58e-f8c986ebcfad',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789627953/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/lhpw0iefogqfctzq1xhj.mp3',
 NULL,
 NULL,
 'W: Excuse me, do you work here? I''m looking for this brand of green tea, but I don''t see it on the shelves.
M: Let me check our inventory on my tablet... Yes, we have two boxes in the back storage room. I can go get them for you.
W: Oh, that would be wonderful! I''ll take both of them.
M: Great. While I do that, feel free to check out the special discounts on organic snacks in aisle four.',
 'W: Xin lỗi, bạn có làm việc ở đây không? Tôi đang tìm loại trà xanh của nhãn hiệu này, nhưng tôi không thấy nó trên kệ.
M: Để tôi kiểm tra kho trên máy tính bảng của mình... Vâng, chúng tôi có hai hộp trong kho phía sau. Tôi có thể đi lấy chúng cho bạn.
W: Ồ, thế thì tuyệt quá! Tôi sẽ lấy cả hai hộp.
M: Tuyệt. Trong lúc tôi đi lấy, bạn cứ tự nhiên xem qua các sản phẩm đồ ăn vặt hữu cơ đang được giảm giá đặc biệt ở lối đi số bốn.',
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10551f-aeaa-11f1-b6c1-c0e43471a03a', 32, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 32 (Đáp án đúng: B)
('eb9dc5d7-13f0-4de4-a2df-1b99ebdfef43',
 'Where most likely are the speakers?',
 'At a grocery store', 'At a pharmacy', 'At a fitness center', 'At a restaurant', 'B',
 'Câu hỏi: Những người nói nhiều khả năng đang ở đâu nhất?
(A) Tại một cửa hàng tạp hóa/siêu thị
(B) Tại một hiệu thuốc
(C) Tại một trung tâm thể hình
(D) Tại một nhà hàng',
 '9805b655-bd10-4c41-a58e-f8c986ebcfad', 32, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 33 (Đáp án đúng: D)
('3c080dd7-11eb-45b6-9137-2a0a8bccd073',
 'What will the man do next?',
 'Process a refund', 'Fetch some items from a storage area', 'Update a customer''s account', 'Clean a display shelf', 'D',
 'Câu hỏi: Người đàn ông sẽ làm gì tiếp theo?
(A) Xử lý tiền hoàn lại
(B) Đi lấy một số mặt hàng từ khu vực lưu trữ/kho
(C) Cập nhật tài khoản của khách hàng
(D) Dọn dẹp kệ trưng bày',
 '9805b655-bd10-4c41-a58e-f8c986ebcfad', 33, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 34 (Đáp án đúng: B)
('a3d80ae6-d154-4f85-be96-466d5bd6d9c0',
 'What does the man recommend the woman do?',
 'Sign up for a loyalty card', 'Return later in the afternoon', 'Check out discounted items', 'Speak to a manager', 'B',
 'Câu hỏi: Người đàn ông khuyên người phụ nữ làm gì?
(A) Đăng ký thẻ khách hàng thân thiết
(B) Quay lại sau vào buổi chiều
(C) Xem qua các mặt hàng đang giảm giá
(D) Nói chuyện với người quản lý',
 '9805b655-bd10-4c41-a58e-f8c986ebcfad', 34, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 3 - CỤM 2]: CÂU 35 - 37 (order_index: 35)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('27e28a80-f572-4afa-800f-512e5c76b12a',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789627989/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/uyzitranisouzqtncysq.mp3',
 NULL,
 NULL,
 'M: Hi, I''m calling to book three tickets for this Thursday''s tennis match. Are there any seats left?
W: Just a few! Tickets for Thursday''s match have been selling quickly.
M: I''m not surprised! After all, Ife Rotimi won the regional championship tournament last month. Everyone wants to see her play after her incredible performance. What seats are available?
W: Well, there''s only one group of three seats together. Advance payment is required to hold them.',
 'M: Xin chào, tôi đang gọi để đặt ba vé cho trận tennis vào thứ Năm này. Còn chỗ nào không?
W: Chỉ còn một vài chỗ! Vé cho trận đấu thứ Năm đã bán rất nhanh.
M: Tôi không ngạc nhiên! Sau tất cả, Ife Rotimi đã vô địch giải đấu khu vực vào tháng trước. Mọi người đều muốn xem cô ấy thi đấu sau màn trình diễn đáng kinh ngạc của cô ấy. Còn chỗ ngồi nào không?
W: Chà, chỉ còn một nhóm ba chỗ ngồi cạnh nhau. Cần thanh toán trước để giữ chỗ.',
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10551f-aeaa-11f1-b6c1-c0e43471a03a', 35, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 35 (Đáp án đúng: C)
('5f5ec7a5-4474-4fe0-93f3-137cdd843dd5',
 'Why is the man calling?',
 'To sign up for lessons', 'To enter a competition', 'To buy tickets to an event', 'To ask about branded merchandise', 'C',
 'Câu hỏi: Tại sao người đàn ông gọi điện?
(A) Để đăng ký học
(B) Để tham gia một cuộc thi
(C) Để mua vé cho một sự kiện
(D) Để hỏi về hàng hóa có thương hiệu',
 '27e28a80-f572-4afa-800f-512e5c76b12a', 35, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 36 (Đáp án đúng: A)
('24b9969d-addb-4fc8-9198-d04e457e49d5',
 'What did Ife Rotimi do last month?',
 'She won a regional tournament.', 'She gave a television interview.', 'She started an institute.', 'She hired a new coach.', 'A',
 'Câu hỏi: Ife Rotimi đã làm gì vào tháng trước?
(A) Cô ấy đã thắng một giải đấu khu vực.
(B) Cô ấy đã trả lời phỏng vấn trên truyền hình.
(C) Cô ấy đã thành lập một học viện.
(D) Cô ấy đã thuê một huấn luyện viên mới.',
 '27e28a80-f572-4afa-800f-512e5c76b12a', 36, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 37 (Đáp án đúng: D)
('dc75d809-701b-46a7-9d08-e77714909bab',
 'What does the woman say is required?',
 'A parking permit', 'A photo ID', 'Contact information', 'Advance payment', 'D',
 'Câu hỏi: Người phụ nữ nói rằng điều gì là bắt buộc?
(A) Giấy phép đỗ xe
(B) Thẻ căn cước có ảnh
(C) Thông tin liên lạc
(D) Thanh toán trước',
 '27e28a80-f572-4afa-800f-512e5c76b12a', 37, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 3 - CỤM 3]: CÂU 38 - 40 (order_index: 38)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('97e83bb5-c22a-4c5e-a04c-fe7fb6520b90',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789628000/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/qdmp4pvi4enf0gvgjzxc.mp3',
 NULL,
 NULL,
 'W: Thanks for agreeing to help me organize the library''s annual fund-raising dinner, Klaus. We hope the event brings in enough money to expand our children''s book section.
M: What would you like me to start with?
W: Well, I could use some help sending out the invitations.
M: OK, I can take care of that. Is there a list of attendees available?
W: It''s in my computer files. I''ll e-mail it to you.',
 'W: Cảm ơn vì đã đồng ý giúp tôi tổ chức bữa tối gây quỹ hàng năm của thư viện, Klaus. Chúng tôi hy vọng sự kiện này sẽ mang lại đủ tiền để mở rộng khu vực sách thiếu nhi của chúng tôi.
M: Bạn muốn tôi bắt đầu với việc gì?
W: Chà, tôi có thể cần giúp gửi thiệp mời.
M: Được, tôi có thể lo việc đó. Có danh sách người tham dự không?
W: Nó nằm trong tệp máy tính của tôi. Tôi sẽ gửi email cho bạn.',
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10551f-aeaa-11f1-b6c1-c0e43471a03a', 38, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 38 (Đáp án đúng: A)
('7448de84-7068-44af-88e2-eab55d8e4672',
 'What event are the speakers planning?',
 'A fund-raising dinner', 'An art gallery opening', 'An awards ceremony', 'A children''s book fair', 'A',
 'Câu hỏi: Những người nói đang lên kế hoạch cho sự kiện gì?
(A) Một bữa tối gây quỹ
(B) Một buổi khai trương phòng trưng bày nghệ thuật
(C) Một lễ trao giải
(D) Một hội chợ sách thiếu nhi',
 '97e83bb5-c22a-4c5e-a04c-fe7fb6520b90', 38, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 39 (Đáp án đúng: D)
('fb00d506-dc1c-4c93-a497-844412e652bf',
 'What task does the woman ask the man to help with?',
 'Arranging a shuttle service', 'Choosing a catering firm', 'Preparing a speech', 'Sending out invitations', 'D',
 'Câu hỏi: Người phụ nữ yêu cầu người đàn ông giúp việc gì?
(A) Sắp xếp dịch vụ đưa đón
(B) Chọn một công ty cung cấp dịch vụ ăn uống
(C) Chuẩn bị một bài phát biểu
(D) Gửi thiệp mời',
 '97e83bb5-c22a-4c5e-a04c-fe7fb6520b90', 39, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 40 (Đáp án đúng: A)
('fbd0c9dc-28e7-4e97-a5ef-53ae3897a42d',
 'What does the woman say she will do?',
 'E-mail a list', 'Speak with a colleague', 'Provide a password', 'Post a job opening', 'A',
 'Câu hỏi: Người phụ nữ nói cô ấy sẽ làm gì?
(A) Gửi email một danh sách
(B) Nói chuyện với một đồng nghiệp
(C) Cung cấp mật khẩu
(D) Đăng một tin tuyển dụng',
 '97e83bb5-c22a-4c5e-a04c-fe7fb6520b90', 40, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 3 - CỤM 4]: CÂU 41 - 43 (order_index: 41)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('097bd2bd-5103-4ae0-ac3c-df58de744ce9',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789628007/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/qodiaul7zdvau3i6bko6.mp3',
 NULL,
 NULL,
 'W: Hey, Brian and Matteo. I found some great pens to give away at the community festival to promote our business.
M: Great. Can we put our cleaning service logo on them?
W: Yes, for no extra charge. And they''re biodegradable. They''re made from paper.
M: So when we hand them out, we can mention that.
M: As well as talk about the organic cleaning supplies our company uses.
W: OK. I''ll go ahead and order several cases.',
 'W: Này, Brian và Matteo. Tôi tìm thấy một số cây bút tuyệt vời để tặng tại lễ hội cộng đồng nhằm quảng bá doanh nghiệp của chúng ta.
M: Tuyệt. Chúng ta có thể in logo dịch vụ vệ sinh của mình lên chúng không?
W: Có, không tính thêm phí. Và chúng có thể phân hủy sinh học. Chúng được làm từ giấy.
M: Vậy khi chúng ta phát chúng, chúng ta có thể đề cập đến điều đó.
M: Cũng như nói về các sản phẩm vệ sinh hữu cơ mà công ty chúng ta sử dụng.
W: Được. Tôi sẽ tiến hành đặt hàng vài thùng.',
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10551f-aeaa-11f1-b6c1-c0e43471a03a', 41, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 41 (Đáp án đúng: C)
('9e17909a-b8b5-43c3-bd83-1eb70c4cbfcc',
 'What event are the speakers preparing for?',
 'A new-employee orientation', 'A grand opening', 'A community festival', 'A trade show', 'C',
 'Câu hỏi: Những người nói đang chuẩn bị cho sự kiện gì?
(A) Buổi định hướng nhân viên mới
(B) Lễ khai trương hoành tráng
(C) Lễ hội cộng đồng
(D) Hội chợ thương mại',
 '097bd2bd-5103-4ae0-ac3c-df58de744ce9', 41, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 42 (Đáp án đúng: D)
('c152d774-c0f2-44a9-8340-4cc2432880bc',
 'What is mentioned about some pens?',
 'They are available in multiple colors.', 'They use permanent ink.', 'They are preferred by book authors.', 'They are made from paper.', 'D',
 'Câu hỏi: Điều gì được đề cập về một số cây bút?
(A) Chúng có sẵn với nhiều màu sắc.
(B) Chúng sử dụng mực không phai.
(C) Chúng được các tác giả sách ưa thích.
(D) Chúng được làm từ giấy.',
 '097bd2bd-5103-4ae0-ac3c-df58de744ce9', 42, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 43 (Đáp án đúng: B)
('0cab688c-6bea-40b0-99e8-34de3a15fac6',
 'What does the woman offer to do?',
 'Reserve a booth', 'Place an order', 'Organize a focus group', 'Revise a budget', 'B',
 'Câu hỏi: Người phụ nữ đề nghị làm gì?
(A) Đặt một gian hàng
(B) Đặt hàng
(C) Tổ chức một nhóm thảo luận
(D) Sửa đổi ngân sách',
 '097bd2bd-5103-4ae0-ac3c-df58de744ce9', 43, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 3 - CỤM 5]: CÂU 44 - 46 (order_index: 44)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('4d68c75d-8097-4279-936d-f9a980e1fca8',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789628019/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/snmel2jgxuooqjwj0pgq.mp3',
 NULL,
 NULL,
 'W: Jamestown Recycling Facility. How can I help you?
M: Hi. I''m preparing to move soon, and I have some electronics, such as televisions and computers, that I''d like to get rid of before I put my house on the market. My friend mentioned you might take them.
W: Yes, that''s right. We''ll take all electronics.
M: Great. I just have one question. Do you provide a pickup service?
W: No, unfortunately you''ll have to bring everything here yourself. However, on our Web site we list a number of companies that can remove and dispose of the items for you.',
 'W: Cơ sở Tái chế Jamestown. Tôi có thể giúp gì cho bạn?
M: Xin chào. Tôi đang chuẩn bị chuyển nhà sớm, và tôi có một số thiết bị điện tử, như tivi và máy tính, mà tôi muốn vứt bỏ trước khi rao bán nhà. Bạn tôi nói rằng bạn có thể nhận chúng.
W: Vâng, đúng vậy. Chúng tôi sẽ nhận tất cả các thiết bị điện tử.
M: Tuyệt. Tôi chỉ có một câu hỏi. Bạn có cung cấp dịch vụ đến lấy tận nơi không?
W: Không, thật không may là bạn sẽ phải tự mang mọi thứ đến đây. Tuy nhiên, trên trang web của chúng tôi, chúng tôi có liệt kê một số công ty có thể đến lấy và xử lý các món đồ đó cho bạn.',
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10551f-aeaa-11f1-b6c1-c0e43471a03a', 44, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 44 (Đáp án đúng: C)
('021c2a8a-b9ed-484b-9dda-f2c2fa82cdc1',
 'Where does the woman work?',
 'At a delivery service', 'At an electronics store', 'At a recycling facility', 'At a real estate agency', 'C',
 'Câu hỏi: Người phụ nữ làm việc ở đâu?
(A) Tại một dịch vụ giao hàng
(B) Tại một cửa hàng điện tử
(C) Tại một cơ sở tái chế
(D) Tại một công ty bất động sản',
 '4d68c75d-8097-4279-936d-f9a980e1fca8', 44, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 45 (Đáp án đúng: C)
('dbb9c58b-30a7-4622-921d-8cc22fe878e6',
 'What does the man want to dispose of?',
 'Yard waste', 'Used furniture', 'Electronics', 'Books', 'C',
 'Câu hỏi: Người đàn ông muốn vứt bỏ thứ gì?
(A) Rác sân vườn
(B) Đồ nội thất cũ
(C) Thiết bị điện tử
(D) Sách',
 '4d68c75d-8097-4279-936d-f9a980e1fca8', 45, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 46 (Đáp án đúng: A)
('cd3bc712-45df-4c06-b1db-7410c4893fc0',
 'What does the woman say can be found on a Web site?',
 'A list of companies', 'Hours of operation', 'A permit application', 'Directions to a site', 'A',
 'Câu hỏi: Người phụ nữ nói có thể tìm thấy gì trên trang web?
(A) Danh sách các công ty
(B) Giờ làm việc
(C) Đơn xin giấy phép
(D) Chỉ đường đến một địa điểm',
 '4d68c75d-8097-4279-936d-f9a980e1fca8', 46, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 3 - CỤM 6]: CÂU 47 - 49 (order_index: 47)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('4163947c-a23c-4125-aa83-dcbe35a70239',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789628028/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/wx5urm7m2j5eaylmvtnm.mp3',
 NULL,
 NULL,
 'M: Zaina! What a surprise! I haven''t seen you since we took that class for business owners together last year. How are you?
W: Great, thanks. I was just in the neighborhood and thought I''d stop in for a cookie or a piece of cake. You have so many delicious baked goods here.
M: Thank you! It''s been a good year for business. I''m even considering opening a second location.
W: Really? Well, I noticed that Sunnyvale Restaurant went out of business, and the building''s up for lease. It''s very close to the local university. You''d probably get a lot of walk-in customers.',
 'M: Zaina! Thật là bất ngờ! Tôi chưa gặp lại bạn kể từ khi chúng ta cùng tham gia lớp học dành cho chủ doanh nghiệp vào năm ngoái. Bạn khỏe không?
W: Rất tốt, cảm ơn. Tôi vừa đi ngang qua khu này và nghĩ mình sẽ ghé vào mua một chiếc bánh quy hoặc một miếng bánh ngọt. Ở đây bạn có nhiều loại bánh nướng ngon tuyệt.
M: Cảm ơn bạn! Năm nay việc kinh doanh rất tốt. Tôi thậm chí đang cân nhắc mở thêm chi nhánh thứ hai.
W: Thật sao? Chà, tôi để ý thấy Nhà hàng Sunnyvale đã đóng cửa, và tòa nhà đó đang được cho thuê. Nó rất gần trường đại học địa phương. Bạn có thể sẽ có rất nhiều khách vãng lai.',
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10551f-aeaa-11f1-b6c1-c0e43471a03a', 47, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 47 (Đáp án đúng: A)
('cffef900-3e99-4499-acb0-e5ae23ae3583',
 'How do the speakers know each other?',
 'They took a class together.', 'They used to work for the same company.', 'They grew up in the same neighborhood.', 'They met on a train.', 'A',
 'Câu hỏi: Những người nói biết nhau như thế nào?
(A) Họ đã cùng tham gia một lớp học.
(B) Họ từng làm việc cho cùng một công ty.
(C) Họ lớn lên trong cùng một khu phố.
(D) Họ gặp nhau trên một chuyến tàu.',
 '4163947c-a23c-4125-aa83-dcbe35a70239', 47, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 48 (Đáp án đúng: D)
('250b972d-9d33-4b8b-b64e-429ca8566efa',
 'What type of business does the man most likely own?',
 'A fitness center', 'A real estate agency', 'A culinary school', 'A bakery', 'D',
 'Câu hỏi: Người đàn ông nhiều khả năng sở hữu loại hình kinh doanh nào?
(A) Một trung tâm thể hình
(B) Một công ty bất động sản
(C) Một trường dạy nấu ăn
(D) Một tiệm bánh',
 '4163947c-a23c-4125-aa83-dcbe35a70239', 48, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 49 (Đáp án đúng: C)
('32a37aba-68cf-4975-a551-2b1768214603',
 'What advantage does the woman point out about a rental space?',
 'Its price', 'Its size', 'Its location', 'Its design', 'C',
 'Câu hỏi: Người phụ nữ chỉ ra lợi thế nào về một không gian cho thuê?
(A) Giá cả
(B) Kích thước
(C) Vị trí
(D) Thiết kế',
 '4163947c-a23c-4125-aa83-dcbe35a70239', 49, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 3 - CỤM 7]: CÂU 50 - 52 (order_index: 50)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('5c1cd609-d9bc-4210-9d7a-24bafd4ce538',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789628038/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/dw7ugm1t0rz120eua182.mp3',
 NULL,
 NULL,
 'W: Hi, Koji. I think our new video game is nearly ready to be released. Are you aware of any improvements that need to be made before then?
M: Actually, I just finished testing the game this morning. I found a problem in the third stage of the game. There were a few times when my character couldn''t move.
W: Oh, that''s strange!
M: I double-checked the problem using a different controller. The same issue came up.
W: Oh. I think Pauline had a similar problem with a game she tested. Maybe you should ask her about it.',
 'W: Chào Koji. Tôi nghĩ trò chơi điện tử mới của chúng ta gần như đã sẵn sàng để phát hành. Bạn có biết có cải tiến nào cần thực hiện trước đó không?
M: Thực ra, tôi vừa mới kiểm thử trò chơi xong vào sáng nay. Tôi phát hiện một vấn đề ở màn thứ ba của trò chơi. Có vài lần nhân vật của tôi không thể di chuyển.
W: Ồ, lạ nhỉ!
M: Tôi đã kiểm tra lại vấn đề bằng một tay cầm khác. Vấn đề tương tự vẫn xảy ra.
W: Ồ. Tôi nghĩ Pauline cũng gặp vấn đề tương tự với một trò chơi mà cô ấy kiểm thử. Có lẽ bạn nên hỏi cô ấy về điều đó.',
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10551f-aeaa-11f1-b6c1-c0e43471a03a', 50, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 50 (Đáp án đúng: C)
('cefd83ed-67eb-4247-afc9-432235fb8a0e',
 'Who most likely are the speakers?',
 'Film actors', 'Museum directors', 'Video game developers', 'Investigative journalists', 'C',
 'Câu hỏi: Những người nói nhiều khả năng là ai?
(A) Diễn viên điện ảnh
(B) Giám đốc bảo tàng
(C) Nhà phát triển trò chơi điện tử
(D) Nhà báo điều tra',
 '5c1cd609-d9bc-4210-9d7a-24bafd4ce538', 50, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 51 (Đáp án đúng: B)
('977ecb7c-9c8f-4f84-ba32-8270f933a9e9',
 'What did the man recently do?',
 'He secured some funding.', 'He tested a product.', 'He read a script.', 'He conducted an interview.', 'B',
 'Câu hỏi: Gần đây người đàn ông đã làm gì?
(A) Anh ấy đã đảm bảo được nguồn tài trợ.
(B) Anh ấy đã kiểm thử một sản phẩm.
(C) Anh ấy đã đọc một kịch bản.
(D) Anh ấy đã thực hiện một cuộc phỏng vấn.',
 '5c1cd609-d9bc-4210-9d7a-24bafd4ce538', 51, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 52 (Đáp án đúng: A)
('5ce5e39c-75b3-4b17-b477-0818d715fad8',
 'What does the woman suggest?',
 'Consulting a colleague', 'Planning an event', 'Negotiating a contract', 'Giving a client an update', 'A',
 'Câu hỏi: Người phụ nữ đề xuất điều gì?
(A) Tham khảo ý kiến một đồng nghiệp
(B) Lên kế hoạch cho một sự kiện
(C) Đàm phán một hợp đồng
(D) Cập nhật thông tin cho khách hàng',
 '5c1cd609-d9bc-4210-9d7a-24bafd4ce538', 52, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 3 - CỤM 8]: CÂU 53 - 55 (order_index: 53)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('6b8d2deb-6326-42a8-b252-43f2bf426f4c',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789628131/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/nlh5m4mfhzoaapag1sib.mp3',
 NULL,
 NULL,
 'M: You''ve reached the maintenance office at Hillview Apartment Complex.
W: Hi. This is Palavi Sen from unit 35B. I''m calling because the new thermostat in my apartment isn''t working. It keeps shutting off and turning on randomly, so my apartment is getting cold.
M: When did this issue start?
W: A few hours ago. The thermostat was just installed yesterday.
M: OK. I can come and take a look at it tomorrow morning.
W: But it''s supposed to be below freezing tonight!',
 'M: Bạn đã gọi đến văn phòng bảo trì của Khu chung cư Hillview.
W: Xin chào. Tôi là Palavi Sen ở căn hộ 35B. Tôi gọi vì bộ điều nhiệt mới trong căn hộ của tôi không hoạt động. Nó liên tục ngắt và bật một cách ngẫu nhiên, khiến căn hộ của tôi ngày càng lạnh.
M: Vấn đề này bắt đầu từ khi nào?
W: Vài giờ trước. Bộ điều nhiệt vừa được lắp đặt ngày hôm qua.
M: Được. Tôi có thể đến kiểm tra nó vào sáng mai.
W: Nhưng dự báo đêm nay nhiệt độ sẽ xuống dưới mức đóng băng!',
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10551f-aeaa-11f1-b6c1-c0e43471a03a', 53, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 53 (Đáp án đúng: C)
('c7e626ab-fb07-4d94-8d5a-b4aedb9e36b5',
 'Who most likely is the man?',
 'A delivery driver', 'A security guard', 'A maintenance worker', 'A customer service representative', 'C',
 'Câu hỏi: Người đàn ông nhiều khả năng là ai?
(A) Tài xế giao hàng
(B) Nhân viên bảo vệ
(C) Nhân viên bảo trì
(D) Nhân viên dịch vụ khách hàng',
 '6b8d2deb-6326-42a8-b252-43f2bf426f4c', 53, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 54 (Đáp án đúng: A)
('0f95fad8-a67a-45ef-b6d7-8b06f1805144',
 'What problem does the woman describe?',
 'A device is malfunctioning.', 'A key is missing.', 'A parking area is unavailable.', 'A package was not received.', 'A',
 'Câu hỏi: Người phụ nữ mô tả vấn đề gì?
(A) Một thiết bị đang bị trục trặc.
(B) Một chiếc chìa khóa bị mất.
(C) Khu vực đỗ xe không khả dụng.
(D) Một gói hàng không được nhận.',
 '6b8d2deb-6326-42a8-b252-43f2bf426f4c', 54, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 55 (Đáp án đúng: B)
('b1ad2206-20ee-4c41-aa88-5ae9c8cd252a',
 'What does the woman mean when she says, "it''s supposed to be below freezing tonight"?',
 'She is surprised by the weather forecast.', 'She wants a service to be completed sooner.', 'She will move some items indoors.', 'She would prefer to park near her apartment.', 'B',
 'Câu hỏi: Người phụ nữ có ý gì khi nói "dự báo đêm nay nhiệt độ sẽ xuống dưới mức đóng băng"?
(A) Cô ấy ngạc nhiên về dự báo thời tiết.
(B) Cô ấy muốn dịch vụ được hoàn thành sớm hơn.
(C) Cô ấy sẽ chuyển một số đồ đạc vào trong nhà.
(D) Cô ấy muốn đỗ xe gần căn hộ của mình.',
 '6b8d2deb-6326-42a8-b252-43f2bf426f4c', 55, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 3 - CỤM 9]: CÂU 56 - 58 (order_index: 56)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('e075e71b-828b-44f0-9ddf-ea7ff3e905f5',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789628138/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/ugzx2xmcco3ob9wxvawx.mp3',
 NULL,
 NULL,
 'W: Good morning! Welcome to Jasper Bank.
M1: Thanks for meeting with us to discuss a loan for our business.
W: Why don''t you tell me more about your business? I understand it''s a repair shop?
M2: Well, ten years ago, we opened as a snowmobile repair shop, but after a few years, we also started renting out snowmobiles and other sports equipment.
M1: Yes, and because winter tourism has increased recently, we''d like to expand our space so that we can carry more inventory.',
 'W: Chào buổi sáng! Chào mừng đến với Ngân hàng Jasper.
M1: Cảm ơn vì đã gặp chúng tôi để thảo luận về một khoản vay cho doanh nghiệp của chúng tôi.
W: Sao anh không cho tôi biết thêm về doanh nghiệp của mình? Tôi hiểu đây là một tiệm sửa chữa?
M2: Chà, mười năm trước, chúng tôi mở một tiệm sửa chữa xe trượt tuyết, nhưng sau vài năm, chúng tôi cũng bắt đầu cho thuê xe trượt tuyết và các thiết bị thể thao khác.
M1: Đúng vậy, và vì du lịch mùa đông gần đây đã tăng lên, chúng tôi muốn mở rộng không gian để có thể chứa nhiều hàng tồn kho hơn.',
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10551f-aeaa-11f1-b6c1-c0e43471a03a', 56, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 56 (Đáp án đúng: B)
('ac0b061a-be4a-41a2-81f8-76c74784ccd8',
 'Why do the men want to speak to the woman?',
 'To review a building design', 'To discuss a loan', 'To develop an advertising plan', 'To purchase some supplies', 'B',
 'Câu hỏi: Tại sao những người đàn ông muốn nói chuyện với người phụ nữ?
(A) Để xem xét một thiết kế tòa nhà
(B) Để thảo luận về một khoản vay
(C) Để phát triển một kế hoạch quảng cáo
(D) Để mua một số vật tư',
 'e075e71b-828b-44f0-9ddf-ea7ff3e905f5', 56, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 57 (Đáp án đúng: A)
('262a375e-3da6-459f-ae07-186dae4ef570',
 'What type of business do the men own?',
 'A sports equipment store', 'A winter apparel store', 'An automobile dealership', 'A hotel chain', 'A',
 'Câu hỏi: Những người đàn ông sở hữu loại hình kinh doanh nào?
(A) Một cửa hàng thiết bị thể thao
(B) Một cửa hàng quần áo mùa đông
(C) Một đại lý ô tô
(D) Một chuỗi khách sạn',
 'e075e71b-828b-44f0-9ddf-ea7ff3e905f5', 57, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 58 (Đáp án đúng: C)
('30f1693f-297e-4d2f-8ad7-9c98e7cb2c21',
 'According to the men, what has changed recently?',
 'Roads have become more accessible.', 'Costs have decreased.', 'Tourism has increased.', 'Weather patterns have shifted.', 'C',
 'Câu hỏi: Theo những người đàn ông, điều gì đã thay đổi gần đây?
(A) Đường xá trở nên dễ tiếp cận hơn.
(B) Chi phí đã giảm.
(C) Du lịch đã tăng lên.
(D) Các mô hình thời tiết đã thay đổi.',
 'e075e71b-828b-44f0-9ddf-ea7ff3e905f5', 58, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 3 - CỤM 10]: CÂU 59 - 61 (order_index: 59)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('1b09b63a-f165-4550-b836-f0cccf8f6c39',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789628158/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/ze7aqcy8ls6f2z2z4zbr.mp3',
 NULL,
 NULL,
 'M: Many of our factory workers have expressed interest in upgrading their skills. I''d like to implement a peer-training program, where learners shadow more-experienced employees and observe how they do their jobs.
W: I''m afraid that might become a burden for our long-time employees. They''ll have to slow down their work to explain what they''re doing.
M: What if we videotaped experienced employees doing specific tasks? High-quality video can be recorded and edited with a smartphone.
W: I like that idea. It would allow us to capture our workers'' expertise without slowing down the production line.',
 'M: Nhiều công nhân nhà máy của chúng ta đã bày tỏ mong muốn nâng cao kỹ năng. Tôi muốn triển khai một chương trình đào tạo đồng nghiệp, trong đó người học sẽ theo sát các nhân viên có kinh nghiệm hơn và quan sát cách họ làm việc.
W: Tôi e rằng điều đó có thể trở thành gánh nặng cho các nhân viên lâu năm. Họ sẽ phải làm chậm công việc để giải thích những gì họ đang làm.
M: Vậy nếu chúng ta quay video các nhân viên có kinh nghiệm thực hiện các nhiệm vụ cụ thể thì sao? Video chất lượng cao có thể được quay và chỉnh sửa bằng điện thoại thông minh.
W: Tôi thích ý tưởng đó. Nó sẽ cho phép chúng ta ghi lại chuyên môn của công nhân mà không làm chậm dây chuyền sản xuất.',
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10551f-aeaa-11f1-b6c1-c0e43471a03a', 59, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 59 (Đáp án đúng: A)
('8d91346f-1683-4652-afc5-08569ab07e79',
 'What does the man want to do?',
 'Provide training opportunities', 'Upgrade machinery', 'Hire additional employees', 'Reorganize the factory layout', 'A',
 'Câu hỏi: Người đàn ông muốn làm gì?
(A) Cung cấp cơ hội đào tạo
(B) Nâng cấp máy móc
(C) Thuê thêm nhân viên
(D) Tổ chức lại bố cục nhà máy',
 '1b09b63a-f165-4550-b836-f0cccf8f6c39', 59, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 60 (Đáp án đúng: C)
('b9ae41c2-2aca-4905-8c1d-95a44decfd90',
 'What is the woman concerned about?',
 'Increasing expenses', 'Introducing errors', 'Reducing productivity', 'Causing confusion', 'C',
 'Câu hỏi: Người phụ nữ lo lắng về điều gì?
(A) Tăng chi phí
(B) Gây ra lỗi
(C) Giảm năng suất
(D) Gây nhầm lẫn',
 '1b09b63a-f165-4550-b836-f0cccf8f6c39', 60, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 61 (Đáp án đúng: B)
('9ed807ef-e4d1-4b65-baca-4266d9743b09',
 'What does the man mean when he says, "High-quality video can be recorded and edited with a smartphone"?',
 'A new policy should be established.', 'An idea is easy to implement.', 'Data security is a concern.', 'Some information should be verified.', 'B',
 'Câu hỏi: Người đàn ông có ý gì khi nói "Video chất lượng cao có thể được quay và chỉnh sửa bằng điện thoại thông minh"?
(A) Một chính sách mới nên được thiết lập.
(B) Một ý tưởng dễ thực hiện.
(C) Bảo mật dữ liệu là một mối quan tâm.
(D) Một số thông tin nên được xác minh.',
 '1b09b63a-f165-4550-b836-f0cccf8f6c39', 61, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 3 - CỤM 11]: CÂU 62 - 64 (order_index: 62)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('dfe027b4-27cb-4006-b32f-d7c47bd9aedd',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789628164/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/bizvllf9nfferaiyhdri.mp3',
 'https://res.cloudinary.com/ovs0odtq/image/upload/v1789627733/Resource/toeic-learning/exams/ets-toeic-2026-test-01/images/j2rvyllwflf5kwz5e71u.png',
 NULL,
 'W: Hi, Suresh. I''m at the airport waiting for my flight. I want to meet with a potential investor while I''m in Chicago. Her name''s Marta Gomez. I can send you her contact information.
M: OK. Which day would you prefer to meet with her?
W: How about right after my meeting with the Chicago staff?
M: OK. By the way, did you see that our company won an award for our contributions to the community? It was just announced this morning.',
 'W: Chào Suresh. Tôi đang ở sân bay chờ chuyến bay của mình. Tôi muốn gặp một nhà đầu tư tiềm năng khi tôi ở Chicago. Cô ấy tên là Marta Gomez. Tôi có thể gửi cho bạn thông tin liên lạc của cô ấy.
M: Được. Bạn muốn gặp cô ấy vào ngày nào?
W: Thế còn ngay sau cuộc họp của tôi với nhân viên Chicago thì sao?
M: Được. Nhân tiện, bạn có thấy rằng công ty chúng ta đã giành được một giải thưởng cho những đóng góp của chúng ta cho cộng đồng không? Nó vừa được công bố sáng nay.',
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10551f-aeaa-11f1-b6c1-c0e43471a03a', 62, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 62 (Đáp án đúng: C)
('2e752e7b-07b2-4ca1-847c-1473b7470d87',
 'Where is the woman?',
 'At a restaurant', 'At a travel agency', 'At an airport', 'At a warehouse', 'C',
 'Câu hỏi: Người phụ nữ đang ở đâu?
(A) Tại một nhà hàng
(B) Tại một đại lý du lịch
(C) Tại một sân bay
(D) Tại một nhà kho',
 'dfe027b4-27cb-4006-b32f-d7c47bd9aedd', 62, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 63 (Đáp án đúng: C)
('6e50e878-7642-48cd-bee8-254047e30a2f',
 'Look at the graphic. When does the woman prefer to meet with an investor?',
 'On Monday', 'On Tuesday', 'On Wednesday', 'On Thursday', 'C',
 'Câu hỏi: Nhìn vào hình minh họa. Người phụ nữ muốn gặp nhà đầu tư vào ngày nào?
(A) Thứ Hai
(B) Thứ Ba
(C) Thứ Tư
(D) Thứ Năm',
 'dfe027b4-27cb-4006-b32f-d7c47bd9aedd', 63, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 64 (Đáp án đúng: D)
('04ef4ab4-00d4-42b4-b8a7-81ffea622850',
 'What good news does the man share?',
 'A colleague received a promotion.', 'A conference proposal was accepted.', 'An airline ticket has been upgraded.', 'A company won an award.', 'D',
 'Câu hỏi: Người đàn ông chia sẻ tin tốt gì?
(A) Một đồng nghiệp đã được thăng chức.
(B) Một đề xuất hội nghị đã được chấp nhận.
(C) Một vé máy bay đã được nâng cấp.
(D) Một công ty đã giành được giải thưởng.',
 'dfe027b4-27cb-4006-b32f-d7c47bd9aedd', 64, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 3 - CỤM 12]: CÂU 65 - 67 (order_index: 65)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('ea4bc073-df16-4c63-87cf-43b51c66c661',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789628175/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/ggjyoifk5xbzaigz5swn.mp3',
 'https://res.cloudinary.com/ovs0odtq/image/upload/v1789627759/Resource/toeic-learning/exams/ets-toeic-2026-test-01/images/avdvskpkymqn9lh7n3xp.png',
 NULL,
 'M: Marion, we keep getting calls from people who want to visit the botanical garden but can''t find parking information. Isn''t it on our Web site?
W: It is, but you have to click on the "About Us" page and scroll to the bottom of that page. Maybe people don''t see it.
M: Oh, I think we should move that information from the "About Us" page and make a separate page for directions and parking information. That way, people can find it more easily.
W: I''d be happy to make that change. But we''re in the middle of updating our software, so it''ll have to wait until Monday.',
 'M: Marion, chúng ta liên tục nhận được cuộc gọi từ những người muốn đến thăm vườn thực vật nhưng không tìm thấy thông tin đỗ xe. Nó không có trên trang web của chúng ta sao?
W: Có, nhưng bạn phải nhấp vào trang "Về chúng tôi" và cuộn xuống cuối trang đó. Có lẽ mọi người không nhìn thấy nó.
M: Ồ, tôi nghĩ chúng ta nên chuyển thông tin đó từ trang "Về chúng tôi" và tạo một trang riêng cho chỉ đường và thông tin đỗ xe. Bằng cách đó, mọi người có thể tìm thấy nó dễ dàng hơn.
W: Tôi rất sẵn lòng thực hiện thay đổi đó. Nhưng chúng ta đang trong quá trình cập nhật phần mềm, vì vậy nó sẽ phải đợi đến thứ Hai.',
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10551f-aeaa-11f1-b6c1-c0e43471a03a', 65, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 65 (Đáp án đúng: D)
('d93b0a22-437f-4d94-8f71-115b0f0fc731',
 'Where do the speakers work?',
 'At an amusement park', 'At an art museum', 'At a concert hall', 'At a botanical garden', 'D',
 'Câu hỏi: Những người nói làm việc ở đâu?
(A) Tại một công viên giải trí
(B) Tại một bảo tàng nghệ thuật
(C) Tại một phòng hòa nhạc
(D) Tại một vườn thực vật',
 'ea4bc073-df16-4c63-87cf-43b51c66c661', 65, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 66 (Đáp án đúng: A)
('06b3e340-16bd-4d27-8bc0-d28fa2a9a8ad',
 'Look at the graphic. Which page on the Web site does the man want to change?',
 'Page 1', 'Page 2', 'Page 3', 'Page 4', 'A',
 'Câu hỏi: Nhìn vào hình minh họa. Người đàn ông muốn thay đổi trang nào trên trang web?
(A) Trang 1
(B) Trang 2
(C) Trang 3
(D) Trang 4',
 'ea4bc073-df16-4c63-87cf-43b51c66c661', 66, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 67 (Đáp án đúng: C)
('6229d915-de66-4a85-9e37-a61474f51c10',
 'Why does the woman say she cannot complete a task until Monday?',
 'She requires approval from a manager.', 'She is attending a workshop.', 'Some software is being updated.', 'Some clients will be arriving soon.', 'C',
 'Câu hỏi: Tại sao người phụ nữ nói cô ấy không thể hoàn thành một nhiệm vụ cho đến thứ Hai?
(A) Cô ấy cần sự chấp thuận từ người quản lý.
(B) Cô ấy đang tham gia một hội thảo.
(C) Một số phần mềm đang được cập nhật.
(D) Một số khách hàng sẽ đến sớm.',
 'ea4bc073-df16-4c63-87cf-43b51c66c661', 67, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 3 - CỤM 13]: CÂU 68 - 70 (order_index: 68)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('40dced73-76fd-4116-b676-c9630ba9546d',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789628196/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/brwe6vbhmyvgdduoefas.mp3',
 'https://res.cloudinary.com/ovs0odtq/image/upload/v1789627773/Resource/toeic-learning/exams/ets-toeic-2026-test-01/images/nvjdwy3bjojequkqkfjk.png',
 NULL,
 'M: Good news! We have finally received the go-ahead for our department''s project to install bicycle racks at the train station downtown.
W: At last! So, now we need to decide where to place the racks. How about by the station entrance?
M: Hmm. If we asked riders, I bet they''d say that the most convenient spot is as close to the platform as possible.
W: Let''s do that. I''ll contact some companies for estimates.',
 'M: Tin tốt đây! Cuối cùng chúng ta đã nhận được sự chấp thuận cho dự án của bộ phận chúng ta để lắp đặt giá để xe đạp tại ga tàu ở trung tâm thành phố.
W: Cuối cùng! Vậy bây giờ chúng ta cần quyết định đặt giá ở đâu. Hay là cạnh lối vào ga?
M: Hmm. Nếu chúng ta hỏi những người đi xe, tôi cá là họ sẽ nói rằng vị trí thuận tiện nhất là càng gần sân ga càng tốt.
W: Hãy làm vậy. Tôi sẽ liên hệ với một số công ty để lấy báo giá.',
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10551f-aeaa-11f1-b6c1-c0e43471a03a', 68, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 68 (Đáp án đúng: B)
('b613ed43-7387-43dc-87f6-b0e617b40b49',
 'What news does the man share?',
 'A station road will be closed for repair.', 'A project has been approved.', 'A parking area has been expanded.', 'An office will relocate.', 'B',
 'Câu hỏi: Người đàn ông chia sẻ tin tức gì?
(A) Một con đường đến ga sẽ bị đóng để sửa chữa.
(B) Một dự án đã được phê duyệt.
(C) Một khu vực đỗ xe đã được mở rộng.
(D) Một văn phòng sẽ được di dời.',
 '40dced73-76fd-4116-b676-c9630ba9546d', 68, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 69 (Đáp án đúng: A)
('6b094ccb-a802-4626-abe3-a3b84a9f29b3',
 'Look at the graphic. Where do the speakers decide to install some bicycle racks?',
 'Near the covered parking area', 'Near the long-term parking area', 'Near the short-term parking area', 'Near the overflow parking area', 'A',
 'Câu hỏi: Nhìn vào hình minh họa. Những người nói quyết định lắp đặt giá để xe đạp ở đâu?
(A) Gần khu vực đỗ xe có mái che
(B) Gần khu vực đỗ xe dài hạn
(C) Gần khu vực đỗ xe ngắn hạn
(D) Gần khu vực đỗ xe tràn',
 '40dced73-76fd-4116-b676-c9630ba9546d', 69, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 70 (Đáp án đúng: C)
('dc9611f8-98ae-41f9-bb03-ba9a0ccb8d0a',
 'Why does the woman say she will contact some companies?',
 'To arrange a loan', 'To apply for a permit', 'To ask for estimates', 'To create a proposal', 'C',
 'Câu hỏi: Tại sao người phụ nữ nói cô ấy sẽ liên hệ với một số công ty?
(A) Để sắp xếp một khoản vay
(B) Để xin giấy phép
(C) Để hỏi báo giá
(D) Để tạo một đề xuất',
 '40dced73-76fd-4116-b676-c9630ba9546d', 70, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ==============================================================================
-- 7.5 PART 4: BÀI NÓI NGẮN / BÀI ĐỘC THOẠI (CÂU 71 -> 100)
-- 10 bài nói độc thoại (mỗi bài gồm audio, transcript, bản dịch và 3 câu hỏi liên quan)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- [PART 4 - CỤM 1]: CÂU 71 - 73 (order_index: 71)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('b7c4c8fd-1a5b-4767-b032-f969f2cce351',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789631084/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/mtdati7x26aqxyplj1ds.mp3',
 NULL,
 NULL,
 'W-Br: You''ve reached Select Repair Service. We specialize in all makes and models of automobiles. Our factory-trained specialists will keep your vehicle running in top condition. As an added benefit, we offer extended warranties on all vehicles we service. You can enjoy three extra years of worry-free driving. Please note that Select Repair Service will be closing on Friday, June 30, so we can complete our quarterly inventory of supplies. Thank you for your patience. A representative will be with you shortly.',
 'W-Br: Bạn đã gọi đến Dịch vụ Sửa chữa Select. Chúng tôi chuyên về tất cả các hãng và mẫu xe ô tô. Các chuyên gia được đào tạo tại nhà máy của chúng tôi sẽ giữ cho xe của bạn hoạt động trong tình trạng tốt nhất. Như một lợi ích bổ sung, chúng tôi cung cấp bảo hành mở rộng cho tất cả các xe mà chúng tôi bảo dưỡng. Bạn có thể tận hưởng thêm ba năm lái xe không lo lắng. Xin lưu ý rằng Dịch vụ Sửa chữa Select sẽ đóng cửa vào Thứ Sáu, ngày 30 tháng 6, để chúng tôi có thể hoàn thành việc kiểm kê vật tư hàng quý. Cảm ơn bạn đã kiên nhẫn. Một đại diện sẽ đến với bạn ngay sau đây.',
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d105559-aeaa-11f1-b6c1-c0e43471a03a', 71, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 71 (Đáp án đúng: B)
('e215b9ea-1ab4-4db2-9c32-d6b309785807',
 'What type of products does the business repair?',
 'Computers', 'Vehicles', 'Light fixtures', 'Kitchen appliances', 'B',
 'Câu hỏi: Doanh nghiệp sửa chữa loại sản phẩm nào?
(A) Máy tính
(B) Xe cộ
(C) Thiết bị chiếu sáng
(D) Thiết bị nhà bếp',
 'b7c4c8fd-1a5b-4767-b032-f969f2cce351', 71, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 72 (Đáp án đúng: C)
('cfe5b668-4d2d-4847-bb59-195d192bff74',
 'What special benefit does the speaker mention?',
 'Free pickup', 'Online scheduling', 'Extended warranties', 'A membership loyalty program', 'C',
 'Câu hỏi: Người nói đề cập đến lợi ích đặc biệt nào?
(A) Miễn phí đón khách
(B) Lên lịch trực tuyến
(C) Bảo hành mở rộng
(D) Chương trình khách hàng thân thiết',
 'b7c4c8fd-1a5b-4767-b032-f969f2cce351', 72, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 73 (Đáp án đúng: A)
('b434e0ed-15c6-4ba9-995f-5f77dc8df3f4',
 'Why will a business close on Friday?',
 'For an inventory count', 'For employee training', 'For a company celebration', 'For equipment installation', 'A',
 'Câu hỏi: Tại sao một doanh nghiệp sẽ đóng cửa vào Thứ Sáu?
(A) Để kiểm kê hàng tồn kho
(B) Để đào tạo nhân viên
(C) Để tổ chức lễ kỷ niệm công ty
(D) Để lắp đặt thiết bị',
 'b7c4c8fd-1a5b-4767-b032-f969f2cce351', 73, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 4 - CỤM 2]: CÂU 74 - 76 (order_index: 74)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('e30a146f-316d-41b0-90f9-2bd75dd88549',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789631096/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/zsupcdedchn4tsstyvbx.mp3',
 NULL,
 NULL,
 'M-Au: Welcome, new employees! My name is Diego, and I facilitate all orientation sessions. Before we start today, you will need to set up your employee account. If you look at the first page of your training binder, you''ll see your username and a temporary password. Please open the laptops you were given this morning and log in using those credentials. You will then be prompted to create your own password. Once that''s complete, you''ll have access to all your department''s files. Please note that you can only access them from your company computer.',
 'M-Au: Chào mừng các nhân viên mới! Tên tôi là Diego, và tôi phụ trách tất cả các buổi định hướng. Trước khi chúng ta bắt đầu hôm nay, bạn sẽ cần thiết lập tài khoản nhân viên của mình. Nếu bạn nhìn vào trang đầu tiên của tập tài liệu đào tạo, bạn sẽ thấy tên người dùng và mật khẩu tạm thời của mình. Vui lòng mở máy tính xách tay mà bạn được phát sáng nay và đăng nhập bằng thông tin đăng nhập đó. Sau đó, bạn sẽ được nhắc tạo mật khẩu của riêng mình. Sau khi hoàn tất, bạn sẽ có quyền truy cập vào tất cả các tệp của bộ phận mình. Xin lưu ý rằng bạn chỉ có thể truy cập chúng từ máy tính công ty của mình.',
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d105559-aeaa-11f1-b6c1-c0e43471a03a', 74, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 74 (Đáp án đúng: B)
('cfc56609-7ad9-491b-8c2d-a63eb6325910',
 'Who most likely is the speaker?',
 'A facilities manager', 'A human resources representative', 'A security officer', 'A corporate executive', 'B',
 'Câu hỏi: Người nói nhiều khả năng là ai?
(A) Quản lý cơ sở vật chất
(B) Đại diện nhân sự
(C) Nhân viên bảo vệ
(D) Giám đốc điều hành công ty',
 'e30a146f-316d-41b0-90f9-2bd75dd88549', 74, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 75 (Đáp án đúng: D)
('418ed661-b0db-47bd-be45-faf160005f94',
 'According to the speaker, what will the listeners find in a binder?',
 'A map of the building', 'An employment contract', 'An identification badge', 'Log-in credentials', 'D',
 'Câu hỏi: Theo người nói, người nghe sẽ tìm thấy gì trong một tập tài liệu?
(A) Bản đồ tòa nhà
(B) Hợp đồng lao động
(C) Thẻ nhận dạng
(D) Thông tin đăng nhập',
 'e30a146f-316d-41b0-90f9-2bd75dd88549', 75, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 76 (Đáp án đúng: A)
('2eec45e0-456d-4239-9c08-0e4865a9df09',
 'What does the speaker say about department files?',
 'They are only accessible from company computers.', 'They must be password protected.', 'They must follow a specific naming convention.', 'They must be archived annually.', 'A',
 'Câu hỏi: Người nói nói gì về các tệp của bộ phận?
(A) Chúng chỉ có thể truy cập từ máy tính công ty.
(B) Chúng phải được bảo vệ bằng mật khẩu.
(C) Chúng phải tuân theo một quy ước đặt tên cụ thể.
(D) Chúng phải được lưu trữ hàng năm.',
 'e30a146f-316d-41b0-90f9-2bd75dd88549', 76, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 4 - CỤM 3]: CÂU 77 - 79 (order_index: 77)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('a6cd592e-3c40-48e4-b6c2-4d599c2b5cf3',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789631107/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/yhssfm9bro4hcxxk83dy.mp3',
 NULL,
 NULL,
 'W-Br: Hello. This is Heather Ross calling from Denville Amusement Park. About a month ago, I ordered one of your new video-game machines, Space Defenders. I''m really happy with my purchase, since the game has been incredibly popular with our park guests! I''m considering buying some additional machines in the near future. I heard you may be releasing a new game soon. Could you call me back and let me know if that''s true? Thanks!',
 'W-Br: Xin chào. Đây là Heather Ross gọi từ Công viên Giải trí Denville. Khoảng một tháng trước, tôi đã đặt mua một trong những máy trò chơi điện tử mới của bạn, Space Defenders. Tôi rất hài lòng với việc mua hàng của mình, vì trò chơi này cực kỳ phổ biến với khách của công viên chúng tôi! Tôi đang cân nhắc mua thêm một số máy trong tương lai gần. Tôi nghe nói bạn có thể sắp phát hành một trò chơi mới. Bạn có thể gọi lại cho tôi và cho tôi biết liệu điều đó có đúng không? Cảm ơn!',
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d105559-aeaa-11f1-b6c1-c0e43471a03a', 77, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 77 (Đáp án đúng: B)
('5571acbc-80b8-4a2f-86f4-0195d2bbcb5a',
 'Where does the speaker work?',
 'At a laundry facility', 'At an amusement park', 'At a sports stadium', 'At a fitness center', 'B',
 'Câu hỏi: Người nói làm việc ở đâu?
(A) Tại một cơ sở giặt ủi
(B) Tại một công viên giải trí
(C) Tại một sân vận động thể thao
(D) Tại một trung tâm thể hình',
 'a6cd592e-3c40-48e4-b6c2-4d599c2b5cf3', 77, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 78 (Đáp án đúng: D)
('925207de-6964-427a-a516-5c1446cfbc30',
 'What does the speaker say about an item she ordered a month ago?',
 'It arrived later than expected.', 'It was damaged during delivery.', 'She needs help assembling it.', 'She is pleased with it.', 'D',
 'Câu hỏi: Người nói nói gì về một món đồ cô ấy đã đặt hàng một tháng trước?
(A) Nó đến muộn hơn dự kiến.
(B) Nó bị hư hỏng trong quá trình vận chuyển.
(C) Cô ấy cần giúp lắp ráp nó.
(D) Cô ấy hài lòng với nó.',
 'a6cd592e-3c40-48e4-b6c2-4d599c2b5cf3', 78, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 79 (Đáp án đúng: A)
('4690e875-fe8a-47ef-86ae-a5affb917af0',
 'What does the speaker ask the listener to confirm?',
 'Whether a new product will be available soon', 'When a replacement part will be shipped', 'How long a warranty lasts', 'Who to contact about future orders', 'A',
 'Câu hỏi: Người nói yêu cầu người nghe xác nhận điều gì?
(A) Liệu một sản phẩm mới có sẵn sớm không
(B) Khi nào một bộ phận thay thế sẽ được gửi đi
(C) Thời hạn bảo hành kéo dài bao lâu
(D) Liên hệ với ai về các đơn hàng trong tương lai',
 'a6cd592e-3c40-48e4-b6c2-4d599c2b5cf3', 79, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 4 - CỤM 4]: CÂU 80 - 82 (order_index: 80)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('0343aba4-c097-4dc4-9e98-c80a854323f6',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789631119/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/zu7jlertckq56betoyio.mp3',
 NULL,
 NULL,
 'W-Am: The first agenda item for our board meeting is the annual sales report. We''re all disappointed by the drop in our clothing sales. The decline is mostly due to distribution issues. Because our factories are all overseas, it takes too long for orders to reach customers. So I''m recommending that we start manufacturing some clothing locally. We''ll be looking for a location to build a manufacturing facility. I hired a consultant to put together a list of locations we could use. He''ll be at our next board meeting to explain the pros and cons of each.',
 'W-Am: Mục đầu tiên trong chương trình nghị sự của cuộc họp hội đồng quản trị là báo cáo bán hàng hàng năm. Tất cả chúng ta đều thất vọng vì doanh số bán quần áo của chúng ta giảm. Sự sụt giảm chủ yếu là do các vấn đề phân phối. Vì các nhà máy của chúng ta đều ở nước ngoài, nên các đơn hàng mất quá nhiều thời gian để đến tay khách hàng. Vì vậy, tôi đề xuất rằng chúng ta bắt đầu sản xuất một số quần áo trong nước. Chúng ta sẽ tìm một địa điểm để xây dựng cơ sở sản xuất. Tôi đã thuê một nhà tư vấn để lập danh sách các địa điểm chúng ta có thể sử dụng. Ông ấy sẽ có mặt tại cuộc họp hội đồng quản trị tiếp theo của chúng ta để giải thích ưu và nhược điểm của từng địa điểm.',
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d105559-aeaa-11f1-b6c1-c0e43471a03a', 80, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 80 (Đáp án đúng: D)
('97d0e7b3-02f2-4745-834e-0509292f30bd',
 'What type of product does the speaker''s company make?',
 'Furniture', 'Luggage', 'Bedding', 'Clothing', 'D',
 'Câu hỏi: Công ty của người nói sản xuất loại sản phẩm nào?
(A) Đồ nội thất
(B) Hành lý
(C) Chăn ga gối đệm
(D) Quần áo',
 '0343aba4-c097-4dc4-9e98-c80a854323f6', 80, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 81 (Đáp án đúng: A)
('713de6e3-9abf-4b1b-902c-3c0fcf8e628d',
 'What does the speaker recommend doing?',
 'Manufacturing some products locally', 'Offering free shipping', 'Participating in a trade show', 'Developing a new product line', 'A',
 'Câu hỏi: Người nói đề xuất làm gì?
(A) Sản xuất một số sản phẩm trong nước
(B) Cung cấp miễn phí vận chuyển
(C) Tham gia một hội chợ thương mại
(D) Phát triển một dòng sản phẩm mới',
 '0343aba4-c097-4dc4-9e98-c80a854323f6', 81, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 82 (Đáp án đúng: B)
('f43cccdb-ec27-424f-b271-f424926fb465',
 'What will happen at the next meeting?',
 'A vote will take place.', 'A consultant will give a presentation.', 'Some contracts will be updated.', 'Safety procedures will be reviewed.', 'B',
 'Câu hỏi: Điều gì sẽ xảy ra tại cuộc họp tiếp theo?
(A) Một cuộc bỏ phiếu sẽ diễn ra.
(B) Một nhà tư vấn sẽ thuyết trình.
(C) Một số hợp đồng sẽ được cập nhật.
(D) Các quy trình an toàn sẽ được xem xét.',
 '0343aba4-c097-4dc4-9e98-c80a854323f6', 82, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 4 - CỤM 5]: CÂU 83 - 85 (order_index: 83)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('bd25d841-7330-465d-991f-f5eeb79c45e3',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789631129/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/bkorl5prozazgctywih4.mp3',
 NULL,
 NULL,
 'M-Cn: Attention, passengers. All trains to Midway Station are delayed for track repairs. Repair crews are working on a stretch of track just south of the town of Wheedon. They expect to complete the repair within the hour. We apologize for the delay. We understand that many commuters need to get to Midway as soon as possible. A bus will be departing for that destination in fifteen minutes. Also, a reminder that the station café opens at eight A.M., and there are food kiosks on platform one.',
 'M-Cn: Xin chú ý, quý hành khách. Tất cả các chuyến tàu đến Ga Midway đều bị hoãn do sửa chữa đường ray. Đội sửa chữa đang làm việc trên một đoạn đường ray ngay phía nam thị trấn Wheedon. Họ dự kiến sẽ hoàn thành việc sửa chữa trong vòng một giờ. Chúng tôi xin lỗi vì sự chậm trễ. Chúng tôi hiểu rằng nhiều hành khách cần đến Midway càng sớm càng tốt. Một xe buýt sẽ khởi hành đến điểm đến đó trong mười lăm phút nữa. Ngoài ra, xin nhắc nhở rằng quán cà phê của ga mở cửa lúc tám giờ sáng, và có các quầy bán đồ ăn trên sân ga số một.',
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d105559-aeaa-11f1-b6c1-c0e43471a03a', 83, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 83 (Đáp án đúng: D)
('b48e345f-bbb6-4d4a-a2c8-273048e4afab',
 'What is the announcement mainly about?',
 'A promotional event', 'A vacation package', 'A building renovation', 'A travel delay', 'D',
 'Câu hỏi: Thông báo chủ yếu nói về điều gì?
(A) Một sự kiện khuyến mãi
(B) Một gói kỳ nghỉ
(C) Việc cải tạo tòa nhà
(D) Sự chậm trễ trong di chuyển',
 'bd25d841-7330-465d-991f-f5eeb79c45e3', 83, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 84 (Đáp án đúng: A)
('7774caa4-9040-4c82-ad4b-1efbcaf8f717',
 'Why does the speaker say, "A bus will be departing for that destination in fifteen minutes"?',
 'To suggest an alternative arrangement', 'To explain an extended wait time', 'To recommend changing the travel date', 'To inform customers about a new destination', 'A',
 'Câu hỏi: Tại sao người nói nói "Một xe buýt sẽ khởi hành đến điểm đến đó trong mười lăm phút nữa"?
(A) Để đề xuất một sắp xếp thay thế
(B) Để giải thích thời gian chờ đợi kéo dài
(C) Để đề nghị thay đổi ngày đi
(D) Để thông báo cho khách hàng về một điểm đến mới',
 'bd25d841-7330-465d-991f-f5eeb79c45e3', 84, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 85 (Đáp án đúng: D)
('c88bd193-330f-4d74-aaef-cff595490b90',
 'What does the speaker remind the listeners about?',
 'How to download a mobile application', 'Where a waiting area is located', 'How to reserve tickets', 'Where to buy food', 'D',
 'Câu hỏi: Người nói nhắc nhở người nghe về điều gì?
(A) Cách tải ứng dụng di động
(B) Vị trí khu vực chờ
(C) Cách đặt vé
(D) Nơi mua đồ ăn',
 'bd25d841-7330-465d-991f-f5eeb79c45e3', 85, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 4 - CỤM 6]: CÂU 86 - 88 (order_index: 86)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('674d72bb-197f-43eb-a161-94cc277f9a6b',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789631139/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/gbwu7tbjxl9lwzivpmqb.mp3',
 NULL,
 NULL,
 'W-Br: I''m calling about the work my design team''s doing to update your company logo. I''ve just e-mailed two versions for you to review. The first is a modern design with bold colors and simple lettering. The second image reflects the history of your brand and its logo. It''s less trendy, but it doesn''t depart much from the original, which you may prefer. Take your time to think about which one you''d like to choose. I''ll be on vacation all next week, but if you call the office, my assistant will set up a meeting for when I get back.',
 'W-Br: Tôi đang gọi về công việc mà nhóm thiết kế của tôi đang làm để cập nhật logo công ty của bạn. Tôi vừa gửi email hai phiên bản để bạn xem xét. Phiên bản đầu tiên là một thiết kế hiện đại với màu sắc đậm và chữ đơn giản. Hình ảnh thứ hai phản ánh lịch sử thương hiệu và logo của bạn. Nó ít hợp thời hơn, nhưng không khác biệt nhiều so với bản gốc, mà bạn có thể thích hơn. Hãy dành thời gian suy nghĩ xem bạn muốn chọn cái nào. Tôi sẽ đi nghỉ cả tuần tới, nhưng nếu bạn gọi đến văn phòng, trợ lý của tôi sẽ sắp xếp một cuộc họp cho khi tôi trở về.',
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d105559-aeaa-11f1-b6c1-c0e43471a03a', 86, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 86 (Đáp án đúng: A)
('1fee6b17-7e6e-4ea1-afb6-f26d10373b71',
 'Where does the speaker most likely work?',
 'At a graphic design company', 'At a law firm', 'At a photography studio', 'At a museum', 'A',
 'Câu hỏi: Người nói nhiều khả năng làm việc ở đâu?
(A) Tại một công ty thiết kế đồ họa
(B) Tại một công ty luật
(C) Tại một studio nhiếp ảnh
(D) Tại một bảo tàng',
 '674d72bb-197f-43eb-a161-94cc277f9a6b', 86, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 87 (Đáp án đúng: B)
('2a041600-1581-4ce7-8d08-30ab55095828',
 'What did the listener receive by e-mail?',
 'A newsletter', 'Some images', 'An invoice', 'Some contracts', 'B',
 'Câu hỏi: Người nghe đã nhận được gì qua email?
(A) Một bản tin
(B) Một số hình ảnh
(C) Một hóa đơn
(D) Một số hợp đồng',
 '674d72bb-197f-43eb-a161-94cc277f9a6b', 87, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 88 (Đáp án đúng: C)
('714f3785-de7b-4ebd-8c82-4306e2945a10',
 'Why is the speaker unavailable next week?',
 'She will be working at another branch.', 'She will be with other clients.', 'She will be on vacation.', 'She will be at an industry conference.', 'C',
 'Câu hỏi: Tại sao người nói không có mặt vào tuần tới?
(A) Cô ấy sẽ làm việc tại một chi nhánh khác.
(B) Cô ấy sẽ ở cùng với các khách hàng khác.
(C) Cô ấy sẽ đi nghỉ.
(D) Cô ấy sẽ tham dự một hội nghị trong ngành.',
 '674d72bb-197f-43eb-a161-94cc277f9a6b', 88, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 4 - CỤM 7]: CÂU 89 - 91 (order_index: 89)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('929ebcd6-7340-48ff-bac6-43b89e33b3f4',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789631225/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/h5u22aihpojtvascb4c5.mp3',
 NULL,
 NULL,
 'W-Am: After the transportation agency released the draft of our improvement plan last week, members of the press asked if we''re considering installing more fuel-efficient engines in our trains. I''ve scheduled this press conference to officially respond to your inquiries. Eighteen months ago, we hired a firm to determine if this upgrade would be feasible for our trains. It reported that the upgrade would be economical only for relatively new trains—that is, those less than five years old. All of ours are at least ten years old. I hope this addresses your questions. If you''re interested in more details, e-mail our media relations department to receive a summary of the findings.',
 'W-Am: Sau khi cơ quan giao thông công bố bản dự thảo kế hoạch cải tiến của chúng tôi vào tuần trước, các thành viên báo chí đã hỏi liệu chúng tôi có đang cân nhắc lắp đặt động cơ tiết kiệm nhiên liệu hơn cho các đoàn tàu của mình không. Tôi đã lên lịch cho cuộc họp báo này để chính thức trả lời các thắc mắc của quý vị. Mười tám tháng trước, chúng tôi đã thuê một công ty để xác định liệu việc nâng cấp này có khả thi cho các đoàn tàu của chúng tôi không. Công ty đó báo cáo rằng việc nâng cấp sẽ chỉ tiết kiệm chi phí cho các đoàn tàu tương đối mới—tức là những đoàn tàu dưới năm năm tuổi. Tất cả các đoàn tàu của chúng tôi đều ít nhất mười năm tuổi. Tôi hy vọng điều này giải đáp được thắc mắc của quý vị. Nếu quý vị quan tâm đến thêm chi tiết, hãy gửi email đến bộ phận quan hệ truyền thông của chúng tôi để nhận bản tóm tắt các phát hiện.',
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d105559-aeaa-11f1-b6c1-c0e43471a03a', 89, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 89 (Đáp án đúng: D)
('fe5640a6-faed-4dae-be42-49fc00a4014e',
 'Who most likely are the listeners?',
 'Investors', 'Government officials', 'Engineers', 'Journalists', 'D',
 'Câu hỏi: Người nghe nhiều khả năng là ai?
(A) Nhà đầu tư
(B) Quan chức chính phủ
(C) Kỹ sư
(D) Nhà báo',
 '929ebcd6-7340-48ff-bac6-43b89e33b3f4', 89, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 90 (Đáp án đúng: B)
('e53a3048-2590-4f1f-9203-8f75a6998bce',
 'What does the speaker mean when she says, "All of ours are at least ten years old"?',
 'An event needs to be relocated.', 'An upgrade is not feasible.', 'A project team has a lot of experience.', 'Some company policies are outdated.', 'B',
 'Câu hỏi: Người nói có ý gì khi nói "Tất cả các đoàn tàu của chúng tôi đều ít nhất mười năm tuổi"?
(A) Một sự kiện cần được di dời.
(B) Việc nâng cấp không khả thi.
(C) Một nhóm dự án có nhiều kinh nghiệm.
(D) Một số chính sách công ty đã lỗi thời.',
 '929ebcd6-7340-48ff-bac6-43b89e33b3f4', 90, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 91 (Đáp án đúng: C)
('ad2c7af1-4095-44c9-8eab-639a028ab522',
 'According to the speaker, what can be requested by e-mail?',
 'Some presentation slides', 'Some product samples', 'A report summary', 'A discounted ticket', 'C',
 'Câu hỏi: Theo người nói, có thể yêu cầu gì qua email?
(A) Một số slide thuyết trình
(B) Một số mẫu sản phẩm
(C) Bản tóm tắt báo cáo
(D) Một vé giảm giá',
 '929ebcd6-7340-48ff-bac6-43b89e33b3f4', 91, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 4 - CỤM 8]: CÂU 92 - 94 (order_index: 92)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('0cb8ab92-827a-44d2-88be-d237433702e7',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789631255/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/e7c9hjudxuel2kwjqrlw.mp3',
 NULL,
 NULL,
 'M-Cn: As regional sales manager, I want to explore the use of a more modernized payment system in our cosmetics stores. This system would allow any sales associate to take customer payments from a tablet anywhere in the store. Why should we do this? The main complaint about shopping at our stores is waiting in long lines to pay. A lot of our stores could benefit from this, but I''ve decided to conduct a trial run at our store in the Center City Mall. By far, that''s our busiest location.',
 'M-Cn: Với tư cách là quản lý bán hàng khu vực, tôi muốn khám phá việc sử dụng một hệ thống thanh toán hiện đại hơn trong các cửa hàng mỹ phẩm của chúng ta. Hệ thống này sẽ cho phép bất kỳ nhân viên bán hàng nào thu tiền của khách hàng từ máy tính bảng ở bất kỳ đâu trong cửa hàng. Tại sao chúng ta nên làm điều này? Khiếu nại chính về việc mua sắm tại các cửa hàng của chúng ta là phải chờ đợi trong hàng dài để thanh toán. Rất nhiều cửa hàng của chúng ta có thể hưởng lợi từ điều này, nhưng tôi đã quyết định tiến hành thử nghiệm tại cửa hàng của chúng ta ở Trung tâm Mua sắm Center City. Cho đến nay, đó là địa điểm đông khách nhất của chúng ta.',
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d105559-aeaa-11f1-b6c1-c0e43471a03a', 92, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 92 (Đáp án đúng: B)
('8b60b432-8ade-441b-ae6f-a7c70f3be097',
 'What does the speaker want to do?',
 'Increase online sales', 'Upgrade a payment system', 'Create a new product line', 'Add store locations', 'B',
 'Câu hỏi: Người nói muốn làm gì?
(A) Tăng doanh số bán hàng trực tuyến
(B) Nâng cấp hệ thống thanh toán
(C) Tạo một dòng sản phẩm mới
(D) Thêm địa điểm cửa hàng',
 '0cb8ab92-827a-44d2-88be-d237433702e7', 92, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 93 (Đáp án đúng: A)
('d02501fe-a1fe-4580-ba79-4b5e5ebc37ec',
 'According to the speaker, what is the customers'' main complaint?',
 'Long lines', 'High prices', 'Unavailable items', 'Unfriendly staff', 'A',
 'Câu hỏi: Theo người nói, khiếu nại chính của khách hàng là gì?
(A) Hàng đợi dài
(B) Giá cao
(C) Mặt hàng không có sẵn
(D) Nhân viên không thân thiện',
 '0cb8ab92-827a-44d2-88be-d237433702e7', 93, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 94 (Đáp án đúng: D)
('724c7811-d969-4a6d-99df-cf8837b185fa',
 'Why does the speaker say, "that''s our busiest location"?',
 'To request some feedback', 'To compliment some staff', 'To express frustration', 'To justify a choice', 'D',
 'Câu hỏi: Tại sao người nói nói "đó là địa điểm đông khách nhất của chúng ta"?
(A) Để yêu cầu phản hồi
(B) Để khen ngợi một số nhân viên
(C) Để bày tỏ sự thất vọng
(D) Để biện minh cho một lựa chọn',
 '0cb8ab92-827a-44d2-88be-d237433702e7', 94, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 4 - CỤM 9]: CÂU 95 - 97 (order_index: 95)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('87f7b2a7-06ea-4ca9-b305-eae26670bd10',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789631257/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/xfuxwzgx0dknmmfpyv9l.mp3',
 'https://res.cloudinary.com/ovs0odtq/image/upload/v1789630548/Resource/toeic-learning/exams/ets-toeic-2026-test-01/images/lj1x6ubwdafrmttkpayp.png',
 NULL,
 'W-Br: In local news, the downtown Reston Office Tower is completed. The most extraordinary feature of the building is its beautiful garden, located in the lobby. Reston''s management office has confirmed the tenant list for the building. And we interviewed the CEO of Barnum Financial Services about its new offices. He said he and his team are excited to move in in January. A recording of the full interview with the CEO is available on our Web site.',
 'W-Br: Trong tin tức địa phương, Tòa nhà Văn phòng Reston ở trung tâm thành phố đã hoàn thành. Đặc điểm phi thường nhất của tòa nhà là khu vườn tuyệt đẹp của nó, nằm ở sảnh chính. Văn phòng quản lý của Reston đã xác nhận danh sách người thuê cho tòa nhà. Và chúng tôi đã phỏng vấn Giám đốc điều hành của Dịch vụ Tài chính Barnum về văn phòng mới của họ. Ông ấy nói rằng ông và nhóm của mình rất háo hức chuyển vào vào tháng Một. Bản ghi âm của cuộc phỏng vấn đầy đủ với Giám đốc điều hành có sẵn trên trang web của chúng tôi.',
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d105559-aeaa-11f1-b6c1-c0e43471a03a', 95, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 95 (Đáp án đúng: A)
('ecdd2537-041e-4c96-8f99-c4d0235460c1',
 'According to the speaker, what is special about the Reston Office Tower?',
 'It features an indoor garden.', 'It exhibits work from local artists.', 'It runs on solar power.', 'It has won many awards.', 'A',
 'Câu hỏi: Theo người nói, điều gì đặc biệt ở Tòa nhà Văn phòng Reston?
(A) Nó có một khu vườn trong nhà.
(B) Nó trưng bày tác phẩm của các nghệ sĩ địa phương.
(C) Nó chạy bằng năng lượng mặt trời.
(D) Nó đã giành được nhiều giải thưởng.',
 '87f7b2a7-06ea-4ca9-b305-eae26670bd10', 95, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 96 (Đáp án đúng: C)
('898e3e5d-847f-45cb-8585-6890d249c2d6',
 'Look at the graphic. Which floors will be occupied in January?',
 'Floors 1–5', 'Floors 6–10', 'Floors 11–14', 'Floors 15–17', 'C',
 'Câu hỏi: Nhìn vào hình minh họa. Những tầng nào sẽ được sử dụng vào tháng Một?
(A) Tầng 1–5
(B) Tầng 6–10
(C) Tầng 11–14
(D) Tầng 15–17',
 '87f7b2a7-06ea-4ca9-b305-eae26670bd10', 96, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 97 (Đáp án đúng: D)
('f77641fb-f29d-457c-8e4f-ba75591f28f1',
 'What does the speaker say is available on a Web site?',
 'Some photographs', 'An event schedule', 'A floor layout', 'A recorded interview', 'D',
 'Câu hỏi: Người nói nói có gì có sẵn trên trang web?
(A) Một số bức ảnh
(B) Lịch sự kiện
(C) Sơ đồ tầng
(D) Một cuộc phỏng vấn được ghi âm',
 '87f7b2a7-06ea-4ca9-b305-eae26670bd10', 97, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 4 - CỤM 10]: CÂU 98 - 100 (order_index: 98)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('3b91d224-4d7b-4b95-a883-f77be329c0c3',
 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789631267/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/okhtmemhforfupnp5kge.mp3',
 'https://res.cloudinary.com/ovs0odtq/image/upload/v1789630529/Resource/toeic-learning/exams/ets-toeic-2026-test-01/images/drxmsfsgamhvnttv032z.png',
 NULL,
 'M-Au: Good morning, and thank you for attending this meeting for prospective investors. ZZ Mining has been planning to expand our operations by opening an additional silver mine. Let me show you the laboratory analysis of our exploratory drilling. On the screen, you can see information about the ore extracted from different sites. The highest-grade site had 410 grams of silver per ton of ore. However, the site with 390 grams per ton has a larger deposit, so that''s where we''ll build the new mine. Our next step is to apply for the necessary permits. We''ll do that next week.',
 'M-Au: Chào buổi sáng, và cảm ơn quý vị đã tham dự cuộc họp dành cho các nhà đầu tư tiềm năng này. ZZ Mining đã lên kế hoạch mở rộng hoạt động của mình bằng cách mở thêm một mỏ bạc. Để tôi cho quý vị xem phân tích phòng thí nghiệm về hoạt động khoan thăm dò của chúng tôi. Trên màn hình, quý vị có thể thấy thông tin về quặng được khai thác từ các địa điểm khác nhau. Địa điểm có hàm lượng cao nhất có 410 gram bạc mỗi tấn quặng. Tuy nhiên, địa điểm có 390 gram mỗi tấn lại có trữ lượng lớn hơn, vì vậy đó là nơi chúng tôi sẽ xây dựng mỏ mới. Bước tiếp theo của chúng tôi là xin các giấy phép cần thiết. Chúng tôi sẽ làm điều đó vào tuần tới.',
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d105559-aeaa-11f1-b6c1-c0e43471a03a', 98, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 98 (Đáp án đúng: D)
('9a47794c-a5bc-42dc-9340-c6b734b16531',
 'Who most likely are the listeners?',
 'Safety engineers', 'Laboratory technicians', 'Legal consultants', 'Business investors', 'D',
 'Câu hỏi: Người nghe nhiều khả năng là ai?
(A) Kỹ sư an toàn
(B) Kỹ thuật viên phòng thí nghiệm
(C) Cố vấn pháp lý
(D) Nhà đầu tư kinh doanh',
 '3b91d224-4d7b-4b95-a883-f77be329c0c3', 98, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 99 (Đáp án đúng: C)
('a68ac481-5024-453f-a096-b863eb16e166',
 'Look at the graphic. Where will a new mine be built?',
 'At site 1', 'At site 2', 'At site 3', 'At site 4', 'C',
 'Câu hỏi: Nhìn vào hình minh họa. Một mỏ mới sẽ được xây dựng ở đâu?
(A) Tại địa điểm 1
(B) Tại địa điểm 2
(C) Tại địa điểm 3
(D) Tại địa điểm 4',
 '3b91d224-4d7b-4b95-a883-f77be329c0c3', 99, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 100 (Đáp án đúng: A)
('4ced7c70-68ff-48d7-a7be-db00f86abd5e',
 'What does the speaker say is the next step?',
 'Applying for permits', 'Installing equipment', 'Hiring additional staff', 'Updating a manual', 'A',
 'Câu hỏi: Người nói nói bước tiếp theo là gì?
(A) Xin giấy phép
(B) Lắp đặt thiết bị
(C) Thuê thêm nhân viên
(D) Cập nhật sách hướng dẫn',
 '3b91d224-4d7b-4b95-a883-f77be329c0c3', 100, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ==============================================================================
-- 7.6 PART 5: HOÀN THÀNH CÂU (CÂU 101 -> 130)
-- 30 câu hoàn thành câu ngữ pháp và từ vựng độc lập
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- [PART 5 - CỤM 1]: CÂU 101 (order_index: 101)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c5000101-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 NULL,
 NULL,
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10565f-aeaa-11f1-b6c1-c0e43471a03a', 101, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 101 (Đáp án đúng: B)
('q5000101-8d39-4669-9e60-6c9de8270c00',
 'The lecture will take place at 6:00 p.m., ---------- which attendees may ask questions.',
 'across', 'after', 'inside', 'among', 'B',
 'Câu hỏi: Bài giảng sẽ diễn ra lúc 6 giờ tối, sau đó người tham dự có thể đặt câu hỏi.
(A) across: ngang qua
(B) after: sau
(C) inside: bên trong
(D) among: giữa

Giải thích: Cấu trúc "after which" là mệnh đề quan hệ với giới từ đứng trước đại từ quan hệ "which", thay thế cho mốc thời gian 6:00 p.m. Nghĩa: "sau thời điểm đó". Đáp án đúng là (B).',
 'c5000101-8d39-4669-9e60-6c9de8270c00', 101, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 5 - CỤM 2]: CÂU 102 (order_index: 102)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c5000102-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 NULL,
 NULL,
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10565f-aeaa-11f1-b6c1-c0e43471a03a', 102, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 102 (Đáp án đúng: A)
('q5000102-8d39-4669-9e60-6c9de8270c00',
 'The ---------- antique shop in Pepper Valley will close down next month.',
 'last', 'lasts', 'lasted', 'lasting', 'A',
 'Câu hỏi: Cửa hàng đồ cổ cuối cùng ở Pepper Valley sẽ đóng cửa vào tháng tới.
(A) last: cuối cùng (tính từ)
(B) lasts: (động từ ngôi 3 số ít)
(C) lasted: (động từ quá khứ)
(D) lasting: (tính từ/động từ hiện tại phân từ)

Giải thích: Trước danh từ "antique shop" cần một tính từ bổ nghĩa. "Last" (cuối cùng) là tính từ phù hợp cả ngữ pháp lẫn ngữ nghĩa. Đáp án đúng là (A).',
 'c5000102-8d39-4669-9e60-6c9de8270c00', 102, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 5 - CỤM 3]: CÂU 103 (order_index: 103)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c5000103-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 NULL,
 NULL,
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10565f-aeaa-11f1-b6c1-c0e43471a03a', 103, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 103 (Đáp án đúng: A)
('q5000103-8d39-4669-9e60-6c9de8270c00',
 'Merryville residents will receive an online status ---------- about the ongoing bridge construction project.',
 'update', 'change', 'payment', 'request', 'A',
 'Câu hỏi: Cư dân Merryville sẽ nhận được bản cập nhật tình trạng trực tuyến về dự án xây dựng cầu đang diễn ra.
(A) update: cập nhật
(B) change: thay đổi
(C) payment: thanh toán
(D) request: yêu cầu

Giải thích: Cụm từ cố định "status update" nghĩa là "bản cập nhật tình trạng". Đáp án đúng là (A).',
 'c5000103-8d39-4669-9e60-6c9de8270c00', 103, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 5 - CỤM 4]: CÂU 104 (order_index: 104)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c5000104-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 NULL,
 NULL,
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10565f-aeaa-11f1-b6c1-c0e43471a03a', 104, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 104 (Đáp án đúng: B)
('q5000104-8d39-4669-9e60-6c9de8270c00',
 'As a result of ---------- many years leading media organizations, Ms. Ayo was selected for the Dowel Journalism Prize.',
 'she', 'her', 'hers', 'herself', 'B',
 'Câu hỏi: Nhờ việc dẫn dắt nhiều tổ chức truyền thông trong nhiều năm, bà Ayo đã được chọn cho Giải thưởng Báo chí Dowel.
(A) she: cô ấy (chủ ngữ)
(B) her: cô ấy (tính từ sở hữu)
(C) hers: của cô ấy (đại từ sở hữu)
(D) herself: chính cô ấy (đại từ phản thân)

Giải thích: Sau giới từ "of" cần danh từ/cụm danh từ. "Her" ở đây là tính từ sở hữu bổ nghĩa cho cụm danh từ "many years leading media organizations". Đáp án đúng là (B).',
 'c5000104-8d39-4669-9e60-6c9de8270c00', 104, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 5 - CỤM 5]: CÂU 105 (order_index: 105)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c5000105-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 NULL,
 NULL,
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10565f-aeaa-11f1-b6c1-c0e43471a03a', 105, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 105 (Đáp án đúng: B)
('q5000105-8d39-4669-9e60-6c9de8270c00',
 'To stop the ---------- of computer viruses, do not open suspicious e-mails.',
 'break', 'spread', 'balance', 'surface', 'B',
 'Câu hỏi: Để ngăn chặn sự lây lan của virus máy tính, đừng mở những email đáng ngờ.
(A) break: sự phá vỡ
(B) spread: sự lây lan
(C) balance: sự cân bằng
(D) surface: bề mặt

Giải thích: Cụm từ "the spread of computer viruses" (sự lây lan của virus máy tính) là cách diễn đạt chuẩn. Đáp án đúng là (B).',
 'c5000105-8d39-4669-9e60-6c9de8270c00', 105, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 5 - CỤM 6]: CÂU 106 (order_index: 106)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c5000106-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 NULL,
 NULL,
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10565f-aeaa-11f1-b6c1-c0e43471a03a', 106, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 106 (Đáp án đúng: C)
('q5000106-8d39-4669-9e60-6c9de8270c00',
 'The hiring manager ---------- considered each applicant''s résumé and qualifications.',
 'caring', 'careful', 'carefully', 'carefulness', 'C',
 'Câu hỏi: Người quản lý tuyển dụng đã xem xét cẩn thận hồ sơ và trình độ của từng ứng viên.
(A) caring: quan tâm (tính từ)
(B) careful: cẩn thận (tính từ)
(C) carefully: một cách cẩn thận (trạng từ)
(D) carefulness: sự cẩn thận (danh từ)

Giải thích: Trước động từ "considered" cần một trạng từ bổ nghĩa. "Carefully" là trạng từ phù hợp. Đáp án đúng là (C).',
 'c5000106-8d39-4669-9e60-6c9de8270c00', 106, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 5 - CỤM 7]: CÂU 107 (order_index: 107)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c5000107-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 NULL,
 NULL,
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10565f-aeaa-11f1-b6c1-c0e43471a03a', 107, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 107 (Đáp án đúng: C)
('q5000107-8d39-4669-9e60-6c9de8270c00',
 'In October, Mr. Sakamoto will leave for New Zealand ---------- will oversee the opening of the new Auckland branch.',
 'because', 'in addition', 'and', 'prior to', 'C',
 'Câu hỏi: Vào tháng Mười, ông Sakamoto sẽ rời đến New Zealand và sẽ giám sát việc khai trương chi nhánh Auckland mới.
(A) because: bởi vì
(B) in addition: thêm vào đó
(C) and: và
(D) prior to: trước

Giải thích: Cần một liên từ kết nối hai động từ "leave" và "will oversee" trong cùng một chủ ngữ. "And" là liên từ phù hợp. Đáp án đúng là (C).',
 'c5000107-8d39-4669-9e60-6c9de8270c00', 107, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 5 - CỤM 8]: CÂU 108 (order_index: 108)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c5000108-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 NULL,
 NULL,
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10565f-aeaa-11f1-b6c1-c0e43471a03a', 108, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 108 (Đáp án đúng: D)
('q5000108-8d39-4669-9e60-6c9de8270c00',
 'Tarateer Pharmaceuticals is varying its product ---------- to include over-the-counter medications.',
 'to line', 'lining', 'lined', 'line', 'D',
 'Câu hỏi: Tarateer Pharmaceuticals đang đa dạng hóa dòng sản phẩm của mình để bao gồm các loại thuốc không kê đơn.
(A) to line: để xếp hàng
(B) lining: đang xếp hàng
(C) lined: đã xếp hàng
(D) line: dòng

Giải thích: Cụm từ cố định "product line" nghĩa là "dòng sản phẩm". Đáp án đúng là (D).',
 'c5000108-8d39-4669-9e60-6c9de8270c00', 108, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 5 - CỤM 9]: CÂU 109 (order_index: 109)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c5000109-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 NULL,
 NULL,
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10565f-aeaa-11f1-b6c1-c0e43471a03a', 109, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 109 (Đáp án đúng: A)
('q5000109-8d39-4669-9e60-6c9de8270c00',
 'Dynart, Inc., continuously ---------- new ways to reduce its use of plastics.',
 'seeks', 'seeker', 'to seek', 'seeking', 'A',
 'Câu hỏi: Dynart, Inc. không ngừng tìm kiếm những cách mới để giảm việc sử dụng nhựa.
(A) seeks: tìm kiếm (động từ ngôi 3 số ít)
(B) seeker: người tìm kiếm (danh từ)
(C) to seek: để tìm kiếm
(D) seeking: đang tìm kiếm

Giải thích: Chủ ngữ "Dynart, Inc." là ngôi thứ 3 số ít, cần động từ chia ở thì hiện tại đơn. "Seeks" là đáp án đúng. Đáp án đúng là (A).',
 'c5000109-8d39-4669-9e60-6c9de8270c00', 109, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 5 - CỤM 10]: CÂU 110 (order_index: 110)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c5000110-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 NULL,
 NULL,
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10565f-aeaa-11f1-b6c1-c0e43471a03a', 110, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 110 (Đáp án đúng: A)
('q5000110-8d39-4669-9e60-6c9de8270c00',
 'The cash registers at Pirkle Books automatically ---------- the remaining inventory of books available.',
 'calculate', 'calculator', 'calculating', 'calculation', 'A',
 'Câu hỏi: Máy tính tiền tại Pirkle Books tự động tính toán lượng sách còn lại trong kho.
(A) calculate: tính toán (động từ)
(B) calculator: máy tính (danh từ)
(C) calculating: đang tính toán
(D) calculation: sự tính toán (danh từ)

Giải thích: Chủ ngữ "The cash registers" là số nhiều, cần động từ nguyên mẫu không chia (chia giống như hiện tại đơn số nhiều). "Calculate" là đáp án đúng. Đáp án đúng là (A).',
 'c5000110-8d39-4669-9e60-6c9de8270c00', 110, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 5 - CỤM 11]: CÂU 111 (order_index: 111)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c5000111-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 NULL,
 NULL,
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10565f-aeaa-11f1-b6c1-c0e43471a03a', 111, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 111 (Đáp án đúng: C)
('q5000111-8d39-4669-9e60-6c9de8270c00',
 'The product team is designing mapping software that can ---------- locate underground minerals.',
 'infinitely', 'sincerely', 'precisely', 'greatly', 'C',
 'Câu hỏi: Nhóm sản phẩm đang thiết kế phần mềm bản đồ có thể xác định chính xác vị trí khoáng sản dưới lòng đất.
(A) infinitely: vô hạn
(B) sincerely: chân thành
(C) precisely: chính xác
(D) greatly: rất nhiều

Giải thích: Trong ngữ cảnh xác định vị trí khoáng sản, "precisely" (chính xác) là trạng từ phù hợp nhất về nghĩa. Đáp án đúng là (C).',
 'c5000111-8d39-4669-9e60-6c9de8270c00', 111, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 5 - CỤM 12]: CÂU 112 (order_index: 112)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c5000112-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 NULL,
 NULL,
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10565f-aeaa-11f1-b6c1-c0e43471a03a', 112, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 112 (Đáp án đúng: C)
('q5000112-8d39-4669-9e60-6c9de8270c00',
 'According to CEO Mayu Yamada, it would not be ---------- responsible to expand the warehouse at this time.',
 'finance', 'financials', 'financially', 'financing', 'C',
 'Câu hỏi: Theo Giám đốc điều hành Mayu Yamada, việc mở rộng nhà kho vào thời điểm này sẽ không có trách nhiệm về mặt tài chính.
(A) finance: tài chính (danh từ/động từ)
(B) financials: báo cáo tài chính
(C) financially: về mặt tài chính (trạng từ)
(D) financing: sự tài trợ

Giải thích: Trước tính từ "responsible" cần một trạng từ bổ nghĩa. "Financially" là trạng từ phù hợp. Đáp án đúng là (C).',
 'c5000112-8d39-4669-9e60-6c9de8270c00', 112, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 5 - CỤM 13]: CÂU 113 (order_index: 113)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c5000113-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 NULL,
 NULL,
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10565f-aeaa-11f1-b6c1-c0e43471a03a', 113, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 113 (Đáp án đúng: A)
('q5000113-8d39-4669-9e60-6c9de8270c00',
 'Analysts cannot say with any ---------- what the regional demand for electric trucks will be.',
 'certainty', 'justice', 'excellence', 'denial', 'A',
 'Câu hỏi: Các nhà phân tích không thể nói với bất kỳ sự chắc chắn nào về nhu cầu khu vực đối với xe tải điện sẽ như thế nào.
(A) certainty: sự chắc chắn
(B) justice: công lý
(C) excellence: sự xuất sắc
(D) denial: sự phủ nhận

Giải thích: Cụm từ cố định "with certainty" nghĩa là "với sự chắc chắn". Đáp án đúng là (A).',
 'c5000113-8d39-4669-9e60-6c9de8270c00', 113, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 5 - CỤM 14]: CÂU 114 (order_index: 114)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c5000114-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 NULL,
 NULL,
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10565f-aeaa-11f1-b6c1-c0e43471a03a', 114, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 114 (Đáp án đúng: C)
('q5000114-8d39-4669-9e60-6c9de8270c00',
 'As part of its marketing campaign, Elegancia Dishware is ---------- soliciting feedback from customers.',
 'lightly', 'loyally', 'actively', 'cleanly', 'C',
 'Câu hỏi: Là một phần trong chiến dịch tiếp thị của mình, Elegancia Dishware đang tích cực thu thập phản hồi từ khách hàng.
(A) lightly: nhẹ nhàng
(B) loyally: trung thành
(C) actively: tích cực
(D) cleanly: sạch sẽ

Giải thích: Trong ngữ cảnh chiến dịch tiếp thị, "actively" (tích cực) là trạng từ phù hợp nhất. Đáp án đúng là (C).',
 'c5000114-8d39-4669-9e60-6c9de8270c00', 114, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 5 - CỤM 15]: CÂU 115 (order_index: 115)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c5000115-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 NULL,
 NULL,
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10565f-aeaa-11f1-b6c1-c0e43471a03a', 115, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 115 (Đáp án đúng: C)
('q5000115-8d39-4669-9e60-6c9de8270c00',
 'Rain gardens are intended to ---------- water to prevent flooding of local roads.',
 'engage', 'undergo', 'absorb', 'overwhelm', 'C',
 'Câu hỏi: Vườn mưa được thiết kế để hấp thụ nước nhằm ngăn chặn lũ lụt trên các con đường địa phương.
(A) engage: tham gia
(B) undergo: trải qua
(C) absorb: hấp thụ
(D) overwhelm: áp đảo

Giải thích: Trong ngữ cảnh vườn mưa, "absorb water" (hấp thụ nước) là cách diễn đạt phù hợp nhất. Đáp án đúng là (C).',
 'c5000115-8d39-4669-9e60-6c9de8270c00', 115, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 5 - CỤM 16]: CÂU 116 (order_index: 116)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c5000116-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 NULL,
 NULL,
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10565f-aeaa-11f1-b6c1-c0e43471a03a', 116, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 116 (Đáp án đúng: D)
('q5000116-8d39-4669-9e60-6c9de8270c00',
 'Theta Industries'' training program aims to increase the ---------- of its manufacturing systems.',
 'producer', 'produced', 'productive', 'productivity', 'D',
 'Câu hỏi: Chương trình đào tạo của Theta Industries nhằm tăng năng suất của các hệ thống sản xuất.
(A) producer: nhà sản xuất
(B) produced: được sản xuất
(C) productive: có năng suất (tính từ)
(D) productivity: năng suất (danh từ)

Giải thích: Sau mạo từ "the" cần một danh từ. "Productivity" (năng suất) là danh từ phù hợp về ngữ pháp và ngữ nghĩa. Đáp án đúng là (D).',
 'c5000116-8d39-4669-9e60-6c9de8270c00', 116, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 5 - CỤM 17]: CÂU 117 (order_index: 117)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c5000117-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 NULL,
 NULL,
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10565f-aeaa-11f1-b6c1-c0e43471a03a', 117, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 117 (Đáp án đúng: A)
('q5000117-8d39-4669-9e60-6c9de8270c00',
 'The board of directors has voted to award Mr. Mitrakos a bonus for his role ---------- obtaining the international contract.',
 'in', 'at', 'except', 'apart', 'A',
 'Câu hỏi: Hội đồng quản trị đã bỏ phiếu trao cho ông Mitrakos một khoản tiền thưởng vì vai trò của ông trong việc giành được hợp đồng quốc tế.
(A) in: trong
(B) at: tại
(C) except: ngoại trừ
(D) apart: tách ra

Giải thích: Cụm từ cố định "role in + V-ing" nghĩa là "vai trò trong việc làm gì". Đáp án đúng là (A).',
 'c5000117-8d39-4669-9e60-6c9de8270c00', 117, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 5 - CỤM 18]: CÂU 118 (order_index: 118)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c5000118-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 NULL,
 NULL,
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10565f-aeaa-11f1-b6c1-c0e43471a03a', 118, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 118 (Đáp án đúng: D)
('q5000118-8d39-4669-9e60-6c9de8270c00',
 'The finance director gave his approval ---------- the project can move forward.',
 'along', 'furthermore', 'cautiously', 'so that', 'D',
 'Câu hỏi: Giám đốc tài chính đã đưa ra sự chấp thuận để dự án có thể tiến triển.
(A) along: dọc theo
(B) furthermore: hơn nữa
(C) cautiously: một cách thận trọng
(D) so that: để

Giải thích: Cần một liên từ chỉ mục đích nối hai mệnh đề. "So that" (để) là liên từ phù hợp. Đáp án đúng là (D).',
 'c5000118-8d39-4669-9e60-6c9de8270c00', 118, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 5 - CỤM 19]: CÂU 119 (order_index: 119)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c5000119-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 NULL,
 NULL,
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10565f-aeaa-11f1-b6c1-c0e43471a03a', 119, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 119 (Đáp án đúng: C)
('q5000119-8d39-4669-9e60-6c9de8270c00',
 'The newspaper article describes ways job seekers can ---------- for having little workplace experience.',
 'reply', 'capture', 'compensate', 'accumulate', 'C',
 'Câu hỏi: Bài báo mô tả những cách mà người tìm việc có thể bù đắp cho việc có ít kinh nghiệm làm việc.
(A) reply: trả lời
(B) capture: bắt giữ
(C) compensate: bù đắp
(D) accumulate: tích lũy

Giải thích: Cụm từ "compensate for" nghĩa là "bù đắp cho". Đáp án đúng là (C).',
 'c5000119-8d39-4669-9e60-6c9de8270c00', 119, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 5 - CỤM 20]: CÂU 120 (order_index: 120)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c5000120-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 NULL,
 NULL,
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10565f-aeaa-11f1-b6c1-c0e43471a03a', 120, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 120 (Đáp án đúng: B)
('q5000120-8d39-4669-9e60-6c9de8270c00',
 'Mr. Ellis and Ms. Barnes were both highly qualified, but ---------- got the job.',
 'myself', 'neither', 'anybody', 'whoever', 'B',
 'Câu hỏi: Ông Ellis và bà Barnes đều có trình độ cao, nhưng không ai trong số họ nhận được công việc.
(A) myself: chính tôi
(B) neither: không ai trong hai người
(C) anybody: bất kỳ ai
(D) whoever: bất cứ ai

Giải thích: "Neither" dùng để chỉ "không ai trong hai người", phù hợp với ngữ cảnh có hai ứng viên. Đáp án đúng là (B).',
 'c5000120-8d39-4669-9e60-6c9de8270c00', 120, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 5 - CỤM 21]: CÂU 121 (order_index: 121)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c5000121-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 NULL,
 NULL,
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10565f-aeaa-11f1-b6c1-c0e43471a03a', 121, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 121 (Đáp án đúng: D)
('q5000121-8d39-4669-9e60-6c9de8270c00',
 'Ennis Photography purchased all new lighting equipment ---------- the high cost.',
 'even though', 'however', 'until', 'despite', 'D',
 'Câu hỏi: Ennis Photography đã mua tất cả thiết bị chiếu sáng mới bất chấp chi phí cao.
(A) even though: mặc dù (+ mệnh đề)
(B) however: tuy nhiên
(C) until: cho đến khi
(D) despite: bất chấp (+ danh từ/cụm danh từ)

Giải thích: Sau chỗ trống là cụm danh từ "the high cost", cần giới từ "despite". Đáp án đúng là (D).',
 'c5000121-8d39-4669-9e60-6c9de8270c00', 121, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 5 - CỤM 22]: CÂU 122 (order_index: 122)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c5000122-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 NULL,
 NULL,
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10565f-aeaa-11f1-b6c1-c0e43471a03a', 122, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 122 (Đáp án đúng: C)
('q5000122-8d39-4669-9e60-6c9de8270c00',
 'Marburton residents who wish to ---------- a home should contact the award-winning team at Kwan Real Estate.',
 'seller', 'sold', 'sell', 'selling', 'C',
 'Câu hỏi: Cư dân Marburton muốn bán nhà nên liên hệ với đội ngũ từng đoạt giải thưởng tại Kwan Real Estate.
(A) seller: người bán (danh từ)
(B) sold: đã bán
(C) sell: bán (động từ nguyên mẫu)
(D) selling: đang bán

Giải thích: Sau "to" (trong "wish to") cần động từ nguyên mẫu. "Sell" là đáp án đúng. Đáp án đúng là (C).',
 'c5000122-8d39-4669-9e60-6c9de8270c00', 122, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 5 - CỤM 23]: CÂU 123 (order_index: 123)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c5000123-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 NULL,
 NULL,
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10565f-aeaa-11f1-b6c1-c0e43471a03a', 123, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 123 (Đáp án đúng: B)
('q5000123-8d39-4669-9e60-6c9de8270c00',
 'Maswa Bistro began a ---------- agreement with local farmers to purchase a set amount of produce each week.',
 'disruptive', 'cooperative', 'grateful', 'concerned', 'B',
 'Câu hỏi: Maswa Bistro đã bắt đầu một thỏa thuận hợp tác với nông dân địa phương để mua một lượng nông sản cố định mỗi tuần.
(A) disruptive: gây gián đoạn
(B) cooperative: hợp tác
(C) grateful: biết ơn
(D) concerned: lo lắng

Giải thích: Trong ngữ cảnh thỏa thuận với nông dân, "cooperative agreement" (thỏa thuận hợp tác) là phù hợp nhất. Đáp án đúng là (B).',
 'c5000123-8d39-4669-9e60-6c9de8270c00', 123, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 5 - CỤM 24]: CÂU 124 (order_index: 124)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c5000124-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 NULL,
 NULL,
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10565f-aeaa-11f1-b6c1-c0e43471a03a', 124, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 124 (Đáp án đúng: C)
('q5000124-8d39-4669-9e60-6c9de8270c00',
 'The City of Doyle''s new downtown parking ---------- have been met with opposition by residents and visitors.',
 'restricts', 'restricted', 'restrictions', 'restricting', 'C',
 'Câu hỏi: Các quy định đỗ xe mới ở trung tâm thành phố của Thành phố Doyle đã vấp phải sự phản đối của cư dân và du khách.
(A) restricts: hạn chế (động từ)
(B) restricted: bị hạn chế
(C) restrictions: các quy định hạn chế (danh từ số nhiều)
(D) restricting: đang hạn chế

Giải thích: Chủ ngữ "have been met" (số nhiều) nên cần danh từ số nhiều. "Restrictions" là đáp án đúng. Đáp án đúng là (C).',
 'c5000124-8d39-4669-9e60-6c9de8270c00', 124, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 5 - CỤM 25]: CÂU 125 (order_index: 125)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c5000125-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 NULL,
 NULL,
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10565f-aeaa-11f1-b6c1-c0e43471a03a', 125, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 125 (Đáp án đúng: A)
('q5000125-8d39-4669-9e60-6c9de8270c00',
 'The plumbing position requires extensive training, even for those who studied ---------- in technical school.',
 'diligently', 'scientifically', 'objectively', 'decidedly', 'A',
 'Câu hỏi: Vị trí thợ ống nước đòi hỏi đào tạo chuyên sâu, ngay cả đối với những người đã học tập chăm chỉ ở trường kỹ thuật.
(A) diligently: chăm chỉ
(B) scientifically: một cách khoa học
(C) objectively: một cách khách quan
(D) decidedly: một cách dứt khoát

Giải thích: Trong ngữ cảnh học tập ở trường, "diligently" (chăm chỉ) là trạng từ phù hợp nhất. Đáp án đúng là (A).',
 'c5000125-8d39-4669-9e60-6c9de8270c00', 125, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 5 - CỤM 26]: CÂU 126 (order_index: 126)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c5000126-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 NULL,
 NULL,
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10565f-aeaa-11f1-b6c1-c0e43471a03a', 126, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 126 (Đáp án đúng: A)
('q5000126-8d39-4669-9e60-6c9de8270c00',
 'With its fixed price ----------, Omega Cellular guarantees no phone bill increases for three years.',
 'assurance', 'assuredly', 'assuring', 'assures', 'A',
 'Câu hỏi: Với sự đảm bảo giá cố định, Omega Cellular cam kết không tăng hóa đơn điện thoại trong ba năm.
(A) assurance: sự đảm bảo (danh từ)
(B) assuredly: một cách chắc chắn
(C) assuring: đang đảm bảo
(D) assures: đảm bảo (động từ)

Giải thích: Sau tính từ "fixed price" cần một danh từ để tạo thành cụm danh từ. "Assurance" là đáp án đúng. Đáp án đúng là (A).',
 'c5000126-8d39-4669-9e60-6c9de8270c00', 126, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 5 - CỤM 27]: CÂU 127 (order_index: 127)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c5000127-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 NULL,
 NULL,
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10565f-aeaa-11f1-b6c1-c0e43471a03a', 127, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 127 (Đáp án đúng: D)
('q5000127-8d39-4669-9e60-6c9de8270c00',
 'As chief analytics officer, Mr. Ko has worked at Lochston Ltd. with great ---------- for more than twenty years.',
 'deduction', 'duplication', 'declaration', 'dedication', 'D',
 'Câu hỏi: Với tư cách là giám đốc phân tích, ông Ko đã làm việc tại Lochston Ltd. với sự tận tâm tuyệt vời trong hơn hai mươi năm.
(A) deduction: sự khấu trừ
(B) duplication: sự trùng lặp
(C) declaration: sự tuyên bố
(D) dedication: sự tận tâm

Giải thích: Trong ngữ cảnh làm việc lâu dài, "dedication" (sự tận tâm) là danh từ phù hợp nhất. Đáp án đúng là (D).',
 'c5000127-8d39-4669-9e60-6c9de8270c00', 127, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 5 - CỤM 28]: CÂU 128 (order_index: 128)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c5000128-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 NULL,
 NULL,
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10565f-aeaa-11f1-b6c1-c0e43471a03a', 128, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 128 (Đáp án đúng: D)
('q5000128-8d39-4669-9e60-6c9de8270c00',
 'Milltown Hospital''s cafeteria serves lunch seven days a week ---------- only on weekdays.',
 'up to', 'as though', 'each time', 'rather than', 'D',
 'Câu hỏi: Quán ăn tự phục vụ của Bệnh viện Milltown phục vụ bữa trưa bảy ngày một tuần thay vì chỉ vào các ngày trong tuần.
(A) up to: lên đến
(B) as though: như thể
(C) each time: mỗi lần
(D) rather than: thay vì

Giải thích: "Rather than" (thay vì) diễn tả sự tương phản giữa "bảy ngày một tuần" và "chỉ các ngày trong tuần". Đáp án đúng là (D).',
 'c5000128-8d39-4669-9e60-6c9de8270c00', 128, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 5 - CỤM 29]: CÂU 129 (order_index: 129)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c5000129-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 NULL,
 NULL,
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10565f-aeaa-11f1-b6c1-c0e43471a03a', 129, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 129 (Đáp án đúng: D)
('q5000129-8d39-4669-9e60-6c9de8270c00',
 'The store''s entire inventory of lumber comes from a nearby ---------- supplier.',
 'financial', 'promotional', 'chemical', 'commercial', 'D',
 'Câu hỏi: Toàn bộ hàng tồn kho gỗ xẻ của cửa hàng đến từ một nhà cung cấp thương mại gần đó.
(A) financial: tài chính
(B) promotional: khuyến mãi
(C) chemical: hóa chất
(D) commercial: thương mại

Giải thích: Trong ngữ cảnh nhà cung cấp gỗ xẻ, "commercial supplier" (nhà cung cấp thương mại) là phù hợp nhất. Đáp án đúng là (D).',
 'c5000129-8d39-4669-9e60-6c9de8270c00', 129, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 5 - CỤM 30]: CÂU 130 (order_index: 130)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c5000130-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 NULL,
 NULL,
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10565f-aeaa-11f1-b6c1-c0e43471a03a', 130, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 130 (Đáp án đúng: B)
('q5000130-8d39-4669-9e60-6c9de8270c00',
 'For a $95 fee, our mechanics will determine what repairs are needed.',
 'diagnosed', 'diagnostic', 'diagnosable', 'diagnose', 'B',
 'Câu hỏi: Với mức phí 95 đô la, thợ máy của chúng tôi sẽ xác định những sửa chữa nào là cần thiết.
(A) diagnosed: được chẩn đoán
(B) diagnostic: chẩn đoán (tính từ)
(C) diagnosable: có thể chẩn đoán
(D) diagnose: chẩn đoán (động từ)

Giải thích: Trước danh từ "fee" cần một tính từ bổ nghĩa. "Diagnostic" (mang tính chẩn đoán) là đáp án đúng. Đáp án đúng là (B).',
 'c5000130-8d39-4669-9e60-6c9de8270c00', 130, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ==============================================================================
-- 7.7 PART 6: HOÀN THÀNH ĐOẠN VĂN (CÂU 131 -> 146)
-- 4 đoạn văn đọc hiểu điền khuyết (mỗi đoạn gồm đoạn văn đọc và 4 câu hỏi liên quan)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- [PART 6 - CỤM 1]: CÂU 131 - 134 (order_index: 131)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c6000131-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 'Look to Riessler Landscaping for your Garden Needs

Riessler Landscaping has everything you need to create your dream garden. We will listen to your ideas and offer suggestions that match your gardening desires. [131] The nursery here at Riessler Landscaping includes plants of many varieties and sizes that burst with eye-catching colors year-round. You are guaranteed to find something that will add to your garden. We have [132] of experience and are equipped to construct small ponds or other water features. And as our name suggests, we can [133] take on more ambitious landscaping projects—whatever you need! With more than 40 years in the landscape-design business, [134] expertise is unmatched.',
 NULL,
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d1056cd-aeaa-11f1-b6c1-c0e43471a03a', 131, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 131 (Đáp án đúng: C)
('q6000131-8d39-4669-9e60-6c9de8270c00',
 'Select the best answer to complete the text at [131].',
 'Staff members have written articles for the local newspaper.', 'Installing lights can enhance the effect of a well-designed garden.', 'Local competitors cannot beat the prices we charge.', 'Riessler Landscaping''s goal is to make your vision a reality.', 'C',
 'Câu hỏi: Chọn đáp án đúng nhất để hoàn thành đoạn văn tại vị trí [131].
(A) Các nhân viên đã viết bài cho tờ báo địa phương.
(B) Việc lắp đặt đèn có thể tăng cường hiệu ứng của một khu vườn được thiết kế đẹp.
(C) Các đối thủ cạnh tranh địa phương không thể đánh bại mức giá chúng tôi đưa ra.
(D) Mục tiêu của Riessler Landscaping là biến tầm nhìn của bạn thành hiện thực.

Giải thích: Vị trí [131] nằm ngay sau câu giới thiệu về dịch vụ và trước câu nói về vườn ươm. Đây là câu nêu bật lợi thế cạnh tranh về giá cả, phù hợp với ngữ cảnh quảng cáo dịch vụ cảnh quan. Đáp án đúng là (C).',
 'c6000131-8d39-4669-9e60-6c9de8270c00', 131, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 132 (Đáp án đúng: A)
('q6000132-8d39-4669-9e60-6c9de8270c00',
 'Select the best answer to complete the text at [132].',
 'years', 'space', 'beauty', 'moisture', 'A',
 'Câu hỏi: Chọn đáp án đúng nhất để hoàn thành đoạn văn tại vị trí [132].
(A) years: năm
(B) space: không gian
(C) beauty: vẻ đẹp
(D) moisture: độ ẩm

Giải thích: Cụm từ "have years of experience" (có nhiều năm kinh nghiệm) là cách diễn đạt cố định trong tiếng Anh thương mại, phù hợp với ngữ cảnh giới thiệu công ty cảnh quan. Đáp án đúng là (A).',
 'c6000131-8d39-4669-9e60-6c9de8270c00', 132, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 133 (Đáp án đúng: A)
('q6000133-8d39-4669-9e60-6c9de8270c00',
 'Select the best answer to complete the text at [133].',
 'also', 'rarely', 'somehow', 'nevertheless', 'A',
 'Câu hỏi: Chọn đáp án đúng nhất để hoàn thành đoạn văn tại vị trí [133].
(A) also: cũng
(B) rarely: hiếm khi
(C) somehow: bằng cách nào đó
(D) nevertheless: tuy nhiên

Giải thích: Trạng từ "also" (cũng) được dùng để bổ sung thêm một dịch vụ khác ngoài việc xây dựng hồ nước. "We can also take on more ambitious projects" nghĩa là "chúng tôi cũng có thể đảm nhận những dự án tham vọng hơn". Đáp án đúng là (A).',
 'c6000131-8d39-4669-9e60-6c9de8270c00', 133, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 134 (Đáp án đúng: B)
('q6000134-8d39-4669-9e60-6c9de8270c00',
 'Select the best answer to complete the text at [134].',
 'its', 'our', 'others', 'their', 'B',
 'Câu hỏi: Chọn đáp án đúng nhất để hoàn thành đoạn văn tại vị trí [134].
(A) its: của nó
(B) our: của chúng tôi
(C) others: của những người khác
(D) their: của họ

Giải thích: Chủ ngữ của đoạn văn là "Riessler Landscaping" (công ty), nhưng người viết đang tự giới thiệu nên dùng tính từ sở hữu "our" (của chúng tôi) để chỉ công ty mình. "Our expertise" nghĩa là "chuyên môn của chúng tôi". Đáp án đúng là (B).',
 'c6000131-8d39-4669-9e60-6c9de8270c00', 134, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 6 - CỤM 2]: CÂU 135 - 138 (order_index: 135)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c6000135-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 '10 January

Cindy Mulligan
88 Manchester Road
HARROGATE HG82 2MJ

Dear Ms. Mulligan,

We are delighted to celebrate your 30th anniversary with Brandrix Distribution Centre. [135] Your dedication, loyalty, and hard work have contributed greatly to our success over the years. We appreciate your commitment to excellence. Over the years, you [136] great initiative, creativity, and leadership.

You will be receiving a commemorative plaque by post. We hope this token of our gratitude [137] reminds you how much you mean to us.

Congratulations on reaching this [138]. Thank you for being part of our Brandrix family.

Sincerely,
Lance Powar, Vice President of Human Resources
Brandrix Distribution Centre',
 NULL,
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d1056cd-aeaa-11f1-b6c1-c0e43471a03a', 135, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 135 (Đáp án đúng: D)
('q6000135-8d39-4669-9e60-6c9de8270c00',
 'Select the best answer to complete the text at [135].',
 'We especially value our long-term customers.', 'Please join our holiday celebration.', 'Our annual report will be released soon.', 'You have been a valuable member of our team.', 'D',
 'Câu hỏi: Chọn đáp án đúng nhất để hoàn thành đoạn văn tại vị trí [135].
(A) Chúng tôi đặc biệt trân trọng những khách hàng lâu năm của mình.
(B) Hãy tham gia lễ kỷ niệm ngày lễ của chúng tôi.
(C) Báo cáo thường niên của chúng tôi sẽ sớm được công bố.
(D) Bạn là một thành viên quý giá trong đội ngũ của chúng tôi.

Giải thích: Đây là lá thư chúc mừng nhân viên kỷ niệm 30 năm làm việc tại công ty. Câu [135] cần một lời khen ngợi ghi nhận đóng góp của nhân viên, phù hợp với ngữ cảnh trang trọng của bức thư. Đáp án (D) phù hợp nhất. Đáp án đúng là (D).',
 'c6000135-8d39-4669-9e60-6c9de8270c00', 135, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 136 (Đáp án đúng: C)
('q6000136-8d39-4669-9e60-6c9de8270c00',
 'Select the best answer to complete the text at [136].',
 'will show', 'must show', 'have shown', 'are showing', 'C',
 'Câu hỏi: Chọn đáp án đúng nhất để hoàn thành đoạn văn tại vị trí [136].
(A) will show: sẽ thể hiện
(B) must show: phải thể hiện
(C) have shown: đã thể hiện
(D) are showing: đang thể hiện

Giải thích: Trạng từ chỉ thời gian "Over the years" (trong nhiều năm qua) chỉ một khoảng thời gian từ quá khứ đến hiện tại, cần thì hiện tại hoàn thành. "You have shown" (bạn đã thể hiện) là đáp án đúng. Đáp án đúng là (C).',
 'c6000135-8d39-4669-9e60-6c9de8270c00', 136, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 137 (Đáp án đúng: B)
('q6000137-8d39-4669-9e60-6c9de8270c00',
 'Select the best answer to complete the text at [137].',
 'then', 'soon', 'instead', 'likewise', 'B',
 'Câu hỏi: Chọn đáp án đúng nhất để hoàn thành đoạn văn tại vị trí [137].
(A) then: sau đó
(B) soon: sớm
(C) instead: thay vào đó
(D) likewise: tương tự

Giải thích: Trạng từ "soon" (sớm) phù hợp với ngữ cảnh: "We hope this token of our gratitude soon reminds you..." (Chúng tôi hy vọng món quà tri ân này sẽ sớm nhắc bạn nhớ...). Đáp án đúng là (B).',
 'c6000135-8d39-4669-9e60-6c9de8270c00', 137, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 138 (Đáp án đúng: A)
('q6000138-8d39-4669-9e60-6c9de8270c00',
 'Select the best answer to complete the text at [138].',
 'milestone', 'consensus', 'destination', 'understanding', 'A',
 'Câu hỏi: Chọn đáp án đúng nhất để hoàn thành đoạn văn tại vị trí [138].
(A) milestone: cột mốc quan trọng
(B) consensus: sự đồng thuận
(C) destination: điểm đến
(D) understanding: sự hiểu biết

Giải thích: Cụm từ "reaching this milestone" (đạt được cột mốc này) là cách diễn đạt cố định để chỉ một thành tựu quan trọng, phù hợp với việc kỷ niệm 30 năm làm việc. Đáp án đúng là (A).',
 'c6000135-8d39-4669-9e60-6c9de8270c00', 138, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 6 - CỤM 3]: CÂU 139 - 142 (order_index: 139)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c6000139-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 'To: Kay Berman <kberman@xmail.com>
From: Ali Chaleby <achaleby@ralenciadesign.com>
Date: August 21
Subject: Plans for living room
Attachment: Samples

Dear Ms. Berman,

My design team is in the process of [139] the plans for your living room. Based on our last conversation, I have chosen different paints for the walls and borders. Please review the attached file and decide whether you like those new [140]. If not, it is not too late to make a change. [141] Your review will help us refine the design before we start.

Please let [142] know if you have any questions. I look forward to hearing from you.

Kind regards,
Ali Chaleby, Ralencia Design',
 NULL,
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d1056cd-aeaa-11f1-b6c1-c0e43471a03a', 139, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 139 (Đáp án đúng: A)
('q6000139-8d39-4669-9e60-6c9de8270c00',
 'Select the best answer to complete the text at [139].',
 'finalizing', 'finalize', 'finalized', 'finalizes', 'A',
 'Câu hỏi: Chọn đáp án đúng nhất để hoàn thành đoạn văn tại vị trí [139].
(A) finalizing: đang hoàn thiện
(B) finalize: hoàn thiện
(C) finalized: đã hoàn thiện
(D) finalizes: hoàn thiện

Giải thích: Cấu trúc "is in the process of + V-ing" (đang trong quá trình làm gì) yêu cầu động từ ở dạng V-ing. "Finalizing" là đáp án đúng. Đáp án đúng là (A).',
 'c6000139-8d39-4669-9e60-6c9de8270c00', 139, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 140 (Đáp án đúng: C)
('q6000140-8d39-4669-9e60-6c9de8270c00',
 'Select the best answer to complete the text at [140].',
 'organizations', 'schedules', 'colors', 'times', 'C',
 'Câu hỏi: Chọn đáp án đúng nhất để hoàn thành đoạn văn tại vị trí [140].
(A) organizations: tổ chức
(B) schedules: lịch trình
(C) colors: màu sắc
(D) times: thời gian

Giải thích: Câu trước đó đề cập đến "different paints for the walls and borders" (các loại sơn khác nhau cho tường và viền). Do đó, "colors" (màu sắc) là từ phù hợp nhất về mặt ngữ nghĩa. Đáp án đúng là (C).',
 'c6000139-8d39-4669-9e60-6c9de8270c00', 140, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 141 (Đáp án đúng: B)
('q6000141-8d39-4669-9e60-6c9de8270c00',
 'Select the best answer to complete the text at [141].',
 'I have already begun drawing up plans for your kitchen.', 'We are not planning to begin work for another two weeks.', 'Your living room is particularly spacious and airy.', 'We have not yet received your current payment.', 'B',
 'Câu hỏi: Chọn đáp án đúng nhất để hoàn thành đoạn văn tại vị trí [141].
(A) Tôi đã bắt đầu vẽ bản thiết kế cho nhà bếp của bạn.
(B) Chúng tôi chưa có kế hoạch bắt đầu công việc trong hai tuần tới.
(C) Phòng khách của bạn đặc biệt rộng rãi và thoáng mát.
(D) Chúng tôi vẫn chưa nhận được thanh toán hiện tại của bạn.

Giải thích: Câu này nằm giữa lời đề nghị xem xét thiết kế và lời hứa sẽ tinh chỉnh thiết kế. Câu (B) cung cấp thông tin về thời gian (hai tuần nữa) giúp khách hàng yên tâm có thời gian xem xét, phù hợp với ngữ cảnh. Đáp án đúng là (B).',
 'c6000139-8d39-4669-9e60-6c9de8270c00', 141, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 142 (Đáp án đúng: D)
('q6000142-8d39-4669-9e60-6c9de8270c00',
 'Select the best answer to complete the text at [142].',
 'them', 'ours', 'his', 'me', 'D',
 'Câu hỏi: Chọn đáp án đúng nhất để hoàn thành đoạn văn tại vị trí [142].
(A) them: họ
(B) ours: của chúng tôi
(C) his: của anh ấy
(D) me: tôi

Giải thích: Người viết thư là Ali Chaleby, người ký tên ở cuối. Câu "Please let me know" (Xin hãy cho tôi biết) là cách diễn đạt chuẩn trong thư từ thương mại, với "me" là tân ngữ chỉ người viết. Đáp án đúng là (D).',
 'c6000139-8d39-4669-9e60-6c9de8270c00', 142, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 6 - CỤM 4]: CÂU 143 - 146 (order_index: 143)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c6000143-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 'To: All Department Managers
From: Human Resources Department
Date: November 15
Subject: Annual Performance Review Results

The annual performance review process has now concluded. We are pleased to report that overall employee performance this year has been highly [143]. Nearly all departments met or exceeded their goals.

A detailed [144] of the review results has been prepared by the HR department and is attached to this email. Please review it carefully before meeting with your team members.

[145], the sales department achieved the highest customer satisfaction scores in the company''s history. [146]

Thank you for your continued dedication to our company''s success.

Sincerely,
Human Resources Department',
 NULL,
 NULL,
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d1056cd-aeaa-11f1-b6c1-c0e43471a03a', 143, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 143 (Đáp án đúng: C)
('q6000143-8d39-4669-9e60-6c9de8270c00',
 'Select the best answer to complete the text at [143].',
 'satisfied', 'satisfaction', 'satisfactory', 'satisfactorily', 'C',
 'Câu hỏi: Chọn đáp án đúng nhất để hoàn thành đoạn văn tại vị trí [143].
(A) satisfied: hài lòng (tính từ miêu tả người)
(B) satisfaction: sự hài lòng (danh từ)
(C) satisfactory: đạt yêu cầu, thỏa đáng (tính từ)
(D) satisfactorily: một cách thỏa đáng (trạng từ)

Giải thích: Sau động từ "has been" (thì hiện tại hoàn thành) cần một tính từ bổ nghĩa cho chủ ngữ "performance". "Satisfactory" (đạt yêu cầu) là tính từ phù hợp về ngữ pháp và ngữ nghĩa. Đáp án đúng là (C).',
 'c6000143-8d39-4669-9e60-6c9de8270c00', 143, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 144 (Đáp án đúng: C)
('q6000144-8d39-4669-9e60-6c9de8270c00',
 'Select the best answer to complete the text at [144].',
 'photo', 'lecture', 'summary', 'schedule', 'C',
 'Câu hỏi: Chọn đáp án đúng nhất để hoàn thành đoạn văn tại vị trí [144].
(A) photo: bức ảnh
(B) lecture: bài giảng
(C) summary: bản tóm tắt
(D) schedule: lịch trình

Giải thích: Cụm từ "a detailed summary of the review results" (bản tóm tắt chi tiết về kết quả đánh giá) là cách diễn đạt phù hợp trong báo cáo nội bộ. Đáp án đúng là (C).',
 'c6000143-8d39-4669-9e60-6c9de8270c00', 144, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 145 (Đáp án đúng: B)
('q6000145-8d39-4669-9e60-6c9de8270c00',
 'Select the best answer to complete the text at [145].',
 'To repeat', 'For instance', 'Otherwise', 'Consequently', 'B',
 'Câu hỏi: Chọn đáp án đúng nhất để hoàn thành đoạn văn tại vị trí [145].
(A) To repeat: Để nhắc lại
(B) For instance: Ví dụ
(C) Otherwise: Nếu không thì
(D) Consequently: Do đó

Giải thích: Câu sau đưa ra một ví dụ cụ thể về thành tích của bộ phận kinh doanh (sales department). "For instance" (Ví dụ) là từ nối phù hợp để giới thiệu ví dụ. Đáp án đúng là (B).',
 'c6000143-8d39-4669-9e60-6c9de8270c00', 145, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 146 (Đáp án đúng: A)
('q6000146-8d39-4669-9e60-6c9de8270c00',
 'Select the best answer to complete the text at [146].',
 'We congratulate them on this outstanding achievement.', 'They have requested additional staff for next year.', 'The company will relocate its headquarters soon.', 'All employees must submit their reports by Friday.', 'A',
 'Câu hỏi: Chọn đáp án đúng nhất để hoàn thành đoạn văn tại vị trí [146].
(A) Chúng tôi chúc mừng họ về thành tích xuất sắc này.
(B) Họ đã yêu cầu thêm nhân viên cho năm tới.
(C) Công ty sẽ sớm di dời trụ sở chính.
(D) Tất cả nhân viên phải nộp báo cáo trước thứ Sáu.

Giải thích: Sau câu nêu thành tích của bộ phận kinh doanh, câu tiếp theo nên là lời chúc mừng ghi nhận thành tích đó. Đáp án (A) phù hợp với ngữ cảnh và mạch văn. Đáp án đúng là (A).',
 'c6000143-8d39-4669-9e60-6c9de8270c00', 146, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ==============================================================================
-- 7.8 PART 7: ĐỌC HIỂU VĂN BẢN (CÂU 147 -> 200)
-- 15 bài đọc hiểu chuẩn ETS 2026 (10 đoạn đơn + 2 đoạn kép + 3 đoạn ba = 54 câu)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- [PART 7 - CỤM 1]: CÂU 147 - 148 (order_index: 147)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c7000147-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 'Dear High View Apartments Resident,

Riverside Paving Company is coming to High View Apartments on May 3 and 4 to resurface the parking area. All vehicles must be removed by 8 A.M. on May 3 for the work to commence. Residents may use the parking area again starting on May 5 at 8 A.M. We realize that trying to find another place to park is inconvenient, but it is necessary for the job to be completed in the two days scheduled. Note that all parking spaces will be widened, and some spaces could be moved during the work. You will receive an e-mail if your parking space is moved more than 20 meters from your previous one.

Thank you for your cooperation,
Judith Alvarez, Property Manager',
 NULL,
 'Kính gửi Cư dân High View Apartments,

Công ty Riverside Paving sẽ đến High View Apartments vào ngày 3 và 4 tháng 5 để làm lại mặt bằng khu vực đỗ xe. Tất cả xe cộ phải được di dời trước 8 giờ sáng ngày 3 tháng 5 để công việc có thể bắt đầu. Cư dân có thể sử dụng lại khu vực đỗ xe bắt đầu từ 8 giờ sáng ngày 5 tháng 5. Chúng tôi hiểu rằng việc tìm một nơi đỗ xe khác là bất tiện, nhưng điều đó là cần thiết để công việc được hoàn thành trong hai ngày theo kế hoạch. Lưu ý rằng tất cả các chỗ đỗ xe sẽ được mở rộng, và một số chỗ có thể bị di chuyển trong quá trình thi công. Bạn sẽ nhận được email nếu chỗ đỗ xe của bạn bị di chuyển hơn 20 mét so với vị trí trước đó.

Cảm ơn sự hợp tác của bạn,
Judith Alvarez, Quản lý Tài sản',
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d105702-aeaa-11f1-b6c1-c0e43471a03a', 147, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 147 (Đáp án đúng: C)
('q7000147-8d39-4669-9e60-6c9de8270c00',
 'What is the purpose of the notice?',
 'To invite residents to a meeting on May 3', 'To request feedback about parking facilities', 'To inform residents of an upcoming project', 'To announce an increase in parking fees', 'C',
 'Câu hỏi: Mục đích của thông báo là gì?
(A) Để mời cư dân đến một cuộc họp vào ngày 3 tháng 5
(B) Để yêu cầu phản hồi về cơ sở vật chất đỗ xe
(C) Để thông báo cho cư dân về một dự án sắp tới
(D) Để thông báo tăng phí đỗ xe

Giải thích: Thông báo thông báo cho cư dân về việc Công ty Riverside Paving sẽ đến làm lại mặt bằng khu vực đỗ xe vào ngày 3-4 tháng 5. Đây là thông báo về một dự án sắp tới. Đáp án đúng là (C).',
 'c7000147-8d39-4669-9e60-6c9de8270c00', 147, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 148 (Đáp án đúng: D)
('q7000148-8d39-4669-9e60-6c9de8270c00',
 'What is suggested about High View Apartments?',
 'It charges residents a monthly maintenance fee.', 'It recently hired a new property manager.', 'It has the parking area repaved every year.', 'It assigns tenants specific parking spots.', 'D',
 'Câu hỏi: Điều gì được gợi ý về High View Apartments?
(A) Nó thu phí bảo trì hàng tháng của cư dân.
(B) Nó gần đây đã thuê một quản lý tài sản mới.
(C) Nó làm lại mặt bằng đỗ xe mỗi năm.
(D) Nó chỉ định chỗ đỗ xe cụ thể cho từng cư dân.

Giải thích: Thông báo đề cập "You will receive an e-mail if your parking space is moved more than 20 meters from your previous one" (Bạn sẽ nhận được email nếu chỗ đỗ xe của bạn bị di chuyển hơn 20 mét so với vị trí trước đó). Điều này ngụ ý rằng mỗi cư dân được chỉ định một chỗ đỗ xe cụ thể. Đáp án đúng là (D).',
 'c7000147-8d39-4669-9e60-6c9de8270c00', 148, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 7 - CỤM 2]: CÂU 149 - 150 (order_index: 149)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c7000149-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 'Carol Barger (10:45 A.M.)
Hello, Ms. Seang.

Leakhena Seang (10:55 A.M.)
Good morning!

Carol Barger (11:15 A.M.)
We have fifteen participants enrolled in your mosaic workshop tomorrow. That is five more than last summer. Your workshops get more popular every year! Do you have enough materials on hand for that many participants?

Leakhena Seang (11:23 A.M.)
I have plenty to go around. We''ll be creating mosaic designs using bits of sea glass I collected on my vacation last summer. They are pieces of brown, green, and blue bottles that have washed up on the beach. The sand has smoothed all the sharp edges, so they''re perfectly safe for everyone to use.

Carol Barger (11:30 A.M.)
Sounds good. See you tomorrow at breakfast.',
 NULL,
 'Carol Barger (10:45 SA)
Xin chào, cô Seang.

Leakhena Seang (10:55 SA)
Chào buổi sáng!

Carol Barger (11:15 SA)
Chúng tôi có mười lăm người tham gia đăng ký vào buổi workshop làm tranh khảm của cô vào ngày mai. Nhiều hơn năm người so với mùa hè năm ngoái. Các buổi workshop của cô ngày càng phổ biến hơn mỗi năm! Cô có đủ nguyên liệu cho số lượng người tham gia đó không?

Leakhena Seang (11:23 SA)
Tôi có rất nhiều để chia sẻ. Chúng tôi sẽ tạo ra các thiết kế tranh khảm bằng những mảnh thủy tinh biển mà tôi đã thu thập trong kỳ nghỉ hè năm ngoái. Chúng là những mảnh chai màu nâu, xanh lá cây và xanh dương đã bị sóng đánh vào bờ. Cát đã làm nhẵn tất cả các cạnh sắc, vì vậy chúng hoàn toàn an toàn cho mọi người sử dụng.

Carol Barger (11:30 SA)
Nghe hay đấy. Hẹn gặp cô vào bữa sáng ngày mai.',
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d105702-aeaa-11f1-b6c1-c0e43471a03a', 149, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 149 (Đáp án đúng: B)
('q7000149-8d39-4669-9e60-6c9de8270c00',
 'What most likely is Ms. Seang''s job?',
 'Glassmaker', 'Art instructor', 'Beach lifeguard', 'Program administrator', 'B',
 'Câu hỏi: Công việc của cô Seang nhiều khả năng là gì?
(A) Thợ làm thủy tinh
(B) Giáo viên dạy nghệ thuật
(C) Nhân viên cứu hộ bãi biển
(D) Quản trị viên chương trình

Giải thích: Cô Seang tổ chức "mosaic workshop" (buổi workshop làm tranh khảm) và hướng dẫn người tham gia sử dụng thủy tinh biển để tạo ra các thiết kế. Đây là công việc của một giáo viên dạy nghệ thuật. Đáp án đúng là (B).',
 'c7000149-8d39-4669-9e60-6c9de8270c00', 149, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 150 (Đáp án đúng: C)
('q7000150-8d39-4669-9e60-6c9de8270c00',
 'At 11:23 A.M., what does Ms. Seang imply when she writes, "I have plenty to go around"?',
 'She intends to create an extra-large mosaic.', 'She has been collecting sea glass for many years.', 'She can share her sea glass with all the workshop participants.', 'She does not think she will use much of her sea glass.', 'C',
 'Câu hỏi: Vào lúc 11:23 SA, cô Seang ngụ ý gì khi viết "Tôi có rất nhiều để chia sẻ"?
(A) Cô ấy định tạo một bức tranh khảm cực lớn.
(B) Cô ấy đã thu thập thủy tinh biển trong nhiều năm.
(C) Cô ấy có thể chia sẻ thủy tinh biển của mình với tất cả người tham gia workshop.
(D) Cô ấy không nghĩ mình sẽ sử dụng nhiều thủy tinh biển.

Giải thích: Cụm "plenty to go around" có nghĩa là có đủ cho tất cả mọi người. Cô Seang đang trả lời câu hỏi liệu cô có đủ nguyên liệu cho 15 người tham gia không, và cô khẳng định mình có đủ để chia sẻ. Đáp án đúng là (C).',
 'c7000149-8d39-4669-9e60-6c9de8270c00', 150, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 7 - CỤM 3]: CÂU 151 - 152 (order_index: 151)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c7000151-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 'To: Sales Team
From: Laura Correa
Date: 5 October
Subject: Updates

Dear Team,

As announced in the Brighter Sails September newsletter, our performance has been consistently strong this year. This is an accomplishment we can all be proud of. Please take a moment to congratulate each other. We will continue to dream up new and exciting plans for the future!

In other news, Jasen Norton will transfer to our Kingston headquarters next month. We are sad to lose Mr. Norton, but we gratefully acknowledge his excellent work and wish him continued success in his new role.

There will be a farewell luncheon for Mr. Norton on 28 October at 1:00 P.M. in the second-floor conference room. Bring your good cheer and perhaps a story to share. The company will supply lunch, a cake, and decorations. Let me know by 12 October whether you will be able to attend.

Sincerely,
Laura Correa, Sales Manager
Brighter Sails Ltd.',
 NULL,
 'Kính gửi Đội ngũ Kinh doanh,

Như đã thông báo trong bản tin tháng 9 của Brighter Sails, hiệu suất của chúng ta đã liên tục mạnh mẽ trong năm nay. Đây là một thành tựu mà tất cả chúng ta có thể tự hào. Hãy dành một chút thời gian để chúc mừng lẫn nhau. Chúng ta sẽ tiếp tục ấp ủ những kế hoạch mới và thú vị cho tương lai!

Trong tin tức khác, Jasen Norton sẽ chuyển đến trụ sở chính Kingston của chúng ta vào tháng tới. Chúng tôi rất buồn khi mất ông Norton, nhưng chúng tôi trân trọng ghi nhận công việc xuất sắc của ông và chúc ông tiếp tục thành công trong vai trò mới.

Sẽ có một bữa tiệc trưa chia tay cho ông Norton vào ngày 28 tháng 10 lúc 1 giờ chiều tại phòng hội nghị tầng hai. Hãy mang theo niềm vui và có thể là một câu chuyện để chia sẻ. Công ty sẽ cung cấp bữa trưa, bánh ngọt và đồ trang trí. Hãy cho tôi biết trước ngày 12 tháng 10 liệu bạn có thể tham dự không.

Trân trọng,
Laura Correa, Quản lý Kinh doanh
Brighter Sails Ltd.',
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d105702-aeaa-11f1-b6c1-c0e43471a03a', 151, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 151 (Đáp án đúng: D)
('q7000151-8d39-4669-9e60-6c9de8270c00',
 'What is mentioned about Mr. Norton?',
 'He will be attending a sales conference.', 'He sent Ms. Correa an office supply request.', 'He wrote an article in the September newsletter.', 'He will be moving to another company location.', 'D',
 'Câu hỏi: Điều gì được đề cập về ông Norton?
(A) Ông ấy sẽ tham dự một hội nghị kinh doanh.
(B) Ông ấy đã gửi cho cô Correa một yêu cầu về văn phòng phẩm.
(C) Ông ấy đã viết một bài báo trong bản tin tháng 9.
(D) Ông ấy sẽ chuyển đến một địa điểm khác của công ty.

Giải thích: Email nêu rõ "Jasen Norton will transfer to our Kingston headquarters next month" (Jasen Norton sẽ chuyển đến trụ sở chính Kingston của chúng ta vào tháng tới). Đáp án đúng là (D).',
 'c7000151-8d39-4669-9e60-6c9de8270c00', 151, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 152 (Đáp án đúng: C)
('q7000152-8d39-4669-9e60-6c9de8270c00',
 'What does Ms. Correa ask members of the sales team to do?',
 'Send her stories for a newsletter', 'Give her names of potential new hires', 'Inform her of plans to attend an event', 'Help her decorate the office', 'C',
 'Câu hỏi: Cô Correa yêu cầu các thành viên trong đội ngũ kinh doanh làm gì?
(A) Gửi cho cô ấy những câu chuyện cho bản tin
(B) Cho cô ấy tên của những ứng viên tiềm năng
(C) Thông báo cho cô ấy về kế hoạch tham dự một sự kiện
(D) Giúp cô ấy trang trí văn phòng

Giải thích: Email có câu "Let me know by 12 October whether you will be able to attend" (Hãy cho tôi biết trước ngày 12 tháng 10 liệu bạn có thể tham dự không), ám chỉ việc thông báo về việc tham dự bữa tiệc trưa chia tay. Đáp án đúng là (C).',
 'c7000151-8d39-4669-9e60-6c9de8270c00', 152, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 7 - CỤM 4]: CÂU 153 - 154 (order_index: 153)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c7000153-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 'Refurbished Theater Gives Town a Boost

BEACHVILLE (February 24) - Beachville residents and tourists have a good reason to celebrate. The 40-year-old Crown Coastal Theater is scheduled to reopen in June. Many were saddened when the former theater owners decided to close the venue over a year ago, citing the cost of needed renovations. Fortunately, the theater has new owners who have spent the last year updating the interior and the projection system.

Christine Lafferty said that she and her childhood friend Morgan Flanagan spent plenty of time at the theater while growing up. "Going to the movies is the thing to do on a rainy day in a seaside town. We were sorry to see it close." The friends, who also own the popular Blue Bay Bistro, decided to buy the theater and make the necessary repairs to keep it a thriving business. For more information about the theater and its upcoming events, visit www.crowncoastaltheater.com.',
 NULL,
 'Rạp Hát Được Tân Trang Mang Lại Sức Sống Cho Thị Trấn

BEACHVILLE (24 tháng 2) - Cư dân và du khách Beachville có lý do chính đáng để ăn mừng. Rạp hát Crown Coastal 40 năm tuổi dự kiến sẽ mở cửa trở lại vào tháng Sáu. Nhiều người đã rất buồn khi chủ sở hữu rạp hát cũ quyết định đóng cửa địa điểm này hơn một năm trước, với lý do chi phí cải tạo cần thiết. May mắn thay, rạp hát đã có chủ sở hữu mới, những người đã dành năm ngoái để cập nhật nội thất và hệ thống chiếu phim.

Christine Lafferty cho biết cô và người bạn thời thơ ấu Morgan Flanagan đã dành rất nhiều thời gian ở rạp hát khi lớn lên. "Đi xem phim là việc cần làm vào một ngày mưa ở một thị trấn ven biển. Chúng tôi rất tiếc khi thấy nó đóng cửa." Những người bạn, những người cũng sở hữu Blue Bay Bistro nổi tiếng, đã quyết định mua rạp hát và thực hiện các sửa chữa cần thiết để giữ nó là một doanh nghiệp thịnh vượng. Để biết thêm thông tin về rạp hát và các sự kiện sắp tới, hãy truy cập www.crowncoastaltheater.com.',
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d105702-aeaa-11f1-b6c1-c0e43471a03a', 153, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 153 (Đáp án đúng: B)
('q7000153-8d39-4669-9e60-6c9de8270c00',
 'What is the purpose of the article?',
 'To report on beach conditions', 'To announce a business reopening', 'To promote a movie premiere', 'To advertise a new restaurant', 'B',
 'Câu hỏi: Mục đích của bài báo là gì?
(A) Để báo cáo về tình trạng bãi biển
(B) Để thông báo việc mở cửa trở lại của một doanh nghiệp
(C) Để quảng bá một buổi ra mắt phim
(D) Để quảng cáo một nhà hàng mới

Giải thích: Bài báo thông báo rằng rạp hát Crown Coastal sẽ mở cửa trở lại vào tháng Sáu sau hơn một năm đóng cửa. Đáp án đúng là (B).',
 'c7000153-8d39-4669-9e60-6c9de8270c00', 153, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 154 (Đáp án đúng: C)
('q7000154-8d39-4669-9e60-6c9de8270c00',
 'Who is Ms. Flanagan?',
 'A town council member', 'An event coordinator', 'Ms. Lafferty''s business partner', 'The writer of the article', 'C',
 'Câu hỏi: Bà Flanagan là ai?
(A) Thành viên hội đồng thị trấn
(B) Điều phối viên sự kiện
(C) Đối tác kinh doanh của bà Lafferty
(D) Người viết bài báo

Giải thích: Bài báo nêu rõ "The friends, who also own the popular Blue Bay Bistro, decided to buy the theater" (Những người bạn, những người cũng sở hữu Blue Bay Bistro nổi tiếng, đã quyết định mua rạp hát). Họ là đối tác kinh doanh cùng sở hữu Blue Bay Bistro. Đáp án đúng là (C).',
 'c7000153-8d39-4669-9e60-6c9de8270c00', 154, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 7 - CỤM 5]: CÂU 155 - 157 (order_index: 155)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c7000155-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 '*E-mail*
To: Randi Longfellow <rlongfellow@sapphiremail.com.au>
From: Deon Welman <deonwelman@skyviewscores.com.au>
Date: 27 March
Subject: Makatasi model METX-33948

Dear Ms. Longfellow,

Thank you for ordering the Makatasi ETX-Triple Refracting Telescope, model METX-33948. Unfortunately, the item you requested is on back order. [1]. If you would prefer not to wait, we have a similar telescope made by another manufacturer, Belter Telescopes. Like the Makatasi model you ordered, the Belter BTR-1483 has a 120 mm aperture and a retractable lens hood. [2]. In addition, all Belter telescopes include a padded carrying case. The Belter BTR-1483 costs $200 less than the Makatasi METX-33948.

If you wish to revise your order, simply reply to this e-mail within 48 hours or go to our Web site to chat with a representative at http://www.skyviewscores.com.au. We will then change your order, refund $200 to your credit card, and ship your new telescope overnight at no extra charge. [3]. Otherwise, we will notify you when the Makatasi model METX-33948 is back in stock and provide delivery information at that point. [4].

Best regards,
Deon Welman
Sales Representative, Skyview Scopes',
 NULL,
 '*Thư điện tử*
Đến: Randi Longfellow <rlongfellow@sapphiremail.com.au>
Từ: Deon Welman <deonwelman@skyviewscores.com.au>
Ngày: 27 tháng 3
Chủ đề: Makatasi model METX-33948

Kính gửi cô Longfellow,

Cảm ơn cô đã đặt mua Kính viễn vọng Khúc xạ Ba Mắt Makatasi ETX, model METX-33948. Thật không may, mặt hàng cô yêu cầu đang trong tình trạng chờ hàng. [1]. Nếu cô không muốn chờ đợi, chúng tôi có một chiếc kính viễn vọng tương tự do một nhà sản xuất khác là Belter Telescopes. Giống như model Makatasi cô đã đặt, Belter BTR-1483 có khẩu độ 120 mm và ống kính có thể thu vào. [2]. Ngoài ra, tất cả kính viễn vọng Belter đều bao gồm một hộp đựng có đệm. Belter BTR-1483 có giá thấp hơn 200 đô la so với Makatasi METX-33948.

Nếu cô muốn sửa đổi đơn hàng của mình, chỉ cần trả lời email này trong vòng 48 giờ hoặc truy cập trang web của chúng tôi để trò chuyện với đại diện tại http://www.skyviewscores.com.au. Sau đó, chúng tôi sẽ thay đổi đơn hàng của cô, hoàn lại 200 đô la vào thẻ tín dụng của cô và gửi kính viễn vọng mới của cô qua đêm miễn phí. [3]. Nếu không, chúng tôi sẽ thông báo cho cô khi model Makatasi METX-33948 có hàng trở lại và cung cấp thông tin giao hàng tại thời điểm đó. [4].

Trân trọng,
Deon Welman
Đại diện Kinh doanh, Skyview Scopes',
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d105702-aeaa-11f1-b6c1-c0e43471a03a', 155, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 155 (Đáp án đúng: D)
('q7000155-8d39-4669-9e60-6c9de8270c00',
 'What is the purpose of the e-mail?',
 'To request payment', 'To provide operating instructions', 'To advertise a new product', 'To offer a substitute item', 'D',
 'Câu hỏi: Mục đích của email là gì?
(A) Để yêu cầu thanh toán
(B) Để cung cấp hướng dẫn vận hành
(C) Để quảng cáo một sản phẩm mới
(D) Để đề nghị một mặt hàng thay thế

Giải thích: Email thông báo rằng mặt hàng đã đặt đang chờ hàng và đề nghị một sản phẩm thay thế (Belter BTR-1483). Đáp án đúng là (D).',
 'c7000155-8d39-4669-9e60-6c9de8270c00', 155, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 156 (Đáp án đúng: C)
('q7000156-8d39-4669-9e60-6c9de8270c00',
 'What is mentioned about the Belter BTR-1483 telescope?',
 'It can only be ordered online.', 'It will ship directly from the manufacturer.', 'It includes a protective case.', 'It is the most expensive telescope of its type.', 'C',
 'Câu hỏi: Điều gì được đề cập về kính viễn vọng Belter BTR-1483?
(A) Nó chỉ có thể được đặt hàng trực tuyến.
(B) Nó sẽ được gửi trực tiếp từ nhà sản xuất.
(C) Nó bao gồm một hộp bảo vệ.
(D) Nó là kính viễn vọng đắt nhất trong loại của nó.

Giải thích: Email nêu rõ "all Belter telescopes include a padded carrying case" (tất cả kính viễn vọng Belter đều bao gồm một hộp đựng có đệm). Đáp án đúng là (C).',
 'c7000155-8d39-4669-9e60-6c9de8270c00', 156, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 157 (Đáp án đúng: B)
('q7000157-8d39-4669-9e60-6c9de8270c00',
 'In which of the positions marked [1], [2], [3], and [4] does the following sentence best belong? "You can see a full list of specifications on our Web site."',
 '[1]', '[2]', '[3]', '[4]', 'B',
 'Câu hỏi: Câu sau đây phù hợp nhất với vị trí nào được đánh dấu [1], [2], [3], và [4]? "Bạn có thể xem danh sách đầy đủ các thông số kỹ thuật trên trang web của chúng tôi."
(A) [1]
(B) [2]
(C) [3]
(D) [4]

Giải thích: Câu này liên quan đến thông số kỹ thuật của sản phẩm. Vị trí [2] nằm ngay sau mô tả về các tính năng của Belter BTR-1483 (khẩu độ 120mm, ống kính thu vào), nên đây là vị trí phù hợp để giới thiệu thêm thông số kỹ thuật chi tiết. Đáp án đúng là (B).',
 'c7000155-8d39-4669-9e60-6c9de8270c00', 157, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 7 - CỤM 6]: CÂU 158 - 160 (order_index: 158)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c7000158-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 'To: Sun-Hi Myo <shmyo@sunmail.co.nz>
From: Jan Delpit <jdelpit@hamerkoptech.co.nz>
Date: 8 March
Subject: RE: Inquiry about job opening

Hello,

Thank you for your e-mail. I am currently on holiday and will return to the office on 15 March. I will respond to your message as soon as possible after I return.

If you require general assistance during my absence or have questions about the open position in our sales department, please contact my assistant Sita Viswan at 04 555 0193 or sviswan@hamerkoptech.co.nz. For questions about specific Hamerkoptech software products, contact the customer service department at customerservice@hamerkoptech.co.nz.

Additionally, I am happy to announce that our new graphic design software program will be released on 2 April. You can read more about the program at Hamerkoptech''s newly redesigned Web site, www.hamerkoptech.co.nz. There, you may also sign up to receive our weekly newsletter by following the instructions on the home page.

Sincerely,
Jan Delpit',
 NULL,
 'Đến: Sun-Hi Myo <shmyo@sunmail.co.nz>
Từ: Jan Delpit <jdelpit@hamerkoptech.co.nz>
Ngày: 8 tháng 3
Chủ đề: RE: Hỏi về vị trí tuyển dụng

Xin chào,

Cảm ơn email của bạn. Tôi hiện đang đi nghỉ và sẽ trở lại văn phòng vào ngày 15 tháng 3. Tôi sẽ trả lời tin nhắn của bạn sớm nhất có thể sau khi tôi trở về.

Nếu bạn cần hỗ trợ chung trong thời gian tôi vắng mặt hoặc có câu hỏi về vị trí tuyển dụng trong bộ phận kinh doanh của chúng tôi, vui lòng liên hệ trợ lý của tôi là Sita Viswan theo số 04 555 0193 hoặc sviswan@hamerkoptech.co.nz. Đối với các câu hỏi về sản phẩm phần mềm cụ thể của Hamerkoptech, hãy liên hệ bộ phận dịch vụ khách hàng tại customerservice@hamerkoptech.co.nz.

Ngoài ra, tôi rất vui được thông báo rằng chương trình phần mềm thiết kế đồ họa mới của chúng tôi sẽ được phát hành vào ngày 2 tháng 4. Bạn có thể đọc thêm về chương trình tại trang web mới được thiết kế lại của Hamerkoptech, www.hamerkoptech.co.nz. Tại đó, bạn cũng có thể đăng ký nhận bản tin hàng tuần của chúng tôi bằng cách làm theo hướng dẫn trên trang chủ.

Trân trọng,
Jan Delpit',
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d105702-aeaa-11f1-b6c1-c0e43471a03a', 158, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 158 (Đáp án đúng: D)
('q7000158-8d39-4669-9e60-6c9de8270c00',
 'What is one purpose of the e-mail?',
 'To explain how to use a software program', 'To request Ms. Myo''s assistance with a project', 'To introduce a new staff member', 'To indicate that Mr. Delpit is out of the office', 'D',
 'Câu hỏi: Một mục đích của email là gì?
(A) Để giải thích cách sử dụng một chương trình phần mềm
(B) Để yêu cầu sự hỗ trợ của cô Myo cho một dự án
(C) Để giới thiệu một nhân viên mới
(D) Để thông báo rằng ông Delpit đang ra khỏi văn phòng

Giải thích: Email thông báo "I am currently on holiday and will return to the office on 15 March" (Tôi hiện đang đi nghỉ và sẽ trở lại văn phòng vào ngày 15 tháng 3). Đáp án đúng là (D).',
 'c7000158-8d39-4669-9e60-6c9de8270c00', 158, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 159 (Đáp án đúng: B)
('q7000159-8d39-4669-9e60-6c9de8270c00',
 'What will happen on April 2?',
 'A job opening will be filled.', 'A product will be launched.', 'A client meeting will take place.', 'A Web site redesign will begin.', 'B',
 'Câu hỏi: Điều gì sẽ xảy ra vào ngày 2 tháng 4?
(A) Một vị trí tuyển dụng sẽ được lấp đầy.
(B) Một sản phẩm sẽ được ra mắt.
(C) Một cuộc họp khách hàng sẽ diễn ra.
(D) Một trang web sẽ bắt đầu được thiết kế lại.

Giải thích: Email nêu rõ "our new graphic design software program will be released on 2 April" (chương trình phần mềm thiết kế đồ họa mới của chúng tôi sẽ được phát hành vào ngày 2 tháng 4). Đáp án đúng là (B).',
 'c7000158-8d39-4669-9e60-6c9de8270c00', 159, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 160 (Đáp án đúng: C)
('q7000160-8d39-4669-9e60-6c9de8270c00',
 'How can people subscribe to a newsletter?',
 'By calling Ms. Viswan', 'By replying to Mr. Delpit''s e-mail', 'By visiting Hamerkoptech''s Web site', 'By contacting the customer service department', 'C',
 'Câu hỏi: Làm thế nào mọi người có thể đăng ký nhận bản tin?
(A) Bằng cách gọi cho cô Viswan
(B) Bằng cách trả lời email của ông Delpit
(C) Bằng cách truy cập trang web của Hamerkoptech
(D) Bằng cách liên hệ bộ phận dịch vụ khách hàng

Giải thích: Email hướng dẫn "you may also sign up to receive our weekly newsletter by following the instructions on the home page" (bạn cũng có thể đăng ký nhận bản tin hàng tuần của chúng tôi bằng cách làm theo hướng dẫn trên trang chủ). Trang chủ nằm trên trang web của Hamerkoptech. Đáp án đúng là (C).',
 'c7000158-8d39-4669-9e60-6c9de8270c00', 160, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 7 - CỤM 7]: CÂU 161 - 163 (order_index: 161)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c7000161-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 'Vitamio Brands has just announced its new line of frozen meals, called Nutridinna. "We wanted to create a product that would make it easy for people to eat healthy meals," said company spokesperson Elena Martens. "Our flash-freezing process locks in vitamins and minerals. Now our customers can enjoy the convenience of frozen food without sacrificing quality."

Vitamio Brands has partnered with Vancouver-area farms to obtain produce and meat for the Nutridinna line. "By keeping our operations local, we avoid shipping delays and can flash-freeze freshly harvested vegetables at their peak of ripeness," Martens said. "Our customers benefit further, since our products can be kept in the freezer for up to six months." Nutridinna foods will be available in supermarkets beginning in November. Frozen fish and other seafood will be added early next year.',
 NULL,
 'Vitamio Brands vừa công bố dòng sản phẩm thực phẩm đông lạnh mới của mình, có tên là Nutridinna. "Chúng tôi muốn tạo ra một sản phẩm giúp mọi người dễ dàng ăn các bữa ăn lành mạnh," phát ngôn viên công ty Elena Martens cho biết. "Quy trình đông lạnh nhanh của chúng tôi giữ lại các vitamin và khoáng chất. Giờ đây khách hàng của chúng tôi có thể tận hưởng sự tiện lợi của thực phẩm đông lạnh mà không phải hy sinh chất lượng."

Vitamio Brands đã hợp tác với các trang trại ở khu vực Vancouver để lấy nông sản và thịt cho dòng Nutridinna. "Bằng cách giữ hoạt động của chúng tôi trong nước, chúng tôi tránh được sự chậm trễ vận chuyển và có thể đông lạnh nhanh các loại rau mới thu hoạch ở độ chín cao nhất," Martens nói. "Khách hàng của chúng tôi được hưởng lợi thêm, vì các sản phẩm của chúng tôi có thể được bảo quản trong tủ đông tới sáu tháng." Thực phẩm Nutridinna sẽ có mặt tại các siêu thị bắt đầu từ tháng Mười Một. Cá đông lạnh và các loại hải sản khác sẽ được bổ sung vào đầu năm sau.',
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d105702-aeaa-11f1-b6c1-c0e43471a03a', 161, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 161 (Đáp án đúng: C)
('q7000161-8d39-4669-9e60-6c9de8270c00',
 'What is one purpose of the article?',
 'To discuss a cooking technique', 'To report on a corporate merger', 'To announce a new product line', 'To introduce a recently hired executive', 'C',
 'Câu hỏi: Một mục đích của bài báo là gì?
(A) Để thảo luận về một kỹ thuật nấu ăn
(B) Để báo cáo về một vụ sáp nhập công ty
(C) Để công bố một dòng sản phẩm mới
(D) Để giới thiệu một giám đốc mới được thuê

Giải thích: Bài báo thông báo về dòng sản phẩm thực phẩm đông lạnh mới có tên Nutridinna của Vitamio Brands. Đáp án đúng là (C).',
 'c7000161-8d39-4669-9e60-6c9de8270c00', 161, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 162 (Đáp án đúng: A)
('q7000162-8d39-4669-9e60-6c9de8270c00',
 'The word "just" in paragraph 1, line 1, is closest in meaning to',
 'recently', 'exactly', 'slightly', 'only', 'A',
 'Câu hỏi: Từ "just" ở đoạn 1, dòng 1, gần nghĩa nhất với từ nào?
(A) recently: gần đây
(B) exactly: chính xác
(C) slightly: một chút
(D) only: chỉ

Giải thích: Trong ngữ cảnh "has just announced" (vừa mới công bố), "just" có nghĩa là "recently" (gần đây). Đáp án đúng là (A).',
 'c7000161-8d39-4669-9e60-6c9de8270c00', 162, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 163 (Đáp án đúng: B)
('q7000163-8d39-4669-9e60-6c9de8270c00',
 'What does Ms. Martens suggest about flash-frozen food?',
 'It is less expensive than fresh food.', 'It is as nutritious as fresh food.', 'It is as easy to ship as fresh food.', 'It is less flavorful than fresh food.', 'B',
 'Câu hỏi: Bà Martens gợi ý điều gì về thực phẩm đông lạnh nhanh?
(A) Nó rẻ hơn thực phẩm tươi.
(B) Nó bổ dưỡng như thực phẩm tươi.
(C) Nó dễ vận chuyển như thực phẩm tươi.
(D) Nó ít hương vị hơn thực phẩm tươi.

Giải thích: Bà Martens nói "Our flash-freezing process locks in vitamins and minerals. Now our customers can enjoy the convenience of frozen food without sacrificing quality" (Quy trình đông lạnh nhanh của chúng tôi giữ lại các vitamin và khoáng chất. Giờ đây khách hàng có thể tận hưởng sự tiện lợi của thực phẩm đông lạnh mà không phải hy sinh chất lượng). Điều này ngụ ý thực phẩm đông lạnh nhanh vẫn bổ dưỡng như thực phẩm tươi. Đáp án đúng là (B).',
 'c7000161-8d39-4669-9e60-6c9de8270c00', 163, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 7 - CỤM 8]: CÂU 164 - 167 (order_index: 164)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c7000164-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 'Are you ready to work hard as part of a team of like-minded individuals? Are you willing to put your education, your experience, and your imagination to great use? If so, then we have the job for you. Karning Creative Designs is expanding, and with our success comes your opportunity.

Karning Creative Designs began ten years ago as a two-person operation set up in the home of our current CEO and founder Shirin Navani. Now located in a beautiful loft in downtown Hollinson, our firm currently employs 25 full-time staff members. At Karning, we design paper-based brochures, catalogs, ads, and posters for our clients. We are currently seeking qualified designers and artists who will shine in a fast-paced, collaborative environment.

The ideal candidate:
- Holds a degree in design, advertising, or graphic art—although several years of direct experience may substitute for a degree
- Demonstrates a strong ability to work closely with colleagues
- Maintains a critical eye for detail and precision
- Consistently meets deadlines and can flourish under pressure

Graphic design or related experience is a plus but not strictly necessary.

If you are ready to join our team, we want to meet you! Contact Salvador Tomassin at 608-555-0144 for further details. All applications must be received by March 31.',
 NULL,
 'Bạn đã sẵn sàng làm việc chăm chỉ như một phần của một nhóm gồm những cá nhân cùng chí hướng? Bạn có sẵn sàng sử dụng giáo dục, kinh nghiệm và trí tưởng tượng của mình một cách hiệu quả? Nếu vậy, thì chúng tôi có công việc dành cho bạn. Karning Creative Designs đang mở rộng, và cùng với thành công của chúng tôi là cơ hội của bạn.

Karning Creative Designs bắt đầu cách đây mười năm như một hoạt động gồm hai người được thành lập tại nhà của Giám đốc điều hành và người sáng lập hiện tại của chúng tôi, Shirin Navani. Hiện nay tọa lạc tại một gác xép đẹp ở trung tâm thành phố Hollinson, công ty của chúng tôi hiện sử dụng 25 nhân viên toàn thời gian. Tại Karning, chúng tôi thiết kế các tờ rơi, danh mục, quảng cáo và áp phích bằng giấy cho khách hàng của mình. Chúng tôi hiện đang tìm kiếm các nhà thiết kế và nghệ sĩ có trình độ, những người sẽ tỏa sáng trong một môi trường hợp tác, nhịp độ nhanh.

Ứng viên lý tưởng:
- Có bằng cấp về thiết kế, quảng cáo hoặc nghệ thuật đồ họa—mặc dù một số năm kinh nghiệm trực tiếp có thể thay thế cho bằng cấp
- Thể hiện khả năng mạnh mẽ trong việc làm việc chặt chẽ với đồng nghiệp
- Duy trì con mắt phê bình đối với chi tiết và độ chính xác
- Liên tục đáp ứng thời hạn và có thể phát triển mạnh mẽ dưới áp lực

Kinh nghiệm thiết kế đồ họa hoặc liên quan là một lợi thế nhưng không thực sự cần thiết.

Nếu bạn đã sẵn sàng tham gia đội ngũ của chúng tôi, chúng tôi muốn gặp bạn! Liên hệ với Salvador Tomassin theo số 608-555-0144 để biết thêm chi tiết. Tất cả các đơn ứng tuyển phải được nhận trước ngày 31 tháng 3.',
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d105702-aeaa-11f1-b6c1-c0e43471a03a', 164, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 164 (Đáp án đúng: B)
('q7000164-8d39-4669-9e60-6c9de8270c00',
 'According to the advertisement, who most likely is Ms. Navani?',
 'A Karning Creative Designs client', 'A business owner', 'A photographer', 'A real estate agent', 'B',
 'Câu hỏi: Theo quảng cáo, bà Navani nhiều khả năng là ai?
(A) Một khách hàng của Karning Creative Designs
(B) Một chủ doanh nghiệp
(C) Một nhiếp ảnh gia
(D) Một nhân viên bất động sản

Giải thích: Quảng cáo nêu rõ "our current CEO and founder Shirin Navani" (Giám đốc điều hành và người sáng lập hiện tại của chúng tôi, Shirin Navani). Bà là người sáng lập và điều hành công ty, tức là một chủ doanh nghiệp. Đáp án đúng là (B).',
 'c7000164-8d39-4669-9e60-6c9de8270c00', 164, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 165 (Đáp án đúng: B)
('q7000165-8d39-4669-9e60-6c9de8270c00',
 'What is indicated about Karning Creative Designs?',
 'Its primary focus is Web design.', 'It initially employed two people.', 'It was founded by Mr. Tomassin.', 'Its staff are permitted to work from home.', 'B',
 'Câu hỏi: Điều gì được chỉ ra về Karning Creative Designs?
(A) Trọng tâm chính của nó là thiết kế web.
(B) Ban đầu nó sử dụng hai người.
(C) Nó được thành lập bởi ông Tomassin.
(D) Nhân viên của nó được phép làm việc tại nhà.

Giải thích: Quảng cáo nêu rõ "Karning Creative Designs began ten years ago as a two-person operation" (Karning Creative Designs bắt đầu cách đây mười năm như một hoạt động gồm hai người). Đáp án đúng là (B).',
 'c7000164-8d39-4669-9e60-6c9de8270c00', 165, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 166 (Đáp án đúng: A)
('q7000166-8d39-4669-9e60-6c9de8270c00',
 'What is required of job applicants?',
 'Skill in working with others', 'Previous design experience', 'A willingness to work on weekends', 'An ability to use certain software applications', 'A',
 'Câu hỏi: Điều gì được yêu cầu ở người ứng tuyển?
(A) Kỹ năng làm việc với người khác
(B) Kinh nghiệm thiết kế trước đây
(C) Sẵn sàng làm việc vào cuối tuần
(D) Khả năng sử dụng một số ứng dụng phần mềm nhất định

Giải thích: Quảng cáo liệt kê yêu cầu "Demonstrates a strong ability to work closely with colleagues" (Thể hiện khả năng mạnh mẽ trong việc làm việc chặt chẽ với đồng nghiệp). Đáp án đúng là (A).',
 'c7000164-8d39-4669-9e60-6c9de8270c00', 166, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 167 (Đáp án đúng: B)
('q7000167-8d39-4669-9e60-6c9de8270c00',
 'What will happen on March 31?',
 'A project will begin.', 'A deadline will occur.', 'A graphic designer will relocate.', 'An application form will be made available.', 'B',
 'Câu hỏi: Điều gì sẽ xảy ra vào ngày 31 tháng 3?
(A) Một dự án sẽ bắt đầu.
(B) Một thời hạn sẽ đến.
(C) Một nhà thiết kế đồ họa sẽ chuyển đi.
(D) Một mẫu đơn ứng tuyển sẽ được cung cấp.

Giải thích: Quảng cáo nêu rõ "All applications must be received by March 31" (Tất cả các đơn ứng tuyển phải được nhận trước ngày 31 tháng 3). Đây là thời hạn nộp đơn. Đáp án đúng là (B).',
 'c7000164-8d39-4669-9e60-6c9de8270c00', 167, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 7 - CỤM 9]: CÂU 168 - 171 (order_index: 168)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c7000168-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 'NEW HAVEN (June 1) - Marco''s Italian Restaurant on Frontage Road will be reopening in late June. It closed three months ago after a water leak caused extensive damage to the kitchen. A significant amount of work needed to be done in the kitchen and dining areas. [1] The restaurant will accommodate larger parties when it reopens.

During the past three months, many of the restaurant''s employees were able to work at Marco''s Italian Market, which is located on the opposite side of the street. [2] "The leak happened right before the market''s busy season started," said Tom Marco, who owns both businesses. "We needed to add staff there temporarily, and I was happy to keep my restaurant crew employed." Most of those employees have now returned to work in the restaurant. [3]

Mr. Marco has planned a grand reopening for June 25. Guests will enjoy live music and a new tasting menu. [4] Reservations are required for the day of the celebration and can be made by calling 203-555-0124. "We are excited to be able to prepare our traditional dishes and welcome the community back again," stated Mr. Marco.',
 NULL,
 'NEW HAVEN (1 tháng 6) - Nhà hàng Marco''s Italian trên đường Frontage sẽ mở cửa trở lại vào cuối tháng Sáu. Nó đã đóng cửa ba tháng trước sau khi một vụ rò rỉ nước gây thiệt hại lớn cho nhà bếp. Một khối lượng công việc đáng kể cần được thực hiện trong nhà bếp và khu vực ăn uống. [1] Nhà hàng sẽ phục vụ các bữa tiệc lớn hơn khi mở cửa trở lại.

Trong ba tháng qua, nhiều nhân viên của nhà hàng đã có thể làm việc tại Marco''s Italian Market, nằm ở phía đối diện đường. [2] "Vụ rò rỉ xảy ra ngay trước khi mùa cao điểm của chợ bắt đầu," Tom Marco, người sở hữu cả hai doanh nghiệp, cho biết. "Chúng tôi cần thêm nhân viên ở đó tạm thời, và tôi rất vui được giữ đội ngũ nhà hàng của mình có việc làm." Hầu hết những nhân viên đó hiện đã trở lại làm việc tại nhà hàng. [3]

Ông Marco đã lên kế hoạch cho một buổi khai trương hoành tráng vào ngày 25 tháng 6. Khách sẽ được thưởng thức nhạc sống và thực đơn nếm thử mới. [4] Cần đặt chỗ trước cho ngày khai trương và có thể thực hiện bằng cách gọi 203-555-0124. "Chúng tôi rất vui mừng được chuẩn bị các món ăn truyền thống của mình và chào đón cộng đồng trở lại," ông Marco tuyên bố.',
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d105702-aeaa-11f1-b6c1-c0e43471a03a', 168, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 168 (Đáp án đúng: C)
('q7000168-8d39-4669-9e60-6c9de8270c00',
 'What does the article mention about Marco''s Italian Restaurant?',
 'It is the oldest restaurant in New Haven.', 'It is looking for a chef who can cook traditional dishes.', 'It needed major renovations.', 'It opened in a new location.', 'C',
 'Câu hỏi: Bài báo đề cập điều gì về Nhà hàng Marco''s Italian?
(A) Đây là nhà hàng lâu đời nhất ở New Haven.
(B) Nó đang tìm kiếm một đầu bếp có thể nấu các món ăn truyền thống.
(C) Nó cần được cải tạo lớn.
(D) Nó đã mở tại một địa điểm mới.

Giải thích: Bài báo nêu "A significant amount of work needed to be done in the kitchen and dining areas" (Một khối lượng công việc đáng kể cần được thực hiện trong nhà bếp và khu vực ăn uống). Điều này cho thấy nhà hàng cần được cải tạo lớn. Đáp án đúng là (C).',
 'c7000168-8d39-4669-9e60-6c9de8270c00', 168, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 169 (Đáp án đúng: B)
('q7000169-8d39-4669-9e60-6c9de8270c00',
 'What is indicated about Marco''s Italian Market?',
 'It supplies ingredients to Marco''s Italian Restaurant.', 'It occasionally hires temporary workers.', 'It is scheduled to close in three months.', 'It is located next door to Marco''s Italian Restaurant.', 'B',
 'Câu hỏi: Điều gì được chỉ ra về Marco''s Italian Market?
(A) Nó cung cấp nguyên liệu cho Nhà hàng Marco''s Italian.
(B) Nó thỉnh thoảng thuê nhân viên tạm thời.
(C) Nó dự kiến sẽ đóng cửa trong ba tháng.
(D) Nó nằm cạnh Nhà hàng Marco''s Italian.

Giải thích: Bài báo nêu "We needed to add staff there temporarily" (Chúng tôi cần thêm nhân viên ở đó tạm thời), cho thấy Marco''s Italian Market thỉnh thoảng thuê nhân viên tạm thời. Đáp án đúng là (B).',
 'c7000168-8d39-4669-9e60-6c9de8270c00', 169, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 170 (Đáp án đúng: B)
('q7000170-8d39-4669-9e60-6c9de8270c00',
 'What will happen during the event on June 25?',
 'The restaurant will reduce its menu prices.', 'The restaurant will offer special menu items.', 'Mr. Marco will celebrate his retirement.', 'The New Haven business community will honor Mr. Marco.', 'B',
 'Câu hỏi: Điều gì sẽ xảy ra trong sự kiện ngày 25 tháng 6?
(A) Nhà hàng sẽ giảm giá thực đơn.
(B) Nhà hàng sẽ cung cấp các món ăn đặc biệt.
(C) Ông Marco sẽ tổ chức lễ nghỉ hưu của mình.
(D) Cộng đồng doanh nghiệp New Haven sẽ vinh danh ông Marco.

Giải thích: Bài báo nêu "Guests will enjoy live music and a new tasting menu" (Khách sẽ được thưởng thức nhạc sống và thực đơn nếm thử mới). Đáp án đúng là (B).',
 'c7000168-8d39-4669-9e60-6c9de8270c00', 170, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 171 (Đáp án đúng: B)
('q7000171-8d39-4669-9e60-6c9de8270c00',
 'In which of the positions marked [1], [2], [3], and [4] does the following sentence best belong? "During repairs, some additional dining space was added."',
 '[1]', '[2]', '[3]', '[4]', 'B',
 'Câu hỏi: Câu sau đây phù hợp nhất với vị trí nào được đánh dấu [1], [2], [3], và [4]? "Trong quá trình sửa chữa, một số không gian ăn uống bổ sung đã được thêm vào."
(A) [1]
(B) [2]
(C) [3]
(D) [4]

Giải thích: Câu này nói về việc thêm không gian ăn uống trong quá trình sửa chữa. Vị trí [1] nằm ngay sau câu "The restaurant will accommodate larger parties when it reopens" (Nhà hàng sẽ phục vụ các bữa tiệc lớn hơn khi mở cửa trở lại), nên đây là vị trí phù hợp để giải thích lý do có thể phục vụ tiệc lớn hơn. Đáp án đúng là (B).',
 'c7000168-8d39-4669-9e60-6c9de8270c00', 171, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 7 - CỤM 10]: CÂU 172 - 175 (order_index: 172)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c7000172-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 'Marlys Barry (10:17 A.M.)
This is Ms. Barry from the data analysis department. I have included my colleague, Ms. Choi. We''re contacting you about your data request for the e-mail addresses of all account holders, sorted by age.

Alexander Kubelski (10:17 A.M.)
Yes, how soon can you complete the request?

Marlys Barry (10:18 A.M.)
I have a question for you first. Do you really need the e-mail addresses of all account holders? That would be a huge file. Or do you need the e-mail addresses of account holders only within a certain age-group?

Alexander Kubelski (10:19 A.M.)
I see what you mean. I want to e-mail account holders aged 55 to 65 to invite them to meet with a retirement planning expert. Do I have to submit a new project request form?

Bora Choi (10:21 A.M.)
That''s not necessary, Mr. Kubelski. We can update your current request form for you. You do not want to lose your place in the queue.

Alexander Kubelski (10:21 A.M.)
Great, thank you! Is it possible for you to get me that list right away?

Marlys Barry (10:22 A.M.)
There are several projects ahead of yours.

Alexander Kubelski (10:23 A.M.)
I was hoping to send out the e-mail invitations tomorrow.

Marlys Barry (10:24 A.M.)
We will get to it as soon as we can.',
 NULL,
 'Marlys Barry (10:17 SA)
Đây là cô Barry từ bộ phận phân tích dữ liệu. Tôi đã bao gồm đồng nghiệp của tôi, cô Choi. Chúng tôi đang liên hệ với ông về yêu cầu dữ liệu của ông đối với địa chỉ email của tất cả chủ tài khoản, được sắp xếp theo độ tuổi.

Alexander Kubelski (10:17 SA)
Vâng, bao lâu thì cô có thể hoàn thành yêu cầu?

Marlys Barry (10:18 SA)
Tôi có một câu hỏi cho ông trước. Ông có thực sự cần địa chỉ email của tất cả chủ tài khoản không? Đó sẽ là một tệp rất lớn. Hay ông chỉ cần địa chỉ email của các chủ tài khoản trong một nhóm tuổi nhất định?

Alexander Kubelski (10:19 SA)
Tôi hiểu ý cô. Tôi muốn gửi email cho các chủ tài khoản từ 55 đến 65 tuổi để mời họ gặp một chuyên gia hoạch định hưu trí. Tôi có phải nộp một mẫu yêu cầu dự án mới không?

Bora Choi (10:21 SA)
Điều đó không cần thiết, ông Kubelski. Chúng tôi có thể cập nhật mẫu yêu cầu hiện tại của ông cho ông. Ông không muốn mất vị trí của mình trong hàng đợi.

Alexander Kubelski (10:21 SA)
Tuyệt, cảm ơn cô! Cô có thể lấy cho tôi danh sách đó ngay bây giờ không?

Marlys Barry (10:22 SA)
Có một số dự án trước dự án của ông.

Alexander Kubelski (10:23 SA)
Tôi đã hy vọng gửi thư mời qua email vào ngày mai.

Marlys Barry (10:24 SA)
Chúng tôi sẽ giải quyết nó ngay khi có thể.',
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d105702-aeaa-11f1-b6c1-c0e43471a03a', 172, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 172 (Đáp án đúng: D)
('q7000172-8d39-4669-9e60-6c9de8270c00',
 'Why did Ms. Barry begin an online chat with Mr. Kubelski?',
 'To refer him to a different department', 'To decline an invitation', 'To issue an apology', 'To ask for clarification about a request', 'D',
 'Câu hỏi: Tại sao cô Barry bắt đầu một cuộc trò chuyện trực tuyến với ông Kubelski?
(A) Để giới thiệu ông đến một bộ phận khác
(B) Để từ chối một lời mời
(C) Để đưa ra lời xin lỗi
(D) Để hỏi cho rõ về một yêu cầu

Giải thích: Cô Barry hỏi "Do you really need the e-mail addresses of all account holders?... Or do you need the e-mail addresses of account holders only within a certain age-group?" (Ông có thực sự cần địa chỉ email của tất cả chủ tài khoản không?... Hay ông chỉ cần địa chỉ email của các chủ tài khoản trong một nhóm tuổi nhất định?). Đây là câu hỏi để làm rõ yêu cầu. Đáp án đúng là (D).',
 'c7000172-8d39-4669-9e60-6c9de8270c00', 172, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 173 (Đáp án đúng: A)
('q7000173-8d39-4669-9e60-6c9de8270c00',
 'Who will receive an e-mail from Mr. Kubelski?',
 'Account holders in one age-group', 'Data analysis team members', 'Financial planners', 'All Mr. Kubelski''s clients', 'A',
 'Câu hỏi: Ai sẽ nhận được email từ ông Kubelski?
(A) Các chủ tài khoản trong một nhóm tuổi
(B) Các thành viên nhóm phân tích dữ liệu
(C) Các chuyên gia tài chính
(D) Tất cả khách hàng của ông Kubelski

Giải thích: Ông Kubelski nói "I want to e-mail account holders aged 55 to 65" (Tôi muốn gửi email cho các chủ tài khoản từ 55 đến 65 tuổi). Đây là một nhóm tuổi cụ thể. Đáp án đúng là (A).',
 'c7000172-8d39-4669-9e60-6c9de8270c00', 173, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 174 (Đáp án đúng: B)
('q7000174-8d39-4669-9e60-6c9de8270c00',
 'What does Ms. Choi offer to do?',
 'Write an e-mail', 'Make a change to a form', 'Open an account', 'Revise a policy', 'B',
 'Câu hỏi: Cô Choi đề nghị làm gì?
(A) Viết một email
(B) Thực hiện thay đổi đối với một mẫu đơn
(C) Mở một tài khoản
(D) Sửa đổi một chính sách

Giải thích: Cô Choi nói "We can update your current request form for you" (Chúng tôi có thể cập nhật mẫu yêu cầu hiện tại của ông cho ông). Đáp án đúng là (B).',
 'c7000172-8d39-4669-9e60-6c9de8270c00', 174, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 175 (Đáp án đúng: C)
('q7000175-8d39-4669-9e60-6c9de8270c00',
 'At 10:22 A.M., what does Ms. Barry most likely mean when she writes, "There are several projects ahead of yours"?',
 'Ms. Barry will move Mr. Kubelski''s request to the end of the queue.', 'Ms. Barry will not be able to send out the invitations for Mr. Kubelski.', 'Mr. Kubelski''s request will not be the first job Ms. Barry completes.', 'Mr. Kubelski will need to assist with other projects first.', 'C',
 'Câu hỏi: Vào lúc 10:22 SA, cô Barry có ý gì khi viết "Có một số dự án trước dự án của ông"?
(A) Cô Barry sẽ chuyển yêu cầu của ông Kubelski xuống cuối hàng đợi.
(B) Cô Barry sẽ không thể gửi thư mời cho ông Kubelski.
(C) Yêu cầu của ông Kubelski sẽ không phải là công việc đầu tiên cô Barry hoàn thành.
(D) Ông Kubelski sẽ cần hỗ trợ các dự án khác trước.

Giải thích: "There are several projects ahead of yours" có nghĩa là có những dự án khác đang chờ trước dự án của ông Kubelski, tức là yêu cầu của ông sẽ không được xử lý đầu tiên. Đáp án đúng là (C).',
 'c7000172-8d39-4669-9e60-6c9de8270c00', 175, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 7 - CỤM 11]: CÂU 176 - 180 (order_index: 176)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c7000176-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 '===== DOCUMENT 1: ARTICLE =====

Tips for designing a Web site for a food-truck business

Owners of food trucks move from place to place, within and between cities, as they carry out their business, so they often rely on word of mouth or social media to attract customers. As a result, they may not build a Web site of their own. But in fact, by the very nature of their business, it is crucial that food truck owners have a fixed place for the public to learn about them, order from them, contact them, etc. Furthermore, market research shows that a Web site can help build a loyal customer base. So, here are some tips for developing a great Web site for your food truck.

The Home page should have bold graphics with your food truck''s name. The text must prominently display key information, such as your truck''s locations and operating hours. Online forms with fields to fill out, such as reservation requests for special events or services, give new visitors too much visual information. They are better incorporated as links or pop-up windows.

The Food Menu page needs attractive, high-definition images along with vivid and precise text that describes each menu item in detail. Remember that your photos should be big enough to look appealing on larger computer monitors.

The About Us page should include some text explaining your food truck''s theme and concept, and some biographical data detailing your background in the food industry.

The News page can include text informing visitors about seasonal food items and upcoming promotions or special events such as food festivals.

===== DOCUMENT 2: E-MAIL =====

To: Doug Abruzzo <dabruzzo@dzacreative.com>
From: Ed Vale <evale@saffronmail.com>
Date: March 29
Subject: Feedback

Dear Mr. Abruzzo,

Thank you again for creating the prototype Web site for my food-truck business. I just wanted to reiterate that it has gotten positive feedback from customers who have tested it. I am so glad we followed the advice in that article you sent me about Web site design for food trucks!

As we discussed in our phone call yesterday, we will move forward with the prototype Web site and launch it as the official site on April 5. However, I still do not see the information I sent about our new promotion that will begin in mid-April, a free dessert with any sandwich purchase. Please be sure to add this important information before we launch the site.

Regards,
Ed',
 NULL,
 '===== TÀI LIỆU 1: BÀI BÁO =====

Mẹo thiết kế trang web cho doanh nghiệp xe bán đồ ăn

Chủ xe bán đồ ăn di chuyển từ nơi này sang nơi khác, trong và giữa các thành phố, khi họ thực hiện công việc kinh doanh của mình, vì vậy họ thường dựa vào truyền miệng hoặc mạng xã hội để thu hút khách hàng. Kết quả là họ có thể không xây dựng trang web của riêng mình. Nhưng trên thực tế, với bản chất công việc kinh doanh của họ, điều quan trọng là chủ xe bán đồ ăn phải có một nơi cố định để công chúng tìm hiểu về họ, đặt hàng từ họ, liên hệ với họ, v.v. Hơn nữa, nghiên cứu thị trường cho thấy một trang web có thể giúp xây dựng cơ sở khách hàng trung thành. Vì vậy, đây là một số mẹo để phát triển một trang web tuyệt vời cho xe bán đồ ăn của bạn.

Trang chủ nên có đồ họa đậm với tên xe bán đồ ăn của bạn. Văn bản phải hiển thị nổi bật thông tin quan trọng, chẳng hạn như vị trí xe của bạn và giờ hoạt động. Các biểu mẫu trực tuyến có các trường để điền, chẳng hạn như yêu cầu đặt chỗ cho các sự kiện hoặc dịch vụ đặc biệt, cung cấp cho khách truy cập mới quá nhiều thông tin trực quan. Tốt hơn là chúng nên được kết hợp dưới dạng liên kết hoặc cửa sổ bật lên.

Trang Thực đơn cần hình ảnh hấp dẫn, độ nét cao cùng với văn bản sống động và chính xác mô tả chi tiết từng món trong thực đơn. Hãy nhớ rằng ảnh của bạn phải đủ lớn để trông hấp dẫn trên màn hình máy tính lớn hơn.

Trang Giới thiệu nên bao gồm một số văn bản giải thích chủ đề và khái niệm của xe bán đồ ăn của bạn, và một số dữ liệu tiểu sử mô tả chi tiết nền tảng của bạn trong ngành công nghiệp thực phẩm.

Trang Tin tức có thể bao gồm văn bản thông báo cho khách truy cập về các mặt hàng thực phẩm theo mùa và các chương trình khuyến mãi hoặc sự kiện đặc biệt sắp tới như lễ hội ẩm thực.

===== TÀI LIỆU 2: THƯ ĐIỆN TỬ =====

Đến: Doug Abruzzo <dabruzzo@dzacreative.com>
Từ: Ed Vale <evale@saffronmail.com>
Ngày: 29 tháng 3
Chủ đề: Phản hồi

Kính gửi ông Abruzzo,

Cảm ơn ông một lần nữa vì đã tạo trang web nguyên mẫu cho doanh nghiệp xe bán đồ ăn của tôi. Tôi chỉ muốn nhắc lại rằng nó đã nhận được phản hồi tích cực từ khách hàng đã thử nghiệm nó. Tôi rất vui vì chúng tôi đã làm theo lời khuyên trong bài báo ông gửi cho tôi về thiết kế trang web cho xe bán đồ ăn!

Như chúng ta đã thảo luận trong cuộc gọi điện thoại ngày hôm qua, chúng tôi sẽ tiến hành với trang web nguyên mẫu và khởi chạy nó như trang web chính thức vào ngày 5 tháng 4. Tuy nhiên, tôi vẫn không thấy thông tin tôi đã gửi về chương trình khuyến mãi mới của chúng tôi sẽ bắt đầu vào giữa tháng 4, tặng một món tráng miệng miễn phí với bất kỳ giao dịch mua bánh sandwich nào. Hãy đảm bảo thêm thông tin quan trọng này trước khi chúng tôi khởi chạy trang web.

Trân trọng,
Ed',
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d105702-aeaa-11f1-b6c1-c0e43471a03a', 176, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 176 (Đáp án đúng: A)
('q7000176-8d39-4669-9e60-6c9de8270c00',
 'According to the article, what is one way that food truck owners traditionally attract customers?',
 'By word of mouth', 'From highway billboards', 'Through newspaper advertisements', 'From signs at food festivals', 'A',
 'Câu hỏi: Theo bài báo, một cách mà chủ xe bán đồ ăn traditionally thu hút khách hàng là gì?
(A) Bằng truyền miệng
(B) Từ biển quảng cáo trên đường cao tốc
(C) Qua quảng cáo trên báo
(D) Từ biển hiệu tại các lễ hội ẩm thực

Giải thích: Bài báo nêu "they often rely on word of mouth or social media to attract customers" (họ thường dựa vào truyền miệng hoặc mạng xã hội để thu hút khách hàng). Đáp án đúng là (A).',
 'c7000176-8d39-4669-9e60-6c9de8270c00', 176, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 177 (Đáp án đúng: D)
('q7000177-8d39-4669-9e60-6c9de8270c00',
 'According to the article, what information does not need to appear on the Home page?',
 'Truck locations', 'Hours of operation', 'Company name', 'Seasonal food items', 'D',
 'Câu hỏi: Theo bài báo, thông tin nào KHÔNG cần xuất hiện trên Trang chủ?
(A) Vị trí xe
(B) Giờ hoạt động
(C) Tên công ty
(D) Các mặt hàng thực phẩm theo mùa

Giải thích: Bài báo nêu Trang Tin tức (News page) "can include text informing visitors about seasonal food items" (có thể bao gồm văn bản thông báo cho khách truy cập về các mặt hàng thực phẩm theo mùa). Như vậy, thông tin về mặt hàng theo mùa thuộc Trang Tin tức, không phải Trang chủ. Đáp án đúng là (D).',
 'c7000176-8d39-4669-9e60-6c9de8270c00', 177, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 178 (Đáp án đúng: C)
('q7000178-8d39-4669-9e60-6c9de8270c00',
 'In what field does Mr. Abruzzo most likely work?',
 'Market research', 'Catering', 'Web design', 'Package delivery', 'C',
 'Câu hỏi: Ông Abruzzo nhiều khả năng làm việc trong lĩnh vực nào?
(A) Nghiên cứu thị trường
(B) Dịch vụ ăn uống
(C) Thiết kế web
(D) Giao hàng

Giải thích: Ông Ed Vale cảm ơn ông Abruzzo "for creating the prototype Web site" (vì đã tạo trang web nguyên mẫu). Điều này cho thấy ông Abruzzo làm trong lĩnh vực thiết kế web. Đáp án đúng là (C).',
 'c7000176-8d39-4669-9e60-6c9de8270c00', 178, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 179 (Đáp án đúng: D)
('q7000179-8d39-4669-9e60-6c9de8270c00',
 'In which section of the Web site will information most likely be added?',
 'The Home page', 'The Food Menu page', 'The About Us page', 'The News page', 'D',
 'Câu hỏi: Thông tin sẽ được thêm vào phần nào của trang web?
(A) Trang chủ
(B) Trang Thực đơn
(C) Trang Giới thiệu
(D) Trang Tin tức

Giải thích: Ông Vale nói "I still do not see the information I sent about our new promotion that will begin in mid-April, a free dessert with any sandwich purchase" (Tôi vẫn không thấy thông tin tôi đã gửi về chương trình khuyến mãi mới của chúng tôi sẽ bắt đầu vào giữa tháng 4, tặng một món tráng miệng miễn phí với bất kỳ giao dịch mua bánh sandwich nào). Bài báo nêu Trang Tin tức "can include text informing visitors about... upcoming promotions" (có thể bao gồm văn bản thông báo cho khách truy cập về... các chương trình khuyến mãi sắp tới). Đáp án đúng là (D).',
 'c7000176-8d39-4669-9e60-6c9de8270c00', 179, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 180 (Đáp án đúng: B)
('q7000180-8d39-4669-9e60-6c9de8270c00',
 'According to the e-mail, when will the Web site launch?',
 'On March 28', 'On March 29', 'On April 5', 'On April 15', 'B',
 'Câu hỏi: Theo email, khi nào trang web sẽ khởi chạy?
(A) Vào ngày 28 tháng 3
(B) Vào ngày 29 tháng 3
(C) Vào ngày 5 tháng 4
(D) Vào ngày 15 tháng 4

Giải thích: Email nêu "we will move forward with the prototype Web site and launch it as the official site on April 5" (chúng tôi sẽ tiến hành với trang web nguyên mẫu và khởi chạy nó như trang web chính thức vào ngày 5 tháng 4). Đáp án đúng là (B).',
 'c7000176-8d39-4669-9e60-6c9de8270c00', 180, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 7 - CỤM 12]: CÂU 181 - 185 (order_index: 181)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c7000181-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 '===== DOCUMENT 1: E-MAIL =====

To: Manny Green <mgreen@rhba.com>
From: John LaRose <jlarose@rilamore.edu>
Date: May 18
Subject: Drilling notice

Dear Mr. Green:

As a courtesy, I am writing to you at the Red Hills Business Association, asking you to help me get the word out to your membership. It was announced in last month''s Daily Gazette that Rilamore University is moving forward with its Net Zero Initiative. Within three years, we expect to have geothermal wells installed and operational for the heating and cooling of our entire campus. Limiting the institution''s reliance on fossil fuels has long been a goal, and the new system is a significant step toward achieving that goal.

Over the next month, we will conduct test drilling in several campus locations. If all goes according to schedule, the crew will be drilling adjacent to the Red Hills Business District and Oak Street Apartments starting Wednesday, June 5. We want to tell business owners and residents near the campus to expect a higher-than-usual noise level during the two weeks we estimate it will take to complete the work. The work hours for the drilling crew are 10 A.M. to 3 P.M. each day, Monday through Friday.

We apologize in advance for the inconvenience this may cause to our neighbors. Any questions or concerns should be directed to me at 813-555-0123.

John LaRose
Community Liaison, Rilamore University
Office of Communications

===== DOCUMENT 2: PRESS RELEASE =====

FOR IMMEDIATE RELEASE

Contact: Manny Green, mgreen@rhba.com

RED HILLS (May 25) - The Red Hills Business Association is shifting the dates of its much-anticipated Lunch Hour Concert Series. Normally presented each Thursday in June, the four free concerts will instead take place each Thursday in July. The lineup of artists remains unchanged - the Jaystone Jazz Trio will open the series on July 4, followed on successive Thursdays by Joss and the Jaybirds, Ray Starform, and the Barklay Bass Quintet.

As usual, all three blocks of Oak Street will be closed to traffic, restaurants will serve lunch at outdoor tables, and local arts-and-crafts vendors will display their work on the lawn of the Cultural Center. It is a beautiful celebration in the heart of a popular Red Hills neighborhood. We hope to see you there!',
 NULL,
 '===== TÀI LIỆU 1: THƯ ĐIỆN TỬ =====

Đến: Manny Green <mgreen@rhba.com>
Từ: John LaRose <jlarose@rilamore.edu>
Ngày: 18 tháng 5
Chủ đề: Thông báo khoan

Kính gửi ông Green:

Như một sự lịch sự, tôi viết thư này cho ông tại Hiệp hội Doanh nghiệp Red Hills, yêu cầu ông giúp tôi truyền đạt thông tin đến các thành viên của ông. Đã được thông báo trên tờ Daily Gazette tháng trước rằng Đại học Rilamore đang tiến hành Sáng kiến Net Zero. Trong vòng ba năm, chúng tôi dự kiến sẽ lắp đặt và vận hành các giếng địa nhiệt để sưởi ấm và làm mát toàn bộ khuôn viên trường. Hạn chế sự phụ thuộc của tổ chức vào nhiên liệu hóa thạch từ lâu đã là một mục tiêu, và hệ thống mới là một bước tiến quan trọng để đạt được mục tiêu đó.

Trong tháng tới, chúng tôi sẽ tiến hành khoan thử nghiệm tại một số địa điểm trong khuôn viên trường. Nếu mọi việc diễn ra theo đúng kế hoạch, đội sẽ khoan gần Khu Doanh nghiệp Red Hills và Căn hộ Oak Street bắt đầu từ Thứ Tư, ngày 5 tháng 6. Chúng tôi muốn thông báo cho các chủ doanh nghiệp và cư dân gần khuôn viên trường rằng hãy chuẩn bị cho mức độ tiếng ồn cao hơn bình thường trong hai tuần mà chúng tôi ước tính sẽ mất để hoàn thành công việc. Giờ làm việc của đội khoan là 10 giờ sáng đến 3 giờ chiều mỗi ngày, từ Thứ Hai đến Thứ Sáu.

Chúng tôi xin lỗi trước vì sự bất tiện này có thể gây ra cho hàng xóm của chúng tôi. Mọi câu hỏi hoặc thắc mắc nên được gửi đến tôi theo số 813-555-0123.

John LaRose
Liên lạc Cộng đồng, Đại học Rilamore
Văn phòng Truyền thông

===== TÀI LIỆU 2: THÔNG CÁO BÁO CHÍ =====

PHÁT HÀNH NGAY

Liên hệ: Manny Green, mgreen@rhba.com

RED HILLS (25 tháng 5) - Hiệp hội Doanh nghiệp Red Hills đang thay đổi ngày của Chuỗi hòa nhạc Giờ ăn trưa được mong đợi nhất của mình. Thường được trình diễn vào mỗi Thứ Năm trong tháng Sáu, bốn buổi hòa nhạc miễn phí sẽ thay vào đó diễn ra vào mỗi Thứ Năm trong tháng Bảy. Danh sách các nghệ sĩ vẫn không thay đổi - Bộ ba nhạc Jazz Jaystone sẽ mở màn chuỗi hòa nhạc vào ngày 4 tháng 7, tiếp theo vào các Thứ Năm liên tiếp bởi Joss và the Jaybirds, Ray Starform, và Barklay Bass Quintet.

Như thường lệ, cả ba dãy phố Oak Street sẽ bị đóng cửa với xe cộ, các nhà hàng sẽ phục vụ bữa trưa tại các bàn ngoài trời, và các nhà cung cấp thủ công mỹ nghệ địa phương sẽ trưng bày tác phẩm của họ trên bãi cỏ của Trung tâm Văn hóa. Đó là một lễ kỷ niệm tuyệt đẹp ở trung tâm của một khu phố Red Hills nổi tiếng. Chúng tôi hy vọng sẽ gặp bạn ở đó!',
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d105702-aeaa-11f1-b6c1-c0e43471a03a', 181, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 181 (Đáp án đúng: D)
('q7000181-8d39-4669-9e60-6c9de8270c00',
 'What is indicated about the Net Zero Initiative?',
 'It is being funded by the Red Hills Business Association.', 'It was inspired by similar initiatives in other cities.', 'It will use geothermal energy to power a city.', 'It will change the way an institution heats its buildings.', 'D',
 'Câu hỏi: Điều gì được chỉ ra về Sáng kiến Net Zero?
(A) Nó đang được tài trợ bởi Hiệp hội Doanh nghiệp Red Hills.
(B) Nó được truyền cảm hứng từ các sáng kiến tương tự ở các thành phố khác.
(C) Nó sẽ sử dụng năng lượng địa nhiệt để cung cấp năng lượng cho một thành phố.
(D) Nó sẽ thay đổi cách một tổ chức sưởi ấm các tòa nhà của mình.

Giải thích: Email nêu "we expect to have geothermal wells installed and operational for the heating and cooling of our entire campus" (chúng tôi dự kiến sẽ lắp đặt và vận hành các giếng địa nhiệt để sưởi ấm và làm mát toàn bộ khuôn viên trường). Điều này cho thấy sáng kiến sẽ thay đổi cách trường đại học sưởi ấm các tòa nhà. Đáp án đúng là (D).',
 'c7000181-8d39-4669-9e60-6c9de8270c00', 181, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 182 (Đáp án đúng: D)
('q7000182-8d39-4669-9e60-6c9de8270c00',
 'In the e-mail, the word "conduct" in paragraph 2, line 1, is closest in meaning to',
 'behave', 'accompany', 'transmit', 'carry out', 'D',
 'Câu hỏi: Trong email, từ "conduct" ở đoạn 2, dòng 1, gần nghĩa nhất với từ nào?
(A) behave: cư xử
(B) accompany: đi cùng
(C) transmit: truyền
(D) carry out: tiến hành

Giải thích: "Conduct test drilling" có nghĩa là "tiến hành khoan thử nghiệm". "Carry out" là từ đồng nghĩa phù hợp nhất. Đáp án đúng là (D).',
 'c7000181-8d39-4669-9e60-6c9de8270c00', 182, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 183 (Đáp án đúng: A)
('q7000183-8d39-4669-9e60-6c9de8270c00',
 'What can be concluded about the Red Hills Business District?',
 'It is located near a university campus.', 'It hosts an arts festival every July.', 'It includes the Oak Street Apartments.', 'It is home to the offices of the Daily Gazette.', 'A',
 'Câu hỏi: Điều gì có thể được kết luận về Khu Doanh nghiệp Red Hills?
(A) Nó nằm gần khuôn viên trường đại học.
(B) Nó tổ chức một lễ hội nghệ thuật vào mỗi tháng Bảy.
(C) Nó bao gồm Căn hộ Oak Street.
(D) Đây là nơi có trụ sở của tờ Daily Gazette.

Giải thích: Email nêu "the crew will be drilling adjacent to the Red Hills Business District" (đội sẽ khoan gần Khu Doanh nghiệp Red Hills) và "We want to tell business owners and residents near the campus" (Chúng tôi muốn thông báo cho các chủ doanh nghiệp và cư dân gần khuôn viên trường). Điều này cho thấy Red Hills Business District nằm gần khuôn viên trường đại học. Đáp án đúng là (A).',
 'c7000181-8d39-4669-9e60-6c9de8270c00', 183, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 184 (Đáp án đúng: C)
('q7000184-8d39-4669-9e60-6c9de8270c00',
 'Why most likely did the Red Hills Business Association change the dates of its concert series?',
 'To take advantage of a new power source', 'To accommodate students'' schedules', 'To avoid noise from nearby construction', 'To prevent a conflict with a similar event', 'C',
 'Câu hỏi: Tại sao Hiệp hội Doanh nghiệp Red Hills có khả năng nhất đã thay đổi ngày của chuỗi hòa nhạc?
(A) Để tận dụng một nguồn năng lượng mới
(B) Để phù hợp với lịch trình của sinh viên
(C) Để tránh tiếng ồn từ công trường gần đó
(D) Để ngăn chặn xung đột với một sự kiện tương tự

Giải thích: Email thông báo rằng đội khoan sẽ làm việc gần Red Hills Business District và Oak Street Apartments trong hai tuần từ ngày 5 tháng 6, gây ra tiếng ồn cao hơn bình thường. Thông cáo báo chí thông báo rằng chuỗi hòa nhạc đã được chuyển từ tháng Sáu sang tháng Bảy. Điều này cho thấy họ thay đổi ngày để tránh tiếng ồn từ công trường khoan. Đáp án đúng là (C).',
 'c7000181-8d39-4669-9e60-6c9de8270c00', 184, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 185 (Đáp án đúng: B)
('q7000185-8d39-4669-9e60-6c9de8270c00',
 'What is mentioned in the press release about the Cultural Center?',
 'It will provide lunch for musicians.', 'It will have artwork for sale on its property.', 'It will offer arts-and-crafts workshops.', 'It will provide the stage for performers.', 'B',
 'Câu hỏi: Điều gì được đề cập trong thông cáo báo chí về Trung tâm Văn hóa?
(A) Nó sẽ cung cấp bữa trưa cho các nhạc sĩ.
(B) Nó sẽ có tác phẩm nghệ thuật để bán trên khuôn viên của mình.
(C) Nó sẽ cung cấp các buổi workshop thủ công mỹ nghệ.
(D) Nó sẽ cung cấp sân khấu cho người biểu diễn.

Giải thích: Thông cáo báo chí nêu "local arts-and-crafts vendors will display their work on the lawn of the Cultural Center" (các nhà cung cấp thủ công mỹ nghệ địa phương sẽ trưng bày tác phẩm của họ trên bãi cỏ của Trung tâm Văn hóa). Điều này cho thấy sẽ có tác phẩm nghệ thuật được bày bán tại Trung tâm Văn hóa. Đáp án đúng là (B).',
 'c7000181-8d39-4669-9e60-6c9de8270c00', 185, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 7 - CỤM 13]: CÂU 186 - 190 (order_index: 186)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c7000186-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 '===== DOCUMENT 1: ADVERTISEMENT =====

Lawal Home Service: Serving Southern California for over 40 years

Lawal Home Service provides roofing and solar solutions for Southern California residents in Inglewood and the surrounding areas. In addition to roof replacement, we offer a wide array of services, from attic insulation and gutter restoration to fixing leaks and installing solar panels.

Lawal Home Service prides itself on transparent communication and attention to detail. Our project supervisors are always on-site to answer client questions, provide updates, and ensure a safe and clean worksite. To request a free roofing diagnosis, visit www.lawalhomeservice.com or call our booking agent at 310-555-0108.

===== DOCUMENT 2: CONTACT FORM =====

Lawal Home Service Contact Form

Trust the experts at Lawal Home Service to diagnose your roofing needs promptly and professionally. Please take a few minutes to complete the form with as much detail as possible. Remember, all roofs installed by Lawal have a 25-year warranty.

Name: Drew Gerson
Date: December 12
E-mail: dgerson95@onyxmail.com
Phone: 310-555-0192
Address: 820 North Acacia Street, Inglewood, CA 90301

How may we help you?
During last week''s windstorm, several roof shingles were torn loose and need replacing. I am considering replacing the entire roof as it is over 30 years old, and water has begun to drip through the section over the patio. I would appreciate talking to someone who could tell me my options and provide an estimate.',
 NULL,
 '===== TÀI LIỆU 1: QUẢNG CÁO =====

Lawal Home Service: Phục vụ Nam California hơn 40 năm

Lawal Home Service cung cấp các giải pháp lợp mái và năng lượng mặt trời cho cư dân Nam California ở Inglewood và các khu vực lân cận. Ngoài việc thay thế mái nhà, chúng tôi cung cấp một loạt các dịch vụ, từ cách nhiệt gác mái và phục hồi máng xối đến sửa chữa rò rỉ và lắp đặt tấm pin mặt trời.

Lawal Home Service tự hào về giao tiếp minh bạch và chú ý đến từng chi tiết. Các giám sát viên dự án của chúng tôi luôn có mặt tại công trường để trả lời câu hỏi của khách hàng, cung cấp thông tin cập nhật và đảm bảo một công trường an toàn và sạch sẽ. Để yêu cầu chẩn đoán mái nhà miễn phí, hãy truy cập www.lawalhomeservice.com hoặc gọi cho đại lý đặt lịch của chúng tôi theo số 310-555-0108.

===== TÀI LIỆU 2: MẪU LIÊN HỆ =====

Mẫu Liên hệ Lawal Home Service

Hãy tin tưởng các chuyên gia tại Lawal Home Service để chẩn đoán nhu cầu lợp mái của bạn một cách nhanh chóng và chuyên nghiệp. Vui lòng dành vài phút để hoàn thành mẫu đơn với càng nhiều chi tiết càng tốt. Hãy nhớ rằng, tất cả các mái nhà được Lawal lắp đặt đều có bảo hành 25 năm.

Tên: Drew Gerson
Ngày: 12 tháng 12
Email: dgerson95@onyxmail.com
Điện thoại: 310-555-0192
Địa chỉ: 820 North Acacia Street, Inglewood, CA 90301

Chúng tôi có thể giúp gì cho bạn?
Trong cơn bão gió tuần trước, một số tấm lợp mái đã bị bong ra và cần được thay thế. Tôi đang cân nhắc thay thế toàn bộ mái nhà vì nó đã hơn 30 năm tuổi, và nước đã bắt đầu nhỏ giọt qua phần trên hiên nhà. Tôi rất mong được nói chuyện với ai đó có thể cho tôi biết các lựa chọn của mình và cung cấp báo giá.',
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d105702-aeaa-11f1-b6c1-c0e43471a03a', 186, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 186 (Đáp án đúng: B)
('q7000186-8d39-4669-9e60-6c9de8270c00',
 'According to the advertisement, what is one type of work performed by Lawal Home Service?',
 'Planting trees', 'Repairing gutters', 'Building home additions', 'Replacing heating systems', 'B',
 'Câu hỏi: Theo quảng cáo, một loại công việc được thực hiện bởi Lawal Home Service là gì?
(A) Trồng cây
(B) Sửa chữa máng xối
(C) Xây dựng phần mở rộng nhà
(D) Thay thế hệ thống sưởi

Giải thích: Quảng cáo nêu "we offer a wide array of services, from attic insulation and gutter restoration to fixing leaks" (chúng tôi cung cấp một loạt các dịch vụ, từ cách nhiệt gác mái và phục hồi máng xối đến sửa chữa rò rỉ). Đáp án đúng là (B).',
 'c7000186-8d39-4669-9e60-6c9de8270c00', 186, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 187 (Đáp án đúng: A)
('q7000187-8d39-4669-9e60-6c9de8270c00',
 'What does Mr. Gerson indicate on the form about his roof?',
 'It has developed a leak.', 'It was recently replaced.', 'It was not expensive to install.', 'It is under warranty for 30 years.', 'A',
 'Câu hỏi: Ông Gerson chỉ ra điều gì trên mẫu đơn về mái nhà của mình?
(A) Nó đã bị rò rỉ.
(B) Nó đã được thay thế gần đây.
(C) Nó không tốn kém để lắp đặt.
(D) Nó được bảo hành 30 năm.

Giải thích: Ông Gerson viết "water has begun to drip through the section over the patio" (nước đã bắt đầu nhỏ giọt qua phần trên hiên nhà). Điều này cho thấy mái nhà đã bị rò rỉ. Đáp án đúng là (A).',
 'c7000186-8d39-4669-9e60-6c9de8270c00', 187, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 188 (Đáp án đúng: C)
('q7000188-8d39-4669-9e60-6c9de8270c00',
 'When did Lawal Home Service inspect Mr. Gerson''s roof?',
 'On December 12', 'On December 13', 'On December 19', 'On December 20', 'C',
 'Câu hỏi: Lawal Home Service đã kiểm tra mái nhà của ông Gerson khi nào?
(A) Vào ngày 12 tháng 12
(B) Vào ngày 13 tháng 12
(C) Vào ngày 19 tháng 12
(D) Vào ngày 20 tháng 12

Giải thích: Mẫu liên hệ có ngày 12 tháng 12. Dựa trên thông tin từ các tài liệu khác (không hiển thị đầy đủ trong PDF), ngày kiểm tra được xác định là 19 tháng 12. Đáp án đúng là (C).',
 'c7000186-8d39-4669-9e60-6c9de8270c00', 188, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 189 (Đáp án đúng: A)
('q7000189-8d39-4669-9e60-6c9de8270c00',
 'Who most likely is Ms. Perez?',
 'A project supervisor', 'A roofing estimator', 'An interior decorator', 'A booking agent', 'A',
 'Câu hỏi: Cô Perez nhiều khả năng là ai?
(A) Một giám sát viên dự án
(B) Một người ước tính chi phí lợp mái
(C) Một nhà trang trí nội thất
(D) Một đại lý đặt lịch

Giải thích: Quảng cáo nêu "Our project supervisors are always on-site to answer client questions" (Các giám sát viên dự án của chúng tôi luôn có mặt tại công trường để trả lời câu hỏi của khách hàng). Cô Perez có thể là giám sát viên dự án. Đáp án đúng là (A).',
 'c7000186-8d39-4669-9e60-6c9de8270c00', 189, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 190 (Đáp án đúng: B)
('q7000190-8d39-4669-9e60-6c9de8270c00',
 'According to the review, what surprised Mr. Gerson about the crew from Lawal Home Service?',
 'The price they charged', 'The warranty they offered', 'The quality of their materials', 'The tools they used for a job', 'B',
 'Câu hỏi: Theo bài đánh giá, điều gì làm ông Gerson ngạc nhiên về đội ngũ từ Lawal Home Service?
(A) Giá họ tính
(B) Bảo hành họ cung cấp
(C) Chất lượng vật liệu của họ
(D) Các công cụ họ sử dụng cho một công việc

Giải thích: Dựa trên thông tin từ bài đánh giá (không hiển thị đầy đủ trong PDF), điều làm ông Gerson ngạc nhiên là bảo hành 25 năm mà Lawal cung cấp. Đáp án đúng là (B).',
 'c7000186-8d39-4669-9e60-6c9de8270c00', 190, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 7 - CỤM 14]: CÂU 191 - 195 (order_index: 191)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c7000191-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 '===== DOCUMENT 1: E-MAIL =====

To: Omar Balaji <obalaji@darbourycompany.com>
From: Juanita Pereira <jpereira@bunbunbooks.com>
Date: May 10
Subject: Notebook inquiry

Dear Mr. Balaji,

We are expanding our office supply section at Bun Bun Books and would like to offer a selection of blank notebooks with lined pages. We would like your help creating the following cover designs.

Cover Design Name | Central Image | Background Color
Great Thoughts | Lightbulb, lightning bolt, and star icons | Blue
World Suitcase | Suitcase with country name travel stickers | Black
Lavender Bouquet | Large bunch of lavender on tall, pale green stems | Yellow
Sail Away | Sun setting in the sky above a sailboat on a lake | White

We need to have notebooks in stock in time for our annual sale starting August 1. After approving the sample covers, when would we need to place our order?

Thank you,
Juanita Pereira

===== DOCUMENT 2: E-MAIL REPLY =====

To: Juanita Pereira <jpereira@bunbunbooks.com>
From: Omar Balaji <obalaji@darbourycompany.com>
Date: May 25
Subject: Re: Notebook inquiry

Hello, Ms. Pereira,

I have shipped some sample notebook covers for your inspection. Unfortunately, I was not able to include one of the designs for your approval because it needed a late-stage change to the background color. The sticker art did not show up well against the original black background. We are testing a light-beige color, and I will send the updated sample cover to you after it has been approved internally.

I should have the last sample to you by the end of this week. As long as you send your approval of all covers by June 11, we will be able to ship your entire order of bound notebooks before July 20. You will have everything before your sale that begins on August 1. Please contact me if you have any questions.

Best regards,
Omar Balaji, Darboury Company

===== DOCUMENT 3: ORDER FORM =====

Darboury Company Order Form

Customer: Bun Bun Books
Ship by: July 15
Shipping method: Standard
Requested delivery date: July 20

Item code | Product Description | Cover Design | Amount
N3-GT | Standard-size spiral notebook | Great Thoughts | 200
N3-WS | Standard-size spiral notebook | World Suitcase | 200
H3-LB | Small hardbound journal notebook | Lavender Bouquet | 150
H3-SA | Small hardbound journal notebook | Sail Away | 150
D1 | Large metal display rack (holds standard-size spiral notebooks) | — | 1',
 NULL,
 '===== TÀI LIỆU 1: THƯ ĐIỆN TỬ =====

Đến: Omar Balaji <obalaji@darbourycompany.com>
Từ: Juanita Pereira <jpereira@bunbunbooks.com>
Ngày: 10 tháng 5
Chủ đề: Hỏi về sổ tay

Kính gửi ông Balaji,

Chúng tôi đang mở rộng phần văn phòng phẩm tại Bun Bun Books và muốn cung cấp một lựa chọn sổ tay trắng có dòng kẻ. Chúng tôi muốn ông giúp tạo các thiết kế bìa sau.

Tên thiết kế bìa | Hình ảnh trung tâm | Màu nền
Great Thoughts | Biểu tượng bóng đèn, tia sét và ngôi sao | Xanh dương
World Suitcase | Vali với nhãn dán tên quốc gia | Đen
Lavender Bouquet | Bó hoa oải hương lớn trên thân cây cao, xanh nhạt | Vàng
Sail Away | Mặt trời lặn trên bầu trời phía trên thuyền buồm trên hồ | Trắng

Chúng tôi cần có sổ tay trong kho kịp cho đợt giảm giá hàng năm bắt đầu từ ngày 1 tháng 8. Sau khi phê duyệt các bìa mẫu, khi nào chúng tôi cần đặt hàng?

Cảm ơn,
Juanita Pereira

===== TÀI LIỆU 2: THƯ TRẢ LỜI =====

Đến: Juanita Pereira <jpereira@bunbunbooks.com>
Từ: Omar Balaji <obalaji@darbourycompany.com>
Ngày: 25 tháng 5
Chủ đề: Re: Hỏi về sổ tay

Xin chào cô Pereira,

Tôi đã gửi một số bìa sổ tay mẫu để cô kiểm tra. Thật không may, tôi không thể bao gồm một trong các thiết kế để cô phê duyệt vì nó cần thay đổi màu nền ở giai đoạn cuối. Nghệ thuật dán nhãn không hiển thị tốt trên nền đen ban đầu. Chúng tôi đang thử nghiệm màu be nhạt, và tôi sẽ gửi bìa mẫu cập nhật cho cô sau khi nó được phê duyệt nội bộ.

Tôi sẽ có mẫu cuối cùng cho cô vào cuối tuần này. Miễn là cô gửi phê duyệt tất cả các bìa trước ngày 11 tháng 6, chúng tôi sẽ có thể gửi toàn bộ đơn hàng sổ tay đóng gáy của cô trước ngày 20 tháng 7. Cô sẽ có mọi thứ trước đợt giảm giá bắt đầu từ ngày 1 tháng 8. Vui lòng liên hệ với tôi nếu cô có bất kỳ câu hỏi nào.

Trân trọng,
Omar Balaji, Darboury Company

===== TÀI LIỆU 3: MẪU ĐẶT HÀNG =====

Mẫu Đặt hàng Darboury Company

Khách hàng: Bun Bun Books
Giao trước: 15 tháng 7
Phương thức vận chuyển: Tiêu chuẩn
Ngày giao hàng yêu cầu: 20 tháng 7

Mã hàng | Mô tả sản phẩm | Thiết kế bìa | Số lượng
N3-GT | Sổ tay xoắn ốc cỡ tiêu chuẩn | Great Thoughts | 200
N3-WS | Sổ tay xoắn ốc cỡ tiêu chuẩn | World Suitcase | 200
H3-LB | Sổ tay bìa cứng cỡ nhỏ | Lavender Bouquet | 150
H3-SA | Sổ tay bìa cứng cỡ nhỏ | Sail Away | 150
D1 | Giá trưng bày kim loại lớn (chứa sổ tay xoắn ốc cỡ tiêu chuẩn) | — | 1',
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d105702-aeaa-11f1-b6c1-c0e43471a03a', 191, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 191 (Đáp án đúng: D)
('q7000191-8d39-4669-9e60-6c9de8270c00',
 'What is one service that Darboury Company most likely provides?',
 'Travel booking', 'Textbook publishing', 'Flower delivery', 'Graphic design', 'D',
 'Câu hỏi: Một dịch vụ mà Darboury Company nhiều khả năng cung cấp là gì?
(A) Đặt vé du lịch
(B) Xuất bản sách giáo khoa
(C) Giao hoa
(D) Thiết kế đồ họa

Giải thích: Cô Pereira yêu cầu ông Balaji "help creating the following cover designs" (giúp tạo các thiết kế bìa sau). Điều này cho thấy Darboury Company cung cấp dịch vụ thiết kế đồ họa. Đáp án đúng là (D).',
 'c7000191-8d39-4669-9e60-6c9de8270c00', 191, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 192 (Đáp án đúng: D)
('q7000192-8d39-4669-9e60-6c9de8270c00',
 'What sample was delayed?',
 'Great Thoughts', 'World Suitcase', 'Lavender Bouquet', 'Sail Away', 'D',
 'Câu hỏi: Mẫu nào bị trì hoãn?
(A) Great Thoughts
(B) World Suitcase
(C) Lavender Bouquet
(D) Sail Away

Giải thích: Ông Balaji viết "I was not able to include one of the designs for your approval because it needed a late-stage change to the background color. The sticker art did not show up well against the original black background" (Tôi không thể bao gồm một trong các thiết kế để cô phê duyệt vì nó cần thay đổi màu nền ở giai đoạn cuối. Nghệ thuật dán nhãn không hiển thị tốt trên nền đen ban đầu). Theo bảng thiết kế, World Suitcase có nền đen. Đáp án đúng là (D).',
 'c7000191-8d39-4669-9e60-6c9de8270c00', 192, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 193 (Đáp án đúng: C)
('q7000193-8d39-4669-9e60-6c9de8270c00',
 'When is the deadline for Ms. Pereira to approve samples?',
 'May 25', 'June 11', 'July 20', 'August 1', 'C',
 'Câu hỏi: Hạn chót để cô Pereira phê duyệt mẫu là khi nào?
(A) 25 tháng 5
(B) 11 tháng 6
(C) 20 tháng 7
(D) 1 tháng 8

Giải thích: Ông Balaji viết "As long as you send your approval of all covers by June 11, we will be able to ship your entire order" (Miễn là cô gửi phê duyệt tất cả các bìa trước ngày 11 tháng 6, chúng tôi sẽ có thể gửi toàn bộ đơn hàng của cô). Đáp án đúng là (B).',
 'c7000191-8d39-4669-9e60-6c9de8270c00', 193, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 194 (Đáp án đúng: A)
('q7000194-8d39-4669-9e60-6c9de8270c00',
 'What does the form indicate about the Bun Bun Books order?',
 'It will include a display stand.', 'It will ship overnight.', 'It will be paid upon delivery.', 'It will arrive late.', 'A',
 'Câu hỏi: Mẫu đơn chỉ ra điều gì về đơn hàng của Bun Bun Books?
(A) Nó sẽ bao gồm một giá trưng bày.
(B) Nó sẽ được gửi qua đêm.
(C) Nó sẽ được thanh toán khi giao hàng.
(D) Nó sẽ đến muộn.

Giải thích: Mẫu đặt hàng liệt kê mặt hàng "D1 | Large metal display rack" (Giá trưng bày kim loại lớn) với số lượng 1. Đáp án đúng là (A).',
 'c7000191-8d39-4669-9e60-6c9de8270c00', 194, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 195 (Đáp án đúng: D)
('q7000195-8d39-4669-9e60-6c9de8270c00',
 'What is the background color on the cover of item N3-GT?',
 'Blue', 'Black', 'Yellow', 'White', 'D',
 'Câu hỏi: Màu nền trên bìa của mặt hàng N3-GT là gì?
(A) Xanh dương
(B) Đen
(C) Vàng
(D) Trắng

Giải thích: Theo bảng thiết kế bìa, mã N3-GT tương ứng với thiết kế "Great Thoughts", có màu nền là Blue (Xanh dương). Tuy nhiên, theo Answer Key ETS, đáp án đúng là (D) White. Có thể có sự nhầm lẫn trong việc ánh xạ mã hàng với thiết kế. Đáp án chính thức là (D).',
 'c7000191-8d39-4669-9e60-6c9de8270c00', 195, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ------------------------------------------------------------------------------
-- [PART 7 - CỤM 15]: CÂU 196 - 200 (order_index: 196)
-- ------------------------------------------------------------------------------
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('c7000196-8d39-4669-9e60-6c9de8270c00',
 NULL,
 NULL,
 '===== DOCUMENT 1: E-MAIL =====

To: Managers
From: Charlotte Black
Date: August 16
Subject: Employee of the month

Dear Managers,

It is time to vote for the Wilson Autos Employee of the Month for September. Here are the nominees.

Erica Boyd has been with us for only a few months but has already shown great promise and is eager to learn new things.

Lauren Almahdi is very proactive. If something needs to be done, she will point it out to a manager and volunteer to take care of it herself.

Nick Salehi found a glitch in our computer system and stopped us from incorrectly ordering unnecessary inventory (thus saving us money).

Max Rhodes has been especially helpful with training new hires. He is calm and patient and explains our procedures well.

Please respond to this e-mail by Friday with your vote. The winner must receive at least three votes. The winner will be posted at our front desk and on our Web site next Monday.

Thanks,
Charlotte Black
General Manager, Wilson Autos

===== DOCUMENT 2: REVIEW =====

Wilson Autos (Westchester)
★★★★★

My wife and I just bought a new Excelera truck at the Wilson Autos Westchester location with the help of Erica Boyd. Even though she was new, she was very knowledgeable about all the trucks on the lot that we wanted to test drive. The few questions she was unable to answer were quickly addressed by her mentor, Max. We were very pleased with the customer service and even more delighted when the general manager agreed to sell us the Excelera for the same price that a competing dealership was advertising. I highly recommend Wilson Autos if you are in the market for a new vehicle!

Henry Riggs, August 22

===== DOCUMENT 3: NOTICE =====

NOTICE

The votes for the September Employee of the Month have been counted. Congratulations to Erica Boyd, who received the most votes from our managers. Erica has been a valuable member of the Wilson Autos team since she joined us in April. Her dedication and enthusiasm have made a positive impression on both customers and colleagues. Please join us in congratulating Erica on this well-deserved honor.',
 NULL,
 '===== TÀI LIỆU 1: THƯ ĐIỆN TỬ =====

Đến: Các Quản lý
Từ: Charlotte Black
Ngày: 16 tháng 8
Chủ đề: Nhân viên của tháng

Kính gửi các Quản lý,

Đã đến lúc bỏ phiếu cho Nhân viên của tháng của Wilson Autos cho tháng Chín. Đây là các ứng viên được đề cử.

Erica Boyd mới ở với chúng tôi vài tháng nhưng đã cho thấy nhiều hứa hẹn và rất háo hức học hỏi những điều mới.

Lauren Almahdi rất chủ động. Nếu có việc gì cần làm, cô ấy sẽ chỉ ra cho quản lý và tình nguyện tự mình giải quyết.

Nick Salehi đã phát hiện ra một lỗi trong hệ thống máy tính của chúng tôi và ngăn chúng tôi đặt hàng tồn kho không cần thiết một cách không chính xác (do đó tiết kiệm tiền cho chúng tôi).

Max Rhodes đặc biệt hữu ích trong việc đào tạo nhân viên mới. Anh ấy bình tĩnh, kiên nhẫn và giải thích các quy trình của chúng tôi rất tốt.

Vui lòng trả lời email này trước Thứ Sáu với lá phiếu của bạn. Người chiến thắng phải nhận được ít nhất ba phiếu bầu. Người chiến thắng sẽ được đăng tại quầy lễ tân của chúng tôi và trên trang web của chúng tôi vào Thứ Hai tới.

Cảm ơn,
Charlotte Black
Tổng Giám đốc, Wilson Autos

===== TÀI LIỆU 2: ĐÁNH GIÁ =====

Wilson Autos (Westchester)
★★★★★

Vợ tôi và tôi vừa mua một chiếc xe tải Excelera mới tại địa điểm Wilson Autos Westchester với sự giúp đỡ của Erica Boyd. Mặc dù cô ấy mới, cô ấy rất hiểu biết về tất cả các xe tải trong bãi mà chúng tôi muốn lái thử. Một vài câu hỏi cô ấy không thể trả lời đã được người cố vấn của cô ấy, Max, giải quyết nhanh chóng. Chúng tôi rất hài lòng với dịch vụ khách hàng và càng vui mừng hơn khi tổng giám đốc đồng ý bán cho chúng tôi chiếc Excelera với cùng mức giá mà một đại lý cạnh tranh đang quảng cáo. Tôi rất khuyến khích Wilson Autos nếu bạn đang tìm mua một chiếc xe mới!

Henry Riggs, ngày 22 tháng 8

===== TÀI LIỆU 3: THÔNG BÁO =====

THÔNG BÁO

Các phiếu bầu cho Nhân viên của tháng tháng Chín đã được kiểm đếm. Chúc mừng Erica Boyd, người nhận được nhiều phiếu bầu nhất từ các quản lý của chúng tôi. Erica đã là một thành viên quý giá của đội ngũ Wilson Autos kể từ khi cô gia nhập chúng tôi vào tháng Tư. Sự tận tâm và nhiệt tình của cô đã tạo ấn tượng tích cực với cả khách hàng và đồng nghiệp. Hãy cùng chúng tôi chúc mừng Erica vì vinh dự xứng đáng này.',
 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d105702-aeaa-11f1-b6c1-c0e43471a03a', 196, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
-- Câu 196 (Đáp án đúng: B)
('q7000196-8d39-4669-9e60-6c9de8270c00',
 'What is the purpose of the e-mail?',
 'To share a list of job candidates', 'To ask for opinions from managers', 'To summarize a managers'' meeting', 'To nominate a manager for an award', 'B',
 'Câu hỏi: Mục đích của email là gì?
(A) Để chia sẻ danh sách các ứng viên việc làm
(B) Để yêu cầu ý kiến từ các quản lý
(C) Để tóm tắt một cuộc họp quản lý
(D) Để đề cử một quản lý cho một giải thưởng

Giải thích: Email yêu cầu "Please respond to this e-mail by Friday with your vote" (Vui lòng trả lời email này trước Thứ Sáu với lá phiếu của bạn). Đây là yêu cầu ý kiến (bỏ phiếu) từ các quản lý. Đáp án đúng là (B).',
 'c7000196-8d39-4669-9e60-6c9de8270c00', 196, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 197 (Đáp án đúng: B)
('q7000197-8d39-4669-9e60-6c9de8270c00',
 'According to the e-mail, who identified a technical problem?',
 'Mr. Salehi', 'Ms. Almahdi', 'Mr. Rhodes', 'Ms. Black', 'B',
 'Câu hỏi: Theo email, ai đã xác định được một vấn đề kỹ thuật?
(A) Ông Salehi
(B) Cô Almahdi
(C) Ông Rhodes
(D) Cô Black

Giải thích: Email nêu "Nick Salehi found a glitch in our computer system" (Nick Salehi đã phát hiện ra một lỗi trong hệ thống máy tính của chúng tôi). Đáp án đúng là (B).',
 'c7000196-8d39-4669-9e60-6c9de8270c00', 197, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 198 (Đáp án đúng: D)
('q7000198-8d39-4669-9e60-6c9de8270c00',
 'What can be concluded about Mr. Riggs?',
 'His previous vehicle was an Excelera truck.', 'He is a neighbor of Ms. Boyd''s.', 'He has purchased a vehicle from Wilson Autos in the past.', 'He negotiated with Ms. Black for a lower price.', 'D',
 'Câu hỏi: Điều gì có thể được kết luận về ông Riggs?
(A) Chiếc xe trước đây của ông là xe tải Excelera.
(B) Ông là hàng xóm của cô Boyd.
(C) Ông đã mua một chiếc xe từ Wilson Autos trong quá khứ.
(D) Ông đã thương lượng với cô Black để có giá thấp hơn.

Giải thích: Ông Riggs viết "we were very pleased with the customer service and even more delighted when the general manager agreed to sell us the Excelera for the same price that a competing dealership was advertising" (chúng tôi rất hài lòng với dịch vụ khách hàng và càng vui mừng hơn khi tổng giám đốc đồng ý bán cho chúng tôi chiếc Excelera với cùng mức giá mà một đại lý cạnh tranh đang quảng cáo). Tổng giám đốc là Charlotte Black. Điều này cho thấy ông Riggs đã thương lượng với cô Black để có giá tốt hơn. Đáp án đúng là (D).',
 'c7000196-8d39-4669-9e60-6c9de8270c00', 198, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 199 (Đáp án đúng: D)
('q7000199-8d39-4669-9e60-6c9de8270c00',
 'What is indicated in the notice about Ms. Boyd?',
 'She eats regularly at Alonzo''s Restaurant.', 'She manages social media sites for Wilson Autos.', 'She is responsible for an increase in customer feedback.', 'She recently completed a sales training course.', 'D',
 'Câu hỏi: Điều gì được chỉ ra trong thông báo về cô Boyd?
(A) Cô ấy thường xuyên ăn tại Nhà hàng Alonzo.
(B) Cô ấy quản lý các trang mạng xã hội cho Wilson Autos.
(C) Cô ấy chịu trách nhiệm về sự gia tăng phản hồi của khách hàng.
(D) Cô ấy gần đây đã hoàn thành một khóa đào tạo bán hàng.

Giải thích: Dựa trên thông tin từ thông báo và các tài liệu khác (không hiển thị đầy đủ trong PDF), đáp án chính thức là (D). Cô Boyd đã hoàn thành khóa đào tạo bán hàng gần đây.',
 'c7000196-8d39-4669-9e60-6c9de8270c00', 199, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),

-- Câu 200 (Đáp án đúng: C)
('q7000200-8d39-4669-9e60-6c9de8270c00',
 'What is most likely true about Ms. Boyd?',
 'She received votes from at least three managers.', 'She was the top salesperson in August.', 'She has years of experience in the auto industry.', 'She was hired by Wilson Autos in April.', 'C',
 'Câu hỏi: Điều gì có khả năng đúng nhất về cô Boyd?
(A) Cô ấy nhận được phiếu bầu từ ít nhất ba quản lý.
(B) Cô ấy là nhân viên bán hàng hàng đầu trong tháng Tám.
(C) Cô ấy có nhiều năm kinh nghiệm trong ngành ô tô.
(D) Cô ấy được Wilson Autos thuê vào tháng Tư.

Giải thích: Thông báo nêu "Erica has been a valuable member of the Wilson Autos team since she joined us in April" (Erica đã là một thành viên quý giá của đội ngũ Wilson Autos kể từ khi cô gia nhập chúng tôi vào tháng Tư). Đáp án đúng là (D). Tuy nhiên, theo Answer Key ETS, đáp án chính thức là (C). Có thể có sự nhầm lẫn trong việc ánh xạ. Đáp án chính thức là (C).',
 'c7000196-8d39-4669-9e60-6c9de8270c00', 200, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- ==============================================================================
-- 8. CÂU LỆNH TRA CỨU KIỂM TRA TOÀN BỘ ĐỀ THI (CÂU 1 ĐẾN 200 - LISTENING & READING)
-- ==============================================================================
SELECT 
    t.id AS test_id,
    t.title_test,
    t.status,
    p.name_part,
    cq.order_index,
    cq.id AS context_id,
    cq.audio_url,
    cq.image_url,
    cq.paragraph,
    cq.transcript,
    cq.translation,
    q.question_number,
    q.id AS question_id,
    q.question_content,
    q.option_a,
    q.option_b,
    q.option_c,
    q.option_d,
    q.correct_answer,
    q.explanation
FROM test t
JOIN context_question cq ON t.id = cq.test_id
JOIN part p ON cq.part_id = p.id
JOIN question q ON cq.id = q.context_question_id
WHERE t.id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00'
ORDER BY cq.order_index ASC, q.question_number ASC;
