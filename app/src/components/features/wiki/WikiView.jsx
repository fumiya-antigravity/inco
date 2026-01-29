import React, { useState, useEffect } from 'react';
import { FileQuestion, Plus, Home, Edit2, Save, X, Trash2 } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

const WikiView = () => {
    const { wikiPages, addWikiPage, updateWikiPage } = useApp();
    const [selectedPageId, setSelectedPageId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // Editor State
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');

    // Select first page on load if none selected
    useEffect(() => {
        if (!selectedPageId && wikiPages.length > 0) {
            setSelectedPageId(wikiPages[0].id);
        }
    }, [wikiPages, selectedPageId]);

    const selectedPage = wikiPages.find(p => p.id === selectedPageId) || wikiPages[0];

    const handleCreatePage = () => {
        const newPage = addWikiPage({
            title: '新しいページ',
            content: '# 新しいページ\n\nここに内容を記述してください。'
        });
        setSelectedPageId(newPage.id);
        // Enter edit mode immediately
        setEditTitle(newPage.title);
        setEditContent(newPage.content);
        setIsEditing(true);
    };

    const handleStartEdit = () => {
        if (!selectedPage) return;
        setEditTitle(selectedPage.title);
        setEditContent(selectedPage.content);
        setIsEditing(true);
    };

    const handleSave = () => {
        if (!selectedPage) return;
        updateWikiPage(selectedPage.id, {
            title: editTitle,
            content: editContent
        });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    return (
        <div className="max-w-6xl mx-auto w-full animate-in fade-in duration-300 h-full flex flex-col bg-white dark:bg-zinc-900 shadow-sm border border-slate-200 dark:border-zinc-800 rounded-xl my-4 overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
                <h1 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <FileQuestion size={24} className="text-emerald-500" />
                    Wiki
                </h1>
                <button
                    onClick={handleCreatePage}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                    <Plus size={16} /> 新規ページ
                </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Wiki Sidebar */}
                <div className="w-64 border-r border-slate-200 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-900/30 flex flex-col">
                    <div className="p-4 overflow-y-auto flex-1">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">ページ一覧</h3>
                        <ul className="space-y-1">
                            {wikiPages.map(page => (
                                <li key={page.id}>
                                    <button
                                        onClick={() => {
                                            setSelectedPageId(page.id);
                                            setIsEditing(false);
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors
                                            ${selectedPageId === page.id
                                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                                            }
                                        `}
                                    >
                                        <FileQuestion size={14} className={selectedPageId === page.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'} />
                                        <span className="truncate">{page.title}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Wiki Content */}
                <div className="flex-1 overflow-hidden flex flex-col relative bg-white dark:bg-zinc-900">
                    {selectedPage ? (
                        <>
                            {/* Toolbar */}
                            {!isEditing ? (
                                <div className="absolute top-4 right-6 z-10">
                                    <button
                                        onClick={handleStartEdit}
                                        className="text-slate-400 hover:text-emerald-600 dark:text-slate-500 dark:hover:text-emerald-400 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all flex items-center gap-1.5 text-sm font-bold"
                                        title="編集"
                                    >
                                        <Edit2 size={16} /> 編集
                                    </button>
                                </div>
                            ) : (
                                <div className="absolute top-4 right-6 z-10 flex items-center gap-2">
                                    <button
                                        onClick={handleCancel}
                                        className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all text-sm font-bold flex items-center gap-1"
                                    >
                                        <X size={16} /> キャンセル
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg transition-all text-sm font-bold flex items-center gap-1 shadow-sm"
                                    >
                                        <Save size={16} /> 保存
                                    </button>
                                </div>
                            )}

                            {/* Main Content */}
                            <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
                                {isEditing ? (
                                    <div className="space-y-4 animate-in fade-in duration-200">
                                        <input
                                            type="text"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            className="w-full text-3xl font-bold text-slate-800 dark:text-slate-100 border-b border-transparent focus:border-emerald-500 focus:outline-none bg-transparent py-2 placeholder-slate-300"
                                            placeholder="ページタイトル"
                                        />
                                        <textarea
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            className="w-full h-[60vh] resize-none text-slate-700 dark:text-slate-300 leading-relaxed border-none focus:outline-none bg-slate-50 dark:bg-zinc-800/50 rounded-xl p-6 text-base font-mono"
                                            placeholder="ここに内容を入力..."
                                        />
                                        <div className="text-xs text-slate-400 text-right">
                                            Markdownライクな記述が推奨されます
                                        </div>
                                    </div>
                                ) : (
                                    <div className="animate-in fade-in zoom-in-95 duration-200">
                                        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6 pb-4 border-b border-slate-100 dark:border-zinc-800">
                                            {selectedPage.title}
                                        </h1>

                                        <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                                            {selectedPage.content}
                                        </div>

                                        <div className="mt-12 pt-6 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-400">
                                            <span>最終更新: {selectedPage.updatedBy}</span>
                                            <span>{new Date(selectedPage.updatedAt).toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-400 flex-col gap-4">
                            <FileQuestion size={48} className="opacity-20" />
                            <p>ページを選択するか、新しく作成してください</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WikiView;
