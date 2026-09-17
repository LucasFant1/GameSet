
function describeKey(key, context) {
  if (context) {
    if (key.startsWith("tierlist:")) return `on the tier list "${context}"`;
    return `on a review of ${context}`;
  }
  if (key.startsWith("tierlist:")) return "on a tier list";
  return "on a review";
}

function renderMyComments() {
  const list = document.getElementById("myCommentsList");
  const emptyMsg = document.getElementById("myCommentsEmpty");
  const comments = getMyComments("Fenx").sort((a, b) => (a.date < b.date ? 1 : -1));

  list.innerHTML = "";
  emptyMsg.hidden = comments.length > 0;

  comments.forEach(c => {
    const el = document.createElement("div");
    el.className = "commentcard";
    el.innerHTML = `
      <span class="avatar avatar--sm">F</span>
      <div class="commentcard__body">
        <p class="commentcard__where">You replied ${describeKey(c.key, c.context)}${c.replyingTo ? ` directly to <b>${c.replyingTo.user}</b>` : ""}</p>
        ${c.replyingTo ? `<p class="commentcard__quote">"${c.replyingTo.text}"</p>` : ""}
        <p class="commentcard__text">"${c.text}"</p>
        <span class="commentcard__date">${c.date}</span>
      </div>
    `;
    list.appendChild(el);
  });
}

renderMyComments();
