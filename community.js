
/* ---------- State ---------- */
let currentTab = "recent";
let visibleCount = 6;
const PAGE_SIZE = 6;

function getFilteredReviews() {
  let list = [...DEMO_COMMUNITY_REVIEWS];
  if (currentTab === "popular") {
    list.sort((a, b) => b.likes - a.likes);
  } else if (currentTab === "following") {
    const following = getFollowing();
    list = list.filter(r => following.includes(r.user));
  }
  return list;
}

/* ---------- Real game covers (via API, with a demo fallback) ---------- */
let coverMap = {};

/* ---------- Feed rendering ---------- */
function renderFeed() {
  const feed = document.getElementById("communityFeed");
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  const list = getFilteredReviews();
  const slice = list.slice(0, visibleCount);

  feed.innerHTML = "";

  if (!slice.length) {
    feed.innerHTML = `<p class="communityfeed__empty">No reviews here yet. Follow more people to fill up this feed!</p>`;
    loadMoreBtn.hidden = true;
    return;
  }

  slice.forEach(r => feed.appendChild(renderFeedCard(r)));
  loadMoreBtn.hidden = visibleCount >= list.length;
}

function renderFeedCard(r) {
  const el = document.createElement("article");
  el.className = "feedcard";
  const key = `review:community-${r.id}`;
  const engagement = getEngagement(key);
  const likeCount = r.likes + (engagement.liked ? 1 : 0);

  el.innerHTML = `
    <img class="feedcard__cover" src="${coverMap[r.game] || r.cover}" alt="${r.game}" loading="lazy">
    <div class="feedcard__body">
      <div class="feedcard__head">
        <span class="avatar avatar--sm">${r.user[0].toUpperCase()}</span>
        <div class="feedcard__headtext">
          <b>${r.user}</b> reviewed <a class="feedcard__game">${r.game}</a>
          <div class="feedcard__stars">${scoreLabel(r.stars)}</div>
        </div>
        <span class="feedcard__time">${r.time}</span>
      </div>
      <p class="feedcard__text">"${r.text}"</p>
      <div class="feedcard__actions">
        <button type="button" class="likebtn ${engagement.liked ? "is-liked" : ""}" data-id="${r.id}">
          <span class="likebtn__icon">♥</span> <span class="likebtn__count">${likeCount}</span>
        </button>
        <button type="button" class="replytogglebtn">💬 ${r.comments + engagement.replies.length} comments</button>
        ${reportButtonHtml()}
      </div>
      <div class="replysection" hidden></div>
    </div>
  `;

  wireReportButton(el, { label: `Review by ${r.user} of ${r.game}`, excerpt: r.text });

  el.querySelector(".feedcard__game").addEventListener("click", () => {
    const game = DEMO_GAMES.find(g => g.name === r.game);
    const idOrSlug = game ? (game.slug || game.id) : encodeURIComponent(r.game);
    window.location.href = `game.html?id=${idOrSlug}`;
  });

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
        replyToggle.textContent = `💬 ${r.comments + getEngagement(key).replies.length} comments`;
      }, r.game);
    }
  });

  return el;
}

/* ---------- Tabs ---------- */
document.querySelectorAll("#communityTabs button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#communityTabs button").forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    currentTab = btn.dataset.tab;
    visibleCount = PAGE_SIZE;
    renderFeed();
  });
});

/* ---------- Load more ---------- */
document.getElementById("loadMoreBtn").addEventListener("click", () => {
  visibleCount += PAGE_SIZE;
  renderFeed();
});

/* ---------- Sidebar: trending ---------- */
async function renderSideTrending() {
  const list = document.getElementById("sideTrending");
  list.innerHTML = "";
  const games = await fetchTrendingGames();
  const top = [...games].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5);
  top.forEach(g => {
    const li = document.createElement("li");
    li.innerHTML = `
      <img src="${g.background_image}" alt="${g.name}">
      <span class="sidecard__gamename">${g.name}</span>
      <span class="sidecard__gamerating">★ ${(g.rating || 0).toFixed(1)}</span>
    `;
    li.addEventListener("click", () => {
      window.location.href = `game.html?id=${g.slug || g.id}`;
    });
    list.appendChild(li);
  });
}

/* ---------- Sidebar: top reviewers ---------- */
function renderSideReviewers() {
  const counts = {};
  DEMO_COMMUNITY_REVIEWS.forEach(r => { counts[r.user] = (counts[r.user] || 0) + 1; });
  const ranked = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const list = document.getElementById("sideReviewers");
  list.innerHTML = "";
  ranked.forEach(([user, count]) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="avatar avatar--sm">${user[0].toUpperCase()}</span>
      <span class="sidecard__reviewername">${user}</span>
      <span class="sidecard__reviewercount">${count} reviews</span>
    `;
    list.appendChild(li);
  });
}

/* ---------- Initialization ---------- */
async function init() {
  coverMap = await resolveGameCovers(DEMO_COMMUNITY_REVIEWS.map(r => r.game));
  renderFeed();
  renderSideTrending();
  renderSideReviewers();
}
init();
