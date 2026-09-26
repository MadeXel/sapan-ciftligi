// Sapan Çiftliği — authoritative score submission.
// The client never tells us its score directly: we replay its event log against the
// server-issued seed, recompute the score, and only then record it.
import { createClient } from "jsr:@supabase/supabase-js@2";
import { replay } from "./replay.js";

// web game + Capacitor apps (iOS: capacitor://localhost, Android: https://localhost)
const ORIGINS = ["https://madexel.github.io", "capacitor://localhost", "https://localhost"];
const MAX_BODY = 400_000;

function cors(req: Request) {
  const o = req.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ORIGINS.includes(o) ? o : ORIGINS[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}
const json = (req: Request, status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors(req), "Content-Type": "application/json" } });

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  if (req.method !== "POST") return json(req, 405, { error: "yontem" });

  const raw = await req.text();
  if (raw.length > MAX_BODY) return json(req, 413, { error: "istek-cok-buyuk" });
  let b: any;
  try { b = JSON.parse(raw); } catch { return json(req, 400, { error: "bicim" }); }
  const { session, device, name, score, merges, events } = b ?? {};
  if (typeof session !== "string" || !UUID.test(session) || typeof device !== "string" || !UUID.test(device))
    return json(req, 400, { error: "kimlik" });
  if (typeof name !== "string" || !Number.isInteger(score) || !Number.isInteger(merges) || !Array.isArray(events))
    return json(req, 400, { error: "bicim" });

  const { data: s, error: se } = await db.from("sessions").select("*").eq("id", session).maybeSingle();
  if (se) return json(req, 500, { error: "sunucu" });
  if (!s || s.used) return json(req, 409, { error: "oturum" });
  if (s.device_id !== device) return json(req, 403, { error: "oturum-cihaz" });

  const wall = (Date.now() - new Date(s.started_at).getTime()) / 1000;
  const reject = async (reason: string, detail: unknown) => {
    await db.rpc("reject_session", { p_session: session, p_device: device, p_reason: reason, p_detail: detail });
    return json(req, 422, { error: reason });
  };
  if (wall > 6 * 3600) return reject("oturum-suresi-doldu", { wall });

  const r: any = replay(events, { mode: s.mode, day: s.day, seed: s.seed });
  if (!r.ok) return reject(r.reason, { at: r.at, n: events.length });
  // game time can only be shorter than real time (pauses make it shorter, never longer)
  if (r.duration > wall + 5) return reject("zaman-tutarsiz", { game: r.duration, wall });
  if (r.score !== score || r.merges !== merges)
    return reject("skor-tutarsiz", { client: [score, merges], server: [r.score, r.merges] });

  const { data: ranks, error: re } = await db.rpc("record_score", {
    p_session: session, p_name: name, p_score: r.score, p_max_lv: r.maxLv, p_merges: r.merges, p_duration: r.duration,
  });
  if (re) return json(req, 400, { error: re.message.includes("engelli") ? "engelli" : "kayit" });
  return json(req, 200, ranks);
});
