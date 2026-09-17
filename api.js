/* ============================================================
   GAMESET — api.js
   API config and helpers shared between index.html and game.html.

   API used: RAWG Video Games Database (https://rawg.io/apidocs)
   1) Create a free account at https://rawg.io/apidocs
   2) Copy your key and paste it below in RAWG_API_KEY
   Without a key, the site runs in DEMO MODE with sample data.
   ============================================================ */

const RAWG_API_KEY = "7fbed4e1ce3e4ae0a0b1683182d0164e";
const RAWG_BASE = "https://api.rawg.io/api";
const hasApiKey = RAWG_API_KEY.trim().length > 0;

/* ---------- Demo data ---------- */
const DEMO_GAMES = [
  { id: "demo-1", slug: "demo-1", name: "Resident Evil Requiem", rating: 4.4, background_image: "https://picsum.photos/seed/gameset-game1/400/533", released: "2025-02-27", genres: [{ name: "Horror" }, { name: "Survival" }], genre_slugs: ["action", "adventure"], platforms: [{ platform: { name: "PC" } }, { platform: { name: "PS5" } }], description_raw: "FBI investigator Grace Ashcroft must uncover her connection to a mysterious cult in Raccoon City, as a new biological threat spreads through the city." },
  { id: "demo-2", slug: "demo-2", name: "Among Us", rating: 3.8, background_image: "https://picsum.photos/seed/gameset-game2/400/533", released: "2018-06-15", genres: [{ name: "Party" }, { name: "Multiplayer" }], genre_slugs: ["indie"], platforms: [{ platform: { name: "PC" } }, { platform: { name: "Mobile" } }], description_raw: "A space crew must complete tasks before the impostors hidden among them sabotage everything and kill everyone." },
  { id: "demo-3", slug: "demo-3", name: "Minecraft", rating: 4.6, background_image: "https://picsum.photos/seed/gameset-game3/400/533", released: "2011-11-18", genres: [{ name: "Sandbox" }, { name: "Survival" }], genre_slugs: ["adventure", "indie"], platforms: [{ platform: { name: "PC" } }, { platform: { name: "All" } }], description_raw: "Build, explore, and survive in a world made entirely of blocks, alone or with friends." },
  { id: "demo-4", slug: "demo-4", name: "Mario Kart Wii", rating: 4.5, background_image: "https://picsum.photos/seed/gameset-game4/400/533", released: "2008-04-10", genres: [{ name: "Racing" }], genre_slugs: ["action"], platforms: [{ platform: { name: "Wii" } }], description_raw: "Frantic races with crazy items across the most iconic tracks in the Mario Kart series." },
  { id: "demo-5", slug: "demo-5", name: "Expedition 33", rating: 4.7, background_image: "https://picsum.photos/seed/gameset-game5/400/533", released: "2025-04-24", genres: [{ name: "RPG" }], genre_slugs: ["rpg"], platforms: [{ platform: { name: "PC" } }, { platform: { name: "PS5" } }], description_raw: "A turn-based RPG about an expedition doomed to face the Paintress, who erases a year of life every birthday." },
  { id: "demo-6", slug: "demo-6", name: "Dark Souls III", rating: 4.6, background_image: "https://picsum.photos/seed/gameset-game6/400/533", released: "2016-04-12", genres: [{ name: "Action" }, { name: "RPG" }], genre_slugs: ["action", "rpg"], platforms: [{ platform: { name: "PC" } }, { platform: { name: "PS4" } }], description_raw: "The flames are dying and the world is heading toward darkness. Face lords of cinder in a relentless world." },
  { id: "demo-7", slug: "demo-7", name: "Stardew Valley", rating: 4.8, background_image: "https://picsum.photos/seed/gameset-game7/400/533", released: "2016-02-26", genres: [{ name: "Simulation" }, { name: "Indie" }], genre_slugs: ["indie", "strategy"], platforms: [{ platform: { name: "PC" } }, { platform: { name: "Switch" } }], description_raw: "Inherit your grandmother's farm and build the life you always wanted, planting, fishing, and making friends in town." },
  { id: "demo-8", slug: "demo-8", name: "Baldur's Gate 3", rating: 4.9, background_image: "https://picsum.photos/seed/gameset-game8/400/533", released: "2023-08-03", genres: [{ name: "RPG" }, { name: "Strategy" }], genre_slugs: ["rpg", "strategy"], platforms: [{ platform: { name: "PC" } }, { platform: { name: "PS5" } }], description_raw: "Gather your party and return to the Forgotten Realms in a story of camaraderie and sacrifice in the face of corruption." },
  { id: "demo-9", slug: "demo-9", name: "Devil May Cry", rating: 4.3, background_image: "https://picsum.photos/seed/gameset-game9/400/533", released: "2001-08-23", genres: [{ name: "Action" }, { name: "Hack and Slash" }], genre_slugs: ["action"], platforms: [{ platform: { name: "PS2" } }], description_raw: "Dante, the demon hunter, faces hordes from hell in pursuit of revenge against the demon Mundus." },
  { id: "demo-10", slug: "demo-10", name: "Pokémon", rating: 4.5, background_image: "https://picsum.photos/seed/gameset-game10/400/533", released: "1996-02-27", genres: [{ name: "RPG" }, { name: "Adventure" }], genre_slugs: ["rpg", "adventure"], platforms: [{ platform: { name: "Handheld" } }], description_raw: "Become a Pokémon trainer, catch creatures, and take on gyms in pursuit of the champion title." },
  { id: "demo-11", slug: "demo-11", name: "Hollow Knight", rating: 4.7, background_image: "https://picsum.photos/seed/gameset-game11/400/533", released: "2017-02-24", genres: [{ name: "Metroidvania" }, { name: "Indie" }], genre_slugs: ["indie", "adventure"], platforms: [{ platform: { name: "PC" } }, { platform: { name: "Switch" } }], description_raw: "Explore the decaying underground kingdom of Hallownest, facing corrupted insects and hidden secrets." },
  { id: "demo-12", slug: "demo-12", name: "Civilization VI", rating: 4.4, background_image: "https://picsum.photos/seed/gameset-game12/400/533", released: "2016-10-21", genres: [{ name: "Strategy" }], genre_slugs: ["strategy"], platforms: [{ platform: { name: "PC" } }], description_raw: "Build an empire to stand the test of time, from the Stone Age to the Information Age." },
  { id: "demo-13", slug: "demo-13", name: "God of War Ragnarök", rating: 4.8, background_image: "https://picsum.photos/seed/gameset-game13/400/533", released: "2022-11-09", genres: [{ name: "Action" }, { name: "Adventure" }], genre_slugs: ["action", "adventure"], platforms: [{ platform: { name: "PS5" } }], description_raw: "Kratos and Atreus face Ragnarök in an epic journey across the nine Norse realms." },
  { id: "demo-14", slug: "demo-14", name: "Celeste", rating: 4.6, background_image: "https://picsum.photos/seed/gameset-game14/400/533", released: "2018-01-25", genres: [{ name: "Platformer" }, { name: "Indie" }], genre_slugs: ["indie", "adventure"], platforms: [{ platform: { name: "PC" } }, { platform: { name: "Switch" } }], description_raw: "Help Madeline climb Celeste Mountain while facing her own fears and anxieties." },
  { id: "demo-15", slug: "demo-15", name: "Persona 5 Royal", rating: 4.9, background_image: "https://picsum.photos/seed/gameset-game15/400/533", released: "2019-10-31", genres: [{ name: "RPG" }], genre_slugs: ["rpg"], platforms: [{ platform: { name: "PS4" } }, { platform: { name: "Switch" } }], description_raw: "Lead a group of phantom-thief students who steal the corrupted hearts of adults across Tokyo." },
  { id: "demo-16", slug: "demo-16", name: "Age of Empires IV", rating: 4.2, background_image: "https://picsum.photos/seed/gameset-game16/400/533", released: "2021-10-28", genres: [{ name: "Strategy" }], genre_slugs: ["strategy"], platforms: [{ platform: { name: "PC" } }], description_raw: "Relive historic battles and build empires from scratch across four campaigns set in the Middle Ages." },
];

/* ---------- API helpers ---------- */
async function rawgFetch(path, params = {}) {
  if (!hasApiKey) return null;
  const url = new URL(`${RAWG_BASE}${path}`);
  url.searchParams.set("key", RAWG_API_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  try {
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`RAWG ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Failed to query the RAWG API, using demo data:", err);
    return null;
  }
}

async function fetchTrendingGames() {
  const data = await rawgFetch("/games", { ordering: "-added", page_size: 18 });
  return data ? data.results : DEMO_GAMES;
}

async function searchGames(query) {
  const data = await rawgFetch("/games", { search: query, page_size: 8 });
  if (data) return data.results;
  const q = query.toLowerCase();
  return DEMO_GAMES.filter(g => g.name.toLowerCase().includes(q));
}

/* ---------- Resolve a game's real cover by name ----------
   Used anywhere that only has the game's NAME (community reviews,
   activity, etc.) and needs the real cover from the API — instead of
   relying on a fixed demo image. Without a RAWG key configured, it
   falls back to DEMO_GAMES as usual. */
const coverCache = {};
async function resolveGameCover(gameName) {
  if (coverCache[gameName]) return coverCache[gameName];
  try {
    const results = await searchGames(gameName);
    const exact = results.find(g => g.name.toLowerCase() === gameName.toLowerCase()) || results[0];
    if (exact && exact.background_image) {
      coverCache[gameName] = exact.background_image;
      return exact.background_image;
    }
  } catch { /* fall through to the fallback below */ }
  const demo = DEMO_GAMES.find(g => g.name === gameName);
  const fallback = demo ? demo.background_image : null;
  coverCache[gameName] = fallback;
  return fallback;
}

/* ---------- Resolve several covers at once (in parallel) ---------- */
async function resolveGameCovers(gameNames) {
  const unique = [...new Set(gameNames)];
  const map = {};
  await Promise.all(unique.map(async (name) => { map[name] = await resolveGameCover(name); }));
  return map;
}

/* ---------- Resolve full data for several games by name ----------
   Used by the tier list suggestions: takes a list of real game names
   and fetches the full object (cover, rating, slug) for each — via the
   API if a RAWG key is configured, falling back to demo mode. Games
   not found anywhere still show up (just without a cover). */
async function resolveGamesByNames(names) {
  return Promise.all(names.map(async (name) => {
    try {
      const found = await searchGames(name);
      const exact = found.find(g => g.name.toLowerCase() === name.toLowerCase()) || found[0];
      if (exact) return exact;
    } catch { /* fall through to the fallback below */ }
    return { name, slug: null, id: null, background_image: null, rating: 0 };
  }));
}

async function fetchGameById(idOrSlug) {
  const data = await rawgFetch(`/games/${idOrSlug}`);
  if (data) return data;
  return DEMO_GAMES.find(g => g.slug === idOrSlug || String(g.id) === String(idOrSlug))
      || DEMO_GAMES.find(g => g.name.toLowerCase() === decodeURIComponent(idOrSlug).toLowerCase())
      || DEMO_GAMES[0];
}

/* ---------- Games related to a game ----------
   Uses RAWG's suggestions endpoint (based on who played both).
   Without an API key, falls back to demo mode: other games that share
   at least one genre with the current game. */
async function fetchRelatedGames(game) {
  if (!game) return [];
  const idOrSlug = game.slug || game.id;
  const data = idOrSlug ? await rawgFetch(`/games/${idOrSlug}/suggested`) : null;
  if (data && data.results) return data.results.slice(0, 6);

  const myGenres = new Set((game.genre_slugs && game.genre_slugs.length)
    ? game.genre_slugs
    : (game.genres || []).map(g => (g.slug || g.name || "").toLowerCase()));

  return DEMO_GAMES
    .filter(g => g.name !== game.name && (g.genre_slugs || []).some(s => myGenres.has(s)))
    .slice(0, 6);
}

/* ---------- Game listing (used on games.html) ----------
   sortKey: "popular" | "rating" | "released" | "az"
   genreSlug: "" (all) | "action" | "rpg" | "adventure" | "indie" | "strategy" ... */
const SORT_TO_ORDERING = {
  popular: "-added",
  rating: "-rating",
  released: "-released",
  az: "name",
};

async function fetchGamesList({ sortKey = "popular", genreSlug = "", page = 1, pageSize = 12 } = {}) {
  const data = await rawgFetch("/games", {
    ordering: SORT_TO_ORDERING[sortKey] || "-added",
    ...(genreSlug ? { genres: genreSlug } : {}),
    page,
    page_size: pageSize,
  });

  if (data) {
    return { results: data.results, hasMore: Boolean(data.next) };
  }

  // ---- demo mode: filter/sort/page locally ----
  let list = DEMO_GAMES.filter(g => !genreSlug || (g.genre_slugs || []).includes(genreSlug));

  if (sortKey === "rating") list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  else if (sortKey === "released") list.sort((a, b) => new Date(b.released) - new Date(a.released));
  else if (sortKey === "az") list.sort((a, b) => a.name.localeCompare(b.name));
  // "popular" keeps the original demo list order

  const start = (page - 1) * pageSize;
  const slice = list.slice(start, start + pageSize);
  return { results: slice, hasMore: start + pageSize < list.length };
}

/* ---------- Status of a game in a review ---------- */
const GAME_STATUSES = {
  jogado:    { label: "Played",    icon: "🎮", color: "#8b5cf6" },
  zerado:    { label: "Completed", icon: "🏁", color: "#38bdf8" },
  platinado: { label: "Platinum",  icon: "🏆", color: "#facc15" },
  dropado:   { label: "Dropped",   icon: "🚪", color: "#6b6679" },
};

function statusBadgeHtml(status) {
  const s = GAME_STATUSES[status];
  if (!s) return "";
  return `<span class="statusbadge" style="color:${s.color};border-color:${s.color}">${s.icon} ${s.label}</span>`;
}

/* ---------- Rating display ----------
   Two scales coexist on the site:
   - The API (RAWG) returns a rating from 0 to 5.
   - Reviews written here use 0 to 10.
   The functions below keep that explicit so the two never get mixed up. */

// Rating from the API (0–5) → little stars, used on game cards
function starRating(rating) {
  const full = Math.round(rating || 0);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

// A site review's score (0–10) → "8/10" with a star
function scoreLabel(score) {
  const n = Number(score) || 0;
  return `★ ${n}/10`;
}

// Convert an API rating (0–5) to the site's scale (0–10)
function apiRatingTo10(rating) {
  return Math.round((Number(rating) || 0) * 2 * 10) / 10;
}

/* ---------- Formatted date/time (used in reviews and comments) ---------- */
function nowStamp() {
  const d = new Date();
  const date = d.toLocaleDateString("en-US");
  const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  return `${date} at ${time}`;
}

/* ---------- Local reviews (no backend yet) ----------
   Stored in the browser's localStorage, per game.
   Swap this for calls to your own backend once you have a real
   reviews API (e.g. POST /games/:id/reviews). */
const REVIEWS_KEY = "gameset:reviews";

function getAllReviews() {
  try { return JSON.parse(localStorage.getItem(REVIEWS_KEY)) || {}; }
  catch { return {}; }
}

function getReviewsFor(gameKey) {
  const all = getAllReviews();
  return all[gameKey] || [];
}

function saveReview(gameKey, review) {
  const all = getAllReviews();
  if (!all[gameKey]) all[gameKey] = [];
  all[gameKey].unshift(review);
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(all));
}

/* ---------- Likes and replies (reviews and tier lists) ----------
   Works for any type of content with a unique id: community reviews,
   game reviews, and tier lists. Key = "type:id", e.g. "review:12" or
   "tierlist:tl-abc123". Everything lives in localStorage for now —
   swap this for calls to your own backend once you have a real
   likes/comments API (e.g. POST /content/:key/like). */
const ENGAGEMENT_KEY = "gameset:engagement";

function getAllEngagement() {
  try { return JSON.parse(localStorage.getItem(ENGAGEMENT_KEY)) || {}; }
  catch { return {}; }
}

function saveAllEngagement(data) {
  localStorage.setItem(ENGAGEMENT_KEY, JSON.stringify(data));
}

function getEngagement(key) {
  const all = getAllEngagement();
  return all[key] || { liked: false, replies: [] };
}

function toggleLike(key) {
  const all = getAllEngagement();
  const entry = all[key] || { liked: false, replies: [] };
  entry.liked = !entry.liked;
  all[key] = entry;
  saveAllEngagement(all);
  return entry.liked;
}

function addReply(key, text, user = "Fenx", context = "", replyingTo = null) {
  const all = getAllEngagement();
  const entry = all[key] || { liked: false, replies: [] };
  const reply = { user, text, date: nowStamp(), context, replyingTo };
  entry.replies.push(reply);
  all[key] = entry;
  saveAllEngagement(all);
  return reply;
}

/* ---------- Follow system ---------- */
const DEMO_USERS = [
  { user: "Renan_", bio: "RPGs and souls-likes. Always on my third playthrough of something." },
  { user: "luh.games", bio: "Simulation and slice-of-life > any AAA shooter." },
  { user: "theo.dev", bio: "If it has a good soundtrack, I'll play it." },
  { user: "biazup", bio: "Minecraft since 2013 and not planning to stop." },
  { user: "kaio_v", bio: "I only play hard stuff. Souls, roguelike, whatever hurts the most." },
  { user: "marii", bio: "Party games with friends, always." },
  { user: "ana.cast", bio: "Pokémon is life. Everything else is a hobby." },
  { user: "diego_k", bio: "Open-world RPGs and 200-hour saves." },
  { user: "gustavo.p", bio: "Classics and remasters. Nostalgia is everything." },
];

const FOLLOWS_KEY = "gameset:following";

function getFollowing() {
  try { return JSON.parse(localStorage.getItem(FOLLOWS_KEY)) || []; }
  catch { return []; }
}

function isFollowing(user) {
  return getFollowing().includes(user);
}

function toggleFollow(user) {
  let following = getFollowing();
  if (following.includes(user)) {
    following = following.filter(u => u !== user);
  } else {
    following.push(user);
  }
  localStorage.setItem(FOLLOWS_KEY, JSON.stringify(following));
  return following.includes(user);
}

/* ---------- Local user profile (name/bio editable in Settings) ---------- */
const PROFILE_KEY = "gameset:profile";

function getMyProfile() {
  const defaults = {
    name: "Fenx",
    bio: "Playing games since forever. Here to rate everything that passes through my hands.",
    favorites: [null, null, null], // up to 3 games: { name, cover, key }
    avatar: null, // profile photo data URL, or null to use the name's initial
    reviewsPrivacy: "public", // "public" | "followers"
  };
  try {
    const saved = JSON.parse(localStorage.getItem(PROFILE_KEY)) || {};
    return { ...defaults, ...saved, favorites: saved.favorites || defaults.favorites };
  } catch { return defaults; }
}

function saveMyProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

/* ---------- Aggregation: every review written by a user ---------- */
function getMyReviews(user = "Fenx") {
  const all = getAllReviews();
  const out = [];
  Object.entries(all).forEach(([gameKey, reviews]) => {
    reviews.forEach(r => { if (r.user === user) out.push({ ...r, gameKey }); });
  });
  return out;
}

/* ---------- Aggregation: every reply written by a user ---------- */
function getMyComments(user = "Fenx") {
  const all = getAllEngagement();
  const out = [];
  Object.entries(all).forEach(([key, entry]) => {
    (entry.replies || []).forEach(r => {
      if (r.user === user) out.push({ ...r, key });
    });
  });
  return out;
}

/* ---------- Demo reviews for the community feed ----------
   Shared between community.html and activity.html. */
const DEMO_COMMUNITY_REVIEWS = [
  { id: 1, user: "kaio_v", game: "Resident Evil Requiem", cover: DEMO_GAMES[0].background_image, stars: 8, text: "Pretty good ;)", likes: 37, comments: 3, time: "2h ago" },
  { id: 2, user: "Renan_", game: "Baldur's Gate 3", cover: DEMO_GAMES[7].background_image, stars: 10, text: "Finished my third campaign and still found something new. Best RPG of the decade, no exaggeration.", likes: 128, comments: 21, time: "4h ago" },
  { id: 3, user: "luh.games", game: "Stardew Valley", cover: DEMO_GAMES[6].background_image, stars: 8, text: "Perfect for unwinding after work, but the mine's endgame got repetitive for me.", likes: 54, comments: 6, time: "6h ago" },
  { id: 4, user: "kaio_v", game: "Dark Souls III", cover: DEMO_GAMES[5].background_image, stars: 9, text: "Slave Knight Gael is the best final boss I've ever faced in any game.", likes: 96, comments: 14, time: "9h ago" },
  { id: 5, user: "marii", game: "Among Us", cover: DEMO_GAMES[1].background_image, stars: 6, text: "Still fun with friends, but the 2020 hype has clearly worn off.", likes: 22, comments: 5, time: "11h ago" },
  { id: 6, user: "theo.dev", game: "Expedition 33", cover: DEMO_GAMES[4].background_image, stars: 10, text: "The art direction and soundtrack carry this game on the shoulders of giants. Cried in act 2.", likes: 203, comments: 34, time: "13h ago" },
  { id: 7, user: "biazup", game: "Minecraft", cover: DEMO_GAMES[2].background_image, stars: 7, text: "Came back after years and creative mode with friends is still unbeatable.", likes: 41, comments: 4, time: "1d ago" },
  { id: 8, user: "gustavo.p", game: "Devil May Cry", cover: DEMO_GAMES[8].background_image, stars: 8, text: "Aged well for a 2001 game, the combat is still incredibly satisfying.", likes: 33, comments: 2, time: "1d ago" },
  { id: 9, user: "Renan_", game: "Mario Kart Wii", cover: DEMO_GAMES[3].background_image, stars: 6, text: "Banana peel on the last corner again. Every time.", likes: 18, comments: 9, time: "2d ago" },
  { id: 10, user: "ana.cast", game: "Pokémon", cover: DEMO_GAMES[9].background_image, stars: 9, text: "Pure nostalgia, my first game and still the one I replay every year.", likes: 71, comments: 8, time: "2d ago" },
  { id: 11, user: "luh.games", game: "Expedition 33", cover: DEMO_GAMES[4].background_image, stars: 9, text: "Started out thinking it was just another souls-like wearing a JRPG skin. What a nice surprise.", likes: 87, comments: 11, time: "3d ago" },
  { id: 12, user: "diego_k", game: "Baldur's Gate 3", cover: DEMO_GAMES[7].background_image, stars: 7, text: "Act 3 still has too many bugs, but the freedom of choice makes up for it.", likes: 29, comments: 7, time: "3d ago" },
];

/* ---------- Shared UI: reply box ----------
   Renders the list of replies + a field to write a new one, inside the
   `container` element. Used on the game page, the community feed, tier
   lists, and the home page. `context` is a short piece of text (e.g.
   the game's name) saved alongside the reply, used on the "My
   comments" page to say where each reply was left.
   Each reply can have a "reply" button that selects it as the target —
   so whoever reads it knows exactly who the new reply is for. */
function renderReplySection(container, key, onUpdate, context = "") {
  container.innerHTML = `
    <div class="replylist"></div>
    <div class="replyquote" hidden>
      <div class="replyquote__text"></div>
      <button type="button" class="replyquote__cancel" aria-label="Cancel selection">✕</button>
    </div>
    <div class="replyinput">
      <input type="text" placeholder="Write a reply…" maxlength="240">
      <button type="button">Send</button>
    </div>
  `;
  const listEl = container.querySelector(".replylist");
  const quoteBox = container.querySelector(".replyquote");
  const quoteText = container.querySelector(".replyquote__text");
  const quoteCancel = container.querySelector(".replyquote__cancel");
  const input = container.querySelector(".replyinput input");
  const btn = container.querySelector(".replyinput button");

  let selectedQuote = null;
  quoteBox.style.display = "none"; // make sure it starts hidden, without depending on external CSS

  function setQuote(reply) {
    selectedQuote = reply ? { user: reply.user, text: reply.text } : null;
    if (selectedQuote) {
      quoteBox.hidden = false;
      quoteBox.style.display = "flex";
      quoteText.innerHTML = `Replying to <b>${selectedQuote.user}</b>: "${truncateReply(selectedQuote.text, 80)}"`;
      input.focus();
    } else {
      quoteBox.hidden = true;
      quoteBox.style.display = "none";
    }
  }
  quoteCancel.addEventListener("click", () => setQuote(null));

  function paintReplies() {
    const eng = getEngagement(key);
    listEl.innerHTML = eng.replies.length
      ? eng.replies.map((r, i) => `
          <div class="replyitem" data-index="${i}">
            <span class="avatar avatar--sm">${r.user[0].toUpperCase()}</span>
            <div class="replyitem__body">
              <div class="replyitem__head"><b>${r.user}</b><span>${r.date}</span></div>
              ${r.replyingTo ? `<div class="replyitem__quote">replying to <b>${r.replyingTo.user}</b>: "${truncateReply(r.replyingTo.text, 60)}"</div>` : ""}
              <p>${r.text}</p>
              <button type="button" class="replyitem__replybtn" data-index="${i}">Reply</button>
            </div>
          </div>`).join("")
      : `<p class="replylist__empty">No replies yet. Be the first to reply.</p>`;

    listEl.querySelectorAll(".replyitem__replybtn").forEach(replyBtn => {
      replyBtn.addEventListener("click", () => {
        const reply = getEngagement(key).replies[Number(replyBtn.dataset.index)];
        if (reply) setQuote(reply);
      });
    });
  }
  paintReplies();

  function submit() {
    const text = input.value.trim();
    if (!text) return;
    addReply(key, text, "Fenx", context, selectedQuote);
    input.value = "";
    setQuote(null);
    paintReplies();
    if (onUpdate) onUpdate();
  }
  btn.addEventListener("click", submit);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); });
}

function truncateReply(text, max) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max).trim() + "…" : text;
}