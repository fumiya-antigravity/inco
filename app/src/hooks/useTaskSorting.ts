import { useState, useMemo } from 'react';
import type { TaskUI } from '../types/task';
import type { SortKey, SortOrder } from '../constants/taskDefaults';

/**
 * Custom hook for task sorting logic
 * Handles sorting state and sorted task computation
 */
export const useTaskSorting = (tasks: TaskUI[], initialSortKey: SortKey = 'created_at', initialSortOrder: SortOrder = 'desc') => {
    const [sortKey, setSortKey] = useState<SortKey>(initialSortKey);
    const [sortOrder, setSortOrder] = useState<SortOrder>(initialSortOrder);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };

    const sortedTasks = useMemo(() => {
        return [...tasks].sort((a, b) => {
            // Keep sections together
            if (a.sectionId !== b.sectionId) {
                return 0;
            }

            // Sort by created_at for newest first
            if (sortKey === 'created_at') {
                const aCreated = new Date(a.created_at || 0).getTime();
                const bCreated = new Date(b.created_at || 0).getTime();
                return sortOrder === 'asc' ? aCreated - bCreated : bCreated - aCreated;
            }

            // Sort by selected key
            let aVal: any = a[sortKey];
            let bVal: any = b[sortKey];

            // Handle array comparison (e.g., assignees)
            if (Array.isArray(aVal)) aVal = aVal[0] || '';
            if (Array.isArray(bVal)) bVal = bVal[0] || '';

            // If values are equal, use created_at as secondary sort (newest first)
            if (aVal === bVal) {
                const aCreated = new Date(a.created_at || 0).getTime();
                const bCreated = new Date(b.created_at || 0).getTime();
                return bCreated - aCreated;
            }

            if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [tasks, sortKey, sortOrder]);

    return {
        sortedTasks,
        sortKey,
        sortOrder,
        handleSort,
    };
};
