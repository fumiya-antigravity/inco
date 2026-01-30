import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { TASK_DEFAULTS } from '../constants/taskDefaults';
import type { TaskUI } from '../types/task';

/**
 * Custom hook for task creation logic
 * Centralizes task creation to avoid duplication across components
 */
export const useTaskCreation = () => {
    const { addTask, activeProjectId, sections } = useApp();
    const [, setSearchParams] = useSearchParams();

    /**
     * Create a new task with default values
     * @param overrides - Partial task data to override defaults
     * @returns The created task or null if creation failed
     */
    const createTask = useCallback(async (overrides: Partial<TaskUI> = {}) => {
        if (!activeProjectId) {
            console.error('No active project');
            return null;
        }

        const defaultTask: Partial<TaskUI> = {
            projectIds: [activeProjectId],
            sectionId: overrides.sectionId || sections[0]?.id || '1',
            title: TASK_DEFAULTS.TITLE,
            assignees: [...TASK_DEFAULTS.ASSIGNEES],
            status: TASK_DEFAULTS.STATUS,
            priority: TASK_DEFAULTS.PRIORITY,
            type: TASK_DEFAULTS.TYPE,
            due: TASK_DEFAULTS.DUE,
            completed: TASK_DEFAULTS.COMPLETED,
            ...overrides,
        };

        const createdTask = await addTask(defaultTask);

        if (createdTask) {
            // Open detail panel for the newly created task
            setSearchParams({ task: createdTask.id.toString() });
        }

        return createdTask;
    }, [addTask, activeProjectId, sections, setSearchParams]);

    return { createTask };
};
