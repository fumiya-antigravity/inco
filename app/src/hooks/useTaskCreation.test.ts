import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useTaskCreation } from '../useTaskCreation';
import type { ReactNode } from 'react';

// Mock useApp hook
const mockAddTask = vi.fn();
const mockSetSearchParams = vi.fn();

vi.mock('../../context/AppContext', () => ({
    useApp: () => ({
        addTask: mockAddTask,
        activeProjectId: 1,
        sections: [
            { id: '1', title: '未対応' },
            { id: '2', title: '処理中' },
        ],
    }),
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useSearchParams: () => [new URLSearchParams(), mockSetSearchParams],
    };
});

describe('useTaskCreation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
        <BrowserRouter>{ children } </BrowserRouter>
    );

    it('should create a task with default values', async () => {
        const mockCreatedTask = {
            id: 123,
            title: '',
            status: '未対応',
            priority: '未選択',
            type: '未選択',
        };

        mockAddTask.mockResolvedValue(mockCreatedTask);

        const { result } = renderHook(() => useTaskCreation(), { wrapper });

        await result.current.createTask();

        expect(mockAddTask).toHaveBeenCalledWith(
            expect.objectContaining({
                title: '',
                status: '未対応',
                priority: '未選択',
                type: '未選択',
                completed: false,
                assignees: [],
            })
        );
    });

    it('should create a task with custom overrides', async () => {
        const mockCreatedTask = {
            id: 123,
            title: 'Custom Task',
            status: '処理中',
        };

        mockAddTask.mockResolvedValue(mockCreatedTask);

        const { result } = renderHook(() => useTaskCreation(), { wrapper });

        await result.current.createTask({
            title: 'Custom Task',
            status: '処理中',
            sectionId: '2',
        });

        expect(mockAddTask).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'Custom Task',
                status: '処理中',
                sectionId: '2',
            })
        );
    });

    it('should open detail panel after task creation', async () => {
        const mockCreatedTask = {
            id: 456,
            title: 'New Task',
        };

        mockAddTask.mockResolvedValue(mockCreatedTask);

        const { result } = renderHook(() => useTaskCreation(), { wrapper });

        await result.current.createTask();

        await waitFor(() => {
            expect(mockSetSearchParams).toHaveBeenCalledWith({ task: '456' });
        });
    });

    it('should use first section as default sectionId', async () => {
        mockAddTask.mockResolvedValue({ id: 789 });

        const { result } = renderHook(() => useTaskCreation(), { wrapper });

        await result.current.createTask();

        expect(mockAddTask).toHaveBeenCalledWith(
            expect.objectContaining({
                sectionId: '1', // First section
            })
        );
    });

    it('should handle task creation failure gracefully', async () => {
        mockAddTask.mockResolvedValue(null);

        const { result } = renderHook(() => useTaskCreation(), { wrapper });

        await result.current.createTask();

        // Should not call setSearchParams if task creation fails
        expect(mockSetSearchParams).not.toHaveBeenCalled();
    });

    it('should merge default values with overrides correctly', async () => {
        mockAddTask.mockResolvedValue({ id: 999 });

        const { result } = renderHook(() => useTaskCreation(), { wrapper });

        await result.current.createTask({
            title: 'Override Title',
            priority: '高',
            // Other fields should use defaults
        });

        expect(mockAddTask).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'Override Title',
                priority: '高',
                status: '未対応', // Default
                type: '未選択', // Default
                completed: false, // Default
            })
        );
    });
});
