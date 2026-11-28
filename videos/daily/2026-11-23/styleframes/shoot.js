const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + path.join(__dirname, 'frames.html')); await p.evaluate(() => window.ready);
  for (const t of ['A', 'B', 'C']) for (const n of [1, 2, 3]) {
    await p.evaluate(([t, n]) => draw(t, n), [t, n]);
    await p.locator('#c').screenshot({ path: path.join(__dirname, `${t}${n}.png`) });
  }
  await b.close();
})();
