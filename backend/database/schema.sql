-- ============================================
-- Highway Radio MVP - Database Schema
-- ============================================
-- This schema implements:
-- - Sessions table for active driver sessions
-- - Voice sessions table for call tracking
-- - Row Level Security (RLS) policies tied to auth.uid()
-- - PostGIS for geospatial queries
-- - No UNIQUE constraint on plates (app-level enforcement)
-- ============================================

-- Enable PostGIS extension for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================
-- TABLE: sessions
-- ============================================
-- Stores active driver sessions with location, speed, and heading
-- Uniqueness enforced at app/function level to avoid race conditions

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plate TEXT NOT NULL,
  vehicle_type TEXT,
  location GEOGRAPHY(POINT, 4326), -- PostGIS geography type
  speed FLOAT, -- meters per second
  heading FLOAT, -- degrees (0-360)
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  -- NO UNIQUE constraint on plate (enforced at app/function level to avoid race conditions)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_location ON sessions USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_sessions_last_seen ON sessions(last_seen);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_plate_active ON sessions(plate) WHERE last_seen > NOW() - INTERVAL '30 seconds';

-- ============================================
-- TABLE: voice_sessions
-- ============================================
-- Tracks voice call sessions between drivers

CREATE TABLE IF NOT EXISTS voice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caller_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  caller_plate TEXT NOT NULL,
  receiver_plate TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'ended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_voice_sessions_status ON voice_sessions(status);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_caller ON voice_sessions(caller_user_id);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_receiver ON voice_sessions(receiver_user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- All policies tied to auth.uid() for security

-- Enable RLS on both tables
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SESSIONS TABLE POLICIES
-- ============================================

-- Policy: Anyone can read active sessions (for discovery)
-- Active = last_seen within 30 seconds
CREATE POLICY "Active sessions are viewable by all"
  ON sessions FOR SELECT
  USING (last_seen > NOW() - INTERVAL '30 seconds');

-- Policy: Users can ONLY insert their own session
CREATE POLICY "Users manage own session only"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can ONLY update their own session
CREATE POLICY "Users update own session only"
  ON sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can ONLY delete their own session
CREATE POLICY "Users delete own session only"
  ON sessions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- VOICE_SESSIONS TABLE POLICIES
-- ============================================

-- Policy: Users can read sessions they're involved in
CREATE POLICY "Users view own voice sessions"
  ON voice_sessions FOR SELECT
  USING (
    auth.uid() = caller_user_id OR 
    auth.uid() = receiver_user_id
  );

-- Policy: Only caller can create voice session
CREATE POLICY "Caller creates voice session"
  ON voice_sessions FOR INSERT
  WITH CHECK (auth.uid() = caller_user_id);

-- Policy: Participants can update voice session
CREATE POLICY "Participants update voice session"
  ON voice_sessions FOR UPDATE
  USING (
    auth.uid() = caller_user_id OR 
    auth.uid() = receiver_user_id
  );

-- Policy: Participants can delete voice session
CREATE POLICY "Participants delete voice session"
  ON voice_sessions FOR DELETE
  USING (
    auth.uid() = caller_user_id OR 
    auth.uid() = receiver_user_id
  );

-- ============================================
-- CLEANUP FUNCTION (called by cron)
-- ============================================
-- Removes stale sessions and expires voice sessions

CREATE OR REPLACE FUNCTION cleanup_stale_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete sessions older than 30 seconds
  DELETE FROM sessions
  WHERE last_seen < NOW() - INTERVAL '30 seconds';

  -- End voice sessions that have expired
  UPDATE voice_sessions
  SET status = 'ended',
      ended_at = NOW()
  WHERE status IN ('pending', 'active')
    AND (
      expires_at < NOW() OR
      expires_at IS NULL
    );

  -- End voice sessions where either participant's session is gone
  UPDATE voice_sessions
  SET status = 'ended',
      ended_at = NOW()
  WHERE status IN ('pending', 'active')
    AND (
      caller_user_id NOT IN (SELECT user_id FROM sessions WHERE last_seen > NOW() - INTERVAL '30 seconds') OR
      receiver_user_id NOT IN (SELECT user_id FROM sessions WHERE last_seen > NOW() - INTERVAL '30 seconds')
    );
END;
$$;

-- ============================================
-- NOTES FOR SUPABASE SETUP
-- ============================================
-- 1. Run this schema in Supabase SQL Editor
-- 2. Enable Anonymous Auth in Authentication > Providers
-- 3. Configure Realtime:
--    - Navigate to Database > Replication
--    - Enable replication for: sessions, voice_sessions
-- 4. Setup pg_cron for cleanup (run every 60 seconds):
--    SELECT cron.schedule('cleanup-stale-sessions', '0 * * * * *', 'SELECT cleanup_stale_sessions()');
--    (Note: pg_cron may require enabling via Dashboard > Extensions)
