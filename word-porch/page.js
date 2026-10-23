"use strict";

// Only add verified public listings. A null URL leaves an honest status card.
const storeLinks = Object.freeze({ ios: null, android: null });
const storeHosts = { ios: "apps.apple.com", android: "play.google.com" };
for (const [platform, href] of Object.entries(storeLinks)) {
  if (!href) continue;
  try {
    const url = new URL(href);
    if (url.protocol !== "https:" || url.hostname !== storeHosts[platform]) continue;
    const card = document.querySelector(`[data-platform="${platform}"]`);
    const link = document.createElement("a");
    link.className = card.className;
    link.href = url.href;
    link.dataset.platform = platform;
    link.innerHTML = card.innerHTML;
    link.querySelector(".platform-status").textContent = platform === "ios" ? "Download on the App Store ↗" : "Get it on Google Play ↗";
    card.replaceWith(link);
  } catch { /* Keep the status card if a configured URL is invalid. */ }
}
if (Object.values(storeLinks).every(Boolean)) {
  document.querySelector(".availability-note").textContent = "Other platforms are coming soon.";
}

const textSizeButton = document.querySelector(".text-size");
let largeText = false;
try { largeText = localStorage.getItem("word-porch-page-large-text") === "true"; } catch { /* This preference is optional. */ }
function applyTextSize() {
  document.documentElement.style.setProperty("--body-size", largeText ? "23px" : "20px");
  textSizeButton.setAttribute("aria-pressed", String(largeText));
  textSizeButton.setAttribute("aria-label", largeText ? "Use standard text size" : "Use larger text");
  textSizeButton.querySelector(".size-label").textContent = largeText ? "Standard text" : "Larger text";
}
applyTextSize();
textSizeButton.hidden = false;
textSizeButton.addEventListener("click", () => {
  largeText = !largeText;
  applyTextSize();
  try { localStorage.setItem("word-porch-page-large-text", String(largeText)); } catch { /* The control still works without storage. */ }
});

// This sample uses the shipped Paris puzzle p001. It has no wallet, ads, or saves.
const answers = [
  { word: "READ", clue: "Enjoy a book." },
  { word: "DEAR", clue: "Cherished." },
  { word: "DARE", clue: "Have the courage to try." },
  { word: "RED", clue: "The color of a ripe tomato." }
];
const bonusWords = new Set(["EAR", "ARE", "ERA", "RAD"]);
const tileButtons = Array.from(document.querySelectorAll("[data-letter]"));
const found = new Set();
let selected = [];
let clueLevel = 0;
const message = document.getElementById("demo-message");
const draft = document.getElementById("word-draft");
const findButton = document.getElementById("demo-find");
const undoButton = document.getElementById("demo-undo");
const clueButton = document.getElementById("demo-clue");
function renderDraft() {
  tileButtons.forEach((button, index) => { button.disabled = selected.includes(index); });
  draft.textContent = selected.length ? selected.map(index => tileButtons[index].dataset.letter).join(" ") : "Tap the letters above";
  findButton.disabled = selected.length < 3;
  undoButton.disabled = selected.length === 0;
}
tileButtons.forEach((button, index) => button.addEventListener("click", () => {
  selected.push(index);
  renderDraft();
}));
undoButton.addEventListener("click", () => {
  const index = selected.pop();
  renderDraft();
  if (index !== undefined) tileButtons[index].focus({ preventScroll: true });
});
findButton.addEventListener("click", () => {
  const word = selected.map(index => tileButtons[index].dataset.letter).join("");
  if (found.has(word)) {
    message.textContent = `You already found ${word}. Let’s try another.`;
  } else if (answers.some(answer => answer.word === word)) {
    found.add(word);
    clueLevel = 0;
    const row = document.querySelector(`[data-answer="${word}"]`);
    Array.from(row.children).forEach((cell, index) => { cell.textContent = word[index]; });
    row.classList.add("found");
    row.setAttribute("aria-label", `${word}, found`);
    document.getElementById("demo-progress").textContent = `${found.size} of 4 words found`;
    message.textContent = found.size === 4 ? "Lovely work! All four words found. Your first little escape, complete." : `${word}—lovely! ${found.size} of 4 words found. Try another, or choose Clue.`;
    clueButton.disabled = found.size === 4;
  } else if (bonusWords.has(word)) {
    message.textContent = `${word} is a lovely bonus word! The four puzzle words are still waiting.`;
  } else {
    message.textContent = "That’s not one of these words. Take your time, or try a clue.";
  }
  selected = [];
  renderDraft();
  tileButtons[0].focus({ preventScroll: true });
});
clueButton.addEventListener("click", () => {
  const answer = answers.find(answer => !found.has(answer.word));
  if (!answer) return;
  clueLevel += 1;
  message.textContent = clueLevel === 1 ? `Clue: ${answer.clue} ${answer.word.length} letters, starting with ${answer.word[0]}.` : `A little help: try ${answer.word}. Tap its letters, then Find.`;
});
document.getElementById("demo-reset").addEventListener("click", () => {
  selected = [];
  found.clear();
  clueLevel = 0;
  document.querySelectorAll("[data-answer]").forEach(row => {
    row.classList.remove("found");
    row.setAttribute("aria-label", `${row.dataset.answer.length === 4 ? "Four" : "Three"}-letter word, not yet found`);
    Array.from(row.children).forEach(cell => { cell.textContent = "·"; });
  });
  document.getElementById("demo-progress").textContent = "0 of 4 words found";
  message.textContent = "First clue: enjoy a book.";
  clueButton.disabled = false;
  renderDraft();
  tileButtons[0].focus({ preventScroll: true });
});
document.querySelector(".demo-interactive").hidden = false;
