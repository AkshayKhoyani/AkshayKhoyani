/* Tradenest product tabs enhancer: keeps the original text (SEO), rebuilds the four tab panels visually. */
(function () {
  var P = {
    sieve: '<path d="M3 7h18"/><path d="M5 7l1.5 11a2 2 0 0 0 2 1.7h7a2 2 0 0 0 2-1.7L19 7"/><path d="M9 11h.01M12 11h.01M15 11h.01M10.5 14h.01M13.5 14h.01"/>',
    drop: '<path d="M12 2.7s6 6.3 6 11.3a6 6 0 0 1-12 0c0-5 6-11.3 6-11.3z"/>',
    cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>',
    box: '<path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    palette: '<circle cx="13.5" cy="6.5" r="1"/><circle cx="17.5" cy="10.5" r="1"/><circle cx="8.5" cy="7.5" r="1"/><circle cx="6.5" cy="12.5" r="1"/><path d="M12 2a10 10 0 0 0 0 20c1 0 1.7-.8 1.7-1.7 0-.4-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-.9.8-1.7 1.7-1.7H16a6 6 0 0 0 6-6c0-4.8-4.5-8.4-10-8.4z"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10z"/><path d="M2 21c0-3 1.9-5.4 5.1-6C9.5 14.5 12 13 13 12"/>',
    cup: '<path d="M17 8h1a4 4 0 0 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z"/><path d="M6 2v2M10 2v2M14 2v2"/>',
    bread: '<path d="M5 11a4 4 0 1 1 3-6.6A4 4 0 0 1 12 3a4 4 0 0 1 4 1.4A4 4 0 1 1 19 11v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/>',
    pill: '<path d="M10.5 20.5a7 7 0 0 1-9.9-9.9l9.9-9.9a7 7 0 0 1 9.9 9.9z"/><path d="M5.5 5.5l9.9 9.9"/>',
    bowl: '<path d="M2 12h20"/><path d="M20 12a8 8 0 0 1-16 0"/><path d="M9 3c0 2 2 2 2 4M14 3c0 2 2 2 2 4"/>',
    spark: '<path d="M12 3l1.9 5.8L20 10l-6.1 1.2L12 17l-1.9-5.8L4 10l6.1-1.2z"/><path d="M19 17l.8 2.2L22 20l-2.2.8L19 23l-.8-2.2L16 20l2.2-.8z"/>',
    shaker: '<path d="M8 2h8l-1 5H9z"/><rect x="6" y="7" width="12" height="15" rx="2"/><path d="M10 12h.01M14 12h.01M12 15h.01"/>',
    milk: '<path d="M8 2h8M9 2v3l-3 4v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9l-3-4V2"/><path d="M6 14c2-1 4 1 6 0s4-1 6 0"/>',
    factory: '<path d="M2 20h20V9l-6 4V9l-6 4V4H2z"/><path d="M6 16h.01M10 16h.01M14 16h.01M18 16h.01"/>',
    store: '<path d="M3 9l1-5h16l1 5"/><path d="M4 9v11h16V9"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/>',
    truck: '<path d="M14 18V6H2v12h2"/><path d="M14 9h4l4 4v5h-2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
    ship: '<path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M19.4 18L21 12l-9-4-9 4 1.6 6"/><path d="M12 2v6M8 4h8"/>',
    doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h6"/>',
    check: '<circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/>',
    cog: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 0 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3.3 14H3a2 2 0 0 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 9 4.6 1.6 1.6 0 0 0 10 3.1V3a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.6 1.6 0 0 0 19.4 9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
    tag: '<path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z"/><circle cx="7.5" cy="7.5" r="1"/>',
    chev: '<path d="M6 9l6 6 6-6"/>'
  };
  function ic(n) { return '<svg class="tn-ico" viewBox="0 0 24 24" aria-hidden="true">' + (P[n] || P.check) + '</svg>'; }
  function pick(t, rules, d) { t = (t || '').toLowerCase(); for (var i = 0; i < rules.length; i++) { if (rules[i][0].test(t)) { return rules[i][1]; } } return d; }
  var SPEC = [[/mesh|particle|size|grain/, 'sieve'], [/moist/, 'drop'], [/shelf|life/, 'cal'], [/hs|code|tariff/, 'globe'], [/moq|order|minimum/, 'box'], [/origin|country/, 'pin'], [/process|method|dried|drying/, 'flame'], [/appear|look|form/, 'eye'], [/colou?r/, 'palette'], [/taste|flavou?r|aroma|odou?r|botanic|part used|plant/, 'leaf'], [/solub/, 'drop'], [/storage|store/, 'box'], [/ash|density|bulk/, 'cog']];
  var APP = [[/beverage|drink|juice|smoothie|shake|tea|coffee|latte/, 'cup'], [/bak|bread|cookie|biscuit|cake|muffin/, 'bread'], [/supplement|capsule|tablet|nutraceut|pharma/, 'pill'], [/soup|sauce|gravy|ready meal|curry|noodle|dip/, 'bowl'], [/cosmetic|skin|hair|face|soap|beauty/, 'spark'], [/season|spice|masala|snack|chip|namkeen|rub/, 'shaker'], [/dairy|yogh?urt|ice cream|milk|dessert/, 'milk'], [/herbal|ayurved|botanical|green|superfood/, 'leaf'], [/manufactur|processor|industr|food brand/, 'factory'], [/retail|private label|brand|store|distribut|import|wholesal/, 'store'], [/horeca|restaurant|hotel|catering|food ?service|kitchen/, 'bowl'], [/feed|animal|pet/, 'leaf']];
  var PACK = [[/pouch|sachet/, 'tag'], [/jar|bottle|tin|can\b/, 'box'], [/hdpe|container|drum|pail|bucket/, 'box'], [/bag|sack|kraft|paper|bulk/, 'box'], [/carton|box/, 'box'], [/pallet|container load|fcl|lcl/, 'ship'], [/private|custom|label/, 'tag']];
  function txt(el) { return (el.textContent || '').replace(/\s+/g, ' ').trim(); }

  function specs(panel) {
    var table = panel.querySelector('table'); if (!table || panel.querySelector('.tn-spec-grid')) { return; }
    var grid = document.createElement('div'); grid.className = 'tn-spec-grid';
    var seen = {};
    [].forEach.call(table.querySelectorAll('tbody tr'), function (tr) {
      var td = tr.querySelectorAll('td'); if (td.length < 2) { return; }
      var l = txt(td[0]), v = txt(td[1]);
      var key = l.toLowerCase().replace(/content|\s+/g, ''); if (seen[key]) { return; } seen[key] = 1;
      grid.insertAdjacentHTML('beforeend', '<div class="tn-spec-card"><div class="tn-spec-ic">' + ic(pick(l, SPEC, 'check')) + '</div><div class="tn-spec-label"></div><div class="tn-spec-val"></div></div>');
      var c = grid.lastChild; c.querySelector('.tn-spec-label').textContent = l; c.querySelector('.tn-spec-val').textContent = v;
    });
    var wrap = table.closest('.overflow-x-auto') || table;
    wrap.style.display = 'none'; wrap.parentNode.insertBefore(grid, wrap);
  }

  function apps(panel) {
    if (panel.querySelector('.tn-app-grid')) { return; }
    var cols = panel.querySelectorAll(':scope > div');
    [].forEach.call(cols, function (col, i) {
      var list = col.querySelector('.space-y-2\\.5') || col.querySelector('div'); if (!list) { return; }
      var items = [].map.call(list.querySelectorAll(':scope > div'), txt).filter(Boolean); if (!items.length) { return; }
      var out = document.createElement('div');
      if (i === 0) {
        out.className = 'tn-app-grid';
        items.forEach(function (t) { out.insertAdjacentHTML('beforeend', '<div class="tn-app-tile"><div class="tn-app-ic">' + ic(pick(t, APP, 'check')) + '</div><div class="tn-app-tx"></div></div>'); out.lastChild.querySelector('.tn-app-tx').textContent = t; });
      } else {
        out.className = 'tn-ind-wrap';
        items.forEach(function (t) { out.insertAdjacentHTML('beforeend', '<span class="tn-ind-chip"><i>' + ic(pick(t, APP, 'factory')) + '</i><span></span></span>'); out.lastChild.lastChild.textContent = t; });
      }
      list.style.display = 'none'; list.parentNode.insertBefore(out, list);
    });
    panel.classList.add('tn-apps-1col');
  }

  function pack(panel) {
    if (panel.querySelector('.tn-pack-grid')) { return; }
    var grid = panel.querySelector('.grid'); if (!grid) { return; }
    var cards = [].slice.call(grid.children);
    var out = document.createElement('div'); out.className = 'tn-pack-grid';
    cards.forEach(function (c, i) {
      var ps = c.querySelectorAll('p'); var t = ps.length ? txt(ps[ps.length - 1]) : txt(c); if (!t) { return; }
      out.insertAdjacentHTML('beforeend', '<div class="tn-pack-card"><div class="tn-pack-ic">' + ic(pick(t, PACK, 'box')) + '</div><div><div class="tn-pack-no">OPTION ' + ('0' + (i + 1)).slice(-2) + '</div><div class="tn-pack-tx"></div></div></div>');
      out.lastChild.querySelector('.tn-pack-tx').textContent = t;
    });
    grid.style.display = 'none'; grid.parentNode.insertBefore(out, grid);
    var steps = [['doc', 'Inquiry', 'Product, quantity, packing and port'], ['cog', 'Sample &amp; quote', 'Spec sheet with every quotation'], ['factory', 'Processing', 'Cleaned, dried, milled and sieved'], ['box', 'Packing', 'Bulk or private label, export packed'], ['ship', 'Dispatch', 'Sea or air, documents shared']];
    var html = '<div class="tn-flow"><h3>How your order moves</h3><ol>';
    steps.forEach(function (s) { html += '<li><span class="tn-step">' + ic(s[0]) + '</span><div><b>' + s[1] + '</b>' + s[2] + '</div></li>'; });
    out.insertAdjacentHTML('afterend', html + '</ol></div>');
  }

  function faq(panel) {
    if (panel.querySelector('.tn-faq')) { return; }
    var box = panel.querySelector('.space-y-3'); if (!box) { return; }
    var out = document.createElement('div'); out.className = 'tn-faq';
    [].forEach.call(box.children, function (it, i) {
      var ps = it.querySelectorAll('p'); if (ps.length < 2) { return; }
      out.insertAdjacentHTML('beforeend', '<div class="tn-faq-item' + (i === 0 ? ' open' : '') + '"><button type="button" class="tn-faq-q" aria-expanded="' + (i === 0) + '"><span class="tn-faq-n">' + (i + 1) + '</span><span class="t"></span><span class="tn-faq-ch">' + ic('chev') + '</span></button><div class="tn-faq-a"></div></div>');
      var el = out.lastChild; el.querySelector('.t').textContent = txt(ps[0]); el.querySelector('.tn-faq-a').textContent = txt(ps[1]);
      el.querySelector('button').addEventListener('click', function () { var o = el.classList.toggle('open'); this.setAttribute('aria-expanded', o); });
    });
    box.style.display = 'none'; box.parentNode.insertBefore(out, box);
  }


  function calc(panel) {
    if (panel.querySelector('.tn-calc')) { return; }
    var anchor = panel.querySelector('.tn-flow'); if (!anchor) { return; }
    anchor.insertAdjacentHTML('afterend', '<div class="tn-calc"><div class="tn-calc-h"><span class="tn-calc-ic">' + ic('box') + '</span><div><b>Quantity planner</b><small>Enter your quantity to see packing and container estimates</small></div></div>'
      + '<div class="tn-calc-row"><label>Quantity needed<span><input type="number" min="5" step="5" value="500" inputmode="numeric" aria-label="Quantity in kg"><em>kg</em></span></label>'
      + '<div class="tn-calc-out"><div><strong data-o="bags">20</strong><small>bags of 25 kg</small></div><div><strong data-o="small">100</strong><small>packs of 5 kg</small></div><div><strong data-o="cont">4%</strong><small>of a 20ft container*</small></div></div></div>'
      + '<div class="tn-calc-ft"><small>*Approximate. A 20ft container typically carries 12 to 16 tonnes of bagged powder, depending on product density and packing. Exact loading is confirmed with your quotation.</small><button type="button" class="tn-calc-btn">Request a quote for <span data-o="qty">500</span> kg</button></div></div>');
    var box = panel.querySelector('.tn-calc'), inp = box.querySelector('input');
    var upd = function () { var kg = Math.max(0, parseFloat(inp.value) || 0); box.querySelector('[data-o=bags]').textContent = Math.ceil(kg / 25); box.querySelector('[data-o=small]').textContent = Math.ceil(kg / 5); var pc = kg / 14000 * 100; box.querySelector('[data-o=cont]').textContent = (pc >= 100 ? (kg / 14000).toFixed(1) + ' x' : (pc < 1 && kg > 0 ? '<1%' : Math.round(pc) + '%')); box.querySelector('[data-o=cont]').nextElementSibling.textContent = pc >= 100 ? '20ft containers (approx.)*' : 'of a 20ft container*'; box.querySelector('[data-o=qty]').textContent = kg; };
    inp.addEventListener('input', upd); upd();
    box.querySelector('.tn-calc-btn').addEventListener('click', function () {
      var t = document.querySelector('[data-inquiry-open]'); if (t) { t.click(); }
      setTimeout(function () { var ta = document.getElementById('tn-inq-message'); var n = (document.querySelector('main h1') || {}).textContent || 'this product'; if (ta) { ta.value = 'We need approx. ' + inp.value + ' kg of ' + n.trim() + '. Please share price, packing options and lead time.'; } }, 300);
    });
  }
  function sticky() {
    var bar = document.querySelector('.fixed.bottom-0.left-0.right-0'); var pdf = document.querySelector('.tn-pdf-btn');
    if (!bar || bar.querySelector('.tn-bar-pdf')) { return; }
    var img = document.querySelector('main img.wp-post-image'); var tn = bar.querySelector('.w-9.h-9');
    if (img && tn) { tn.innerHTML = '<img src="' + (img.currentSrc || img.src) + '" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:10px">'; tn.style.padding = '0'; tn.style.overflow = 'hidden'; }
    var btns = bar.querySelector('.flex.items-center.gap-3.w-full'); if (pdf && btns) { btns.insertAdjacentHTML('afterbegin', '<a class="tn-bar-pdf" href="' + pdf.getAttribute('href') + '" target="_blank" rel="noopener">' + ic('doc') + '<span>Spec PDF</span></a>'); }
  }
  function similar() { var s = document.querySelector('.tn-similar'); if (!s) { return; } var n = s.nextElementSibling; if (n && /Related Products/.test(n.textContent)) { n.style.display = 'none'; }
    var tr = s.querySelector('.tn-sim-track'); [].forEach.call(s.querySelectorAll('.tn-sim-nav'), function (b) { b.addEventListener('click', function () { tr.scrollBy({ left: (b.dataset.d === 'l' ? -1 : 1) * tr.clientWidth * 0.8, behavior: 'smooth' }); }); }); }
  function run() {
    var q = function (n) { return document.querySelector('[data-tab-panel="' + n + '"]'); };
    try { if (q('specs')) { specs(q('specs')); } } catch (e) {}
    try { if (q('applications')) { apps(q('applications')); } } catch (e) {}
    try { if (q('packaging')) { pack(q('packaging')); } } catch (e) {}
    try { if (q('faq')) { faq(q('faq')); } } catch (e) {}
    try { if (q('packaging')) { calc(q('packaging')); } } catch (e) {}
    try { sticky(); } catch (e) {}
    try { similar(); } catch (e) {}
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', run); } else { run(); }
})();
