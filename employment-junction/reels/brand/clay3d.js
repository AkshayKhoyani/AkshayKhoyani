// 3D clay backdrops for Employment Junction reels (Three.js, built in code – same idea as Finance Junction's clay bazaar).
// Pastel rounded "clay" models, soft studio light, slow camera dolly. One scene per job world.
// EJ_CLAY.make(key) -> { canvas, render(t) }   keys: classroom, police_station, railway, bank, govt_office,
//                                               exam_hall, home, street, hospital, army_camp
(function () {
  const W = 1080, H = 1920;
  function base(skyTop, skyBot, fogC, ground) {
    const glc = document.createElement('canvas'); glc.width = W; glc.height = H;
    const R = new THREE.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true });
    R.setPixelRatio(1); R.setSize(W, H, false); R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
    R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 0.78; R.outputColorSpace = THREE.SRGBColorSpace;
    const sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(62, W / H, 0.5, 1500);
    sc.environment = new THREE.PMREMGenerator(R).fromScene(new THREE.RoomEnvironment(), 0.04).texture;
    const sky = document.createElement('canvas'); sky.width = 16; sky.height = 512;
    { const x = sky.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 512); g.addColorStop(0, skyTop); g.addColorStop(1, skyBot); x.fillStyle = g; x.fillRect(0, 0, 16, 512); }
    sc.background = new THREE.CanvasTexture(sky); sc.background.colorSpace = THREE.SRGBColorSpace;
    sc.fog = new THREE.Fog(fogC, 150, 480);
    sc.add(new THREE.HemisphereLight('#fff7ee', '#c9b8a8', 1.0));
    const sun = new THREE.DirectionalLight('#fff1e6', 2.0); sun.position.set(60, 130, 90); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -140, right: 140, top: 140, bottom: -140, far: 520 }); sc.add(sun);
    const g = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200), mat(ground)); g.rotation.x = -Math.PI / 2; g.receiveShadow = true; sc.add(g);
    return { glc, R, sc, cam };
  }
  const mat = c => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.55, metalness: 0, clearcoat: 0.3, clearcoatRoughness: 0.25 });
  const glow = c => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.6, roughness: 0.4 });
  function H_(S) {
    const box = (w, h, d, m, x, y, z, r = 1.2) => { const o = new THREE.Mesh(new THREE.RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2.2, h / 2.2, d / 2.2)), typeof m === 'string' ? mat(m) : m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; S.sc.add(o); return o; };
    const cyl = (r, h, m, x, y, z, seg = 24) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), typeof m === 'string' ? mat(m) : m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; S.sc.add(o); return o; };
    const ball = (r, m, x, y, z) => { const o = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), typeof m === 'string' ? mat(m) : m); o.position.set(x, y, z); o.castShadow = true; S.sc.add(o); return o; };
    const tex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
    const sign = (text, w, h, x, y, z, bg = '#0b2a63', fg = '#fbbf24', ry = 0) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex(1024, Math.round(1024 * h / w), (c, cw, ch) => {
        c.fillStyle = bg; c.fillRect(0, 0, cw, ch); c.strokeStyle = fg; c.lineWidth = Math.max(8, ch * 0.06); c.strokeRect(6, 6, cw - 12, ch - 12);
        c.fillStyle = fg; c.textAlign = 'center'; c.textBaseline = 'middle'; let fs = ch * 0.5; c.font = `900 ${fs}px Inter, sans-serif`;
        while (c.measureText(text).width > cw * 0.9 && fs > 10) { fs -= 4; c.font = `900 ${fs}px Inter, sans-serif`; } c.fillText(text, cw / 2, ch / 2 + 4); }), color: '#eeeeee' }));
      m.position.set(x, y, z); m.rotation.y = ry; S.sc.add(m); return m; };
    const tree = (x, z, s = 1) => { cyl(1.2 * s, 10 * s, '#a16207', x, 5 * s, z); ball(6 * s, '#4ade80', x, 13 * s, z); ball(4.5 * s, '#86efac', x + 3 * s, 16 * s, z + 1); };
    const flag = (x, z, h = 40) => { cyl(0.5, h, '#e5e7eb', x, h / 2, z); [['#ff9933', 0], ['#ffffff', 1], ['#138808', 2]].forEach(([c, i]) => box(12, 2.6, 0.4, c, x + 6.4, h - 1.5 - i * 2.6, z, 0.2)); };
    const person_free = 0; void person_free;
    return { box, cyl, ball, tex, sign, tree, flag };
  }
  const CAMS = {}; // key -> (t, cam) motion
  const SCENES = {
    classroom(S, h) {
      const { box, sign, cyl, ball } = h; S.sc.background = new THREE.Color('#fde7d2'); S.sc.fog.color.set('#fde7d2');
      box(200, 70, 4, '#fff1dc', 0, 35, -60, 1); box(200, 70, 4, '#ffe2c2', -70, 35, 0, 1).rotation.y = Math.PI / 2;
      const board = box(80, 34, 2, '#1f4d3a', 0, 34, -57, 1);
      const chalk = new THREE.Mesh(new THREE.PlaneGeometry(74, 28), new THREE.MeshBasicMaterial({ map: h.tex(1024, 388, (c, w, hh) => { c.fillStyle = '#1f4d3a'; c.fillRect(0, 0, w, hh); c.strokeStyle = 'rgba(255,255,255,.85)'; c.fillStyle = 'rgba(255,255,255,.9)'; c.font = '700 64px Inter'; c.fillText('a² + b² = c²', 60, 110); c.fillText('Syllabus ✓', 60, 210); c.fillText('Mock Test ✓', 60, 310); c.beginPath(); c.arc(820, 190, 90, 0, 7); c.lineWidth = 6; c.stroke(); }) }));
      chalk.position.set(0, 34, -55.9); S.sc.add(chalk);
      box(26, 10, 12, '#b45309', 22, 5, -40, 1); // teacher desk
      for (let r = 0; r < 3; r++) for (let c = -1; c <= 1; c++) { box(16, 1.5, 9, '#d97706', c * 26, 8, -10 + r * 16, 0.6); [-6, 6].forEach(dx => box(1, 8, 8, '#92400e', c * 26 + dx, 4, -10 + r * 16, 0.4)); box(5, 1, 4, '#3b82f6', c * 26 + 3, 9, -10 + r * 16, 0.3); }
      box(14, 30, 6, '#7c3aed', -55, 15, -50, 1); for (let i = 0; i < 4; i++) box(12, 1, 5, '#fef3c7', -55, 5 + i * 7, -47, 0.3);
      cyl(4, 1, '#ffffff', 50, 52, -57.5).rotation.x = Math.PI / 2; ball(2, '#ef4444', 60, 12, -45);
      [-40, 40].forEach(x => box(18, 22, 1, '#bae6fd', x + 20 * Math.sign(x), 40, -57.5, 0.6));
      CAMS.classroom = (t, cam) => { cam.position.set(Math.sin(t * 0.2) * 6, 26, 78 - t * 0.6); cam.lookAt(0, 26, -50); };
    },
    exam_hall(S, h) {
      const { box, sign, cyl } = h; S.sc.background = new THREE.Color('#e0e7ff'); S.sc.fog.color.set('#e0e7ff');
      box(240, 70, 4, '#eef2ff', 0, 35, -80, 1); sign('EXAM HALL', 60, 14, 0, 58, -77.8, '#1e3a8a', '#fde68a');
      cyl(6, 1.2, '#ffffff', 52, 48, -77.5).rotation.x = Math.PI / 2;
      for (let r = 0; r < 6; r++) for (let c = -2; c <= 2; c++) { box(14, 1.4, 8, '#c7d2fe', c * 24, 8, -60 + r * 15, 0.5); box(10, 0.3, 6, '#ffffff', c * 24, 8.9, -60 + r * 15, 0.1); box(8, 9, 1.5, '#818cf8', c * 24, 5, -54 + r * 15, 0.5); }
      CAMS.exam_hall = (t, cam) => { cam.position.set(Math.sin(t * 0.15) * 10, 30, 80 - t * 0.5); cam.lookAt(0, 22, -60); };
    },
    police_station(S, h) {
      const { box, sign, cyl, tree, flag } = h;
      box(110, 46, 30, '#dbeafe', 0, 23, -70, 2); box(114, 5, 34, '#1e3a8a', 0, 48, -70, 1.5);
      sign('POLICE STATION', 80, 10, 0, 40, -54.6, '#1e3a8a', '#ffffff');
      box(20, 26, 2, '#1e40af', 0, 13, -54.8, 0.6); [-36, 36].forEach(x => box(16, 12, 1, '#93c5fd', x, 26, -54.8, 0.5));
      [-60, 60].forEach(x => { box(4, 1.5, 30, '#ef4444', x * 0.5, 4, -20, 0.5); box(4, 1.5, 30, '#ffffff', x * 0.5, 6, -20, 0.5); });
      // jeep
      box(30, 10, 16, '#f8fafc', -40, 9, -25, 3); box(18, 8, 14, '#1e3a8a', -44, 17, -25, 2.5); box(6, 2, 4, '#ef4444', -44, 22, -25, 0.8);
      [[-50, -18], [-30, -18], [-50, -32], [-30, -32]].forEach(([x, z]) => cyl(4, 3, '#111827', x, 4, z).rotation.x = Math.PI / 2);
      flag(55, -45); tree(-75, -40); tree(78, -20, 0.8);
      CAMS.police_station = (t, cam) => { cam.position.set(Math.sin(t * 0.22) * 12, 30, 95 - t * 0.7); cam.lookAt(0, 26, -55); };
    },
    railway(S, h) {
      const { box, sign, cyl } = h; S.sc.background = new THREE.Color('#dbeafe'); S.sc.fog.color.set('#dbeafe');
      box(70, 6, 400, '#fde68a', 30, 3, -120, 1);   // platform
      box(4, 0.8, 400, '#6b7280', -10, 0.6, -120, 0.2); box(4, 0.8, 400, '#6b7280', -26, 0.6, -120, 0.2);
      for (let i = 0; i < 4; i++) { const z = -20 - i * 70; box(26, 28, 66, '#2563eb', -18, 17, z, 4); box(27, 4, 66, '#facc15', -18, 12, z, 1);
        for (let k = 0; k < 5; k++) box(1, 8, 8, '#e0f2fe', -4.6, 22, z - 26 + k * 13, 0.6); }
      for (let i = 0; i < 6; i++) { cyl(1, 40, '#64748b', 52, 20, -10 - i * 50); }
      sign('PLATFORM 1', 36, 8, 30, 30, -30, '#facc15', '#111827');
      for (let i = 0; i < 3; i++) box(16, 4, 5, '#0f766e', 45, 8, -50 - i * 40, 1);
      CAMS.railway = (t, cam) => { cam.position.set(40 + Math.sin(t * 0.2) * 4, 26, 60 - t * 0.8); cam.lookAt(10, 20, -80); };
    },
    bank(S, h) {
      const { box, sign, cyl, ball } = h; S.sc.background = new THREE.Color('#ecfdf5'); S.sc.fog.color.set('#ecfdf5');
      box(220, 70, 4, '#f0fdf4', 0, 35, -70, 1); sign('₹ BANK', 50, 14, 0, 52, -67.8, '#065f46', '#fde68a');
      for (let c = -2; c <= 2; c++) { box(30, 16, 10, '#d1fae5', c * 34, 8, -45, 1.2); box(28, 14, 0.6, new THREE.MeshPhysicalMaterial({ color: '#a7f3d0', transmission: 0.6, roughness: 0.1, transparent: true, opacity: 0.5 }), c * 34, 23, -45, 0.2);
        sign(String(c + 3), 6, 5, c * 34, 33, -44, '#111827', '#22c55e'); }
      [-80, 80].forEach(x => { cyl(4, 8, '#b45309', x, 4, -30); ball(8, '#4ade80', x, 14, -30); });
      for (let i = 0; i < 4; i++) box(18, 6, 8, '#0d9488', -30 + i * 20, 3, 0, 1.5);
      CAMS.bank = (t, cam) => { cam.position.set(Math.sin(t * 0.2) * 10, 28, 85 - t * 0.6); cam.lookAt(0, 24, -50); };
    },
    govt_office(S, h) {
      const { box, sign, cyl, tree, flag } = h;
      box(150, 50, 40, '#fef3c7', 0, 25, -90, 2); box(160, 6, 46, '#f59e0b', 0, 53, -90, 2); box(60, 20, 30, '#fde68a', 0, 66, -90, 3);
      for (let i = -3; i <= 3; i++) cyl(2.6, 46, '#fffbeb', i * 18, 23, -68);
      for (let s = 0; s < 4; s++) box(110 - s * 8, 2, 8, '#e7e5e4', 0, 1 + s * 2, -60 - s * 3, 0.5);
      sign('SARKARI KARYALAY', 70, 9, 0, 40, -63, '#7c2d12', '#fde68a'); flag(0, -90, 82);
      tree(-90, -50); tree(95, -40, 0.9); tree(-60, -10, 0.7);
      CAMS.govt_office = (t, cam) => { cam.position.set(Math.sin(t * 0.18) * 14, 30, 110 - t * 0.8); cam.lookAt(0, 34, -80); };
    },
    home(S, h) {
      const { box, cyl, ball } = h; S.sc.background = new THREE.Color('#ffe4e6'); S.sc.fog.color.set('#ffe4e6');
      box(220, 70, 4, '#fff1f2', 0, 35, -60, 1); box(4, 70, 200, '#ffe4e6', -80, 35, 0, 1);
      box(56, 12, 18, '#14b8a6', -10, 6, -40, 3); box(56, 16, 5, '#0d9488', -10, 18, -48, 2.5); [-30, 10].forEach(x => box(6, 16, 18, '#0f766e', x, 8, -40, 2.5));
      [-24, -10, 4].forEach((x, i) => box(10, 9, 3, ['#fbbf24', '#f472b6', '#a78bfa'][i], x, 17, -44, 1.5));
      box(30, 4, 16, '#b45309', -10, 5, -15, 1); cyl(2.2, 3, '#ffffff', -14, 8.5, -15); cyl(2.2, 3, '#ffffff', -6, 8.5, -15);
      box(40, 24, 2, '#111827', 45, 30, -57, 1); box(36, 20, 0.5, glow('#38bdf8'), 45, 30, -55.8, 0.4);
      cyl(5, 10, '#c2410c', 70, 5, -40); ball(10, '#4ade80', 70, 18, -40);
      box(40, 30, 1, '#bae6fd', -40, 42, -57.5, 0.6); box(120, 0.4, 70, '#fecdd3', 0, 0.3, -15, 0.2);
      CAMS.home = (t, cam) => { cam.position.set(Math.sin(t * 0.2) * 8, 26, 75 - t * 0.5); cam.lookAt(0, 20, -40); };
    },
    street(S, h) {
      const { box, ball, sign, tree } = h; S.sc.background = new THREE.Color('#fff3e6');
      const cols = ['#fda4af', '#fcd34d', '#93c5fd', '#86efac', '#c4b5fd', '#fdba74']; let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647, (seed - 1) / 2147483646);
      box(36, 0.2, 600, '#efe3d3', 0, 0.05, -100, 0.05);
      for (let i = 0; i < 40; i++) { const side = i % 2 ? 1 : -1, x = side * (30 + rnd() * 70), z = 10 - rnd() * 260, hh = 10 + rnd() * 24, w = 12 + rnd() * 8; box(w, hh, w, cols[i % 6], x, hh / 2, z, 2.4); ball(w * 0.5, '#ffffff', x, hh, z); }
      box(46, 24, 16, '#fff7ed', 0, 12, -60, 2); sign('NAUKRI KENDRA', 40, 8, 0, 30, -51.5, '#0b2a63', '#fbbf24'); tree(-26, -40, 0.8); tree(28, -45, 0.8);
      CAMS.street = (t, cam) => { cam.position.set(Math.sin(t * 0.25) * 8, 24, 70 - t * 0.6); cam.lookAt(0, 16, -55); };
    },
    hospital(S, h) {
      const { box, sign, cyl, tree } = h; S.sc.background = new THREE.Color('#e0f2fe');
      box(120, 56, 34, '#f8fafc', 0, 28, -80, 2); box(126, 5, 38, '#0ea5e9', 0, 58, -80, 1.5);
      box(18, 6, 2, '#ef4444', 0, 48, -62.5, 0.6); box(6, 18, 2, '#ef4444', 0, 48, -62.4, 0.6); sign('HOSPITAL', 50, 9, 0, 36, -62.6, '#0369a1', '#ffffff');
      for (let i = -2; i <= 2; i++) if (i) box(14, 12, 1, '#bae6fd', i * 24, 22, -62.6, 0.5);
      box(34, 16, 16, '#ffffff', -40, 10, -30, 3); box(10, 3, 16.4, '#ef4444', -40, 10, -30, 0.5); [[-50, -22], [-30, -22], [-50, -38], [-30, -38]].forEach(([x, z]) => cyl(4, 3, '#111827', x, 4, z).rotation.x = Math.PI / 2);
      tree(70, -40); tree(-80, -55, 0.9);
      CAMS.hospital = (t, cam) => { cam.position.set(Math.sin(t * 0.2) * 12, 30, 95 - t * 0.7); cam.lookAt(0, 30, -60); };
    },
    army_camp(S, h) {
      const { box, cyl, flag, ball } = h; S.sc.background = new THREE.Color('#e7f0d8'); S.sc.fog.color.set('#e7f0d8');
      for (let i = 0; i < 4; i++) { const cone = new THREE.Mesh(new THREE.ConeGeometry(60 + i * 10, 90 + i * 20, 5), mat(['#a3b18a', '#8a9a6a', '#b5c99a', '#7f8f5a'][i])); cone.position.set(-160 + i * 110, 40, -260 - i * 20); S.sc.add(cone); }
      for (let i = 0; i < 4; i++) { const tent = new THREE.Mesh(new THREE.ConeGeometry(16, 18, 4), mat('#6b7a3a')); tent.position.set(-60 + i * 40, 9, -70 - (i % 2) * 20); tent.rotation.y = Math.PI / 4; tent.castShadow = true; S.sc.add(tent); }
      box(34, 12, 18, '#4d5d2a', 40, 10, -25, 3); box(16, 8, 16, '#3f4a2a', 34, 19, -25, 2); [[30, -17], [50, -17], [30, -33], [50, -33]].forEach(([x, z]) => cyl(4, 3, '#111827', x, 4, z).rotation.x = Math.PI / 2);
      flag(-30, -40, 50); for (let i = 0; i < 6; i++) box(6, 4, 6, '#a16207', -70 + i * 6, 2, -20, 0.8);
      CAMS.army_camp = (t, cam) => { cam.position.set(Math.sin(t * 0.18) * 12, 28, 90 - t * 0.6); cam.lookAt(0, 24, -70); };
    },
  };
  const PAL = { classroom: ['#fde7d2', '#fff7ed', '#f6d7bd'], exam_hall: ['#e0e7ff', '#eef2ff', '#c7d2fe'], police_station: ['#bfdbfe', '#eff6ff', '#d6c9b5'],
    railway: ['#bfdbfe', '#eff6ff', '#cbd5e1'], bank: ['#d1fae5', '#ecfdf5', '#bbf7d0'], govt_office: ['#fde68a', '#fff7ed', '#e7d9bf'],
    home: ['#ffe4e6', '#fff1f2', '#fbcfe8'], street: ['#ffc9d9', '#fff3e6', '#f7d6c4'], hospital: ['#bae6fd', '#f0f9ff', '#dbeafe'], army_camp: ['#d9e6c3', '#f1f5e8', '#c2b48a'] };
  window.EJ_CLAY = {
    keys: Object.keys(SCENES),
    make(key) {
      const p = PAL[key] || PAL.street; const S = base(p[0], p[1], p[1], p[2]); const h = H_(S);
      (SCENES[key] || SCENES.street)(S, h);
      const camf = CAMS[key] || ((t, cam) => { cam.position.set(0, 26, 80); cam.lookAt(0, 20, -50); });
      return { canvas: S.glc, render(t) { camf(t, S.cam); S.R.render(S.sc, S.cam); } };
    },
  };
})();
