require('dotenv').config({ path: './.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testSignup() {
    console.log('Testing Supabase Signup directly...');
    console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

    const testEmail = `test_${Date.now()}@resend.dev`;
    console.log(`Using email: ${testEmail}`);

    const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: 'Password123!',
    });

    if (error) {
        console.error('❌ DIRECT SUPABASE API ERROR:');
        console.error(error);
    } else {
        console.log('✅ SIGNUP SUCCESS:');
        console.log(data);
    }
}

testSignup();
