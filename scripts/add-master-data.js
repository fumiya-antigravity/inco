import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addMasterData() {
    console.log('Fetching existing projects...');
    const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id');

    if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        return;
    }

    console.log(`Found ${projects.length} projects`);

    for (const project of projects) {
        console.log(`\nProcessing project ${project.id}...`);

        // Add default priorities
        const priorities = [
            { project_id: project.id, name: '高', position: 1, color: 'rose' },
            { project_id: project.id, name: '中', position: 2, color: 'amber' },
            { project_id: project.id, name: '低', position: 3, color: 'blue' }
        ];

        for (const priority of priorities) {
            const { data: existing } = await supabase
                .from('task_priorities')
                .select('id')
                .eq('project_id', project.id)
                .eq('name', priority.name)
                .single();

            if (!existing) {
                const { error } = await supabase
                    .from('task_priorities')
                    .insert([priority]);

                if (error) {
                    console.error(`Error inserting priority ${priority.name}:`, error);
                } else {
                    console.log(`✓ Added priority: ${priority.name}`);
                }
            } else {
                console.log(`- Priority ${priority.name} already exists`);
            }
        }

        // Add default types
        const types = [
            { project_id: project.id, name: 'バグ', position: 1, icon: 'bug' },
            { project_id: project.id, name: 'タスク', position: 2, icon: 'check' },
            { project_id: project.id, name: '要望', position: 3, icon: 'lightbulb' },
            { project_id: project.id, name: 'その他', position: 4, icon: 'help-circle' }
        ];

        for (const type of types) {
            const { data: existing } = await supabase
                .from('task_types')
                .select('id')
                .eq('project_id', project.id)
                .eq('name', type.name)
                .single();

            if (!existing) {
                const { error } = await supabase
                    .from('task_types')
                    .insert([type]);

                if (error) {
                    console.error(`Error inserting type ${type.name}:`, error);
                } else {
                    console.log(`✓ Added type: ${type.name}`);
                }
            } else {
                console.log(`- Type ${type.name} already exists`);
            }
        }
    }

    console.log('\n✅ Master data setup complete!');
}

addMasterData().catch(console.error);
