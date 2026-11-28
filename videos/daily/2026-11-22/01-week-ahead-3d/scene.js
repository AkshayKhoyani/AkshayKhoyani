// Week ahead (23–30 Nov 2026 + RBI 2–4 Dec): a 3D "week highway" with one gate per day.
// Sources: BusinessToday/CNBC-TV18 (expiry moved to Mon 23; Nifty 25,801; FII record inflow), exchange holiday
// calendars (24 Nov Prakash Gurpurb), BEA calendar via Kiplinger/mlq.ai (US GDP 2nd est + PCE on 25 Nov; Thanksgiving
// 26 Nov; early close 27 Nov), CME FedWatch via news (Dec hike odds >95%), MoSPI advance release calendar (Q2 GDP 30 Nov),
// FinMin/SBI estimates (7.3–7.8%), MSCI Nov 2026 review coverage (LIC, Coforge, Adani Green, Meesho; ~$2bn est.),
// RBI press release (MPC 2–4 Dec 2026).
import * as FJ from '/engine/fj3d.js';
const { THREE, PAL } = FJ;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const M = c => new THREE.MeshLambertMaterial({ color: c, flatShading: true });

const fj = await FJ.boot();
const { L, E, A } = fj;
const T = fj.tl.total;
const scene = fj.scene;

FJ.buildCity(fj, {
  seed: 23,
  reserved: [
    { x: 60, z: 75, r: 18 }, { x: 0, z: 5, r: 18 }, { x: 60, z: -65, r: 20 }, { x: 0, z: -65, r: 16 },
    { x: 60, z: -135, r: 20 }, { x: 0, z: -205, r: 20 }, { x: 60, z: -205, r: 20 }, { x: 60, z: -275, r: 20 },
  ],
});

// ---------- helpers ----------
function textTexture(lines, o = {}) {
  const { w = 1024, h = 256, bg = PAL.navy, border = PAL.gold } = o;
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d');
  x.fillStyle = bg; x.fillRect(0, 0, w, h);
  x.strokeStyle = border; x.lineWidth = 14; x.strokeRect(7, 7, w - 14, h - 14);
  x.textAlign = 'center'; x.textBaseline = 'middle';
  lines.forEach(([t, size, color, y]) => { x.font = `900 ${size}px Inter, "Noto Color Emoji", sans-serif`; x.fillStyle = color; x.fillText(t, w / 2, y); });
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  return tex;
}
function plane(tex, w, h, pos, rotY = 0) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
  m.position.copy(pos); m.rotation.y = rotY; scene.add(m); return m;
}
const ROADX = 30;
// gate across the "week highway" (road at x = 30)
function gate(z, day, date, sub, accent) {
  const g = new THREE.Group();
  [-1, 1].forEach(s => { const p = new THREE.Mesh(new THREE.BoxGeometry(2.4, 40, 2.4), M(PAL.navy)); p.position.set(ROADX + s * 11, 20, z); g.add(p); });
  const beam = new THREE.Mesh(new THREE.BoxGeometry(26, 7.5, 2.2), M(PAL.navy)); beam.position.set(ROADX, 40, z); g.add(beam);
  scene.add(g);
  const tex = textTexture([[`${day} · ${date}`, 104, '#ffffff', 100], [sub, 62, accent, 196]]);
  plane(tex, 24, 6, V(ROADX, 40, z + 1.2));
  return { g, top: V(ROADX, 44, z) };
}
const gates = [
  gate(118, 'SOM', '23 NOV', 'F&O EXPIRY ⏳', '#f4cf6a'),
  gate(48, 'MANGAL', '24 NOV', 'MARKET BAND 🔒', '#f87171'),
  gate(-22, 'BUDH', '25 NOV', 'US GDP + PCE 🇺🇸', '#93c5fd'),
  gate(-92, 'GURU', '26 NOV', 'US MARKET BAND 🦃', '#f4cf6a'),
  gate(-162, 'SOM', '30 NOV', 'INDIA GDP + MSCI 📊', '#4ade80'),
  gate(-232, '2–4', 'DEC', 'RBI POLICY 🏦', '#93c5fd'),
];
// gold road stripe along the highway
const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 420), new THREE.MeshBasicMaterial({ color: PAL.gold }));
stripe.position.set(ROADX, 0.35, -60); scene.add(stripe);
const PROPS_FROM = scene.children.length;

// floating platform helper (cars pass underneath)
function platform(x, y, z, w, d) {
  const p = new THREE.Mesh(new THREE.BoxGeometry(w, 1.2, d), M(PAL.navy)); p.position.set(x, y, z); scene.add(p);
  const e = new THREE.Mesh(new THREE.BoxGeometry(w + 0.6, 0.5, d + 0.6), new THREE.MeshBasicMaterial({ color: PAL.gold })); e.position.set(x, y - 0.6, z); scene.add(e);
}
const bob = (o, base, t, k = 1) => { o.position.y = base + Math.sin(t * 1.6 + k) * 0.8; };

// Mon: giant hourglass floating over the highway
const hg = new THREE.Group();
const glass = new THREE.MeshLambertMaterial({ color: '#cfe3f5', transparent: true, opacity: 0.55, flatShading: true });
const c1 = new THREE.Mesh(new THREE.ConeGeometry(6, 9, 8), glass); c1.position.y = 4.5; c1.rotation.x = Math.PI; hg.add(c1);
const c2 = new THREE.Mesh(new THREE.ConeGeometry(6, 9, 8), glass); c2.position.y = -4.5; hg.add(c2);
const sandTop = new THREE.Mesh(new THREE.ConeGeometry(4, 5, 8), M(PAL.gold)); sandTop.position.y = 3; sandTop.rotation.x = Math.PI; hg.add(sandTop);
const sandBot = new THREE.Mesh(new THREE.ConeGeometry(4.6, 3, 8), M(PAL.gold)); sandBot.position.y = -7.4; hg.add(sandBot);
[-1, 1].forEach(s => { const cap = new THREE.Mesh(new THREE.CylinderGeometry(7, 7, 1.2, 8), M(PAL.navy)); cap.position.y = s * 9.4; hg.add(cap); });
hg.scale.setScalar(1.25); hg.position.set(ROADX, 24, 84); scene.add(hg);
fj.updaters.push(t => {
  hg.rotation.y = t * 0.6; bob(hg, 24, t);
  const k = FJ.prog(t, L(1), E(1));
  sandTop.scale.setScalar(1 - 0.8 * k); sandBot.scale.set(1, 0.4 + 1.2 * k, 1);
});

// Tue: floating stock-exchange facade with a shutter
const EXZ = 14;
platform(ROADX, 7, EXZ, 32, 12);
const exBody = new THREE.Mesh(new THREE.BoxGeometry(30, 18, 8), M('#e9e4da')); exBody.position.set(ROADX, 17, EXZ - 2); scene.add(exBody);
const roof = new THREE.Mesh(new THREE.BoxGeometry(32, 3, 10), M(PAL.navy)); roof.position.set(ROADX, 27.5, EXZ - 2); scene.add(roof);
for (let i = -2; i <= 2; i++) { const col = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 13, 8), M('#ffffff')); col.position.set(ROADX + i * 5.6, 14.2, EXZ + 3.5); scene.add(col); }
plane(textTexture([['STOCK EXCHANGE', 120, '#ffffff', 128]]), 26, 6.4, V(ROADX, 24.5, EXZ + 3.2));
const shutter = new THREE.Mesh(new THREE.BoxGeometry(28, 13, 0.8), M('#9aa3ad')); shutter.position.set(ROADX, 34, EXZ + 4.4); scene.add(shutter);
const closed = plane(textTexture([['CLOSED 🔒', 150, '#ffffff', 128]], { bg: '#b91c1c', border: '#ffffff' }), 16, 4, V(ROADX, 14, EXZ + 5));
fj.updaters.push(t => {
  const k = FJ.easeOut(FJ.prog(t, A(2, 0.15), A(2, 0.5)));
  shutter.position.y = 34 - 19.5 * k; shutter.visible = k > 0; closed.visible = k > 0.95;
});

// Wed: floating US "Fed" building + gold & silver bars in front
const USZ = -58;
platform(ROADX, 8, USZ, 30, 16);
const usBody = new THREE.Mesh(new THREE.BoxGeometry(26, 14, 10), M('#f3f1ec')); usBody.position.set(ROADX, 16, USZ - 2); scene.add(usBody);
const ped = new THREE.Mesh(new THREE.ConeGeometry(16, 6, 4), M('#e2ddd3')); ped.position.set(ROADX, 26, USZ - 2); ped.rotation.y = Math.PI / 4; ped.scale.z = 0.5; scene.add(ped);
for (let i = -2; i <= 2; i++) { const col = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 12, 8), M('#ffffff')); col.position.set(ROADX + i * 5, 15, USZ + 4); scene.add(col); }
const flagTex = (() => {
  const c = document.createElement('canvas'); c.width = 380; c.height = 200; const x = c.getContext('2d');
  for (let i = 0; i < 13; i++) { x.fillStyle = i % 2 ? '#ffffff' : '#b22234'; x.fillRect(0, i * 200 / 13, 380, 200 / 13 + 1); }
  x.fillStyle = '#3c3b6e'; x.fillRect(0, 0, 152, 108);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();
const flag = plane(flagTex, 8, 4.2, V(ROADX + 10, 33, USZ - 2));
const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 9, 6), M('#d1d5db')); pole.position.set(ROADX + 5.8, 31, USZ - 2); scene.add(pole);
fj.updaters.push(t => { flag.rotation.y = Math.sin(t * 3) * 0.25; });
platform(ROADX, 6, USZ + 16, 18, 8);
const bars = new THREE.Group();
const barGeo = new THREE.BoxGeometry(4, 1.6, 2.2);
for (let r = 0; r < 3; r++) for (let i = 0; i < 4 - r; i++) {
  const b = new THREE.Mesh(barGeo, M(r === 2 ? '#c7cdd4' : PAL.gold2)); b.position.set((i - (3 - r) / 2) * 4.3, 1 + r * 1.7, 0); bars.add(b);
}
bars.position.set(ROADX, 6.6, USZ + 16); scene.add(bars);
fj.updaters.push(t => { bars.rotation.y = t > L(3) && t < E(3) ? Math.sin((t - L(3)) * 2) * 0.35 : 0; });

// Thu: floating "US MARKETS · THANKSGIVING" board with shutter
const THZ = -128;
platform(ROADX, 7, THZ, 26, 8);
const board = new THREE.Mesh(new THREE.BoxGeometry(24, 16, 4), M('#cdd3da')); board.position.set(ROADX, 16, THZ); scene.add(board);
plane(textTexture([['US MARKETS', 110, '#ffffff', 90], ['THANKSGIVING 🦃', 66, '#f4cf6a', 190]]), 22, 5.5, V(ROADX, 20.5, THZ + 2.2));
const sh2 = new THREE.Mesh(new THREE.BoxGeometry(22, 8, 0.8), M('#9aa3ad')); sh2.position.set(ROADX, 30, THZ + 2.6); scene.add(sh2);
const half = plane(textTexture([['CLOSED · Fri ½ din', 96, '#ffffff', 128]], { bg: '#b91c1c', border: '#ffffff' }), 18, 4.5, V(ROADX, 12, THZ + 3));
fj.updaters.push(t => { const k = FJ.easeOut(FJ.prog(t, A(4, 0.15), A(4, 0.45))); sh2.position.y = 30 - 18 * k; sh2.visible = k > 0; half.visible = k > 0.95; });

// Mon 30: GDP bars on a platform + MSCI cube floating behind
const GZ = -196;
platform(ROADX, 6, GZ, 34, 10);
const gdp = [];
for (let i = 0; i < 5; i++) {
  const h = [8, 10, 12, 14, 18][i];
  const b = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1, 4.6), M(i === 4 ? PAL.green : '#7aa58a'));
  b.position.set(ROADX - 13 + i * 6.5, 7, GZ); b.userData.h = h; scene.add(b); gdp.push(b);
}
fj.updaters.push(t => gdp.forEach((b, i) => {
  const k = FJ.easeOut(FJ.prog(t, A(5, 0.05 + i * 0.05), A(5, 0.2 + i * 0.05)));
  const h = 0.5 + b.userData.h * k; b.scale.y = h; b.position.y = 6.6 + h / 2;
}));
const gdpLbl = plane(textTexture([['INDIA GDP · Q2', 110, '#ffffff', 128]], { bg: '#166534', border: '#4ade80' }), 16, 4, V(ROADX, 30, GZ + 3));
fj.updaters.push(t => { gdpLbl.visible = t < A(5, 0.45); });
const msci = new THREE.Mesh(new THREE.BoxGeometry(12, 12, 12), M(PAL.navy2)); msci.position.set(ROADX, 32, GZ - 40); scene.add(msci);
const msciLbl = plane(textTexture([['MSCI', 150, '#f4cf6a', 128]]), 10, 2.5, V(ROADX, 32, GZ - 33.9));
fj.updaters.push(t => { bob(msci, 32, t, 2); msciLbl.position.y = msci.position.y; });
const mTop = V(ROADX, 32, GZ - 40);

// RBI: bank on a platform + rotating % ring
const RZ = -270;
platform(ROADX, 4, RZ, 30, 24);
const rbi = FJ.addBank(fj, ROADX, RZ, 18, 22, 16); rbi.g.position.y = 4;
plane(textTexture([['RBI POLICY', 120, '#ffffff', 128]]), 18, 4.5, V(ROADX, 15, RZ + 9.2));
const pct = plane(textTexture([['%', 200, '#f4cf6a', 135]], { w: 256, h: 256, bg: PAL.navy }), 8, 8, V(ROADX, 36, RZ));
const ring = new THREE.Mesh(new THREE.TorusGeometry(9, 0.7, 6, 40), new THREE.MeshBasicMaterial({ color: PAL.gold2 }));
ring.position.set(ROADX, 36, RZ); scene.add(ring);
fj.updaters.push(t => { pct.rotation.y = t * 1.4; ring.rotation.x = t * 0.9; ring.rotation.y = t * 0.5; });

// each day's prop spins away once its line is done ("date ticked off"), so the camera never flies through it
const dayOf = z => z > 60 ? 1 : z > 0 ? 2 : z > -80 ? 3 : z > -150 ? 4 : z > -250 ? 5 : 6;
const dyn = new Set([hg, msci, msciLbl, shutter, sh2, ...gdp]);
const ext = new Set([closed, half, shutter, sh2, gdpLbl]);   // visibility controlled elsewhere   // objects whose y/scale other updaters set every frame
const propObjs = scene.children.slice(PROPS_FROM).map(o => ({ o, day: dayOf(o.position.z), s: o.scale.clone(), y: o.position.y, r: o.rotation.y }));
fj.updaters.push(t => propObjs.forEach(p => {
  if (p.day >= 6) return;
  const k = FJ.easeInOut(FJ.prog(t, E(p.day) - 0.1, E(p.day) + 0.55));
  const d = dyn.has(p.o);
  if (!ext.has(p.o)) p.o.visible = k < 0.99; else if (k >= 0.99) p.o.visible = false;
  if (k <= 0) { if (!d) { p.o.scale.copy(p.s); p.o.position.y = p.y; p.o.rotation.y = p.r; } return; }
  const f = Math.max(1 - k, 0.001);
  if (d) { p.o.scale.multiplyScalar(f); p.o.position.y += 14 * k; }
  else { p.o.scale.set(p.s.x * f, p.s.y * f, p.s.z * f); p.o.position.y = p.y + 14 * k; p.o.rotation.y = p.r + 2 * k; }
}));

// ---------- camera ----------
FJ.cameraPath(fj, [
  { t: 0, pos: [30, 135, 270], at: [30, 0, -70] },
  { t: E(0), pos: [30, 30, 196], at: [30, 26, 84] },
  { t: A(1, 0.6), pos: [30, 18, 146], at: [30, 22, 84] },
  { t: E(1), pos: [30, 17, 112], at: [30, 18, EXZ] },
  { t: A(2, 0.6), pos: [30, 16, 90], at: [30, 17, EXZ] },
  { t: E(2), pos: [30, 15, 30], at: [30, 17, USZ] },
  { t: A(3, 0.4), pos: [30, 15, 2], at: [30, 17, USZ] },
  { t: A(3, 0.85), pos: [30, 14, -16], at: [30, 9, USZ + 16] },
  { t: A(4, 0.55), pos: [30, 14, -80], at: [30, 17, THZ] },
  { t: A(5, 0.3), pos: [30, 15, -150], at: [30, 12, GZ] },
  { t: A(5, 0.8), pos: [30, 30, -160], at: [30, 30, GZ - 40] },
  { t: A(6, 0.6), pos: [30, 20, -206], at: [30, 22, RZ] },
  { t: T, pos: [30, 280, 60], at: [30, 0, -140] },
]);




// ---------- data packets ----------
const bankTops = [V(-120, 22, -275), V(-180, 22, -65), V(180, 22, -135), V(150, 22, -320)];
bankTops.forEach((p, i) => FJ.arc(fj, p, mTop, A(5, 0.5 + i * 0.07), A(5, 0.68 + i * 0.07), { color: PAL.gold, size: 9, tube: 0.6 }));
FJ.arc(fj, V(ROADX, 26, USZ), V(ROADX - 40, 30, USZ - 60), A(3, 0.55), A(3, 0.75), { color: '#60a5fa' });
FJ.arc(fj, V(ROADX, 26, USZ), V(ROADX + 40, 30, USZ - 60), A(3, 0.6), A(3, 0.8), { color: '#60a5fa' });

// ---------- overlays ----------
FJ.hookTitle(fj, ['AGLE 7 DIN 💣', ['Market hilane wale 5 DATES', '#ffffff', PAL.navy]], E(0) - 0.25, { y: 430, size: 86 });
FJ.bigText(fj, 'Save karo 📌', 540, 760, 0.6, E(0) - 0.25, { size: 58, color: '#ffffff', bg: 'rgba(212,166,44,0.95)' });
FJ.callout(fj, V(ROADX, 36, 84), 'Nifty monthly expiry', A(1, 0.35), E(1), { dx: -200, dy: -180, dot: PAL.gold });
FJ.callout(fj, V(ROADX, 12, EXZ + 5), 'NSE + BSE closed', A(2, 0.55), E(2), { dx: 220, dy: 220, dot: PAL.red });
FJ.callout(fj, V(ROADX, 29, USZ), 'US: GDP + PCE inflation', A(3, 0.12), A(3, 0.6), { dx: -160, dy: -230, dot: PAL.blue });
FJ.callout(fj, V(ROADX, 11, USZ + 16), 'Gold · Rupee · FII 👀', A(3, 0.62), E(3), { dx: 160, dy: -300, dot: PAL.gold });
FJ.callout(fj, V(ROADX + 10, 24, THZ + 2), 'Fri: sirf aadha din', A(4, 0.5), E(4), { dx: 160, dy: -260, dot: PAL.gold });
FJ.callout(fj, V(ROADX + 13, 25, GZ), 'Q2 GDP andaaza: 7.3–7.8%', A(5, 0.15), A(5, 0.55), { dx: -120, dy: -330, dot: PAL.green });
FJ.callout(fj, mTop, 'MSCI: LIC · Coforge · Adani Green · Meesho', A(5, 0.5), E(5), { dx: 0, dy: -300, size: 30, dot: PAL.gold });
FJ.callout(fj, V(ROADX, 45, RZ), 'RBI MPC: 2–4 Dec', A(6, 0.25), E(6), { dx: -180, dy: -200, dot: PAL.blue });
FJ.hud(fj, [
  { t0: L(1), t1: E(1), value: 'F&O Expiry', label: 'Mon 23 Nov', color: PAL.gold },
  { t0: L(2), t1: E(2), value: 'Market BAND', label: 'Tue 24 Nov', color: PAL.red },
  { t0: L(3), t1: E(3), value: 'Fed hike 95%+', label: 'odds · CME', color: PAL.blue },
  { t0: L(4), t1: E(4), value: 'US closed', label: 'Thu 26 Nov', color: PAL.gold },
  { t0: L(5), t1: A(5, 0.5), value: '7.3–7.8%', label: 'Q2 GDP est.', color: PAL.green },
  { t0: A(5, 0.5), t1: E(5), value: '~$2 bn', label: 'MSCI inflow est.', color: PAL.gold },
  { t0: L(6), t1: E(6), value: 'RBI Policy', label: '2–4 Dec', color: PAL.blue },
]);
FJ.brandBadge(fj, E(0), L(7));
FJ.tag(fj, 'not advice');
FJ.endCard(fj, L(7), { note: 'Dates official calendars se; badal sakti hain. Not investment advice.\nSources: NSE/BSE, MoSPI, RBI, BEA, MSCI coverage, CME FedWatch.' });
FJ.captions(fj);
FJ.progressBar(fj);
FJ.ready(fj);
