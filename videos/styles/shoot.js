const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file://' + path.join(__dirname, 'styles.html')); await p.evaluate(() => window.ready);
  for (let n = 1; n <= 12; n++) { await p.evaluate(n => draw(n), n); await p.locator('#c').screenshot({ path: path.join(__dirname, `style_${String(n).padStart(2, '0')}.png`) }); }
  await b.close();
})();
