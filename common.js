
const REPORT_EMAIL = "lumfanti@gmail.com";

(function setupReportModal() {
  const modal = document.createElement("div");
  modal.className = "reportmodal";
  modal.id = "reportModal";
  modal.innerHTML = `
    <div class="reportmodal__backdrop"></div>
    <div class="reportmodal__box">
      <button type="button" class="reportmodal__close" aria-label="Close">✕</button>
      <h3>Report content</h3>
      <p class="reportmodal__target" id="reportModalTarget"></p>
      <div class="reportmodal__reasons" id="reportModalReasons">
        <label><input type="radio" name="reportReason" value="Spam or advertising"> Spam or advertising</label>
        <label><input type="radio" name="reportReason" value="Harassment or hate speech"> Harassment or hate speech</label>
        <label><input type="radio" name="reportReason" value="Unmarked spoiler"> Unmarked spoiler</label>
        <label><input type="radio" name="reportReason" value="Inappropriate content"> Inappropriate content</label>
        <label><input type="radio" name="reportReason" value="Other"> Other</label>
      </div>
      <textarea id="reportModalDetails" placeholder="Additional details (optional)" rows="3"></textarea>
      <button type="button" class="btn-primary reportmodal__submit" id="reportModalSubmit">Submit report</button>
      <p class="reportmodal__note">This opens your email app with the report ready to send to ${REPORT_EMAIL}.</p>
    </div>
  `;
  document.body.appendChild(modal);

  let currentTarget = null;

  window.openReportModal = function (target) {
    currentTarget = target;
    document.getElementById("reportModalTarget").textContent = target.label;
    modal.querySelectorAll('input[name="reportReason"]').forEach(r => { r.checked = false; });
    document.getElementById("reportModalDetails").value = "";
    modal.classList.add("is-open");
  };

  function closeModal() { modal.classList.remove("is-open"); }
  modal.querySelector(".reportmodal__close").addEventListener("click", closeModal);
  modal.querySelector(".reportmodal__backdrop").addEventListener("click", closeModal);

  document.getElementById("reportModalSubmit").addEventListener("click", () => {
    const reasonEl = modal.querySelector('input[name="reportReason"]:checked');
    if (!reasonEl) { alert("Choose a reason for the report."); return; }
    if (!currentTarget) return;

    const reason = reasonEl.value;
    const details = document.getElementById("reportModalDetails").value.trim();
    const myName = getMyProfile ? getMyProfile().name : "Fenx";

    const subject = `[GameSet Report] ${currentTarget.label}`;
    const bodyLines = [
      `Reason: ${reason}`,
      details ? `Details: ${details}` : null,
      "",
      `Reported content: ${currentTarget.label}`,
      currentTarget.excerpt ? `Excerpt: "${currentTarget.excerpt}"` : null,
      "",
      `Reported by: ${myName}`,
      `Page: ${window.location.href}`,
    ].filter(Boolean);

    const mailto = `mailto:${REPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join("\n"))}`;
    window.location.href = mailto;
    closeModal();
  });
})();

/* ---------- Report button (used inside review cards) ---------- */
function reportButtonHtml() {
  return `<button type="button" class="reportbtn" title="Report">🚩</button>`;
}
function wireReportButton(el, target) {
  const btn = el.querySelector(".reportbtn");
  if (btn) btn.addEventListener("click", () => openReportModal(target));
}

/* ---------- Safety net: a broken image falls back to a placeholder ----------*/
document.addEventListener("error", (e) => {
  const el = e.target;
  if (el.tagName !== "IMG" || el.dataset.fallbackApplied) return;
  el.dataset.fallbackApplied = "1";
  const w = el.width || 300, h = el.height || 400;
  const label = encodeURIComponent((el.alt || "?").slice(0, 24));
  el.src = `https://placehold.co/${w}x${h}/1e1b29/6b6679?text=${label}`;
}, true); 

/* ---------- Apply the saved profile (name/photo) to the header ---------- */
(function applyProfileToHeader() {
  if (typeof getMyProfile !== "function") return;
  const profile = getMyProfile();
  const initial = (profile.name || "F")[0].toUpperCase();

  document.querySelectorAll(".profile__name").forEach(el => { el.textContent = profile.name; });
  const headStrong = document.querySelector(".profile__dropdown-head strong");
  if (headStrong) headStrong.textContent = profile.name;

  document.querySelectorAll(".profile .avatar, .profile__dropdown-head .avatar").forEach(el => {
    applyAvatarTo(el, profile.avatar, initial);
  });
})();

/* ---------- Apply a photo (or the initial) to a .avatar element ---------- */
function applyAvatarTo(el, avatarUrl, initial) {
  if (avatarUrl) {
    el.textContent = "";
    el.style.background = `url(${avatarUrl}) center/cover`;
  } else {
    el.style.background = "";
    el.textContent = initial;
  }
}

/* ---------- Header search ---------- */
(function setupHeaderSearch() {
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");
  if (!searchInput || !searchResults) return;
  let debounce;

  searchInput.addEventListener("input", () => {
    clearTimeout(debounce);
    const q = searchInput.value.trim();
    if (!q) { searchResults.classList.remove("is-open"); return; }
    searchResults.innerHTML = `<div class="searchresults__loading">Searching…</div>`;
    searchResults.classList.add("is-open");
    debounce = setTimeout(async () => {
      const games = await searchGames(q);
      searchResults.innerHTML = "";
      if (!games.length) {
        searchResults.innerHTML = `<div class="searchresults__empty">No games found</div>`;
        return;
      }
      games.forEach(g => {
        const item = document.createElement("div");
        item.className = "searchresults__item";
        const img = g.background_image || "https://placehold.co/36x48/1e1b29/6b6679?text=?";
        item.innerHTML = `
          <img src="${img}" alt="">
          <div class="searchresults__meta">
            <strong>${g.name}</strong>
            <span>${g.rating ? "★ " + g.rating.toFixed(1) : "No rating yet"}</span>
          </div>`;
        item.addEventListener("click", () => {
          const idOrSlug = g.slug || g.id || encodeURIComponent(g.name);
          window.location.href = `game.html?id=${idOrSlug}`;
        });
        searchResults.appendChild(item);
      });
    }, 350);
  });
})();

/* ---------- Profile dropdown ---------- */
(function setupProfileDropdown() {
  const btn = document.getElementById("profileBtn");
  const dropdown = document.getElementById("profileDropdown");
  if (!btn || !dropdown) return;
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    document.getElementById("notifDropdown")?.classList.remove("is-open");
    dropdown.classList.toggle("is-open");
  });
  const signOut = document.getElementById("signOutLink");
  signOut?.addEventListener("click", (e) => {
    e.preventDefault();
    alert("Signed out (example — connect this to your authentication backend).");
  });
})();

/* ---------- Notifications dropdown ---------- */
const DEMO_NOTIFICATIONS = [
  { icon: "♥", text: "Renan_ liked your review of Resident Evil Requiem", time: "12m ago", unread: true },
  { icon: "💬", text: "luh.games replied to your comment", time: "1h ago", unread: true },
  { icon: "👤", text: "theo.dev started following you", time: "3h ago", unread: true },
  { icon: "♥", text: "3 people liked your tier list", time: "1d ago", unread: false },
];

(function setupNotifDropdown() {
  const btn = document.getElementById("notifBtn");
  const dropdown = document.getElementById("notifDropdown");
  if (!btn || !dropdown) return;

  const list = dropdown.querySelector(".notif__list");
  list.innerHTML = DEMO_NOTIFICATIONS.map(n => `
    <div class="notif__item ${n.unread ? "is-unread" : ""}">
      <span class="notif__icon">${n.icon}</span>
      <div class="notif__body">
        <p>${n.text}</p>
        <span class="notif__time">${n.time}</span>
      </div>
    </div>
  `).join("");

  const badge = document.getElementById("notifBadge");
  const unreadCount = DEMO_NOTIFICATIONS.filter(n => n.unread).length;
  if (badge) {
    if (unreadCount > 0) { badge.textContent = unreadCount; badge.hidden = false; }
    else badge.hidden = true;
  }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    document.getElementById("profileDropdown")?.classList.remove("is-open");
    dropdown.classList.toggle("is-open");
  });
})();

/* ---------- Close the dropdowns when clicking outside ---------- */
document.addEventListener("click", (e) => {
  if (!e.target.closest(".searchbox")) document.getElementById("searchResults")?.classList.remove("is-open");
  if (!e.target.closest(".profile")) document.getElementById("profileDropdown")?.classList.remove("is-open");
  if (!e.target.closest(".notif")) document.getElementById("notifDropdown")?.classList.remove("is-open");
});
