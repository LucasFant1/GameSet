
let currentTab = "following";

async function getMyOwnActivity() {

  const myReviews = getMyReviews("Fenx");
  return Promise.all(myReviews.map(async (r) => {
    const game = await fetchGameById(r.gameKey);
    return {
      id: r.id || `${r.gameKey}-${r.date}`,
      user: "Fenx",
      game: game ? game.name : r.gameKey,
      gameKey: r.gameKey,
      cover: game && game.background_image ? game.background_image : "https://placehold.co/64x86/1e1b29/6b6679?text=?",
      stars: r.stars,
      text: r.text,
      likes: 0,
      comments: 0,
      time: r.date,
    };
  }));
}

async function getFeedForTab() {
  if (currentTab === "mine") return getMyOwnActivity();
  const following = getFollowing();
  const list = DEMO_COMMUNITY_REVIEWS.filter(r => following.includes(r.user));
  const coverMap = await resolveGameCovers(list.map(r => r.game));
  return list.map(r => ({ ...r, cover: coverMap[r.game] || r.cover }));
}

function renderCard(r) {
  const key = typeof r.id === "number" ? `review:community-${r.id}` : `review:${r.id}`;
  const engagement = getEngagement(key);
  const likeCount = r.likes + (engagement.liked ? 1 : 0);

  const el = document.createElement("article");
  el.className = "feedcard";
  el.innerHTML = `
    <img class="feedcard__cover" src="${r.cover}" alt="${r.game}" loading="lazy">
    <div class="feedcard__body">
      <div class="feedcard__head">
        <span class="avatar avatar--sm">${r.user[0].toUpperCase()}</span>
        <div class="feedcard__headtext">
          <b>${r.user}</b> reviewed <a class="feedcard__game">${r.game}</a>
          <div class="feedcard__stars">${scoreLabel(r.stars)}</div>
        </div>
        <span class="feedcard__time">${r.time}</span>
      </div>
      ${r.text ? `<p class="feedcard__text">"${r.text}"</p>` : ""}
      <div class="feedcard__actions">
        <button type="button" class="likebtn ${engagement.liked ? "is-liked" : ""}">
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
    const idOrSlug = r.gameKey || (DEMO_GAMES.find(g => g.name === r.game) || {}).slug || encodeURIComponent(r.game);
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

async function renderFeed() {
  const feed = document.getElementById("activityFeed");
  const emptyMsg = document.getElementById("activityEmpty");
  feed.innerHTML = `<p class="communityfeed__empty">Loading…</p>`;
  const list = await getFeedForTab();

  feed.innerHTML = "";
  if (!list.length) {
    emptyMsg.hidden = false;
    emptyMsg.textContent = currentTab === "mine"
      ? "You haven't reviewed any games yet. Why not start now?"
      : "No one you follow has any activity yet. Follow more people in the Friends tab!";
    return;
  }
  emptyMsg.hidden = true;
  list.forEach(r => feed.appendChild(renderCard(r)));
}

document.querySelectorAll("#activityTabs button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#activityTabs button").forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    currentTab = btn.dataset.tab;
    renderFeed();
  });
});

renderFeed();
