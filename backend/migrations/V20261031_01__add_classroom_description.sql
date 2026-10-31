-- Apply once to an existing database created before classroom descriptions were added.
-- Fresh databases already include this column in database_script.sql and database_script_20de.sql.
ALTER TABLE classroom
    ADD COLUMN description TEXT NULL AFTER class_name;

-- Rollback (only if the application version no longer uses Classroom.description):
-- ALTER TABLE classroom DROP COLUMN description;
