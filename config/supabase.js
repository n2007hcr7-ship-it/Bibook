const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('SUPABASE_URL:', supabaseUrl ? 'exists' : 'missing');
console.log('SUPABASE_ANON_KEY:', supabaseKey ? 'exists' : 'missing');

module.exports = createClient(supabaseUrl, supabaseKey);