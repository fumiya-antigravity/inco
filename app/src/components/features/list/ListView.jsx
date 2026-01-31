import React, { useState } from 'react';
import {
    ChevronDown, Plus, User, Calendar, CheckCircle2, ChevronUp, ChevronRight, Pencil, Trash2, MoreVertical
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import {
    TypeSelector, PrioritySelector, StatusSelector, InlineTaskCreator, CompletionCheckButton, AssigneeSelector
} from '../task/SharedComponents';
import { useSearchParams } from 'react-router-dom';
import { useTaskSorting } from '../../../hooks/useTaskSorting';
import { useTaskCreation } from '../../../hooks/useTaskCreation';

const SortableHeader = ({ label, sortKey, width, currentSortKey, sortOrder, onSort, centered = false }) => (
    <th
        className={`p-4 font-bold text-slate-500 cursor-pointer hover:bg-slate-100:bg-zinc-800 transition-colors border-b border-slate-200 ${width}`}
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
        sections, currentProjectTasks, updateTask, toggleTaskCompletion, updateSection, deleteSection
    } = useApp();
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedTaskId = searchParams.get('task') ? parseInt(searchParams.get('task')) : null;

    const [draggedTaskId, setDraggedTaskId] = useState(null);
    const [dragOverSectionId, setDragOverSectionId] = useState(null);
    const [creatingTaskId, setCreatingTaskId] = useState(null);

    // Section Management State
    const [collapsedSections, setCollapsedSections] = useState({});
    const [editingSectionId, setEditingSectionId] = useState(null);
    const [menuOpenSectionId, setMenuOpenSectionId] = useState(null);

    const toggleSection = (sectionId) => {
        setCollapsedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const handleSectionEdit = async (id, newTitle) => {
        if (!newTitle.trim()) return;
        await updateSection(id, newTitle);
        setEditingSectionId(null);
    };

    const handleSectionDelete = async (id) => {
        const hasTasks = currentProjectTasks.some(t => t.sectionId === id);
        if (hasTasks) {
            // Find fallback section (first one that is not the deleted one)
            const fallbackSection = sections.find(s => s.id !== id);
            if (!fallbackSection) {
                alert('削除できる他のセクションがありません。');
                return;
            }

            const confirmMessage = `このセクションにはタスクが含まれています。\n削除すると、タスクは「${fallbackSection.title}」に移動されます。\nよろしいですか？`;
            if (!window.confirm(confirmMessage)) return;

            await deleteSection(id, fallbackSection.id);
        } else {
            if (!window.confirm('このセクションを削除しますか？')) return;
            await deleteSection(id);
        }
        setMenuOpenSectionId(null);
    };

    // Use custom hooks
    const { sortedTasks, sortKey, sortOrder, handleSort } = useTaskSorting(
        currentProjectTasks,
        'created_at',
        'desc'
    );
    const { createTask } = useTaskCreation();

    // Inline Create Handler using custom hook
    const startInlineCreate = async (sectionId) => {
        await createTask({
            sectionId: sectionId
        });
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
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col h-full animate-in fade-in duration-300 mx-4 mb-4 md:mx-6 md:mb-6">
            <div className="overflow-x-auto h-full">
                <table className="w-full text-sm text-left whitespace-nowrap table-fixed">
                    <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200 shadow-sm">
                        <tr className="group">
                            <th className="p-4 w-12 border-b border-slate-200"></th>
                            <SortableHeader label="キー" sortKey="key" width="w-20" currentSortKey={sortKey} sortOrder={sortOrder} onSort={handleSort} />
                            <SortableHeader label="タスク名" sortKey="title" width="w-[400px]" currentSortKey={sortKey} sortOrder={sortOrder} onSort={handleSort} />
                            <SortableHeader label="担当者" sortKey="assignee" width="w-40" currentSortKey={sortKey} sortOrder={sortOrder} onSort={handleSort} centered={true} />
                            <SortableHeader label="種別" sortKey="type" width="w-28" currentSortKey={sortKey} sortOrder={sortOrder} onSort={handleSort} centered={true} />
                            <SortableHeader label="ステータス" sortKey="status" width="w-36" currentSortKey={sortKey} sortOrder={sortOrder} onSort={handleSort} centered={true} />
                            <SortableHeader label="優先度" sortKey="priority" width="w-32" currentSortKey={sortKey} sortOrder={sortOrder} onSort={handleSort} centered={true} />
                            <SortableHeader label="期限日" sortKey="due" width="w-36" currentSortKey={sortKey} sortOrder={sortOrder} onSort={handleSort} centered={true} />
                            <th className="p-4 w-12 border-b border-slate-200"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 overflow-y-auto">
                        {sections.map((section) => {
                            const sectionTasks = sortedTasks.filter(task => task.sectionId === section.id);
                            const isCreating = typeof creatingTaskId === 'number' && currentProjectTasks.find(t => t.id === creatingTaskId)?.sectionId === section.id;

                            return (
                                <React.Fragment key={section.id}>
                                    {/* Section Header */}
                                    <tr
                                        className={`border-y border-slate-200 transition-colors group/section
                                            ${dragOverSectionId === section.id
                                                ? 'bg-emerald-50 border-emerald-200'
                                                : 'bg-slate-50/80'
                                            }
                                        `}
                                        onDragOver={(e) => handleDragOver(e, section.id)}
                                        onDrop={(e) => handleDrop(e, section.id)}
                                    >
                                        <td colSpan="9" className="py-2 px-4">
                                            <div className="flex items-center gap-2 group/header">
                                                <button
                                                    onClick={() => toggleSection(section.id)}
                                                    className="p-1 hover:bg-slate-200:bg-zinc-700 rounded-lg transition-colors"
                                                >
                                                    {collapsedSections[section.id] ? (
                                                        <ChevronRight size={14} className="text-slate-500" />
                                                    ) : (
                                                        <ChevronDown size={14} className="text-slate-500" />
                                                    )}
                                                </button>

                                                {/* Color Indicator */}
                                                <div className={`w-2.5 h-2.5 rounded-full ${section.title === '未対応' ? 'bg-slate-400' :
                                                        section.title === '処理中' ? 'bg-blue-500' :
                                                            section.title === '完了' ? 'bg-emerald-500' : 'bg-slate-300'
                                                    }`} />

                                                {/* Title (Editable) */}
                                                {editingSectionId === section.id ? (
                                                    <input
                                                        autoFocus
                                                        type="text"
                                                        defaultValue={section.title}
                                                        className="text-sm font-bold text-slate-700 bg-white border border-emerald-500 rounded px-1 py-0.5 outline-none"
                                                        onBlur={(e) => handleSectionEdit(section.id, e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleSectionEdit(section.id, e.target.value);
                                                            if (e.key === 'Escape') setEditingSectionId(null);
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                ) : (
                                                    <span
                                                        className="font-bold text-slate-700 text-sm cursor-pointer hover:underline decoration-slate-300 underline-offset-4"
                                                        onClick={() => setEditingSectionId(section.id)}
                                                    >
                                                        {section.title}
                                                    </span>
                                                )}

                                                <span className="text-slate-400 text-xs ml-1 font-medium">({sectionTasks.length})</span>

                                                <button
                                                    onClick={() => startInlineCreate(section.id)}
                                                    className="p-1 hover:bg-slate-200:bg-zinc-700 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors ml-1 opacity-0 group-hover/header:opacity-100"
                                                    title={`${section.title}にタスクを追加`}
                                                >
                                                    <Plus size={16} />
                                                </button>

                                                {/* Section Menu */}
                                                <div className="relative ml-auto opacity-0 group-hover/header:opacity-100">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setMenuOpenSectionId(menuOpenSectionId === section.id ? null : section.id);
                                                        }}
                                                        className="p-1 hover:bg-slate-200 rounded text-slate-400"
                                                    >
                                                        <MoreVertical size={14} />
                                                    </button>

                                                    {menuOpenSectionId === section.id && (
                                                        <>
                                                            <div
                                                                className="fixed inset-0 z-40"
                                                                onClick={(e) => { e.stopPropagation(); setMenuOpenSectionId(null); }}
                                                            />
                                                            <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded shadow-xl border border-slate-200 z-50 py-1">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setEditingSectionId(section.id);
                                                                        setMenuOpenSectionId(null);
                                                                    }}
                                                                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs hover:bg-slate-50 text-slate-700"
                                                                >
                                                                    <Pencil size={12} /> 名称変更
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleSectionDelete(section.id);
                                                                    }}
                                                                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs hover:bg-red-50 text-red-600"
                                                                >
                                                                    <Trash2 size={12} /> 削除
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Inline Creator Row */}
                                    {!collapsedSections[section.id] && isCreating && (
                                        <tr className="bg-emerald-50/30">
                                            <td className="p-4" colSpan="9">
                                                <InlineTaskCreator task={currentProjectTasks.find(t => t.id === creatingTaskId)} onUpdate={handleTaskCreateUpdate} onBlur={handleTaskCreateBlur} />
                                            </td>
                                        </tr>
                                    )}

                                    {/* Task Rows */}
                                    {!collapsedSections[section.id] && sectionTasks.map((task) => (
                                        <tr
                                            key={task.id}
                                            data-task-row="true"
                                            draggable={creatingTaskId !== task.id}
                                            onDragStart={(e) => handleDragStart(e, task.id)}
                                            onDragOver={(e) => handleDragOver(e, section.id)}
                                            onDrop={(e) => handleDrop(e, section.id)}
                                            className={`transition-colors group cursor-default border-l-4
                                                ${creatingTaskId === task.id ? 'bg-white border-emerald-500' : 'border-transparent'}
                                                ${draggedTaskId === task.id ? 'opacity-30 bg-slate-50' : 'opacity-100'}
                                                ${dragOverSectionId === section.id && creatingTaskId !== task.id ? 'hover:bg-emerald-50:bg-emerald-900/10' : ''}
                                                ${selectedTaskId === task.id ? 'bg-emerald-50/50' : 'hover:bg-slate-50:bg-slate-700/30'}
                                            `}
                                            onClick={() => {
                                                if (creatingTaskId !== task.id) handleTaskClick(task);
                                            }}
                                        >
                                            {creatingTaskId === task.id ? (
                                                <td colSpan="9" className="p-2">
                                                    <InlineTaskCreator task={task} onUpdate={handleTaskCreateUpdate} onBlur={handleTaskCreateBlur} />
                                                </td>
                                            ) : (
                                                <>
                                                    <td className="p-4 text-center">
                                                        <CompletionCheckButton
                                                            isCompleted={task.status === '完了'}
                                                            onClick={() => toggleTaskCompletion(task.id)}
                                                        />
                                                    </td>
                                                    <td className="p-4 font-mono text-slate-500 text-xs cursor-grab active:cursor-grabbing text-center truncate">{task.key}</td>
                                                    <td className="p-4">
                                                        <span className="font-bold text-slate-700 group-hover:text-emerald-600:text-emerald-400 transition-colors block w-fit max-w-full truncate">
                                                            {task.title || <span className="text-slate-400 italic">無題</span>}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <div className="flex justify-center">
                                                            <AssigneeSelector task={task} />
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex justify-center">
                                                            <TypeSelector task={task} />
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex justify-center">
                                                            <StatusSelector task={task} />
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex justify-center">
                                                            <PrioritySelector task={task} />
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center justify-center gap-1.5 text-slate-500 text-xs">
                                                            <Calendar size={14} className="opacity-70" /> {task.due}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        {/* Three dots removed */}
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}

                                    {/* Empty Drop Zone Row */}
                                    {!collapsedSections[section.id] && sectionTasks.length === 0 && (
                                        <tr
                                            className="bg-white h-12"
                                            onDragOver={(e) => handleDragOver(e, section.id)}
                                            onDrop={(e) => handleDrop(e, section.id)}
                                        >
                                            <td colSpan="9" className="p-4 text-center text-slate-300 border-dashed border-b border-slate-100 text-xs italic">
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
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-12">
                        <div className="p-4 bg-slate-50 rounded-full mb-3"><CheckCircle2 size={32} className="opacity-50" /></div>
                        <p>このプロジェクトにはまだタスクがありません</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ListView;
