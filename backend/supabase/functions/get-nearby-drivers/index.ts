// ============================================
// Edge Function: get-nearby-drivers
// ============================================
// Purpose: Query nearby drivers within radius using PostGIS
// Auth: Requires authenticated user (anonymous or regular)
// ============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// CORS headers for client requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NearbyDriversRequest {
  lat: number;
  lng: number;
  radius?: number; // meters, default 1000
}

interface Driver {
  plate: string;
  vehicle_type: string | null;
  distance: number; // meters
  direction: "ahead" | "behind";
  heading: number | null;
  last_seen: string;
}

// Helper: Calculate bearing between two points
function calculateBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const dLng = toRad(lng2 - lng1);
  const lat1Rad = toRad(lat1);
  const lat2Rad = toRad(lat2);

  const y = Math.sin(dLng) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);

  const bearing = toDeg(Math.atan2(y, x));
  return (bearing + 360) % 360;
}

// Helper: Calculate direction (ahead or behind) based on heading
function calculateDirection(myHeading: number | null, bearing: number): "ahead" | "behind" {
  if (myHeading === null) {
    // Default to ahead if heading unknown
    return "ahead";
  }

  const relativeAngle = (bearing - myHeading + 360) % 360;

  // MVP: Simplified to ahead/behind only
  if (relativeAngle < 90 || relativeAngle >= 270) {
    return "ahead";
  } else {
    return "behind";
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get Supabase client with user's auth
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    const { lat, lng, radius = 1000 }: NearbyDriversRequest = await req.json();

    // Validate inputs
    if (typeof lat !== "number" || typeof lng !== "number") {
      return new Response(
        JSON.stringify({ error: "Invalid lat/lng parameters" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get current user's session to retrieve their heading
    const { data: mySession } = await supabaseClient
      .from("sessions")
      .select("heading")
      .eq("user_id", user.id)
      .single();

    const myHeading = mySession?.heading ?? null;

    // Query nearby drivers using PostGIS ST_DWithin
    // Exclude current user and stale sessions
    const { data: nearbySessions, error } = await supabaseClient.rpc(
      "get_nearby_sessions",
      {
        my_lat: lat,
        my_lng: lng,
        search_radius: radius,
        my_user_id: user.id,
      }
    );

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ error: "Database query failed", details: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Process results: calculate direction for each driver
    const drivers: Driver[] = (nearbySessions || []).map((session: any) => {
      const bearing = calculateBearing(lat, lng, session.lat, session.lng);
      const direction = calculateDirection(myHeading, bearing);

      return {
        plate: session.plate,
        vehicle_type: session.vehicle_type,
        distance: Math.round(session.distance), // round to nearest meter
        direction,
        heading: session.heading,
        last_seen: session.last_seen,
      };
    });

    // Sort by distance (closest first)
    drivers.sort((a, b) => a.distance - b.distance);

    return new Response(JSON.stringify({ drivers }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// ============================================
// REQUIRED DATABASE FUNCTION
// ============================================
// This Edge Function calls a PostgreSQL function for efficient PostGIS queries.
// Add this SQL function to your database:
/*

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

*/
