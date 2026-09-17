
/* ---------- Listing state ---------- */
let currentSort = "popular";
let currentGenre = "";
let currentPage = 1;
const PAGE_SIZE = 12;
let isLoading = false;

/* ---------- Grid rendering ---------- */
function renderGameTile(game) {
  const el = document.createElement("div");
  el.className = "gametile";
  const img = game.background_image || "https://placehold.co/220x300/1e1b29/6b6679?text=No+cover";
  el.innerHTML = `
    <img class="gametile__cover" src="${img}" alt="${game.name}" loading="lazy">
    <div class="gametile__rating">★ ${(game.rating || 0).toFixed(1)}</div>
    <div class="gametile__title">${game.name}</div>
  `;
  el.addEventListener("click", () => {
    const idOrSlug = game.slug || game.id || encodeURIComponent(game.name);
    sessionStorage.setItem("gameset:lastGame", JSON.stringify({
      id: game.id ?? null, slug: game.slug ?? null, name: game.name,
      background_image: game.background_image || null, rating: game.rating ?? null,
    }));
    window.location.href = `game.html?id=${idOrSlug}`;
  });
  return el;
}

async function loadGames({ reset = false } = {}) {
  if (isLoading) return;
  isLoading = true;

  const grid = document.getElementById("gamesGrid");
  const emptyMsg = document.getElementById("gamesEmpty");
  const loadMoreBtn = document.getElementById("loadMoreGamesBtn");

  if (reset) {
    currentPage = 1;
    grid.innerHTML = "";
  }

  loadMoreBtn.textContent = "Loading…";
  loadMoreBtn.disabled = true;

  const { results, hasMore } = await fetchGamesList({
    sortKey: currentSort,
    genreSlug: currentGenre,
    page: currentPage,
    pageSize: PAGE_SIZE,
  });

  results.forEach(g => grid.appendChild(renderGameTile(g)));

  emptyMsg.hidden = grid.children.length > 0;
  loadMoreBtn.hidden = !hasMore;
  loadMoreBtn.textContent = "Load more";
  loadMoreBtn.disabled = false;

  currentPage++;
  isLoading = false;
}

/* ---------- Sort tabs ---------- */
document.querySelectorAll("#sortTabs button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#sortTabs button").forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    currentSort = btn.dataset.sort;
    loadGames({ reset: true });
  });
});

/* ---------- Genre filter ---------- */
document.querySelectorAll("#genreChips button[data-genre]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#genreChips button[data-genre]").forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    currentGenre = btn.dataset.genre;
    loadGames({ reset: true });
  });
});

document.getElementById("genresToggle").addEventListener("click", (e) => {
  const hiddenChips = document.querySelectorAll(".genrechips__extra");
  const expanding = hiddenChips[0]?.hidden;
  hiddenChips.forEach(chip => { chip.hidden = !expanding; });
  e.currentTarget.textContent = expanding ? "− fewer genres" : "+ more genres";
});

/* ---------- Load more ---------- */
document.getElementById("loadMoreGamesBtn").addEventListener("click", () => loadGames());

/* ---------- Initialization ---------- */
loadGames({ reset: true });
