/* ============================================================
   GAMESET — tierlists.js
   Depends on api.js and tierlists-data.js, loaded before this file.
   ============================================================ */

/* ---------- Suggestions for tier lists to create ---------- */
function renderSuggestions() {
  const row = document.getElementById("suggestionsRow");
  row.innerHTML = "";
  TIERLIST_SUGGESTIONS.forEach(s => {
    const el = document.createElement("a");
    el.className = "tlsuggestion";
    el.href = `tierlist-editor.html?suggest=${s.key}`;
    el.innerHTML = `<span class="tlsuggestion__icon">${s.icon}</span> ${s.title}`;
    row.appendChild(el);
  });
}

/* ---------- State ---------- */
let sortMode = "popular"; // only applies to the community section

/* ---------- Rendering ---------- */
function renderCard(list) {
  const el = document.createElement("div");
  el.className = "tlcard";

  const defs = getTierDefs(list);
  const previewRows = defs.map(def => {
    const games = list.tiers[def.key] || [];
    if (!games.length) return "";
    const thumbs = games.slice(0, 5).map(g => `<img src="${g.cover}" alt="${g.name}">`).join("");
    const extra = games.length > 5 ? `<span class="tlcard__more">+${games.length - 5}</span>` : "";
    return `
      <div class="tlcard__row">
        <span class="tlcard__tier" style="background:${def.color}">${def.label}</span>
        <div class="tlcard__thumbs">${thumbs}${extra}</div>
      </div>`;
  }).join("");

  const totalGames = defs.reduce((sum, def) => sum + (list.tiers[def.key]?.length || 0), 0);
  const likeKey = `tierlist:${list.id}`;
  const engagement = getEngagement(likeKey);
  const likeCount = (list.likes || 0) + (engagement.liked ? 1 : 0);

  el.innerHTML = `
    <div class="tlcard__head">
      <div>
        <h3>${list.title}</h3>
        <span class="tlcard__author">by ${list.isDemo ? list.author : "you"} · ${totalGames} games</span>
      </div>
      <button type="button" class="likebtn tlcard__likebtn ${engagement.liked ? "is-liked" : ""}">
        <span class="likebtn__icon">♥</span> <span class="likebtn__count">${likeCount}</span>
      </button>
    </div>
    <div class="tlcard__preview">${previewRows || '<p class="tlcard__emptypreview">Empty tier list</p>'}</div>
    <div class="tlcard__actions">
      <button type="button" class="tlcard__btn tlcard__btn--view">View and comment</button>
      ${list.isDemo
        ? `<button type="button" class="tlcard__btn tlcard__btn--clone">Use as a base</button>`
        : `<button type="button" class="tlcard__btn tlcard__btn--edit">Edit</button>`}
    </div>
  `;

  el.querySelector(".tlcard__likebtn").addEventListener("click", (e) => {
    e.stopPropagation();
    const liked = toggleLike(likeKey);
    e.currentTarget.classList.toggle("is-liked", liked);
    e.currentTarget.querySelector(".likebtn__count").textContent = (list.likes || 0) + (liked ? 1 : 0);
  });

  el.querySelector(".tlcard__btn--view").addEventListener("click", () => {
    window.location.href = `tierlist-editor.html?view=${list.id}`;
  });

  const cloneBtn = el.querySelector(".tlcard__btn--clone");
  if (cloneBtn) {
    cloneBtn.addEventListener("click", () => {
      const copy = {
        id: newTierListId(),
        title: `${list.title} (my version)`,
        author: "Fenx",
        likes: 0,
        isDemo: false,
        tierDefs: JSON.parse(JSON.stringify(getTierDefs(list))),
        tiers: JSON.parse(JSON.stringify(list.tiers)),
      };
      upsertOwnTierList(copy);
      window.location.href = `tierlist-editor.html?edit=${copy.id}`;
    });
  }

  const editBtn = el.querySelector(".tlcard__btn--edit");
  if (editBtn) {
    editBtn.addEventListener("click", () => {
      window.location.href = `tierlist-editor.html?edit=${list.id}`;
    });
  }

  return el;
}

async function renderGrids() {
  // Your tier lists — always yours, most recent first
  const myGrid = document.getElementById("myTierlistsGrid");
  const myEmpty = document.getElementById("myTierlistsEmpty");
  const mine = getOwnTierLists();

  myGrid.innerHTML = "";
  myEmpty.hidden = mine.length > 0;
  const myHydrated = await Promise.all(mine.map(hydrateTierListCovers));
  myHydrated.forEach(list => myGrid.appendChild(renderCard(list)));

  // Community tier lists — only from other people, sorted
  const communityGrid = document.getElementById("communityTierlistsGrid");
  let community = [...DEMO_TIERLISTS];
  if (sortMode === "popular") community.sort((a, b) => (b.likes || 0) - (a.likes || 0));
  // "recent" keeps the original order (most recent first, as already listed)

  communityGrid.innerHTML = "";
  const communityHydrated = await Promise.all(community.map(hydrateTierListCovers));
  communityHydrated.forEach(list => communityGrid.appendChild(renderCard(list)));
}

/* ---------- Sorting (applies to the community section) ---------- */
document.querySelectorAll("#tlTabs button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#tlTabs button").forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    sortMode = btn.dataset.tab;
    renderGrids();
  });
});

/* ---------- Initialization ---------- */
renderSuggestions();
renderGrids();