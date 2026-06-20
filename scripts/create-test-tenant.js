// Simple script to create a test tenant directly
// Usage: SUPABASE_URL=your_url SUPABASE_ANON_KEY=your_key node scripts/create-test-tenant.js
const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? "";

async function createTestTenant() {
  // Import dynamically to work in Node.js
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  // Create a test tenant
  const testTenant = {
    name: "Demo School",
    slug: "demo-school",
    description: "A demonstration school for testing the review system"
  };
  
  try {
    // First check if the tenant already exists
    const { data: existingTenant } = await supabase
      .from('tenants')
      .select('id, slug')
      .eq('slug', testTenant.slug)
      .single();
    
    if (existingTenant) {
      console.log(`Tenant '${testTenant.slug}' already exists with ID: ${existingTenant.id}`);
      
      // Also create a domain entry for localhost testing
      await addLocalhostDomain(supabase, existingTenant.id);
      return;
    }
    
    // Insert the tenant if it doesn't exist
    const { data, error } = await supabase
      .from('tenants')
      .insert(testTenant)
      .select('id, slug')
      .single();
    
    if (error) throw error;
    
    console.log(`Created tenant '${data.slug}' with ID: ${data.id}`);
    
    // Add localhost domain
    await addLocalhostDomain(supabase, data.id);
    
  } catch (error) {
    console.error('Error creating tenant:', error);
  }
}

async function addLocalhostDomain(supabase, tenantId) {
  try {
    // Check if localhost domain already exists
    const { data: existingDomain } = await supabase
      .from('tenant_domains')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('domain', 'localhost:5173')
      .single();
    
    if (existingDomain) {
      console.log(`Domain 'localhost:5173' already exists for this tenant`);
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
    
    if (error) throw error;
    
    console.log(`Added 'localhost:5173' domain for testing`);
  } catch (error) {
    console.error('Error adding domain:', error);
  }
}

createTestTenant();
