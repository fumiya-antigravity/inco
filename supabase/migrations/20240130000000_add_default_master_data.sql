-- Add default priorities and types for all existing projects
-- This migration ensures all projects have the necessary master data

-- Insert default priorities for each project
INSERT INTO task_priorities (project_id, name, position, color)
SELECT 
    p.id as project_id,
    priority_data.name,
    priority_data.position,
    priority_data.color
FROM projects p
CROSS JOIN (
    VALUES 
        ('高', 1, 'rose'),
        ('中', 2, 'amber'),
        ('低', 3, 'blue')
) AS priority_data(name, position, color)
WHERE NOT EXISTS (
    SELECT 1 FROM task_priorities tp 
    WHERE tp.project_id = p.id AND tp.name = priority_data.name
);

-- Insert default types for each project
INSERT INTO task_types (project_id, name, position, icon)
SELECT 
    p.id as project_id,
    type_data.name,
    type_data.position,
    type_data.icon
FROM projects p
CROSS JOIN (
    VALUES 
        ('バグ', 1, 'bug'),
        ('タスク', 2, 'check'),
        ('要望', 3, 'lightbulb'),
        ('その他', 4, 'help-circle')
) AS type_data(name, position, icon)
WHERE NOT EXISTS (
    SELECT 1 FROM task_types tt 
    WHERE tt.project_id = p.id AND tt.name = type_data.name
);
