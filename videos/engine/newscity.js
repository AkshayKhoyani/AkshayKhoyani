// NEWS CITY template: Finance Junction's best-performing look (3D low-poly city, a "highway" of date gates,
// floating props per news item) + Junction Bhai cartoon anchor + karaoke captions + FOLLOW/REPOST footer.
// Everything is drawn in code (no AI images). One spec.json per reel; see engine/NEWSCITY.md.
import * as FJ from '/engine/fj3d.js';
import { mascot } from '/engine/mascot.js';
const { THREE, PAL } = FJ;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const M = c => new THREE.MeshLambertMaterial({ color: c, flatShading: true });
const COL = { green: PAL.green, red: PAL.red, blue: PAL.blue, gold: PAL.gold, navy: PAL.navy };
const col = c => COL[c] || c || PAL.gold;

export async function run() {
  const spec = await (await fetch('./spec.json')).json();
  const fj = await FJ.boot();
  const { L, E, A, scene } = fj, T = fj.tl.total;
  const ROADX = 30, GAP = 78, Z0 = 100;
  const stops = spec.stops.map((s, i) => ({ ...s, z: Z0 - i * GAP }));
  FJ.buildCity(fj, { seed: spec.seed || 11, reserved: stops.flatMap(s => [{ x: ROADX, z: s.z, r: 20 }, { x: ROADX, z: s.z + 34, r: 14 }]) });

  function textTexture(lines, o = {}) {
    const { w = 1024, h = 256, bg = PAL.navy, border = PAL.gold } = o;
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d'); x.fillStyle = bg; x.fillRect(0, 0, w, h);
    x.strokeStyle = border; x.lineWidth = 14; x.strokeRect(7, 7, w - 14, h - 14);
    x.textAlign = 'center'; x.textBaseline = 'middle';
    lines.forEach(([t, size, color, y]) => {
      x.font = `900 ${size}px Inter, "Noto Color Emoji", sans-serif`;
      const m = x.measureText(t).width, k = Math.min(1, (w - 60) / m);
      x.save(); x.translate(w / 2, y); x.scale(k, 1); x.fillStyle = color; x.fillText(t, 0, 0); x.restore();
    });
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; return tex;
  }
  const plane = (g, tex, w, h, pos, rotY = 0) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
    m.position.copy(pos); m.rotation.y = rotY; g.add(m); return m;
  };
  const platform = (g, y, z, w, d) => {
    const p = new THREE.Mesh(new THREE.BoxGeometry(w, 1.2, d), M(PAL.navy)); p.position.set(ROADX, y, z); g.add(p);
    const e = new THREE.Mesh(new THREE.BoxGeometry(w + 0.6, 0.5, d + 0.6), new THREE.MeshBasicMaterial({ color: PAL.gold })); e.position.set(ROADX, y - 0.6, z); g.add(e);
  };
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, GAP * stops.length + 200), new THREE.MeshBasicMaterial({ color: PAL.gold }));
  stripe.position.set(ROADX, 0.35, Z0 - GAP * (stops.length - 1) / 2); scene.add(stripe);

  // ---------- gates ----------
  stops.forEach(s => {
    if (!s.gate) return;
    const [day, date, sub, accent] = s.gate, z = s.z + 36, g = new THREE.Group();
    [-1, 1].forEach(k => { const p = new THREE.Mesh(new THREE.BoxGeometry(2.4, 40, 2.4), M(PAL.navy)); p.position.set(ROADX + k * 11, 20, z); g.add(p); });
    const beam = new THREE.Mesh(new THREE.BoxGeometry(26, 7.5, 2.2), M(PAL.navy)); beam.position.set(ROADX, 40, z); g.add(beam);
    plane(g, textTexture([[`${day} · ${date}`, 104, '#ffffff', 100], [sub, 62, accent || '#f4cf6a', 196]]), 24, 6, V(ROADX, 40, z + 1.2));
    scene.add(g);
  });

  // ---------- props ----------
  const PROPS = {
    gdp(g, s, li) { // rising bars
      platform(g, 6, s.z, 34, 10); const bars = [];
      [8, 10, 12, 14, 18].forEach((h, i) => { const b = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1, 4.6), M(i === 4 ? PAL.green : '#7aa58a')); b.position.set(ROADX - 13 + i * 6.5, 7, s.z); b.userData.h = h; g.add(b); bars.push(b); });
      fj.updaters.push(t => bars.forEach((b, i) => { const k = FJ.easeOut(FJ.prog(t, A(li, 0.05 + i * 0.06), A(li, 0.25 + i * 0.06))); const h = 0.5 + b.userData.h * k; b.scale.y = h; b.position.y = 6.6 + h / 2; }));
      return V(ROADX, 28, s.z);
    },
    chart(g, s, li) { // up or down chart of blocks
      platform(g, 6, s.z, 36, 8); const up = (s.prop.dir || 'up') === 'up', bars = [];
      const hs = up ? [5, 8, 7, 11, 15, 19] : [19, 15, 16, 11, 8, 5];
      hs.forEach((h, i) => { const b = new THREE.Mesh(new THREE.BoxGeometry(4.4, 1, 4.4), M(up ? PAL.green : PAL.red)); b.position.set(ROADX - 15 + i * 6, 7, s.z); b.userData.h = h; g.add(b); bars.push(b); });
      fj.updaters.push(t => bars.forEach((b, i) => { const k = FJ.easeOut(FJ.prog(t, A(li, 0.05 + i * 0.05), A(li, 0.22 + i * 0.05))); const h = 0.5 + b.userData.h * k; b.scale.y = h; b.position.y = 6.6 + h / 2; }));
      const ar = new THREE.Mesh(new THREE.ConeGeometry(3, 6, 4), M(up ? PAL.green : PAL.red)); ar.position.set(ROADX + 16, up ? 31 : 9, s.z); if (!up) ar.rotation.z = Math.PI; g.add(ar);
      fj.updaters.push(t => { ar.position.y = (up ? 31 : 9) + Math.sin(t * 4) * 1.2; ar.rotation.y = t * 2; });
      return V(ROADX, 26, s.z);
    },
    bank(g, s, li) { // RBI style bank + spinning % ring
      platform(g, 4, s.z, 30, 24);
      const b = FJ.addBank(fj, ROADX, s.z, 18, 22, 16); scene.remove(b.g); b.g.position.y = 4; g.add(b.g);
      const pct = plane(g, textTexture([['%', 200, '#f4cf6a', 135]], { w: 256, h: 256 }), 8, 8, V(ROADX, 36, s.z));
      const ring = new THREE.Mesh(new THREE.TorusGeometry(9, 0.7, 6, 40), new THREE.MeshBasicMaterial({ color: PAL.gold2 })); ring.position.set(ROADX, 36, s.z); g.add(ring);
      fj.updaters.push(t => { pct.rotation.y = t * 1.4; ring.rotation.x = t * 0.9; ring.rotation.y = t * 0.5; });
      return V(ROADX, 44, s.z);
    },
    us(g, s, li) { // US building + waving flag
      platform(g, 8, s.z, 30, 16);
      const body = new THREE.Mesh(new THREE.BoxGeometry(26, 14, 10), M('#f3f1ec')); body.position.set(ROADX, 16, s.z - 2); g.add(body);
      const ped = new THREE.Mesh(new THREE.ConeGeometry(16, 6, 4), M('#e2ddd3')); ped.position.set(ROADX, 26, s.z - 2); ped.rotation.y = Math.PI / 4; ped.scale.z = 0.5; g.add(ped);
      for (let i = -2; i <= 2; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 12, 8), M('#ffffff')); c.position.set(ROADX + i * 5, 15, s.z + 4); g.add(c); }
      const fc = document.createElement('canvas'); fc.width = 380; fc.height = 200; const x = fc.getContext('2d');
      for (let i = 0; i < 13; i++) { x.fillStyle = i % 2 ? '#ffffff' : '#b22234'; x.fillRect(0, i * 200 / 13, 380, 200 / 13 + 1); }
      x.fillStyle = '#3c3b6e'; x.fillRect(0, 0, 152, 108);
      const ft = new THREE.CanvasTexture(fc); ft.colorSpace = THREE.SRGBColorSpace;
      const flag = plane(g, ft, 8, 4.2, V(ROADX + 10, 33, s.z - 2));
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 9, 6), M('#d1d5db')); pole.position.set(ROADX + 5.8, 31, s.z - 2); g.add(pole);
      fj.updaters.push(t => { flag.rotation.y = Math.sin(t * 3) * 0.25; });
      return V(ROADX, 30, s.z);
    },
    jobs(g, s, li) { // row of little workers popping up
      platform(g, 5, s.z, 34, 10); const ppl = [];
      ['#2f6fdb', '#e04646', '#22a565', '#d4a62c', '#6b7280', '#2f6fdb'].forEach((c, i) => {
        const p = new THREE.Group();
        const b = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 4, 8), M(c)); b.position.y = 2; p.add(b);
        const h = new THREE.Mesh(new THREE.SphereGeometry(1.3, 10, 8), M('#e6b07a')); h.position.y = 5; p.add(h);
        p.position.set(ROADX - 14 + i * 5.6, 5.6, s.z); p.scale.setScalar(1.5); g.add(p); ppl.push(p);
      });
      fj.updaters.push(t => ppl.forEach((p, i) => { const k = FJ.easeBack(FJ.prog(t, A(li, 0.1 + i * 0.06), A(li, 0.25 + i * 0.06))); p.scale.setScalar(1.5 * Math.max(k, 0.001)); p.position.y = 5.6 + Math.abs(Math.sin(t * 5 + i)) * 0.8; }));
      return V(ROADX, 20, s.z);
    },
    oil(g, s, li) { // oil barrels + rising price arrow
      platform(g, 5, s.z, 26, 12);
      for (let i = 0; i < 3; i++) {
        const br = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 7, 14), M(i === 1 ? '#1f2937' : '#374151')); br.position.set(ROADX - 7 + i * 7, 9.4, s.z); g.add(br);
        [-2, 2].forEach(dy => { const band = new THREE.Mesh(new THREE.TorusGeometry(3.02, 0.25, 4, 18), M(PAL.gold)); band.rotation.x = Math.PI / 2; band.position.set(ROADX - 7 + i * 7, 9.4 + dy, s.z); g.add(band); });
      }
      const drop = new THREE.Mesh(new THREE.SphereGeometry(2.4, 12, 10), M('#111827')); drop.scale.y = 1.4; drop.position.set(ROADX, 22, s.z); g.add(drop);
      fj.updaters.push(t => { drop.position.y = 22 + Math.sin(t * 2.5) * 1.5; drop.rotation.y = t; });
      return V(ROADX, 26, s.z);
    },
    msci(g, s, li) { // floating cube
      const cube = new THREE.Mesh(new THREE.BoxGeometry(12, 12, 12), M(PAL.navy2)); cube.position.set(ROADX, 24, s.z); g.add(cube);
      const lbl = plane(g, textTexture([[s.prop.text || 'MSCI', 150, '#f4cf6a', 128]]), 10, 2.5, V(ROADX, 24, s.z + 6.1));
      fj.updaters.push(t => { cube.position.y = 24 + Math.sin(t * 1.6) * 0.8; cube.rotation.y = Math.sin(t * 0.8) * 0.3; lbl.position.y = cube.position.y; lbl.rotation.y = cube.rotation.y; });
      return V(ROADX, 32, s.z);
    },
    globe(g, s, li) { // world markets globe with orbiting ring
      const gl = new THREE.Mesh(new THREE.IcosahedronGeometry(9, 1), M('#3b82f6')); gl.position.set(ROADX, 24, s.z); g.add(gl);
      const land = new THREE.Mesh(new THREE.IcosahedronGeometry(9.15, 1), new THREE.MeshLambertMaterial({ color: '#22a565', flatShading: true, wireframe: true })); land.position.copy(gl.position); g.add(land);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(13, 0.5, 6, 40), new THREE.MeshBasicMaterial({ color: PAL.gold2 })); ring.position.copy(gl.position); ring.rotation.x = 1.2; g.add(ring);
      fj.updaters.push(t => { gl.rotation.y = t * 0.8; land.rotation.y = t * 0.8; ring.rotation.z = t; });
      return V(ROADX, 34, s.z);
    },
    exchange(g, s, li) { // stock exchange facade; prop.closed = true drops a CLOSED shutter
      platform(g, 7, s.z, 32, 12);
      const body = new THREE.Mesh(new THREE.BoxGeometry(30, 18, 8), M('#e9e4da')); body.position.set(ROADX, 17, s.z - 2); g.add(body);
      const roof = new THREE.Mesh(new THREE.BoxGeometry(32, 3, 10), M(PAL.navy)); roof.position.set(ROADX, 27.5, s.z - 2); g.add(roof);
      for (let i = -2; i <= 2; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 13, 8), M('#ffffff')); c.position.set(ROADX + i * 5.6, 14.2, s.z + 3.5); g.add(c); }
      plane(g, textTexture([[s.prop.text || 'STOCK EXCHANGE', 120, '#ffffff', 128]]), 26, 6.4, V(ROADX, 24.5, s.z + 3.2));
      if (s.prop.closed) {
        const sh = new THREE.Mesh(new THREE.BoxGeometry(28, 13, 0.8), M('#9aa3ad')); sh.position.set(ROADX, 34, s.z + 4.4); g.add(sh);
        const cl = plane(g, textTexture([['CLOSED 🔒', 150, '#ffffff', 128]], { bg: '#b91c1c', border: '#ffffff' }), 16, 4, V(ROADX, 14, s.z + 5));
        fj.updaters.push(t => { const k = FJ.easeOut(FJ.prog(t, A(li, 0.15), A(li, 0.5))); sh.position.y = 34 - 19.5 * k; cl.visible = k > 0.95; });
      }
      return V(ROADX, 30, s.z);
    },
  };
  const groups = stops.map((s, i) => {
    const g = new THREE.Group(); scene.add(g);
    s.anchor = (PROPS[s.prop?.type] || PROPS.msci)(g, s, s.line);
    if (s.label) plane(g, textTexture([[s.label, 110, '#ffffff', 128]], { bg: col(s.labelBg || PAL.navy), border: PAL.gold }), 18, 4.5, V(ROADX, s.prop?.type === 'bank' ? 15 : 31, s.z + 6));
    return g;
  });
  // each stop's prop spins away after its line, so the camera never flies through it
  fj.updaters.push(t => groups.forEach((g, i) => {
    const li = stops[i].endLine ?? stops[i].line;
    if (i === stops.length - 1) return;
    const k = FJ.easeInOut(FJ.prog(t, E(li) - 0.05, E(li) + 0.6));
    g.visible = k < 0.99; const f = Math.max(1 - k, 0.001);
    g.scale.set(1, f, 1); g.position.y = 16 * k; g.rotation.y = 0;
  }));

  // ---------- camera ----------
  const keys = [{ t: 0, pos: [30, 135, 270], at: [30, 0, -70] }];
  stops.forEach((s, i) => {
    const li = s.line, le = s.endLine ?? s.line;
    keys.push({ t: Math.max(L(li), keys[keys.length - 1].t + 0.3), pos: [30, 26, s.z + 120], at: [30, 22, s.z] });
    keys.push({ t: L(li) + (E(le) - L(li)) * 0.7, pos: [30, 20, s.z + 64], at: [30, 19, s.z] });
  });
  keys.push({ t: T, pos: [30, 260, Z0 - GAP * stops.length + 260], at: [30, 0, Z0 - GAP * (stops.length - 1)] });
  FJ.cameraPath(fj, keys);

  // ---------- overlays ----------
  const hookEnd = E(0) - 0.2;
  FJ.hookTitle(fj, spec.hook, hookEnd, { y: 540, size: spec.hookSize || 86 });
  if (spec.hookSub) FJ.bigText(fj, spec.hookSub, 540, 860, 0.5, hookEnd, { size: 58, color: '#ffffff', bg: 'rgba(212,166,44,0.95)' });
  stops.forEach(s => (s.callouts || []).forEach(c => FJ.callout(fj, s.anchor, c.text, A(s.line, c.at ?? 0.2), c.to != null ? A(s.endLine ?? s.line, c.to) : E(s.endLine ?? s.line), { dx: c.dx ?? -160, dy: c.dy ?? -260, dot: col(c.color) })));
  FJ.hud(fj, stops.filter(s => s.hud).map(s => ({ t0: L(s.line), t1: E(s.endLine ?? s.line), value: s.hud.value, label: s.hud.label, color: col(s.hud.color) })));
  const last = fj.tl.lines.length - 1;
  FJ.brandBadge(fj, E(0), L(last));
  FJ.tag(fj, 'not advice');
  FJ.endCard(fj, L(last), { cta: spec.cta || 'Follow karo 🔔', note: spec.endNote || 'Not investment advice.' });
  FJ.captions(fj, { y: 1500 });
  footer(fj, L(last));
  const moods = (spec.mascot || []).map(m => ({ t0: m.line != null ? L(m.line) + (m.at || 0) * (E(m.line) - L(m.line)) : m.t0, t1: m.to != null ? L(m.line) + m.to * (E(m.line) - L(m.line)) : (m.line != null ? E(m.line) + 0.2 : m.t1), mood: m.mood }));
  await mascot(fj, { moods, appear: -1, pos: t => ({ x: 905, y: 1452, s: 0.7 }) });
  FJ.progressBar(fj);
  FJ.ready(fj);
}

// FOLLOW / REPOST buttons with a tapping hand (alternates every 2.4 s); bigger on the end card
function footer(fj, bigAt) {
  const R = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect(x, y, w, h, r); };
  fj.overlays.push(t => {
    const x = fj.ctx, Y = 1622, big = t >= bigAt, k = big ? 1 + 0.2 * FJ.easeBack(FJ.prog(t, bigAt + 0.4, bigAt + 0.9)) : 1;
    const slot = Math.floor(t / 2.4) % 2, ph = (t % 2.4) / 2.4;
    const btn = (X, label, bg, active) => {
      const pz = active && ph > 0.35 && ph < 0.5 ? 0.9 : 1, pu = active ? 1 + 0.06 * Math.max(0, Math.sin(ph * Math.PI * 2)) : 1;
      x.save(); x.translate(X, Y); x.scale(k * pz * pu, k * pz * pu); x.font = '900 40px Inter, "Noto Color Emoji", sans-serif';
      const w = x.measureText(label).width + 66;
      x.shadowColor = active ? bg : 'rgba(0,0,0,0.3)'; x.shadowBlur = active ? 30 : 10; R(x, -w / 2, -38, w, 76, 38); x.fillStyle = bg; x.fill(); x.shadowColor = 'transparent';
      x.strokeStyle = 'rgba(0,0,0,0.18)'; x.lineWidth = 2; x.stroke(); x.fillStyle = '#0b1020'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(label, 0, 3);
      if (active && ph > 0.4 && ph < 0.75) { const r = (ph - 0.4) / 0.35; x.globalAlpha = 1 - r; x.strokeStyle = bg; x.lineWidth = 6; R(x, -w / 2 - r * 30, -38 - r * 30, w + r * 60, 76 + r * 60, 38 + r * 30); x.stroke(); }
      x.restore();
    };
    const fx = big ? 320 : 330, rx = big ? 760 : 690;
    btn(fx, '🔔 FOLLOW', '#f4cf6a', slot === 0); btn(rx, '🔁 REPOST', '#ffffff', slot === 1);
    x.font = '60px "Noto Color Emoji"'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText('👆', (slot === 0 ? fx : rx) + 55, Y + 58 - (ph > 0.35 && ph < 0.5 ? 0 : 16));
  });
}
