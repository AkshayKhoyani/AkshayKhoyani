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
