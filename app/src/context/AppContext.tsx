import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import type { TaskDB, TaskUI, TaskStatus, TaskPriority, TaskType } from '../types/task';
import type { Project, Section } from '../types/project';

interface ProjectMember {
    id: number;
    project_id: number;
    name: string;
    email: string | null;
    avatar_color: string;
    position: number;
    created_at: string;
}

interface TaskProject {
    id: number;
    task_id: number;
    project_id: number;
    position: number;
    created_at: string;
}

interface AppContextType {
    loading: boolean;
    projects: Project[];
    tasks: TaskUI[]; // Exposed as TaskUI to components
    wikiPages: any[];
    taskStatuses: TaskStatus[];
    taskPriorities: TaskPriority[];
    taskTypes: TaskType[];
    sections: Section[];
    members: ProjectMember[];
    taskProjects: TaskProject[];
    currentProject: Project | null;
    currentProjectTasks: TaskUI[];
    currentStatuses: TaskStatus[];
    currentPriorities: TaskPriority[];
    currentTypes: TaskType[];
    currentMembers: ProjectMember[];
    activeProjectId: number | null;
    setActiveProjectId: (id: number | null) => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (open: boolean) => void;
    projectsCollapsed: boolean;
    setProjectsCollapsed: (collapsed: boolean) => void;
    updateTask: (id: number, field: string, value: any) => Promise<void>;
    toggleTaskCompletion: (id: number) => Promise<void>;
    deleteTask: (id: number) => Promise<void>;
    addTask: (task: Partial<TaskUI>) => Promise<TaskUI | null>;
    addProject: (project: Partial<Project>) => Promise<{ data?: Project; error?: any }>;
    addTaskProject: (taskId: number, projectId: number) => Promise<void>;
    removeTaskProject: (taskId: number, projectId: number) => Promise<void>;
    addWikiPage: (page: any) => Promise<void>;
    updateWikiPage: (id: number, updates: any) => Promise<void>;
    addSection: (section: Partial<Section>) => Promise<void>;
    updateSection: (id: string, title: string) => Promise<void>;
    deleteSection: (id: string, destSectionId?: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // --- UI State ---
    const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
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
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [taskProjects, setTaskProjects] = useState<TaskProject[]>([]);
    const [sections, setSections] = useState<Section[]>([]); // New State

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
                { data: typesData },
                { data: membersData },
                { data: taskProjectsData },
                { data: sectionsData }
            ] = await Promise.all([
                supabase.from('projects').select('*').order('created_at', { ascending: true }),
                supabase.from('tasks').select('*, activities(*)').order('created_at', { ascending: false }),
                supabase.from('wikis').select('*').order('updated_at', { ascending: false }),
                supabase.from('task_statuses').select('*').order('position', { ascending: true }),
                supabase.from('task_priorities').select('*').order('position', { ascending: true }),
                supabase.from('task_types').select('*').order('position', { ascending: true }),
                supabase.from('project_members').select('*').order('position', { ascending: true }),
                supabase.from('task_projects').select('*').order('position', { ascending: true }),
                supabase.from('sections').select('*').order('order_index', { ascending: true })
            ]);

            setProjects(projectsData || []);
            setTasks(tasksData || []);
            setWikiPages(wikisData || []);
            setTaskStatuses(statusesData || []);
            setTaskPriorities(prioritiesData || []);
            setTaskTypes(typesData || []);
            setMembers(membersData || []);
            setTaskProjects(taskProjectsData || []);
            setSections(sectionsData || []);

            // Auto-initialize missing master data for existing projects
            if (projectsData && projectsData.length > 0) {
                for (const project of projectsData) {
                    // Check and add missing priorities
                    const hasPriorities = prioritiesData?.some(p => p.project_id === project.id);
                    if (!hasPriorities) {
                        console.log(`[Auto-init] Adding default priorities for project ${project.id}`);
                        const defaultPriorities = [
                            { project_id: project.id, name: '高', position: 1, color: 'rose' },
                            { project_id: project.id, name: '中', position: 2, color: 'amber' },
                            { project_id: project.id, name: '低', position: 3, color: 'blue' }
                        ];
                        const { data: newPriorities } = await supabase
                            .from('task_priorities')
                            .insert(defaultPriorities)
                            .select();
                        if (newPriorities) {
                            setTaskPriorities(prev => [...prev, ...newPriorities]);
                        }
                    }

                    // Check and add missing types
                    const hasTypes = typesData?.some(t => t.project_id === project.id);
                    if (!hasTypes) {
                        console.log(`[Auto-init] Adding default types for project ${project.id}`);
                        const defaultTypes = [
                            { project_id: project.id, name: 'バグ', position: 1, icon: 'bug' },
                            { project_id: project.id, name: 'タスク', position: 2, icon: 'check' },
                            { project_id: project.id, name: '要望', position: 3, icon: 'lightbulb' },
                            { project_id: project.id, name: 'その他', position: 4, icon: 'help-circle' }
                        ];
                        const { data: newTypes } = await supabase
                            .from('task_types')
                            .insert(defaultTypes)
                            .select();
                        if (newTypes) {
                            setTaskTypes(prev => [...prev, ...newTypes]);
                        }
                    }
                }
            }

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

        // Create default priorities for the new project
        const defaultPriorities = [
            { project_id: data.id, name: '高', position: 1, color: 'rose' },
            { project_id: data.id, name: '中', position: 2, color: 'amber' },
            { project_id: data.id, name: '低', position: 3, color: 'blue' }
        ];
        const { data: priorityData } = await supabase.from('task_priorities').insert(defaultPriorities).select();
        if (priorityData) {
            setTaskPriorities(prev => [...prev, ...priorityData]);
        }

        // Create default types for the new project
        const defaultTypes = [
            { project_id: data.id, name: 'バグ', position: 1, icon: 'bug' },
            { project_id: data.id, name: 'タスク', position: 2, icon: 'check' },
            { project_id: data.id, name: '要望', position: 3, icon: 'lightbulb' },
            { project_id: data.id, name: 'その他', position: 4, icon: 'help-circle' }
        ];
        const { data: typeData } = await supabase.from('task_types').insert(defaultTypes).select();
        if (typeData) {
            setTaskTypes(prev => [...prev, ...typeData]);
        }

        return { data };
    };

    const addTask = async (newTask: Partial<TaskUI>): Promise<TaskUI | null> => {
        // Map UI fields to DB fields for status, priority, type
        const status = taskStatuses.find(s => s.name === newTask.status);
        const priority = newTask.priority === '未選択' ? null : taskPriorities.find(p => p.name === newTask.priority);
        const type = newTask.type === '未選択' ? null : taskTypes.find(t => t.name === newTask.type);

        console.log('[DEBUG] addTask mapping:', {
            status: { input: newTask.status, found: status },
            priority: { input: newTask.priority, found: priority },
            type: { input: newTask.type, found: type }
        });

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
            assignee_id: newTask.assignees && newTask.assignees.length > 0 ? newTask.assignees[0] : null,
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

        // タスク-プロジェクト関連を追加
        const { data: taskProjectData, error: taskProjectError } = await supabase
            .from('task_projects')
            .insert([{ task_id: data.id, project_id: data.project_id, position: 0 }])
            .select()
            .single();

        if (!taskProjectError && taskProjectData) {
            setTaskProjects(prev => [...prev, taskProjectData]);
        }

        return uiTask;
    };

    // Debounce timers
    const debounceTimers = React.useRef<Record<string, NodeJS.Timeout>>({});

    const updateTask = async (taskId: number, field: string, value: any): Promise<void> => {
        let dbField = field;
        let dbValue = value;
        let uiUpdates: Record<string, any> = {};

        if (field === 'sectionId') dbField = 'section_id';
        if (field === 'due') dbField = 'due_date';

        if (field === 'status') {
            dbField = 'status_id';
            const status = taskStatuses.find(s => s.name === value);
            console.log('[DEBUG] Status update:', { value, taskStatuses, found: status });
            dbValue = status ? status.id : null;
            uiUpdates = { status: value, status_id: dbValue };
        }
        if (field === 'priority') {
            dbField = 'priority_id';
            if (value === '未選択') {
                dbValue = null;
            } else {
                const priority = taskPriorities.find(p => p.name === value);
                console.log('[DEBUG] Priority update:', { value, taskPriorities, found: priority });
                dbValue = priority ? priority.id : null;
            }
            uiUpdates = { priority: value, priority_id: dbValue };
        }
        if (field === 'type') {
            dbField = 'type_id';
            if (value === '未選択') {
                dbValue = null;
            } else {
                const type = taskTypes.find(t => t.name === value);
                console.log('[DEBUG] Type update:', { value, taskTypes, found: type });
                dbValue = type ? type.id : null;
            }
            uiUpdates = { type: value, type_id: dbValue };
        }
        if (field === 'assignees') {
            // assigneesは配列だが、DBは単一のassignee_idなので最初の要素を使用
            dbField = 'assignee_id';
            dbValue = value && value.length > 0 ? value[0] : null;
            uiUpdates = { assignees: value, assignee_id: dbValue };
        }

        // If no special handling, just update the field directly
        if (Object.keys(uiUpdates).length === 0) {
            uiUpdates = { [field]: value };
            if (dbField !== field) {
                uiUpdates[dbField] = dbValue;
            }
        }

        // 1. Optimistic update (Immediate UI feedback)
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...uiUpdates } : t));

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

    const addTaskProject = async (taskId: number, projectId: number): Promise<void> => {
        // 既存の関連を取得
        const existingRelations = taskProjects.filter(tp => tp.task_id === taskId);
        const position = existingRelations.length;

        // 楽観的更新
        const newRelation: TaskProject = {
            id: Date.now(),
            task_id: taskId,
            project_id: projectId,
            position,
            created_at: new Date().toISOString()
        };
        setTaskProjects(prev => [...prev, newRelation]);

        // DB更新
        const { data, error } = await supabase
            .from('task_projects')
            .insert([{ task_id: taskId, project_id: projectId, position }])
            .select()
            .single();

        if (error) {
            console.error('Error adding task project:', error);
            setTaskProjects(prev => prev.filter(tp => tp.id !== newRelation.id));
            return;
        }

        // 実データで置き換え
        setTaskProjects(prev => prev.map(tp => tp.id === newRelation.id ? data : tp));

        // 最初のプロジェクトの場合、tasks.project_idも更新
        if (position === 0) {
            await supabase.from('tasks').update({ project_id: projectId }).eq('id', taskId);
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, project_id: projectId } : t));
        }
    };

    const removeTaskProject = async (taskId: number, projectId: number): Promise<void> => {
        // 楽観的更新
        setTaskProjects(prev => prev.filter(tp => !(tp.task_id === taskId && tp.project_id === projectId)));

        // DB更新
        const { error } = await supabase
            .from('task_projects')
            .delete()
            .eq('task_id', taskId)
            .eq('project_id', projectId);

        if (error) {
            console.error('Error removing task project:', error);
            fetchData(); // エラー時は再取得
            return;
        }

        // 残りの関連を取得して、最初のプロジェクトをtasks.project_idに設定
        const remainingRelations = taskProjects
            .filter(tp => tp.task_id === taskId && tp.project_id !== projectId)
            .sort((a, b) => a.position - b.position);

        if (remainingRelations.length > 0) {
            await supabase.from('tasks').update({ project_id: remainingRelations[0].project_id }).eq('id', taskId);
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, project_id: remainingRelations[0].project_id } : t));
        }
    };

    // --- Section Methods ---
    const addSection = async (section: Partial<Section>) => {
        const { data, error } = await supabase.from('sections').insert([section]).select().single();
        if (data) {
            setSections(prev => [...prev, data]);
        }
    };

    const updateSection = async (id: string, title: string) => {
        const { error } = await supabase.from('sections').update({ title }).eq('id', id);
        if (!error) {
            setSections(prev => prev.map(s => s.id === id ? { ...s, title } : s));
        }
    };

    const deleteSection = async (id: string, destSectionId?: string) => {
        // Optimistic
        if (destSectionId) {
            setTasks(prev => prev.map(t => t.section_id?.toString() === id ? { ...t, section_id: parseInt(destSectionId) } : t));
            await supabase.from('tasks').update({ section_id: destSectionId }).eq('section_id', id);
        }

        await supabase.from('sections').delete().eq('id', id);
        setSections(prev => prev.filter(s => s.id !== id));
    };

    // --- Derived Data ---
    const currentProject = projects.find(p => p.id === activeProjectId) || null;

    // Filter master data for current project (now global, not filtered)
    const currentStatuses = taskStatuses;
    const currentPriorities = taskPriorities;
    const currentTypes = taskTypes;
    const currentMembers = members;

    // Filter sections for current project
    const currentSections = sections.filter(s => s.project_id === activeProjectId);

    // Fallback if no sections (usually for new projects or until migrated)
    const effectiveSections = currentSections.length > 0
        ? currentSections
        : []; // For now, let's assume if empty, it's empty. UI handles empty state or we can verify.

    // Derived tasks with compatibility mapping
    const currentProjectTasks = tasks
        .filter(t => {
            // タスク-プロジェクト関連から現在のプロジェクトに紐付いているタスクを取得
            const taskProjectRelations = taskProjects.filter(tp => tp.task_id === t.id);
            return taskProjectRelations.some(tp => tp.project_id === activeProjectId) && !t.parent_id;
        })
        .map(t => {
            // タスクに紐付いているプロジェクトIDの配列を取得
            const taskProjectRelations = taskProjects
                .filter(tp => tp.task_id === t.id)
                .sort((a, b) => a.position - b.position);
            const projectIds = taskProjectRelations.map(tp => tp.project_id);

            // Map IDs to names for UI display
            const status = taskStatuses.find(s => s.id === t.status_id);
            const priority = taskPriorities.find(p => p.id === t.priority_id);
            const type = taskTypes.find(ty => ty.id === t.type_id);

            return {
                ...t,
                projectIds, // 複数プロジェクトIDの配列
                sectionId: t.section_id?.toString() || (currentSections[0]?.id || '1'), // Use real section or fallback
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
                assignees: t.assignee_id ? [t.assignee_id] : [],
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
            members,
            taskProjects,

            // Compat exposed props
            // Compat exposed props
            sections: effectiveSections,

            currentProject,
            currentProjectTasks,
            currentStatuses,
            currentPriorities,
            currentTypes,
            currentMembers,

            activeProjectId,
            setActiveProjectId,
            isSidebarOpen,
            setIsSidebarOpen,
            isMobileMenuOpen,
            setIsMobileMenuOpen,
            projectsCollapsed,
            setProjectsCollapsed,

            updateTask,
            toggleTaskCompletion,
            deleteTask,
            addTask,
            addProject,
            addTaskProject,
            removeTaskProject,
            addWikiPage,
            updateWikiPage,
            addSection,
            updateSection,
            deleteSection
        }}>
            {children}
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
