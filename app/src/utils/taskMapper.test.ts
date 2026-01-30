import { describe, it, expect } from 'vitest';
import { TaskMapper } from '../taskMapper';
import type { TaskDB, TaskUI } from '../../types/task';

describe('TaskMapper', () => {
    const mockTaskStatuses = [
        { id: 1, name: '未対応', project_id: 1, order: 1, created_at: '', updated_at: '' },
        { id: 2, name: '処理中', project_id: 1, order: 2, created_at: '', updated_at: '' },
        { id: 3, name: '完了', project_id: 1, order: 3, created_at: '', updated_at: '' },
    ];

    const mockTaskPriorities = [
        { id: 1, name: '高', project_id: 1, order: 1, created_at: '', updated_at: '' },
        { id: 2, name: '中', project_id: 1, order: 2, created_at: '', updated_at: '' },
        { id: 3, name: '低', project_id: 1, order: 3, created_at: '', updated_at: '' },
    ];

    const mockTaskTypes = [
        { id: 1, name: 'バグ', project_id: 1, order: 1, created_at: '', updated_at: '' },
        { id: 2, name: '機能', project_id: 1, order: 2, created_at: '', updated_at: '' },
    ];

    const mapper = new TaskMapper(mockTaskStatuses, mockTaskPriorities, mockTaskTypes);

    describe('toUI', () => {
        it('should convert TaskDB to TaskUI correctly', () => {
            const taskDB: TaskDB = {
                id: 1,
                project_id: 1,
                parent_id: null,
                section_id: 2,
                key: 'TASK-1',
                title: 'Test Task',
                description: 'Test Description',
                status_id: 1,
                priority_id: 2,
                type_id: 1,
                due_date: '2024-12-31',
                completed: false,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
                activities: [],
            };

            const taskUI = mapper.toUI(taskDB);

            expect(taskUI).toEqual({
                ...taskDB,
                projectIds: [1],
                sectionId: '2',
                due: '2024-12-31',
                assignees: [],
                status: '未対応',
                priority: '中',
                type: 'バグ',
            });
        });

        it('should handle null values correctly', () => {
            const taskDB: TaskDB = {
                id: 1,
                project_id: 1,
                parent_id: null,
                section_id: null,
                key: 'TASK-1',
                title: 'Test Task',
                description: null,
                status_id: 1,
                priority_id: null,
                type_id: null,
                due_date: null,
                completed: false,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
                activities: [],
            };

            const taskUI = mapper.toUI(taskDB);

            expect(taskUI.sectionId).toBe('1');
            expect(taskUI.due).toBeNull();
            expect(taskUI.priority).toBe('未選択');
            expect(taskUI.type).toBe('未選択');
        });
    });

    describe('toDB', () => {
        it('should convert TaskUI to CreateTaskPayload correctly', () => {
            const taskUI: Partial<TaskUI> = {
                title: 'New Task',
                description: 'New Description',
                projectIds: [1],
                sectionId: '2',
                status: '処理中',
                priority: '高',
                type: '機能',
                due: '2024-12-31',
                completed: false,
            };

            const payload = mapper.toDB(taskUI);

            expect(payload).toEqual({
                title: 'New Task',
                description: 'New Description',
                project_id: 1,
                section_id: 2,
                status_id: 2,
                priority_id: 1,
                type_id: 2,
                due_date: '2024-12-31',
                completed: false,
                parent_id: null,
                assignee_id: null,
            });
        });

        it('should handle 未選択 values correctly', () => {
            const taskUI: Partial<TaskUI> = {
                title: 'New Task',
                projectIds: [1],
                priority: '未選択',
                type: '未選択',
            };

            const payload = mapper.toDB(taskUI);

            expect(payload.priority_id).toBeNull();
            expect(payload.type_id).toBeNull();
        });
    });

    describe('createTempTask', () => {
        it('should create a temporary task with default values', () => {
            const tempId = 12345;
            const overrides: Partial<TaskUI> = {
                title: 'Temp Task',
                sectionId: '3',
            };

            const tempTask = mapper.createTempTask(overrides, tempId);

            expect(tempTask.id).toBe(tempId);
            expect(tempTask.title).toBe('Temp Task');
            expect(tempTask.sectionId).toBe('3');
            expect(tempTask.status).toBe('未対応');
            expect(tempTask.priority).toBe('未選択');
            expect(tempTask.type).toBe('未選択');
            expect(tempTask.completed).toBe(false);
            expect(tempTask.assignees).toEqual([]);
        });
    });
});
