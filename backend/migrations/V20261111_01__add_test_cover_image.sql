-- Store the optional public cover image for each TOEIC test.
SET @test_cover_image_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'test'
      AND COLUMN_NAME = 'cover_image_url'
);
SET @sql := IF(
    @test_cover_image_exists = 0,
    'ALTER TABLE test ADD COLUMN cover_image_url VARCHAR(2048) NULL AFTER title_test',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
