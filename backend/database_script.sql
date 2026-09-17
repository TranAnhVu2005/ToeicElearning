-- ==============================================================================
-- KHỞI TẠO CƠ SỞ DỮ LIỆU TOEIC LEARNING (CÓ SẴN TEST 1: PART 1, PART 2 & PART 3)
-- PHIÊN BẢN ĐÃ SỬA: CẬP NHẬT CÂU 43 CHUẨN ĐỀ BÀI GỐC
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
-- 7. DỮ LIỆU MẪU ĐỀ THI: ETS TOEIC 2026 - TEST 01
-- ==============================================================================
INSERT INTO test (id, title_test, status, created_at, updated_at) VALUES 
('ddaaa16f-8d39-4669-9e60-6c9de8270c00', 'ETS TOEIC 2026 - Test 01', 'PUBLISHED', '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- 7.2 Part 1: 6 cụm câu hỏi (order_index 1 -> 6)
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('fa05e688-bdf3-4d30-a484-f5d61b1044b9', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789536335/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/p8gzlbtidsrmobptni6i.mp3', 'https://res.cloudinary.com/ovs0odtq/image/upload/v1789534179/Resource/toeic-learning/exams/ets-toeic-2026-test-01/images/rdapoakesjzbvig2nduz.png', NULL, '(A) The woman is carrying a tray of food.\n(B) The woman is wearing a jacket.\n(C) The woman is tying up her hair.\n(D) The woman is removing her hat.', NULL, 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d104916-aeaa-11f1-b6c1-c0e43471a03a', 1, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),
('a2d4872e-98ed-4c2e-9b3d-67799707fff7', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789536340/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/pqnp80jzi5pcipsjnc3i.mp3', 'https://res.cloudinary.com/ovs0odtq/image/upload/v1789534183/Resource/toeic-learning/exams/ets-toeic-2026-test-01/images/dhla5kx8k6mbyhfmqhva.png', NULL, '(A) Some people are standing next to a filing cabinet.\n(B) Some people are searching through a desk.\n(C) Some people are watching a presentation.\n(D) Some people are looking at a book.', NULL, 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d104916-aeaa-11f1-b6c1-c0e43471a03a', 2, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),
('1695710e-0326-4d3a-b091-45c57d6ace20', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789536344/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/kjgcviubepfby0hrntxl.mp3', 'https://res.cloudinary.com/ovs0odtq/image/upload/v1789534186/Resource/toeic-learning/exams/ets-toeic-2026-test-01/images/zbzi8baqjtnr1jxzfuwx.png', NULL, '(A) A woman is holding a phone up to her ear.\n(B) A woman is pouring a beverage into a glass.\n(C) Some light fixtures are hanging from the ceiling.\n(D) Some tiles are being installed in a hallway.', NULL, 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d104916-aeaa-11f1-b6c1-c0e43471a03a', 3, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),
('1be4482b-495e-4e57-aa81-dab25c5c2b46', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789536348/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/v8sy20hueqx23sszw6ep.mp3', 'https://res.cloudinary.com/ovs0odtq/image/upload/v1789534190/Resource/toeic-learning/exams/ets-toeic-2026-test-01/images/xh8lfjggcmwquzmhhynr.png', NULL, '(A) A wooden crate is filled with vegetables.\n(B) One of the men is putting vegetables into a shopping bag.\n(C) A backpack has been set on the ground.\n(D) One of the men is reaching into a bucket.', NULL, 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d104916-aeaa-11f1-b6c1-c0e43471a03a', 4, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),
('f2eff0b8-2446-414f-9db9-eac22872564b', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789536353/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/cqjeucng95gubbl6cie9.mp3', 'https://res.cloudinary.com/ovs0odtq/image/upload/v1789534193/Resource/toeic-learning/exams/ets-toeic-2026-test-01/images/p631pfg5kvjzmq4zugd4.png', NULL, '(A) Painting supplies have been laid out on the floor.\n(B) He''s laying a brush down on a windowsill.\n(C) He''s lifting a can of paint by its handle.\n(D) Cans of paint have been placed on a step stool.', NULL, 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d104916-aeaa-11f1-b6c1-c0e43471a03a', 5, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),
('dd4fb079-5ef9-47f5-a88f-31df8429966f', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789536357/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/oyqrnhwsigmhy6qsepxl.mp3', 'https://res.cloudinary.com/ovs0odtq/image/upload/v1789534209/Resource/toeic-learning/exams/ets-toeic-2026-test-01/images/c8kzudmcsvjygltudthd.png', NULL, '(A) A path is covered with fallen branches.\n(B) A tree is lying across a grassy area.\n(C) Some water has pooled on a path.\n(D) Some cyclists are riding through a field.', NULL, 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d104916-aeaa-11f1-b6c1-c0e43471a03a', 6, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- 7.3 Part 1: 6 câu hỏi (question_number 1 -> 6)
INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at) VALUES
('fb8f0447-b253-4ad1-8dc7-20dcd6fac25d', 'Select the statement that best describes what you see in the picture.', '(A)', '(B)', '(C)', '(D)', 'B', '(A) Người phụ nữ đang bưng một khay thức ăn.\n(B) Người phụ nữ đang mặc một chiếc áo khoác.\n(C) Người phụ nữ đang buộc tóc lên.\n(D) Người phụ nữ đang tháo mũ ra.', 'fa05e688-bdf3-4d30-a484-f5d61b1044b9', 1, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),
('f17c3286-9a2d-40fc-a494-fac36f334fe2', 'Select the statement that best describes what you see in the picture.', '(A)', '(B)', '(C)', '(D)', 'D', '(A) Một vài người đang đứng cạnh một tủ đựng hồ sơ.\n(B) Một vài người đang lục tìm trong một chiếc bàn làm việc.\n(C) Một vài người đang xem một buổi thuyết trình.\n(D) Một vài người đang nhìn vào một cuốn sách.', 'a2d4872e-98ed-4c2e-9b3d-67799707fff7', 2, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),
('518c0ae5-0120-4257-b7f4-37d61883b985', 'Select the statement that best describes what you see in the picture.', '(A)', '(B)', '(C)', '(D)', 'C', '(A) Một người phụ nữ đang giữ điện thoại áp vào tai.\n(B) Một người phụ nữ đang rót đồ uống vào một chiếc ly.\n(C) Một vài thiết bị chiếu sáng đang được treo trên trần nhà.\n(D) Một vài viên gạch đang được lắp đặt trong một hành lang.', '1695710e-0326-4d3a-b091-45c57d6ace20', 3, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),
('6c86ff1a-fc30-4240-a2b9-0eee24406fb3', 'Select the statement that best describes what you see in the picture.', '(A)', '(B)', '(C)', '(D)', 'A', '(A) Một cái thùng gỗ được chất đầy rau củ.\n(B) Một trong những người đàn ông đang cho rau củ vào một chiếc túi mua sắm.\n(C) Một chiếc ba lô đã được đặt trên mặt đất.\n(D) Một trong những người đàn ông đang thò tay vào một cái xô.', '1be4482b-495e-4e57-aa81-dab25c5c2b46', 4, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),
('e21f217c-9c3d-44a0-a384-46b1ec4f24d3', 'Select the statement that best describes what you see in the picture.', '(A)', '(B)', '(C)', '(D)', 'A', '(A) Dụng cụ sơn đã được bày ra trên sàn nhà.\n(B) Anh ấy đang đặt một cây cọ xuống bậu cửa sổ.\n(C) Anh ấy đang nhấc một lon sơn bằng quai xách của nó.\n(D) Những lon sơn đã được đặt trên một chiếc ghế đẩu.', 'f2eff0b8-2446-414f-9db9-eac22872564b', 5, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),
('4c660c12-4bf6-4dd4-8c1e-d41d20ec0b37', 'Select the statement that best describes what you see in the picture.', '(A)', '(B)', '(C)', '(D)', 'C', '(A) Một con đường mòn bị bao phủ bởi những cành cây rơi.\n(B) Một cái cây đang nằm ngang qua một bãi cỏ.\n(C) Một ít nước đã đọng lại trên một con đường mòn.\n(D) Một vài người đi xe đạp đang đạp xe qua một cánh đồng.', 'dd4fb079-5ef9-47f5-a88f-31df8429966f', 6, '2026-09-16 04:50:24', '2026-09-16 04:50:24');

-- 7.4 Part 2: 25 cụm câu hỏi (order_index 7 -> 31)
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at) VALUES
('25ad56cc-da23-4d73-9b15-320614d4e075', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539676/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/z3pk8umqurxknrdiv6uq.mp3', NULL, NULL, 'Question: Where is the conference being held?\n(A) A three-day vacation.\n(B) At the Riverview Hotel.\n(C) In the supply cabinet.', NULL, 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 7, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),
('d0a4a583-731f-447d-9321-a66e813fe58d', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539705/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/iu15uceggskl6j4vtmoz.mp3', NULL, NULL, 'Question: When does the warehouse manager arrive?\n(A) Sure, no problem.\n(B) About twelve shipping boxes.\n(C) Not until this afternoon.', NULL, 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 8, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),
('dc29aac7-e5f2-4844-b3f8-59e35135cacf', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539712/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/thbccapqpgmrurtfl5ie.mp3', NULL, NULL, 'Question: There''s a nice park nearby, right?\n(A) Did you order paper for the copier?\n(B) Yes—it''s next to Greendale Lake.\n(C) They''re in the parking garage.', NULL, 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 9, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),
('359d1ff2-4358-4557-b7ca-9b1fd4b763a1', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539739/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/y1rbzjv6gqntogsdday1.mp3', NULL, NULL, 'Question: Who sent the meeting minutes to the accounting department?\n(A) Our office assistant.\n(B) They have a savings account.\n(C) Cash and credit cards.', NULL, 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 10, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),
('16197577-0bbc-40ce-9fa5-50961e961163', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539744/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/qi4szl4ut97lkjnzp4hm.mp3', NULL, NULL, 'Question: I''d like to know what you think of our new finance analyst.\n(A) I''ve prepared the decorations for tomorrow.\n(B) He seems very competent.\n(C) It''s finally stopped raining.', NULL, 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 11, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),
('fcfd2f2d-e63b-4165-a471-5edca9960ef4', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539748/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/fqksqbnaiukgwhid9zqv.mp3', NULL, NULL, 'Question: Let''s go on the company retreat.\n(A) Oh, did he?\n(B) Yes, that''s a good idea.\n(C) He tried to solve that problem.', NULL, 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 12, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),
('a379d10d-32d5-4261-8f19-2ec9f3987ab7', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539755/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/qqprenlg96t5t0isoflw.mp3', NULL, NULL, 'Question: What time can I pick up my glasses?\n(A) No, it''s not very heavy.\n(B) About twenty meters.\n(C) We close at six o''clock.', NULL, 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 13, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),
('ebc6e860-7915-4623-a28a-44bbe6d2339d', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539759/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/fcku2x0w2pajkljfsqvt.mp3', NULL, NULL, 'Question: The sales team knows how to use the tracking software, don''t they?\n(A) It''s on the lower shelf.\n(B) A twelve-thirty departure.\n(C) I haven''t seen them using it yet.', NULL, 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 14, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),
('4029b20d-1309-45c0-b300-4dce9fb06edd', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539764/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/en1pxshksionpg7sgdfp.mp3', NULL, NULL, 'Question: Are you going to the hardware store on Mill Street?\n(A) That store hasn''t opened yet.\n(B) The blue package you sent me.\n(C) Some nails and a hammer.', NULL, 'ddaaa16f-8d39-4669-9e60-6c9de8270c00', '0d10545b-aeaa-11f1-b6c1-c0e43471a03a', 15, '2026-09-16 04:50:24', '2026-09-16 04:50:24'),
('0e995264-2f51-48ea-9a5e-3ee9c9d89072', 'https://res.cloudinary.com/ovs0odtq/video/upload/v1789539785/Resource/toeic-learning/exams/ets-toeic-2026-test-01/audios/edoyavu2gwlzxkvldiy3.mp3', NULL, NULL, 'Question: Would you be able to write the introduction for the workshop?\n(A