
let currentTab = "following";

function getPeopleForTab() {
  const following = getFollowing();
  const q = document.getElementById("friendsSearch").value.trim().toLowerCase();
  let list = currentTab === "following"
    ? DEMO_USERS.filter(u => following.includes(u.user))
    : DEMO_USERS.filter(u => !following.includes(u.user));
  if (q) list = list.filter(u => u.user.toLowerCase().includes(q));
  return list;
}

function renderCard(person) {
  const following = isFollowing(person.user);
  const el = document.createElement("div");
  el.className = "friendcard";
  el.innerHTML = `
    <span class="avatar friendcard__avatar">${person.user[0].toUpperCase()}</span>
    <div class="friendcard__info">
      <b>${person.user}</b>
      <p>${person.bio}</p>
    </div>
    <button type="button" class="followbtn ${following ? "is-following" : ""}">
      ${following ? "Following" : "+ Follow"}
    </button>
  `;
  el.querySelector(".followbtn").addEventListener("click", (e) => {
    const nowFollowing = toggleFollow(person.user);
    e.currentTarget.classList.toggle("is-following", nowFollowing);
    e.currentTarget.textContent = nowFollowing ? "Following" : "+ Follow";
    if (currentTab === "following" && !nowFollowing) renderList();
  });
  return el;
}

function renderList() {
  const list = document.getElementById("friendsList");
  const emptyMsg = document.getElementById("friendsEmpty");
  const people = getPeopleForTab();

  list.innerHTML = "";
  if (!people.length) {
    emptyMsg.hidden = false;
    emptyMsg.textContent = currentTab === "following"
      ? "You aren't following anyone yet. Check out the suggestions!"
      : "No suggestions found.";
    return;
  }
  emptyMsg.hidden = true;
  people.forEach(p => list.appendChild(renderCard(p)));
}

document.querySelectorAll("#friendsTabs button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#friendsTabs button").forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    currentTab = btn.dataset.tab;
    renderList();
  });
});

document.getElementById("friendsSearch").addEventListener("input", renderList);

renderList();
