// Bài tập tương tác – Kevin học tiếng Anh
(function () {
  "use strict";

  // ---------- data ----------
  // Part types: "text" | {c:[options], a:"answer"} (choice) | {i:["accepted", ...], w:1?} (input)
  var EX = [
    {
      title: "Tìm chủ ngữ, động từ, vị ngữ",
      sub: "Gõ vào ô trống. Câu 1 đã làm mẫu.",
      type: "table",
      head: [["Câu", "#8A8FA3"], ["Chủ ngữ (Ai? Cái gì?)", "var(--subj)"], ["Động từ", "var(--verb)"], ["Vị ngữ", "var(--pred)"]],
      rows: [
        ["1. I play football.", "I", "play", "play football"],
        ["2. The cat drinks milk.", { i: ["the cat"] }, { i: ["drinks"] }, { i: ["drinks milk"] }],
        ["3. My mom cooks dinner.", { i: ["my mom"] }, { i: ["cooks"] }, { i: ["cooks dinner"] }],
        ["4. They read books.", { i: ["they"] }, { i: ["read"] }, { i: ["read books"] }],
        ["5. Tom rides a bike.", { i: ["tom"] }, { i: ["rides"] }, { i: ["rides a bike"] }],
        ["6. She is happy.", { i: ["she"] }, { i: ["is"] }, { i: ["is happy"] }],
        ["7. We are students.", { i: ["we"] }, { i: ["are"] }, { i: ["are students"] }]
      ]
    },
    {
      title: "Xếp chủ ngữ vào đúng nhóm",
      sub: "Bấm Nhóm 1 (I, you, we, they) hoặc Nhóm đặc biệt (he, she, it) cho từng từ.",
      type: "sort",
      groups: ["Nhóm 1", "Đặc biệt"],
      words: [["I", 0], ["he", 1], ["we", 0], ["she", 1], ["they", 0], ["it", 1], ["you", 0], ["Tom", 1],
              ["my mom", 1], ["the dog", 1], ["Tom and Mary", 0], ["the birds", 0]]
    },
    {
      title: "Chọn am / is / are",
      sub: "Bấm vào từ đúng.",
      type: "list",
      items: [
        ["I ", { c: ["am", "is", "are"], a: "am" }, " a student."],
        ["She ", { c: ["am", "is", "are"], a: "is" }, " my sister."],
        ["They ", { c: ["am", "is", "are"], a: "are" }, " in the park."],
        ["The cat ", { c: ["am", "is", "are"], a: "is" }, " black."],
        ["We ", { c: ["am", "is", "are"], a: "are" }, " happy."],
        ["My dad ", { c: ["am", "is", "are"], a: "is" }, " a doctor."],
        ["Tom and Mary ", { c: ["am", "is", "are"], a: "are" }, " friends."],
        ["It ", { c: ["am", "is", "are"], a: "is" }, " a big apple."]
      ]
    },
    {
      title: "Thêm s / es cho động từ",
      sub: "a) Viết động từ khi đi với he / she / it.",
      type: "table",
      head: [["Động từ", "#8A8FA3"], ["He / She / It + …", "var(--do)"], ["Động từ", "#8A8FA3"], ["He / She / It + …", "var(--do)"]],
      rows: [
        ["play", "plays", "watch", { i: ["watches"] }],
        ["like", { i: ["likes"] }, "wash", { i: ["washes"] }],
        ["go", { i: ["goes"] }, "do", { i: ["does"] }],
        ["read", { i: ["reads"] }, "swim", { i: ["swims"] }],
        ["eat", { i: ["eats"] }, "have", { i: ["has"] }]
      ],
      after: {
        sub: "b) Viết đúng dạng động từ trong ngoặc.",
        items: [
          ["My brother ", { i: ["watches"] }, " (watch) TV every evening."],
          ["I ", { i: ["go"] }, " (go) to school every day."],
          ["The dog ", { i: ["runs"] }, " (run) in the garden."],
          ["Lan ", { i: ["has"] }, " (have) a red bag."]
        ]
      }
    },
    {
      title: "Chọn don't hoặc doesn't",
      sub: "Bấm vào từ đúng.",
      type: "list",
      items: [
        ["I ", { c: ["don't", "doesn't"], a: "don't" }, " like snakes."],
        ["He ", { c: ["don't", "doesn't"], a: "doesn't" }, " play the piano."],
        ["We ", { c: ["don't", "doesn't"], a: "don't" }, " go to school on Sunday."],
        ["My cat ", { c: ["don't", "doesn't"], a: "doesn't" }, " eat carrots."],
        ["They ", { c: ["don't", "doesn't"], a: "don't" }, " watch TV in the morning."],
        ["Lan ", { c: ["don't", "doesn't"], a: "doesn't" }, " drink coffee."]
      ]
    },
    {
      title: "Chọn Do / Does và trả lời ngắn",
      sub: "Mỗi câu có 2 chỗ cần chọn.",
      type: "list",
      items: [
        [{ c: ["Do", "Does"], a: "Do" }, " you like ice cream? → Yes, I ", { c: ["do", "does", "don't", "doesn't"], a: "do" }, "."],
        [{ c: ["Do", "Does"], a: "Does" }, " she play badminton? → No, she ", { c: ["do", "does", "don't", "doesn't"], a: "doesn't" }, "."],
        [{ c: ["Do", "Does"], a: "Do" }, " they live in Hanoi? → Yes, they ", { c: ["do", "does", "don't", "doesn't"], a: "do" }, "."],
        [{ c: ["Do", "Does"], a: "Does" }, " your dad read books? → Yes, he ", { c: ["do", "does", "don't", "doesn't"], a: "does" }, "."],
        [{ c: ["Do", "Does"], a: "Does" }, " the dog sleep a lot? → No, it ", { c: ["do", "does", "don't", "doesn't"], a: "doesn't" }, "."],
        [{ c: ["Do", "Does"], a: "Do" }, " we have English today? → Yes, we ", { c: ["do", "does", "don't", "doesn't"], a: "do" }, "."]
      ]
    },
    {
      title: "Đổi câu sang phủ định và câu hỏi",
      sub: "Câu 1 đã làm mẫu. Nhớ: to be tự thêm not và tự lên đầu câu; động từ thường nhờ do / does.",
      type: "table",
      head: [["Câu khẳng định", "var(--rest)"], ["Phủ định (–)", "var(--no)"], ["Câu hỏi (?)", "var(--subj)"]],
      rows: [
        ["1. She is a teacher.", "She isn't a teacher.", "Is she a teacher?"],
        ["2. They are hungry.", { i: ["they aren't hungry", "they are not hungry"] }, { i: ["are they hungry"] }],
        ["3. I like milk.", { i: ["i don't like milk", "i do not like milk"] }, { i: ["do you like milk", "do i like milk"] }],
        ["4. He plays chess.", { i: ["he doesn't play chess", "he does not play chess"] }, { i: ["does he play chess"] }],
        ["5. The cat is small.", { i: ["the cat isn't small", "the cat is not small"] }, { i: ["is the cat small"] }]
      ]
    },
    {
      title: "Tìm lỗi sai và sửa lại",
      sub: "Mỗi câu có một lỗi. Gõ lại cả câu cho đúng.",
      type: "list",
      items: [
        ["She like cats. → ", { i: ["she likes cats"], w: 1 }],
        ["He doesn't likes milk. → ", { i: ["he doesn't like milk", "he does not like milk"], w: 1 }],
        ["They is my friends. → ", { i: ["they are my friends", "they're my friends"], w: 1 }],
        ["Do she play football? → ", { i: ["does she play football"], w: 1 }],
        ["I are happy. → ", { i: ["i am happy", "i'm happy"], w: 1 }],
        ["My mom watchs TV. → ", { i: ["my mom watches tv"], w: 1 }]
      ]
    },
    {
      title: "Viết về em và gia đình",
      sub: "Bài này không chấm điểm. Viết xong đọc cho bố mẹ nghe nhé!",
      type: "write",
      prompts: [
        "Một câu về em, dùng am. Ví dụ: I am eight years old.",
        "Một câu về một người trong nhà, dùng is.",
        "Một việc em làm hằng ngày, có every day.",
        "Một điều bố hoặc mẹ không thích, dùng doesn't.",
        "Một câu hỏi cho bạn, dùng Do you…?"
      ]
    }
  ];

  // ---------- helpers ----------
  var KEY = "cubong-baitap-v1";
  var state = {};
  try { state = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { state = {}; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

  function norm(s) {
    return String(s || "").toLowerCase().replace(/[‘’`´]/g, "'")
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
  var SPEAK_SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 4V5L7 9H3z"/><path d="M16.5 12a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z"/><path d="M14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>';
  var canSpeak = "speechSynthesis" in window;
  var enVoice = null;
  function pickVoice() {
    if (!canSpeak) return;
    var vs = speechSynthesis.getVoices();
    enVoice = vs.filter(function (v) { return /^en(-|_)US/i.test(v.lang); })[0] ||
              vs.filter(function (v) { return /^en/i.test(v.lang); })[0] || null;
  }
  if (canSpeak) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  function speak(text) {
    if (!canSpeak) return;
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text.replace(/→/g, ",").replace(/\.\.\./g, " blank "));
    u.lang = "en-US"; u.rate = 0.85; if (enVoice) u.voice = enVoice;
    speechSynthesis.speak(u);
  }
  function sayBtn(getText) {
    if (!canSpeak) return null;
    return el("button", { class: "say", title: "Nghe", "aria-label": "Nghe", html: SPEAK_SVG,
      onclick: function () { speak(getText()); } });
  }

  // registry of gradable blanks: {ex, id, get(), mark(ok), answer}
  var blanks = [];
  var exStats = {};

  function makeBlank(exi, id, part) {
    var key = exi + ":" + id;
    if (part.c) {
      var box = el("span", { class: "choices" });
      var btns = part.c.map(function (opt) {
        var b = el("button", { class: "ch", text: opt, type: "button", onclick: function () {
          state[key] = opt; save();
          btns.forEach(function (x) { x.classList.toggle("sel", x === b); x.classList.remove("ok", "bad"); });
        } });
        if (state[key] === opt) b.classList.add("sel");
        box.appendChild(b);
        return b;
      });
      var fix = el("span", { class: "fix" });
      var wrap = el("span", { style: "display:inline-flex;align-items:center;gap:6px" }, [box, fix]);
      blanks.push({
        ex: exi, get: function () { return state[key] || ""; },
        mark: function (ok) { btns.forEach(function (x) { if (x.classList.contains("sel")) x.classList.add(ok ? "ok" : "bad"); }); },
        clear: function () { btns.forEach(function (x) { x.classList.remove("ok", "bad"); }); fix.textContent = ""; },
        reveal: function () { fix.textContent = "→ " + part.a; },
        ok: function (v) { return v === part.a; }
      });
      return { node: wrap, value: function () { return state[key] || "..."; } };
    }
    var inp = el("input", { class: "t" + (part.w ? " wide" : ""), type: "text", autocomplete: "off",
      autocapitalize: "off", spellcheck: "false", value: state[key] || "" });
    inp.addEventListener("input", function () { state[key] = inp.value; save(); inp.classList.remove("ok", "bad"); });
    var fix2 = el("span", { class: "fix" });
    var wrap2 = el("span", { style: "display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap" + (part.w ? ";flex:1" : "") }, [inp, fix2]);
    var accepted = part.i.map(norm);
    blanks.push({
      ex: exi, get: function () { return inp.value; },
      mark: function (ok) { inp.classList.add(ok ? "ok" : "bad"); },
      clear: function () { inp.classList.remove("ok", "bad"); fix2.textContent = ""; },
      reveal: function () { fix2.textContent = "→ " + niceAnswer(part.i[0]); },
      ok: function (v) { return accepted.indexOf(norm(v)) >= 0; }
    });
    return { node: wrap2, value: function () { return inp.value || "..."; } };
  }
  function niceAnswer(s) {
    s = s.replace(/\bi\b/g, "I").replace(/\btv\b/g, "TV").replace(/\btom\b/g, "Tom").replace(/\blan\b/g, "Lan");
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function renderParts(exi, rowId, parts, container) {
    var getters = [];
    parts.forEach(function (p, j) {
      if (typeof p === "string") {
        container.appendChild(el("span", { class: "en", text: p }));
        getters.push(function () { return p; });
      } else {
        var b = makeBlank(exi, rowId + "-" + j, p);
        container.appendChild(b.node);
        getters.push(b.value);
      }
    });
    return function () { return getters.map(function (g) { return g(); }).join(""); };
  }

  function listItems(exi, items, card, prefix) {
    items.forEach(function (parts, r) {
      var q = el("div", { class: "q" }, [el("span", { class: "qn", text: (r + 1) + "." })]);
      var getText = renderParts(exi, prefix + r, parts, q);
      var sb = sayBtn(getText);
      if (sb) q.insertBefore(sb, q.children[1]);
      card.appendChild(q);
    });
  }

  function cellInput(exi, id, cell) {
    if (typeof cell === "string") return el("span", { class: "en", text: cell });
    return makeBlank(exi, id, cell).node;
  }

  // ---------- render ----------
  var app = document.getElementById("app");
  EX.forEach(function (ex, exi) {
    var card = el("section", { class: "card", id: "bai" + (exi + 1) });
    card.appendChild(el("div", { class: "ex-head" }, [
      el("span", { class: "ex-num", text: String(exi + 1) }), el("h2", { text: "Bài " + (exi + 1) + ". " + ex.title })]));
    card.appendChild(el("p", { class: "ex-sub", text: ex.sub }));

    if (ex.type === "table") {
      var tb = el("table", { class: "tb" });
      var tr = el("tr");
      ex.head.forEach(function (h) { tr.appendChild(el("th", { text: h[0], style: "background:" + h[1] })); });
      tb.appendChild(el("thead", null, [tr]));
      var body = el("tbody");
      ex.rows.forEach(function (row, r) {
        var tr2 = el("tr");
        row.forEach(function (cell, c) {
          var td = el("td");
          if (c === 0 && ex.rows[0].length && typeof cell === "string" && /^\d\./.test(cell)) {
            var sentence = cell.replace(/^\d\.\s*/, "");
            var sb = sayBtn(function () { return sentence; });
            td.appendChild(el("span", { style: "display:inline-flex;align-items:center;gap:8px" }, [sb, el("span", { class: "en", text: cell })]));
          } else td.appendChild(cellInput(exi, "t" + r + "-" + c, cell));
          tr2.appendChild(td);
        });
        body.appendChild(tr2);
      });
      tb.appendChild(body);
      card.appendChild(el("div", { style: "overflow-x:auto" }, [tb]));
      if (ex.after) {
        card.appendChild(el("p", { class: "ex-sub", style: "margin-top:12px", text: ex.after.sub }));
        listItems(exi, ex.after.items, card, "b");
      }
    } else if (ex.type === "list") {
      listItems(exi, ex.items, card, "l");
    } else if (ex.type === "sort") {
      var pool = el("div", { class: "pool" });
      ex.words.forEach(function (w, k) {
        var key = exi + ":s" + k;
        var btns = [];
        var fix = el("span", { class: "fix" });
        ex.groups.forEach(function (g, gi) {
          var b = el("button", { class: "ch", type: "button", text: g, onclick: function () {
            state[key] = gi; save();
            btns.forEach(function (x) { x.classList.toggle("sel", x === b); x.classList.remove("ok", "bad"); });
          } });
          if (state[key] === gi) b.classList.add("sel");
          btns.push(b);
        });
        var sb = sayBtn(function () { return w[0]; });
        pool.appendChild(el("span", { class: "word" }, [sb, el("span", { text: w[0] })].concat(btns).concat([fix])));
        blanks.push({
          ex: exi, get: function () { return state[key]; },
          mark: function (ok) { btns.forEach(function (x) { if (x.classList.contains("sel")) x.classList.add(ok ? "ok" : "bad"); }); },
          clear: function () { btns.forEach(function (x) { x.classList.remove("ok", "bad"); }); fix.textContent = ""; },
          reveal: function () { fix.textContent = "→ " + ex.groups[w[1]]; },
          ok: function (v) { return v === w[1]; }
        });
      });
      card.appendChild(pool);
    } else if (ex.type === "write") {
      ex.prompts.forEach(function (p, k) {
        var key = exi + ":w" + k;
        var ta = el("textarea", { rows: "1", placeholder: "Viết câu tiếng Anh ở đây…" });
        ta.value = state[key] || "";
        ta.addEventListener("input", function () { state[key] = ta.value; save(); });
        var sb = sayBtn(function () { return ta.value || "Write a sentence"; });
        card.appendChild(el("div", { class: "q", style: "display:block" }, [
          el("div", { style: "display:flex;gap:8px;align-items:center;margin-bottom:6px" },
            [el("span", { class: "qn", text: (k + 1) + "." }), el("span", { text: p }), sb]), ta]));
      });
      app.appendChild(card);
      return;
    }

    var scoreEl = el("span", { class: "score" });
    var foot = el("div", { class: "ex-foot" }, [
      el("button", { class: "btn green", type: "button", text: "Kiểm tra", onclick: function () { check(exi, scoreEl, true); } }),
      el("button", { class: "btn grey", type: "button", text: "Xem đáp án", onclick: function () { reveal(exi); } }),
      scoreEl
    ]);
    card.appendChild(foot);
    app.appendChild(card);
  });

  // ---------- grading ----------
  function check(exi, scoreEl, celebrate) {
    var mine = blanks.filter(function (b) { return b.ex === exi; });
    var n = 0;
    mine.forEach(function (b) {
      b.clear();
      var v = b.get();
      var answered = !(v === undefined || v === null || v === "");
      var ok = answered && b.ok(v);
      if (answered) b.mark(ok);
      if (ok) n++;
    });
    exStats[exi] = n;
    scoreEl.textContent = "Đúng " + n + " / " + mine.length + (n === mine.length ? " – Giỏi quá!" : "");
    state["_checked" + exi] = 1; save();
    updateTotal();
    if (celebrate && n === mine.length) burst();
  }
  function reveal(exi) {
    blanks.forEach(function (b) {
      if (b.ex !== exi) return;
      var v = b.get();
      if (!(v !== undefined && v !== "" && b.ok(v))) b.reveal();
    });
  }
  function updateTotal() {
    var total = blanks.length, n = 0;
    for (var k in exStats) n += exStats[k];
    document.getElementById("total").textContent = "Đúng: " + n + " / " + total;
  }
  // restore previous check results on reload
  EX.forEach(function (ex, exi) {
    if (state["_checked" + exi]) {
      var card = document.getElementById("bai" + (exi + 1));
      var s = card && card.querySelector(".ex-foot .score");
      if (s) check(exi, s, false);
    }
  });
  updateTotal();

  document.getElementById("reset").addEventListener("click", function () {
    if (!window.confirm || window.confirm("Xoá hết câu trả lời và làm lại từ đầu?")) {
      state = {}; save(); location.reload();
    }
  });
  document.getElementById("print").addEventListener("click", function () { window.print(); });

  // ---------- celebration ----------
  var cv = document.getElementById("fx"), ctx = cv.getContext("2d"), parts = [], running = false;
  function burst() {
    cv.width = innerWidth; cv.height = innerHeight;
    var cols = ["#FFC400", "#3476F0", "#EE4E38", "#22A35C", "#E83E8C", "#8B52D6"];
    for (var i = 0; i < 120; i++) parts.push({
      x: innerWidth / 2, y: innerHeight * 0.45, vx: (Math.random() - 0.5) * 16, vy: -Math.random() * 14 - 4,
      r: 5 + Math.random() * 7, c: cols[i % cols.length], a: Math.random() * 6, life: 90 + Math.random() * 40 });
    if (!running) { running = true; requestAnimationFrame(tick); }
  }
  function star(x, y, r, a) {
    ctx.beginPath();
    for (var i = 0; i < 10; i++) {
      var rr = i % 2 ? r * 0.45 : r, an = a + i * Math.PI / 5;
      ctx.lineTo(x + rr * Math.cos(an), y + rr * Math.sin(an));
    }
    ctx.closePath(); ctx.fill();
  }
  function tick() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    parts = parts.filter(function (p) { return p.life > 0; });
    parts.forEach(function (p) {
      p.x += p.vx; p.y += p.vy; p.vy += 0.4; p.vx *= 0.99; p.a += 0.1; p.life--;
      ctx.globalAlpha = Math.min(1, p.life / 30); ctx.fillStyle = p.c; star(p.x, p.y, p.r, p.a);
    });
    ctx.globalAlpha = 1;
    if (parts.length) requestAnimationFrame(tick); else { running = false; ctx.clearRect(0, 0, cv.width, cv.height); }
  }
})();
