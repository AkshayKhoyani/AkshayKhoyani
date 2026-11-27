// 12 premium 3D theme samples for Finance Junction (all code-built, no AI images).
// Frame at time t = theme index (0..11). Same news item in every theme for comparison.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mascot } from '/engine/mascot.js';

const W = 1080, H = 1920;
const glc = document.createElement('canvas'); glc.width = W; glc.height = H;
const R = new THREE.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true });
R.setPixelRatio(1); R.setSize(W, H, false); R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.0;
const out = document.createElement('canvas'); out.width = W; out.height = H; out.id = 'out'; document.body.appendChild(out);
const ctx = out.getContext('2d');
await Promise.all(['900', '800', '700'].map(w => document.fonts.load(`${w} 40px Inter`)));
await document.fonts.load('40px "Noto Color Emoji"', '🏦📉📈🔔🔁👆');
const logo = await new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = '/brand/logo-transparent.png'; });

// ---------- helpers ----------
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647, (seed - 1) / 2147483646);
const std = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: o.r ?? 0.7, metalness: o.m ?? 0.05, emissive: o.e || 0x000000, emissiveIntensity: o.ei ?? 1, flatShading: o.flat ?? false, transparent: o.op != null, opacity: o.op ?? 1 });
const glow = (c, i = 2) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: i });
const box = (w, h, d, m, x, y, z, rad = 0) => { const g = rad ? new RoundedBoxGeometry(w, h, d, 3, rad) : new THREE.BoxGeometry(w, h, d); const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; return o; };
function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
function windowsTex(base, lit, p = 0.45, cols = 6, rows = 12) {
  return canvasTex(256, 512, (x, w, h) => {
    x.fillStyle = base; x.fillRect(0, 0, w, h);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      x.fillStyle = rnd() < p ? lit : 'rgba(0,0,0,0.35)';
      x.fillRect(12 + c * (w - 24) / cols, 14 + r * (h - 28) / rows, (w - 24) / cols - 10, (h - 28) / rows - 14);
    }
  });
}
function textPanel(lines, o = {}) {
  const { w = 1024, h = 300, bg = '#0b2545', border = '#d4a62c', bw = 14 } = o;
  return canvasTex(w, h, (x) => {
    x.fillStyle = bg; x.fillRect(0, 0, w, h); if (border) { x.strokeStyle = border; x.lineWidth = bw; x.strokeRect(bw / 2, bw / 2, w - bw, h - bw); }
    x.textAlign = 'center'; x.textBaseline = 'middle';
    lines.forEach(([t, s, c, y, f = 'Inter']) => { x.font = `900 ${s}px ${f}, "Noto Color Emoji", sans-serif`; x.fillStyle = c; x.fillText(t, w / 2, y); });
  });
}
const plane = (tex, w, h, x, y, z, o = {}) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), o.glow ? new THREE.MeshBasicMaterial({ map: tex, color: '#c8c8c8' }) : new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 })); m.position.set(x, y, z); return m; };
const skyGrad = (top, bottom, mid) => canvasTex(16, 512, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, top); if (mid) g.addColorStop(0.55, mid); g.addColorStop(1, bottom); x.fillStyle = g; x.fillRect(0, 0, w, h); });
const NEWS = [['4 DEC · RBI POLICY 🏦', 92, '#ffffff', 110], ['Repo 5.50% · Faisla Friday', 58, '#f4cf6a', 215]];
const NEWS_L = [['4 DEC · RBI POLICY 🏦', 92, '#0b2545', 110], ['Repo 5.50% · Faisla Friday', 58, '#b45309', 215]];
function city(sc, o) { // generic block city around a road along z
  const { base = '#2a2f3a', lit = '#ffd27a', p = 0.4, n = 70, road = '#20242c', mat = null, hMin = 10, hMax = 60, spread = 160, gap = 16, rad = 0 } = o;
  const texs = [0, 1, 2].map(() => windowsTex(base, lit, p));
  for (let i = 0; i < n; i++) {
    const side = i % 2 ? 1 : -1, x = side * (gap + rnd() * spread * 0.5 + 6), z = 60 - rnd() * 360, w = 8 + rnd() * 10, d = 8 + rnd() * 10, h = hMin + rnd() * (hMax - hMin);
    const m = mat ? mat(i) : new THREE.MeshStandardMaterial({ map: texs[i % 3], emissiveMap: texs[i % 3], emissive: 0xffffff, emissiveIntensity: o.ei ?? 0.9, roughness: 0.8 });
    const b = box(w, h, d, m, x, h / 2, z, rad); sc.add(b);
  }
  if (road) { const r = new THREE.Mesh(new THREE.PlaneGeometry(22, 500), std(road, { r: o.roadR ?? 0.9, m: o.roadM ?? 0 })); r.rotation.x = -Math.PI / 2; r.position.set(0, 0.05, -120); r.receiveShadow = true; sc.add(r); }
}
function gate(sc, z, o = {}) {
  const { frame = std('#0b2545', { r: 0.4, m: 0.4 }), panel = textPanel(NEWS), glowP = false, y = 30 } = o;
  [-1, 1].forEach(s => sc.add(box(2.6, y + 4, 2.6, frame, s * 13, (y + 4) / 2, z, 0.4)));
  sc.add(box(30, 9, 2.4, frame, 0, y + 4, z, 0.5));
  sc.add(plane(panel, 28, 8.2, 0, y + 4, z + 1.3, { glow: glowP }));
}
function sun(sc, c, i, pos, shadow = true) {
  const l = new THREE.DirectionalLight(c, i); l.position.set(...pos); l.castShadow = shadow;
  l.shadow.mapSize.set(1024, 1024); Object.assign(l.shadow.camera, { left: -150, right: 150, top: 150, bottom: -150, far: 800 }); sc.add(l); return l;
}
function bank(sc, x, y, z, k = 1, matBody = std('#16325c', { r: 0.4, m: 0.3 }), gold = std('#d4a62c', { r: 0.3, m: 0.8 })) {
  const g = new THREE.Group();
  g.add(box(22, 14, 14, matBody, 0, 7, 0, 0.6)); g.add(box(25, 2, 16, gold, 0, 14.6, 0, 0.4));
  const roof = new THREE.Mesh(new THREE.ConeGeometry(15, 6, 4), gold); roof.rotation.y = Math.PI / 4; roof.scale.z = 0.62; roof.position.y = 18.5; roof.castShadow = true; g.add(roof);
  for (let i = -2; i <= 2; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 11, 12), std('#f1efe9', { r: 0.5 })); c.position.set(i * 4.4, 5.6, 7.6); c.castShadow = true; g.add(c); }
  g.position.set(x, y, z); g.scale.setScalar(k); sc.add(g); return g;
}
function pctRing(sc, x, y, z, mat = glow('#f4cf6a', 2.5)) {
  const r = new THREE.Mesh(new THREE.TorusGeometry(9, 0.6, 12, 64), mat); r.position.set(x, y, z); r.rotation.set(1.1, 0.3, 0); sc.add(r);
  sc.add(plane(canvasTex(256, 256, (c) => { c.font = '900 200px Inter'; c.fillStyle = '#f4cf6a'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('%', 128, 140); }), 9, 9, x, y, z, { glow: true }));
}

// ---------- 12 themes ----------
const T = [];
T.push({ name: 'Neon Night City', accent: '#22d3ee', dark: true, build(sc, cam) {
  sc.background = new THREE.Color('#05060f'); sc.fog = new THREE.FogExp2('#0a0f2a', 0.0042);
  sc.add(new THREE.HemisphereLight('#3b4cff', '#05060f', 0.6));
  city(sc, { base: '#0d1430', lit: '#ffd27a', p: 0.3, ei: 1.1 });
  [-11, 11].forEach(x => sc.add(box(0.5, 0.2, 500, glow('#22d3ee', 4), x, 0.2, -120)));
  sc.add(box(0.5, 0.2, 500, glow('#f4cf6a', 3), 0, 0.2, -120));
  gate(sc, -40, { frame: glow('#ff2d95', 1.6), panel: textPanel(NEWS, { bg: '#0a0a1a', border: '#22d3ee' }), glowP: true });
  bank(sc, 0, 0, -95, 1.2, std('#111a3a', { r: 0.3, m: 0.6, e: '#1d2b6b', ei: 0.5 }), glow('#f4cf6a', 1.4));
  pctRing(sc, 0, 42, -95);
  cam.position.set(4, 12, 56); cam.lookAt(0, 22, -80);
}, bloom: [0.9, 0.5, 0.85] });

T.push({ name: 'Golden Hour', accent: '#f59e0b', build(sc, cam) {
  sc.background = skyGrad('#3b2a6b', '#ffb36b', '#ff7a59'); sc.fog = new THREE.Fog('#ff9a6b', 150, 520);
  sc.add(new THREE.HemisphereLight('#ffd1a6', '#5b3b2b', 0.9)); sun(sc, '#ffb26b', 3.2, [-120, 60, -260]);
  city(sc, { base: '#e8cfae', lit: '#ffe6b0', p: 0.2, ei: 0.25, rad: 0.8 });
  const g = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), std('#e9c99a')); g.rotation.x = -Math.PI / 2; g.receiveShadow = true; sc.add(g);
  const s = new THREE.Mesh(new THREE.SphereGeometry(16, 32, 16), new THREE.MeshBasicMaterial({ color: '#fff1c1', toneMapped: false })); s.position.set(-60, 45, -420); sc.add(s);
  gate(sc, -40, { frame: std('#d4a62c', { r: 0.25, m: 0.9 }) });
  bank(sc, 0, 0, -95, 1.2); pctRing(sc, 0, 42, -95, std('#d4a62c', { r: 0.2, m: 1 }));
  cam.position.set(-10, 14, 70); cam.lookAt(0, 20, -80);
}, bloom: [0.4, 0.6, 0.9] });

T.push({ name: 'Trading Floor', accent: '#22c55e', dark: true, build(sc, cam) {
  sc.background = new THREE.Color('#070a0f'); sc.add(new THREE.HemisphereLight('#9fb4ff', '#0b0b0b', 0.5));
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(200, 300), std('#0f141c', { r: 0.15, m: 0.8 })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; sc.add(fl);
  const tick = canvasTex(2048, 512, (x, w, h) => {
    x.fillStyle = '#020617'; x.fillRect(0, 0, w, h); x.font = '900 64px "JetBrains Mono", monospace';
    const rows = [['NIFTY 25,607 ▼1.07%', '#ef4444'], ['SENSEX 83,339 ▼1.17%', '#ef4444'], ['BANK NIFTY ▼', '#ef4444'], ['NIFTY METAL ▲', '#22c55e'], ['USD/INR', '#f4cf6a'], ['BRENT $97 ▲', '#22c55e']];
    rows.forEach(([t, c], i) => { x.fillStyle = c; x.fillText(t, 40 + (i % 2) * 1020, 90 + Math.floor(i / 2) * 150); });
  });
  sc.add(plane(tick, 120, 30, 0, 44, -110, { glow: true }));
  for (let i = -3; i <= 3; i++) { if (!i) continue; sc.add(box(4, 60, 4, std('#1b2230', { r: 0.4, m: 0.6 }), i * 22, 30, -60, 0.6)); }
  for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) { const d = box(10, 1.2, 5, std('#121826', { r: 0.3, m: 0.7 }), -30 + i * 12, 4, -10 - j * 18, 0.3); sc.add(d); sc.add(plane(canvasTex(256, 128, (x) => { x.fillStyle = '#031b0e'; x.fillRect(0, 0, 256, 128); x.strokeStyle = rnd() < 0.5 ? '#22c55e' : '#ef4444'; x.lineWidth = 8; x.beginPath(); for (let k = 0; k < 10; k++) x.lineTo(k * 28, 64 + Math.sin(k + i) * 40); x.stroke(); }), 6, 3, -30 + i * 12, 6.6, -12 - j * 18, { glow: true })); }
  for (let i = -2; i <= 2; i++) { const l = new THREE.PointLight('#bcd2ff', 300, 120); l.position.set(i * 30, 50, -40); sc.add(l); sc.add(box(14, 0.6, 3, glow('#dbe7ff', 1.2), i * 30, 58, -40)); }
  gate(sc, -55, { frame: std('#1b2230', { r: 0.3, m: 0.8 }), panel: textPanel(NEWS, { bg: '#020617', border: '#22c55e' }), glowP: true, y: 20 });
  cam.position.set(0, 16, 58); cam.lookAt(0, 20, -80);
}, bloom: [0.6, 0.5, 0.85] });

T.push({ name: 'Floating Islands', accent: '#38bdf8', build(sc, cam) {
  sc.background = skyGrad('#3a8fe8', '#dff1ff'); sc.fog = new THREE.Fog('#cfe8ff', 160, 520);
  sc.add(new THREE.HemisphereLight('#ffffff', '#7aa7d8', 1.2)); sun(sc, '#fff4da', 2.4, [80, 160, 60]);
  const island = (x, y, z, r) => {
    const g = new THREE.Group();
    const rock = new THREE.Mesh(new THREE.ConeGeometry(r, r * 1.4, 7), std('#8b6b4a', { flat: true })); rock.rotation.x = Math.PI; rock.position.y = -r * 0.7; g.add(rock);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.98, 2.4, 7), std('#6cc46c', { flat: true })); top.receiveShadow = top.castShadow = true; g.add(top);
    for (let i = 0; i < 5; i++) { const a = rnd() * 6.3, d = rnd() * r * 0.7; const t = new THREE.Mesh(new THREE.ConeGeometry(1.6, 4.5, 6), std('#2f8f4e', { flat: true })); t.position.set(Math.cos(a) * d, 3.4, Math.sin(a) * d); t.castShadow = true; g.add(t); }
    g.position.set(x, y, z); sc.add(g); return g;
  };
  island(0, 0, -90, 26); island(-55, 18, -170, 16); island(50, -10, -150, 14); island(-40, -25, -40, 10); island(45, 30, -240, 18);
  bank(sc, 0, 1, -95, 1.1);
  sc.add(box(4, 1, 70, std('#a47148'), -26, 8, -125, 0.3));
  for (let i = 0; i < 14; i++) { const c = new THREE.Group(); for (let k = 0; k < 5; k++) { const s = new THREE.Mesh(new THREE.SphereGeometry(4 + rnd() * 4, 12, 10), std('#ffffff', { r: 1 })); s.position.set(k * 5, rnd() * 2, rnd() * 3); c.add(s); } c.position.set(-150 + rnd() * 300, -30 + rnd() * 90, -60 - rnd() * 300); sc.add(c); }
  gate(sc, -55, { frame: std('#0b2545', { r: 0.4, m: 0.3 }), y: 26 });
  cam.position.set(10, 22, 40); cam.lookAt(0, 18, -90);
}, bloom: null });

T.push({ name: 'Bull vs Bear Arena', accent: '#ef4444', dark: true, build(sc, cam) {
  sc.background = new THREE.Color('#0b0b12'); sc.fog = new THREE.Fog('#0b0b12', 120, 400);
  sc.add(new THREE.HemisphereLight('#ffffff', '#222', 0.5));
  const field = new THREE.Mesh(new THREE.CircleGeometry(70, 64), std('#1f6f3a')); field.rotation.x = -Math.PI / 2; field.receiveShadow = true; sc.add(field);
  for (let r = 0; r < 6; r++) { const ring = new THREE.Mesh(new THREE.CylinderGeometry(76 + r * 7, 76 + r * 7, 4, 64, 1, true), std(r % 2 ? '#2b2f3a' : '#3a404d', { r: 0.8 })); ring.material.side = THREE.DoubleSide; ring.position.y = 2 + r * 4; sc.add(ring); }
  const sp = (x, z, c) => { const l = new THREE.SpotLight(c, 30000, 400, 0.4, 0.5); l.position.set(x, 90, z); l.target.position.set(0, 0, 0); l.castShadow = true; sc.add(l, l.target); };
  sp(-60, 40, '#ffffff'); sp(60, 40, '#ffe2b3'); sp(0, -80, '#ffffff');
  const bull = new THREE.Group(), G = std('#16a34a', { flat: true, r: 0.5 });
  bull.add(box(16, 9, 8, G, 0, 9, 0, 1.5)); bull.add(box(7, 6, 7, G, 10, 12, 0, 1.2));
  [-3, 3].forEach(z => { const h = new THREE.Mesh(new THREE.ConeGeometry(1, 6, 8), std('#f4f1e6')); h.position.set(12, 17, z); h.rotation.z = -0.9; h.rotation.x = z > 0 ? 0.5 : -0.5; bull.add(h); });
  [[-5, -3], [-5, 3], [5, -3], [5, 3]].forEach(([x, z]) => bull.add(box(2.2, 6, 2.2, G, x, 3, z)));
  bull.position.set(-22, 0, -10); bull.rotation.y = 0.2; bull.traverse(o => o.castShadow = true); sc.add(bull);
  const bear = new THREE.Group(), B = std('#b91c1c', { flat: true, r: 0.6 });
  const bb = new THREE.Mesh(new THREE.SphereGeometry(8, 16, 12), B); bb.position.y = 10; bb.scale.set(1.2, 1, 0.9); bear.add(bb);
  const hd = new THREE.Mesh(new THREE.SphereGeometry(5, 16, 12), B); hd.position.set(-9, 15, 0); bear.add(hd);
  [-3, 3].forEach(z => { const e = new THREE.Mesh(new THREE.SphereGeometry(1.6, 10, 8), B); e.position.set(-9, 20, z); bear.add(e); });
  [[-5, -4], [-5, 4], [5, -4], [5, 4]].forEach(([x, z]) => bear.add(box(3, 6, 3, B, x, 3, z, 0.8)));
  bear.position.set(22, 0, -10); bear.rotation.y = -0.2; bear.traverse(o => o.castShadow = true); sc.add(bear);
  const sb = textPanel([['NIFTY 25,607', 120, '#ef4444', 110], ['BULL 🐂  vs  🐻 BEAR', 70, '#ffffff', 220]], { bg: '#050505', border: '#f4cf6a' });
  sc.add(box(52, 18, 2, std('#111'), 0, 48, -70)); sc.add(plane(sb, 50, 15, 0, 48, -68.9, { glow: true }));
  cam.position.set(0, 34, 110); cam.lookAt(0, 14, -20);
}, bloom: [0.5, 0.5, 0.85] });

T.push({ name: 'Galaxy Markets', accent: '#a78bfa', dark: true, build(sc, cam) {
  sc.background = new THREE.Color('#02010a');
  const pts = new Float32Array(3000 * 3); for (let i = 0; i < pts.length; i++) pts[i] = (rnd() - 0.5) * 900;
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(pts, 3));
  sc.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: '#ffffff', size: 1.4 })));
  sc.add(new THREE.AmbientLight('#8b7bff', 0.4)); sun(sc, '#ffffff', 2.2, [100, 60, 120], false);
  const pl = (r, c, x, y, z, ring) => { const p = new THREE.Mesh(new THREE.SphereGeometry(r, 48, 32), std(c, { r: 0.6, e: c, ei: 0.15 })); p.position.set(x, y, z); sc.add(p); if (ring) { const g = new THREE.Mesh(new THREE.TorusGeometry(r * 1.7, r * 0.08, 8, 96), glow(ring, 2.2)); g.position.copy(p.position); g.rotation.x = 1.25; sc.add(g); } return p; };
  pl(34, '#3b82f6', -30, -30, -160, '#f4cf6a');
  pl(9, '#f59e0b', 40, 34, -110, '#a78bfa'); pl(6, '#22c55e', -40, 40, -80); pl(5, '#ef4444', 30, -8, -60);
  bank(sc, 0, 6, -95, 0.9, std('#1e1b4b', { r: 0.3, m: 0.6, e: '#4c1d95', ei: 0.4 }), glow('#f4cf6a', 1.6));
  const orbit = new THREE.Mesh(new THREE.TorusGeometry(30, 0.25, 8, 128), glow('#a78bfa', 3)); orbit.position.set(0, 14, -95); orbit.rotation.x = 1.35; sc.add(orbit);
  sc.add(plane(textPanel(NEWS, { bg: '#0b0820', border: '#a78bfa' }), 28, 8.2, 0, 38, -80, { glow: true }));
  cam.position.set(0, 20, 45); cam.lookAt(0, 22, -90);
}, bloom: [0.8, 0.6, 0.85] });

T.push({ name: 'Candlestick Canyon', accent: '#22c55e', dark: true, build(sc, cam) {
  sc.background = skyGrad('#020617', '#0f172a'); sc.fog = new THREE.Fog('#0b1222', 80, 420);
  sc.add(new THREE.HemisphereLight('#94a3b8', '#020617', 0.7)); sun(sc, '#ffffff', 1.4, [60, 120, 80]);
  const gr = new THREE.GridHelper(800, 80, '#1e3a8a', '#111c3a'); sc.add(gr);
  let lvl = 30;
  for (let i = 0; i < 36; i++) {
    const side = i % 2 ? 1 : -1, z = 30 - Math.floor(i / 2) * 18, up = rnd() < 0.55, body = 8 + rnd() * 26;
    const y0 = lvl, y1 = up ? lvl + body : lvl - body; lvl = Math.max(14, Math.min(90, y1));
    const c = up ? '#16a34a' : '#dc2626', bot = Math.max(1, Math.min(y0, y1)), h = Math.abs(y1 - y0) || 4;
    sc.add(box(7, h, 7, std(c, { r: 0.35, m: 0.2, e: c, ei: 0.25 }), side * 18, bot + h / 2, z, 0.6));
    sc.add(box(0.8, h + 14, 0.8, std('#cbd5e1'), side * 18, bot + h / 2, z));
  }
  gate(sc, -60, { frame: std('#111827', { r: 0.3, m: 0.8 }), panel: textPanel(NEWS, { bg: '#020617', border: '#22c55e' }), glowP: true, y: 24 });
  cam.position.set(0, 20, 78); cam.lookAt(0, 26, -80);
}, bloom: [0.6, 0.5, 0.85] });

T.push({ name: 'Tabletop Diorama', accent: '#f472b6', build(sc, cam) {
  sc.background = new THREE.Color('#e9dccb');
  sc.add(new THREE.HemisphereLight('#fff6ea', '#8a6b4a', 1.0)); sun(sc, '#fff3df', 2.6, [60, 120, 70]);
  const table = new THREE.Mesh(new THREE.BoxGeometry(400, 4, 400), std('#a9774f', { r: 0.6 })); table.position.y = -2; table.receiveShadow = true; sc.add(table);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(60, 62, 5, 64), std('#f3efe6')); base.position.set(0, 2.5, -70); base.receiveShadow = true; sc.add(base);
  const pastel = ['#f9a8d4', '#93c5fd', '#fde68a', '#a7f3d0', '#c4b5fd', '#fecaca'];
  for (let i = 0; i < 34; i++) { const a = rnd() * 6.3, d = 18 + rnd() * 36, h = 6 + rnd() * 20; sc.add(box(6 + rnd() * 4, h, 6 + rnd() * 4, std(pastel[i % 6], { r: 0.8 }), Math.cos(a) * d, 5 + h / 2, -70 + Math.sin(a) * d, 1.2)); }
  bank(sc, 0, 5, -70, 0.85, std('#93c5fd', { r: 0.7 }), std('#fbbf24', { r: 0.4, m: 0.3 }));
  const mug = new THREE.Mesh(new THREE.CylinderGeometry(9, 8, 20, 32), std('#ffffff', { r: 0.3 })); mug.position.set(75, 10, -20); mug.castShadow = true; sc.add(mug);
  const coffee = new THREE.Mesh(new THREE.CircleGeometry(8.2, 32), std('#4a2c17')); coffee.rotation.x = -Math.PI / 2; coffee.position.set(75, 19.8, -20); sc.add(coffee);
  const pen = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 60, 12), std('#f59e0b')); pen.rotation.z = Math.PI / 2; pen.rotation.y = 0.6; pen.position.set(-60, 1, 10); pen.castShadow = true; sc.add(pen);
  const sign = textPanel(NEWS_L, { bg: '#ffffff', border: '#f472b6' });
  [-1, 1].forEach(s => sc.add(box(1, 26, 1, std('#8a6b4a'), s * 13, 13, -40)));
  sc.add(plane(sign, 28, 8.2, 0, 24, -39.4));
  cam.position.set(0, 48, 50); cam.lookAt(0, 8, -60);
}, bloom: null, bokeh: { focus: 96, aperture: 0.0012, maxblur: 0.008 } });

T.push({ name: 'Monsoon Street', accent: '#60a5fa', dark: true, build(sc, cam) {
  sc.background = skyGrad('#0b1220', '#1e293b'); sc.fog = new THREE.Fog('#152033', 40, 330);
  sc.add(new THREE.HemisphereLight('#7c93b8', '#0b1220', 0.5));
  city(sc, { base: '#1f2937', lit: '#fcd34d', p: 0.35, ei: 1.0, road: '#111827', roadR: 0.12, roadM: 0.7 });
  for (let i = 0; i < 8; i++) { const z = 20 - i * 40; [-12, 12].forEach(x => { sc.add(box(0.6, 14, 0.6, std('#374151'), x, 7, z)); const b = box(1.8, 1, 1.8, glow('#fde68a', 4), x * 0.85, 14, z); sc.add(b); const l = new THREE.PointLight('#fcd34d', 160, 40); l.position.set(x * 0.85, 12, z); sc.add(l); }); }
  const n = 4000, rp = new Float32Array(n * 6);
  for (let i = 0; i < n; i++) { const x = (rnd() - 0.5) * 120, y = rnd() * 80, z = 40 - rnd() * 260; rp.set([x, y, z, x - 0.3, y - 3, z], i * 6); }
  const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.BufferAttribute(rp, 3));
  sc.add(new THREE.LineSegments(rg, new THREE.LineBasicMaterial({ color: '#9fb8d8', transparent: true, opacity: 0.45 })));
  gate(sc, -45, { frame: std('#0b2545', { r: 0.3, m: 0.6 }), panel: textPanel(NEWS, { bg: '#0b1220', border: '#60a5fa' }), glowP: true, y: 26 });
  cam.position.set(3, 8, 40); cam.lookAt(0, 18, -80);
}, bloom: [0.7, 0.5, 0.85] });

T.push({ name: 'Cyber Grid', accent: '#e879f9', dark: true, build(sc, cam) {
  sc.background = new THREE.Color('#030014'); sc.fog = new THREE.Fog('#030014', 60, 380);
  const gr = new THREE.GridHelper(900, 90, '#e879f9', '#22d3ee'); gr.material.transparent = true; gr.material.opacity = 0.7; sc.add(gr);
  for (let i = 0; i < 60; i++) {
    const side = i % 2 ? 1 : -1, w = 8 + rnd() * 10, h = 10 + rnd() * 70, d = 8 + rnd() * 10, x = side * (20 + rnd() * 80), z = 40 - rnd() * 360;
    const g = new THREE.BoxGeometry(w, h, d); const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: '#06021a' })); m.position.set(x, h / 2, z); sc.add(m);
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(g), new THREE.LineBasicMaterial({ color: i % 3 ? '#22d3ee' : '#e879f9' })); e.position.copy(m.position); sc.add(e);
  }
  const arrow = new THREE.Group(); arrow.add(box(4, 30, 4, glow('#22c55e', 3), 0, 15, 0)); const tip = new THREE.Mesh(new THREE.ConeGeometry(7, 12, 4), glow('#22c55e', 3)); tip.position.y = 36; arrow.add(tip);
  arrow.position.set(26, 0, -100); arrow.rotation.z = -0.15; sc.add(arrow);
  gate(sc, -55, { frame: glow('#22d3ee', 2), panel: textPanel(NEWS, { bg: '#030014', border: '#e879f9' }), glowP: true, y: 24 });
  cam.position.set(0, 12, 40); cam.lookAt(0, 22, -80);
}, bloom: [1.0, 0.5, 0.8] });

T.push({ name: 'Paper Craft', accent: '#dc2626', build(sc, cam) {
  sc.background = new THREE.Color('#f6f1e7'); sc.fog = new THREE.Fog('#f6f1e7', 160, 480);
  sc.add(new THREE.HemisphereLight('#ffffff', '#d6cfc2', 1.1)); sun(sc, '#ffffff', 2.4, [-80, 140, 90]);
  const g = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), std('#efe7d8', { r: 1 })); g.rotation.x = -Math.PI / 2; g.receiveShadow = true; sc.add(g);
  const P = c => std(c, { r: 1, flat: true });
  for (let i = 0; i < 60; i++) {
    const side = i % 2 ? 1 : -1, x = side * (18 + rnd() * 70), z = 40 - rnd() * 340, h = 10 + rnd() * 40, w = 8 + rnd() * 8;
    const b = box(w, h, w, P(['#fffdf8', '#f3ede1', '#e9e1d2'][i % 3]), x, h / 2, z); sc.add(b);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(w * 0.75, 6, 4), P(i % 4 ? '#e9e1d2' : '#dc2626')); roof.rotation.y = Math.PI / 4; roof.position.set(x, h + 3, z); roof.castShadow = true; sc.add(roof);
  }
  for (let i = 0; i < 6; i++) { const c = new THREE.Mesh(new THREE.CircleGeometry(8 + rnd() * 6, 24), P('#ffffff')); c.position.set(-70 + i * 28, 55 + rnd() * 20, -120 - rnd() * 60); c.castShadow = true; sc.add(c); sc.add(box(0.15, 40, 0.15, P('#b9b1a2'), c.position.x, c.position.y + 20, c.position.z)); }
  bank(sc, 0, 0, -95, 1.15, P('#fffdf8'), P('#dc2626'));
  gate(sc, -45, { frame: P('#dc2626'), panel: textPanel(NEWS_L, { bg: '#fffdf8', border: '#dc2626' }), y: 26 });
  cam.position.set(-6, 12, 40); cam.lookAt(0, 20, -80);
}, bloom: null });

T.push({ name: 'Winter Night', accent: '#93c5fd', dark: true, build(sc, cam) {
  sc.background = skyGrad('#0b1430', '#26375e'); sc.fog = new THREE.Fog('#1c2a4a', 90, 420);
  sc.add(new THREE.HemisphereLight('#a5b4fc', '#0b1430', 0.6)); sun(sc, '#c7d2fe', 0.9, [60, 100, 60]);
  const g = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), std('#e8eefc', { r: 0.9 })); g.rotation.x = -Math.PI / 2; g.receiveShadow = true; sc.add(g);
  city(sc, { base: '#2b3550', lit: '#ffcf7a', p: 0.45, ei: 1.3, road: '#c9d3ea', rad: 0.6 });
  const n = 3000, sp = new Float32Array(n * 3); for (let i = 0; i < n; i++) sp.set([(rnd() - 0.5) * 200, rnd() * 100, 40 - rnd() * 300], i * 3);
  const sgeo = new THREE.BufferGeometry(); sgeo.setAttribute('position', new THREE.BufferAttribute(sp, 3)); sc.add(new THREE.Points(sgeo, new THREE.PointsMaterial({ color: '#ffffff', size: 0.9 })));
  bank(sc, 0, 0, -95, 1.2, std('#1e2a4a', { r: 0.5 }), glow('#ffcf7a', 1.2));
  const snowRoof = box(27, 1.4, 18, std('#ffffff'), 0, 19.5, -95, 0.6); sc.add(snowRoof);
  for (let i = 0; i < 10; i++) { const t = new THREE.Mesh(new THREE.ConeGeometry(3, 9, 8), std('#1f5f3f')); t.position.set((i % 2 ? 1 : -1) * 14, 4.5, 20 - i * 14); sc.add(t); const cap = new THREE.Mesh(new THREE.ConeGeometry(2, 3, 8), std('#ffffff')); cap.position.set(t.position.x, 8.6, t.position.z); sc.add(cap); }
  gate(sc, -45, { frame: std('#0b2545', { r: 0.3, m: 0.6 }), panel: textPanel(NEWS, { bg: '#0b1430', border: '#93c5fd' }), glowP: true, y: 26 });
  cam.position.set(4, 10, 42); cam.lookAt(0, 20, -80);
}, bloom: [0.6, 0.5, 0.85] });

// ---------- build all ----------
const built = T.map(th => {
  const sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(50, W / H, 0.5, 2000);
  th.build(sc, cam);
  const comp = new EffectComposer(R); comp.setSize(W, H); comp.addPass(new RenderPass(sc, cam));
  if (th.bloom) comp.addPass(new UnrealBloomPass(new THREE.Vector2(W, H), ...th.bloom));
  if (th.bokeh) comp.addPass(new BokehPass(sc, cam, th.bokeh));
  comp.addPass(new OutputPass());
  return { th, sc, cam, comp };
});

// ---------- overlay ----------
const fj = { ctx, overlays: [] };
let cur = 0;
await mascot(fj, { appear: -1, moods: [{ t0: -1, t1: 99, mood: 'point' }], pos: () => ({ x: 905, y: 1452, s: 0.7 }) });
const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };
function overlay(t) {
  const th = T[cur];
  ctx.save(); rr(48, 56, 100, 100, 24); ctx.fillStyle = '#fff'; ctx.fill(); ctx.drawImage(logo, 250, 75, 755, 755, 58, 66, 80, 80); ctx.restore();
  ctx.font = '900 44px Inter'; const label = `${cur + 1} · ${th.name}`; const lw = ctx.measureText(label).width + 50;
  rr(540 - lw / 2, 200, lw, 74, 37); ctx.fillStyle = th.accent; ctx.fill(); ctx.fillStyle = th.dark ? '#05060f' : '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, 540, 239);
  ctx.font = '900 84px Inter, "Noto Color Emoji"'; const hk = 'RBI KA BADA DIN 🏦'; const hw = ctx.measureText(hk).width + 70;
  ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 24; rr(540 - hw / 2, 320, hw, 120, 24); ctx.fillStyle = th.dark ? '#ffffff' : '#0b2545'; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.fillStyle = th.dark ? '#0b2545' : '#ffffff'; ctx.fillText(hk, 540, 384);
  ctx.font = '700 46px Inter'; const cap = 'Repo 5.50%, faisla 4 December'; const cw = ctx.measureText(cap).width + 64;
  rr(540 - cw / 2, 1456, cw, 84, 18); ctx.fillStyle = 'rgba(20,22,28,0.92)'; ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillText(cap, 540, 1500);
  [['🔔 FOLLOW', '#f4cf6a', 330], ['🔁 REPOST', '#ffffff', 690]].forEach(([l, c, x]) => { ctx.font = '900 40px Inter, "Noto Color Emoji"'; const w = ctx.measureText(l).width + 66; rr(x - w / 2, 1584, w, 76, 38); ctx.fillStyle = c; ctx.fill(); ctx.fillStyle = '#0b1020'; ctx.fillText(l, x, 1624); });
  ctx.font = '500 24px "JetBrains Mono", monospace'; ctx.textAlign = 'right'; ctx.fillStyle = th.dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.55)'; ctx.fillText('not advice', 1030, 106);
}
window.DUR = T.length;
window.renderFrame = t => {
  cur = Math.max(0, Math.min(T.length - 1, Math.floor(t + 1e-6)));
  const b = built[cur]; b.comp.render();
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.drawImage(glc, 0, 0);
  overlay(t); fj.overlays.forEach(o => { ctx.save(); o(t); ctx.restore(); });
};
renderFrame(0); window.READY = true;
