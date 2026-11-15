-- Store Google Classroom-style theme color and banner image URL for each classroom.
SET @classroom_theme_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'classroom'
      AND COLUMN_NAME = 'theme_color'
);
SET @sql_theme := IF(
    @classroom_theme_exists = 0,
    'ALTER TABLE classroom ADD COLUMN theme_color VARCHAR(32) NULL AFTER class_code',
    'SELECT 1'
);
PREPARE stmt_theme FROM @sql_theme;
EXECUTE stmt_theme;
DEALLOCATE PREPARE stmt_theme;

SET @classroom_banner_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'classroom'
      AND COLUMN_NAME = 'banner_url'
);
SET @sql_banner := IF(
    @classroom_banner_exists = 0,
    'ALTER TABLE classroom ADD COLUMN banner_url VARCHAR(1000) NULL AFTER theme_color',
    'SELECT 1'
);
PREPARE stmt_banner FROM @sql_banner;
EXECUTE stmt_banner;
DEALLOCATE PREPARE stmt_banner;
