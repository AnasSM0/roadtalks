# Highway Radio Backend

Backend infrastructure for Highway Radio MVP - a walkie-talkie style voice communication app for highway drivers.

## Architecture

- **Database**: Supabase PostgreSQL with PostGIS for geospatial queries
- **Auth**: Supabase Anonymous Authentication
- **Edge Functions**: Deno-based serverless functions
- **Realtime**: Supabase Realtime for presence and signaling

## Structure

```
backend/
├── database/
│   ├── schema.sql              # Main database schema with RLS policies
│   ├── helper-functions.sql    # PostGIS helper functions
│   └── cron-setup.sql          # Cleanup cron configuration
├── supabase/
│   └── functions/
│       ├── get-nearby-drivers/
│       │   └── index.ts        # Proximity query Edge Function
│       └── create-voice-session/
│           └── index.ts        # Voice call initiation Edge Function
├── SETUP.md                    # Complete setup instructions
├── package.json                # Node.js package configuration
└── README.md                   # This file
```

## Quick Start

1. **Setup Supabase**: Follow [SETUP.md](./SETUP.md) for complete instructions

2. **Deploy Edge Functions**:
   ```bash
   npm run deploy:all
   ```

3. **Test Functions**:
   See SETUP.md for curl commands

## Key Features

### Database Schema
- **sessions**: Active driver sessions with location, speed, heading
- **voice_sessions**: Voice call tracking with status management
- **RLS Policies**: Secure data access tied to `auth.uid()`

### Edge Functions
- **get-nearby-drivers**: Find drivers within 1km radius using PostGIS
- **create-voice-session**: Initiate voice calls with distance validation

### Security
- All RLS policies enforce `auth.uid()` checks
- No UNIQUE constraint on plates (app-level enforcement)
- Anonymous auth for MVP simplicity

## Environment Variables

Required in Supabase Edge Functions (set automatically):
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Public anonymous key

## Testing

### Manual Database Testing
Use Supabase Table Editor to:
1. Create test sessions with mock locations
2. Query nearby drivers
3. Verify RLS policies

### Edge Function Testing
```bash
# Test nearby drivers (replace with your credentials)
curl -X POST 'https://YOUR_PROJECT.supabase.co/functions/v1/get-nearby-drivers' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"lat": 37.7749, "lng": -122.4194, "radius": 1000}'
```

## MVP Specifications

- **Proximity Radius**: 1km (expandable to 5km later)
- **Direction**: Ahead/Behind only (Left/Right in Phase 2)
- **Session Timeout**: 30 seconds of inactivity
- **Cleanup Frequency**: Every 60 seconds (via pg_cron)
- **Voice Session Expiry**: 5 minutes

## Troubleshooting

See [SETUP.md](./SETUP.md) for complete troubleshooting guide.

Common issues:
- **RLS permission errors**: Re-run schema.sql RLS section
- **Function not found**: Run helper-functions.sql
- **PostGIS errors**: Enable PostGIS extension
- **Edge Function 404**: Verify deployment with `supabase functions list`

## Next Steps

After backend setup:
1. **iOS App Development**: Integrate Supabase Swift client
2. **WebRTC Signaling**: Use Realtime channels for offer/answer/ICE
3. **Testing**: Multi-device testing with real locations

## License

MIT
