/* ============================================================
   GAMESET — donate.js
   Depends on api.js and common.js (top search/profile), loaded before.
   ============================================================ */

/* ---------- Frequency (monthly / one-time) ---------- */
let frequency = "monthly";
const freqButtons = document.querySelectorAll("#frequencyToggle button");
freqButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    freqButtons.forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    frequency = btn.dataset.freq;
    updateSubmitLabel();
  });
});

/* ---------- Selected amount ---------- */
let selectedAmount = 25;
const amountButtons = document.querySelectorAll(".amountbtn[data-amount]");
const customAmountInput = document.getElementById("customAmount");

amountButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    amountButtons.forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    customAmountInput.value = "";
    selectedAmount = Number(btn.dataset.amount);
    updateSubmitLabel();
  });
});

customAmountInput.addEventListener("input", () => {
  amountButtons.forEach(b => b.classList.remove("is-active"));
  selectedAmount = Number(customAmountInput.value) || 0;
  updateSubmitLabel();
});

/* ---------- Payment method ---------- */
let selectedMethod = "pix";
const methodButtons = document.querySelectorAll(".methodbtn");
methodButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    methodButtons.forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    selectedMethod = btn.dataset.method;
  });
});

/* ---------- Donate button label ---------- */
function updateSubmitLabel() {
  const value = selectedAmount > 0 ? selectedAmount : 0;
  const formatted = value.toLocaleString("en-US", { style: "currency", currency: "USD" });
  const suffix = frequency === "monthly" ? "/mo" : "";
  document.getElementById("donateSubmitAmount").textContent = `${formatted}${suffix}`;
}
updateSubmitLabel();

/* ---------- Submit (mock — swap for your payment gateway) ---------- */
document.getElementById("donateSubmit").addEventListener("click", () => {
  const msg = document.getElementById("donateMsg");
  if (!selectedAmount || selectedAmount <= 0) {
    msg.textContent = "Choose or enter a valid amount before continuing.";
    msg.className = "ratebox__msg is-error";
    return;
  }
  const methodLabel = { pix: "Pix", card: "card", paypal: "PayPal" }[selectedMethod];
  msg.textContent = `All set — this would take you to checkout via ${methodLabel} (payment integration not connected yet).`;
  msg.className = "ratebox__msg is-success";
});

/* ---------- FAQ (accordion) ---------- */
document.querySelectorAll(".faqitem__q").forEach(btn => {
  btn.addEventListener("click", () => {
    btn.parentElement.classList.toggle("is-open");
  });
});