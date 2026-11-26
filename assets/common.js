// Dùng chung cho mọi trang: giao diện câu hỏi, giọng đọc, pháo hoa, lưu kết quả (máy + Supabase).
(function () {
  "use strict";
  var CFG = window.KCONFIG || {};

  var SKILLS = {
    subject:   "Chủ ngữ",
    verb_pred: "Động từ & vị ngữ",
    to_be:     "am / is / are",
    s_es:      "Thêm s / es",
    negative:  "Phủ định don't / doesn't",
    question:  "Câu hỏi Do / Does"
  };
  var SKILL_ORDER = ["subject", "verb_pred", "to_be", "s_es", "negative", "question"];

  // ---------- small helpers ----------
  function lsGet(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  function norm(s) {
    return String(s == null ? "" : s).toLowerCase().replace(/[‘’`´]/g, "'")
      .replace(/[.?!,;:]/g, " ").replace(/\s+/g, " ").trim();
  }
  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === "class") e.className = attrs[k];
      else if (k === "text") e.textContent = attrs[k];
      else if (k === "html") e.innerHTML = attrs[k];
      else if (k.indexOf("on") === 0) e.addEventListener(k.slice(2), attrs[k]);
      else e.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c) e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return e;
  }

  // ---------- speech ----------
  var SPEAK_SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 4V5L7 9H3z"/><path d="M16.5 12a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z"/><path d="M14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>';
  var canSpeak = "speechSynthesis" in window, enVoice = null;
  function pickVoice() {
    var vs = speechSynthesis.getVoices();
    enVoice = vs.filter(function (v) { return /^en(-|_)US/i.test(v.lang); })[0] ||
              vs.filter(function (v) { return /^en/i.test(v.lang); })[0] || null;
  }
  if (canSpeak) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  function speak(text) {
    if (!canSpeak) return;
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(String(text).replace(/→/g, ",").replace(/\.\.\./g, " blank "));
    u.lang = "en-US"; u.rate = 0.85; if (enVoice) u.voice = enVoice;
    speechSynthesis.speak(u);
  }
  function sayBtn(getText) {
    if (!canSpeak) return null;
    return el("button", { class: "say", type: "button", title: "Nghe", "aria-label": "Nghe", html: SPEAK_SVG,
      onclick: function () { speak(getText()); } });
  }

  // ---------- blanks (choice / input) ----------
  // part = {c:[...], a:"x"} choice | {i:["accepted"...], w:1} input. Returns {node, value(), blank}
  function niceAnswer(s) {
    s = s.replace(/\bi\b/g, "I").replace(/\btv\b/g, "TV").replace(/\btom\b/g, "Tom").replace(/\blan\b/g, "Lan")
         .replace(/\bmai\b/g, "Mai").replace(/\bhue\b/g, "Hue");
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  function makeBlank(state, key, part, onChange) {
    if (part.c) {
      var box = el("span", { class: "choices" });
      var fix = el("span", { class: "fix" });
      var btns = part.c.map(function (opt) {
        var b = el("button", { class: "ch", text: opt, type: "button", onclick: function () {
          state[key] = opt; if (onChange) onChange();
          btns.forEach(function (x) { x.classList.toggle("sel", x === b); x.classList.remove("ok", "bad"); });
        } });
        if (state[key] === opt) b.classList.add("sel");
        box.appendChild(b);
        return b;
      });
      return {
        node: el("span", { style: "display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap" }, [box, fix]),
        value: function () { return state[key] || "..."; },
        blank: {
          get: function () { return state[key] || ""; },
          mark: function (ok) { btns.forEach(function (x) { if (x.classList.contains("sel")) x.classList.add(ok ? "ok" : "bad"); }); },
          clear: function () { btns.forEach(function (x) { x.classList.remove("ok", "bad"); }); fix.textContent = ""; },
          reveal: function () { fix.textContent = "→ " + part.a; },
          ok: function (v) { return v === part.a; }
        }
      };
    }
    var inp = el("input", { class: "t" + (part.w ? " wide" : ""), type: "text", autocomplete: "off",
      autocapitalize: "off", spellcheck: "false" });
    inp.value = state[key] || "";
    inp.addEventListener("input", function () { state[key] = inp.value; inp.classList.remove("ok", "bad"); if (onChange) onChange(); });
    var fix2 = el("span", { class: "fix" });
    var accepted = part.i.map(norm);
    return {
      node: el("span", { style: "display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap" + (part.w ? ";flex:1" : "") }, [inp, fix2]),
      value: function () { return inp.value || "..."; },
      blank: {
        get: function () { return inp.value; },
        mark: function (ok) { inp.classList.add(ok ? "ok" : "bad"); },
        clear: function () { inp.classList.remove("ok", "bad"); fix2.textContent = ""; },
        reveal: function () { fix2.textContent = "→ " + niceAnswer(part.i[0]); },
        ok: function (v) { return accepted.indexOf(norm(v)) >= 0; }
      }
    };
  }

  // ---------- celebration ----------
  var cv, ctx, fx = [], running = false;
  function burst() {
    if (!cv) {
      cv = document.getElementById("fx");
      if (!cv) { cv = el("canvas", { class: "stars", id: "fx" }); document.body.appendChild(cv); }
      ctx = cv.getContext("2d");
    }
    cv.width = innerWidth; cv.height = innerHeight;
    var cols = ["#FFC400", "#3476F0", "#EE4E38", "#22A35C", "#E83E8C", "#8B52D6"];
    for (var i = 0; i < 120; i++) fx.push({ x: innerWidth / 2, y: innerHeight * 0.45, vx: (Math.random() - 0.5) * 16,
      vy: -Math.random() * 14 - 4, r: 5 + Math.random() * 7, c: cols[i % cols.length], a: Math.random() * 6, life: 90 + Math.random() * 40 });
    if (!running) { running = true; requestAnimationFrame(tick); }
  }
  function tick() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    fx = fx.filter(function (p) { return p.life > 0; });
    fx.forEach(function (p) {
      p.x += p.vx; p.y += p.vy; p.vy += 0.4; p.vx *= 0.99; p.a += 0.1; p.life--;
      ctx.globalAlpha = Math.min(1, p.life / 30); ctx.fillStyle = p.c;
      ctx.beginPath();
      for (var i = 0; i < 10; i++) { var rr = i % 2 ? p.r * 0.45 : p.r, an = p.a + i * Math.PI / 5; ctx.lineTo(p.x + rr * Math.cos(an), p.y + rr * Math.sin(an)); }
      ctx.closePath(); ctx.fill();
    });
    ctx.globalAlpha = 1;
    if (fx.length) requestAnimationFrame(tick); else { running = false; ctx.clearRect(0, 0, cv.width, cv.height); }
  }

  // ---------- results store ----------
  var SESSION = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  var store = {
    settings: function () {
      var s = lsGet("kevin-settings", {});
      return { learner: s.learner || CFG.defaultLearner || "Kevin", pin: s.pin || "", pinBad: !!s.pinBad };
    },
    saveSettings: function (learner, pin, pinBad) { lsSet("kevin-settings", { learner: learner, pin: pin, pinBad: !!pinBad }); },
    log: function () { return lsGet("kevin-log", []); },
    pending: function () { return lsGet("kevin-queue", []).length; },

    // rows: [{q, skill, a, ok, mode}] — records only answers that changed since the last record of that question
    record: function (rows) {
      var last = lsGet("kevin-last", {}), count = lsGet("kevin-count", {});
      var log = lsGet("kevin-log", []), queue = lsGet("kevin-queue", []);
      var now = new Date().toISOString(), added = 0;
      rows.forEach(function (r) {
        var a = String(r.a == null ? "" : r.a).trim();
        if (!a || last[r.q] === a) return;
        last[r.q] = a;
        count[r.q] = (count[r.q] || 0) + 1;
        var row = { q: r.q, skill: r.skill, a: a.slice(0, 300), ok: !!r.ok, mode: r.mode || "main", n: count[r.q], ts: now, session: SESSION };
        log.push(row); queue.push(row); added++;
      });
      if (log.length > 5000) log = log.slice(-5000);
      if (queue.length > 3000) queue = queue.slice(-3000);
      lsSet("kevin-last", last); lsSet("kevin-count", count); lsSet("kevin-log", log); lsSet("kevin-queue", queue);
      if (added) store.sync();
      return added;
    },

    syncing: false,
    sync: function () {
      var s = store.settings();
      if (!s.pin || s.pinBad || store.syncing || !CFG.supabaseUrl) return Promise.resolve(null);
      var queue = lsGet("kevin-queue", []);
      if (!queue.length) return Promise.resolve(0);
      var batch = queue.slice(0, 200);
      store.syncing = true;
      return rpc("record_attempts", { p_learner: s.learner, p_pin: s.pin, p_rows: batch }).then(function (n) {
        store.syncing = false;
        if (typeof n === "number" && n >= 0) {
          var q = lsGet("kevin-queue", []);
          lsSet("kevin-queue", q.slice(batch.length));
          if (q.length > batch.length) return store.sync();
          return n;
        }
        if (n === -1) store.saveSettings(s.learner, s.pin, true);
        return n;
      }, function () { store.syncing = false; return null; });
    },

    serverSummary: function () {
      var s = store.settings();
      if (!s.pin) return Promise.resolve({ error: "nopin" });
      return rpc("get_summary", { p_learner: s.learner, p_pin: s.pin });
    },

    localSummary: function () {
      var skills = {};
      store.log().forEach(function (r) {
        var k = skills[r.skill] || (skills[r.skill] = { first_total: 0, first_correct: 0, practice_total: 0, practice_correct: 0, recent_total: 0, recent_correct: 0 });
        if (r.mode === "main" && r.n === 1) { k.first_total++; if (r.ok) k.first_correct++; }
        if (r.mode === "practice") {
          k.practice_total++; if (r.ok) k.practice_correct++;
          if (Date.now() - new Date(r.ts).getTime() < 7 * 864e5) { k.recent_total++; if (r.ok) k.recent_correct++; }
        }
      });
      return { skills: skills };
    },

    // which questions have ever been answered correctly (for picking practice items)
    everCorrect: function () {
      var m = {};
      store.log().forEach(function (r) { if (r.ok) m[r.q] = 1; });
      return m;
    }
  };

  // weak = first-attempt accuracy below threshold, unless recent practice is already good
  function skillStatus(s) {
    var th = CFG.weakThreshold || 0.8;
    if (!s || (!s.first_total && !s.practice_total)) return { level: "none", pct: null };
    var first = s.first_total ? s.first_correct / s.first_total : null;
    var recent = s.recent_total >= 8 ? s.recent_correct / s.recent_total : null;
    var pct = first;
    if (pct === null) pct = s.practice_total ? s.practice_correct / s.practice_total : null;
    var improved = recent !== null && recent >= th;
    var level = pct === null ? "none" : (pct >= th || improved) ? "good" : (pct >= 0.5 ? "mid" : "weak");
    return { level: level, pct: pct, recent: recent, improved: improved && pct < th };
  }

  function rpc(name, body) {
    return fetch(CFG.supabaseUrl + "/rest/v1/rpc/" + name, {
      method: "POST",
      headers: { "apikey": CFG.supabaseKey, "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); });
  }

  window.addEventListener("online", function () { store.sync(); });

  window.K = { SKILLS: SKILLS, SKILL_ORDER: SKILL_ORDER, el: el, norm: norm, speak: speak, sayBtn: sayBtn,
    makeBlank: makeBlank, burst: burst, store: store, skillStatus: skillStatus, lsGet: lsGet, lsSet: lsSet };

  // try to flush anything queued from an earlier visit
  setTimeout(function () { store.sync(); }, 800);
})();
