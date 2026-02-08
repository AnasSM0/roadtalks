# Highway Radio - Complete Deployment Guide

Step-by-step guide to deploy backend and build iOS app.

---

## Prerequisites

### For Backend Deployment
- ✅ Supabase account (free tier)
- ✅ Node.js 18+ installed
- ✅ Internet connection

### For iOS Build
- ⚠️ **macOS computer** (Xcode only runs on Mac)
- ⚠️ Xcode 15.0+ installed
- ⚠️ Active Apple Developer account
- ⚠️ 2 physical iPhones (iOS 16.0+) for testing

---

## Part 1: Backend Deployment

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create account
3. Click **"New Project"**
4. Fill in:
   - **Name**: `highway-radio-mvp`
   - **Database Password**: Generate strong password → **SAVE IT**
   - **Region**: Choose closest to target users
   - **Plan**: Free
5. Click **"Create new project"**
6. Wait ~2 minutes for initialization

### Step 2: Save Your Credentials

Once project is ready:

1. Go to **Settings** → **API**
2. Copy and save:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbG...` (long string)

**Save these securely - you'll need them for iOS app.**

### Step 3: Enable Required Features

#### 3a. Enable Anonymous Auth
1. Navigate to **Authentication** → **Providers**
2. Scroll to **Anonymous Users**
3. Toggle **ON**: "Enable Anonymous sign-ins"
4. Click **Save**

#### 3b. Enable PostGIS Extension
1. Navigate to **Database** → **Extensions**
2. Search: `postgis`
3. Click **Enable** next to PostGIS
4. Verify: Status shows "Enabled"

### Step 4: Run Database Schema

1. Navigate to **SQL Editor**
2. Click **"New Query"**

Run scripts in this exact order:

#### 4a. Main Schema
```sql
-- Copy entire contents of: backend/database/schema.sql
-- Paste into SQL Editor
-- Click "Run" (or Cmd/Ctrl + Enter)
```

✅ Verify: "Success. No rows returned"

#### 4b. Helper Functions
```sql
-- New Query
-- Copy: backend/database/helper-functions.sql
-- Paste and Run
```

✅ Verify: "Success"

#### 4c. Cron Job (Optional)
```sql
-- New Query
-- Copy: backend/database/cron-setup.sql
-- Paste and Run
```

⚠️ If error "pg_cron not available":
- Skip this step
- Your tier doesn't support cron
- Sessions will still work (just won't auto-cleanup as efficiently)

### Step 5: Enable Realtime

1. Navigate to **Database** → **Replication**
2. Find table: `sessions`
   - Toggle **ON**
   - Check: Insert, Update, Delete
3. Find table: `voice_sessions`
   - Toggle **ON**
   - Check: Insert, Update, Delete
4. Click **Save**

### Step 6: Deploy Edge Functions

#### 6a. Install Supabase CLI

**Windows (using npm)**:
```bash
npm install -g supabase
```

**macOS**:
```bash
brew install supabase/tap/supabase
```

Verify installation:
```bash
supabase --version
```

#### 6b. Login to Supabase
```bash
supabase login
```
(Opens browser for authentication)

#### 6c. Link Your Project

```bash
cd roadtalks/backend
supabase link --project-ref YOUR_PROJECT_REF
```

**Find Project Ref**:
- Supabase Dashboard → Settings → General
- Look for "Reference ID" (e.g., `abcdefghijk`)

#### 6d. Deploy Functions

```bash
# Deploy get-nearby-drivers
supabase functions deploy get-nearby-drivers

# Deploy create-voice-session
supabase functions deploy create-voice-session
```

✅ Wait for "Deployed successfully" message for each

#### 6e. Verify Functions Deployed
```bash
supabase functions list
```

Should show:
```
- get-nearby-drivers
- create-voice-session
```

### Step 7: Test Backend (Optional but Recommended)

Test that Edge Functions work:

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

Expected response:
```json
{
  "drivers": []
}
```

✅ **Backend deployment complete!**

---

## Part 2: iOS App Setup (Requires Mac)

### Step 1: Transfer Files to Mac

Copy this entire project folder to your Mac:
- Use AirDrop, USB drive, or cloud storage
- Ensure `ios/` folder is included

### Step 2: Install Xcode (if not installed)

1. Open **App Store** on Mac
2. Search: `Xcode`
3. Download Xcode 15+ (large file, ~10GB)
4. Install and open once to accept license

### Step 3: Create Xcode Project

1. Open Xcode
2. **File** → **New** → **Project**
3. Select: **iOS** → **App**
4. Fill in:
   - **Product Name**: `HighwayRadio`
   - **Team**: Select your Apple Developer account
   - **Organization Identifier**: `com.yourname.highwayradio`
   - **Interface**: **SwiftUI**
   - **Language**: **Swift**
   - **Storage**: None (deselect Core Data)
5. **Next** → Choose save location → **Create**

### Step 4: Set Minimum iOS Version

1. Click project name in left sidebar (blue icon)
2. Under **Targets** → **HighwayRadio**
3. **General** tab
4. Set **Minimum Deployments** → **iOS 16.0**

### Step 5: Add Swift Package Dependencies

1. **File** → **Add Package Dependencies...**

Add these two packages:

#### Package 1: Supabase
- URL: `https://github.com/supabase/supabase-swift`
- Dependency Rule: **Up to Next Major Version** → `2.0.0`
- Click **Add Package**
- Select: `Supabase` (main module)
- Click **Add Package**

#### Package 2: WebRTC
- URL: `https://github.com/stasel/WebRTC`
- Dependency Rule: **Exact Version** → `120.0.0`
- Click **Add Package**
- Select: `WebRTC`
- Click **Add Package**

### Step 6: Copy All Swift Files

1. In Finder, open: `ios/HighwayRadio/`
2. In Xcode, **right-click** on `HighwayRadio` folder → **Add Files to "HighwayRadio"...**
3. Navigate to `ios/HighwayRadio/` folder
4. Select **all folders**: `App`, `Core`, `Models`, `Services`, `ViewModels`, `Views`
5. Check: ✅ **Copy items if needed**
6. Check: ✅ **Create groups**
7. **Add to targets**: HighwayRadio (checked)
8. Click **Add**

Verify folder structure matches:
```
HighwayRadio/
├── App/
├── Core/
├── Models/
├── Services/
├── ViewModels/
└── Views/
```

### Step 7: Configure Info.plist

1. In Xcode navigator, find: `Info.plist`
2. **Right-click** → **Open As** → **Source Code**
3. Add these keys inside `<dict>`:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>Highway Radio needs microphone access for voice communication with nearby drivers.</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>Highway Radio needs your location to discover nearby drivers.</string>

<key>UIBackgroundModes</key>
<array>
  <string>audio</string>
</array>
```

### Step 8: Add Supabase Credentials

1. Open: `Core/Config/SupabaseConfig.swift`
2. Replace placeholders:

```swift
static let url = URL(string: "https://YOUR_PROJECT_REF.supabase.co")!
static let anonKey = "YOUR_ANON_KEY_HERE"
```

Use the credentials you saved in Part 1, Step 2.

### Step 9: Build to Simulator (UI Test)

1. Select simulator: **iPhone 15 Pro** (top bar)
2. Click **Run** (▶️ button) or press **Cmd + R**
3. Wait for build...
4. App should launch in simulator

⚠️ **Limitations in Simulator**:
- WebRTC doesn't work
- Location may not work properly
- No Bluetooth detection

✅ **Use simulator only for UI testing**

### Step 10: Build to Physical Device

#### 10a. Connect iPhone
1. Connect iPhone to Mac via cable
2. On iPhone: Trust this computer (enter passcode)

#### 10b. Select Device
1. In Xcode top bar: Select your iPhone (e.g., "John's iPhone")

#### 10c. Build & Run
1. Click **Run** (▶️) or **Cmd + R**
2. **First time**: Xcode may ask to register device
   - Requires Apple Developer account ($99/year if not enrolled)
   - Or use free provisioning (7-day limit)
3. Wait for build and install
4. On iPhone: App launches

⚠️ **If "Untrusted Developer" error**:
1. iPhone: **Settings** → **General** → **VPN & Device Management**
2. Tap your developer certificate
3. Tap **Trust**
4. Return to app

### Step 11: Build to Second Device

Repeat Step 10 with second iPhone for testing.

✅ **iOS app deployment complete!**

---

## Part 3: Testing with 2 Devices

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for complete testing protocol.

Quick test:
1. Launch app on Device 1
2. Enter plate: `TEST01`
3. Launch app on Device 2
4. Enter plate: `TEST02`
5. Walk devices apart (1-100m)
6. Check if Device 1 sees `TEST02` in Radar
7. Tap driver → Connect (with Bluetooth headphones)
8. Test PTT button

---

## Troubleshooting

### Backend Issues

**Error: "UNIQUE constraint failed"**
- Cause: Old unique constraint still exists
- Fix: Re-run schema.sql (it will recreate tables)

**Edge Functions return 404**
- Cause: Not deployed or wrong URL
- Fix: Run `supabase functions list` to verify
- Redeploy if needed

**"Row level security policy violation"**
- Cause: Anonymous auth not enabled or user not authenticated
- Fix: Check Authentication → Providers → Anonymous is ON

### iOS Issues

**"Cannot find module 'Supabase'"**
- Cause: Swift package not added
- Fix: File → Add Package Dependencies → Add supabase-swift

**"Untrusted Developer"**
- Cause: First time installing from your developer cert
- Fix: Settings → General → VPN & Device Management → Trust

**Location not updating**
- Cause: Permission not granted
- Fix: Settings → HighwayRadio → Location → While Using the App

**No nearby drivers shown**
- Cause: Devices too far apart (>1km) or backend issue
- Fix: Bring devices within 100m, check backend deployed

**PTT button disabled**
- Cause: No Bluetooth/headphones connected
- Fix: Connect Bluetooth headset or wired headphones

---

## Summary Checklist

### Backend ✅
- [ ] Supabase project created
- [ ] Credentials saved
- [ ] Anonymous auth enabled
- [ ] PostGIS enabled
- [ ] Schema deployed (schema.sql)
- [ ] Helper functions deployed
- [ ] Cron setup (optional)
- [ ] Realtime enabled for both tables
- [ ] Edge Functions deployed
- [ ] Edge Functions tested with curl

### iOS ✅
- [ ] Xcode project created
- [ ] Minimum iOS 16.0 set
- [ ] Supabase package added
- [ ] WebRTC package added
- [ ] All Swift files copied
- [ ] Info.plist configured
- [ ] Supabase credentials updated
- [ ] Build succeeds
- [ ] App runs on Device 1
- [ ] App runs on Device 2

### Testing ✅
- [ ] Both devices see each other in Radar
- [ ] Distance calculated correctly
- [ ] Direction shown (ahead/behind)
- [ ] Bluetooth check works
- [ ] Voice call connects
- [ ] PTT transmits (after WebRTC implementation)
- [ ] Call disconnect works

---

**You're ready to build Highway Radio! 🚀**
