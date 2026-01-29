-- 1. Add columns to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS current_task_number INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS icon TEXT;

-- 2. Add Unique Constraints
-- Add unique constraint to projects.key if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_key_key') THEN
        ALTER TABLE projects ADD CONSTRAINT projects_key_key UNIQUE (key);
    END IF;
END $$;

-- Add unique constraint to tasks.key if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tasks_key_key') THEN
        ALTER TABLE tasks ADD CONSTRAINT tasks_key_key UNIQUE (key);
    END IF;
END $$;

-- 3. Create Function for Generating Task Keys with Locking
CREATE OR REPLACE FUNCTION generate_task_key()
RETURNS TRIGGER AS $$
DECLARE
    project_key TEXT;
    new_number INTEGER;
BEGIN
    -- Lock the project record for update to prevent race conditions
    SELECT key, current_task_number + 1
    INTO project_key, new_number
    FROM projects
    WHERE id = NEW.project_id
    FOR UPDATE;

    -- Update the project's current_task_number
    UPDATE projects
    SET current_task_number = new_number
    WHERE id = NEW.project_id;

    -- Set the new task key
    NEW.key := project_key || '-' || new_number;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create Trigger
-- Drop if exists to ensure clean state
DROP TRIGGER IF EXISTS tr_generate_task_key ON tasks;

CREATE TRIGGER tr_generate_task_key
BEFORE INSERT ON tasks
FOR EACH ROW
EXECUTE FUNCTION generate_task_key();
