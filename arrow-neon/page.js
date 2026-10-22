// Copyright (c) Victor Fang 2026. All rights reserved.
const films = {
  launch: {src:'videos/launch-film.mp4', poster:'assets/launch-film-poster.webp', captions:'videos/launch-film.vtt', label:'Arrow Neon launch film: cinematic motion artwork', caption:'Cinematic motion artwork · 15 seconds · Meet the Neon Keepers in Tokyo, 2041.'},
  gameplay: {src:'videos/gameplay-preview.mp4', poster:'assets/gameplay-preview-poster.webp', captions:'videos/gameplay-preview.vtt', label:'Arrow Neon gameplay preview: actual native screen recording', caption:'Actual game footage · 20 seconds · A quiet look at the puzzle’s breathing glow.'},
  flight: {src:'videos/neon-flight.mp4', poster:'assets/neon-flight-poster.webp', captions:'videos/neon-flight.vtt', label:'Arrow Neon flight: original animated neon arrows', caption:'Original neon animation · 8 seconds · A little light, a little room to dream.'},
};
document.querySelectorAll('[data-film]').forEach(button => {
  button.addEventListener('click', () => {
    if (button.getAttribute('aria-pressed') === 'true') return;
    const film = films[button.dataset.film];
    const player = document.querySelector('#launch-video');
    player.pause();
    player.src = film.src;
    player.poster = film.poster;
    player.setAttribute('aria-label', film.label);
    document.querySelector('#film-captions').src = film.captions;
    document.querySelector('#film-caption').textContent = film.caption;
    player.load();
    document.querySelectorAll('[data-film]').forEach(option => option.setAttribute('aria-pressed', String(option === button)));
  });
});
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
