import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    // --- State from original App.jsx ---
    const [activeProjectId, setActiveProjectId] = useState(1);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [projectsCollapsed, setProjectsCollapsed] = useState(false);

    // Data
    const [projects, setProjects] = useState([
        { id: 1, name: 'Project Phoenix', key: 'PHX', color: 'emerald' },
        { id: 2, name: 'Webサイトリニューアル', key: 'WEB', color: 'blue' },
        { id: 3, name: '社内インフラ整備', key: 'INF', color: 'orange' },
    ]);

    const [sections] = useState([
        { id: 's1', title: '未対応' },
        { id: 's2', title: '処理中' },
        { id: 's3', title: '完了' }
    ]);

    const [tasks, setTasks] = useState([
        {
            id: 1,
            projectIds: [1],
            sectionId: 's1',
            key: 'PHX-1',
            title: 'ログイン画面のデザイン作成',
            assignees: ['山田 太郎'],
            status: '未対応',
            completed: false,
            priority: '高',
            type: 'タスク',
            due: '2024-02-10',
            description: 'Figmaのデザインをもとにコーディングを行う。\nレスポンシブ対応も忘れずに。',
            subtasks: [
                { id: 101, title: 'ワイヤーフレーム確認', completed: true },
                { id: 102, title: 'デザインカンプ作成', completed: false },
            ],
            activities: [
                { id: 'h1', type: 'history', text: '山田 太郎 がタスクを作成しました', timestamp: new Date('2024-02-01T10:00:00') },
                { id: 'c1', type: 'comment', user: '鈴木 花子', text: 'デザインの方向性は確認済みですか？', timestamp: new Date('2024-02-01T14:30:00') }
            ]
        },
        {
            id: 2,
            projectIds: [1, 2],
            sectionId: 's2',
            key: 'PHX-2',
            title: 'API仕様書のレビュー',
            assignees: ['鈴木 花子', '佐藤 次郎'],
            status: '処理中',
            completed: false,
            priority: '中',
            type: 'タスク',
            due: '2024-02-12',
            description: '',
            subtasks: [],
            activities: [
                { id: 'h2', type: 'history', text: '鈴木 花子 がタスクを作成しました', timestamp: new Date('2024-02-02T09:00:00') }
            ]
        },
        { id: 3, projectIds: [1], sectionId: 's3', key: 'PHX-3', title: 'ロゴ画像が表示されないバグ修正', assignees: ['田中 一郎'], status: '完了', completed: true, priority: '高', type: 'バグ', due: '2024-02-05', description: 'IE11で表示が崩れる', subtasks: [], activities: [] },
        // ... add other tasks if needed or keep it minimal for now
    ]);

    const [wikiPages, setWikiPages] = useState([
        { id: 1, title: 'Project Phoenix Wikiへようこそ', content: 'このプロジェクトに関するドキュメント、議事録、仕様書などを管理します。\nサイドバーからページを選択するか、右上のボタンから新しいページを作成してください。', updatedBy: 'システム', updatedAt: new Date() }
    ]);

    const addWikiPage = (page) => {
        const newPage = { ...page, id: Date.now(), updatedBy: 'Me', updatedAt: new Date() };
        setWikiPages(prev => [...prev, newPage]);
        return newPage;
    };

    const updateWikiPage = (id, updates) => {
        setWikiPages(prev => prev.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p));
    };

    // Derived
    const currentProject = projects.find(p => p.id === activeProjectId) || projects[0];
    const currentProjectTasks = tasks.filter(t => t.projectIds && t.projectIds.includes(activeProjectId));

    // --- Actions ---
    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

    const updateTask = (taskId, field, value) => {
        setTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, [field]: value } : t
        ));
    };

    const toggleTaskCompletion = (taskId) => {
        setTasks(prev => prev.map(t => {
            if (t.id === taskId) {
                return { ...t, completed: !t.completed };
            }
            return t;
        }));
    };

    const addTask = (newTask) => {
        setTasks(prev => [...prev, newTask]);
    };

    const addProject = (project) => {
        setProjects(prev => [...prev, { ...project, id: Date.now() }]);
    };

    // Resize Listener
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <AppContext.Provider value={{
            projects,
            sections,
            tasks,
            setTasks,
            activeProjectId,
            setActiveProjectId,
            currentProject,
            currentProjectTasks,
            isSidebarOpen,
            setIsSidebarOpen,
            isMobileMenuOpen,
            setIsMobileMenuOpen,
            projectsCollapsed,
            setProjectsCollapsed,
            isDarkMode,
            toggleDarkMode,
            updateTask,
            toggleTaskCompletion,
            addTask,
            addProject,
            wikiPages,
            addWikiPage,
            updateWikiPage
        }}>
            <div className={isDarkMode ? 'dark' : ''}>
                {children}
            </div>
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
