// 6 alternative 3D "views" for the gold story (same moment: Pinky shocked, Dadi calm, gold fell 30%).
// Open index.html?v=1..6 ; screenshot via shoot.js
import * as FJ from '/engine/fj3d.js';
const { THREE, PAL } = FJ;
const W = 1080, H = 1920;
const v = +(new URLSearchParams(location.search).get('v') || 1);
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

const gl = document.createElement('canvas'); gl.width = W; gl.height = H;
const renderer = new THREE.WebGLRenderer({ canvas: gl, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(46, W / H, 0.5, 3000);
const out = document.getElementById('c'); const ctx = out.getContext('2d');

const flat = c => new THREE.MeshLambertMaterial({ color: c, flatShading: true });
const clay = c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.95, metalness: 0 });
const metal = (c, e = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.35, metalness: 0.6, emissive: c, emissiveIntensity: e });
let MAT = flat;
function add(geo, mat, x = 0, y = 0, z = 0, parent = scene) {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
}
function gradientBg(top, bottom) {
  const c = document.createElement('canvas'); c.width = 4; c.height = 512; const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, top); gr.addColorStop(1, bottom); g.fillStyle = gr; g.fillRect(0, 0, 4, 512);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function textTex(lines, o = {}) {
  const { w = 1024, h = 256, bg = PAL.navy, border = PAL.gold } = o;
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
  if (bg) { x.fillStyle = bg; x.fillRect(0, 0, w, h); }
  if (border) { x.strokeStyle = border; x.lineWidth = 14; x.strokeRect(7, 7, w - 14, h - 14); }
  x.textAlign = 'center'; x.textBaseline = 'middle';
  lines.forEach(([t, s, col, y]) => { x.font = `900 ${s}px Inter, "Noto Color Emoji", sans-serif`; x.fillStyle = col; x.fillText(t, w / 2, y); });
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; return tex;
}
function plane(tex, w, h, x, y, z, rotY = 0, emissive = false) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, transparent: true }));
  m.position.set(x, y, z); m.rotation.y = rotY; scene.add(m); return m;
}

// cartoon person; chibi = big head; pose: 'shock' | 'calm' | 'phone' | 'sit'
function person(x, z, o) {
  const { shirt, pants = '#2f3a56', hair = '#2a1d16', skin = '#d9a77f', dadi = false, s = 1.7, chibi = 1, pose = 'calm', rotY = 0, y = 0.5 } = o;
  const g = new THREE.Group();
  const seg = MAT === flat ? 1 : 3;
  if (pose !== 'sit') [-1, 1].forEach(k => add(new THREE.BoxGeometry(0.55, 1.6, 0.6), MAT(pants), k * 0.35, 0.8, 0, g));
  else [-1, 1].forEach(k => { add(new THREE.BoxGeometry(0.55, 0.6, 1.6), MAT(pants), k * 0.35, 1.3, 0.6, g); add(new THREE.BoxGeometry(0.55, 1.2, 0.6), MAT(pants), k * 0.35, 0.6, 1.3, g); });
  const by = pose === 'sit' ? 1.0 : 0;
  if (dadi) add(new THREE.CylinderGeometry(0.7, 1.3, 2.8, MAT === flat ? 8 : 24), MAT(shirt), 0, 1.7 + by * 0.3, 0, g);
  else add(new THREE.CylinderGeometry(0.75, 0.95, 2.2, MAT === flat ? 8 : 24), MAT(shirt), 0, 2.6 + by * 0.0, 0, g);
  const armRot = { shock: [-2.7, 2.7], calm: [-0.15, 0.15], phone: [-0.15, 1.9], sit: [-0.4, 0.4], point: [-1.3, 0.15] }[pose];
  [-1, 1].forEach((k, i) => {
    const p = new THREE.Group(); p.position.set(k * 0.95, 3.4, 0); g.add(p);
    add(new THREE.BoxGeometry(0.42, 1.8, 0.45), MAT(shirt), 0, -0.85, 0, p);
    add(new THREE.IcosahedronGeometry(0.28, seg), MAT(skin), 0, -1.85, 0, p);
    p.rotation.z = armRot[i];
    if (pose === 'phone' && i === 1) { p.rotation.x = -0.9; const ph = add(new THREE.BoxGeometry(0.5, 0.9, 0.1), MAT('#1f232b'), 0, -2.1, 0.2, p); ph.rotation.x = 0.4; }
  });
  const head = new THREE.Group(); head.position.y = 4.4 + 0.4 * (chibi - 1); head.scale.setScalar(chibi); g.add(head);
  add(new THREE.IcosahedronGeometry(0.95, seg), MAT(skin), 0, 0, 0, head);
  const cap = add(new THREE.SphereGeometry(1.0, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), MAT(hair), 0, 0.08, -0.08, head); cap.rotation.x = -0.25;
  if (dadi) {
    add(new THREE.IcosahedronGeometry(0.45, seg), MAT(hair), 0, 0.35, -0.95, head);
    [-1, 1].forEach(k => add(new THREE.TorusGeometry(0.24, 0.05, 8, 16), MAT('#1f232b'), k * 0.34, 0.05, 0.88, head));
    add(new THREE.SphereGeometry(0.08, 8, 6), MAT('#c0262d'), 0, 0.42, 0.9, head);
  } else { const t = add(new THREE.ConeGeometry(0.32, 1.3, 8), MAT(hair), 0, -0.2, -1.05, head); t.rotation.x = 0.5; }
  [-1, 1].forEach(k => add(new THREE.SphereGeometry(0.12, 8, 6), MAT('#16181d'), k * 0.34, 0.05, 0.9, head));
  if (pose === 'shock') add(new THREE.SphereGeometry(0.2, 10, 8), MAT('#7a2e2e'), 0, -0.4, 0.86, head);
  else { const m = add(new THREE.TorusGeometry(0.2, 0.05, 6, 12, Math.PI), MAT('#7a2e2e'), 0, -0.35, 0.88, head); m.rotation.z = Math.PI; }
  if (chibi > 1) [-1, 1].forEach(k => add(new THREE.SphereGeometry(0.16, 8, 6), MAT('#f4a3a3'), k * 0.55, -0.25, 0.75, head));
  g.scale.setScalar(s); g.position.set(x, y, z); g.rotation.y = rotY; scene.add(g);
  return { g, head: V3(x, y + (4.4 + chibi) * s, z) };
}
const pinkyO = { shirt: '#e2558f', pose: 'shock' };
const dadiO = { shirt: '#8e2340', hair: '#eeeeee', skin: '#c99671', dadi: true, pose: 'calm' };

function goldStack(x, z, levels, mat, y0 = 0.5) {
  const g = new THREE.Group();
  for (let r = 0; r < levels; r++) for (let i = 0; i < levels - r; i++) add(new THREE.BoxGeometry(2.0, 1.2, 3.4), mat, (i - (levels - r - 1) / 2) * 2.2, 0.6 + r * 1.25, 0, g);
  g.position.set(x, y0, z); scene.add(g); return g;
}
function arrowDown(x, y, z, mat, s = 1) {
  const g = new THREE.Group();
  add(new THREE.BoxGeometry(1.6, 6, 1.6), mat, 0, 3, 0, g);
  const h = add(new THREE.ConeGeometry(2.4, 3, MAT === flat ? 4 : 24), mat, 0, 0, 0, g); h.rotation.x = Math.PI;
  g.position.set(x, y, z); g.scale.setScalar(s); scene.add(g); return g;
}

let NAME = '', DARK = false;
// ───────────────────────── VIEWS ─────────────────────────
if (v === 1) { // current: daytime low-poly city
  NAME = 'Abhi wala: din ka 3D sheher';
  scene.background = new THREE.Color(PAL.sky); scene.fog = new THREE.Fog(PAL.sky, 220, 720);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb9b1a2, 1.6)); const sun = new THREE.DirectionalLight(0xffffff, 1.6); sun.position.set(120, 260, 90); scene.add(sun);
  FJ.buildCity({ scene, updaters: [] }, { seed: 41, reserved: [{ x: 0, z: 5, r: 40, empty: true }] });
  const h = 19.5; add(new THREE.BoxGeometry(8, h, 8), flat(PAL.navy2), 0, 0.5 + h / 2, -6);
  plane(textTex([['SONA', 140, '#f4cf6a', 128]], { w: 512, h: 256 }), 6.4, 3.2, 0, h - 2.5, -1.95);
  goldStack(0, -6, 3, flat(PAL.gold2), h + 0.5);
  arrowDown(9, 12, -6, flat(PAL.red));
  person(-6, 13, { ...pinkyO, rotY: 0.25 }); person(8, 12, { ...dadiO, rotY: -0.3 });
  camera.position.set(6, 17, 64); camera.lookAt(0, 11, -2);
}
if (v === 2) { // night neon city
  NAME = 'Raat ka neon sheher';
  DARK = true;
  Object.assign(PAL, { sky: '#0b1226', ground: '#121a30', block: '#18213b', road: '#0d1324', lane: '#2b3a66', edge: '#d4a62c', bld: ['#1c2745', '#222e52', '#18223f', '#26335a', '#1f2a4a', '#2a385f'], tree: '#1f3b3a', trunk: '#3a3027' });
  scene.background = gradientBg('#050914', '#1b2550'); scene.fog = new THREE.Fog('#121a35', 120, 520);
  scene.add(new THREE.HemisphereLight(0x6b7cff, 0x101425, 0.9));
  const moon = new THREE.DirectionalLight(0x9fb2ff, 0.5); moon.position.set(-80, 200, 60); scene.add(moon);
  FJ.buildCity({ scene, updaters: [] }, { seed: 41, reserved: [{ x: 0, z: 5, r: 40, empty: true }] });
  // lit windows: random glowing strips on far buildings
  const winMat = new THREE.MeshBasicMaterial({ color: '#ffd36b' });
  for (let i = 0; i < 260; i++) { const x = (Math.random() - 0.5) * 360, z = -40 - Math.random() * 300, y = 4 + Math.random() * 50; if (Math.abs(x) < 25) continue; const m = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.0), winMat); m.position.set(x, y, z); scene.add(m); }
  const h = 19.5; add(new THREE.BoxGeometry(8, h, 8), new THREE.MeshStandardMaterial({ color: '#16325c', roughness: 0.6 }), 0, 0.5 + h / 2, -6);
  [-4.1, 4.1].forEach(x => { const s = new THREE.Mesh(new THREE.BoxGeometry(0.3, h, 0.3), new THREE.MeshBasicMaterial({ color: '#ffcf4a' })); s.position.set(x, 0.5 + h / 2, -1.9); scene.add(s); });
  plane(textTex([['SONA', 140, '#ffd36b', 128]], { w: 512, h: 256, bg: '#0b1226', border: '#ffcf4a' }), 6.4, 3.2, 0, h - 2.5, -1.95);
  goldStack(0, -6, 3, metal('#e8b830', 0.55), h + 0.5);
  const gl1 = new THREE.PointLight(0xffc44a, 900, 60); gl1.position.set(0, h + 6, 0); scene.add(gl1);
  arrowDown(9, 12, -6, new THREE.MeshBasicMaterial({ color: '#ff3b5c' }));
  const rl = new THREE.PointLight(0xff3b5c, 400, 30); rl.position.set(9, 12, -2); scene.add(rl);
  const kl = new THREE.PointLight(0xffe2b0, 700, 40); kl.position.set(0, 14, 24); scene.add(kl);
  MAT = c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.7, flatShading: true });
  person(-6, 13, { ...pinkyO, rotY: 0.25 }); person(8, 12, { ...dadiO, rotY: -0.3 });
  plane(textTex([['💍 SONA SHOP', 110, '#ff6fb1', 128]], { bg: '#0b1226', border: '#ff6fb1' }), 11, 2.75, -15, 14, 10, 0.35);
  camera.position.set(6, 17, 64); camera.lookAt(0, 11, -2);
}
if (v === 3) { // clay pastel floating island (diorama)
  NAME = 'Clay / pastel toy island';
  MAT = clay;
  scene.background = gradientBg('#ffe3d3', '#cfe8ff');
  scene.add(new THREE.HemisphereLight(0xfff4ea, 0xc8d7ff, 1.4));
  const sun = new THREE.DirectionalLight(0xffffff, 2.2); sun.position.set(30, 60, 40); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40 }); scene.add(sun);
  add(new THREE.CylinderGeometry(30, 26, 6, 64), clay('#c99f7b'), 0, -3, 0);
  add(new THREE.CylinderGeometry(30.2, 30.2, 1, 64), clay('#a8e0c2'), 0, 0.2, 0);
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + 0.3; const r = 24 + (i % 2) * 2; const x = Math.cos(a) * r, z = Math.sin(a) * r; if (z > 10) continue; add(new THREE.CylinderGeometry(0.4, 0.5, 2, 12), clay('#b0896a'), x, 1.7, z); add(new THREE.SphereGeometry(2.2, 24, 16), clay(['#8fd4a8', '#ffc6d9', '#b5e6c8'][i % 3]), x, 4.4, z); }
  // coin tower (stack of gold coins) that has dropped
  const coins = new THREE.Group(); for (let i = 0; i < 9; i++) add(new THREE.CylinderGeometry(4, 4, 1.1, 48), metal('#f2c14e', 0.12), Math.sin(i) * 0.3, 0.6 + i * 1.15, 0, coins);
  coins.position.set(0, 0.7, -10); scene.add(coins);
  const ghost = add(new THREE.CylinderGeometry(4, 4, 5.5, 48), new THREE.MeshStandardMaterial({ color: '#f2c14e', transparent: true, opacity: 0.28 }), 0, 13.8, -10);
  ghost.castShadow = false;
  plane(textTex([['−30%', 150, '#e04646', 128]], { w: 512, h: 256, bg: '#ffffff', border: '#e04646' }), 7, 3.5, 9, 15, -8, -0.2);
  arrowDown(9, 6, -8, clay('#ff6b6b'), 0.8);
  // cute shop
  add(new THREE.BoxGeometry(8, 5, 5), clay('#ffd6a5'), -15, 3.2, -2); for (let i = 0; i < 6; i++) add(new THREE.BoxGeometry(1.35, 0.4, 3), clay(i % 2 ? '#ffffff' : '#ff8fab'), -18.4 + i * 1.36, 6.2, 1.2);
  plane(textTex([['SONA SHOP', 110, '#8e2340', 128]], { bg: '#fff3e0', border: '#ff8fab' }), 8, 2, -15, 7.6, 0.6);
  person(-5, 8, { ...pinkyO, chibi: 1.45, s: 1.5, rotY: 0.3 }); person(7, 7, { ...dadiO, chibi: 1.45, s: 1.5, rotY: -0.35 });
  camera.position.set(0, 26, 52); camera.lookAt(0, 6, -2); camera.fov = 44; camera.updateProjectionMatrix();
}
if (v === 4) { // indoor living room, TV shows the gold crash
  NAME = 'Ghar ka drawing room (TV par news)';
  MAT = clay;
  scene.background = new THREE.Color('#2a2320');
  scene.add(new THREE.HemisphereLight(0xffe8d0, 0x5a4636, 0.9));
  const lamp = new THREE.PointLight(0xffc98a, 900, 80); lamp.position.set(-12, 16, 6); lamp.castShadow = true; scene.add(lamp);
  const key = new THREE.DirectionalLight(0xfff1e0, 1.3); key.position.set(20, 30, 30); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30 }); scene.add(key);
  add(new THREE.BoxGeometry(60, 1, 50), clay('#c08a5b'), 0, -0.5, 0);
  for (let i = -6; i <= 6; i++) add(new THREE.BoxGeometry(0.15, 0.05, 50), clay('#a87449'), i * 4.6, 0.03, 0);
  add(new THREE.BoxGeometry(60, 30, 1), clay('#f3e3c7'), 0, 15, -20);
  add(new THREE.BoxGeometry(1, 30, 50), clay('#ead6b5'), -26, 15, 0);
  add(new THREE.BoxGeometry(16, 10, 0.3), clay('#9fd0f0'), -12, 19, -19.4); add(new THREE.BoxGeometry(17, 0.6, 0.6), clay('#ffffff'), -12, 14, -19.2);
  add(new THREE.BoxGeometry(22, 0.4, 14), clay('#8e2340'), 4, 0.25, 2); // rug
  // TV
  add(new THREE.BoxGeometry(16, 3, 4), clay('#5b4636'), 8, 1.5, -17);
  add(new THREE.BoxGeometry(17, 10, 0.8), clay('#1b1d22'), 8, 9, -17.5);
  const tv = (() => { const c = document.createElement('canvas'); c.width = 1024; c.height = 600; const x = c.getContext('2d');
    x.fillStyle = '#0b1226'; x.fillRect(0, 0, 1024, 600); x.fillStyle = '#e04646'; x.fillRect(0, 0, 1024, 90);
    x.font = '900 60px Inter'; x.fillStyle = '#fff'; x.fillText('BREAKING · GOLD 30% GIRA', 30, 66);
    x.strokeStyle = '#ffcf4a'; x.lineWidth = 12; x.beginPath(); [[60, 170], [250, 150], [400, 210], [560, 300], [700, 380], [850, 470], [960, 440]].forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.stroke();
    x.font = '900 84px Inter'; x.fillStyle = '#ffcf4a'; x.fillText('₹1.8L → ₹1.25L', 60, 560);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  plane(tv, 15.6, 9.1, 8, 9, -17.05);
  // sofa + Dadi sitting
  add(new THREE.BoxGeometry(6, 3, 14), clay('#5f7a8f'), -16, 2, -1); add(new THREE.BoxGeometry(2, 6, 14), clay('#56708a'), -19, 4.5, -1); [-8, 6].forEach(z => add(new THREE.BoxGeometry(6, 4.5, 2), clay('#56708a'), -16, 2.7, z));
  person(-16, -1, { ...dadiO, pose: 'sit', y: 1.6, s: 1.5, rotY: 1.1 });
  person(3, 5, { ...pinkyO, pose: 'shock', s: 1.6, rotY: -0.3 });
  add(new THREE.CylinderGeometry(0.3, 0.3, 14, 12), clay('#3b3b3b'), -20, 7, 9); add(new THREE.ConeGeometry(3, 3.5, 24, 1, true), clay('#fff1c9'), -20, 15, 9);
  camera.position.set(0, 17, 46); camera.lookAt(-5, 7, -6); camera.fov = 60; camera.updateProjectionMatrix();
}
if (v === 5) { // studio close-up with big characters + giant coin
  NAME = 'Studio close-up (bade characters)';
  MAT = clay;
  scene.background = gradientBg('#0b2545', '#3b1d5e');
  scene.add(new THREE.HemisphereLight(0xdfe7ff, 0x2a1b40, 1.1));
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(10, 20, 30); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20 }); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffc44a, 1.6); rim.position.set(-20, 10, -20); scene.add(rim);
  add(new THREE.CylinderGeometry(16, 17, 1.6, 64), clay('#1b2b55'), 0, -0.8, 2); add(new THREE.TorusGeometry(16.5, 0.25, 8, 96), new THREE.MeshBasicMaterial({ color: '#f4cf6a' }), 0, 0, 2).rotation.x = Math.PI / 2;
  const coin = new THREE.Group(); add(new THREE.CylinderGeometry(7, 7, 1.2, 64), metal('#f2c14e', 0.25), 0, 0, 0, coin); coin.rotation.x = Math.PI / 2; coin.rotation.z = 0.35;
  coin.position.set(-1.5, 15, -10); scene.add(coin);
  plane(textTex([['₹', 210, '#a87711', 140]], { w: 256, h: 256, bg: null, border: null }), 7, 7, -1.2, 15, -9.2);
  const pts = [[7.5, 23], [9.5, 22], [11, 19], [12.5, 17.5], [14, 14]].map(([x, y]) => V3(x, y, -6));
  add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 64, 0.45, 8), new THREE.MeshBasicMaterial({ color: '#ff4d6d' }));
  arrowDown(14, 12.5, -6, new THREE.MeshBasicMaterial({ color: '#ff4d6d' }), 0.5);
  person(-4.2, 4, { ...pinkyO, chibi: 1.3, s: 1.55, rotY: 0.25 }); person(4.6, 3, { ...dadiO, chibi: 1.3, s: 1.55, rotY: -0.25 });
  camera.position.set(0, 7.5, 27); camera.lookAt(0, 9.5, 0); camera.fov = 48; camera.updateProjectionMatrix();
  DARK = true;
}
if (v === 6) { // jewellery bazaar at golden hour
  NAME = 'Sone ka bazaar (shaam, golden hour)';
  scene.background = gradientBg('#f7a35c', '#ffe2b8'); scene.fog = new THREE.Fog('#f6c08a', 60, 200);
  scene.add(new THREE.HemisphereLight(0xffd7a8, 0x6a4a3a, 1.2));
  const sun = new THREE.DirectionalLight(0xffb36b, 2.4); sun.position.set(-60, 30, -30); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -60, right: 60, top: 60, bottom: -60, far: 300 }); scene.add(sun);
  add(new THREE.BoxGeometry(80, 0.4, 240), flat('#c9b49a'), 0, 0, -60);
  for (let i = 0; i < 20; i++) add(new THREE.BoxGeometry(0.2, 0.05, 2.4), flat('#b29c80'), (i % 2 ? 1 : -1) * 3, 0.25, 20 - i * 9);
  const cols = ['#e8c25a', '#e2558f', '#2f6fdb', '#22a565', '#d4a62c', '#8e2340'];
  [-1, 1].forEach(side => { for (let i = 0; i < 9; i++) {
    const z = 14 - i * 16, x = side * 16, hh = 10 + (i % 3) * 3;
    add(new THREE.BoxGeometry(12, hh, 12), flat(['#f1dcc0', '#e9cfae', '#f6e5cf'][i % 3]), x + side * 2, hh / 2, z);
    for (let k = 0; k < 6; k++) { const s = add(new THREE.BoxGeometry(2, 0.3, 4), flat(k % 2 ? '#ffffff' : cols[i % cols.length]), x - side * 4.5, 6.2, z - 5 + k * 2); s.rotation.z = side * 0.35; }
    add(new THREE.BoxGeometry(1, 3, 10), flat('#a0714f'), x - side * 4.5, 1.6, z);
    if (i < 5) plane(textTex([[i === 0 ? 'SONA-CHANDI 💍' : ['JEWELLERS', 'GOLD HOUSE', 'ALANKAR', 'KUNDAN'][i - 1], 100, '#ffffff', 128]], { bg: cols[(i + 3) % cols.length], border: '#ffffff' }), 9, 2.25, x - side * 6.05, 9, z, side * -Math.PI / 2);
  } });
  // string lights
  const bulb = new THREE.MeshBasicMaterial({ color: '#fff2b0' });
  for (let i = 0; i < 6; i++) { const z = 8 - i * 20; for (let k = 0; k <= 16; k++) { const x = -10 + k * 1.25; const y = 13 - Math.sin(k / 16 * Math.PI) * 2.5; const b = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), bulb); b.position.set(x, y, z); scene.add(b); } }
  // rate board at the first shop
  plane(textTex([['AAJ KA BHAV · 24K', 64, '#ffffff', 70], ['₹1,26,570', 120, '#ffcf4a', 170], ['−30% Jan se 📉', 58, '#ff8a8a', 245]], { w: 700, h: 300, bg: '#1b1d22', border: '#ffcf4a' }), 8.5, 3.65, -10.6, 4.8, 9, Math.PI / 2 * 0.6);
  person(-6, 12, { ...pinkyO, rotY: 0.6 }); person(3.5, 9, { ...dadiO, rotY: -0.2 });
  camera.position.set(7, 10, 46); camera.lookAt(-3, 6, 0); camera.fov = 50; camera.updateProjectionMatrix();
}

// ───────────────────────── render + overlay ─────────────────────────
await Promise.all(['900', '800', '600'].map(w => document.fonts.load(`${w} 40px Inter`)));
await document.fonts.load('40px "Noto Color Emoji"', '📉😱');
renderer.render(scene, camera);
ctx.drawImage(gl, 0, 0);
const F = (w, s) => `${w} ${s}px Inter, "Noto Color Emoji", sans-serif`;
function pill(text, y, size, bg, fg) {
  ctx.font = F(900, size); const w = ctx.measureText(text).width + 64, h = size * 1.4;
  ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(540 - w / 2, y - h / 2, w, h, 22); ctx.fill();
  ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 540, y + 3);
}
pill('SONA 30% GIRA 📉', 300, 80, 'rgba(251,250,247,0.95)', '#16181d');
pill('30% GAYA?! 😱', 1480, 50, 'rgba(31,35,43,0.94)', '#ffffff');
ctx.fillStyle = 'rgba(0,0,0,0.78)'; ctx.beginPath(); ctx.roundRect(40, 1790, 1000, 90, 20); ctx.fill();
ctx.font = F(900, 38); ctx.fillStyle = '#f4cf6a'; ctx.textAlign = 'left'; ctx.fillText(`VIEW ${v}`, 76, 1836);
ctx.font = F(800, 36); ctx.fillStyle = '#fff'; ctx.textAlign = 'right'; ctx.fillText(NAME, 1010, 1836);
window.READY = true;
