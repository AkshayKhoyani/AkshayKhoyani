// Finance Junction cartoon cast: 12 characters drawn in code (no AI images), same style as Junction Bhai.
// Lip-sync from amp.json, moods like mascot.js. Usage:
//   import { character, CAST } from '/engine/cast.js';
//   await character(fj, { who: 'chintu', x: 200, y: 1450, scale: 0.7, moods: [{ t0, t1, mood }] , ampFrom: [t0, t1] });
const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), pr = (t, a, b) => cl((t - a) / (b - a));
const eb = v => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(v - 1, 3) + c1 * Math.pow(v - 1, 2); };
const SK = { bull: ['#a86b3c', '#7c4a22'], bear: ['#7a4a2e', '#5a341e'], metal: ['#cbd5e1', '#94a3b8'], light: ['#f2c9a0', '#d9a77a'], wheat: ['#e6b07a', '#c98d58'], brown: ['#c68a5a', '#a5703f'], dark: ['#9a6640', '#7a4e2e'] };

export const CAST = {
  priya: { name: 'Priya Didi', role: 'Working woman', skin: 'light', hair: 'ponytail', hairC: '#2a1b12', female: true, outfit: 'blazer', main: '#be185d', inner: '#ffffff', tie: null, lower: 'pants', lowerC: '#1f2937', earrings: '#f4cf6a', specs: null, lips: '#c2416b' },
  chintu: { name: 'Chintu', role: 'Gen-Z ladka', skin: 'wheat', hair: 'cap', hairC: '#1c130d', capC: '#f43f5e', outfit: 'hoodie', main: '#7c3aed', lower: 'pants', lowerC: '#334155', shoes: '#f8fafc', props: ['headphones', 'phone'] },
  zoya: { name: 'Zoya', role: 'Gen-Z ladki', skin: 'light', hair: 'buns2', hairC: '#3b2416', hairTip: '#a78bfa', female: true, outfit: 'jacket', main: '#22c55e', inner: '#111827', lower: 'pants', lowerC: '#60a5fa', specs: 'round', shoes: '#f8fafc', props: ['phone'], lips: '#db2777' },
  sharma: { name: 'Sharma Uncle', role: 'Middle-class uncle', skin: 'wheat', hair: 'bald', hairC: '#3a2a20', outfit: 'kurta', main: '#f5f0e1', accent: '#b45309', lower: 'pants', lowerC: '#e7e2d3', moustache: 'thick', belly: 1.18, specs: 'square', props: ['newspaper'] },
  dadi: { name: 'Dadi Maa', role: 'Senior citizen', skin: 'wheat', hair: 'whitebun', hairC: '#e5e7eb', female: true, outfit: 'saree', main: '#9f1239', accent: '#f4cf6a', specs: 'round', bindi: true, wrinkles: true, lips: '#a3424f' },
  dadaji: { name: 'Dadaji', role: 'Retired pensioner', skin: 'brown', hair: 'white', hairC: '#f1f5f9', outfit: 'sweater', main: '#7c5c3b', inner: '#f8fafc', lower: 'pants', lowerC: '#d6d3cb', moustache: 'white', wrinkles: true, specs: 'square', props: ['stick'], stoop: 0.06 },
  sunita: { name: 'Sunita Aunty', role: 'Homemaker', skin: 'brown', hair: 'braid', hairC: '#1c130d', female: true, outfit: 'saree', main: '#15803d', accent: '#facc15', bindi: true, earrings: '#f4cf6a', lips: '#b91c1c', props: ['bangles'] },
  rahul: { name: 'Rahul', role: 'Salaried employee', skin: 'wheat', hair: 'short', hairC: '#1c130d', outfit: 'shirt', main: '#bfdbfe', tie: '#1d4ed8', lower: 'pants', lowerC: '#374151', props: ['lanyard'] },
  trader: { name: 'Trader Bhai', role: 'Share market trader', skin: 'brown', hair: 'spiky', hairC: '#1c130d', outfit: 'halfjacket', main: '#111827', inner: '#f8fafc', accent: '#d4a62c', lower: 'pants', lowerC: '#1f2937', beard: true, props: ['tablet'] },
  anjali: { name: 'Anjali', role: 'College student', skin: 'wheat', hair: 'long', hairC: '#24160e', female: true, outfit: 'kurti', main: '#f59e0b', accent: '#be123c', lower: 'pants', lowerC: '#1e3a8a', props: ['backpack'], earrings: '#e5e7eb', lips: '#be185d' },
  bunty: { name: 'Bunty', role: 'Bachcha (savings)', skin: 'light', hair: 'short', hairC: '#3a2414', outfit: 'school', main: '#ffffff', accent: '#1e3a8a', tie: '#dc2626', lower: 'shorts', lowerC: '#1e3a8a', kid: true, props: ['piggy'] },
  bull: { name: 'Bull Bhaiya', role: 'Market mein tezi', species: 'bull', skin: 'bull', hair: 'tuft', hairC: '#3b2414', outfit: 'tank', main: '#16a34a', print: 'BULL', printC: '#ffffff', lower: 'pants', lowerC: '#14532d', snout: '#f2d0a9', props: ['dumbbell'] },
  bear: { name: 'Bear Bhau', role: 'Market mein mandi', species: 'bear', skin: 'bear', hair: 'none', outfit: 'hoodie', main: '#b91c1c', lower: 'pants', lowerC: '#450a0a', snout: '#d9b48f' },
  ghost: { name: 'EMI Bhoot', role: 'Loan ka darr', species: 'ghost' },
  robo: { name: 'RoboBhai', role: 'AI advisor', species: 'robot', skin: 'metal', hair: 'none', outfit: 'robot', main: '#94a3b8', lower: 'pants', lowerC: '#64748b', shoes: '#475569' },
  tipsguru: { name: 'Tips Guru', role: 'Fake finfluencer', skin: 'wheat', hair: 'shadesup', hairC: '#1c130d', outfit: 'suit', main: '#7e22ce', inner: '#111827', lower: 'pants', lowerC: '#581c87', moustache: 'thin', shoes: '#f8fafc', props: ['chain', 'cash'] },
  ca: { name: 'CA Saab', role: 'Tax expert', skin: 'light', hair: 'neat', hairC: '#1c130d', outfit: 'shirt', main: '#ffffff', tie: '#0f766e', lower: 'pants', lowerC: '#1f2937', specs: 'square', props: ['calculator'] },
  manager: { name: 'Manager Madam', role: 'Bank manager', female: true, skin: 'wheat', hair: 'bun', hairC: '#1c130d', outfit: 'blazer', main: '#1e3a8a', inner: '#fde68a', lower: 'pants', lowerC: '#1e293b', specs: 'square', earrings: '#f4cf6a', lips: '#9f1239', props: ['files'] },
  chaiwala: { name: 'Chaiwala Bhaiya', role: 'UPI wala dukaandaar', skin: 'brown', hair: 'short', hairC: '#1c130d', outfit: 'apron', main: '#fef3c7', accent: '#92400e', lower: 'pants', lowerC: '#57534e', moustache: 'thin', props: ['kettle', 'qr'] },
  delivery: { name: 'Delivery Bhai', role: 'Gig worker', skin: 'wheat', hair: 'helmet', hairC: '#1c130d', helmetC: '#f97316', outfit: 'tshirt', main: '#f97316', print: '10 MIN ⚡', printC: '#ffffff', lower: 'pants', lowerC: '#1f2937', props: ['deliverybag', 'phone'] },
  dulhan: { name: 'Neha (Dulhan)', role: 'Shaadi ka budget', female: true, skin: 'light', hair: 'bridal', hairC: '#1c130d', outfit: 'lehenga', main: '#be123c', accent: '#f4cf6a', bindi: true, earrings: '#f4cf6a', lips: '#be123c', props: ['bangles'] },
  gymbro: { name: 'Gym Bro Vicky', role: 'Paisa bhi gains', skin: 'wheat', hair: 'headband', hairC: '#1c130d', bandC: '#22d3ee', outfit: 'tank', main: '#111827', print: 'GAINS', printC: '#22d3ee', lower: 'shorts', lowerC: '#334155', shoes: '#f8fafc', props: ['dumbbell'] },
  paaji: { name: 'Gurpreet Paaji', role: 'Business owner', skin: 'wheat', hair: 'turban', hairC: '#1c130d', turbanC: '#f59e0b', outfit: 'kurta', main: '#e0f2fe', accent: '#0369a1', lower: 'pants', lowerC: '#1e293b', beard: true },
  fraud: { name: 'Fraud Caller', role: 'Scam se savdhaan', skin: 'wheat', hair: 'hood', hairC: '#1c130d', outfit: 'hoodie', main: '#1f2937', lower: 'pants', lowerC: '#111827', shades: true, stubble: true, props: ['phone', 'warning'] },
};

export async function character(fj, o = {}) {
  let amp = [], fps = 30;
  try { const j = await (await fetch('./amp.json')).json(); amp = j.amp; fps = j.fps; } catch (e) { }
  const spec = typeof o.who === 'string' ? CAST[o.who] : o.who;
  const moods = o.moods || [], speaks = o.speaks || null; // speaks: [[t0,t1],...] when this character's mouth moves
  const moodAt = t => (moods.find(m => t >= m.t0 && t < m.t1) || {}).mood || 'talk';
  const level = t => { if (speaks && !speaks.some(([a, b]) => t >= a && t < b)) return 0; const i = Math.floor(t * fps); return amp.length ? (amp[Math.max(0, Math.min(amp.length - 1, i))] || 0) : 0; };
  const pos = typeof o.pos === 'function' ? o.pos : () => ({ x: o.x ?? 200, y: o.y ?? 1450, s: o.scale ?? 1, flip: o.flip });
  const appear = o.appear ?? 0.15;
  fj.overlays.push(t => {
    const P = pos(t), pop = eb(pr(t, appear, appear + 0.5)); if (pop <= 0.01) return;
    drawPerson(fj.ctx, t, P.x, P.y, P.s * pop, spec, moodAt(t), level(t), P.flip);
  });
}

function limb(c, pts, w, col) { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.stroke(); }
const dark = (hex, k = 0.75) => { const n = parseInt(hex.slice(1), 16); const f = v => Math.round(v * k).toString(16).padStart(2, '0'); return '#' + f(n >> 16) + f((n >> 8) & 255) + f(n & 255); };

export function drawPerson(c, t, X, Y, S, P, mood, lv, flip) {
  const [SKIN, SKIN_D] = SK[P.skin] || SK.wheat, F = !!P.female, K = P.kid ? 0.78 : 1, belly = P.belly || 1;
  c.save(); c.translate(X, Y); c.scale(S * (flip ? -1 : 1), S);
  if (P.species === 'ghost') { drawGhost(c, t, mood, lv); c.restore(); return; }
  const bob = Math.sin(t * 3.2) * 4, talk = cl(lv * 1.4), shock = mood === 'shock';
  const happy = mood === 'happy' || mood === 'thumbs' || mood === 'wave';
  c.fillStyle = 'rgba(0,0,0,0.18)'; c.beginPath(); c.ellipse(0, 0, 120, 20, 0, 0, 7); c.fill();
  // ---- lower body ----
  const legTop = -110 * K;
  if (P.outfit === 'saree' || P.outfit === 'lehenga') {
    c.fillStyle = P.main; c.strokeStyle = dark(P.main); c.lineWidth = 4;
    c.beginPath(); c.moveTo(-70, -150); c.lineTo(70, -150); c.lineTo(92, -6); c.lineTo(-92, -6); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = P.accent; c.lineWidth = 9; c.beginPath(); c.moveTo(-90, -16); c.lineTo(90, -16); c.stroke();
    for (let i = -2; i <= 2; i++) limb(c, [[i * 16, -140], [i * 22, -20]], 3, dark(P.main, 0.6));
    if (P.outfit === 'lehenga') { c.fillStyle = P.accent; for (let i = 0; i < 26; i++) { c.beginPath(); c.arc(-70 + (i * 37) % 140, -130 + Math.floor(i / 4) * 18, 3, 0, 7); c.fill(); } }
    c.fillStyle = '#7c2d12'; [-1, 1].forEach(s => { c.beginPath(); c.ellipse(s * 34, -6, 26, 10, 0, 0, 7); c.fill(); });
  } else {
    const lc = P.lowerC || '#2f3540', sh = P.lower === 'shorts';
    limb(c, [[-30 * belly, legTop], [-34, -18]], 40, sh ? SKIN : lc); limb(c, [[30 * belly, legTop], [34, -18]], 40, sh ? SKIN : lc);
    if (sh) { c.fillStyle = lc; c.beginPath(); c.roundRect(-58, legTop - 6, 116, 54, 12); c.fill(); }
    c.fillStyle = P.shoes || '#16181d'; [-1, 1].forEach(s => { c.beginPath(); c.ellipse(s * 40, -12, 34, 15, 0, 0, 7); c.fill(); });
    if (P.shoes === '#f8fafc') { c.strokeStyle = '#94a3b8'; c.lineWidth = 3; [-1, 1].forEach(s => { c.beginPath(); c.ellipse(s * 40, -12, 34, 15, 0, 0, 7); c.stroke(); }); }
  }
  c.translate(0, bob); if (P.stoop) c.rotate(P.stoop);
  if (P.kid) { c.translate(0, -110 * (1 - K) * 0.2); }
  const top = -280 * (P.kid ? 0.86 : 1), bottom = P.outfit === 'kurta' || P.outfit === 'kurti' ? -60 : -100;
  // backpack behind
  if ((P.props || []).includes('backpack')) { c.fillStyle = '#0ea5e9'; c.beginPath(); c.roundRect(-80, top + 20, 160, 150, 30); c.fill(); }
  if ((P.props || []).includes('deliverybag')) { c.fillStyle = '#16a34a'; c.beginPath(); c.roundRect(-104, top - 30, 208, 190, 16); c.fill(); c.fillStyle = '#fff'; c.font = '900 26px Inter'; c.textAlign = 'center'; c.fillText('FOOD', 0, top - 4); }
  // ---- torso ----
  const tw = 88 * belly, M = P.main, MD = dark(M);
  c.fillStyle = M; c.strokeStyle = MD; c.lineWidth = 4;
  c.beginPath(); c.moveTo(-tw, top); c.quadraticCurveTo(-tw * 1.18, (top + bottom) / 2, -tw * 0.98, bottom); c.lineTo(tw * 0.98, bottom); c.quadraticCurveTo(tw * 1.18, (top + bottom) / 2, tw, top); c.quadraticCurveTo(0, top - 26, -tw, top); c.closePath(); c.fill(); c.stroke();
  const o = P.outfit;
  if (o === 'suit') { c.fillStyle = P.inner; c.beginPath(); c.moveTo(-34, top - 10); c.lineTo(0, top + 90); c.lineTo(34, top - 10); c.closePath(); c.fill(); limb(c, [[-36, top - 8], [-6, top + 84], [-30, top + 130]], 5, MD); limb(c, [[36, top - 8], [6, top + 84], [30, top + 130]], 5, MD); c.fillStyle = '#f4cf6a'; c.beginPath(); c.moveTo(48, top + 56); c.lineTo(70, top + 50); c.lineTo(66, top + 66); c.closePath(); c.fill(); }
  if (o === 'tshirt' || o === 'tank' || o === 'apron') {
    c.fillStyle = SKIN; c.beginPath(); c.ellipse(0, top - 8, o === 'tank' ? 40 : 30, o === 'tank' ? 30 : 18, 0, 0, Math.PI); c.fill();
    if (o === 'tank') { c.strokeStyle = MD; c.lineWidth = 3; [-1, 1].forEach(s => { c.beginPath(); c.arc(s * 30, top + 50, 30, s > 0 ? 0.3 : 1.9, s > 0 ? 1.3 : 2.9); c.stroke(); }); }
    if (P.print) { c.fillStyle = P.printC || '#fff'; c.font = `900 ${P.print.length > 6 ? 28 : 40}px Inter, "Noto Color Emoji", sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(P.print, 0, top + 110); }
    if (o === 'apron') { c.fillStyle = P.accent; c.beginPath(); c.roundRect(-54, top + 40, 108, bottom - top - 30, 10); c.fill(); limb(c, [[-40, top + 44], [-30, top - 6]], 6, P.accent); limb(c, [[40, top + 44], [30, top - 6]], 6, P.accent); c.fillStyle = '#fef3c7'; c.font = '900 30px Inter'; c.textAlign = 'center'; c.fillText('CHAI ☕', 0, top + 110); }
  }
  if (o === 'robot') { c.fillStyle = '#1e293b'; c.beginPath(); c.roundRect(-50, top + 40, 100, 80, 10); c.fill(); c.strokeStyle = '#22d3ee'; c.lineWidth = 4; c.beginPath(); [[0, 60], [20, 46], [40, 52], [60, 30], [80, 20]].forEach(([a, b], i) => i ? c.lineTo(-40 + a, top + 40 + b) : c.moveTo(-40 + a, top + 40 + b)); c.stroke(); c.fillStyle = '#64748b'; [[-70, top + 20], [70, top + 20], [-70, bottom - 20], [70, bottom - 20]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 6, 0, 7); c.fill(); }); }
  if (o === 'lehenga') { c.globalAlpha = 0.75; c.fillStyle = P.accent; c.beginPath(); c.moveTo(-tw, top + 4); c.quadraticCurveTo(0, top + 160, tw, top + 4); c.lineTo(tw - 16, top - 6); c.quadraticCurveTo(0, top + 130, -tw + 16, top - 6); c.closePath(); c.fill(); c.globalAlpha = 1; }
  if (o === 'blazer' || o === 'jacket' || o === 'halfjacket' || o === 'sweater') {
    c.fillStyle = P.inner || '#fff'; c.beginPath(); c.moveTo(-34, top - 10); c.lineTo(0, top + 90); c.lineTo(34, top - 10); c.closePath(); c.fill();
    if (o !== 'blazer') { c.fillRect(-26, top + 60, 52, bottom - top - 60); }
    limb(c, [[-36, top - 8], [-6, top + 84], [-30, top + 130]], 5, MD); limb(c, [[36, top - 8], [6, top + 84], [30, top + 130]], 5, MD);
    if (P.tie) { c.fillStyle = P.tie; c.beginPath(); c.moveTo(-9, top - 2); c.lineTo(9, top - 2); c.lineTo(14, top + 58); c.lineTo(0, top + 76); c.lineTo(-14, top + 58); c.closePath(); c.fill(); }
    if (o === 'halfjacket') { c.fillStyle = P.accent; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(-14, top + 100 + i * 34, 5, 0, 7); c.fill(); } }
    if (o === 'sweater') { c.strokeStyle = MD; c.lineWidth = 3; for (let y = top + 110; y < bottom - 10; y += 16) limb(c, [[-tw + 14, y], [tw - 14, y]], 3, MD); }
  }
  if (o === 'hoodie') {
    c.fillStyle = MD; c.beginPath(); c.roundRect(-50, bottom - 70, 100, 50, 14); c.fill();
    limb(c, [[-16, top + 4], [-18, top + 70]], 4, '#e5e7eb'); limb(c, [[16, top + 4], [18, top + 70]], 4, '#e5e7eb');
  }
  if (o === 'kurta' || o === 'kurti') {
    c.fillStyle = P.accent; c.fillRect(-6, top - 6, 12, 110); for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(0, top + 16 + i * 24, 4, 0, 7); c.fillStyle = '#fff7ed'; c.fill(); }
    if (o === 'kurti') { c.strokeStyle = P.accent; c.lineWidth = 10; c.beginPath(); c.moveTo(-tw + 6, top + 10); c.quadraticCurveTo(0, top + 130, tw - 6, top + 10); c.stroke(); }
  }
  if (o === 'shirt' || o === 'school') {
    c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(-30, top - 10); c.lineTo(0, top + 22); c.lineTo(30, top - 10); c.closePath(); c.fill();
    if (P.tie) { c.fillStyle = P.tie; c.beginPath(); c.moveTo(-8, top + 10); c.lineTo(8, top + 10); c.lineTo(13, top + 110); c.lineTo(0, top + 126); c.lineTo(-13, top + 110); c.closePath(); c.fill(); }
    c.strokeStyle = MD; c.lineWidth = 3; c.strokeRect(36, top + 40, 26, 30);
    if (o === 'school') { c.fillStyle = P.accent; c.font = '900 20px Inter'; c.textAlign = 'center'; c.fillText('★', 49, top + 60); }
  }
  if (o === 'saree') {
    c.fillStyle = P.main; c.strokeStyle = MD; c.lineWidth = 4;
    c.beginPath(); c.moveTo(-tw, top + 8); c.lineTo(-tw + 40, top - 8); c.lineTo(tw, bottom + 10); c.lineTo(tw - 50, bottom + 10); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = P.accent; c.lineWidth = 8; c.beginPath(); c.moveTo(-tw + 40, top - 8); c.lineTo(tw, bottom + 10); c.stroke();
  }
  if (P.belly > 1) { c.strokeStyle = MD; c.lineWidth = 3; c.beginPath(); c.arc(0, bottom - 30, 40, 0.3, Math.PI - 0.3); c.stroke(); }
  // lanyard
  if ((P.props || []).includes('lanyard')) { limb(c, [[-30, top - 4], [0, top + 110], [30, top - 4]], 4, '#2563eb'); c.fillStyle = '#fff'; c.strokeStyle = '#2563eb'; c.lineWidth = 3; c.beginPath(); c.roundRect(-18, top + 104, 36, 46, 6); c.fill(); c.stroke(); c.fillStyle = '#93c5fd'; c.fillRect(-10, top + 112, 20, 14); }
  if ((P.props || []).includes('backpack')) { limb(c, [[-50, top + 4], [-44, top + 150]], 12, '#0369a1'); limb(c, [[50, top + 4], [44, top + 150]], 12, '#0369a1'); }
  if ((P.props || []).includes('chain')) { c.strokeStyle = '#facc15'; c.lineWidth = 7; c.beginPath(); c.arc(0, top - 10, 52, 0.4, Math.PI - 0.4); c.stroke(); c.fillStyle = '#facc15'; c.font = '900 34px Inter'; c.textAlign = 'center'; c.fillText('$', 0, top + 50); }
  // ---- arms ----
  const sw = Math.sin(t * 9);
  let L = [-0.22, -0.08, 'fist'], R = [0.22, 0.08, 'fist'];
  if (mood === 'talk') { L = [-0.35, 0.7 + 0.3 * Math.sin(t * 4), 'fist']; R = [0.3 + 0.05 * Math.sin(t * 3), -0.6 - 0.25 * Math.cos(t * 4), 'fist']; }
  if (mood === 'wave') R = [2.45, 2.85 + 0.45 * sw, 'fist'];
  if (mood === 'point') L = [-2.0, -2.25 + 0.04 * sw, 'point'];
  if (shock) { L = [-2.4, -2.9, 'fist']; R = [2.4, 2.9, 'fist']; }
  if (mood === 'think') { R = [0.2, -3.0, 'fist']; L = [-0.4, 1.6, 'fist']; }
  if (mood === 'thumbs') R = [1.15, 2.7, 'thumb'];
  if (mood === 'happy') { const b = 0.15 * Math.sin(t * 8); L = [-1.0 - b, -2.5, 'fist']; R = [1.0 + b, 2.5, 'fist']; }
  if (mood === 'worried') { L = [-0.4, 1.9, 'fist']; R = [0.4, -1.9, 'fist']; }
  const props = P.props || [];
  if (props.includes('phone') && mood !== 'wave' && mood !== 'thumbs' && !shock) R = [0.35, -2.4, 'phone'];
  if (props.includes('stick') && mood !== 'wave') R = [0.25, 0.25, 'stick'];
  if (props.includes('piggy') && !shock) { L = [-0.3, 1.2, 'fist']; R = [0.3, -1.2, 'piggy']; }
  if (props.includes('tablet') && mood !== 'wave' && !shock) { L = [-0.3, 1.25, 'fist']; R = [0.3, -1.25, 'tablet']; }
  if (props.includes('newspaper') && mood === 'talk') { L = [-0.3, 1.25, 'fist']; R = [0.3, -1.25, 'paper']; }
  if (props.includes('kettle') && !shock && mood !== 'wave') R = [0.3, -1.2, 'kettle'];
  if (props.includes('qr') && !shock) L = [-0.3, 1.25, 'qr'];
  if (props.includes('calculator') && !shock && mood !== 'wave') R = [0.3, -1.25, 'calc'];
  if (props.includes('files') && !shock) L = [-0.3, 1.25, 'files'];
  if (props.includes('cash') && !shock && mood !== 'wave') R = [1.1, 2.7, 'cash'];
  if (props.includes('dumbbell') && !shock && mood !== 'wave') R = [1.3, 2.9 + 0.25 * Math.sin(t * 5), 'dumbbell'];
  const sleeve = o === 'saree' || o === 'tank' || o === 'lehenga' ? SKIN : o === 'halfjacket' || o === 'sweater' ? (P.inner || '#fff') : o === 'kurti' ? P.main : M;
  const armLen = P.kid ? 52 : 62, sy = top + 14;
  const hands = [[-tw + 6, L], [tw - 6, R]].map(([sx, A]) => arm(c, sx, sy, A[0], A[1], armLen, A[2], sleeve, SKIN, SKIN_D, P));
  // ---- head ----
  c.fillStyle = SKIN_D; c.fillRect(-18, top - 32, 36, 26);
  const tilt = Math.sin(t * 1.7) * 0.05 + (mood === 'think' ? 0.12 : 0) + (shock ? Math.sin(t * 40) * 0.03 : 0);
  const HY = top - 120 * (P.kid ? 0.9 : 1);
  c.save(); c.translate(0, HY); c.rotate(tilt); if (P.kid) c.scale(1.05, 1.05);
  if (P.species === 'robot') { robotHead(c, t, talk, mood); } else {
  hairBack(c, P);
  c.fillStyle = SKIN; c.strokeStyle = SKIN_D; c.lineWidth = 4;
  if (P.species === 'bull') { [-1, 1].forEach(s => { c.fillStyle = '#f5f0e1'; c.strokeStyle = '#c9bfa6'; c.lineWidth = 3; c.beginPath(); c.moveTo(s * 60, -70); c.quadraticCurveTo(s * 140, -90, s * 130, -160); c.quadraticCurveTo(s * 110, -100, s * 50, -92); c.closePath(); c.fill(); c.stroke(); c.fillStyle = SKIN; c.beginPath(); c.ellipse(s * 104, -10, 30, 14, s * 0.3, 0, 7); c.fill(); }); }
  else if (P.species === 'bear') { [-1, 1].forEach(s => { c.fillStyle = SKIN; c.beginPath(); c.arc(s * 66, -80, 30, 0, 7); c.fill(); c.fillStyle = P.snout; c.beginPath(); c.arc(s * 66, -80, 15, 0, 7); c.fill(); }); c.fillStyle = SKIN; }
  else [-1, 1].forEach(s => { c.beginPath(); c.ellipse(s * 92, 8, 16, 22, 0, 0, 7); c.fill(); c.stroke(); });
  if (P.earrings) [-1, 1].forEach(s => { c.fillStyle = P.earrings; c.beginPath(); c.arc(s * 94, 36, 7, 0, 7); c.fill(); });
  c.fillStyle = SKIN; c.beginPath(); c.ellipse(0, 0, 92, 100, 0, 0, 7); c.fill(); c.stroke();
  if (P.stubble || P.beard) { c.fillStyle = P.beard ? '#1c130d' : 'rgba(40,30,25,0.25)'; c.beginPath(); c.moveTo(-84, 20); c.quadraticCurveTo(-70, 104, 0, 104); c.quadraticCurveTo(70, 104, 84, 20); c.quadraticCurveTo(60, 70, 0, 64); c.quadraticCurveTo(-60, 70, -84, 20); c.fill(); }
  hairFront(c, P, t);
  if (P.snout) { c.fillStyle = P.snout; c.beginPath(); c.ellipse(0, 54, P.species === 'bull' ? 64 : 52, P.species === 'bull' ? 42 : 36, 0, 0, 7); c.fill(); if (P.species === 'bull') { c.fillStyle = '#5a3a22'; [-1, 1].forEach(s => { c.beginPath(); c.ellipse(s * 24, 40, 8, 11, 0, 0, 7); c.fill(); }); c.strokeStyle = '#facc15'; c.lineWidth = 6; c.beginPath(); c.arc(0, 30, 16, 0.2, Math.PI - 0.2); c.stroke(); } else { c.fillStyle = '#1c130d'; c.beginPath(); c.ellipse(0, 30, 16, 11, 0, 0, 7); c.fill(); } }
  c.fillStyle = 'rgba(232,110,110,' + (F ? 0.38 : 0.26) + ')'; [-1, 1].forEach(s => { c.beginPath(); c.ellipse(s * 52, 38, 18, 11, 0, 0, 7); c.fill(); });
  if (P.wrinkles) { c.strokeStyle = SKIN_D; c.lineWidth = 3; [-1, 1].forEach(s => { c.beginPath(); c.arc(s * 60, -8, 14, s > 0 ? -0.6 : Math.PI - 0.2, s > 0 ? 0.2 : Math.PI + 0.6); c.stroke(); }); limb(c, [[-30, -60], [30, -60]], 3, SKIN_D); }
  // eyes
  const bl = (t % 3.1) < 0.12 ? 0.12 : 1, big = shock ? 1.3 : 1, look = mood === 'think' ? [6, -8] : mood === 'point' ? [-10, 0] : [Math.sin(t * 0.7) * 3, 0];
  if (P.shades) {
    c.fillStyle = '#0b0b0f'; [-1, 1].forEach(s => { c.beginPath(); c.roundRect(s * 36 - 32, -28, 64, 40, 14); c.fill(); }); limb(c, [[-6, -14], [6, -14]], 5, '#0b0b0f');
    c.fillStyle = 'rgba(255,255,255,0.35)'; [-1, 1].forEach(s => c.fillRect(s * 36 - 20, -22, 14, 6));
  } else {
    [-1, 1].forEach(s => {
      c.save(); c.translate(s * 36, -6); c.scale(1, bl);
      c.fillStyle = '#fff'; c.strokeStyle = '#16181d'; c.lineWidth = 3; c.beginPath(); c.ellipse(0, 0, 20 * big, 24 * big, 0, 0, 7); c.fill(); c.stroke();
      c.fillStyle = '#1c130d'; c.beginPath(); c.arc(look[0], look[1] + 2, 11 * (shock ? 0.8 : 1), 0, 7); c.fill();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(look[0] + 4, look[1] - 3, 3.5, 0, 7); c.fill();
      if (F) { c.strokeStyle = '#16181d'; c.lineWidth = 3; for (let k = -1; k <= 1; k++) limb(c, [[k * 9 + s * 4, -23], [k * 12 + s * 8, -32]], 3, '#16181d'); }
      c.restore();
    });
    if (P.specs) { c.strokeStyle = '#16181d'; c.lineWidth = 4; [-1, 1].forEach(s => { c.beginPath(); if (P.specs === 'round') c.arc(s * 36, -6, 30, 0, 7); else c.roundRect(s * 36 - 30, -36, 60, 58, 14); c.stroke(); }); limb(c, [[-6, -12], [6, -12]], 4, '#16181d'); }
  }
  // brows
  const bU = shock ? -22 : mood === 'worried' ? -6 : mood === 'think' ? -14 : happy ? -12 : -8, bA = mood === 'worried' ? 0.28 : mood === 'think' ? -0.15 : shock ? -0.1 : 0;
  const browC = P.hair === 'white' || P.hair === 'whitebun' ? '#cbd5e1' : '#2a1b12';
  if (!P.shades) [-1, 1].forEach(s => { c.save(); c.translate(s * 36, -46 + bU); c.rotate(s * bA); limb(c, [[-20, 2], [0, -4], [20, 2]], F ? 5 : 8, browC); c.restore(); });
  if (P.bindi) { c.fillStyle = '#dc2626'; c.beginPath(); c.arc(0, -52, 7, 0, 7); c.fill(); }
  if (!P.species) { c.strokeStyle = SKIN_D; c.lineWidth = 4; c.beginPath(); c.arc(0, 26, 9, 0.2, Math.PI - 0.2); c.stroke(); }
  if (P.moustache) { c.fillStyle = P.moustache === 'white' ? '#e5e7eb' : '#2a1b12'; const k = P.moustache === 'thick' ? 1.3 : 1; c.beginPath(); c.ellipse(-16, 44, 18 * k, 7 * k, 0.15, 0, 7); c.ellipse(16, 44, 18 * k, 7 * k, -0.15, 0, 7); c.fill(); }
  // mouth
  const mo = shock ? 0.75 + talk * 0.25 : talk, mc = P.lips || '#5a1a1a';
  if (mo > 0.08) {
    const h = 6 + 30 * mo, w = shock ? 22 : 30;
    c.fillStyle = '#5a1a1a'; c.beginPath(); c.ellipse(0, 66 + h * 0.3, w, h / 1.6, 0, 0, 7); c.fill();
    c.fillStyle = '#e57373'; c.beginPath(); c.ellipse(0, 66 + h * 0.55, w * 0.6, h / 4, 0, 0, 7); c.fill();
    c.fillStyle = '#fff'; c.fillRect(-w * 0.6, 66 + h * 0.3 - h / 1.6 + 2, w * 1.2, Math.min(8, h / 4));
    if (P.lips) { c.strokeStyle = mc; c.lineWidth = 4; c.beginPath(); c.ellipse(0, 66 + h * 0.3, w, h / 1.6, 0, 0, 7); c.stroke(); }
  } else {
    c.strokeStyle = mc; c.lineWidth = P.lips ? 6 : 5; c.beginPath();
    if (mood === 'worried') c.arc(0, 80, 18, Math.PI + 0.4, -0.4); else c.arc(0, 56, 22, 0.35, Math.PI - 0.35);
    c.stroke();
  }
  if (mood === 'worried' || shock) { const d = (t * 0.8) % 1; c.fillStyle = 'rgba(96,165,250,0.9)'; c.beginPath(); c.moveTo(84, -40 + d * 30); c.quadraticCurveTo(96, -20 + d * 30, 84, -14 + d * 30); c.quadraticCurveTo(72, -20 + d * 30, 84, -40 + d * 30); c.fill(); }
  }
  c.restore();
  // headphones around neck
  if (props.includes('headphones')) { c.strokeStyle = '#111827'; c.lineWidth = 10; c.beginPath(); c.arc(0, top - 6, 46, 0.15, Math.PI - 0.15); c.stroke(); [-1, 1].forEach(s => { c.fillStyle = '#f43f5e'; c.beginPath(); c.roundRect(s * 46 - 14, top - 10, 28, 36, 10); c.fill(); }); }
  if (props.includes('bangles')) hands.forEach(([hx, hy]) => { c.strokeStyle = '#f4cf6a'; c.lineWidth = 5; c.beginPath(); c.ellipse(hx, hy - 22, 18, 6, 0, 0, 7); c.stroke(); });
  if (props.includes('warning')) { c.font = '70px "Noto Color Emoji"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('⚠️', 120, HY - 110 + Math.sin(t * 5) * 6); }
  c.restore();
}

function arm(c, sx, sy, a1, a2, len, hand, sleeve, SKIN, SKIN_D, P) {
  const ex = sx + Math.sin(a1) * len, ey = sy + Math.cos(a1) * len, hx = ex + Math.sin(a2) * len * 0.95, hy = ey + Math.cos(a2) * len * 0.95;
  limb(c, [[sx, sy], [ex, ey], [hx, hy]], 40, dark(sleeve, 0.7)); limb(c, [[sx, sy], [ex, ey], [hx, hy]], 32, sleeve);
  c.fillStyle = SKIN; c.strokeStyle = SKIN_D; c.lineWidth = 3; c.beginPath(); c.arc(hx, hy, 19, 0, 7); c.fill(); c.stroke();
  if (hand === 'point') { c.save(); c.translate(hx, hy); c.rotate(-a2); c.fillStyle = SKIN; c.beginPath(); c.roundRect(-6, 8, 12, 26, 6); c.fill(); c.stroke(); c.restore(); }
  if (hand === 'thumb') { c.font = '64px "Noto Color Emoji"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('👍', hx, hy - 8); }
  if (hand === 'phone') { c.fillStyle = '#111827'; c.beginPath(); c.roundRect(hx - 16, hy - 52, 32, 56, 6); c.fill(); c.fillStyle = '#38bdf8'; c.fillRect(hx - 12, hy - 46, 24, 40); }
  if (hand === 'stick') { limb(c, [[hx, hy], [hx + 8, hy + 210]], 8, '#78350f'); limb(c, [[hx - 18, hy - 4], [hx + 4, hy - 4]], 8, '#78350f'); }
  if (hand === 'piggy') { c.fillStyle = '#f9a8d4'; c.strokeStyle = '#db2777'; c.lineWidth = 3; c.beginPath(); c.ellipse(hx - 30, hy - 30, 46, 34, 0, 0, 7); c.fill(); c.stroke(); c.beginPath(); c.ellipse(hx - 76, hy - 30, 12, 10, 0, 0, 7); c.fill(); c.stroke(); c.fillStyle = '#831843'; c.fillRect(hx - 40, hy - 62, 20, 5); c.beginPath(); c.arc(hx - 50, hy - 38, 4, 0, 7); c.fill(); c.font = '900 26px Inter'; c.textAlign = 'center'; c.fillText('₹', hx - 22, hy - 24); }
  if (hand === 'tablet') { c.fillStyle = '#111827'; c.beginPath(); c.roundRect(hx - 90, hy - 80, 100, 70, 8); c.fill(); c.strokeStyle = '#22c55e'; c.lineWidth = 4; c.beginPath(); [[0, 50], [20, 40], [40, 46], [60, 24], [80, 14]].forEach(([a, b], i) => i ? c.lineTo(hx - 84 + a, hy - 80 + b) : c.moveTo(hx - 84 + a, hy - 80 + b)); c.stroke(); }
  if (hand === 'kettle') { c.fillStyle = '#9ca3af'; c.strokeStyle = '#4b5563'; c.lineWidth = 3; c.beginPath(); c.ellipse(hx + 6, hy - 40, 34, 28, 0, 0, 7); c.fill(); c.stroke(); limb(c, [[hx + 38, hy - 46], [hx + 66, hy - 66]], 8, '#6b7280'); c.beginPath(); c.arc(hx + 6, hy - 70, 8, 0, 7); c.fillStyle = '#4b5563'; c.fill(); for (let k = 0; k < 3; k++) limb(c, [[hx - 10 + k * 14, hy - 96], [hx - 4 + k * 14, hy - 120]], 4, 'rgba(255,255,255,0.7)'); }
  if (hand === 'qr') { c.fillStyle = '#fff'; c.strokeStyle = '#111'; c.lineWidth = 4; c.beginPath(); c.rect(hx - 50, hy - 110, 100, 110); c.fill(); c.stroke(); c.fillStyle = '#111'; for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) if ((i * 7 + j * 3) % 4 < 2 || (i < 2 && j < 2)) c.fillRect(hx - 42 + i * 12, hy - 102 + j * 12, 10, 10); c.font = '900 16px Inter'; c.textAlign = 'center'; c.fillText('UPI', hx, hy - 12); }
  if (hand === 'calc') { c.fillStyle = '#334155'; c.beginPath(); c.roundRect(hx - 70, hy - 96, 70, 96, 8); c.fill(); c.fillStyle = '#a7f3d0'; c.fillRect(hx - 62, hy - 88, 54, 20); c.fillStyle = '#e2e8f0'; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) c.fillRect(hx - 62 + i * 18, hy - 60 + j * 18, 14, 14); }
  if (hand === 'files') { ['#f59e0b', '#3b82f6', '#ef4444'].forEach((col, i) => { c.fillStyle = col; c.fillRect(hx - 10 + i * 4, hy - 100 + i * 6, 80, 96); }); c.fillStyle = '#fff'; c.font = '900 16px Inter'; c.textAlign = 'center'; c.fillText('LOAN', hx + 38, hy - 40); }
  if (hand === 'cash') { for (let i = -3; i <= 3; i++) { c.save(); c.translate(hx, hy - 10); c.rotate(i * 0.18); c.fillStyle = '#86efac'; c.strokeStyle = '#15803d'; c.lineWidth = 2; c.fillRect(-14, -90, 28, 80); c.strokeRect(-14, -90, 28, 80); c.fillStyle = '#15803d'; c.font = '900 18px Inter'; c.textAlign = 'center'; c.fillText('₹', 0, -50); c.restore(); } }
  if (hand === 'dumbbell') { c.fillStyle = '#111827'; c.fillRect(hx - 40, hy - 6, 80, 12); [-1, 1].forEach(s => { c.beginPath(); c.roundRect(hx + s * 40 - 12, hy - 26, 24, 52, 6); c.fill(); }); }
  if (hand === 'paper') { c.fillStyle = '#f8fafc'; c.strokeStyle = '#94a3b8'; c.lineWidth = 2; c.beginPath(); c.rect(hx - 100, hy - 90, 100, 80); c.fill(); c.stroke(); c.fillStyle = '#334155'; c.font = '900 14px Inter'; c.textAlign = 'left'; c.fillText('SENSEX', hx - 92, hy - 70); for (let i = 0; i < 4; i++) c.fillRect(hx - 92, hy - 60 + i * 11, 80, 4); }
  return [hx, hy];
}

function hairBack(c, P) {
  c.fillStyle = P.hairC;
  if (P.hair === 'long' || P.hair === 'bridal') { [-1, 1].forEach(k => { c.beginPath(); c.roundRect(k > 0 ? 58 : -108, -70, 50, 210, 24); c.fill(); }); }
  if (P.hair === 'braid') { c.beginPath(); c.roundRect(-100, -60, 200, 120, 50); c.fill(); for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(74, 60 + i * 26, 16, 16, 0, 0, 7); c.fill(); } c.fillStyle = '#f43f5e'; c.beginPath(); c.arc(74, 214, 9, 0, 7); c.fill(); }
  if (P.hair === 'ponytail') { c.beginPath(); c.ellipse(96, 10, 30, 70, -0.3, 0, 7); c.fill(); }
  if (P.hair === 'whitebun') { c.beginPath(); c.arc(70, -64, 36, 0, 7); c.fill(); }
  if (P.hair === 'hood') { c.fillStyle = '#111827'; c.beginPath(); c.ellipse(0, 0, 124, 132, 0, 0, 7); c.fill(); }
}
function hairFront(c, P, t) {
  c.fillStyle = P.hairC; const h = P.hair;
  if (h === 'swoop' || h === 'short' || h === 'cap' || h === 'spiky') {
    c.beginPath(); c.moveTo(-94, 0); c.quadraticCurveTo(-104, -96, -20, -110); c.quadraticCurveTo(70, -122, 96, -40); c.quadraticCurveTo(98, -6, 90, 4);
    c.quadraticCurveTo(70, -52, 10, -58); c.quadraticCurveTo(-30, -40, -60, -62); c.quadraticCurveTo(-80, -40, -94, 0); c.closePath(); c.fill();
    if (h === 'spiky') for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(i * 26 - 14, -96); c.lineTo(i * 26, -136 - (i % 2) * 10); c.lineTo(i * 26 + 14, -96); c.fill(); }
  }
  if (h === 'cap') { c.fillStyle = P.capC; c.beginPath(); c.ellipse(0, -62, 98, 62, 0, Math.PI, 0); c.fill(); c.beginPath(); c.ellipse(-70, -60, 70, 16, 0.15, 0, 7); c.fill(); c.fillStyle = '#fff'; c.font = '900 30px Inter'; c.textAlign = 'center'; c.fillText('₹', 10, -84); }
  if (h === 'bald') { c.beginPath(); c.ellipse(-88, -10, 14, 40, 0.1, 0, 7); c.ellipse(88, -10, 14, 40, -0.1, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.ellipse(-20, -78, 26, 10, -0.3, 0, 7); c.fill(); }
  if (h === 'white') { c.beginPath(); c.ellipse(-86, -24, 18, 44, 0.2, 0, 7); c.ellipse(86, -24, 18, 44, -0.2, 0, 7); c.fill(); c.beginPath(); c.ellipse(0, -96, 50, 14, 0, 0, 7); c.fill(); }
  if (h === 'ponytail' || h === 'long' || h === 'braid' || h === 'bun' || h === 'buns2' || h === 'whitebun') {
    c.beginPath(); c.moveTo(-96, 20); c.quadraticCurveTo(-110, -110, 0, -112); c.quadraticCurveTo(110, -110, 96, 20); c.quadraticCurveTo(80, -40, 0, -64); c.quadraticCurveTo(-80, -40, -96, 20); c.closePath(); c.fill();
    if (h === 'braid' || h === 'whitebun') { c.strokeStyle = 'rgba(255,255,255,0.25)'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -110); c.lineTo(0, -66); c.stroke(); }
    if (h === 'ponytail') { c.fillStyle = '#f43f5e'; c.beginPath(); c.roundRect(80, -46, 20, 16, 5); c.fill(); }
  }
  if (h === 'buns2') [-1, 1].forEach(s => { c.fillStyle = P.hairC; c.beginPath(); c.arc(s * 70, -104, 32, 0, 7); c.fill(); c.fillStyle = P.hairTip; c.beginPath(); c.arc(s * 70, -112, 14, 0, 7); c.fill(); });
  if (h === 'neat' || h === 'shadesup' || h === 'headband') { c.beginPath(); c.moveTo(-94, 0); c.quadraticCurveTo(-100, -100, 0, -108); c.quadraticCurveTo(100, -104, 94, 0); c.quadraticCurveTo(80, -56, 20, -62); c.lineTo(-30, -66); c.quadraticCurveTo(-80, -50, -94, 0); c.fill(); if (h === 'neat') { c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 4; c.beginPath(); c.moveTo(-30, -104); c.quadraticCurveTo(-36, -84, -30, -66); c.stroke(); } }
  if (h === 'shadesup') { c.fillStyle = '#0b0b0f'; [-1, 1].forEach(s => { c.beginPath(); c.roundRect(s * 34 - 30, -104, 60, 30, 12); c.fill(); }); }
  if (h === 'headband') { c.fillStyle = P.bandC; c.fillRect(-94, -70, 188, 22); c.beginPath(); c.moveTo(90, -64); c.lineTo(122, -40); c.lineTo(112, -30); c.closePath(); c.fill(); }
  if (h === 'bun' || h === 'bridal') { c.beginPath(); c.moveTo(-96, 20); c.quadraticCurveTo(-110, -110, 0, -112); c.quadraticCurveTo(110, -110, 96, 20); c.quadraticCurveTo(80, -40, 0, -64); c.quadraticCurveTo(-80, -40, -96, 20); c.closePath(); c.fill(); if (h === 'bun') { c.beginPath(); c.arc(0, -116, 30, 0, 7); c.fill(); } else { c.strokeStyle = '#facc15'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, -110); c.lineTo(0, -66); c.stroke(); c.fillStyle = '#facc15'; c.beginPath(); c.arc(0, -60, 10, 0, 7); c.fill(); c.fillStyle = '#dc2626'; c.beginPath(); c.arc(0, -58, 4, 0, 7); c.fill(); } }
  if (h === 'helmet') { c.fillStyle = P.helmetC; c.beginPath(); c.ellipse(0, -40, 104, 92, 0, Math.PI, 0); c.fill(); c.fillRect(-104, -42, 208, 18); c.fillStyle = 'rgba(15,23,42,0.6)'; c.beginPath(); c.ellipse(0, -96, 70, 22, 0, 0, 7); c.fill(); }
  if (h === 'turban') { c.fillStyle = P.turbanC; c.beginPath(); c.moveTo(-98, -10); c.quadraticCurveTo(-110, -150, 0, -150); c.quadraticCurveTo(110, -150, 98, -10); c.quadraticCurveTo(60, -60, 0, -54); c.quadraticCurveTo(-60, -60, -98, -10); c.fill(); c.strokeStyle = dark(P.turbanC); c.lineWidth = 4; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(-90 + k * 10, -30 - k * 30); c.quadraticCurveTo(0, -90 - k * 30, 90 - k * 10, -40 - k * 26); c.stroke(); } }
  if (h === 'tuft') { for (let k = -2; k <= 2; k++) { c.beginPath(); c.arc(k * 16, -100 - Math.abs(k) * -4, 16, 0, 7); c.fill(); } }
  if (h === 'hood') { c.strokeStyle = '#111827'; c.lineWidth = 26; c.beginPath(); c.ellipse(0, 0, 104, 112, 0, 0, 7); c.stroke(); c.fillStyle = P.hairC; c.beginPath(); c.ellipse(0, -84, 70, 22, 0, 0, 7); c.fill(); }
}

function robotHead(c, t, talk, mood) {
  limb(c, [[0, -100], [0, -150]], 6, '#64748b'); c.fillStyle = (t % 1.2) < 0.6 ? '#ef4444' : '#7f1d1d'; c.beginPath(); c.arc(0, -156, 12, 0, 7); c.fill();
  const g = c.createLinearGradient(0, -100, 0, 100); g.addColorStop(0, '#e2e8f0'); g.addColorStop(1, '#94a3b8');
  c.fillStyle = g; c.strokeStyle = '#64748b'; c.lineWidth = 5; c.beginPath(); c.roundRect(-100, -100, 200, 196, 40); c.fill(); c.stroke();
  [-1, 1].forEach(s => { c.fillStyle = '#64748b'; c.beginPath(); c.roundRect(s * 100 - (s > 0 ? 0 : 20), -30, 20, 60, 8); c.fill(); });
  c.fillStyle = '#0f172a'; c.beginPath(); c.roundRect(-80, -62, 160, 78, 24); c.fill();
  const bl = (t % 2.7) < 0.15 ? 0.2 : 1, sh = mood === 'shock';
  [-1, 1].forEach(s => { c.fillStyle = '#22d3ee'; c.beginPath(); c.roundRect(s * 38 - 18, -36 - (sh ? 8 : 0), 36, (sh ? 36 : 26) * bl, 8); c.fill(); });
  c.fillStyle = '#0f172a'; c.beginPath(); c.roundRect(-56, 36, 112, 40, 12); c.fill();
  for (let i = 0; i < 7; i++) { const h = 6 + 26 * talk * (0.5 + 0.5 * Math.abs(Math.sin(t * 20 + i))); c.fillStyle = '#22d3ee'; c.fillRect(-46 + i * 14, 56 - h / 2, 8, h); }
}
function drawGhost(c, t, mood, lv) {
  const fy = -40 + Math.sin(t * 2.4) * 14, talk = cl(lv * 1.4);
  c.fillStyle = 'rgba(0,0,0,0.12)'; c.beginPath(); c.ellipse(0, 0, 80, 14, 0, 0, 7); c.fill();
  c.save(); c.translate(0, fy);
  c.fillStyle = 'rgba(248,250,252,0.96)'; c.strokeStyle = '#cbd5e1'; c.lineWidth = 4; c.beginPath();
  c.moveTo(-110, -60); c.quadraticCurveTo(-110, -420, 0, -420); c.quadraticCurveTo(110, -420, 110, -60);
  for (let i = 0; i < 5; i++) { const x0 = 110 - i * 44, w = Math.sin(t * 6 + i) * 10; c.quadraticCurveTo(x0 - 22, -20 + w, x0 - 44, -60); }
  c.closePath(); c.fill(); c.stroke();
  const wave = mood === 'wave' ? Math.sin(t * 9) * 0.5 : 0;
  [-1, 1].forEach(s => { c.save(); c.translate(s * 100, -220); c.rotate(s * (0.8 + (s > 0 ? wave : 0))); c.fillStyle = 'rgba(248,250,252,0.96)'; c.beginPath(); c.ellipse(s * 26, 0, 40, 18, 0, 0, 7); c.fill(); c.stroke(); c.restore(); });
  const bl = (t % 3.3) < 0.12 ? 0.15 : 1;
  [-1, 1].forEach(s => { c.save(); c.translate(s * 40, -300); c.scale(1, bl); c.fillStyle = '#111827'; c.beginPath(); c.ellipse(0, 0, 20, 30, 0, 0, 7); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(6, -10, 6, 0, 7); c.fill(); c.restore(); });
  c.fillStyle = 'rgba(244,114,182,0.4)'; [-1, 1].forEach(s => { c.beginPath(); c.ellipse(s * 66, -260, 18, 10, 0, 0, 7); c.fill(); });
  c.fillStyle = '#111827'; c.beginPath(); c.ellipse(0, -240, 20 + 6 * talk, 10 + 26 * talk, 0, 0, 7); c.fill();
  c.fillStyle = '#dc2626'; c.beginPath(); c.roundRect(-58, -170, 116, 60, 10); c.fill(); c.fillStyle = '#fff'; c.font = '900 38px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('EMI ₹', 0, -138);
  limb(c, [[-40, -170], [-10, -200], [20, -170]], 4, '#9ca3af');
  c.restore();
}
