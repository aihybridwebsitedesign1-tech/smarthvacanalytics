# Cancel Subscription Authentication Error - Fix Guide

## Problem

When attempting to end the free trial, you receive the error:
```
Error: Service authentication failed. Please contact support.
```

The API endpoint `/api/cancel-subscription` returns a 500 Internal Server Error.

## Root Cause

**Critical Configuration Mismatch**: Your Supabase URL and anon key were from a different project than your service role key.

- `NEXT_PUBLIC_SUPABASE_URL`: Was **kvgptvhspucsokvxwlql** ❌ (WRONG)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Was **kvgptvhspucsokvxwlql** ❌ (WRONG)
- `SUPABASE_SERVICE_ROLE_KEY`: Project **imxmvqxugbrhwxhfrmje** ✓ (CORRECT)

The correct database is **imxmvqxugbrhwxhfrmje**. All keys must point to this project.

## Solution Applied

The `.env` file has been updated to point all keys to the correct project: **imxmvqxugbrhwxhfrmje**.

### Step 1: Get Your Anon Key

1. Go to your Supabase dashboard for the correct project:
   ```
   https://supabase.com/dashboard/project/imxmvqxugbrhwxhfrmje/settings/api
   ```

2. In the API Settings page, copy the **"anon public"** key
   - This is the PUBLIC key that's safe to expose in your frontend
   - DO NOT copy the service_role key here

3. The key should start with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Step 2: Update Your .env File

1. Open the `.env` file in your project root

2. Find the line `NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE`

3. Replace `YOUR_ANON_KEY_HERE` with the anon key you copied from step 1

4. Save the file

### Step 3: Restart Your Development Server

1. Stop your current dev server (Ctrl+C or Cmd+C)

2. Restart it:
   ```bash
   npm run dev
   ```

### Step 4: Test the Fix

1. Log in to your application
2. Navigate to Settings
3. Click "End Free Trial"
4. Confirm the cancellation
5. You should now see success instead of the authentication error

## Verification

All keys should now point to project **imxmvqxugbrhwxhfrmje**:

- ✓ SUPABASE_URL: `https://imxmvqxugbrhwxhfrmje.supabase.co` (CORRECTED)
- ⚠️ ANON_KEY: Needs to be updated with your anon key from the dashboard
- ✓ SERVICE_ROLE_KEY: Already correct

## Database Configuration

The database RLS policies are already correctly configured:

✓ RLS is enabled on the profiles table
✓ Service role policies exist to allow full access
✓ The policies include:
  - "Service role can read all profiles" (SELECT with USING true)
  - "Service role can update all profiles" (UPDATE with USING/WITH CHECK true)

No database changes are needed - only the environment variable needs correction.

## Technical Details

The error occurred in `/app/api/cancel-subscription/route.ts` at line 76-116 when attempting to query the profiles table. The service role client was created with a key from project "imxmvqxugbrhwxhfrmje" but tried to connect to project "kvgptvhspucsokvxwlql", causing Supabase to reject the authentication.

The fix corrects the SUPABASE_URL and ANON_KEY to point to the correct project "imxmvqxugbrhwxhfrmje" so all keys now match.

The code includes comprehensive error handling that detects authentication errors and returns the "Service authentication failed" message to protect sensitive configuration details from being exposed to the client.
