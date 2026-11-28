// Render a 3D engine video folder to MP4.
// Usage: node engine/render3d.js <video_dir> [--preview t1,t2,...] [--out file.mp4]
// Serves the videos/ folder over local HTTP (needed for ES modules + untainted canvas).
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const dir = path.resolve(args[0]);
const rel = path.relative(ROOT, dir);
const pi = args.indexOf('--preview');
const oi = args.indexOf('--out');
const out = oi >= 0 ? args[oi + 1] : path.join(dir, path.basename(dir) + '.mp4');
const FPS = 30;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.mp3': 'audio/mpeg' };

const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});

(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('console', m => { if (!m.text().includes('GL Driver')) console.log('page:', m.text()); });
  page.on('pageerror', e => console.log('pageerror:', e.message));
  await page.goto(`http://127.0.0.1:${port}/${rel}/index.html`);
  await page.waitForFunction(() => window.READY === true, null, { timeout: 120000 });
  const dur = await page.evaluate(() => window.DUR);
  const grab = async (t, fmt = 'image/jpeg') => {
    const b64 = await page.evaluate(([t, fmt]) => { renderFrame(t); return document.getElementById('out').toDataURL(fmt, 0.93).split(',')[1]; }, [t, fmt]);
    return Buffer.from(b64, 'base64');
  };

  if (pi >= 0) {
    const pdir = process.env.PREVIEW_DIR || dir;
    for (const t of args[pi + 1].split(',').map(Number)) fs.writeFileSync(path.join(pdir, `p_${t}.png`), await grab(t, 'image/png'));
    await browser.close(); server.close(); return;
  }

  const music = path.join(dir, 'music.wav'), voice = path.join(dir, 'voice.wav');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error',
    '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(FPS), '-i', '-',
    '-i', music, '-i', voice, '-filter_complex',
    '[1:a]volume=0.2[m];[2:a]volume=1.6[v];[m][v]amix=inputs=2:normalize=0,alimiter=limit=0.95[a]',
    '-map', '0:v', '-map', '[a]',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '19', '-preset', 'medium',
    '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const total = Math.round(dur * FPS), t0 = Date.now();
  for (let i = 0; i < total; i++) {
    const buf = await grab(i / FPS);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 150 === 0) console.log(`frame ${i}/${total}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close(); server.close();
  console.log('done ->', out);
})();
