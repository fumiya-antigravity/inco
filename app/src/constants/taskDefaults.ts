/**
 * Default values for new tasks
 */
export const TASK_DEFAULTS = {
    STATUS: '未対応',
    PRIORITY: '未選択',
    TYPE: '未選択',
    ASSIGNEES: [],
    DUE: null,
    COMPLETED: false,
    TITLE: '',
    DESCRIPTION: null,
} as const;

/**
 * Sort keys for task list
 */
export type SortKey = 'key' | 'title' | 'assignees' | 'status' | 'priority' | 'type' | 'due' | 'created_at';

export type SortOrder = 'asc' | 'desc';
