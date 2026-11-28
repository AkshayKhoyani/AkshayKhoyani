// 23 Nov 2026 crash reel — Style 3 (Kinetic Typography) + Style 8 (Whiteboard Sketch). Voice: Bunty (ElevenLabs v4).
// Facts: ../CRASH_FINAL_CONTENT.md (closing data, multiple sources).
const W = 1080, H = 1920;
const tl = await (await fetch('./timeline.json')).json();
const out = document.createElement('canvas'); out.width = W; out.height = H; out.id = 'out'; document.body.appendChild(out);
const x = out.getContext('2d');
const ff = (fam, url, weight = '400') => new FontFace(fam, `url(${url})`, { weight }).load().then(f => document.fonts.add(f));
await Promise.all([
  ff('Anton', '/engine/node_modules/@fontsource/anton/files/anton-latin-400-normal.woff2'),
  ff('Kalam', '/engine/node_modules/@fontsource/kalam/files/kalam-latin-700-normal.woff2', '700'),
  ...['900', '800', '700'].map(w => document.fonts.load(`${w} 40px Inter`)),
  document.fonts.load('40px "Noto Color Emoji"', '😱🌍🇺🇸🇰🇷🇮🇳📉📈💰💸🏦⛏️🤝🟢👀👇🔔🔁👆✍️'),
]);
const L = (u => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = u; }));
const logo = await L('/brand/logo-dark.png'), mark = await L('/brand/logo-transparent.png');

// ---------- helpers ----------
const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), pr = (t, a, b) => cl((t - a) / (b - a));
const eo = v => 1 - Math.pow(1 - v, 3), eio = v => v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2;
const eb = v => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(v - 1, 3) + c1 * Math.pow(v - 1, 2); };
const LS = i => tl.lines[i].start, LE = i => tl.lines[i].end;
const wt = (i, key, d = 0) => { const w = tl.lines[i].words.find(w => w.w.toLowerCase().replace(/[^a-z0-9₹%]/g, '').startsWith(key.toLowerCase())); return w ? w.s : LS(i) + d * (LE(i) - LS(i)); };
const seg = t => { let i = tl.lines.findIndex(l => t < l.end + 0.12); return i < 0 ? tl.lines.length - 1 : i; };
const rnd = (() => { let s = 99; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })();
function rr(X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
const AN = s => `400 ${s}px Anton, "Noto Color Emoji", sans-serif`, KA = s => `700 ${s}px Kalam, "Noto Color Emoji", sans-serif`, IN = (w, s) => `${w} ${s}px Inter, "Noto Color Emoji", sans-serif`;
function TX(s, X, Y, o = {}) {
  const { font = AN(100), c = '#fff', a = 'center', sc = 1, alpha = 1, rot = 0, stroke = null, maxW = 1000, ls = 0 } = o;
  if (sc <= 0 || alpha <= 0) return;
  x.save(); x.globalAlpha *= cl(alpha); x.font = font; if (ls) x.letterSpacing = ls + 'px';
  let k = 1; const m = x.measureText(s).width; if (m > maxW) k = maxW / m;
  x.translate(X, Y); x.rotate(rot); x.scale(sc * k, sc * k); x.textAlign = a; x.textBaseline = 'middle';
  if (stroke) { x.lineWidth = stroke[1]; x.strokeStyle = stroke[0]; x.lineJoin = 'round'; x.strokeText(s, 0, 0); }
  if (c) { x.fillStyle = c; x.fillText(s, 0, 0); }
  x.restore();
}
// ---------- KINETIC background ----------
function kineticBg(t, tint = 'rgba(239,68,68,0.10)') {
  x.fillStyle = '#0b0b0d'; x.fillRect(0, 0, W, H);
  x.strokeStyle = 'rgba(255,255,255,0.045)'; x.lineWidth = 1;
  for (let i = 0; i <= W; i += 60) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, H); x.stroke(); }
  for (let j = (t * 30) % 60; j <= H; j += 60) { x.beginPath(); x.moveTo(0, j); x.lineTo(W, j); x.stroke(); }
  const g = x.createRadialGradient(540, 760, 0, 540, 760, 900); g.addColorStop(0, tint); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
}
// falling red chart line (decor)
const crashPts = Array.from({ length: 24 }, (_, i) => [i / 23, 0.15 + (i / 23) * 0.75 + (rnd() - 0.5) * 0.12]);
function crashLine(p, X0, Y0, w, h, col = '#ef4444', lw = 10) {
  const n = Math.max(2, Math.floor(crashPts.length * p));
  x.save(); x.strokeStyle = col; x.lineWidth = lw; x.lineJoin = 'round'; x.shadowColor = col; x.shadowBlur = 25;
  x.beginPath(); for (let i = 0; i < n; i++) { const [a, b] = crashPts[i]; const X = X0 + a * w, Y = Y0 + b * h; i ? x.lineTo(X, Y) : x.moveTo(X, Y); } x.stroke(); x.restore();
}
// ---------- WHITEBOARD helpers ----------
function boardBg(t) {
  x.fillStyle = '#fbfbf7'; x.fillRect(0, 0, W, H);
  x.strokeStyle = 'rgba(30,64,175,0.05)'; x.lineWidth = 2; for (let j = 0; j < H; j += 70) { x.beginPath(); x.moveTo(0, j); x.lineTo(W, j); x.stroke(); }
  x.fillStyle = 'rgba(0,0,0,0.025)'; for (let i = 0; i < 6; i++) { x.beginPath(); x.ellipse(150 + i * 170, 1250 + (i % 2) * 120, 160, 50, 0.2, 0, 7); x.fill(); }
}
const jit = new Map();
function jpts(key, pts, amp = 3) { if (!jit.has(key)) jit.set(key, pts.map(([a, b]) => [a + (rnd() - 0.5) * amp, b + (rnd() - 0.5) * amp])); return jit.get(key); }
function sketch(key, pts, p, col, lw = 7) { // draw polyline progressively (marker)
  if (p <= 0) return; const P = jpts(key, pts); let tot = 0; const seglen = []; for (let i = 1; i < P.length; i++) { const d = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); seglen.push(d); tot += d; }
  let rem = tot * cl(p); x.save(); x.strokeStyle = col; x.lineWidth = lw; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath(); x.moveTo(P[0][0], P[0][1]);
  for (let i = 1; i < P.length && rem > 0; i++) { const d = seglen[i - 1]; const f = Math.min(1, rem / d); x.lineTo(P[i - 1][0] + (P[i][0] - P[i - 1][0]) * f, P[i - 1][1] + (P[i][1] - P[i - 1][1]) * f); rem -= d; }
  x.stroke(); x.restore();
}
const boxPts = (X, Y, w, h) => [[X, Y], [X + w, Y + 2], [X + w - 2, Y + h], [X + 2, Y + h - 1], [X, Y - 4]];
function arrow(key, x1, y1, x2, y2, p, col = '#111') { sketch(key, [[x1, y1], [(x1 + x2) / 2 + 6, (y1 + y2) / 2 - 6], [x2, y2]], p, col, 6); if (p > 0.95) { const a = Math.atan2(y2 - y1, x2 - x1); sketch(key + 'h', [[x2 - 34 * Math.cos(a - 0.5), y2 - 34 * Math.sin(a - 0.5)], [x2, y2], [x2 - 34 * Math.cos(a + 0.5), y2 - 34 * Math.sin(a + 0.5)]], 1, col, 6); } }
function write(s, X, Y, size, col, p, o = {}) { // left-to-right marker reveal + pen
  if (p <= 0) return; const { a = 'center', maxW = 960 } = o; x.save(); x.font = KA(size); let k = 1; const m = x.measureText(s).width; if (m > maxW) k = maxW / m;
  const w = m * k, x0 = a === 'center' ? X - w / 2 : X; x.beginPath(); x.rect(x0 - 10, Y - size, (w + 20) * cl(p), size * 2); x.clip();
  x.translate(x0, Y); x.scale(k, k); x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillStyle = col; x.fillText(s, 0, 0); x.restore();
  if (p < 1) { x.font = IN(400, 70); x.textAlign = 'center'; x.fillText('✍️', x0 + w * p + 20, Y + 20); }
}
const BLUE = '#1d4ed8', RED = '#dc2626', GREEN = '#16a34a', INK = '#111';

// ---------- segments ----------
const SEG = [];
SEG[0] = t => { // HOOK — kinetic
  kineticBg(t, 'rgba(239,68,68,0.16)');
  crashLine(eo(pr(t, LS(0), LS(0) + 2.5)), 40, 380, 1000, 900, 'rgba(239,68,68,0.55)', 8);
  TX('23 NOV 2026', 540, 330, { font: AN(66), c: '#f4cf6a', ls: 8, sc: 1 });
  const a = eb(pr(t, LS(0), LS(0) + 0.35)); // first frame already big (hook)
  const shake = t > wt(0, 'saaf') && t < wt(0, 'saaf') + 0.4 ? Math.sin(t * 80) * 14 * (1 - pr(t, wt(0, 'saaf'), wt(0, 'saaf') + 0.4)) : 0;
  x.save(); x.translate(shake, 0);
  TX('₹5.24', 540, 640, { font: AN(320), c: '#ffffff', sc: Math.max(0.85, a) });
  TX('LAKH CRORE', 540, 860, { font: AN(150), c: null, stroke: ['#f4cf6a', 5], sc: Math.max(0.85, a) });
  const sp = t < wt(0, 'saaf') - 0.05 ? 0.9 : 0.9 + 0.1 * eb(pr(t, wt(0, 'saaf') - 0.05, wt(0, 'saaf') + 0.25));
  if (sp > 0) { x.save(); x.translate(540, 1070); x.rotate(-0.06); x.scale(sp * 1, sp); x.fillStyle = '#ef4444'; rr(-330, -105, 660, 210, 24); x.fill(); TX('SAAF 😱', 0, 8, { font: AN(170), c: '#fff' }); x.restore(); }
  TX('market itna kyun gira?', 540, 1290, { font: AN(90), c: '#fff', sc: eb(pr(t, wt(0, 'market'), wt(0, 'market') + 0.35)) });
  x.restore();
};
SEG[1] = t => { // NUMBERS — kinetic
  kineticBg(t);
  const row = (label, val, Y, at, col, count) => {
    const p = eo(pr(t, at - 0.1, at + 0.35)), X = 540 + (1 - p) * 700;
    TX(label, X, Y - 135, { font: IN(900, 44), c: '#9ca3af', ls: 6, alpha: p });
    const v = count ? count(pr(t, at, at + 0.9)) : val; TX(v, X, Y + 10, { font: AN(165), c: col, alpha: p });
    if (col === '#ef4444' && p > 0.5) TX('▼', X + 420, Y + 10 + Math.sin(t * 8) * 8, { font: IN(900, 80), c: '#ef4444', alpha: p });
  };
  row('SENSEX', '', 470, wt(1, 'sensex'), '#ef4444', k => '−' + Math.round(1484 * eo(k)).toLocaleString('en-IN'));
  row('NIFTY CLOSE', '25,350', 830, wt(1, 'nifty'), '#ffffff');
  row('BANK NIFTY', '', 1190, wt(1, 'bank'), '#ef4444', k => '−' + (3.17 * eo(k)).toFixed(2) + '%');
};
SEG[2] = t => { // WAJAH 1 — whiteboard
  boardBg(t); const s = LS(2);
  write('Wajah #1: US AI Crash 🌍', 540, 300, 72, BLUE, pr(t, s, s + 1.0));
  sketch('u1', [[150, 350], [930, 356]], pr(t, s + 0.8, s + 1.2), BLUE, 6);
  const nA = wt(2, 'nasdaq'), nV = wt(2, 'nvidia'), nK = wt(2, 'korea');
  sketch('bA', boxPts(80, 430, 430, 230), pr(t, nA - 0.4, nA + 0.2), INK); write('🇺🇸 Nasdaq', 295, 500, 56, INK, pr(t, nA, nA + 0.4)); write('−5%', 295, 595, 80, RED, pr(t, nA + 0.2, nA + 0.6));
  sketch('bB', boxPts(570, 430, 430, 230), pr(t, nV - 0.4, nV + 0.2), INK); write('Nvidia', 785, 500, 56, INK, pr(t, nV, nV + 0.3)); write('−14%', 785, 595, 80, RED, pr(t, nV + 0.15, nV + 0.55));
  arrow('a1', 295, 680, 470, 800, pr(t, nK - 0.5, nK - 0.1)); arrow('a2', 785, 680, 610, 800, pr(t, nK - 0.5, nK - 0.1));
  sketch('bC', boxPts(290, 810, 500, 210), pr(t, nK - 0.1, nK + 0.4), INK); write('🇰🇷 Korea −5%', 540, 915, 66, RED, pr(t, nK + 0.1, nK + 0.6));
  const ti = wt(2, 'toota');
  arrow('a3', 540, 1040, 540, 1150, pr(t, ti - 0.5, ti)); write('🇮🇳 India 📉', 540, 1220, 80, RED, pr(t, ti, ti + 0.5));
};
SEG[3] = t => { // WAJAH 2 — whiteboard
  boardBg(t); const s = LS(3);
  write('Wajah #2: Profit Booking 💰', 540, 300, 70, BLUE, pr(t, s, s + 1.0));
  sketch('ax', [[140, 1150], [140, 470], [140, 1150], [960, 1150]], pr(t, s + 0.3, s + 0.9), INK, 6);
  const nf = wt(3, 'nifty');
  sketch('rise', [[160, 1080], [280, 1010], [380, 1040], [500, 900], [600, 930], [720, 720], [820, 600]], pr(t, nf - 0.4, nf + 0.8), GREEN, 9);
  write('Nov: Nifty +10% 📈', 450, 520, 64, GREEN, pr(t, nf + 0.3, nf + 0.9));
  const lg = wt(3, 'log');
  arrow('down', 830, 620, 940, 980, pr(t, lg - 0.2, lg + 0.4), RED);
  sketch('circ', Array.from({ length: 30 }, (_, i) => { const a = i / 29 * Math.PI * 2.1; return [700 + Math.cos(a) * 300, 1290 + Math.sin(a) * 95]; }), pr(t, lg + 0.3, lg + 0.9), RED, 6);
  write('Munafa nikaala 💸', 700, 1290, 64, RED, pr(t, lg + 0.5, lg + 1.1));
};
SEG[4] = t => { // WAJAH 3 — whiteboard
  boardBg(t); const s = LS(4);
  write('Wajah #3: Banks + Metal', 540, 300, 72, BLUE, pr(t, s, s + 1.0));
  const nb = wt(4, 'banks'), nm = wt(4, 'metal'), ts = wt(4, 'tata'), ap = wt(4, 'apl'), dl = wt(4, 'deal');
  sketch('bb', boxPts(80, 420, 430, 250), pr(t, nb - 0.3, nb + 0.2), INK); write('🏦 Banks', 295, 500, 62, INK, pr(t, nb, nb + 0.4)); write('−3.17%', 295, 600, 80, RED, pr(t, nb + 0.2, nb + 0.6));
  sketch('bm', boxPts(570, 420, 430, 250), pr(t, nm - 0.3, nm + 0.2), INK); write('⛏️ Metal', 785, 500, 62, INK, pr(t, nm, nm + 0.4)); write('−3.68%', 785, 600, 80, RED, pr(t, nm + 0.2, nm + 0.6));
  write('Tata Steel  −8%', 540, 820, 84, INK, pr(t, ts, ts + 0.6)); sketch('ut', [[230, 880], [850, 884]], pr(t, ts + 0.4, ts + 0.8), RED, 8);
  write('APL Apollo  −21%', 540, 990, 84, INK, pr(t, ap, ap + 0.6)); sketch('ua', [[200, 1050], [880, 1054]], pr(t, ap + 0.4, ap + 0.8), RED, 8);
  write('(bade deal ke baad 🤝)', 540, 1170, 56, BLUE, pr(t, dl - 0.3, dl + 0.4));
};
SEG[5] = t => { // TWIST — kinetic green
  kineticBg(t, 'rgba(34,197,94,0.18)');
  TX('PAR...', 540, 560, { font: AN(170), c: '#fff', sc: eb(pr(t, LS(5), LS(5) + 0.3)) });
  const u = wt(5, 'ulta'), p = eb(pr(t, u - 0.15, u + 0.25));
  TX('IT 🟢', 540, 900, { font: AN(330), c: '#22c55e', sc: p * (1 + 0.04 * Math.sin(t * 10)) });
  TX('ULTA CHADHE!', 540, 1180, { font: AN(120), c: '#fff', sc: eb(pr(t, u, u + 0.35)) });
  for (let i = 0; i < 14; i++) { const k = pr(t, u + i * 0.05, u + 1.2 + i * 0.05); if (k <= 0 || k >= 1) continue; TX('▲', 100 + (i * 157) % 900, 1400 - k * 900, { font: IN(900, 50), c: 'rgba(34,197,94,0.8)', alpha: 1 - k }); }
};
SEG[6] = t => { // AAGE — kinetic timeline
  kineticBg(t, 'rgba(96,165,250,0.14)');
  TX('AB NAZAR 👀', 540, 360, { font: AN(130), c: '#fff', sc: eb(pr(t, LS(6), LS(6) + 0.35)) });
  const a1 = wt(6, '25'), a2 = wt(6, '4');
  const line = pr(t, a1, a2 + 0.6); x.strokeStyle = '#f4cf6a'; x.lineWidth = 8; x.beginPath(); x.moveTo(540, 560); x.lineTo(540, 560 + 640 * line); x.stroke();
  const card = (Y, d, l, at, col) => { const p = eb(pr(t, at - 0.1, at + 0.3)); if (p <= 0) return; x.save(); x.translate(540, Y); x.scale(p, p); x.fillStyle = '#16181d'; rr(-400, -130, 800, 260, 30); x.fill(); x.strokeStyle = col; x.lineWidth = 6; x.stroke(); TX(d, -200, 0, { font: AN(120), c: col }); TX(l, 170, 0, { font: AN(80), c: '#fff', maxW: 420 }); x.restore(); };
  card(680, '25 NOV', 'US DATA 🇺🇸', a1, '#60a5fa'); card(1060, '4 DEC', 'RBI 🏦', a2, '#f4cf6a');
};
SEG[7] = t => { // CTA — kinetic
  kineticBg(t, 'rgba(212,166,44,0.18)'); const s = LS(7);
  TX('GHABRAO MAT,', 540, 320, { font: AN(110), c: '#fff', sc: eb(pr(t, s, s + 0.3)) });
  TX('SAMJHO.', 540, 450, { font: AN(130), c: '#f4cf6a', sc: eb(pr(t, wt(7, 'samjho'), wt(7, 'samjho') + 0.3)) });
  const c = wt(7, 'comment'), p = eb(pr(t, c - 0.1, c + 0.3));
  if (p > 0) { x.save(); x.translate(540, 690); x.scale(p, p); x.fillStyle = '#ef4444'; rr(-460, -110, 920, 220, 30); x.fill(); TX('Aapka portfolio kitna gira? 👇', 0, 4, { font: AN(84), c: '#fff', maxW: 860 }); x.restore(); }
  const lp = eb(pr(t, wt(7, 'finance') - 0.2, wt(7, 'finance') + 0.4));
  if (lp > 0) { x.save(); x.translate(540, 1080); x.scale(lp, lp); x.strokeStyle = 'rgba(244,207,106,0.7)'; x.lineWidth = 5; x.beginPath(); x.arc(0, 0, 230, t * 1.5, t * 1.5 + Math.PI * 1.3); x.stroke(); x.drawImage(logo, -200, -200, 400, 400); x.restore(); }
};
const KIN = new Set([0, 1, 5, 6, 7]);

// ---------- chrome: captions, footer, brand ----------
const chunks = []; tl.lines.forEach(Ln => { let cur = []; Ln.words.forEach((w, i) => { cur.push(w); const ch = cur.map(c => c.w).join(' ').length; if (cur.length >= 4 || ch >= 24 || (/[.,!?…:]$/.test(w.w) && cur.length >= 2) || i === Ln.words.length - 1) { chunks.push(cur); cur = []; } }); });
chunks.forEach((c, i) => { c.s = c[0].s - 0.05; c.e = i + 1 < chunks.length ? Math.min(chunks[i + 1][0].s - 0.05, c[c.length - 1].e + 0.7) : c[c.length - 1].e + 0.6; });
function captions(t) {
  const c = chunks.find(c => t >= c.s && t < c.e); if (!c) return;
  x.font = IN(800, 48); const sp = x.measureText(' ').width, ws = c.map(w => x.measureText(w.w).width), tw = ws.reduce((a, b) => a + b, 0) + sp * (c.length - 1);
  const pw = tw + 60, X = 540 - pw / 2, Y = 1478; x.globalAlpha = Math.min(pr(t, c.s, c.s + 0.08), 1 - pr(t, c.e - 0.08, c.e));
  rr(X, Y - 44, pw, 88, 20); x.fillStyle = 'rgba(12,12,16,0.94)'; x.fill(); x.strokeStyle = 'rgba(244,207,106,0.5)'; x.lineWidth = 2; x.stroke();
  let cx = X + 30; x.textBaseline = 'middle'; x.textAlign = 'left'; const last = c.findLastIndex(q => t >= q.s);
  c.forEach((w, i) => { x.fillStyle = t >= w.s ? (i === last ? '#f4cf6a' : '#fff') : '#6b7280'; x.fillText(w.w, cx, Y + 3); cx += ws[i] + sp; }); x.globalAlpha = 1;
}
function footer(t) {
  const Y = 1610, big = t >= LS(7), k = big ? 1 + 0.2 * eb(pr(t, LS(7) + 0.4, LS(7) + 0.9)) : 1, slot = Math.floor(t / 2.4) % 2, ph = (t % 2.4) / 2.4;
  const btn = (X, label, bg, active) => { const pz = active && ph > 0.35 && ph < 0.5 ? 0.9 : 1, pu = active ? 1 + 0.06 * Math.max(0, Math.sin(ph * Math.PI * 2)) : 1;
    x.save(); x.translate(X, Y); x.scale(k * pz * pu, k * pz * pu); x.font = IN(900, 40); const w = x.measureText(label).width + 66;
    x.shadowColor = active ? bg : 'rgba(0,0,0,0.35)'; x.shadowBlur = active ? 30 : 10; rr(-w / 2, -38, w, 76, 38); x.fillStyle = bg; x.fill(); x.shadowColor = 'transparent';
    x.strokeStyle = 'rgba(0,0,0,0.15)'; x.lineWidth = 2; x.stroke(); x.fillStyle = '#0b1020'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(label, 0, 3);
    if (active && ph > 0.4 && ph < 0.75) { const r = (ph - 0.4) / 0.35; x.globalAlpha = 1 - r; x.strokeStyle = bg; x.lineWidth = 6; rr(-w / 2 - r * 30, -38 - r * 30, w + r * 60, 76 + r * 60, 38 + r * 30); x.stroke(); }
    x.restore(); };
  btn(big ? 320 : 360, '🔔 FOLLOW', '#f4cf6a', slot === 0); btn(big ? 760 : 720, '🔁 REPOST', '#ffffff', slot === 1);
  x.font = IN(400, 60); x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('👆', slot === 0 ? (big ? 375 : 415) : (big ? 815 : 775), Y + 58 - (ph > 0.35 && ph < 0.5 ? 0 : 16));
}
function chrome(t, dark) {
  x.save(); rr(48, 56, 92, 92, 22); x.fillStyle = '#fff'; x.fill(); x.drawImage(mark, 250, 75, 755, 755, 58, 66, 72, 72); x.restore();
  x.font = IN(900, 28); x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillStyle = dark ? '#f8fafc' : '#0b2545'; x.fillText('FINANCE JUNCTION', 156, 102);
  x.font = '500 24px "JetBrains Mono", monospace'; x.textAlign = 'right'; x.fillStyle = dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'; x.fillText('not advice', 1030, 102);
  x.fillStyle = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'; x.fillRect(0, 0, W, 8); x.fillStyle = '#ef4444'; x.fillRect(0, 0, W * cl(t / tl.total), 8);
}
window.renderFrame = t => {
  x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1;
  const i = seg(t);
  SEG[i](t);
  // wipe transition from previous segment (first 0.32s)
  if (i > 0 && t - LS(i) < 0.32 && t >= LS(i) - 0.12) {
    const p = eio(pr(t, LS(i) - 0.12, LS(i) + 0.2));
    x.save(); x.beginPath(); x.rect(0, 0, W, H * (1 - p)); x.clip(); SEG[i - 1](t); x.restore();
    x.fillStyle = KIN.has(i) ? '#ef4444' : '#f4cf6a'; x.fillRect(0, H * (1 - p) - 14, W, 14);
  }
  const dark = KIN.has(i);
  captions(t); footer(t); chrome(t, dark);
};
window.DUR = tl.total; renderFrame(0); window.READY = true;
