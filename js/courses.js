/* ============================================================
   NIGHT RUNNER — js/courses.js
   코스 탐색: URL 파라미터 동기화 · 필터 · 그리드/맵 뷰 · 내 주변
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("explorerRoot");
  if (!root) return;

  const $ = (s) => root.querySelector(s);
  const grid = $("#courseGrid");
  const mapView = $("#mapView");
  const countEl = $("#resultCount");
  const qInput = $("#qInput");
  const sortSel = $("#sortSel");
  const areaSel = $("#areaSel");
  const nearBtn = $("#nearBtn");
  const nearNote = $("#nearNote");

  const state = defaultFilterState();
  let view = "grid";

  /* ── URL 파라미터 → 상태 ─────────────────────────────────── */
  function readParams() {
    const p = new URLSearchParams(location.search);
    state.tags = (p.get("tags") || "").split(",").filter((t) => TAG_META[t]);
    state.areas = (p.get("areas") || "").split(",").filter((a) => AREAS.includes(a));
    state.q = p.get("q") || "";
    state.dist = DIST_OPTS.some((d) => d.v === p.get("dist")) ? p.get("dist") : "all";
    state.sort = p.get("sort") || "safety";
    view = p.get("view") === "map" ? "map" : "grid";
  }

  function writeParams() {
    const p = new URLSearchParams();
    if (state.q) p.set("q", state.q);
    if (state.tags.length) p.set("tags", state.tags.join(","));
    if (state.areas.length) p.set("areas", state.areas.join(","));
    if (state.dist !== "all") p.set("dist", state.dist);
    if (state.sort !== "safety") p.set("sort", state.sort);
    if (view === "map") p.set("view", "map");
    history.replaceState(null, "", location.pathname + (p.toString() ? "?" + p.toString() : ""));
  }

  /* ── UI ↔ 상태 동기화 ────────────────────────────────────── */
  function syncUI() {
    qInput.value = state.q;
    sortSel.value = state.sort;
    areaSel.value = state.areas[0] || "all";
    root.querySelectorAll("[data-tag]").forEach((b) => b.classList.toggle("on", state.tags.includes(b.dataset.tag)));
    root.querySelectorAll("input[name='dist']").forEach((r) => (r.checked = r.value === state.dist));
    root.querySelectorAll("[data-view]").forEach((b) => b.classList.toggle("on", b.dataset.view === view));
    nearBtn.classList.toggle("on", state.near);
    nearNote.classList.toggle("hidden", !state.near);
  }

  /* ── 맵 뷰 패널 ──────────────────────────────────────────── */
  let mapReady = false;
  const panel = $("#mapPanelBody");
  function showPanel(course) {
    if (!course) {
      panel.innerHTML = `<p class="text-mute" style="font-size:13px;line-height:1.7">루트를 호버하거나 클릭하면<br/>코스 정보가 표시됩니다.</p>`;
      return;
    }
    const tone = safetyTone(course.safety.score);
    panel.innerHTML = `
      <span class="cc-area" style="display:inline-block">${esc(course.area)}</span>
      <h4 class="mp-name">${esc(course.name)}</h4>
      <p class="mp-kr">${esc(course.nameKr)}</p>
      <div class="mp-meta"><span class="tnum">${course.distance.toFixed(1)} KM</span><span class="tnum">${course.time} MIN</span><span class="tnum">+${course.elevation}M</span></div>
      <div class="cc-safety-head"><em>SAFETY</em><b class="s-${tone} tnum">${course.safety.score}</b></div>
      <div class="meter ${tone === "lime" ? "" : tone}"><i style="width:${course.safety.score}%"></i></div>
      <a class="btn btn-primary btn-sm" style="width:100%;margin-top:16px" href="./course-detail.html?id=${course.id}">코스 상세 ${I.arrowR(13)}</a>`;
  }

  function ensureMap() {
    if (mapReady) return;
    mapReady = true;
    renderOverviewMap($("#overviewMap"), {
      onHover: (id) => showPanel(id ? getCourse(id) : null),
    });
    showPanel(null);
  }

  /* ── 렌더 ────────────────────────────────────────────────── */
  function render() {
    const list = applyFilters(COURSES, state);
    countEl.innerHTML = `<b class="tnum">${String(list.length).padStart(2, "0")}</b> COURSES`;
    grid.classList.toggle("hidden", view !== "grid");
    mapView.classList.toggle("hidden", view !== "map");
    if (view === "grid") {
      renderCardGrid(grid, list);
    } else {
      ensureMap();
    }
  }

  function commit() {
    writeParams();
    render();
  }

  /* ── 이벤트 바인딩 ───────────────────────────────────────── */
  let qTimer = null;
  qInput.addEventListener("input", () => {
    clearTimeout(qTimer);
    qTimer = setTimeout(() => { state.q = qInput.value.trim(); commit(); }, 220);
  });
  sortSel.addEventListener("change", () => { state.sort = sortSel.value; state.near = false; commit(); });
  areaSel.addEventListener("change", () => { state.areas = areaSel.value === "all" ? [] : [areaSel.value]; commit(); });
  root.querySelectorAll("[data-tag]").forEach((b) => {
    b.addEventListener("click", () => {
      const t = b.dataset.tag;
      state.tags = state.tags.includes(t) ? state.tags.filter((x) => x !== t) : [...state.tags, t];
      syncUI(); commit();
    });
  });
  root.querySelectorAll("input[name='dist']").forEach((r) => {
    r.addEventListener("change", () => { state.dist = r.value; commit(); });
  });
  root.querySelectorAll("[data-view]").forEach((b) => {
    b.addEventListener("click", () => { view = b.dataset.view; syncUI(); commit(); });
  });
  nearBtn.addEventListener("click", () => {
    state.near = !state.near;
    if (state.near) toast(`데모 위치 기준 정렬 — ${DEMO_LOC.label}`, "info");
    syncUI(); render();
  });
  $("#resetBtn").addEventListener("click", resetAll);
  window.addEventListener("nr:reset", resetAll);
  function resetAll() {
    Object.assign(state, defaultFilterState());
    syncUI(); commit();
  }

  /* ── 모바일 필터 드로어 (필터 패널 노드 이동 방식) ───────── */
  const filtersEl = $("#filterPanel");
  const drawerHost = $("#drawerHost");
  const openDrawer = $("#mobileFilterBtn");
  function closeDrawer() {
    if (!drawerHost.contains(filtersEl)) return;
    root.querySelector("#filtersSlot").appendChild(filtersEl);
    drawerHost.innerHTML = "";
  }
  openDrawer.addEventListener("click", () => {
    drawerHost.innerHTML = `<div class="drawer-back" data-dclose></div>
      <div class="drawer"><h3>FILTER ${I.filter(16)}<button class="icon-btn" data-dclose aria-label="닫기">${I.x(15)}</button></h3></div>`;
    drawerHost.querySelector(".drawer").appendChild(filtersEl);
    filtersEl.classList.add("open");
    drawerHost.querySelectorAll("[data-dclose]").forEach((x) => x.addEventListener("click", () => {
      filtersEl.classList.remove("open");
      closeDrawer();
    }));
  });

  window.addEventListener("popstate", () => { readParams(); syncUI(); render(); });

  readParams();
  syncUI();
  render();
});
