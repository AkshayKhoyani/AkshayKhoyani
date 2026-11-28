// Employment Junction reel themes. A theme = colour palette (overrides EJ.C) + a background painter.
// Pick one per reel with "theme" in script.json (or THEME=<key> env). Professional: calm, slow motion only.
(function () {
  const W = 1080, H = 1920;
  const hash = n => { const r = Math.sin(n * 12.9898) * 43758.5453; return r - Math.floor(r); };
  const lin = (ctx, stops, x0 = 0, y0 = 0, x1 = 0, y1 = H) => { const g = ctx.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; };
  const glow = (ctx, x, y, r, col) => { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
  const DARK = { text: '#f8fafc', muted: '#a9b8d0', card: 'rgba(255,255,255,0.08)', stroke: 'rgba(255,255,255,0.16)' };
  const LIGHT = { text: '#0f172a', muted: '#475569', card: 'rgba(255,255,255,0.88)', stroke: 'rgba(15,23,42,0.10)' };

  window.EJ_THEMES = {
    navy_gold: { name: 'Navy Prestige', dark: true, pal: { ...DARK, gold: '#f5b301', sky: '#7dd3fc' }, bg(ctx, t) {
      ctx.fillStyle = lin(ctx, [[0, '#0b2a63'], [0.6, '#071a3d'], [1, '#030b1c']]); ctx.fillRect(0, 0, W, H);
      glow(ctx, 860 + Math.sin(t * 0.2) * 40, 420, 640, 'rgba(245,179,1,0.16)');
      ctx.strokeStyle = 'rgba(245,179,1,0.10)'; ctx.lineWidth = 2;
      for (let i = -6; i < 14; i++) { ctx.beginPath(); ctx.moveTo(i * 140 + (t * 6) % 140, 0); ctx.lineTo(i * 140 + 700 + (t * 6) % 140, H); ctx.stroke(); }
    } },
    tiranga: { name: 'Tiranga Pride', dark: true, pal: { ...DARK, gold: '#ff9933', sky: '#4ade80' }, bg(ctx, t) {
      ctx.fillStyle = lin(ctx, [[0, '#0b1d44'], [1, '#050d22']]); ctx.fillRect(0, 0, W, H);
      const wave = (y, col, a) => { ctx.fillStyle = col; ctx.globalAlpha = a; ctx.beginPath(); ctx.moveTo(0, y);
        for (let x = 0; x <= W; x += 20) ctx.lineTo(x, y + Math.sin(x / 180 + t * 0.6) * 40); ctx.lineTo(W, y + 220); ctx.lineTo(0, y + 220); ctx.fill(); ctx.globalAlpha = 1; };
      wave(-120, '#ff9933', 0.55); wave(1820, '#138808', 0.6);
      glow(ctx, 540, 960, 700, 'rgba(255,255,255,0.10)');
      ctx.strokeStyle = 'rgba(96,165,250,0.12)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(540, 960, 380, 0, Math.PI * 2); ctx.stroke();
      for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2 + t * 0.05; ctx.beginPath(); ctx.moveTo(540, 960); ctx.lineTo(540 + Math.cos(a) * 380, 960 + Math.sin(a) * 380); ctx.stroke(); }
    } },
    newsroom: { name: 'Breaking Newsroom', dark: true, pal: { ...DARK, gold: '#ef4444', sky: '#fbbf24' }, bg(ctx, t) {
      ctx.fillStyle = lin(ctx, [[0, '#1c1c22'], [1, '#0b0b0f']]); ctx.fillRect(0, 0, W, H);
      glow(ctx, 200, 300, 700, 'rgba(220,38,38,0.25)');
      ctx.fillStyle = 'rgba(220,38,38,0.85)'; ctx.fillRect(0, 150, W, 10);
      ctx.fillStyle = 'rgba(255,255,255,0.04)'; for (let y = 0; y < H; y += 8) ctx.fillRect(0, y, W, 2);
      ctx.save(); ctx.translate(-200 + (t * 30) % 400, 0); ctx.fillStyle = 'rgba(220,38,38,0.10)';
      for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(i * 400, H); ctx.lineTo(i * 400 + 160, H); ctx.lineTo(i * 400 + 760, 0); ctx.lineTo(i * 400 + 600, 0); ctx.fill(); } ctx.restore();
      ctx.fillStyle = '#dc2626'; ctx.fillRect(0, H - 110, W, 70); ctx.fillStyle = '#111'; ctx.fillRect(0, H - 40, W, 40);
    } },
    corporate_light: { name: 'Corporate Light', dark: false, pal: { ...LIGHT, gold: '#1d4ed8', sky: '#0891b2' }, bg(ctx, t) {
      ctx.fillStyle = lin(ctx, [[0, '#ffffff'], [1, '#e6eefc']]); ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(29,78,216,0.06)'; ctx.lineWidth = 2;
      for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      ctx.fillStyle = '#1d4ed8'; ctx.fillRect(0, 0, 16, H); ctx.fillStyle = 'rgba(29,78,216,0.08)';
      ctx.beginPath(); ctx.arc(1000, 300 + Math.sin(t * 0.3) * 20, 420, 0, Math.PI * 2); ctx.fill();
    } },
    midnight_luxe: { name: 'Midnight Luxe', dark: true, pal: { ...DARK, gold: '#d4af37', sky: '#e5c76b' }, bg(ctx, t) {
      ctx.fillStyle = lin(ctx, [[0, '#14110a'], [0.5, '#0a0907'], [1, '#000']]); ctx.fillRect(0, 0, W, H);
      glow(ctx, 540, 700 + Math.sin(t * 0.25) * 30, 760, 'rgba(212,175,55,0.18)');
      ctx.strokeStyle = 'rgba(212,175,55,0.55)'; ctx.lineWidth = 3; ctx.strokeRect(36, 36, W - 72, H - 72);
      ctx.strokeStyle = 'rgba(212,175,55,0.22)'; ctx.lineWidth = 1.5; ctx.strokeRect(52, 52, W - 104, H - 104);
    } },
    emerald: { name: 'Emerald Govt', dark: true, pal: { ...DARK, gold: '#facc15', sky: '#6ee7b7' }, bg(ctx, t) {
      ctx.fillStyle = lin(ctx, [[0, '#064e3b'], [1, '#022c22']]); ctx.fillRect(0, 0, W, H);
      glow(ctx, 900, 400, 600, 'rgba(250,204,21,0.12)');
      ctx.strokeStyle = 'rgba(250,204,21,0.08)'; ctx.lineWidth = 2; const r = 70;
      for (let y = 0; y < H + r; y += r * 1.5) for (let x = 0; x < W + r; x += r * 1.732) {
        const ox = (Math.round(y / (r * 1.5)) % 2) * r * 0.866; ctx.beginPath();
        for (let k = 0; k < 6; k++) { const a = Math.PI / 3 * k + Math.PI / 6; ctx.lineTo(x + ox + r * Math.cos(a), y + r * Math.sin(a)); } ctx.closePath(); ctx.stroke(); }
    } },
    royal_purple: { name: 'Royal Exam', dark: true, pal: { ...DARK, gold: '#fbbf24', sky: '#c4b5fd' }, bg(ctx, t) {
      ctx.fillStyle = lin(ctx, [[0, '#3b0764'], [0.55, '#1e1b4b'], [1, '#0b0820']]); ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 14; i++) { const x = hash(i) * W, y = (hash(i + 3) * H + t * (10 + hash(i) * 14)) % H, rr = 40 + hash(i + 6) * 120;
        glow(ctx, x, y, rr, `rgba(196,181,253,${0.05 + hash(i + 9) * 0.08})`); }
    } },
    exam_paper: { name: 'Exam Paper', dark: false, pal: { ...LIGHT, gold: '#dc2626', sky: '#1d4ed8', card: 'rgba(255,255,255,0.92)' }, bg(ctx, t) {
      ctx.fillStyle = '#fbf7ec'; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(59,130,246,0.22)'; ctx.lineWidth = 2; for (let y = 180; y < H; y += 64) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(220,38,38,0.45)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(120, 0); ctx.lineTo(120, H); ctx.stroke();
      ctx.fillStyle = 'rgba(0,0,0,0.05)'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(60, 300 + i * 340, 18, 0, Math.PI * 2); ctx.fill(); }
    } },
    sunrise: { name: 'Sunrise Success', dark: true, pal: { ...DARK, gold: '#fde047', sky: '#fed7aa' }, bg(ctx, t) {
      ctx.fillStyle = lin(ctx, [[0, '#7c2d12'], [0.5, '#9a3412'], [1, '#431407']]); ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.translate(540, 1300); ctx.rotate(t * 0.03); ctx.fillStyle = 'rgba(253,224,71,0.07)';
      for (let i = 0; i < 18; i++) { ctx.rotate(Math.PI * 2 / 18); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-80, -1600); ctx.lineTo(80, -1600); ctx.fill(); } ctx.restore();
      glow(ctx, 540, 1300, 520, 'rgba(253,186,116,0.35)');
    } },
    teal_tech: { name: 'Teal Tech', dark: true, pal: { ...DARK, gold: '#2dd4bf', sky: '#67e8f9' }, bg(ctx, t) {
      ctx.fillStyle = lin(ctx, [[0, '#042f2e'], [1, '#021a1a']]); ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(45,212,191,0.16)'; ctx.lineWidth = 2;
      for (let i = 0; i < 22; i++) { const x = Math.round(hash(i) * 18) * 60, y = Math.round(hash(i + 4) * 30) * 64, L = 120 + hash(i + 8) * 300;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + L, y); ctx.lineTo(x + L, y + L * 0.6); ctx.stroke();
        const pp = (t * 0.25 + hash(i)) % 1; ctx.fillStyle = 'rgba(45,212,191,0.7)'; ctx.beginPath(); ctx.arc(x + L * Math.min(1, pp * 1.6), y, 5, 0, Math.PI * 2); ctx.fill(); }
      glow(ctx, 540, 900, 700, 'rgba(45,212,191,0.10)');
    } },
    heritage_maroon: { name: 'Heritage Maroon', dark: true, pal: { ...DARK, gold: '#f2c14e', sky: '#fda4af' }, bg(ctx, t) {
      ctx.fillStyle = lin(ctx, [[0, '#5b0f1f'], [1, '#2a0510']]); ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.translate(540, 760); ctx.rotate(t * 0.02); ctx.strokeStyle = 'rgba(242,193,78,0.12)'; ctx.lineWidth = 2;
      for (let r = 120; r < 900; r += 90) { ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
        for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; ctx.beginPath(); ctx.ellipse(Math.cos(a) * r, Math.sin(a) * r, 26, 12, a, 0, Math.PI * 2); ctx.stroke(); } }
      ctx.restore(); glow(ctx, 540, 760, 500, 'rgba(242,193,78,0.10)');
    } },
    railway_sky: { name: 'Railway Blue', dark: true, pal: { ...DARK, gold: '#fbbf24', sky: '#bae6fd' }, bg(ctx, t) {
      ctx.fillStyle = lin(ctx, [[0, '#0c4a6e'], [0.6, '#075985'], [1, '#082f49']]); ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(380, 1250); ctx.lineTo(-200, H); ctx.moveTo(700, 1250); ctx.lineTo(1280, H); ctx.stroke();
      for (let i = 0; i < 14; i++) { const k = ((i + t * 1.2) % 14) / 14, y = 1250 + (H - 1250) * k * k, half = 160 + 700 * k * k;
        ctx.lineWidth = 3 + k * 10; ctx.beginPath(); ctx.moveTo(540 - half, y); ctx.lineTo(540 + half, y); ctx.stroke(); }
      glow(ctx, 540, 1250, 500, 'rgba(251,191,36,0.15)');
    } },
    glass_dark: { name: 'Glass Dark', dark: true, pal: { ...DARK, gold: '#38bdf8', sky: '#a78bfa', card: 'rgba(255,255,255,0.10)' }, bg(ctx, t) {
      ctx.fillStyle = '#0b1120'; ctx.fillRect(0, 0, W, H);
      [[250, 420, '#3b82f6'], [880, 900, '#a855f7'], [300, 1500, '#06b6d4']].forEach(([x, y, c], i) =>
        glow(ctx, x + Math.sin(t * 0.2 + i) * 60, y + Math.cos(t * 0.18 + i) * 60, 620, c + '55'));
      ctx.fillStyle = 'rgba(255,255,255,0.025)'; for (let i = 0; i < 3000; i++) ctx.fillRect(hash(i) * W, hash(i + 1) * H, 2, 2);
    } },
    slate_red: { name: 'Slate Analysis', dark: true, pal: { ...DARK, gold: '#f43f5e', sky: '#fda4af' }, bg(ctx, t) {
      ctx.fillStyle = lin(ctx, [[0, '#334155'], [1, '#0f172a']]); ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.translate(0, Math.sin(t * 0.3) * 10); ctx.fillStyle = 'rgba(244,63,94,0.9)';
      ctx.beginPath(); ctx.moveTo(0, 1380); ctx.lineTo(W, 1180); ctx.lineTo(W, 1230); ctx.lineTo(0, 1430); ctx.fill();
      ctx.fillStyle = 'rgba(244,63,94,0.18)'; ctx.beginPath(); ctx.moveTo(0, 1450); ctx.lineTo(W, 1250); ctx.lineTo(W, 1400); ctx.lineTo(0, 1600); ctx.fill(); ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'; for (let x = 0; x < W; x += 90) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    } },
    ivory_classic: { name: 'Ivory Classic', dark: false, pal: { ...LIGHT, gold: '#b45309', sky: '#1e3a8a' }, bg(ctx, t) {
      ctx.fillStyle = lin(ctx, [[0, '#fffdf7'], [1, '#f3ead7']]); ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#0b2a63'; ctx.fillRect(0, 0, W, 210); ctx.fillStyle = '#d4a017'; ctx.fillRect(0, 210, W, 8);
      ctx.strokeStyle = 'rgba(180,83,9,0.10)'; ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(540, 1250, 200 + i * 110 + Math.sin(t * 0.4) * 6, 0, Math.PI * 2); ctx.stroke(); }
      ctx.fillStyle = '#0b2a63'; ctx.fillRect(0, H - 22, W, 22);
    } },
  };

  // ---- 3D scene backgrounds (brand/backgrounds/<key>.jpg: Canva AI 3D renders + Three.js scenes) ----
  // slow cinematic push-in + dark gradient at the top/bottom so text and characters stay readable
  const SCENE = { park: 'Park / Garden', office: 'Modern Office', home: 'Home Living Room', tuition: 'Tuition Class', govt_office: 'Sarkari Daftar',
    library: 'Library', railway: 'Railway Platform', police_ground: 'Police Ground', bank: 'Bank Branch', college: 'College Campus',
    news_studio: 'News Studio (3D code)', exam_hall: 'Exam Hall (3D code)', stage: 'Award Stage (3D code)', city_night: 'City Night (3D code)', study_desk: 'Study Desk (3D code)' };
  Object.entries(SCENE).forEach(([k, name]) => {
    window.EJ_THEMES['scene_' + k] = { name, dark: true, img: k,
      pal: { ...DARK, gold: '#fbbf24', sky: '#7dd3fc', card: 'rgba(7,14,32,0.72)', stroke: 'rgba(255,255,255,0.18)' },
      bg(ctx, t) {
        const im = this._im; ctx.fillStyle = '#0b1220'; ctx.fillRect(0, 0, W, H);
        if (im) { const z = 1 + Math.min(t, 40) * 0.0016; ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.drawImage(im, -W / 2, -H / 2, W, H); ctx.restore(); }
        ctx.fillStyle = lin(ctx, [[0, 'rgba(3,8,20,0.82)'], [0.32, 'rgba(3,8,20,0.25)'], [0.62, 'rgba(3,8,20,0)'], [1, 'rgba(3,8,20,0.55)']]); ctx.fillRect(0, 0, W, H);
      } };
  });
})();
