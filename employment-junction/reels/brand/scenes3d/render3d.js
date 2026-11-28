// node render3d.js <outdir> [scene ...] -> <outdir>/<scene>.jpg (1080x1920)
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const out = process.argv[2], keys = process.argv.slice(3).length ? process.argv.slice(3) : ['news_studio', 'exam_hall', 'stage', 'city_night', 'study_desk'];
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } }); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  for (const k of keys) { await p.goto('file://' + path.join(__dirname, 'scenes.html') + '?scene=' + k); await p.waitForFunction(() => window.done, null, { timeout: 60000 });
    await p.screenshot({ path: path.join(out, k + '.jpg'), type: 'jpeg', quality: 90 }); console.log('ok', k); }
  if (errs.length) console.log(errs.slice(0, 5)); await b.close();
})();
