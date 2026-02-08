Database Tables
sessions

id (uuid)

plate (text)

vehicle_type (text)

lat (float)

lng (float)

speed (float)

heading (float)

last_seen (timestamp)

voice_sessions

id (uuid)

caller_plate

receiver_plate

status

created_at

expires_at

API / Realtime Events
Presence

session_join

session_update

session_leave

Voice Signaling

offer

answer

ice_candidate

disconnect

Proximity Logic

Radius check (PostGIS)

Direction computed via heading vector math

Enforced server-side