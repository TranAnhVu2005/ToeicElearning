USE toeiclearning;

-- ==============================================================================
-- NHÂN BẢN DỮ LIỆU: BỘ 20 ĐỀ THI YBM - 2025 (TỪ TEST 01 ĐẾN TEST 20)
-- PHỤC VỤ KIỂM THỬ TÍNH NĂNG PHÂN TRANG (PAGINATION) VÀ TÌM KIẾM TRÊN GIAO DIỆN
-- CÁC KHÓA CHÍNH (UUID) VÀ KHÓA NGOẠI (FK) ĐƯỢC TẠO CHUẨN XÁC VÀ ĐỘC LẬP 100%
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- [YBM 2025 - TEST 01]: YBM - 2025 - Test 01 (ID: ybm20250-8d39-4669-9e60-6c9de8270c01)
-- ------------------------------------------------------------------------------
INSERT INTO test (id, title_test, status, created_at, updated_at) VALUES
('ybm20250-8d39-4669-9e60-6c9de8270c01', 'YBM - 2025 - Test 01', 'PUBLISHED', NOW(), NOW());

-- Nhân bản Context Questions cho YBM - 2025 - Test 01
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c01', cq.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c01', cq.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c01', cq.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c01', cq.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c01', cq.id)), 21, 12)
    )),
    cq.audio_url,
    cq.image_url,
    cq.paragraph,
    cq.transcript,
    cq.translation,
    'ybm20250-8d39-4669-9e60-6c9de8270c01',
    cq.part_id,
    cq.order_index,
    NOW(),
    NOW()
FROM context_question cq
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- Nhân bản trọn bộ 200 câu hỏi cho YBM - 2025 - Test 01
INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c01', q.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c01', q.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c01', q.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c01', q.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c01', q.id)), 21, 12)
    )),
    q.question_content,
    q.option_a,
    q.option_b,
    q.option_c,
    q.option_d,
    q.correct_answer,
    q.explanation,
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c01', q.context_question_id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c01', q.context_question_id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c01', q.context_question_id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c01', q.context_question_id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c01', q.context_question_id)), 21, 12)
    )),
    q.question_number,
    NOW(),
    NOW()
FROM question q
JOIN context_question cq ON q.context_question_id = cq.id
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- ------------------------------------------------------------------------------
-- [YBM 2025 - TEST 02]: YBM - 2025 - Test 02 (ID: ybm20250-8d39-4669-9e60-6c9de8270c02)
-- ------------------------------------------------------------------------------
INSERT INTO test (id, title_test, status, created_at, updated_at) VALUES
('ybm20250-8d39-4669-9e60-6c9de8270c02', 'YBM - 2025 - Test 02', 'PUBLISHED', NOW(), NOW());

-- Nhân bản Context Questions cho YBM - 2025 - Test 02
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c02', cq.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c02', cq.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c02', cq.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c02', cq.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c02', cq.id)), 21, 12)
    )),
    cq.audio_url,
    cq.image_url,
    cq.paragraph,
    cq.transcript,
    cq.translation,
    'ybm20250-8d39-4669-9e60-6c9de8270c02',
    cq.part_id,
    cq.order_index,
    NOW(),
    NOW()
FROM context_question cq
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- Nhân bản trọn bộ 200 câu hỏi cho YBM - 2025 - Test 02
INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c02', q.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c02', q.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c02', q.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c02', q.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c02', q.id)), 21, 12)
    )),
    q.question_content,
    q.option_a,
    q.option_b,
    q.option_c,
    q.option_d,
    q.correct_answer,
    q.explanation,
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c02', q.context_question_id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c02', q.context_question_id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c02', q.context_question_id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c02', q.context_question_id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c02', q.context_question_id)), 21, 12)
    )),
    q.question_number,
    NOW(),
    NOW()
FROM question q
JOIN context_question cq ON q.context_question_id = cq.id
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- ------------------------------------------------------------------------------
-- [YBM 2025 - TEST 03]: YBM - 2025 - Test 03 (ID: ybm20250-8d39-4669-9e60-6c9de8270c03)
-- ------------------------------------------------------------------------------
INSERT INTO test (id, title_test, status, created_at, updated_at) VALUES
('ybm20250-8d39-4669-9e60-6c9de8270c03', 'YBM - 2025 - Test 03', 'PUBLISHED', NOW(), NOW());

-- Nhân bản Context Questions cho YBM - 2025 - Test 03
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c03', cq.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c03', cq.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c03', cq.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c03', cq.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c03', cq.id)), 21, 12)
    )),
    cq.audio_url,
    cq.image_url,
    cq.paragraph,
    cq.transcript,
    cq.translation,
    'ybm20250-8d39-4669-9e60-6c9de8270c03',
    cq.part_id,
    cq.order_index,
    NOW(),
    NOW()
FROM context_question cq
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- Nhân bản trọn bộ 200 câu hỏi cho YBM - 2025 - Test 03
INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c03', q.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c03', q.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c03', q.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c03', q.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c03', q.id)), 21, 12)
    )),
    q.question_content,
    q.option_a,
    q.option_b,
    q.option_c,
    q.option_d,
    q.correct_answer,
    q.explanation,
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c03', q.context_question_id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c03', q.context_question_id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c03', q.context_question_id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c03', q.context_question_id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c03', q.context_question_id)), 21, 12)
    )),
    q.question_number,
    NOW(),
    NOW()
FROM question q
JOIN context_question cq ON q.context_question_id = cq.id
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- ------------------------------------------------------------------------------
-- [YBM 2025 - TEST 04]: YBM - 2025 - Test 04 (ID: ybm20250-8d39-4669-9e60-6c9de8270c04)
-- ------------------------------------------------------------------------------
INSERT INTO test (id, title_test, status, created_at, updated_at) VALUES
('ybm20250-8d39-4669-9e60-6c9de8270c04', 'YBM - 2025 - Test 04', 'PUBLISHED', NOW(), NOW());

-- Nhân bản Context Questions cho YBM - 2025 - Test 04
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c04', cq.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c04', cq.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c04', cq.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c04', cq.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c04', cq.id)), 21, 12)
    )),
    cq.audio_url,
    cq.image_url,
    cq.paragraph,
    cq.transcript,
    cq.translation,
    'ybm20250-8d39-4669-9e60-6c9de8270c04',
    cq.part_id,
    cq.order_index,
    NOW(),
    NOW()
FROM context_question cq
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- Nhân bản trọn bộ 200 câu hỏi cho YBM - 2025 - Test 04
INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c04', q.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c04', q.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c04', q.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c04', q.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c04', q.id)), 21, 12)
    )),
    q.question_content,
    q.option_a,
    q.option_b,
    q.option_c,
    q.option_d,
    q.correct_answer,
    q.explanation,
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c04', q.context_question_id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c04', q.context_question_id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c04', q.context_question_id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c04', q.context_question_id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c04', q.context_question_id)), 21, 12)
    )),
    q.question_number,
    NOW(),
    NOW()
FROM question q
JOIN context_question cq ON q.context_question_id = cq.id
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- ------------------------------------------------------------------------------
-- [YBM 2025 - TEST 05]: YBM - 2025 - Test 05 (ID: ybm20250-8d39-4669-9e60-6c9de8270c05)
-- ------------------------------------------------------------------------------
INSERT INTO test (id, title_test, status, created_at, updated_at) VALUES
('ybm20250-8d39-4669-9e60-6c9de8270c05', 'YBM - 2025 - Test 05', 'PUBLISHED', NOW(), NOW());

-- Nhân bản Context Questions cho YBM - 2025 - Test 05
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c05', cq.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c05', cq.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c05', cq.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c05', cq.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c05', cq.id)), 21, 12)
    )),
    cq.audio_url,
    cq.image_url,
    cq.paragraph,
    cq.transcript,
    cq.translation,
    'ybm20250-8d39-4669-9e60-6c9de8270c05',
    cq.part_id,
    cq.order_index,
    NOW(),
    NOW()
FROM context_question cq
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- Nhân bản trọn bộ 200 câu hỏi cho YBM - 2025 - Test 05
INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c05', q.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c05', q.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c05', q.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c05', q.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c05', q.id)), 21, 12)
    )),
    q.question_content,
    q.option_a,
    q.option_b,
    q.option_c,
    q.option_d,
    q.correct_answer,
    q.explanation,
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c05', q.context_question_id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c05', q.context_question_id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c05', q.context_question_id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c05', q.context_question_id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c05', q.context_question_id)), 21, 12)
    )),
    q.question_number,
    NOW(),
    NOW()
FROM question q
JOIN context_question cq ON q.context_question_id = cq.id
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- ------------------------------------------------------------------------------
-- [YBM 2025 - TEST 06]: YBM - 2025 - Test 06 (ID: ybm20250-8d39-4669-9e60-6c9de8270c06)
-- ------------------------------------------------------------------------------
INSERT INTO test (id, title_test, status, created_at, updated_at) VALUES
('ybm20250-8d39-4669-9e60-6c9de8270c06', 'YBM - 2025 - Test 06', 'PUBLISHED', NOW(), NOW());

-- Nhân bản Context Questions cho YBM - 2025 - Test 06
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c06', cq.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c06', cq.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c06', cq.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c06', cq.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c06', cq.id)), 21, 12)
    )),
    cq.audio_url,
    cq.image_url,
    cq.paragraph,
    cq.transcript,
    cq.translation,
    'ybm20250-8d39-4669-9e60-6c9de8270c06',
    cq.part_id,
    cq.order_index,
    NOW(),
    NOW()
FROM context_question cq
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- Nhân bản trọn bộ 200 câu hỏi cho YBM - 2025 - Test 06
INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c06', q.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c06', q.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c06', q.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c06', q.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c06', q.id)), 21, 12)
    )),
    q.question_content,
    q.option_a,
    q.option_b,
    q.option_c,
    q.option_d,
    q.correct_answer,
    q.explanation,
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c06', q.context_question_id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c06', q.context_question_id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c06', q.context_question_id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c06', q.context_question_id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c06', q.context_question_id)), 21, 12)
    )),
    q.question_number,
    NOW(),
    NOW()
FROM question q
JOIN context_question cq ON q.context_question_id = cq.id
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- ------------------------------------------------------------------------------
-- [YBM 2025 - TEST 07]: YBM - 2025 - Test 07 (ID: ybm20250-8d39-4669-9e60-6c9de8270c07)
-- ------------------------------------------------------------------------------
INSERT INTO test (id, title_test, status, created_at, updated_at) VALUES
('ybm20250-8d39-4669-9e60-6c9de8270c07', 'YBM - 2025 - Test 07', 'PUBLISHED', NOW(), NOW());

-- Nhân bản Context Questions cho YBM - 2025 - Test 07
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c07', cq.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c07', cq.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c07', cq.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c07', cq.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c07', cq.id)), 21, 12)
    )),
    cq.audio_url,
    cq.image_url,
    cq.paragraph,
    cq.transcript,
    cq.translation,
    'ybm20250-8d39-4669-9e60-6c9de8270c07',
    cq.part_id,
    cq.order_index,
    NOW(),
    NOW()
FROM context_question cq
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- Nhân bản trọn bộ 200 câu hỏi cho YBM - 2025 - Test 07
INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c07', q.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c07', q.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c07', q.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c07', q.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c07', q.id)), 21, 12)
    )),
    q.question_content,
    q.option_a,
    q.option_b,
    q.option_c,
    q.option_d,
    q.correct_answer,
    q.explanation,
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c07', q.context_question_id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c07', q.context_question_id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c07', q.context_question_id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c07', q.context_question_id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c07', q.context_question_id)), 21, 12)
    )),
    q.question_number,
    NOW(),
    NOW()
FROM question q
JOIN context_question cq ON q.context_question_id = cq.id
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- ------------------------------------------------------------------------------
-- [YBM 2025 - TEST 08]: YBM - 2025 - Test 08 (ID: ybm20250-8d39-4669-9e60-6c9de8270c08)
-- ------------------------------------------------------------------------------
INSERT INTO test (id, title_test, status, created_at, updated_at) VALUES
('ybm20250-8d39-4669-9e60-6c9de8270c08', 'YBM - 2025 - Test 08', 'PUBLISHED', NOW(), NOW());

-- Nhân bản Context Questions cho YBM - 2025 - Test 08
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c08', cq.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c08', cq.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c08', cq.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c08', cq.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c08', cq.id)), 21, 12)
    )),
    cq.audio_url,
    cq.image_url,
    cq.paragraph,
    cq.transcript,
    cq.translation,
    'ybm20250-8d39-4669-9e60-6c9de8270c08',
    cq.part_id,
    cq.order_index,
    NOW(),
    NOW()
FROM context_question cq
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- Nhân bản trọn bộ 200 câu hỏi cho YBM - 2025 - Test 08
INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c08', q.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c08', q.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c08', q.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c08', q.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c08', q.id)), 21, 12)
    )),
    q.question_content,
    q.option_a,
    q.option_b,
    q.option_c,
    q.option_d,
    q.correct_answer,
    q.explanation,
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c08', q.context_question_id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c08', q.context_question_id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c08', q.context_question_id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c08', q.context_question_id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c08', q.context_question_id)), 21, 12)
    )),
    q.question_number,
    NOW(),
    NOW()
FROM question q
JOIN context_question cq ON q.context_question_id = cq.id
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- ------------------------------------------------------------------------------
-- [YBM 2025 - TEST 09]: YBM - 2025 - Test 09 (ID: ybm20250-8d39-4669-9e60-6c9de8270c09)
-- ------------------------------------------------------------------------------
INSERT INTO test (id, title_test, status, created_at, updated_at) VALUES
('ybm20250-8d39-4669-9e60-6c9de8270c09', 'YBM - 2025 - Test 09', 'PUBLISHED', NOW(), NOW());

-- Nhân bản Context Questions cho YBM - 2025 - Test 09
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c09', cq.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c09', cq.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c09', cq.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c09', cq.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c09', cq.id)), 21, 12)
    )),
    cq.audio_url,
    cq.image_url,
    cq.paragraph,
    cq.transcript,
    cq.translation,
    'ybm20250-8d39-4669-9e60-6c9de8270c09',
    cq.part_id,
    cq.order_index,
    NOW(),
    NOW()
FROM context_question cq
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- Nhân bản trọn bộ 200 câu hỏi cho YBM - 2025 - Test 09
INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c09', q.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c09', q.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c09', q.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c09', q.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c09', q.id)), 21, 12)
    )),
    q.question_content,
    q.option_a,
    q.option_b,
    q.option_c,
    q.option_d,
    q.correct_answer,
    q.explanation,
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c09', q.context_question_id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c09', q.context_question_id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c09', q.context_question_id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c09', q.context_question_id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c09', q.context_question_id)), 21, 12)
    )),
    q.question_number,
    NOW(),
    NOW()
FROM question q
JOIN context_question cq ON q.context_question_id = cq.id
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- ------------------------------------------------------------------------------
-- [YBM 2025 - TEST 10]: YBM - 2025 - Test 10 (ID: ybm20250-8d39-4669-9e60-6c9de8270c10)
-- ------------------------------------------------------------------------------
INSERT INTO test (id, title_test, status, created_at, updated_at) VALUES
('ybm20250-8d39-4669-9e60-6c9de8270c10', 'YBM - 2025 - Test 10', 'PUBLISHED', NOW(), NOW());

-- Nhân bản Context Questions cho YBM - 2025 - Test 10
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c10', cq.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c10', cq.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c10', cq.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c10', cq.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c10', cq.id)), 21, 12)
    )),
    cq.audio_url,
    cq.image_url,
    cq.paragraph,
    cq.transcript,
    cq.translation,
    'ybm20250-8d39-4669-9e60-6c9de8270c10',
    cq.part_id,
    cq.order_index,
    NOW(),
    NOW()
FROM context_question cq
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- Nhân bản trọn bộ 200 câu hỏi cho YBM - 2025 - Test 10
INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c10', q.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c10', q.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c10', q.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c10', q.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c10', q.id)), 21, 12)
    )),
    q.question_content,
    q.option_a,
    q.option_b,
    q.option_c,
    q.option_d,
    q.correct_answer,
    q.explanation,
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c10', q.context_question_id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c10', q.context_question_id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c10', q.context_question_id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c10', q.context_question_id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c10', q.context_question_id)), 21, 12)
    )),
    q.question_number,
    NOW(),
    NOW()
FROM question q
JOIN context_question cq ON q.context_question_id = cq.id
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- ------------------------------------------------------------------------------
-- [YBM 2025 - TEST 11]: YBM - 2025 - Test 11 (ID: ybm20250-8d39-4669-9e60-6c9de8270c11)
-- ------------------------------------------------------------------------------
INSERT INTO test (id, title_test, status, created_at, updated_at) VALUES
('ybm20250-8d39-4669-9e60-6c9de8270c11', 'YBM - 2025 - Test 11', 'PUBLISHED', NOW(), NOW());

-- Nhân bản Context Questions cho YBM - 2025 - Test 11
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c11', cq.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c11', cq.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c11', cq.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c11', cq.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c11', cq.id)), 21, 12)
    )),
    cq.audio_url,
    cq.image_url,
    cq.paragraph,
    cq.transcript,
    cq.translation,
    'ybm20250-8d39-4669-9e60-6c9de8270c11',
    cq.part_id,
    cq.order_index,
    NOW(),
    NOW()
FROM context_question cq
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- Nhân bản trọn bộ 200 câu hỏi cho YBM - 2025 - Test 11
INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c11', q.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c11', q.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c11', q.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c11', q.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c11', q.id)), 21, 12)
    )),
    q.question_content,
    q.option_a,
    q.option_b,
    q.option_c,
    q.option_d,
    q.correct_answer,
    q.explanation,
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c11', q.context_question_id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c11', q.context_question_id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c11', q.context_question_id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c11', q.context_question_id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c11', q.context_question_id)), 21, 12)
    )),
    q.question_number,
    NOW(),
    NOW()
FROM question q
JOIN context_question cq ON q.context_question_id = cq.id
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- ------------------------------------------------------------------------------
-- [YBM 2025 - TEST 12]: YBM - 2025 - Test 12 (ID: ybm20250-8d39-4669-9e60-6c9de8270c12)
-- ------------------------------------------------------------------------------
INSERT INTO test (id, title_test, status, created_at, updated_at) VALUES
('ybm20250-8d39-4669-9e60-6c9de8270c12', 'YBM - 2025 - Test 12', 'PUBLISHED', NOW(), NOW());

-- Nhân bản Context Questions cho YBM - 2025 - Test 12
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c12', cq.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c12', cq.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c12', cq.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c12', cq.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c12', cq.id)), 21, 12)
    )),
    cq.audio_url,
    cq.image_url,
    cq.paragraph,
    cq.transcript,
    cq.translation,
    'ybm20250-8d39-4669-9e60-6c9de8270c12',
    cq.part_id,
    cq.order_index,
    NOW(),
    NOW()
FROM context_question cq
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- Nhân bản trọn bộ 200 câu hỏi cho YBM - 2025 - Test 12
INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c12', q.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c12', q.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c12', q.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c12', q.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c12', q.id)), 21, 12)
    )),
    q.question_content,
    q.option_a,
    q.option_b,
    q.option_c,
    q.option_d,
    q.correct_answer,
    q.explanation,
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c12', q.context_question_id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c12', q.context_question_id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c12', q.context_question_id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c12', q.context_question_id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c12', q.context_question_id)), 21, 12)
    )),
    q.question_number,
    NOW(),
    NOW()
FROM question q
JOIN context_question cq ON q.context_question_id = cq.id
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- ------------------------------------------------------------------------------
-- [YBM 2025 - TEST 13]: YBM - 2025 - Test 13 (ID: ybm20250-8d39-4669-9e60-6c9de8270c13)
-- ------------------------------------------------------------------------------
INSERT INTO test (id, title_test, status, created_at, updated_at) VALUES
('ybm20250-8d39-4669-9e60-6c9de8270c13', 'YBM - 2025 - Test 13', 'PUBLISHED', NOW(), NOW());

-- Nhân bản Context Questions cho YBM - 2025 - Test 13
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c13', cq.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c13', cq.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c13', cq.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c13', cq.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c13', cq.id)), 21, 12)
    )),
    cq.audio_url,
    cq.image_url,
    cq.paragraph,
    cq.transcript,
    cq.translation,
    'ybm20250-8d39-4669-9e60-6c9de8270c13',
    cq.part_id,
    cq.order_index,
    NOW(),
    NOW()
FROM context_question cq
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- Nhân bản trọn bộ 200 câu hỏi cho YBM - 2025 - Test 13
INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c13', q.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c13', q.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c13', q.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c13', q.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c13', q.id)), 21, 12)
    )),
    q.question_content,
    q.option_a,
    q.option_b,
    q.option_c,
    q.option_d,
    q.correct_answer,
    q.explanation,
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c13', q.context_question_id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c13', q.context_question_id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c13', q.context_question_id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c13', q.context_question_id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c13', q.context_question_id)), 21, 12)
    )),
    q.question_number,
    NOW(),
    NOW()
FROM question q
JOIN context_question cq ON q.context_question_id = cq.id
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- ------------------------------------------------------------------------------
-- [YBM 2025 - TEST 14]: YBM - 2025 - Test 14 (ID: ybm20250-8d39-4669-9e60-6c9de8270c14)
-- ------------------------------------------------------------------------------
INSERT INTO test (id, title_test, status, created_at, updated_at) VALUES
('ybm20250-8d39-4669-9e60-6c9de8270c14', 'YBM - 2025 - Test 14', 'PUBLISHED', NOW(), NOW());

-- Nhân bản Context Questions cho YBM - 2025 - Test 14
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c14', cq.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c14', cq.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c14', cq.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c14', cq.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c14', cq.id)), 21, 12)
    )),
    cq.audio_url,
    cq.image_url,
    cq.paragraph,
    cq.transcript,
    cq.translation,
    'ybm20250-8d39-4669-9e60-6c9de8270c14',
    cq.part_id,
    cq.order_index,
    NOW(),
    NOW()
FROM context_question cq
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- Nhân bản trọn bộ 200 câu hỏi cho YBM - 2025 - Test 14
INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c14', q.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c14', q.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c14', q.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c14', q.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c14', q.id)), 21, 12)
    )),
    q.question_content,
    q.option_a,
    q.option_b,
    q.option_c,
    q.option_d,
    q.correct_answer,
    q.explanation,
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c14', q.context_question_id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c14', q.context_question_id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c14', q.context_question_id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c14', q.context_question_id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c14', q.context_question_id)), 21, 12)
    )),
    q.question_number,
    NOW(),
    NOW()
FROM question q
JOIN context_question cq ON q.context_question_id = cq.id
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- ------------------------------------------------------------------------------
-- [YBM 2025 - TEST 15]: YBM - 2025 - Test 15 (ID: ybm20250-8d39-4669-9e60-6c9de8270c15)
-- ------------------------------------------------------------------------------
INSERT INTO test (id, title_test, status, created_at, updated_at) VALUES
('ybm20250-8d39-4669-9e60-6c9de8270c15', 'YBM - 2025 - Test 15', 'PUBLISHED', NOW(), NOW());

-- Nhân bản Context Questions cho YBM - 2025 - Test 15
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c15', cq.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c15', cq.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c15', cq.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c15', cq.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c15', cq.id)), 21, 12)
    )),
    cq.audio_url,
    cq.image_url,
    cq.paragraph,
    cq.transcript,
    cq.translation,
    'ybm20250-8d39-4669-9e60-6c9de8270c15',
    cq.part_id,
    cq.order_index,
    NOW(),
    NOW()
FROM context_question cq
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- Nhân bản trọn bộ 200 câu hỏi cho YBM - 2025 - Test 15
INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c15', q.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c15', q.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c15', q.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c15', q.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c15', q.id)), 21, 12)
    )),
    q.question_content,
    q.option_a,
    q.option_b,
    q.option_c,
    q.option_d,
    q.correct_answer,
    q.explanation,
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c15', q.context_question_id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c15', q.context_question_id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c15', q.context_question_id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c15', q.context_question_id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c15', q.context_question_id)), 21, 12)
    )),
    q.question_number,
    NOW(),
    NOW()
FROM question q
JOIN context_question cq ON q.context_question_id = cq.id
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- ------------------------------------------------------------------------------
-- [YBM 2025 - TEST 16]: YBM - 2025 - Test 16 (ID: ybm20250-8d39-4669-9e60-6c9de8270c16)
-- ------------------------------------------------------------------------------
INSERT INTO test (id, title_test, status, created_at, updated_at) VALUES
('ybm20250-8d39-4669-9e60-6c9de8270c16', 'YBM - 2025 - Test 16', 'PUBLISHED', NOW(), NOW());

-- Nhân bản Context Questions cho YBM - 2025 - Test 16
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c16', cq.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c16', cq.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c16', cq.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c16', cq.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c16', cq.id)), 21, 12)
    )),
    cq.audio_url,
    cq.image_url,
    cq.paragraph,
    cq.transcript,
    cq.translation,
    'ybm20250-8d39-4669-9e60-6c9de8270c16',
    cq.part_id,
    cq.order_index,
    NOW(),
    NOW()
FROM context_question cq
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- Nhân bản trọn bộ 200 câu hỏi cho YBM - 2025 - Test 16
INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c16', q.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c16', q.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c16', q.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c16', q.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c16', q.id)), 21, 12)
    )),
    q.question_content,
    q.option_a,
    q.option_b,
    q.option_c,
    q.option_d,
    q.correct_answer,
    q.explanation,
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c16', q.context_question_id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c16', q.context_question_id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c16', q.context_question_id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c16', q.context_question_id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c16', q.context_question_id)), 21, 12)
    )),
    q.question_number,
    NOW(),
    NOW()
FROM question q
JOIN context_question cq ON q.context_question_id = cq.id
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- ------------------------------------------------------------------------------
-- [YBM 2025 - TEST 17]: YBM - 2025 - Test 17 (ID: ybm20250-8d39-4669-9e60-6c9de8270c17)
-- ------------------------------------------------------------------------------
INSERT INTO test (id, title_test, status, created_at, updated_at) VALUES
('ybm20250-8d39-4669-9e60-6c9de8270c17', 'YBM - 2025 - Test 17', 'PUBLISHED', NOW(), NOW());

-- Nhân bản Context Questions cho YBM - 2025 - Test 17
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c17', cq.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c17', cq.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c17', cq.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c17', cq.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c17', cq.id)), 21, 12)
    )),
    cq.audio_url,
    cq.image_url,
    cq.paragraph,
    cq.transcript,
    cq.translation,
    'ybm20250-8d39-4669-9e60-6c9de8270c17',
    cq.part_id,
    cq.order_index,
    NOW(),
    NOW()
FROM context_question cq
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- Nhân bản trọn bộ 200 câu hỏi cho YBM - 2025 - Test 17
INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c17', q.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c17', q.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c17', q.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c17', q.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c17', q.id)), 21, 12)
    )),
    q.question_content,
    q.option_a,
    q.option_b,
    q.option_c,
    q.option_d,
    q.correct_answer,
    q.explanation,
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c17', q.context_question_id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c17', q.context_question_id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c17', q.context_question_id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c17', q.context_question_id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c17', q.context_question_id)), 21, 12)
    )),
    q.question_number,
    NOW(),
    NOW()
FROM question q
JOIN context_question cq ON q.context_question_id = cq.id
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- ------------------------------------------------------------------------------
-- [YBM 2025 - TEST 18]: YBM - 2025 - Test 18 (ID: ybm20250-8d39-4669-9e60-6c9de8270c18)
-- ------------------------------------------------------------------------------
INSERT INTO test (id, title_test, status, created_at, updated_at) VALUES
('ybm20250-8d39-4669-9e60-6c9de8270c18', 'YBM - 2025 - Test 18', 'PUBLISHED', NOW(), NOW());

-- Nhân bản Context Questions cho YBM - 2025 - Test 18
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c18', cq.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c18', cq.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c18', cq.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c18', cq.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c18', cq.id)), 21, 12)
    )),
    cq.audio_url,
    cq.image_url,
    cq.paragraph,
    cq.transcript,
    cq.translation,
    'ybm20250-8d39-4669-9e60-6c9de8270c18',
    cq.part_id,
    cq.order_index,
    NOW(),
    NOW()
FROM context_question cq
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- Nhân bản trọn bộ 200 câu hỏi cho YBM - 2025 - Test 18
INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c18', q.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c18', q.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c18', q.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c18', q.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c18', q.id)), 21, 12)
    )),
    q.question_content,
    q.option_a,
    q.option_b,
    q.option_c,
    q.option_d,
    q.correct_answer,
    q.explanation,
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c18', q.context_question_id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c18', q.context_question_id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c18', q.context_question_id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c18', q.context_question_id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c18', q.context_question_id)), 21, 12)
    )),
    q.question_number,
    NOW(),
    NOW()
FROM question q
JOIN context_question cq ON q.context_question_id = cq.id
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- ------------------------------------------------------------------------------
-- [YBM 2025 - TEST 19]: YBM - 2025 - Test 19 (ID: ybm20250-8d39-4669-9e60-6c9de8270c19)
-- ------------------------------------------------------------------------------
INSERT INTO test (id, title_test, status, created_at, updated_at) VALUES
('ybm20250-8d39-4669-9e60-6c9de8270c19', 'YBM - 2025 - Test 19', 'PUBLISHED', NOW(), NOW());

-- Nhân bản Context Questions cho YBM - 2025 - Test 19
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c19', cq.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c19', cq.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c19', cq.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c19', cq.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c19', cq.id)), 21, 12)
    )),
    cq.audio_url,
    cq.image_url,
    cq.paragraph,
    cq.transcript,
    cq.translation,
    'ybm20250-8d39-4669-9e60-6c9de8270c19',
    cq.part_id,
    cq.order_index,
    NOW(),
    NOW()
FROM context_question cq
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- Nhân bản trọn bộ 200 câu hỏi cho YBM - 2025 - Test 19
INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c19', q.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c19', q.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c19', q.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c19', q.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c19', q.id)), 21, 12)
    )),
    q.question_content,
    q.option_a,
    q.option_b,
    q.option_c,
    q.option_d,
    q.correct_answer,
    q.explanation,
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c19', q.context_question_id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c19', q.context_question_id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c19', q.context_question_id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c19', q.context_question_id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c19', q.context_question_id)), 21, 12)
    )),
    q.question_number,
    NOW(),
    NOW()
FROM question q
JOIN context_question cq ON q.context_question_id = cq.id
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- ------------------------------------------------------------------------------
-- [YBM 2025 - TEST 20]: YBM - 2025 - Test 20 (ID: ybm20250-8d39-4669-9e60-6c9de8270c20)
-- ------------------------------------------------------------------------------
INSERT INTO test (id, title_test, status, created_at, updated_at) VALUES
('ybm20250-8d39-4669-9e60-6c9de8270c20', 'YBM - 2025 - Test 20', 'PUBLISHED', NOW(), NOW());

-- Nhân bản Context Questions cho YBM - 2025 - Test 20
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c20', cq.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c20', cq.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c20', cq.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c20', cq.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c20', cq.id)), 21, 12)
    )),
    cq.audio_url,
    cq.image_url,
    cq.paragraph,
    cq.transcript,
    cq.translation,
    'ybm20250-8d39-4669-9e60-6c9de8270c20',
    cq.part_id,
    cq.order_index,
    NOW(),
    NOW()
FROM context_question cq
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- Nhân bản trọn bộ 200 câu hỏi cho YBM - 2025 - Test 20
INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c20', q.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c20', q.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c20', q.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c20', q.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c20', q.id)), 21, 12)
    )),
    q.question_content,
    q.option_a,
    q.option_b,
    q.option_c,
    q.option_d,
    q.correct_answer,
    q.explanation,
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c20', q.context_question_id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c20', q.context_question_id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c20', q.context_question_id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c20', q.context_question_id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ybm20250-8d39-4669-9e60-6c9de8270c20', q.context_question_id)), 21, 12)
    )),
    q.question_number,
    NOW(),
    NOW()
FROM question q
JOIN context_question cq ON q.context_question_id = cq.id
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- ==============================================================================
-- CÂU LỆNH KIỂM TRA TỔNG SỐ ĐỀ THI TRÊN TOÀN HỆ THỐNG
-- ==============================================================================
SELECT 
    t.id,
    t.title_test,
    t.status,
    COUNT(DISTINCT cq.id) AS total_context_questions,
    COUNT(q.id) AS total_questions
FROM test t
LEFT JOIN context_question cq ON t.id = cq.test_id
LEFT JOIN question q ON cq.id = q.context_question_id
GROUP BY t.id, t.title_test, t.status
ORDER BY t.title_test ASC;
