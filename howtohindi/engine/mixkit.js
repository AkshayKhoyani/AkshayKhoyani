// HowToHindi MixKit: one reel mixes kinetic typography, story/cartoon, whiteboard, quiz and an engagement end card.
// Reel folder: spec.json (scenes) + timeline.json (engine/make_reel.py). Scene types: see engine/MIXKIT.md.
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
await document.fonts.load('40px "Noto Color Emoji"', '❤️🤍✈️🔁💬🔖👆📱🏦🏪🔀☕🤯✅❌🚨👀🧠⏱️🎉🎁💳🚀🇮🇳🔬🚇📈💥🤔😄🔔🌍🌕');

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
  const TAP = engage.taps || [0.7, 2.0, 3.3, 4.6];                       // like, share, repost, follow
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
  if (engage.note) txt(engage.note, 540, 1640, { font: FONT(600, 30), color: C.muted, alpha: prog(lt, 1.2, 1.6) * (1 - sh), maxW: 980 });
}


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

// ======================= MIX: spec + timeline driven =======================
const spec = await (await fetch('./spec.json')).json();
const tl = await (await fetch('./timeline.json')).json();
const DUR = tl.total;
const at = (i, n, d, start = 0.12, span = 0.7) => d * (start + span * (n > 1 ? i / (n - 1) : 0) * 0.9);
const colr = c => C[c] || c || C.white;
// word time (scene-local) of the first caption word matching re, or fallback
const wordAt = (sc, re, fb) => { const w = sc.words.find(w => re.test(w.w)); return w ? w.s - sc.start : fb; };

// ---- backgrounds ----
function bgKinetic(t, flash = 0) {
  ctx.fillStyle = '#060b18'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.translate(540, 960); ctx.rotate(-0.5);
  for (let i = -14; i < 14; i++) { ctx.fillStyle = i % 3 ? 'rgba(255,255,255,0.025)' : 'rgba(255,122,26,0.06)'; ctx.fillRect(i * 140 + (t * 90) % 140, -1400, 40, 2800); }
  ctx.restore();
  const g = ctx.createRadialGradient(540, 900, 0, 540, 900, 900); g.addColorStop(0, `rgba(255,122,26,${0.16 + flash})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function bgPaper() {
  ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(30,41,59,0.07)'; for (let y = 40; y < H; y += 60) for (let x = 30; x < W; x += 60) ctx.fillRect(x, y, 3, 3);
}
function bgGrid() {
  ctx.fillStyle = C.navy; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 2;
  for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
}
function bgStage(t) {
  ctx.fillStyle = '#0a0f24'; ctx.fillRect(0, 0, W, H);
  [[-0.35, 0], [0.35, 1.7]].forEach(([base, ph]) => {
    const a = base + Math.sin(t * 0.9 + ph) * 0.18; ctx.save(); ctx.translate(540 + base * 900, -40); ctx.rotate(a);
    const g = ctx.createLinearGradient(0, 0, 0, 1800); g.addColorStop(0, 'rgba(255,190,120,0.28)'); g.addColorStop(1, 'rgba(255,190,120,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(40, 0); ctx.lineTo(380, 1800); ctx.lineTo(-380, 1800); ctx.fill(); ctx.restore(); });
  const fl = ctx.createRadialGradient(540, 1800, 0, 540, 1800, 700); fl.addColorStop(0, 'rgba(255,122,26,0.3)'); fl.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = fl; ctx.fillRect(0, 1000, W, 920);
}
function bgSpace(t, ground = true) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#02040c'); g.addColorStop(1, '#0b1430'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 120; i++) { const a = 0.3 + 0.7 * Math.abs(Math.sin(t * 1.5 + i)); ctx.fillStyle = `rgba(255,255,255,${a * 0.8})`; ctx.fillRect(hash(i) * W, hash(i + 50) * H * 0.75, 2 + hash(i + 9) * 2, 2 + hash(i + 9) * 2); }
  if (!ground) return;
  ctx.fillStyle = '#9ca3af'; ctx.beginPath(); ctx.moveTo(0, 1300); ctx.quadraticCurveTo(540, 1180, 1080, 1300); ctx.lineTo(1080, H); ctx.lineTo(0, H); ctx.fill();
  ctx.fillStyle = '#6b7280'; [[200, 1420, 90], [760, 1520, 130], [470, 1700, 70], [930, 1360, 50], [120, 1650, 60]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.35, 0, 0, Math.PI * 2); ctx.fill(); });
  ctx.fillStyle = '#4b5563'; [[200, 1415, 70], [760, 1512, 100]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.25, 0, 0, Math.PI); ctx.fill(); });
}

// ---- whiteboard pen helpers ----
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const wob = (pts, amp = 3) => pts.map(([x, y]) => [x + (rnd() - 0.5) * amp, y + (rnd() - 0.5) * amp]);
const seg = (a, b, n = 18) => Array.from({ length: n + 1 }, (_, i) => [lerp(a[0], b[0], i / n), lerp(a[1], b[1], i / n)]);
const wrect = (x, y, w, h) => wob([...seg([x, y], [x + w, y]), ...seg([x + w, y], [x + w, y + h]), ...seg([x + w, y + h], [x, y + h]), ...seg([x, y + h], [x + 4, y - 3])]);
function drawPath(pts, k, color, w) {
  const n = Math.max(2, Math.floor(pts.length * clamp(k))); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); pts.slice(0, n).forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); return pts[n - 1];
}
function handText(s, x, y, k, size = 56, color = C.ink, align = 'center') {
  if (k <= 0) return null;
  ctx.save(); ctx.font = KALAM(size); const w = ctx.measureText(s).width; const x0 = align === 'center' ? x - w / 2 : x;
  ctx.beginPath(); ctx.rect(x0 - 10, y - size, (w + 20) * clamp(k), size * 2); ctx.clip();
  txt(s, x, y, { font: KALAM(size), color, align }); ctx.restore();
  return k < 1 ? [x0 + w * k, y + size * 0.2] : null;
}
function pen(tip) {
  if (!tip) return; ctx.save(); ctx.translate(tip[0], tip[1]); ctx.rotate(0.7); ctx.fillStyle = '#e2e8f0'; rr(-14, -190, 28, 170, 10); ctx.fill();
  ctx.fillStyle = C.orange; rr(-15, -60, 30, 44, 6); ctx.fill(); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(-8, -18); ctx.lineTo(8, -18); ctx.lineTo(0, 0); ctx.fill(); ctx.restore();
}

// ---- kinetic slam ----
function slam(lt, a, s, x, y, size, color, o = {}) {
  if (lt < a) return; const p = a <= 0 ? 1 : easeOut(prog(lt, a, a + 0.16));
  txt(s, x, y + (o.float ? Math.sin(lt * 2 + y) * 6 : 0), { font: ANTON(size), color: o.outline ? null : color, stroke: o.outline ? 6 : 0, strokeColor: color, scale: 2.6 - 1.6 * p, alpha: p, maxW: 1000, rot: o.rot || 0 });
}
function lineSpec(ln) { const [s, c = 'white', size = 150, style = ''] = ln; return { s, c: colr(c), size, outline: style === 'outline' }; }

const SC = {};
// HOOK: kinetic lines, fully visible on frame 0 (cover)
SC.hook = (lt, d, s, i) => {
  bgKinetic(lt);
  if (s.chip) pill(540, 480, s.chip, { font: FONT(900, 44), h: 84 });
  const L = (s.lines || []).map(lineSpec); let y = 620;
  L.forEach((l, k) => { y += l.size * 0.5; txt(l.s, 540, y + Math.sin(lt * 2 + k) * 6, { font: ANTON(l.size), color: l.outline ? null : l.c, stroke: l.outline ? 6 : 0, strokeColor: l.c, maxW: 1000, scale: i === 0 ? 1 : easeBack(prog(lt, k * 0.12, k * 0.12 + 0.35)) }); y += l.size * 0.62; });
  if (s.teaser) teaser(lt, 0.25, d, s.teaser);
};
// COUNT: slot-machine number + slammed words
SC.count = (lt, d, s) => {
  let flash = 0; [0.9, 1.4].forEach(b => { if (lt > b && lt < b + 0.4) flash = Math.max(flash, 0.2 * Math.exp(-(lt - b) * 10)); });
  bgKinetic(lt, flash);
  if (s.chip) pill(540, 470, s.chip, { font: FONT(900, 40), alpha: prog(lt, 0, 0.2) });
  const val = String(s.value), size = s.size || 280, k = easeOut(prog(lt, 0.1, 1.0));
  ctx.font = ANTON(size); const tw = ctx.measureText(val).width; let x = 540 - tw / 2;
  for (let i = 0; i < val.length; i++) {
    const ch = val[i], cw = ctx.measureText(ch).width;
    if (!/[0-9]/.test(ch)) { txt(ch, x + cw / 2, 760, { font: ANTON(size), color: colr(s.color || 'orange') }); x += cw; continue; }
    const kk = clamp(k * 1.45 - i * 0.08), roll = (1 - kk) * (12 + i * 5), cur = (+ch + Math.floor(roll)) % 10, frac = roll % 1;
    ctx.save(); ctx.beginPath(); ctx.rect(x - 4, 760 - size * 0.62, cw + 8, size * 1.1); ctx.clip();
    txt(String(cur), x + cw / 2, 760 - frac * size * 1.1, { font: ANTON(size), color: colr(s.color || 'orange') });
    txt(String((cur + 1) % 10), x + cw / 2, 760 - frac * size * 1.1 + size * 1.1, { font: ANTON(size), color: colr(s.color || 'orange') });
    ctx.restore(); x += cw;
  }
  let y = 760 + size * 0.62;
  (s.words || []).map(lineSpec).forEach((l, j) => { y += l.size * 0.55; slam(lt, 0.9 + j * 0.5, l.s, 540, y, l.size, l.c, { outline: l.outline }); y += l.size * 0.6; });
  if (s.source) txt(s.source, 540, y + 40, { font: FONT(600, 30), color: C.muted, alpha: prog(lt, 1.6, 1.9), maxW: 980 });
};
// STORY: cartoon scenes (chai | rocket | landing | rover)
const STORY = {};
STORY.chai = (lt, d, s) => {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1b2d55'); g.addColorStop(0.55, '#f08a4b'); g.addColorStop(0.56, '#3b3f4c'); g.addColorStop(1, '#2a2d38');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,220,150,0.9)'; ctx.beginPath(); ctx.arc(820, 880, 90, 0, Math.PI * 2); ctx.fill();
  [[0, 760, 180, 300], [170, 700, 140, 360], [300, 800, 200, 260], [520, 720, 160, 340], [690, 780, 220, 280], [900, 690, 180, 370]].forEach(([x, y, w, h], i) => {
    ctx.fillStyle = i % 2 ? '#0e1a33' : '#13244a'; ctx.fillRect(x, y, w, h);
    for (let r = 0; r < 6; r++) for (let c = 0; c < 3; c++) if (hash(i * 31 + r * 7 + c) > 0.55) { ctx.fillStyle = 'rgba(255,200,120,0.7)'; ctx.fillRect(x + 20 + c * (w - 40) / 3, y + 30 + r * 45, 22, 26); } });
  ctx.fillStyle = '#7c3f1d'; ctx.fillRect(560, 1180, 460, 330);
  for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? '#fff' : C.orange; ctx.beginPath(); ctx.moveTo(540 + i * 62, 1040); ctx.lineTo(602 + i * 62, 1040); ctx.lineTo(602 + i * 62, 1110); ctx.arc(571 + i * 62, 1110, 31, 0, Math.PI); ctx.fill(); }
  ctx.fillStyle = '#5b2d13'; ctx.fillRect(570, 1040, 14, 150); ctx.fillRect(1000, 1040, 14, 150);
  const b = s.bubbles || [];
  const talk = (k) => b[k] && lt > b[k][1] * d && lt < b[k][1] * d + 0.9 ? Math.abs(Math.sin(lt * 14)) : 0;
  person(800, 1050, { shirt: '#b45309', skin: '#a8714a', t: lt, s: 0.8, beard: true, mouth: talk(1) });
  ctx.fillStyle = '#7c3f1d'; ctx.fillRect(560, 1180, 460, 330); txt('CHAI ☕ ₹10', 790, 1290, { font: FONT(900, 52), color: C.yellow });
  ctx.fillStyle = '#e5e7eb'; rr(880, 1120, 90, 70, 14); ctx.fill();
  for (let k = 0; k < 3; k++) { ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 6; ctx.beginPath(); const sx = 900 + k * 25; ctx.moveTo(sx, 1110); ctx.bezierCurveTo(sx - 20, 1070 - (lt * 40) % 40, sx + 20, 1040, sx, 1000); ctx.stroke(); }
  ctx.fillStyle = '#fff'; rr(600, 1110, 110, 130, 10); ctx.fill(); for (let i = 0; i < 25; i++) if (hash(i + 2) > 0.45) { ctx.fillStyle = '#111'; ctx.fillRect(612 + (i % 5) * 18, 1122 + Math.floor(i / 5) * 18, 16, 16); }
  person(300, 1180, { shirt: '#2563eb', t: lt, arm: easeOut(prog(lt, 0.5 * d, 0.6 * d)), mouth: talk(0) });
  b.forEach(([txt_, f, x, y, flip]) => bubble(x, y, txt_, f * d, lt, flip));
  if (s.paid && lt > s.paid[1] * d) pill(420, 1000, s.paid[0], { bg: C.green, color: '#fff', scale: easeBack(prog(lt, s.paid[1] * d, s.paid[1] * d + 0.3)) });
};
function rocket(x, y, scale = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
  ctx.fillStyle = '#e5e7eb'; rr(-120, -300, 60, 300, 24); ctx.fill(); rr(60, -300, 60, 300, 24); ctx.fill();      // boosters
  ctx.fillStyle = C.orange; ctx.beginPath(); ctx.moveTo(-120, -290); ctx.quadraticCurveTo(-90, -380, -60, -290); ctx.fill(); ctx.beginPath(); ctx.moveTo(60, -290); ctx.quadraticCurveTo(90, -380, 120, -290); ctx.fill();
  ctx.fillStyle = '#f8fafc'; rr(-55, -560, 110, 560, 30); ctx.fill();                                              // core
  ctx.fillStyle = C.orange; ctx.beginPath(); ctx.moveTo(-55, -540); ctx.quadraticCurveTo(0, -700, 55, -540); ctx.fill();
  ctx.fillStyle = '#1e293b'; ctx.fillRect(-55, -330, 110, 22); ctx.fillRect(-55, -120, 110, 14);
  ctx.fillStyle = C.navy; ctx.beginPath(); ctx.arc(0, -440, 22, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
STORY.rocket = (lt, d, s) => {
  bgSpace(lt, false);
  const lift = Math.pow(prog(lt, 0.25 * d, 1.15 * d), 2.2) * 1500, shake = lt > 0.2 * d ? Math.sin(lt * 70) * 4 : 0;
  ctx.fillStyle = '#111827'; ctx.fillRect(0, 1500, W, 420);
  ctx.strokeStyle = '#475569'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(300, 1500); ctx.lineTo(300, 760); ctx.moveTo(360, 1500); ctx.lineTo(360, 760); ctx.stroke();
  for (let y = 780; y < 1500; y += 60) { ctx.beginPath(); ctx.moveTo(300, y); ctx.lineTo(360, y + 60); ctx.moveTo(360, y); ctx.lineTo(300, y + 60); ctx.stroke(); }
  const ry = 1480 - lift;
  if (lt > 0.18 * d) { // flame + smoke
    for (let k = 0; k < 3; k++) { const fx = [-90, 0, 90][k], fl = 160 + Math.sin(lt * 40 + k) * 40;
      const g = ctx.createLinearGradient(0, ry, 0, ry + fl); g.addColorStop(0, '#fff7ae'); g.addColorStop(0.4, C.orange); g.addColorStop(1, 'rgba(255,80,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(540 + fx - 30, ry); ctx.lineTo(540 + fx + 30, ry); ctx.lineTo(540 + fx, ry + fl); ctx.fill(); }
    for (let k = 0; k < 26; k++) { const q = prog(lt, 0.2 * d + k * 0.05, 0.2 * d + k * 0.05 + 2.2); if (q <= 0) continue;
      ctx.fillStyle = `rgba(203,213,225,${0.5 * (1 - q)})`; ctx.beginPath(); ctx.arc(540 + (hash(k) - 0.5) * 900 * q, 1500 - 60 * q, 60 + 160 * q, 0, Math.PI * 2); ctx.fill(); }
  }
  rocket(540 + shake, ry, 1);
  (s.cards || []).forEach(([a, b2], i) => { const p = easeBack(prog(lt, at(i, s.cards.length, d, 0.05, 0.6), at(i, s.cards.length, d, 0.05, 0.6) + 0.35)); if (p <= 0) return;
    ctx.save(); ctx.translate(540, 330 + i * 150); ctx.scale(p, p); rr(-430, -60, 860, 120, 30); ctx.fillStyle = 'rgba(11,26,51,0.9)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = C.orange; ctx.stroke();
    txt(a, -400, -14, { font: FONT(900, 44), color: C.orange, align: 'left', maxW: 800 }); txt(b2, -400, 32, { font: FONT(600, 34), align: 'left', maxW: 800 }); ctx.restore(); });
};
function lander(x, y, thrust = 0, lt = 0) {
  ctx.save(); ctx.translate(x, y);
  ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 10; [[-1, 1]].forEach(() => {}); [-1, 1].forEach(sg => { ctx.beginPath(); ctx.moveTo(sg * 70, 40); ctx.lineTo(sg * 130, 140); ctx.stroke(); ctx.beginPath(); ctx.moveTo(sg * 40, 50); ctx.lineTo(sg * 60, 140); ctx.stroke(); });
  ctx.fillStyle = '#cbd5e1'; [-130, -60, 60, 130].forEach(px => { ctx.beginPath(); ctx.ellipse(px, 142, 26, 8, 0, 0, Math.PI * 2); ctx.fill(); });
  const g = ctx.createLinearGradient(-110, -60, 110, 60); g.addColorStop(0, '#facc15'); g.addColorStop(0.5, '#d97706'); g.addColorStop(1, '#fde68a');
  ctx.fillStyle = g; rr(-110, -60, 220, 120, 14); ctx.fill();
  ctx.fillStyle = '#334155'; rr(-60, -120, 120, 64, 10); ctx.fill(); ctx.fillStyle = C.blue; rr(-46, -108, 92, 40, 6); ctx.fill();
  if (thrust > 0) { const fl = 90 * thrust + Math.sin(lt * 40) * 20; const fg = ctx.createLinearGradient(0, 60, 0, 60 + fl); fg.addColorStop(0, '#fff7ae'); fg.addColorStop(1, 'rgba(255,122,26,0)');
    ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(-26, 60); ctx.lineTo(26, 60); ctx.lineTo(0, 60 + fl); ctx.fill(); }
  ctx.restore();
}
STORY.landing = (lt, d, s) => {
  bgSpace(lt, true);
  ctx.fillStyle = '#3b82f6'; ctx.beginPath(); ctx.arc(860, 420, 70, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#22c55e'; ctx.beginPath(); ctx.ellipse(840, 400, 30, 22, 0.5, 0, Math.PI * 2); ctx.fill();
  const td = s.touch || 0.62, k = easeOut(prog(lt, 0, td * d)), y = lerp(260, 1150, k);
  lander(540, y, lt < td * d ? 1 : Math.max(0, 1 - (lt - td * d) * 3), lt);
  if (lt > td * d) for (let q = 0; q < 30; q++) { const p = prog(lt, td * d, td * d + 1.5); if (p >= 1) break;
    ctx.fillStyle = `rgba(209,213,219,${0.6 * (1 - p)})`; const sg = q % 2 ? 1 : -1; ctx.beginPath(); ctx.arc(540 + sg * (60 + hash(q) * 380) * p, 1290 - hash(q + 4) * 80 * p, 10 + 30 * hash(q + 8), 0, Math.PI * 2); ctx.fill(); }
  if (s.chip) pill(540, 300, s.chip, { font: FONT(900, 42), h: 84, scale: easeBack(prog(lt, 0.1, 0.45)) });
  if (s.stamp) stamp(lt, td * d + 0.2, s.stamp, 540, 1560, C.green2, -0.06, 76);
};
function roverDraw(x, y, lt) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = C.blue; ctx.save(); ctx.rotate(-0.25); rr(-150, -150, 260, 26, 6); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#d1d5db'; rr(-120, -90, 240, 90, 16); ctx.fill(); ctx.fillStyle = '#9ca3af'; rr(70, -140, 50, 60, 10); ctx.fill();
  ctx.fillStyle = '#1f2937'; [-100, -20, 60, 120].slice(0, 3).forEach(() => {}); [-95, 0, 95].forEach(wx => { ctx.beginPath(); ctx.arc(wx, 20, 30, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#6b7280'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(wx, 20); ctx.lineTo(wx + Math.cos(lt * 4) * 26, 20 + Math.sin(lt * 4) * 26); ctx.stroke(); });
  ctx.restore();
}
STORY.rover = (lt, d, s) => {
  bgSpace(lt, true);
  const x = lerp(260, 620, easeInOut(prog(lt, 0, 0.6 * d)));
  roverDraw(x, 1260, lt);
  if (lt > 0.35 * d) { const pulse = 0.5 + 0.5 * Math.sin(lt * 20); ctx.strokeStyle = `rgba(239,68,68,${0.5 + 0.5 * pulse})`; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x + 95, 1130); ctx.lineTo(x + 170, 1330); ctx.stroke();
    ctx.fillStyle = `rgba(239,68,68,${0.6 * pulse})`; ctx.beginPath(); ctx.arc(x + 170, 1330, 16, 0, Math.PI * 2); ctx.fill(); }
  if (s.title) { txt(s.title, 540, 310, { font: ANTON(96), scale: easeBack(prog(lt, 0, 0.35)) }); }
  if (s.sub) txt(s.sub, 540, 400, { font: FONT(700, 40), color: C.orange2, alpha: prog(lt, 0.2, 0.5) });
  const ec = easeBack(prog(lt, 0.5 * d, 0.5 * d + 0.4));
  if (ec > 0) { ctx.save(); ctx.translate(540, 680); ctx.scale(ec, ec); rr(-200, -170, 400, 340, 30); ctx.fillStyle = '#14532d'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = C.green2; ctx.stroke();
    txt('S', 0, -30, { font: ANTON(190), color: C.white }); txt('Sulphur ✓', 0, 110, { font: FONT(900, 50), color: C.green2 }); ctx.restore(); }
  (s.chips || []).forEach((c, i) => { const p = easeBack(prog(lt, 0.62 * d + i * 0.08, 0.62 * d + i * 0.08 + 0.3)); if (p > 0) pill(150 + (i % 4) * 260, 920 + Math.floor(i / 4) * 90, c, { font: FONT(800, 34), bg: 'rgba(255,255,255,0.14)', color: '#fff', h: 64, scale: p }); });
};
SC.story = (lt, d, s) => (STORY[s.scene] || STORY.chai)(lt, d, s);
// METRO: route with up to 4 stations and the "Sikka" coin
const ST_POS = [[300, 640], [780, 880], [300, 1120], [780, 1360]];
const metroCache = {};
function metroPts(n) { if (metroCache[n]) return metroCache[n]; const p = []; for (let i = 0; i < n - 1; i++) { const [x1, y1] = ST_POS[i], [x2, y2] = ST_POS[i + 1]; for (let k = 0; k <= 40; k++) { const u = k / 40; p.push([lerp(x1, x2, easeInOut(u)), lerp(y1, y2, u)]); } } return (metroCache[n] = p); }
SC.metro = (lt, d, s) => {
  bgGrid();
  const st = s.stations, n = st.length, pts = metroPts(n), iris = easeOut(prog(lt, 0, 0.4));
  txt(s.title || 'PAISE KA SAFAR 🚇', 540, 330, { font: ANTON(100), scale: iris });
  if (s.sub) txt(s.sub, 540, 430, { font: FONT(700, 40), color: C.orange2, alpha: iris });
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 34; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
  const go = easeInOut(prog(lt, 0.15 * d, 0.92 * d)), m = Math.floor(go * (pts.length - 1));
  ctx.strokeStyle = C.orange; ctx.beginPath(); pts.slice(0, m + 1).forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
  st.forEach(([name, info], i) => {
    const [x, y] = ST_POS[i], ta = lerp(0.15 * d, 0.92 * d, i / (n - 1)) - 0.1, rp = easeBack(prog(lt, ta, ta + 0.35)), reached = lt >= ta;
    ctx.fillStyle = reached ? C.orange : '#334155'; ctx.beginPath(); ctx.arc(x, y, 50, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 26, 0, Math.PI * 2); ctx.fill();
    const lx = x < 540 ? x + 80 : x - 80, al = x < 540 ? 'left' : 'right';
    txt(name, lx, y - 22, { font: FONT(900, 46), align: al, alpha: iris, maxW: 620 });
    if (rp > 0) pill(lx + (x < 540 ? 1 : -1) * 150, y + 44, info, { font: FONT(800, 32), bg: i === n - 1 ? C.green : 'rgba(255,255,255,0.14)', color: '#fff', h: 60, scale: rp });
  });
  const [cx, cy] = pts[m], bob = Math.sin(lt * 16) * 6;
  ctx.save(); ctx.translate(cx, cy - 70 + bob);
  ctx.fillStyle = '#facc15'; ctx.strokeStyle = '#a16207'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, 52, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  txt('₹', 0, 4, { font: FONT(900, 46), color: '#a16207' });
  ctx.fillStyle = '#111'; [-17, 17].forEach(dx => { ctx.beginPath(); ctx.arc(dx, -20, 7, 0, Math.PI * 2); ctx.fill(); });
  ctx.strokeStyle = '#111'; ctx.lineWidth = 6; [-1, 1].forEach(sg => { ctx.beginPath(); ctx.moveTo(sg * 16, 50); ctx.lineTo(sg * 16 + Math.sin(lt * 16) * 10 * sg, 78); ctx.stroke(); });
  ctx.restore();
};
// WHITEBOARD: gauge (credit score style)
SC.gauge = (lt, d, s) => {
  bgPaper(); seed = 11;
  let tip = handText(s.title || '', 540, 300, prog(lt, 0, 0.5), 84, C.navy);
  const cx = 540, cy = 980, R = 360, a0 = Math.PI, a1 = 2 * Math.PI;
  const segs = [[C.red, 0, 0.4], [C.orange, 0.4, 0.7], [C.green, 0.7, 1]];
  segs.forEach(([c, u0, u1], i) => { const k = prog(lt, 0.4 + i * 0.35, 0.75 + i * 0.35); if (k <= 0) return;
    const pts = wob(Array.from({ length: 31 }, (_, j) => { const a = lerp(a0 + (a1 - a0) * u0, a0 + (a1 - a0) * u1, j / 30); return [cx + Math.cos(a) * R, cy + Math.sin(a) * R]; }), 4);
    const p = drawPath(pts, k, c, 34); if (k < 1) tip = p; });
  const lo = s.lo ?? 300, hi = s.hi ?? 900;
  tip = handText(String(lo), cx - R, cy + 70, prog(lt, 1.5, 1.8), 64, C.ink) || tip;
  tip = handText(String(hi), cx + R, cy + 70, prog(lt, 1.8, 2.1), 64, C.ink) || tip;
  const nv = easeInOut(prog(lt, 2.0, 3.2)) * (s.needle ?? 0.8), na = a0 + (a1 - a0) * nv + Math.sin(lt * 3) * 0.02;
  if (lt > 2.0) { ctx.strokeStyle = C.ink; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(na) * (R - 70), cy + Math.sin(na) * (R - 70)); ctx.stroke(); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx, cy, 24, 0, Math.PI * 2); ctx.fill(); }
  (s.notes || []).forEach(([str, color, size], i) => { const a = 2.2 + i * 0.9; const p = handText(str, 540, 1180 + i * 95, prog(lt, a, a + 0.7), size || 56, colr(color || 'ink')); if (p) tip = p; });
  if (s.circle != null && lt > 3.4) { seed = 21; const n = (s.notes || []).length, cyy = 1180 + s.circle * 95; drawPath(wob(Array.from({ length: 70 }, (_, j) => { const a = j / 64 * Math.PI * 2; return [540 + Math.cos(a) * 470, cyy - 12 + Math.sin(a) * 70]; }), 6), prog(lt, 3.4, 4.0), C.red, 7); }
  pen(tip);
};
// WHITEBOARD: checklist
SC.wblist = (lt, d, s) => {
  bgPaper(); seed = 31;
  let tip = handText(s.title || '', 540, 300, prog(lt, 0, 0.5), 80, C.navy);
  const items = s.items || [], n = items.length;
  items.forEach(([head, note, color], i) => {
    const a = at(i, n, d, 0.06, 0.55), y = 520 + i * 300;
    const box = wrect(110, y - 70, 120, 120); const p1 = drawPath(box, prog(lt, a, a + 0.3), C.ink, 7); if (lt < a + 0.3 && lt > a) tip = p1;
    const p2 = handText(head, 270, y - 8, prog(lt, a + 0.3, a + 0.8), 62, colr(color || 'navy'), 'left'); if (p2) tip = p2;
    if (note) { const p3 = handText(note, 270, y + 60, prog(lt, a + 0.7, a + 1.0), 42, C.ink, 'left'); if (p3) tip = p3; }
    const tk = wob([[130, y - 10], [165, y + 30], [250, y - 110]], 3); const p4 = drawPath(seg(tk[0], tk[1], 8).concat(seg(tk[1], tk[2], 14)), prog(lt, a + 0.8, a + 1.05), C.green, 14); if (lt > a + 0.8 && lt < a + 1.05) tip = p4;
  });
  pen(tip);
};
// QUIZ: question + countdown, or the revealed answer
SC.quiz = (lt, d, s) => {
  bgStage(lt);
  const reveal = !!s.reveal;
  pill(540, 230, s.chip || 'QUIZ TIME 🧠', { font: FONT(900, 44), h: 84, scale: 1 + 0.04 * Math.sin(lt * 5) });
  txt(s.title || 'Sahi jawab doge? 🤔', 540, 345, { font: ANTON(96) });
  rr(70, 430, 940, 330, 40); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,122,26,0.6)'; ctx.stroke();
  const q = s.question || ['', '']; txt(q[0], 540, 545, { font: FONT(800, 54), maxW: 880 }); txt(q[1], 540, 630, { font: FONT(900, 62), color: C.orange2, maxW: 880 });
  (s.options || []).forEach((opt, i) => {
    const ok = i === s.answer, y = 900 + i * 200, rv = reveal ? prog(lt, 0.05, 0.35) : 0;
    const shake = reveal && !ok && lt < 0.65 ? Math.sin(lt * 60) * 14 * (1 - prog(lt, 0, 0.6)) : 0;
    const hot = ok && rv > 0 ? 1 + 0.05 * Math.sin(lt * 8) : 1, enter = reveal ? 1 : easeBack(prog(lt, 0.15 + i * 0.15, 0.5 + i * 0.15));
    if (enter <= 0) return;
    ctx.save(); ctx.translate(540 + shake, y); ctx.scale(hot * enter, hot * enter);
    rr(-420, -75, 840, 150, 75); ctx.fillStyle = rv > 0 ? (ok ? `rgba(34,197,94,${0.25 + 0.5 * rv})` : `rgba(239,68,68,${0.2 + 0.4 * rv})`) : 'rgba(255,255,255,0.1)'; ctx.fill();
    ctx.lineWidth = 5; ctx.strokeStyle = rv > 0 ? (ok ? C.green2 : C.red2) : 'rgba(255,255,255,0.3)'; ctx.stroke();
    ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(-330, 0, 50, 0, Math.PI * 2); ctx.fill();
    txt('AB'[i], -330, 4, { font: FONT(900, 56), color: '#111' }); txt(opt, 20, 4, { font: ANTON(80), maxW: 540 });
    if (rv > 0) txt(ok ? '✅' : '❌', 330, 4, { font: FONT(400, 70), scale: easeBack(rv) });
    ctx.restore();
  });
  if (!reveal) { // countdown in the last 3 seconds of the scene
    const c0 = d - 3.1; if (lt > c0) { const e = lt - c0, left = 3 - Math.floor(e), k = e % 1;
      ctx.lineWidth = 18; ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.beginPath(); ctx.arc(540, 1390, 105, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = left <= 1 ? C.red : C.orange; ctx.beginPath(); ctx.arc(540, 1390, 105, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - e / 3.1)); ctx.stroke();
      txt(String(clamp(left, 1, 3)), 540, 1398, { font: ANTON(130), scale: 1.25 - 0.25 * easeOut(clamp(k * 3)) }); }
    txt('Comment mein jawab LOCK karo 👇', 540, 1545, { font: FONT(800, 40), color: C.yellow, alpha: prog(lt, 0.8, 1.1) });
  } else {
    if (lt < 1.4) stamp(lt, 0.1, s.stamp || 'SAHI JAWAB ✅', 540, 1400, C.green2, -0.06, 74);
    for (let k = 0; k < 60; k++) { const qq = prog(lt, 0.1, 1.6 + hash(k) * 0.5); if (qq <= 0 || qq >= 1) continue;
      const ang = hash(k + 1) * Math.PI * 2, sp = 300 + hash(k + 7) * 700; ctx.globalAlpha = 1 - qq; ctx.fillStyle = [C.orange, C.green2, C.yellow, C.white, C.blue][k % 5];
      ctx.save(); ctx.translate(540 + Math.cos(ang) * sp * qq, 1100 + Math.sin(ang) * sp * qq + 700 * qq * qq); ctx.rotate(lt * 8 + k); ctx.fillRect(-10, -6, 20, 12); ctx.restore(); ctx.globalAlpha = 1; }
    const ex = easeBack(prog(lt, 1.35, 1.7));
    if (ex > 0 && s.explain) { ctx.save(); ctx.translate(540, 1400); ctx.scale(ex, ex); rr(-470, -150, 940, 300, 36); ctx.fillStyle = '#111c36'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = colr(s.explainColor || 'red2'); ctx.stroke();
      s.explain.forEach(([str, c, f], j) => txt(str, 0, -80 + j * 85 + (s.explain.length < 3 ? 40 : 0), { font: f === 'anton' ? ANTON(90) : FONT(800, 46), color: colr(c || 'white'), maxW: 880 })); ctx.restore(); }
  }
};
// ENGAGE: like -> share -> repost -> follow, taps synced to the voice
SC.engage = (lt, d, s, i, sc, t) => {
  bgKinetic(lt);
  const fb = [0.7, 2.0, 3.3, 4.6].map(x => x * d / 6.4);
  engage.taps = [wordAt(sc, /like/i, fb[0]), wordAt(sc, /share/i, fb[1]), wordAt(sc, /repost/i, fb[2]), wordAt(sc, /follow/i, fb[3])].map(x => Math.max(0.5, x + 0.15));
  for (let k = 1; k < 4; k++) engage.taps[k] = Math.max(engage.taps[k], engage.taps[k - 1] + 1.05);
  engage.note = spec.disclaimer || '';
  engage(lt, 0);
};

// ---- karaoke captions (from voice word timings) ----
const chunks = [];
tl.scenes.forEach((sc, si) => {
  if (spec.scenes[si].type === 'engage') return;
  let cur = [];
  sc.words.forEach((w, i) => { cur.push(w); const chars = cur.map(c => c.w).join(' ').length;
    if (cur.length >= 4 || chars >= 24 || (/[.,!?…:]$/.test(w.w) && cur.length >= 2) || i === sc.words.length - 1) { chunks.push(cur); cur = []; } });
});
chunks.forEach((c, i) => { c.s = c[0].s - 0.05; c.e = i + 1 < chunks.length ? Math.min(chunks[i + 1][0].s - 0.05, c[c.length - 1].e + 0.8) : c[c.length - 1].e + 0.6; });
function karaoke(t) {
  const c = chunks.find(c => t >= c.s && t < c.e); if (!c) return;
  ctx.font = FONT(800, 52);
  const sp = ctx.measureText(' ').width, ws = c.map(w => ctx.measureText(w.w).width);
  const tw = ws.reduce((a, b) => a + b, 0) + sp * (c.length - 1), pw = Math.min(tw + 64, 1040), ph = 92, x = 540 - pw / 2, y = 1660;
  ctx.globalAlpha = Math.min(prog(t, c.s, c.s + 0.1), 1 - prog(t, c.e - 0.08, c.e));
  rr(x, y - ph / 2, pw, ph, 20); ctx.fillStyle = 'rgba(10,14,26,0.92)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,122,26,0.5)'; ctx.lineWidth = 2; ctx.stroke();
  let cx = x + 32; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  c.forEach((w, i) => { ctx.fillStyle = t >= w.s ? (i === c.findLastIndex(q => t >= q.s) ? C.orange2 : '#fff') : '#7d828c'; ctx.fillText(w.w, cx, y + 3); cx += ws[i] + sp; });
  ctx.globalAlpha = 1;
}

window.renderFrame = function (t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  let i = tl.scenes.findIndex(s => t < s.end); if (i < 0) i = tl.scenes.length - 1;
  const sc = tl.scenes[i], s = spec.scenes[i], lt = t - sc.start, d = sc.end - sc.start;
  const enter = i === 0 ? 1 : easeOut(prog(lt, 0, 0.3));
  ctx.save(); ctx.translate(540, 960); const z = 1.08 - 0.08 * enter; ctx.scale(z, z); ctx.translate(-540, -960);
  (SC[s.type] || SC.hook)(lt, d, s, i, sc, t);
  ctx.restore();
  if (i > 0 && lt < 0.18) { ctx.fillStyle = `rgba(255,255,255,${0.35 * (1 - lt / 0.18)})`; ctx.fillRect(0, 0, W, H); }
  if (s.save) saveSticker(t, sc.start + (s.saveAt ?? 0.35) * d, Math.min(2.2, d * 0.6), s.saveY ?? 250);
  karaoke(t);
  watermark(true, 1);
  progressBar(t);
};
window.DUR = DUR;
renderFrame(0);
window.READY = true;
