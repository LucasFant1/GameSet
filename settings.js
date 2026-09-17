/* ============================================================
   GAMESET — settings.js
   Depends on api.js and common.js, loaded before this file.
   ============================================================ */

/* ---------- Panel: Profile ---------- */
const profile = getMyProfile();
document.getElementById("settingsName").value = profile.name;
document.getElementById("settingsBio").value = profile.bio;
applyAvatarTo(document.getElementById("avatarPreview"), profile.avatar, (profile.name || "F")[0].toUpperCase());

document.getElementById("avatarInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  resizeImageToDataUrl(file, 160, (dataUrl) => {
    const current = getMyProfile();
    saveMyProfile({ ...current, avatar: dataUrl });
    applyAvatarTo(document.getElementById("avatarPreview"), dataUrl, (current.name || "F")[0].toUpperCase());
    document.querySelectorAll(".profile .avatar, .profile__dropdown-head .avatar").forEach(el => {
      applyAvatarTo(el, dataUrl, (current.name || "F")[0].toUpperCase());
    });
  });
});

document.getElementById("removeAvatarBtn").addEventListener("click", () => {
  const current = getMyProfile();
  saveMyProfile({ ...current, avatar: null });
  const initial = (current.name || "F")[0].toUpperCase();
  applyAvatarTo(document.getElementById("avatarPreview"), null, initial);
  document.querySelectorAll(".profile .avatar, .profile__dropdown-head .avatar").forEach(el => {
    applyAvatarTo(el, null, initial);
  });
});

/* ---------- Resize the chosen image before saving ----------
   Avoids storing giant photos in localStorage — shrinks it down to a
   small square (good enough for an avatar) before converting to a
   data URL. */
function resizeImageToDataUrl(file, size, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;
      ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
      callback(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

document.getElementById("saveProfileBtn").addEventListener("click", () => {
  const name = document.getElementById("settingsName").value.trim() || "Fenx";
  const bio = document.getElementById("settingsBio").value.trim();
  const current = getMyProfile();
  saveMyProfile({ ...current, name, bio });

  const msg = document.getElementById("settingsMsg");
  msg.textContent = "Profile updated! This already reflects in the site header.";
  msg.className = "ratebox__msg is-success";

  document.querySelectorAll(".profile__name").forEach(el => { el.textContent = name; });
  document.querySelectorAll(".profile .avatar, .profile__dropdown-head .avatar").forEach(el => {
    el.textContent = name[0].toUpperCase();
  });
  const headStrong = document.querySelector(".profile__dropdown-head strong");
  if (headStrong) headStrong.textContent = name;
});

/* ---------- Panel: Data ---------- */
document.getElementById("reviewsPrivacySelect").value = getMyProfile().reviewsPrivacy || "public";

document.getElementById("applyPrivacyBtn").addEventListener("click", () => {
  const value = document.getElementById("reviewsPrivacySelect").value;
  const current = getMyProfile();
  saveMyProfile({ ...current, reviewsPrivacy: value });
  alert(value === "followers"
    ? "Done — your reviews now only show to people who follow you."
    : "Done — your reviews are now public for anyone to see.");
});

document.getElementById("removeReviewsBtn").addEventListener("click", () => {
  const sure = confirm("Remove the text and score from all of your reviews? This action cannot be undone.");
  if (!sure) return;
  localStorage.removeItem(REVIEWS_KEY);
  alert("All of your reviews have been removed.");
});

document.getElementById("removeCommentsBtn").addEventListener("click", () => {
  const sure = confirm("Remove every comment you've left on reviews and tier lists?");
  if (!sure) return;
  const all = getAllEngagement();
  Object.keys(all).forEach(key => {
    all[key].replies = (all[key].replies || []).filter(r => r.user !== "Fenx");
  });
  saveAllEngagement(all);
  alert("All of your comments have been removed.");
});

document.getElementById("deleteAllLogsBtn").addEventListener("click", () => {
  const sure = confirm(
    "Delete your entire history? You'll lose reviews, comments, and likes.\n" +
    "Your account, username, tier lists, friends, and favorites will be kept.\n\nThis action is permanent."
  );
  if (!sure) return;
  localStorage.removeItem(REVIEWS_KEY);
  localStorage.removeItem(ENGAGEMENT_KEY);
  alert("History deleted. Your account, tier lists, friends, and favorites remain intact.");
});

/* ---------- Panel: Account ---------- */
const ACCOUNT_KEY = "gameset:account";
function getAccount() {
  try { return JSON.parse(localStorage.getItem(ACCOUNT_KEY)) || { email: "" }; }
  catch { return { email: "" }; }
}
document.getElementById("settingsEmail").value = getAccount().email;

document.getElementById("saveEmailBtn").addEventListener("click", () => {
  const email = document.getElementById("settingsEmail").value.trim();
  const msg = document.getElementById("emailMsg");
  if (!email || !email.includes("@")) {
    msg.textContent = "Enter a valid email address.";
    msg.className = "ratebox__msg is-error";
    return;
  }
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify({ ...getAccount(), email }));
  msg.textContent = "Email updated (example — connect this to your authentication backend).";
  msg.className = "ratebox__msg is-success";
});

document.getElementById("changePasswordBtn").addEventListener("click", () => {
  const current = document.getElementById("currentPassword").value;
  const next = document.getElementById("newPassword").value;
  const confirmPw = document.getElementById("confirmPassword").value;
  const msg = document.getElementById("passwordMsg");

  if (!current || !next) {
    msg.textContent = "Fill in your current password and a new password.";
    msg.className = "ratebox__msg is-error";
    return;
  }
  if (next !== confirmPw) {
    msg.textContent = "The confirmation doesn't match the new password.";
    msg.className = "ratebox__msg is-error";
    return;
  }
  msg.textContent = "Password changed (example — connect this to your authentication backend).";
  msg.className = "ratebox__msg is-success";
  document.getElementById("currentPassword").value = "";
  document.getElementById("newPassword").value = "";
  document.getElementById("confirmPassword").value = "";
});

document.getElementById("settingsSignOut").addEventListener("click", () => {
  alert("Signed out (example — connect this to your authentication backend).");
});

document.getElementById("settingsDelete").addEventListener("click", () => {
  const sure = confirm("Are you sure you want to delete your account? This action cannot be undone (in this demo, it also erases your locally saved data).");
  if (!sure) return;
  ["gameset:reviews", "gameset:engagement", "gameset:tierlists", "gameset:following", "gameset:profile", "gameset:account"]
    .forEach(k => localStorage.removeItem(k));
  alert("Account deleted (example). All local demo data has been erased.");
  window.location.href = "index.html";
});