-- Migration script: Upgrade existing legacy toeiclearning schema to latest schema
-- Safe for running on an existing MySQL database (does NOT drop database or tables)
-- Date: 2026-10-31

-- 1. Table: teacher_application (cần tạo trước khi payment_transaction tham chiếu)
CREATE TABLE IF NOT EXISTS teacher_application (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    statement VARCHAR(1000),
    status VARCHAR(24) NOT NULL,
    reviewed_by_id VARCHAR(36),
    reviewed_at DATETIME,
    review_reason VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_teacher_application_user FOREIGN KEY (user_id) REFERENCES `user`(id),
    CONSTRAINT fk_teacher_application_reviewer FOREIGN KEY (reviewed_by_id) REFERENCES `user`(id),
    INDEX idx_teacher_application_status_created (status, created_at)
);

-- 2. Table: payment_transaction - bổ sung các cột mới an toàn
SET @exist_pt_product_type := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payment_transaction' AND COLUMN_NAME = 'product_type');
SET @sql := IF(@exist_pt_product_type = 0, 'ALTER TABLE payment_transaction ADD COLUMN product_type VARCHAR(40) NULL AFTER vnp_txn_ref', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exist_pt_app_id := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payment_transaction' AND COLUMN_NAME = 'teacher_application_id');
SET @sql := IF(@exist_pt_app_id = 0, 'ALTER TABLE payment_transaction ADD COLUMN teacher_application_id VARCHAR(36) NULL AFTER product_type, ADD CONSTRAINT fk_payment_teacher_application FOREIGN KEY (teacher_application_id) REFERENCES teacher_application(id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exist_pt_test_id := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payment_transaction' AND COLUMN_NAME = 'test_id');
SET @sql := IF(@exist_pt_test_id = 0, 'ALTER TABLE payment_transaction ADD COLUMN test_id VARCHAR(36) NULL AFTER teacher_application_id, ADD CONSTRAINT fk_payment_test FOREIGN KEY (test_id) REFERENCES test(id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exist_pt_snap := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payment_transaction' AND COLUMN_NAME = 'product_name_snapshot');
SET @sql := IF(@exist_pt_snap = 0, 'ALTER TABLE payment_transaction ADD COLUMN product_name_snapshot VARCHAR(255) NULL AFTER test_id', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exist_pt_vnp_no := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payment_transaction' AND COLUMN_NAME = 'vnp_transaction_no');
SET @sql := IF(@exist_pt_vnp_no = 0, 'ALTER TABLE payment_transaction ADD COLUMN vnp_transaction_no VARCHAR(32) NULL AFTER payment_date, ADD COLUMN vnp_response_code VARCHAR(8) NULL AFTER vnp_transaction_no, ADD COLUMN vnp_transaction_status VARCHAR(8) NULL AFTER vnp_response_code, ADD COLUMN paid_at DATETIME NULL AFTER vnp_transaction_status', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3. Table: exam_media_asset
CREATE TABLE IF NOT EXISTS exam_media_asset (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    public_id VARCHAR(512) NOT NULL UNIQUE,
    media_format VARCHAR(16) NOT NULL,
    resource_type VARCHAR(16) NOT NULL,
    delivery_type VARCHAR(16) NOT NULL,
    uploaded_by_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_exam_media_asset_uploader FOREIGN KEY (uploaded_by_id) REFERENCES `user`(id),
    INDEX idx_exam_media_asset_uploader (uploaded_by_id)
);

-- 4. Table: user_presence
CREATE TABLE IF NOT EXISTS user_presence (
    user_id VARCHAR(36) PRIMARY KEY,
    last_seen_at DATETIME NOT NULL,
    CONSTRAINT fk_user_presence_user FOREIGN KEY (user_id) REFERENCES `user`(id) ON DELETE CASCADE,
    INDEX idx_user_presence_last_seen (last_seen_at)
);

-- 5. Table: auth_login_attempt
CREATE TABLE IF NOT EXISTS auth_login_attempt (
    bucket_key CHAR(64) PRIMARY KEY,
    attempt_count INT NOT NULL,
    window_started_at DATETIME NOT NULL,
    INDEX idx_auth_login_attempt_window (window_started_at)
);

-- 6. Table: test_entitlement
CREATE TABLE IF NOT EXISTS test_entitlement (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    test_id VARCHAR(36) NOT NULL,
    payment_transaction_id VARCHAR(36) NOT NULL UNIQUE,
    source VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_test_entitlement_user_test UNIQUE (user_id, test_id),
    CONSTRAINT fk_test_entitlement_user FOREIGN KEY (user_id) REFERENCES `user`(id),
    CONSTRAINT fk_test_entitlement_test FOREIGN KEY (test_id) REFERENCES test(id),
    CONSTRAINT fk_test_entitlement_payment FOREIGN KEY (payment_transaction_id) REFERENCES payment_transaction(id)
);

-- 7. Table: exam_session
CREATE TABLE IF NOT EXISTS exam_session (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    test_id VARCHAR(36) NOT NULL,
    assignment_id VARCHAR(36),
    source_result_id VARCHAR(36),
    test_result_id VARCHAR(36),
    scope_key CHAR(64) NOT NULL,
    test_content_fingerprint CHAR(64) NOT NULL,
    started_at DATETIME NOT NULL,
    expires_at DATETIME NOT NULL,
    duration_limit_seconds INT,
    status VARCHAR(20) NOT NULL,
    target_question_ids LONGTEXT NOT NULL,
    answers_json LONGTEXT NOT NULL,
    last_saved_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_exam_session_user FOREIGN KEY (user_id) REFERENCES `user`(id) ON DELETE CASCADE,
    CONSTRAINT fk_exam_session_test FOREIGN KEY (test_id) REFERENCES test(id) ON DELETE CASCADE,
    CONSTRAINT fk_exam_session_assignment FOREIGN KEY (assignment_id) REFERENCES assignment(id) ON DELETE SET NULL,
    CONSTRAINT fk_exam_session_source FOREIGN KEY (source_result_id) REFERENCES test_result(id) ON DELETE SET NULL,
    CONSTRAINT fk_exam_session_result FOREIGN KEY (test_result_id) REFERENCES test_result(id) ON DELETE SET NULL,
    INDEX idx_exam_session_user_status (user_id, status),
    INDEX idx_exam_session_expires_at (expires_at)
);

-- 8. Table: audit_event
CREATE TABLE IF NOT EXISTS audit_event (
    id VARCHAR(36) NOT NULL,
    occurred_at_utc DATETIME NOT NULL,
    actor_user_id VARCHAR(36) NULL,
    action VARCHAR(80) NOT NULL,
    target_type VARCHAR(60) NOT NULL,
    target_id VARCHAR(36) NOT NULL,
    outcome VARCHAR(30) NOT NULL,
    ip_hash CHAR(64) NULL,
    PRIMARY KEY (id),
    INDEX idx_audit_event_time (occurred_at_utc),
    INDEX idx_audit_event_actor_time (actor_user_id, occurred_at_utc),
    INDEX idx_audit_event_target (target_type, target_id)
);
