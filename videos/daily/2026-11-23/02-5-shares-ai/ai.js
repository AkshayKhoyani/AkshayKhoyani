// Theme A with AI (OpenAI gpt-image-2) cinematic backgrounds + Ken Burns motion.
// Same voice/timeline as ../01-5-shares-breaking. Facts: ../STOCK_EVENTS.md.
const W = 1080, H = 1920;
const tl = await (await fetch('./timeline.json')).json();
const out = document.createElement('canvas'); out.width = W; out.height = H; out.id = 'out'; document.body.appendChild(out);
const ctx = out.getContext('2d');
const load = s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = s; });
const KEYS = ['hook', 's5', 's4', 's3', 's2', 's1', 'end'];
const imgs = await Promise.all(KEYS.map(k => load(`./img/${k}.png`)));
const [logo, logoDark] = await Promise.all([load('/brand/logo-transparent.png'), load('/brand/logo-dark.png')]);
await Promise.all(['900', '800', '700', '600'].map(w => document.fonts.load(`${w} 40px Inter`)));
await document.fonts.load('40px "Noto Color Emoji"', '🚨🔔🔁👆💥⏰🟢🟡🔴👀👇');

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const prog = (t, a, b) => clamp((t - a) / (b - a));
const easeOut = x => 1 - Math.pow(1 - x, 3);
const easeInOut = x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const easeBack = x => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const F = (w, s) => `${w} ${s}px Inter, "Noto Color Emoji", sans-serif`;
const L = i => tl.lines[i].start, E = i => tl.lines[i].end, A = (i, f) => L(i) + f * (E(i) - L(i));
const seg = t => { let i = tl.lines.findIndex(l => t < l.end + 0.14); return i < 0 ? tl.lines.length - 1 : i; };
function rr(x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function T(s, x, y, o = {}) {
  const { size = 60, w = 800, c = '#fff', a = 'center', maxW = 1000, alpha = 1, scale = 1, shadow = true } = o;
  if (alpha <= 0 || scale <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(alpha); ctx.font = F(w, size);
  let k = 1; const mw = ctx.measureText(s).width; if (mw > maxW) k = maxW / mw;
  ctx.translate(x, y); ctx.scale(k * scale, k * scale);
  if (shadow) { ctx.shadowColor = 'rgba(0,0,0,0.75)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 4; }
  ctx.fillStyle = c; ctx.textAlign = a; ctx.textBaseline = 'middle'; ctx.fillText(s, 0, 0); ctx.restore();
}
function chip(s, x, y, bg, scale = 1, size = 38) {
  if (scale <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale); ctx.font = F(800, size);
  const w = ctx.measureText(s).width + 56;
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 16;
  rr(-w / 2, -size * 0.85, w, size * 1.7, size * 0.85); ctx.fillStyle = bg; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#0b0b14'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, 0, 3); ctx.restore();
}

// ---------- cinematic background: Ken Burns + crossfade + grade ----------
const MOVES = [ // [zoom0, zoom1, panX0, panX1, panY0, panY1]
  [1.18, 1.05, 0, 0, -40, 20], [1.0, 1.14, -60, 40, 0, -30], [1.05, 1.2, 0, 0, 30, -30], [1.0, 1.12, 50, -40, 0, 0],
  [1.12, 1.0, -30, 30, -20, 20], [1.0, 1.18, 0, 0, 20, -40], [1.08, 1.0, 0, 0, 0, 0],
];
function drawImg(i, t, alpha) {
  if (alpha <= 0) return;
  const img = imgs[i], m = MOVES[i];
  const t0 = i ? L(i) - 0.3 : 0, t1 = E(i) + 0.5, p = easeInOut(prog(t, t0, t1));
  const z = m[0] + (m[1] - m[0]) * p, base = Math.max(W / img.width, H / img.height) * 1.04;
  const w = img.width * base * z, h = img.height * base * z;
  const x = (W - w) / 2 + m[2] + (m[3] - m[2]) * p, y = (H - h) / 2 + m[4] + (m[5] - m[4]) * p;
  ctx.globalAlpha = alpha; ctx.drawImage(img, x, y, w, h); ctx.globalAlpha = 1;
}
function background(t) {
  const i = seg(t);
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const prev = i - 1, tr = i ? prog(t, L(i) - 0.32, L(i) + 0.05) : 1;
  if (prev >= 0 && tr < 1) drawImg(prev, t, 1);
  drawImg(i, t, i ? easeInOut(tr) : 1);
  // grade: navy tint + readability gradients
  ctx.fillStyle = 'rgba(5,11,28,0.28)'; ctx.fillRect(0, 0, W, H);
  let g = ctx.createLinearGradient(0, 0, 0, 760); g.addColorStop(0, 'rgba(3,7,20,0.85)'); g.addColorStop(1, 'rgba(3,7,20,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, 760);
  g = ctx.createLinearGradient(0, 1150, 0, H); g.addColorStop(0, 'rgba(3,7,20,0)'); g.addColorStop(1, 'rgba(3,7,20,0.92)');
  ctx.fillStyle = g; ctx.fillRect(0, 1150, W, H - 1150);
  const v = ctx.createRadialGradient(540, 960, 520, 540, 960, 1200); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  // light sweep on transitions
  if (i && t > L(i) - 0.3 && t < L(i) + 0.25) {
    const k = prog(t, L(i) - 0.3, L(i) + 0.25), sx = -400 + k * 1900;
    const lg = ctx.createLinearGradient(sx - 220, 0, sx + 220, 0); lg.addColorStop(0, 'rgba(255,240,200,0)'); lg.addColorStop(0.5, 'rgba(255,240,200,0.35)'); lg.addColorStop(1, 'rgba(255,240,200,0)');
    ctx.save(); ctx.transform(1, 0, -0.35, 1, 0, 0); ctx.fillStyle = lg; ctx.fillRect(sx - 400, 0, 1000, H); ctx.restore();
  }
}

// ---------- content ----------
const ITEMS = [
  { line: 1, rank: 5, name: 'WELSPUN LIVING', big: '₹3,200 CR CAPEX', sub: '₹800 cr equity + ₹2,400 cr tak loan · board: 21 Nov', chips: [['🟡 Mixed: growth + naya karz', '#f4cf6a']] },
  { line: 2, rank: 4, name: 'LIC · COFORGE · ADANI GREEN · MEESHO', big: 'MSCI ENTRY', sub: '~$2 bn passive inflow (andaaza) · PI Industries bahar', chips: [['🟢 Inflow lean', '#4ade80'], ['🔴 PI Industries: outflow', '#f87171']] },
  { line: 3, rank: 3, name: 'ZEE ENTERTAINMENT', big: '₹600 CR BUYBACK', sub: '@ ₹91 / share · record date 25 Nov', chips: [['⏰ 23 Nov shayad aakhri din', '#f4cf6a'], ['🟢 Positive lean', '#4ade80']] },
  { line: 4, rank: 2, name: 'INDUSIND BANK', big: 'EX-CEO TERMINATED', sub: 'Clawback 24 Mar 2020 se · governance issue', chips: [['🟡 Governance, earnings nahi', '#f4cf6a']] },
  { line: 5, rank: 1, name: 'TATA STEEL × APL APOLLO', big: 'TUBES + COLORS', sub: 'Board approval 22 Nov · regulatory nod baaki', chips: [['🟢 Tata Steel', '#4ade80'], ['🟡 APL Apollo', '#f4cf6a']] },
];
const STAMP_AT = A(5, 0.72);
const shakeAmt = t => (t > STAMP_AT && t < STAMP_AT + 0.5) ? Math.exp(-(t - STAMP_AT) * 9) * 24 : 0;

function glassCard(it, t) {
  const t0 = L(it.line), t1 = E(it.line);
  const inP = easeBack(prog(t, t0 + 0.05, t0 + 0.6)), outP = easeInOut(prog(t, t1 - 0.25, t1 + 0.1));
  if (inP <= 0 || outP >= 1) return;
  const cy = 1000 + (1 - clamp(inP)) * 500 - outP * 300, tilt = (1 - clamp(inP)) * 0.35 + Math.sin(t * 1.2) * 0.012;
  ctx.save(); ctx.globalAlpha = 1 - outP; ctx.translate(540, cy); ctx.rotate(-tilt * 0.3); ctx.transform(1, tilt * 0.25, 0, 1, 0, 0);
  const cw = 940, ch = 500;
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 26;
  rr(-cw / 2, -ch / 2, cw, ch, 36); ctx.fillStyle = 'rgba(255,255,255,0.93)'; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.save(); rr(-cw / 2, -ch / 2, cw, ch, 36); ctx.clip();
  ctx.fillStyle = '#0b2545'; ctx.fillRect(-cw / 2, -ch / 2, cw, 120); ctx.fillStyle = '#dc2626'; ctx.fillRect(-cw / 2, -ch / 2 + 120, cw, 10);
  ctx.fillStyle = '#d4a62c'; ctx.fillRect(-cw / 2, ch / 2 - 18, cw, 18);
  // shine
  const sx = -cw + ((t - t0) * 900) % (cw * 3);
  const g = ctx.createLinearGradient(sx - 120, 0, sx + 120, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.5)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(-cw / 2, -ch / 2 + 130, cw, ch - 150);
  ctx.restore();
  T(it.name, 0, -ch / 2 + 62, { size: 50, w: 900, maxW: cw - 60, shadow: false });
  T(it.big, 0, -10, { size: 104, w: 900, c: '#0b2545', maxW: cw - 70, shadow: false });
  T(it.sub, 0, 120, { size: 34, w: 700, c: '#475569', maxW: cw - 70, shadow: false });
  ctx.restore();
}
function stamp(s, x, y, c, rot, size, t, at) {
  if (t < at) return;
  const p = easeOut(prog(t, at, at + 0.2)), sc = 2.6 - 1.6 * p;
  ctx.save(); ctx.globalAlpha = clamp(p * 1.5); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  ctx.font = F(900, size); const w = ctx.measureText(s).width + 70, h = size * 1.35;
  rr(-w / 2, -h / 2, w, h, 24); ctx.fillStyle = 'rgba(10,5,15,0.72)'; ctx.fill(); ctx.lineWidth = 12; ctx.strokeStyle = c; ctx.stroke();
  ctx.fillStyle = c; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, 0, size * 0.06); ctx.restore();
}
const confetti = Array.from({ length: 110 }, (_, i) => ({ a: (i / 110) * Math.PI * 2 + Math.sin(i) * 0.3, v: 500 + (i * 37) % 650, c: ['#f4cf6a', '#ef4444', '#4ade80', '#ffffff', '#60a5fa'][i % 5], s: 10 + (i * 13) % 16 }));
// gold dust particles (parallax foreground)
const dust = Array.from({ length: 70 }, (_, i) => ({ x: (i * 197) % W, y: (i * 389) % H, r: 1.5 + (i % 5), sp: 14 + (i % 7) * 9 }));

function overlays(t) {
  const sh = shakeAmt(t), sx = Math.sin(t * 60) * sh, sy = Math.cos(t * 50) * sh;
  dust.forEach(d => { const y = (d.y - t * d.sp + H * 10) % H; ctx.fillStyle = `rgba(244,207,106,${0.12 + (d.r / 30)})`; ctx.beginPath(); ctx.arc(d.x + Math.sin(t + d.y) * 12, y, d.r, 0, Math.PI * 2); ctx.fill(); });
  ctx.save(); ctx.translate(sx, sy);
  // BREAKING bar
  const y = 210;
  ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(620, y); ctx.lineTo(580, y + 110); ctx.lineTo(0, y + 110); ctx.closePath(); ctx.fillStyle = '#dc2626'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(620, y); ctx.lineTo(1080, y); ctx.lineTo(1080, y + 110); ctx.lineTo(580, y + 110); ctx.closePath(); ctx.fillStyle = '#ffffff'; ctx.fill();
  const shx = ((t * 500) % 1800) - 300; const sg = ctx.createLinearGradient(shx - 80, 0, shx + 80, 0);
  sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, 'rgba(255,255,255,0.35)'); sg.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = sg; ctx.fillRect(0, y, 620, 110);
  T('🚨 BREAKING', 300, y + 58, { size: 70, w: 900, shadow: false });
  ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 8); ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.arc(700, y + 55, 14, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
  T('LIVE · 23 NOV', 890, y + 58, { size: 44, w: 900, c: '#0b1020', shadow: false });
  // HOOK
  if (t < E(0) + 0.3) {
    const a = 1 - prog(t, E(0) - 0.2, E(0) + 0.3), p = 1 + 0.025 * Math.sin(t * 5);
    T('23 NOV 2026', 540, 470, { size: 104, w: 900, alpha: a, scale: p });
    T('IN 5 SHARES PAR', 540, 600, { size: 112, w: 900, alpha: a, scale: p });
    T('BADI KHABAR', 540, 730, { size: 124, w: 900, c: '#f4cf6a', alpha: a, scale: p });
    chip('#1 ??? sabse bada 👀', 540, 1300, '#ffffff', a * (1 + 0.04 * Math.sin(t * 6)), 44);
  }
  // countdown items
  const it = ITEMS.find(c => t >= L(c.line) && t <= E(c.line) + 0.15);
  if (it) {
    const t0 = L(it.line), outA = 1 - prog(t, E(it.line) - 0.2, E(it.line) + 0.1);
    const pr = easeBack(prog(t, t0 + 0.05, t0 + 0.45));
    T(`#${it.rank}`, 540, 520, { size: it.rank === 1 ? 250 : 220, w: 900, c: '#f4cf6a', scale: Math.max(0, pr), alpha: outA });
    if (it.rank === 1) T('NUMBER ONE', 540, 650, { size: 46, w: 900, alpha: outA * prog(t, t0 + 0.3, t0 + 0.6) });
    glassCard(it, t);
    it.chips.forEach(([s, bg], i) => { const at = t0 + 0.9 + i * 0.35; chip(s, 540, 1320 + i * 92, bg, easeBack(prog(t, at, at + 0.35)) * outA, 38); });
    if (it.rank === 1) {
      stamp('₹28,000 CR 💥', 540, 1000, '#ef4444', -0.12, 112, t, STAMP_AT);
      const cp = prog(t, STAMP_AT, STAMP_AT + 1.6);
      if (cp > 0 && cp < 1) confetti.forEach(q => {
        const d = q.v * easeOut(cp), x = 540 + Math.cos(q.a) * d, yy = 1000 + Math.sin(q.a) * d + 600 * cp * cp;
        ctx.globalAlpha = 1 - cp; ctx.fillStyle = q.c; ctx.save(); ctx.translate(x, yy); ctx.rotate(cp * 12 + q.a); ctx.fillRect(-q.s / 2, -q.s / 4, q.s, q.s / 2); ctx.restore();
      });
      ctx.globalAlpha = 1;
    }
  }
  // END CTA
  if (t >= L(6) - 0.1) {
    const lt = t - L(6), a = prog(lt, 0, 0.4);
    T('Aapke paas kaunsa share hai?', 540, 470, { size: 62, w: 900, alpha: a });
    T('Comment karo 👇', 540, 555, { size: 54, w: 800, c: '#f4cf6a', alpha: a });
    const p = easeBack(prog(lt, 0.2, 0.8));
    if (p > 0) {
      ctx.save(); ctx.globalAlpha = clamp(p); ctx.translate(540, 900); ctx.scale(p, p);
      ctx.strokeStyle = 'rgba(244,207,106,0.7)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, 280, t * 1.4, t * 1.4 + Math.PI * 1.3); ctx.stroke();
      ctx.drawImage(logoDark, -240, -240, 480, 480); ctx.restore();
    }
    T('Not investment advice. Sources: company filings via ANI, Business Standard, MSCI review coverage, Goodreturns.', 540, 1390, { size: 24, w: 500, c: 'rgba(226,232,240,0.9)', alpha: prog(lt, 0.6, 1) });
  }
  ctx.restore();
}
// captions (karaoke)
const chunks = [];
tl.lines.forEach(Ln => { let cur = []; Ln.words.forEach((w, i) => { cur.push(w); const ch = cur.map(c => c.w).join(' ').length; if (cur.length >= 4 || ch >= 24 || (/[.,!?…:]$/.test(w.w) && cur.length >= 2) || i === Ln.words.length - 1) { chunks.push(cur); cur = []; } }); });
chunks.forEach((c, i) => { c.s = c[0].s - 0.05; c.e = i + 1 < chunks.length ? Math.min(chunks[i + 1][0].s - 0.05, c[c.length - 1].e + 0.8) : c[c.length - 1].e + 0.6; });
function captions(t) {
  const c = chunks.find(c => t >= c.s && t < c.e); if (!c) return;
  ctx.font = F(700, 46); const sp = ctx.measureText(' ').width, ws = c.map(w => ctx.measureText(w.w).width);
  const tw = ws.reduce((a, b) => a + b, 0) + sp * (c.length - 1), pw = tw + 60, x = 540 - pw / 2, y = 1500;
  ctx.globalAlpha = Math.min(prog(t, c.s, c.s + 0.1), 1 - prog(t, c.e - 0.08, c.e));
  rr(x, y - 42, pw, 84, 18); ctx.fillStyle = 'rgba(10,13,22,0.9)'; ctx.fill(); ctx.strokeStyle = 'rgba(224,178,58,0.4)'; ctx.lineWidth = 2; ctx.stroke();
  let cx = x + 30; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  const last = c.findLastIndex(q => t >= q.s);
  c.forEach((w, i) => { ctx.fillStyle = t >= w.s ? (i === last ? '#f4cf6a' : '#fff') : '#7d828c'; ctx.fillText(w.w, cx, y + 3); cx += ws[i] + sp; });
  ctx.globalAlpha = 1;
}
function footer(t) {
  const y = 1590, big = t >= L(6), k = big ? 1 + 0.18 * easeBack(prog(t, L(6) + 0.3, L(6) + 0.8)) : 1;
  const slot = Math.floor(t / 2.4) % 2, ph = (t % 2.4) / 2.4;
  const btn = (x, label, bg, active) => {
    const press = active && ph > 0.35 && ph < 0.5 ? 0.9 : 1, pulse = active ? 1 + 0.06 * Math.max(0, Math.sin(ph * Math.PI * 2)) : 1;
    ctx.save(); ctx.translate(x, y); ctx.scale(k * press * pulse, k * press * pulse);
    ctx.font = F(900, 42); const w = ctx.measureText(label).width + 70;
    ctx.shadowColor = active ? bg : 'rgba(0,0,0,0.5)'; ctx.shadowBlur = active ? 34 : 12;
    rr(-w / 2, -40, w, 80, 40); ctx.fillStyle = bg; ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#0b1020'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, 0, 3);
    if (active && ph > 0.4 && ph < 0.75) { const r = (ph - 0.4) / 0.35; ctx.globalAlpha = 1 - r; ctx.strokeStyle = bg; ctx.lineWidth = 6; rr(-w / 2 - r * 30, -40 - r * 30, w + r * 60, 80 + r * 60, 40 + r * 30); ctx.stroke(); }
    ctx.restore();
  };
  btn(360, '🔔 FOLLOW', '#d4a62c', slot === 0); btn(720, '🔁 REPOST', '#ffffff', slot === 1);
  const hx = slot === 0 ? 420 : 780, hy = y + 60 - (ph > 0.35 && ph < 0.5 ? 0 : 18) + Math.sin(ph * Math.PI * 2) * 4;
  ctx.font = F(400, 64); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('👆', hx, hy);
}
function ticker(t) {
  const y = 1680, h = 70; ctx.fillStyle = '#d4a62c'; ctx.fillRect(0, y, W, h);
  const msg = 'TATA STEEL × APL APOLLO ₹28,000 CR  •  INDUSIND: EX-CEO TERMINATED, CLAWBACK  •  ZEE ₹600 CR BUYBACK  •  MSCI: LIC, COFORGE, ADANI GREEN, MEESHO  •  WELSPUN ₹3,200 CR CAPEX  •  ';
  ctx.font = F(800, 36); const mw = ctx.measureText(msg).width, off = (t * 160) % mw;
  ctx.save(); ctx.beginPath(); ctx.rect(230, y, W - 230, h); ctx.clip(); ctx.fillStyle = '#0b1020'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(msg + msg, 240 - off, y + h / 2 + 2); ctx.restore();
  ctx.fillStyle = '#0b2545'; ctx.fillRect(0, y, 230, h); T('MARKET', 115, y + h / 2 + 2, { size: 38, w: 900, c: '#f4cf6a', shadow: false });
}
function chrome(t) {
  // brand badge
  const s = 118, x = 56, y = 64;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 20; rr(x, y, s, s, 26); ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore();
  ctx.drawImage(logo, 250, 75, 755, 755, x + 14, y + 14, s - 28, s - 28);
  ctx.font = '500 26px "JetBrains Mono", monospace'; const tw = ctx.measureText('not advice').width + 28;
  rr(1020 - tw, 86, tw, 42, 8); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#e5e7eb'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText('not advice', 1006, 108);
  ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(0, 0, W, 8); ctx.fillStyle = '#d4a62c'; ctx.fillRect(0, 0, W * clamp(t / tl.total), 8);
  T('AI visuals', 1040, 1772, { size: 22, w: 500, c: 'rgba(255,255,255,0.5)', a: 'right', shadow: false });
}
window.renderFrame = t => {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  background(t); overlays(t); captions(t); footer(t); ticker(t); chrome(t);
};
window.DUR = tl.total;
renderFrame(0);
window.READY = true;
