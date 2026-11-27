const http = require('http'), fs = require('fs'), path = require('path'); const { chromium } = require('playwright');
const N = { r1: '3D animated film: ghar ka scene', r2: 'Photoreal CGI: jewellery showroom', r3: 'Hyperreal: girte sone ke bars', r4: 'Cinematic 3D: bazaar mein Dadi', r5: 'Realistic news studio', r6: 'Close-up: phone par shock' };
(async () => {
  const srv = http.createServer((q, r) => { const f = path.join(__dirname, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200); r.end(d); }); });
  await new Promise(r => srv.listen(0, '127.0.0.1', r)); const port = srv.address().port;
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  let i = 0;
  for (const k of Object.keys(N)) { i++;
    await p.goto(`http://127.0.0.1:${port}/overlay.html?img=img/${k}.png&n=${i}&name=${encodeURIComponent(N[k])}`);
    await p.waitForFunction('window.READY === true'); await (await p.$('#c')).screenshot({ path: path.join(__dirname, `concept_${i}.png`) }); }
  await b.close(); srv.close();
})();
