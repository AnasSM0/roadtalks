// ============================================
// Edge Function: create-voice-session
// ============================================
// Purpose: Initiate voice call between two drivers
// Auth: Requires authenticated user (caller)
// ============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateVoiceSessionRequest {
  receiver_plate: string;
}

interface VoiceSessionResponse {
  session_id: string;
  status: "pending";
  created_at: string;
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
    const { receiver_plate }: CreateVoiceSessionRequest = await req.json();

    if (!receiver_plate) {
      return new Response(
        JSON.stringify({ error: "receiver_plate is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 1. Get caller's session
    const { data: callerSession, error: callerError } = await supabaseClient
      .from("sessions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (callerError || !callerSession) {
      return new Response(
        JSON.stringify({ error: "Caller session not found. Please start a session first." }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 2. Get receiver's session by plate
    // Check for existing active sessions with same plate and handle duplicates
    const { data: receiverSessions, error: receiverError } = await supabaseClient
      .from("sessions")
      .select("*")
      .eq("plate", receiver_plate)
      .gt("last_seen", new Date(Date.now() - 30000).toISOString()); // within 30 seconds

    if (receiverError) {
      return new Response(
        JSON.stringify({ error: "Failed to query receiver session", details: receiverError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!receiverSessions || receiverSessions.length === 0) {
      return new Response(
        JSON.stringify({ error: "Receiver not found or offline" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // If multiple sessions with same plate exist (race condition), use most recent
    const receiverSession = receiverSessions.sort((a, b) =>
      new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime()
    )[0];

    // Delete stale duplicate sessions
    if (receiverSessions.length > 1) {
      const staleIds = receiverSessions
        .filter((s) => s.id !== receiverSession.id)
        .map((s) => s.id);

      await supabaseClient
        .from("sessions")
        .delete()
        .in("id", staleIds);
    }

    // 3. Calculate distance between caller and receiver
    const { data: distanceResult, error: distanceError } = await supabaseClient.rpc(
      "calculate_distance",
      {
        lat1: callerSession.location ? parseFloat((callerSession.location as any).coordinates[1]) : 0,
        lng1: callerSession.location ? parseFloat((callerSession.location as any).coordinates[0]) : 0,
        lat2: receiverSession.location ? parseFloat((receiverSession.location as any).coordinates[1]) : 0,
        lng2: receiverSession.location ? parseFloat((receiverSession.location as any).coordinates[0]) : 0,
      }
    );

    // For MVP: 1km distance limit
    const MAX_DISTANCE = 1000; // meters

    // Note: If PostGIS function fails, we'll allow the call (optimistic approach for MVP)
    if (!distanceError && distanceResult > MAX_DISTANCE) {
      return new Response(
        JSON.stringify({
          error: "Driver too far away",
          distance: Math.round(distanceResult),
          max_distance: MAX_DISTANCE,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 4. Check if either party is already in an active call
    const { data: existingCalls, error: existingCallsError } = await supabaseClient
      .from("voice_sessions")
      .select("*")
      .in("status", ["pending", "active"])
      .or(`caller_user_id.eq.${user.id},receiver_user_id.eq.${user.id},caller_user_id.eq.${receiverSession.user_id},receiver_user_id.eq.${receiverSession.user_id}`);

    if (existingCallsError) {
      console.error("Error checking existing calls:", existingCallsError);
    }

    if (existingCalls && existingCalls.length > 0) {
      return new Response(
        JSON.stringify({ error: "You or the receiver are already in a call" }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 5. Create voice session
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    const { data: voiceSession, error: createError } = await supabaseClient
      .from("voice_sessions")
      .insert({
        caller_user_id: user.id,
        receiver_user_id: receiverSession.user_id,
        caller_plate: callerSession.plate,
        receiver_plate: receiverSession.plate,
        status: "pending",
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (createError || !voiceSession) {
      return new Response(
        JSON.stringify({ error: "Failed to create voice session", details: createError?.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 6. Broadcast 'call_incoming' event to receiver via Realtime
    // This is handled by the client listening on realtime channels
    // The client will subscribe to voice_sessions table changes where receiver_user_id = their user_id

    const response: VoiceSessionResponse = {
      session_id: voiceSession.id,
      status: "pending",
      created_at: voiceSession.created_at,
    };

    return new Response(JSON.stringify(response), {
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
// REQUIRED DATABASE FUNCTION (Optional for Distance Check)
// ============================================
// Add this SQL function for distance calculation:
/*

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

*/
