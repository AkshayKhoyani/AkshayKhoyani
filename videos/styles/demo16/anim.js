// Style 16 demo: AI flat-vector layers (gpt-image-1-mini) animated in code. 7s, music only.
const W = 1080, H = 1920, DUR = 7;
const out = document.createElement('canvas'); out.width = W; out.height = H; out.id = 'out'; document.body.appendChild(out);
const x = out.getContext('2d');
const L = s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = s; });
const [bg, bld, p1, p2, coin, bars, logo] = await Promise.all(['img/bg.png', 'img/building_t.png', 'img/person1_t.png', 'img/person2_t.png', 'img/coin_t.png', 'img/bars_t.png', '/brand/logo-transparent.png'].map(L));
await Promise.all(['900', '800', '700'].map(w => document.fonts.load(`${w} 40px Inter`))); await document.fonts.load('40px "Noto Color Emoji"', '🚀🤔');
const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), pr = (t, a, b) => cl((t - a) / (b - a));
const eo = v => 1 - Math.pow(1 - v, 3), eb = v => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(v - 1, 3) + c1 * Math.pow(v - 1, 2); };
const F = (w, s) => `${w} ${s}px Inter, "Noto Color Emoji", sans-serif`;
function rr(X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
function sprite(img, cx, by, w, o = {}) { // draw image with bottom-center anchor
  const { rot = 0, sx = 1, sy = 1, alpha = 1 } = o; if (alpha <= 0) return;
  const h = w * img.height / img.width; x.save(); x.globalAlpha = alpha; x.translate(cx, by); x.rotate(rot); x.scale(sx, sy); x.drawImage(img, -w / 2, -h, w, h); x.restore();
}
function T(s, X, Y, o = {}) { const { size = 60, w = 900, c = '#0b2545', sc = 1, alpha = 1, rot = 0 } = o; if (sc <= 0 || alpha <= 0) return; x.save(); x.globalAlpha = alpha; x.translate(X, Y); x.rotate(rot); x.scale(sc, sc); x.font = F(w, size); x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = c; x.fillText(s, 0, 0); x.restore(); }
const coins = Array.from({ length: 14 }, (_, i) => ({ x: 120 + ((i * 131) % 860), t0: 1.6 + i * 0.12, land: 1530 + (i % 3) * 30, s: 70 + (i % 4) * 14, spin: 6 + (i % 5) }));
const clouds = [[200, 520, 1.0], [760, 430, 0.8], [520, 640, 0.6]];
window.renderFrame = t => {
  x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1;
  const cam = Math.sin(t * 0.5) * 12;                                  // gentle camera sway (parallax)
  // background (slow zoom, least parallax)
  const z = 1.08 - 0.06 * eo(pr(t, 0, DUR)), s = Math.max(W / bg.width, H / bg.height) * z;
  x.drawImage(bg, (W - bg.width * s) / 2 + cam * 0.3, (H - bg.height * s) / 2, bg.width * s, bg.height * s);
  // sun glow pulse (sun sits ~ (62%, 26%) of bg)
  const sxp = W * 0.62 + cam * 0.3, syp = H * 0.25, g = x.createRadialGradient(sxp, syp, 0, sxp, syp, 260 + 30 * Math.sin(t * 3));
  g.addColorStop(0, 'rgba(255,214,120,0.45)'); g.addColorStop(1, 'rgba(255,214,120,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  // drifting flat clouds
  clouds.forEach(([cx, cy, k], i) => { const X = ((cx + t * 40 * k + cam * 0.5) % 1300) - 110; x.fillStyle = 'rgba(243,234,216,0.95)'; rr(X - 110 * k, cy - 34 * k, 220 * k, 68 * k, 34 * k); x.fill(); x.beginPath(); x.arc(X - 20 * k, cy - 30 * k, 50 * k, 0, 7); x.fill(); x.beginPath(); x.arc(X + 40 * k, cy - 22 * k, 38 * k, 0, 7); x.fill(); });
  // bars (behind building, right) — wipe reveal + arrow
  const bp = eo(pr(t, 0.9, 2.1)), bw = 560, bh = bw * bars.height / bars.width, bx = 800 + cam * 0.6 - bw / 2, by = 1360 - bh;
  if (bp > 0) { x.save(); x.beginPath(); x.rect(bx, by + bh * (1 - bp) * 0.15, bw * bp, bh); x.clip(); x.drawImage(bars, bx, by + Math.sin(t * 2) * 4, bw, bh); x.restore(); }
  // building (rises with bounce, breathes)
  const bu = eb(pr(t, 0.2, 0.9)); sprite(bld, 380 + cam * 0.8, 1380 + (1 - cl(bu)) * 500, 640, { sx: 1 + 0.01 * Math.sin(t * 2.4), sy: Math.max(0.01, bu) * (1 + 0.012 * Math.sin(t * 2.4)) });
  // glow ring behind building when 'decision' text appears
  // people (slide in, idle bob, head-tilt rock)
  const pin1 = eo(pr(t, 1.2, 1.8)), pin2 = eo(pr(t, 1.45, 2.05));
  sprite(p1, -200 + 430 * pin1 + cam * 1.2, 1920 + Math.abs(Math.sin(t * 3.2)) * -14, 400, { rot: Math.sin(t * 2.2) * 0.03 });
  sprite(p2, 1300 - 450 * pin2 + cam * 1.2, 1920 + Math.abs(Math.sin(t * 3.2 + 1.3)) * -12, 380, { rot: Math.sin(t * 2.6 + 1) * 0.035 });
  // coins rain + bounce + spin (foreground)
  coins.forEach(q => { const lt = t - q.t0; if (lt < 0) return; const fall = Math.min(lt / 0.7, 1); let y = -100 + (q.land + 100) * fall * fall; if (fall >= 1) y = q.land - Math.abs(Math.sin((lt - 0.7) * 7)) * 60 * Math.exp(-(lt - 0.7) * 3);
    sprite(coin, q.x + cam * 1.4, y, q.s, { sx: Math.cos(lt * q.spin) || 0.05 }); });
  // kinetic text
  const k1 = eb(pr(t, 0.15, 0.6)), k2 = eb(pr(t, 0.45, 0.9));
  x.save(); x.fillStyle = 'rgba(11,37,69,0.92)'; rr(90, 230, 900, 300, 36); x.globalAlpha = cl(k1); x.fill(); x.restore();
  T('4 DECEMBER 2026', 540, 310, { size: 64, c: '#f4cf6a', sc: Math.max(0, k1) });
  T('RBI ka faisla 🏦', 540, 420, { size: 104, c: '#ffffff', sc: Math.max(0, k2) });
  const k3 = eb(pr(t, 3.0, 3.4)); if (k3 > 0) { x.save(); x.translate(800, 820); x.rotate(-0.05); x.scale(k3, k3); x.fillStyle = '#ef6c57'; rr(-230, -60, 460, 120, 60); x.fill(); T('Bank Nifty 62,000 🚀', 0, 2, { size: 44, c: '#fff' }); x.restore(); }
  const k4 = eb(pr(t, 4.6, 5.0)); if (k4 > 0) { x.save(); x.translate(540, 640); x.scale(k4, k4); x.fillStyle = '#2a9d8f'; rr(-260, -60, 520, 120, 60); x.fill(); T('Repo 5.50% → ?', 0, 2, { size: 52, c: '#fff' }); x.restore(); }
  const k5 = eb(pr(t, 5.6, 6.0)); if (k5 > 0) { x.save(); x.translate(540, 1000); x.rotate(Math.sin(t * 4) * 0.03); x.scale(k5, k5); x.fillStyle = '#f3ead8'; x.shadowColor = 'rgba(0,0,0,0.35)'; x.shadowBlur = 30; rr(-330, -85, 660, 170, 85); x.fill(); x.shadowBlur = 0; T('Kya hoga? 🤔', 0, 4, { size: 100, c: '#0b2545' }); x.restore(); }
  // brand + tag
  x.save(); rr(48, 56, 96, 96, 22); x.fillStyle = '#fff'; x.fill(); x.drawImage(logo, 250, 75, 755, 755, 58, 66, 76, 76); x.restore();
  T('FINANCE JUNCTION', 340, 104, { size: 30, c: '#0b2545' });
  x.fillStyle = 'rgba(11,37,69,0.15)'; x.fillRect(0, 0, W, 8); x.fillStyle = '#d4a62c'; x.fillRect(0, 0, W * cl(t / DUR), 8);
};
window.DUR = DUR; renderFrame(0); window.READY = true;
