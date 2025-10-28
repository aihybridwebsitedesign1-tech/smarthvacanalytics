# Cancel Subscription Authentication Error - Fix Guide

## Problem

When attempting to end the free trial, you receive the error:
```
Error: Service authentication failed. Please contact support.
```

The API endpoint `/api/cancel-subscription` returns a 500 Internal Server Error.

## Root Cause

**Critical Configuration Mismatch**: Your Supabase service role key is from a different project than your Supabase URL and anon key.

- `NEXT_PUBLIC_SUPABASE_URL`: Project **kvgptvhspucsokvxwlql** ✓
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Project **kvgptvhspucsokvxwlql** ✓
- `SUPABASE_SERVICE_ROLE_KEY`: Project **imxmvqxugbrhwxhfrmje** ❌ (WRONG)

When the cancel subscription API tries to connect to the database using a service role key from a different project, Supabase rejects the authentication, causing the error.

## Solution

### Step 1: Get the Correct Service Role Key

1. Go to your Supabase dashboard for the correct project:
   ```
   https://supabase.com/dashboard/project/kvgptvhspucsokvxwlql/settings/api
   ```

2. In the API Settings page, find the **"service_role"** key section
   - DO NOT copy the "anon" key
   - DO NOT copy the "public anon" key
   - Copy the **"service_role"** secret key

3. The key should start with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Step 2: Update Your .env File

1. Open the `.env` file in your project root

2. Find the line starting with `SUPABASE_SERVICE_ROLE_KEY=`

3. Replace the entire key value with the correct service role key you copied

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

To verify the keys match, you can decode the JWT tokens and check the "ref" field:

**ANON KEY** (currently correct):
- Decoded payload includes: `"ref":"kvgptvhspucsokvxwlql"`

**SERVICE ROLE KEY** (needs to be updated):
- Current (wrong): `"ref":"imxmvqxugbrhwxhfrmje"`
- Should be: `"ref":"kvgptvhspucsokvxwlql"`

## Database Configuration

The database RLS policies are already correctly configured:

✓ RLS is enabled on the profiles table
✓ Service role policies exist to allow full access
✓ The policies include:
  - "Service role can read all profiles" (SELECT with USING true)
  - "Service role can update all profiles" (UPDATE with USING/WITH CHECK true)

No database changes are needed - only the environment variable needs correction.

## Technical Details

The error occurs in `/app/api/cancel-subscription/route.ts` at line 76-116 when attempting to query the profiles table. The service role client is created with a key from project "imxmvqxugbrhwxhfrmje" but tries to connect to project "kvgptvhspucsokvxwlql", causing Supabase to reject the authentication.

The code includes comprehensive error handling that detects this as an authentication error and returns the "Service authentication failed" message to protect sensitive configuration details from being exposed to the client.
