// Skit reel: "Businessman paise se paisa kaise banata hai?" (Chintu, Gurpreet Paaji, EMI Bhoot)
// 3D clay bazaar backdrop (three.js) + code-drawn cast (engine/cast.js). Numbers are an illustrative example.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { character, CAST } from '/engine/cast.js';

const W = 1080, H = 1920;
const tl = await (await fetch('./timeline.json')).json();
const LN = tl.lines, LS = i => LN[i].start, LE = i => LN[i].end, T = tl.total;
const wt = (i, k) => { const w = LN[i].words.find(w => w.w.toLowerCase().startsWith(k.toLowerCase())); return w ? w.s : LS(i); };
const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), pr = (t, a, b) => cl((t - a) / (b - a));
const eo = v => 1 - Math.pow(1 - v, 3), eio = v => v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2;
const eb = v => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(v - 1, 3) + c1 * Math.pow(v - 1, 2); };
const BRAND = LE(8) + 0.05;

// ---------- 3D clay bazaar ----------
const glc = document.createElement('canvas'); glc.width = W; glc.height = H;
const R = new THREE.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true });
R.setPixelRatio(1); R.setSize(W, H, false); R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 0.8;
const sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(50, W / H, 0.5, 1500);
sc.environment = new THREE.PMREMGenerator(R).fromScene(new RoomEnvironment(), 0.04).texture; sc.environmentIntensity = 0.3;
const sky = document.createElement('canvas'); sky.width = 16; sky.height = 512; { const x = sky.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 512); g.addColorStop(0, '#ffc9d9'); g.addColorStop(1, '#fff3e6'); x.fillStyle = g; x.fillRect(0, 0, 16, 512); }
sc.background = new THREE.CanvasTexture(sky); sc.background.colorSpace = THREE.SRGBColorSpace;
sc.fog = new THREE.Fog('#ffe4e6', 140, 420);
const hemi = new THREE.HemisphereLight('#fff5ec', '#f4b8a0', 1.0); sc.add(hemi);
const sun = new THREE.DirectionalLight('#fff1e6', 2.2); sun.position.set(70, 120, 90); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
Object.assign(sun.shadow.camera, { left: -120, right: 120, top: 120, bottom: -120, far: 500 }); sc.add(sun);
let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647, (seed - 1) / 2147483646);
const C = c => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.55, metalness: 0, clearcoat: 0.3, clearcoatRoughness: 0.2 });
const box = (w, h, d, m, x, y, z, r = 1.5) => { const o = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; sc.add(o); return o; };
const tex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
const ground = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), C('#f7d6c4')); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; sc.add(ground);
const road = new THREE.Mesh(new THREE.PlaneGeometry(36, 600), C('#efe3d3')); road.rotation.x = -Math.PI / 2; road.position.set(0, 0.05, -100); sc.add(road);
const cols = ['#fda4af', '#fcd34d', '#93c5fd', '#86efac', '#c4b5fd', '#fdba74'];
for (let i = 0; i < 46; i++) { const side = i % 2 ? 1 : -1, x = side * (30 + rnd() * 70), z = 10 - rnd() * 260, h = 10 + rnd() * 22, w = 12 + rnd() * 8; box(w, h, w, C(cols[i % 6]), x, h / 2, z, 2.4); const r = new THREE.Mesh(new THREE.SphereGeometry(w * 0.55, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2), C('#ffffff')); r.position.set(x, h, z); r.castShadow = true; sc.add(r); }
// Paaji ki dukaan
box(46, 24, 16, C('#fff7ed'), 0, 12, -50, 2);
box(48, 3, 18, C('#f59e0b'), 0, 25.5, -50, 1);
const awn = new THREE.Mesh(new THREE.PlaneGeometry(48, 12), new THREE.MeshStandardMaterial({ map: tex(512, 128, (x, w, h) => { for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? '#ffffff' : '#ef4444'; x.fillRect(i * 32, 0, 32, h); } }), side: THREE.DoubleSide }));
awn.position.set(0, 19, -39); awn.rotation.x = -0.9; sc.add(awn);
const sign = new THREE.Mesh(new THREE.PlaneGeometry(40, 8), new THREE.MeshBasicMaterial({ map: tex(1024, 205, (x, w, h) => { x.fillStyle = '#0b2545'; x.fillRect(0, 0, w, h); x.strokeStyle = '#f4cf6a'; x.lineWidth = 14; x.strokeRect(7, 7, w - 14, h - 14); x.font = '900 110px Inter, "Noto Color Emoji"'; x.fillStyle = '#f4cf6a'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('PAAJI STORE 🛒', w / 2, h / 2 + 6); }), color: '#e6e6e6' }));
sign.position.set(0, 31.5, -41.5); sc.add(sign);
box(30, 12, 1, C('#7dd3fc'), 0, 9, -41.8, 0.4);
for (let i = 0; i < 6; i++) { const x = -22 + i * 8.8; box(7, 5, 6, C('#a16207'), x, 2.5, -32, 0.6); for (let k = 0; k < 3; k++) { const f = new THREE.Mesh(new THREE.SphereGeometry(1.5, 12, 10), C(['#ef4444', '#f59e0b', '#22c55e', '#a855f7'][(i + k) % 4])); f.position.set(x - 2 + k * 2, 6, -32 + (k % 2)); f.castShadow = true; sc.add(f); } }
// floating coins (paisa ghumao) in 3D around the shop
const coins = []; for (let i = 0; i < 8; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 0.5, 24), new THREE.MeshStandardMaterial({ color: '#fbbf24', metalness: 0.35, roughness: 0.35, emissive: '#b45309', emissiveIntensity: 0.35 })); c.rotation.x = Math.PI / 2; sc.add(c); coins.push(c); }
const exposureAt = t => 0.8 - 0.38 * Math.min(pr(t, LS(5) - 0.2, LS(5) + 0.4), 1 - pr(t, LE(6), LS(7) + 0.5));
function render3d(t) {
  const k = eio(pr(t, 0, T));
  cam.position.set(Math.sin(t * 0.25) * 8, 26 - 6 * k, 72 - 18 * k); cam.lookAt(0, 16, -45);
  const on = pr(t, LS(1), LS(1) + 1) * (1 - pr(t, LE(4), LE(4) + 0.6));
  coins.forEach((c, i) => { const a = t * 2.2 + i / coins.length * Math.PI * 2; c.position.set(Math.cos(a) * 30, 40 + Math.sin(a * 2) * 2, -50 + Math.sin(a) * 14); c.scale.setScalar(Math.max(on, 0.001)); c.rotation.z = t * 3 + i; });
  R.toneMappingExposure = exposureAt(t);
  sc.fog.color.set(t > LS(5) - 0.2 && t < LS(7) + 0.5 ? '#3b1d5e' : '#ffe4e6');
  R.render(sc, cam);
}

// ---------- 2D overlay ----------
const out = document.createElement('canvas'); out.width = W; out.height = H; out.id = 'out'; document.body.appendChild(out);
const x = out.getContext('2d');
await Promise.all(['900', '800', '700', '600'].map(w => document.fonts.load(`${w} 40px Inter`)));
await document.fonts.load('40px "Noto Color Emoji"', '🤯🔄📅📈👻🔔🔁👆1️⃣2️⃣3️⃣👇💰✅');
const logo = await new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = '/brand/logo-transparent.png'; });
const F = (w, s) => `${w} ${s}px Inter, "Noto Color Emoji", sans-serif`;
const rr = (X, Y, w, h, r) => { x.beginPath(); x.roundRect(X, Y, w, h, r); };
function pill(text, X, Y, size, fg, bg, sc = 1, maxW = 1000) {
  if (sc <= 0) return; x.save(); x.font = F(900, size); let w = x.measureText(text).width + size * 1.1; const k = Math.min(1, maxW / w);
  x.translate(X, Y); x.scale(sc * k, sc * k); x.shadowColor = 'rgba(0,0,0,0.25)'; x.shadowBlur = 24; x.shadowOffsetY = 8;
  rr(-w / 2, -size * 0.85, w, size * 1.7, size * 0.4); x.fillStyle = bg; x.fill(); x.shadowColor = 'transparent';
  x.fillStyle = fg; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 0, 4); x.restore();
}
const fj = { ctx: x, overlays: [] };
const speaks = who => LN.map((l, i) => l.who === who ? [l.start, LS(i) + (l.audio || (l.end - l.start)) + 0.05] : null).filter(Boolean);
const mood = (who, table) => table.map(([i, m, a = 0, b = 1]) => ({ t0: LS(i) + a * (LE(i) - LS(i)), t1: b >= 1 ? (LN[i + 1] ? LS(i + 1) : T + 1) : LS(i) + b * (LE(i) - LS(i)), mood: m }));
const isSpeaking = (who, t) => speaks(who).some(([a, b]) => t >= a && t < b);
const posFor = (who, bx) => t => { const s = isSpeaking(who, t) ? 0.8 : 0.76; return { x: bx, y: 1450, s, flip: who === 'P' }; };
await character(fj, { who: 'chintu', speaks: speaks('C'), appear: -1, pos: posFor('C', 225), moods: mood('C', [[0, 'shock'], [1, 'happy'], [2, 'think'], [3, 'think'], [4, 'happy'], [5, 'worried'], [6, 'shock'], [7, 'worried', 0, 0.6], [7, 'happy', 0.6], [8, 'point']]) });
await character(fj, { who: 'paaji', speaks: speaks('P'), appear: -1, pos: posFor('P', 860), moods: mood('P', [[0, 'happy'], [1, 'happy'], [2, 'talk'], [3, 'point'], [4, 'thumbs'], [5, 'worried'], [6, 'worried'], [7, 'talk'], [8, 'thumbs']]) });
await character(fj, { who: 'ghost', speaks: speaks('G'), appear: LS(5) - 0.3, pos: t => { const k = eo(pr(t, LS(5) - 0.3, LS(5) + 0.5)), out = pr(t, LE(6), LS(7) + 0.6); return { x: 560 + Math.sin(t * 2) * 30, y: 1050 - 500 * (1 - k) - 700 * out, s: 0.85 * (1 - out) + 0.001 }; }, moods: [{ t0: 0, t1: 99, mood: LN[6] ? 'wave' : 'talk' }] });

// captions (karaoke), speaker colour
const chunks = []; LN.forEach(L => { let cur = []; L.words.forEach((w, i) => { cur.push(w); const ch = cur.map(c => c.w).join(' ').length; if (cur.length >= 4 || ch >= 22 || (/[.,!?…:]$/.test(w.w) && cur.length >= 2) || i === L.words.length - 1) { cur.who = L.who; chunks.push(cur); cur = []; } }); });
chunks.forEach((c, i) => { c.s = c[0].s - 0.05; c.e = i + 1 < chunks.length ? Math.min(chunks[i + 1][0].s - 0.05, c[c.length - 1].e + 0.7) : c[c.length - 1].e + 0.5; });
const WHO = { C: ['CHINTU', '#a78bfa'], P: ['PAAJI', '#f59e0b'], G: ['EMI BHOOT 👻', '#f87171'] };
function captions(t) {
  const c = chunks.find(c => t >= c.s && t < c.e); if (!c || t > BRAND) return;
  x.font = F(800, 46); const sp = x.measureText(' ').width, ws = c.map(w => x.measureText(w.w).width), tw = ws.reduce((a, b) => a + b, 0) + sp * (c.length - 1);
  const pw = tw + 60, X0 = 540 - pw / 2, Y = 1505; x.globalAlpha = Math.min(pr(t, c.s, c.s + 0.08), 1 - pr(t, c.e - 0.08, c.e));
  rr(X0, Y - 42, pw, 84, 20); x.fillStyle = 'rgba(17,19,26,0.94)'; x.fill(); x.strokeStyle = WHO[c.who][1]; x.lineWidth = 4; x.stroke();
  x.font = F(900, 24); x.fillStyle = WHO[c.who][1]; x.textAlign = 'left'; x.fillText(WHO[c.who][0], X0 + 18, Y - 58);
  x.font = F(800, 46); let cx = X0 + 30; x.textBaseline = 'middle';
  c.forEach((w, i) => { x.fillStyle = t >= w.s ? '#ffffff' : '#6b7280'; x.fillText(w.w, cx, Y + 3); cx += ws[i] + sp; }); x.globalAlpha = 1;
}
function footer(t) {
  if (t > BRAND) return; const Y = 1625, slot = Math.floor(t / 2.4) % 2, ph = (t % 2.4) / 2.4;
  [['🔔 FOLLOW', '#f4cf6a', 330, 0], ['🔁 REPOST', '#ffffff', 700, 1]].forEach(([l, bg, X, s]) => {
    const act = slot === s, pz = act && ph > 0.35 && ph < 0.5 ? 0.9 : 1; x.save(); x.translate(X, Y); x.scale(pz, pz); x.font = F(900, 38); const w = x.measureText(l).width + 60;
    x.shadowColor = act ? bg : 'rgba(0,0,0,0.3)'; x.shadowBlur = act ? 28 : 8; rr(-w / 2, -36, w, 72, 36); x.fillStyle = bg; x.fill(); x.shadowColor = 'transparent';
    x.fillStyle = '#0b1020'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(l, 0, 3); x.restore();
  });
  x.font = '58px "Noto Color Emoji"'; x.textAlign = 'center'; x.fillText('👆', (slot ? 700 : 330) + 55, Y + 56 - (ph > 0.35 && ph < 0.5 ? 0 : 14));
}
function chrome(t) {
  if (t > BRAND) return;
  x.save(); rr(48, 56, 92, 92, 22); x.fillStyle = '#fff'; x.fill(); x.drawImage(logo, 250, 75, 755, 755, 58, 66, 72, 72); x.restore();
  x.font = '600 24px "JetBrains Mono", monospace'; const n = 'Example numbers · not advice'; const w = x.measureText(n).width + 28;
  rr(1032 - w, 82, w, 44, 10); x.fillStyle = 'rgba(255,255,255,0.85)'; x.fill(); x.fillStyle = '#475569'; x.textAlign = 'right'; x.textBaseline = 'middle'; x.fillText(n, 1018, 105);
  x.fillStyle = 'rgba(0,0,0,0.1)'; x.fillRect(0, 0, W, 8); x.fillStyle = '#f59e0b'; x.fillRect(0, 0, W * cl(t / BRAND), 8);
}
// ---------- story beats ----------
function beats(t) {
  // hook
  if (t < LS(1) + 0.2) { const a = 1 - pr(t, LS(1) - 0.1, LS(1) + 0.2); x.globalAlpha = a; pill('₹1 LAKH → ₹40,000', 540, 330, 92, '#0b2545', '#ffffff', 1 + 0.03 * Math.sin(t * 6)); pill('HAR MAHINE? 🤯', 540, 490, 84, '#ffffff', '#e11d48', 1 + 0.04 * Math.sin(t * 7 + 1)); x.globalAlpha = 1; }
  // raaz title cards
  const card = (i0, i1, txt, col) => { if (t < LS(i0) - 0.05 || t > LE(i1) + 0.1) return; const s = eb(pr(t, LS(i0), LS(i0) + 0.4)) * (1 - pr(t, LE(i1) - 0.15, LE(i1) + 0.1)); pill(txt, 540, 300, 64, '#ffffff', col, s); };
  card(1, 2, 'RAAZ #1 · PAISA GHUMAO 🔄', '#0b2545'); card(3, 3, 'RAAZ #2 · UDHAAR KA TIME 📅', '#0b2545'); card(4, 4, 'RAAZ #3 · MUNAFA WAPAS 📈', '#0b2545');
  // Raaz 1: coin loop counter
  if (t > LS(2) - 0.2 && t < LE(2) + 0.3) {
    const a = Math.min(pr(t, LS(2) - 0.2, LS(2) + 0.2), 1 - pr(t, LE(2), LE(2) + 0.3)); x.globalAlpha = a;
    const t10 = wt(2, '₹10'), tg = wt(2, '4'), t40 = wt(2, '₹40');
    const laps = t < t10 ? 0 : t < tg ? 1 : t < t40 ? 1 + 3 * pr(t, tg, t40) : 4;
    const cx = 540, cy = 760, r = 190;
    x.fillStyle = 'rgba(255,255,255,0.97)'; rr(cx - 280, cy - 270, 560, 540, 40); x.fill();
    x.strokeStyle = '#f59e0b'; x.lineWidth = 10; x.setLineDash([18, 14]); x.lineDashOffset = -t * 60; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.stroke(); x.setLineDash([]);
    for (let i = 0; i < 6; i++) { const ang = t * 3 + i / 6 * Math.PI * 2; x.font = '54px "Noto Color Emoji"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('🪙', cx + Math.cos(ang) * r, cy + Math.sin(ang) * r); }
    x.font = F(900, 46); x.fillStyle = '#0b2545'; x.fillText('₹1 LAKH', cx, cy - 40); x.font = F(700, 30); x.fillStyle = '#64748b'; x.fillText('ka maal · 10% munafa', cx, cy + 4);
    const val = Math.round(Math.floor(laps + 1e-6) * 10000 + (laps % 1) * 10000);
    x.font = F(900, 70); x.fillStyle = laps >= 4 ? '#16a34a' : '#f59e0b'; x.fillText('₹' + Math.min(40000, Math.floor(laps) * 10000).toLocaleString('en-IN') + (laps >= 4 ? ' ✅' : ''), cx, cy + 80);
    x.font = F(800, 30); x.fillStyle = '#0b2545'; x.fillText(`${Math.min(4, Math.floor(laps))}x ghumaya`, cx, cy + 140);
    x.globalAlpha = 1; void val;
  }
  // Raaz 2: calendar bars
  if (t > LS(3) - 0.2 && t < LE(3) + 0.3) {
    const a = Math.min(pr(t, LS(3) - 0.2, LS(3) + 0.2), 1 - pr(t, LE(3), LE(3) + 0.3)); x.globalAlpha = a;
    const X0 = 140, Wd = 800, Y = 520; x.fillStyle = 'rgba(255,255,255,0.97)'; rr(90, Y - 90, 900, 520, 36); x.fill();
    const p1 = eo(pr(t, wt(3, '30'), wt(3, '30') + 0.8)), p2 = eo(pr(t, wt(3, '10'), wt(3, '10') + 0.6));
    x.font = F(800, 34); x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillStyle = '#0b2545'; x.fillText('Supplier ko paisa: 30 din', X0, Y - 20);
    rr(X0, Y + 10, Wd * p1, 56, 14); x.fillStyle = '#f59e0b'; x.fill();
    x.fillStyle = '#0b2545'; x.fillText('Maal bika: 10 din ✅', X0, Y + 130); rr(X0, Y + 160, Wd / 3 * p2, 56, 14); x.fillStyle = '#16a34a'; x.fill();
    for (let d = 0; d <= 30; d += 5) { x.fillStyle = '#94a3b8'; x.font = F(700, 22); x.textAlign = 'center'; x.fillText(d, X0 + Wd * d / 30, Y + 250); }
    const hk = pr(t, wt(3, 'beech'), wt(3, 'beech') + 0.5);
    if (hk > 0) { x.globalAlpha = a * hk; x.strokeStyle = '#e11d48'; x.lineWidth = 6; x.setLineDash([12, 10]); rr(X0 + Wd / 3, Y - 4, Wd * 2 / 3, 240, 16); x.stroke(); x.setLineDash([]); pill('20 DIN: supplier ka paisa 💰', 540, Y + 330, 40, '#ffffff', '#e11d48', eb(hk)); }
    x.globalAlpha = 1;
  }
  // Raaz 3: growing stacks
  if (t > LS(4) - 0.2 && t < LE(4) + 0.3) {
    const a = Math.min(pr(t, LS(4) - 0.2, LS(4) + 0.2), 1 - pr(t, LE(4), LE(4) + 0.3)); x.globalAlpha = a;
    x.fillStyle = 'rgba(255,255,255,0.97)'; rr(110, 430, 860, 560, 36); x.fill();
    [['₹1 L', 220], ['₹1.1 L', 290], ['₹1.2 L', 360]].forEach(([lb, h], i) => {
      const k = eb(pr(t, LS(4) + 0.6 + i * 0.9, LS(4) + 1.1 + i * 0.9)); if (k <= 0) return; const X = 260 + i * 280, hh = h * k;
      rr(X - 80, 920 - hh, 160, hh, 14); x.fillStyle = ['#86efac', '#4ade80', '#16a34a'][i]; x.fill();
      x.font = F(900, 40); x.fillStyle = '#0b2545'; x.textAlign = 'center'; x.fillText(lb, X, 900 - hh - 30);
      if (i < 2) { x.font = '48px "Noto Color Emoji"'; x.fillText('➡️', X + 140, 820); }
    });
    x.font = F(800, 34); x.fillStyle = '#0b2545'; x.textAlign = 'center'; x.fillText('Munafa wapas dhande mein', 540, 480);
    x.globalAlpha = 1;
  }
  // ghost scene: purple vignette + warning
  const gk = Math.min(pr(t, LS(5) - 0.2, LS(5) + 0.3), 1 - pr(t, LE(6), LS(7) + 0.4));
  if (gk > 0) { const g = x.createRadialGradient(540, 900, 200, 540, 900, 1100); g.addColorStop(0, 'rgba(59,7,100,0)'); g.addColorStop(1, `rgba(30,5,60,${0.75 * gk})`); x.fillStyle = g; x.fillRect(0, 0, W, H); pill('UDHAAR = EMI BHOOT 👻', 540, 300, 60, '#ffffff', '#7e22ce', eb(pr(t, LS(5), LS(5) + 0.4)) * gk); }
  if (t > LS(7) && t < LE(7) + 0.1) pill('Udhaar utna hi, jitna chuka sako ✅', 540, 300, 46, '#0b2545', '#ffffff', eb(pr(t, LS(7), LS(7) + 0.4)));
  // CTA
  if (t > LS(8) - 0.05 && t < BRAND) { pill('Kaunsa raaz best?', 540, 330, 70, '#0b2545', '#ffffff', eb(pr(t, LS(8), LS(8) + 0.4))); ['1️⃣', '2️⃣', '3️⃣'].forEach((e, i) => { const k = eb(pr(t, LS(8) + 0.5 + i * 0.25, LS(8) + 0.9 + i * 0.25)); if (k <= 0) return; x.save(); x.translate(330 + i * 210, 560); x.scale(k, k); x.font = '130px "Noto Color Emoji"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(e, 0, 0); x.restore(); }); x.font = '90px "Noto Color Emoji"'; x.textAlign = 'center'; x.fillText('👇', 540, 720 + Math.sin(t * 8) * 12); }
}
function branding(t) {
  if (t < BRAND) return; const k = pr(t, BRAND, BRAND + 0.25);
  x.globalAlpha = k; x.fillStyle = '#0b2545'; x.fillRect(0, 0, W, H); x.globalAlpha = 1;
  const s = eb(pr(t, BRAND + 0.05, BRAND + 0.5)); x.save(); x.translate(540, 800); x.scale(s, s);
  x.fillStyle = '#ffffff'; x.beginPath(); x.arc(0, 0, 280, 0, 7); x.fill(); x.drawImage(logo, -250, -250, 500, 500); x.restore();
  pill('🔔 Follow Finance Junction', 540, 1220, 60, '#0b2545', '#f4cf6a', eb(pr(t, BRAND + 0.3, BRAND + 0.7)));
}
window.DUR = T;
window.renderFrame = t => {
  render3d(t);
  x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.drawImage(glc, 0, 0);
  beats(t);
  if (t < BRAND) fj.overlays.forEach(o => { x.save(); o(t); x.restore(); });
  captions(t); footer(t); chrome(t); branding(t);
};
renderFrame(0); window.READY = true;
