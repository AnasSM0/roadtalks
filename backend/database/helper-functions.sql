-- ============================================
-- Helper SQL Functions for Edge Functions
-- ============================================
-- These functions are called by Edge Functions for efficient database operations
-- Run these AFTER the main schema.sql
-- ============================================

-- ============================================
-- FUNCTION: get_nearby_sessions
-- ============================================
-- Used by: get-nearby-drivers Edge Function
-- Purpose: Find all active sessions within radius using PostGIS

CREATE OR REPLACE FUNCTION get_nearby_sessions(
  my_lat FLOAT,
  my_lng FLOAT,
  search_radius FLOAT,
  my_user_id UUID
)
RETURNS TABLE (
  plate TEXT,
  vehicle_type TEXT,
  lat FLOAT,
  lng FLOAT,
  heading FLOAT,
  last_seen TIMESTAMP WITH TIME ZONE,
  distance FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.plate,
    s.vehicle_type,
    ST_Y(s.location::geometry) AS lat,
    ST_X(s.location::geometry) AS lng,
    s.heading,
    s.last_seen,
    ST_Distance(
      s.location,
      ST_SetSRID(ST_MakePoint(my_lng, my_lat), 4326)::geography
    ) AS distance
  FROM sessions s
  WHERE
    s.user_id != my_user_id -- exclude current user
    AND s.last_seen > NOW() - INTERVAL '30 seconds' -- only active sessions
    AND ST_DWithin(
      s.location,
      ST_SetSRID(ST_MakePoint(my_lng, my_lat), 4326)::geography,
      search_radius
    )
  ORDER BY distance ASC;
END;
$$;

-- ============================================
-- FUNCTION: calculate_distance
-- ============================================
-- Used by: create-voice-session Edge Function
-- Purpose: Calculate distance between two points

CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 FLOAT,
  lng1 FLOAT,
  lat2 FLOAT,
  lng2 FLOAT
)
RETURNS FLOAT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  distance_meters FLOAT;
BEGIN
  SELECT ST_Distance(
    ST_SetSRID(ST_MakePoint(lng1, lat1), 4326)::geography,
    ST_SetSRID(ST_MakePoint(lng2, lat2), 4326)::geography
  ) INTO distance_meters;
  
  RETURN distance_meters;
END;
$$;

-- ============================================
-- NOTES
-- ============================================
-- These functions use SECURITY DEFINER to bypass RLS
-- This is safe because:
-- 1. They only return data that RLS policies would allow anyway
-- 2. They're called by authenticated Edge Functions
-- 3. They perform additional checks (e.g., active sessions only)
