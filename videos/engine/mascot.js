// "Junction Bhai": Finance Junction cartoon anchor, drawn in code on the 2D overlay (no AI images).
// Lip-sync from amp.json (voice loudness per frame, made by engine/amp.py). Moods per time range.
// Usage: import { mascot } from '/engine/mascot.js';
//   await mascot(fj, { x: 880, y: 1450, scale: 1, moods: [{ t0, t1, mood: 'wave'|'talk'|'point'|'shock'|'think'|'happy'|'thumbs'|'worried' }] });
const SKIN = '#e6b07a', SKIN_D = '#c98d58', HAIR = '#2a1b12', NAVY = '#0b2545', NAVY_D = '#071a33', GOLD = '#d4a62c';
const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), pr = (t, a, b) => cl((t - a) / (b - a));
const eb = v => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(v - 1, 3) + c1 * Math.pow(v - 1, 2); };
const lerp = (a, b, k) => a + (b - a) * k;

export async function mascot(fj, o = {}) {
  let amp = [], fps = 30;
  try { const j = await (await fetch('./amp.json')).json(); amp = j.amp; fps = j.fps; } catch (e) { /* silent mouth */ }
  const moods = o.moods || [];
  const moodAt = t => { const m = moods.find(m => t >= m.t0 && t < m.t1); return m ? m.mood : 'talk'; };
  const level = t => { const i = Math.floor(t * fps); return amp.length ? (amp[Math.max(0, Math.min(amp.length - 1, i))] || 0) : 0; };
  const pos = typeof o.pos === 'function' ? o.pos : () => ({ x: o.x ?? 880, y: o.y ?? 1450, s: o.scale ?? 1 });
  const appear = o.appear ?? 0.15;
  fj.overlays.push(t => {
    const ctx = fj.ctx, P = pos(t);
    const pop = eb(pr(t, appear, appear + 0.5));
    if (pop <= 0.01) return;
    // blend mood changes over 0.25s
    const mood = moodAt(t), prevMood = moodAt(t - 0.25), k = mood === prevMood ? 1 : pr(t % 1e9, 0, 1);
    draw(ctx, t, P.x, P.y, P.s * pop, mood, level(t), k);
  });
}

function limb(ctx, pts, w, col) {
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.stroke();
}
function arm(ctx, sx, sy, a1, a2, len, hand) { // shoulder, upper/fore angles (rad, 0 = down), returns hand pos
  const ex = sx + Math.sin(a1) * len, ey = sy + Math.cos(a1) * len;
  const hx = ex + Math.sin(a2) * len * 0.95, hy = ey + Math.cos(a2) * len * 0.95;
  limb(ctx, [[sx, sy], [ex, ey], [hx, hy]], 40, NAVY_D);
  limb(ctx, [[sx, sy], [ex, ey], [hx, hy]], 32, '#1a3a6b');
  limb(ctx, [[ex + (hx - ex) * 0.82, ey + (hy - ey) * 0.82], [hx, hy]], 30, '#ffffff'); // shirt cuff
  ctx.fillStyle = SKIN; ctx.strokeStyle = SKIN_D; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(hx, hy, 19, 0, 7); ctx.fill(); ctx.stroke();
  if (hand === 'point') {
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(-a2);
    ctx.fillStyle = SKIN; ctx.beginPath(); ctx.roundRect(-6, 8, 12, 26, 6); ctx.fill(); ctx.stroke(); ctx.restore();
  }
  if (hand === 'thumb') { ctx.font = '64px "Noto Color Emoji"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('👍', hx, hy - 8); }
  return [hx, hy];
}

function draw(ctx, t, X, Y, S, mood, lv, k) {
  ctx.save(); ctx.translate(X, Y); ctx.scale(S, S);
  const bob = Math.sin(t * 3.2) * 4, talk = cl(lv * 1.4);
  const shock = mood === 'shock', happy = mood === 'happy' || mood === 'thumbs' || mood === 'wave';
  const jolt = shock ? Math.sin(t * 40) * 3 * (1 - pr(t % 3, 0, 0.6)) : 0;
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.beginPath(); ctx.ellipse(0, 0, 120, 20, 0, 0, 7); ctx.fill();
  // legs + shoes
  limb(ctx, [[-30, -110], [-34, -18]], 40, '#2f3540'); limb(ctx, [[30, -110], [34, -18]], 40, '#2f3540');
  ctx.fillStyle = '#16181d'; [-1, 1].forEach(s => { ctx.beginPath(); ctx.ellipse(s * 40, -12, 34, 15, 0, 0, 7); ctx.fill(); });
  ctx.translate(jolt, bob);
  // torso (blazer)
  ctx.fillStyle = NAVY; ctx.strokeStyle = NAVY_D; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-88, -280); ctx.quadraticCurveTo(-104, -170, -86, -100); ctx.lineTo(86, -100); ctx.quadraticCurveTo(104, -170, 88, -280);
  ctx.quadraticCurveTo(0, -306, -88, -280); ctx.closePath(); ctx.fill(); ctx.stroke();
  // shirt V + tie + lapels
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(-34, -290); ctx.lineTo(0, -200); ctx.lineTo(34, -290); ctx.closePath(); ctx.fill();
  ctx.fillStyle = GOLD; ctx.beginPath(); ctx.moveTo(-9, -282); ctx.lineTo(9, -282); ctx.lineTo(14, -222); ctx.lineTo(0, -204); ctx.lineTo(-14, -222); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#16325c'; ctx.lineWidth = 5; limb(ctx, [[-36, -288], [-6, -196], [-30, -150]], 5, '#16325c'); limb(ctx, [[36, -288], [6, -196], [30, -150]], 5, '#16325c');
  // FJ badge on blazer
  ctx.fillStyle = GOLD; ctx.beginPath(); ctx.arc(-50, -228, 15, 0, 7); ctx.fill();
  ctx.fillStyle = NAVY; ctx.font = '900 15px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('FJ', -50, -227);
  // arms by mood
  const sw = Math.sin(t * 9);
  // left arm outward = negative angles, right arm outward = positive (0 = hanging down)
  let L = [-0.22, -0.08, 'fist'], R = [0.22, 0.08, 'fist'];
  if (mood === 'talk') { L = [-0.35, 0.7 + 0.3 * Math.sin(t * 4), 'fist']; R = [0.3 + 0.05 * Math.sin(t * 3), -0.6 - 0.25 * Math.cos(t * 4), 'fist']; }
  if (mood === 'wave') R = [2.45, 2.85 + 0.45 * sw, 'fist'];
  if (mood === 'point') { L = [-2.0, -2.25 + 0.04 * sw, 'point']; }
  if (mood === 'shock') { L = [-2.4, -2.9, 'fist']; R = [2.4, 2.9, 'fist']; }
  if (mood === 'think') { R = [0.2, -3.0, 'fist']; L = [-0.4, 1.6, 'fist']; }
  if (mood === 'thumbs') R = [1.15, 2.7, 'thumb'];
  if (mood === 'happy') { const b = 0.15 * Math.sin(t * 8); L = [-1.0 - b, -2.5, 'fist']; R = [1.0 + b, 2.5, 'fist']; }
  if (mood === 'worried') { L = [-0.4, 1.9, 'fist']; R = [0.4, -1.9, 'fist']; }
  arm(ctx, -82, -266, L[0], L[1], 62, L[2]);
  arm(ctx, 82, -266, R[0], R[1], 62, R[2]);
  // neck + head
  ctx.fillStyle = SKIN_D; ctx.fillRect(-18, -312, 36, 26);
  const tilt = Math.sin(t * 1.7) * 0.05 + (mood === 'think' ? 0.12 : 0);
  ctx.save(); ctx.translate(0, -400); ctx.rotate(tilt);
  // ears
  ctx.fillStyle = SKIN; ctx.strokeStyle = SKIN_D; ctx.lineWidth = 4;
  [-1, 1].forEach(s => { ctx.beginPath(); ctx.ellipse(s * 92, 8, 16, 22, 0, 0, 7); ctx.fill(); ctx.stroke(); });
  // face
  ctx.beginPath(); ctx.ellipse(0, 0, 92, 100, 0, 0, 7); ctx.fill(); ctx.stroke();
  // hair
  ctx.fillStyle = HAIR; ctx.beginPath();
  ctx.moveTo(-94, 0); ctx.quadraticCurveTo(-104, -96, -20, -110); ctx.quadraticCurveTo(70, -122, 96, -40); ctx.quadraticCurveTo(98, -6, 90, 4);
  ctx.quadraticCurveTo(70, -52, 10, -58); ctx.quadraticCurveTo(-30, -40, -60, -62); ctx.quadraticCurveTo(-80, -40, -94, 0); ctx.closePath(); ctx.fill();
  // cheeks
  ctx.fillStyle = 'rgba(232,110,110,0.28)'; [-1, 1].forEach(s => { ctx.beginPath(); ctx.ellipse(s * 52, 38, 18, 11, 0, 0, 7); ctx.fill(); });
  // eyes (blink every ~3.1s)
  const bl = (t % 3.1) < 0.12 ? 0.12 : 1, big = shock ? 1.3 : 1;
  const look = mood === 'think' ? [6, -8] : mood === 'point' ? [10, 0] : [Math.sin(t * 0.7) * 3, 0];
  [-1, 1].forEach(s => {
    ctx.save(); ctx.translate(s * 36, -6); ctx.scale(1, bl);
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#16181d'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, 0, 20 * big, 24 * big, 0, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#1c130d'; ctx.beginPath(); ctx.arc(look[0], look[1] + 2, 11 * (shock ? 0.8 : 1), 0, 7); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(look[0] + 4, look[1] - 3, 3.5, 0, 7); ctx.fill();
    ctx.restore();
  });
  // glasses
  ctx.strokeStyle = '#16181d'; ctx.lineWidth = 4;
  [-1, 1].forEach(s => { ctx.beginPath(); ctx.roundRect(s * 36 - 30, -36, 60, 58, 18); ctx.stroke(); });
  limb(ctx, [[-6, -12], [6, -12]], 4, '#16181d');
  // eyebrows by mood
  const bU = shock ? -22 : mood === 'worried' ? -6 : mood === 'think' ? -14 : happy ? -12 : -8;
  const bA = mood === 'worried' ? 0.28 : mood === 'think' ? -0.15 : shock ? -0.1 : 0;
  [-1, 1].forEach(s => { ctx.save(); ctx.translate(s * 36, -46 + bU); ctx.rotate(s * bA); limb(ctx, [[-20, 2], [0, -4], [20, 2]], 8, HAIR); ctx.restore(); });
  // nose + moustache
  ctx.strokeStyle = SKIN_D; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 26, 9, 0.2, Math.PI - 0.2); ctx.stroke();
  ctx.fillStyle = HAIR; ctx.beginPath(); ctx.ellipse(-15, 44, 17, 6, 0.15, 0, 7); ctx.ellipse(15, 44, 17, 6, -0.15, 0, 7); ctx.fill();
  // mouth: open with voice, smile when quiet
  const mo = shock ? 0.75 + talk * 0.25 : talk;
  if (mo > 0.08) {
    const h = 6 + 30 * mo, w = shock ? 22 : 30;
    ctx.fillStyle = '#5a1a1a'; ctx.beginPath(); ctx.ellipse(0, 66 + h * 0.3, w, h / 1.6, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#e57373'; ctx.beginPath(); ctx.ellipse(0, 66 + h * 0.55, w * 0.6, h / 4, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillRect(-w * 0.6, 66 + h * 0.3 - h / 1.6 + 2, w * 1.2, Math.min(8, h / 4));
  } else {
    ctx.strokeStyle = '#5a1a1a'; ctx.lineWidth = 5; ctx.beginPath();
    if (mood === 'worried') ctx.arc(0, 80, 18, Math.PI + 0.4, -0.4); else ctx.arc(0, 56, 22, 0.35, Math.PI - 0.35);
    ctx.stroke();
  }
  // sweat drop when worried/shock
  if (mood === 'worried' || shock) {
    const d = (t * 0.8) % 1; ctx.fillStyle = 'rgba(96,165,250,0.9)';
    ctx.beginPath(); ctx.moveTo(84, -40 + d * 30); ctx.quadraticCurveTo(96, -20 + d * 30, 84, -14 + d * 30); ctx.quadraticCurveTo(72, -20 + d * 30, 84, -40 + d * 30); ctx.fill();
  }
  ctx.restore();
  ctx.restore();
}
