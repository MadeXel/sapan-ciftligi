// Server-side replay of a Sapan Çiftliği game log.
// Must mirror the client exactly: same RNG, same spawn rules, same scoring.
export const W = 420, H = 720, F = 16, DANGER_Y = H - 150;
export const RADII = [17, 22, 28, 34, 41, 48, 56, 64, 73, 83, 94];
const VAL = RADII.map((_, i) => 2 ** (i + 1));
const TOP = 10;
// same order as the client's MODS list; only the fields that affect spawning/scoring matter here
const MODS = [{ id: "buz" }, { id: "ruzgar" }, { id: "kalabalik", start: 7 }, { id: "unicorn", uni: 0.2 }, { id: "camur" }, { id: "guclu" }];

export const seedOf = (s) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
export const mulberry = (a) => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

export function makePicker(seed, mod) {
  const rand = mulberry(seed); let shots = 0, lastUni = false;
  return (mergeMax) => {
    const u1 = rand(), u2 = rand(); shots++;
    const uP = (mod && mod.uni) || 0.055, minS = mod && mod.uni ? 4 : 12;
    if (shots > minS && !lastUni && u1 < uP) { lastUni = true; return -1; }
    lastUni = false;
    const cap = Math.max(1, Math.min(4, mergeMax - 1)), w = [6, 5, 3, 2, 1].slice(0, cap + 1), tot = w.reduce((a, b) => a + b, 0);
    let r = u2 * tot; for (let i = 0; i < w.length; i++) { if ((r -= w[i]) < 0) return i; } return 0;
  };
}
export function placeStart(seed, mod) {
  if (!mod || !mod.start) return [];
  const r2 = mulberry((seed ^ 0x9E3779B9) >>> 0), out = []; let tries = 0;
  while (out.length < mod.start && tries++ < 200) {
    const lv = Math.floor(r2() * 4), r = RADII[lv];
    const b = { lv, r, x: F + r + r2() * (W - 2 * F - 2 * r), y: F + r + r2() * (DANGER_Y - 190 - r) };
    if (out.every((o) => (Math.hypot(o.x - b.x, o.y - b.y) > o.r + b.r + 4 && o.lv !== b.lv) || Math.hypot(o.x - b.x, o.y - b.y) > o.r + b.r + 40)) out.push(b);
  }
  return out.map((b) => b.lv);
}
export const modFor = (mode, day) => (mode === "daily" ? MODS[seedOf("m" + day) % MODS.length] : null);
export const seedFor = (mode, day, sessionSeed) => (mode === "daily" ? seedOf("d" + day) : Number(sessionSeed) >>> 0);

// Returns {ok, score, merges, maxLv, duration, shots} or {ok:false, reason}
export function replay(events, { mode, day, seed }) {
  const fail = (reason, i) => ({ ok: false, reason, at: i });
  if (!Array.isArray(events) || events.length > 30000) return fail("gunluk-boyut");
  const mod = modFor(mode, day), s = seedFor(mode, day, seed), pick = makePicker(s, mod);
  const inv = new Array(11).fill(0); let uni = 0;
  for (const lv of placeStart(s, mod)) inv[lv]++;
  let mergeMax = 0, maxLv = 0, score = 0, merges = 0, combo = 0, lastMerge = -9, lastT = 0, lastShot = -9, shots = 0, revives = 0;
  let cur = pick(0), next = pick(0);
  const gain = (v, t) => { combo = t - lastMerge < 1.3 ? combo + 1 : 1; lastMerge = t; return v * Math.min(combo, 5); };
  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    if (!Array.isArray(e) || e.length < 2) return fail("olay-bicimi", i);
    const [k, t] = e;
    if (typeof t !== "number" || !isFinite(t) || t < lastT - 1e-9 || t > 6 * 3600) return fail("zaman", i);
    lastT = t;
    const lv = e[2];
    switch (k) {
      case "s": {
        if (lv !== cur) return fail("sira-disi-atis", i);
        if (t - lastShot < 0.25) return fail("insanustu-hiz", i);
        lastShot = t; shots++;
        if (lv === -1) uni++; else { inv[lv]++; if (lv > maxLv) maxLv = lv; }
        cur = next; next = pick(mergeMax);
        break;
      }
      case "w": { const x = cur; cur = next; next = x; break; }
      case "m": {
        if (!Number.isInteger(lv) || lv < 0 || lv > TOP || inv[lv] < 2) return fail("olmayan-birlesme", i);
        inv[lv] -= 2;
        if (lv === TOP) { score += 4096; }
        else { merges++; inv[lv + 1]++; if (lv + 1 > mergeMax) mergeMax = lv + 1; if (lv + 1 > maxLv) maxLv = lv + 1; score += gain(VAL[lv + 1], t); }
        break;
      }
      case "u": {
        if (!Number.isInteger(lv) || lv < 0 || lv > TOP || uni < 1 || inv[lv] < 1) return fail("olmayan-sihir", i);
        uni--;
        if (lv < TOP) { inv[lv]--; inv[lv + 1]++; if (lv + 1 > mergeMax) mergeMax = lv + 1; if (lv + 1 > maxLv) maxLv = lv + 1; score += gain(VAL[lv + 1], t); }
        else score += gain(1024, t);
        break;
      }
      case "r": {
        if (++revives > 1) return fail("coklu-ikinci-sans", i);
        if (!Array.isArray(lv)) return fail("olay-bicimi", i);
        for (const x of lv) {
          if (x === -1) { if (uni < 1) return fail("olmayan-hayvan", i); uni--; }
          else { if (!Number.isInteger(x) || x < 0 || x > TOP || inv[x] < 1) return fail("olmayan-hayvan", i); inv[x]--; }
        }
        break;
      }
      default: return fail("bilinmeyen-olay", i);
    }
  }
  if (shots === 0) return fail("bos-oyun");
  return { ok: true, score, merges, maxLv, duration: lastT, shots };
}
