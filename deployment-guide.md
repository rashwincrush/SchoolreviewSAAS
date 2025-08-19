# School Reviews SaaS Deployment Guide

This guide will walk you through the complete deployment process for your School Reviews SaaS system, including setting up Supabase Edge Functions, configuring authentication, creating your first tenant, and performing smoke tests.

## Step 1: Deploy Edge Functions with CORS Headers

For each of your Edge Functions, you need to add CORS headers to ensure browsers can access them properly.

### 1.1. Add CORS Headers to All Functions

Add the following code at the top of each function handler in:
- `supabase/functions/reviews-public/index.ts`
- `supabase/functions/reviews-submit/index.ts`
- `supabase/functions/reviews-moderate/index.ts`
- `supabase/functions/domains-guard/index.ts`

```typescript
// Add to top of each handler
const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
};
if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

// When returning responses, modify them to include CORS headers:
return new Response(JSON.stringify(payload), { 
  headers: { 
    "content-type": "application/json", 
    ...CORS 
  } 
});
```

### 1.2. Set Environment Variables for Functions

For each function, go to Supabase Dashboard → Functions → [Function Name] → Settings → Environment Variables and set:

For all functions:
- `SUPABASE_URL`: Your Supabase project URL (e.g., `https://mmegmpmvfxwewktdtsau.supabase.co`)
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key

For domains-guard function only:
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (has elevated permissions)

### 1.3. Deploy All Functions

From your project root, deploy each function:

```bash
cd supabase/functions/reviews-public
supabase functions deploy reviews-public --project-ref mmegmpmvfxwewktdtsau

cd ../reviews-submit
supabase functions deploy reviews-submit --project-ref mmegmpmvfxwewktdtsau

cd ../reviews-moderate
supabase functions deploy reviews-moderate --project-ref mmegmpmvfxwewktdtsau

cd ../domains-guard
supabase functions deploy domains-guard --project-ref mmegmpmvfxwewktdtsau
```

## Step 2: Configure Google OAuth in Supabase Auth

### 2.1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "OAuth client ID"
5. Set Application Type to "Web application"
6. Add authorized redirect URIs:
   - `https://reviews.yourdomain.com/embed`
   - `https://reviews.yourdomain.com/admin`
   - Your development URLs (e.g., `http://localhost:3016`)
   - Your Replit preview URLs if applicable
7. Save and note the Client ID and Client Secret

### 2.2. Configure Supabase Auth Provider

1. Go to Supabase Dashboard → Authentication → Providers → Google
2. Enable Google provider
3. Enter the Client ID and Client Secret from the previous step
4. Save changes

## Step 3: Create Your First Tenant

### 3.1. Create Tenant and Make Yourself Admin

Option 1: Using the Admin App (Recommended)
1. Sign in to your admin app at http://localhost:3016
2. Use the UI to create a new tenant (if available)

Option 2: Using SQL
1. Go to Supabase Dashboard → SQL Editor
2. Run the following SQL to create a tenant:

```sql
select create_tenant('St. Mark''s Matriculation Hr. Sec. School', 'st-marks-chromepet');
```

3. Make yourself an admin (replace with your user ID):

```sql
insert into tenant_admins (tenant_id, user_id)
select id, 'your-auth-user-id' from tenants where slug='st-marks-chromepet';
```

### 3.2. Allowlist Domain for Embedding

Run this SQL to allowlist the domain where you'll embed the reviews widget:

```sql
insert into tenant_domains (tenant_id, domain)
select id, 'stmarksschool.in' from tenants where slug='st-marks-chromepet';
```

## Step 4: Configure Embed App Environment

Create a `.env` file in `apps/embed` with the same environment variables as the admin app:

```
VITE_SUPABASE_URL="https://mmegmpmvfxwewktdtsau.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tZWdtcG12Znh3ZXdrdGR0c2F1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4OTc1NDIsImV4cCI6MjA3MDQ3MzU0Mn0.sCMu_VQQFBss8yD127QuChj6kxPWXj_5yC4OH-nfn1U"
VITE_FUNCTIONS_URL="https://mmegmpmvfxwewktdtsau.supabase.co/functions/v1"
```

Then start the embed app on a different port:

```bash
cd apps/embed
pnpm run dev -- --port=3017
```

## Step 5: Perform Smoke Tests

### 5.1. Test Public Data API

```bash
curl "https://mmegmpmvfxwewktdtsau.supabase.co/functions/v1/reviews-public?tenant=st-marks-chromepet"
```

Expected response: JSON with `{ summary, items: [], tenant_id }`

### 5.2. Test Embed App

1. Open the embed app at http://localhost:3017
2. Verify you see the school name and "0 reviews"
3. Click "Continue with Google" and log in
4. After login, you should return to the same page, logged in
5. Write a review (at least 10 characters) and submit
6. Verify you see a toast notification saying "pending approval"

### 5.3. Test Admin App

1. Open the admin app at http://localhost:3016
2. Log in with Google
3. Select your tenant from the dropdown
4. Verify you see your pending review
5. Click "Approve" on the review
6. Verify you see a success toast
7. Refresh the embed app and verify your review appears
8. Check that the average rating updates correctly

## Step 6: Production Deployment

### 6.1. Deploy Admin App

Deploy the admin app to your preferred hosting platform (Vercel, Netlify, etc.):

```bash
cd apps/admin
pnpm run build
# Deploy the dist folder to your hosting platform
```

### 6.2. Deploy Embed App

Deploy the embed app to your preferred hosting platform:

```bash
cd apps/embed
pnpm run build
# Deploy the dist folder to your hosting platform
```

### 6.3. Update Production Environment Variables

Make sure to set the same environment variables in your production deployment:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_FUNCTIONS_URL`

## Step 7: Embed on School Website

Add the embed script to the school website:

```html
<script async src="https://reviews.yourdomain.com/embed/embed.js" data-tenant="st-marks-chromepet"></script>
```

## Troubleshooting

### CORS Issues
- Verify CORS headers are properly added to all Edge Functions
- Check browser console for CORS errors

### Authentication Issues
- Verify redirect URIs are correctly configured in Google OAuth
- Check Supabase Auth logs for authentication errors

### Database Issues
- Check Supabase Database logs for SQL errors
- Verify tenant and domain are correctly set up

### Function Deployment Issues
- Check Supabase Function logs for deployment errors
- Verify environment variables are correctly set
