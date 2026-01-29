import React from 'react';
import {
    Menu, Home, CheckCircle2, Bell, ChevronRight, ChevronDown, Plus, Sun, Moon
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { ProjectIcon } from '../common/ProjectIcon';
import CreateProjectModal from '../features/project/CreateProjectModal';

const Sidebar = () => {
    const {
        isSidebarOpen, setIsSidebarOpen,
        projects, activeProjectId, setActiveProjectId,
        projectsCollapsed, setProjectsCollapsed,
        isDarkMode, toggleDarkMode
    } = useApp();
    const navigate = useNavigate();
    const location = useLocation();

    // Helper to check active route
    const isActive = (path) => location.pathname === path;

    // ... params
    const [isProjectModalOpen, setIsProjectModalOpen] = React.useState(false);

    // ... hooks

    const handleAddProject = () => {
        setIsProjectModalOpen(true);
    };

    const handleProjectSwitch = (projectId) => {
        setActiveProjectId(projectId);
        navigate(`/projects/${projectId}/board`);
    };

    return (
        <div
            className={`
        bg-slate-900 dark:bg-slate-900 text-slate-300 flex-col shadow-xl z-20 border-r border-slate-800 flex-shrink-0 transition-all duration-300 overflow-hidden
        ${isSidebarOpen ? 'w-64' : 'w-20'}
        md:flex hidden
      `}
        >
            {/* Sidebar Header */}
            <div className="h-14 flex items-center border-b border-slate-800">
                <div className="w-20 flex justify-center flex-shrink-0">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 text-slate-400 hover:text-white transition-colors hover:bg-slate-800 rounded-lg"
                        title={isSidebarOpen ? "サイドバーを閉じる" : "サイドバーを開く"}
                    >
                        <Menu size={20} />
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
                <div className="mb-6">
                    <ul className="space-y-1">
                        <li>
                            <button
                                onClick={() => navigate('/')}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium 
                  ${isActive('/') ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800'}
                  ${!isSidebarOpen && 'justify-center px-0'}
                `}
                                title={!isSidebarOpen ? "ホーム" : ""}
                            >
                                <Home size={18} />
                                {isSidebarOpen && <span>ホーム</span>}
                            </button>
                        </li>
                        <li>
                            <button
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium text-slate-400 hover:bg-slate-800
                  ${!isSidebarOpen && 'justify-center px-0'}
                `}
                                title={!isSidebarOpen ? "マイタスク" : ""}
                            >
                                <CheckCircle2 size={18} />
                                {isSidebarOpen && <span>マイタスク</span>}
                            </button>
                        </li>
                        <li>
                            <button
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium text-slate-400 hover:bg-slate-800
                  ${!isSidebarOpen && 'justify-center px-0'}
                `}
                                title={!isSidebarOpen ? "受信トレイ" : ""}
                            >
                                <Bell size={18} />
                                {isSidebarOpen && <span>受信トレイ</span>}
                            </button>
                        </li>
                    </ul>
                </div>

                <div className="mb-6">
                    {isSidebarOpen ? (
                        <div className="flex items-center justify-between px-3 mb-2 group">
                            <button onClick={() => setProjectsCollapsed(!projectsCollapsed)} className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 hover:text-slate-300">
                                {projectsCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}Projects
                            </button>
                            <button onClick={handleAddProject} className="text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"><Plus size={14} /></button>
                        </div>
                    ) : (
                        <div className="h-px bg-slate-800 mx-2 my-4"></div>
                    )}

                    {(!projectsCollapsed || !isSidebarOpen) && (
                        <ul className="space-y-1">
                            {projects.map(project => (
                                <li key={project.id}>
                                    <button
                                        onClick={() => handleProjectSwitch(project.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm group 
                      ${activeProjectId === project.id && location.pathname.includes('/projects') ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:bg-slate-800'}
                      ${!isSidebarOpen && 'justify-center px-0'}
                    `}
                                        title={!isSidebarOpen ? project.name : ""}
                                    >
                                        <ProjectIcon color={project.color} size="sm" />
                                        {isSidebarOpen && <span className="truncate flex-1 text-left">{project.name}</span>}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-slate-800 min-w-[80px]">
                <div className={`flex items-center gap-3 mb-4 ${!isSidebarOpen && 'justify-center'}`}>
                    <div className="w-8 h-8 bg-white text-slate-900 rounded-lg shadow-lg flex items-center justify-center font-bold text-lg flex-shrink-0">A</div>
                    {isSidebarOpen && (
                        <div className="flex-1 min-w-0">
                            <div className="text-slate-100 font-bold text-sm truncate">Asana Like</div>
                            <div className="text-xs text-slate-400 truncate">株式会社サンプル</div>
                        </div>
                    )}
                </div>

                <button
                    onClick={toggleDarkMode}
                    className={`flex items-center gap-3 text-sm text-slate-400 hover:text-white transition-colors w-full px-3 py-2 rounded-lg hover:bg-slate-800 ${!isSidebarOpen && 'justify-center'}`}
                    title={!isSidebarOpen ? (isDarkMode ? 'ライトモード' : 'ダークモード') : ""}
                >
                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                    {isSidebarOpen && <span>{isDarkMode ? 'ライトモード' : 'ダークモード'}</span>}
                </button>
            </div>

            {/* Modals */}
            <CreateProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} />
        </div>
    );
};

export default Sidebar;
