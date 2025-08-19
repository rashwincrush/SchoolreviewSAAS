// Script to list available tenants in the database
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from admin .env file
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '../apps/admin/.env');
const envContent = readFileSync(envPath, 'utf8');
const envVars = dotenv.parse(envContent);

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY;

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
