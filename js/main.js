/* ============================================================
   NIGHT RUNNER — js/main.js
   아이콘 · 스토어(LocalStorage) · 토스트 · 모달 · 리빌 · 헤더
   ============================================================ */

/* ── inline SVG 아이콘 (stroke 1.8, 24 viewBox) ─────────────── */
const svgI = (inner, size) =>
  `<svg width="${size || 18}" height="${size || 18}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;

const I = {
  moon: (s) => svgI(`<path d="M20 13.6A8.4 8.4 0 0 1 10.4 4a8.4 8.4 0 1 0 9.6 9.6Z"/>`, s),
  heart: (s, filled) => svgI(`<path d="M12 20.4 4.8 13a4.7 4.7 0 0 1 0-6.6 4.5 4.5 0 0 1 6.5 0l.7.7.7-.7a4.5 4.5 0 0 1 6.5 0 4.7 4.7 0 0 1 0 6.6L12 20.4Z"/>`, s).replace('fill="none"', filled ? 'fill="currentColor"' : 'fill="none"'),
  route: (s) => svgI(`<circle cx="6" cy="19" r="2.4"/><circle cx="18" cy="5" r="2.4"/><path d="M8.4 19H15a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h6.5"/>`, s),
  pin: (s) => svgI(`<path d="M12 21s7-5.8 7-11a7 7 0 1 0-14 0c0 5.2 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>`, s),
  clock: (s) => svgI(`<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>`, s),
  gauge: (s) => svgI(`<path d="M4 14.5a8 8 0 1 1 16 0"/><path d="M12 14.5 15.5 9"/><path d="M3 18.5h18"/>`, s),
  users: (s) => svgI(`<circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 19.5c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5"/><path d="M15.5 5.7a3.2 3.2 0 0 1 0 5.6M17.6 14.9c1.6.8 2.6 2.4 2.9 4.6"/>`, s),
  user: (s) => svgI(`<circle cx="12" cy="8" r="3.4"/><path d="M5.5 20c.7-3.6 3.2-5.6 6.5-5.6s5.8 2 6.5 5.6"/>`, s),
  restroom: (s) => svgI(`<rect x="3.5" y="4" width="17" height="16" rx="2"/><path d="M9 8v3.2M7.8 11.2h2.4M9 11.2V16M15 8l-1.4 8M13.6 16h2.8l-1.4-8z"/>`, s),
  drop: (s) => svgI(`<path d="M12 3.5s6 6.6 6 10.7a6 6 0 1 1-12 0C6 10.1 12 3.5 12 3.5Z"/><path d="M9.5 14a2.6 2.6 0 0 0 2.2 2.7"/>`, s),
  vending: (s) => svgI(`<rect x="5.5" y="3.5" width="13" height="17" rx="1.6"/><path d="M8.5 7h7M8.5 10.5h7M8.5 14h4"/>`, s),
  bench: (s) => svgI(`<path d="M4 10h16M5 10v-3M19 10V7M6.5 10l-1.5 7M17.5 10l1.5 7M8 14h8"/>`, s),
  store: (s) => svgI(`<path d="M4.5 8 6 4h12l1.5 4M4.5 8v11.5h15V8M4.5 8h15M10 19.5v-5.5h4v5.5"/>`, s),
  shelter: (s) => svgI(`<path d="M3.5 10.5 12 4l8.5 6.5M6 10v9.5M18 10v9.5M6 15h12"/>`, s),
  cctv: (s) => svgI(`<path d="m4 6.5 12.5-3 1.5 5.5-12.5 3L4 6.5Z"/><path d="M8 12.5V17h6M14 17h3.5M18.5 8.5l1.5 4"/>`, s),
  lamp: (s) => svgI(`<path d="M12 21V8M12 8c0-2.2 1.8-4 4-4h1M12 21h-3M12 21h3"/><path d="M17 6.5a2.3 2.3 0 1 1-2.3-2.3" fill="currentColor" stroke="none"/>`, s),
  hill: (s) => svgI(`<path d="m3 19 6.5-11L13 13l3-4 5 10H3Z"/>`, s),
  search: (s) => svgI(`<circle cx="10.5" cy="10.5" r="6.2"/><path d="m20 20-4.8-4.8"/>`, s),
  filter: (s) => svgI(`<path d="M4 6h16M7 12h10M10 18h4"/>`, s),
  map: (s) => svgI(`<path d="m9 4-5 2v14l5-2 6 2 5-2V4l-5 2-6-2ZM9 4v14M15 6v14"/>`, s),
  grid: (s) => svgI(`<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>`, s),
  arrowR: (s) => svgI(`<path d="M4 12h16M13.5 5.5 20 12l-6.5 6.5"/>`, s),
  arrowL: (s) => svgI(`<path d="M20 12H4M10.5 5.5 4 12l6.5 6.5"/>`, s),
  x: (s) => svgI(`<path d="m6 6 12 12M18 6 6 18"/>`, s),
  check: (s) => svgI(`<path d="m4.5 12.5 5 5L19.5 7"/>`, s),
  plus: (s) => svgI(`<path d="M12 5v14M5 12h14"/>`, s),
  spark: (s) => svgI(`<path d="M12 3.5 13.8 9l5.7 1.8-5.7 1.8L12 18l-1.8-5.4L4.5 10.8 10.2 9 12 3.5Z"/><path d="M19 15.5l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6Z" stroke-width="1.4"/>`, s),
  locate: (s) => svgI(`<circle cx="12" cy="12" r="6.5"/><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3"/>`, s),
  cal: (s) => svgI(`<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/>`, s),
  shield: (s) => svgI(`<path d="M12 3 5 5.8v5.4c0 4.4 2.9 7.6 7 9.3 4.1-1.7 7-4.9 7-9.3V5.8L12 3Z"/><path d="m9 11.5 2.2 2.2L15.5 9.5"/>`, s),
  flag: (s) => svgI(`<path d="M5.5 21V4M5.5 4.5C8 3 10.5 3 13 4.5s5 1.5 6.5.5v9c-1.5 1-4 1-6.5-.5s-5-1.5-7.5 0"/>`, s),
  trash: (s) => svgI(`<path d="M4.5 6.5h15M9.5 6V4.5h5V6M7 6.5l.8 13h8.4l.8-13M10.2 10v6M13.8 10v6"/>`, s),
  bolt: (s) => svgI(`<path d="M13 3 5 13.5h5.5L11 21l8-10.5h-5.5L13 3Z"/>`, s),
};

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ── 스토어: LocalStorage + pub/sub ─────────────────────────── */
const LS_KEY = { bm: "nightRunnerBookmarks", posts: "nightRunnerMatePosts", apps: "nightRunnerMateApplications" };

function readLS(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch (e) {
    return fallback;
  }
}

const Store = {
  bookmarks: [],
  posts: [],
  apps: [],
  _subs: [],

  init() {
    this.bookmarks = readLS(LS_KEY.bm, []);
    this.apps = readLS(LS_KEY.apps, []);
    if (localStorage.getItem(LS_KEY.posts) === null) {
      this.posts = SEED_POSTS.map((p) => ({ ...p }));
    } else {
      this.posts = readLS(LS_KEY.posts, []);
    }
  },
  persist() {
    localStorage.setItem(LS_KEY.bm, JSON.stringify(this.bookmarks));
    localStorage.setItem(LS_KEY.posts, JSON.stringify(this.posts));
    localStorage.setItem(LS_KEY.apps, JSON.stringify(this.apps));
    this._subs.forEach((fn) => fn());
    updateSavedBadge();
  },
  subscribe(fn) { this._subs.push(fn); },

  isBookmarked(id) { return this.bookmarks.some((b) => b.id === id); },
  toggleBookmark(id, name) {
    if (this.isBookmarked(id)) {
      this.bookmarks = this.bookmarks.filter((b) => b.id !== id);
      toast("북마크에서 제거했습니다", "warn");
    } else {
      this.bookmarks.unshift({ id, name: name || id, at: Date.now() });
      toast("코스를 저장했습니다 — MY RUN에서 확인하세요", "ok");
    }
    this.persist();
    requestAnimationFrame(() => {
      document.querySelectorAll(`[data-save="${id}"]`).forEach((b) => {
        b.classList.remove("heart-pop");
        void b.offsetWidth;
        b.classList.add("heart-pop");
      });
    });
  },

  isApplied(postId) { return this.apps.includes(postId); },
  applyTo(postId) {
    const p = this.posts.find((x) => x.id === postId);
    if (!p || this.isApplied(postId)) return;
    if (p.joined >= p.max) { toast("이미 마감된 모집입니다", "warn"); return; }
    p.joined += 1;
    this.apps.push(postId);
    this.persist();
    toast(`참여 신청 완료 — ${p.time}에 만나요!`, "ok");
  },
  cancelApp(postId) {
    const p = this.posts.find((x) => x.id === postId);
    if (p && this.isApplied(postId)) {
      p.joined = Math.max(0, p.joined - 1);
      this.apps = this.apps.filter((a) => a !== postId);
      this.persist();
      toast("참여 신청을 취소했습니다", "info");
    }
  },
  addPost(data) {
    const id = "p" + Date.now();
    this.posts.unshift({ id, joined: 0, mine: true, ...data });
    this.persist();
    toast("모집글이 등록되었습니다", "ok");
    return id;
  },
  deletePost(postId) {
    this.posts = this.posts.filter((p) => p.id !== postId);
    this.apps = this.apps.filter((a) => a !== postId);
    this.persist();
    toast("모집글을 삭제했습니다", "warn");
  },
  getPost(id) { return this.posts.find((p) => p.id === id); },
};

/* ── 토스트 ─────────────────────────────────────────────────── */
function toast(msg, type) {
  let wrap = document.getElementById("toastWrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.id = "toastWrap";
    wrap.className = "toast-wrap";
    document.body.appendChild(wrap);
  }
  const el = document.createElement("div");
  el.className = "toast toast-in " + (type || "ok");
  const ico = type === "warn" ? I.bolt(16) : type === "info" ? I.moon(16) : I.check(16);
  el.innerHTML = `<span class="t-ico">${ico}</span><span>${esc(msg)}</span>`;
  wrap.appendChild(el);
  setTimeout(() => {
    el.style.transition = "opacity .3s, transform .3s";
    el.style.opacity = "0";
    el.style.transform = "translateY(8px)";
    setTimeout(() => el.remove(), 320);
  }, 2600);
}

/* ── 모달 ───────────────────────────────────────────────────── */
function openModal(titleHtml, bodyHtml) {
  closeModal();
  const root = document.createElement("div");
  root.id = "modalRoot";
  root.className = "modal-back";
  root.innerHTML = `<div class="modal modal-in" role="dialog" aria-modal="true">
      <div class="modal-head"><h3>${titleHtml}</h3><button class="modal-x" data-close-modal aria-label="닫기">${I.x(16)}</button></div>
      <div class="modal-body">${bodyHtml}</div>
    </div>`;
  root.addEventListener("click", (e) => { if (e.target === root) closeModal(); });
  document.body.appendChild(root);
  document.body.style.overflow = "hidden";
}
function closeModal() {
  const r = document.getElementById("modalRoot");
  if (r) r.remove();
  document.body.style.overflow = "";
}
document.addEventListener("click", (e) => {
  if (e.target.closest("[data-close-modal]")) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

/* ── 스크롤 리빌 ────────────────────────────────────────────── */
const revObs = new IntersectionObserver(
  (entries) => entries.forEach((en) => {
    if (en.isIntersecting) {
      en.target.classList.add("in");
      revObs.unobserve(en.target);
    }
  }),
  { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
);
function revealInit(root) {
  (root || document).querySelectorAll(".reveal:not(.in)").forEach((el) => revObs.observe(el));
}

/* ── 헤더 / 뱃지 초기화 ─────────────────────────────────────── */
function updateSavedBadge() {
  document.querySelectorAll("[data-saved-count]").forEach((el) => {
    el.textContent = Store.bookmarks.length;
  });
}
function initHeader() {
  const file = (location.pathname.split("/").pop() || "index.html").replace(".html", "") || "index";
  const params = new URLSearchParams(location.search);
  let key = { index: "home", courses: "courses", "course-detail": "courses", mate: "mate", "my-run": "myrun" }[file] || "";
  if (file === "courses" && params.get("view") === "map") key = "map";
  document.querySelectorAll("[data-nav]").forEach((a) => {
    a.classList.toggle("active", a.dataset.nav === key);
  });
  updateSavedBadge();
}

document.addEventListener("DOMContentLoaded", () => {
  Store.init();
  initHeader();
  revealInit();
});
