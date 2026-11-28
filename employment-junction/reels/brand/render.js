// Renders a reel folder (scene.html + timeline.json + voice.wav + music.wav) to MP4.
// Usage: node brand/render.js <reel-dir> [out.mp4] [--preview t1,t2,...]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const FPS = 30;
const args = process.argv.slice(2);
const dir = path.resolve(args[0]);
const out = args.find(a => a.endsWith('.mp4')) || path.join(dir, path.basename(dir) + '.mp4');
const previewIdx = args.indexOf('--preview');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  // brand cast images as data URLs (file:// images would taint the canvas)
  const castDir = path.join(__dirname, '..', '..', 'engine', 'assets', 'characters');
  const castSrc = {};
  for (const f of fs.existsSync(castDir) ? fs.readdirSync(castDir) : []) if (f.startsWith('cast_')) castSrc[f.slice(5, -5)] = 'data:image/webp;base64,' + fs.readFileSync(path.join(castDir, f)).toString('base64');
  // animation frames (mouth + hand poses): engine/assets/characters/anim/<name>__<frame>.webp
  const animDir = path.join(castDir, 'anim');
  for (const f of fs.existsSync(animDir) ? fs.readdirSync(animDir) : []) if (f.endsWith('.webp')) castSrc[f.slice(0, -5)] = 'data:image/webp;base64,' + fs.readFileSync(path.join(animDir, f)).toString('base64');
  // voice loudness per video frame -> lip-sync (mouth opens on loud syllables)
  const vpath = path.join(dir, 'voice.wav');
  let amp = [];
  if (fs.existsSync(vpath)) {
    const b = fs.readFileSync(vpath); let o = 12, sr = 44100, ch = 1, bits = 16, dataOff = 0, dataLen = 0;
    while (o < b.length - 8) { const id = b.toString('ascii', o, o + 4), sz = b.readUInt32LE(o + 4);
      if (id === 'fmt ') { ch = b.readUInt16LE(o + 10); sr = b.readUInt32LE(o + 12); bits = b.readUInt16LE(o + 22); }
      if (id === 'data') { dataOff = o + 8; dataLen = Math.min(sz, b.length - o - 8); break; } o += 8 + sz + (sz % 2); }
    if (bits === 16 && dataOff) {
      const per = Math.round(sr / FPS) * ch, n = Math.floor(dataLen / 2);
      for (let i = 0; i < n; i += per) { let s = 0, c = 0; for (let j = i; j < Math.min(n, i + per); j++) { const v = b.readInt16LE(dataOff + j * 2) / 32768; s += v * v; c++; } amp.push(Math.sqrt(s / Math.max(1, c))); }
      const mx = Math.max(...amp.slice().sort((x, y) => x - y).slice(-Math.ceil(amp.length * 0.05))) || 1; amp = amp.map(v => Math.min(1, v / mx));
    }
  }
  // smooth the loudness and turn it into mouth shapes that each hold >= 3 frames (no single-frame flicker)
  const sm = amp.map((_, i) => (amp[Math.max(0, i - 1)] + amp[i] + amp[Math.min(amp.length - 1, i + 1)]) / 3);
  const mouth = []; let cur = 0, held = 99, pend = 0, pendN = 0;
  for (const v of sm) {
    const want = v < 0.10 ? 0 : v < 0.55 ? 1 : 2;
    pendN = want === pend ? pendN + 1 : 1; pend = want;
    if (want !== cur && held >= 3 && (want !== 0 || pendN >= 3)) { cur = want; held = 0; }
    held++; mouth.push(cur);
  }
  await page.addInitScript(a => { window.AMP = { fps: 30, data: a.sm, mouth: a.mouth }; }, { sm, mouth });
  const metaP = path.join(animDir, 'meta.json');
  await page.addInitScript(m => { window.CAST_META = m; }, fs.existsSync(metaP) ? JSON.parse(fs.readFileSync(metaP)) : {});
  castSrc.logo = 'data:image/webp;base64,' + fs.readFileSync(path.join(castDir, '..', 'logo.webp')).toString('base64');
  // theme: script.json "theme" or THEME env (see brand/themes.js)
  let theme = process.env.THEME || '';
  try { theme = theme || JSON.parse(fs.readFileSync(path.join(dir, 'script.json'))).theme || ''; } catch (e) {}
  await page.addInitScript(fs.readFileSync(path.join(__dirname, 'themes.js'), 'utf8'));
  await page.addInitScript(th => { window.THEME = th; }, theme);
  // 3D scene backgrounds used by this reel (theme "scene_<key>" or per-scene `theme:` in scene.html)
  const sceneSrc = fs.readFileSync(path.join(dir, 'scene.html'), 'utf8') + ' ' + theme;
  const bgDir = path.join(__dirname, 'backgrounds'), bgs = {};
  for (const f of fs.existsSync(bgDir) ? fs.readdirSync(bgDir) : []) { const k = f.replace(/\.jpg$/, '');
    if (sceneSrc.includes('scene_' + k)) bgs[k] = 'data:image/jpeg;base64,' + fs.readFileSync(path.join(bgDir, f)).toString('base64'); }
  await page.addInitScript(b => { window.BG_SRC = b; }, bgs);
  await page.addInitScript(s => { window.CAST_SRC = s; }, castSrc);
  await page.goto('file://' + path.join(dir, 'scene.html'));
  await page.evaluate(() => window.ready);
  const tl = path.join(dir, 'timeline.json'), voice = path.join(dir, 'voice.wav'), music = path.join(dir, 'music.wav');
  const hasVoice = fs.existsSync(tl) && fs.existsSync(voice);
  if (hasVoice) await page.evaluate(d => setTimeline(d), JSON.parse(fs.readFileSync(tl)).scenes);
  const dur = await page.evaluate(() => window.DUR);
  const grab = async t => Buffer.from(await page.evaluate(t => { renderFrame(t); return document.getElementById('c').toDataURL('image/png').split(',')[1]; }, t), 'base64');

  if (previewIdx >= 0) {
    const pd = process.env.PREVIEW_DIR || dir;
    for (const t of args[previewIdx + 1].split(',').map(Number)) fs.writeFileSync(path.join(pd, `preview_${t}.png`), await grab(t));
    if (errors.length) console.log('page errors:', errors);
    await browser.close(); return;
  }
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-i', music,
    ...(hasVoice ? ['-i', voice, '-filter_complex',
      '[1:a]volume=0.2[m];[2:a]volume=1.6[v];[m][v]amix=inputs=2:normalize=0,alimiter=limit=0.95[a]',
      '-map', '0:v', '-map', '[a]'] : []),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-preset', 'medium',
    '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const total = Math.round(dur * FPS);
  for (let i = 0; i < total; i++) {
    const buf = await grab(i / FPS);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 300 === 0) console.log(`frame ${i}/${total}`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close();
  if (errors.length) console.log('page errors:', errors);
  console.log('done ->', out);
})();
