
function renderProfileHead() {
  const profile = getMyProfile();
  document.getElementById("profileName").textContent = profile.name;
  document.getElementById("profileBio").textContent = profile.bio;
  applyAvatarTo(document.getElementById("profileAvatar"), profile.avatar, (profile.name || "F")[0].toUpperCase());

  document.getElementById("statMyReviews").textContent = getMyReviews("Fenx").length;
  document.getElementById("statMyComments").textContent = getMyComments("Fenx").length;
  document.getElementById("statMyTierlists").textContent = getOwnTierLists().length;
  document.getElementById("statFollowing").textContent = getFollowing().length;
}

async function renderProfileReviews() {
  const container = document.getElementById("profileReviews");
  const emptyMsg = document.getElementById("profileReviewsEmpty");
  const reviews = getMyReviews("Fenx").slice(0, 3);

  container.innerHTML = "";
  emptyMsg.hidden = reviews.length > 0;

  for (const r of reviews) {
    const game = await fetchGameById(r.gameKey);
    const gameName = game ? game.name : r.gameKey;
    const cover = game && game.background_image ? game.background_image : "https://placehold.co/70x94/1e1b29/6b6679?text=?";

    const el = document.createElement("div");
    el.className = "reviewcard";
    el.innerHTML = `
      <img class="reviewcard__cover" src="${cover}" alt="${gameName}">
      <div class="reviewcard__main">
        <div class="reviewcard__head"><a class="reviewcard__gamelink">${gameName}</a><span class="reviewcard__date">${r.date}</span></div>
        <div class="reviewcard__stars">${scoreLabel(r.stars)}</div>
        ${r.text ? `<div class="reviewcard__text">"${r.text}"</div>` : ""}
      </div>
    `;
    const goToGame = () => { window.location.href = `game.html?id=${r.gameKey}`; };
    el.querySelector(".reviewcard__cover").addEventListener("click", goToGame);
    el.querySelector(".reviewcard__gamelink").addEventListener("click", goToGame);
    container.appendChild(el);
  }
}

function renderProfileTierlists() {
  const container = document.getElementById("profileTierlists");
  const emptyMsg = document.getElementById("profileTierlistsEmpty");
  const lists = getOwnTierLists().slice(0, 4);

  container.innerHTML = "";
  emptyMsg.hidden = lists.length > 0;

  lists.forEach(list => {
    const totalGames = getTierDefs(list).reduce((sum, def) => sum + (list.tiers[def.key]?.length || 0), 0);
    const el = document.createElement("div");
    el.className = "tlcard";
    el.innerHTML = `
      <div class="tlcard__head">
        <div><h3>${list.title}</h3><span class="tlcard__author">${totalGames} games</span></div>
      </div>
      <div class="tlcard__actions">
        <button type="button" class="tlcard__btn">Edit</button>
      </div>
    `;
    el.querySelector(".tlcard__btn").addEventListener("click", () => {
      window.location.href = `tierlist-editor.html?edit=${list.id}`;
    });
    container.appendChild(el);
  });
}

/* ---------- Favorite games (up to 3) ---------- */
function renderFavorites() {
  const row = document.getElementById("favoritesRow");
  const addBox = document.getElementById("favoritesAddBox");
  const fullMsg = document.getElementById("favoritesFullMsg");
  const favorites = getMyProfile().favorites || [null, null, null];
  const filledCount = favorites.filter(Boolean).length;

  row.innerHTML = "";
  favorites.forEach((fav, i) => {
    const slot = document.createElement("div");
    slot.className = fav ? "favoriteslot" : "favoriteslot favoriteslot--empty";

    if (fav) {
      slot.innerHTML = `
        <button type="button" class="favoriteslot__remove" aria-label="Remove">✕</button>
        <img src="${fav.cover || 'https://placehold.co/150x200/1e1b29/6b6679?text=?'}" alt="${fav.name}">
        <span class="favoriteslot__name">${fav.name}</span>
      `;
      slot.querySelector("img").addEventListener("click", () => {
        window.location.href = `game.html?id=${fav.key || encodeURIComponent(fav.name)}`;
      });
      slot.querySelector(".favoriteslot__remove").addEventListener("click", (e) => {
        e.stopPropagation();
        const profile = getMyProfile();
        profile.favorites[i] = null;
        saveMyProfile(profile);
        renderFavorites();
      });
    } else {
      slot.innerHTML = `<span class="favoriteslot__plus">+</span><span class="favoriteslot__addlabel">Empty</span>`;
    }
    row.appendChild(slot);
  });

  addBox.hidden = filledCount >= 3;
  fullMsg.hidden = filledCount < 3;
}

const favoritesSearchInput = document.getElementById("favoritesSearchInput");
const favoritesSearchResults = document.getElementById("favoritesSearchResults");
let favoritesDebounce;

favoritesSearchInput.addEventListener("input", () => {
  clearTimeout(favoritesDebounce);
  const q = favoritesSearchInput.value.trim();
  if (!q) { favoritesSearchResults.innerHTML = ""; return; }
  favoritesSearchResults.innerHTML = `<div class="searchresults__loading">Searching…</div>`;
  favoritesDebounce = setTimeout(async () => {
    const games = await searchGames(q);
    favoritesSearchResults.innerHTML = "";
    if (!games.length) {
      favoritesSearchResults.innerHTML = `<div class="searchresults__empty">No games found</div>`;
      return;
    }
    games.slice(0, 6).forEach(g => {
      const item = document.createElement("div");
      item.className = "searchresults__item";
      const img = g.background_image || "https://placehold.co/36x48/1e1b29/6b6679?text=?";
      item.innerHTML = `<img src="${img}" alt=""><div class="searchresults__meta"><strong>${g.name}</strong></div>`;
      item.addEventListener("click", () => {
        const profile = getMyProfile();
        const emptyIndex = profile.favorites.findIndex(f => !f);
        if (emptyIndex === -1) return;
        profile.favorites[emptyIndex] = { name: g.name, cover: g.background_image, key: g.slug || g.id };
        saveMyProfile(profile);
        favoritesSearchInput.value = "";
        favoritesSearchResults.innerHTML = "";
        renderFavorites();
      });
      favoritesSearchResults.appendChild(item);
    });
  }, 300);
});

renderProfileHead();
renderFavorites();
renderProfileReviews();
renderProfileTierlists();
