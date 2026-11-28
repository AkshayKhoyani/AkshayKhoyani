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
  // official Employment Junction logo (engine/assets/logo.webp) on a white card
  function officialLogo(cx, cy, w, alpha = 1) {
    const im = CAST.logo; if (!im || alpha <= 0) return logo(cx, cy, w * 0.4, alpha);
    const h = w * im.height / im.width, pad = w * 0.07;
    ctx.save(); ctx.globalAlpha *= alpha;
    rrect(cx - w / 2 - pad, cy - h / 2 - pad, w + pad * 2, h + pad * 2, (h + pad * 2) * 0.22);
    ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 24; ctx.fill(); ctx.shadowBlur = 0;
    ctx.lineWidth = Math.max(3, w * 0.012); ctx.strokeStyle = C.gold; ctx.stroke();
    ctx.drawImage(im, cx - w / 2, cy - h / 2, w, h);
    ctx.restore();
  }
  function watermark(alpha = 0.95) {
    if (alpha <= 0) return;
    officialLogo(34 + 130, 34 + 52, 240, alpha);
  }
  function endCard(t, at) {
    const p = prog(t, at, at + 0.6); if (p <= 0) return;
    const e = easeBack(p);
    const g = ctx.createRadialGradient(540, 820, 0, 540, 820, 560);
    g.addColorStop(0, `rgba(255,183,3,${0.25 * p})`); g.addColorStop(1, 'rgba(255,183,3,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 300, W, 1100);
    officialLogo(540, 820, 640 * e, clamp(p * 1.5));
    pop(t, at + 0.5, 'Sarkari Naukri ki har khabar', 540, 1060, { size: 46, weight: 700, color: C.text });
    pill(t, at + 0.8, '📲 Follow @employmentjunction.in', 1170, C.gold, '#071a3d', 40);
  }

  // "Comment KEYWORD" call-to-action: Instagram-style comment bubble + keyword chip
  function commentCTA(t, at, keyword, y = 330) {
    const p = easeBack(prog(t, at, at + 0.45)); if (p <= 0) return;
    ctx.save(); ctx.translate(540, y); ctx.scale(p, p);
    const label = 'Comment karo 👇', kw = '"' + keyword + '"';
    const w = Math.max(width(label, 44), width(kw, 76, 900)) + 120, h = 210;
    rrect(-w / 2, -h / 2, w, h, 40); ctx.fillStyle = '#ffffff'; ctx.fill();
    // bubble tail
    ctx.beginPath(); ctx.moveTo(-w / 2 + 70, h / 2 - 2); ctx.lineTo(-w / 2 + 40, h / 2 + 46); ctx.lineTo(-w / 2 + 120, h / 2 - 2); ctx.fill();
    ctx.font = FONT(700, 44); ctx.fillStyle = '#334155'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(label, 0, -48);
    const pulse = 1 + 0.05 * Math.sin(t * 7);
    ctx.save(); ctx.scale(pulse, pulse); ctx.font = FONT(900, 76); ctx.fillStyle = '#e11d48'; ctx.fillText(kw, 0, 40); ctx.restore();
    ctx.restore();
    pop(t, at + 0.4, 'Website ka link DM mein milega 📩', 540, y + 215, { size: 42, weight: 700, color: C.gold });
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
    window.__T = T;
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
  // ---------- Brand cast (engine/assets/CHARACTERS.md) ----------
  // Images: ../../engine/assets/characters/cast_<name>.webp (transparent). Preloaded by EJ.start().
  const CAST = {};
  const CAST_NAMES = ['naukri_bhaiya', 'exam_didi', 'result_chacha', 'junction_bot', 'logo'];
  function loadCast() {
    const extra = window.CAST_SRC ? Object.keys(window.CAST_SRC).filter(k => k.includes('__')) : [];
    return Promise.all(CAST_NAMES.concat(extra).map(n => new Promise(res => {
      const im = new Image(); im.onload = () => { CAST[n] = im; res(); }; im.onerror = res;
      im.src = (window.CAST_SRC && window.CAST_SRC[n]) || (n === 'logo' ? '../../engine/assets/logo.webp' : (window.CAST_DIR || '../../engine/assets/characters/') + 'cast_' + n + '.webp');
    })));
  }
  // cast(t, name, at, x, y, h, {from:'left'|'right'|'bottom', talk:[[a,b],...], flip, wave})
  // x,y = bottom-centre of the character; h = height in px. Entrance pop, idle breathing, bob while talking.
  // which image to draw: a hand pose if one is active, else lip-sync mouth frame from the voice loudness
  function castFrame(t, name, o, talking) {
    const pose = (o.pose || []).find(([a, b]) => t >= a && t <= b);
    if (pose && CAST[name + '__' + pose[2]]) return CAST[name + '__' + pose[2]];
    if (talking && window.AMP && window.AMP.data.length) {
      const v = window.AMP.data[Math.min(window.AMP.data.length - 1, Math.floor((window.__T || 0) * window.AMP.fps))] || 0;
      if (v > 0.38 && CAST[name + '__m2']) return CAST[name + '__m2'];
      if (v < 0.12 && CAST[name + '__m0']) return CAST[name + '__m0'];
    }
    return CAST[name + '__base'] || CAST[name];
  }
  // cast(t, name, at, x, y, h, {from, talk:[[a,b]], pose:[[a,b,'wave']], flip})
  function cast(t, name, at, x, y, h, o = {}) {
    const talkingNow = (o.talk || []).some(([a, b]) => t >= a && t <= b);
    const im = castFrame(t, name, o, talkingNow); if (!im) return;
    const p = easeBack(prog(t, at, at + 0.55));
    if (p <= 0) return;
    const w = h * im.width / im.height;
    const off = (1 - p) * (o.from === 'left' ? -700 : o.from === 'right' ? 700 : 0);
    const offY = o.from === 'bottom' || !o.from ? (1 - p) * 500 : 0;
    const breathe = Math.sin(t * 2.4) * 0.012;
    const talking = talkingNow;
    const bob = talking ? Math.abs(Math.sin(t * 11)) * 6 : 0;  // lip-sync does the talking now; keep a light bob
    const tilt = talking ? Math.sin(t * 5.5) * 0.025 : Math.sin(t * 1.3) * 0.01;
    ctx.save();
    ctx.globalAlpha *= clamp(p * 1.4);
    ctx.translate(x + off, y + offY - bob);
    ctx.rotate(tilt);
    ctx.scale((o.flip ? -1 : 1) * (1 + breathe * 0.5), 1 + breathe);
    // soft ground shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(0, -6, w * 0.32, 22, 0, 0, Math.PI * 2); ctx.fill();
    // white outline glow (sticker look), then the character
    ctx.shadowColor = 'rgba(255,255,255,0.9)'; ctx.shadowBlur = 18;
    ctx.drawImage(im, -w / 2, -h, w, h);
    // Junction Bot: a glowing screen-mouth that opens with the voice (only on the base pose, where the screen is known)
    const sm = window.CAST_META && window.CAST_META[name] && window.CAST_META[name].screen_mouth;
    if (sm && talking && im === (CAST[name + '__base'] || CAST[name])) {
      const v = window.AMP && window.AMP.data.length ? (window.AMP.data[Math.min(window.AMP.data.length - 1, Math.floor((window.__T || 0) * window.AMP.fps))] || 0) : 0.5;
      const mx = -w / 2 + sm.cx * w, my = -h + sm.cy * h, mw = sm.w * w, mh = Math.max(6, sm.h * h * (0.4 + 2.2 * v));
      ctx.shadowColor = 'rgba(56,189,248,0.95)'; ctx.shadowBlur = 22;
      ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.ellipse(mx, my, mw / 2, mh / 2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0; ctx.fillStyle = '#0b1220'; ctx.beginPath(); ctx.ellipse(mx, my, mw / 2 - 7, Math.max(0, mh / 2 - 7), 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
  // speech bubble above/next to a character
  function bubble(t, at, s, x, y, o = {}) {
    const p = easeBack(prog(t, at, at + 0.4)); if (p <= 0) return;
    const size = o.size || 44; ctx.font = FONT(800, size);
    const lines = String(s).split('\n'); const w = Math.max(...lines.map(l => ctx.measureText(l).width)) + 64, hh = lines.length * size * 1.25 + 44;
    ctx.save(); ctx.translate(x, y); ctx.scale(p, p);
    ctx.fillStyle = o.bg || '#ffffff'; rrect(-w / 2, -hh, w, hh, 30); ctx.fill();
    ctx.beginPath(); const tx = o.tail === 'right' ? w / 2 - 70 : -w / 2 + 70; ctx.moveTo(tx - 22, -2); ctx.lineTo(tx + 22, -2); ctx.lineTo(tx + (o.tail === 'right' ? 30 : -30), 46); ctx.fill();
    ctx.fillStyle = o.fg || C.navy; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    lines.forEach((l, i) => ctx.fillText(l, 0, -hh + 22 + size * 0.62 + i * size * 1.25));
    ctx.restore();
  }

  window.EJ = {
    W, H, C, ctx, clamp, prog, easeOut, easeInOut, easeBack, hash, FONT, rrect, txt, width, pop, words, pill,
    card, counter, stamp, check, source, logo, officialLogo, watermark, endCard, commentCTA, cast, bubble, CAST,
    start() { layout(); window.ready = Promise.all([document.fonts.ready, loadCast()]).then(() => window.renderFrame(0)); }
  };
})();
