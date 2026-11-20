-- Separate assignment PDF attachments from standalone classroom materials,
-- and add student PDF submission table for PDF assignments.

SET @material_assign_att_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'material'
      AND COLUMN_NAME = 'assignment_attachment'
);
SET @sql_material_assign_att := IF(
    @material_assign_att_exists = 0,
    'ALTER TABLE material ADD COLUMN assignment_attachment BOOLEAN NOT NULL DEFAULT FALSE AFTER is_active',
    'SELECT 1'
);
PREPARE stmt_material_assign_att FROM @sql_material_assign_att;
EXECUTE stmt_material_assign_att;
DEALLOCATE PREPARE stmt_material_assign_att;

CREATE TABLE IF NOT EXISTS assignment_submission (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    assignment_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    file_url VARCHAR(1000) NOT NULL,
    cloudinary_public_id VARCHAR(512),
    file_format VARCHAR(20),
    original_file_name VARCHAR(180),
    content_type VARCHAR(100),
    size_bytes BIGINT,
    student_note TEXT,
    deadline_snapshot DATETIME,
    is_late BOOLEAN NOT NULL DEFAULT FALSE,
    score INT,
    teacher_comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_assign_sub_assignment FOREIGN KEY (assignment_id) REFERENCES assignment(id) ON DELETE CASCADE,
    CONSTRAINT fk_assign_sub_student FOREIGN KEY (student_id) REFERENCES `user`(id) ON DELETE CASCADE
);
