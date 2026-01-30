import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTaskSorting } from '../useTaskSorting';
import type { TaskUI } from '../../types/task';

describe('useTaskSorting', () => {
    const mockTasks: TaskUI[] = [
        {
            id: 1,
            project_id: 1,
            projectIds: [1],
            sectionId: '1',
            parent_id: null,
            section_id: 1,
            key: 'TASK-1',
            title: 'Task A',
            description: null,
            status_id: 1,
            status: '未対応',
            priority_id: 1,
            priority: '高',
            type_id: 1,
            type: 'バグ',
            due_date: '2024-12-31',
            due: '2024-12-31',
            completed: false,
            assignees: [],
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            activities: [],
        },
        {
            id: 2,
            project_id: 1,
            projectIds: [1],
            sectionId: '1',
            parent_id: null,
            section_id: 1,
            key: 'TASK-2',
            title: 'Task B',
            description: null,
            status_id: 1,
            status: '未対応',
            priority_id: 2,
            priority: '中',
            type_id: 1,
            type: 'バグ',
            due_date: '2024-11-30',
            due: '2024-11-30',
            completed: false,
            assignees: [],
            created_at: '2024-01-02T00:00:00Z',
            updated_at: '2024-01-02T00:00:00Z',
            activities: [],
        },
        {
            id: 3,
            project_id: 1,
            projectIds: [1],
            sectionId: '2',
            parent_id: null,
            section_id: 2,
            key: 'TASK-3',
            title: 'Task C',
            description: null,
            status_id: 2,
            status: '処理中',
            priority_id: 3,
            priority: '低',
            type_id: 2,
            type: '機能',
            due_date: null,
            due: null,
            completed: false,
            assignees: [],
            created_at: '2024-01-03T00:00:00Z',
            updated_at: '2024-01-03T00:00:00Z',
            activities: [],
        },
    ];

    it('should initialize with default sort (created_at desc)', () => {
        const { result } = renderHook(() => useTaskSorting(mockTasks));

        expect(result.current.sortKey).toBe('created_at');
        expect(result.current.sortOrder).toBe('desc');
        expect(result.current.sortedTasks).toHaveLength(3);
        // Newest first
        expect(result.current.sortedTasks[0].id).toBe(3);
        expect(result.current.sortedTasks[1].id).toBe(2);
        expect(result.current.sortedTasks[2].id).toBe(1);
    });

    it('should sort by title ascending', () => {
        const { result } = renderHook(() => useTaskSorting(mockTasks));

        act(() => {
            result.current.handleSort('title');
        });

        expect(result.current.sortKey).toBe('title');
        expect(result.current.sortOrder).toBe('asc');
        expect(result.current.sortedTasks[0].title).toBe('Task A');
        expect(result.current.sortedTasks[1].title).toBe('Task B');
        expect(result.current.sortedTasks[2].title).toBe('Task C');
    });

    it('should toggle sort order when clicking same key', () => {
        const { result } = renderHook(() => useTaskSorting(mockTasks));

        act(() => {
            result.current.handleSort('title');
        });
        expect(result.current.sortOrder).toBe('asc');

        act(() => {
            result.current.handleSort('title');
        });
        expect(result.current.sortOrder).toBe('desc');
        expect(result.current.sortedTasks[0].title).toBe('Task C');
    });

    it('should sort by priority', () => {
        const { result } = renderHook(() => useTaskSorting(mockTasks));

        act(() => {
            result.current.handleSort('priority');
        });

        expect(result.current.sortKey).toBe('priority');
        // 低 < 中 < 高 (ascending)
        expect(result.current.sortedTasks[0].priority).toBe('低');
        expect(result.current.sortedTasks[1].priority).toBe('中');
        expect(result.current.sortedTasks[2].priority).toBe('高');
    });

    it('should use created_at as secondary sort', () => {
        const tasksWithSamePriority: TaskUI[] = [
            { ...mockTasks[0], priority: '高', created_at: '2024-01-01T00:00:00Z' },
            { ...mockTasks[1], priority: '高', created_at: '2024-01-03T00:00:00Z' },
            { ...mockTasks[2], priority: '高', created_at: '2024-01-02T00:00:00Z' },
        ];

        const { result } = renderHook(() => useTaskSorting(tasksWithSamePriority));

        act(() => {
            result.current.handleSort('priority');
        });

        // Same priority, so should sort by created_at desc (newest first)
        expect(result.current.sortedTasks[0].created_at).toBe('2024-01-03T00:00:00Z');
        expect(result.current.sortedTasks[1].created_at).toBe('2024-01-02T00:00:00Z');
        expect(result.current.sortedTasks[2].created_at).toBe('2024-01-01T00:00:00Z');
    });

    it('should keep sections together', () => {
        const { result } = renderHook(() => useTaskSorting(mockTasks));

        act(() => {
            result.current.handleSort('title');
        });

        // Tasks in section 1 should come before tasks in section 2
        const section1Tasks = result.current.sortedTasks.filter(t => t.sectionId === '1');
        const section2Tasks = result.current.sortedTasks.filter(t => t.sectionId === '2');

        expect(section1Tasks).toHaveLength(2);
        expect(section2Tasks).toHaveLength(1);
    });

    it('should handle custom initial sort', () => {
        const { result } = renderHook(() =>
            useTaskSorting(mockTasks, 'priority', 'asc')
        );

        expect(result.current.sortKey).toBe('priority');
        expect(result.current.sortOrder).toBe('asc');
    });
});
