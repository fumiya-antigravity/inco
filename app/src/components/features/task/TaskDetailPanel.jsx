import React, { useState } from 'react';
import {
    MoreHorizontal, ChevronsRight, User, Calendar, Briefcase, Columns,
    CheckCircle2, AlertCircle, FileQuestion, AlignLeft, ListTodo, MessageSquare,
    X, Plus, Link as LinkIcon, Copy, Trash2
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import {
    TypeSelector, PrioritySelector, StatusSelector, SectionSelector, CompletionCheckButton
} from './SharedComponents';
import {
    DetailRow, SubtaskItem, SubtaskInput, ActivityItem, CommentInput
} from './TaskDetailComponents';
import { useNavigate, useSearchParams } from 'react-router-dom';

const TaskDetailPanel = () => {
    const {
        tasks, projects, updateTask, toggleTaskCompletion, setTasks, addTask, deleteTask
    } = useApp();
    const [searchParams, setSearchParams] = useSearchParams();


    // Get selected task from URL query param '?task=ID'
    const taskIdString = searchParams.get('task');
    const selectedTask = taskIdString ? tasks.find(t => t.id === parseInt(taskIdString)) : null;

    const [isCreatingSubtask, setIsCreatingSubtask] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    if (!selectedTask) return null;

    const closeDetailPanel = () => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('task');
        setSearchParams(newParams);
    };

    // --- Local Logic Wrappers ---
    // In a real app, these would interact with the API
    const addSubtask = (taskId, title) => {
        const newSubtask = { id: Date.now(), title, completed: false };
        const updatedTasks = tasks.map(t => {
            if (t.id === taskId) {
                return { ...t, subtasks: [...(t.subtasks || []), newSubtask] };
            }
            return t;
        });
        setTasks(updatedTasks); // Direct update for now, ideally use updateTask action
        setIsCreatingSubtask(false);
    };

    const toggleSubtask = (taskId, subtaskId) => {
        const updatedTasks = tasks.map(t => {
            if (t.id === taskId) {
                const newSubtasks = t.subtasks.map(st =>
                    st.id === subtaskId ? { ...st, completed: !st.completed } : st
                );
                return { ...t, subtasks: newSubtasks };
            }
            return t;
        });
        setTasks(updatedTasks);
    };

    const deleteSubtask = (taskId, subtaskId) => {
        const updatedTasks = tasks.map(t => {
            if (t.id === taskId) {
                return { ...t, subtasks: t.subtasks.filter(st => st.id !== subtaskId) };
            }
            return t;
        });
        setTasks(updatedTasks);
    };

    const addComment = (taskId, text) => {
        const newActivity = {
            id: Date.now(),
            type: 'comment',
            user: 'ME',
            text,
            timestamp: new Date()
        };
        const updatedTasks = tasks.map(t => {
            if (t.id === taskId) {
                return { ...t, activities: [...(t.activities || []), newActivity] };
            }
            return t;
        });
        setTasks(updatedTasks);
    };

    // Check values for styling
    const assignees = selectedTask.assignees || [];
    const hasAssignee = assignees.length > 0;
    const hasDueDate = !!selectedTask.due;
    const taskProjects = selectedTask.projectIds || [];
    const hasProject = taskProjects.length > 0;
    const subtasks = selectedTask.subtasks || [];
    const activities = selectedTask.activities || [];

    // Sort activities by timestamp (newest first)
    const sortedActivities = [...activities].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return (

        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/20 z-30 animate-in fade-in duration-200"
                onClick={closeDetailPanel}
            />

            {/* Panel */}
            <div className="
                fixed top-14 bottom-0 right-0 z-40 
                w-full sm:w-[380px] md:w-[450px] lg:w-[550px]
                bg-white dark:bg-zinc-900 
                border-l border-slate-200 dark:border-zinc-800 
                shadow-2xl rounded-tl-2xl
                flex flex-col
                animate-in slide-in-from-right duration-200
            ">
                {/* Header */}
                <div className="h-16 flex items-center justify-between px-8 border-b border-slate-100 dark:border-zinc-800 flex-shrink-0 bg-white dark:bg-zinc-900 rounded-tl-2xl">
                    <div className="flex items-center gap-4">
                        {/* New Completion Button (Simple Circle Check) */}
                        <CompletionCheckButton
                            isCompleted={selectedTask.completed}
                            onClick={() => toggleTaskCompletion(selectedTask.id)}
                            size="lg"
                        />

                        <div className="h-4 w-px bg-slate-200 dark:bg-zinc-700"></div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span className="font-mono bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md">{selectedTask.key}</span>
                            <span className="hidden sm:inline">作成日: {new Date().toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        {/* Link Copy Button */}
                        <button
                            onClick={() => {
                                const url = window.location.href; // Already contains ?task=ID
                                navigator.clipboard.writeText(url);
                                alert('リンクをコピーしました'); // Simple feedback
                            }}
                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                            title="リンクをコピー"
                        >
                            <LinkIcon size={20} />
                        </button>

                        {/* More Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                            >
                                <MoreHorizontal size={20} />
                            </button>

                            {/* Dropdown */}
                            {isMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-slate-100 dark:border-zinc-700 z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                                        <button
                                            onClick={() => {
                                                const newTask = {
                                                    ...selectedTask,
                                                    title: selectedTask.title + ' (コピー)',
                                                    id: undefined, // Let addTask generate new ID
                                                    key: undefined, // Let DB generate new Key
                                                    activities: [],
                                                    subtasks: []
                                                };
                                                // Remove internal IDs
                                                delete newTask.id;
                                                delete newTask.created_at;

                                                addTask(newTask);
                                                setIsMenuOpen(false);
                                                alert('タスクをコピーしました');
                                            }}
                                            className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-zinc-700/50 flex items-center gap-2 transition-colors"
                                        >
                                            <Copy size={16} /> タスクを複製
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm('本当にこのタスクを削除しますか？')) {
                                                    deleteTask(selectedTask.id);
                                                    closeDetailPanel();
                                                }
                                                setIsMenuOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2 transition-colors border-t border-slate-100 dark:border-zinc-700/50"
                                        >
                                            <Trash2 size={16} /> タスクを削除
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        <button
                            onClick={closeDetailPanel}
                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors ml-1"
                        >
                            <ChevronsRight size={22} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-8 md:p-10 bg-white dark:bg-zinc-900">
                    {/* Title Input */}
                    <div className="mb-8 group">
                        <textarea
                            value={selectedTask.title}
                            onChange={(e) => updateTask(selectedTask.id, 'title', e.target.value)}
                            className="w-full text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-zinc-700 rounded-lg px-2 py-1 -ml-2 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none resize-none placeholder-slate-300 transition-all leading-tight"
                            placeholder="タスク名を入力"
                            rows={1}
                            onInput={(e) => {
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                        />
                    </div>

                    {/* Properties Grid - Reduced gap-y */}
                    <div className="grid grid-cols-[100px_1fr] md:grid-cols-[120px_1fr] gap-y-2 gap-x-4 mb-12 text-sm items-center">

                        {/* Assignee (Multiple) */}
                        <DetailRow
                            icon={User}
                            label="担当者"
                            hasValue={hasAssignee}
                            onAdd={() => alert('未実装')}
                        >
                            {hasAssignee ? (
                                <div className="flex flex-wrap gap-2 py-1">
                                    {assignees.map((assigneeName, index) => (
                                        <div key={index} className="flex items-center gap-2 group/tag">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold border border-white dark:border-zinc-800 ring-1 ring-slate-100 dark:ring-zinc-700" title={assigneeName}>
                                                    {assigneeName.charAt(0)}
                                                </div>
                                                <span>{assigneeName}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <span>未割当</span>
                            )}
                        </DetailRow>

                        {/* Due Date */}
                        <DetailRow
                            icon={Calendar}
                            label="期限日"
                            hasValue={hasDueDate}
                            onClear={() => updateTask(selectedTask.id, 'due', '')}
                        >
                            {hasDueDate ? (
                                <span>{selectedTask.due}</span>
                            ) : (
                                <span>未設定</span>
                            )}
                        </DetailRow>

                        {/* Project (Multiple) */}
                        <DetailRow
                            icon={Briefcase}
                            label="プロジェクト"
                            hasValue={hasProject}
                            onAdd={() => alert('未実装')}
                        >
                            <div className="flex flex-wrap gap-1.5 py-1">
                                {taskProjects.map(pid => {
                                    const p = projects.find(prj => prj.id === pid);
                                    return p ? (
                                        <div key={pid} className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-700 px-2 py-0.5 rounded text-xs group/tag">
                                            <span className="font-medium">{p.name}</span>
                                        </div>
                                    ) : null;
                                })}
                            </div>
                        </DetailRow>

                        {/* Section */}
                        <div className="text-slate-500 dark:text-slate-400 flex items-center gap-2 h-9">
                            <Columns size={18} /> セクション
                        </div>
                        <div className="py-1">
                            <SectionSelector task={selectedTask} isDetailView={true} />
                        </div>

                        {/* Status (MOVED HERE) */}
                        <div className="text-slate-500 dark:text-slate-400 flex items-center gap-2 h-9">
                            <CheckCircle2 size={18} /> ステータス
                        </div>
                        <div className="py-1">
                            <StatusSelector task={selectedTask} isDetailView={true} />
                        </div>

                        {/* Priority */}
                        <div className="text-slate-500 dark:text-slate-400 flex items-center gap-2 h-9">
                            <AlertCircle size={18} /> 優先度
                        </div>
                        <div className="py-1">
                            <PrioritySelector task={selectedTask} isDetailView={true} />
                        </div>

                        {/* Type */}
                        <div className="text-slate-500 dark:text-slate-400 flex items-center gap-2 h-9">
                            <FileQuestion size={18} /> 種別
                        </div>
                        <div className="py-1">
                            <TypeSelector task={selectedTask} isDetailView={true} />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mb-12">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold text-sm mb-2">
                            <AlignLeft size={16} /> 詳細
                        </div>
                        <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-slate-100 dark:border-zinc-800 min-h-[150px] group focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
                            <textarea
                                value={selectedTask.description || ''}
                                onChange={(e) => updateTask(selectedTask.id, 'description', e.target.value)}
                                className="w-full h-full bg-transparent border-none outline-none text-slate-700 dark:text-slate-300 text-sm leading-relaxed resize-none min-h-[120px]"
                                placeholder="詳細を入力してください..."
                            />
                        </div>
                    </div>

                    {/* Subtasks (Enhanced) */}
                    <div className="mb-12">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold text-sm mb-2 group">
                            <ListTodo size={16} /> サブタスク
                            <button
                                onClick={() => setIsCreatingSubtask(true)}
                                className="ml-2 p-0.5 rounded hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-400 hover:text-emerald-600 transition-colors"
                                title="サブタスクを追加"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                        <div className="pl-1 space-y-1">
                            {subtasks.map(st => (
                                <SubtaskItem
                                    key={st.id}
                                    subtask={st}
                                    onToggle={(sid) => toggleSubtask(selectedTask.id, sid)}
                                    onDelete={(sid) => deleteSubtask(selectedTask.id, sid)}
                                />
                            ))}
                            {isCreatingSubtask && (
                                <SubtaskInput
                                    onAdd={(title) => addSubtask(selectedTask.id, title)}
                                    onCancel={() => setIsCreatingSubtask(false)}
                                />
                            )}
                        </div>
                    </div>

                    {/* Activity & Comments (Enhanced) */}
                    <div className="bg-slate-50 dark:bg-zinc-800/30 -mx-8 -mb-10 p-8 border-t border-slate-100 dark:border-zinc-800">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-slate-500 dark:text-slate-400 font-bold text-sm flex items-center gap-2">
                                <MessageSquare size={16} /> アクティビティ
                            </div>
                        </div>

                        {/* Comment Input */}
                        <CommentInput onPost={(text) => addComment(selectedTask.id, text)} />

                        {/* Timeline */}
                        <div className="mt-8 space-y-6 relative before:absolute before:left-[15px] before:top-4 before:bottom-0 before:w-0.5 before:bg-slate-200 dark:before:bg-zinc-700">
                            {sortedActivities.map((activity, index) => (
                                <div key={activity.id} className="relative z-10">
                                    <ActivityItem
                                        activity={activity}
                                        onEdit={() => alert('未実装')}
                                        onDelete={() => alert('未実装')}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

export default TaskDetailPanel;
