import React, { useEffect, useState } from 'react';
import {
    ChevronDown, CheckCircle2, Plus, Filter, Check, Layers, LayoutTemplate
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProjectIcon } from '../components/common/ProjectIcon';
import { useParams, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useTaskCreation } from '../hooks/useTaskCreation';

const ProjectView = () => {
    const { projectId } = useParams();
    const {
        setActiveProjectId, currentProject, currentProjectTasks, sections
    } = useApp();
    const navigate = useNavigate();
    const location = useLocation();
    const { createTask } = useTaskCreation();

    // Sync URL param with Context
    useEffect(() => {
        if (projectId) {
            setActiveProjectId(parseInt(projectId));
        }
    }, [projectId, setActiveProjectId]);

    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

    // Handle task creation using custom hook
    const handleCreateTask = async () => {
        await createTask({
            sectionId: sections[0]?.id || '1'
        });
    };

    // Determine active tab based on URL
    const isTabActive = (path) => location.pathname.includes(path);

    if (!currentProject) return <div>Project not found</div>;

    const handleTabSwitch = (path) => {
        navigate(`/projects/${projectId}/${path}`);
    };

    const isWiki = location.pathname.includes('/wiki');

    return (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-full">
            {/* Project Header */}
            <div className="flex-shrink-0 bg-white dark:bg-black border-b border-slate-200 dark:border-zinc-800 px-4 md:px-8 pt-6 pb-0 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <ProjectIcon color={currentProject.color} icon={currentProject.icon} size="lg" />
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">{currentProject.name}<ChevronDown size={18} className="text-slate-400" /></h1>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2"><CheckCircle2 size={12} /> {currentProjectTasks.length} tasks</div>
                    </div>
                </div>
                <div className="flex items-center w-full border-b border-slate-200 dark:border-zinc-800">
                    <div className="flex gap-6 overflow-x-auto no-scrollbar -mb-px">
                        {['概要', 'Wiki', 'ボード', 'リスト', 'タイムライン', 'カレンダー'].map((tabName) => {
                            const tabKey = tabName === 'リスト' ? 'list' : (tabName === 'ボード' ? 'board' : (tabName === 'Wiki' ? 'wiki' : 'other'));
                            const path = tabKey;
                            const active = isTabActive(`/${path}`);

                            return (
                                <button
                                    key={tabName}
                                    onClick={() => handleTabSwitch(path)}
                                    className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${active ? 'border-emerald-500 text-slate-800 dark:text-white' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                                >
                                    {tabName}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Toolbar - Only show if NOT wiki */}
                {!isWiki && (
                    <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-2">
                            <div className="relative flex items-center z-30">
                                <div className="inline-flex rounded-lg shadow-sm" role="group">
                                    <button onClick={handleCreateTask} className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-l-lg text-sm font-bold flex items-center gap-1.5 border-r border-emerald-600"><Plus size={16} />タスクを追加</button>
                                    <button onClick={() => setIsAddMenuOpen(!isAddMenuOpen)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1.5 rounded-r-lg flex items-center justify-center"><ChevronDown size={16} /></button>
                                </div>
                                {isAddMenuOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40 bg-transparent"
                                            onClick={() => setIsAddMenuOpen(false)}
                                        />
                                        <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-slate-200 dark:border-zinc-700 py-1 z-50">
                                            <button onClick={() => { handleCreateTask(); setIsAddMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-700 flex items-center gap-3"><CheckCircle2 size={16} className="text-slate-400" /><span>タスク</span></button>
                                            <button onClick={() => setIsAddMenuOpen(false)} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-700 flex items-center gap-3"><Layers size={16} className="text-slate-400" /><span>セクション</span></button>
                                            <div className="h-px bg-slate-100 dark:bg-zinc-700 my-1"></div>
                                            <button onClick={() => setIsAddMenuOpen(false)} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-700 flex items-center gap-3"><LayoutTemplate size={16} className="text-slate-400" /><span>タスクテンプレート</span></button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2"><button className="text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 p-1.5 rounded-lg text-sm flex items-center gap-1"><Filter size={14} /> フィルター</button></div>
                    </div>
                )}
            </div>

            <main className="flex-1 overflow-auto p-4 md:p-6 scroll-smooth bg-white dark:bg-black relative">
                <Outlet />
            </main>
        </div>
    );
};

export default ProjectView;
