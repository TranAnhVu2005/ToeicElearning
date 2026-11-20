-- Allow classroom assignments to attach a private PDF material directly without requiring a TOEIC test.
SET @assignment_material_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'assignment'
      AND COLUMN_NAME = 'material_id'
);
SET @sql_material_col := IF(
    @assignment_material_exists = 0,
    'ALTER TABLE assignment ADD COLUMN material_id VARCHAR(36) NULL AFTER test_id',
    'SELECT 1'
);
PREPARE stmt_material_col FROM @sql_material_col;
EXECUTE stmt_material_col;
DEALLOCATE PREPARE stmt_material_col;

SET @assignment_material_fk_exists := (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'assignment'
      AND CONSTRAINT_NAME = 'fk_assign_material'
);
SET @sql_material_fk := IF(
    @assignment_material_fk_exists = 0,
    'ALTER TABLE assignment ADD CONSTRAINT fk_assign_material FOREIGN KEY (material_id) REFERENCES material(id) ON DELETE SET NULL',
    'SELECT 1'
);
PREPARE stmt_material_fk FROM @sql_material_fk;
EXECUTE stmt_material_fk;
DEALLOCATE PREPARE stmt_material_fk;
