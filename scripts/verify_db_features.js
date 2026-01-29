
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars from app/.env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../app/.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    console.log('Starting verification...');

    // 1. Check Projects Schema (indirectly via insert)
    const projectKey = 'TEST' + Math.floor(Math.random() * 1000);
    console.log(`Creating project with key: ${projectKey}`);

    const { data: project, error: projError } = await supabase
        .from('projects')
        .insert([{
            name: 'Test Project',
            key: projectKey,
            color: 'blue',
            icon: 'Code' // Testing new column
        }])
        .select()
        .single();

    if (projError) {
        console.error('Error creating project:', projError);
        // If error is about column 'icon', migration failed
        process.exit(1);
    }

    console.log('Project created:', project);

    if (project.current_task_number === undefined) {
        console.error('FAILED: current_task_number column missing');
    } else {
        console.log('SUCCESS: current_task_number column exists');
    }

    if (project.icon !== 'Code') {
        console.error('FAILED: icon column missing or not saved');
    } else {
        console.log('SUCCESS: icon saved correctly');
    }

    // 2. Create Task and check Key generation
    console.log('Creating Task 1...');
    const { data: task1, error: task1Error } = await supabase
        .from('tasks')
        .insert([{
            project_id: project.id,
            title: 'Task 1',
            description: 'Test',
            status_id: 1, // Assuming these exist or aren't foreign keyed strictly without seed? 
            // Actually schema has FK to project_id, but status might be FK. 
            // In migrations 20240129000000, status_id references task_statuses.
            // We need a valid status_id.
        }])
        .select()
        .single();

    // We might fail on status_id FK if we don't create status.
    // Let's quickly create a status.
    const { data: status } = await supabase.from('task_statuses').insert({
        project_id: project.id,
        name: 'Open',
        position: 1
    }).select().single();

    // Retry task with status
    const { data: task1_success, error: task1Error2 } = await supabase
        .from('tasks')
        .insert([{
            project_id: project.id,
            title: 'Task 1',
            status_id: status.id, // Use valid status
            // We do NOT provide key.
        }])
        .select()
        .single();

    if (task1Error2) {
        console.error('Error creating task 1:', task1Error2);
        process.exit(1);
    }

    console.log('Task 1 created:', task1_success.key);

    if (task1_success.key !== `${projectKey}-1`) {
        console.error(`FAILED: Expected ${projectKey}-1, got ${task1_success.key}`);
    } else {
        console.log('SUCCESS: Task 1 key correct');
    }

    // 3. Create Task 2
    console.log('Creating Task 2...');
    const { data: task2, error: task2Error } = await supabase
        .from('tasks')
        .insert([{
            project_id: project.id,
            title: 'Task 2',
            status_id: status.id
        }])
        .select()
        .single();

    if (task2Error) {
        console.error('Error creating task 2:', task2Error);
    }

    console.log('Task 2 created:', task2.key);
    if (task2.key !== `${projectKey}-2`) {
        console.error(`FAILED: Expected ${projectKey}-2, got ${task2.key}`);
    } else {
        console.log('SUCCESS: Task 2 key correct');
    }
}

verify();
