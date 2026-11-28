// node videos/styles/gold3d/shoot.js  -> view_1..6.png
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '../..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.json': 'application/json' };
(async () => {
  const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); });
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const port = srv.address().port;
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', e => console.log('ERR', e.message));
  for (let v = 1; v <= 6; v++) {
    await page.goto(`http://127.0.0.1:${port}/styles/gold3d/index.html?v=${v}`);
    await page.waitForFunction('window.READY === true', null, { timeout: 120000 });
    await (await page.$('#c')).screenshot({ path: path.join(__dirname, `view_${v}.png`) });
    console.log('view', v);
  }
  await browser.close(); srv.close();
})();
