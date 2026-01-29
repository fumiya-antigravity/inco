import React, { useState } from 'react';
import {
    X, Plus, Check, Edit2, Trash2, Send, ChevronDown
} from 'lucide-react';

// --- Detail Row ---
export const DetailRow = ({ icon: Icon, label, hasValue, onClear, children, onClick, onAdd }) => (
    <>
        <div className="text-slate-500 dark:text-slate-400 flex items-center gap-2 text-sm h-9">
            <Icon size={18} /> {label}
        </div>
        <div
            className={`
          flex items-center justify-center gap-2 group cursor-pointer 
          min-h-[36px] px-3 py-1.5 rounded-lg transition-all relative border-2 border-transparent
          ${hasValue
                    ? 'bg-slate-100/80 dark:bg-zinc-800 hover:bg-slate-200/80 dark:hover:bg-zinc-700'
                    : 'bg-transparent hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 border-dashed hover:border-slate-300'
                }
        `}
            onClick={onClick}
        >
            <div className={`flex items-center gap-2 truncate ${hasValue ? 'text-slate-700 dark:text-slate-200 font-medium' : 'text-slate-400'}`}>
                {children}
            </div>

            {onAdd && (
                <button
                    onClick={(e) => { e.stopPropagation(); onAdd(); }}
                    className="p-1 -mr-1 rounded-full hover:bg-slate-300/50 dark:hover:bg-slate-600 text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="追加"
                >
                    <Plus size={14} />
                </button>
            )}

            {hasValue && onClear && !onAdd && (
                <div className="absolute right-[-24px] opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => { e.stopPropagation(); onClear(); }}
                        className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-400 hover:text-slate-600"
                        title="クリア"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}

            {!hasValue && (
                <ChevronDown size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 ml-auto" />
            )}
        </div>
    </>
);

// --- Subtask Components ---
export const SubtaskItem = ({ subtask, onToggle, onDelete }) => (
    <div className="group flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
        <button
            onClick={() => onToggle(subtask.id)}
            className={`
           flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-all
           ${subtask.completed
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'bg-white dark:bg-zinc-800 border-slate-300 dark:border-zinc-600 hover:border-emerald-400'
                }
        `}
        >
            {subtask.completed && <Check size={12} strokeWidth={4} />}
        </button>
        <span className={`flex-1 text-sm ${subtask.completed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
            {subtask.title}
        </span>
        <button onClick={() => onDelete(subtask.id)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
            <X size={16} />
        </button>
    </div>
);

export const SubtaskInput = ({ onAdd, onCancel }) => {
    const [title, setTitle] = useState('');
    const handleAdd = () => {
        if (title.trim()) {
            onAdd(title);
            setTitle('');
        }
    };
    return (
        <div className="flex items-center gap-3 p-2 pl-2">
            <div className="w-5 h-5 rounded border border-dashed border-slate-300 dark:border-zinc-700 flex-shrink-0"></div>
            <input
                autoFocus
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAdd();
                    if (e.key === 'Escape') onCancel();
                }}
                onBlur={() => { if (!title.trim()) onCancel(); }}
                className="flex-1 bg-transparent border-none outline-none text-sm placeholder-slate-400 text-slate-800 dark:text-slate-200"
                placeholder="サブタスクを入力..."
            />
        </div>
    );
};

// --- Activity Components ---
export const ActivityItem = ({ activity, onEdit, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(activity.text);

    if (activity.type === 'history') {
        return (
            <div className="flex gap-3 text-xs text-slate-400 dark:text-slate-500 pl-2 border-l-2 border-slate-100 dark:border-zinc-800 ml-3 py-1">
                <span>{new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span>{activity.text}</span>
            </div>
        );
    }

    return (
        <div className="flex gap-4 group">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">
                {(activity.user || 'U').charAt(0)}
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-slate-700 dark:text-slate-200">{activity.user || 'Unknown'}</span>
                    <span className="text-xs text-slate-400">{new Date(activity.timestamp).toLocaleString()}</span>
                </div>

                {isEditing ? (
                    <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-2">
                        <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full bg-transparent border-none outline-none text-sm text-slate-700 dark:text-slate-300 resize-none min-h-[60px]"
                        />
                        <div className="flex justify-end gap-2 mt-2">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={() => { onEdit(activity.id, editText); setIsEditing(false); }}
                                className="px-2 py-1 text-xs bg-emerald-500 text-white rounded font-bold"
                            >
                                保存
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-lg rounded-tl-none">
                        {activity.text}
                    </div>
                )}

                {!isEditing && (
                    <div className="flex gap-3 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setIsEditing(true)} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"><Edit2 size={10} /> 編集</button>
                        <button onClick={() => onDelete(activity.id)} className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1"><Trash2 size={10} /> 削除</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export const CommentInput = ({ onPost }) => {
    const [text, setText] = useState('');
    const handlePost = () => {
        if (!text.trim()) return;
        onPost(text);
        setText('');
    };
    return (
        <div className="flex gap-4 mt-6">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                ME
            </div>
            <div className="flex-1 border border-slate-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all overflow-hidden">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-sm p-3 min-h-[80px] resize-none text-slate-700 dark:text-slate-200"
                    placeholder="コメントを入力..."
                />
                <div className="flex justify-between items-center bg-slate-50 dark:bg-zinc-800/80 px-3 py-2 border-t border-slate-100 dark:border-zinc-700">
                    <div className="text-xs text-slate-400">Markdown対応</div>
                    <button
                        onClick={handlePost}
                        disabled={!text.trim()}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all
                 ${text.trim() ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm' : 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-zinc-700'}
               `}
                    >
                        <Send size={12} /> コメント
                    </button>
                </div>
            </div>
        </div>
    );
};
