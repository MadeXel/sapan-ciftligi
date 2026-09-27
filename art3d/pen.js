import * as THREE from './node_modules/three/build/three.module.js';
import { RoundedBoxGeometry } from './RoundedBoxGeometry.js';
import { LIGHT, SHADOW } from './style.js';
// Game world is 420 x 720 units (top-down). Here 1 scene unit = 10 game units, x → x, game y → z.
export const WORLD = { W: 42, H: 72, F: 1.6, DANGER: 57 };
export const THEMES = { // same palette as the game's THEMES
  cayir:   { stripe: ['#66A84F', '#6FB358'], tuft: '#4F9A3E', fl: ['#FFF6D6', '#FFD84D', '#F7B6D2'], hay: '#D9B36B', straw: ['#EFCB7E', '#B8904C'], border: '#3F7432', rail: '#B07A45', post: '#7A4B24' },
  sonbahar:{ stripe: ['#A99A46', '#B6A64F'], tuft: '#8C7A34', fl: ['#D9582B', '#E89A2E', '#A23A1C'], hay: '#C98E52', straw: ['#E3AE70', '#9C6A38'], border: '#5E4A20', rail: '#A0683A', post: '#6A3F1E' },
  kis:     { stripe: ['#E4EDF4', '#EDF3F8'], tuft: '#C7D6E2', fl: ['#FFFFFF', '#CFE2F0'], hay: '#C6DAE9', straw: ['#FFFFFF', '#A2BCD1'], border: '#4F6B80', rail: '#8C6A4A', post: '#5E4632' },
  lavanta: { stripe: ['#8A78BE', '#9483C6'], tuft: '#6E5DA6', fl: ['#EDE6FF', '#C7B5F2', '#FFFFFF'], hay: '#D8C08A', straw: ['#F0DDA8', '#AE9458'], border: '#433868', rail: '#B07A45', post: '#6B4A2A' },
  altin:   { stripe: ['#D2AA45', '#DCB651'], tuft: '#B48C2E', fl: ['#FFF3B0', '#F4D35E', '#FFFFFF'], hay: '#B7874A', straw: ['#E2B774', '#8C6330'], border: '#6E5418', rail: '#E0B83A', post: '#9C7A1C' },
};
const M = (c, r = 0.85, e = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: 0, ...e });
function groundTexture(T) {
  const c = document.createElement('canvas'), S = 3; c.width = 420 * S; c.height = 720 * S; const g = c.getContext('2d'); g.scale(S, S);
  let s = 11; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  g.fillStyle = T.border; g.fillRect(0, 0, 420, 720);
  for (let y = 0, i = 0; y < 720; y += 40, i++) { g.fillStyle = T.stripe[i % 2]; g.fillRect(0, y, 420, 40); }
  // soft mottling so the lawn doesn't look flat
  for (let i = 0; i < 260; i++) { const x = rnd() * 420, y = rnd() * 570, r = 6 + rnd() * 26; const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, rnd() < .5 ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.06)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
  for (let i = 0; i < 5000; i++) { const x = rnd() * 420, y = rnd() * 570; g.fillStyle = rnd() < .5 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)'; g.fillRect(x, y, 1, 2.5); }
  // ambient occlusion where the lawn meets the fence (reads as depth from straight above)
  for (const [x0, y0, x1, y1, w, h] of [[16, 16, 16 + 26, 16, 26, 704], [404, 16, 404 - 26, 16, 26, 704], [16, 16, 16, 16 + 26, 388, 26], [16, 704, 16, 704 - 26, 388, 26]]) {
    const gr = g.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, 'rgba(20,30,10,.30)'); gr.addColorStop(1, 'rgba(20,30,10,0)'); g.fillStyle = gr; g.fillRect(Math.min(x0, x1), Math.min(y0, y1), w, h); }
  for (let i = 0; i < 26; i++) { const cx = 30 + rnd() * 360, cy = 30 + rnd() * 520; for (let k = 0; k < 9; k++) { const x = cx + (rnd() - .5) * 26, y = cy + (rnd() - .5) * 18; g.fillStyle = 'rgba(40,90,30,.22)';
      for (let l = 0; l < 3; l++) { g.beginPath(); g.arc(x + Math.cos(l * 2.1) * 2.2, y + Math.sin(l * 2.1) * 2.2, 2.3, 0, 7); g.fill(); } } }
  // hay zone
  const hz = 570; g.fillStyle = T.hay; g.fillRect(0, hz, 420, 150);
  for (let i = 0; i < 2600; i++) { const x = rnd() * 420, y = hz + rnd() * 150, a = rnd() * Math.PI, l = 4 + rnd() * 9; g.strokeStyle = T.straw[rnd() < .5 ? 0 : 1]; g.globalAlpha = .75; g.lineWidth = .9;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); } g.globalAlpha = 1;
  const sh = g.createLinearGradient(0, hz, 0, hz + 16); sh.addColorStop(0, 'rgba(60,40,10,.28)'); sh.addColorStop(1, 'rgba(60,40,10,0)'); g.fillStyle = sh; g.fillRect(0, hz, 420, 16);
  g.strokeStyle = 'rgba(110,70,25,.33)'; g.lineWidth = 4; g.lineCap = 'round'; g.lineJoin = 'round';
  for (const x of [70, 140, 280, 350]) for (const y of [hz + 40, hz + 95]) { g.beginPath(); g.moveTo(x - 12, y + 7); g.lineTo(x, y - 5); g.lineTo(x + 12, y + 7); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
export function pen(themeId, { withGround = true, withFence = true } = {}) {
  const T = THEMES[themeId], { W, H, F, DANGER } = WORLD, g = new THREE.Group();
  if (withGround) {
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(W, H), M('#FFFFFF', 1, { map: groundTexture(T) })); ground.rotation.x = -Math.PI / 2; ground.position.set(W / 2, 0, H / 2); ground.receiveShadow = true; g.add(ground);
    let s = 5; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    // grass tufts (real geometry, cast tiny shadows)
    const tuftM = M(T.tuft, 0.9), tg = new THREE.ConeGeometry(0.1, 0.6, 5);
    for (let i = 0; i < 300; i++) { const x = F + rnd() * (W - 2 * F), z = F + rnd() * (DANGER - F - 1); for (let k = 0; k < 3; k++) { const b = new THREE.Mesh(tg, tuftM);
      b.position.set(x + (k - 1) * .12, .26, z + (rnd() - .5) * .08); b.rotation.set((rnd() - .5) * .7, 0, (k - 1) * .5); b.castShadow = true; g.add(b); } }
    // pebbles
    for (let i = 0; i < 22; i++) { const st = new THREE.Mesh(new THREE.SphereGeometry(.18 + rnd() * .16, 14, 10), M(rnd() < .5 ? '#A9A195' : '#BDB5A8', .8)); st.scale.y = .45; st.position.set(F + rnd() * (W - 2 * F), .05, F + rnd() * (DANGER - F - 2)); st.castShadow = st.receiveShadow = true; g.add(st); }
    // little flowers
    for (let i = 0; i < 70; i++) { const x = F + rnd() * (W - 2 * F), z = F + rnd() * (DANGER - F - 2), col = T.fl[i % T.fl.length];
      for (let p = 0; p < 5; p++) { const pe = new THREE.Mesh(new THREE.SphereGeometry(.09, 10, 8), M(col, .6)); pe.scale.y = .45; pe.position.set(x + Math.cos(p * 1.26) * .12, .06, z + Math.sin(p * 1.26) * .12); pe.castShadow = true; g.add(pe); }
      const ce = new THREE.Mesh(new THREE.SphereGeometry(.07, 10, 8), M('#E0A020', .5)); ce.position.set(x, .08, z); g.add(ce); }
    // straw bits standing out of the hay
    const strawM = M(T.straw[0], .8), sg = new THREE.CylinderGeometry(.018, .018, .5, 5);
    for (let i = 0; i < 260; i++) { const b = new THREE.Mesh(sg, strawM); b.position.set(rnd() * W, .06, DANGER + .3 + rnd() * (H - DANGER - .6)); b.rotation.set(Math.PI / 2 - .15, 0, rnd() * Math.PI); b.castShadow = true; g.add(b); }
  }
  if (withFence) {
    const postM = M(T.post, .8), railM = M(T.rail, .75), capM = M('#3F2A16', .7);
    const post = (x, z) => { const p = new THREE.Mesh(new RoundedBoxGeometry(1.45, 2.1, 1.45, 3, .22), postM); p.position.set(x, 1.05, z); p.castShadow = p.receiveShadow = true; g.add(p);
      const c = new THREE.Mesh(new THREE.CylinderGeometry(.32, .32, .08, 16), capM); c.position.set(x, 2.12, z); g.add(c); };
    const rail = (x1, z1, x2, z2, y) => { const len = Math.hypot(x2 - x1, z2 - z1), r = new THREE.Mesh(new RoundedBoxGeometry(x1 === x2 ? .95 : len, .6, x1 === x2 ? len : .95, 3, .22), railM);
      r.position.set((x1 + x2) / 2, y, (z1 + z2) / 2); r.castShadow = r.receiveShadow = true; g.add(r); };
    const e = F / 2 - .1;
    rail(0, e, W, e, 1.3); rail(0, H - e, W, H - e, 1.3); rail(e, 0, e, H, 1.3); rail(W - e, 0, W - e, H, 1.3);
    for (let i = 0; i <= 6; i++) { const x = Math.min(W - e, Math.max(e, i * W / 6)); post(x, e); post(x, H - e); }
    for (let i = 1; i < 9; i++) { const z = i * H / 9; post(e, z); post(W - e, z); }
  }
  return g;
}
export function renderPen(renderer, themeId, part, S = 25) {
  const L = LIGHT.day, scene = new THREE.Scene(); renderer.toneMappingExposure = L.exposure;
  scene.add(new THREE.HemisphereLight(L.sky, L.ground, L.hemiI));
  const sun = new THREE.DirectionalLight(L.key, L.keyI); sun.position.set(21, 0, 36).add(new THREE.Vector3(...L.dir).normalize().multiplyScalar(40)); sun.target.position.set(21, 0, 36);
  sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.radius = 3; sun.shadow.bias = -0.0006; sun.shadow.normalBias = .03;
  Object.assign(sun.shadow.camera, { left: -48, right: 48, top: 48, bottom: -48, near: 1, far: 120 }); scene.add(sun, sun.target);
  const rim = new THREE.DirectionalLight(L.rim, L.rimI); rim.position.set(60, 30, -20); scene.add(rim);
  scene.add(pen(themeId, { withGround: part === 'bg', withFence: true }));
  if (part === 'fg') { // fence only: invisible ground that still receives nothing; transparent background
  }
  const cam = new THREE.OrthographicCamera(0, 42, 0, -72, 1, 200); cam.position.set(0, 100, 0); cam.up.set(0, 0, -1); cam.lookAt(0, 0, 0);
  // top-down: screen x = world x, screen y (down) = world z
  cam.left = 0; cam.right = 42; cam.top = 0; cam.bottom = -72; cam.updateProjectionMatrix();
  renderer.setSize(42 * S, 72 * S, false); renderer.render(scene, cam); return renderer.domElement.toDataURL('image/png');
}
