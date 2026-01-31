import React, { useRef, useEffect, useState } from 'react';
import {
    Check, ChevronDown, CheckCircle2, AlertCircle, FileQuestion, HelpCircle, User, X
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';

// --- Selectors ---

const useClickOutside = (ref, callback) => {
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                callback();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [ref, callback]);
};

// --- Assignee Selector ---
export const AssigneeSelector = ({ task, isDetailView = false, readOnly = false }) => {
    const { updateTask, currentMembers } = useApp();
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef(null);
    useClickOutside(containerRef, () => setIsOpen(false));

    // Filter members
    const filteredMembers = currentMembers.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleSelect = (memberName) => {
        updateTask(task.id, 'assignees', [memberName]);
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleClear = () => {
        updateTask(task.id, 'assignees', []);
        setIsOpen(false);
    };

    const currentAssignee = task.assignees && task.assignees.length > 0 ? task.assignees[0] : null;

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={(e) => {
                    if (!readOnly) {
                        e.stopPropagation();
                        setIsOpen(!isOpen);
                    }
                }}
                className={`
 flex items-center gap-2 transition-all rounded-full pr-2
 ${!currentAssignee ? 'text-slate-400' : 'text-slate-700'}
 ${isDetailView ? 'p-1' : 'p-0.5'}
 ${!readOnly ? 'hover:bg-slate-100 cursor-pointer' : 'cursor-default'}
 `}
            >
                {currentAssignee ? (
                    <>
                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold border border-white ring-1 ring-slate-100">
                            {currentAssignee.charAt(0)}
                        </div>
                        <span className={`font-medium ${isDetailView ? 'text-sm' : 'text-xs text-slate-600'}`}>
                            {currentAssignee}
                        </span>
                    </>
                ) : (
                    <>
                        <div className="w-6 h-6 rounded-full bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center">
                            <User size={12} />
                        </div>
                        <span className={`${isDetailView ? 'text-sm' : 'text-xs text-slate-600'}`}>
                            未割当
                        </span>
                    </>
                )}
            </button>

            {isOpen && !readOnly && (
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col"
                >
                    <div className="p-2 border-b border-slate-100 bg-slate-50/50">
                        <input
                            autoFocus
                            type="text"
                            placeholder="名前で検索..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full text-xs px-2 py-1.5 bg-white border border-slate-200 rounded outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                    </div>
                    <div className="max-h-[200px] overflow-y-auto p-1">
                        <button
                            onClick={handleClear}
                            className="w-full text-left px-3 py-2 text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-50:bg-zinc-700/50 rounded flex items-center gap-2 mb-1"
                        >
                            <span className="w-6 h-6 rounded-full border border-dashed border-slate-300 flex items-center justify-center">
                                <X size={12} />
                            </span>
                            未割当にする
                        </button>

                        {filteredMembers.length > 0 ? filteredMembers.map(member => (
                            <button
                                key={member.id}
                                onClick={() => handleSelect(member.name)}
                                className="w-full text-left px-2 py-1.5 text-xs text-slate-700 hover:bg-emerald-50 rounded flex items-center gap-2 transition-colors"
                            >
                                <div className={`w-6 h-6 rounded-full bg-${member.avatar_color}-100 text-${member.avatar_color}-600 flex items-center justify-center text-[10px] font-bold`}>
                                    {member.name.charAt(0)}
                                </div>
                                {member.name}
                            </button>
                        )) : (
                            <div className="p-4 text-center text-xs text-slate-400">ユーザが見つかりません</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export const TypeSelector = ({ task, isDetailView = false }) => {
    const { updateTask } = useApp();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    useClickOutside(containerRef, () => setIsOpen(false));

    const typeColors = {
        '未選択': 'text-slate-400 bg-slate-100 border-slate-200 border-dashed',
        'バグ': 'text-rose-500 bg-rose-50 border-rose-200',
        'タスク': 'text-blue-500 bg-blue-50 border-blue-200',
        '要望': 'text-orange-500 bg-orange-50 border-orange-200',
        'その他': 'text-slate-500 bg-slate-50 border-slate-200'
    };
    const typeIcons = {
        '未選択': <HelpCircle size={14} />,
        'バグ': <AlertCircle size={14} />,
        'タスク': <CheckCircle2 size={14} />,
        '要望': <FileQuestion size={14} />,
        'その他': <HelpCircle size={14} />
    };

    const currentType = task.type || '未選択';

    const handleSelect = (type) => {
        updateTask(task.id, 'type', type);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                className={`
 inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold border transition-all
 ${typeColors[currentType] || typeColors['その他']}
 ${isDetailView ? 'px-3 py-1.5 text-sm' : ''}
 hover:brightness-95
 `}
            >
                {typeIcons[currentType] || typeIcons['その他']}
                {currentType}
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-32 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    {/* Add Unselected option?? Or maybe just the valid types */}
                    {Object.keys(typeColors).map((type) => (
                        <button
                            key={type}
                            onClick={(e) => { e.stopPropagation(); handleSelect(type); }}
                            className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-slate-50:bg-zinc-700 flex items-center gap-2 text-slate-700"
                        >
                            <span className={type === currentType ? 'opacity-100' : 'opacity-50'}>{typeIcons[type]}</span>
                            {type}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export const CompletionCheckButton = ({ isCompleted, onClick, size = 'md' }) => {
    const sizeClasses = size === 'lg' ? 'w-8 h-8' : 'w-5 h-5';
    const iconSize = size === 'lg' ? 16 : 10;

    return (
        <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className={`
 ${sizeClasses} rounded-full border flex items-center justify-center transition-all duration-200 group
 ${isCompleted
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'bg-white border-slate-300 text-slate-300 hover:border-emerald-400 hover:text-emerald-400'
                }
 `}
        >
            <Check size={iconSize} strokeWidth={4} className={isCompleted ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'} />
        </button>
    );
};

export const PrioritySelector = ({ task, isDetailView = false }) => {
    const { updateTask } = useApp();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    useClickOutside(containerRef, () => setIsOpen(false));

    const priorities = {
        '高': {
            color: 'text-rose-500 bg-rose-50 border-rose-200',
            icon: '↑',
            value: '高'
        },
        '中': {
            color: 'text-amber-600 bg-amber-50 border-amber-200',
            icon: '→',
            value: '中'
        },
        '低': {
            color: 'text-blue-400 bg-blue-50 border-blue-200',
            icon: '↓',
            value: '低'
        },
        '未選択': {
            color: 'text-slate-400 bg-slate-100 border-slate-200 border-dashed',
            icon: '-',
            value: '未選択'
        }
    };
    const currentPriority = task.priority || '未選択';
    const p = priorities[currentPriority] || priorities['未選択'];

    const handleSelect = (priority) => {
        updateTask(task.id, 'priority', priority);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                className={`
 flex items-center gap-1.5 transition-all
 ${isDetailView
                        ? `text-sm px-3 py-1.5 rounded-lg font-medium ${p.color.replace('bg-', 'bg-opacity-20 bg-')} hover:brightness-95 border-2 border-transparent`
                        : `text-xs px-1.5 py-0.5 rounded-lg border font-bold hover:opacity-80 ${p.color} border-current border-opacity-20`
                    }
 `}
            >
                <span className="font-mono w-3 text-center">{p.icon}</span>
                <span>{currentPriority === '未選択' && !isDetailView ? '' : currentPriority}</span>
                {isDetailView && <ChevronDown size={12} className="opacity-50 ml-1" />}
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-24 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    {Object.entries(priorities).map(([key, config]) => (
                        <button
                            key={key}
                            onClick={(e) => { e.stopPropagation(); handleSelect(key); }}
                            className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-slate-50:bg-zinc-700 flex items-center gap-2 text-slate-700"
                        >
                            <span className="font-mono w-4 text-center">{config.icon}</span>
                            {key}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export const StatusSelector = ({ task, isDetailView = false }) => {
    const { updateTask } = useApp();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    useClickOutside(containerRef, () => setIsOpen(false));

    const statusOptions = ['未対応', '処理中', '完了'];

    const getStatusStyle = (status) => {
        if (status === '完了') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        if (status === '処理中') return 'bg-blue-100 text-blue-700 border-blue-200';
        return 'bg-slate-100 text-slate-600 border-slate-200';
    };

    const handleSelect = (status) => {
        updateTask(task.id, 'status', status);
        // Also sync boolean completed state
        if (status === '完了' && !task.completed) {
            updateTask(task.id, 'completed', true);
        } else if (status !== '完了' && task.completed) {
            updateTask(task.id, 'completed', false);
        }
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                className={`
 px-2.5 py-1 rounded-full text-xs font-bold border transition-all hover:brightness-95
 ${getStatusStyle(task.status)}
 ${isDetailView ? 'text-sm px-4 py-1.5' : ''}
 `}
            >
                {task.status}
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-32 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    {statusOptions.map((status) => (
                        <button
                            key={status}
                            onClick={(e) => { e.stopPropagation(); handleSelect(status); }}
                            className="w-full text-left px-3 py-2 text-xs font-bold hover:bg-slate-50:bg-zinc-700 block text-slate-700"
                        >
                            {status}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export const SectionSelector = ({ task }) => {
    const { sections, updateTask, taskStatuses } = useApp();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    useClickOutside(containerRef, () => setIsOpen(false));

    // section_idからステータスを取得
    const sectionId = task.section_id || task.sectionId;
    const status = taskStatuses.find(s => s.id.toString() === sectionId);
    const section = sections.find(s => s.id === sectionId) || sections[0];

    const handleSelect = (sectionId) => {
        updateTask(task.id, 'sectionId', sectionId);
        setIsOpen(false);
    };

    // ステータスと同じスタイル
    const getStatusStyle = (sectionName) => {
        if (sectionName === '完了') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        if (sectionName === '処理中') return 'bg-blue-100 text-blue-700 border-blue-200';
        return 'bg-slate-100 text-slate-600 border-slate-200';
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                className={`
                    px-2.5 py-1 rounded-full text-xs font-bold border transition-all hover:brightness-95
                    ${getStatusStyle(section.title)}
                `}>
                {section.title}
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-32 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    {sections.map((s) => (
                        <button
                            key={s.id}
                            onClick={(e) => { e.stopPropagation(); handleSelect(s.id); }}
                            className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-slate-50:bg-zinc-700 block text-slate-700"
                        >
                            {s.title}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Project Selector ---
export const ProjectSelector = ({ task }) => {
    const { projects, taskProjects, addTaskProject, removeTaskProject } = useApp();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    useClickOutside(containerRef, () => setIsOpen(false));

    // タスクに紐付いているプロジェクトを取得
    const taskProjectRelations = taskProjects
        .filter(tp => tp.task_id === task.id)
        .sort((a, b) => a.position - b.position);
    const linkedProjects = taskProjectRelations
        .map(tp => projects.find(p => p.id === tp.project_id))
        .filter(Boolean);

    // 未紐付けのプロジェクトを取得
    const availableProjects = projects.filter(
        p => !linkedProjects.some(lp => lp.id === p.id)
    );

    const handleAdd = (projectId) => {
        addTaskProject(task.id, projectId);
        setIsOpen(false);
    };

    const handleRemove = (projectId) => {
        if (linkedProjects.length === 1) {
            alert('少なくとも1つのプロジェクトが必要です');
            return;
        }
        removeTaskProject(task.id, projectId);
    };

    return (
        <div className="relative" ref={containerRef}>
            <div className="flex flex-wrap gap-1.5">
                {linkedProjects.map(project => (
                    <div
                        key={project.id}
                        className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-xs group">
                        <span className="font-medium">{project.name}</span>
                        {linkedProjects.length > 1 && (
                            <button
                                onClick={() => handleRemove(project.id)}
                                className="opacity-0 group-hover:opacity-100 hover:text-red-600 transition-all">
                                <X size={12} />
                            </button>
                        )}
                    </div>
                ))}
                {availableProjects.length > 0 && (
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-100 border border-dashed border-slate-300 transition-all">
                        <X size={12} className="rotate-45" />
                        追加
                    </button>
                )}
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    {availableProjects.map(project => (
                        <button
                            key={project.id}
                            onClick={() => handleAdd(project.id)}
                            className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-slate-50 block text-slate-700">
                            {project.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export const TaskCompletionButton = ({ task, onToggle }) => (
    <CompletionCheckButton isCompleted={task.completed} onClick={() => onToggle(task.id)} />
);

export const InlineTaskCreator = ({ task, onUpdate, onBlur }) => {
    const inputRef = useRef(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    return (
        <div className="w-full bg-white rounded-lg flex items-center animate-in fade-in zoom-in-95 duration-100 shadow-sm border border-emerald-500 ring-2 ring-emerald-500/20">
            <input
                ref={inputRef}
                type="text"
                value={task.title}
                onChange={(e) => onUpdate(task.id, e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.target.blur();
                    }
                }}
                onBlur={() => onBlur(task.id)}
                className="w-full bg-transparent border-none outline-none text-sm px-4 py-3 text-slate-800 placeholder-slate-400"
                placeholder="タスク名を入力してEnter..."
            />
        </div>
    );
};
