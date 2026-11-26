// Học tương tác: Đoàn tàu câu · Máy làm câu · Thử thách nhanh
(function () {
  "use strict";
  var el = K.el;

  // ================= grammar engine =================
  // p: "I" -> am / do ; "p" -> are / do (you, we, they, plural) ; "3" -> is / does
  var SUBJECTS = [
    { t: "I", p: "I", vi: "tớ", ans: "you" },
    { t: "You", p: "p", vi: "bạn", ans: "I" },
    { t: "We", p: "p", vi: "chúng tớ", ans: "we" },
    { t: "They", p: "p", vi: "họ", ans: "they" },
    { t: "He", p: "3", vi: "anh ấy", ans: "he" },
    { t: "She", p: "3", vi: "cô ấy", ans: "she" },
    { t: "It", p: "3", vi: "nó", ans: "it" },
    { t: "Tom", p: "3", vi: "Tom", ans: "he", name: true },
    { t: "My mom", p: "3", vi: "mẹ tớ", ans: "she" },
    { t: "The dogs", p: "p", vi: "những chú chó", ans: "they" }
  ];
  var PREDS = [
    { v: "play", rest: "football", vi: "chơi bóng đá" },
    { v: "like", rest: "cats", vi: "thích mèo" },
    { v: "watch", rest: "TV", vi: "xem TV" },
    { v: "go", rest: "to school", vi: "đi học" },
    { v: "have", rest: "a dog", vi: "có một chú chó", viNeg: "không có một chú chó", viQ: "có một chú chó không" },
    { v: "eat", rest: "rice", vi: "ăn cơm" },
    { v: "do", rest: "homework", vi: "làm bài tập" },
    { v: "wash", rest: "the dishes", vi: "rửa bát" },
    { be: true, rest: "happy", vi: "vui" },
    { be: true, rest: "hungry", vi: "đói" },
    { be: true, rest: "at school", vi: "ở trường" }
  ];
  var FORMS = [["aff", "Khẳng định"], ["neg", "Phủ định"], ["q", "Câu hỏi"]];

  function sForm(v) {
    if (v === "have") return { base: "ha", end: "s", why: "have đổi thành has" };
    if (/(o|s|x|ch|sh)$/.test(v)) return { base: v, end: "es", why: v + " có đuôi " + v.match(/(o|s|x|ch|sh)$/)[1] + " nên thêm es" };
    return { base: v, end: "s", why: "thêm s" };
  }
  function beOf(s) { return s.p === "I" ? "am" : s.p === "3" ? "is" : "are"; }
  function lowerSubj(s) { return (s.p === "I" || s.name) ? s.t : s.t.charAt(0).toLowerCase() + s.t.slice(1); }
  function cap(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
  function groupName(s) { return s.p === "3" ? "nhóm đặc biệt (he, she, it)" : "nhóm 1 (I, you, we, they)"; }

  // returns {tokens:[[text, role]], text, answer, vi, why}
  // roles: subj, aux, verb, end (s/es), not, rest, punct
  function build(s, pr, form) {
    var T = [], why, answer = null, vi;
    var sv = s.vi, three = s.p === "3";
    if (pr.be) {
      var be = beOf(s);
      if (form === "aff") {
        T = [[s.t, "subj"], [" "], [be, "aux"], [" "], [pr.rest, "rest"], [".", "punct"]];
        why = s.t + " đi với " + be + ".";
        vi = cap(sv) + " " + pr.vi + ".";
      } else if (form === "neg") {
        var neg = be === "am" ? "am not" : be === "is" ? "isn't" : "aren't";
        T = [[s.t, "subj"], [" "], [neg, "not"], [" "], [pr.rest, "rest"], [".", "punct"]];
        why = "To be tự thêm not: " + (be === "am" ? "am not" : be + " not = " + neg) + ".";
        vi = cap(sv) + " không " + pr.vi + ".";
      } else {
        var ansBe = s.ans === "I" ? "am" : s.ans === "you" ? "are" : (s.ans === "he" || s.ans === "she" || s.ans === "it") ? "is" : "are";
        T = [[cap(be), "aux"], [" "], [lowerSubj(s), "subj"], [" "], [pr.rest, "rest"], ["?", "punct"]];
        why = "Câu hỏi với to be: đưa " + be + " lên đầu câu.";
        answer = ansBe === "am" ? "Yes, I am.  /  No, I'm not." :
          "Yes, " + s.ans + " " + ansBe + ".  /  No, " + s.ans + " " + (ansBe === "is" ? "isn't" : "aren't") + ".";
        vi = cap(sv) + " có " + pr.vi + " không?";
      }
    } else {
      var aux = three ? "does" : "do";
      if (form === "aff") {
        if (three) {
          var f = sForm(pr.v);
          T = [[s.t, "subj"], [" "], [f.base, "verb"], [f.end, "end"], [" "], [pr.rest, "rest"], [".", "punct"]];
          why = s.t + " thuộc " + groupName(s) + " → " + f.why + ".";
        } else {
          T = [[s.t, "subj"], [" "], [pr.v, "verb"], [" "], [pr.rest, "rest"], [".", "punct"]];
          why = s.t + " thuộc " + groupName(s) + " → động từ giữ nguyên.";
        }
        vi = cap(sv) + " " + pr.vi + ".";
      } else if (form === "neg") {
        var dn = three ? "doesn't" : "don't";
        T = [[s.t, "subj"], [" "], [dn, "not"], [" "], [pr.v, "verb"], [" "], [pr.rest, "rest"], [".", "punct"]];
        why = three ? "Nhóm đặc biệt dùng doesn't, động từ về nguyên mẫu (bỏ s)." : "Nhóm 1 dùng don't + động từ nguyên mẫu.";
        vi = cap(sv) + " " + (pr.viNeg || "không " + pr.vi) + ".";
      } else {
        T = [[cap(aux), "aux"], [" "], [lowerSubj(s), "subj"], [" "], [pr.v, "verb"], [" "], [pr.rest, "rest"], ["?", "punct"]];
        why = three ? "Nhóm đặc biệt hỏi bằng Does, động từ giữ nguyên." : "Nhóm 1 hỏi bằng Do.";
        var ansAux = (s.ans === "he" || s.ans === "she" || s.ans === "it") ? "does" : "do";
        answer = "Yes, " + s.ans + " " + ansAux + ".  /  No, " + s.ans + " " + ansAux + "n't.";
        vi = cap(sv) + " " + (pr.viQ || "có " + pr.vi + " không") + "?";
      }
    }
    var text = T.map(function (t) { return t[0]; }).join("");
    return { tokens: T, text: text, answer: answer, vi: vi, why: why };
  }

  function renderTokens(tokens, container) {
    container.innerHTML = "";
    tokens.forEach(function (t) {
      if (!t[1]) { container.appendChild(document.createTextNode(t[0])); return; }
      container.appendChild(el("span", { class: "tk tk-" + t[1], text: t[0] }));
    });
  }

  // ================= tabs =================
  var tabs = document.querySelectorAll(".tabs button");
  var panes = document.querySelectorAll(".pane");
  function show(i) {
    tabs.forEach(function (b, j) { b.classList.toggle("on", i === j); });
    panes.forEach(function (p, j) { p.hidden = i !== j; });
    try { history.replaceState(null, "", "#" + panes[i].id); } catch (e) {}
  }
  tabs.forEach(function (b, i) { b.addEventListener("click", function () { show(i); }); });
  var startIdx = [].map.call(panes, function (p) { return "#" + p.id; }).indexOf(location.hash);
  show(startIdx < 0 ? 0 : startIdx);

  // ================= 1. Train =================
  var TRAIN = [
    ["I", "play", "football.", "Tớ chơi bóng đá."],
    ["The cat", "drinks", "milk.", "Con mèo uống sữa."],
    ["My mom", "cooks", "dinner.", "Mẹ tớ nấu bữa tối."],
    ["Tom", "rides", "a bike.", "Tom đạp xe."],
    ["She", "is", "happy.", "Cô ấy vui."],
    ["The birds", "sing", "in the tree.", "Những chú chim hót trên cây."],
    ["We", "are", "students.", "Chúng tớ là học sinh."],
    ["My dad", "reads", "the news.", "Bố tớ đọc tin tức."]
  ];
  var SLOT_HINT = ["Toa 1 cần CHỦ NGỮ: Ai? Cái gì?", "Toa 2 cần ĐỘNG TỪ: làm gì? là gì?", "Toa 3 là PHẦN CÒN LẠI."];
  var ti = 0, filled = 0;
  var wagons = document.querySelectorAll("#train .wagon .slot");
  var cardsBox = document.getElementById("train-cards");
  var trainMsg = document.getElementById("train-msg");
  var predBr = document.getElementById("pred-bracket");
  var trainNext = document.getElementById("train-next");
  var trainCount = document.getElementById("train-count");

  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  function loadTrain() {
    var s = TRAIN[ti]; filled = 0;
    wagons.forEach(function (w) { w.textContent = "?"; w.classList.remove("full"); });
    predBr.classList.remove("show"); trainNext.hidden = true;
    trainMsg.textContent = "Bấm vào từng thẻ để xếp lên đúng toa nhé!"; trainMsg.className = "msg";
    trainCount.textContent = "Câu " + (ti + 1) + " / " + TRAIN.length;
    cardsBox.innerHTML = "";
    var order = shuffle([0, 1, 2]);
    if (order.join() === "0,1,2") order = [2, 0, 1];
    order.forEach(function (k) {
      var c = el("button", { class: "wcard", type: "button", text: s[k] });
      c.addEventListener("click", function () {
        if (k === filled) {
          wagons[k].textContent = s[k]; wagons[k].classList.add("full");
          c.classList.add("gone"); filled++;
          K.speak(s[k]);
          if (filled === 3) done();
          else { trainMsg.textContent = "Đúng rồi! " + SLOT_HINT[filled]; trainMsg.className = "msg good"; }
        } else {
          c.classList.remove("shake"); void c.offsetWidth; c.classList.add("shake");
          trainMsg.textContent = "Chưa đúng toa. " + SLOT_HINT[filled]; trainMsg.className = "msg bad";
        }
      });
      cardsBox.appendChild(c);
    });
  }
  function done() {
    var s = TRAIN[ti];
    predBr.classList.add("show");
    trainMsg.innerHTML = "";
    trainMsg.appendChild(el("span", { text: "Giỏi quá! " }));
    trainMsg.appendChild(el("b", { text: s.slice(0, 3).join(" ") }));
    trainMsg.appendChild(el("span", { text: " – " + s[3] + " Toa 2 + toa 3 gọi là VỊ NGỮ." }));
    trainMsg.className = "msg good";
    setTimeout(function () { K.speak(s.slice(0, 3).join(" ")); }, 500);
    trainNext.hidden = false;
    if (ti === TRAIN.length - 1) { trainNext.textContent = "Chơi lại từ đầu"; K.burst(); }
    else trainNext.textContent = "Câu tiếp theo →";
  }
  trainNext.addEventListener("click", function () { ti = (ti + 1) % TRAIN.length; loadTrain(); });
  loadTrain();

  // ================= 2. Sentence machine =================
  var mState = { s: 5, p: 2, f: "aff" };
  function chipRow(id, items, key, label) {
    var box = document.getElementById(id);
    items.forEach(function (it, i) {
      var b = el("button", { class: "mchip", type: "button", text: label(it) });
      b.addEventListener("click", function () {
        mState[key] = key === "f" ? it[0] : i;
        box.querySelectorAll(".mchip").forEach(function (x) { x.classList.toggle("on", x === b); });
        updateMachine(true);
      });
      if ((key === "f" ? it[0] : i) === mState[key]) b.classList.add("on");
      box.appendChild(b);
    });
  }
  chipRow("m-subj", SUBJECTS, "s", function (s) { return s.t; });
  chipRow("m-pred", PREDS, "p", function (p) { return p.be ? "be " + p.rest : p.v + " " + p.rest; });
  chipRow("m-form", FORMS, "f", function (f) { return f[1]; });
  var mOut = document.getElementById("m-out"), mVi = document.getElementById("m-vi"),
      mWhy = document.getElementById("m-why"), mAns = document.getElementById("m-ans");
  var lastText = "";
  function updateMachine(animate) {
    var r = build(SUBJECTS[mState.s], PREDS[mState.p], mState.f);
    renderTokens(r.tokens, mOut);
    mVi.textContent = r.vi;
    mWhy.textContent = r.why;
    mAns.hidden = !r.answer; mAns.textContent = r.answer ? "Trả lời ngắn: " + r.answer : "";
    if (animate) { mOut.classList.remove("pop"); void mOut.offsetWidth; mOut.classList.add("pop"); }
    lastText = r.text + (r.answer ? " " + r.answer.replace("  /  ", ". ") : "");
  }
  document.getElementById("m-say").addEventListener("click", function () { K.speak(lastText); });
  document.getElementById("m-random").addEventListener("click", function () {
    mState.s = Math.floor(Math.random() * SUBJECTS.length);
    mState.p = Math.floor(Math.random() * PREDS.length);
    mState.f = FORMS[Math.floor(Math.random() * 3)][0];
    ["m-subj", "m-pred", "m-form"].forEach(function (id, k) {
      var idx = k === 0 ? mState.s : k === 1 ? mState.p : FORMS.map(function (f) { return f[0]; }).indexOf(mState.f);
      document.querySelectorAll("#" + id + " .mchip").forEach(function (x, j) { x.classList.toggle("on", j === idx); });
    });
    updateMachine(true);
    K.speak(lastText);
  });
  updateMachine(false);

  // ================= 3. Quick challenge =================
  var ROUNDS = 10, TIME = 10;
  var gBox = document.getElementById("game"), gStart = document.getElementById("g-start");
  var gQ = document.getElementById("g-q"), gOpts = document.getElementById("g-opts"), gBar = document.getElementById("g-bar");
  var gInfo = document.getElementById("g-info"), gFeedback = document.getElementById("g-feedback"), gEnd = document.getElementById("g-end");
  var round, score, streak, best = K.lsGet("kevin-game-best", 0), timer, tLeft, locked, rows;
  document.getElementById("g-best").textContent = best;

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function verbPreds() { return PREDS.filter(function (p) { return !p.be; }); }
  function bePreds() { return PREDS.filter(function (p) { return p.be; }); }

  function makeRound() {
    var type = pick(["to_be", "to_be", "s_es", "negative", "question"]);
    var s = pick(SUBJECTS), pr, r, blank, opts, ans;
    if (type === "to_be") {
      pr = pick(bePreds()); r = build(s, pr, "aff");
      ans = beOf(s); opts = ["am", "is", "are"]; blank = "aux";
    } else if (type === "s_es") {
      pr = pick(verbPreds()); r = build(s, pr, "aff");
      var f = sForm(pr.v); ans = s.p === "3" ? f.base + f.end : pr.v;
      opts = [pr.v, f.base + f.end]; blank = "verb";
    } else if (type === "negative") {
      pr = pick(verbPreds()); r = build(s, pr, "neg");
      ans = s.p === "3" ? "doesn't" : "don't"; opts = ["don't", "doesn't"]; blank = "not";
    } else {
      pr = pick(verbPreds()); r = build(s, pr, "q");
      ans = s.p === "3" ? "Does" : "Do"; opts = ["Do", "Does"]; blank = "aux";
    }
    // replace blank role tokens (verb + end merged) with ___
    var toks = [], placed = false;
    r.tokens.forEach(function (t) {
      if (t[1] === blank || (blank === "verb" && t[1] === "end")) {
        if (!placed) { toks.push(["_____", "blank"]); placed = true; }
      } else toks.push(t);
    });
    var full = r.text;
    return { type: type, toks: toks, ans: ans, opts: opts, full: full, q: "g-" + type + "-" + s.t.toLowerCase().replace(/\s+/g, "_") + "-" + (pr.v || pr.rest).replace(/\s+/g, "_") };
  }

  var cur;
  function nextRound() {
    if (round >= ROUNDS) return finish();
    round++; locked = false; cur = makeRound();
    gInfo.textContent = "Câu " + round + " / " + ROUNDS + " · Điểm " + score + (streak >= 3 ? " · Chuỗi " + streak + "!" : "");
    renderTokens(cur.toks, gQ);
    gFeedback.textContent = ""; gFeedback.className = "msg";
    gOpts.innerHTML = "";
    cur.opts.forEach(function (o) {
      var b = el("button", { class: "gbtn", type: "button", text: o });
      b.addEventListener("click", function () { answer(o, b); });
      gOpts.appendChild(b);
    });
    tLeft = TIME; gBar.style.width = "100%";
    clearInterval(timer);
    timer = setInterval(function () {
      tLeft -= 0.1; gBar.style.width = Math.max(0, tLeft / TIME * 100) + "%";
      gBar.style.background = tLeft < 3 ? "var(--no)" : tLeft < 6 ? "var(--do)" : "var(--rest)";
      if (tLeft <= 0) answer(null, null);
    }, 100);
  }
  function answer(o, btn) {
    if (locked) return; locked = true; clearInterval(timer);
    var ok = o === cur.ans;
    gOpts.querySelectorAll(".gbtn").forEach(function (b) {
      if (b.textContent === cur.ans) b.classList.add("ok");
      else if (b === btn) b.classList.add("bad");
      b.disabled = true;
    });
    if (ok) { score += 10 + Math.round(tLeft); streak++; gFeedback.textContent = "Đúng rồi! " + cur.full; gFeedback.className = "msg good"; }
    else { streak = 0; gFeedback.textContent = (o === null ? "Hết giờ! " : "Chưa đúng. ") + "Đáp án: " + cur.full; gFeedback.className = "msg bad"; }
    rows.push({ q: cur.q, skill: cur.type, a: o === null ? "(hết giờ)" : o, ok: ok, mode: "practice" });
    K.speak(cur.full);
    setTimeout(nextRound, ok ? 1500 : 2600);
  }
  function finish() {
    clearInterval(timer);
    K.store.record(rows);
    gBox.hidden = true; gEnd.hidden = false;
    var correct = rows.filter(function (r) { return r.ok; }).length;
    var stars = correct >= 9 ? 3 : correct >= 7 ? 2 : correct >= 5 ? 1 : 0;
    if (score > best) { best = score; K.lsSet("kevin-game-best", best); document.getElementById("g-best").textContent = best; }
    document.getElementById("g-stars").textContent = "★★★".slice(0, stars) + "☆☆☆".slice(0, 3 - stars);
    document.getElementById("g-result").textContent = "Đúng " + correct + " / " + ROUNDS + " câu · " + score + " điểm" + (score === best && score > 0 ? " · Kỷ lục mới!" : "");
    if (stars >= 2) K.burst();
  }
  function start() {
    round = 0; score = 0; streak = 0; rows = [];
    gStart.hidden = true; gEnd.hidden = true; gBox.hidden = false;
    nextRound();
  }
  document.getElementById("g-go").addEventListener("click", start);
  document.getElementById("g-again").addEventListener("click", start);

  window.KLesson = { build: build, SUBJECTS: SUBJECTS, PREDS: PREDS };
})();
