// Renders scene.html frame-by-frame and encodes an MP4 with ffmpeg.
// Usage: node render.js [out.mp4] [--preview t1,t2,...]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');

const FPS = 30;
const dir = __dirname;
const args = process.argv.slice(2);
const out = args.find(a => a.endsWith('.mp4')) || path.join(dir, 'genz-traders-short.mp4');
const previewIdx = args.indexOf('--preview');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(dir, 'scene.html'));
  await page.evaluate(() => window.ready);
  const fs = require('fs');
  const tlPath = path.join(dir, 'timeline.json');
  const voice = path.join(dir, 'voice.wav');
  const hasVoice = fs.existsSync(tlPath) && fs.existsSync(voice);
  if (hasVoice) await page.evaluate(d => setTimeline(d.scenes, d.skips), JSON.parse(fs.readFileSync(tlPath)));
  const dur = await page.evaluate(() => window.DUR);
  const grab = async t => {
    const b64 = await page.evaluate(t => { renderFrame(t); return document.getElementById('c').toDataURL('image/png').split(',')[1]; }, t);
    return Buffer.from(b64, 'base64');
  };

  if (previewIdx >= 0) {
    for (const t of args[previewIdx + 1].split(',').map(Number)) {
      fs.writeFileSync(path.join(process.env.PREVIEW_DIR || dir, `preview_${t}.png`), await grab(t));
    }
    await browser.close();
    return;
  }

  const music = path.join(dir, 'music.wav');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-i', music,
    ...(hasVoice ? ['-i', voice, '-filter_complex',
      '[1:a]volume=0.22[m];[2:a]volume=1.6[v];[m][v]amix=inputs=2:normalize=0,alimiter=limit=0.95[a]',
      '-map', '0:v', '-map', '[a]'] : []),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium',
    '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });

  const total = Math.round(dur * FPS);
  for (let i = 0; i < total; i++) {
    const buf = await grab(i / FPS);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 150 === 0) console.log(`frame ${i}/${total}`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close();
  console.log('done ->', out);
})();
