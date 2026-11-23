// Style 16 demo v2: AI flat-vector layers (gpt-image-1-mini) animated in code. 7s, music only.
// Layout: all text lives in ONE flat panel in the sky; illustration stays clean below.
const W = 1080, H = 1920, DUR = 7;
const out = document.createElement('canvas'); out.width = W; out.height = H; out.id = 'out'; document.body.appendChild(out);
const x = out.getContext('2d');
const L = s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = s; });
const [bg, bld, p1, p2, coin, bars, logo] = await Promise.all(['img/bg.png', 'img/building_t.png', 'img/person1_t.png', 'img/person2_t.png', 'img/coin_t.png', 'img/bars_t.png', '/brand/logo-transparent.png'].map(L));
await Promise.all(['900', '800', '700'].map(w => document.fonts.load(`${w} 40px Inter`))); await document.fonts.load('40px "Noto Color Emoji"', '🚀🤔🏦');
const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), pr = (t, a, b) => cl((t - a) / (b - a));
const eo = v => 1 - Math.pow(1 - v, 3), eb = v => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(v - 1, 3) + c1 * Math.pow(v - 1, 2); };
const F = (w, s) => `${w} ${s}px Inter, "Noto Color Emoji", sans-serif`;
const NAVY = '#0b2545', GOLD = '#d4a62c', CREAM = '#f3ead8', CORAL = '#ef6c57', TEAL = '#2a9d8f', SKY = 'rgb(255,236,206)';
function rr(X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
function T(s, X, Y, o = {}) { const { size = 60, w = 900, c = NAVY, sc = 1, alpha = 1, maxW = 900 } = o; if (sc <= 0 || alpha <= 0) return; x.save(); x.globalAlpha *= cl(alpha); x.font = F(w, size); let k = 1; const m = x.measureText(s).width; if (m > maxW) k = maxW / m; x.translate(X, Y); x.scale(sc * k, sc * k); x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = c; x.fillText(s, 0, 0); x.restore(); }
// flat card with solid offset shadow (no blur) — matches the illustration style
function flatCard(X, Y, w, h, fill, shadow, r = 34, off = 12) { x.fillStyle = shadow; rr(X + off, Y + off, w, h, r); x.fill(); x.fillStyle = fill; rr(X, Y, w, h, r); x.fill(); }
function sprite(img, cx, by, h, o = {}) { const { rot = 0, sx = 1, sy = 1, alpha = 1 } = o; if (alpha <= 0) return; const w = h * img.width / img.height; x.save(); x.globalAlpha = alpha; x.translate(cx, by); x.rotate(rot); x.scale(sx, sy); x.drawImage(img, -w / 2, -h, w, h); x.restore(); }
const BGS = W / bg.width, BGH = bg.height * BGS, BGY = H - BGH;           // bg bottom-aligned, sky band on top
const coins = Array.from({ length: 12 }, (_, i) => ({ x: 140 + ((i * 131) % 820), t0: 1.7 + i * 0.12, land: 1640 + (i % 3) * 28, s: 74 + (i % 4) * 12, spin: 6 + (i % 5) }));
window.renderFrame = t => {
  x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1;
  const cam = Math.sin(t * 0.5) * 10;
  // sky band + background (slow zoom from bottom anchor)
  x.fillStyle = SKY; x.fillRect(0, 0, W, H);
  const z = 1.05 - 0.05 * eo(pr(t, 0, DUR));
  x.save(); x.translate(W / 2 + cam * 0.3, H); x.scale(z, z); x.drawImage(bg, -W / 2, -BGH, W, BGH); x.restore();
  // sun glow (sun ~ (668,440) in bg px)
  const sx = W / 2 + (668 * BGS - W / 2) * z + cam * 0.3, sy = H - (BGH - 440 * BGS) * z, g = x.createRadialGradient(sx, sy, 0, sx, sy, 240 + 30 * Math.sin(t * 3));
  g.addColorStop(0, 'rgba(255,214,120,0.45)'); g.addColorStop(1, 'rgba(255,214,120,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  // drifting flat clouds (below the panel)
  [[180, 860, 1.0], [880, 800, 0.8]].forEach(([cx, cy, k]) => { const X = ((cx + t * 36 * k) % 1300) - 110; x.fillStyle = CREAM; rr(X - 110 * k, cy - 34 * k, 220 * k, 68 * k, 34 * k); x.fill(); x.beginPath(); x.arc(X - 20 * k, cy - 30 * k, 50 * k, 0, 7); x.fill(); x.beginPath(); x.arc(X + 40 * k, cy - 22 * k, 38 * k, 0, 7); x.fill(); });
  // bars: wipe-in reveal, gentle bob
  const bp = eo(pr(t, 0.9, 2.1)), bh = 480, bw = bh * bars.width / bars.height, bx = 800 + cam * 0.6 - bw / 2, by = 1470 - bh;
  if (bp > 0) { x.save(); x.beginPath(); x.rect(bx, by - 40, bw * bp, bh + 80); x.clip(); x.drawImage(bars, bx, by + Math.sin(t * 2) * 4, bw, bh); x.restore(); }
  // building rises with bounce, then breathes
  const bu = eb(pr(t, 0.2, 0.9)); sprite(bld, 360 + cam * 0.8, 1500 + (1 - cl(bu)) * 500, 560, { sx: 1 + 0.01 * Math.sin(t * 2.4), sy: Math.max(0.01, bu) * (1 + 0.012 * Math.sin(t * 2.4)) });
  // people: full body, slide in, idle bob + sway
  const pin1 = eo(pr(t, 1.2, 1.8)), pin2 = eo(pr(t, 1.45, 2.05));
  sprite(p1, -220 + 470 * pin1 + cam * 1.2, 1880 - Math.abs(Math.sin(t * 3.2)) * 12, 700, { rot: Math.sin(t * 2.2) * 0.025 });
  sprite(p2, 1320 - 470 * pin2 + cam * 1.2, 1880 - Math.abs(Math.sin(t * 3.2 + 1.3)) * 10, 720, { rot: Math.sin(t * 2.6 + 1) * 0.03 });
  // coins: fall, spin, bounce (foreground)
  coins.forEach(q => { const lt = t - q.t0; if (lt < 0) return; const f = Math.min(lt / 0.7, 1); let y = 760 + (q.land - 760) * f * f; if (f >= 1) y = q.land - Math.abs(Math.sin((lt - 0.7) * 7)) * 60 * Math.exp(-(lt - 0.7) * 3);
    const a = pr(lt, 0, 0.15); sprite(coin, q.x + cam * 1.4, y, q.s, { sx: Math.cos(lt * q.spin) || 0.05, alpha: a }); });
  // ── ONE flat panel in the sky holds all text ──
  const pin = eb(pr(t, 0.1, 0.55)), endK = eo(pr(t, 5.4, 5.8));
  if (pin > 0) {
    x.save(); x.translate(540, 450); x.scale(pin, pin); x.translate(-540, -450);
    flatCard(70, 200, 940, 500, NAVY, GOLD);
    const a1 = 1 - endK;
    T('4 DECEMBER 2026', 540, 290, { size: 60, c: GOLD, sc: eb(pr(t, 0.3, 0.7)), alpha: a1 });
    T('RBI ka faisla 🏦', 540, 400, { size: 104, c: CREAM, sc: eb(pr(t, 0.5, 0.95)), alpha: a1 });
    // two inner flat pills
    const pp1 = eb(pr(t, 2.6, 3.0)), pp2 = eb(pr(t, 3.4, 3.8));
    [[300, 'Repo 5.50% → ?', TEAL, pp1], [780, 'Bank Nifty 62,000 🚀', CORAL, pp2]].forEach(([cx, s, col, p]) => {
      if (p <= 0) return; x.save(); x.globalAlpha = a1; x.translate(cx, 570); x.scale(p, p);
      flatCard(-215, -52, 430, 104, col, 'rgba(0,0,0,0.25)', 52, 7); T(s, 0, 2, { size: 38, c: '#ffffff', maxW: 390 }); x.restore();
    });
    // end beat: question replaces the content inside the same panel
    if (endK > 0) { const q = eb(pr(t, 5.5, 6.0)); T('Kya hoga? 🤔', 540, 410, { size: 130, c: CREAM, sc: q * (1 + 0.03 * Math.sin(t * 6)) }); T('4 December ko pata chalega', 540, 560, { size: 46, c: GOLD, sc: eb(pr(t, 5.8, 6.2)) }); }
    x.restore();
  }
  // brand + progress
  x.save(); rr(48, 56, 96, 96, 22); x.fillStyle = '#fff'; x.fill(); x.drawImage(logo, 250, 75, 755, 755, 58, 66, 76, 76); x.restore();
  x.font = F(900, 30); x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillStyle = NAVY; x.fillText('FINANCE JUNCTION', 166, 104);
  x.fillStyle = 'rgba(11,37,69,0.15)'; x.fillRect(0, 0, W, 8); x.fillStyle = GOLD; x.fillRect(0, 0, W * cl(t / DUR), 8);
};
window.DUR = DUR; renderFrame(0); window.READY = true;
