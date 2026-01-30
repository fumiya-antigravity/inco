export interface Project {
    id: number;
    name: string;
    description: string | null;
    color: string | null;
    icon: string | null;
    created_at: string;
    updated_at: string;
}

export interface Section {
    id: string;
    title: string;
    color?: string;
}
