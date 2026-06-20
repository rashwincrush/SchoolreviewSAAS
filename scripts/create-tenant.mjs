// Create a test tenant using Supabase
import { createClient } from '@supabase/supabase-js';

// Usage: SUPABASE_URL=your_url SUPABASE_ANON_KEY=your_key node scripts/create-tenant.mjs
const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? "";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createTestTenant() {
  // Create a test tenant
  const testTenant = {
    name: "Demo School",
    slug: "demo-school",
    description: "A demonstration school for testing the review system"
  };
  
  try {
    // First check if the tenant already exists
    const { data: existingTenant, error: selectError } = await supabase
      .from('tenants')
      .select('id, slug, name')
      .eq('slug', testTenant.slug)
      .single();
    
    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Error checking for existing tenant:', selectError);
      return;
    }
    
    if (existingTenant) {
      console.log(`Tenant '${existingTenant.slug}' already exists with ID: ${existingTenant.id}`);
      console.log(`Name: ${existingTenant.name}`);
      
      // Also create a domain entry for localhost testing
      await addLocalhostDomain(existingTenant.id);
      return existingTenant;
    }
    
    // Insert the tenant if it doesn't exist
    const { data, error } = await supabase
      .from('tenants')
      .insert(testTenant)
      .select('id, slug, name')
      .single();
    
    if (error) {
      console.error('Error creating tenant:', error);
      return null;
    }
    
    console.log(`Created tenant '${data.slug}' with ID: ${data.id}`);
    console.log(`Name: ${data.name}`);
    
    // Add localhost domain
    await addLocalhostDomain(data.id);
    return data;
    
  } catch (error) {
    console.error('Error in tenant creation process:', error);
    return null;
  }
}

async function addLocalhostDomain(tenantId) {
  try {
    // Check if localhost domain already exists
    const { data: existingDomain, error: selectError } = await supabase
      .from('tenant_domains')
      .select('id, domain')
      .eq('tenant_id', tenantId)
      .eq('domain', 'localhost:5173')
      .single();
    
    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Error checking for existing domain:', selectError);
      return;
    }
    
    if (existingDomain) {
      console.log(`Domain '${existingDomain.domain}' already exists for this tenant`);
      return;
    }
    
    // Add localhost domain for testing
    const { error } = await supabase
      .from('tenant_domains')
      .insert({
        tenant_id: tenantId,
        domain: 'localhost:5173',
        verified: true
      });
    
    if (error) {
      console.error('Error adding domain:', error);
      return;
    }
    
    console.log(`Added 'localhost:5173' domain for testing`);
  } catch (error) {
    console.error('Error in domain creation process:', error);
  }
}

// Also list all tenants
async function listAllTenants() {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('id, name, slug')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error listing tenants:', error);
      return;
    }
    
    console.log('\nAll tenants:');
    if (data.length === 0) {
      console.log('No tenants found.');
    } else {
      data.forEach(tenant => {
        console.log(`- ${tenant.name} (${tenant.slug}), ID: ${tenant.id}`);
      });
    }
  } catch (error) {
    console.error('Error listing tenants:', error);
  }
}

// Run both functions
const tenant = await createTestTenant();
await listAllTenants();

// Exit with success
process.exit(0);
