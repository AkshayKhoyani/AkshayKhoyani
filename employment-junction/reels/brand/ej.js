// Employment Junction reel engine: canvas helpers, branding, background.
// A reel's scene.html loads this, defines SCENES = [{dur, draw(t, p, T)}], then calls EJ.start().
// render.js drives it through window.renderFrame(t) / window.setTimeline(durs) / window.DUR.
(function () {
  const W = 1080, H = 1920;
  const C = {
    navy: '#071a3d', navy2: '#0b3d91', blue: '#3b82f6', sky: '#7dd3fc',
    gold: '#ffb703', saffron: '#ff9933', green: '#22c55e', green2: '#4ade80',
    red: '#ef4444', text: '#f8fafc', muted: '#9fb3d1',
    card: 'rgba(255,255,255,0.07)', stroke: 'rgba(255,255,255,0.14)'
  };
  const cv = document.getElementById('c');
  const ctx = cv.getContext('2d');
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const prog = (t, a, b) => clamp((t - a) / (b - a));
  const easeOut = x => 1 - Math.pow(1 - x, 3);
  const easeInOut = x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const easeBack = x => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
  const hash = n => { const r = Math.sin(n * 12.9898) * 43758.5453; return r - Math.floor(r); };
  const FONT = (w, s) => `${w} ${s}px Inter, "Noto Color Emoji", sans-serif`;

  function rrect(x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath(); ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function txt(s, x, y, o = {}) {
    const { size = 60, weight = 800, color = C.text, align = 'center', alpha = 1, scale = 1, dy = 0, base = 'alphabetic' } = o;
    if (alpha <= 0 || scale <= 0) return;
    ctx.save(); ctx.globalAlpha *= clamp(alpha);
    ctx.translate(x, y + dy); ctx.scale(scale, scale);
    ctx.font = FONT(weight, size); ctx.textAlign = align; ctx.textBaseline = base; ctx.fillStyle = color;
    ctx.fillText(s, 0, 0); ctx.restore();
  }
  const width = (s, size, weight = 800) => { ctx.save(); ctx.font = FONT(weight, size); const w = ctx.measureText(s).width; ctx.restore(); return w; };
  function pop(t, at, s, x, y, o = {}) {
    const p = easeOut(prog(t, at, at + 0.4));
    txt(s, x, y, { ...o, alpha: p * (o.alpha ?? 1), dy: (1 - p) * 40 });
  }
  // kinetic typography: words pop one by one; colors[i] per word
  function words(t, at, str, y, o = {}) {
    const size = o.size || 72, weight = o.weight || 900, step = o.step || 0.09;
    const ws = str.split(' '), sp = size * 0.28, widths = ws.map(w => width(w, size, weight));
    const total = widths.reduce((a, b) => a + b, 0) + sp * (ws.length - 1);
    let x = (o.cx ?? 540) - total / 2;
    ws.forEach((w, i) => {
      const p = easeBack(prog(t, at + i * step, at + i * step + 0.35));
      txt(w, x + widths[i] / 2, y, { size, weight, color: (o.colors && o.colors[i]) || o.color || C.text, scale: Math.max(0, p), alpha: clamp(p * 1.5) });
      x += widths[i] + sp;
    });
  }
  function pill(t, at, s, y, bg, fg = '#071a3d', size = 38) {
    const p = easeBack(prog(t, at, at + 0.4)); if (p <= 0) return;
    ctx.save(); ctx.translate(540, y); ctx.scale(p, p);
    const w = width(s, size) + 64;
    rrect(-w / 2, -size * 0.9, w, size * 1.8, size * 0.9); ctx.fillStyle = bg; ctx.fill();
    ctx.font = FONT(800, size); ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(s, 0, 2); ctx.restore();
  }
  // card sliding in from side; draw(x,y,w,h) for content
  function card(t, at, x, y, w, h, o = {}) {
    const p = easeOut(prog(t, at, at + 0.45)); if (p <= 0) return null;
    const dx = (1 - p) * (o.from === 'right' ? 160 : o.from === 'left' ? -160 : 0), dy = o.from ? 0 : (1 - p) * 80;
    ctx.save(); ctx.globalAlpha *= p; ctx.translate(dx, dy);
    rrect(x, y, w, h, o.r ?? 34);
    ctx.fillStyle = o.bg || C.card; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = o.border || C.stroke; ctx.stroke();
    if (o.accent) { ctx.save(); rrect(x, y, 14, h, 7); ctx.fillStyle = o.accent; ctx.fill(); ctx.restore(); }
    if (o.draw) o.draw(x, y, w, h);
    ctx.restore();
    return p;
  }
  // big number counting up
  function counter(t, at, dur, to, x, y, o = {}) {
    const p = easeOut(prog(t, at, at + dur)); if (t < at) return;
    const v = Math.round(to * p).toLocaleString('en-IN');
    const pulse = 1 + 0.06 * Math.sin(prog(t, at + dur, at + dur + 0.3) * Math.PI);
    txt((o.prefix || '') + v + (o.suffix || ''), x, y, { size: o.size || 220, weight: 900, color: o.color || C.gold, scale: pulse, alpha: clamp(p * 3) });
  }
  function stamp(t, at, s, x, y, col, rot = -0.14, size = 96) {
    if (t < at) return;
    const p = easeOut(prog(t, at, at + 0.2)), sc = 2.4 - 1.4 * p;
    ctx.save(); ctx.globalAlpha *= clamp(p * 1.5);
    ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
    ctx.font = FONT(900, size);
    const w = ctx.measureText(s).width + 70, h = size * 1.35;
    rrect(-w / 2, -h / 2, w, h, 24); ctx.fillStyle = 'rgba(7,26,61,0.75)'; ctx.fill();
    ctx.lineWidth = 11; ctx.strokeStyle = col; ctx.stroke();
    ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, 0, size * 0.06);
    ctx.restore();
  }
  function check(t, at, x, y, s, o = {}) {
    const p = easeBack(prog(t, at, at + 0.35)); if (p <= 0) return;
    const ok = o.ok !== false, col = ok ? C.green : C.red;
    ctx.save(); ctx.translate(x, y); ctx.scale(p, p);
    ctx.beginPath(); ctx.arc(0, 0, 34, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath();
    if (ok) { ctx.moveTo(-14, 1); ctx.lineTo(-3, 13); ctx.lineTo(16, -11); }
    else { ctx.moveTo(-12, -12); ctx.lineTo(12, 12); ctx.moveTo(12, -12); ctx.lineTo(-12, 12); }
    ctx.stroke(); ctx.restore();
    pop(t, at + 0.08, s, x + 64, y + (o.size || 50) * 0.36, { size: o.size || 50, weight: 800, align: 'left', color: o.color || C.text });
  }
  function source(t, at, s) { pop(t, at, s, 540, 1700, { size: 28, weight: 500, color: 'rgba(159,179,209,0.9)' }); }

  // ---------- Brand ----------
  function logo(cx, cy, size, alpha = 1) {
    if (alpha <= 0) return;
    ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(cx, cy);
    const s = size;
    rrect(-s / 2, -s / 2, s, s, s * 0.24);
    const g = ctx.createLinearGradient(-s / 2, -s / 2, s / 2, s / 2);
    g.addColorStop(0, '#1554c0'); g.addColorStop(1, '#0b3d91'); ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = s * 0.04; ctx.strokeStyle = C.gold; ctx.stroke();
    ctx.font = FONT(900, s * 0.46); ctx.fillStyle = C.gold; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('EJ', 0, s * 0.03);
    ctx.restore();
  }
  function watermark(alpha = 0.95) {
    if (alpha <= 0) return;
    ctx.save(); ctx.globalAlpha *= alpha;
    logo(34 + 40, 34 + 40, 80);
    txt('EMPLOYMENT', 134, 34 + 36, { size: 28, weight: 900, align: 'left', color: C.text });
    txt('JUNCTION', 134, 34 + 68, { size: 28, weight: 900, align: 'left', color: C.gold });
    ctx.restore();
  }
  function endCard(t, at) {
    const p = prog(t, at, at + 0.6); if (p <= 0) return;
    const e = easeBack(p);
    const g = ctx.createRadialGradient(540, 800, 0, 540, 800, 520);
    g.addColorStop(0, `rgba(255,183,3,${0.25 * p})`); g.addColorStop(1, 'rgba(255,183,3,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 300, W, 1000);
    ctx.save(); ctx.translate(540, 800); ctx.scale(e, e);
    ctx.strokeStyle = 'rgba(255,183,3,0.6)'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(0, 0, 230, t * 1.4, t * 1.4 + Math.PI * 1.3); ctx.stroke();
    ctx.restore();
    logo(540, 800, 300 * e, clamp(p * 1.5));
    pop(t, at + 0.35, 'EMPLOYMENT', 540, 1120, { size: 84, weight: 900 });
    pop(t, at + 0.5, 'JUNCTION', 540, 1215, { size: 84, weight: 900, color: C.gold });
    pop(t, at + 0.7, 'Sarkari Naukri ki har khabar', 540, 1300, { size: 40, weight: 600, color: C.muted });
    pill(t, at + 0.9, '📲 Follow @employmentjunction.in', 1430, C.gold, '#071a3d', 40);
  }

  // ---------- Background ----------
  function background(t) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0a2352'); g.addColorStop(0.55, C.navy); g.addColorStop(1, '#030b1c');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // soft moving glows
    [[C.blue, 0.18, 300, 500], [C.saffron, 0.12, 820, 1350]].forEach(([col, a, x, y], i) => {
      const gx = x + Math.sin(t * 0.4 + i) * 80, gy = y + Math.cos(t * 0.3 + i) * 60;
      const r = ctx.createRadialGradient(gx, gy, 0, gx, gy, 520);
      r.addColorStop(0, col + Math.round(a * 255).toString(16).padStart(2, '0')); r.addColorStop(1, col + '00');
      ctx.fillStyle = r; ctx.fillRect(0, 0, W, H);
    });
    // dotted grid
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    for (let y = 40; y < H; y += 60) for (let x = 30; x < W; x += 60) ctx.fillRect(x, y + ((t * 12) % 60), 3, 3);
    // particles
    for (let i = 0; i < 26; i++) {
      const x = hash(i) * W, sp = 20 + hash(i + 9) * 40, y = H - ((t * sp + hash(i + 3) * H) % (H + 40));
      ctx.fillStyle = `rgba(255,183,3,${0.15 + hash(i + 5) * 0.25})`;
      ctx.beginPath(); ctx.arc(x, y, 2 + hash(i + 7) * 3, 0, Math.PI * 2); ctx.fill();
    }
    // tricolour strip at the bottom
    ctx.fillStyle = C.saffron; ctx.fillRect(0, H - 14, W / 3, 14);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(W / 3, H - 14, W / 3, 14);
    ctx.fillStyle = '#138808'; ctx.fillRect(2 * W / 3, H - 14, W / 3, 14);
  }
  function vignette() {
    const v = ctx.createRadialGradient(540, 960, 500, 540, 960, 1200);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  }
  // progress bar on top
  function progressBar(t) {
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(0, 0, W, 8);
    ctx.fillStyle = C.gold; ctx.fillRect(0, 0, W * clamp(t / window.DUR), 8);
  }

  // ---------- Timeline ----------
  let starts = [];
  function layout() {
    starts = []; let s = 0;
    window.SCENES.forEach(sc => { if (sc.design == null) sc.design = sc.dur; starts.push(s); s += sc.dur; });
    window.DUR = s;
  }
  window.setTimeline = durs => { durs.forEach((d, i) => { if (window.SCENES[i]) window.SCENES[i].dur = d; }); layout(); };
  window.renderFrame = T => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    background(T);
    const sc = window.SCENES;
    let i = sc.length - 1;
    for (let k = 0; k < sc.length; k++) if (T < starts[k] + sc[k].dur) { i = k; break; }
    const t = T - starts[i], d = sc[i].dur;
    // zoom/fade transition in and out
    const inP = easeOut(prog(t, 0, 0.35)), outP = i < sc.length - 1 ? easeInOut(prog(t, d - 0.3, d)) : 0;
    ctx.save();
    ctx.globalAlpha = inP * (1 - outP);
    const z = 1 + (1 - inP) * 0.06 - outP * 0.05;
    ctx.translate(540, 960); ctx.scale(z, z); ctx.translate(-540, -960);
    // stretch the scene's designed choreography to the actual (voice-driven) length
    const tt = t * sc[i].design / d;
    sc[i].draw(tt, t / d, T, d);
    ctx.restore();
    // white flash at cuts
    const flash = Math.max(0, 1 - t / 0.18) * (i > 0 ? 0.35 : 0);
    if (flash > 0) { ctx.fillStyle = `rgba(255,255,255,${flash})`; ctx.fillRect(0, 0, W, H); }
    vignette();
    if (!sc[i].noWatermark) watermark();
    progressBar(T);
  };
  window.EJ = {
    W, H, C, ctx, clamp, prog, easeOut, easeInOut, easeBack, hash, FONT, rrect, txt, width, pop, words, pill,
    card, counter, stamp, check, source, logo, watermark, endCard,
    start() { layout(); window.ready = document.fonts.ready.then(() => window.renderFrame(0)); }
  };
})();
