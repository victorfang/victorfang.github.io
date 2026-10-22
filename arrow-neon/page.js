// Copyright (c) Victor Fang 2026. All rights reserved.
const moods = {
  dark: {src:'assets/dark-mode.webp', alt:'Actual Arrow Neon gameplay with warm arrows on a dark canvas', caption:'A quiet, dark canvas for your little lights.'},
  light: {src:'assets/light-mode.webp', alt:'Actual Arrow Neon gameplay with warm arrows on a light cream canvas', caption:'A softer, sunlit canvas. The same satisfying glow.'},
};
document.querySelectorAll('[data-mood]').forEach(button => {
  button.addEventListener('click', () => {
    const mood = moods[button.dataset.mood];
    const image = document.querySelector('#mood-image');
    image.src = mood.src;
    image.alt = mood.alt;
    image.parentElement.classList.toggle('is-light', button.dataset.mood === 'light');
    document.querySelector('#mood-caption').textContent = mood.caption;
    document.querySelectorAll('[data-mood]').forEach(option => option.setAttribute('aria-pressed',String(option === button)));
  });
});
