// HowToHindi format demos: 4 animated reel formats + shared engagement layer.
// Each folder's index.html sets <body data-f="kinetic|whiteboard|story|quiz">.
// Renderer contract (engine/render3d.js): window.renderFrame(t), window.DUR, window.READY.
// Demo topic: UPI. Numbers used come from reels/01-upi-kaise-kaam-karta-hai/SOURCES.md.
const W = 1080, H = 1920;
const C = {
  orange: '#ff7a1a', orange2: '#ffa45c', navy: '#0b1a33', navy2: '#13284d', white: '#f8fafc',
  green: '#22c55e', green2: '#4ade80', red: '#ef4444', red2: '#f87171', blue: '#60a5fa',
  muted: '#94a3b8', ink: '#1e293b', paper: '#f7f4ec', yellow: '#fde047'
};
const HANDLE = '@howtohindi.official';
const FMT = document.body.dataset.f;

const out = document.createElement('canvas'); out.width = W; out.height = H; out.id = 'out';
document.body.appendChild(out);
const ctx = out.getContext('2d');
const load = src => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
const [logo, mark] = await Promise.all([load('/brand/logo-dark.png'), load('/brand/mark-dark.png')]);
const FS = '/engine/node_modules/@fontsource/';
for (const [fam, file, w] of [['Anton', 'anton/files/anton-latin-400-normal.woff2', '400'],
  ['Kalam', 'kalam/files/kalam-latin-400-normal.woff2', '400'], ['Kalam', 'kalam/files/kalam-latin-700-normal.woff2', '700']]) {
  const buf = await (await fetch(FS + file)).arrayBuffer();
  const ff = new FontFace(fam, buf, { weight: w }); await ff.load(); document.fonts.add(ff);
}
await Promise.all(['900', '800', '700', '600'].map(w => document.fonts.load(`${w} 40px Inter`)));
await document.fonts.load('40px "Noto Color Emoji"', '❤️🤍✈️🔁💬🔖👆📱🏦🏪🔀☕🤯✅❌🚨👀🧠⏱️🎉');

// ---------- helpers ----------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const prog = (t, a, b) => clamp((t - a) / (b - a));
const easeOut = x => 1 - Math.pow(1 - x, 3);
const easeInOut = x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const easeBack = x => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const hash = n => { const r = Math.sin(n * 12.9898) * 43758.5453; return r - Math.floor(r); };
const lerp = (a, b, k) => a + (b - a) * k;
const FONT = (w, s, fam = 'Inter') => `${w} ${s}px ${fam}, "Noto Color Emoji", sans-serif`;
const ANTON = s => `${s}px Anton, "Noto Color Emoji", sans-serif`;
const KALAM = (s, w = 700) => `${w} ${s}px Kalam, "Noto Color Emoji", sans-serif`;

function rr(x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function txt(s, x, y, o = {}) {
  const { font = FONT(800, 60), color = C.white, align = 'center', alpha = 1, scale = 1, maxW = 0, stroke = 0, strokeColor = '#000', base = 'middle', rot = 0 } = o;
  if (alpha <= 0 || scale <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(alpha); ctx.font = font;
  let sc = scale; if (maxW) { const w = ctx.measureText(s).width; if (w > maxW) sc *= maxW / w; }
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  ctx.textAlign = align; ctx.textBaseline = base;
  if (stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = stroke; ctx.strokeStyle = strokeColor; ctx.strokeText(s, 0, 0); }
  if (color) { ctx.fillStyle = color; ctx.fillText(s, 0, 0); }
  ctx.restore();
}
function pill(x, y, s, o = {}) {
  const { font = FONT(800, 40), bg = C.orange, color = '#0b0b14', pad = 34, h = 74, alpha = 1, scale = 1, stroke } = o;
  if (alpha <= 0 || scale <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(alpha); ctx.translate(x, y); ctx.scale(scale, scale);
  ctx.font = font; const w = ctx.measureText(s).width + pad * 2;
  rr(-w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = bg; ctx.fill();
  if (stroke) { ctx.lineWidth = 4; ctx.strokeStyle = stroke; ctx.stroke(); }
  ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, 0, 3);
  ctx.restore();
}
function stamp(t, at, s, x, y, color = C.red, rot = -0.14, size = 96) {
  if (t < at) return;
  const p = easeOut(prog(t, at, at + 0.2)), sc = 2.4 - 1.4 * p;
  ctx.save(); ctx.globalAlpha *= clamp(p * 1.5); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  ctx.font = FONT(900, size); const w = ctx.measureText(s).width + 70, h = size * 1.35;
  rr(-w / 2, -h / 2, w, h, 24); ctx.fillStyle = 'rgba(10,5,15,0.7)'; ctx.fill();
  ctx.lineWidth = 12; ctx.strokeStyle = color; ctx.stroke();
  ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, 0, size * 0.05);
  ctx.restore();
}
function finger(x, y, tapK = 0, alpha = 1) { // tapK 0..1 press amount
  if (alpha <= 0) return;
  const s = 1 - 0.18 * tapK;
  if (tapK > 0) { ctx.save(); ctx.globalAlpha = alpha * (1 - tapK) * 0.8; ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x, y, 30 + 60 * tapK, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
  txt('👆', x + 18, y + 64, { font: FONT(400, 120), alpha, scale: s });
}
function watermark(dark = false, a = 1) {
  if (!mark || a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  const h = 92, w = h * mark.width / mark.height, x = 48 + w;
  if (dark) { rr(22, 20, 470, 112, 26); ctx.fillStyle = 'rgba(11,26,51,0.92)'; ctx.fill(); }
  ctx.drawImage(mark, 34, 30, w, h);
  ctx.font = FONT(900, 38); ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  let cx = x; [['HOW', C.white], ['TO', C.orange], ['HINDI', C.white]].forEach(([p, c]) => { ctx.fillStyle = c; ctx.fillText(p, cx, 30 + h * 0.38); cx += ctx.measureText(p).width; });
  ctx.font = FONT(600, 26); ctx.fillStyle = 'rgba(248,250,252,0.85)'; ctx.fillText(HANDLE, x, 30 + h * 0.8);
  ctx.restore();
}
function progressBar(t, color = C.orange) {
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(0, 0, W, 8);
  ctx.fillStyle = color; ctx.fillRect(0, 0, W * clamp(t / DUR), 8);
}
// caption pill (stands in for the karaoke voice captions of the real reel)
function caption(s, t, a, b, light = false) {
  const al = Math.min(prog(t, a, a + 0.12), 1 - prog(t, b - 0.1, b));
  if (al <= 0) return;
  ctx.save(); ctx.globalAlpha = al; ctx.font = FONT(700, 48);
  const w = Math.min(ctx.measureText(s).width + 64, 1040);
  rr(540 - w / 2, 1640 - 45, w, 90, 18); ctx.fillStyle = light ? 'rgba(30,41,59,0.92)' : 'rgba(10,14,26,0.9)'; ctx.fill();
  ctx.strokeStyle = 'rgba(255,122,26,0.45)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, 540, 1643, 1000);
  ctx.restore();
}

// ---------- retention + engagement layer (shared by every format) ----------
// "End tak dekho" teaser: an open loop in the first seconds so people stay till the end.
function teaser(t, a, b, s = 'Last wali baat sabse important hai 👀', light = false) {
  const p = easeBack(prog(t, a, a + 0.4)) * (1 - prog(t, b - 0.25, b));
  if (p <= 0) return;
  pill(540, 1500, s, { font: FONT(800, 40), bg: light ? C.navy : 'rgba(255,255,255,0.12)', color: C.white, stroke: C.orange, scale: p, h: 84 });
}
// mid-reel SAVE sticker with finger tap
function saveSticker(t, a, dur = 2.2, y = 250) {
  const lt = t - a; if (lt < 0 || lt > dur) return;
  const p = easeBack(prog(lt, 0, 0.4)) * (1 - easeInOut(prog(lt, dur - 0.3, dur)));
  const x = 1080 - 330 * p;
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.05);
  rr(-10, -60, 380, 120, 22); ctx.fillStyle = C.yellow; ctx.fill();
  ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 20;
  txt('🔖 SAVE karo', 180, -16, { font: FONT(900, 42), color: '#111' });
  txt('baad mein kaam aayega', 180, 30, { font: FONT(700, 28), color: '#333' });
  ctx.restore();
  const tap = prog(lt, 0.7, 0.9) * (1 - prog(lt, 0.9, 1.15));
  finger(x + 300, y + 30, tap, prog(lt, 0.4, 0.6) * (1 - prog(lt, dur - 0.3, dur)));
  if (lt > 0.9) txt('Saved ✓', x + 180, y + 95, { font: FONT(800, 32), color: C.green2, alpha: prog(lt, 0.9, 1.1) * (1 - prog(lt, dur - 0.3, dur)) });
}
// end sequence: LIKE -> SHARE -> REPOST -> FOLLOW, each with a finger tap
const ENGAGE_DUR = 6.4;
function engage(t, t0) {
  const lt = t - t0; if (lt < 0) return;
  ctx.fillStyle = `rgba(5,10,22,${0.78 * easeOut(prog(lt, 0, 0.4))})`; ctx.fillRect(0, 0, W, H);
  const TAP = [0.7, 2.0, 3.3, 4.6];                       // like, share, repost, follow
  const step = lt < TAP[0] + 0.9 ? 0 : lt < TAP[1] + 0.9 ? 1 : lt < TAP[2] + 0.9 ? 2 : 3;
  const heads = [['Pasand aaya?', 'LIKE karo ❤️', C.red2], ['Kisi dost ko', 'SHARE karo ✈️', C.blue], ['Apni profile par', 'REPOST karo 🔁', C.green2], ['Aise aur explainers?', 'FOLLOW karo 🔔', C.orange]];
  const hk = easeBack(prog(lt, step === 0 ? 0.1 : TAP[step - 1] + 0.9, (step === 0 ? 0.1 : TAP[step - 1] + 0.9) + 0.35));
  txt(heads[step][0], 520, 430, { font: FONT(700, 54), color: C.white, scale: hk, maxW: 760 });
  txt(heads[step][1], 520, 540, { font: ANTON(118), color: heads[step][2], scale: hk, maxW: 800 });
  // step dots
  [0, 1, 2, 3].forEach(i => { ctx.fillStyle = i <= step ? C.orange : 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.arc(420 + i * 60, 640, 12, 0, Math.PI * 2); ctx.fill(); });
  // action rail
  const rail = [[880, '🤍', '❤️', 'Like'], [1050, '💬', '💬', 'Comment'], [1220, '✈️', '✈️', 'Share'], [1390, '🔁', '🔁', 'Repost']];
  const railIn = easeOut(prog(lt, 0.05, 0.45));
  const target = [0, 2, 3];
  rail.forEach(([y, off, on, lab], i) => {
    const x = 960 + (1 - railIn) * 200;
    const ti = target.indexOf(i), done = ti >= 0 && lt > TAP[ti] + 0.05;
    const pop = ti >= 0 ? 1 + 0.35 * Math.sin(Math.PI * prog(lt, TAP[ti], TAP[ti] + 0.35)) : 1;
    ctx.save(); ctx.translate(x, y); ctx.scale(pop, pop);
    ctx.beginPath(); ctx.arc(0, 0, 66, 0, Math.PI * 2);
    ctx.fillStyle = done ? (i === 0 ? 'rgba(239,68,68,0.3)' : i === 3 ? 'rgba(34,197,94,0.3)' : 'rgba(96,165,250,0.3)') : 'rgba(255,255,255,0.12)'; ctx.fill();
    if (step === (ti >= 0 ? ti : -1) && !done) { ctx.lineWidth = 5; ctx.strokeStyle = C.orange; ctx.stroke(); }
    ctx.restore();
    txt(done ? on : off, x, y + 4, { font: FONT(400, 64), scale: pop });
    txt(done && i === 3 ? 'Reposted' : lab, x, y + 96, { font: FONT(700, 28), color: done ? C.white : C.muted });
  });
  // like burst
  if (lt > TAP[0]) for (let k = 0; k < 9; k++) {
    const q = prog(lt, TAP[0] + k * 0.04, TAP[0] + 1.1 + k * 0.04); if (q <= 0 || q >= 1) continue;
    txt('❤️', 960 + Math.sin(k * 2.3) * 70 * q - 20 * q, 880 - 360 * q, { font: FONT(400, 46 + hash(k) * 30), alpha: 1 - q });
  }
  // share sheet
  const sh = easeOut(prog(lt, TAP[1] + 0.1, TAP[1] + 0.4)) * (1 - easeInOut(prog(lt, TAP[2] - 0.3, TAP[2])));
  if (sh > 0) {
    const y0 = 1920 - 430 * sh;
    rr(60, y0, 960, 440, 40); ctx.fillStyle = '#1b2742'; ctx.fill();
    txt('Kisko bhejoge?', 540, y0 + 60, { font: FONT(800, 40) });
    [['🧑', 'Best friend'], ['👨‍👩‍👧', 'Family group'], ['👩‍💼', 'Office group']].forEach(([e, n], i) => {
      const x = 240 + i * 300; txt(e, x, y0 + 160, { font: FONT(400, 84) }); txt(n, x, y0 + 240, { font: FONT(700, 30), color: C.muted });
      if (lt > TAP[1] + 0.6 + i * 0.15) txt('✅', x + 50, y0 + 120, { font: FONT(400, 40) });
    });
  }
  // follow card
  const fc = easeBack(prog(lt, TAP[2] + 0.7, TAP[2] + 1.1));
  if (fc > 0) {
    ctx.save(); ctx.translate(450, 1150); ctx.scale(fc, fc);
    rr(-380, -150, 760, 300, 40); ctx.fillStyle = '#16233f'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,122,26,0.7)'; ctx.stroke();
    if (logo) ctx.drawImage(logo, -360, -110, 220, 220);
    txt(HANDLE, -120, -60, { font: FONT(800, 38), align: 'left', maxW: 480 });
    txt('Simple explainers, Hinglish mein', -120, -10, { font: FONT(600, 28), color: C.muted, align: 'left', maxW: 480 });
    const followed = lt > TAP[3] + 0.08;
    rr(-120, 40, 460, 86, 20); ctx.fillStyle = followed ? '#334155' : C.orange; ctx.fill();
    txt(followed ? 'Following ✓' : 'Follow', 110, 84, { font: FONT(900, 44), color: followed ? C.white : '#111' });
    ctx.restore();
    if (followed) for (let k = 0; k < 40; k++) {
      const q = prog(lt, TAP[3] + 0.1, TAP[3] + 1.4 + hash(k) * 0.4); if (q <= 0 || q >= 1) continue;
      const ang = hash(k + 3) * Math.PI * 2, sp = 300 + hash(k + 9) * 500;
      ctx.fillStyle = [C.orange, C.white, C.green2, C.yellow, C.blue][k % 5]; ctx.globalAlpha = 1 - q;
      ctx.fillRect(560 + Math.cos(ang) * sp * q, 1230 + Math.sin(ang) * sp * q + 500 * q * q, 16, 10); ctx.globalAlpha = 1;
    }
  }
  // finger path between targets
  const pts = [[960, 880], [960, 1220], [960, 1390], [560, 1234]];
  let fx = 760, fy = 1500, tapK = 0;
  for (let i = 0; i < 4; i++) {
    const a = (i ? TAP[i - 1] + 0.35 : 0.2), b = TAP[i] - 0.12;
    if (lt >= a) { const k = easeInOut(prog(lt, a, b)); const [px, py] = i ? pts[i - 1] : [760, 1500]; fx = lerp(px, pts[i][0], k); fy = lerp(py, pts[i][1], k); }
    tapK = Math.max(tapK, Math.sin(Math.PI * prog(lt, TAP[i] - 0.1, TAP[i] + 0.15)));
  }
  finger(fx, fy, tapK, prog(lt, 0.2, 0.4));
  txt('Comment mein "UPI" likho 👇 agla part wahi', 540, 1600, { font: FONT(700, 34), color: C.muted, alpha: prog(lt, 1.2, 1.6) * (1 - sh), maxW: 980 });
}

// ======================= FORMAT 1: KINETIC TYPOGRAPHY =======================
const K = {
  DUR: 17.4, beats: [0, 2.1, 2.9, 3.7, 4.5, 6.8, 7.3, 9.1, 9.8],
  frame(t) {
    let sx = 0, sy = 0, flash = 0;
    K.beats.forEach(b => { if (t > b && t < b + 0.5 && b > 0) { const k = Math.exp(-(t - b) * 12); sx += Math.sin((t - b) * 95) * 22 * k; sy += Math.cos((t - b) * 80) * 18 * k; flash = Math.max(flash, 0.22 * k); } });
    ctx.fillStyle = '#060b18'; ctx.fillRect(0, 0, W, H);
    // moving diagonal stripes + glow
    ctx.save(); ctx.translate(540, 960); ctx.rotate(-0.5);
    for (let i = -14; i < 14; i++) { ctx.fillStyle = i % 3 ? 'rgba(255,255,255,0.025)' : 'rgba(255,122,26,0.06)'; ctx.fillRect(i * 140 + (t * 90) % 140, -1400, 40, 2800); }
    ctx.restore();
    const g = ctx.createRadialGradient(540, 900, 0, 540, 900, 900); g.addColorStop(0, `rgba(255,122,26,${0.16 + flash})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(sx, sy);
    const slam = (at, s, x, y, size, color, o = {}) => {
      if (t < at) return; const p = at <= 0 ? 1 : easeOut(prog(t, at, at + 0.16));
      const out = o.out ? 1 - prog(t, o.out, o.out + 0.2) : 1;
      txt(s, x, y + (o.float ? Math.sin(t * 2 + y) * 6 : 0), { font: ANTON(size), color: o.outline ? null : color, stroke: o.outline ? 6 : 0, strokeColor: color, scale: 2.6 - 1.6 * p, alpha: p * out, maxW: 1000, rot: o.rot || 0 });
    };
    if (t < 2.05) { // S0: hook (full on frame 0)
      const o = 1.9;
      pill(540, 520, 'UPI 🤯', { scale: 1, alpha: 1 - prog(t, o, o + 0.15) });
      slam(0, '₹10 KI CHAI', 540, 720, 170, C.white, { out: o, float: 1 });
      slam(0, '2 SECOND', 540, 940, 270, C.orange, { out: o, float: 1 });
      slam(0, 'MEIN KAISE?', 540, 1140, 150, C.white, { out: o, outline: 1, float: 1 });
      teaser(t, 0.3, 2.05);
    } else if (t < 5.6) { // S1: chain
      const out = 5.4;
      [['PHONE 📱', C.white], ['NPCI 🔀', C.orange], ['AAPKA BANK 🏦', C.white], ['DUKAAN 🏪', C.green2]].forEach(([s, c], i) => {
        const at = 2.1 + i * 0.8, y = 470 + i * 300;
        slam(at, s, 540, y, 150, c, { out, float: 1 });
        if (i < 3 && t > at + 0.25) { const k = easeOut(prog(t, at + 0.25, at + 0.6)) * (1 - prog(t, out, out + 0.2));
          ctx.strokeStyle = C.orange; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.globalAlpha = k;
          ctx.beginPath(); ctx.moveTo(540, y + 95); ctx.lineTo(540, y + 95 + 110 * k); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(510, y + 175 * k); ctx.lineTo(540, y + 95 + 110 * k); ctx.lineTo(570, y + 175 * k); ctx.stroke(); ctx.globalAlpha = 1; }
      });
      caption('PIN daalte hi request NPCI ke paas…', t, 2.1, 5.5);
    } else if (t < 8.75) { // S2: slot counter
      const out = 8.55;
      pill(540, 520, 'SIRF 1 MAHINE MEIN', { alpha: prog(t, 5.6, 5.8) * (1 - prog(t, out, out + 0.2)) });
      const k = easeOut(prog(t, 5.7, 6.7)), digits = '2,547';
      ctx.save(); ctx.globalAlpha = 1 - prog(t, out, out + 0.2); ctx.font = ANTON(280);
      const tw = ctx.measureText(digits).width; let x = 540 - tw / 2;
      for (let i = 0; i < digits.length; i++) {
        const ch = digits[i], cw = ctx.measureText(ch).width;
        if (ch === ',') { txt(',', x + cw / 2, 830, { font: ANTON(280), color: C.orange }); x += cw; continue; }
        const di = +ch, kk = clamp(k * 1.45 - i * 0.08), roll = (1 - kk) * (12 + i * 5), cur = (di + Math.floor(roll)) % 10, frac = roll % 1;
        ctx.save(); ctx.beginPath(); ctx.rect(x - 4, 650, cw + 8, 300); ctx.clip();
        txt(String(cur), x + cw / 2, 830 - frac * 300, { font: ANTON(280), color: C.orange });
        txt(String((cur + 1) % 10), x + cw / 2, 830 - frac * 300 + 300, { font: ANTON(280), color: C.orange });
        ctx.restore(); x += cw;
      }
      ctx.restore();
      slam(6.8, 'CRORE', 540, 1050, 210, C.white, { out });
      slam(7.3, 'UPI PAYMENTS', 540, 1240, 120, C.white, { out, outline: 1 });
      txt('NPCI data, October 2026', 540, 1380, { font: FONT(600, 30), color: C.muted, alpha: prog(t, 7.4, 7.7) * (1 - prog(t, out, out + 0.2)) });
      saveSticker(t, 6.4);
    } else if (t < 11) { // S3: PIN warning
      slam(8.8, 'PAISA LENE KE LIYE', 540, 640, 110, C.white, { float: 1 });
      slam(9.1, 'PIN?', 540, 900, 380, C.red, { float: 1 });
      stamp(t, 9.8, 'KABHI NAHI ❌', 540, 1200, C.red, -0.12, 100);
      caption('Ye rule yaad rakho, scam se bachoge', t, 9.0, 10.95);
    }
    ctx.restore();
    if (flash > 0) { ctx.fillStyle = `rgba(255,255,255,${flash})`; ctx.fillRect(0, 0, W, H); }
    engage(t, 11);
    watermark(false, 1);
    progressBar(t);
  }
};

// ======================= FORMAT 2: WHITEBOARD SKETCH =======================
const WB = (() => {
  // seeded wobbly path builders
  let seed = 1; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const wob = (pts, amp = 3) => pts.map(([x, y]) => [x + (rnd() - 0.5) * amp, y + (rnd() - 0.5) * amp]);
  const seg = (a, b, n = 18) => Array.from({ length: n + 1 }, (_, i) => [lerp(a[0], b[0], i / n), lerp(a[1], b[1], i / n)]);
  const rect = (x, y, w, h) => wob([...seg([x, y], [x + w, y]), ...seg([x + w, y], [x + w, y + h]), ...seg([x + w, y + h], [x, y + h]), ...seg([x, y + h], [x + 4, y - 3])]);
  const circ = (cx, cy, r) => wob(Array.from({ length: 64 }, (_, i) => { const a = i / 60 * Math.PI * 2 - 1.2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; }), 4);
  const curve = (a, c, b, n = 30) => wob(Array.from({ length: n + 1 }, (_, i) => { const k = i / n; return [(1 - k) ** 2 * a[0] + 2 * (1 - k) * k * c[0] + k * k * b[0], (1 - k) ** 2 * a[1] + 2 * (1 - k) * k * c[1] + k * k * b[1]]; }), 2);
  const head = (p, q) => { const ang = Math.atan2(p[1] - q[1], p[0] - q[0]); return [[p[0] - 34 * Math.cos(ang - 0.45), p[1] - 34 * Math.sin(ang - 0.45)], p, [p[0] - 34 * Math.cos(ang + 0.45), p[1] - 34 * Math.sin(ang + 0.45)]]; };
  const items = [], texts = [];
  const add = (at, dur, pts, color = C.ink, w = 7) => items.push({ at, dur, pts, color, w });
  const write = (at, dur, s, x, y, size = 54, color = C.ink, align = 'center') => texts.push({ at, dur, s, x, y, size, color, align });
  const arrow = (at, dur, a, c, b, color = C.orange) => { const cv = curve(a, c, b); add(at, dur * 0.8, cv, color, 8); add(at + dur * 0.8, dur * 0.2, head(cv[cv.length - 1], cv[cv.length - 4]), color, 8); return cv; };
  // title (on frame 0)
  write(-1, 0, 'UPI ka SECRET ROUTE 🤫', 540, 300, 92, C.navy);
  add(-1, 0, curve([180, 360], [540, 395], [900, 352]), C.orange, 10);
  write(-1, 0, '₹10 ki chai → sirf 2 second? 🤯', 540, 445, 54, C.orange);
  // hook sketch on frame 0 (erased at 0.8s): chai cup -> ? -> shop
  const hookItems = [];
  const hk = (pts, color = C.ink, w = 9) => hookItems.push({ pts, color, w });
  hk(wob([[190, 820], [370, 820], [345, 1060], [215, 1060], [190, 820]]));
  hk(curve([368, 870], [450, 920], [355, 1000], 16));
  [0, 1, 2].forEach(i => hk(curve([225 + i * 50, 800], [205 + i * 50, 740], [235 + i * 50, 690], 12), C.muted, 6));
  hk(curve([420, 940], [540, 880], [650, 940]), C.orange, 10); hk(head([650, 940], [610, 915]), C.orange, 10);
  hk(rect(720, 860, 200, 200)); hk(wob([[700, 860], [940, 860]]), C.orange, 10);
  const hookTexts = [['₹10', 280, 960, 60, C.green], ['?', 540, 830, 150, C.red], ['Dukaan', 820, 970, 46, C.ink], ['Kaise pahuncha? 🤔', 540, 1250, 80, C.navy]];
  // phone (top-left)
  add(1.0, 0.6, rect(130, 560, 170, 290)); add(1.6, 0.2, circ(215, 815, 14), C.ink, 5); add(1.6, 0.2, rect(150, 590, 130, 190), C.blue, 4);
  write(1.8, 0.4, 'Aapka phone', 215, 905, 44);
  write(1.8, 0.2, '₹10', 215, 690, 50, C.green);
  // NPCI (center)
  const a1 = arrow(2.3, 0.6, [310, 700], [420, 640], [450, 780]);
  add(2.9, 0.6, circ(570, 860, 125), C.navy, 9); write(3.4, 0.3, 'NPCI', 570, 865, 74, C.navy);
  write(3.6, 0.4, '(beech ka switch)', 570, 1020, 38, C.ink);
  // Bank A (bottom-left)
  const a2 = arrow(4.0, 0.6, [470, 960], [360, 1050], [300, 1140]);
  const bank = (x, y, c) => { add(4.6 + (x > 500 ? 1.4 : 0), 0.25, wob([[x - 110, y], [x, y - 70], [x + 110, y], [x - 110, y]]), c, 7);
    add(4.85 + (x > 500 ? 1.4 : 0), 0.4, rect(x - 95, y, 190, 150), c, 7);
    [-55, 0, 55].forEach((dx, i) => add(5.25 + (x > 500 ? 1.4 : 0) + i * 0.05, 0.12, wob(seg([x + dx, y + 20], [x + dx, y + 140], 6)), c, 6)); };
  bank(240, 1200, C.ink); write(5.4, 0.35, 'Aapka bank', 240, 1415, 44); write(5.6, 0.3, '− ₹10', 240, 1470, 50, C.red);
  // Bank B (bottom-right)
  const a3 = arrow(5.7, 0.4, [360, 1290], [560, 1340], [720, 1290]);
  bank(840, 1200, C.ink); write(6.8, 0.35, 'Dukaandaar ka bank', 840, 1415, 44); write(7.0, 0.3, '+ ₹10 ✓', 840, 1470, 50, C.green);
  // shop (top-right)
  const a4 = arrow(7.2, 0.5, [880, 1140], [990, 1000], [900, 880]);
  add(7.7, 0.25, wob([[740, 700], [1000, 700]]), C.orange, 9);
  [0, 1, 2, 3, 4].forEach(i => add(7.95 + i * 0.04, 0.08, curve([740 + i * 52, 700], [766 + i * 52, 750], [792 + i * 52, 700], 8), C.orange, 7));
  add(8.2, 0.4, rect(760, 720, 220, 140)); write(8.6, 0.3, 'Chai stall ☕', 870, 790, 40);
  // big number
  write(9.6, 0.6, '2,547 crore payments', 540, 1600, 70, C.navy);
  write(10.2, 0.3, 'sirf October 2026 mein (NPCI)', 540, 1680, 40, C.ink);
  add(10.3, 0.5, wob(Array.from({ length: 70 }, (_, i) => { const a = i / 64 * Math.PI * 2; return [540 + Math.cos(a) * 430, 1610 + Math.sin(a) * 90]; }), 6), C.red, 7);
  const route = [...a1, ...a2, ...a3, ...a4];
  const drawPart = (it, k) => { const n = Math.max(2, Math.floor(it.pts.length * k)); ctx.strokeStyle = it.color; ctx.lineWidth = it.w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); it.pts.slice(0, n).forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); return it.pts[n - 1]; };
  return {
    DUR: 18.8,
    frame(t) {
      ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(30,41,59,0.07)'; for (let y = 40; y < H; y += 60) for (let x = 30; x < W; x += 60) ctx.fillRect(x, y, 3, 3);
      ctx.fillStyle = 'rgba(0,0,0,0.04)'; ctx.fillRect(0, H - 40, W, 40);
      const ho = 1 - prog(t, 0.8, 1.1);
      if (ho > 0) { ctx.save(); ctx.globalAlpha = ho;
        hookItems.forEach(it => { ctx.strokeStyle = it.color; ctx.lineWidth = it.w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); it.pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); });
        hookTexts.forEach(([s, x, y, z, c]) => txt(s, x, y, { font: KALAM(z), color: c })); ctx.restore(); }
      let tip = null;
      items.forEach(it => { if (t < it.at) return; const k = it.dur ? prog(t, it.at, it.at + it.dur) : 1; const p = drawPart(it, k); if (k < 1) tip = p; });
      texts.forEach(tx => { if (t < tx.at) return; const k = tx.dur ? prog(t, tx.at, tx.at + tx.dur) : 1;
        ctx.save(); ctx.font = KALAM(tx.size); const w = ctx.measureText(tx.s).width; const x0 = tx.align === 'center' ? tx.x - w / 2 : tx.x;
        ctx.beginPath(); ctx.rect(x0 - 10, tx.y - tx.size, (w + 20) * k, tx.size * 2); ctx.clip();
        txt(tx.s, tx.x, tx.y, { font: KALAM(tx.size), color: tx.color, align: tx.align }); ctx.restore();
        if (k < 1) tip = [x0 + w * k, tx.y + tx.size * 0.2]; });
      // coin travelling along the drawn route
      if (t > 8.6 && t < 13.2) { const k = prog(t, 8.6, 11.4) % 1, i = Math.min(route.length - 1, Math.floor(k * route.length)), [cx, cy] = route[i];
        ctx.fillStyle = C.yellow; ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(cx, cy, 34, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        txt('₹', cx, cy + 3, { font: KALAM(44), color: C.ink }); }
      // marker pen at the drawing tip
      if (tip) { ctx.save(); ctx.translate(tip[0], tip[1]); ctx.rotate(0.7); ctx.fillStyle = '#e2e8f0'; rr(-14, -190, 28, 170, 10); ctx.fill();
        ctx.fillStyle = C.orange; rr(-15, -60, 30, 44, 6); ctx.fill(); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(-8, -18); ctx.lineTo(8, -18); ctx.lineTo(0, 0); ctx.fill(); ctx.restore(); }
      teaser(t, 0.3, 2.4, 'End mein ek SCAM wali baat 🚨', true);
      caption('Aapka ₹10 asal mein 4 jagah se guzarta hai', t, 2.3, 8.5, true);
      saveSticker(t, 10.9, 2.2, 1000);
      engage(t, 12.4);
      watermark(true, 1);
      progressBar(t);
    }
  };
})();

// ======================= FORMAT 3: STORY (cartoon + metro map) =======================
function person(x, y, o = {}) {
  const { shirt = C.navy, skin = '#c98b5e', hair = '#1f1410', s = 1, arm = 0, t = 0, mouth = 0, beard = false } = o;
  ctx.save(); ctx.translate(x, y + Math.sin(t * 3 + x) * 3); ctx.scale(s, s);
  ctx.fillStyle = '#1e293b'; rr(-48, 150, 40, 170, 16); ctx.fill(); rr(8, 150, 40, 170, 16); ctx.fill();          // legs
  ctx.fillStyle = shirt; rr(-70, -10, 140, 190, 50); ctx.fill();                                                  // body
  ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(0, -80, 72, 0, Math.PI * 2); ctx.fill();                         // head
  ctx.fillStyle = hair; ctx.beginPath(); ctx.arc(0, -100, 74, Math.PI * 1.02, Math.PI * 1.98); ctx.fill();        // hair
  const blink = (t * 1.3 + x) % 3 < 0.12 ? 0.15 : 1;
  ctx.fillStyle = '#111'; [-26, 26].forEach(dx => { ctx.beginPath(); ctx.ellipse(dx, -82, 8, 10 * blink, 0, 0, Math.PI * 2); ctx.fill(); });
  if (beard) { ctx.fillStyle = hair; ctx.beginPath(); ctx.arc(0, -55, 52, 0.15 * Math.PI, 0.85 * Math.PI); ctx.fill(); }
  ctx.strokeStyle = '#5b2a1a'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, -52, 20 + mouth * 4, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  // arm (raised holding phone when arm=1)
  ctx.strokeStyle = shirt; ctx.lineWidth = 36; ctx.beginPath(); ctx.moveTo(55, 20);
  const hx = 55 + lerp(30, 70, arm), hy = lerp(150, -40, arm); ctx.quadraticCurveTo(110, lerp(100, 40, arm), hx, hy); ctx.stroke();
  ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(hx, hy, 22, 0, Math.PI * 2); ctx.fill();
  if (arm > 0.5) { ctx.fillStyle = '#0f172a'; rr(hx - 26, hy - 80, 52, 92, 10); ctx.fill(); ctx.fillStyle = C.orange; rr(hx - 19, hy - 72, 38, 70, 6); ctx.fill(); }
  ctx.restore();
}
function bubble(x, y, s, at, t, flip = false, color = '#fff') {
  const p = easeBack(prog(t, at, at + 0.35)); if (p <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(p, p); ctx.font = FONT(800, 44);
  const w = ctx.measureText(s).width + 60;
  rr(-w / 2, -50, w, 100, 30); ctx.fillStyle = color; ctx.fill();
  ctx.beginPath(); ctx.moveTo(flip ? 30 : -30, 45); ctx.lineTo(flip ? 60 : -60, 95); ctx.lineTo(flip ? 0 : 0, 45); ctx.fill();
  ctx.fillStyle = '#111'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, 0, 3); ctx.restore();
}
const STATIONS = [[300, 560, 'PHONE 📱', 'PIN check ✓'], [780, 820, 'NPCI 🔀', 'Sahi bank dhoondha'], [300, 1100, 'AAPKA BANK 🏦', '₹10 kata'], [780, 1360, 'DUKAAN KA BANK 🏪', '₹10 juda ✓']];
const metroPts = (() => { const p = []; for (let i = 0; i < 3; i++) { const [x1, y1] = STATIONS[i], [x2, y2] = STATIONS[i + 1];
  for (let k = 0; k <= 40; k++) { const u = k / 40; p.push([lerp(x1, x2, easeInOut(u)), lerp(y1, y2, u)]); } } return p; })();
const ST = {
  DUR: 17.6,
  frame(t) {
    if (t < 3.9) { // street scene
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1b2d55'); g.addColorStop(0.55, '#f08a4b'); g.addColorStop(0.56, '#3b3f4c'); g.addColorStop(1, '#2a2d38');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(255,220,150,0.9)'; ctx.beginPath(); ctx.arc(820, 880, 90, 0, Math.PI * 2); ctx.fill();
      [[0, 760, 180, 300], [170, 700, 140, 360], [300, 800, 200, 260], [520, 720, 160, 340], [690, 780, 220, 280], [900, 690, 180, 370]].forEach(([x, y, w, h], i) => {
        ctx.fillStyle = i % 2 ? '#0e1a33' : '#13244a'; ctx.fillRect(x, y, w, h);
        for (let r = 0; r < 6; r++) for (let c = 0; c < 3; c++) if (hash(i * 31 + r * 7 + c) > 0.55) { ctx.fillStyle = 'rgba(255,200,120,0.7)'; ctx.fillRect(x + 20 + c * (w - 40) / 3, y + 30 + r * 45, 22, 26); } });
      // stall
      ctx.fillStyle = '#7c3f1d'; ctx.fillRect(560, 1180, 460, 330);
      for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? '#fff' : C.orange; ctx.beginPath(); ctx.moveTo(540 + i * 62, 1040); ctx.lineTo(602 + i * 62, 1040); ctx.lineTo(602 + i * 62, 1110); ctx.arc(571 + i * 62, 1110, 31, 0, Math.PI); ctx.fill(); }
      ctx.fillStyle = '#5b2d13'; ctx.fillRect(570, 1040, 14, 150); ctx.fillRect(1000, 1040, 14, 150);
      person(800, 1050, { shirt: '#b45309', skin: '#a8714a', t, s: 0.8, beard: true, mouth: t > 1.8 && t < 2.6 ? Math.abs(Math.sin(t * 14)) : 0 });
      ctx.fillStyle = '#7c3f1d'; ctx.fillRect(560, 1180, 460, 330); txt('CHAI ☕ ₹10', 790, 1290, { font: FONT(900, 52), color: C.yellow });
      ctx.fillStyle = '#e5e7eb'; rr(880, 1120, 90, 70, 14); ctx.fill();
      for (let k = 0; k < 3; k++) { ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 6; ctx.beginPath(); const sx = 900 + k * 25; ctx.moveTo(sx, 1110); ctx.bezierCurveTo(sx - 20, 1070 - (t * 40) % 40, sx + 20, 1040, sx, 1000); ctx.stroke(); }
      // QR stand
      ctx.fillStyle = '#fff'; rr(600, 1110, 110, 130, 10); ctx.fill(); for (let i = 0; i < 25; i++) if (hash(i + 2) > 0.45) { ctx.fillStyle = '#111'; ctx.fillRect(612 + (i % 5) * 18, 1122 + Math.floor(i / 5) * 18, 16, 16); }
      person(300, 1180, { shirt: '#2563eb', t, arm: easeOut(prog(t, 2.2, 2.6)), mouth: t > 0.8 && t < 1.6 ? Math.abs(Math.sin(t * 14)) : 0 });
      bubble(300, 900, 'Bhaiya, UPI chalega?', 0.8, t);
      bubble(760, 870, 'Haan, scan karo! 😄', 1.8, t, true);
      if (t > 2.9) { const p = easeBack(prog(t, 2.9, 3.2)); pill(420, 1000, '₹10 Paid ✓', { bg: C.green, color: '#fff', scale: p }); }
      // hook card (frame 0)
      const hk = 1 - prog(t, 3.5, 3.8);
      ctx.save(); ctx.globalAlpha = hk; rr(70, 300, 940, 300, 40); ctx.fillStyle = 'rgba(11,26,51,0.88)'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = C.orange; ctx.stroke(); ctx.restore();
      txt('₹10 ki chai ☕', 540, 400, { font: ANTON(110), color: C.white, alpha: hk });
      txt('2 SECOND mein kaise pahuncha?', 540, 520, { font: ANTON(72), color: C.orange, alpha: hk, maxW: 880 });
      teaser(t, 0.4, 3.4, 'Paise ka safar dekho… end tak 👀');
      // iris zoom into phone
      if (t > 3.3) { const k = easeInOut(prog(t, 3.3, 3.9)); ctx.fillStyle = C.navy; ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.arc(420, 1180, Math.max(1, 1400 * (1 - k)), 0, Math.PI * 2, true); ctx.fill(); }
    } else { // metro map journey
      ctx.fillStyle = C.navy; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 2; for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      const lt = t - 3.9, iris = easeOut(prog(lt, 0, 0.5));
      txt('PAISE KA SAFAR 🚇', 540, 330, { font: ANTON(100), color: C.white, scale: iris });
      txt('₹10 ka route, seconds mein', 540, 420, { font: FONT(700, 40), color: C.orange2, alpha: iris });
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 34; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); metroPts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
      const go = easeInOut(prog(lt, 0.8, 5.6)), n = Math.floor(go * (metroPts.length - 1));
      ctx.strokeStyle = C.orange; ctx.lineWidth = 34; ctx.beginPath(); metroPts.slice(0, n + 1).forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
      STATIONS.forEach(([x, y, name, info], i) => {
        const reached = go * 3 >= i - 0.001, rp = easeBack(prog(lt, 0.8 + (5.6 - 0.8) * (i / 3) * 0.95, 1.1 + (5.6 - 0.8) * (i / 3) * 0.95));
        ctx.fillStyle = reached ? C.orange : '#334155'; ctx.beginPath(); ctx.arc(x, y, 50, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 26, 0, Math.PI * 2); ctx.fill();
        const lx = x < 540 ? x + 80 : x - 80, al = x < 540 ? 'left' : 'right';
        txt(name, lx, y - 22, { font: FONT(900, 46), align: al, alpha: iris });
        if (rp > 0) pill(lx + (x < 540 ? 1 : -1) * 150, y + 44, info, { font: FONT(800, 32), bg: i === 3 ? C.green : 'rgba(255,255,255,0.14)', color: '#fff', h: 60, scale: rp });
        if (rp > 0 && rp < 1) { ctx.strokeStyle = `rgba(255,122,26,${1 - rp})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x, y, 50 + 60 * rp, 0, Math.PI * 2); ctx.stroke(); }
      });
      // "Sikka" coin character
      const [cx, cy] = metroPts[n]; const bob = Math.sin(t * 16) * 6;
      ctx.save(); ctx.translate(cx, cy - 70 + bob);
      ctx.fillStyle = '#facc15'; ctx.strokeStyle = '#a16207'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, 52, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      txt('₹', 0, 14, { font: FONT(900, 46), color: '#a16207' });
      ctx.fillStyle = '#111'; [-17, 17].forEach(dx => { ctx.beginPath(); ctx.arc(dx, -16, 7, 0, Math.PI * 2); ctx.fill(); });
      ctx.strokeStyle = '#111'; ctx.lineWidth = 6; [-1, 1].forEach(sg => { ctx.beginPath(); ctx.moveTo(sg * 16, 50); ctx.lineTo(sg * 16 + Math.sin(t * 16) * 10 * sg, 78); ctx.stroke(); });
      ctx.restore();
      txt('Sikka', cx, cy - 150 + bob, { font: FONT(800, 30), color: C.yellow });
      caption(['Pehle stop: aapka phone', 'NPCI sahi bank dhoondhta hai', 'Aapke bank se ₹10 kata', 'Dukaandaar ke bank mein juda ✓'][Math.min(3, Math.floor(go * 3.999))], t, 4.4, 11.2);
      if (lt > 6) stamp(t, 10.1, 'DONE ✓', 540, 1600, C.green2, -0.08, 80);
      saveSticker(t, 8.6, 2.2, 1500);
      engage(t, 11.2);
    }
    watermark(true, 1);
    progressBar(t);
  }
};

// ======================= FORMAT 4: QUIZ / CHALLENGE =======================
const QZ = {
  DUR: 17.4,
  frame(t) {
    ctx.fillStyle = '#0a0f24'; ctx.fillRect(0, 0, W, H);
    // moving spotlights
    [[-0.35, 0], [0.35, 1.7]].forEach(([base, ph]) => {
      const a = base + Math.sin(t * 0.9 + ph) * 0.18; ctx.save(); ctx.translate(540 + base * 900, -40); ctx.rotate(a);
      const g = ctx.createLinearGradient(0, 0, 0, 1800); g.addColorStop(0, 'rgba(255,190,120,0.28)'); g.addColorStop(1, 'rgba(255,190,120,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(40, 0); ctx.lineTo(380, 1800); ctx.lineTo(-380, 1800); ctx.fill(); ctx.restore(); });
    const fl = ctx.createRadialGradient(540, 1800, 0, 540, 1800, 700); fl.addColorStop(0, 'rgba(255,122,26,0.3)'); fl.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = fl; ctx.fillRect(0, 1000, W, 920);
    if (t < 11) {
      const reveal = 5.2;
      pill(540, 230, 'QUIZ TIME 🧠', { font: FONT(900, 44), h: 84, scale: 1 + 0.04 * Math.sin(t * 5) });
      txt('Sahi jawab doge? 🤔', 540, 345, { font: ANTON(96), color: C.white });
      // question card
      rr(70, 430, 940, 330, 40); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,122,26,0.6)'; ctx.stroke();
      txt('Paisa RECEIVE karne ke liye', 540, 535, { font: FONT(800, 54), maxW: 880 });
      txt('UPI PIN daalna padta hai?', 540, 615, { font: FONT(900, 62), color: C.orange2, maxW: 880 });
      txt('Sawaal 1 / 2', 540, 705, { font: FONT(700, 32), color: C.muted });
      // options
      [['A', 'HAAN', false], ['B', 'NAHI', true]].forEach(([l, s, ok], i) => {
        const y = 900 + i * 200, rv = prog(t, reveal, reveal + 0.3);
        const shake = !ok && t > reveal && t < reveal + 0.6 ? Math.sin((t - reveal) * 60) * 14 * (1 - prog(t, reveal, reveal + 0.6)) : 0;
        const hot = ok && rv > 0 ? 1 + 0.05 * Math.sin(t * 8) : 1;
        ctx.save(); ctx.translate(540 + shake, y); ctx.scale(hot, hot);
        rr(-420, -75, 840, 150, 75); ctx.fillStyle = rv > 0 ? (ok ? `rgba(34,197,94,${0.25 + 0.5 * rv})` : `rgba(239,68,68,${0.2 + 0.4 * rv})`) : 'rgba(255,255,255,0.1)'; ctx.fill();
        ctx.lineWidth = 5; ctx.strokeStyle = rv > 0 ? (ok ? C.green2 : C.red2) : 'rgba(255,255,255,0.3)'; ctx.stroke();
        ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(-330, 0, 50, 0, Math.PI * 2); ctx.fill();
        txt(l, -330, 4, { font: FONT(900, 56), color: '#111' }); txt(s, 20, 4, { font: ANTON(92) });
        if (rv > 0) txt(ok ? '✅' : '❌', 330, 4, { font: FONT(400, 70), scale: easeBack(rv) });
        ctx.restore();
      });
      // countdown
      if (t > 1.6 && t < reveal) {
        const left = 3 - Math.floor((t - 1.9) / 1.1), k = ((t - 1.9) / 1.1) % 1;
        ctx.lineWidth = 18; ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.beginPath(); ctx.arc(540, 1440, 110, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = left <= 1 ? C.red : C.orange; ctx.beginPath(); ctx.arc(540, 1440, 110, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - (t - 1.9) / 3.3)); ctx.stroke();
        txt(String(clamp(left, 1, 3)), 540, 1448, { font: ANTON(140), scale: t < 1.9 ? 1 : 1.25 - 0.25 * easeOut(clamp(k * 3)) });
        txt('Comment mein jawab LOCK karo 👇', 540, 1590, { font: FONT(800, 40), color: C.yellow, alpha: prog(t, 1.8, 2.1) });
      }
      if (t < 1.9) teaser(t, 0.3, 1.9, 'Sirf 3 second milenge ⏱️');
      if (t > reveal && t < 9.4) {
        stamp(t, reveal + 0.1, 'SAHI JAWAB: B ✅', 540, 1450, C.green2, -0.06, 78);
        for (let k = 0; k < 60; k++) { const q = prog(t, reveal + 0.1, reveal + 1.6 + hash(k) * 0.5); if (q <= 0 || q >= 1) continue;
          const ang = hash(k + 1) * Math.PI * 2, sp = 300 + hash(k + 7) * 700; ctx.globalAlpha = 1 - q; ctx.fillStyle = [C.orange, C.green2, C.yellow, C.white, C.blue][k % 5];
          ctx.save(); ctx.translate(540 + Math.cos(ang) * sp * q, 1100 + Math.sin(ang) * sp * q + 700 * q * q); ctx.rotate(t * 8 + k); ctx.fillRect(-10, -6, 20, 12); ctx.restore(); ctx.globalAlpha = 1; }
      }
      // explanation card
      const ex = easeBack(prog(t, 6.6, 7.0)) * (1 - prog(t, 9.2, 9.4));
      if (ex > 0) { ctx.save(); ctx.translate(540, 1440); ctx.scale(ex, ex); rr(-470, -170, 940, 340, 36); ctx.fillStyle = '#111c36'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = C.red2; ctx.stroke();
        txt('PIN sirf paisa BHEJNE ke liye', 0, -80, { font: FONT(900, 50), maxW: 880 });
        txt('"Receive" ke liye PIN maange =', 0, 10, { font: FONT(700, 44), color: C.muted, maxW: 880 });
        txt('SCAM 🚨', 0, 100, { font: ANTON(100), color: C.red }); ctx.restore(); }
      // level 2 teaser
      if (t > 9.3) { const p = easeBack(prog(t, 9.3, 9.7)); ctx.fillStyle = `rgba(5,10,22,${clamp(p)})`; ctx.fillRect(0, 0, W, H);
        txt('LEVEL 2 👀', 540, 860, { font: ANTON(200), color: C.orange, scale: p });
        txt('agla sawaal aur mushkil hai…', 540, 1010, { font: FONT(800, 54), scale: p });
        txt('Part 2 ke liye FOLLOW karo', 540, 1100, { font: FONT(700, 42), color: C.muted, scale: p }); }
      caption(t < 9.3 ? 'Jawab hai NAHI. PIN sirf bhejne ke liye!' : 'Level 2 aur mushkil hai', t, reveal + 0.2, 10.9);
      saveSticker(t, 9.5, 1.5, 1320);
    }
    engage(t, 11);
    watermark(true, 1);
    progressBar(t);
  }
};

const FORMATS = { kinetic: K, whiteboard: WB, story: ST, quiz: QZ };
const F = FORMATS[FMT];
const DUR = F.DUR;
window.renderFrame = t => { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; F.frame(t); };
window.DUR = DUR;
renderFrame(0);
window.READY = true;
