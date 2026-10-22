// Copyright (c) Victor Fang 2026. All rights reserved.
const svgNS = 'http://www.w3.org/2000/svg';
const board = document.querySelector('#demo-board');
const status = document.querySelector('#demo-status');
const demo = document.querySelector('.demo');
const arrows = [
  { name: 'Amber arrow pointing up', color: '#ffbd7d', direction: 'up', points: [[3,4],[3,1]], delta: [0,-1] },
  { name: 'Rose arrow pointing right', color: '#ef9dba', direction: 'right', points: [[0,3],[2,3]], delta: [1,0] },
  { name: 'Coral arrow pointing down', color: '#fa9b89', direction: 'down', points: [[5,2],[5,5]], delta: [0,1] },
  { name: 'Gold arrow pointing left', color: '#efd393', direction: 'left', points: [[6,6],[4,6]], delta: [-1,0] },
];
const active = new Set(arrows.map((_, index) => index));
const nodes = [];
function svgNode(tag, attributes = {}) {
  const element = document.createElementNS(svgNS, tag);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
  return element;
}
function pathFor(arrow) {
  const points = arrow.points.map(([x,y]) => [65 + x*44, 32 + y*44]);
  const head = points.at(-1);
  const [dx,dy] = arrow.delta;
  const wing1 = [head[0]-dx*12-dy*9,head[1]-dy*12+dx*9];
  const wing2 = [head[0]-dx*12+dy*9,head[1]-dy*12-dx*9];
  return `M${points.map(p => p.join(',')).join(' L')} M${wing1} L${head} L${wing2}`;
}
function occupies(arrow, x, y) {
  const [[x1,y1],[x2,y2]] = arrow.points;
  return x >= Math.min(x1,x2) && x <= Math.max(x1,x2) && y >= Math.min(y1,y2) && y <= Math.max(y1,y2);
}
function blocked(index) {
  const arrow = arrows[index];
  let [x,y] = arrow.points.at(-1);
  const [dx,dy] = arrow.delta;
  x += dx; y += dy;
  while (x >= 0 && x <= 6 && y >= 0 && y <= 6) {
    if ([...active].some(other => other !== index && occupies(arrows[other],x,y))) return true;
    x += dx; y += dy;
  }
  return false;
}
function rescue(index) {
  if (!active.has(index)) return;
  const node = nodes[index];
  if (blocked(index)) {
    status.textContent = 'Another Neon is in the way. Try a different arrow.';
    node.classList.remove('is-blocked');
    void node.getBoundingClientRect();
    node.classList.add('is-blocked');
    return;
  }
  active.delete(index);
  node.classList.add('is-freed');
  node.setAttribute('tabindex','-1');
  node.setAttribute('aria-disabled','true');
  const next = [...active].find(other => !blocked(other));
  if (next !== undefined && document.activeElement === node) nodes[next].focus();
  if (active.size) status.textContent = `A little light, set free. ${active.size} more to guide home.`;
  else {
    status.textContent = 'Four little rescues. Your first glow looks good on you.';
    demo.classList.add('is-complete');
    document.querySelector('#reset-demo').focus({preventScroll:true});
  }
}
arrows.forEach((arrow,index) => {
  const group = svgNode('g', {class:`demo-arrow ${arrow.direction}`, role:'button', tabindex:'0', 'aria-label':arrow.name});
  for (const name of ['halo','tube','filament','hit']) group.append(svgNode('path', {d:pathFor(arrow), stroke:arrow.color, class:name}));
  group.addEventListener('click', () => rescue(index));
  group.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); rescue(index); }
  });
  board.append(group);
  nodes.push(group);
});
document.querySelector('#reset-demo').addEventListener('click', () => {
  arrows.forEach((_,index) => {
    active.add(index);
    nodes[index].classList.remove('is-freed','is-blocked');
    nodes[index].setAttribute('tabindex','0');
    nodes[index].removeAttribute('aria-disabled');
  });
  demo.classList.remove('is-complete');
  status.textContent = 'Find a clear lane. Tap an arrow to begin.';
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
