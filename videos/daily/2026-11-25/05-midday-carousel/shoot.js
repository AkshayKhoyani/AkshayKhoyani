const http = require('http'), fs = require('fs'), path = require('path'); const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '../../..'); const T = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.woff2': 'font/woff2' };
(async () => {
  const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': T[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); });
  await new Promise(r => srv.listen(0, '127.0.0.1', r)); const port = srv.address().port;
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1350 } }); p.on('pageerror', e => console.log('ERR', e.message));
  const rel = path.relative(ROOT, __dirname);
  for (let s = 1; s <= 8; s++) { await p.goto(`http://127.0.0.1:${port}/${rel}/carousel.html?s=${s}`); await p.waitForFunction('window.READY === true', null, { timeout: 60000 }); await (await p.$('#c')).screenshot({ path: path.join(__dirname, `slide_${s}.png`) }); }
  await b.close(); srv.close(); console.log('done');
})();
