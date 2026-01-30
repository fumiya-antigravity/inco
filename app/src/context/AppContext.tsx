import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import type { TaskDB, TaskUI, TaskStatus, TaskPriority, TaskType } from '../types/task';
import type { Project, Section } from '../types/project';

interface AppContextType {
    loading: boolean;
    projects: Project[];
    tasks: TaskUI[];  // Exposed as TaskUI to components
    wikiPages: any[];
    taskStatuses: TaskStatus[];
    taskPriorities: TaskPriority[];
    taskTypes: TaskType[];
    sections: Section[];
    currentProject: Project | null;
    currentProjectTasks: TaskUI[];
    currentStatuses: TaskStatus[];
    currentPriorities: TaskPriority[];
    currentTypes: TaskType[];
    activeProjectId: number | null;
    setActiveProjectId: (id: number | null) => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (open: boolean) => void;
    projectsCollapsed: boolean;
    setProjectsCollapsed: (collapsed: boolean) => void;
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    updateTask: (id: number, field: string, value: any) => Promise<void>;
    toggleTaskCompletion: (id: number) => Promise<void>;
    deleteTask: (id: number) => Promise<void>;
    addTask: (task: Partial<TaskUI>) => Promise<TaskUI | null>;
    addProject: (project: Partial<Project>) => Promise<{ data?: Project; error?: any }>;
    addWikiPage: (page: any) => Promise<void>;
    updateWikiPage: (id: number, updates: any) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // --- UI State ---
    const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
    const [projectsCollapsed, setProjectsCollapsed] = useState<boolean>(false);

    // --- Data State ---
    const [projects, setProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<TaskDB[]>([]);
    const [wikiPages, setWikiPages] = useState<any[]>([]);

    // Master Data
    const [taskStatuses, setTaskStatuses] = useState<TaskStatus[]>([]);
    const [taskPriorities, setTaskPriorities] = useState<TaskPriority[]>([]);
    const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);

    const [loading, setLoading] = useState<boolean>(true);

    // --- Data Fetching ---
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [
                { data: projectsData },
                { data: tasksData },
                { data: wikisData },
                { data: statusesData },
                { data: prioritiesData },
                { data: typesData }
            ] = await Promise.all([
                supabase.from('projects').select('*').order('created_at', { ascending: true }),
                supabase.from('tasks').select('*, activities(*)').order('created_at', { ascending: false }),
                supabase.from('wikis').select('*').order('updated_at', { ascending: false }),
                supabase.from('task_statuses').select('*').order('position', { ascending: true }),
                supabase.from('task_priorities').select('*').order('position', { ascending: true }),
                supabase.from('task_types').select('*').order('position', { ascending: true })
            ]);

            setProjects(projectsData || []);
            setTasks(tasksData || []);
            setWikiPages(wikisData || []);
            setTaskStatuses(statusesData || []);
            setTaskPriorities(prioritiesData || []);
            setTaskTypes(typesData || []);

            // Set default active project
            if (projectsData && projectsData.length > 0 && !activeProjectId) {
                setActiveProjectId(projectsData[0].id);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    // --- Actions ---
    const addProject = async (project: Partial<Project>): Promise<{ data?: Project; error?: any }> => {
        const { data, error } = await supabase.from('projects').insert([project]).select().single();
        if (error) {
            console.error('Error adding project:', error);
            return { error };
        }
        setProjects(prev => [...prev, data]);

        // Create default statuses for the new project
        const defaultStatuses = [
            { project_id: data.id, name: '未対応', position: 1, color: 'slate' },
            { project_id: data.id, name: '処理中', position: 2, color: 'blue' },
            { project_id: data.id, name: '完了', position: 3, color: 'emerald' }
        ];
        const { data: statusData } = await supabase.from('task_statuses').insert(defaultStatuses).select();
        if (statusData) {
            setTaskStatuses(prev => [...prev, ...statusData]);
        }

        return { data };
    };

    const addTask = async (newTask: Partial<TaskUI>): Promise<TaskUI | null> => {
        // Map UI fields to DB fields for status, priority, type
        const status = taskStatuses.find(s => s.name === newTask.status && s.project_id === activeProjectId);
        const priority = newTask.priority === '未選択' ? null : taskPriorities.find(p => p.name === newTask.priority && p.project_id === activeProjectId);
        const type = newTask.type === '未選択' ? null : taskTypes.find(t => t.name === newTask.type && t.project_id === activeProjectId);

        // Optimistic Update with Temp ID (TaskDB format)
        const tempId = Date.now();
        const tempTask: TaskDB = {
            id: tempId,
            project_id: newTask.projectIds ? newTask.projectIds[0] : activeProjectId!,
            section_id: newTask.sectionId ? parseInt(newTask.sectionId) : null,
            parent_id: null,
            key: 'Generating...', // Placeholder
            title: newTask.title || '',
            description: newTask.description || null,
            status_id: status?.id || taskStatuses[0]?.id,
            priority_id: priority?.id || null,
            type_id: type?.id || null,
            due_date: newTask.due || null,
            completed: newTask.completed || false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            activities: [],
        };
        setTasks(prev => [tempTask, ...prev]);

        // Prepare task for DB insert
        const payload = {
            project_id: tempTask.project_id,
            parent_id: newTask.parentId || null,
            title: tempTask.title,
            description: tempTask.description,
            status_id: tempTask.status_id,
            priority_id: tempTask.priority_id,
            type_id: tempTask.type_id,
            section_id: tempTask.section_id,
            due_date: tempTask.due_date,
            completed: tempTask.completed,
            assignee_id: newTask.assignees && newTask.assignees.length > 0 ? null : null
        };

        const { data, error } = await supabase.from('tasks').insert([payload]).select('*, activities(*)').single();
        if (error) {
            console.error('Error adding task:', error);
            // Revert optimistic update
            setTasks(prev => prev.filter(t => t.id !== tempId));
            return null;
        }

        // Replace temp task with real data and map to UI format
        const uiTask: TaskUI = {
            ...data,
            projectIds: [data.project_id],
            sectionId: data.section_id?.toString() || '1',
            due: data.due_date,
            assignees: [],
            status: taskStatuses.find(s => s.id === data.status_id)?.name || '未対応',
            priority: taskPriorities.find(p => p.id === data.priority_id)?.name || '未選択',
            type: taskTypes.find(t => t.id === data.type_id)?.name || '未選択',
        };
        setTasks(prev => prev.map(t => t.id === tempId ? data : t));
        return uiTask;
    };

    // Debounce timers
    const debounceTimers = React.useRef<Record<string, NodeJS.Timeout>>({});

    const updateTask = async (taskId: number, field: string, value: any): Promise<void> => {
        let dbField = field;
        let dbValue = value;

        if (field === 'sectionId') dbField = 'section_id';
        if (field === 'due') dbField = 'due_date';

        if (field === 'status') {
            dbField = 'status_id';
            const status = taskStatuses.find(s => s.name === value && s.project_id === activeProjectId);
            dbValue = status ? status.id : null;
        }
        if (field === 'priority') {
            dbField = 'priority_id';
            if (value === '未選択') dbValue = null;
            else {
                const priority = taskPriorities.find(p => p.name === value && p.project_id === activeProjectId);
                dbValue = priority ? priority.id : null;
            }
        }
        if (field === 'type') {
            dbField = 'type_id';
            if (value === '未選択') dbValue = null;
            else {
                const type = taskTypes.find(t => t.name === value && t.project_id === activeProjectId);
                dbValue = type ? type.id : null;
            }
        }
        if (field === 'assignees') {
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, [field]: value } : t));
            return;
        }

        // 1. Optimistic update (Immediate UI feedback)
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, [field]: value, [dbField]: dbValue } : t));

        // 2. DB Update (Debounced for text fields)
        const isTextField = ['title', 'description'].includes(field);

        // Cancel previous timer for this task+field
        const timerKey = `${taskId}-${dbField}`;
        if (debounceTimers.current[timerKey]) {
            clearTimeout(debounceTimers.current[timerKey]);
        }

        const updateDB = async () => {
            const updates = { [dbField]: dbValue };
            const { error } = await supabase.from('tasks').update(updates).eq('id', taskId);
            if (error) {
                console.error('Error updating task:', error);
                // Ideally revert here, but tricky with debounce. 
                // For now, logging error. Real app needs robust sync.
                fetchData();
            }
            delete debounceTimers.current[timerKey];
        };

        if (isTextField) {
            // Wait 1000ms for text fields
            debounceTimers.current[timerKey] = setTimeout(updateDB, 1000);
        } else {
            // Immediate for others (status, priority, etc.)
            await updateDB();
        }
    };

    const toggleTaskCompletion = async (taskId: number): Promise<void> => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        const newCompleted = !task.completed;

        await updateTask(taskId, 'completed', newCompleted);
    };

    const deleteTask = async (taskId: number): Promise<void> => {
        // Optimistic update
        setTasks(prev => prev.filter(t => t.id !== taskId));

        const { error } = await supabase.from('tasks').delete().eq('id', taskId);
        if (error) {
            console.error('Error deleting task:', error);
            fetchData(); // Revert on error
        }
    };

    const addWikiPage = async (page: any): Promise<any> => {
        const dbPage = {
            ...page,
            project_id: activeProjectId
        };
        const { data, error } = await supabase.from('wikis').insert([dbPage]).select().single();
        if (error) {
            console.error('Error adding wiki:', error);
            return null;
        }
        setWikiPages(prev => [data, ...prev]);
        return data;
    };

    const updateWikiPage = async (id: number, updates: any): Promise<void> => {
        setWikiPages(prev => prev.map(p => p.id === id ? { ...p, ...updates, updated_at: new Date() } : p));

        const { error } = await supabase.from('wikis').update({ ...updates, updated_at: new Date() }).eq('id', id);
        if (error) {
            console.error('Error updating wiki:', error);
            fetchData();
        }
    };

    // --- Derived Data ---
    const currentProject = projects.find(p => p.id === activeProjectId) || null;

    // Filter master data for current project
    const currentStatuses = taskStatuses.filter(s => s.project_id === activeProjectId);
    const currentPriorities = taskPriorities.filter(p => p.project_id === activeProjectId);
    const currentTypes = taskTypes.filter(t => t.project_id === activeProjectId);

    // Compat: Map sections from statuses
    // If no statuses exist (fresh project), provide defaults locally or wait for seed
    const sections = currentStatuses.length > 0
        ? currentStatuses.map(s => ({ id: s.id.toString(), title: s.name, color: s.color }))
        : [
            { id: '1', title: '未対応' },
            { id: '2', title: '処理中' },
            { id: '3', title: '完了' }
        ]; // Fallback

    // Derived tasks with compatibility mapping
    const currentProjectTasks = tasks
        .filter(t => t.project_id === activeProjectId && !t.parent_id)
        .map(t => {
            // Map IDs to names for UI display
            const status = taskStatuses.find(s => s.id === t.status_id);
            const priority = taskPriorities.find(p => p.id === t.priority_id);
            const type = taskTypes.find(ty => ty.id === t.type_id);

            return {
                ...t,
                projectIds: [t.project_id], // Map back to array
                sectionId: t.section_id?.toString() || sections[0].id, // Map snake_case to camelCase
                due: t.due_date, // Map due_date to due
                assignees: [], // TODO: Implement assignee mapping
                // Add UI string fields
                status: status?.name || '未対応',
                priority: priority?.name || '未選択',
                type: type?.name || '未選択',
            };
        });

    // Self-healing: Seed default statuses if missing for active project
    useEffect(() => {
        if (activeProjectId && currentStatuses.length === 0 && !loading) {
            const seedDefaults = async () => {
                const defaultStatuses = [
                    { project_id: activeProjectId, name: '未対応', position: 1, color: 'slate' },
                    { project_id: activeProjectId, name: '処理中', position: 2, color: 'blue' },
                    { project_id: activeProjectId, name: '完了', position: 3, color: 'emerald' }
                ];
                const { data } = await supabase.from('task_statuses').insert(defaultStatuses).select();
                if (data) {
                    setTaskStatuses(prev => [...prev, ...data]);
                }
            };
            seedDefaults();
        }
    }, [activeProjectId, currentStatuses.length, loading]);

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

    // Theme
    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

    // Convert all tasks to UI format for context
    const tasksUI = useMemo(() => {
        return tasks.map(t => {
            const status = taskStatuses.find(s => s.id === t.status_id);
            const priority = taskPriorities.find(p => p.id === t.priority_id);
            const type = taskTypes.find(ty => ty.id === t.type_id);

            return {
                ...t,
                projectIds: [t.project_id],
                sectionId: t.section_id?.toString() || '1',
                due: t.due_date,
                assignees: [],
                status: status?.name || '未対応',
                priority: priority?.name || '未選択',
                type: type?.name || '未選択',
            };
        });
    }, [tasks, taskStatuses, taskPriorities, taskTypes]);

    return (
        <AppContext.Provider value={{
            loading,
            projects,
            tasks: tasksUI,
            wikiPages,
            taskStatuses,
            taskPriorities,
            taskTypes,

            // Compat exposed props
            sections,

            currentProject,
            currentProjectTasks,
            currentStatuses,
            currentPriorities,
            currentTypes,

            activeProjectId,
            setActiveProjectId,
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
            deleteTask,
            addTask,
            addProject,
            addWikiPage,
            updateWikiPage
        }}>
            <div className={isDarkMode ? 'dark' : ''}>
                {children}
            </div>
        </AppContext.Provider>

    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
};
