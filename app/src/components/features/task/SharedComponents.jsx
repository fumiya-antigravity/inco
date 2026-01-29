import React, { useRef, useEffect, useState } from 'react';
import {
    Check, ChevronDown, CheckCircle2, AlertCircle, FileQuestion, HelpCircle
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

export const TypeSelector = ({ task, isDetailView = false }) => {
    const { updateTask } = useApp();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    useClickOutside(containerRef, () => setIsOpen(false));

    const typeColors = {
        'バグ': 'text-rose-500 bg-rose-50 border-rose-200 dark:bg-rose-900/30 dark:border-rose-900',
        'タスク': 'text-blue-500 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-900',
        '要望': 'text-orange-500 bg-orange-50 border-orange-200 dark:bg-orange-900/30 dark:border-orange-900',
        'その他': 'text-slate-500 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
    };
    const typeIcons = {
        'バグ': <AlertCircle size={14} />,
        'タスク': <CheckCircle2 size={14} />,
        '要望': <FileQuestion size={14} />,
        'その他': <HelpCircle size={14} />
    };

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
                    ${typeColors[task.type] || typeColors['その他']}
                    ${isDetailView ? 'px-3 py-1.5 text-sm' : ''}
                    hover:brightness-95
                `}
            >
                {typeIcons[task.type] || typeIcons['その他']}
                {task.type}
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-32 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-slate-200 dark:border-zinc-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    {Object.keys(typeColors).map((type) => (
                        <button
                            key={type}
                            onClick={(e) => { e.stopPropagation(); handleSelect(type); }}
                            className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-slate-50 dark:hover:bg-zinc-700 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                        >
                            <span className={type === task.type ? 'opacity-100' : 'opacity-50'}>{typeIcons[type]}</span>
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
                    : 'bg-white dark:bg-zinc-800 border-slate-300 dark:border-slate-600 text-slate-300 dark:text-slate-500 hover:border-emerald-400 hover:text-emerald-400'
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
            color: 'text-rose-500 bg-rose-50 border-rose-200 dark:bg-rose-900/30 dark:border-rose-900',
            icon: '↑',
            value: '高'
        },
        '中': {
            color: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-900',
            icon: '→',
            value: '中'
        },
        '低': {
            color: 'text-blue-400 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-900',
            icon: '↓',
            value: '低'
        }
    };
    const p = priorities[task.priority] || priorities['中'];

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
                <span>{p.icon}</span>
                <span>{task.priority}</span>
                {isDetailView && <ChevronDown size={12} className="opacity-50 ml-1" />}
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-24 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-slate-200 dark:border-zinc-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    {Object.entries(priorities).map(([key, config]) => (
                        <button
                            key={key}
                            onClick={(e) => { e.stopPropagation(); handleSelect(key); }}
                            className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-slate-50 dark:hover:bg-zinc-700 flex items-center gap-2 text-slate-700 dark:text-slate-200"
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
        if (status === '完了') return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
        if (status === '処理中') return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
        return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
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
                <div className="absolute top-full left-0 mt-1 w-32 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-slate-200 dark:border-zinc-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    {statusOptions.map((status) => (
                        <button
                            key={status}
                            onClick={(e) => { e.stopPropagation(); handleSelect(status); }}
                            className="w-full text-left px-3 py-2 text-xs font-bold hover:bg-slate-50 dark:hover:bg-zinc-700 block text-slate-700 dark:text-slate-200"
                        >
                            {status}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export const SectionSelector = ({ task, isDetailView = false }) => {
    const { sections, updateTask } = useApp();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    useClickOutside(containerRef, () => setIsOpen(false));

    const section = sections.find(s => s.id === task.sectionId) || { title: 'Unknown' };

    const handleSelect = (sectionId) => {
        updateTask(task.id, 'sectionId', sectionId);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                className="font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
                {section.title}
                {isDetailView && <ChevronDown size={14} className="opacity-50" />}
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-40 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-slate-200 dark:border-zinc-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    {sections.map((s) => (
                        <button
                            key={s.id}
                            onClick={(e) => { e.stopPropagation(); handleSelect(s.id); }}
                            className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-slate-50 dark:hover:bg-zinc-700 block text-slate-700 dark:text-slate-200"
                        >
                            {s.title}
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
        <div className="w-full bg-white dark:bg-zinc-800 rounded-lg flex items-center animate-in fade-in zoom-in-95 duration-100 shadow-sm border border-emerald-500 ring-2 ring-emerald-500/20">
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
                className="w-full bg-transparent border-none outline-none text-sm px-4 py-3 text-slate-800 dark:text-slate-100 placeholder-slate-400"
                placeholder="タスク名を入力してEnter..."
            />
        </div>
    );
};
