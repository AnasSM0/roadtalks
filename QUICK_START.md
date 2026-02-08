# Highway Radio - Quick Start

**60-second overview** → Get from zero to working app.

---

## What Is This?

Highway Radio is a **walkie-talkie app for drivers**. Discover nearby cars on the highway and talk to them hands-free.

---

## What You Need

1. **Supabase account** (free): [supabase.com](https://supabase.com)
2. **Mac with Xcode** (for iOS build)
3. **2 iPhones** (iOS 16+) for testing
4. **Bluetooth headsets** (safety requirement)

---

## 5-Minute Backend Setup

```bash
# 1. Create Supabase project (web UI)
# 2. Enable: Anonymous Auth + PostGIS extension
# 3. Run 3 SQL files in SQL Editor:
#    - backend/database/schema.sql
#    - backend/database/helper-functions.sql
#    - backend/database/cron-setup.sql
# 4. Enable Realtime for: sessions, voice_sessions

# 5. Deploy Edge Functions
npm install -g supabase
supabase login
cd roadtalks/backend
supabase link --project-ref YOUR_REF
supabase functions deploy get-nearby-drivers
supabase functions deploy create-voice-session
```

**Save**: Project URL + Anon Key

---

## 10-Minute iOS Setup (on Mac)

```bash
# 1. Open Xcode → New Project
#    Name: HighwayRadio
#    Interface: SwiftUI
#    Min iOS: 16.0

# 2. Add Packages:
#    - supabase-swift (2.x)
#    - WebRTC (120.0.0)

# 3. Copy all files from ios/HighwayRadio/ into Xcode

# 4. Edit Info.plist - add:
#    - NSMicrophoneUsageDescription
#    - NSLocationWhenInUseUsageDescription  
#    - UIBackgroundModes: audio

# 5. Edit Core/Config/SupabaseConfig.swift:
#    - Replace YOUR_SUPABASE_URL
#    - Replace YOUR_ANON_KEY

# 6. Build to 2 iPhones
#    Cmd + R → Select iPhone → Run
```

---

## First Test

**Device 1**:
1. Enter plate: `CAR01`
2. Grant permissions

**Device 2**:
1. Enter plate: `CAR02`
2. Grant permissions
3. Walk 50m apart
4. Check Radar → Should see `CAR01`

✅ **Success!** Proximity detection working.

---

## What's Next?

- [ ] Full WebRTC implementation (voice calls)
- [ ] Test with real headsets
- [ ] Drive test on actual highway
- [ ] App Store submission prep

---

## File Structure

```
roadtalks/
├── backend/               # Supabase setup
│   ├── database/          # SQL files
│   └── supabase/functions/ # Edge Functions
├── ios/                   # iOS app code
│   └── HighwayRadio/      # All Swift files
├── DEPLOYMENT_GUIDE.md    # Detailed setup
├── TESTING_GUIDE.md       # Testing protocol
└── QUICK_START.md         # This file
```

---

## Help

**Backend issues?** → [backend/SETUP.md](backend/SETUP.md)

**iOS issues?** → [ios/README.md](ios/README.md)

**Testing?** → [TESTING_GUIDE.md](TESTING_GUIDE.md)

---

**Let's build! 🚀**
