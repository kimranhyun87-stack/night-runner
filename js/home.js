/* ============================================================
   NIGHT RUNNER — js/home.js
   홈: 라이브 클락 · 퀵서치 · 티커 · 투나잇 · 세이프티 · 코치
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("homeRoot")) return;

  /* ── 라이브 클락 + 투나잇 스테이터스 ─────────────────────── */
  const clockEl = document.getElementById("liveClock");
  function tick() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    clockEl.textContent = `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
  }
  tick();
  setInterval(tick, 1000);

  const best = [...COURSES].sort((a, b) => b.safety.score - a.safety.score)[0];
  const bestEl = document.getElementById("bestCourse");
  if (bestEl)
    bestEl.innerHTML = `오늘의 베스트 루트 <b>${esc(best.nameKr)}</b> · 안전 ${best.safety.score}점`;

  const idxEl = document.getElementById("runIndexBar");
  if (idxEl) idxEl.style.width = "82%";

  /* ── 티커 ────────────────────────────────────────────────── */
  const track = document.getElementById("tickerTrack");
  if (track) {
    const items = COURSES.map(
      (c) =>
        `<span class="ticker-item"><span class="sep">✦</span><b>${esc(c.name)}</b><span class="km tnum">${c.distance.toFixed(1)}KM</span><span>SAFETY ${c.safety.score}</span></span>`,
    ).join("");
    track.innerHTML = items + items; /* marquee 루프를 위해 2회 복제 */
  }

  /* ── 퀵 서치 ─────────────────────────────────────────────── */
  const qs = { tags: [], areas: [] };
  const qsCount = document.getElementById("qsCount");
  const qsGo = document.getElementById("qsGo");

  function qsUpdate() {
    const n = applyFilters(COURSES, {
      ...defaultFilterState(),
      tags: qs.tags,
      areas: qs.areas,
    }).length;
    qsCount.innerHTML = `지금 조건에 맞는 코스 <b class="tnum">${n}</b>개${n ? " — 바로 확인하세요" : " — 조건을 조금 넓혀보세요"}`;
  }
  document.querySelectorAll("[data-qs-tag]").forEach((b) => {
    b.addEventListener("click", () => {
      const t = b.dataset.qsTag;
      qs.tags = qs.tags.includes(t)
        ? qs.tags.filter((x) => x !== t)
        : [...qs.tags, t];
      b.classList.toggle("on");
      qsUpdate();
    });
  });
  document.querySelectorAll("[data-qs-area]").forEach((b) => {
    b.addEventListener("click", () => {
      const a = b.dataset.qsArea;
      qs.areas = qs.areas.includes(a)
        ? qs.areas.filter((x) => x !== a)
        : [...qs.areas, a];
      b.classList.toggle("on");
      qsUpdate();
    });
  });
  qsGo.addEventListener("click", () => {
    const p = new URLSearchParams();
    if (qs.tags.length) p.set("tags", qs.tags.join(","));
    if (qs.areas.length) p.set("areas", qs.areas.join(","));
    location.href = "/courses.html" + (p.toString() ? "?" + p.toString() : "");
  });
  qsUpdate();

  /* ── 투나잇 추천 (안전 점수 TOP 6) ───────────────────────── */
  const tonight = [...COURSES]
    .sort((a, b) => b.safety.score - a.safety.score)
    .slice(0, 6);
  renderCardGrid(document.getElementById("tonightGrid"), tonight);

  /* ── 세이프티 하이라이트 ─────────────────────────────────── */
  const avg = (fn) =>
    Math.round(COURSES.reduce((s, c) => s + fn(c), 0) / COURSES.length);
  const dims = [
    { kr: "가로등 조도", v: avg((c) => (c.safety.lighting / 5) * 100) },
    { kr: "쉼터 접근성", v: avg((c) => (c.safety.shelter / 5) * 100) },
    { kr: "야간 유동인구", v: avg((c) => (c.safety.crowd / 5) * 100) },
    { kr: "종합 안전 점수", v: AVG_SAFETY },
  ];
  document.getElementById("safetyBars").innerHTML = dims
    .map(
      (
        d,
      ) => `<div class="sbar"><label><span>${d.kr}</span><b class="tnum">${d.v}%</b></label>
      <div class="meter"><i class="bar-fill" style="width:${d.v}%"></i></div></div>`,
    )
    .join("");

  const statDefs = [
    { v: COURSES.length, kr: "CURATED COURSES", cls: "" },
    { v: TOTAL_KM.toFixed(1) + "KM", kr: "TOTAL ROUTE", cls: "cy" },
    { v: AVG_SAFETY, kr: "AVG SAFETY", cls: "" },
    { v: SHELTER_COUNT, kr: "SHELTER ROUTES", cls: "cy" },
  ];
  document.getElementById("safetyStats").innerHTML = statDefs
    .map(
      (s) =>
        `<div class="mini-stat ${s.cls} reveal"><b class="tnum">${s.v}</b><span>${s.kr}</span></div>`,
    )
    .join("");

  /* ── NIGHT COACH (Gemini 연동 예정 — 현재 목업 응답) ─────── */
  const coachA = document.getElementById("coachAnswer");
  const flat5 = COURSES.find(
    (c) =>
      c.tags.includes("flat") &&
      c.distance >= 4 &&
      c.distance <= 6 &&
      c.difficulty === "Easy",
  );
  const up = COURSES.find((c) => c.tags.includes("uphill"));
  const ANSWERS = {
    q1: `지금 데이터에서 가장 안전한 코스는 <b>${esc(best.nameKr)}</b>입니다. 안전 점수 <span class="c-cy tnum">${best.safety.score}점</span> — 조도 ${best.safety.lighting}/5, 야간 유동인구 ${best.safety.crowd}/5, 쉼터 ${best.safety.shelter}/5. ${esc(best.highlights[0])}이 특히 좋은 포인트예요. 다만 점수는 정보 기반 지표일 뿐, 실제 조도와 시설 상태는 현장 상황에 따라 달라질 수 있습니다.`,
    q2: `첫 야간 러닝이라면 <b>${esc(flat5.nameKr)}</b>을 추천합니다. ${flat5.distance.toFixed(1)}km 평지 루프라 무리 없이 30분대 완주가 가능하고, <span class="c-cy">화장실과 자판기</span>가 루트 위에 있어 중간에 멈추기도 편해요. 밝은 가로등 전 구간 설치로 야간 시야도 확보됩니다.`,
    q3: `업힐 훈련이라면 단연 <b>${esc(up.nameKr)}</b>. 총 고저차 <span class="c-cy tnum">+${up.elevation}M</span>에 정상 부근 야경이 보상이 됩니다. 난이도 HARD — 하산 때는 무릎 보호를 위해 보폭을 줄이고, 중간 쉼터에서 꼭 한 번 호흡을 정리하세요.`,
  };
  const coachDefault = coachA.innerHTML;
  let typeTimer = null;

  function typeAnswer(html) {
    clearInterval(typeTimer);
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    const text = tmp.textContent;
    coachA.innerHTML = "";
    coachA.classList.add("ai-caret");
    let i = 0;
    typeTimer = setInterval(() => {
      i += 2;
      coachA.textContent = text.slice(0, i);
      if (i >= text.length) {
        clearInterval(typeTimer);
        coachA.classList.remove("ai-caret");
        coachA.innerHTML = html; /* 하이라이트 마크업 복원 */
      }
    }, 22);
  }
  document.querySelectorAll("[data-q]").forEach((b) => {
    b.addEventListener("click", () => {
      document
        .querySelectorAll("[data-q]")
        .forEach((x) => x.classList.remove("on"));
      b.classList.add("on");
      typeAnswer(ANSWERS[b.dataset.q]);
    });
  });
  const resetCoach = document.getElementById("coachReset");
  if (resetCoach)
    resetCoach.addEventListener("click", () => {
      clearInterval(typeTimer);
      coachA.classList.remove("ai-caret");
      coachA.innerHTML = coachDefault;
      document
        .querySelectorAll("[data-q]")
        .forEach((x) => x.classList.remove("on"));
    });

  /* ── RUN TOGETHER 티저 ───────────────────────────────────── */
  const teaser = document.getElementById("mateTeaser");
  const renderTeaser = () => renderMateTeaser(teaser);
  Store.subscribe(renderTeaser);
  renderTeaser();

  revealInit(document.getElementById("homeRoot"));
});
