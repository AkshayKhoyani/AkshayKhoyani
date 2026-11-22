// Finance Junction 3D explainer engine
// Low-poly 3D world + cinematic camera + callouts, karaoke captions, HUD and brand overlays.
// A video folder provides scene.js (imports this module), script.json and timeline.json.
import * as THREE from 'three';
export { THREE };

export const W = 1080, H = 1920;
export const PAL = {
  sky: '#e8e5de', ground: '#ebe5d8', block: '#e2dacb', road: '#3c424d', lane: '#f4f4f2',
  edge: '#d4a62c', navy: '#0b2545', navy2: '#16325c', gold: '#d4a62c', gold2: '#e8c25a',
  blue: '#2f6fdb', green: '#22a565', red: '#e04646', tree: '#8d9b7e', trunk: '#8a7a68',
  bld: ['#cfcac1', '#d8d3c9', '#c3c7cc', '#b9bdc3', '#dcd5c6', '#c8c1b4'],
  ink: '#16181d', pill: '#1f232b', muted: '#8b9099',
};

// ---------- math helpers ----------
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const prog = (t, a, b) => clamp((t - a) / (b - a));
export const easeOut = x => 1 - Math.pow(1 - x, 3);
export const easeInOut = x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
export const easeBack = x => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
export const lerp = (a, b, k) => a + (b - a) * k;
const rng = seed => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

// ---------- runtime ----------
export async function boot() {
  const tl = await (await fetch('./timeline.json')).json();
  const glCanvas = document.createElement('canvas');
  glCanvas.width = W; glCanvas.height = H;
  const renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(W, H, false);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(PAL.sky);
  scene.fog = new THREE.Fog(PAL.sky, 220, 720);
  const camera = new THREE.PerspectiveCamera(46, W / H, 0.5, 2500);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb9b1a2, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6); sun.position.set(120, 260, 90); scene.add(sun);

  const out = document.createElement('canvas'); out.width = W; out.height = H; out.id = 'out';
  document.body.appendChild(out);
  const ctx = out.getContext('2d');
  const load = src => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.src = src; });
  const [logo, logoDark] = await Promise.all([load('/brand/logo-transparent.png'), load('/brand/logo-dark.png')]);
  await Promise.all(['900', '800', '700', '600', '500'].map(w => document.fonts.load(`${w} 40px Inter`)));
  await document.fonts.load('40px "JetBrains Mono"');
  await document.fonts.load('40px "Noto Color Emoji"', '🔔✓');

  const fj = { tl, renderer, scene, camera, ctx, out, logo, logoDark, updaters: [], overlays: [] };
  // line helpers: L(i) start, E(i) end, D(i) duration, A(i,f) start + f*duration
  fj.L = i => tl.lines[i].start;
  fj.E = i => tl.lines[i].end;
  fj.D = i => tl.lines[i].end - tl.lines[i].start;
  fj.A = (i, f) => fj.L(i) + f * fj.D(i);
  fj.project = v => {
    const p = v.clone().project(camera);
    return { x: (p.x + 1) / 2 * W, y: (1 - p.y) / 2 * H, vis: p.z < 1 && p.z > -1 };
  };
  fj.render = t => {
    fj.updaters.forEach(u => u(t));
    renderer.render(scene, camera);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
    ctx.drawImage(glCanvas, 0, 0);
    fj.overlays.forEach(o => { ctx.save(); o(t); ctx.restore(); });
  };
  window.DUR = tl.total;
  return fj;
}

// ---------- world ----------
function mat(color) { return new THREE.MeshLambertMaterial({ color, flatShading: true }); }

export function buildCity(fj, opts = {}) {
  const { scene } = fj;
  const R = rng(opts.seed || 7);
  const xs = opts.xRoads || [-270, -210, -150, -90, -30, 30, 90, 150, 210, 270];
  const zs = opts.zRoads || [-450, -380, -310, -240, -170, -100, -30, 40, 110, 180, 250];
  const RW = 14;
  const reserved = opts.reserved || []; // [{x,z}] block centers to keep free
  const g = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), mat(PAL.ground));
  g.rotation.x = -Math.PI / 2; scene.add(g);

  const roadMat = mat(PAL.road), edgeMat = mat(PAL.edge), laneMat = mat(PAL.lane), blockMat = mat(PAL.block);
  const x0 = xs[0], x1 = xs[xs.length - 1], z0 = zs[0], z1 = zs[zs.length - 1];
  const addBox = (w, h, d, x, y, z, m) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); scene.add(b); return b; };
  xs.forEach(x => {
    addBox(RW, 0.2, z1 - z0 + RW, x, 0.1, (z0 + z1) / 2, roadMat);
    [-1, 1].forEach(s => addBox(0.8, 0.3, z1 - z0 + RW, x + s * (RW / 2 + 0.4), 0.15, (z0 + z1) / 2, edgeMat));
  });
  zs.forEach(z => addBox(x1 - x0 + RW, 0.22, RW, (x0 + x1) / 2, 0.11, z, roadMat));
  // lane dashes (instanced)
  const dashes = [];
  xs.forEach(x => { for (let z = z0; z < z1; z += 9) dashes.push([x, z, 0]); });
  zs.forEach(z => { for (let x = x0; x < x1; x += 9) dashes.push([x, z, 1]); });
  const dm = new THREE.InstancedMesh(new THREE.BoxGeometry(0.45, 0.05, 4), laneMat, dashes.length);
  const o = new THREE.Object3D();
  dashes.forEach(([x, z, rot], i) => { o.position.set(x, 0.25, z); o.rotation.set(0, rot ? Math.PI / 2 : 0, 0); o.updateMatrix(); dm.setMatrixAt(i, o.matrix); });
  scene.add(dm);

  // blocks + buildings + trees
  const blds = [], trees = [];
  for (let i = 0; i < xs.length - 1; i++) for (let j = 0; j < zs.length - 1; j++) {
    const cx = (xs[i] + xs[i + 1]) / 2, cz = (zs[j] + zs[j + 1]) / 2;
    const bw = xs[i + 1] - xs[i] - RW - 4, bd = zs[j + 1] - zs[j] - RW - 4;
    addBox(bw, 0.5, bd, cx, 0.25, cz, blockMat);
    const res = reserved.find(r => Math.abs(r.x - cx) < 1 && Math.abs(r.z - cz) < 1);
    if (res && res.empty) continue;
    const park = !res && R() < 0.12;
    const n = park ? 0 : 3 + Math.floor(R() * 4);
    for (let k = 0; k < n; k++) {
      const w = 8 + R() * 12, d = 8 + R() * 12;
      const far = Math.hypot(cx, cz) / 400;
      const h = (res ? 6 + R() * 10 : 8 + Math.pow(R(), 1.6) * (40 + 60 * far));
      const bx = cx + (R() - 0.5) * (bw - w), bz = cz + (R() - 0.5) * (bd - d);
      if (res && Math.hypot(bx - res.x - (res.fx || 0), bz - res.z - (res.fz || 0)) < (res.r || 18)) continue;
      blds.push([w, h, d, bx, bz, PAL.bld[Math.floor(R() * PAL.bld.length)]]);
    }
    const nt = park ? 14 : 2 + Math.floor(R() * 3);
    for (let k = 0; k < nt; k++) {
      const tx = cx + (R() - 0.5) * bw, tz = cz + (R() - 0.5) * bd;
      if (res && Math.hypot(tx - res.x - (res.fx || 0), tz - res.z - (res.fz || 0)) < (res.r || 18) + 4) continue;
      trees.push([tx, tz, 2 + R() * 1.6]);
    }
  }
  const bm = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mat('#ffffff'), blds.length);
  blds.forEach(([w, h, d, x, z, c], i) => {
    o.position.set(x, h / 2 + 0.5, z); o.rotation.set(0, 0, 0); o.scale.set(w, h, d); o.updateMatrix();
    bm.setMatrixAt(i, o.matrix); bm.setColorAt(i, new THREE.Color(c));
  });
  scene.add(bm);
  fj.city = { blds, bm };
  const tm = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), mat(PAL.tree), trees.length);
  const trm = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.25, 0.3, 1, 5), mat(PAL.trunk), trees.length);
  trees.forEach(([x, z, s], i) => {
    o.scale.set(s, s * 1.1, s); o.position.set(x, 1.6 + s, z); o.updateMatrix(); tm.setMatrixAt(i, o.matrix);
    o.scale.set(1, 1.8, 1); o.position.set(x, 1.4, z); o.updateMatrix(); trm.setMatrixAt(i, o.matrix);
  });
  scene.add(tm, trm);

  // traffic
  const cars = [];
  const carBody = new THREE.BoxGeometry(2.2, 1.3, 4.4), carTop = new THREE.BoxGeometry(1.9, 0.9, 2.2);
  const white = mat('#f3f3f1'), dark = mat('#2b2f36'), glass = mat('#1d2128');
  const mkCar = () => {
    const c = new THREE.Group(), dk = R() < 0.35;
    const b = new THREE.Mesh(carBody, dk ? dark : white); b.position.y = 0.95; c.add(b);
    const tp = new THREE.Mesh(carTop, dk ? white : glass); tp.position.set(0, 2.0, -0.2); c.add(tp);
    scene.add(c); return c;
  };
  xs.forEach(x => [-1, 1].forEach(dir => { for (let k = 0; k < 7; k++) cars.push({ m: mkCar(), axis: 'z', fixed: x + dir * 3.3, dir, off: R() * (z1 - z0), sp: 9 + R() * 6, a: z0, len: z1 - z0 }); }));
  zs.forEach(z => [-1, 1].forEach(dir => { for (let k = 0; k < 7; k++) cars.push({ m: mkCar(), axis: 'x', fixed: z + dir * 3.3, dir, off: R() * (x1 - x0), sp: 9 + R() * 6, a: x0, len: x1 - x0 }); }));
  fj.updaters.push(t => cars.forEach(c => {
    const s = ((c.off + c.dir * c.sp * t) % c.len + c.len) % c.len + c.a;
    if (c.axis === 'z') { c.m.position.set(c.fixed, 0.2, s); c.m.rotation.y = c.dir > 0 ? 0 : Math.PI; }
    else { c.m.position.set(s, 0.2, c.fixed); c.m.rotation.y = c.dir > 0 ? Math.PI / 2 : -Math.PI / 2; }
  }));
  return { xs, zs, addBox };
}

// a "bank" building: navy body, gold band and roof sign
export function addBank(fj, x, z, h = 22, w = 18, d = 16) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(PAL.navy2)); body.position.y = h / 2 + 0.5; g.add(body);
  const band = new THREE.Mesh(new THREE.BoxGeometry(w + 0.6, 1.4, d + 0.6), mat(PAL.gold)); band.position.y = h * 0.62; g.add(band);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(w * 0.7, 1.2, d * 0.7), mat(PAL.gold)); roof.position.y = h + 1.1; g.add(roof);
  for (let i = -1; i <= 1; i++) {
    const col = new THREE.Mesh(new THREE.BoxGeometry(1.4, h * 0.45, 1.4), mat('#dfe3ea'));
    col.position.set(i * w * 0.3, h * 0.22 + 0.5, d / 2 + 0.8); g.add(col);
  }
  g.position.set(x, 0, z); fj.scene.add(g);
  return { g, top: new THREE.Vector3(x, h + 2, z), pos: new THREE.Vector3(x, 0, z), h };
}

// central switch tower with rotating gold ring
export function addHub(fj, x, z, h = 70) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(26, 8, 26), mat(PAL.navy2)); base.position.y = 4.5; g.add(base);
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(7, 9, h, 8), mat(PAL.navy)); tower.position.y = h / 2 + 8; g.add(tower);
  const cap = new THREE.Mesh(new THREE.OctahedronGeometry(6, 0), mat(PAL.gold)); cap.position.y = h + 12; g.add(cap);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(15, 0.9, 6, 40), new THREE.MeshBasicMaterial({ color: PAL.gold2 }));
  ring.position.y = h * 0.7; ring.rotation.x = Math.PI / 2; g.add(ring);
  const ring2 = ring.clone(); ring2.scale.setScalar(0.75); ring2.position.y = h * 0.45; g.add(ring2);
  g.position.set(x, 0, z); fj.scene.add(g);
  fj.updaters.push(t => { ring.rotation.z = t * 0.8; ring2.rotation.z = -t * 1.1; cap.rotation.y = t; });
  return { g, top: new THREE.Vector3(x, h * 0.7, z), pos: new THREE.Vector3(x, 0, z) };
}

// small shop / stall with striped awning
export function addStall(fj, x, z, rotY = 0) {
  const g = new THREE.Group();
  const counter = new THREE.Mesh(new THREE.BoxGeometry(7, 2.6, 3.2), mat('#a0714f')); counter.position.y = 1.8; g.add(counter);
  const back = new THREE.Mesh(new THREE.BoxGeometry(7, 6, 0.6), mat('#8a5e40')); back.position.set(0, 3.5, -1.6); g.add(back);
  for (let i = 0; i < 5; i++) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.35, 4.6), mat(i % 2 ? '#ffffff' : PAL.gold));
    s.position.set(-2.8 + i * 1.4, 6.6, 0.4); s.rotation.x = 0.28; g.add(s);
  }
  const kettle = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 1.1, 8), mat('#c9ccd1')); kettle.position.set(1.8, 3.6, 0); g.add(kettle);
  g.position.set(x, 0.5, z); g.rotation.y = rotY; fj.scene.add(g);
  return { g, pos: new THREE.Vector3(x, 0, z) };
}

export function addPerson(fj, x, z, color) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.95, 3.2, 7), mat(color)); body.position.y = 2.1; g.add(body);
  const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.75, 1), mat('#c99b7a')); head.position.y = 4.4; g.add(head);
  g.position.set(x, 0.5, z); fj.scene.add(g);
  return { g, pos: new THREE.Vector3(x, 0, z), head: new THREE.Vector3(x, 5.6, z) };
}

// glowing data packet flying on an arc from a to b between t0 and t1
let glowTex;
function glowTexture() {
  if (glowTex) return glowTex;
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d'), gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,236,170,0.9)'); gr.addColorStop(1, 'rgba(255,200,60,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
  return (glowTex = new THREE.CanvasTexture(c));
}
export function arc(fj, a, b, t0, t1, o = {}) {
  const { color = PAL.gold, height = null, keep = 0.8, tube = 0.45, size = 7 } = o;
  const mid = a.clone().lerp(b, 0.5); mid.y = Math.max(a.y, b.y) + (height ?? a.distanceTo(b) * 0.35);
  const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
  const geo = new THREE.TubeGeometry(curve, 64, tube, 6, false);
  const lineMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, fog: false });
  const line = new THREE.Mesh(geo, lineMat); line.visible = false; fj.scene.add(line);
  const total = geo.index.count;
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  spr.scale.setScalar(size); spr.visible = false; fj.scene.add(spr);
  const core = new THREE.Mesh(new THREE.SphereGeometry(size * 0.16, 10, 8), new THREE.MeshBasicMaterial({ color: '#fff7dc', fog: false }));
  core.visible = false; fj.scene.add(core);
  fj.updaters.push(t => {
    const p = prog(t, t0, t1), e = easeInOut(p);
    const fade = 1 - prog(t, t1 + keep, t1 + keep + 0.5);
    line.visible = t >= t0 && fade > 0;
    if (line.visible) { geo.setDrawRange(0, Math.floor(total * e / 3) * 3); lineMat.opacity = 0.85 * fade; }
    const fly = t >= t0 && t <= t1 + 0.15;
    spr.visible = core.visible = fly;
    if (fly) { const q = curve.getPoint(e); spr.position.copy(q); core.position.copy(q); spr.scale.setScalar(size * (1 + 0.15 * Math.sin(t * 20))); }
  });
  return { curve };
}

// ---------- camera path ----------
// keys: [{t, pos:[x,y,z], at:[x,y,z], fov?}] — smooth Catmull-Rom through positions, eased segments
export function cameraPath(fj, keys) {
  const P = new THREE.CatmullRomCurve3(keys.map(k => new THREE.Vector3(...k.pos)), false, 'centripetal');
  const T = new THREE.CatmullRomCurve3(keys.map(k => new THREE.Vector3(...k.at)), false, 'centripetal');
  const n = keys.length - 1;
  fj.camUpdate = t => {
    let i = keys.findIndex((k, j) => j < n && t < keys[j + 1].t);
    if (i < 0) i = t < keys[0].t ? 0 : n - 1;
    const k = easeInOut(prog(t, keys[i].t, keys[i + 1].t));
    const u = (i + k) / n;
    fj.camera.position.copy(P.getPoint(u));
    fj.camera.lookAt(T.getPoint(u));
    const f0 = keys[i].fov || 46, f1 = keys[i + 1].fov || 46;
    fj.camera.fov = lerp(f0, f1, k); fj.camera.updateProjectionMatrix();
  };
  fj.updaters.unshift(fj.camUpdate);
}

// ---------- 2D overlays ----------
function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
export { rr };
const F = (w, s) => `${w} ${s}px Inter, "Noto Color Emoji", sans-serif`;

// karaoke captions from timeline words
export function captions(fj, o = {}) {
  const { y = 1500, size = 46, maxWords = 4, maxChars = 26 } = o;
  const chunks = [];
  fj.tl.lines.forEach(L => {
    let cur = [];
    L.words.forEach((w, i) => {
      cur.push(w);
      const chars = cur.map(c => c.w).join(' ').length;
      const endPunct = /[.,!?…:]$/.test(w.w);
      if (cur.length >= maxWords || chars >= maxChars || (endPunct && cur.length >= 2) || i === L.words.length - 1) { chunks.push(cur); cur = []; }
    });
  });
  chunks.forEach((c, i) => { c.s = c[0].s - 0.05; c.e = i + 1 < chunks.length ? Math.min(chunks[i + 1][0].s - 0.05, c[c.length - 1].e + 0.9) : c[c.length - 1].e + 0.8; });
  fj.overlays.push(t => {
    const c = chunks.find(c => t >= c.s && t < c.e);
    if (!c) return;
    const ctx = fj.ctx; ctx.font = F(600, size);
    const sp = ctx.measureText(' ').width;
    const ws = c.map(w => ctx.measureText(w.w).width);
    const tw = ws.reduce((a, b) => a + b, 0) + sp * (c.length - 1);
    const pw = tw + 64, ph = size * 1.75, x = 540 - pw / 2;
    const a = Math.min(prog(t, c.s, c.s + 0.12), 1 - prog(t, c.e - 0.1, c.e));
    ctx.globalAlpha = a;
    rr(ctx, x, y - ph / 2, pw, ph, 16); ctx.fillStyle = 'rgba(31,35,43,0.94)'; ctx.fill();
    let cx = x + 32;
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    c.forEach((w, i) => {
      ctx.fillStyle = t >= w.s ? '#ffffff' : '#8b9099';
      ctx.fillText(w.w, cx, y + 2); cx += ws[i] + sp;
    });
  });
}

// callout: pill label + elbow leader line to a 3D anchor
export function callout(fj, anchor, text, t0, t1, o = {}) {
  const { dx = 0, dy = -260, dot = PAL.blue, size = 34, side = 'up' } = o;
  const v = anchor.isVector3 ? anchor : new THREE.Vector3(...anchor);
  fj.overlays.push(t => {
    if (t < t0 || t > t1 + 0.3) return;
    const p = fj.project(typeof o.follow === 'function' ? o.follow(t) : v);
    if (!p.vis) return;
    const ctx = fj.ctx;
    const a = (1 - prog(t, t1, t1 + 0.3));
    const ln = easeOut(prog(t, t0, t0 + 0.35)), lb = easeBack(prog(t, t0 + 0.2, t0 + 0.55));
    ctx.font = F(600, size);
    const halfW = (ctx.measureText(text).width + 44) / 2;
    const lx = clamp(p.x + dx, halfW + 24, W - halfW - 24), ly = clamp(p.y + dy, 200, 1220);
    ctx.globalAlpha = a;
    // leader: from label down to anchor y, then across to anchor
    ctx.strokeStyle = PAL.ink; ctx.lineWidth = 3;
    const seg1 = Math.abs(p.y - ly), seg2 = Math.abs(p.x - lx), L = seg1 + seg2, d = L * ln;
    ctx.beginPath(); ctx.moveTo(p.x, p.y);
    if (d <= seg2) ctx.lineTo(p.x + Math.sign(lx - p.x) * d, p.y);
    else { ctx.lineTo(lx, p.y); ctx.lineTo(lx, p.y + Math.sign(ly - p.y) * (d - seg2)); }
    ctx.stroke();
    // anchor dot
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(p.x, p.y, 15, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = dot; ctx.beginPath(); ctx.arc(p.x, p.y, 10.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = PAL.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p.x, p.y, 15, 0, Math.PI * 2); ctx.stroke();
    if (lb <= 0) return;
    ctx.font = F(600, size);
    const tw = ctx.measureText(text).width, pw = tw + 44, ph = size * 1.7;
    ctx.save(); ctx.translate(lx, ly); ctx.scale(lb, lb);
    rr(ctx, -pw / 2, -ph / 2, pw, ph, ph / 2); ctx.fillStyle = '#fbfaf7'; ctx.fill();
    ctx.strokeStyle = PAL.ink; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = PAL.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 2);
    ctx.restore();
  });
}

// HUD widget above captions: states [{t0,t1,value,unit,label,color}]
export function hud(fj, states, o = {}) {
  const { x = 60, y = 1290, w = 520, h = 96 } = o;
  fj.overlays.push(t => {
    const s = states.find(s => t >= s.t0 && t < s.t1);
    if (!s) return;
    const ctx = fj.ctx;
    const a = Math.min(prog(t, s.t0, s.t0 + 0.25), 1 - prog(t, s.t1 - 0.2, s.t1));
    ctx.globalAlpha = a;
    rr(ctx, x, y, w, h, 16); ctx.fillStyle = 'rgba(31,35,43,0.94)'; ctx.fill();
    ctx.fillStyle = s.color || PAL.gold; rr(ctx, x + 22, y + 22, 9, h - 44, 4); ctx.fill();
    const val = typeof s.value === 'function' ? s.value(t) : s.value;
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    ctx.font = F(700, 50); ctx.fillStyle = '#fff'; ctx.fillText(val, x + 52, y + h / 2 + 2);
    const vw = ctx.measureText(val).width;
    if (s.unit) { ctx.font = F(600, 30); ctx.fillStyle = '#d7dae0'; ctx.fillText(s.unit, x + 62 + vw, y + h / 2 + 6); }
    if (s.label) { ctx.font = F(500, 28); ctx.fillStyle = PAL.muted; ctx.textAlign = 'right'; ctx.fillText(s.label, x + w - 26, y + h / 2 + 2); }
  });
}

// brand badge (top-left); big during [t0,t1], small afterwards
export function brandBadge(fj, bigUntil, hideFrom = 1e9) {
  const em = fj.logo; // original colours on white card
  const sx = 250, sy = 75, sw = 755, sh = 755; // emblem crop in 1254px logo
  fj.overlays.push(t => {
    const k = easeInOut(prog(t, bigUntil, bigUntil + 0.8));
    const a = prog(t, 0.2, 0.6) * (1 - prog(t, hideFrom, hideFrom + 0.3));
    if (a <= 0) return;
    const size = lerp(190, 118, k), x = 56, y = lerp(230, 70, k);
    const ctx = fj.ctx; ctx.globalAlpha = a;
    ctx.shadowColor = 'rgba(0,0,0,0.18)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 6;
    rr(ctx, x, y, size, size, size * 0.22); ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.shadowColor = 'transparent'; ctx.strokeStyle = 'rgba(22,24,29,0.12)'; ctx.lineWidth = 2; ctx.stroke();
    const pad = size * 0.12;
    ctx.drawImage(em, sx, sy, sw, sh, x + pad, y + pad, size - 2 * pad, size - 2 * pad);
  });
}

// small monospace tag (top-right), e.g. "simplified"
export function tag(fj, text, t0 = 0, t1 = 1e9) {
  fj.overlays.push(t => {
    if (t < t0 || t > t1) return;
    const ctx = fj.ctx; ctx.font = '500 26px "JetBrains Mono", monospace';
    const w = ctx.measureText(text).width + 28;
    rr(ctx, 1020 - w, 86, w, 42, 8); ctx.fillStyle = 'rgba(251,250,247,0.85)'; ctx.fill();
    ctx.strokeStyle = 'rgba(22,24,29,0.35)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#5b6069'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText(text, 1006, 108);
  });
}

// ripple ring at a 3D point
export function ping(fj, anchor, t0, o = {}) {
  const { color = PAL.green, n = 3, dur = 1.4 } = o;
  fj.overlays.push(t => {
    if (t < t0 || t > t0 + dur + 0.5) return;
    const p = fj.project(anchor); if (!p.vis) return;
    const ctx = fj.ctx;
    for (let i = 0; i < n; i++) {
      const f = prog(t, t0 + i * 0.22, t0 + i * 0.22 + dur * 0.7);
      if (f <= 0 || f >= 1) continue;
      ctx.globalAlpha = 1 - f; ctx.strokeStyle = color; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(p.x, p.y, 20 + f * 120, 0, Math.PI * 2); ctx.stroke();
    }
  });
}

// generic text card (e.g. big stat) at screen position
export function bigText(fj, text, x, y, t0, t1, o = {}) {
  const { size = 96, color = PAL.ink, weight = 900, bg = null } = o;
  fj.overlays.push(t => {
    if (t < t0 || t > t1 + 0.3) return;
    const ctx = fj.ctx, s = easeBack(prog(t, t0, t0 + 0.45));
    ctx.globalAlpha = 1 - prog(t, t1, t1 + 0.3);
    const val = typeof text === 'function' ? text(t) : text;
    ctx.font = F(weight, size);
    ctx.translate(x, y); ctx.scale(s, s);
    if (bg) {
      const w = ctx.measureText(val).width + 70, h = size * 1.5;
      rr(ctx, -w / 2, -h / 2, w, h, 26); ctx.fillStyle = bg; ctx.fill();
    }
    ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(val, 0, 4);
  });
}

// end card: dims the world, shows full logo + follow CTA
export function endCard(fj, t0, o = {}) {
  const { cta = 'Follow karo 🔔', sub = 'Finance Made Simple', note = '' } = o;
  fj.overlays.push(t => {
    if (t < t0) return;
    const ctx = fj.ctx, a = prog(t, t0, t0 + 0.5);
    ctx.globalAlpha = a * 0.82; ctx.fillStyle = '#f6f3ee'; ctx.fillRect(0, 0, W, H);
    const p = easeBack(prog(t, t0 + 0.15, t0 + 0.75));
    ctx.globalAlpha = clamp(p);
    ctx.save(); ctx.translate(540, 760); ctx.scale(p, p);
    ctx.drawImage(fj.logo, -330, -330, 660, 660);
    ctx.restore();
    const q = easeBack(prog(t, t0 + 0.6, t0 + 1.1)) * (1 + 0.03 * Math.sin(t * 6));
    if (q > 0) {
      ctx.globalAlpha = clamp(q);
      ctx.save(); ctx.translate(540, 1210); ctx.scale(q, q);
      ctx.font = F(900, 76); const w = ctx.measureText(cta).width + 90;
      rr(ctx, -w / 2, -66, w, 132, 66); ctx.fillStyle = PAL.navy; ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(cta, 0, 4);
      ctx.restore();
    }
    ctx.globalAlpha = prog(t, t0 + 0.9, t0 + 1.3);
    ctx.font = F(600, 30); ctx.fillStyle = '#6b7079'; ctx.textAlign = 'center';
    if (note) note.split('\n').forEach((l, i) => ctx.fillText(l, 540, 1345 + i * 42));
  });
}

// big hook title visible from the very first frame (thumbnail / scroll-stopper)
export function hookTitle(fj, lines, t1, o = {}) {
  const { y = 470, size = 92 } = o;
  fj.overlays.push(t => {
    if (t > t1 + 0.3) return;
    const ctx = fj.ctx;
    ctx.globalAlpha = 1 - prog(t, t1, t1 + 0.3);
    lines.forEach((ln, i) => {
      const [text, color = PAL.ink, bg = 'rgba(251,250,247,0.95)'] = Array.isArray(ln) ? ln : [ln];
      ctx.font = F(900, size);
      const w = ctx.measureText(text).width + 60, h = size * 1.35, yy = y + i * (h + 16);
      const pulse = 1 + 0.02 * Math.sin(t * 5 + i);
      ctx.save(); ctx.translate(540, yy); ctx.scale(pulse, pulse);
      ctx.shadowColor = 'rgba(0,0,0,0.18)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
      rr(ctx, -w / 2, -h / 2, w, h, 22); ctx.fillStyle = bg; ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 4);
      ctx.restore();
    });
  });
}

export function progressBar(fj) {
  fj.overlays.push(t => {
    const ctx = fj.ctx;
    ctx.fillStyle = 'rgba(22,24,29,0.12)'; ctx.fillRect(0, 0, W, 8);
    ctx.fillStyle = PAL.gold; ctx.fillRect(0, 0, W * clamp(t / fj.tl.total), 8);
  });
}

// hide buildings the camera would fly through (samples the whole camera path)
export function clearCameraPath(fj, margin = 7) {
  if (!fj.city || !fj.camUpdate) return 0;
  const { blds, bm } = fj.city, hidden = new Set(), m = new THREE.Matrix4().makeScale(0, 0, 0);
  for (let t = 0; t <= fj.tl.total; t += 0.04) {
    fj.camUpdate(t);
    const c = fj.camera.position;
    blds.forEach(([w, h, d, x, z], i) => {
      if (Math.abs(c.x - x) < w / 2 + margin && Math.abs(c.z - z) < d / 2 + margin && c.y < h + 0.5 + margin) hidden.add(i);
    });
  }
  hidden.forEach(i => bm.setMatrixAt(i, m));
  bm.instanceMatrix.needsUpdate = true;
  return hidden.size;
}

export function ready(fj) {
  const n = clearCameraPath(fj);
  if (n) console.log('cleared buildings on camera path:', n);
  window.renderFrame = t => fj.render(t);
  fj.render(0);
  window.READY = true;
}
