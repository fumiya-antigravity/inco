import type { TaskDB, TaskUI, TaskStatus, TaskPriority, TaskType, CreateTaskPayload } from '../types/task';

/**
 * TaskMapper handles conversion between database and UI task representations
 */
export class TaskMapper {
    constructor(
        private statuses: TaskStatus[],
        private priorities: TaskPriority[],
        private types: TaskType[]
    ) { }

    /**
     * Convert database task to UI task
     */
    toUI(dbTask: TaskDB): TaskUI {
        const status = this.statuses.find(s => s.id === dbTask.status_id);
        const priority = this.priorities.find(p => p.id === dbTask.priority_id);
        const type = this.types.find(t => t.id === dbTask.type_id);

        return {
            id: dbTask.id,
            projectIds: [dbTask.project_id],
            sectionId: dbTask.section_id?.toString() || '1',
            parentId: dbTask.parent_id,
            key: dbTask.key,
            title: dbTask.title,
            description: dbTask.description,
            assignees: [], // TODO: Implement assignee mapping
            status: status?.name || '未対応',
            priority: priority?.name || '未選択',
            type: type?.name || '未選択',
            due: dbTask.due_date,
            completed: dbTask.completed,
            created_at: dbTask.created_at,
            activities: dbTask.activities,
        };
    }

    /**
     * Convert UI task to database payload
     */
    toDB(uiTask: Partial<TaskUI>): Partial<CreateTaskPayload> {
        const status = this.statuses.find(s => s.name === uiTask.status);
        const priority = this.priorities.find(p => p.name === uiTask.priority);
        const type = this.types.find(t => t.name === uiTask.type);

        return {
            project_id: uiTask.projectIds?.[0],
            section_id: uiTask.sectionId ? parseInt(uiTask.sectionId) : null,
            parent_id: uiTask.parentId,
            title: uiTask.title || '',
            description: uiTask.description,
            status_id: status?.id || this.statuses[0]?.id,
            priority_id: uiTask.priority === '未選択' ? null : priority?.id,
            type_id: uiTask.type === '未選択' ? null : type?.id,
            due_date: uiTask.due,
            completed: uiTask.completed,
        };
    }

    /**
     * Create a temporary UI task for optimistic updates
     */
    createTempTask(partial: Partial<TaskUI>, tempId: number): TaskUI {
        return {
            id: tempId,
            projectIds: partial.projectIds || [],
            sectionId: partial.sectionId || '1',
            key: 'Generating...',
            title: partial.title || '',
            assignees: partial.assignees || [],
            status: partial.status || '未対応',
            priority: partial.priority || '未選択',
            type: partial.type || '未選択',
            due: partial.due || null,
            completed: partial.completed || false,
            created_at: new Date().toISOString(),
            isTemp: true,
            ...partial,
        };
    }
}
