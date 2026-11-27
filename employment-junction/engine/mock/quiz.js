/* Employment Junction mock test engine. Reads JSON from #ejq-data, renders into #ejq. No dependencies. */
(function () {
  var root = document.getElementById('ejq'); var dataEl = document.getElementById('ejq-data');
  var D = window.__EJQ || (dataEl && JSON.parse(dataEl.textContent));
  if (!root || !D) return;
  var Q = []; D.sections.forEach(function (s, si) { s.questions.forEach(function (q) { Q.push({ s: si, q: q.q, o: q.o, a: q.a, e: q.e || '' }); }); });
  var N = Q.length, ans = new Array(N).fill(-1), mark = new Array(N).fill(false), seen = new Array(N).fill(false);
  var cur = 0, left = D.duration * 60, timer = null, started = 0;
  var POS = D.marking ? D.marking.correct : 1, NEG = D.marking ? D.marking.wrong : 0;
  var KEY = 'ejq_best_' + (D.id || D.title);
  function el(h) { var d = document.createElement('div'); d.innerHTML = h; return d.firstChild; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fmt(t) { var m = Math.floor(t / 60), s = t % 60; return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s; }
  function best() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  function setBest(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} }

  function start() {
    var b = best();
    root.innerHTML = '<div class="ejq-card ejq-start">' +
      '<div class="ejq-badge">🎯 FREE MOCK TEST</div><h2 class="ejq-title">' + esc(D.title) + '</h2>' +
      '<p class="ejq-sub">' + esc(D.exam || '') + '</p>' +
      '<div class="ejq-stats"><div><b>' + N + '</b><span>Questions</span></div><div><b>' + D.duration + '</b><span>Minutes</span></div>' +
      '<div><b>' + (N * POS) + '</b><span>Marks</span></div><div><b>' + (NEG ? '-' + NEG : '0') + '</b><span>Negative</span></div></div>' +
      '<div class="ejq-secs">' + D.sections.map(function (s) { return '<span>' + esc(s.name) + ' · ' + s.questions.length + ' Q</span>'; }).join('') + '</div>' +
      '<ul class="ejq-rules"><li>Each correct answer: +' + POS + ' mark' + (NEG ? ', wrong answer: −' + NEG : ', no negative marking') + '.</li>' +
      '<li>Use <b>Mark for Review</b> to come back to a question. The test submits itself when time is over.</li>' +
      '<li>After submitting you get your score, section-wise analysis and the solution of every question.</li></ul>' +
      (b ? '<p class="ejq-best">🏆 Your best score: <b>' + b.score + ' / ' + N * POS + '</b> (' + b.date + ')</p>' : '') +
      '<button class="ejq-btn ejq-go">Start Test →</button></div>';
    root.querySelector('.ejq-go').onclick = begin;
  }
  function begin() {
    started = Date.now(); render();
    timer = setInterval(function () { left--; var t = root.querySelector('.ejq-timer'); if (t) { t.textContent = '⏱ ' + fmt(left); if (left <= 60) t.classList.add('ejq-low'); } if (left <= 0) finish(); }, 1000);
    root.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function render() {
    seen[cur] = true; var q = Q[cur];
    var tabs = D.sections.length > 1 ? '<div class="ejq-tabs">' + D.sections.map(function (s, i) { var first = Q.findIndex(function (x) { return x.s === i; }); return '<button data-go="' + first + '" class="' + (q.s === i ? 'on' : '') + '">' + esc(s.name) + '</button>'; }).join('') + '</div>' : '';
    var opts = q.o.map(function (o, i) { return '<button class="ejq-opt' + (ans[cur] === i ? ' sel' : '') + '" data-o="' + i + '"><i>' + 'ABCD'[i] + '</i><span>' + esc(o) + '</span></button>'; }).join('');
    var pal = Q.map(function (x, i) { var c = ans[i] >= 0 ? (mark[i] ? 'mr ans' : 'ans') : (mark[i] ? 'mr' : (seen[i] ? 'seen' : '')); return '<button data-go="' + i + '" class="' + c + (i === cur ? ' cur' : '') + '">' + (i + 1) + '</button>'; }).join('');
    var done = ans.filter(function (a) { return a >= 0; }).length;
    root.innerHTML = '<div class="ejq-card ejq-test"><div class="ejq-top"><div class="ejq-tname">' + esc(D.title) + '</div><div class="ejq-timer">⏱ ' + fmt(left) + '</div></div>' + tabs +
      '<div class="ejq-prog"><div style="width:' + Math.round(done / N * 100) + '%"></div></div>' +
      '<div class="ejq-qhead"><span>Question ' + (cur + 1) + ' / ' + N + '</span><span class="ejq-sec">' + esc(D.sections[q.s].name) + '</span></div>' +
      '<div class="ejq-q">' + esc(q.q) + '</div><div class="ejq-opts">' + opts + '</div>' +
      '<div class="ejq-nav"><button class="ejq-btn2" data-act="prev"' + (cur ? '' : ' disabled') + '>← Prev</button>' +
      '<button class="ejq-btn2" data-act="clear">Clear</button><button class="ejq-btn2 ejq-mr" data-act="mark">' + (mark[cur] ? '★ Marked' : '☆ Review') + '</button>' +
      '<button class="ejq-btn" data-act="next">' + (cur < N - 1 ? 'Save & Next →' : 'Save') + '</button></div>' +
      '<details class="ejq-paldet"' + (window.innerWidth > 720 ? ' open' : '') + '><summary>Question Palette · ' + done + ' answered</summary><div class="ejq-pal">' + pal + '</div>' +
      '<div class="ejq-legend"><span class="ans">Answered</span><span class="mr">Review</span><span class="seen">Not answered</span><span>Not visited</span></div></details>' +
      '<button class="ejq-submit" data-act="submit">Submit Test</button></div>';
    root.querySelectorAll('.ejq-opt').forEach(function (b) { b.onclick = function () { ans[cur] = +b.dataset.o; render(); }; });
    root.querySelectorAll('[data-go]').forEach(function (b) { b.onclick = function () { cur = +b.dataset.go; render(); }; });
    root.querySelectorAll('[data-act]').forEach(function (b) {
      b.onclick = function () {
        var a = b.dataset.act;
        if (a === 'prev' && cur > 0) cur--;
        else if (a === 'next') { if (cur < N - 1) cur++; }
        else if (a === 'clear') ans[cur] = -1;
        else if (a === 'mark') { mark[cur] = !mark[cur]; if (cur < N - 1) cur++; }
        else if (a === 'submit') { var un = N - ans.filter(function (x) { return x >= 0; }).length; if (!confirm('Submit the test?' + (un ? '\n' + un + ' question(s) not answered.' : ''))) return; finish(); return; }
        render();
      };
    });
  }
  function finish() {
    clearInterval(timer); var c = 0, w = 0, sec = D.sections.map(function (s) { return { n: s.name, t: s.questions.length, c: 0, w: 0 }; });
    Q.forEach(function (q, i) { if (ans[i] < 0) return; if (ans[i] === q.a) { c++; sec[q.s].c++; } else { w++; sec[q.s].w++; } });
    var score = Math.round((c * POS - w * NEG) * 100) / 100, total = N * POS, pct = Math.max(0, Math.round(score / total * 100));
    var took = Math.round((Date.now() - started) / 1000), acc = c + w ? Math.round(c / (c + w) * 100) : 0;
    var b = best(); if (!b || score > b.score) setBest({ score: score, date: new Date().toLocaleDateString('en-IN') });
    var msg = pct >= 80 ? '🔥 Excellent! You are exam-ready.' : pct >= 60 ? '👏 Good job! A little more practice and you will top it.' : pct >= 40 ? '💪 Decent attempt. Revise the solutions below and try again.' : '📚 Keep practising – go through every solution below.';
    var share = encodeURIComponent('I scored ' + score + '/' + total + ' in "' + D.title + '" on Employment Junction 🎯 Try this free mock test: ' + (D.url || location.href));
    root.innerHTML = '<div class="ejq-card ejq-res"><div class="ejq-badge">📊 RESULT</div><h2 class="ejq-title">' + esc(D.title) + '</h2>' +
      '<div class="ejq-ring" style="--p:' + pct + '"><div><b>' + score + '</b><span>/ ' + total + '</span></div></div><p class="ejq-msg">' + msg + '</p>' +
      '<div class="ejq-stats"><div class="g"><b>' + c + '</b><span>Correct</span></div><div class="r"><b>' + w + '</b><span>Wrong</span></div><div><b>' + (N - c - w) + '</b><span>Skipped</span></div><div><b>' + acc + '%</b><span>Accuracy</span></div><div><b>' + fmt(took) + '</b><span>Time</span></div></div>' +
      (sec.length > 1 ? '<table class="ejq-sectab"><tr><th>Section</th><th>Correct</th><th>Wrong</th><th>Score</th></tr>' + sec.map(function (s) { return '<tr><td>' + esc(s.n) + '</td><td>' + s.c + '/' + s.t + '</td><td>' + s.w + '</td><td>' + (Math.round((s.c * POS - s.w * NEG) * 100) / 100) + '</td></tr>'; }).join('') + '</table>' : '') +
      '<div class="ejq-actions"><button class="ejq-btn ejq-again">↻ Retake Test</button><a class="ejq-btn ejq-wa" href="https://wa.me/?text=' + share + '" target="_blank" rel="noopener">Share on WhatsApp</a></div>' +
      (D.next && D.next.length ? '<div class="ejq-next"><b>Next tests for you:</b>' + D.next.map(function (n) { return '<a href="' + n.u + '">' + esc(n.t) + ' →</a>'; }).join('') + '</div>' : '') +
      '<h3 class="ejq-solh">Solutions</h3><div class="ejq-sol">' + Q.map(function (q, i) {
        var st = ans[i] < 0 ? 'sk' : (ans[i] === q.a ? 'ok' : 'no');
        return '<div class="ejq-si ' + st + '"><p><b>Q' + (i + 1) + '.</b> ' + esc(q.q) + '</p><ul>' + q.o.map(function (o, j) { return '<li class="' + (j === q.a ? 'right' : (j === ans[i] ? 'wrong' : '')) + '">' + 'ABCD'[j] + '. ' + esc(o) + '</li>'; }).join('') + '</ul>' +
          (q.e ? '<p class="ejq-exp">💡 ' + esc(q.e) + '</p>' : '') + '</div>';
      }).join('') + '</div></div>';
    root.querySelector('.ejq-again').onclick = function () { ans.fill(-1); mark.fill(false); seen.fill(false); cur = 0; left = D.duration * 60; start(); };
    root.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  start();
})();
