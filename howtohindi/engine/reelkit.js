// HowToHindi ReelKit (ported from Finance Junction ReelKit): JSON-driven 2D motion-graphics reels.
// Brand: dark navy #0B1A33, white, orange #FF7A1A. 'gold' is kept as an alias of the brand orange.
// A reel folder has index.html (loads this), spec.json (scenes) and timeline.json (from reel.py).
// Scene types: hook, stat, formula, compare, list, chart, phone, mythfact, cta.
const W = 1080, H = 1920;
const C = {
  orange: '#ff7a1a', orange2: '#ffa45c', gold: '#ff7a1a', gold2: '#ffa45c', navy: '#0b1a33', green: '#22c55e', green2: '#4ade80',
  red: '#ef4444', red2: '#f87171', blue: '#60a5fa', cyan: '#22d3ee', amber: '#f59e0b',
  text: '#f8fafc', muted: '#94a3b8', card: 'rgba(255,255,255,0.06)', stroke: 'rgba(255,255,255,0.13)'
};
const col = c => C[c] || c || C.text;
const HANDLE = '@howtohindi.official';

const spec = await (await fetch('./spec.json')).json();
const tl = await (await fetch('./timeline.json')).json();
const out = document.createElement('canvas'); out.width = W; out.height = H; out.id = 'out';
document.body.appendChild(out);
const ctx = out.getContext('2d');
const load = src => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
const [logo, mark] = await Promise.all([load('/brand/logo-dark.png'), load('/brand/mark-dark.png')]);
await Promise.all(['900', '800', '700', '600', '500'].map(w => document.fonts.load(`${w} 40px Inter`)));
await document.fonts.load('40px "Noto Color Emoji"', '🔔✅❌📈');

// ---------- helpers ----------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const prog = (t, a, b) => clamp((t - a) / (b - a));
const easeOut = x => 1 - Math.pow(1 - x, 3);
const easeInOut = x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const easeBack = x => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const hash = n => { const r = Math.sin(n * 12.9898) * 43758.5453; return r - Math.floor(r); };
const F = (w, s) => `${w} ${s}px Inter, "Noto Color Emoji", sans-serif`;
const fmtIN = (v, dec = 0) => Number(v).toLocaleString('en-IN', { minimumFractionDigits: dec, maximumFractionDigits: dec });

function txt(s, x, y, o = {}) {
  const { size = 60, weight = 700, color = C.text, align = 'center', alpha = 1, scale = 1, dy = 0, base = 'alphabetic', maxW = 0 } = o;
  if (alpha <= 0 || scale <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(alpha);
  ctx.font = F(weight, size);
  let sc = scale;
  if (maxW) { const w = ctx.measureText(s).width; if (w > maxW) sc *= maxW / w; }
  ctx.translate(x, y + dy); ctx.scale(sc, sc);
  ctx.textAlign = align; ctx.textBaseline = base; ctx.fillStyle = col(color);
  ctx.fillText(s, 0, 0); ctx.restore();
}
function pop(t, at, s, x, y, o = {}) {
  const p = easeOut(prog(t, at, at + 0.35));
  txt(s, x, y, { ...o, alpha: p * (o.alpha ?? 1), dy: (1 - p) * 36 });
}
function rr(x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function card(x, y, w, h, alpha = 1, accent) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha;
  rr(x, y, w, h, 30); ctx.fillStyle = C.card; ctx.fill(); ctx.strokeStyle = C.stroke; ctx.lineWidth = 2; ctx.stroke();
  if (accent) { rr(x, y, 12, h, 6); ctx.fillStyle = col(accent); ctx.fill(); }
  ctx.restore();
}
function stamp(t, at, s, x, y, c = 'red', rot = -0.16, size = 110) {
  if (t < at) return;
  const p = easeOut(prog(t, at, at + 0.2)), sc = 2.6 - 1.6 * p;
  ctx.save(); ctx.globalAlpha *= clamp(p * 1.5); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  ctx.font = F(900, size);
  const w = ctx.measureText(s).width + 70, h = size * 1.3;
  rr(-w / 2, -h / 2, w, h, 26); ctx.fillStyle = 'rgba(10,5,15,0.65)'; ctx.fill();
  ctx.lineWidth = 12; ctx.strokeStyle = col(c); ctx.stroke();
  ctx.fillStyle = col(c); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, 0, size * 0.06);
  ctx.restore();
}
function tagPill(t, at, s, c = 'gold', y = 250) {
  const p = at <= 0 ? 1 : easeBack(prog(t, at, at + 0.35));
  if (p <= 0) return;
  ctx.save(); ctx.translate(540, y); ctx.scale(p, p);
  ctx.font = F(800, 34); const w = ctx.measureText(s).width + 56;
  rr(-w / 2, -30, w, 60, 30); ctx.fillStyle = col(c); ctx.fill();
  ctx.fillStyle = '#0b0b14'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, 0, 2);
  ctx.restore();
}
function title(t, at, s, y = 380, size = 72) {
  if (!s) return;
  const p = at <= 0 ? 1 : easeOut(prog(t, at, at + 0.35));
  txt(s, 540, y, { size, weight: 900, alpha: p, dy: (1 - p) * 30, maxW: 980 });
}
function source(t, s) { if (s) pop(t, 0.6, s, 540, 1390, { size: 28, weight: 500, color: 'rgba(148,163,184,0.85)', maxW: 980 }); }
// item i of n appears spread over the first `span` of the scene
const at = (i, n, d, start = 0.15, span = 0.7) => d * (start + span * (n > 1 ? i / (n - 1) : 0) * 0.9);

// ---------- scene types ----------
const S = {};
S.hook = (t, d, s, first) => {
  if (s.tag) tagPill(t, first ? 0 : 0.05, s.tag, s.tagColor || 'gold', 540);
  const lines = s.lines || [];
  const size = s.size || 118;
  lines.forEach((ln, i) => {
    const [text, c] = Array.isArray(ln) ? ln : [ln, i ? 'gold' : 'text'];
    const p = first ? 1 : easeBack(prog(t, 0.05 + i * 0.12, 0.4 + i * 0.12));
    const pulse = 1 + 0.025 * Math.sin(t * 4 + i);
    txt(text, 540, 760 + i * size * 1.18, { size, weight: 900, color: c, scale: Math.max(0, p) * pulse, maxW: 980 });
  });
  if (s.emoji) {
    const p = first ? 1 : easeBack(prog(t, 0.3, 0.7));
    txt(s.emoji, 540, 760 + lines.length * size * 1.18 + 150, { size: 170, scale: Math.max(0, p) * (1 + 0.06 * Math.sin(t * 5)) });
  }
  if (s.sub) pop(t, first ? -1 : 0.5, s.sub, 540, 760 + lines.length * size * 1.18 + (s.emoji ? 290 : 60), { size: 46, weight: 600, color: 'muted', maxW: 980 });
};
S.stat = (t, d, s) => {
  if (s.tag) tagPill(t, 0.05, s.tag, s.tagColor || 'gold');
  title(t, 0.1, s.title);
  pop(t, 0.2, s.label || '', 540, 640, { size: 50, weight: 600, color: 'muted', maxW: 980 });
  const c = easeOut(prog(t, 0.3, Math.min(d * 0.6, 2.2)));
  const v = (s.prefix || '') + fmtIN(s.value * c, s.decimals || 0) + (s.suffix || '');
  txt(v, 540, 850, { size: s.size || 150, weight: 900, color: s.color || 'gold', alpha: prog(t, 0.25, 0.45), maxW: 1000 });
  if (s.note) pop(t, Math.min(d * 0.6, 2.4), s.note, 540, 975, { size: 48, weight: 700, color: s.noteColor || 'text', maxW: 980 });
  if (s.chips) s.chips.forEach((ch, i) => {
    const p = easeBack(prog(t, d * 0.55 + i * 0.25, d * 0.55 + i * 0.25 + 0.35));
    if (p <= 0) return;
    const y = 1110 + i * 120;
    ctx.save(); ctx.translate(540, y); ctx.scale(p, p);
    ctx.font = F(700, 44); const w = ctx.measureText(ch).width + 70;
    rr(-w / 2, -45, w, 90, 45); ctx.fillStyle = C.card; ctx.fill(); ctx.strokeStyle = C.stroke; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = C.text; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ch, 0, 2);
    ctx.restore();
  });
  source(t, s.source);
};
S.formula = (t, d, s) => {
  if (s.tag) tagPill(t, 0.05, s.tag, s.tagColor || 'gold');
  title(t, 0.1, s.title);
  (s.lines || []).forEach((ln, i) => {
    const [text, c] = Array.isArray(ln) ? ln : [ln, 'text'];
    const p = easeBack(prog(t, at(i, s.lines.length, d), at(i, s.lines.length, d) + 0.4));
    const y = 720 + i * 170;
    if (p <= 0) return;
    ctx.save(); ctx.translate(540, y); ctx.scale(p, p);
    ctx.font = F(900, 84); let w = ctx.measureText(text).width + 90; const k = Math.min(1, 1000 / w); ctx.scale(k, k);
    rr(-w / 2, -70, w, 140, 30); ctx.fillStyle = i === s.lines.length - 1 ? 'rgba(255,122,26,0.16)' : C.card; ctx.fill();
    ctx.strokeStyle = i === s.lines.length - 1 ? 'rgba(255,122,26,0.7)' : C.stroke; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = col(c); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 4);
    ctx.restore();
  });
  source(t, s.source);
};
S.compare = (t, d, s) => {
  if (s.tag) tagPill(t, 0.05, s.tag, s.tagColor || 'gold');
  title(t, 0.1, s.title);
  if (s.subtitle) pop(t, 0.2, s.subtitle, 540, 450, { size: 38, weight: 500, color: 'muted', maxW: 980 });
  const items = s.items || [], n = items.length, max = Math.max(...items.map(i => i.value)) || 1;
  const base = 1240, maxH = 600, gap = 50, cw = Math.min(280, (980 - gap * (n - 1)) / n);
  const x0 = 540 - (n * cw + (n - 1) * gap) / 2;
  items.forEach((it, i) => {
    const a = at(i, n, d, 0.12, 0.55), g = easeInOut(prog(t, a, a + 1.0)), p = prog(t, a - 0.1, a + 0.2);
    const x = x0 + i * (cw + gap), h = maxH * (it.value / max) * g;
    ctx.save(); ctx.globalAlpha *= p;
    rr(x, base - maxH, cw, maxH, 24); ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fill();
    if (h > 4) {
      const gr = ctx.createLinearGradient(0, base - h, 0, base);
      gr.addColorStop(0, col(it.color || 'gold')); gr.addColorStop(1, 'rgba(255,255,255,0.08)');
      rr(x, base - h, cw, h, 24); ctx.fillStyle = gr; ctx.fill();
    }
    ctx.restore();
    txt(it.display || fmtIN(it.value), x + cw / 2, base - h - 26, { size: 52, weight: 900, color: it.color || 'gold', alpha: p * prog(t, a + 0.6, a + 0.9), maxW: cw + 40 });
    txt(it.label, x + cw / 2, base + 64, { size: 42, weight: 800, alpha: p, maxW: cw + 40 });
    if (it.sub) txt(it.sub, x + cw / 2, base + 112, { size: 32, weight: 500, color: 'muted', alpha: p, maxW: cw + 40 });
  });
  if (s.winner != null) {
    const it = items[s.winner], i = s.winner, x = x0 + i * (cw + gap);
    stamp(t, d * 0.78, s.winnerText || 'WINNER 🏆', x + cw / 2, base - maxH - 40, 'green', -0.08, 52);
  }
  source(t, s.source);
};
S.list = (t, d, s) => {
  if (s.tag) tagPill(t, 0.05, s.tag, s.tagColor || 'gold');
  title(t, 0.1, s.title);
  const items = s.items || [], n = items.length, hgt = n > 3 ? 175 : 210;
  items.forEach((it, i) => {
    const [head, sub] = Array.isArray(it) ? it : [it, ''];
    const a = at(i, n, d, 0.12, 0.7), p = easeOut(prog(t, a, a + 0.45));
    const y = 500 + i * (hgt + 28), x = 110 + (1 - p) * 260;
    const c = (s.colors && s.colors[i]) || s.color || 'gold';
    ctx.save(); ctx.globalAlpha *= p;
    card(x, y, 860, hgt, 1, c);
    ctx.fillStyle = col(c); ctx.beginPath(); ctx.arc(x + 95, y + hgt / 2, 46, 0, Math.PI * 2); ctx.fill();
    txt(s.icons ? s.icons[i] : String(i + 1), x + 95, y + hgt / 2 + (s.icons ? 18 : 22), { size: s.icons ? 48 : 58, weight: 900, color: '#0b1020' });
    txt(head, x + 170, y + hgt / 2 + (sub ? -8 : 18), { size: 48, weight: 800, align: 'left', maxW: 660 });
    if (sub) txt(sub, x + 170, y + hgt / 2 + 48, { size: 34, weight: 600, color: 'muted', align: 'left', maxW: 660 });
    ctx.restore();
  });
  source(t, s.source);
};
S.chart = (t, d, s) => {
  if (s.tag) tagPill(t, 0.05, s.tag, s.tagColor || 'gold');
  title(t, 0.1, s.title);
  const x0 = 130, x1 = 980, y0 = 1200, y1 = 560;
  const series = s.series || [], N = Math.max(...series.map(q => q.points.length)) - 1;
  const ymax = s.ymax || Math.max(...series.flatMap(q => q.points)) * 1.1;
  const X = i => x0 + (i / N) * (x1 - x0), Y = v => y0 - (v / ymax) * (y0 - y1);
  const pa = prog(t, 0.1, 0.4);
  ctx.save(); ctx.globalAlpha *= pa;
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 2;
  for (let k = 1; k <= 4; k++) { const v = ymax * k / 4.4; ctx.beginPath(); ctx.moveTo(x0, Y(v)); ctx.lineTo(x1, Y(v)); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
  (s.xticks || []).forEach(([i, lab]) => txt(lab, X(i), y0 + 50, { size: 32, weight: 600, color: 'muted' }));
  if (s.xlabel) txt(s.xlabel, 540, y0 + 100, { size: 30, weight: 500, color: 'muted' });
  ctx.restore();
  const g = easeInOut(prog(t, 0.4, Math.max(1.2, d * 0.75)));
  series.forEach((q, si) => {
    const n = q.points.length - 1, upto = g * n;
    const pts = [];
    for (let i = 0; i <= Math.floor(upto); i++) pts.push([X(i), Y(q.points[i])]);
    if (upto % 1 > 0 && Math.floor(upto) < n) { const i = Math.floor(upto), f = upto - i; pts.push([X(i + f), Y(q.points[i] + (q.points[i + 1] - q.points[i]) * f)]); }
    if (pts.length < 2) return;
    const c = col(q.color || (si ? 'amber' : 'green'));
    ctx.beginPath(); ctx.moveTo(pts[0][0], y0); pts.forEach(([x, y]) => ctx.lineTo(x, y)); ctx.lineTo(pts[pts.length - 1][0], y0); ctx.closePath();
    ctx.globalAlpha = 0.18; ctx.fillStyle = c; ctx.fill(); ctx.globalAlpha = 1;
    ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    ctx.strokeStyle = c; ctx.lineWidth = 8; ctx.lineJoin = 'round'; ctx.stroke();
    const [hx, hy] = pts[pts.length - 1];
    ctx.fillStyle = c; ctx.beginPath(); ctx.arc(hx, hy, 13, 0, Math.PI * 2); ctx.fill();
    if (q.end && g > 0.97) txt(q.end, hx - 10, hy - 30, { size: 46, weight: 900, color: q.color || c, align: 'right', alpha: prog(t, d * 0.75, d * 0.75 + 0.3) });
  });
  series.forEach((q, i) => {
    const lx = 140 + i * 420;
    ctx.globalAlpha = pa; ctx.fillStyle = col(q.color || (i ? 'amber' : 'green')); ctx.fillRect(lx, 1318, 44, 14);
    txt(q.label, lx + 60, 1336, { size: 36, weight: 700, align: 'left', alpha: pa }); ctx.globalAlpha = 1;
  });
  source(t, s.source);
};
function bubble(x, y, w, lines, o = {}) {
  const { bg = '#1f2937', size = 25, alpha = 1, scale = 1 } = o;
  if (alpha <= 0) return 0;
  const lh = size * 1.35, h = lines.length * lh + 30;
  ctx.save(); ctx.globalAlpha *= clamp(alpha); ctx.translate(x, y); ctx.scale(scale, scale); ctx.translate(-x, -y);
  rr(x, y, w, h, 22); ctx.fillStyle = bg; ctx.fill();
  lines.forEach((l, i) => txt(l, x + 20, y + 15 + lh * (i + 0.78), { size, weight: 600, align: 'left', maxW: w - 40 }));
  ctx.restore();
  return h;
}
S.phone = (t, d, s) => {
  if (s.tag) tagPill(t, 0.05, s.tag, s.tagColor || 'red', 220);
  title(t, 0.1, s.title, 330, 76);
  const PW = 460, PH = 900, cx = 540, cy = 930 + Math.sin(t * 1.5) * 8, sc = 0.98;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc);
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 26;
  rr(-PW / 2 - 18, -PH / 2 - 18, PW + 36, PH + 36, 70); ctx.fillStyle = '#1e293b'; ctx.fill();
  ctx.shadowColor = 'transparent'; ctx.strokeStyle = '#475569'; ctx.lineWidth = 4; ctx.stroke();
  ctx.save(); rr(-PW / 2, -PH / 2, PW, PH, 54); ctx.clip(); ctx.translate(-PW / 2, -PH / 2);
  const g = ctx.createLinearGradient(0, 0, 0, PH); g.addColorStop(0, '#0b1324'); g.addColorStop(1, '#111827');
  ctx.fillStyle = g; ctx.fillRect(0, 0, PW, PH);
  ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, PW, 140);
  txt(s.header || 'Messages', PW / 2, 110, { size: 28, weight: 800 });
  let y = 170;
  (s.bubbles || []).forEach((b, i) => {
    const lines = Array.isArray(b) ? b : [b];
    const a = at(i, s.bubbles.length, d, 0.1, 0.5), p = easeBack(prog(t, a, a + 0.35));
    if (p > 0) y += bubble(20, y, 420, lines, { bg: i % 2 ? '#7f1d1d' : '#1f2937', size: 31, scale: p, alpha: p }) + 14;
  });
  ctx.restore();
  rr(-70, -PH / 2 + 16, 140, 34, 17); ctx.fillStyle = '#000'; ctx.fill();
  ctx.restore();
  if (s.stamp) stamp(t, d * 0.68, s.stamp, 540, 940, s.stampColor || 'red', -0.14, 104);
  if (s.bottom) pop(t, d * 0.75, s.bottom, 540, 1440, { size: 46, weight: 800, color: s.bottomColor || 'text', maxW: 980 });
};
S.mythfact = (t, d, s) => {
  if (s.tag) tagPill(t, 0.05, s.tag, s.tagColor || 'gold');
  title(t, 0.1, s.title);
  const p1 = easeOut(prog(t, 0.2, 0.6));
  card(110, 500, 860, 300, p1, 'red');
  txt('❌ MYTH', 180, 580, { size: 40, weight: 900, color: 'red2', align: 'left', alpha: p1 });
  txt(s.myth, 540, 690, { size: 54, weight: 800, alpha: p1, maxW: 800 });
  const sk = easeInOut(prog(t, d * 0.4, d * 0.4 + 0.4));
  if (sk > 0) { ctx.strokeStyle = C.red; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(150, 680); ctx.lineTo(150 + 780 * sk, 680); ctx.stroke(); }
  const p2 = easeBack(prog(t, d * 0.5, d * 0.5 + 0.45));
  if (p2 > 0) {
    ctx.save(); ctx.translate(540, 1050); ctx.scale(p2, p2); ctx.translate(-540, -1050);
    card(110, 880, 860, 340, 1, 'green');
    txt('✅ FACT', 180, 960, { size: 40, weight: 900, color: 'green2', align: 'left' });
    (Array.isArray(s.fact) ? s.fact : [s.fact]).forEach((l, i) => txt(l, 540, 1060 + i * 66, { size: 50, weight: 800, maxW: 800 }));
    ctx.restore();
  }
  source(t, s.source);
};
S.cta = (t, d, s) => {
  if (s.top) pop(t, 0.05, s.top, 540, 360, { size: 64, weight: 900, maxW: 980 });
  if (s.topSub) pop(t, 0.2, s.topSub, 540, 440, { size: 44, weight: 600, color: 'muted', maxW: 980 });
  const p = easeBack(prog(t, 0.1, 0.7));
  if (logo && p > 0) {
    const g = ctx.createRadialGradient(540, 800, 0, 540, 800, 380);
    g.addColorStop(0, `rgba(255,122,26,${0.25 * clamp(p)})`); g.addColorStop(1, 'rgba(255,122,26,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 400, W, 800);
    ctx.save(); ctx.globalAlpha *= clamp(p); ctx.translate(540, 800); ctx.scale(p, p);
    ctx.strokeStyle = 'rgba(255,122,26,0.55)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(0, 0, 290, t * 1.2, t * 1.2 + Math.PI * 1.3); ctx.stroke();
    ctx.drawImage(logo, -255, -255, 510, 510); ctx.restore();
  }
  const q = easeBack(prog(t, 0.5, 1.0)) * (1 + 0.04 * Math.sin(t * 6));
  txt(s.cta || 'Follow karo 🔔', 540, 1170, { size: 100, weight: 900, color: 'gold', scale: Math.max(0, q), alpha: clamp(q) });
  pop(t, 0.6, 'Instagram: ' + HANDLE, 540, 1250, { size: 44, weight: 800, color: 'text', maxW: 980 });
  if (s.disclaimer !== false) pop(t, 0.7, s.disclaimer || 'Educational purpose only.', 540, 1300, { size: 28, weight: 500, color: 'muted', maxW: 980 });
  if (spec.sources) pop(t, 0.8, 'Sources: ' + spec.sources, 540, 1342, { size: 26, weight: 500, color: 'rgba(148,163,184,0.85)', maxW: 980 });
};

// ---------- frame ----------
function background(t) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#0b1a33'); g.addColorStop(1, '#070f1f');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const glow = (cx, cy, rad, c) => { const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad); rg.addColorStop(0, c); rg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H); };
  glow(540 + Math.sin(t * 0.5) * 300, 650, 780, 'rgba(255,122,26,0.11)');
  glow(540 + Math.cos(t * 0.4) * 300, 1500, 700, 'rgba(96,165,250,0.08)');
  for (let i = 0; i < 40; i++) {
    const sp = 20 + hash(i + 3) * 55, x = hash(i) * W + Math.sin(t * 0.6 + i) * 30, y = H - ((hash(i + 7) * H + t * sp) % H);
    ctx.fillStyle = `rgba(255,255,255,${0.05 + hash(i + 11) * 0.1})`; ctx.beginPath(); ctx.arc(x, y, 1.5 + hash(i + 5) * 3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.025)'; ctx.lineWidth = 1;
  const off = (t * 12) % 90;
  for (let y = -90 + off; y < H; y += 90) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
}
// karaoke captions
const chunks = [];
tl.scenes.forEach(sc => {
  let cur = [];
  sc.words.forEach((w, i) => {
    cur.push(w);
    const chars = cur.map(c => c.w).join(' ').length;
    if (cur.length >= 4 || chars >= 24 || (/[.,!?…:]$/.test(w.w) && cur.length >= 2) || i === sc.words.length - 1) { chunks.push(cur); cur = []; }
  });
});
chunks.forEach((c, i) => { c.s = c[0].s - 0.05; c.e = i + 1 < chunks.length ? Math.min(chunks[i + 1][0].s - 0.05, c[c.length - 1].e + 0.8) : c[c.length - 1].e + 0.6; });
function captions(t) {
  const c = chunks.find(c => t >= c.s && t < c.e);
  if (!c) return;
  ctx.font = F(700, 50);
  const sp = ctx.measureText(' ').width, ws = c.map(w => ctx.measureText(w.w).width);
  const tw = ws.reduce((a, b) => a + b, 0) + sp * (c.length - 1), pw = Math.min(tw + 64, 1040), ph = 90, x = 540 - pw / 2, y = 1530;
  ctx.globalAlpha = Math.min(prog(t, c.s, c.s + 0.1), 1 - prog(t, c.e - 0.08, c.e));
  rr(x, y - ph / 2, pw, ph, 18); ctx.fillStyle = 'rgba(15,18,28,0.92)'; ctx.fill();
  ctx.strokeStyle = 'rgba(255,122,26,0.35)'; ctx.lineWidth = 2; ctx.stroke();
  let cx = x + 32; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  c.forEach((w, i) => { ctx.fillStyle = t >= w.s ? (i === c.findLastIndex(q => t >= q.s) ? C.gold2 : '#fff') : '#7d828c'; ctx.fillText(w.w, cx, y + 3); cx += ws[i] + sp; });
  ctx.globalAlpha = 1;
}
function watermark(t, a) {
  if (!mark || a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  const h = 92, w = h * mark.width / mark.height, x = 48 + w;
  ctx.drawImage(mark, 34, 30, w, h);
  ctx.font = F(900, 38); ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  const parts = [['HOW', '#f8fafc'], ['TO', C.orange], ['HINDI', '#f8fafc']];
  let cx = x; parts.forEach(([p, c]) => { ctx.fillStyle = c; ctx.fillText(p, cx, 30 + h * 0.38); cx += ctx.measureText(p).width; });
  ctx.font = F(600, 26); ctx.fillStyle = 'rgba(248,250,252,0.8)'; ctx.fillText(HANDLE, x, 30 + h * 0.8);
  ctx.restore();
}
const SHAKE_TYPES = { phone: 0.68 };
window.renderFrame = function (t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  background(t);
  let i = tl.scenes.findIndex(s => t < s.end);
  if (i < 0) i = tl.scenes.length - 1;
  const sc = tl.scenes[i], s = spec.scenes[i], lt = t - sc.start, d = sc.end - sc.start;
  // camera: shake on stamp, zoom-in on enter
  let sx = 0, sy = 0;
  if (SHAKE_TYPES[s.type] && s.stamp) { const a = d * SHAKE_TYPES[s.type]; if (lt > a && lt < a + 0.5) { const k = Math.exp(-(lt - a) * 9) * 24; sx = Math.sin((lt - a) * 90) * k; sy = Math.cos((lt - a) * 75) * k; } }
  if (s.type === 'compare' && s.winner != null) { const a = d * 0.78; if (lt > a && lt < a + 0.4) { const k = Math.exp(-(lt - a) * 10) * 16; sx = Math.sin((lt - a) * 90) * k; } }
  const enter = i === 0 ? 1 : easeOut(prog(lt, 0, 0.35));
  const scl = (1.1 - 0.1 * enter) * (1 + 0.01 * Math.sin(t * 0.8));
  ctx.save(); ctx.translate(sx, sy);
  ctx.globalAlpha = enter;
  ctx.translate(540, 960); ctx.scale(scl, scl); ctx.translate(-540, -960);
  (S[s.type] || S.hook)(lt, d, s, i === 0);
  ctx.restore(); ctx.globalAlpha = 1;
  if (i > 0 && lt < 0.16) { ctx.fillStyle = `rgba(255,255,255,${0.2 * (1 - lt / 0.16)})`; ctx.fillRect(0, 0, W, H); }
  const v = ctx.createRadialGradient(540, 960, 600, 540, 960, 1250);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.5)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  watermark(t, s.type === 'cta' ? 1 - prog(lt, 0, 0.3) : 0.92);
  captions(t);
  ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(0, 0, W, 8);
  ctx.fillStyle = C.gold; ctx.fillRect(0, 0, W * clamp(t / tl.total), 8);
};
window.DUR = tl.total;
renderFrame(0);
window.READY = true;
