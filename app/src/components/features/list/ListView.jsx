import React, { useState, useMemo } from 'react';
import {
    ChevronDown, Plus, User, MoreHorizontal, Calendar, CheckCircle2, ChevronUp
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import {
    TypeSelector, PrioritySelector, StatusSelector, InlineTaskCreator, CompletionCheckButton, AssigneeSelector
} from '../task/SharedComponents';
import { useSearchParams } from 'react-router-dom';

const SortableHeader = ({ label, sortKey, width, currentSortKey, sortOrder, onSort, centered = false }) => (
    <th
        className={`p-4 font-bold text-slate-500 dark:text-slate-400 cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors ${width}`}
        onClick={() => onSort(sortKey)}
    >
        <div className={`flex items-center gap-1 ${centered ? 'justify-center' : ''}`}>
            {label}
            {currentSortKey === sortKey && (
                sortOrder === 'asc' ? <ChevronUp size={14} className="text-emerald-500" /> : <ChevronDown size={14} className="text-emerald-500" />
            )}
        </div>
    </th>
);

const ListView = () => {
    const {
        sections, currentProjectTasks, updateTask, addTask, activeProjectId, toggleTaskCompletion
    } = useApp();
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedTaskId = searchParams.get('task') ? parseInt(searchParams.get('task')) : null;

    const [draggedTaskId, setDraggedTaskId] = useState(null);
    const [dragOverSectionId, setDragOverSectionId] = useState(null);
    const [creatingTaskId, setCreatingTaskId] = useState(null);
    const [editingTaskId, setEditingTaskId] = useState(null);

    // Default sort by created_at descending (newest first)
    const [sortKey, setSortKey] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };

    const sortedTasks = useMemo(() => {
        return [...currentProjectTasks].sort((a, b) => {
            // First, sort by section to keep sections together
            if (a.sectionId !== b.sectionId) {
                return 0; // Let sections maintain their order
            }

            // Within the same section, always prioritize created_at for newest first
            // unless user explicitly sorts by another field
            if (sortKey === 'created_at') {
                const aCreated = new Date(a.created_at || 0).getTime();
                const bCreated = new Date(b.created_at || 0).getTime();
                return sortOrder === 'asc' ? aCreated - bCreated : bCreated - aCreated;
            }

            // For other sort keys, use the selected field
            let aVal = a[sortKey];
            let bVal = b[sortKey];

            // Handle array comparison (e.g., assignees)
            if (Array.isArray(aVal)) aVal = aVal[0] || '';
            if (Array.isArray(bVal)) bVal = bVal[0] || '';

            // If values are equal, use created_at as secondary sort (newest first)
            if (aVal === bVal) {
                const aCreated = new Date(a.created_at || 0).getTime();
                const bCreated = new Date(b.created_at || 0).getTime();
                return bCreated - aCreated; // Descending (newest first)
            }

            if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [currentProjectTasks, sortKey, sortOrder]);

    // Inline Create Handlers (Duplicated from Board for now, ideal to extract logic hook)
    const startInlineCreate = async (sectionId) => {
        const tempId = Date.now();
        const newTask = {
            id: tempId,
            projectIds: [activeProjectId],
            sectionId: sectionId,
            key: 'NEW',
            title: '',
            assignees: [],
            status: '未対応', // Fixed to always use '未対応'
            completed: false,
            priority: '未選択',
            type: '未選択',
            due: '',
            isTemp: true
        };
        const createdTask = await addTask(newTask);
        // Use the actual task ID if available, otherwise use tempId
        const taskId = createdTask?.id || tempId;
        setSearchParams({ task: taskId.toString() }); // Open detail panel
    };

    const handleTaskCreateUpdate = (id, title) => {
        updateTask(id, 'title', title);
    };

    const handleTaskCreateBlur = (id) => {
        const task = currentProjectTasks.find(t => t.id === id);
        // Clean up logic...
        setCreatingTaskId(null);
    };

    const handleTaskClick = (task) => {
        setSearchParams({ task: task.id.toString() });
    };

    const hasAnyTasks = sortedTasks.length > 0;

    // DnD Handlers
    const handleDragStart = (e, taskId) => {
        setDraggedTaskId(taskId);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e, sectionId) => {
        e.preventDefault();
        setDragOverSectionId(sectionId);
    };

    const handleDrop = (e, sectionId) => {
        e.preventDefault();
        setDragOverSectionId(null);
        if (draggedTaskId) {
            updateTask(draggedTaskId, 'sectionId', sectionId);
            setDraggedTaskId(null);
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-700 overflow-hidden flex-1 flex flex-col h-full animate-in fade-in duration-300 mx-4 mb-4 md:mx-6 md:mb-6">
            <div className="overflow-x-auto h-full">
                <table className="w-full text-sm text-left whitespace-nowrap table-fixed">
                    <thead className="bg-slate-50 dark:bg-zinc-900/50 sticky top-0 z-10 border-b border-slate-200 dark:border-zinc-700 shadow-sm">
                        <tr className="group">
                            <th className="p-4 w-12 border-b border-slate-200 dark:border-zinc-700"></th>
                            <SortableHeader label="キー" sortKey="key" width="w-20" currentSortKey={sortKey} sortOrder={sortOrder} onSort={handleSort} />
                            <SortableHeader label="タスク名" sortKey="title" width="w-[400px]" currentSortKey={sortKey} sortOrder={sortOrder} onSort={handleSort} />
                            <SortableHeader label="担当者" sortKey="assignee" width="w-40" currentSortKey={sortKey} sortOrder={sortOrder} onSort={handleSort} centered={true} />
                            <SortableHeader label="種別" sortKey="type" width="w-28" currentSortKey={sortKey} sortOrder={sortOrder} onSort={handleSort} centered={true} />
                            <SortableHeader label="ステータス" sortKey="status" width="w-36" currentSortKey={sortKey} sortOrder={sortOrder} onSort={handleSort} centered={true} />
                            <SortableHeader label="優先度" sortKey="priority" width="w-32" currentSortKey={sortKey} sortOrder={sortOrder} onSort={handleSort} centered={true} />
                            <SortableHeader label="期限日" sortKey="due" width="w-36" currentSortKey={sortKey} sortOrder={sortOrder} onSort={handleSort} centered={true} />
                            <th className="p-4 w-12 border-b border-slate-200 dark:border-zinc-700"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-700/50 overflow-y-auto">
                        {sections.map((section) => {
                            const sectionTasks = sortedTasks.filter(task => task.sectionId === section.id);
                            const isCreating = typeof creatingTaskId === 'number' && currentProjectTasks.find(t => t.id === creatingTaskId)?.sectionId === section.id;

                            return (
                                <React.Fragment key={section.id}>
                                    {/* Section Header */}
                                    <tr
                                        className={`border-y border-slate-200 dark:border-zinc-700 transition-colors group/section
                        ${dragOverSectionId === section.id
                                                ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200'
                                                : 'bg-slate-50/80 dark:bg-zinc-900/80'
                                            }
                      `}
                                        onDragOver={(e) => handleDragOver(e, section.id)}
                                        onDrop={(e) => handleDrop(e, section.id)}
                                    >
                                        <td colSpan="9" className="py-2 px-4">
                                            <div className="flex items-center gap-2">
                                                <button className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg transition-colors">
                                                    <ChevronDown size={14} className="text-slate-500" />
                                                </button>
                                                <div className={`w-2.5 h-2.5 rounded-full ${section.title === '未対応' ? 'bg-slate-400' :
                                                    section.title === '処理中' ? 'bg-blue-500' : 'bg-emerald-500'
                                                    }`} />
                                                <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">{section.title}</span>
                                                <span className="text-slate-400 text-xs ml-1 font-medium">({sectionTasks.length})</span>

                                                <button
                                                    onClick={() => startInlineCreate(section.id)}
                                                    className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors ml-1 opacity-0 group-hover/section:opacity-100"
                                                    title={`${section.title}にタスクを追加`}
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Inline Creator Row */}
                                    {isCreating && (
                                        <tr className="bg-emerald-50/30 dark:bg-emerald-900/10">
                                            <td className="p-4" colSpan="9">
                                                <InlineTaskCreator task={currentProjectTasks.find(t => t.id === creatingTaskId)} onUpdate={handleTaskCreateUpdate} onBlur={handleTaskCreateBlur} />
                                            </td>
                                        </tr>
                                    )}

                                    {/* Task Rows */}
                                    {sectionTasks.map((task) => (
                                        <tr
                                            key={task.id}
                                            data-task-row="true" // Identifier for click-outside logic
                                            draggable={creatingTaskId !== task.id && editingTaskId !== task.id}
                                            onDragStart={(e) => handleDragStart(e, task.id)}
                                            onDragOver={(e) => handleDragOver(e, section.id)}
                                            onDrop={(e) => handleDrop(e, section.id)}
                                            className={`transition-colors group cursor-default border-l-4
                          ${creatingTaskId === task.id ? 'bg-white dark:bg-zinc-800 border-emerald-500' : 'border-transparent'}
                          ${draggedTaskId === task.id ? 'opacity-30 bg-slate-50' : 'opacity-100'}
                          ${dragOverSectionId === section.id && creatingTaskId !== task.id ? 'hover:bg-emerald-50 dark:hover:bg-emerald-900/10' : ''}
                          ${selectedTaskId === task.id ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'}
                        `}
                                            onClick={() => {
                                                if (creatingTaskId !== task.id && editingTaskId !== task.id) handleTaskClick(task);
                                            }}
                                        >
                                            {creatingTaskId === task.id ? (
                                                <td colSpan="9" className="p-2">
                                                    <InlineTaskCreator task={task} onUpdate={handleTaskCreateUpdate} onBlur={handleTaskCreateBlur} />
                                                </td>
                                            ) : (
                                                <>
                                                    <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                        <CompletionCheckButton
                                                            isCompleted={task.status === '完了'}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleTaskCompletion(task.id);
                                                            }}
                                                        />
                                                    </td>
                                                    <td className="p-4 font-mono text-slate-500 dark:text-slate-400 text-xs cursor-grab active:cursor-grabbing text-center truncate">{task.key}</td>
                                                    <td className="p-4">
                                                        {/* Removed onClick stopPropagation from TD to allow cell padding click to open detail */}
                                                        {editingTaskId === task.id ? (
                                                            <div onClick={(e) => e.stopPropagation()} className="w-full">
                                                                <input
                                                                    autoFocus
                                                                    type="text"
                                                                    value={task.title}
                                                                    className="w-[75%] bg-white dark:bg-zinc-800 border-none rounded focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 dark:text-slate-100 px-1 py-0.5"
                                                                    onChange={(e) => {
                                                                        updateTask(task.id, 'title', e.target.value);
                                                                    }}
                                                                    onBlur={(e) => {
                                                                        // updateTask is already called by onChange.
                                                                        // Just close edit mode.
                                                                        setEditingTaskId(null);
                                                                    }}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            e.currentTarget.blur();
                                                                        }
                                                                        if (e.key === 'Escape') {
                                                                            setEditingTaskId(null);
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <span
                                                                // Edit trigger
                                                                onClick={(e) => {
                                                                    // Enable inline editing mode
                                                                    setEditingTaskId(task.id);
                                                                    // Also let the row click handler open the detail panel
                                                                }}
                                                                className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors block w-fit max-w-full truncate cursor-text hover:underline decoration-dashed underline-offset-4 decoration-slate-300"
                                                            >
                                                                {task.title || <span className="text-slate-400 italic">無題</span>}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                                                            <AssigneeSelector task={task} />
                                                        </div>
                                                    </td>
                                                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex justify-center">
                                                            <TypeSelector task={task} />
                                                        </div>
                                                    </td>
                                                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex justify-center">
                                                            <StatusSelector task={task} />
                                                        </div>
                                                    </td>
                                                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex justify-center">
                                                            <PrioritySelector task={task} />
                                                        </div>
                                                    </td>
                                                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex items-center justify-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
                                                            <Calendar size={14} className="opacity-70" /> {task.due}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <button className="text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400">
                                                            <MoreHorizontal size={16} />
                                                        </button>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}

                                    {/* Empty Drop Zone Row */}
                                    {sectionTasks.length === 0 && (
                                        <tr
                                            className="bg-white dark:bg-zinc-800 h-12"
                                            onDragOver={(e) => handleDragOver(e, section.id)}
                                            onDrop={(e) => handleDrop(e, section.id)}
                                        >
                                            <td colSpan="9" className="p-4 text-center text-slate-300 dark:text-slate-600 border-dashed border-b border-slate-100 dark:border-zinc-800 text-xs italic">
                                                タスクをここにドロップ
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>

                {!hasAnyTasks && !creatingTaskId && (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 py-12">
                        <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-full mb-3"><CheckCircle2 size={32} className="opacity-50" /></div>
                        <p>このプロジェクトにはまだタスクがありません</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ListView;
