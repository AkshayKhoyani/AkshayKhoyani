// Gold 30% gira: low-poly 3D story (Pinky bought at the Jan 2026 peak, Dadi stays calm).
// Sources (see SOURCES.md): Jan 2026 peak ~₹1.8 lakh/10g and ~30% fall (IndMoney, IBTimes, utkarsh/other coverage);
// 14-month low on 20 Nov 2026 (FXStreet, Epoch Times, Investing News, Yahoo Finance); reasons: Fed hike expectations,
// strong dollar, US yields (Epoch Times/ING, Investing News); MCX ~₹1.25 lakh on 23 Nov (Goodreturns, IndMoney);
// 24K retail ~₹1,26,570 on 24 Nov (Groww, Kotak Neo); dates: US GDP+PCE 25 Nov, RBI MPC 2–4 Dec, Fed 9 Dec.
import * as FJ from '/engine/fj3d.js';
const { THREE, PAL } = FJ;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const M = c => new THREE.MeshLambertMaterial({ color: c, flatShading: true });

const fj = await FJ.boot();
const { L, E, A } = fj;
const T = fj.tl.total;
const scene = fj.scene;

FJ.buildCity(fj, {
  seed: 41,
  reserved: [
    { x: 0, z: 5, r: 40, empty: true }, { x: 0, z: -65, r: 30, empty: true }, { x: 0, z: -135, r: 30, empty: true },
    { x: 60, z: 5, r: 10 }, { x: -60, z: 5, r: 10 },
  ],
});

// ---------- helpers ----------
function textTexture(lines, o = {}) {
  const { w = 1024, h = 256, bg = PAL.navy, border = PAL.gold } = o;
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d');
  x.fillStyle = bg; x.fillRect(0, 0, w, h);
  if (border) { x.strokeStyle = border; x.lineWidth = 14; x.strokeRect(7, 7, w - 14, h - 14); }
  x.textAlign = 'center'; x.textBaseline = 'middle';
  lines.forEach(([t, size, color, y]) => { x.font = `900 ${size}px Inter, "Noto Color Emoji", sans-serif`; x.fillStyle = color; x.fillText(t, w / 2, y); });
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  return tex;
}
function plane(tex, w, h, pos, rotY = 0) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
  m.position.copy(pos); m.rotation.y = rotY; scene.add(m); return m;
}

// low-poly cartoon person (faces +z)
function character(x, z, o) {
  const { shirt, pants = '#3b3f4a', hair = '#2a1d16', skin = '#d9a77f', dadi = false, s = 1.7 } = o;
  const g = new THREE.Group();
  [-1, 1].forEach(k => { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.6, 0.6), M(pants)); leg.position.set(k * 0.35, 0.8, 0); g.add(leg); });
  const body = dadi
    ? new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.35, 3.0, 8), M(shirt))
    : new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.95, 2.2, 8), M(shirt));
  body.position.y = dadi ? 1.6 : 2.6; g.add(body);
  const arms = [-1, 1].map(k => {
    const pivot = new THREE.Group(); pivot.position.set(k * 0.95, 3.4, 0);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.8, 0.45), M(shirt)); arm.position.y = -0.85; pivot.add(arm);
    const hand = new THREE.Mesh(new THREE.IcosahedronGeometry(0.28, 0), M(skin)); hand.position.y = -1.85; pivot.add(hand);
    g.add(pivot); return pivot;
  });
  const head = new THREE.Group(); head.position.y = 4.55; g.add(head);
  head.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.95, 1), M(skin)));
  const cap = new THREE.Mesh(new THREE.SphereGeometry(1.0, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.5), M(hair));
  cap.position.set(0, 0.08, -0.08); cap.rotation.x = -0.25; head.add(cap);
  if (dadi) {
    const bun = new THREE.Mesh(new THREE.IcosahedronGeometry(0.45, 1), M(hair)); bun.position.set(0, 0.35, -0.95); head.add(bun);
    [-1, 1].forEach(k => { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.05, 6, 14), M('#1f232b')); ring.position.set(k * 0.34, 0.05, 0.88); head.add(ring); });
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 4), M('#c0262d')); dot.position.set(0, 0.42, 0.9); head.add(dot);
  } else {
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.32, 1.3, 6), M(hair)); tail.position.set(0, -0.2, -1.05); tail.rotation.x = 0.5; head.add(tail);
  }
  [-1, 1].forEach(k => { const eye = new THREE.Mesh(new THREE.SphereGeometry(0.11, 6, 5), M('#16181d')); eye.position.set(k * 0.34, 0.05, 0.9); head.add(eye); });
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.05, 4, 10, Math.PI), M('#7a2e2e'));
  mouth.position.set(0, -0.35, 0.88); mouth.rotation.z = Math.PI; head.add(mouth);
  g.scale.setScalar(s); g.position.set(x, 0.5, z); scene.add(g);
  return { g, arms, head, mouth, top: () => V(x, 0.5 + 6 * s + g.position.y - 0.5, z) };
}

// ---------- world: gold tower, shop, characters ----------
const TZ = -6;
const towerMat = M(PAL.navy2);
const tower = new THREE.Mesh(new THREE.BoxGeometry(8, 1, 8), towerMat); tower.position.set(0, 0.5, TZ); scene.add(tower);
const trim = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.6, 8.6), M(PAL.gold)); scene.add(trim);
const bar = new THREE.Group();
const barMat = M(PAL.gold2);
[[0, 0], [-2.2, 0], [2.2, 0], [-1.1, 1.3], [1.1, 1.3], [0, 2.6]].forEach(([bx, by]) => {
  const b = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.2, 3.4), barMat); b.position.set(bx, by + 0.6, 0); bar.add(b);
});
scene.add(bar);
const towerLbl = plane(textTexture([['SONA', 140, '#f4cf6a', 128]], { w: 512, h: 256 }), 6.4, 3.2, V(0, 6, TZ + 4.05));
const H = price => price * 16;              // honest scale: height ∝ price (₹ lakh / 10g)
const priceAt = t => {
  let p = 1.8;
  p = FJ.lerp(p, 1.22, FJ.easeInOut(FJ.prog(t, A(2, 0.05), A(2, 0.6))));
  p = FJ.lerp(p, 1.25, FJ.easeBack(FJ.prog(t, A(4, 0.05), A(4, 0.45))));
  return p;
};
fj.updaters.push(t => {
  const h = H(priceAt(t));
  tower.scale.y = h; tower.position.y = 0.5 + h / 2;
  trim.position.set(0, 0.5 + h, TZ);
  bar.position.set(0, 0.8 + h, TZ); bar.rotation.y = Math.sin(t * 0.9) * 0.35;
  towerLbl.position.y = 0.5 + h - 3;
});

// falling / rising arrows next to the tower
const down = new THREE.Group();
const dShaft = new THREE.Mesh(new THREE.BoxGeometry(1.6, 6, 1.6), M(PAL.red)); dShaft.position.y = 3; down.add(dShaft);
const dHead = new THREE.Mesh(new THREE.ConeGeometry(2.4, 3, 4), M(PAL.red)); dHead.rotation.x = Math.PI; down.add(dHead);
down.position.set(9, 20, TZ); scene.add(down);
const up = new THREE.Group();
const uShaft = new THREE.Mesh(new THREE.BoxGeometry(1.6, 5, 1.6), M(PAL.green)); uShaft.position.y = -2.5; up.add(uShaft);
const uHead = new THREE.Mesh(new THREE.ConeGeometry(2.4, 3, 4), M(PAL.green)); uHead.position.y = 1.2; up.add(uHead);
up.position.set(-9, 18, TZ); scene.add(up);
fj.updaters.push(t => {
  const dk = FJ.prog(t, A(2, 0.05), A(2, 0.7)), dv = t >= L(2) && t < E(2) + 0.3;
  down.visible = dv; down.position.y = 26 - 12 * FJ.easeInOut(dk); down.rotation.y = t * 2;
  const uk = FJ.easeBack(FJ.prog(t, A(4, 0.05), A(4, 0.4))), uv = t >= L(4) && t < E(4) + 0.3;
  up.visible = uv; up.scale.setScalar(Math.max(uk, 0.001)); up.rotation.y = t * 2;
});

// gold shop
const shop = FJ.addStall(fj, -14, 9, 0.35); shop.g.scale.setScalar(1.9);
plane(textTexture([['SONA SHOP 💍', 110, '#ffffff', 128]]), 11, 2.75, V(-14.6, 15.2, 10.8), 0.35);

// characters
const pinky = character(-6, 13, { shirt: '#e2558f', pants: '#2f3a56' });
const dadi = character(8, 12, { shirt: '#8e2340', hair: '#eeeeee', skin: '#c99671', dadi: true });
pinky.g.rotation.y = 0.25; dadi.g.rotation.y = -0.3;
fj.updaters.push(t => {
  // Pinky: happy wave at the peak, shock jump at the fall, calmer later
  const wave = t >= L(1) && t < E(1);
  const shock = t >= A(2, 0.4) && t < E(2) + 0.2;
  pinky.arms[1].rotation.z = wave ? 2.6 + Math.sin(t * 10) * 0.35 : shock ? 2.9 : 0.15;
  pinky.arms[0].rotation.z = shock ? -2.9 : -0.15;
  pinky.g.position.y = 0.5 + (shock ? Math.abs(Math.sin((t - A(2, 0.4)) * 9)) * 1.4 : 0);
  pinky.mouth.rotation.z = shock || (t > E(2) && t < L(5)) ? 0 : Math.PI;   // frown vs smile
  pinky.head.rotation.y = t >= L(5) && t < E(5) ? 0.7 : 0;                  // listens to Dadi
  // Dadi: nods while talking, points calmly
  const talk = t >= L(5) && t < E(5);
  dadi.head.rotation.x = talk ? Math.sin(t * 7) * 0.12 : 0;
  dadi.head.rotation.y = talk ? -0.6 : 0;
  dadi.arms[0].rotation.z = talk ? -1.2 + Math.sin(t * 5) * 0.15 : -0.12;
  dadi.arms[1].rotation.z = 0.12;
});

// ---------- the US Fed on a raised platform (far, seen with a zoom) ----------
const FZ = -135, FY = 14;
const plat = new THREE.Mesh(new THREE.BoxGeometry(40, 2, 26), M(PAL.navy)); plat.position.set(0, FY, FZ); scene.add(plat);
const platE = new THREE.Mesh(new THREE.BoxGeometry(40.6, 0.6, 26.6), new THREE.MeshBasicMaterial({ color: PAL.gold })); platE.position.set(0, FY - 1.1, FZ); scene.add(platE);
for (const sx of [-16, 16]) for (const sz of [-10, 10]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(2, FY, 2), M(PAL.navy2)); leg.position.set(sx, FY / 2, FZ + sz); scene.add(leg); }
const fed = new THREE.Mesh(new THREE.BoxGeometry(30, 14, 12), M('#f3f1ec')); fed.position.set(0, FY + 8, FZ - 2); scene.add(fed);
const ped = new THREE.Mesh(new THREE.ConeGeometry(18, 7, 4), M('#e2ddd3')); ped.position.set(0, FY + 18.5, FZ - 2); ped.rotation.y = Math.PI / 4; ped.scale.z = 0.45; scene.add(ped);
for (let i = -2; i <= 2; i++) { const col = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 12, 8), M('#ffffff')); col.position.set(i * 5.8, FY + 7, FZ + 5); scene.add(col); }
plane(textTexture([['US FED 🇺🇸', 130, '#ffffff', 128]]), 15, 3.75, V(0, FY + 12.6, FZ + 5.6));
const dollar = plane(textTexture([['$', 220, '#22a565', 140]], { w: 256, h: 256, bg: '#ffffff', border: '#22a565' }), 7, 7, V(-14, FY + 29, FZ));
const yld = plane(textTexture([['YIELDS ↑', 120, '#ffffff', 128]], { bg: PAL.red, border: '#ffffff' }), 12, 3, V(14, FY + 29, FZ));
fj.updaters.push(t => {
  const k = FJ.easeBack(FJ.prog(t, A(3, 0.45), A(3, 0.65)));
  dollar.scale.setScalar(Math.max(k, 0.001)); dollar.rotation.y = Math.sin(t * 2) * 0.4;
  const k2 = FJ.easeBack(FJ.prog(t, A(3, 0.65), A(3, 0.85)));
  yld.scale.setScalar(Math.max(k2, 0.001));
  dollar.position.y = FY + 29 + Math.sin(t * 2) * 0.8;
});

// ---------- date cards (line 6) ----------
const DZ = -40;
const cards = [
  ['25 NOV', 'US data 🇺🇸', '#93c5fd', 52],
  ['4 DEC', 'RBI policy', '#4ade80', 43],
  ['9 DEC', 'US Fed faisla', '#f4cf6a', 34],
].map(([d, sub, c, y], i) => {
  const m = plane(textTexture([[d, 150, '#ffffff', 100], [sub, 76, c, 200]], { w: 600, h: 300 }), 15, 7.5, V(0, y, DZ));
  return { m, i, y };
});
fj.updaters.push(t => cards.forEach(({ m, i, y }) => {
  const k = FJ.easeBack(FJ.prog(t, A(6, 0.12 + i * 0.22), A(6, 0.3 + i * 0.22)));
  m.visible = k > 0 && t < E(6) + 0.6;
  m.scale.setScalar(Math.max(k, 0.001));
  m.position.y = y + Math.sin(t * 2 + i) * 0.4;
}));

// ---------- camera ----------
FJ.cameraPath(fj, [
  { t: 0, pos: [45, 110, 170], at: [0, 12, -20] },
  { t: E(0), pos: [0, 24, 66], at: [0, 16, -4] },
  { t: A(1, 0.55), pos: [-16, 12, 46], at: [-5, 10, 4] },
  { t: E(1), pos: [-8, 13, 48], at: [-1, 11, 0] },
  { t: A(2, 0.65), pos: [4, 13, 50], at: [0, 11, -2] },
  { t: E(2), pos: [0, 30, 52], at: [0, 22, -70], fov: 40 },
  { t: A(3, 0.4), pos: [0, 40, 46], at: [0, 26, -135], fov: 28 },
  { t: E(3), pos: [0, 42, 36], at: [0, 27, -135], fov: 26 },
  { t: A(4, 0.45), pos: [12, 18, 52], at: [0, 13, -4], fov: 46 },
  { t: E(4), pos: [10, 15, 48], at: [2, 11, 2] },
  { t: A(5, 0.55), pos: [-1, 10, 36], at: [4, 7, 12] },
  { t: E(5), pos: [2, 28, 40], at: [0, 38, -20] },
  { t: A(6, 0.6), pos: [0, 40, 18], at: [0, 40, DZ] },
  { t: E(6), pos: [0, 41, 22], at: [0, 40, DZ] },
  { t: T, pos: [0, 150, 160], at: [0, 0, -40] },
]);

// ---------- overlays ----------
FJ.hookTitle(fj, ['SONA 30% GIRA 📉', ['₹1.8 lakh → ₹1.25 lakh', '#ffffff', PAL.navy]], E(0) - 0.25, { y: 540, size: 86 });
FJ.bigText(fj, 'Bechein ya kharidein? 🤔', 540, 870, 0.5, E(0) - 0.25, { size: 58, color: '#ffffff', bg: 'rgba(212,166,44,0.95)' });
FJ.callout(fj, pinky.top(), 'Record par kharida! 🤩', A(1, 0.55), E(1), { dx: -120, dy: -330, dot: PAL.gold });
FJ.callout(fj, pinky.top(), '30% GAYA?! 😱', A(2, 0.55), E(2), { dx: -60, dy: -360, dot: PAL.red, size: 40 });
FJ.callout(fj, V(0, 22, TZ), '14 mahine ka low', A(2, 0.25), A(2, 0.55), { dx: 180, dy: -260, dot: PAL.red });
FJ.callout(fj, V(0, FY + 20, FZ - 2), 'Rate hike ka dar', A(3, 0.25), E(3), { dx: 0, dy: -300, dot: PAL.blue });
FJ.callout(fj, V(0, 22, TZ), 'MCX: ~₹1.25 lakh', A(4, 0.3), E(4), { dx: 160, dy: -280, dot: PAL.green });
FJ.callout(fj, dadi.top(), 'Ghabrao mat beta 🙂', A(5, 0.15), E(5), { dx: 60, dy: -330, dot: PAL.gold });
FJ.hud(fj, [
  { t0: L(1), t1: E(1), value: '~₹1.8 lakh', label: 'Jan 2026 · 10g', color: PAL.gold },
  { t0: L(2), t1: E(2), value: '−30%', label: 'peak se · 20 Nov', color: PAL.red },
  { t0: L(3), t1: E(3), value: '$ ↑  Yields ↑', label: 'US', color: PAL.blue },
  { t0: L(4), t1: E(4), value: '~₹1.25 lakh', label: 'MCX · 23 Nov', color: PAL.green },
  { t0: L(5), t1: E(5), value: '~₹1.27 lakh', label: '24K retail · 24 Nov', color: PAL.gold },
], { w: 700 });
FJ.brandBadge(fj, E(0), L(7));
FJ.tag(fj, 'not advice');
FJ.endCard(fj, L(7), { cta: 'Comment: 1, 2 ya 3 👇', note: 'Bechoge = 1 · Rukoge = 2 · Kharidoge = 3\nRates 23–24 Nov 2026; badalte rehte hain. Not advice.\nSources: MCX, Groww, IndMoney, IBTimes, FXStreet' });
FJ.captions(fj);
FJ.progressBar(fj);
FJ.ready(fj);
