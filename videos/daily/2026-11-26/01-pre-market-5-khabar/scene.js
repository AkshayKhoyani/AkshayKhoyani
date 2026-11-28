// 26 Nov 2026: "pre-market 5 khabar" countdown reel — theme: LIVE MARKET TERMINAL
// (deep navy, neon green/red, scrolling ticker, glass cards, glowing countdown badges, moving candle chart)
// + motion: virtual camera (push-in, drift, punch, shake), whip transitions, particles. Facts: ../MARKET_DATA.md, SOURCES.md
const W = 1080, H = 1920;
const tl = await (await fetch('./timeline.json')).json();
const out = document.createElement('canvas'); out.width = W; out.height = H; out.id = 'out'; document.body.appendChild(out);
const x = out.getContext('2d');
const ff = (fam, url, weight = '400') => new FontFace(fam, `url(${url})`, { weight }).load().then(f => document.fonts.add(f));
await Promise.all([
  ff('Anton', '/engine/node_modules/@fontsource/anton/files/anton-latin-400-normal.woff2'),
  ...['900', '800', '700', '600'].map(w => document.fonts.load(`${w} 40px Inter`)),
  document.fonts.load('40px "JetBrains Mono"'),
  document.fonts.load('40px "Noto Color Emoji"', '🔔💣💰👀💻🏦⛏️🟢🔴🇺🇸🇹🇼🇰🇷⏰📌🔁👆⚠️📉📈🚀🔥🎯'),
]);
const L = (u => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = u; }));
const logo = await L('/brand/logo-dark.png'), mark = await L('/brand/logo-transparent.png');

// ---------- helpers ----------
const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), pr = (t, a, b) => cl((t - a) / (b - a));
const eo = v => 1 - Math.pow(1 - v, 3), eio = v => v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2;
const eb = v => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(v - 1, 3) + c1 * Math.pow(v - 1, 2); };
const LS = i => tl.lines[i].start, LE = i => tl.lines[i].end, NSEG = tl.lines.length;
const wt = (i, key, d = 0) => { const w = tl.lines[i].words.find(w => w.w.toLowerCase().replace(/[^a-z0-9%.$]/g, '').replace(/^\$/, '').startsWith(key.toLowerCase())); return w ? w.s : LS(i) + d * (LE(i) - LS(i)); };
const segStart = i => i === 0 ? 0 : LS(i) - 0.12;
const seg = t => { let i = 0; for (let k = 0; k < NSEG; k++) if (t >= segStart(k)) i = k; return i; };
const rnd = (() => { let s = 2511; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })();
function rr(X, Y, w, h, r) { r = Math.min(r, w / 2, h / 2); x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
const AN = s => `400 ${s}px Anton, "Noto Color Emoji", sans-serif`, IN = (w, s) => `${w} ${s}px Inter, "Noto Color Emoji", sans-serif`, MO = s => `600 ${s}px "JetBrains Mono", monospace`;
function TX(s, X, Y, o = {}) {
  const { font = AN(100), c = '#fff', a = 'center', sc = 1, alpha = 1, rot = 0, stroke = null, maxW = 1000, ls = 0, glow = 0 } = o;
  if (sc <= 0 || alpha <= 0) return;
  x.save(); x.globalAlpha *= cl(alpha); x.font = font; if (ls) x.letterSpacing = ls + 'px';
  let k = 1; const m = x.measureText(s).width; if (m > maxW) k = maxW / m;
  x.translate(X, Y); x.rotate(rot); x.scale(sc * k, sc * k); x.textAlign = a; x.textBaseline = 'middle';
  if (glow) { x.shadowColor = typeof glow === 'string' ? glow : c; x.shadowBlur = 45; }
  if (stroke) { x.lineWidth = stroke[1]; x.strokeStyle = stroke[0]; x.lineJoin = 'round'; x.strokeText(s, 0, 0); }
  if (c) { x.fillStyle = c; x.fillText(s, 0, 0); }
  x.restore();
}
const G = '#22e58a', R = '#ff3b5c', GOLD = '#ffcf4a', CY = '#38d9ff', MUT = '#8a96b8';

// ---------- THEME: live market terminal ----------
const dots = Array.from({ length: 220 }, () => [rnd() * (W + 400) - 200, rnd() * (H + 400) - 200, rnd()]);
const cdl = Array.from({ length: 60 }, (_, i) => { const o = 0.5 + 0.35 * Math.sin(i * 0.45) + (rnd() - 0.5) * 0.25; const c = o + (rnd() - 0.45) * 0.22; return [o, c, Math.max(o, c) + rnd() * 0.08, Math.min(o, c) - rnd() * 0.08]; });
function terminalBg(t, mood = 'g') {
  const g = x.createLinearGradient(0, -300, 0, H + 300); g.addColorStop(0, '#050913'); g.addColorStop(0.5, '#0a1430'); g.addColorStop(1, '#050913');
  x.fillStyle = g; x.fillRect(-300, -300, W + 600, H + 600);
  const tint = mood === 'r' ? 'rgba(255,59,92,0.20)' : mood === 'y' ? 'rgba(255,207,74,0.16)' : 'rgba(34,229,138,0.16)';
  const rg = x.createRadialGradient(540, 820, 0, 540, 820, 950); rg.addColorStop(0, tint); rg.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = rg; x.fillRect(-300, -300, W + 600, H + 600);
  // perspective grid floor
  x.strokeStyle = 'rgba(56,217,255,0.08)'; x.lineWidth = 2;
  for (let i = -12; i <= 12; i++) { x.beginPath(); x.moveTo(540 + i * 30, 1180); x.lineTo(540 + i * 260, H + 300); x.stroke(); }
  for (let k = 0; k < 10; k++) { const p = ((k + (t * 0.6) % 1) / 10); const y = 1180 + Math.pow(p, 2) * 1100; x.beginPath(); x.moveTo(-300, y); x.lineTo(W + 300, y); x.stroke(); }
  // twinkling data dots
  dots.forEach(([dx, dy, s]) => { const a = 0.08 + 0.18 * Math.abs(Math.sin(t * (0.6 + s) + s * 9)); x.fillStyle = `rgba(150,200,255,${a})`; x.fillRect(dx, dy, 3, 3); });
  // scrolling candle chart (background layer)
  const cw = 34, off = (t * 40) % cw, base = 1080, hh = 520;
  cdl.forEach(([o, c, hi, lo], i) => {
    const X = i * cw - off - 100; if (X < -200 || X > W + 200) return;
    const up = mood === 'r' ? c < o : c >= o, col = up ? 'rgba(34,229,138,0.13)' : 'rgba(255,59,92,0.13)';
    x.fillStyle = col; const y1 = base - Math.max(o, c) * hh, y2 = base - Math.min(o, c) * hh;
    x.fillRect(X, y1, cw - 10, Math.max(4, y2 - y1)); x.fillRect(X + cw / 2 - 6, base - hi * hh, 2, (hi - lo) * hh);
  });
  // scanline sweep
  const sy = ((t * 380) % (H + 400)) - 200; const sg = x.createLinearGradient(0, sy - 60, 0, sy + 60);
  sg.addColorStop(0, 'rgba(56,217,255,0)'); sg.addColorStop(0.5, 'rgba(56,217,255,0.06)'); sg.addColorStop(1, 'rgba(56,217,255,0)'); x.fillStyle = sg; x.fillRect(-300, sy - 60, W + 600, 120);
}
// glass card
function glass(X, Y, w, h, col = CY, a = 1) {
  x.save(); x.globalAlpha *= a;
  rr(X, Y, w, h, 28); x.fillStyle = 'rgba(255,255,255,0.055)'; x.fill();
  const g = x.createLinearGradient(X, Y, X + w, Y + h); g.addColorStop(0, col); g.addColorStop(1, 'rgba(255,255,255,0.08)');
  x.strokeStyle = g; x.lineWidth = 3; x.shadowColor = col; x.shadowBlur = 25; x.stroke(); x.restore();
}
// glowing countdown badge (#5..#1)
function badge(n, label, t, at, col) {
  const p = eb(pr(t, at - 0.15, at + 0.25)); if (p <= 0) return;
  const pulse = 1 + 0.04 * Math.sin(t * 7);
  x.save(); x.translate(200, 340); x.scale(p * pulse, p * pulse);
  x.rotate(t * 0.8); x.strokeStyle = col; x.lineWidth = 6; x.shadowColor = col; x.shadowBlur = 35;
  x.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; x.lineTo(Math.cos(a) * 105, Math.sin(a) * 105); } x.closePath(); x.stroke();
  x.rotate(-t * 0.8); x.fillStyle = 'rgba(5,9,19,0.9)'; x.beginPath(); x.arc(0, 0, 85, 0, 7); x.fill();
  x.restore();
  TX('#' + n, 200, 345, { font: AN(120 * p), c: col, glow: col });
  const q = eo(pr(t, at, at + 0.35));
  TX(label, 330 + (1 - q) * 300, 340, { font: AN(82), c: '#fff', a: 'left', alpha: q, maxW: 690 });
}
// LIVE pill
function livePill(t) {
  x.save(); rr(820, 160, 210, 56, 28); x.fillStyle = 'rgba(255,59,92,0.15)'; x.fill(); x.strokeStyle = R; x.lineWidth = 2; x.stroke(); x.restore();
  x.fillStyle = R; x.globalAlpha = 0.5 + 0.5 * Math.abs(Math.sin(t * 4)); x.beginPath(); x.arc(855, 188, 10, 0, 7); x.fill(); x.globalAlpha = 1;
  TX('LIVE 26 NOV', 945, 189, { font: MO(24), c: '#fff' });
}
// scrolling ticker strip
const TICK = [['NIFTY 25,819.25', '▲1.85%', G], ['SENSEX 83,938', '▲1.82%', G], ['FII', '+₹4,479 CR', G], ['NIFTY FMCG', '▲3.8%', G], ['US CORE PCE', '3.3%', R], ['US GDP Q3', '4.3%', G], ['US TARIFF ON INDIA', 'UPTO 25% (PROPOSED)', R], ['US MARKET 26 NOV', 'CLOSED', GOLD]];
function ticker(t, Y = 1360) {
  x.save(); x.fillStyle = 'rgba(5,9,19,0.92)'; x.fillRect(0, Y - 34, W, 68); x.fillStyle = 'rgba(56,217,255,0.5)'; x.fillRect(0, Y - 34, W, 2); x.fillRect(0, Y + 32, W, 2);
  x.font = MO(28); let total = 0; const items = TICK.map(([a, b, c]) => { const wa = x.measureText(a + ' ').width, wb = x.measureText(b).width; total += wa + wb + 70; return [a, b, c, wa, wb]; });
  let X = -((t * 140) % total);
  for (let rep = 0; rep < 3; rep++) items.forEach(([a, b, c, wa, wb]) => { x.fillStyle = '#c9d4f0'; x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText(a, X, Y); x.fillStyle = c; x.fillText(b, X + wa, Y); X += wa + wb + 70; x.fillStyle = '#3b4a73'; x.fillText('•', X - 42, Y); });
  x.restore();
}
// particles
const parts = Array.from({ length: 60 }, () => ({ x: rnd() * W, s: 0.4 + rnd(), z: 2 + rnd() * 5, p: rnd() * 10 }));
function particles(t, col = '34,229,138', dir = -1, amt = 1) {
  parts.forEach((q, i) => { if (i / parts.length > amt) return; const y = dir < 0 ? H + 50 - ((t * 240 * q.s + q.p * 300) % (H + 200)) : -50 + ((t * 300 * q.s + q.p * 300) % (H + 200));
    x.fillStyle = `rgba(${col},${0.25 + 0.4 * Math.abs(Math.sin(t * 3 + q.p))})`; x.beginPath(); x.arc(q.x + Math.sin(t + q.p) * 18, y, q.z, 0, 7); x.fill(); });
}

// ---------- virtual camera ----------
const PUNCH = [], SHAKE = [], GLITCH = [];
function cam(t, i) {
  const k = pr(t, LS(i), LE(i) + 0.2);
  let s = 1 + 0.05 * eio(k), dx = Math.sin(t * 0.7 + i) * 9, dy = Math.cos(t * 0.5 + i) * 7, r = Math.sin(t * 0.4 + i * 2) * 0.005;
  PUNCH.forEach(([pt, amt]) => { const d = t - pt; if (d > 0 && d < 0.5) s += amt * Math.exp(-d * 9) * Math.sin(Math.min(d * 18, Math.PI / 2)); });
  SHAKE.forEach(([st, amt]) => { const d = t - st; if (d > 0 && d < 0.45) { const e = (1 - d / 0.45) * amt; dx += Math.sin(t * 90) * e; dy += Math.cos(t * 77) * e * 0.7; r += Math.sin(t * 60) * e * 0.0008; } });
  return { s, dx, dy, r };
}
function withCam(t, i, fn) { const c = cam(t, i); x.save(); x.translate(540 + c.dx, 820 + c.dy); x.rotate(c.r); x.scale(c.s, c.s); x.translate(-540, -820); fn(t); x.restore(); }

// ---------- segments ----------
const SEG = [];
// 0 HOOK
const H0 = { kh: wt(0, 'khulne'), five: wt(0, 'khabar'), n1: wt(0, 'number') };
PUNCH.push([H0.five, 0.1], [H0.n1, 0.08]); SHAKE.push([H0.five, 14]);
SEG[0] = t => {
  terminalBg(t, 'r'); particles(t, '255,207,74', -1, 0.5);
  x.save(); rr(290, 250, 500, 80, 40); x.fillStyle = 'rgba(255,207,74,0.14)'; x.fill(); x.strokeStyle = GOLD; x.lineWidth = 3; x.stroke(); x.restore();
  TX('📅 26 NOV · GURUVAAR', 540, 292, { font: IN(900, 38), c: GOLD });
  TX('MARKET KHULNE', 540, 450, { font: AN(150), c: '#fff', glow: 'rgba(255,255,255,0.4)' });
  TX('SE PEHLE ⏰', 540, 620, { font: AN(150), c: '#fff', glow: 'rgba(255,255,255,0.4)' });
  TX('5 BADI KHABAR 📰', 540, 790, { font: AN(120), c: G, glow: G, sc: 1 + 0.03 * Math.sin(t * 6) });
  const st = pr(t, H0.five - 0.1, H0.five + 0.15), sc = st > 0 ? 1 + 1.4 * (1 - eo(st)) : 1;
  x.save(); x.translate(540, 960); x.rotate(-0.05); x.scale(sc, sc); x.fillStyle = R; rr(-430, -72, 860, 144, 22); x.fill();
  TX('TARIFF 🇺🇸 · INFLATION 🔥 · IPO', 0, 6, { font: AN(70), c: '#fff', maxW: 800 }); x.restore();
  for (let k = 0; k < 5; k++) { const n = 5 - k, X = 180 + k * 180, col = n === 1 ? GOLD : CY;
    x.save(); x.translate(X, 1150); x.strokeStyle = col; x.lineWidth = 5; x.shadowColor = col; x.shadowBlur = n === 1 ? 40 : 20; x.beginPath(); x.arc(0, 0, 62, 0, 7); x.stroke(); x.restore();
    TX(String(n), X, 1155, { font: AN(80), c: n === 1 ? GOLD : '#fff', glow: n === 1 ? GOLD : 0 }); }
  TX('#1 SABSE BADI 👀', 540, 1262, { font: AN(60), c: GOLD, sc: Math.max(0.001, eb(pr(t, H0.n1 - 0.1, H0.n1 + 0.25))) });
};
// 1 #5 — 25 Nov ki wapsi
const S1 = { n: LS(1), sx: wt(1, 'sensex'), up: wt(1, 'uchhla'), fii: wt(1, 'fii'), dii: wt(1, 'dii') };
PUNCH.push([S1.up, 0.1]); SHAKE.push([S1.up, 10]);
SEG[1] = t => {
  terminalBg(t, 'g'); particles(t, '34,229,138', -1, 0.6); badge(5, '25 NOV KI WAPSI 🚀', t, S1.n, G);
  const p = eb(pr(t, S1.sx - 0.15, S1.sx + 0.25));
  if (p > 0) { TX('SENSEX', 540, 520, { font: AN(90), c: null, stroke: ['#fff', 4], sc: p });
    TX('+' + Math.round(1502 * eo(pr(t, S1.sx, S1.up + 0.3))).toLocaleString('en-IN'), 540, 690, { font: AN(230), c: G, glow: G, sc: p });
    TX('83,938 close · Nifty 25,819 (+1.85%)', 540, 850, { font: IN(800, 40), c: '#c9d4f0', alpha: pr(t, S1.up, S1.up + 0.3), maxW: 940 }); }
  const pill = (X, at, label, val) => { const q = eb(pr(t, at - 0.1, at + 0.25)); if (q <= 0) return; x.save(); x.translate(X, 1060); x.scale(q, q); glass(-220, -95, 440, 190, G); x.restore();
    TX(label, X, 1010, { font: IN(900, 40), c: MUT, sc: q }); TX(val, X, 1095, { font: AN(80), c: G, sc: q, glow: G }); };
  pill(290, S1.fii, 'FII 🌍', '+₹4,479 cr'); pill(790, S1.dii, 'DII 🇮🇳', '+₹4,019 cr');
  TX('provisional data', 540, 1205, { font: MO(24), c: MUT, alpha: pr(t, S1.dii, S1.dii + 0.3) });
};
// 2 #4 — stocks in focus
const S2 = { n: LS(2), abb: Math.min(wt(2, 'abb'), LS(2) + 0.2), apl: wt(2, 'apl'), fd: wt(2, 'foodlink') };
PUNCH.push([S2.abb, 0.05], [S2.apl, 0.05], [S2.fd, 0.06]);
SEG[2] = t => {
  terminalBg(t, 'y'); badge(4, 'STOCKS IN FOCUS 👀', t, S2.n, CY);
  const card = (Y, at, emo, name, sub, val, col) => { const p = eo(pr(t, at - 0.2, at + 0.25)); if (p <= 0) return; const X = 80 + (1 - p) * -900;
    glass(X, Y, 920, 200, col, p); TX(emo, X + 90, Y + 100, { font: IN(400, 90), alpha: p });
    TX(name, X + 180, Y + 72, { font: AN(68), c: '#fff', a: 'left', alpha: p, maxW: 470 }); TX(sub, X + 180, Y + 145, { font: IN(700, 30), c: MUT, a: 'left', alpha: p, maxW: 470 });
    TX(val, X + 890, Y + 102, { font: AN(72), c: col, a: 'right', alpha: p, glow: col, maxW: 290 }); };
  card(500, S2.abb, '⚡', 'ABB INDIA', 'Parent Ziehl-Abegg khareedegi', '▲ 2.5%', G);
  card(730, S2.apl, '⛏️', 'APL APOLLO', '25 Nov: naya 52-week low', '▼ LOW', R);
  card(960, S2.fd, '🍱', 'FOODLINK IPO', 'Mainboard IPO', '26–30 NOV', GOLD);
};
// 3 #3 — US market band
const S3 = { n: LS(3), bd: wt(3, 'band'), th: wt(3, 'thanksgiving') };
PUNCH.push([S3.bd, 0.12]); SHAKE.push([S3.bd + 0.08, 18]);
SEG[3] = t => {
  terminalBg(t, 'y'); badge(3, 'US MARKET 🇺🇸', t, S3.n, CY);
  TX('26 NOV', 540, 560, { font: AN(130), c: '#fff', sc: 0.75 + 0.25 * eb(pr(t, S3.n, S3.n + 0.3)) });
  const st = pr(t, S3.bd - 0.05, S3.bd + 0.18);
  if (st > 0) { const sc = 1 + 1.6 * (1 - eo(st)); x.save(); x.translate(540, 790); x.rotate(-0.07); x.scale(sc, sc); x.globalAlpha = cl(st * 2);
    x.strokeStyle = R; x.lineWidth = 16; x.shadowColor = R; x.shadowBlur = 30; rr(-380, -125, 760, 250, 30); x.stroke(); TX('BAND 🔒', 0, 10, { font: AN(180), c: R }); x.restore(); }
  TX('🦃 Thanksgiving ki chhutti', 540, 1000, { font: AN(72), c: GOLD, sc: eb(pr(t, S3.th - 0.1, S3.th + 0.25)) });
  TX('27 Nov: sirf aadha din', 540, 1100, { font: IN(800, 40), c: MUT, alpha: pr(t, S3.th + 0.2, S3.th + 0.5) });
};
// 4 #2 — inflation garam
const S4 = { n: LS(4), core: wt(4, 'core'), v: wt(4, '3.3'), y23: wt(4, '2023'), hk: wt(4, 'rate'), pk: wt(4, 'pakka') };
PUNCH.push([S4.v, 0.1], [S4.pk, 0.1]); SHAKE.push([S4.v + 0.1, 12]); GLITCH.push([S4.n, 0.3]);
SEG[4] = t => {
  terminalBg(t, 'r'); particles(t, '255,59,92', -1, 0.5); badge(2, 'INFLATION GARAM 🔥', t, S4.n, R);
  TX('🇺🇸 CORE PCE (OCT)', 540, 500, { font: AN(80), c: '#fff', sc: eb(pr(t, S4.core - 0.15, S4.core + 0.2)) });
  const p = eb(pr(t, S4.v - 0.15, S4.v + 0.2));
  if (p > 0) TX((3.3 * eo(pr(t, S4.v - 0.1, S4.v + 0.5))).toFixed(1) + '%', 540, 700, { font: AN(260), c: R, glow: R, sc: p });
  TX('andaaza 3.2% tha', 540, 860, { font: IN(800, 40), c: MUT, alpha: pr(t, S4.v + 0.3, S4.v + 0.6) });
  const y = eo(pr(t, S4.y23 - 0.1, S4.y23 + 0.3)); if (y > 0) { glass(110, 920, 860, 120, R, y); TX('Nov 2023 ke baad sabse zyada 📈', 540, 982, { font: AN(60), c: '#fff', alpha: y, maxW: 800 }); }
  const g = eb(pr(t, S4.y23 + 0.2, S4.y23 + 0.5)); if (g > 0) TX('US GDP: 4.3% 💪', 300, 1140, { font: AN(60), c: G, sc: g });
  const h = eb(pr(t, S4.hk - 0.1, S4.hk + 0.25)); if (h > 0) { x.save(); x.translate(780, 1140); x.scale(h, h); x.fillStyle = R; rr(-230, -55, 460, 110, 22); x.fill(); x.restore(); TX('RATE HIKE ~PAKKA', 780, 1143, { font: AN(54 * h), c: '#fff', maxW: 420 }); }
};
// 5 #1 — tariff bomb
const S5 = { n: LS(5), tr: wt(5, 'trump'), in: wt(5, 'india'), v: wt(5, '25'), pr: wt(5, 'prastaav'), ab: wt(5, 'abhi'), lg: wt(5, 'lagu') };
PUNCH.push([S5.n, 0.12], [S5.v, 0.14], [S5.lg, 0.08]); SHAKE.push([S5.v + 0.05, 22]); GLITCH.push([S5.v, 0.3]);
SEG[5] = t => {
  terminalBg(t, 'r'); particles(t, '255,59,92', 1, 0.6); badge(1, 'TARIFF BOMB 💣', t, S5.n, GOLD);
  const a = eb(pr(t, S5.tr - 0.1, S5.in + 0.2));
  if (a > 0) { TX('🇺🇸', 280, 560, { font: IN(400, 150), sc: a }); TX('🇮🇳', 800, 560, { font: IN(400, 150), sc: a });
    const fl = pr(t, S5.tr, S5.in + 0.2); x.save(); x.strokeStyle = R; x.lineWidth = 10; x.shadowColor = R; x.shadowBlur = 25; x.beginPath(); x.moveTo(390, 560); x.lineTo(390 + 300 * eo(fl), 560); x.stroke(); x.restore();
    if (fl > 0.95) TX('➜', 690, 560, { font: IN(900, 90), c: R }); }
  const p = eb(pr(t, S5.v - 0.1, S5.v + 0.2));
  if (p > 0) { TX('25% TAK', 540, 780, { font: AN(230), c: R, glow: R, sc: p }); TX('tariff ka PRASTAAV · deal hui to 17%', 540, 920, { font: IN(800, 40), c: '#ffd0d8', alpha: pr(t, S5.pr - 0.1, S5.pr + 0.3), maxW: 940 }); }
  const q = eo(pr(t, S5.ab - 0.1, S5.lg + 0.2));
  if (q > 0) { glass(110, 990, 860, 200, G, q); TX('ABHI LAGU NAHI ✅', 540, 1060, { font: AN(80), c: G, alpha: q, glow: G });
    TX('Hearing 25 Jan 2027 se · Pharma ko chhoot', 540, 1140, { font: IN(800, 36), c: '#c9d4f0', alpha: q, maxW: 820 }); }
};
// 6 CTA
const S6 = { h: wt(6, 'haan'), na: wt(6, 'na'), c: wt(6, 'comment'), fin: wt(6, 'finance') };
PUNCH.push([S6.h, 0.05], [S6.na, 0.05]);
SEG[6] = t => {
  terminalBg(t, 'y'); particles(t, '255,207,74', -1, 0.4);
  TX('TARIFF SE DAR? 😬', 540, 320, { font: AN(130), c: '#fff', sc: eb(pr(t, LS(6), LS(6) + 0.3)), maxW: 980 });
  const btn = (Y, txt, col, at, fg) => { const p = eb(pr(t, at - 0.1, at + 0.3)); if (p <= 0) return; const pu = 1 + 0.04 * Math.sin(t * 8 + Y);
    x.save(); x.translate(540, Y); x.scale(p * pu, p * pu); x.shadowColor = col; x.shadowBlur = 45; x.fillStyle = col; rr(-400, -100, 800, 200, 40); x.fill(); x.shadowColor = 'transparent';
    TX(txt, 0, 6, { font: AN(110), c: fg, maxW: 740 }); x.restore(); };
  btn(550, '😬 HAAN = 1', R, S6.h, '#fff'); btn(800, '😎 NA = 2', G, S6.na, '#05110a');
  TX('Comment karo 👇 · Save karo 📌', 540, 975, { font: AN(64), c: '#fff', sc: eb(pr(t, S6.c, S6.c + 0.3)), maxW: 960 });
  const lp = eb(pr(t, S6.fin - 0.2, S6.fin + 0.4));
  if (lp > 0) { x.save(); x.translate(540, 1170); x.scale(lp, lp); x.strokeStyle = 'rgba(255,207,74,0.85)'; x.lineWidth = 5; x.beginPath(); x.arc(0, 0, 150, t * 2, t * 2 + Math.PI * 1.3); x.stroke(); x.drawImage(logo, -130, -130, 260, 260); x.restore(); }
};

// ---------- chrome: captions, footer, brand, ticker ----------
const chunks = []; tl.lines.forEach(Ln => { let cur = []; Ln.words.forEach((w, i) => { cur.push(w); const ch = cur.map(c => c.w).join(' ').length; if (cur.length >= 4 || ch >= 24 || (/[.,!?…:]$/.test(w.w) && cur.length >= 2) || i === Ln.words.length - 1) { chunks.push(cur); cur = []; } }); });
chunks.forEach((c, i) => { c.s = c[0].s - 0.05; c.e = i + 1 < chunks.length ? Math.min(chunks[i + 1][0].s - 0.05, c[c.length - 1].e + 0.7) : c[c.length - 1].e + 0.6; });
function captions(t) {
  const c = chunks.find(c => t >= c.s && t < c.e); if (!c) return;
  const pop = 1 + 0.08 * (1 - eo(pr(t, c.s, c.s + 0.15)));
  x.font = IN(800, 48); const sp = x.measureText(' ').width, ws = c.map(w => x.measureText(w.w).width), tw = ws.reduce((a, b) => a + b, 0) + sp * (c.length - 1);
  const pw = tw + 60, Y = 1478; x.save(); x.translate(540, Y); x.scale(pop, pop); x.translate(-540, -Y);
  const X = 540 - pw / 2; x.globalAlpha = Math.min(pr(t, c.s, c.s + 0.08), 1 - pr(t, c.e - 0.08, c.e));
  rr(X, Y - 44, pw, 88, 20); x.fillStyle = 'rgba(5,9,19,0.95)'; x.fill(); x.strokeStyle = 'rgba(56,217,255,0.6)'; x.lineWidth = 2; x.stroke();
  let cx = X + 30; x.textBaseline = 'middle'; x.textAlign = 'left'; const last = c.findLastIndex(q => t >= q.s);
  c.forEach((w, i) => { x.fillStyle = t >= w.s ? (i === last ? GOLD : '#fff') : '#5b678a'; x.fillText(w.w, cx, Y + 3); cx += ws[i] + sp; }); x.restore(); x.globalAlpha = 1;
}
function footer(t) {
  const Y = 1610, big = t >= LS(6), k = big ? 1 + 0.2 * eb(pr(t, LS(6) + 0.4, LS(6) + 0.9)) : 1, slot = Math.floor(t / 2.4) % 2, ph = (t % 2.4) / 2.4;
  const btn = (X, label, bg, active) => { const pz = active && ph > 0.35 && ph < 0.5 ? 0.9 : 1, pu = active ? 1 + 0.06 * Math.max(0, Math.sin(ph * Math.PI * 2)) : 1;
    x.save(); x.translate(X, Y); x.scale(k * pz * pu, k * pz * pu); x.font = IN(900, 40); const w = x.measureText(label).width + 66;
    x.shadowColor = active ? bg : 'rgba(0,0,0,0.35)'; x.shadowBlur = active ? 30 : 10; rr(-w / 2, -38, w, 76, 38); x.fillStyle = bg; x.fill(); x.shadowColor = 'transparent';
    x.fillStyle = '#0b1020'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(label, 0, 3);
    if (active && ph > 0.4 && ph < 0.75) { const r = (ph - 0.4) / 0.35; x.globalAlpha = 1 - r; x.strokeStyle = bg; x.lineWidth = 6; rr(-w / 2 - r * 30, -38 - r * 30, w + r * 60, 76 + r * 60, 38 + r * 30); x.stroke(); }
    x.restore(); };
  btn(big ? 320 : 360, '🔔 FOLLOW', GOLD, slot === 0); btn(big ? 760 : 720, '🔁 REPOST', '#ffffff', slot === 1);
  x.font = IN(400, 60); x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('👆', slot === 0 ? (big ? 375 : 415) : (big ? 815 : 775), Y + 58 - (ph > 0.35 && ph < 0.5 ? 0 : 16));
}
function chrome(t) {
  x.save(); rr(48, 56, 92, 92, 22); x.fillStyle = '#fff'; x.fill(); x.drawImage(mark, 250, 75, 755, 755, 58, 66, 72, 72); x.restore();
  x.font = IN(900, 28); x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillStyle = '#f8fafc'; x.fillText('FINANCE JUNCTION', 156, 102);
  x.font = '500 24px "JetBrains Mono", monospace'; x.textAlign = 'right'; x.fillStyle = 'rgba(255,255,255,0.6)'; x.fillText('not advice', 1030, 102);
  x.fillStyle = 'rgba(255,255,255,0.12)'; x.fillRect(0, 0, W, 8); x.fillStyle = GOLD; x.fillRect(0, 0, W * cl(t / tl.total), 8);
  if (seg(t) > 0) livePill(t);
}
// glitch overlay (RGB split bars)
function glitch(t) { GLITCH.forEach(([gt, d]) => { const k = t - gt; if (k < 0 || k > d) return; const a = 1 - k / d;
  for (let i = 0; i < 7; i++) { const y = ((i * 263 + Math.floor(t * 60) * 97) % H), h = 10 + ((i * 37) % 40); const sh = (Math.sin(t * 200 + i) * 40) * a;
    x.drawImage(out, 0, y, W, h, sh, y, W, h); }
  x.globalAlpha = 0.18 * a; x.fillStyle = R; x.fillRect(0, 0, W, H); x.globalAlpha = 1; }); }
// whip-pan transition
const TR = 0.34;
window.renderFrame = t => {
  x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1;
  const i = seg(t), t0 = segStart(i), p = i > 0 ? eio(pr(t, t0, t0 + TR)) : 1;
  if (p < 1) {
    x.save(); x.translate(-W * p, 0); withCam(t, i - 1, SEG[i - 1]); x.restore();
    x.save(); x.translate(W * (1 - p), 0); withCam(t, i, SEG[i]); x.restore();
    const a = Math.sin(Math.PI * p); x.globalAlpha = 0.5 * a; x.fillStyle = CY;
    for (let k = 0; k < 14; k++) { const yy = (k * 151 + i * 37) % H; x.fillRect(0, yy, W, 3 + (k % 3) * 3); }
    x.globalAlpha = 0.2 * a; x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); x.globalAlpha = 1;
  } else withCam(t, i, SEG[i]);
  glitch(t);
  ticker(t); captions(t); footer(t); chrome(t);
};
window.DUR = tl.total; renderFrame(0); window.READY = true;
