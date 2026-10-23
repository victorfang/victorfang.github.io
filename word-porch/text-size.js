"use strict";

// Shared across the landing page, Privacy, Terms, and Support.
(() => {
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
})();
