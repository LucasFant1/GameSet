/* ============================================================
   GAMESET — game.js  (game review page)
   Depends on api.js, which must be loaded before this file.
   ============================================================ */

const params = new URLSearchParams(window.location.search);
const gameIdOrSlug = params.get("id");
let currentGame = null;
let selectedRating = 0;
let spoilerFlag = false;

/* ---------- Key used to store this game's reviews ---------- */
function gameKeyFor(game) {
  return String(game.slug || game.id || game.name);
}

/* ---------- Render the game's data ---------- */
function renderGame(game) {
  document.getElementById("gameLoading").hidden = true;
  document.getElementById("gameHero").hidden = false;
  document.getElementById("rateBox").hidden = false;

  document.getElementById("gameCover").src =
    game.background_image || "https://placehold.co/340x460/1e1b29/6b6679?text=No+cover";
  document.getElementById("gameTitle").textContent = game.name;
  document.title = `${game.name} — GameSet`;

  const metaParts = [];
  if (game.released) metaParts.push(new Date(game.released).getFullYear());
  const genres = (game.genres || []).map(g => g.name).slice(0, 3).join(", ");
  if (genres) metaParts.push(genres);
  const platforms = (game.platforms || []).map(p => p.platform?.name).filter(Boolean).slice(0, 3).join(", ");
  if (platforms) metaParts.push(platforms);
  document.getElementById("gameMeta").textContent = metaParts.join(" · ");

  document.getElementById("gameDesc").textContent =
    game.description_raw ? truncate(game.description_raw, 420) : "No description available for this game.";

  renderCommunityStats(game);
  renderCommunityReviews(game);
  renderRelatedGames(game);
}

/* ---------- Related games ---------- */
async function renderRelatedGames(game) {
  const section = document.getElementById("relatedGamesSection");
  const grid = document.getElementById("relatedGamesGrid");
  const related = await fetchRelatedGames(game);

  if (!related.length) { section.hidden = true; return; }
  section.hidden = false;
  grid.innerHTML = "";

  related.forEach(g => {
    const el = document.createElement("div");
    el.className = "relatedgame";
    const img = g.background_image || "https://placehold.co/150x200/1e1b29/6b6679?text=No+cover";
    el.innerHTML = `
      <img src="${img}" alt="${g.name}" loading="lazy">
      <span class="relatedgame__name">${g.name}</span>
      <span class="relatedgame__rating">★ ${(g.rating || 0).toFixed(1)}</span>
    `;
    el.addEventListener("click", () => {
      const idOrSlug = g.slug || g.id || encodeURIComponent(g.name);
      window.location.href = `game.html?id=${idOrSlug}`;
    });
    grid.appendChild(el);
  });
}

function truncate(text, max) {
  if (text.length <= max) return text;
  return text.slice(0, max).trim() + "…";
}

/* ---------- Community stats (local + base rating from the API) ----------
   Local reviews are already 0–10; the API rating is 0–5, so it's
   converted before entering the average to avoid mixing the scales. */
function renderCommunityStats(game) {
  const reviews = getReviewsFor(gameKeyFor(game));
  const localSum = reviews.reduce((s, r) => s + r.stars, 0);
  const baseRating10 = apiRatingTo10(game.rating);

  const combinedAvg = baseRating10 > 0
    ? (localSum + baseRating10) / (reviews.length + 1)
    : (reviews.length ? localSum / reviews.length : 0);

  document.getElementById("communityAvg").textContent = combinedAvg ? `${combinedAvg.toFixed(1)}/10` : "—";
  document.getElementById("communityCount").textContent = reviews.length + (game.ratings_count ? ` + ${game.ratings_count}` : "");
}

/* ---------- Community review list ---------- */
function renderCommunityReviews(game) {
  const list = document.getElementById("communityReviews");
  const emptyMsg = document.getElementById("noReviews");
  const reviews = getReviewsFor(gameKeyFor(game));

  list.innerHTML = "";
  emptyMsg.hidden = reviews.length > 0;

  reviews.forEach(r => {
    const key = `review:${r.id || r.date + r.user}`;
    const engagement = getEngagement(key);
    const likeCount = (r.baseLikes || 0) + (engagement.liked ? 1 : 0);

    const el = document.createElement("div");
    el.className = "reviewcard";
    el.innerHTML = `
      <div class="reviewcard__cover reviewcard__cover--avatar avatar">${r.user[0]}</div>
      <div class="reviewcard__main">
        <div class="reviewcard__head"><b>${r.user}</b><span class="reviewcard__date">${r.date}</span></div>
        <div class="reviewcard__stars">${scoreLabel(r.stars)}</div>
        ${r.status ? statusBadgeHtml(r.status) : ""}
        ${r.spoiler ? '<div class="reviewcard__spoiler-tag">contains spoilers</div>' : ""}
        ${r.text ? `<div class="reviewcard__text">"${r.text}"</div>` : ""}
        <div class="reviewcard__actions">
          <button type="button" class="likebtn ${engagement.liked ? "is-liked" : ""}" data-key="${key}">
            <span class="likebtn__icon">♥</span> <span class="likebtn__count">${likeCount}</span>
          </button>
          <button type="button" class="replytogglebtn" data-key="${key}">💬 reply ${engagement.replies.length ? `(${engagement.replies.length})` : ""}</button>
          ${reportButtonHtml()}
        </div>
        <div class="replysection" data-key="${key}" hidden></div>
      </div>
    `;

    wireReportButton(el, { label: `Review by ${r.user} of ${game.name}`, excerpt: r.text });

    el.querySelector(".likebtn").addEventListener("click", (e) => {
      const liked = toggleLike(key);
      e.currentTarget.classList.toggle("is-liked", liked);
      e.currentTarget.querySelector(".likebtn__count").textContent = (r.baseLikes || 0) + (liked ? 1 : 0);
    });

    el.querySelector(".replytogglebtn").addEventListener("click", (e) => {
      const section = el.querySelector(".replysection");
      const isHidden = section.hidden;
      section.hidden = !isHidden;
      if (isHidden) renderReplySection(section, key, () => {
        e.currentTarget.textContent = `💬 reply (${getEngagement(key).replies.length})`;
      }, game.name);
    });

    list.appendChild(el);
  });
}

/* ---------- Star picker ---------- */
const stars = Array.from(document.querySelectorAll("#starPicker .star"));
const ratingValueEl = document.getElementById("ratingValue");

function paintStars(value) {
  stars.forEach(s => s.classList.toggle("is-filled", Number(s.dataset.value) <= value));
}

stars.forEach(star => {
  star.addEventListener("mouseenter", () => paintStars(Number(star.dataset.value)));
  star.addEventListener("click", () => {
    selectedRating = Number(star.dataset.value);
    paintStars(selectedRating);
    ratingValueEl.textContent = `Your score: ${selectedRating} / 10`;
  });
});
document.getElementById("starPicker").addEventListener("mouseleave", () => paintStars(selectedRating));

/* ---------- Spoiler toggle ---------- */
const spoilerToggle = document.getElementById("spoilerToggle");
spoilerToggle.addEventListener("click", () => {
  spoilerFlag = !spoilerFlag;
  spoilerToggle.setAttribute("aria-pressed", String(spoilerFlag));
});

/* ---------- Game status (played / completed / platinum / dropped) ---------- */
let selectedStatus = "jogado"; // default: whoever reviewed it, played it
const statusButtons = document.querySelectorAll(".statusbtn");
statusButtons.forEach(btn => {
  if (btn.dataset.status === selectedStatus) btn.classList.add("is-active");
  btn.addEventListener("click", () => {
    statusButtons.forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    selectedStatus = btn.dataset.status;
  });
});

/* ---------- Submit review ---------- */
document.getElementById("submitReview").addEventListener("click", () => {
  const msg = document.getElementById("submitMsg");
  if (!currentGame) return;

  if (selectedRating === 0) {
    msg.textContent = "Choose at least one star before submitting.";
    msg.className = "ratebox__msg is-error";
    return;
  }

  const review = {
    id: "rev-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    user: "Fenx",
    stars: selectedRating,
    status: selectedStatus,
    text: document.getElementById("reviewText").value.trim(),
    spoiler: spoilerFlag,
    date: nowStamp(),
  };

  saveReview(gameKeyFor(currentGame), review);

  msg.textContent = "Review published!";
  msg.className = "ratebox__msg is-success";

  document.getElementById("reviewText").value = "";
  spoilerFlag = false;
  spoilerToggle.setAttribute("aria-pressed", "false");

  renderCommunityStats(currentGame);
  renderCommunityReviews(currentGame);
});

/* ---------- Initialization ---------- */
async function init() {
  if (!gameIdOrSlug) {
    document.getElementById("gameLoading").textContent = "No game specified.";
    return;
  }

  // Show something instantly if we came from a click on the home page
  try {
    const cached = JSON.parse(sessionStorage.getItem("gameset:lastGame"));
    if (cached && String(cached.slug || cached.id) === String(gameIdOrSlug)) {
      currentGame = cached;
      renderGame(cached);
    }
  } catch { /* ignore */ }

  const game = await fetchGameById(gameIdOrSlug);
  currentGame = game;
  renderGame(game);
}

init();