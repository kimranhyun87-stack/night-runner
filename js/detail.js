/* ============================================================
   NIGHT RUNNER — js/detail.js
   코스 상세: 스탯 · 안전 · 루트 맵 · 고저차 · 시설 · 메이트
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("detailRoot");
  if (!root) return;

  const id = new URLSearchParams(location.search).get("id");
  const course = getCourse(id);
  if (!course) {
    location.replace("/courses.html");
    return;
  }

  const paceSec = Math.round((course.time / course.distance) * 60);
  const paceStr = `${Math.floor(paceSec / 60)}:${String(paceSec % 60).padStart(2, "0")}`;
  const tone = safetyTone(course.safety.score);
  const saved = Store.isBookmarked(course.id);

  const checks = [
    { on: course.tags.includes("bright"), t: "밝은 가로등 전 구간" },
    { on: course.tags.includes("crowded"), t: "야간 이용자 많음" },
    { on: course.tags.includes("shelter"), t: "500m 이내 안전 쉼터" },
    { on: course.tags.includes("cctv"), t: "CCTV 인접 구간" },
    { on: course.facilities.restroom, t: "화장실 이용 가능" },
    { on: course.facilities.vending, t: "자판기 이용 가능" },
  ];

  const facs = [
    { k: "restroom", kr: "화장실", en: "RESTROOM", ico: I.restroom(20) },
    { k: "vending", kr: "자판기", en: "VENDING", ico: I.vending(20) },
    { k: "convenience", kr: "편의점", en: "STORE", ico: I.store(20) },
    { k: "bench", kr: "벤치", en: "BENCH", ico: I.bench(20) },
    { k: "water", kr: "음수대", en: "WATER", ico: I.drop(20) },
    { k: "shelter", kr: "쉼터", en: "SHELTER", ico: I.shelter(20) },
  ];

  root.innerHTML = `
  <a class="crumb" href="./courses.html">${I.arrowL(13)}ALL COURSES</a>

  <div class="d-head">
    <div>
      <h1 class="line-mask"><span>${esc(course.name)}</span></h1>
      <p class="d-kr">${esc(course.nameKr)} · 평균 페이스 <b class="tnum" style="color:var(--cy)">${paceStr} /KM</b></p>
      <p class="d-loc">${I.pin(14)}${esc(course.location)}</p>
    </div>
    <div class="d-head-right">
      <button class="btn btn-ghost btn-md" data-save="${course.id}" data-name="${esc(course.nameKr)}">
        <span data-save-ico>${I.heart(15, saved)}</span><span data-save-txt>${saved ? "SAVED" : "SAVE"}</span>
      </button>
      <a class="btn btn-primary btn-md" href="#mates">RUN TOGETHER ${I.arrowR(14)}</a>
    </div>
  </div>

  <div class="d-hero reveal">
    <img src="${course.image}" alt="${esc(course.nameKr)} 야경" class="kenburns"/>
    <button class="cc-save ${saved ? "saved" : ""}" data-save="${course.id}" data-name="${esc(course.nameKr)}" aria-label="북마크">${I.heart(20, saved)}</button>
  </div>

  <div class="stat-grid">
    <div class="stat-block reveal"><label>DISTANCE</label><b class="tnum">${course.distance.toFixed(1)}<small>KM</small></b></div>
    <div class="stat-block reveal" style="transition-delay:60ms"><label>EST. TIME</label><b class="tnum">${course.time}<small>MIN</small></b></div>
    <div class="stat-block reveal" style="transition-delay:120ms"><label>ELEVATION</label><b class="tnum">+${course.elevation}<small>M</small></b></div>
    <div class="stat-block lime reveal" style="transition-delay:180ms"><label>DIFFICULTY</label><b>${DIFF_KR[course.difficulty]}</b></div>
  </div>

  <div class="d-cols">
    <div class="panel reveal">
      <div class="panel-h"><h3>SAFETY SCORE</h3><span class="big-score tnum s-${tone}">${course.safety.score}<span style="font-size:14px;color:var(--mute)">%</span></span></div>
      <div class="score-row"><span>종합 안전도</span><div class="meter ${tone === "lime" ? "" : tone}" style="height:7px"><i class="bar-fill" style="width:${course.safety.score}%"></i></div><span class="tnum">${course.safety.score}</span></div>
      <div style="margin-top:16px">
        <div class="star-row"><span>가로등 조도 · Lighting</span>${stars(course.safety.lighting)}</div>
        <div class="star-row"><span>야간 유동인구 · Crowd</span>${stars(course.safety.crowd)}</div>
        <div class="star-row" style="border-bottom:0"><span>쉼터 접근성 · Shelter</span>${stars(course.safety.shelter)}</div>
      </div>
    </div>

    <div class="panel reveal" style="transition-delay:80ms">
      <div class="panel-h"><h3>SAFETY CHECK</h3><span style="font-family:var(--font-disp);font-size:10px;letter-spacing:.2em;color:var(--mute)">INFO-BASED</span></div>
      <ul class="check-list">
        ${checks.map((c) => `<li class="${c.on ? "" : "off"}"><span class="${c.on ? "ok" : "no"}">${c.on ? I.check(15) : I.x(15)}</span>${c.t}</li>`).join("")}
      </ul>
      <p class="d-note">※ 실제 조도 및 시설 운영 상태는 현장 상황에 따라 달라질 수 있습니다. 본 점수는 정보 기반 지표이며 절대적 안전을 보증하지 않습니다.</p>
    </div>
  </div>

  <div class="panel map-wrap reveal">
    <div class="panel-h"><h3>RUN ROUTE — MAP</h3><span style="font-family:var(--font-disp);font-size:10px;letter-spacing:.2em;color:var(--mute)">DARK MAP UI</span></div>
    <div id="routeMap"></div>
  </div>

  <div class="d-cols">
    <div class="panel elev-wrap reveal">
      <div class="panel-h"><h3>ELEVATION PROFILE</h3><span style="font-family:var(--font-disp);font-size:10px;letter-spacing:.2em;color:var(--mute)">+${course.elevation}M</span></div>
      <div id="elevChart"></div>
    </div>
    <div class="panel reveal" style="transition-delay:80ms">
      <div class="panel-h"><h3>FACILITIES</h3><span style="font-family:var(--font-disp);font-size:10px;letter-spacing:.2em;color:var(--mute)">${facs.filter((f) => course.facilities[f.k]).length} / 6</span></div>
      <div class="fac-grid">
        ${facs.map((f) => {
          const has = course.facilities[f.k];
          return `<div class="fac-item ${has ? "has" : ""}"><span class="fi-ico">${f.ico}</span><b>${f.kr}</b><span>${has ? "이용 가능 · " + f.en : "없음 · N/A"}</span></div>`;
        }).join("")}
      </div>
    </div>
  </div>

  <div class="panel reveal" style="margin-top:22px">
    <div class="panel-h"><h3>ABOUT THIS ROUTE</h3><span class="cc-area" style="display:inline-block">${esc(course.area)}</span></div>
    <p class="d-desc">${course.description}</p>
    <div class="hl-chips">${course.highlights.map((h) => `<span class="chip chip-sm tag-lime"><i class="chip-dot"></i>${esc(h)}</span>`).join("")}</div>
    <div class="hl-chips" style="margin-top:10px">${course.tags.map(tagChip).join("")}</div>
  </div>

  <section id="mates" class="reveal" style="margin-top:56px"></section>

  <section style="margin-top:64px">
    <div class="sec-head">
      <div>
        <p class="sec-eyebrow">SIMILAR ROUTES</p>
        <h2 class="sec-title" style="font-size:clamp(22px,2.6vw,28px)">이 코스와 함께 보기 좋은 루트</h2>
      </div>
      <a class="btn btn-ghost btn-sm" href="./courses.html">전체 코스 ${I.arrowR(13)}</a>
    </div>
    <div class="card-grid" id="similarGrid"></div>
  </section>`;

  renderRouteMap(document.getElementById("routeMap"), course);
  renderElevChart(document.getElementById("elevChart"), course);
  renderCourseMates(document.getElementById("mates"), course.id);

  const similar = COURSES.filter((c) => c.id !== course.id)
    .sort((a, b) => (b.area === course.area) - (a.area === course.area) || b.safety.score - a.safety.score)
    .slice(0, 3);
  renderCardGrid(document.getElementById("similarGrid"), similar);

  /* 스토어 변경 시 저장 버튼 + 메이트 섹션 갱신 */
  function refreshSaveUI() {
    document.querySelectorAll("[data-save]").forEach((b) => {
      const s = Store.isBookmarked(b.dataset.save);
      b.classList.toggle("saved", s);
      const icoEl = b.querySelector("[data-save-ico]");
      if (icoEl) {
        icoEl.innerHTML = I.heart(15, s);
        b.querySelector("[data-save-txt]").textContent = s ? "SAVED" : "SAVE";
      } else {
        b.innerHTML = I.heart(20, s);
      }
    });
  }
  Store.subscribe(() => {
    refreshSaveUI();
    renderCourseMates(document.getElementById("mates"), course.id);
  });

  revealInit(root);
});
