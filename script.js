const DEMO_REVIEWS = [
  { id: "home-1", user: "theo.dev", game: "Expedition 33", stars: 10, text: "The art direction and soundtrack carry this game on the shoulders of giants.", likes: 203, comments: 34, cover: DEMO_GAMES[4].background_image },
];

/* ---------- Rendering: game cards ---------- */
function renderGameCard(game) {
  const el = document.createElement("div");
  el.className = "gamecard";
  const img = game.background_image || "https://placehold.co/150x200/1e1b29/6b6679?text=No+cover";
  el.innerHTML = `
    <img class="gamecard__cover" src="${img}" alt="${game.name}" loading="lazy" decoding="async">
    <div class="gamecard__title">${game.name}</div>
    <div class="gamecard__rating">${starRating(game.rating)}</div>
  `;
  el.addEventListener("click", () => goToGame(game));
  return el;
}

/* ---------- Navigation to the review page ---------- */
function goToGame(game) {
  const payload = {
    id: game.id ?? null,
    slug: game.slug ?? null,
    name: game.name,
    background_image: game.background_image || null,
    rating: game.rating ?? null,
  };
  sessionStorage.setItem("gameset:lastGame", JSON.stringify(payload));
  const idOrSlug = game.slug || game.id || encodeURIComponent(game.name);
  window.location.href = `game.html?id=${idOrSlug}`;
}

function renderTrack(trackEl, games) {
  trackEl.innerHTML = "";
  [...games, ...games].forEach(g => trackEl.appendChild(renderGameCard(g)));
}

/* ---------- Rendering: reviews ---------- */
function renderReviews(reviews) {
  const list = document.getElementById("reviewsList");
  list.innerHTML = "";
  reviews.forEach(r => {
    const key = `review:${r.id}`;
    const engagement = getEngagement(key);
    const likeCount = r.likes + (engagement.liked ? 1 : 0);

    const el = document.createElement("div");
    el.className = "reviewcard";
    el.innerHTML = `
      <img class="reviewcard__cover" src="${r.cover}" alt="${r.game}">
      <div class="reviewcard__main">
        <div class="reviewcard__head"><span class="avatar avatar--sm">${r.user[0]}</span><b>${r.user}</b></div>
        <div class="reviewcard__game">${r.game}</div>
        <div class="reviewcard__stars">${scoreLabel(r.stars)}</div>
        <div class="reviewcard__text">"${r.text}"</div>
        <div class="reviewcard__actions">
          <button type="button" class="likebtn ${engagement.liked ? "is-liked" : ""}">
            <span class="likebtn__icon">♥</span> <span class="likebtn__count">${likeCount}</span>
          </button>
          <button type="button" class="replytogglebtn">💬 reply ${engagement.replies.length ? `(${engagement.replies.length})` : ""}</button>
          ${reportButtonHtml()}
        </div>
        <div class="replysection" hidden></div>
      </div>
    `;

    wireReportButton(el, { label: `Review by ${r.user} of ${r.game}`, excerpt: r.text });

    el.querySelector(".likebtn").addEventListener("click", (e) => {
      const liked = toggleLike(key);
      e.currentTarget.classList.toggle("is-liked", liked);
      e.currentTarget.querySelector(".likebtn__count").textContent = r.likes + (liked ? 1 : 0);
    });

    const replyToggle = el.querySelector(".replytogglebtn");
    replyToggle.addEventListener("click", () => {
      const section = el.querySelector(".replysection");
      const isHidden = section.hidden;
      section.hidden = !isHidden;
      if (isHidden) {
        renderReplySection(section, key, () => {
          replyToggle.textContent = `💬 reply (${getEngagement(key).replies.length})`;
        }, r.game);
      }
    });

    list.appendChild(el);
  });
}

/* ---------- Donut chart (pure SVG, no libs) ---------- */
function renderDonutChart(svgEl, slices, gapDeg = 2.5) {
  const cx = 70, cy = 70, r = 58, strokeWidth = 14;
  const circumference = 2 * Math.PI * r;
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const gap = (gapDeg / 360) * circumference;
  const minLen = circumference * 0.035; 

  svgEl.innerHTML = "";

  // background track
  const track = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  track.setAttribute("cx", cx); track.setAttribute("cy", cy); track.setAttribute("r", r);
  track.setAttribute("fill", "none");
  track.setAttribute("stroke", "#1e1b29");
  track.setAttribute("stroke-width", strokeWidth);
  svgEl.appendChild(track);

  let offset = 0;
  slices.forEach(slice => {
    if (slice.value <= 0) return;
    const rawLen = (slice.value / total) * circumference;
    const len = Math.max(rawLen - gap, minLen);
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", cx); circle.setAttribute("cy", cy); circle.setAttribute("r", r);
    circle.setAttribute("fill", "none");
    circle.setAttribute("stroke", slice.color);
    circle.setAttribute("stroke-width", strokeWidth);
    circle.setAttribute("stroke-linecap", "butt");
    circle.setAttribute("stroke-dasharray", `${len} ${circumference - len}`);
    circle.setAttribute("stroke-dashoffset", -offset);
    svgEl.appendChild(circle);
    offset += rawLen;
  });
}

/* ---------- Bar chart (score distribution) ---------- */
function renderBarChart(containerEl, values) {
  containerEl.innerHTML = "";
  const max = Math.max(...values, 1);
  values.forEach(v => {
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.height = `${Math.max((v / max) * 60, 4)}px`;
    containerEl.appendChild(bar);
  });
}

/* ---------- Carousel arrows + auto loop ---------- */
function setupRailArrows() {
  document.querySelectorAll(".rail__wrap").forEach(wrap => {
    const track = wrap.querySelector(".rail__track");
    const prev = wrap.querySelector(".rail__nav--prev");
    const next = wrap.querySelector(".rail__nav--next");
    const cardStep = () => {
      const card = track.querySelector(".gamecard");
      if (!card) return 300;
      const style = getComputedStyle(track);
      return card.getBoundingClientRect().width + parseFloat(style.gap || 16);
    };
    prev.addEventListener("click", () => { pauseAutoScroll(track); track.scrollBy({ left: -cardStep(), behavior: "smooth" }); });
    next.addEventListener("click", () => { pauseAutoScroll(track); track.scrollBy({ left: cardStep(), behavior: "smooth" }); });
  });
}

const railPauseTimers = new WeakMap();
function pauseAutoScroll(track) {
  track.dataset.paused = "true";
  clearTimeout(railPauseTimers.get(track));
  railPauseTimers.set(track, setTimeout(() => { track.dataset.paused = ""; }, 2500));
}

function setupInfiniteRails() {
  document.querySelectorAll(".rail__track").forEach(track => {
    track.addEventListener("mouseenter", () => (track.dataset.hover = "true"));
    track.addEventListener("mouseleave", () => (track.dataset.hover = ""));

    let last = performance.now();
    function step(now) {
      const dt = now - last;
      last = now;
      if (track.dataset.paused !== "true" && track.dataset.hover !== "true" && track.scrollWidth > track.clientWidth) {
        track.scrollLeft += dt * 0.03; // loop speed
        const half = track.scrollWidth / 2;
        if (track.scrollLeft >= half) track.scrollLeft -= half;
      }
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

/* ---------- Hero phrase with "text scramble" effect ---------- */
const HERO_PHRASES = [
  "What did you play?",
  "You get the Platinum trophy for?",
  "What is your rating for the release?",
];

class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = "!<>-_\\/[]{}—=+*^?#________";
    this.frame = 0;
    this.frameRequest = null;
    this.resolve = null;
  }
  setText(newText) {
    const oldText = this.el.textContent;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise(resolve => (this.resolve = resolve));
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || "";
      const to = newText[i] || "";
      const start = Math.floor(Math.random() * 20);
      const end = start + Math.floor(Math.random() * 20) + 10;
      this.queue.push({ from, to, start, end });
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }
  update() {
    let output = "";
    let complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += `<span class="hero__cycle-scramble">${char}</span>`;
      } else {
        output += from;
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(() => { this.frame++; this.update(); });
    }
  }
  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

function startHeroCycle() {
  const el = document.getElementById("heroCycle");
  if (!el) return;
  const fx = new TextScramble(el);
  let i = 0;
  const next = () => {
    i = (i + 1) % HERO_PHRASES.length;
    fx.setText(HERO_PHRASES[i]).then(() => {
      setTimeout(next, 3000);
    });
  };
  setTimeout(next, 3000);
}

/* ---------- Initialization ---------- */
/* ---------- Your latest reviews (in the card next to the chart) ---------- */
async function renderRecentReviews() {
  const container = document.getElementById("recentReviewsList");
  const emptyMsg = document.getElementById("recentReviewsEmpty");
  const reviews = getMyReviews("Fenx").slice(0, 3);

  container.innerHTML = "";
  emptyMsg.hidden = reviews.length > 0;

  for (const r of reviews) {
    const game = await fetchGameById(r.gameKey);
    const gameName = game ? game.name : r.gameKey;
    const cover = game && game.background_image ? game.background_image : "https://placehold.co/60x80/1e1b29/6b6679?text=?";

    const el = document.createElement("div");
    el.className = "recentreview-item";
    el.innerHTML = `<img src="${cover}" alt="${gameName}" title="${gameName}">`;
    el.addEventListener("click", () => { window.location.href = `game.html?id=${r.gameKey}`; });
    container.appendChild(el);
  }
}

/* ---------- Popular tier lists from other users ---------- */
async function renderPopularTierlists() {
  const grid = document.getElementById("homeTierlistsGrid");
  const all = [...getOwnTierLists(), ...DEMO_TIERLISTS].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 3);

  grid.innerHTML = "";
  const hydrated = await Promise.all(all.map(hydrateTierListCovers));

  hydrated.forEach(list => {
    const defs = getTierDefs(list);
    const totalGames = defs.reduce((sum, def) => sum + (list.tiers[def.key]?.length || 0), 0);
    const previewRows = defs.map(def => {
      const games = list.tiers[def.key] || [];
      if (!games.length) return "";
      const thumbs = games.slice(0, 5).map(g => `<img src="${g.cover}" alt="${g.name}">`).join("");
      return `<div class="tlcard__row"><span class="tlcard__tier" style="background:${def.color}">${def.label}</span><div class="tlcard__thumbs">${thumbs}</div></div>`;
    }).join("");

    const el = document.createElement("div");
    el.className = "tlcard";
    el.innerHTML = `
      <div class="tlcard__head">
        <div><h3>${list.title}</h3><span class="tlcard__author">by ${list.isDemo ? list.author : "you"} · ${totalGames} games</span></div>
        <span class="tlcard__likes-static">♥ ${list.likes || 0}</span>
      </div>
      <div class="tlcard__preview">${previewRows}</div>
    `;
    el.addEventListener("click", () => { window.location.href = `tierlist-editor.html?view=${list.id}`; });
    grid.appendChild(el);
  });
}

/* ---------- Real stats, calculated from your own reviews ---------- */
function renderMyStats() {
  const reviews = getMyReviews("Fenx");
  const comments = getMyComments("Fenx");

  // count by status (old reviews without a status count as "played")
  const counts = { jogado: 0, zerado: 0, platinado: 0, dropado: 0 };
  reviews.forEach(r => {
    const s = counts[r.status] !== undefined ? r.status : "jogado";
    counts[s]++;
  });

  // "Played" = everything you logged (platinum/beaten also means you played it)
  const totalPlayed = reviews.length - counts.dropado;
  document.getElementById("statPlayed").textContent = totalPlayed;
  document.getElementById("statPlatined").textContent = counts.platinado;
  document.getElementById("statReviews").textContent = reviews.length;
  document.getElementById("statFinished").textContent = counts.zerado;
  document.getElementById("statComments").textContent = comments.length;
  document.getElementById("donutTotal").textContent = reviews.length;

  renderDonutChart(document.getElementById("pieChart"), [
    { value: counts.jogado,    color: "#8b5cf6" },
    { value: counts.zerado,    color: "#38bdf8" },
    { value: counts.platinado, color: "#facc15" },
    { value: counts.dropado,   color: "#6b6679" },
  ]);

  // distribution of your scores: one bar for each score from 1 to 10
  const buckets = new Array(10).fill(0);
  reviews.forEach(r => {
    const idx = Math.min(Math.max(Math.round(r.stars) - 1, 0), 9);
    buckets[idx]++;
  });
  renderBarChart(document.getElementById("barChart"), buckets);
}

async function init() {
  if (!hasApiKey) {
    console.info(
      "%cGAMESET — demo mode",
      "color:#a855f7;font-weight:bold;",
      "\nPaste your RAWG API key into RAWG_API_KEY (script.js) to pull real games."
    );
  }

  const trending = await fetchTrendingGames();
  renderTrack(document.getElementById("trendTrack"), trending);
  renderTrack(document.getElementById("friendsTrack"), trending.slice().reverse());

  const { results: recentReleases } = await fetchGamesList({ sortKey: "released", pageSize: 18 });
  renderTrack(document.getElementById("recentTrack"), recentReleases);

  const reviewCovers = await resolveGameCovers(DEMO_REVIEWS.map(r => r.game));
  renderReviews(DEMO_REVIEWS.map(r => ({ ...r, cover: reviewCovers[r.game] || r.cover })));

  renderMyStats();
  renderRecentReviews();
  renderPopularTierlists();

  setupRailArrows();
  setupInfiniteRails();
  startHeroCycle();
}

init();