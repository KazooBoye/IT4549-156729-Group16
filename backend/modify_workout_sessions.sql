ALTER TABLE workout_sessions
ADD COLUMN session_name VARCHAR(255) NULL,
ADD COLUMN completion_percentage INTEGER NULL CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
ADD COLUMN trainer_notes_on_completion TEXT NULL;

-- Optional: Add a comment to describe the new columns if your RDBMS supports it (PostgreSQL example)
COMMENT ON COLUMN workout_sessions.session_name IS 'Tên buổi tập';
COMMENT ON COLUMN workout_sessions.completion_percentage IS 'Mức độ tham gia - percentage';
COMMENT ON COLUMN workout_sessions.trainer_notes_on_completion IS 'Mức độ tham gia - Huấn luyện viên nhận xét';
