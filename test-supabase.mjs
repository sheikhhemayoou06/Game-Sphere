import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fikwgmxcyilxxheyjfgm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpa3dnbXhjeWlseHhoZXlqZmdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMDM0MzgsImV4cCI6MjA4NzU3OTQzOH0.lVKuVXOfWg0E8JswpnRuYwu4wiT8sPSe6qC7OHjFqEg';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'wrongpassword'
    });
    console.log("Error object:", error);
    if (error) {
        console.log("Error message:", error.message);
    }
}
test();
