/* ============================================================
   GAMESET — tierlist-editor.js
   Depends on api.js and tierlists-data.js, loaded before this file.
   ============================================================ */

/* ---------- Tier list state ---------- */
const urlParams = new URLSearchParams(window.location.search);
const editId = urlParams.get("edit");
const viewId = urlParams.get("view");
const suggestKey = urlParams.get("suggest");

let listId = editId || newTierListId();
let listTitle = "My tier list";
let listAuthor = "Fenx";
let listLikes = 0;
let tierDefs = defaultTierDefs();
let tiers = emptyTiers(tierDefs);
let readOnly = false;
let allKnownGames = [...DEMO_GAMES];
let selectedGame = null; // { name, cover }

async function loadInitialList() {
  const idToLoad = viewId || editId;
  if (idToLoad) {
    const found = getTierListById(idToLoad);
    if (found) {
      listId = found.id;
      listTitle = found.title;
      listAuthor = found.isDemo ? found.author : "Fenx";
      listLikes = found.likes || 0;
      tierDefs = getTierDefs(found).map(d => ({ ...d }));
      const hydrated = await hydrateTierListCovers(found);
      tiers = hydrated.tiers;
      readOnly = Boolean(viewId); // "view" is always read-only
      return;
    }
  }
  // new blank tier list (or pre-filled from a suggestion)
  tierDefs = defaultTierDefs();
  tiers = emptyTiers(tierDefs);
  const suggestion = TIERLIST_SUGGESTIONS.find(s => s.key === suggestKey);
  if (suggestion) listTitle = suggestion.title;
}

/* ---------- Placed games / pool ---------- */
function getPlacedNames() {
  const set = new Set();
  tierDefs.forEach(def => (tiers[def.key] || []).forEach(g => set.add(g.name)));
  return set;
}

function getPoolGames(filterText = "") {
  const placed = getPlacedNames();
  const q = filterText.trim().toLowerCase();
  return allKnownGames.filter(g =>
    !placed.has(g.name) && (!q || g.name.toLowerCase().includes(q))
  );
}

/* ---------- Drag and drop (shared between the queue, tiers, and the pool) ---------- */
function getDragPayload(e) {
  try { return JSON.parse(e.dataTransfer.getData("application/json")); }
  catch { return null; }
}

function removeFromSource(payload) {
  if (!payload || !payload.from) return;
  if (payload.from !== "pool") {
    tiers[payload.from] = (tiers[payload.from] || []).filter(g => g.name !== payload.name);
  }
}

function makeDraggable(el, game, from) {
  el.draggable = true;
  el.addEventListener("dragstart", (e) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("application/json", JSON.stringify({ name: game.name, cover: game.cover, from }));
  });
}

function setupDropZone(el, onDrop) {
  el.addEventListener("dragover", (e) => { e.preventDefault(); el.classList.add("is-dragover"); });
  el.addEventListener("dragleave", () => el.classList.remove("is-dragover"));
  el.addEventListener("drop", (e) => {
    e.preventDefault();
    el.classList.remove("is-dragover");
    const payload = getDragPayload(e);
    if (!payload) return;
    removeFromSource(payload);
    onDrop({ name: payload.name, cover: payload.cover });
    renderAll();
  });
}

/* ---------- Tier configuration modal (name, color, remove) ----------
   A single central modal shared by every row — avoids the floating
   panel getting crooked or clipped depending on which row was
   clicked. */
let configTierKey = null;

function openTierConfigModal(key) {
  configTierKey = key;
  const def = tierDefs.find(d => d.key === key);
  if (!def) return;
  document.getElementById("tierConfigName").value = def.label;
  document.getElementById("tierConfigColor").value = def.color;
  document.getElementById("tierConfigModal").classList.add("is-open");
}

function closeTierConfigModal() {
  document.getElementById("tierConfigModal").classList.remove("is-open");
  configTierKey = null;
}

(function setupTierConfigModal() {
  const modal = document.getElementById("tierConfigModal");
  const nameInput = document.getElementById("tierConfigName");
  const colorInput = document.getElementById("tierConfigColor");

  modal.querySelector(".reportmodal__backdrop").addEventListener("click", closeTierConfigModal);
  document.getElementById("tierConfigClose").addEventListener("click", closeTierConfigModal);

  nameInput.addEventListener("input", () => {
    const def = tierDefs.find(d => d.key === configTierKey);
    if (!def) return;
    def.label = nameInput.value;
    const row = document.querySelector(`.tlirow[data-tier="${configTierKey}"]`);
    if (row) row.querySelector(".tlirow__labeltext").textContent = nameInput.value;
  });

  colorInput.addEventListener("input", () => {
    const def = tierDefs.find(d => d.key === configTierKey);
    if (!def) return;
    def.color = colorInput.value;
    const row = document.querySelector(`.tlirow[data-tier="${configTierKey}"]`);
    if (row) row.querySelector(".tlirow__label").style.background = colorInput.value;
  });

  document.getElementById("tierConfigRemove").addEventListener("click", () => {
    if (tierDefs.length <= 1) { alert("At least one tier needs to remain."); return; }
    const def = tierDefs.find(d => d.key === configTierKey);
    const gamesInTier = tiers[configTierKey] || [];
    if (gamesInTier.length && !confirm(`Remove the tier "${def?.label}"? The ${gamesInTier.length} game(s) in it will go back to the pool.`)) return;
    tierDefs = tierDefs.filter(d => d.key !== configTierKey);
    delete tiers[configTierKey];
    closeTierConfigModal();
    renderAll();
  });
})();

/* ---------- Rendering the tier rows ---------- */
function renderTierRows() {
  const container = document.getElementById("tierRows");
  container.innerHTML = "";

  tierDefs.forEach(def => {
    const row = document.createElement("div");
    row.className = "tlirow";
    row.dataset.tier = def.key;

    const games = tiers[def.key] || [];
    const itemsHtml = games.map(g => `
      <div class="tliitem" data-name="${encodeURIComponent(g.name)}" title="${g.name}">
        <img src="${g.cover || 'https://placehold.co/70x94/1e1b29/6b6679?text=?'}" alt="${g.name}">
      </div>
    `).join("");

    row.innerHTML = `
      <div class="tlirow__label" style="background:${def.color}">
        ${!readOnly ? `<button type="button" class="tlirow__gearbtn" title="Configure tier">⚙</button>` : ""}
        <span class="tlirow__labeltext">${def.label}</span>
      </div>
      <div class="tlirow__items" data-tier="${def.key}">
        ${itemsHtml}
        ${!readOnly ? `<div class="tlirow__dropzone">${selectedGame ? "Click here to place" : "Drag a game here"}</div>` : ""}
      </div>
    `;

    container.appendChild(row);
  });

  if (!readOnly) {
    container.querySelectorAll(".tlirow__gearbtn").forEach(gearBtn => {
      const row = gearBtn.closest(".tlirow");
      gearBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openTierConfigModal(row.dataset.tier);
      });
    });

    container.querySelectorAll(".tlirow__items").forEach(rowEl => {
      rowEl.addEventListener("click", (e) => {
        // clicked an already-placed item -> move it back to the pool
        const itemEl = e.target.closest(".tliitem");
        if (itemEl) {
          const name = decodeURIComponent(itemEl.dataset.name);
          const tierKey = rowEl.dataset.tier;
          tiers[tierKey] = tiers[tierKey].filter(g => g.name !== name);
          renderAll();
          return;
        }
        // clicked an empty row with a game selected -> place it
        if (selectedGame) {
          const tierKey = rowEl.dataset.tier;
          tiers[tierKey].push(selectedGame);
          selectedGame = null;
          renderAll();
        }
      });

      const tierKey = rowEl.dataset.tier;
      rowEl.querySelectorAll(".tliitem").forEach(itemEl => {
        const name = decodeURIComponent(itemEl.dataset.name);
        const game = (tiers[tierKey] || []).find(g => g.name === name);
        if (game) makeDraggable(itemEl, game, tierKey);
      });
      setupDropZone(rowEl, (game) => { tiers[tierKey].push(game); });
    });
  }

  document.getElementById("addTierBox").hidden = readOnly;
}

/* ---------- Add a new tier ---------- */
const NEW_TIER_COLORS = ["#a855f7", "#22d3ee", "#fb7185", "#84cc16", "#f59e0b", "#818cf8"];
document.getElementById("confirmAddTierBtn").addEventListener("click", () => {
  const input = document.getElementById("newTierName");
  const name = input.value.trim();
  if (!name) { input.focus(); return; }
  const key = newTierKey();
  const color = NEW_TIER_COLORS[tierDefs.length % NEW_TIER_COLORS.length];
  tierDefs.push({ key, label: name, color });
  tiers[key] = [];
  input.value = "";
  renderAll();
});
document.getElementById("newTierName").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("confirmAddTierBtn").click();
});

/* ---------- Rendering the game pool ---------- */
function renderPool() {
  const poolSection = document.getElementById("poolSection");
  if (readOnly) { poolSection.hidden = true; return; }

  const grid = document.getElementById("poolGrid");
  const filterText = document.getElementById("poolSearch").value;
  const games = getPoolGames(filterText);

  grid.innerHTML = "";
  if (!games.length) {
    grid.innerHTML = `<p class="tlipool__empty">No games available — try searching a different name above.</p>`;
  } else {
    games.forEach(g => {
      const el = document.createElement("div");
      el.className = "tlipoolitem";
      if (selectedGame && selectedGame.name === g.name) el.classList.add("is-selected");
      el.title = g.name;
      el.innerHTML = `<img src="${g.background_image || 'https://placehold.co/70x94/1e1b29/6b6679?text=?'}" alt="${g.name}">`;
      el.addEventListener("click", () => {
        selectedGame = selectedGame && selectedGame.name === g.name
          ? null
          : { name: g.name, cover: g.background_image };
        renderAll();
      });
      makeDraggable(el, { name: g.name, cover: g.background_image }, "pool");
      grid.appendChild(el);
    });
  }

  // drag a game back to the pool (from a tier or the queue)
  setupDropZone(grid, () => {});
}

/* ---------- Search inside the editor to add games to the pool ---------- */
let poolSearchDebounce;
document.getElementById("poolSearch").addEventListener("input", (e) => {
  clearTimeout(poolSearchDebounce);
  const q = e.target.value.trim();
  renderPool();
  if (!q) return;
  poolSearchDebounce = setTimeout(async () => {
    const results = await searchGames(q);
    results.forEach(g => {
      if (!allKnownGames.some(k => k.name === g.name)) allKnownGames.push(g);
    });
    renderPool();
  }, 350);
});

/* ---------- Header (title / author / read-only mode) ---------- */
function renderHead() {
  const titleInput = document.getElementById("tlTitleInput");
  titleInput.value = listTitle;
  titleInput.disabled = readOnly;
  titleInput.addEventListener("input", () => { listTitle = titleInput.value; });

  document.getElementById("tlSaveBtn").hidden = readOnly;

  const viewNote = document.getElementById("tlViewNote");
  const authorTag = document.getElementById("tlAuthorTag");
  if (readOnly) {
    viewNote.hidden = false;
    document.getElementById("tlViewAuthor").textContent = listAuthor;
    authorTag.hidden = false;
    authorTag.textContent = `by ${listAuthor}`;
  } else {
    viewNote.hidden = true;
    authorTag.hidden = true;
  }
}

/* ---------- Save ---------- */
document.getElementById("tlSaveBtn").addEventListener("click", () => {
  const list = {
    id: listId,
    title: listTitle.trim() || "Untitled tier list",
    author: "Fenx",
    likes: listLikes,
    isDemo: false,
    tierDefs,
    tiers,
  };
  upsertOwnTierList(list);
  history.replaceState(null, "", `tierlist-editor.html?edit=${listId}`);

  const btn = document.getElementById("tlSaveBtn");
  const original = btn.textContent;
  btn.textContent = "Saved ✓";
  setTimeout(() => { btn.textContent = original; }, 1500);
});

/* ---------- Like and comment ---------- */
function renderEngagement() {
  const key = `tierlist:${listId}`;
  const engagement = getEngagement(key);
  const likeBtn = document.getElementById("tlLikeBtn");
  likeBtn.classList.toggle("is-liked", engagement.liked);
  document.getElementById("tlLikeCount").textContent = listLikes + (engagement.liked ? 1 : 0);

  likeBtn.onclick = () => {
    const liked = toggleLike(key);
    likeBtn.classList.toggle("is-liked", liked);
    document.getElementById("tlLikeCount").textContent = listLikes + (liked ? 1 : 0);
  };

  renderReplySection(document.getElementById("tlCommentsSection"), key, null, listTitle);
}

/* ---------- Overall rendering ---------- */
function renderAll() {
  renderHead();
  renderTierRows();
  renderPool();
}

/* ---------- Initialization ---------- */
async function init() {
  await loadInitialList();

  const isNewList = !editId && !viewId;
  const suggestion = isNewList ? TIERLIST_SUGGESTIONS.find(s => s.key === suggestKey) : null;

  let pool;
  if (suggestion) {
    // chosen suggestion: the pool already comes with that theme's games
    pool = suggestion.dynamic === "released"
      ? (await fetchGamesList({ sortKey: "released", pageSize: 20 })).results
      : await resolveGamesByNames(suggestion.games);
  } else {
    // no suggestion: initial pool with real trending games (falls back to demo without an API key)
    pool = await fetchTrendingGames();
  }

  const placed = getPlacedNames();
  allKnownGames = pool.filter(g => !placed.has(g.name));
  renderAll();
  renderEngagement();
}
init();