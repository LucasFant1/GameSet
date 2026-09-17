/* ============================================================
   GAMESET — tierlists-data.js
   Definitions and data shared between tierlists.html and
   tierlist-editor.html. Depends on api.js (DEMO_GAMES) loaded before.
   ============================================================ */

const TIER_DEFS = [
  { key: "S", label: "S", color: "#ec4899" },
  { key: "A", label: "A", color: "#f97316" },
  { key: "B", label: "B", color: "#facc15" },
  { key: "C", label: "C", color: "#4ade80" },
  { key: "D", label: "D", color: "#38bdf8" },
  { key: "F", label: "F", color: "#6b6679" },
];

/* Each tier list can have its own set of tiers (name + color), editable
   at creation time. This returns a list's tiers, or the defaults
   (S/A/B/C/D/F) if it doesn't have its own (e.g. old lists saved before
   this feature existed). */
function getTierDefs(list) {
  return (list && list.tierDefs && list.tierDefs.length) ? list.tierDefs : TIER_DEFS;
}

function defaultTierDefs() {
  return TIER_DEFS.map(d => ({ ...d }));
}

function emptyTiers(defs = TIER_DEFS) {
  const t = {};
  defs.forEach(d => { t[d.key] = []; });
  return t;
}

function newTierKey() {
  return "t" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

/* ---------- Ready-made tier list suggestions ----------
   Each comes with a list of real games to already populate the game
   pool when creating one — no need to search for them one by one. The
   rows (tiers) stay the default (S/A/B/C/D/F); only the pool's content
   changes. "dynamic: released" fetches the latest releases straight
   from the API instead of using a fixed list. */
const TIERLIST_SUGGESTIONS = [
  {
    key: "zelda", title: "Best Zelda games", icon: "🗡️",
    games: [
      "The Legend of Zelda: Breath of the Wild", "The Legend of Zelda: Tears of the Kingdom",
      "The Legend of Zelda: Ocarina of Time", "The Legend of Zelda: Majora's Mask",
      "The Legend of Zelda: The Wind Waker", "The Legend of Zelda: Twilight Princess",
      "The Legend of Zelda: A Link to the Past", "The Legend of Zelda: Link's Awakening",
      "The Legend of Zelda: Skyward Sword",
    ],
  },
  {
    key: "rpg", title: "Best RPGs of all time", icon: "🎲",
    games: [
      "Baldur's Gate 3", "The Witcher 3: Wild Hunt", "Persona 5 Royal", "Final Fantasy VII",
      "Chrono Trigger", "Dark Souls III", "Elden Ring", "Disco Elysium", "Mass Effect 2",
    ],
  },
  {
    key: "terror", title: "Scariest games", icon: "👻",
    games: [
      "Resident Evil 7: Biohazard", "Silent Hill 2", "Amnesia: The Dark Descent", "Outlast",
      "Alien: Isolation", "Dead Space", "Five Nights at Freddy's",
    ],
  },
  {
    key: "indie", title: "Best indie games", icon: "🎨",
    games: [
      "Hollow Knight", "Celeste", "Stardew Valley", "Undertale", "Hades", "Braid",
      "Inside", "Super Meat Boy",
    ],
  },
  {
    key: "amigos", title: "Games to play with friends", icon: "🎮",
    games: [
      "Among Us", "Overcooked! 2", "It Takes Two", "Mario Kart Wii", "Fall Guys",
      "Left 4 Dead 2", "Human: Fall Flat",
    ],
  },
  {
    key: "lancamentos", title: "Best releases of the year", icon: "🚀",
    dynamic: "released",
  },
  {
    key: "luta", title: "Best fighting games", icon: "🥊",
    games: [
      "Street Fighter 6", "Tekken 8", "Mortal Kombat 1", "Super Smash Bros. Ultimate",
      "Guilty Gear -Strive-", "Injustice 2", "Dragon Ball FighterZ", "Soulcalibur VI",
      "The King of Fighters XV",
    ],
  },
  {
    key: "mario", title: "Best Mario games", icon: "🍄",
    games: [
      "Super Mario Odyssey", "Super Mario Galaxy", "Super Mario 64", "Super Mario World",
      "Super Mario Bros. 3", "Super Mario Sunshine", "Super Mario Maker 2",
      "Super Mario Bros. Wonder", "Mario Kart 8 Deluxe",
    ],
  },
  {
    key: "souls", title: "Best souls-likes", icon: "⚔️",
    games: [
      "Elden Ring", "Dark Souls III", "Dark Souls", "Bloodborne", "Sekiro: Shadows Die Twice",
      "Demon's Souls", "Lies of P", "Nioh 2", "Hollow Knight",
    ],
  },
  {
    key: "fps", title: "Best shooters", icon: "🔫",
    games: [
      "Counter-Strike 2", "DOOM Eternal", "Half-Life 2", "Valorant", "Overwatch 2",
      "Titanfall 2", "Call of Duty: Modern Warfare 2", "Apex Legends", "Portal 2",
    ],
  },
  {
    key: "mundoaberto", title: "Best open worlds", icon: "🗺️",
    games: [
      "The Legend of Zelda: Breath of the Wild", "Red Dead Redemption 2", "Elden Ring",
      "The Witcher 3: Wild Hunt", "Grand Theft Auto V", "Skyrim", "Ghost of Tsushima",
      "Cyberpunk 2077", "Horizon Zero Dawn",
    ],
  },
  {
    key: "pokemon", title: "Best Pokémon games", icon: "⚡",
    games: [
      "Pokémon Red", "Pokémon Gold", "Pokémon Emerald", "Pokémon Platinum",
      "Pokémon Black", "Pokémon X", "Pokémon Sun", "Pokémon Sword",
      "Pokémon Legends: Arceus", "Pokémon Scarlet",
    ],
  },
  {
    key: "nostalgia", title: "Classics that defined childhood", icon: "📼",
    games: [
      "Crash Bandicoot", "Spyro the Dragon", "Sonic the Hedgehog 2", "Tony Hawk's Pro Skater 2",
      "Age of Empires II", "Counter-Strike 1.6", "Need for Speed: Underground 2",
      "The Sims", "Club Penguin",
    ],
  },
  {
    key: "relaxar", title: "Games to relax with", icon: "🌿",
    games: [
      "Stardew Valley", "Animal Crossing: New Horizons", "Minecraft", "Journey",
      "Unpacking", "A Short Hike", "Terraria", "Slime Rancher",
    ],
  },
  {
    key: "historia", title: "Best stories", icon: "📖",
    games: [
      "The Last of Us", "Red Dead Redemption 2", "Disco Elysium", "NieR: Automata",
      "Life is Strange", "God of War", "Detroit: Become Human", "Silent Hill 2",
      "To the Moon",
    ],
  },
  {
    key: "dificeis", title: "Hardest games", icon: "💀",
    games: [
      "Sekiro: Shadows Die Twice", "Cuphead", "Celeste", "Super Meat Boy", "Hollow Knight",
      "Getting Over It with Bennett Foddy", "Nioh", "Returnal", "The Binding of Isaac",
    ],
  },
];

function gamePickFrom(index, extra = {}) {
  const g = DEMO_GAMES[index];
  return { name: g.name, cover: g.background_image, ...extra };
}

/* ---------- Demo tier lists, made by "other users" ---------- */
const DEMO_TIERLISTS = [
  {
    id: "demo-tl-1",
    title: "Best RPGs of the decade",
    author: "Renan_",
    likes: 142,
    isDemo: true,
    tiers: {
      S: [gamePickFrom(7), gamePickFrom(4)],
      A: [gamePickFrom(9), gamePickFrom(5)],
      B: [gamePickFrom(0)],
      C: [],
      D: [],
      F: [],
    },
  },
  {
    id: "demo-tl-2",
    title: "Games to play with friends",
    author: "luh.games",
    likes: 88,
    isDemo: true,
    tiers: {
      S: [gamePickFrom(1)],
      A: [gamePickFrom(3), gamePickFrom(2)],
      B: [gamePickFrom(6)],
      C: [gamePickFrom(8)],
      D: [],
      F: [],
    },
  },
  {
    id: "demo-tl-3",
    title: "My personal 2025 ranking",
    author: "theo.dev",
    likes: 231,
    isDemo: true,
    tiers: {
      S: [gamePickFrom(4)],
      A: [gamePickFrom(7), gamePickFrom(0)],
      B: [gamePickFrom(5), gamePickFrom(9)],
      C: [gamePickFrom(2)],
      D: [gamePickFrom(1)],
      F: [],
    },
  },
];

/* ---------- Local storage of the user's tier lists ---------- */
const TIERLISTS_KEY = "gameset:tierlists";

function getOwnTierLists() {
  try { return JSON.parse(localStorage.getItem(TIERLISTS_KEY)) || []; }
  catch { return []; }
}

function saveOwnTierLists(lists) {
  localStorage.setItem(TIERLISTS_KEY, JSON.stringify(lists));
}

function getAllTierLists() {
  return [...getOwnTierLists(), ...DEMO_TIERLISTS];
}

function getTierListById(id) {
  return getAllTierLists().find(tl => tl.id === id) || null;
}

function upsertOwnTierList(list) {
  const own = getOwnTierLists();
  const idx = own.findIndex(l => l.id === list.id);
  if (idx >= 0) own[idx] = list;
  else own.unshift(list);
  saveOwnTierLists(own);
}

function deleteOwnTierList(id) {
  saveOwnTierLists(getOwnTierLists().filter(l => l.id !== id));
}

function newTierListId() {
  return "tl-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/* ---------- Resolve the real covers for every game in a tier list ----------
   Demo tier lists (and the editor's initial pool) use fixed covers;
   this swaps each one for the real cover from the API (if the RAWG key
   is configured), keeping the demo image as a fallback. */
async function hydrateTierListCovers(list) {
  const defs = getTierDefs(list);
  const allNames = defs.flatMap(def => (list.tiers[def.key] || []).map(g => g.name));
  const coverMap = await resolveGameCovers(allNames);
  const newTiers = {};
  defs.forEach(def => {
    newTiers[def.key] = (list.tiers[def.key] || []).map(g => ({ ...g, cover: coverMap[g.name] || g.cover }));
  });
  return { ...list, tiers: newTiers };
}