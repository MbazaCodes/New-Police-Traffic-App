// ===== TZ Police — Edge Function: track-patrol =====
// Updates the GPS location of an active patrol in realtime.
// Used by the officer mobile app to report its current position every ~10s.
//
// Trigger: POST /functions/v1/track-patrol
// Headers: Authorization: Bearer <jwt>
// Body: {
//   patrol_id: string,
//   latitude: number,
//   longitude: number,
//   progress?: number,    // 0-100
//   distance_km?: number  // optional running total
// }
// Side effects:
//   * Updates patrols.last_latitude / last_longitude / last_updated_at
//   * Broadcasts the new position over Supabase Realtime channel "patrol:<id>"
//     (Mock: writes a row to `patrol_track_points` so subscribers can SELECT.)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

interface TrackPatrolBody {
  patrol_id?: string;
  latitude?: number;
  longitude?: number;
  progress?: number;
  distance_km?: number;
}

function isFiniteNumber(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Require auth (verify_jwt is enabled for this function in config.toml)
  const auth = req.headers.get("Authorization") ?? "";
  if (!auth.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Missing bearer token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: TrackPatrolBody = {};
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const patrolId = (body.patrol_id ?? "").trim();
  const lat = body.latitude;
  const lng = body.longitude;

  if (!patrolId || !isFiniteNumber(lat) || !isFiniteNumber(lng)) {
    return new Response(
      JSON.stringify({ error: "Missing 'patrol_id', 'latitude', or 'longitude'" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(
      JSON.stringify({ error: "Server missing Supabase credentials" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  // 1. Ensure the patrol exists and is active
  const { data: patrol, error: patrolErr } = await supabase
    .from("patrols")
    .select("id, status, officer_id")
    .eq("id", patrolId)
    .maybeSingle();

  if (patrolErr || !patrol) {
    return new Response(
      JSON.stringify({ error: "Patrol not found" }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  }

  if (patrol.status !== "active") {
    return new Response(
      JSON.stringify({ error: `Patrol is ${patrol.status}, cannot track` }),
      { status: 409, headers: { "Content-Type": "application/json" } },
    );
  }

  // 2. Update the patrol's last-known position
  const update: Record<string, unknown> = {
    last_latitude: lat,
    last_longitude: lng,
    last_updated_at: new Date().toISOString(),
  };
  if (isFiniteNumber(body.progress)) {
    update.progress = Math.max(0, Math.min(100, body.progress as number));
  }
  if (isFiniteNumber(body.distance_km)) {
    update.distance_km = body.distance_km;
  }

  const { error: updateErr } = await supabase
    .from("patrols")
    .update(update)
    .eq("id", patrolId);

  if (updateErr) {
    return new Response(
      JSON.stringify({ error: "Failed to update patrol", details: String(updateErr) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  // 3. Append a track point so realtime subscribers (officer + commander map)
  //    can stream the path. Table: patrol_track_points
  //    (id uuid, patrol_id uuid, latitude numeric, longitude numeric,
  //     recorded_at timestamptz)
  await supabase.from("patrol_track_points").insert({
    patrol_id: patrolId,
    latitude: lat,
    longitude: lng,
    recorded_at: new Date().toISOString(),
  }).then(({ error }: { error: unknown }) => {
    if (error) {
      // Non-fatal — we already updated the patrol row.
      console.warn("patrol_track_points insert failed (table may not exist):", error);
    }
  });

  return new Response(
    JSON.stringify({
      ok: true,
      patrol_id: patrolId,
      latitude: lat,
      longitude: lng,
      updated_at: update.last_updated_at,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});
