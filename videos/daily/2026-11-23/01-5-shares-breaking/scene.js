// Theme A: BREAKING NEWS + COUNTDOWN — "Kal in 5 shares par BADI khabar" (23 Nov 2026)
// Facts: see ../STOCK_EVENTS.md (all verified, 2+ sources). No buy/sell advice; chips show news tilt only.
import * as FJ from '/engine/fj3d.js';
const { THREE, PAL, clamp, prog, easeOut, easeBack, easeInOut, rr } = FJ;
const V = (x, y, z) => new THREE.Vector3(x, y, z);

const fj = await FJ.boot();
const { L, E, A, ctx } = fj;
const T = fj.tl.total;
const scene = fj.scene;
const W = 1080;
const F = (w, s, fam = 'Inter') => `${w} ${s}px ${fam}, "Noto Color Emoji", sans-serif`;

// ---------------- 3D NEWS STUDIO ----------------
scene.background = new THREE.Color('#050b1c');
scene.fog = new THREE.Fog('#050b1c', 40, 140);
const basic = c => new THREE.MeshBasicMaterial({ color: c });
// floor + glowing grid
const floor = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), new THREE.MeshLambertMaterial({ color: '#0a1430' }));
floor.rotation.x = -Math.PI / 2; floor.position.y = -6; scene.add(floor);
const grid = new THREE.GridHelper(200, 80, '#3b82f6', '#1e3a8a'); grid.position.y = -5.95; grid.material.transparent = true; grid.material.opacity = 0.45; scene.add(grid);
// curved wall of screens
function screenTex(seed, accent) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 384; const x = c.getContext('2d');
  x.fillStyle = '#0b1d48'; x.fillRect(0, 0, 256, 384);
  for (let r = 0; r < 9; r++) { x.fillStyle = r % 3 === 0 ? accent : 'rgba(147,197,253,0.35)'; x.fillRect(20, 24 + r * 40, 60 + ((seed * 53 + r * 37) % 150), 16); }
  x.strokeStyle = 'rgba(147,197,253,0.6)'; x.lineWidth = 6; x.strokeRect(3, 3, 250, 378);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const screens = [];
for (let i = -5; i <= 5; i++) {
  if (Math.abs(i) < 1) continue;
  const a = i * 0.2, r = 48;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(7, 10.5), new THREE.MeshBasicMaterial({ map: screenTex(i + 9, i % 2 ? '#ef4444' : '#f4cf6a') }));
  m.position.set(Math.sin(a) * r, 4 + (Math.abs(i) % 2) * 2, -Math.cos(a) * r + 18); m.lookAt(0, 4, 18); scene.add(m); screens.push(m);
}
// red + gold LED strips
[['#ef4444', 13], ['#d4a62c', -4.5]].forEach(([c, y]) => {
  const s = new THREE.Mesh(new THREE.BoxGeometry(120, 0.35, 0.35), basic(c)); s.position.set(0, y, -28); scene.add(s);
});
// floating gold dust
const dustGeo = new THREE.BufferGeometry(); const N = 260, pos = new Float32Array(N * 3);
for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - 0.5) * 70; pos[i * 3 + 1] = Math.random() * 30 - 6; pos[i * 3 + 2] = (Math.random() - 0.5) * 50 - 5; }
dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: '#f4cf6a', size: 0.18, transparent: true, opacity: 0.7 }));
scene.add(dust);
// siren (hook)
const siren = new THREE.Group();
const base = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 3, 1, 24), new THREE.MeshLambertMaterial({ color: '#cbd5e1' })); siren.add(base);
const dome = new THREE.Mesh(new THREE.SphereGeometry(2.3, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#ef4444', transparent: true, opacity: 0.9 }));
dome.position.y = 0.5; siren.add(dome);
const beamGeo = new THREE.ConeGeometry(3.2, 18, 20, 1, true); beamGeo.translate(0, -9, 0);
const beam = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({ color: '#ff5252', transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
beam.rotation.z = Math.PI / 2; beam.position.y = 1.6; siren.add(beam);
siren.position.set(0, -1.5, 4); scene.add(siren);
const redLight = new THREE.PointLight('#ff3b3b', 0, 60); redLight.position.set(0, 6, 8); scene.add(redLight);

// ---------------- NEWS CARDS ----------------
function cardTex(name, big, sub) {
  const c = document.createElement('canvas'); c.width = 1600; c.height = 900; const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, 900); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#e6ecf6');
  x.fillStyle = g; x.fillRect(0, 0, 1600, 900);
  x.fillStyle = PAL.navy; x.fillRect(0, 0, 1600, 210);
  x.fillStyle = '#dc2626'; x.fillRect(0, 210, 1600, 16);
  const fit = (s, size, w, maxW) => { x.font = F(w, size); const m = x.measureText(s).width; return m > maxW ? size * maxW / m : size; };
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.font = F(900, fit(name, 96, 900, 1480)); x.fillStyle = '#ffffff'; x.fillText(name, 800, 110);
  x.font = F(900, fit(big, 190, 900, 1480)); x.fillStyle = PAL.navy; x.fillText(big, 800, 470);
  x.font = F(700, fit(sub, 64, 700, 1480)); x.fillStyle = '#475569'; x.fillText(sub, 800, 700);
  x.fillStyle = '#d4a62c'; x.fillRect(0, 870, 1600, 30);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
const ITEMS = [
  { line: 1, rank: 5, name: 'WELSPUN LIVING', big: '₹3,200 CR CAPEX', sub: '₹800 cr equity + ₹2,400 cr tak loan · board: 21 Nov', chips: [['🟡 Mixed: growth + naya karz', '#f4cf6a']] },
  { line: 2, rank: 4, name: 'LIC · COFORGE · ADANI GREEN · MEESHO', big: 'MSCI ENTRY', sub: '~$2 bn passive inflow (andaaza) · PI Industries bahar', chips: [['🟢 Inflow lean', '#4ade80'], ['🔴 PI Industries: outflow', '#f87171']] },
  { line: 3, rank: 3, name: 'ZEE ENTERTAINMENT', big: '₹600 CR BUYBACK', sub: '@ ₹91 / share · record date 25 Nov', chips: [['⏰ 23 Nov shayad aakhri din', '#f4cf6a'], ['🟢 Positive lean', '#4ade80']] },
  { line: 4, rank: 2, name: 'INDUSIND BANK', big: 'EX-CEO TERMINATED', sub: 'Clawback 24 Mar 2020 se · governance issue', chips: [['🟡 Governance, earnings nahi', '#f4cf6a']] },
  { line: 5, rank: 1, name: 'TATA STEEL × APL APOLLO', big: 'TUBES + COLORS', sub: 'Board approval 22 Nov · regulatory nod baaki', chips: [['🟢 Tata Steel', '#4ade80'], ['🟡 APL Apollo', '#f4cf6a']] },
];
const cards = ITEMS.map(it => {
  const g = new THREE.Group();
  const front = new THREE.Mesh(new THREE.PlaneGeometry(10.4, 5.85), new THREE.MeshBasicMaterial({ map: cardTex(it.name, it.big, it.sub) }));
  front.position.z = 0.14; g.add(front);
  const body = new THREE.Mesh(new THREE.BoxGeometry(10.7, 6.15, 0.25), basic('#0b2545')); g.add(body);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(10.4, 5.85), basic('#d4a62c')); back.rotation.y = Math.PI; back.position.z = -0.14; g.add(back);
  g.visible = false; scene.add(g);
  return { ...it, g };
});
fj.updaters.push(t => {
  cards.forEach(c => {
    const t0 = L(c.line), t1 = E(c.line) + 0.15;
    const inP = easeBack(prog(t, t0, t0 + 0.7)), outP = easeInOut(prog(t, t1 - 0.35, t1));
    c.g.visible = t >= t0 - 0.05 && t <= t1 + 0.05;
    if (!c.g.visible) return;
    const sway = Math.sin(t * 1.3) * 0.06;
    c.g.position.set(0, 1.6 - (1 - inP) * 12 + outP * 14, 0);
    c.g.rotation.set(-0.08 + outP * -1.2, (1 - clamp(inP)) * Math.PI * 1.0 + sway, (1 - clamp(inP)) * 0.3);
    const s = 1 + (c.rank === 1 ? 0.05 * Math.max(0, Math.sin((t - t0) * 6)) * (1 - prog(t, t0 + 1, t0 + 2)) : 0);
    c.g.scale.setScalar(s);
  });
  siren.visible = t < E(0) + 0.4;
  const sp = 1 - easeInOut(prog(t, E(0) - 0.3, E(0) + 0.3));
  siren.scale.setScalar(Math.max(0.001, sp));
  beam.rotation.y = t * 5; dome.material.opacity = 0.7 + 0.3 * Math.abs(Math.sin(t * 10));
  redLight.intensity = siren.visible ? 60 * (0.5 + 0.5 * Math.sin(t * 10)) : 0;
  dust.rotation.y = t * 0.03; dust.position.y = Math.sin(t * 0.5) * 0.5;
  screens.forEach((m, i) => { m.material.color.setScalar(0.75 + 0.25 * Math.sin(t * 2 + i)); });
});

// ---------------- CAMERA ----------------
const keys = [{ t: 0, pos: [0, 3, 30], at: [0, 2, 0] }, { t: E(0), pos: [0, 2.5, 25], at: [0, 1.5, 0] }];
cards.forEach((c, i) => {
  const sx = i % 2 ? 2.6 : -2.6;
  keys.push({ t: A(c.line, 0.15), pos: [sx * 0.4, 2.4, 24], at: [0, 1.4, 0] });
  keys.push({ t: A(c.line, 0.9), pos: [sx, 3.2, 21.5], at: [0, 1.2, 0] });
});
keys.push({ t: A(6, 0.4), pos: [0, 5, 30], at: [0, 3, 0] });
keys.push({ t: T, pos: [0, 6, 34], at: [0, 3, 0] });
FJ.cameraPath(fj, keys);

// ---------------- 2D OVERLAYS ----------------
function T2(s, x, y, o = {}) {
  const { size = 60, w = 800, c = '#fff', a = 'center', maxW = 1000, alpha = 1, scale = 1 } = o;
  if (alpha <= 0 || scale <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(alpha); ctx.font = F(w, size);
  let k = 1; const mw = ctx.measureText(s).width; if (mw > maxW) k = maxW / mw;
  ctx.translate(x, y); ctx.scale(k * scale, k * scale); ctx.fillStyle = c; ctx.textAlign = a; ctx.textBaseline = 'middle'; ctx.fillText(s, 0, 0); ctx.restore();
}
function chip(s, x, y, bg, scale = 1, size = 40) {
  if (scale <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
  ctx.font = F(800, size); const w = ctx.measureText(s).width + 56;
  rr(ctx, -w / 2, -size * 0.85, w, size * 1.7, size * 0.85); ctx.fillStyle = bg; ctx.fill();
  ctx.fillStyle = '#0b0b14'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, 0, 3);
  ctx.restore();
}
function stamp(s, x, y, c, rot, size, t, at) {
  if (t < at) return;
  const p = easeOut(prog(t, at, at + 0.2)), sc = 2.6 - 1.6 * p;
  ctx.save(); ctx.globalAlpha *= clamp(p * 1.5); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  ctx.font = F(900, size); const w = ctx.measureText(s).width + 70, h = size * 1.35;
  rr(ctx, -w / 2, -h / 2, w, h, 24); ctx.fillStyle = 'rgba(10,5,15,0.7)'; ctx.fill(); ctx.lineWidth = 12; ctx.strokeStyle = c; ctx.stroke();
  ctx.fillStyle = c; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, 0, size * 0.06); ctx.restore();
}
// screen shake on the #1 stamp (applied to overlays only; 3D gets a camera nudge)
const STAMP_AT = A(5, 0.72);
const shake = t => (t > STAMP_AT && t < STAMP_AT + 0.5) ? Math.exp(-(t - STAMP_AT) * 9) * 22 : 0;

// BREAKING bar (slides in, shimmer)
fj.overlays.push(t => {
  const sl = t < 0.05 ? 1 : 1; // visible from first frame (hook)
  const y = 210;
  ctx.save(); ctx.translate(Math.sin(t * 60) * shake(t), 0);
  ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(620, y); ctx.lineTo(580, y + 110); ctx.lineTo(0, y + 110); ctx.closePath(); ctx.fillStyle = '#dc2626'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(620, y); ctx.lineTo(1080, y); ctx.lineTo(1080, y + 110); ctx.lineTo(580, y + 110); ctx.closePath(); ctx.fillStyle = '#ffffff'; ctx.fill();
  // shimmer
  const sx = ((t * 500) % 1800) - 300;
  const g = ctx.createLinearGradient(sx - 80, 0, sx + 80, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, y, 620, 110);
  T2('🚨 BREAKING', 300, y + 58, { size: 70, w: 900 });
  ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 8); ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.arc(700, y + 55, 14, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
  T2('LIVE · 23 NOV', 890, y + 58, { size: 44, w: 900, c: '#0b1020' });
  ctx.restore();
});
// HOOK text (fully visible on frame 0)
fj.overlays.push(t => {
  if (t > E(0) + 0.3) return;
  const a = 1 - prog(t, E(0) - 0.2, E(0) + 0.3);
  const p = 1 + 0.025 * Math.sin(t * 5);
  T2('23 NOV 2026', 540, 470, { size: 104, w: 900, c: '#ffffff', alpha: a, scale: p });
  T2('IN 5 SHARES PAR', 540, 600, { size: 112, w: 900, alpha: a, scale: p });
  T2('BADI KHABAR', 540, 730, { size: 120, w: 900, c: '#f4cf6a', alpha: a, scale: p });
  chip('#1 ??? sabse bada 👀', 540, 1300, '#ffffff', a * (1 + 0.04 * Math.sin(t * 6)), 44);
});
// rank number + chips + #1 stamp + confetti
const confetti = Array.from({ length: 90 }, (_, i) => ({ a: (i / 90) * Math.PI * 2 + Math.sin(i) * 0.3, v: 500 + (i * 37) % 600, c: ['#f4cf6a', '#ef4444', '#4ade80', '#ffffff', '#60a5fa'][i % 5], s: 10 + (i * 13) % 14 }));
fj.overlays.push(t => {
  const c = cards.find(c => t >= L(c.line) && t <= E(c.line) + 0.15);
  if (!c) return;
  const t0 = L(c.line), t1 = E(c.line);
  const out = 1 - prog(t, t1 - 0.2, t1 + 0.1);
  const pr = easeBack(prog(t, t0 + 0.05, t0 + 0.45));
  ctx.save(); ctx.translate(Math.sin(t * 60) * shake(t), Math.cos(t * 50) * shake(t));
  T2(`#${c.rank}`, 540, 470, { size: c.rank === 1 ? 250 : 210, w: 900, c: '#f4cf6a', scale: Math.max(0, pr), alpha: out });
  if (c.rank === 1) T2('NUMBER ONE', 540, 610, { size: 46, w: 900, c: '#ffffff', alpha: out * prog(t, t0 + 0.3, t0 + 0.6) });
  c.chips.forEach(([s, bg], i) => {
    const at = t0 + 0.9 + i * 0.35;
    chip(s, 540, 1290 + i * 92, bg, easeBack(prog(t, at, at + 0.35)) * out, 38);
  });
  if (c.rank === 1) {
    stamp('₹28,000 CR 💥', 540, 900, '#ef4444', -0.12, 112, t, STAMP_AT);
    const cp = prog(t, STAMP_AT, STAMP_AT + 1.6);
    if (cp > 0 && cp < 1) confetti.forEach(q => {
      const d = q.v * easeOut(cp), x = 540 + Math.cos(q.a) * d, y = 900 + Math.sin(q.a) * d + 600 * cp * cp;
      ctx.globalAlpha = 1 - cp; ctx.fillStyle = q.c; ctx.save(); ctx.translate(x, y); ctx.rotate(cp * 12 + q.a); ctx.fillRect(-q.s / 2, -q.s / 4, q.s, q.s / 2); ctx.restore();
    });
    ctx.globalAlpha = 1;
  }
  ctx.restore();
});
// CTA end screen (logo + big follow/repost)
fj.overlays.push(t => {
  if (t < L(6) - 0.1) return;
  const lt = t - L(6), a = prog(lt, 0, 0.4);
  ctx.globalAlpha = a * 0.55; ctx.fillStyle = '#030714'; ctx.fillRect(0, 330, W, 1100); ctx.globalAlpha = 1;
  T2('Aapke paas kaunsa share hai?', 540, 450, { size: 60, w: 900, alpha: a });
  T2('Comment karo 👇', 540, 530, { size: 52, w: 800, c: '#f4cf6a', alpha: a });
  const p = easeBack(prog(lt, 0.2, 0.8));
  if (p > 0) {
    const g = ctx.createRadialGradient(540, 860, 0, 540, 860, 330); g.addColorStop(0, 'rgba(212,166,44,0.35)'); g.addColorStop(1, 'rgba(212,166,44,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 500, W, 720);
    ctx.save(); ctx.globalAlpha = clamp(p); ctx.translate(540, 860); ctx.scale(p, p);
    ctx.strokeStyle = 'rgba(244,207,106,0.6)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, 270, t * 1.4, t * 1.4 + Math.PI * 1.3); ctx.stroke();
    ctx.drawImage(fj.logoDark, -230, -230, 460, 460); ctx.restore();
  }
});
// FOOTER: animated FOLLOW + REPOST buttons with tapping hand (whole reel)
fj.overlays.push(t => {
  const y = 1582, big = t >= L(6);
  const k = big ? 1 + 0.18 * easeBack(prog(t, L(6) + 0.3, L(6) + 0.8)) : 1;
  const slot = Math.floor(t / 2.4) % 2;           // hand alternates between buttons
  const ph = (t % 2.4) / 2.4;
  const btn = (x, label, bg, fg, active) => {
    const press = active ? (ph > 0.35 && ph < 0.5 ? 0.9 : 1) : 1;
    const pulse = active ? 1 + 0.06 * Math.max(0, Math.sin(ph * Math.PI * 2)) : 1;
    ctx.save(); ctx.translate(x, y); ctx.scale(k * press * pulse, k * press * pulse);
    ctx.shadowColor = active ? bg : 'transparent'; ctx.shadowBlur = active ? 30 : 0;
    ctx.font = F(900, 42); const w = ctx.measureText(label).width + 70;
    rr(ctx, -w / 2, -40, w, 80, 40); ctx.fillStyle = bg; ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, 0, 3);
    if (active && ph > 0.4 && ph < 0.75) { // ripple
      const r = (ph - 0.4) / 0.35; ctx.globalAlpha = 1 - r; ctx.strokeStyle = bg; ctx.lineWidth = 6;
      rr(ctx, -w / 2 - r * 30, -40 - r * 30, w + r * 60, 80 + r * 60, 40 + r * 30); ctx.stroke(); ctx.globalAlpha = 1;
    }
    ctx.restore();
  };
  btn(360, '🔔 FOLLOW', '#d4a62c', '#0b1020', slot === 0);
  btn(720, '🔁 REPOST', '#ffffff', '#0b1020', slot === 1);
  // tapping hand
  const hx = slot === 0 ? 420 : 780, hy = y + 60 - (ph > 0.35 && ph < 0.5 ? 0 : 18) + Math.sin(ph * Math.PI * 2) * 4;
  ctx.font = F(400, 64); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('👆', hx, hy);
});
// TICKER (bottom)
fj.overlays.push(t => {
  const y = 1672, h = 70;
  ctx.fillStyle = '#d4a62c'; ctx.fillRect(0, y, W, h);
  const msg = 'TATA STEEL × APL APOLLO ₹28,000 CR  •  INDUSIND: EX-CEO TERMINATED, CLAWBACK  •  ZEE ₹600 CR BUYBACK  •  MSCI: LIC, COFORGE, ADANI GREEN, MEESHO  •  WELSPUN ₹3,200 CR CAPEX  •  ';
  ctx.font = F(800, 36); const mw = ctx.measureText(msg).width; const off = (t * 160) % mw;
  ctx.save(); ctx.beginPath(); ctx.rect(230, y, W - 230, h); ctx.clip();
  ctx.fillStyle = '#0b1020'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(msg + msg, 240 - off, y + h / 2 + 2); ctx.restore();
  ctx.fillStyle = PAL.navy; ctx.fillRect(0, y, 230, h); T2('MARKET', 115, y + h / 2 + 2, { size: 38, w: 900, c: '#f4cf6a' });
});
FJ.brandBadge(fj, 0, L(6));
FJ.tag(fj, 'not advice');
FJ.captions(fj, { y: 1484, size: 46 });
FJ.progressBar(fj);
// small sources line at the end
fj.overlays.push(t => {
  if (t < L(6) + 0.6) return;
  T2('Not investment advice. Sources: company filings via ANI, Business Standard, MSCI review coverage, Goodreturns.', 540, 1390, { size: 24, w: 500, c: 'rgba(203,213,225,0.85)', maxW: 1000, alpha: prog(t, L(6) + 0.6, L(6) + 1) });
});
FJ.ready(fj);
