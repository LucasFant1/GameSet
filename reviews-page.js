
function renderMyReviews() {
  const list = document.getElementById("myReviewsList");
  const emptyMsg = document.getElementById("myReviewsEmpty");
  const reviews = getMyReviews("Fenx");

  list.innerHTML = "";
  emptyMsg.hidden = reviews.length > 0;

  reviews.forEach(r => {
    const game = DEMO_GAMES.find(g => (g.slug || g.id) === r.gameKey);
    const gameName = game ? game.name : r.gameKey;
    const cover = game ? game.background_image : "https://placehold.co/70x94/1e1b29/6b6679?text=?";
    const key = `review:${r.id || r.date + r.user}`;
    const engagement = getEngagement(key);

    const el = document.createElement("div");
    el.className = "reviewcard";
    el.innerHTML = `
      <img class="reviewcard__cover" src="${cover}" alt="${gameName}">
      <div class="reviewcard__main">
        <div class="reviewcard__head"><a class="reviewcard__gamelink">${gameName}</a><span class="reviewcard__date">${r.date}</span></div>
        <div class="reviewcard__stars">${scoreLabel(r.stars)}</div>
        ${r.spoiler ? '<div class="reviewcard__spoiler-tag">contains spoilers</div>' : ""}
        ${r.text ? `<div class="reviewcard__text">"${r.text}"</div>` : ""}
        <div class="reviewcard__actions">
          <span class="likebtn ${engagement.liked ? "is-liked" : ""}">
            <span class="likebtn__icon">♥</span> <span class="likebtn__count">${engagement.liked ? 1 : 0}</span>
          </span>
          <span class="replytogglebtn">💬 ${engagement.replies.length} replies</span>
        </div>
      </div>
    `;
    el.querySelector(".reviewcard__gamelink").addEventListener("click", () => {
      if (game) window.location.href = `game.html?id=${game.slug || game.id}`;
    });
    list.appendChild(el);
  });
}

renderMyReviews();
