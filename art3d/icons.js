import * as THREE from './node_modules/three/build/three.module.js';
const M = (c, r = .55, e = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: 0, ...e });
const m = (g, mat) => { const o = new THREE.Mesh(g, mat); o.castShadow = o.receiveShadow = true; return o; };
export const ICONS = {
  egg() { const g = new THREE.Group(); const pts = []; for (let i = 0; i <= 24; i++) { const t = i / 24, a = t * Math.PI; pts.push(new THREE.Vector2(Math.sin(a) * (0.72 - 0.16 * t), -Math.cos(a) * 1.0)); }
    const e = m(new THREE.LatheGeometry(pts, 48), M('#F7C948', .28, { emissive: '#5A3A00', emissiveIntensity: .25 })); e.rotation.z = -0.25; g.add(e);
    const s = m(new THREE.SphereGeometry(.12, 16, 12), new THREE.MeshBasicMaterial({ color: '#FFFBE6' })); s.position.set(-.3, .35, .55); g.add(s); return g; },
  basket() { const g = new THREE.Group(); const b = m(new THREE.CylinderGeometry(.95, .72, .8, 32, 1, true), M('#C9924F', .8, { side: THREE.DoubleSide })); g.add(b);
    for (let i = 0; i < 5; i++) { const r = m(new THREE.TorusGeometry(.73 + i * .055, .04, 8, 40), M(i % 2 ? '#A8733A' : '#D9A661', .8)); r.rotation.x = Math.PI / 2; r.position.y = -.36 + i * .18; g.add(r); }
    const bottom = m(new THREE.CircleGeometry(.72, 32), M('#8A5A2E', .9)); bottom.rotation.x = -Math.PI / 2; bottom.position.y = -.38; g.add(bottom);
    const h = m(new THREE.TorusGeometry(.8, .07, 10, 40, Math.PI), M('#A8733A', .8)); h.position.y = .38; g.add(h);
    for (const [x, z, c] of [[-.3, .1, '#FF6B6B'], [.28, -.05, '#8FD16A'], [0, -.3, '#FFD84A']]) { const f = m(new THREE.SphereGeometry(.3, 24, 16), M(c, .45)); f.position.set(x, .28, z); g.add(f); }
    const cloth = m(new THREE.SphereGeometry(.5, 20, 12), M('#FFFFFF', .8)); cloth.scale.set(1.2, .25, 1); cloth.position.set(.35, .4, .35); g.add(cloth); return g; },
  scroll() { const g = new THREE.Group(); const paper = m(new THREE.BoxGeometry(1.3, 1.6, .05), M('#F3E2BD', .9)); g.add(paper);
    for (const y of [.82, -.82]) { const r = m(new THREE.CylinderGeometry(.17, .17, 1.55, 24), M('#E7CFA0', .8)); r.rotation.z = Math.PI / 2; r.position.y = y; g.add(r);
      for (const x of [-.82, .82]) { const k = m(new THREE.SphereGeometry(.13, 16, 12), M('#8A5A34', .5)); k.position.set(x, y, 0); g.add(k); } }
    for (let i = 0; i < 5; i++) { const l = m(new THREE.BoxGeometry(.85 - (i % 2) * .25, .06, .02), M('#B08A5A', .9)); l.position.set(-.05 - (i % 2) * .12, .45 - i * .22, .04); g.add(l); }
    const seal = m(new THREE.CylinderGeometry(.16, .16, .05, 24), M('#C8453A', .4)); seal.rotation.x = Math.PI / 2; seal.position.set(.4, -.55, .06); g.add(seal); g.rotation.z = -.18; return g; },
  book() { const g = new THREE.Group(); const cover = m(new THREE.BoxGeometry(1.5, .22, 1.9), M('#3E8A5A', .55)); g.add(cover);
    const pages = m(new THREE.BoxGeometry(1.36, .16, 1.8), M('#FFF6E0', .9)); pages.position.set(.06, .02, 0); g.add(pages);
    const top = m(new THREE.BoxGeometry(1.5, .06, 1.9), M('#2F6E47', .55)); top.position.y = .13; g.add(top);
    const star = m(new THREE.CylinderGeometry(.3, .3, .04, 5), M('#F7C948', .3)); star.position.set(.08, .17, 0); g.add(star);
    const bm = m(new THREE.BoxGeometry(.18, .02, .6), M('#C8453A', .6)); bm.position.set(.45, .17, .95); g.add(bm);
    g.rotation.set(.9, .45, 0); return g; },
  trophy() { const g = new THREE.Group(), gold = M('#F7C948', .28, { emissive: '#5A3A00', emissiveIntensity: .25 });
    const pts = []; for (let i = 0; i <= 16; i++) { const t = i / 16; pts.push(new THREE.Vector2(.2 + Math.sin(t * Math.PI / 2) * .55, -.1 + t * .9)); }
    g.add(m(new THREE.LatheGeometry(pts, 40), gold)); const stem = m(new THREE.CylinderGeometry(.1, .16, .45, 20), gold); stem.position.y = -.3; g.add(stem);
    const base = m(new THREE.CylinderGeometry(.45, .5, .22, 32), M('#8A5A34', .5)); base.position.y = -.62; g.add(base);
    for (const s of [-1, 1]) { const h = m(new THREE.TorusGeometry(.2, .06, 10, 24, Math.PI * 1.2), gold); h.position.set(s * .74, .45, 0); h.rotation.z = s > 0 ? -Math.PI / 2 : Math.PI * 1.5 - Math.PI * .7; g.add(h); }
    const st = m(new THREE.SphereGeometry(.14, 16, 12), M('#FFF3B0', .2, { metalness: .3 })); st.position.set(0, .35, .5); g.add(st); return g; },
};
