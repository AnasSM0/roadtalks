-- ============================================
-- Supabase Cron Job Configuration
-- ============================================
-- Purpose: Setup pg_cron to automatically cleanup stale sessions
-- Run this in Supabase SQL Editor AFTER schema.sql
-- ============================================

-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule cleanup function to run every 60 seconds
-- Cron syntax: 'second minute hour day month weekday'
-- '0 * * * * *' = At second 0 of every minute (every 60 seconds)
SELECT cron.schedule(
  'cleanup-stale-sessions',
  '0 * * * * *',
  'SELECT cleanup_stale_sessions();'
);

-- ============================================
-- Verify Cron Job
-- ============================================
-- Check that the cron job was created successfully:
-- SELECT * FROM cron.job;

-- To see cron job run history:
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;

-- ============================================
-- NOTES
-- ============================================
-- 1. This runs every 60 seconds (optimized from 15s to reduce DB load)
-- 2. If pg_cron is not available in your Supabase tier:
--    - Alternative 1: Call cleanup function from Edge Function on a schedule
--    - Alternative 2: Call from client app every 30-60 seconds
-- 3. For local development: pg_cron may not work in Supabase local dev
--    You can manually call: SELECT cleanup_stale_sessions();
