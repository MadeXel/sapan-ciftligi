import * as THREE from './node_modules/three/build/three.module.js';
import { TOY } from './style.js';

const M = (c, r = TOY.body, extra = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: 0, ...extra });
const mesh = (g, m) => { const o = new THREE.Mesh(g, m); o.castShadow = o.receiveShadow = true; return o; };
const sph = (r, m, w = 48, h = 32) => mesh(new THREE.SphereGeometry(r, w, h), m);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
// point on the (squashed) body surface in a direction; faces sit around FACE
const BODY = { sy: 0.9 };
const FACE = V(0, 0.42, 0.9).normalize();
function surf(dir, r = 1, lift = 0) { const d = dir.clone().normalize(); return V(d.x * (r + lift), d.y * (r + lift) * BODY.sy, d.z * (r + lift)); }
function faceDir(dx, dy) { // offset around the face centre (dx right, dy up on the face)
  const right = V(1, 0, 0), up = V(0, 1, 0).sub(FACE.clone().multiplyScalar(FACE.y)).normalize();
  return FACE.clone().add(right.multiplyScalar(dx)).add(up.multiplyScalar(dy)).normalize();
}
function lookOut(o, dir) { o.lookAt(o.position.clone().add(dir)); return o; }
function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }

function body(color, { map, r = 1 } = {}) { const b = sph(r, M(color, TOY.body, map ? { map } : {}), 64, 48); b.scale.y = BODY.sy; return b; }
function eyes(g, { dx = 0.3, dy = 0.08, size = 0.13, sleep = false, color = '#1E1A1A' } = {}) {
  for (const s of [-1, 1]) {
    const p = surf(faceDir(s * dx, dy), 1, -0.02);
    if (sleep) { // closed, content eyes: a small upward-curved lid line
      const arc = mesh(new THREE.TorusGeometry(size * 0.75, size * 0.2, 10, 24, Math.PI), M(color, TOY.glossy));
      arc.position.copy(p); lookOut(arc, faceDir(s * dx, dy)); arc.rotateZ(Math.PI); g.add(arc); continue; }
    const e = sph(size, M(color, TOY.glossy)); e.position.copy(p); e.scale.z = 0.6; lookOut(e, faceDir(s * dx, dy)); g.add(e);
    const hl = sph(size * 0.36, new THREE.MeshBasicMaterial({ color: '#FFFFFF' }), 16, 12); hl.castShadow = false;
    hl.position.copy(surf(faceDir(s * dx - 0.045, dy + 0.06), 1, 0.07)); g.add(hl);
    const hl2 = sph(size * 0.16, new THREE.MeshBasicMaterial({ color: '#FFFFFF' }), 12, 8); hl2.castShadow = false;
    hl2.position.copy(surf(faceDir(s * dx + 0.045, dy - 0.05), 1, 0.07)); g.add(hl2);
  }
}
function blush(g, { dx = 0.52, dy = -0.12, color = '#FF8FA3', r = 0.13 } = {}) {
  for (const s of [-1, 1]) { const d = mesh(new THREE.CircleGeometry(r, 32), new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.55, roughness: 1, depthWrite: false }));
    d.castShadow = false; d.position.copy(surf(faceDir(s * dx, dy), 1, 0.012)); lookOut(d, faceDir(s * dx, dy)); g.add(d); }
}
function at(o, p) { o.position.copy(p); return o; }
function smile(g, { dy = -0.24, w = 0.1, color = '#4A2A22' } = {}) {
  for (const s of [-1, 1]) { const t = mesh(new THREE.TorusGeometry(w * 0.55, 0.018, 8, 20, Math.PI), M(color, 0.5));
    t.position.copy(surf(faceDir(s * w * 0.55, dy), 1, 0.005)); lookOut(t, faceDir(s * w * 0.55, dy)); t.rotateZ(Math.PI); g.add(t); }
}
function whiskers(g, { dy = -0.18, color = '#6B5B55' } = {}) {
  for (const s of [-1, 1]) for (const k of [-1, 0, 1]) {
    const w = mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.34, 6), M(color, 0.6)); w.castShadow = false;
    const p = surf(faceDir(s * 0.36, dy + k * 0.05), 1, 0.02); w.position.copy(p); w.rotation.z = Math.PI / 2 + s * k * 0.18; w.position.x += s * 0.14; g.add(w); }
}
function ear(shape, color, inner, { at: dir, scale = [1, 1, 1], tilt = 0, lift = 0.02 }) {
  const e = new THREE.Group();
  let outer, inn;
  if (shape === 'round') { outer = mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.1, 32), M(color)); inn = mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.04, 32), M(inner)); inn.position.y = 0.06; outer.rotation.x = inn.rotation.x = 0; }
  else if (shape === 'tri') { outer = mesh(new THREE.ConeGeometry(0.26, 0.5, 4), M(color)); inn = mesh(new THREE.ConeGeometry(0.15, 0.32, 4), M(inner)); inn.position.set(0, -0.04, 0.07); outer.rotation.y = inn.rotation.y = Math.PI / 4; }
  else if (shape === 'long') { outer = mesh(new THREE.CapsuleGeometry(0.15, 0.75, 8, 16), M(color)); inn = mesh(new THREE.CapsuleGeometry(0.08, 0.55, 8, 16), M(inner)); inn.position.z = 0.09; }
  else if (shape === 'flop') { outer = mesh(new THREE.SphereGeometry(0.3, 24, 16), M(color)); outer.scale.set(0.55, 1.1, 0.3); inn = null; }
  e.add(outer); if (inn) e.add(inn);
  e.scale.set(...scale); e.position.copy(surf(dir, 1, lift));
  if (shape === 'round') { e.lookAt(e.position.clone().add(V(0, 0.35, 1))); e.rotateX(Math.PI / 2); e.rotateY(tilt); }
  else { e.lookAt(e.position.clone().add(V(0, 1, 0.15))); e.rotateZ(tilt); }
  return e;
}

// ---------- the cast ----------
export const CAST = {
  chick(sleep) { const g = new THREE.Group(); g.add(body('#FFD84A'));
    const shell = mesh(new THREE.SphereGeometry(1.05, 48, 24, 0, Math.PI * 2, Math.PI * 0.66, Math.PI * 0.34), M('#FFF7EC', 0.4, { side: THREE.DoubleSide })); shell.scale.y = BODY.sy; g.add(shell);
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2, t = mesh(new THREE.ConeGeometry(0.16, 0.2, 3), M('#FFF7EC', 0.4)); t.position.set(Math.cos(a) * 0.93, -0.42 * BODY.sy, Math.sin(a) * 0.93); t.lookAt(t.position.clone().add(V(Math.cos(a) * .35, 3, Math.sin(a) * .35))); t.rotateX(Math.PI / 2); t.scale.set(1, 1, .35); g.add(t); }
    for (const [x, z, r] of [[0, 0.05, 0], [-0.13, -0.02, 0.5], [0.13, -0.02, -0.5]]) { const f = sph(0.14, M('#FFC93A')); f.scale.set(0.5, 1.4, 0.5); f.position.set(x, 0.98, z); f.rotation.z = r; g.add(f); }
    const beak = mesh(new THREE.ConeGeometry(0.13, 0.26, 16), M('#FF9A2E', TOY.nose)); beak.position.copy(surf(faceDir(0, -0.1), 1, 0.08)); beak.lookAt(beak.position.clone().add(FACE)); beak.rotateX(Math.PI / 2); g.add(beak);
    eyes(g, { dx: 0.3, dy: 0.1, sleep }); blush(g, { dx: 0.5, dy: -0.08 }); return g; },
  mouse(sleep) { const g = new THREE.Group(); g.add(body('#C9C2BC'));
    g.add(ear('round', '#C9C2BC', '#F7B7C3', { at: V(-0.62, 0.72, 0.1), scale: [1.25, 1, 1.25], tilt: 0.25 }));
    g.add(ear('round', '#C9C2BC', '#F7B7C3', { at: V(0.62, 0.72, 0.1), scale: [1.25, 1, 1.25], tilt: -0.25 }));
    const nose = sph(0.1, M('#F48FA6', TOY.nose)); nose.position.copy(surf(faceDir(0, -0.12), 1, 0.06)); g.add(nose);
    whiskers(g, { dy: -0.14 }); eyes(g, { dx: 0.27, dy: 0.1, size: 0.12, sleep }); blush(g, { dy: -0.1 }); return g; },
  rabbit(sleep) { const g = new THREE.Group(); g.add(body('#F5EFF1'));
    g.add(ear('long', '#F5EFF1', '#F7B7C3', { at: V(-0.3, 0.9, -0.05), tilt: 0.18 })); g.add(ear('long', '#F5EFF1', '#F7B7C3', { at: V(0.3, 0.9, -0.05), tilt: -0.3 }));
    const nose = sph(0.08, M('#F48FA6', TOY.nose)); nose.scale.set(1.3, 0.8, 1); nose.position.copy(surf(faceDir(0, -0.1), 1, 0.05)); g.add(nose);
    for (const s of [-1, 1]) { const t = mesh(new THREE.BoxGeometry(0.08, 0.1, 0.04), M('#FFFFFF', 0.3)); t.position.copy(surf(faceDir(s * 0.045, -0.27), 1, 0.02)); lookOut(t, FACE); g.add(t); }
    eyes(g, { dx: 0.3, dy: 0.1, sleep }); blush(g, { dy: -0.1 }); return g; },
  cat(sleep) { const map = canvasTex(1024, 512, (c, w, h) => { c.fillStyle = '#F4A445'; c.fillRect(0, 0, w, h); c.fillStyle = '#DE8127';
      for (const dx of [-0.045, 0, 0.045]) { c.beginPath(); c.ellipse(w * (0.75 + dx), h * 0.2, 12, 46, 0, 0, 7); c.fill(); }
      for (const u of [0.05, 0.12, 0.38, 0.45, 0.55, 0.62, 0.88, 0.95]) { c.beginPath(); c.ellipse(w * u, h * 0.42, 16, 70, 0, 0, 7); c.fill(); }
      c.fillStyle = '#FFF1DA'; c.beginPath(); c.ellipse(w * 0.75, h * 0.66, 120, 70, 0, 0, 7); c.fill(); });
    const g = new THREE.Group(); const b = body('#FFFFFF', { map }); g.add(b);
    g.add(ear('tri', '#F4A445', '#F7B7C3', { at: V(-0.55, 0.8, 0), tilt: 0.3 })); g.add(ear('tri', '#F4A445', '#F7B7C3', { at: V(0.55, 0.8, 0), tilt: -0.3 }));
    const nose = mesh(new THREE.ConeGeometry(0.07, 0.07, 3), M('#F48FA6', TOY.nose)); nose.position.copy(surf(faceDir(0, -0.1), 1, 0.04)); nose.rotation.x = Math.PI / 2 + 0.6; g.add(nose);
    whiskers(g, { dy: -0.15, color: '#8A5A34' }); smile(g, { dy: -0.2, w: 0.1 }); eyes(g, { dx: 0.3, dy: 0.1, sleep, color: '#2A2016' }); blush(g, {}); return g; },
  dog(sleep) { const g = new THREE.Group(); g.add(body('#E0A868'));
    const patch = sph(0.36, M('#FFF4E2')); patch.scale.set(1.2, 0.8, 0.5); patch.position.copy(surf(faceDir(0, -0.2), 1, -0.12)); lookOut(patch, FACE); g.add(patch);
    const spot = sph(0.3, M('#8A5A34')); spot.scale.set(1, 0.9, 0.35); spot.position.copy(surf(faceDir(0.3, 0.2), 1, -0.1)); lookOut(spot, faceDir(0.3, 0.2)); g.add(spot);
    for (const s of [-1, 1]) { const e = sph(0.3, M('#8A5A34')); e.scale.set(0.5, 1.05, 0.28); e.position.copy(surf(V(s * 0.9, 0.2, 0.35), 1, 0.05)); e.rotation.z = s * 0.35; e.rotation.y = s * 0.5; g.add(e); }
    const nose = sph(0.11, M('#2A1E1A', TOY.glossy)); nose.scale.set(1.3, 0.9, 1); nose.position.copy(surf(faceDir(0, -0.1), 1, 0.06)); g.add(nose);
    const tongue = sph(0.08, M('#F4738F', 0.4)); tongue.scale.set(1, 1.3, 0.5); tongue.position.copy(surf(faceDir(0.02, -0.3), 1, 0.03)); g.add(tongue);
    smile(g, { dy: -0.22, w: 0.12 }); eyes(g, { dx: 0.3, dy: 0.1, sleep }); return g; },
  pig(sleep) { const g = new THREE.Group(); g.add(body('#F7AFC0'));
    const snout = mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.16, 32), M('#F28AA5', TOY.nose)); snout.scale.set(1.15, 1, 0.85); snout.position.copy(surf(faceDir(0, -0.12), 1, 0.05)); snout.lookAt(snout.position.clone().add(FACE)); snout.rotateX(Math.PI / 2); g.add(snout);
    for (const s of [-1, 1]) { const n = sph(0.05, M('#B8566F', 0.5)); n.scale.z = 0.4; n.position.copy(surf(faceDir(s * 0.08, -0.12), 1, 0.13)); g.add(n); }
    for (const s of [-1, 1]) { const e = mesh(new THREE.ConeGeometry(0.3, 0.45, 3), M('#F29AB0')); e.scale.z = 0.45; e.position.copy(surf(V(s * 0.58, 0.72, 0.28), 1, 0.02)); e.rotation.set(1.25, 0, -s * 0.5); g.add(e); }
    eyes(g, { dx: 0.32, dy: 0.14, size: 0.11, sleep }); blush(g, { dx: 0.55, color: '#FF6F8C' }); return g; },
  sheep(sleep) { const g = new THREE.Group(); const wool = M('#F7F3EA', 0.9);
    for (let i = 0; i < 70; i++) { const u = Math.acos(1 - 2 * (i + 0.5) / 70), v = Math.PI * (1 + Math.sqrt(5)) * i, d = V(Math.sin(u) * Math.cos(v), Math.cos(u), Math.sin(u) * Math.sin(v));
      if (d.dot(FACE) > 0.72) continue; const b = sph(0.3, wool, 20, 14); b.position.copy(surf(d, 0.82)); g.add(b); }
    g.add(body('#F1EDE4', { r: 0.9 }));
    const face = sph(0.46, M('#5E4C46')); face.scale.set(0.95, 1.08, 0.5); face.position.copy(surf(faceDir(0, -0.1), 1, -0.08)); lookOut(face, FACE); g.add(face);
    for (const s of [-1, 1]) { const e = sph(0.18, M('#5E4C46')); e.scale.set(1.3, 0.55, 0.5); e.position.copy(surf(faceDir(s * 0.6, 0.05), 1, 0)); e.rotation.z = s * -0.3; g.add(e); }
    const eg = new THREE.Group(); eyes(eg, { dx: 0.17, dy: -0.02, size: 0.1, sleep, color: sleep ? '#F7F3EA' : '#1E1A1A' }); eg.scale.setScalar(1.14); g.add(eg);
    blush(g, { dx: 0.3, dy: -0.2, r: 0.07 }); return g; },
  horse(sleep) { const g = new THREE.Group(); g.add(body('#B97E50'));
    const muz = sph(0.45, M('#E8C39A')); muz.scale.set(1.05, 0.7, 0.55); muz.position.copy(surf(faceDir(0, -0.22), 1, -0.08)); lookOut(muz, FACE); g.add(muz);
    for (const s of [-1, 1]) { const n = sph(0.05, M('#6B4222', 0.5)); n.scale.z = 0.4; n.position.copy(surf(faceDir(s * 0.1, -0.25), 1, 0.13)); g.add(n); }
    // mane: overlapping tufts lying flat on the crown (never sticking out of the silhouette) + a side-swept forelock
    const mane = M('#5A361E', 0.65);
    for (let i = 0; i < 8; i++) { const t = i / 7, ang = 0.18 + t * 1.05, d = V((i % 2 ? 0.05 : -0.05), Math.cos(ang), -Math.sin(ang) + 0.42).normalize();
      const m = sph(0.25, mane, 24, 16); m.position.copy(surf(d, 1, 0.01)); lookOut(m, d); m.scale.set(0.95 - t * 0.25, 1.15, 0.28); g.add(m); }
    for (const [dx, dy, rz] of [[-0.02, 0.5, -0.6], [0.14, 0.44, -0.9]]) { const fl = sph(0.2, mane, 24, 16); const d = faceDir(dx, dy); fl.position.copy(surf(d, 1, 0.01)); lookOut(fl, d); fl.scale.set(0.7, 1.25, 0.3); fl.rotateZ(rz); g.add(fl); }
    g.add(ear('tri', '#B97E50', '#E8A07A', { at: V(-0.45, 0.85, 0.05), scale: [0.8, 1.1, 0.8], tilt: 0.2 })); g.add(ear('tri', '#B97E50', '#E8A07A', { at: V(0.45, 0.85, 0.05), scale: [0.8, 1.1, 0.8], tilt: -0.2 }));
    eyes(g, { dx: 0.33, dy: 0.15, sleep }); blush(g, { dx: 0.55, dy: -0.02 }); return g; },
  cow(sleep) { const map = canvasTex(512, 256, (c, w, h) => { c.fillStyle = '#FBFAF6'; c.fillRect(0, 0, w, h); c.fillStyle = '#2E2624'; let s = 7; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
      for (const [x, y, rr] of [[0.52, 0.3, 46], [0.98, 0.45, 40], [0.08, 0.6, 44], [0.35, 0.5, 34], [0.62, 0.62, 28], [0.9, 0.2, 26]]) { c.beginPath(); for (let a = 0; a < 6.3; a += 0.4) { const q = rr * (0.75 + r() * 0.45); c.lineTo(x * w + Math.cos(a) * q * 1.3, y * h + Math.sin(a) * q); } c.fill(); } });
    const g = new THREE.Group(); const b = body('#FFFFFF', { map }); g.add(b);
    const muz = sph(0.42, M('#F6B6C4', TOY.nose)); muz.scale.set(1.12, 0.66, 0.5); muz.position.copy(surf(faceDir(0, -0.22), 1, -0.06)); lookOut(muz, FACE); g.add(muz);
    for (const s of [-1, 1]) { const n = sph(0.06, M('#B8566F', 0.5)); n.scale.z = 0.4; n.position.copy(surf(faceDir(s * 0.11, -0.26), 1, 0.13)); g.add(n); }
    for (const s of [-1, 1]) { const h = mesh(new THREE.ConeGeometry(0.1, 0.36, 16), M('#F4E6C8', 0.4)); h.position.copy(surf(V(s * 0.5, 0.86, -0.05), 1, 0.05)); h.rotation.z = -s * 0.5; g.add(h);
      const e = sph(0.2, M('#2E2624')); e.scale.set(1.5, 0.55, 0.6); e.position.copy(surf(V(s * 0.85, 0.45, 0.1), 1, 0.02)); e.rotation.z = s * 0.35; g.add(e); }
    eyes(g, { dx: 0.32, dy: 0.12, sleep }); return g; },
  elephant(sleep) { const g = new THREE.Group(); g.add(body('#A9B7C9'));
    for (const s of [-1, 1]) { const e = sph(0.62, M('#A9B7C9')); e.scale.set(0.9, 1.05, 0.22); e.position.copy(surf(V(s * 0.95, 0.3, 0.1), 1, 0)); e.rotation.y = s * 0.7; g.add(e);
      const i = sph(0.46, M('#E6B7C3')); i.scale.set(0.85, 0.95, 0.12); i.position.copy(e.position).add(V(s * 0.02, 0, 0.1)); i.rotation.y = s * 0.7; g.add(i); }
    const curve = new THREE.CatmullRomCurve3([surf(faceDir(0, -0.05), 1, -0.1), surf(faceDir(0, -0.3), 1, 0.25), surf(faceDir(0, -0.55), 1, 0.35), surf(faceDir(0.08, -0.72), 1, 0.52)]);
    g.add(mesh(new THREE.TubeGeometry(curve, 32, 0.13, 16), M('#A9B7C9')));
    const tip = sph(0.14, M('#98A6B8')); tip.position.copy(curve.getPoint(1)); g.add(tip);
    for (const s of [-1, 1]) { const t = mesh(new THREE.ConeGeometry(0.06, 0.28, 12), M('#FFF8EA', 0.35)); t.position.copy(surf(faceDir(s * 0.22, -0.38), 1, 0.12)); t.rotation.x = 2.2; g.add(t); }
    eyes(g, { dx: 0.33, dy: 0.18, size: 0.11, sleep }); blush(g, { dx: 0.52, dy: 0.0 }); return g; },
  whale(sleep) { const map = canvasTex(512, 256, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#4E9FE0'); gr.addColorStop(0.62, '#5DB0EE'); gr.addColorStop(0.63, '#DDF1FF'); gr.addColorStop(1, '#DDF1FF'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
    const g = new THREE.Group(); g.add(body('#FFFFFF', { map }));
    for (const s of [-1, 1]) { const f = sph(0.3, M('#4E9FE0')); f.scale.set(1.2, 0.25, 0.6); f.position.copy(surf(V(s, -0.25, 0.3), 1, 0.05)); f.rotation.z = s * -0.5; g.add(f); }
    const tail = new THREE.Group(); for (const s of [-1, 1]) { const t = sph(0.26, M('#4E9FE0')); t.scale.set(1.3, 0.25, 0.7); t.position.set(s * 0.2, 0, 0); t.rotation.y = s * 0.4; tail.add(t); } tail.position.set(0, 0.35, -1.0); tail.rotation.x = -0.6; g.add(tail);
    const water = new THREE.MeshStandardMaterial({ color: '#BFE9FF', roughness: 0.1, transparent: true, opacity: 0.85 });
    for (const [x, y, z, r] of [[0, 1.08, 0.1, 0.1], [-0.12, 1.24, 0.08, 0.08], [0.13, 1.26, 0.06, 0.08], [0, 1.38, 0.05, 0.07], [-0.2, 1.1, 0.1, 0.06], [0.2, 1.12, 0.1, 0.06]]) { const d = sph(r, water, 16, 12); d.position.set(x, y, z); g.add(d); }
    eyes(g, { dx: 0.36, dy: 0.02, size: 0.11, sleep }); smile(g, { dy: -0.2, w: 0.16 }); blush(g, { dx: 0.56, dy: -0.12 }); return g; },
  unicorn(sleep) { const g = new THREE.Group(); g.add(body('#FFF7FB'));
    const hornG = new THREE.Group(); const horn = mesh(new THREE.ConeGeometry(0.17, 0.85, 32), M('#F4C65A', 0.28, { metalness: 0.25 })); horn.position.y = 0.42; hornG.add(horn);
    for (let i = 0; i < 5; i++) { const r = mesh(new THREE.TorusGeometry(0.15 - i * 0.028, 0.022, 8, 24), M('#DDA02A', 0.3)); r.position.y = 0.1 + i * 0.15; r.rotation.x = Math.PI / 2; r.rotation.y = 0.25; hornG.add(r); }
    hornG.position.copy(surf(faceDir(0, 0.55), 1, -0.06)); hornG.rotation.x = -0.25; g.add(hornG);
    const cols = ['#FF8FB1', '#FFC76B', '#FFE66E', '#8FE3A8', '#8FCBFF', '#C3A6FF'];
    for (let i = 0; i < 12; i++) { const t = i / 11, a = 0.35 + t * 1.4, b = sph(0.19 - t * 0.04, M(cols[i % 6], 0.5)); b.position.copy(surf(V(-0.28 + 0.12 * Math.sin(i * 1.7), Math.cos(a), -Math.sin(a) + 0.2), 1, 0.05)); g.add(b); }
    g.add(ear('tri', '#FFF7FB', '#F7B7C3', { at: V(-0.45, 0.85, 0.05), scale: [0.8, 1, 0.8], tilt: 0.2 })); g.add(ear('tri', '#FFF7FB', '#F7B7C3', { at: V(0.45, 0.85, 0.05), scale: [0.8, 1, 0.8], tilt: -0.2 }));
    eyes(g, { dx: 0.32, dy: 0.12, sleep, color: '#3A2A4A' }); blush(g, { color: '#FF9ECF' }); return g; },
};
