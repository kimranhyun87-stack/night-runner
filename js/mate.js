/* ============================================================
   NIGHT RUNNER — js/mate.js
   러닝 메이트: 목록 · 참여 신청 · 모집 폼 · 티저 · 코스 섹션
   ============================================================ */

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function dayOf(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return DAYS[(d.getDay() + 6) % 7];
}
function dateLabel(dateStr) {
  const [, m, dd] = dateStr.split("-");
  return `${+m}.${+dd}`;
}

function postCard(post, opts) {
  opts = opts || {};
  const course = getCourse(post.courseId);
  const applied = Store.isApplied(post.id);
  const full = post.joined >= post.max;
  let action;
  if (post.mine) {
    action = `<span class="mine-tag">MY POST</span>
      <button class="icon-btn" data-delpost="${post.id}" aria-label="모집글 삭제" title="삭제">${I.trash(15)}</button>`;
  } else if (applied) {
    action = `<button class="btn btn-ghost btn-sm" data-cancelapp="${post.id}">신청 취소</button>`;
  } else if (full) {
    action = `<button class="btn btn-ghost btn-sm" disabled>FULL</button>`;
  } else {
    action = `<button class="btn btn-primary btn-sm" data-join="${post.id}">JOIN</button>`;
  }
  const pct = Math.min(100, Math.round((post.joined / post.max) * 100));
  return `
  <article class="mate-card reveal">
    <div class="day-tile"><b>${esc(post.day)}</b><span>${esc(post.dateLabel)}</span></div>
    <div class="mc-main">
      <div class="mc-top">
        <span class="mc-time tnum">${esc(post.time)}</span>
        <span class="mc-pace">${esc(post.pace)}</span>
        ${full && !applied && !post.mine ? '<span class="mine-tag" style="color:var(--alarm);border-color:rgba(255,92,92,.4)">FULL</span>' : ""}
      </div>
      ${opts.showCourse !== false && course ? `<p class="mc-course">${I.pin(13)}<a href="./course-detail.html?id=${course.id}">${esc(course.nameKr)}</a>· ${esc(course.area)}</p>` : ""}
      <p class="mc-msg">“${esc(post.message)}”</p>
      <p class="mc-host">HOST <b>${esc(post.nickname)}</b></p>
    </div>
    <div class="mc-side">
      <span class="mc-join-count tnum"><b>${post.joined}</b> / ${post.max} JOINED</span>
      <div class="meter prog ${full ? "warm" : ""}"><i style="width:${pct}%"></i></div>
      ${action}
    </div>
  </article>`;
}

function renderPosts(el, posts, emptyHtml) {
  if (!posts.length) {
    el.innerHTML = emptyHtml || `
      <div class="empty">
        <div class="e-ico">${I.users(34)}</div>
        <h4>아직 모집글이 없습니다</h4>
        <p>첫 러닝 메이트를 모집해보세요. 요일과 페이스만 있으면 됩니다.</p>
        <button class="btn btn-primary btn-sm" data-newmate>${I.plus(14)}모집 등록</button>
      </div>`;
  } else {
    el.innerHTML = posts.map((p) => postCard(p)).join("");
  }
  revealInit(el);
}

/* ── 모집 폼 모달 ───────────────────────────────────────────── */
function openMateForm(courseId) {
  const courseOpts = COURSES.map(
    (c) => `<option value="${c.id}" ${c.id === courseId ? "selected" : ""}>${esc(c.nameKr)} · ${c.distance.toFixed(1)}km</option>`
  ).join("");
  const paceOpts = PACES.map((p) => `<option value="${p}">${p}</option>`).join("");

  openModal(
    "POST RUN — 모집 등록",
    `<form id="mateForm" novalidate>
      <div class="field">
        <label>RUN COURSE · 코스</label>
        <select name="courseId">${courseOpts}</select>
      </div>
      <div class="field-row">
        <div class="field">
          <label>RUN DATE · 날짜</label>
          <input type="date" name="date" min="${todayStr()}" required/>
          <p class="err-msg">러닝 날짜를 선택해주세요.</p>
        </div>
        <div class="field">
          <label>TIME · 시간</label>
          <input type="time" name="time" required/>
          <p class="err-msg">출발 시간을 입력해주세요.</p>
        </div>
      </div>
      <div class="field-row">
        <div class="field">
          <label>PACE · 예상 페이스</label>
          <select name="pace">${paceOpts}</select>
        </div>
        <div class="field">
          <label>MAX RUNNERS · 모집 인원</label>
          <input type="number" name="max" min="2" max="8" value="4" required/>
          <p class="err-msg">2~8명 사이로 입력해주세요.</p>
        </div>
      </div>
      <div class="field">
        <label>MESSAGE · 한마디</label>
        <textarea name="message" maxlength="120" placeholder="편하게 같이 달려요."></textarea>
      </div>
      <div class="field">
        <label>NICKNAME · 닉네임</label>
        <input type="text" name="nickname" maxlength="16" placeholder="Runner_K" required/>
        <p class="err-msg">닉네임은 2자 이상 입력해주세요.</p>
      </div>
      <button type="submit" class="btn btn-primary btn-md" style="width:100%;margin-top:6px">${I.bolt(16)}POST RUN</button>
    </form>`
  );

  document.getElementById("mateForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const v = Object.fromEntries(new FormData(f).entries());
    let ok = true;
    const mark = (name, bad) => {
      const field = f.querySelector(`[name="${name}"]`).closest(".field");
      field.classList.toggle("has-err", bad);
      if (bad) {
        ok = false;
        field.classList.remove("shake");
        void field.offsetWidth;
        field.classList.add("shake");
      }
    };
    mark("date", !v.date || v.date < todayStr());
    mark("time", !v.time);
    mark("max", !(+v.max >= 2 && +v.max <= 8));
    mark("nickname", !v.nickname || v.nickname.trim().length < 2);
    if (!ok) return;

    Store.addPost({
      courseId: v.courseId,
      date: v.date,
      day: dayOf(v.date),
      dateLabel: dateLabel(v.date),
      time: v.time,
      pace: v.pace,
      max: +v.max,
      message: (v.message || "편하게 같이 달려요.").trim(),
      nickname: v.nickname.trim(),
    });
    closeModal();
  });
}

/* ── 전역 위임 ──────────────────────────────────────────────── */
document.addEventListener("click", (e) => {
  const join = e.target.closest("[data-join]");
  if (join) return Store.applyTo(join.dataset.join);
  const cancel = e.target.closest("[data-cancelapp]");
  if (cancel) return Store.cancelApp(cancel.dataset.cancelapp);
  const del = e.target.closest("[data-delpost]");
  if (del) return Store.deletePost(del.dataset.delpost);
  const nw = e.target.closest("[data-newmate]");
  if (nw) return openMateForm(nw.dataset.course || null);
});

/* ── 홈 티저 / 코스 상세 섹션 ───────────────────────────────── */
function renderMateTeaser(el) {
  const list = Store.posts.slice(0, 3);
  el.innerHTML = list.map((p) => postCard(p)).join("");
  revealInit(el);
}

/* ── MATE 페이지 컨트롤러 ───────────────────────────────────── */
function initMatePage() {
  const list = document.getElementById("mateList");
  const countEl = document.getElementById("mateCount");
  let dayFilter = "all";

  function render() {
    let posts = [...Store.posts].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    if (dayFilter !== "all") posts = posts.filter((p) => p.day === dayFilter);
    countEl.innerHTML = `<b class="tnum">${String(posts.length).padStart(2, "0")}</b> OPEN`;
    renderPosts(list, posts);
  }
  document.querySelectorAll("[data-day]").forEach((b) => {
    b.addEventListener("click", () => {
      dayFilter = b.dataset.day;
      document.querySelectorAll("[data-day]").forEach((x) => x.classList.toggle("on", x === b));
      render();
    });
  });
  Store.subscribe(render);
  render();
}
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("mateRoot")) initMatePage();
});

function renderCourseMates(el, courseId) {
  const list = Store.posts.filter((p) => p.courseId === courseId);
  el.innerHTML = `
    <div class="sec-head" style="margin-bottom:22px">
      <div>
        <p class="sec-eyebrow">RUN TOGETHER</p>
        <h2 class="sec-title" style="font-size:clamp(22px,2.6vw,28px)">같은 시간에 달릴 러너를 찾아보세요</h2>
      </div>
      <button class="btn btn-primary btn-sm" data-newmate data-course="${courseId}">${I.plus(14)}모집 등록</button>
    </div>
    <div class="mate-list">
      ${list.length
        ? list.map((p) => postCard(p, { showCourse: false })).join("")
        : `<div class="empty">
             <div class="e-ico">${I.users(30)}</div>
             <h4>이 코스에는 아직 모집글이 없습니다</h4>
             <p>이 코스를 함께 달릴 러너를 가장 먼저 모집해보세요.</p>
           </div>`}
    </div>`;
  revealInit(el);
}
