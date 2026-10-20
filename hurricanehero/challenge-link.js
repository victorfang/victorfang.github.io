// Hurricane Hero.  Author: Victor Fang, 2026
// Shared, dependency-free link contract for the game and public landing page.
export const CHALLENGE_MARKETING_URL = 'https://victorfang.com/hurricanehero/';
export const CHALLENGE_GAME_URL = 'https://hurricane-hero.vicfcs.chatgpt.site/';
export const CHALLENGE_REGIONS = Object.freeze([
 ['atlantic','Caribbean'], ['pacific','Hawaiʻi'], ['indian','SW Indian Ocean'],
 ['singapore','Singapore Strait'], ['gulf','Gulf Coast'], ['bengal','Bay of Bengal'],
 ['philippines','Philippines'], ['japan','Japan'], ['australia','Northern Australia'],
 ['fiji','South Pacific'], ['south-china-sea','South China Sea'], ['shantou-1922','Shantou 1922']
].map(([id,name]) => Object.freeze({id,name})));

export function parseChallenge(search, regions = CHALLENGE_REGIONS) {
 if (typeof search !== 'string' || search.length > 1500) return null;
 const p = new URLSearchParams(search);
 const one = key => p.getAll(key).length === 1;
 if (p.get('mode') === 'feast') {
  if (!['mode','v','region','seed','score'].every(one) || p.has('level')) return null;
  const version = p.get('v');
  if (!['1','2'].includes(version)) return null;
  const regionIndex = regions.findIndex(region => region.id === p.get('region'));
  if (regionIndex < 0 || !/^\d{1,10}$/.test(p.get('seed') || '') || !/^\d{1,7}$/.test(p.get('score') || '')) return null;
  const seed = Number(p.get('seed')), score = Number(p.get('score'));
  if (seed > 4294967295 || score > 9999999) return null;
  if (version === '2' && (!one('difficulty') || !['easy','normal','hard'].includes(p.get('difficulty')))) return null;
  if (version === '1' && p.has('difficulty')) return null;
  return {kind:'arcade', version, region:p.get('region'), regionIndex, seed, score, difficulty:version === '2' ? p.get('difficulty') : 'normal'};
 }
 if (!one('level') || !one('score') || (p.has('mode') && (!one('mode') || p.get('mode') !== 'campaign'))) return null;
 if (['v','region','seed','difficulty'].some(key => p.has(key))) return null;
 if (!/^\d{1,2}$/.test(p.get('level')) || !/^\d{1,6}$/.test(p.get('score'))) return null;
 const level = Number(p.get('level')), score = Number(p.get('score'));
 return level >= 1 && level <= 20 ? {kind:'tutorial', level, score} : null;
}

export function challengeURL(challenge, destination = 'landing') {
 const url = new URL(destination === 'game' ? CHALLENGE_GAME_URL : CHALLENGE_MARKETING_URL);
 if (!challenge) return url.href;
 const p = new URLSearchParams(challenge.kind === 'arcade'
  ? {mode:'feast',v:'2',region:challenge.region,difficulty:challenge.difficulty,seed:String(challenge.seed),score:String(challenge.score)}
  : {level:String(challenge.level),score:String(challenge.score)});
 if (parseChallenge(p.toString())) url.search = p.toString();
 return url.href;
}

export function challengeShareURL(value) {
 try {
  const url = new URL(value), marketing = new URL(CHALLENGE_MARKETING_URL), game = new URL(CHALLENGE_GAME_URL);
  if (url.protocol !== 'https:' || url.username || url.password || url.port) return CHALLENGE_MARKETING_URL;
  const allowed = (url.origin === marketing.origin && ['/hurricanehero','/hurricanehero/'].includes(url.pathname)) ||
   (url.origin === game.origin && url.pathname === '/');
  return allowed ? challengeURL(parseChallenge(url.search)) : CHALLENGE_MARKETING_URL;
 } catch { return CHALLENGE_MARKETING_URL; }
}
