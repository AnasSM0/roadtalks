# Highway Radio MVP - Backend Setup Guide

Complete guide for setting up the Supabase backend for Highway Radio.

---

## Prerequisites

- Supabase account (free tier works for MVP)
- Basic knowledge of SQL and TypeScript
- Node.js 18+ (for local Edge Function testing, optional)

---

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Fill in details:
   - **Project Name**: `highway-radio-mvp`
   - **Database Password**: (generate strong password, save it)
   - **Region**: Choose closest to your target users
   - **Pricing Plan**: Free tier (sufficient for MVP testing)
4. Click **"Create new project"**
5. Wait ~2 minutes for project initialization
6. Save your **Project URL** and **Anon/Public Key** (found in Settings → API)

---

## Step 2: Enable Anonymous Authentication

1. Navigate to **Authentication** → **Providers**
2. Scroll to **Anonymous Users**
3. Toggle **Enable Anonymous sign-ins** to ON
4. Configure settings:
   - **Auto Confirm Users**: ✅ ON
   - **Email Confirmations**: ❌ OFF (not needed for anonymous)
5. Click **Save**

---

## Step 3: Enable PostGIS Extension

PostGIS is required for geospatial proximity queries.

1. Navigate to **Database** → **Extensions**
2. Search for `postgis`
3. Click **Enable** next to `postgis`
4. Verify status shows **Enabled**

---

## Step 4: Run Database Schema

Run the SQL scripts in order:

### 4.1 Main Schema
1. Navigate to **SQL Editor**
2. Click **"New Query"**
3. Copy contents of `backend/database/schema.sql`
4. Paste into editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. Verify success: "Success. No rows returned"

### 4.2 Helper Functions
1. Create another **New Query**
2. Copy contents of `backend/database/helper-functions.sql`
3. Paste and **Run**
4. Verify success

### 4.3 Cron Setup (Optional - see Alternative below)
1. Create another **New Query**
2. Copy contents of `backend/database/cron-setup.sql`
3. Paste and **Run**
4. **Note**: pg_cron may not be available in all Supabase tiers

**Alternative if pg_cron unavailable**:
- Skip cron-setup.sql
- Manually call cleanup periodically from your app
- Or implement as a scheduled Edge Function (requires Supabase Pro)

---

## Step 5: Configure Realtime

Enable real-time subscriptions for sessions and voice_sessions tables.

1. Navigate to **Database** → **Replication**
2. Find `sessions` table
   - Toggle **Enable** replication
   - Check **Insert**, **Update**, **Delete** events
3. Find `voice_sessions` table
   - Toggle **Enable** replication
   - Check **Insert**, **Update**, **Delete** events
4. Click **Save**

---

## Step 6: Deploy Edge Functions

Supabase Edge Functions handle API logic.

### 6.1 Install Supabase CLI

```bash
# macOS / Linux
brew install supabase/tap/supabase

# Windows
scoop install supabase

# Or via npm (any OS)
npm install -g supabase
```

Verify installation:
```bash
supabase --version
```

### 6.2 Login to Supabase

```bash
supabase login
```

This opens a browser window for authentication.

### 6.3 Link to Your Project

```bash
# Navigate to backend directory
cd roadtalks/backend

# Link to your remote project
supabase link --project-ref YOUR_PROJECT_REF
```

**Find your project ref**:
- Supabase Dashboard → Settings → General
- Look for "Reference ID"

### 6.4 Deploy Functions

Deploy all Edge Functions:

```bash
# Deploy get-nearby-drivers
supabase functions deploy get-nearby-drivers

# Deploy create-voice-session
supabase functions deploy create-voice-session
```

Wait for deployment confirmation for each function.

### 6.5 Verify Functions

Test that functions are deployed:

```bash
supabase functions list
```

You should see:
- `get-nearby-drivers`
- `create-voice-session`

---

## Step 7: Test Edge Functions (Optional)

### Test get-nearby-drivers

```bash
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/get-nearby-drivers' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "lat": 37.7749,
    "lng": -122.4194,
    "radius": 1000
  }'
```

Expected response (if no nearby drivers):
```json
{
  "drivers": []
}
```

### Test create-voice-session

First, create a test session manually in the database, then call the function.

---

## Step 8: Save Credentials for iOS App

Save these values securely - you'll need them for the iOS app:

1. **Supabase URL**: `https://YOUR_PROJECT_REF.supabase.co`
2. **Anon Key**: Found in Settings → API → `anon` `public`

**For iOS app (Phase 2)**:
- Add to `SupabaseConfig.swift`
- Never commit keys to git - use `.xcconfig` or environment variables

---

## Step 9: Verify Setup Checklist

Before proceeding to frontend development:

- [ ] Supabase project created
- [ ] Anonymous auth enabled
- [ ] PostGIS extension enabled
- [ ] `sessions` table exists with RLS policies
- [ ] `voice_sessions` table exists with RLS policies
- [ ] Helper functions created (`get_nearby_sessions`, `calculate_distance`)
- [ ] Cleanup function created (`cleanup_stale_sessions`)
- [ ] Cron job setup (or alternative cleanup strategy)
- [ ] Realtime replication enabled for both tables
- [ ] Edge Functions deployed and accessible
- [ ] Credentials saved securely

---

## Troubleshooting

### "permission denied for table sessions"
- **Cause**: RLS policies not properly configured
- **Fix**: Re-run `schema.sql` section 1.2.3 (RLS policies)

### "function get_nearby_sessions does not exist"
- **Cause**: Helper functions not created
- **Fix**: Run `helper-functions.sql`

### "PostGIS function not found"
- **Cause**: PostGIS extension not enabled
- **Fix**: Enable in Database → Extensions

### Edge Functions 404 error
- **Cause**: Functions not deployed or wrong project URL
- **Fix**: 
  1. Verify functions deployed: `supabase functions list`
  2. Check project URL matches your actual project
  3. Redeploy: `supabase functions deploy FUNCTION_NAME`

### Cron job not running
- **Cause**: pg_cron not available in your tier
- **Fix**: Use alternative cleanup strategy (see cron-setup.sql notes)

---

## Next Steps

Backend setup complete! ✅

You can now proceed to:
1. **Frontend Development**: Build iOS app with SwiftUI
2. **Testing**: Use Supabase Table Editor to manually insert test sessions
3. **Monitoring**: Watch Realtime logs in Supabase Dashboard

---

## Database Structure Reference

### sessions Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| plate | TEXT | License plate (no UNIQUE constraint) |
| vehicle_type | TEXT | Optional vehicle type |
| location | GEOGRAPHY | PostGIS point (lat, lng) |
| speed | FLOAT | Speed in m/s |
| heading | FLOAT | Heading in degrees (0-360) |
| last_seen | TIMESTAMP | Last activity timestamp |
| created_at | TIMESTAMP | Session creation time |

### voice_sessions Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| caller_user_id | UUID | Foreign key to auth.users |
| receiver_user_id | UUID | Foreign key to auth.users |
| caller_plate | TEXT | Caller's license plate |
| receiver_plate | TEXT | Receiver's license plate |
| status | TEXT | pending, active, or ended |
| created_at | TIMESTAMP | Session creation time |
| expires_at | TIMESTAMP | Auto-end time (5 min after creation) |
| ended_at | TIMESTAMP | Actual end time |

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostGIS Documentation](https://postgis.net/docs/)
- [Supabase Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Backend setup complete!** You're ready to build the iOS app.
