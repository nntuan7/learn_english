// Trang Kết quả – tổng hợp theo mảng, lấy từ Supabase (nếu có PIN) hoặc từ máy này
(function () {
  "use strict";
  var el = K.el, store = K.store;
  var nameIn = document.getElementById("learner"), pinIn = document.getElementById("pin");
  var status = document.getElementById("status"), list = document.getElementById("skills"), meta = document.getElementById("meta");

  function setStatus(text, color) { status.textContent = text; status.style.color = color || "inherit"; }

  function fill() {
    var s = store.settings();
    nameIn.value = s.learner; pinIn.value = s.pin ? "••••••" : "";
    pinIn.dataset.real = s.pin;
  }

  function render(sum, source) {
    list.innerHTML = "";
    var skills = (sum && sum.skills) || {};
    var weak = [];
    K.SKILL_ORDER.forEach(function (k) {
      var s = skills[k], st = K.skillStatus(s);
      var pct = st.pct === null ? null : Math.round(st.pct * 100);
      var color = { good: "var(--rest)", mid: "var(--do)", weak: "var(--no)", none: "#C9C2B0" }[st.level];
      var label = st.level === "none" ? "Chưa làm" : st.level === "good" ? (st.improved ? "Đã tiến bộ" : "Tốt") : "Cần luyện thêm";
      if (st.level === "mid" || st.level === "weak") weak.push(k);
      var detail = s ? ("Lần đầu: " + (s.first_correct || 0) + "/" + (s.first_total || 0) + " câu đúng · Luyện thêm: " +
        (s.practice_correct || 0) + "/" + (s.practice_total || 0)) : "Chưa có câu nào";
      list.appendChild(el("div", { class: "skill-row" }, [
        el("div", { class: "skill-name" }, [el("b", { text: K.SKILLS[k] }), el("span", { class: "tag", style: "background:" + color, text: label })]),
        el("div", { class: "bar" }, [el("i", { style: "width:" + (pct || 0) + "%;background:" + color })]),
        el("div", { class: "skill-detail" }, [el("span", { text: (pct === null ? "–" : pct + "%") + " · " + detail }),
          el("a", { class: "btn " + (st.level === "good" ? "grey" : "orange") + " small", href: "luyen-tap.html?skill=" + k, text: "Luyện thêm" }),
          el("a", { class: "btn small", href: "./#bai-" + LESSON_OF[k], text: "Xem lại bài " + LESSON_OF[k] })])
      ]));
    });
    var src = source === "server" ? "Kết quả lưu online (tất cả các máy)." : "Kết quả trên máy này.";
    var extra = sum && sum.days_active ? " Đã học " + sum.days_active + " ngày, trả lời " + sum.total_answers + " câu." : "";
    meta.textContent = src + extra + (weak.length ? " Mảng cần luyện: " + weak.map(function (k) { return K.SKILLS[k]; }).join(", ") + "." : "");
  }

  var LESSON_OF = { subject: 1, verb_pred: 1, s_es: 2, to_be: 3, negative: 4, question: 4 };

  function load() {
    var s = store.settings();
    render(store.localSummary(), "local");
    if (!s.pin) { setStatus("Chưa nhập PIN: kết quả chỉ lưu trên máy này.", "var(--grey)"); return; }
    if (s.pinBad) { setStatus("PIN không đúng. Nhập lại PIN nhé.", "var(--no)"); return; }
    setStatus("Đang tải kết quả online…", "var(--grey)");
    store.sync().then(function () { return store.serverSummary(); }).then(function (sum) {
      if (sum && sum.error) {
        if (sum.error === "pin") { store.saveSettings(s.learner, s.pin, true); setStatus("PIN không đúng. Nhập lại PIN nhé.", "var(--no)"); }
        else setStatus("Nhập sai PIN nhiều lần, tạm khoá 15 phút.", "var(--no)");
        return;
      }
      var p = store.pending();
      setStatus("Đã kết nối – kết quả được lưu online." + (p ? " (Còn " + p + " câu chờ gửi)" : ""), "var(--rest)");
      render(sum, "server");
    }, function () { setStatus("Không kết nối được mạng. Đang hiện kết quả trên máy này.", "var(--do)"); });
  }

  document.getElementById("save").addEventListener("click", function () {
    var pin = pinIn.value === "••••••" ? pinIn.dataset.real : pinIn.value.trim();
    store.saveSettings(nameIn.value.trim() || "Kevin", pin, false);
    fill(); load();
  });
  pinIn.addEventListener("focus", function () { if (pinIn.value === "••••••") pinIn.value = ""; });

  fill(); load();
})();
