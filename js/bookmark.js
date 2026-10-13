/* ============================================================
   NIGHT RUNNER — js/bookmark.js
   MY RUN: 저장 코스 아카이브 · 활동 · 주간 목표
   ============================================================ */

function initMyRun() {
  const grid = document.getElementById("savedGrid");
  const statsEl = document.getElementById("myStats");
  const recentEl = document.getElementById("recentList");
  const appsEl = document.getElementById("myApps");
  const postsEl = document.getElementById("myPosts");

  function render() {
    const saved = Store.bookmarks
      .map((b) => getCourse(b.id))
      .filter(Boolean);
    const totalKm = saved.reduce((s, c) => s + c.distance, 0);
    const totalTime = saved.reduce((s, c) => s + c.time, 0);

    /* stats */
    statsEl.innerHTML = `
      <div class="mini-stat reveal"><b class="tnum">${saved.length}</b><span>SAVED COURSES</span></div>
      <div class="mini-stat cy reveal"><b class="tnum">${totalKm.toFixed(1)}</b><span>TOTAL KM</span></div>
      <div class="mini-stat reveal"><b class="tnum">${Math.floor(totalTime / 60)}h ${totalTime % 60}m</b><span>EST. RUNNING TIME</span></div>`;

    /* saved grid */
    if (!saved.length) {
      grid.innerHTML = `
        <div class="empty" style="grid-column:1/-1">
          <div class="e-ico">${I.heart(36)}</div>
          <h4>아직 저장한 코스가 없습니다</h4>
          <p>코스 카드의 하트를 누르면 이곳에 나만의 러닝 아카이브가 쌓입니다.</p>
          <a class="btn btn-primary btn-sm" href="./courses.html">코스 탐색하기 ${I.arrowR(14)}</a>
        </div>`;
    } else {
      grid.innerHTML = saved.map((c, i) => courseCard(c, i * 50)).join("");
    }

    /* recent list */
    recentEl.innerHTML = saved.length
      ? saved.map((c) => `
        <a class="recent-item" href="./course-detail.html?id=${c.id}">
          <span>${esc(c.nameKr)}</span>
          <span class="ri-meta tnum">${c.distance.toFixed(1)}KM · ${c.time}MIN</span>
        </a>`).join("")
      : `<p class="text-mute" style="font-size:12.5px">저장된 코스가 없습니다.</p>`;

    /* my applications */
    const applied = Store.apps.map((id) => Store.getPost(id)).filter(Boolean);
    appsEl.innerHTML = applied.length
      ? applied.map((p) => {
          const c = getCourse(p.courseId);
          return `
          <div class="my-mate-item">
            <div class="mmi-info">
              <b>${esc(p.day)} · ${esc(p.dateLabel)} · ${esc(p.time)}</b>
              <span>${c ? esc(c.nameKr) : "코스 삭제됨"} — ${esc(p.pace)}</span>
            </div>
            <button class="icon-btn" data-cancelapp="${p.id}" title="신청 취소" aria-label="신청 취소">${I.x(14)}</button>
          </div>`;
        }).join("")
      : `<p class="text-mute" style="font-size:12.5px">참여 신청한 모임이 없습니다.</p>`;

    /* my posts */
    const mine = Store.posts.filter((p) => p.mine);
    postsEl.innerHTML = mine.length
      ? mine.map((p) => {
          const c = getCourse(p.courseId);
          return `
          <div class="my-mate-item">
            <div class="mmi-info">
              <b>${esc(p.day)} · ${esc(p.dateLabel)} · ${esc(p.time)}</b>
              <span>${c ? esc(c.nameKr) : ""} — ${p.joined}/${p.max} 참여</span>
            </div>
            <button class="icon-btn" data-delpost="${p.id}" title="모집글 삭제" aria-label="모집글 삭제">${I.trash(14)}</button>
          </div>`;
        }).join("")
      : `<p class="text-mute" style="font-size:12.5px">등록한 모집글이 없습니다.</p>`;

    /* weekly goal bar */
    const goal = document.getElementById("goalBar");
    if (goal) {
      const pct = Math.min(100, Math.round((totalKm / 30) * 100));
      goal.innerHTML = `
        <label><span>주간 목표 30KM</span><b class="tnum">${pct}%</b></label>
        <div class="meter"><i style="width:${pct}%"></i></div>`;
    }

    revealInit(document.getElementById("myRunRoot"));
  }

  Store.subscribe(render);
  render();
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("myRunRoot")) initMyRun();
});
