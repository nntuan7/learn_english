// Luyện thêm theo mảng – lấy câu từ ngân hàng, ưu tiên câu chưa làm đúng
(function () {
  "use strict";
  var el = K.el, BANK = window.KBANK, SET_SIZE = 8;
  var params = new URLSearchParams(location.search);
  var summary = K.store.localSummary();

  function weakest() {
    var best = null, bestPct = 2;
    K.SKILL_ORDER.forEach(function (k) {
      var st = K.skillStatus(summary.skills[k]);
      if (st.pct !== null && st.level !== "good" && st.pct < bestPct) { best = k; bestPct = st.pct; }
    });
    return best || K.SKILL_ORDER[0];
  }
  var skill = BANK[params.get("skill")] ? params.get("skill") : weakest();

  // skill chooser
  var chips = document.getElementById("skills");
  K.SKILL_ORDER.forEach(function (k) {
    var st = K.skillStatus(summary.skills[k]);
    var dot = { good: "var(--rest)", mid: "var(--do)", weak: "var(--no)", none: "#C9C2B0" }[st.level];
    var a = el("a", { class: "skill-chip" + (k === skill ? " on" : ""), href: "?skill=" + k }, [
      el("span", { class: "dot", style: "background:" + dot }), K.SKILLS[k]]);
    chips.appendChild(a);
  });
  document.getElementById("skill-title").textContent = K.SKILLS[skill];

  var area = document.getElementById("set");
  var scoreEl = document.getElementById("score");
  var blanks, state;

  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  function newSet() {
    var items = BANK[skill];
    var ever = K.store.everCorrect();
    var idx = items.map(function (_, i) { return i; });
    var fresh = shuffle(idx.filter(function (i) { return !ever["p-" + skill + "-" + (i + 1)]; }));
    var done = shuffle(idx.filter(function (i) { return ever["p-" + skill + "-" + (i + 1)]; }));
    var pick = fresh.concat(done).slice(0, SET_SIZE);
    shuffle(pick);
    render(pick);
  }

  function render(pick) {
    area.innerHTML = ""; scoreEl.textContent = ""; blanks = []; state = {};
    var items = BANK[skill];
    pick.forEach(function (i, r) {
      var parts = items[i];
      var q = el("div", { class: "q" }, [el("span", { class: "qn", text: (r + 1) + "." })]);
      var getters = [];
      parts.forEach(function (p, j) {
        if (typeof p === "string") {
          var m = p.match(/^\[([^\]]+)\]\s*(.*)$/);
          if (m) { q.appendChild(el("span", { class: "hint", text: m[1] })); p = m[2]; }
          if (p) q.appendChild(el("span", { class: "en", text: p }));
          var said = p.replace(/→\s*$/, "");
          getters.push(function () { return said; });
        } else {
          var b = K.makeBlank(state, r + "-" + j, p);
          b.blank.q = "p-" + skill + "-" + (i + 1);
          blanks.push(b.blank);
          q.appendChild(b.node);
          getters.push(b.value);
        }
      });
      var sb = K.sayBtn(function () { return getters.map(function (g) { return g(); }).join(""); });
      if (sb) q.insertBefore(sb, q.children[1]);
      area.appendChild(q);
    });
  }

  document.getElementById("check").addEventListener("click", function () {
    var n = 0, rows = [], seen = {};
    blanks.forEach(function (b) {
      b.clear();
      var v = b.get(), answered = v !== "";
      var ok = answered && b.ok(v);
      if (answered) b.mark(ok);
      if (ok) n++;
      // one record per question: a question with 2 blanks counts as correct only if both are
      if (!seen[b.q]) seen[b.q] = { q: b.q, skill: skill, a: [], ok: true, answered: true, mode: "practice" };
      seen[b.q].a.push(v); seen[b.q].ok = seen[b.q].ok && ok; seen[b.q].answered = seen[b.q].answered && answered;
    });
    for (var k in seen) if (seen[k].answered) rows.push({ q: k, skill: skill, a: seen[k].a.join(" | "), ok: seen[k].ok, mode: "practice" });
    K.store.record(rows);
    scoreEl.textContent = "Đúng " + n + " / " + blanks.length + (n === blanks.length ? " – Tuyệt vời!" : "");
    if (n === blanks.length) K.burst();
  });
  document.getElementById("reveal").addEventListener("click", function () {
    blanks.forEach(function (b) { var v = b.get(); if (!(v !== "" && b.ok(v))) b.reveal(); });
  });
  document.getElementById("again").addEventListener("click", function () { newSet(); window.scrollTo({ top: 0, behavior: "smooth" }); });

  newSet();
})();
