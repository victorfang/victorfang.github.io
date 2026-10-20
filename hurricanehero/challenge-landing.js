// Hurricane Hero.  Author: Victor Fang, 2026
import {CHALLENGE_GAME_URL, CHALLENGE_REGIONS, parseChallenge, challengeURL} from './challenge-link.js';

const challenge = parseChallenge(location.search);
const banner = document.getElementById('challenge-banner');
const title = document.getElementById('challenge-title');
const details = document.getElementById('challenge-details');
const play = document.getElementById('challenge-play');

if (challenge) {
 const score = challenge.score.toLocaleString('en-US');
 title.textContent = 'Can you beat ' + score + ' points?';
 details.textContent = challenge.kind === 'arcade'
  ? CHALLENGE_REGIONS[challenge.regionIndex].name + ' · ' + ({easy:'Easy',normal:'Normal',hard:'Hard'})[challenge.difficulty] + ' · Same storm layout'
  : 'Tutorial ' + challenge.level + ' · Same mission. Your own route.';
 play.href = challengeURL(challenge, 'game');
 play.dataset.shareUrl = challengeURL(challenge);
 play.dataset.shareText = 'Can you beat ' + score + ' points in Hurricane Hero?';
 const hero = document.getElementById('hero-download');
 hero.href = play.href;
 document.getElementById('hero-download-text').textContent = 'Play this challenge';
 document.title = 'Beat ' + score + ' points | Hurricane Hero';
 document.body.dataset.challenge = challenge.kind;
 banner.hidden = false;
} else if (['mode','v','region','difficulty','seed','score','level'].some(key => new URLSearchParams(location.search).has(key))) {
 title.textContent = 'This challenge link is incomplete.';
 details.textContent = 'Ask your friend to share it again, or start a fresh storm.';
 play.textContent = 'Play Hurricane Hero';
 play.href = CHALLENGE_GAME_URL;
 document.body.dataset.challenge = 'invalid';
 banner.hidden = false;
}
