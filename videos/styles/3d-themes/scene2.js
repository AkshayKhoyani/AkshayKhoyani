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
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

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

// ---------- 12 more themes (13–24): env-map reflections for a premium look ----------
const PM = new THREE.PMREMGenerator(R); const ENV = PM.fromScene(new RoomEnvironment(), 0.04).texture;
const phys = (c, o = {}) => new THREE.MeshPhysicalMaterial({ color: c, roughness: o.r ?? 0.25, metalness: o.m ?? 0.2, clearcoat: o.cc ?? 0.6, clearcoatRoughness: 0.15, envMapIntensity: o.env ?? 1, transmission: o.tr ?? 0, transparent: !!o.tr, opacity: 1, emissive: o.e || 0x000000, emissiveIntensity: o.ei ?? 1 });
const T = [];

T.push({ name: 'Diwali Lights City', accent: '#f59e0b', dark: true, build(sc, cam) { sc.environmentIntensity = 0.25;
  sc.background = skyGrad('#140a26', '#3b1d0f'); sc.fog = new THREE.Fog('#2a1408', 90, 420); sc.environment = ENV;
  sc.add(new THREE.HemisphereLight('#ffb86b', '#140a26', 0.5));
  city(sc, { base: '#3a2416', lit: '#ffb347', p: 0.5, ei: 1.2, road: '#24170f' });
  for (let k = 0; k < 7; k++) { const z = 30 - k * 26; for (let i = 0; i < 24; i++) { const x = -14 + i * 28 / 23, y = 30 - Math.sin(i / 23 * Math.PI) * 5; const b = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 6), glow(['#ffd166', '#ff6b6b', '#4ade80', '#60a5fa'][i % 4], 4)); b.position.set(x, y, z); sc.add(b); } }
  for (let i = 0; i < 16; i++) { const d = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.5, 0.7, 12), std('#b45309')); d.position.set((i % 2 ? 1 : -1) * 9, 0.4, 30 - i * 9); sc.add(d); const f = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.2, 8), glow('#ffcf5a', 5)); f.position.set(d.position.x, 1.4, d.position.z); sc.add(f); }
  bank(sc, 0, 0, -95, 1.2, phys('#5b2a12', { r: 0.4 }), phys('#f4cf6a', { r: 0.15, m: 1 }));
  gate(sc, -45, { frame: phys('#f4cf6a', { r: 0.15, m: 1 }), panel: textPanel(NEWS, { bg: '#2a1408', border: '#f59e0b' }), glowP: true, y: 26 });
  cam.position.set(2, 9, 50); cam.lookAt(0, 20, -80);
}, bloom: [0.5, 0.4, 0.9], exposure: 0.7 });

T.push({ name: 'Glass Downtown', accent: '#38bdf8', build(sc, cam) { sc.environmentIntensity = 0.6;
  sc.background = skyGrad('#1e3a8a', '#93c5fd', '#3b82f6'); sc.fog = new THREE.Fog('#9cc3f5', 150, 520); sc.environment = ENV;
  sc.add(new THREE.HemisphereLight('#dbeafe', '#1e3a8a', 0.8)); sun(sc, '#ffffff', 2.4, [100, 160, 80]);
  city(sc, { mat: i => phys(['#7dd3fc', '#93c5fd', '#a5b4fc', '#cbd5e1'][i % 4], { r: 0.05, m: 0.9, env: 1.6 }), road: '#334155', hMin: 25, hMax: 110, rad: 0.4 });
  const g = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), std('#cbd5e1')); g.rotation.x = -Math.PI / 2; g.receiveShadow = true; sc.add(g);
  bank(sc, 0, 0, -95, 1.2, phys('#0b2545', { r: 0.1, m: 0.7 }), phys('#d4a62c', { r: 0.1, m: 1 }));
  gate(sc, -45, { frame: phys('#e2e8f0', { r: 0.05, m: 1 }), y: 28 });
  cam.position.set(-4, 6, 58); cam.lookAt(0, 30, -80);
}, bloom: [0.2, 0.4, 0.95], exposure: 0.8 });

T.push({ name: 'Gold Vault', accent: '#eab308', dark: true, build(sc, cam) {
  sc.background = new THREE.Color('#0a0a0a'); sc.environment = ENV;
  sc.add(new THREE.HemisphereLight('#fff3d6', '#000', 0.25));
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), phys('#1c1c1c', { r: 0.2, m: 0.8 })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; sc.add(fl);
  const door = new THREE.Mesh(new THREE.CylinderGeometry(28, 28, 5, 64), phys('#9ca3af', { r: 0.25, m: 1 })); door.rotation.x = Math.PI / 2; door.position.set(0, 32, -90); sc.add(door);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; const bolt = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 4, 16), phys('#e5e7eb', { m: 1, r: 0.2 })); bolt.rotation.x = Math.PI / 2; bolt.position.set(Math.cos(a) * 20, 32 + Math.sin(a) * 20, -87); sc.add(bolt); }
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(8, 1.2, 12, 48), phys('#d4a62c', { m: 1, r: 0.15 })); wheel.position.set(0, 32, -86); sc.add(wheel);
  const gold = phys('#e8b923', { r: 0.18, m: 1, env: 1.8 });
  for (let s = -1; s <= 1; s += 2) for (let r = 0; r < 5; r++) for (let i = 0; i < 6 - r; i++) sc.add(box(7, 2.4, 3.6, gold, s * (26 + (i - (5 - r) / 2) * 7.4), 1.2 + r * 2.5, -50 + (r % 2) * 1.5, 0.4));
  const spot = (x, z) => { const l = new THREE.SpotLight('#fff1c9', 26000, 300, 0.45, 0.6); l.position.set(x, 80, z); l.target.position.set(x * 0.6, 0, -50); l.castShadow = true; sc.add(l, l.target); };
  spot(-30, 10); spot(30, 10); spot(0, -40);
  sc.add(plane(textPanel(NEWS, { bg: '#111', border: '#eab308' }), 28, 8.2, 0, 50, -60, { glow: true }));
  cam.position.set(0, 16, 40); cam.lookAt(0, 26, -80);
}, bloom: [0.5, 0.6, 0.85] });

T.push({ name: 'Trade Port', accent: '#0ea5e9', build(sc, cam) {
  sc.background = skyGrad('#60a5fa', '#e0f2fe'); sc.fog = new THREE.Fog('#d6ecff', 140, 520); sc.environment = ENV;
  sc.add(new THREE.HemisphereLight('#ffffff', '#1e40af', 0.9)); sun(sc, '#ffffff', 2.4, [80, 140, 60]);
  const sea = new THREE.PlaneGeometry(900, 900, 120, 120); const pa = sea.attributes.position; for (let i = 0; i < pa.count; i++) pa.setZ(i, Math.sin(pa.getX(i) * 0.08) * 0.8 + Math.cos(pa.getY(i) * 0.06) * 0.8); sea.computeVertexNormals();
  const s = new THREE.Mesh(sea, phys('#0369a1', { r: 0.15, m: 0.1, env: 1.4 })); s.rotation.x = -Math.PI / 2; s.receiveShadow = true; sc.add(s);
  sc.add(box(60, 6, 40, std('#9ca3af'), 0, 3, -100, 0.5));
  const cc = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7'];
  const ship = (x, z, k) => { const g = new THREE.Group(); g.add(box(60, 8, 14, phys('#0b2545', { r: 0.3 }), 0, 4, 0, 1)); for (let i = 0; i < 7; i++) for (let j = 0; j < 2; j++) g.add(box(7, 4, 5, std(cc[(i + j) % 5], { r: 0.6 }), -21 + i * 7, 10 + j * 4, -3 + (j % 2) * 6)); g.add(box(8, 12, 10, std('#f1f5f9'), 26, 14, 0, 0.5)); g.position.set(x, 1, z); g.scale.setScalar(k); g.traverse(o => o.castShadow = true); sc.add(g); };
  ship(-30, -40, 0.9); ship(40, -150, 1.1);
  const crane = new THREE.Group(); crane.add(box(2, 40, 2, std('#f59e0b'), 0, 20, 0)); crane.add(box(40, 2, 2, std('#f59e0b'), 12, 40, 0)); crane.position.set(-12, 6, -100); sc.add(crane);
  sc.add(plane(textPanel(NEWS), 28, 8.2, 12, 28, -84));
  cam.position.set(40, 34, 110); cam.lookAt(0, 14, -90);
}, bloom: null, exposure: 0.8 });

T.push({ name: 'Desert Oil Rigs', accent: '#f97316', build(sc, cam) {
  sc.background = skyGrad('#7c2d12', '#fed7aa', '#fb923c'); sc.fog = new THREE.Fog('#f7b27a', 120, 480); sc.environment = ENV;
  sc.add(new THREE.HemisphereLight('#ffd7a8', '#7c2d12', 0.9)); sun(sc, '#ffb070', 3, [-140, 50, -200]);
  const dz = new THREE.PlaneGeometry(900, 900, 90, 90); const p = dz.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 0.03) * 6 + Math.cos(p.getY(i) * 0.025) * 5);
  dz.computeVertexNormals(); const d = new THREE.Mesh(dz, std('#e8a868', { flat: true, r: 1 })); d.rotation.x = -Math.PI / 2; d.receiveShadow = true; sc.add(d);
  const rig = (x, z, k) => { const g = new THREE.Group(), M = phys('#1f2937', { r: 0.4, m: 0.8 }); g.add(box(3, 22, 3, M, 0, 11, 0)); const beam = box(36, 2.4, 2.4, M, 4, 23, 0); beam.rotation.z = -0.15; g.add(beam); const head = box(6, 8, 3, M, 21, 21, 0, 0.8); g.add(head); g.add(box(12, 3, 8, M, -8, 1.5, 0)); g.position.set(x, 4, z); g.scale.setScalar(k); g.traverse(o => o.castShadow = true); sc.add(g); };
  rig(-46, -70, 1); rig(34, -130, 1.2); rig(-50, -200, 1.3);
  for (let i = 0; i < 3; i++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 7, 18), phys('#111827', { r: 0.3, m: 0.6 })); b.position.set(10 + i * 7, 7, -40); b.castShadow = true; sc.add(b); }
  sc.add(plane(textPanel([['BRENT $97+ 🛢️', 100, '#ffffff', 110], ['Crude ka asar: rupee, inflation', 52, '#fdba74', 215]], { bg: '#431407', border: '#f97316' }), 28, 8.2, 0, 30, -30));
  cam.position.set(0, 16, 40); cam.lookAt(0, 18, -80);
}, bloom: [0.4, 0.6, 0.9] });

T.push({ name: 'Chart Mountains', accent: '#10b981', build(sc, cam) {
  sc.background = skyGrad('#0ea5e9', '#e0f2fe'); sc.fog = new THREE.Fog('#d9efff', 150, 600); sc.environment = ENV;
  sc.add(new THREE.HemisphereLight('#ffffff', '#3f6212', 0.9)); sun(sc, '#ffffff', 2.6, [120, 160, 40]);
  const hs = [18, 30, 24, 46, 38, 62, 54, 85];
  hs.forEach((h, i) => { const m = new THREE.Mesh(new THREE.ConeGeometry(22 + h * 0.3, h * 1.4, 6), std(i % 2 ? '#4b7a3a' : '#5d8f45', { flat: true, r: 1 })); m.position.set(-90 + i * 26, h * 0.7, -120 - (i % 3) * 30); m.castShadow = m.receiveShadow = true; sc.add(m); const cap = new THREE.Mesh(new THREE.ConeGeometry((22 + h * 0.3) * 0.35, h * 0.5, 6), std('#ffffff', { flat: true })); cap.position.set(m.position.x, h * 1.4 - h * 0.25, m.position.z); sc.add(cap); });
  const pts = hs.map((h, i) => new THREE.Vector3(-90 + i * 26, h * 1.4 + 4, -95 - (i % 3) * 30));
  sc.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, 1.2, 10), glow('#facc15', 1.5)));
  const pole = box(0.8, 16, 0.8, std('#e5e7eb'), pts[7].x, pts[7].y + 8, pts[7].z); sc.add(pole); sc.add(box(10, 6, 0.4, std('#16a34a'), pts[7].x + 5, pts[7].y + 13, pts[7].z));
  const g = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), std('#6d9a4a')); g.rotation.x = -Math.PI / 2; g.receiveShadow = true; sc.add(g);
  sc.add(plane(textPanel(NEWS), 28, 8.2, -10, 30, -40));
  cam.position.set(-20, 24, 60); cam.lookAt(0, 40, -110);
}, bloom: [0.4, 0.5, 0.9] });

T.push({ name: 'Clay Town', accent: '#fb7185', build(sc, cam) { sc.environmentIntensity = 0.3;
  sc.background = new THREE.Color('#fde7d9'); sc.environment = ENV;
  sc.add(new THREE.HemisphereLight('#fff5ec', '#f4b8a0', 1.0)); sun(sc, '#fff1e6', 2.2, [70, 120, 90]);
  const C = c => phys(c, { r: 0.55, m: 0, cc: 0.3, env: 0.6 });
  const g = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), C('#f7d6c4')); g.rotation.x = -Math.PI / 2; g.receiveShadow = true; sc.add(g);
  const cols = ['#fda4af', '#fcd34d', '#93c5fd', '#86efac', '#c4b5fd', '#fdba74'];
  for (let i = 0; i < 50; i++) { const side = i % 2 ? 1 : -1, x = side * (16 + rnd() * 60), z = 40 - rnd() * 300, h = 8 + rnd() * 18, w = 9 + rnd() * 6; sc.add(box(w, h, w, C(cols[i % 6]), x, h / 2, z, 2.4)); const r = new THREE.Mesh(new THREE.SphereGeometry(w * 0.55, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2), C('#ffffff')); r.position.set(x, h, z); r.castShadow = true; sc.add(r); }
  const road = new THREE.Mesh(new THREE.PlaneGeometry(20, 500), C('#cbd5e1')); road.rotation.x = -Math.PI / 2; road.position.set(0, 0.06, -120); sc.add(road);
  bank(sc, 0, 0, -95, 1.2, C('#93c5fd'), C('#fbbf24'));
  gate(sc, -45, { frame: C('#fb7185'), panel: textPanel(NEWS_L, { bg: '#fff7ed', border: '#fb7185' }), y: 26 });
  cam.position.set(30, 60, 70); cam.lookAt(0, 10, -70);
}, bloom: null, exposure: 0.75 });

T.push({ name: 'Underwater Treasure', accent: '#2dd4bf', dark: true, build(sc, cam) {
  sc.background = skyGrad('#0e7490', '#022c3a'); sc.fog = new THREE.FogExp2('#06455a', 0.006); sc.environment = ENV;
  sc.add(new THREE.HemisphereLight('#67e8f9', '#022c3a', 0.9)); sun(sc, '#a5f3fc', 1.6, [20, 200, 40]);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(600, 600, 60, 60), std('#c2a878', { flat: true })); const p = fl.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, rnd() * 2.5); fl.geometry.computeVertexNormals(); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; sc.add(fl);
  for (let i = 0; i < 26; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(1.5 + rnd() * 2, 6 + rnd() * 10, 6), std(['#f472b6', '#fb923c', '#a78bfa', '#facc15'][i % 4], { flat: true })); c.position.set(-60 + rnd() * 120, 4, 20 - rnd() * 160); c.castShadow = true; sc.add(c); }
  const chest = new THREE.Group(); chest.add(box(18, 9, 11, std('#7c4a21'), 0, 4.5, 0, 0.8)); const lid = box(18, 4, 11, std('#7c4a21'), 0, 11, -3, 0.8); lid.rotation.x = -0.7; chest.add(lid);
  for (let i = 0; i < 30; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.4, 16), phys('#f4cf6a', { m: 1, r: 0.2 })); c.position.set(-7 + rnd() * 14, 9 + rnd() * 2, -4 + rnd() * 8); c.rotation.set(rnd() * 3, 0, rnd() * 3); chest.add(c); }
  chest.position.set(0, 0, -55); chest.traverse(o => o.castShadow = true); sc.add(chest);
  for (let i = 0; i < 120; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.3 + rnd() * 0.6, 8, 6), phys('#e0fbff', { tr: 0.8, r: 0, m: 0 })); b.position.set(-40 + rnd() * 80, rnd() * 70, 20 - rnd() * 120); sc.add(b); }
  for (let i = 0; i < 10; i++) { const f = new THREE.Group(); const body = new THREE.Mesh(new THREE.SphereGeometry(2, 12, 8), std(['#f59e0b', '#38bdf8', '#f43f5e'][i % 3])); body.scale.set(1.6, 1, 0.7); f.add(body); const tail = new THREE.Mesh(new THREE.ConeGeometry(1.4, 2.4, 4), body.material); tail.rotation.z = Math.PI / 2; tail.position.x = -3.6; f.add(tail); f.position.set(-50 + rnd() * 100, 15 + rnd() * 40, -20 - rnd() * 100); f.rotation.y = rnd() * 6; sc.add(f); }
  sc.add(plane(textPanel(NEWS, { bg: '#063241', border: '#2dd4bf' }), 28, 8.2, 0, 30, -60, { glow: true }));
  cam.position.set(0, 14, 25); cam.lookAt(0, 16, -60);
}, bloom: [0.5, 0.6, 0.85] });

T.push({ name: 'Rocket Launch', accent: '#f43f5e', dark: true, build(sc, cam) { sc.environmentIntensity = 0.4;
  sc.background = skyGrad('#020617', '#1e1b4b', '#312e81'); sc.environment = ENV;
  const pts = new Float32Array(1500 * 3); for (let i = 0; i < pts.length; i++) pts[i] = (rnd() - 0.5) * 800 + (i % 3 === 1 ? 300 : 0);
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(pts, 3)); sc.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: '#fff', size: 1.2 })));
  sc.add(new THREE.HemisphereLight('#c7d2fe', '#111', 0.5)); sun(sc, '#ffffff', 1.4, [60, 80, 100]);
  const g = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), std('#1f2937')); g.rotation.x = -Math.PI / 2; g.receiveShadow = true; sc.add(g);
  sc.add(box(40, 4, 40, phys('#374151', { r: 0.4, m: 0.7 }), 0, 2, -80));
  const r = new THREE.Group(), W2 = phys('#f8fafc', { r: 0.2, m: 0.3 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 46, 32), W2); body.position.y = 27; r.add(body);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(5, 12, 32), phys('#f43f5e', { r: 0.2 })); nose.position.y = 56; r.add(nose);
  [0, 1, 2].forEach(i => { const f = box(1, 12, 8, phys('#f43f5e'), Math.cos(i * 2.1) * 6, 8, Math.sin(i * 2.1) * 6); f.rotation.y = -i * 2.1; r.add(f); });
  r.add(plane(canvasTex(256, 1024, (x) => { x.fillStyle = '#f8fafc'; x.fillRect(0, 0, 256, 1024); x.save(); x.translate(128, 512); x.rotate(-Math.PI / 2); x.font = '900 150px Inter'; x.fillStyle = '#0b2545'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('NIFTY', 0, 0); x.restore(); }), 4, 30, 0, 30, 5.05));
  const flame = new THREE.Mesh(new THREE.ConeGeometry(4.5, 18, 24), glow('#ffb703', 1.6)); flame.rotation.x = Math.PI; flame.position.y = -8; r.add(flame);
  r.position.set(0, 14, -80); r.traverse(o => o.castShadow = true); sc.add(r);
  for (let i = 0; i < 40; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(3 + rnd() * 5, 10, 8), std('#64748b', { r: 1 })); s.position.set((rnd() - 0.5) * 60, 4 + rnd() * 8, -80 + (rnd() - 0.5) * 40); sc.add(s); }
  const tower = box(4, 70, 4, phys('#f59e0b', { m: 0.6 }), 14, 35, -80); sc.add(tower);
  sc.add(plane(textPanel(NEWS, { bg: '#020617', border: '#f43f5e' }), 28, 8.2, -22, 52, -70, { glow: true }));
  cam.position.set(-10, 20, 40); cam.lookAt(0, 42, -80);
}, bloom: [0.5, 0.5, 0.92], exposure: 0.8 });

T.push({ name: 'Synthwave Sunset', accent: '#f0abfc', dark: true, build(sc, cam) {
  sc.background = skyGrad('#1e0533', '#ff6ec7', '#7b2cbf');
  const sunTex = canvasTex(512, 512, (x) => { const g = x.createLinearGradient(0, 0, 0, 512); g.addColorStop(0, '#ffe66d'); g.addColorStop(1, '#ff3d8b'); x.fillStyle = g; x.beginPath(); x.arc(256, 256, 250, 0, 7); x.fill(); x.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 7; i++) x.fillRect(0, 290 + i * 30, 512, 6 + i * 2); });
  const s = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), new THREE.MeshBasicMaterial({ map: sunTex, transparent: true, toneMapped: false })); s.position.set(0, 50, -380); sc.add(s);
  const gr = new THREE.GridHelper(900, 100, '#ff3df5', '#ff3df5'); gr.material.transparent = true; gr.material.opacity = 0.85; sc.add(gr);
  const flo = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), new THREE.MeshBasicMaterial({ color: '#12001f' })); flo.rotation.x = -Math.PI / 2; flo.position.y = -0.1; sc.add(flo);
  for (let i = 0; i < 12; i++) { const m = new THREE.Mesh(new THREE.ConeGeometry(30 + rnd() * 30, 40 + rnd() * 40, 4), new THREE.MeshBasicMaterial({ color: '#2b0547' })); m.position.set((i % 2 ? 1 : -1) * (70 + rnd() * 120), 20, -260 - rnd() * 80); sc.add(m); const e = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry), new THREE.LineBasicMaterial({ color: '#22d3ee' })); e.position.copy(m.position); sc.add(e); }
  const palm = (x, z) => { const g = new THREE.Group(), B = new THREE.MeshBasicMaterial({ color: '#0a0014' }); g.add(box(1.4, 30, 1.4, B, 0, 15, 0)); for (let i = 0; i < 6; i++) { const l = box(14, 0.6, 2.4, B, 6, 30, 0); l.rotation.set(0, i * 1.05, -0.5); const h = new THREE.Group(); h.add(l); h.rotation.y = i * 1.05; g.add(h); } g.position.set(x, 0, z); sc.add(g); };
  palm(-26, -60); palm(30, -90); palm(-40, -140);
  sc.add(plane(textPanel(NEWS, { bg: '#12001f', border: '#f0abfc' }), 28, 8.2, 0, 26, -70, { glow: true }));
  cam.position.set(0, 10, 30); cam.lookAt(0, 24, -200);
}, bloom: [0.9, 0.6, 0.8] });

T.push({ name: 'News Studio', accent: '#3b82f6', dark: true, build(sc, cam) { sc.environmentIntensity = 0.4;
  sc.background = new THREE.Color('#050a18'); sc.environment = ENV;
  sc.add(new THREE.HemisphereLight('#bcd2ff', '#050a18', 0.4));
  const fl = new THREE.Mesh(new THREE.CircleGeometry(120, 64), phys('#0b1530', { r: 0.12, m: 0.6 })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; sc.add(fl);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(40, 0.5, 8, 128), glow('#3b82f6', 3)); ring.rotation.x = Math.PI / 2; ring.position.y = 0.3; ring.position.z = -50; sc.add(ring);
  const desk = new THREE.Mesh(new THREE.CylinderGeometry(26, 26, 10, 64, 1, false, -0.9, 1.8), phys('#0b2545', { r: 0.2, m: 0.5 })); desk.position.set(0, 5, -40); sc.add(desk);
  sc.add(box(40, 1, 6, glow('#3b82f6', 2), 0, 10.4, -18, 0.3));
  const scr = (x, z, ry, tex) => { const g = new THREE.Group(); g.add(box(44, 26, 1.5, phys('#111827', { m: 0.8 }), 0, 0, 0, 0.6)); g.add(plane(tex, 42, 24, 0, 0, 0.8, { glow: true })); g.position.set(x, 26, z); g.rotation.y = ry; sc.add(g); };
  const chart = canvasTex(1024, 576, (x, w, h) => { x.fillStyle = '#020617'; x.fillRect(0, 0, w, h); x.strokeStyle = '#1e3a8a'; for (let i = 0; i < 10; i++) { x.beginPath(); x.moveTo(0, i * 58); x.lineTo(w, i * 58); x.stroke(); } x.strokeStyle = '#ef4444'; x.lineWidth = 10; x.beginPath(); for (let i = 0; i < 20; i++) x.lineTo(i * 54, 150 + i * 14 + Math.sin(i) * 40); x.stroke(); x.font = '900 70px Inter'; x.fillStyle = '#fff'; x.fillText('NIFTY 25,607', 40, 90); });
  scr(-48, -80, 0.5, chart); scr(48, -80, -0.5, textPanel([['REPO 5.50%', 140, '#f4cf6a', 150], ['4 DEC · RBI', 90, '#fff', 300]], { w: 1024, h: 576, bg: '#020617', border: '#3b82f6' }));
  sc.add(plane(textPanel(NEWS, { bg: '#020617', border: '#3b82f6' }), 30, 8.8, 0, 32, -95, { glow: true }));
  [-40, 0, 40].forEach(x => { const l = new THREE.SpotLight('#dbeafe', 6000, 260, 0.5, 0.6); l.position.set(x, 90, 30); l.target.position.set(0, 0, -40); l.castShadow = true; sc.add(l, l.target); });
  cam.position.set(0, 22, 70); cam.lookAt(0, 22, -60);
}, bloom: [0.6, 0.6, 0.85] });

T.push({ name: 'Blossom Park', accent: '#ec4899', build(sc, cam) { sc.environmentIntensity = 0.3;
  sc.background = skyGrad('#fbcfe8', '#fff7fb'); sc.fog = new THREE.Fog('#fde7f3', 120, 420); sc.environment = ENV;
  sc.add(new THREE.HemisphereLight('#ffffff', '#86efac', 1.0)); sun(sc, '#fff7ed', 2.4, [70, 140, 80]);
  const g = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), std('#a7e3a1')); g.rotation.x = -Math.PI / 2; g.receiveShadow = true; sc.add(g);
  const path = new THREE.Mesh(new THREE.PlaneGeometry(14, 500), std('#f5e6d3')); path.rotation.x = -Math.PI / 2; path.position.set(0, 0.05, -120); sc.add(path);
  for (let i = 0; i < 30; i++) { const x = (i % 2 ? 1 : -1) * (14 + rnd() * 40), z = 30 - rnd() * 260; const t = new THREE.Group(); t.add(box(1.8, 12, 1.8, std('#6b4226'), 0, 6, 0)); for (let k = 0; k < 6; k++) { const b = new THREE.Mesh(new THREE.SphereGeometry(4 + rnd() * 3, 14, 10), std(['#f9a8d4', '#fbcfe8', '#f472b6'][k % 3], { r: 0.9 })); b.position.set((rnd() - 0.5) * 8, 13 + rnd() * 5, (rnd() - 0.5) * 8); t.add(b); } t.position.set(x, 0, z); t.traverse(o => o.castShadow = true); sc.add(t); }
  const pond = new THREE.Mesh(new THREE.CircleGeometry(18, 48), phys('#7dd3fc', { r: 0.05, m: 0.2, env: 1.5 })); pond.rotation.x = -Math.PI / 2; pond.position.set(-28, 0.1, -40); sc.add(pond);
  for (let i = 0; i < 300; i++) { const p = new THREE.Mesh(new THREE.CircleGeometry(0.35, 6), std('#f9a8d4')); p.position.set((rnd() - 0.5) * 120, rnd() * 50, 30 - rnd() * 200); p.rotation.set(rnd() * 3, rnd() * 3, 0); sc.add(p); }
  bank(sc, 0, 0, -95, 1.1, phys('#ffffff', { r: 0.4 }), phys('#ec4899', { r: 0.3 }));
  gate(sc, -45, { frame: phys('#ec4899', { r: 0.3 }), panel: textPanel(NEWS_L, { bg: '#fff7fb', border: '#ec4899' }), y: 26 });
  cam.position.set(6, 12, 45); cam.lookAt(0, 20, -80);
}, bloom: null, exposure: 0.8 });

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
  ctx.font = '900 44px Inter'; const label = `${cur + 13} · ${th.name}`; const lw = ctx.measureText(label).width + 50;
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
  cur = Math.max(0, Math.min(T.length - 1, Math.floor(t + 1e-6))); R.toneMappingExposure = T[cur].exposure ?? 1;
  const b = built[cur]; b.comp.render();
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.drawImage(glc, 0, 0);
  overlay(t); fj.overlays.forEach(o => { ctx.save(); o(t); ctx.restore(); });
};
renderFrame(0); window.READY = true;
