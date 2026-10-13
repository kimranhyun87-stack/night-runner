/* ============================================================
   NIGHT RUNNER — js/filter.js
   필터 모델 · 코스 카드 렌더 · 전역 북마크 클릭 위임
   ============================================================ */

const DIST_OPTS = [
  { v: "all", kr: "전체" },
  { v: "u3", kr: "3km 이하" },
  { v: "35", kr: "3–5km" },
  { v: "510", kr: "5–10km" },
  { v: "10p", kr: "10km+" },
];

function defaultFilterState() {
  return { q: "", tags: [], areas: [], dist: "all", sort: "safety", near: false };
}

function distMatch(c, dist) {
  if (dist === "u3") return c.distance < 3;
  if (dist === "35") return c.distance >= 3 && c.distance < 5;
  if (dist === "510") return c.distance >= 5 && c.distance < 10;
  if (dist === "10p") return c.distance >= 10;
  return true;
}

function applyFilters(courses, st) {
  let out = courses.filter((c) => {
    if (st.tags.length && !st.tags.every((t) => c.tags.includes(t))) return false;
    if (st.areas.length && !st.areas.includes(c.area)) return false;
    if (!distMatch(c, st.dist)) return false;
    if (st.q) {
      const q = st.q.toLowerCase();
      const hay = (c.name + " " + c.nameKr + " " + c.location + " " + c.area).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  if (st.near) {
    out = out
      .map((c) => ({ ...c, _km: haversine(DEMO_LOC, c.coords) }))
      .sort((a, b) => a._km - b._km);
  } else if (st.sort === "safety") out = [...out].sort((a, b) => b.safety.score - a.safety.score);
  else if (st.sort === "distAsc") out = [...out].sort((a, b) => a.distance - b.distance);
  else if (st.sort === "distDesc") out = [...out].sort((a, b) => b.distance - a.distance);
  else if (st.sort === "name") out = [...out].sort((a, b) => a.name.localeCompare(b.name));
  return out;
}

/* ── 렌더 헬퍼 ──────────────────────────────────────────────── */
function safetyTone(score) {
  return score >= 85 ? "lime" : score >= 70 ? "cy" : "warm";
}

function diffBadge(d) {
  return `<span class="diff-badge ${diffClass(d)}">${DIFF_KR[d]}</span>`;
}

function tagChip(tag) {
  const m = TAG_META[tag];
  return `<span class="chip chip-sm tag-${m.dot}"><i class="chip-dot"></i>${m.kr}</span>`;
}

function stars(n) {
  return `<span class="stars">${"★".repeat(n)}<span class="dim">${"★".repeat(5 - n)}</span></span>`;
}

function courseCard(course, delay) {
  const saved = Store.isBookmarked(course.id);
  const tone = safetyTone(course.safety.score);
  return `
  <a class="course-card reveal" href="./course-detail.html?id=${course.id}" style="transition-delay:${delay || 0}ms">
    <div class="cc-imgwrap">
      <img class="cc-img" src="${course.image}" alt="${esc(course.nameKr)}" loading="lazy"/>
      <div class="cc-shade"></div>
      <div class="cc-top"><span class="cc-area">${esc(course.area)}</span>${diffBadge(course.difficulty)}</div>
      <button class="cc-save ${saved ? "saved" : ""}" data-save="${course.id}" data-name="${esc(course.nameKr)}" aria-label="북마크">${I.heart(17, saved)}</button>
      <div class="cc-tags">${course.tags.slice(0, 3).map(tagChip).join("")}</div>
    </div>
    <div class="cc-body">
      <p class="cc-loc">${I.pin(12)}${esc(course.location)}</p>
      <h3 class="cc-name">${esc(course.name)}</h3>
      <p class="cc-namekr">${esc(course.nameKr)}</p>
      <div class="cc-meta">
        <span class="cy">${I.route(14)}${course.distance.toFixed(1)} KM</span>
        <span>${I.clock(14)}${course.time} MIN</span>
        <span>${I.hill(14)}+${course.elevation} M</span>
        ${course._km != null ? `<span class="cy">${I.locate(14)}${course._km.toFixed(1)} KM 떨어짐</span>` : ""}
      </div>
      <div class="cc-safety-head"><em>SAFETY SCORE</em><b class="s-${tone} tnum">${course.safety.score}</b></div>
      <div class="meter ${tone === "lime" ? "" : tone}"><i style="width:${course.safety.score}%"></i></div>
    </div>
  </a>`;
}

function renderCardGrid(el, list, emptyHtml) {
  if (!list.length) {
    el.innerHTML = emptyHtml || `
      <div class="empty" style="grid-column:1/-1">
        <div class="e-ico">${I.search(34)}</div>
        <h4>조건에 맞는 코스를 찾지 못했습니다</h4>
        <p>필터를 하나씩 해제하거나 거리 조건을 넓혀보세요.</p>
        <button class="btn btn-ghost btn-sm" onclick="window.dispatchEvent(new Event('nr:reset'))">FILTER RESET</button>
      </div>`;
  } else {
    el.innerHTML = list.map((c, i) => courseCard(c, i * 45)).join("");
  }
  revealInit(el);
}

/* ── 전역 위임: 카드 안의 북마크 버튼 ───────────────────────── */
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-save]");
  if (b) {
    e.preventDefault();
    e.stopPropagation();
    Store.toggleBookmark(b.dataset.save, b.dataset.name);
  }
});
