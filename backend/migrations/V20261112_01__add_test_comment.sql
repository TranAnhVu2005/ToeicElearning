-- Migration: Thêm bảng bình luận đề thi (test_comment)
-- Ngày tạo: 2026-11-12

CREATE TABLE IF NOT EXISTS test_comment (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    test_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_test_comment_test FOREIGN KEY (test_id) REFERENCES test(id) ON DELETE CASCADE,
    CONSTRAINT fk_test_comment_user FOREIGN KEY (user_id) REFERENCES `user`(id) ON DELETE CASCADE
);

CREATE INDEX idx_test_comment_test_created ON test_comment(test_id, created_at);

