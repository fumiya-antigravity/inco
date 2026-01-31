// Database schema types (snake_case, matches Supabase schema)
export interface TaskDB {
    id: number;
    project_id: number;
    section_id: number | null;
    parent_id: number | null;
    key: string;
    title: string;
    description: string | null;
    status_id: number;
    priority_id: number | null;
    type_id: number | null;
    due_date: string | null;
    assignee_id: string | null;
    completed: boolean;
    created_at: string;
    updated_at: string;
    activities?: ActivityDB[];
}

// UI layer types (camelCase, optimized for React components)
export interface TaskUI {
    id: number;
    projectIds: number[];
    sectionId: string;
    parentId?: number | null;
    key: string;
    title: string;
    description?: string | null;
    assignees: string[];
    status: string;      // "未対応", "処理中", "完了"
    priority: string;    // "高", "中", "低", "未選択"
    type: string;        // Type name or "未選択"
    due: string | null;
    completed: boolean;
    created_at: string;
    isTemp?: boolean;    // For optimistic updates
    activities?: ActivityDB[];
}

export interface ActivityDB {
    id: number;
    task_id: number;
    user_id: string | null;
    action: string;
    details: string | null;
    created_at: string;
}

export interface TaskStatus {
    id: number;
    project_id: number;
    name: string;
    position: number;
    color: string;
}

export interface TaskPriority {
    id: number;
    project_id: number;
    name: string;
    position: number;
}

export interface TaskType {
    id: number;
    project_id: number;
    name: string;
    position: number;
}

// Task creation payload
export interface CreateTaskPayload {
    project_id: number;
    parent_id?: number | null;
    title: string;
    description?: string | null;
    status_id: number;
    priority_id?: number | null;
    type_id?: number | null;
    section_id?: number | null;
    due_date?: string | null;
    completed?: boolean;
    assignee_id?: string | null;
}
