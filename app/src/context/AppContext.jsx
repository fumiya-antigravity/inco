import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    // --- UI State ---
    const [activeProjectId, setActiveProjectId] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [projectsCollapsed, setProjectsCollapsed] = useState(false);

    // --- Data State ---
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [wikiPages, setWikiPages] = useState([]);

    // Master Data
    const [taskStatuses, setTaskStatuses] = useState([]);
    const [taskPriorities, setTaskPriorities] = useState([]);
    const [taskTypes, setTaskTypes] = useState([]);

    const [loading, setLoading] = useState(true);

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
    const addProject = async (project) => {
        const { data, error } = await supabase.from('projects').insert([project]).select().single();
        if (error) {
            console.error('Error adding project:', error);
            return null;
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

        return data;
    };

    const addTask = async (newTask) => {
        // Prepare task for DB: map UI fields to DB columns
        const dbTask = {
            project_id: newTask.projectIds ? newTask.projectIds[0] : activeProjectId,
            section_id: newTask.sectionId ? newTask.sectionId.toString() : null, // Store sectionId
            key: newTask.key,
            title: newTask.title,
            description: newTask.description,
            status: newTask.status, // Legacy text field or unused? Kept for now
            priority: newTask.priority,
            type: newTask.type,
            due_date: newTask.due ? newTask.due : null,
            completed: newTask.completed
        };

        const { data, error } = await supabase.from('tasks').insert([dbTask]).select('*, activities(*)').single();
        if (error) {
            console.error('Error adding task:', error);
            return null;
        }
        setTasks(prev => [data, ...prev]);
        return data;
    };

    const updateTask = async (taskId, field, value) => { // Modified signature to match old usage (id, field, value)
        // Map field names if necessary
        let dbField = field;
        let dbValue = value;

        if (field === 'sectionId') dbField = 'section_id';
        if (field === 'due') dbField = 'due_date';

        // Optimistic update
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, [field]: value, [dbField]: value } : t));

        const updates = { [dbField]: dbValue };
        const { error } = await supabase.from('tasks').update(updates).eq('id', taskId);
        if (error) {
            console.error('Error updating task:', error);
            fetchData();
        }
    };

    const toggleTaskCompletion = async (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        const newCompleted = !task.completed;

        await updateTask(taskId, 'completed', newCompleted);
    };

    const addWikiPage = async (page) => {
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

    const updateWikiPage = async (id, updates) => {
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
        .map(t => ({
            ...t,
            projectIds: [t.project_id], // Map back to array
            sectionId: t.section_id || sections[0].id, // Map snake_case to camelCase
            due: t.due_date, // Map due_date to due
        }));

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

    return (
        <AppContext.Provider value={{
            loading,
            projects,
            tasks,
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

export const useApp = () => useContext(AppContext);
