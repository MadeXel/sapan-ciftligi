import * as THREE from './node_modules/three/build/three.module.js';
import { RoundedBoxGeometry } from './RoundedBoxGeometry.js';
import { CAMERA, SHADOW, LIGHT, PAL, MAT, RIM_DIR } from './style.js';

const mat = (c, extra = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: MAT.roughness, metalness: 0, ...extra });
const rbox = (w, h, d, c, r = MAT.bevel) => { const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2)), c instanceof THREE.Material ? c : mat(c)); m.castShadow = m.receiveShadow = true; return m; };
const at = (m, x, y, z) => { m.position.set(x, y, z); return m; };
function prism(shapePts, depth, c) { // extruded 2D outline, centred on z
  const s = new THREE.Shape(shapePts.map(([x, y]) => new THREE.Vector2(x, y)));
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2 });
  g.translate(0, 0, -depth / 2); const m = new THREE.Mesh(g, mat(c)); m.castShadow = m.receiveShadow = true; return m;
}
function glass(w, h, tod) {
  const lit = LIGHT[tod].windows;
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), lit
    ? new THREE.MeshStandardMaterial({ color: PAL.glassNight, emissive: PAL.glassNight, emissiveIntensity: tod === 'night' ? 2.2 : 1.3, roughness: .4 })
    : new THREE.MeshStandardMaterial({ color: PAL.glassDay, roughness: .25, metalness: 0 }));
}
function windowUnit(w, h, tod) { // cream frame + cross mullion + glass, faces +z
  const g = new THREE.Group();
  g.add(at(rbox(w + .12, h + .12, .06, PAL.trim, .02), 0, 0, 0));
  g.add(at(glass(w, h, tod), 0, 0, .035));
  g.add(at(rbox(.04, h, .03, PAL.trim, .01), 0, 0, .05)); g.add(at(rbox(w, .04, .03, PAL.trim, .01), 0, 0, .05));
  g.add(at(rbox(w + .2, .07, .12, PAL.trim, .02), 0, -h / 2 - .08, .05));
  return g;
}

export function house(tod) {
  const g = new THREE.Group(), W = 2.3, H = 1.45, D = 1.7;
  g.add(at(rbox(W + .1, .16, D + .1, PAL.stone, .04), 0, .08, 0));
  g.add(at(rbox(W, H, D, PAL.wall), 0, H / 2 + .12, 0));
  const roof = prism([[-W / 2 - .28, 0], [0, 1.05], [W / 2 + .28, 0]], D + .36, PAL.roof); roof.position.y = H + .12; g.add(roof);
  // roof shingle rows (texture through geometry, keeps lighting consistent)
  for (let i = 1; i < 5; i++) { const t = i / 5, y = H + .12 + t * 1.05, half = (1 - t) * (W / 2 + .28);
    for (const s of [-1, 1]) { const strip = rbox(Math.hypot(half, 0) + .02, .035, D + .38, '#9C4331', .015); strip.position.set(s * half / 2, y - .02, 0); strip.rotation.z = -s * Math.atan2(1.05, W / 2 + .28); g.add(strip); } }
  g.add(at(rbox(.36, .9, .36, PAL.brick, .03), W / 4, H + .12 + .8, -.2));
  g.add(at(rbox(.44, .1, .44, '#6E3A2E', .03), W / 4, H + .12 + 1.28, -.2));
  const f = D / 2 + .01;
  g.add(at(windowUnit(.42, .42, tod), -.62, .95, f)); g.add(at(windowUnit(.42, .42, tod), .62, .95, f));
  const door = rbox(.44, .78, .08, PAL.wood, .03); g.add(at(door, 0, .12 + .39, f));
  g.add(at(rbox(.54, .06, .12, PAL.trim, .02), 0, .12 + .81, f + .02));
  const knob = new THREE.Mesh(new THREE.SphereGeometry(.035, 12, 8), mat('#E0B83A', { roughness: .4 })); g.add(at(knob, .13, .5, f + .06));
  // flower boxes under windows
  for (const x of [-.62, .62]) { g.add(at(rbox(.5, .1, .14, PAL.wood, .02), x, .64, f + .08));
    for (let k = 0; k < 5; k++) { const fl = new THREE.Mesh(new THREE.SphereGeometry(.045, 10, 8), mat(PAL.flower[k % 3])); fl.castShadow = true; g.add(at(fl, x - .18 + k * .09, .72, f + .09)); } }
  // side window
  const sw = windowUnit(.36, .36, tod); sw.rotation.y = Math.PI / 2; g.add(at(sw, W / 2 + .01, .95, 0));
  return g;
}

export function barn(tod, open = false) {
  const g = new THREE.Group(), W = 2.5, H = 1.7, D = 2.3;
  g.add(at(rbox(W + .1, .14, D + .1, PAL.stone, .04), 0, .07, 0));
  g.add(at(rbox(W, H, D, PAL.barn), 0, H / 2 + .1, 0));
  // vertical board seams on the front
  for (let i = -5; i <= 5; i++) if (Math.abs(i) > 1) g.add(at(rbox(.025, H - .1, .02, '#A3322A', .01), i * W / 12, H / 2 + .1, D / 2 + .005));
  const roof = prism([[-W / 2 - .25, 0], [-W / 2 + .2, .75], [0, 1.2], [W / 2 - .2, .75], [W / 2 + .25, 0]], D + .3, PAL.roofDark); roof.position.y = H + .1; g.add(roof);
  const f = D / 2 + .02, trim = (w, h, x, y, r = 0) => { const b = rbox(w, h, .05, PAL.trim, .015); b.position.set(x, y, f); b.rotation.z = r; g.add(b); };
  trim(.09, H, -W / 2 + .045, H / 2 + .1); trim(.09, H, W / 2 - .045, H / 2 + .1); trim(W, .09, 0, H + .1);
  // loft window
  const lw = new THREE.Mesh(new THREE.CircleGeometry(.2, 28), glass(1, 1, tod).material); g.add(at(lw, 0, H + .55, D / 2 + .19));
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.22, .045, 10, 32), mat(PAL.trim)); ring.castShadow = true; g.add(at(ring, 0, H + .55, D / 2 + .2));
  // doors: interior + two leaves with X bracing
  const dw = 1.1, dh = 1.25, dy = .1 + dh / 2;
  const inside = new THREE.Mesh(new THREE.PlaneGeometry(dw, dh), open
    ? new THREE.MeshStandardMaterial({ color: '#FFC65A', emissive: '#FFB347', emissiveIntensity: tod === 'night' ? 2.4 : 1.5 })
    : mat('#2A1A0E')); g.add(at(inside, 0, dy, f - .015));
  for (const side of [-1, 1]) {
    const leaf = new THREE.Group(), lw2 = dw / 2;
    leaf.add(at(rbox(lw2, dh, .07, '#A3322A', .02), side * lw2 / 2, 0, 0));
    const fr = (w, h, x, y, r = 0) => { const b = rbox(w, h, .05, PAL.trim, .012); b.position.set(x, y, .05); b.rotation.z = r; leaf.add(b); };
    fr(lw2, .07, side * lw2 / 2, dh / 2 - .035); fr(lw2, .07, side * lw2 / 2, -dh / 2 + .035); fr(.07, dh, side * (lw2 - .035), 0); fr(.07, dh, side * .035, 0);
    const diag = Math.hypot(lw2, dh) - .1; fr(diag, .06, side * lw2 / 2, 0, Math.atan2(dh, lw2) * side); fr(diag, .06, side * lw2 / 2, 0, -Math.atan2(dh, lw2) * side);
    leaf.position.set(side * dw / 2 * 0 + side * 0, dy, f + .02); leaf.position.x = side * 0;
    const hinge = new THREE.Group(); hinge.position.set(side * -dw / 2 * -1, 0, 0); // hinge at the outer edge
    hinge.position.set(side * dw / 2, dy, f + .02); leaf.position.set(-side * dw / 2, 0, 0); hinge.add(leaf);
    if (open) hinge.rotation.y = side * 1.9; g.add(hinge);
  }
  if (open) { const pl = new THREE.PointLight('#FFB347', tod === 'night' ? 6 : 3, 4, 1.6); pl.position.set(0, .8, f + .6); g.add(pl); }
  // hay bale by the barn
  const bale = new THREE.Mesh(new THREE.CylinderGeometry(.34, .34, .6, 24), mat(PAL.hay)); bale.rotation.z = Math.PI / 2; bale.castShadow = bale.receiveShadow = true; g.add(at(bale, W / 2 + .45, .34, .7));
  return g;
}

export function tower(tod) {
  const g = new THREE.Group();
  g.add(at(rbox(1.3, .22, 1.3, PAL.stone, .06), 0, .11, 0));
  const t = new THREE.Mesh(new THREE.CylinderGeometry(.42, .62, 2.6, 8), mat(PAL.tower)); t.castShadow = t.receiveShadow = true; g.add(at(t, 0, 1.52, 0));
  for (const y of [.9, 1.8]) { const band = new THREE.Mesh(new THREE.CylinderGeometry(.6 - y * .07, .61 - y * .07, .06, 8), mat(PAL.wood)); band.castShadow = true; g.add(at(band, 0, y, 0)); }
  const cap = new THREE.Mesh(new THREE.ConeGeometry(.62, .7, 8), mat(PAL.cap)); cap.castShadow = true; g.add(at(cap, 0, 3.17, 0));
  g.add(at(rbox(.32, .5, .08, PAL.wood, .03), 0, .47, .58));
  const w = windowUnit(.2, .24, tod); g.add(at(w, 0, 2.0, .47));
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(.08, .08, .5, 12), mat(PAL.woodDark)); shaft.rotation.x = Math.PI / 2; g.add(at(shaft, 0, 2.72, .55));
  return g;
}
export function blades(tod) { // rendered straight-on, rotated in 2D at runtime; hub at origin
  const g = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const arm = new THREE.Group(); arm.rotation.z = i * Math.PI / 2 + Math.PI / 4;
    arm.add(at(rbox(.08, 1.55, .06, PAL.wood, .02), 0, .85, 0));
    arm.add(at(rbox(.36, 1.1, .03, PAL.cloth, .015), .22, 1.0, .02));
    for (let k = 0; k < 4; k++) arm.add(at(rbox(.4, .03, .04, PAL.wood, .01), .22, .5 + k * .33, .04));
    g.add(arm);
  }
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(.13, .13, .14, 18), mat(PAL.woodDark)); hub.rotation.x = Math.PI / 2; g.add(at(hub, 0, 0, .08));
  g.traverse(o => { if (o.isMesh) o.castShadow = false; });
  return g;
}
export function tree(tod, seed = 1) {
  const g = new THREE.Group(); let s = seed * 9301 + 49297; const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const tr = new THREE.Mesh(new THREE.CylinderGeometry(.1, .15, .9, 10), mat(PAL.trunk)); tr.castShadow = true; g.add(at(tr, 0, .45, 0));
  const blobs = [[0, 1.25, 0, .55], [-.35, 1.0, .1, .4], [.35, 1.05, -.05, .42], [.05, 1.6, -.05, .38], [.15, 1.1, .3, .35]];
  blobs.forEach(([x, y, z, r], i) => { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 2), mat(PAL.leaf[i % 3], { flatShading: false }));
    m.castShadow = m.receiveShadow = true; m.scale.y = .9 + rnd() * .15; g.add(at(m, x, y, z)); });
  return g;
}
export function fence() {
  const g = new THREE.Group();
  for (const x of [-.9, 0, .9]) g.add(at(rbox(.11, .62, .11, PAL.wood, .03), x, .31, 0));
  for (const y of [.26, .48]) g.add(at(rbox(1.95, .08, .06, '#A06C3E', .025), 0, y, .07));
  return g;
}

// ---------- renderer ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setClearColor(0x000000, 0); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

export function render(obj, tod, { front = false, shadow = true, pts = {} } = {}) {
  const L = LIGHT[tod], scene = new THREE.Scene();
  renderer.toneMappingExposure = L.exposure;
  scene.add(new THREE.HemisphereLight(L.sky, L.ground, L.hemiI));
  const sun = new THREE.DirectionalLight(L.key, L.keyI); sun.position.set(...L.dir).normalize().multiplyScalar(12);
  sun.castShadow = true; sun.shadow.mapSize.set(SHADOW.mapSize, SHADOW.mapSize); sun.shadow.radius = SHADOW.radius; sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.02;
  Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: .5, far: 40 }); scene.add(sun);
  const rim = new THREE.DirectionalLight(L.rim, L.rimI); rim.position.set(...RIM_DIR).normalize().multiplyScalar(12); scene.add(rim);
  scene.add(obj);
  if (shadow) { const pl = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShadowMaterial({ opacity: SHADOW.opacity })); pl.rotation.x = -Math.PI / 2; pl.receiveShadow = true; scene.add(pl); }
  const yaw = front ? 0 : CAMERA.yaw * Math.PI / 180, pitch = front ? 0 : CAMERA.pitch * Math.PI / 180;
  const dir = new THREE.Vector3(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
  const box = new THREE.Box3().setFromObject(obj);
  if (shadow) { const ld = new THREE.Vector3(...L.dir).normalize();
    for (const x of [box.min.x, box.max.x]) for (const z of [box.min.z, box.max.z]) { const p = new THREE.Vector3(x, box.max.y, z); box.expandByPoint(p.addScaledVector(ld, -p.y / ld.y)); }
    box.expandByScalar(.15); box.min.y = Math.max(box.min.y, -.05); }
  const center = box.getCenter(new THREE.Vector3());
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, .1, 100); cam.position.copy(center).addScaledVector(dir, 30); cam.lookAt(center); cam.updateMatrixWorld();
  // fit the frustum to the projected bounding box
  const corners = []; for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) corners.push(new THREE.Vector3(x, y, z).applyMatrix4(cam.matrixWorldInverse));
  const pad = .12, xs = corners.map(c => c.x), ys = corners.map(c => c.y);
  Object.assign(cam, { left: Math.min(...xs) - pad, right: Math.max(...xs) + pad, top: Math.max(...ys) + pad, bottom: Math.min(...ys) - pad }); cam.updateProjectionMatrix();
  const wpx = Math.round((cam.right - cam.left) * CAMERA.pxPerUnit), hpx = Math.round((cam.top - cam.bottom) * CAMERA.pxPerUnit);
  renderer.setSize(wpx, hpx, false); renderer.render(scene, cam);
  const o = new THREE.Vector3(0, 0, 0).project(cam);
  const extra = {}; for (const k in pts) { const q = new THREE.Vector3(...pts[k]).project(cam); extra[k] = [Math.round((q.x + 1) / 2 * wpx), Math.round((1 - q.y) / 2 * hpx)]; }
  return { url: renderer.domElement.toDataURL('image/png'), w: wpx, h: hpx, ax: Math.round((o.x + 1) / 2 * wpx), ay: Math.round((1 - o.y) / 2 * hpx), ...extra };
}
