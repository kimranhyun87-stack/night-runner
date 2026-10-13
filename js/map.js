/* ============================================================
   NIGHT RUNNER — js/map.js
   다크 루트 맵 · 전체 코스 오버뷰 맵 · 고저차 프로필 (SVG)
   실서비스에서는 Google Maps dark style로 대체 — 가이드 참고
   ============================================================ */

function _seed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function _lcg(seed) {
  let s = seed || 1;
  return function () {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const POI_STYLE = {
  restroom: { fill: "#52D8FF", label: "화장실" },
  vending: { fill: "#B6FF4A", label: "자판기" },
  shelter: { fill: "#FFB454", label: "쉼터" },
};

function _poiShape(p, i) {
  const px = p._x, py = p._y;
  const st = POI_STYLE[p.type];
  let shape;
  if (p.type === "restroom") shape = `<circle cx="${px}" cy="${py}" r="7"/>`;
  else if (p.type === "vending") shape = `<rect x="${px - 6}" y="${py - 6}" width="12" height="12" rx="2.5"/>`;
  else shape = `<path d="M ${px} ${py - 7.5} L ${px + 7} ${py + 5.5} L ${px - 7} ${py + 5.5} Z"/>`;
  return `<g class="poi"><title>${st.label}</title>
    <g fill="${st.fill}" stroke="#0B0E13" stroke-width="2" opacity="0.95" style="animation: fadeIn .5s ${0.9 + i * 0.12}s both">${shape}</g></g>`;
}

function _roads(rand, W, H, count) {
  let out = "";
  for (let i = 0; i < count; i++) {
    const x1 = rand() * W, y1 = rand() * H, x2 = rand() * W, y2 = rand() * H;
    const cx = (x1 + x2) / 2 + (rand() - 0.5) * 140, cy = (y1 + y2) / 2 + (rand() - 0.5) * 140;
    const main = i < 2;
    out += `<path d="M ${x1.toFixed(0)} ${y1.toFixed(0)} Q ${cx.toFixed(0)} ${cy.toFixed(0)} ${x2.toFixed(0)} ${y2.toFixed(0)}"
      fill="none" stroke="${main ? "#505864" : "#303741"}" stroke-width="${main ? 3 : 1.4}" opacity="${main ? 0.5 : 0.6}"/>`;
  }
  return out;
}

/* ── 단일 코스 상세 루트 맵 ─────────────────────────────────── */
function renderRouteMap(el, course) {
  const W = 760, H = 440, pad = 56;
  const px = (p) => [+(pad + p[0] * (W - pad * 2)).toFixed(1), +(pad + p[1] * (H - pad * 2)).toFixed(1)];
  const pts = course.route.map(px);
  const d = "M " + pts.map((p) => p.join(" ")).join(" L ");
  const rand = _lcg(_seed(course.id));
  const pois = course.pois.map((p) => ({ ...p, _x: pad + p.x * (W - pad * 2), _y: pad + p.y * (H - pad * 2) }));
  const [sx, sy] = pts[0];
  const [fx, fy] = pts[pts.length - 1];
  const rpId = "rp-" + course.id;

  el.innerHTML = `
  <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" role="img" aria-label="${esc(course.nameKr)} 루트 맵">
    <rect width="${W}" height="${H}" fill="#11151C"/>
    <g opacity="0.5">
      ${Array.from({ length: 9 }, (_, i) => `<line x1="${(i + 1) * (W / 10)}" y1="0" x2="${(i + 1) * (W / 10)}" y2="${H}" stroke="#1b212b" stroke-width="1"/>`).join("")}
      ${Array.from({ length: 5 }, (_, i) => `<line x1="0" y1="${(i + 1) * (H / 6)}" x2="${W}" y2="${(i + 1) * (H / 6)}" stroke="#1b212b" stroke-width="1"/>`).join("")}
    </g>
    ${_roads(rand, W, H, 8)}
    <path d="${d}" fill="none" stroke="#B6FF4A" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" opacity="0.13"/>
    <path id="${rpId}" class="route-draw" pathLength="1" d="${d}" fill="none" stroke="#B6FF4A" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
    ${pois.map(_poiShape).join("")}
    <circle cx="${sx}" cy="${sy}" r="9" fill="none" stroke="#F5F7FA" stroke-width="2" class="pulse-ring"/>
    <circle cx="${sx}" cy="${sy}" r="6.5" fill="#F5F7FA" stroke="#0B0E13" stroke-width="2.5"/>
    <circle cx="${fx}" cy="${fy}" r="6.5" fill="#FF5C5C" stroke="#0B0E13" stroke-width="2.5"/>
    <circle r="4.6" fill="#B6FF4A" stroke="#0B0E13" stroke-width="1.6">
      <animateMotion dur="16s" repeatCount="indefinite"><mpath href="#${rpId}" xlink:href="#${rpId}"/></animateMotion>
    </circle>
    <text x="20" y="30" fill="#6F7784" font-family="Space Grotesk" font-size="11" font-weight="700" letter-spacing="3">RUN ROUTE — ${esc(course.name)}</text>
    <text x="${W - 20}" y="30" fill="#6F7784" font-family="Space Grotesk" font-size="10" letter-spacing="2" text-anchor="end">N ▲</text>
    <line x1="20" y1="${H - 24}" x2="110" y2="${H - 24}" stroke="#6F7784" stroke-width="2"/>
    <text x="120" y="${H - 20}" fill="#6F7784" font-family="Space Grotesk" font-size="10" letter-spacing="2">500M</text>
    <text x="${W - 20}" y="${H - 20}" fill="#6F7784" font-family="Space Grotesk" font-size="10" letter-spacing="2" text-anchor="end">${course.coords.lat.toFixed(4)}N ${course.coords.lng.toFixed(4)}E</text>
  </svg>
  <ul class="map-legend">
    <li><span class="lg-line" style="background:#B6FF4A"></span>러닝 루트 ${course.distance.toFixed(1)}km</li>
    <li><span class="lg-dot" style="background:#F5F7FA;border-color:#F5F7FA"></span>출발</li>
    <li><span class="lg-dot" style="background:#FF5C5C;border-color:#FF5C5C"></span>도착</li>
    <li><span class="lg-dot" style="background:#52D8FF;border-color:#52D8FF"></span>화장실</li>
    <li><span class="lg-dot" style="background:#B6FF4A;border-color:#B6FF4A;border-radius:3px"></span>자판기</li>
    <li><span class="lg-dot" style="background:#FFB454;border-color:#FFB454"></span>쉼터</li>
  </ul>
  <div class="map-hud">
    <span>GRID SEOUL · DARK MAP</span>
    <span>POI ${course.pois.length} · ELEV +${course.elevation}M</span>
  </div>`;
}

/* ── 전체 코스 오버뷰 맵 ────────────────────────────────────── */
function renderOverviewMap(el, opts) {
  const W = 380, H = 580, cols = 3;
  const cellW = W / cols, cellH = H / Math.ceil(COURSES.length / cols);
  const inset = 20;
  const rand = _lcg(_seed("seoul-night"));

  const cells = COURSES.map((c, i) => {
    const col = i % cols, row = Math.floor(i / cols);
    const x0 = col * cellW + inset, y0 = row * cellH + inset;
    const iw = cellW - inset * 2, ih = cellH - inset * 2;
    const pts = c.route.map((p) => [(x0 + p[0] * iw).toFixed(1), (y0 + p[1] * ih).toFixed(1)]);
    const d = "M " + pts.map((p) => p.join(" ")).join(" L ");
    return `<g class="ov-course" data-id="${c.id}" data-name="${esc(c.nameKr)}">
      <rect x="${col * cellW + 4}" y="${row * cellH + 4}" width="${cellW - 8}" height="${cellH - 8}" rx="10" fill="transparent"/>
      <text x="${col * cellW + 14}" y="${row * cellH + 22}" fill="#3a4350" font-family="Space Grotesk" font-size="10" font-weight="700" letter-spacing="2">${String(i + 1).padStart(2, "0")}</text>
      <path d="${d}" fill="none" stroke="#B6FF4A" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.72"/>
      <circle cx="${pts[0][0]}" cy="${pts[0][1]}" r="3" fill="#F5F7FA"/>
    </g>`;
  }).join("");

  el.innerHTML = `
  <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="전체 코스 맵">
    <rect width="${W}" height="${H}" rx="10" fill="#11151C"/>
    <g stroke="#1b212b" stroke-width="1">${Array.from({ length: 8 }, (_, i) => `<line x1="${(i + 1) * (W / 9)}" y1="0" x2="${(i + 1) * (W / 9)}" y2="${H}"/>`).join("")}${Array.from({ length: 12 }, (_, i) => `<line x1="0" y1="${(i + 1) * (H / 13)}" x2="${W}" y2="${(i + 1) * (H / 13)}"/>`).join("")}</g>
    <path d="M -20 ${H * 0.72} Q ${W * 0.3} ${H * 0.6} ${W * 0.55} ${H * 0.66} T ${W + 20} ${H * 0.5}" fill="none" stroke="#20303c" stroke-width="16" opacity="0.7"/>
    ${_roads(rand, W, H, 6)}
    ${cells}
    <text x="14" y="${H - 14}" fill="#6F7784" font-family="Space Grotesk" font-size="10" letter-spacing="2.5">SEOUL · ${COURSES.length} NIGHT ROUTES</text>
  </svg>`;

  el.querySelectorAll(".ov-course").forEach((g) => {
    g.addEventListener("mouseenter", () => {
      el.querySelectorAll(".ov-course").forEach((o) => {
        o.classList.toggle("hot", o === g);
        o.classList.toggle("dim", o !== g);
      });
      if (opts.onHover) opts.onHover(g.dataset.id, g.dataset.name);
    });
    g.addEventListener("mouseleave", () => {
      el.querySelectorAll(".ov-course").forEach((o) => o.classList.remove("hot", "dim"));
      if (opts.onHover) opts.onHover(null);
    });
    g.addEventListener("click", () => { location.href = "/course-detail.html?id=" + g.dataset.id; });
  });
}

/* ── 고저차 프로필 ──────────────────────────────────────────── */
function renderElevChart(el, course) {
  const W = 760, H = 150, pl = 46, pr = 16, pt = 18, pb = 26;
  const e = course.elev;
  const min = Math.min(...e), max = Math.max(...e);
  const X = (i) => pl + (i / (e.length - 1)) * (W - pl - pr);
  const Y = (v) => pt + (1 - (v - min) / Math.max(1, max - min)) * (H - pt - pb);
  const line = e.map((v, i) => `${i ? "L" : "M"} ${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(" ");
  const area = line + ` L ${X(e.length - 1).toFixed(1)} ${H - pb} L ${pl} ${H - pb} Z`;
  const maxI = e.indexOf(max);

  el.innerHTML = `
  <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="고저차 프로필">
    <rect width="${W}" height="${H}" fill="#11151C" rx="10"/>
    ${[0.25, 0.5, 0.75].map((t) => `<line x1="${pl}" y1="${pt + t * (H - pt - pb)}" x2="${W - pr}" y2="${pt + t * (H - pt - pb)}" stroke="#1b212b" stroke-width="1"/>`).join("")}
    <path d="${area}" fill="rgba(182,255,74,0.1)"/>
    <path d="${line}" fill="none" stroke="#B6FF4A" stroke-width="2.2" stroke-linejoin="round"/>
    <circle cx="${X(maxI)}" cy="${Y(max)}" r="4" fill="#B6FF4A" stroke="#0B0E13" stroke-width="2"/>
    <text x="${X(maxI)}" y="${Y(max) - 10}" fill="#B6FF4A" font-family="Space Grotesk" font-size="11" font-weight="700" text-anchor="middle">+${course.elevation}M</text>
    <text x="${pl}" y="${H - 8}" fill="#6F7784" font-family="Space Grotesk" font-size="10" letter-spacing="1">0 KM</text>
    <text x="${W - pr}" y="${H - 8}" fill="#6F7784" font-family="Space Grotesk" font-size="10" letter-spacing="1" text-anchor="end">${course.distance.toFixed(1)} KM</text>
    <text x="${pl - 8}" y="${pt + 4}" fill="#6F7784" font-family="Space Grotesk" font-size="10" text-anchor="end">${max}m</text>
    <text x="${pl - 8}" y="${H - pb}" fill="#6F7784" font-family="Space Grotesk" font-size="10" text-anchor="end">${min}m</text>
  </svg>`;
}
