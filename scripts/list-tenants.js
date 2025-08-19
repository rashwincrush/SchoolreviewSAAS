// Script to list available tenants in the database
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listTenants() {
  const { data, error } = await supabase
    .from('tenants')
    .select('id, name, slug')
    .order('name', { ascending: true });
  
  if (error) {
    console.error('Error fetching tenants:', error);
    return;
  }
  
  console.log('Available tenants:');
  console.log(JSON.stringify(data, null, 2));

  if (data.length === 0) {
    console.log('No tenants found. You may need to create one using the admin interface.');
  }
}

listTenants();
