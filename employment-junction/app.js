(function () {
  "use strict";
  const CFG = window.EJ_CONFIG || {};
  const JOBS = (window.EJ_JOBS || []).slice().sort((a, b) => (b.posted || "").localeCompare(a.posted || ""));

  const TYPES = {
    "": "Sabhi",
    job: "Latest Jobs",
    admit: "Admit Card",
    result: "Result",
    answer: "Answer Key",
    syllabus: "Syllabus"
  };
  const QUALS = ["10th", "12th", "ITI", "Diploma", "Graduate", "Post Graduate"];

  const state = { type: "", q: "", category: "", st: "", qual: "" };
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const today = new Date(new Date().toDateString());
  const parse = (d) => (d ? new Date(d + "T00:00:00") : null);
  const fmt = (d) => (d ? parse(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—");
  const daysLeft = (d) => (d ? Math.round((parse(d) - today) / 86400000) : null);
  const isNew = (j) => j.posted && (today - parse(j.posted)) / 86400000 <= 3;
  const safeUrl = (u) => (/^https?:\/\//i.test(u || "") ? u : "#");

  // ---- Config links ----
  const waNum = (CFG.whatsappNumber || "").replace(/\D/g, "");
  $("waLink").href = safeUrl(CFG.whatsappChannel);
  $("tgLink").href = safeUrl(CFG.telegram);
  $("igLink").href = safeUrl(CFG.instagram);
  $("year").textContent = new Date().getFullYear();
  $("contactList").innerHTML = [
    CFG.instagram && `<li>📸 <a href="${esc(safeUrl(CFG.instagram))}" target="_blank" rel="noopener">@employmentjunction.in</a></li>`,
    waNum && `<li>💬 <a href="https://wa.me/${waNum}" target="_blank" rel="noopener">WhatsApp: +${esc(waNum)}</a></li>`,
    CFG.email && `<li>✉️ <a href="mailto:${esc(CFG.email)}">${esc(CFG.email)}</a></li>`,
    CFG.city && `<li>📍 ${esc(CFG.city)}</li>`
  ].filter(Boolean).join("");

  $("contactForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const text = `Namaste Employment Junction,\nNaam: ${f.get("name")}\nSawal: ${f.get("msg")}`;
    window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  });

  // ---- Filters ----
  const uniq = (k) => [...new Set(JOBS.map((j) => j[k]).filter(Boolean))].sort();
  const fill = (sel, items) => items.forEach((v) => sel.insertAdjacentHTML("beforeend", `<option>${esc(v)}</option>`));
  fill($("categoryFilter"), uniq("category"));
  fill($("stateFilter"), uniq("state").filter((s) => s !== "All India"));
  fill($("qualFilter"), QUALS);

  $("tabs").innerHTML = Object.entries(TYPES)
    .map(([k, v]) => `<button role="tab" data-type="${k}" aria-selected="${k === ""}">${v}</button>`)
    .join("");

  $("quickTags").innerHTML = ["SSC", "Railway", "Bank", "Police", "Defence", "Teaching"]
    .map((c) => `<button type="button" data-cat="${c}">${c}</button>`).join("");

  // ---- Stats & ticker ----
  const openJobs = JOBS.filter((j) => j.type === "job" && (daysLeft(j.lastDate) ?? 0) >= 0);
  const totalPosts = openJobs.reduce((s, j) => s + (j.posts || 0), 0);
  $("stats").innerHTML = [
    [openJobs.length, "Active Bhartiyan"],
    [totalPosts.toLocaleString("en-IN") + "+", "Total Posts"],
    [JOBS.filter((j) => j.type === "admit").length, "Admit Cards"],
    [JOBS.filter((j) => j.type === "result").length, "Results"]
  ].map(([n, l]) => `<div class="stat"><strong>${n}</strong><span>${l}</span></div>`).join("");

  const tick = JOBS.slice(0, 8).map((j) => `<a href="#updates" data-id="${esc(j.id)}">${esc(j.title)}</a>`).join("<span class='dot'>•</span>");
  $("ticker").innerHTML = tick + "<span class='dot'>•</span>" + tick;

  // ---- Render ----
  function matches(j) {
    if (state.type && j.type !== state.type) return false;
    if (state.category && j.category !== state.category) return false;
    if (state.st && j.state !== state.st && j.state !== "All India") return false;
    if (state.qual && j.qualification !== state.qual) return false;
    if (state.q) {
      const hay = [j.title, j.org, j.category, j.state, j.qualification].join(" ").toLowerCase();
      return state.q.toLowerCase().split(/\s+/).every((w) => hay.includes(w.replace("pass", "").trim()));
    }
    return true;
  }

  function deadlineBadge(j) {
    const d = daysLeft(j.lastDate);
    if (d === null) return "";
    if (d < 0) return `<span class="badge closed">Closed</span>`;
    if (d <= 7) return `<span class="badge urgent">${d === 0 ? "Aaj last date" : d + " din baaki"}</span>`;
    return `<span class="badge open">${d} din baaki</span>`;
  }

  function card(j) {
    return `<article class="card" data-id="${esc(j.id)}" tabindex="0">
      <div class="card-top">
        <span class="chip chip-${j.type}">${TYPES[j.type]}</span>
        ${isNew(j) ? '<span class="badge new">NEW</span>' : ""}
        ${j.sample ? '<span class="badge sample" title="Demo entry – asli data se replace karein">Sample</span>' : ""}
      </div>
      <h3>${esc(j.title)}</h3>
      <p class="org">${esc(j.org)}</p>
      <ul class="meta">
        ${j.posts ? `<li><b>Posts</b>${j.posts.toLocaleString("en-IN")}</li>` : ""}
        <li><b>Yogyata</b>${esc(j.qualification)}</li>
        <li><b>${j.lastDate ? "Last Date" : "Updated"}</b>${fmt(j.lastDate || j.posted)}</li>
        <li><b>State</b>${esc(j.state)}</li>
      </ul>
      <div class="card-foot">${deadlineBadge(j)}<button class="link-btn">Details →</button></div>
    </article>`;
  }

  function render() {
    const list = JOBS.filter(matches);
    $("jobGrid").innerHTML = list.length
      ? list.map(card).join("")
      : `<p class="empty">Koi update nahi mili. Filter badal kar dekhein.</p>`;
    $("resultCount").textContent = `${list.length} update${list.length === 1 ? "" : "s"} mil gaye`;
    document.querySelectorAll("#tabs button").forEach((b) => b.setAttribute("aria-selected", b.dataset.type === state.type));
  }

  function boards() {
    [["boardAdmit", "admit"], ["boardResult", "result"], ["boardAnswer", "answer"]].forEach(([id, t]) => {
      const items = JOBS.filter((j) => j.type === t).slice(0, 6);
      $(id).querySelector("ul").innerHTML = items.length
        ? items.map((j) => `<li><a href="#" data-id="${esc(j.id)}">${esc(j.title)}</a>${isNew(j) ? ' <span class="badge new">NEW</span>' : ""}</li>`).join("")
        : "<li>Jaldi aa raha hai…</li>";
    });
  }

  // ---- Modal ----
  function openModal(id) {
    const j = JOBS.find((x) => x.id === id);
    if (!j) return;
    const rows = [
      ["Department", j.org], ["Category", j.category], ["State", j.state],
      ["Total Posts", j.posts && j.posts.toLocaleString("en-IN")], ["Qualification", j.qualification],
      ["Age Limit", j.age], ["Application Fee", j.fee],
      ["Start Date", j.startDate && fmt(j.startDate)], ["Last Date", j.lastDate && fmt(j.lastDate)],
      ["Update Date", fmt(j.posted)]
    ].filter(([, v]) => v);
    const share = encodeURIComponent(`${j.title} – details: ${location.href.split("#")[0]}#job=${j.id}`);
    $("modalBody").innerHTML = `
      <span class="chip chip-${j.type}">${TYPES[j.type]}</span>
      <h2 id="modalTitle">${esc(j.title)}</h2>
      ${j.sample ? '<p class="sample-note">⚠️ Ye sample entry hai – asli notification se replace karein.</p>' : ""}
      <table class="detail">${rows.map(([k, v]) => `<tr><th>${k}</th><td>${esc(v)}</td></tr>`).join("")}</table>
      <div class="modal-actions">
        <a class="btn btn-primary" href="${esc(safeUrl(j.officialLink))}" target="_blank" rel="noopener">Official Website</a>
        <a class="btn btn-wa" href="https://wa.me/?text=${share}" target="_blank" rel="noopener">Share on WhatsApp</a>
      </div>
      <p class="small">Apply karne se pehle official notification dhyan se padhein.</p>`;
    $("modal").hidden = false;
    history.replaceState(null, "", `#job=${j.id}`);
    $("modalClose").focus();
  }
  function closeModal() {
    $("modal").hidden = true;
    history.replaceState(null, "", location.pathname + location.search);
  }

  // ---- Events ----
  document.addEventListener("click", (e) => {
    const idEl = e.target.closest("[data-id]");
    if (idEl && !e.target.closest("#ticker")) { e.preventDefault(); openModal(idEl.dataset.id); return; }
    if (idEl) { openModal(idEl.dataset.id); return; }
    const t = e.target.closest("[data-type]");
    if (t) { state.type = t.dataset.type; render(); closeMenu(); }
    const c = e.target.closest("[data-cat]");
    if (c) { state.category = c.dataset.cat; $("categoryFilter").value = c.dataset.cat; render(); $("updates").scrollIntoView({ behavior: "smooth" }); }
    if (e.target === $("modal")) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !$("modal").hidden) closeModal();
    if (e.key === "Enter" && e.target.classList.contains("card")) openModal(e.target.dataset.id);
  });
  $("modalClose").addEventListener("click", closeModal);
  $("searchForm").addEventListener("submit", (e) => { e.preventDefault(); $("updates").scrollIntoView({ behavior: "smooth" }); });
  $("searchInput").addEventListener("input", (e) => { state.q = e.target.value.trim(); render(); });
  $("categoryFilter").addEventListener("change", (e) => { state.category = e.target.value; render(); });
  $("stateFilter").addEventListener("change", (e) => { state.st = e.target.value; render(); });
  $("qualFilter").addEventListener("change", (e) => { state.qual = e.target.value; render(); });

  const menuBtn = $("menuBtn");
  function closeMenu() { $("nav").classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); }
  menuBtn.addEventListener("click", () => {
    const open = $("nav").classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });

  render();
  boards();
  const m = location.hash.match(/^#job=(.+)$/);
  if (m) openModal(decodeURIComponent(m[1]));
})();
