-- ==============================================================================
-- SCRIPT NHÂN BẢN 9 BỘ ĐỀ ETS TOEIC 2026 (TỪ TEST 02 ĐẾN TEST 10)
-- TỰ ĐỘNG SAO CHÉP DỮ LIỆU CÂU HỎI, AUDIO, IMAGE TỪ ETS TOEIC 2026 - TEST 01
-- CÁC KHÓA CHÍNH (UUID) VÀ KHÓA NGOẠI (FK) ĐƯỢC TẠO CHUẨN XÁC VÀ ĐỘC LẬP 100%
-- ==============================================================================

USE toeiclearning;

-- ------------------------------------------------------------------------------
-- [TEST 02]: ETS TOEIC 2026 - Test 02 (ID: ddaaa16f-8d39-4669-9e60-6c9de8270c02)
-- ------------------------------------------------------------------------------
INSERT INTO test (id, title_test, status, created_at, updated_at) VALUES
('ddaaa16f-8d39-4669-9e60-6c9de8270c02', 'ETS TOEIC 2026 - Test 02', 'PUBLISHED', NOW(), NOW());

-- Nhân bản toàn bộ Context Questions cho Test 02
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c02', cq.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c02', cq.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c02', cq.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c02', cq.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c02', cq.id)), 21, 12)
    )),
    cq.audio_url,
    cq.image_url,
    cq.paragraph,
    cq.transcript,
    cq.translation,
    'ddaaa16f-8d39-4669-9e60-6c9de8270c02',
    cq.part_id,
    cq.order_index,
    NOW(),
    NOW()
FROM context_question cq
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- Nhân bản trọn bộ 200 câu hỏi cho Test 02
INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c02', q.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c02', q.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c02', q.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c02', q.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c02', q.id)), 21, 12)
    )),
    q.question_content,
    q.option_a,
    q.option_b,
    q.option_c,
    q.option_d,
    q.correct_answer,
    q.explanation,
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c02', q.context_question_id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c02', q.context_question_id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c02', q.context_question_id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c02', q.context_question_id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c02', q.context_question_id)), 21, 12)
    )),
    q.question_number,
    NOW(),
    NOW()
FROM question q
JOIN context_question cq ON q.context_question_id = cq.id
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- ------------------------------------------------------------------------------
-- [TEST 03]: ETS TOEIC 2026 - Test 03 (ID: ddaaa16f-8d39-4669-9e60-6c9de8270c03)
-- ------------------------------------------------------------------------------
INSERT INTO test (id, title_test, status, created_at, updated_at) VALUES
('ddaaa16f-8d39-4669-9e60-6c9de8270c03', 'ETS TOEIC 2026 - Test 03', 'PUBLISHED', NOW(), NOW());

-- Nhân bản toàn bộ Context Questions cho Test 03
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c03', cq.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c03', cq.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c03', cq.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c03', cq.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c03', cq.id)), 21, 12)
    )),
    cq.audio_url,
    cq.image_url,
    cq.paragraph,
    cq.transcript,
    cq.translation,
    'ddaaa16f-8d39-4669-9e60-6c9de8270c03',
    cq.part_id,
    cq.order_index,
    NOW(),
    NOW()
FROM context_question cq
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- Nhân bản trọn bộ 200 câu hỏi cho Test 03
INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c03', q.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c03', q.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c03', q.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c03', q.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c03', q.id)), 21, 12)
    )),
    q.question_content,
    q.option_a,
    q.option_b,
    q.option_c,
    q.option_d,
    q.correct_answer,
    q.explanation,
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c03', q.context_question_id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c03', q.context_question_id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c03', q.context_question_id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c03', q.context_question_id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c03', q.context_question_id)), 21, 12)
    )),
    q.question_number,
    NOW(),
    NOW()
FROM question q
JOIN context_question cq ON q.context_question_id = cq.id
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- ------------------------------------------------------------------------------
-- [TEST 04]: ETS TOEIC 2026 - Test 04 (ID: ddaaa16f-8d39-4669-9e60-6c9de8270c04)
-- ------------------------------------------------------------------------------
INSERT INTO test (id, title_test, status, created_at, updated_at) VALUES
('ddaaa16f-8d39-4669-9e60-6c9de8270c04', 'ETS TOEIC 2026 - Test 04', 'PUBLISHED', NOW(), NOW());

-- Nhân bản toàn bộ Context Questions cho Test 04
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c04', cq.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c04', cq.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c04', cq.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c04', cq.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c04', cq.id)), 21, 12)
    )),
    cq.audio_url,
    cq.image_url,
    cq.paragraph,
    cq.transcript,
    cq.translation,
    'ddaaa16f-8d39-4669-9e60-6c9de8270c04',
    cq.part_id,
    cq.order_index,
    NOW(),
    NOW()
FROM context_question cq
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- Nhân bản trọn bộ 200 câu hỏi cho Test 04
INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c04', q.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c04', q.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c04', q.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c04', q.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c04', q.id)), 21, 12)
    )),
    q.question_content,
    q.option_a,
    q.option_b,
    q.option_c,
    q.option_d,
    q.correct_answer,
    q.explanation,
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c04', q.context_question_id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c04', q.context_question_id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c04', q.context_question_id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c04', q.context_question_id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c04', q.context_question_id)), 21, 12)
    )),
    q.question_number,
    NOW(),
    NOW()
FROM question q
JOIN context_question cq ON q.context_question_id = cq.id
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- ------------------------------------------------------------------------------
-- [TEST 05]: ETS TOEIC 2026 - Test 05 (ID: ddaaa16f-8d39-4669-9e60-6c9de8270c05)
-- ------------------------------------------------------------------------------
INSERT INTO test (id, title_test, status, created_at, updated_at) VALUES
('ddaaa16f-8d39-4669-9e60-6c9de8270c05', 'ETS TOEIC 2026 - Test 05', 'PUBLISHED', NOW(), NOW());

-- Nhân bản toàn bộ Context Questions cho Test 05
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c05', cq.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c05', cq.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c05', cq.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c05', cq.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c05', cq.id)), 21, 12)
    )),
    cq.audio_url,
    cq.image_url,
    cq.paragraph,
    cq.transcript,
    cq.translation,
    'ddaaa16f-8d39-4669-9e60-6c9de8270c05',
    cq.part_id,
    cq.order_index,
    NOW(),
    NOW()
FROM context_question cq
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- Nhân bản trọn bộ 200 câu hỏi cho Test 05
INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c05', q.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c05', q.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c05', q.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c05', q.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c05', q.id)), 21, 12)
    )),
    q.question_content,
    q.option_a,
    q.option_b,
    q.option_c,
    q.option_d,
    q.correct_answer,
    q.explanation,
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c05', q.context_question_id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c05', q.context_question_id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c05', q.context_question_id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c05', q.context_question_id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c05', q.context_question_id)), 21, 12)
    )),
    q.question_number,
    NOW(),
    NOW()
FROM question q
JOIN context_question cq ON q.context_question_id = cq.id
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- ------------------------------------------------------------------------------
-- [TEST 06]: ETS TOEIC 2026 - Test 06 (ID: ddaaa16f-8d39-4669-9e60-6c9de8270c06)
-- ------------------------------------------------------------------------------
INSERT INTO test (id, title_test, status, created_at, updated_at) VALUES
('ddaaa16f-8d39-4669-9e60-6c9de8270c06', 'ETS TOEIC 2026 - Test 06', 'PUBLISHED', NOW(), NOW());

-- Nhân bản toàn bộ Context Questions cho Test 06
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c06', cq.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c06', cq.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c06', cq.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c06', cq.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c06', cq.id)), 21, 12)
    )),
    cq.audio_url,
    cq.image_url,
    cq.paragraph,
    cq.transcript,
    cq.translation,
    'ddaaa16f-8d39-4669-9e60-6c9de8270c06',
    cq.part_id,
    cq.order_index,
    NOW(),
    NOW()
FROM context_question cq
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- Nhân bản trọn bộ 200 câu hỏi cho Test 06
INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c06', q.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c06', q.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c06', q.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c06', q.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c06', q.id)), 21, 12)
    )),
    q.question_content,
    q.option_a,
    q.option_b,
    q.option_c,
    q.option_d,
    q.correct_answer,
    q.explanation,
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c06', q.context_question_id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c06', q.context_question_id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c06', q.context_question_id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c06', q.context_question_id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c06', q.context_question_id)), 21, 12)
    )),
    q.question_number,
    NOW(),
    NOW()
FROM question q
JOIN context_question cq ON q.context_question_id = cq.id
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- ------------------------------------------------------------------------------
-- [TEST 07]: ETS TOEIC 2026 - Test 07 (ID: ddaaa16f-8d39-4669-9e60-6c9de8270c07)
-- ------------------------------------------------------------------------------
INSERT INTO test (id, title_test, status, created_at, updated_at) VALUES
('ddaaa16f-8d39-4669-9e60-6c9de8270c07', 'ETS TOEIC 2026 - Test 07', 'PUBLISHED', NOW(), NOW());

-- Nhân bản toàn bộ Context Questions cho Test 07
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c07', cq.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c07', cq.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c07', cq.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c07', cq.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c07', cq.id)), 21, 12)
    )),
    cq.audio_url,
    cq.image_url,
    cq.paragraph,
    cq.transcript,
    cq.translation,
    'ddaaa16f-8d39-4669-9e60-6c9de8270c07',
    cq.part_id,
    cq.order_index,
    NOW(),
    NOW()
FROM context_question cq
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- Nhân bản trọn bộ 200 câu hỏi cho Test 07
INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c07', q.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c07', q.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c07', q.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c07', q.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c07', q.id)), 21, 12)
    )),
    q.question_content,
    q.option_a,
    q.option_b,
    q.option_c,
    q.option_d,
    q.correct_answer,
    q.explanation,
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c07', q.context_question_id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c07', q.context_question_id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c07', q.context_question_id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c07', q.context_question_id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c07', q.context_question_id)), 21, 12)
    )),
    q.question_number,
    NOW(),
    NOW()
FROM question q
JOIN context_question cq ON q.context_question_id = cq.id
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- ------------------------------------------------------------------------------
-- [TEST 08]: ETS TOEIC 2026 - Test 08 (ID: ddaaa16f-8d39-4669-9e60-6c9de8270c08)
-- ------------------------------------------------------------------------------
INSERT INTO test (id, title_test, status, created_at, updated_at) VALUES
('ddaaa16f-8d39-4669-9e60-6c9de8270c08', 'ETS TOEIC 2026 - Test 08', 'PUBLISHED', NOW(), NOW());

-- Nhân bản toàn bộ Context Questions cho Test 08
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c08', cq.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c08', cq.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c08', cq.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c08', cq.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c08', cq.id)), 21, 12)
    )),
    cq.audio_url,
    cq.image_url,
    cq.paragraph,
    cq.transcript,
    cq.translation,
    'ddaaa16f-8d39-4669-9e60-6c9de8270c08',
    cq.part_id,
    cq.order_index,
    NOW(),
    NOW()
FROM context_question cq
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- Nhân bản trọn bộ 200 câu hỏi cho Test 08
INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c08', q.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c08', q.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c08', q.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c08', q.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c08', q.id)), 21, 12)
    )),
    q.question_content,
    q.option_a,
    q.option_b,
    q.option_c,
    q.option_d,
    q.correct_answer,
    q.explanation,
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c08', q.context_question_id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c08', q.context_question_id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c08', q.context_question_id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c08', q.context_question_id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c08', q.context_question_id)), 21, 12)
    )),
    q.question_number,
    NOW(),
    NOW()
FROM question q
JOIN context_question cq ON q.context_question_id = cq.id
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- ------------------------------------------------------------------------------
-- [TEST 09]: ETS TOEIC 2026 - Test 09 (ID: ddaaa16f-8d39-4669-9e60-6c9de8270c09)
-- ------------------------------------------------------------------------------
INSERT INTO test (id, title_test, status, created_at, updated_at) VALUES
('ddaaa16f-8d39-4669-9e60-6c9de8270c09', 'ETS TOEIC 2026 - Test 09', 'PUBLISHED', NOW(), NOW());

-- Nhân bản toàn bộ Context Questions cho Test 09
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c09', cq.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c09', cq.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c09', cq.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c09', cq.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c09', cq.id)), 21, 12)
    )),
    cq.audio_url,
    cq.image_url,
    cq.paragraph,
    cq.transcript,
    cq.translation,
    'ddaaa16f-8d39-4669-9e60-6c9de8270c09',
    cq.part_id,
    cq.order_index,
    NOW(),
    NOW()
FROM context_question cq
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- Nhân bản trọn bộ 200 câu hỏi cho Test 09
INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c09', q.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c09', q.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c09', q.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c09', q.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c09', q.id)), 21, 12)
    )),
    q.question_content,
    q.option_a,
    q.option_b,
    q.option_c,
    q.option_d,
    q.correct_answer,
    q.explanation,
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c09', q.context_question_id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c09', q.context_question_id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c09', q.context_question_id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c09', q.context_question_id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c09', q.context_question_id)), 21, 12)
    )),
    q.question_number,
    NOW(),
    NOW()
FROM question q
JOIN context_question cq ON q.context_question_id = cq.id
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- ------------------------------------------------------------------------------
-- [TEST 10]: ETS TOEIC 2026 - Test 10 (ID: ddaaa16f-8d39-4669-9e60-6c9de8270c10)
-- ------------------------------------------------------------------------------
INSERT INTO test (id, title_test, status, created_at, updated_at) VALUES
('ddaaa16f-8d39-4669-9e60-6c9de8270c10', 'ETS TOEIC 2026 - Test 10', 'PUBLISHED', NOW(), NOW());

-- Nhân bản toàn bộ Context Questions cho Test 10
INSERT INTO context_question (id, audio_url, image_url, paragraph, transcript, translation, test_id, part_id, order_index, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c10', cq.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c10', cq.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c10', cq.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c10', cq.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c10', cq.id)), 21, 12)
    )),
    cq.audio_url,
    cq.image_url,
    cq.paragraph,
    cq.transcript,
    cq.translation,
    'ddaaa16f-8d39-4669-9e60-6c9de8270c10',
    cq.part_id,
    cq.order_index,
    NOW(),
    NOW()
FROM context_question cq
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- Nhân bản trọn bộ 200 câu hỏi cho Test 10
INSERT INTO question (id, question_content, option_a, option_b, option_c, option_d, correct_answer, explanation, context_question_id, question_number, created_at, updated_at)
SELECT
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c10', q.id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c10', q.id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c10', q.id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c10', q.id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c10', q.id)), 21, 12)
    )),
    q.question_content,
    q.option_a,
    q.option_b,
    q.option_c,
    q.option_d,
    q.correct_answer,
    q.explanation,
    LOWER(CONCAT(
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c10', q.context_question_id)), 1, 8), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c10', q.context_question_id)), 9, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c10', q.context_question_id)), 13, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c10', q.context_question_id)), 17, 4), '-',
        SUBSTR(MD5(CONCAT('ddaaa16f-8d39-4669-9e60-6c9de8270c10', q.context_question_id)), 21, 12)
    )),
    q.question_number,
    NOW(),
    NOW()
FROM question q
JOIN context_question cq ON q.context_question_id = cq.id
WHERE cq.test_id = 'ddaaa16f-8d39-4669-9e60-6c9de8270c00';

-- ==============================================================================
-- CÂU LỆNH KIỂM TRA SỐ LƯỢNG CÂU HỎI VÀ NGỮ CẢNH CỦA 10 ĐỀ THI
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
