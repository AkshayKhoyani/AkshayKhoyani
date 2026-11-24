// 24 Nov 2026: "Ek CEO wapas aaya, duniya ke market ude" — same look as 23 Nov crash reel
// (Kinetic typography + whiteboard, Bunty v4 voice) + extra motion: virtual camera (push-in, drift, punch, shake),
// whip-pan transitions, particles, camera pan across a wide world board. Facts: SOURCES.md
const W = 1080, H = 1920;
const tl = await (await fetch('./timeline.json')).json();
const out = document.createElement('canvas'); out.width = W; out.height = H; out.id = 'out'; document.body.appendChild(out);
const x = out.getContext('2d');
const ff = (fam, url, weight = '400') => new FontFace(fam, `url(${url})`, { weight }).load().then(f => document.fonts.add(f));
await Promise.all([
  ff('Anton', '/engine/node_modules/@fontsource/anton/files/anton-latin-400-normal.woff2'),
  ff('Kalam', '/engine/node_modules/@fontsource/kalam/files/kalam-latin-700-normal.woff2', '700'),
  ...['900', '800', '700'].map(w => document.fonts.load(`${w} 40px Inter`)),
  document.fonts.load('40px "Noto Color Emoji"', '🚀👔👋🔙💰🇺🇸🇪🇺🇯🇵🇰🇷🇹🇼🇮🇳🔒👀⬆️⬇️🔔🔁👆✍️📈🟢🔥💥'),
]);
const L = (u => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = u; }));
const logo = await L('/brand/logo-dark.png'), mark = await L('/brand/logo-transparent.png');

// ---------- helpers ----------
const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), pr = (t, a, b) => cl((t - a) / (b - a));
const eo = v => 1 - Math.pow(1 - v, 3), eio = v => v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2;
const eb = v => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(v - 1, 3) + c1 * Math.pow(v - 1, 2); };
const LS = i => tl.lines[i].start, LE = i => tl.lines[i].end;
const NSEG = tl.lines.length;
const wt = (i, key, d = 0) => { const w = tl.lines[i].words.find(w => w.w.toLowerCase().replace(/[^a-z0-9₹%.]/g, '').startsWith(key.toLowerCase())); return w ? w.s : LS(i) + d * (LE(i) - LS(i)); };
const segStart = i => i === 0 ? 0 : LS(i) - 0.12;
const seg = t => { let i = 0; for (let k = 0; k < NSEG; k++) if (t >= segStart(k)) i = k; return i; };
const rnd = (() => { let s = 77; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })();
function rr(X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
const AN = s => `400 ${s}px Anton, "Noto Color Emoji", sans-serif`, KA = s => `700 ${s}px Kalam, "Noto Color Emoji", sans-serif`, IN = (w, s) => `${w} ${s}px Inter, "Noto Color Emoji", sans-serif`;
function TX(s, X, Y, o = {}) {
  const { font = AN(100), c = '#fff', a = 'center', sc = 1, alpha = 1, rot = 0, stroke = null, maxW = 1000, ls = 0, glow = 0 } = o;
  if (sc <= 0 || alpha <= 0) return;
  x.save(); x.globalAlpha *= cl(alpha); x.font = font; if (ls) x.letterSpacing = ls + 'px';
  let k = 1; const m = x.measureText(s).width; if (m > maxW) k = maxW / m;
  x.translate(X, Y); x.rotate(rot); x.scale(sc * k, sc * k); x.textAlign = a; x.textBaseline = 'middle';
  if (glow) { x.shadowColor = typeof glow === 'string' ? glow : c; x.shadowBlur = 40; }
  if (stroke) { x.lineWidth = stroke[1]; x.strokeStyle = stroke[0]; x.lineJoin = 'round'; x.strokeText(s, 0, 0); }
  if (c) { x.fillStyle = c; x.fillText(s, 0, 0); }
  x.restore();
}
const GREEN = '#22c55e', GOLD = '#f4cf6a', RED = '#ef4444';

// ---------- KINETIC background (oversized so camera moves never show edges) ----------
function kineticBg(t, tint = 'rgba(34,197,94,0.16)') {
  x.fillStyle = '#0b0b0d'; x.fillRect(-300, -300, W + 600, H + 600);
  x.strokeStyle = 'rgba(255,255,255,0.045)'; x.lineWidth = 1;
  for (let i = -300; i <= W + 300; i += 60) { x.beginPath(); x.moveTo(i, -300); x.lineTo(i, H + 300); x.stroke(); }
  for (let j = -300 + (t * 45) % 60; j <= H + 300; j += 60) { x.beginPath(); x.moveTo(-300, j); x.lineTo(W + 300, j); x.stroke(); }
  const g = x.createRadialGradient(540, 760, 0, 540, 760, 1000); g.addColorStop(0, tint); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(-300, -300, W + 600, H + 600);
}
// rising green sparks
const sparks = Array.from({ length: 70 }, () => ({ x: rnd() * W, s: 0.4 + rnd() * 0.9, sz: 3 + rnd() * 6, ph: rnd() * 10 }));
function sparkField(t, col = 'rgba(74,222,128,', amt = 1) {
  sparks.forEach((p, i) => { if (i / sparks.length > amt) return; const y = H + 100 - ((t * 260 * p.s + p.ph * 200) % (H + 300)); const a = 0.25 + 0.5 * Math.abs(Math.sin(t * 3 + p.ph));
    x.fillStyle = col + a + ')'; x.beginPath(); x.arc(p.x + Math.sin(t + p.ph) * 20, y, p.sz, 0, 7); x.fill(); });
}
// green candles growing from bottom
const candles = Array.from({ length: 16 }, (_, i) => ({ h: 120 + i * 38 + rnd() * 120, w: 40 }));
function candleField(t, t0, alpha = 0.35) {
  candles.forEach((c, i) => { const p = eo(pr(t, t0 + i * 0.05, t0 + 0.6 + i * 0.05)); if (p <= 0) return; const X = 20 + i * 68, h = c.h * p;
    x.globalAlpha = alpha; x.fillStyle = GREEN; x.fillRect(X, H - 260 - h, c.w, h); x.fillRect(X + c.w / 2 - 3, H - 300 - h, 6, h + 80); x.globalAlpha = 1; });
}
// rising green line (decor)
const risePts = Array.from({ length: 26 }, (_, i) => [i / 25, 0.92 - (i / 25) * 0.8 + (rnd() - 0.5) * 0.1]);
function riseLine(p, X0, Y0, w, h, col = GREEN, lw = 10) {
  const n = Math.max(2, Math.floor(risePts.length * p));
  x.save(); x.strokeStyle = col; x.lineWidth = lw; x.lineJoin = 'round'; x.shadowColor = col; x.shadowBlur = 25;
  x.beginPath(); for (let i = 0; i < n; i++) { const [a, b] = risePts[i]; const X = X0 + a * w, Y = Y0 + b * h; i ? x.lineTo(X, Y) : x.moveTo(X, Y); } x.stroke(); x.restore();
}
// ---------- WHITEBOARD helpers ----------
function boardBg(t, w = W) {
  x.fillStyle = '#fbfbf7'; x.fillRect(-300, -300, w + 600, H + 600);
  x.strokeStyle = 'rgba(30,64,175,0.05)'; x.lineWidth = 2; for (let j = -300; j < H + 300; j += 70) { x.beginPath(); x.moveTo(-300, j); x.lineTo(w + 300, j); x.stroke(); }
  x.fillStyle = 'rgba(0,0,0,0.025)'; for (let i = 0; i < 6 * w / W; i++) { x.beginPath(); x.ellipse(150 + i * 170, 1250 + (i % 2) * 120, 160, 50, 0.2, 0, 7); x.fill(); }
}
const jit = new Map();
function jpts(key, pts, amp = 3) { if (!jit.has(key)) jit.set(key, pts.map(([a, b]) => [a + (rnd() - 0.5) * amp, b + (rnd() - 0.5) * amp])); return jit.get(key); }
function sketch(key, pts, p, col, lw = 7) {
  if (p <= 0) return; const P = jpts(key, pts); let tot = 0; const sl = []; for (let i = 1; i < P.length; i++) { const d = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); sl.push(d); tot += d; }
  let rem = tot * cl(p); x.save(); x.strokeStyle = col; x.lineWidth = lw; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath(); x.moveTo(P[0][0], P[0][1]);
  for (let i = 1; i < P.length && rem > 0; i++) { const d = sl[i - 1]; const f = Math.min(1, rem / d); x.lineTo(P[i - 1][0] + (P[i][0] - P[i - 1][0]) * f, P[i - 1][1] + (P[i][1] - P[i - 1][1]) * f); rem -= d; }
  x.stroke(); x.restore();
}
const boxPts = (X, Y, w, h) => [[X, Y], [X + w, Y + 2], [X + w - 2, Y + h], [X + 2, Y + h - 1], [X, Y - 4]];
function arrow(key, x1, y1, x2, y2, p, col = '#111', bend = -60) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + bend;
  const pts = Array.from({ length: 16 }, (_, i) => { const u = i / 15; return [(1 - u) * (1 - u) * x1 + 2 * (1 - u) * u * mx + u * u * x2, (1 - u) * (1 - u) * y1 + 2 * (1 - u) * u * my + u * u * y2]; });
  sketch(key, pts, p, col, 6);
  if (p > 0.95) { const [ax, ay] = pts[14]; const a = Math.atan2(y2 - ay, x2 - ax); sketch(key + 'h', [[x2 - 34 * Math.cos(a - 0.5), y2 - 34 * Math.sin(a - 0.5)], [x2, y2], [x2 - 34 * Math.cos(a + 0.5), y2 - 34 * Math.sin(a + 0.5)]], 1, col, 6); }
}
function write(s, X, Y, size, col, p, o = {}) {
  if (p <= 0) return; const { a = 'center', maxW = 960 } = o; x.save(); x.font = KA(size); let k = 1; const m = x.measureText(s).width; if (m > maxW) k = maxW / m;
  const w = m * k, x0 = a === 'center' ? X - w / 2 : X; x.beginPath(); x.rect(x0 - 10, Y - size, (w + 20) * cl(p), size * 2); x.clip();
  x.translate(x0, Y); x.scale(k, k); x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillStyle = col; x.fillText(s, 0, 0); x.restore();
  if (p < 1) { x.font = IN(400, 70); x.textAlign = 'center'; x.fillText('✍️', x0 + w * p + 20, Y + 20); }
}
const BLUE = '#1d4ed8', BRED = '#dc2626', BGREEN = '#16a34a', INK = '#111';

// ---------- virtual camera per segment ----------
// base: slow push-in + drift; punches: quick zoom kick at key words; shakes: impact jolts
const PUNCH = [], SHAKE = [];
function cam(t, i) {
  const k = pr(t, LS(i), LE(i) + 0.2);
  let s = 1 + 0.06 * eio(k), dx = Math.sin(t * 0.7 + i) * 10, dy = Math.cos(t * 0.5 + i) * 8, r = Math.sin(t * 0.4 + i * 2) * 0.006;
  PUNCH.forEach(([pt, amt]) => { const d = t - pt; if (d > 0 && d < 0.5) s += amt * Math.exp(-d * 9) * Math.sin(Math.min(d * 18, Math.PI / 2) + 0.0); });
  SHAKE.forEach(([st, amt]) => { const d = t - st; if (d > 0 && d < 0.45) { const e = (1 - d / 0.45) * amt; dx += Math.sin(t * 90) * e; dy += Math.cos(t * 77) * e * 0.7; r += Math.sin(t * 60) * e * 0.0008; } });
  return { s, dx, dy, r };
}
function withCam(t, i, fn) {
  const c = cam(t, i);
  x.save(); x.translate(540 + c.dx, 900 + c.dy); x.rotate(c.r); x.scale(c.s, c.s); x.translate(-540, -900); fn(t); x.restore();
}

// ---------- segments ----------
const SEG = [];
// 0 HOOK — kinetic. Frame 0 already shows the full hook (cover).
const H0 = { ud: wt(0, 'ud'), nv: wt(0, 'nvidia'), aaya: wt(0, 'aaya') };
PUNCH.push([H0.aaya, 0.07], [H0.nv, 0.06], [H0.ud, 0.14]); SHAKE.push([H0.ud, 22]);
SEG[0] = t => {
  kineticBg(t, `rgba(34,197,94,${0.12 + 0.12 * pr(t, H0.ud - 0.2, H0.ud + 0.3)})`);
  sparkField(t, 'rgba(74,222,128,', 0.3 + 0.7 * pr(t, H0.ud - 0.2, H0.ud + 0.4));
  riseLine(eo(pr(t, 0, H0.ud + 0.6)), 40, 420, 1000, 900, 'rgba(34,197,94,0.5)', 8);
  TX('23 NOV 2026 · RAAT', 540, 300, { font: AN(62), c: GOLD, ls: 8 });
  // "1 CEO WAPAS" pill
  const sp = 1 + 0.03 * Math.sin(t * 6);
  x.save(); x.translate(540, 470); x.scale(sp, sp); x.fillStyle = '#ffffff'; rr(-380, -78, 760, 156, 26); x.fill(); TX('1 CEO WAPAS AAYA 👔', 0, 6, { font: AN(92), c: '#0b0b0d', maxW: 700 }); x.restore();
  TX('NVIDIA', 540, 640, { font: AN(130), c: null, stroke: ['#ffffff', 5] });
  // +31% (full from frame 0; pulses & glows on "ud")
  const g = pr(t, H0.ud - 0.1, H0.ud + 0.2), pulse = 1 + 0.12 * Math.exp(-Math.max(0, t - H0.ud) * 4) * (t > H0.ud ? 1 : 0);
  TX('+31%', 540, 920, { font: AN(320), c: GREEN, sc: pulse, glow: g > 0 ? GREEN : 0 });
  // rocket flies up after "ud"
  const rk = pr(t, H0.ud, H0.ud + 1.1);
  if (rk > 0 && rk < 1) { const ry = 1250 - eio(rk) * 1300; TX('🚀', 820 + rk * 80, ry, { font: IN(400, 170), rot: -0.35 });
    for (let k = 0; k < 8; k++) { x.fillStyle = `rgba(255,180,60,${0.5 - k * 0.06})`; x.beginPath(); x.arc(760 + rk * 80 - k * 6, ry + 90 + k * 34, 18 - k * 1.6, 0, 7); x.fill(); } }
  TX('ek raat mein 😱', 540, 1200, { font: AN(84), c: '#fff', sc: Math.max(0.001, eb(pr(t, wt(0, 'raat', 0.5) - 0.15, wt(0, 'raat', 0.5) + 0.2))) });
};
// 1 STORY — whiteboard timeline, camera pans left→right along it
const S1 = { n11: wt(1, '11'), res: wt(1, 'resign'), n23: wt(1, '23'), wap: wt(1, 'wapas'), bul: wt(1, 'bula') };
PUNCH.push([S1.wap, 0.08]);
SEG[1] = t => {
  const pan = eio(pr(t, S1.n23 - 0.6, S1.n23 + 0.4));
  x.save(); x.translate(-560 * pan, 0);
  boardBg(t, W + 600);
  write('Kahani 12 din ki 📅', 540, 300, 70, BLUE, pr(t, LS(1), LS(1) + 0.8));
  sketch('tl', [[100, 900], [1560, 904]], pr(t, LS(1), S1.n23 + 0.3), INK, 7);
  // 11 Nov: resign
  sketch('b11', boxPts(80, 440, 480, 330), pr(t, S1.n11 - 0.3, S1.n11 + 0.2), INK);
  write('11 NOV', 320, 530, 96, INK, pr(t, S1.n11, S1.n11 + 0.4)); write('CEO Resign 👋', 320, 670, 72, BRED, pr(t, S1.res - 0.3, S1.res + 0.3));
  sketch('dn', [[160, 960], [250, 1010], [320, 990], [410, 1110], [480, 1090], [560, 1240]], pr(t, S1.res + 0.1, S1.res + 0.9), BRED, 9);
  write('Share girta raha 📉', 360, 1330, 64, BRED, pr(t, S1.res + 0.4, S1.res + 1.0));
  arrow('ar', 560, 600, 1010, 600, pr(t, S1.n23 - 0.5, S1.n23 - 0.05), INK, -90);
  // 23 Nov: back
  sketch('b23', boxPts(1020, 430, 500, 350), pr(t, S1.n23 - 0.2, S1.n23 + 0.25), BGREEN, 8);
  write('23 NOV', 1270, 525, 96, INK, pr(t, S1.n23, S1.n23 + 0.4)); write('WAPAS! 🔙', 1270, 680, 96, BGREEN, pr(t, S1.wap - 0.1, S1.wap + 0.3));
  sketch('up', [[1080, 1240], [1160, 1150], [1230, 1180], [1310, 1050], [1390, 1070], [1480, 940]], pr(t, S1.bul, S1.bul + 0.7), BGREEN, 9);
  write('Board ne bulaya 🤝', 1270, 1330, 64, BGREEN, pr(t, S1.bul - 0.2, S1.bul + 0.4));
  x.restore();
};
// 2 $950 BILLION — kinetic counter + coin rain, zoom-out reveal
const S2 = { b: wt(2, '950'), bad: wt(2, 'badhe') };
PUNCH.push([S2.bad, 0.12]); SHAKE.push([S2.bad, 14]);
const coins = Array.from({ length: 26 }, () => ({ x: rnd() * W, d: rnd() * 0.8, sp: 0.8 + rnd() * 0.6, r: rnd() * 6 }));
SEG[2] = t => {
  kineticBg(t, 'rgba(244,207,106,0.18)');
  coins.forEach(c => { const k = (t - S2.b - c.d) * c.sp; if (k < 0) return; const y = -100 + ((k * 900) % (H + 200)); TX('💰', c.x, y, { font: IN(400, 70), rot: c.r + k * 3, alpha: 0.75 }); });
  TX('EK DIN MEIN', 540, 470, { font: AN(110), c: '#fff', sc: eb(pr(t, LS(2), LS(2) + 0.3)) });
  const v = Math.round(950 * eo(pr(t, S2.b - 0.1, S2.bad + 0.2)));
  TX('$' + v, 540, 760, { font: AN(340), c: GOLD, glow: GOLD });
  TX('BILLION', 540, 1000, { font: AN(170), c: null, stroke: [GOLD, 6], sc: eb(pr(t, S2.b + 0.2, S2.b + 0.5)) });
  const ch = eb(pr(t, S2.bad + 0.1, S2.bad + 0.4));
  if (ch > 0) { x.save(); x.translate(540, 1210); x.scale(ch, ch); x.fillStyle = GREEN; rr(-410, -62, 820, 124, 62); x.fill(); TX('2003 ke baad sabse bada din 🔥', 0, 4, { font: IN(900, 44), c: '#0b0b0d', maxW: 760 }); x.restore(); }
};
// 3 US — three rows slam in with counters, candles grow
const S3 = { nq: wt(3, 'nasdaq'), sp: wt(3, 's&p', 0.5), dw: wt(3, 'dow'), dh: wt(3, 'dhamaka') };
PUNCH.push([S3.nq, 0.06], [S3.sp, 0.05], [S3.dw, 0.05]);
SEG[3] = t => {
  kineticBg(t, 'rgba(34,197,94,0.14)'); candleField(t, LS(3) + 0.1, 0.22);
  TX('🇺🇸 WALL STREET', 540, 300, { font: AN(110), c: '#fff', sc: eb(pr(t, LS(3), LS(3) + 0.3)) });
  TX('DHAMAKA 💥', 540, 420, { font: AN(90), c: GOLD, sc: eb(pr(t, S3.dh, S3.dh + 0.3)) });
  const row = (label, val, Y, at, sub) => {
    const p = eo(pr(t, at - 0.15, at + 0.3)), X = 540 + (1 - p) * 900;
    if (p <= 0) return;
    x.save(); x.globalAlpha = p; x.fillStyle = 'rgba(34,197,94,0.10)'; rr(X - 470, Y - 125, 940, 250, 30); x.fill(); x.strokeStyle = 'rgba(34,197,94,0.6)'; x.lineWidth = 3; x.stroke(); x.restore();
    TX(label, X - 430, Y - 60, { font: IN(900, 44), c: '#9ca3af', a: 'left', ls: 5, alpha: p });
    TX(sub, X - 430, Y + 50, { font: IN(700, 34), c: '#9ca3af', a: 'left', alpha: p });
    const v = '+' + (val * eo(pr(t, at, at + 0.7))).toFixed(2) + '%';
    TX(v, X + 430, Y + 5, { font: AN(160), c: GREEN, a: 'right', alpha: p });
    TX('▲', X + 30, Y + 5 - Math.abs(Math.sin(t * 6)) * 12, { font: IN(900, 70), c: GREEN, alpha: p });
  };
  row('NASDAQ', 6.51, 640, S3.nq, '24,090');
  row('S&P 500', 4.73, 930, S3.sp, '7,237');
  row('DOW', 3.01, 1220, S3.dw, '49,595 · +1,448 pts');
};
// 4 WORLD — wide whiteboard "map"; camera flies US → Europe → Asia
const S4 = { eu: wt(4, 'europe'), jp: wt(4, 'japan'), kr: wt(4, 'korea'), tw: wt(4, 'taiwan'), aag: wt(4, 'aag') };
PUNCH.push([S4.tw, 0.1]); SHAKE.push([S4.tw + 0.3, 10]);
const NODES = { us: [310, 520], eu: [770, 900], jp: [310, 1280], kr: [770, 1660], tw: [540, 2080] };
SEG[4] = t => {
  // vertical camera: follows each country as it is spoken, then zooms out to show all
  const Z = 1.1, keys = [[LS(4) - 0.2, 520, Z], [S4.eu - 0.45, 520, Z], [S4.eu - 0.1, 900, Z], [S4.jp - 0.45, 900, Z], [S4.jp - 0.1, 1280, Z], [S4.kr - 0.45, 1280, Z], [S4.kr - 0.1, 1660, Z], [S4.tw - 0.45, 1660, Z], [S4.tw - 0.1, 2060, Z], [S4.tw + 0.75, 2060, Z], [LE(4) + 0.25, 1300, 0.6]];
  let cy = keys[0][1], z = 1;
  for (let k = 0; k < keys.length - 1; k++) { const [t0, a, za] = keys[k], [t1, b, zb] = keys[k + 1]; if (t >= t0) { const e = eio(pr(t, t0, t1)); cy = a + (b - a) * e; z = za + (zb - za) * e; } }
  x.save(); x.beginPath(); x.rect(-300, 290, W + 600, H); x.clip(); x.translate(540, 860); x.scale(z, z); x.translate(-540, -cy);
  boardBg(t); x.fillStyle = '#fbfbf7'; x.fillRect(-900, -600, W + 1800, 3600);
  x.strokeStyle = 'rgba(30,64,175,0.05)'; x.lineWidth = 2; for (let j = -600; j < 3000; j += 70) { x.beginPath(); x.moveTo(-900, j); x.lineTo(W + 900, j); x.stroke(); }
  const box = (key, [X, Y], flag, val, col, at, big = false) => {
    const w = big ? 600 : 470, h = big ? 330 : 270;
    sketch('bx' + key, boxPts(X - w / 2, Y - h / 2, w, h), pr(t, at - 0.45, at - 0.05), col, big ? 9 : 7);
    write(flag, X, Y - h / 2 + 75, big ? 80 : 64, INK, pr(t, at - 0.3, at + 0.1), { maxW: w - 40 });
    write(val, X, Y + 50, big ? 150 : 110, col, pr(t, at - 0.1, at + 0.3), { maxW: w - 40 });
  };
  box('us', NODES.us, '🇺🇸 USA', 'Nasdaq +6.5%', BGREEN, LS(4) + 0.3);
  arrow('a1', 530, 560, 640, 760, pr(t, S4.eu - 0.6, S4.eu - 0.3), BGREEN, -60);
  box('eu', NODES.eu, '🇪🇺 Europe', '+2%', BGREEN, S4.eu);
  arrow('a2', 560, 950, 440, 1140, pr(t, S4.jp - 0.6, S4.jp - 0.3), BGREEN, -40);
  box('jp', NODES.jp, '🇯🇵 Japan', '+3.9%', BGREEN, S4.jp);
  arrow('a3', 530, 1320, 640, 1520, pr(t, S4.kr - 0.6, S4.kr - 0.3), BGREEN, -60);
  box('kr', NODES.kr, '🇰🇷 Korea', '+6.3%', BGREEN, S4.kr);
  write('Kospi phir 5,000 paar', 770, 1840, 46, BLUE, pr(t, S4.kr + 0.3, S4.kr + 0.9));
  arrow('a4', 620, 1800, 560, 1900, pr(t, S4.tw - 0.55, S4.tw - 0.3), BRED, -30);
  box('tw', NODES.tw, '🇹🇼 Taiwan', '+9% 🚀', BRED, S4.tw, true);
  const cp = pr(t, S4.tw + 0.25, S4.tw + 0.85);
  sketch('circ', Array.from({ length: 30 }, (_, i) => { const a = i / 29 * Math.PI * 2.15; return [NODES.tw[0] + Math.cos(a) * 360, NODES.tw[1] + Math.sin(a) * 230]; }), cp, BRED, 8);
  x.restore();
  // fixed title on top
  x.fillStyle = '#fbfbf7'; x.fillRect(-300, -300, W + 600, 590);
  write('Duniya mein AAG 🔥', 540, 225, 78, BRED, pr(t, LS(4) - 0.1, LS(4) + 0.6));
};
// 5 INDIA — kinetic: question → BAND stamp slam → 25 NOV card
const S5 = { in: wt(5, 'india'), band: wt(5, 'band'), n25: wt(5, '25'), dk: wt(5, 'dikhega') };
PUNCH.push([S5.in, 0.06], [S5.band, 0.12], [S5.n25, 0.07]); SHAKE.push([S5.band + 0.08, 20]);
SEG[5] = t => {
  kineticBg(t, 'rgba(244,207,106,0.14)');
  TX('PAR INDIA? 🇮🇳', 540, 380, { font: AN(140), c: '#fff', sc: eb(pr(t, S5.in - 0.1, S5.in + 0.3)) });
  // stamp: falls from big scale to 1
  const st = pr(t, S5.band - 0.05, S5.band + 0.18);
  if (st > 0) { const sc = 1 + 1.6 * (1 - eo(st)); x.save(); x.translate(540, 720); x.rotate(-0.08); x.scale(sc, sc); x.globalAlpha = cl(st * 2);
    x.strokeStyle = RED; x.lineWidth = 16; rr(-360, -130, 720, 260, 30); x.stroke(); TX('BAND 🔒', 0, 10, { font: AN(190), c: RED }); x.restore(); }
  TX('24 NOV · Guru Nanak Jayanti', 540, 930, { font: IN(800, 48), c: '#9ca3af', alpha: pr(t, S5.band + 0.2, S5.band + 0.5) });
  const cd = eb(pr(t, S5.n25 - 0.15, S5.n25 + 0.25));
  if (cd > 0) { x.save(); x.translate(540, 1170); x.scale(cd, cd); x.fillStyle = '#16181d'; rr(-440, -150, 880, 300, 34); x.fill(); x.strokeStyle = GOLD; x.lineWidth = 6; x.stroke();
    TX('ASLI ASAR', 0, -70, { font: IN(900, 46), c: '#9ca3af', ls: 6 }); TX('25 NOV 👀', 0, 40, { font: AN(150), c: GOLD }); x.restore(); }
};
// 6 CTA — two big vote buttons + logo ring + loop line
const S6 = { up: wt(6, 'upar'), ne: wt(6, 'neeche'), c1: wt(6, '1'), c2: wt(6, '2'), fin: wt(6, 'finance') };
PUNCH.push([S6.c1, 0.05], [S6.c2, 0.05]);
SEG[6] = t => {
  kineticBg(t, 'rgba(212,166,44,0.16)'); sparkField(t, 'rgba(244,207,106,', 0.5);
  TX('25 NOV: NIFTY?', 540, 330, { font: AN(130), c: '#fff', sc: eb(pr(t, LS(6), LS(6) + 0.3)) });
  const btn = (Y, txt, col, at) => { const p = eb(pr(t, at - 0.1, at + 0.3)); if (p <= 0) return; const pu = 1 + 0.04 * Math.sin(t * 8 + Y);
    x.save(); x.translate(540, Y); x.scale(p * pu, p * pu); x.shadowColor = col; x.shadowBlur = 40; x.fillStyle = col; rr(-400, -100, 800, 200, 40); x.fill(); x.shadowColor = 'transparent';
    TX(txt, 0, 6, { font: AN(110), c: '#0b0b0d', maxW: 740 }); x.restore(); };
  btn(560, '⬆️ UPAR = 1', GREEN, S6.up); btn(810, '⬇️ NEECHE = 2', RED, S6.ne);
  TX('Comment karo 👇', 540, 990, { font: AN(80), c: '#fff', sc: eb(pr(t, S6.c1, S6.c1 + 0.3)) });
  const lp = eb(pr(t, S6.fin - 0.2, S6.fin + 0.4));
  if (lp > 0) { x.save(); x.translate(540, 1230); x.scale(lp, lp); x.strokeStyle = 'rgba(244,207,106,0.8)'; x.lineWidth = 5; x.beginPath(); x.arc(0, 0, 170, t * 2, t * 2 + Math.PI * 1.3); x.stroke(); x.drawImage(logo, -150, -150, 300, 300); x.restore(); }
};
const KIN = new Set([0, 2, 3, 5, 6]);

// ---------- chrome: captions, footer, brand ----------
const chunks = []; tl.lines.forEach(Ln => { let cur = []; Ln.words.forEach((w, i) => { cur.push(w); const ch = cur.map(c => c.w).join(' ').length; if (cur.length >= 4 || ch >= 24 || (/[.,!?…:]$/.test(w.w) && cur.length >= 2) || i === Ln.words.length - 1) { chunks.push(cur); cur = []; } }); });
chunks.forEach((c, i) => { c.s = c[0].s - 0.05; c.e = i + 1 < chunks.length ? Math.min(chunks[i + 1][0].s - 0.05, c[c.length - 1].e + 0.7) : c[c.length - 1].e + 0.6; });
function captions(t) {
  const c = chunks.find(c => t >= c.s && t < c.e); if (!c) return;
  const pop = 1 + 0.08 * (1 - eo(pr(t, c.s, c.s + 0.15)));
  x.font = IN(800, 48); const sp = x.measureText(' ').width, ws = c.map(w => x.measureText(w.w).width), tw = ws.reduce((a, b) => a + b, 0) + sp * (c.length - 1);
  const pw = tw + 60, Y = 1478; x.save(); x.translate(540, Y); x.scale(pop, pop); x.translate(-540, -Y);
  const X = 540 - pw / 2; x.globalAlpha = Math.min(pr(t, c.s, c.s + 0.08), 1 - pr(t, c.e - 0.08, c.e));
  rr(X, Y - 44, pw, 88, 20); x.fillStyle = 'rgba(12,12,16,0.94)'; x.fill(); x.strokeStyle = 'rgba(244,207,106,0.5)'; x.lineWidth = 2; x.stroke();
  let cx = X + 30; x.textBaseline = 'middle'; x.textAlign = 'left'; const last = c.findLastIndex(q => t >= q.s);
  c.forEach((w, i) => { x.fillStyle = t >= w.s ? (i === last ? GOLD : '#fff') : '#6b7280'; x.fillText(w.w, cx, Y + 3); cx += ws[i] + sp; }); x.restore(); x.globalAlpha = 1;
}
function footer(t) {
  const Y = 1610, big = t >= LS(6), k = big ? 1 + 0.2 * eb(pr(t, LS(6) + 0.4, LS(6) + 0.9)) : 1, slot = Math.floor(t / 2.4) % 2, ph = (t % 2.4) / 2.4;
  const btn = (X, label, bg, active) => { const pz = active && ph > 0.35 && ph < 0.5 ? 0.9 : 1, pu = active ? 1 + 0.06 * Math.max(0, Math.sin(ph * Math.PI * 2)) : 1;
    x.save(); x.translate(X, Y); x.scale(k * pz * pu, k * pz * pu); x.font = IN(900, 40); const w = x.measureText(label).width + 66;
    x.shadowColor = active ? bg : 'rgba(0,0,0,0.35)'; x.shadowBlur = active ? 30 : 10; rr(-w / 2, -38, w, 76, 38); x.fillStyle = bg; x.fill(); x.shadowColor = 'transparent';
    x.strokeStyle = 'rgba(0,0,0,0.15)'; x.lineWidth = 2; x.stroke(); x.fillStyle = '#0b1020'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(label, 0, 3);
    if (active && ph > 0.4 && ph < 0.75) { const r = (ph - 0.4) / 0.35; x.globalAlpha = 1 - r; x.strokeStyle = bg; x.lineWidth = 6; rr(-w / 2 - r * 30, -38 - r * 30, w + r * 60, 76 + r * 60, 38 + r * 30); x.stroke(); }
    x.restore(); };
  btn(big ? 320 : 360, '🔔 FOLLOW', GOLD, slot === 0); btn(big ? 760 : 720, '🔁 REPOST', '#ffffff', slot === 1);
  x.font = IN(400, 60); x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('👆', slot === 0 ? (big ? 375 : 415) : (big ? 815 : 775), Y + 58 - (ph > 0.35 && ph < 0.5 ? 0 : 16));
}
function chrome(t, dark) {
  x.save(); rr(48, 56, 92, 92, 22); x.fillStyle = '#fff'; x.fill(); x.drawImage(mark, 250, 75, 755, 755, 58, 66, 72, 72); x.restore();
  x.font = IN(900, 28); x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillStyle = dark ? '#f8fafc' : '#0b2545'; x.fillText('FINANCE JUNCTION', 156, 102);
  x.font = '500 24px "JetBrains Mono", monospace'; x.textAlign = 'right'; x.fillStyle = dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'; x.fillText('not advice', 1030, 102);
  x.fillStyle = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'; x.fillRect(0, 0, W, 8); x.fillStyle = GREEN; x.fillRect(0, 0, W * cl(t / tl.total), 8);
}
// whip-pan transition: previous slides out left, new slides in from right, with motion streaks
const TR = 0.34;
window.renderFrame = t => {
  x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1;
  const i = seg(t);
  const t0 = segStart(i), p = i > 0 ? eio(pr(t, t0, t0 + TR)) : 1;
  if (p < 1) {
    x.save(); x.translate(-W * p, 0); withCam(t, i - 1, SEG[i - 1]); x.restore();
    x.save(); x.translate(W * (1 - p), 0); withCam(t, i, SEG[i]); x.restore();
    const a = Math.sin(Math.PI * p);
    x.globalAlpha = 0.55 * a; x.fillStyle = KIN.has(i) ? GREEN : GOLD;
    for (let k = 0; k < 14; k++) { const yy = (k * 151 + i * 37) % H; x.fillRect(0, yy, W, 3 + (k % 3) * 3); }
    x.globalAlpha = 0.25 * a; x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); x.globalAlpha = 1;
  } else withCam(t, i, SEG[i]);
  const dark = KIN.has(i);
  captions(t); footer(t); chrome(t, dark);
};
window.DUR = tl.total; renderFrame(0); window.READY = true;
