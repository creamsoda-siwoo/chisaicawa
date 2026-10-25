'use strict';
/* =========================================================
 *  먼작귀 RPG ~ 토벌 자격 시험 대작전 ~
 *  치이카와 · 하치와레 · 우사기와 함께 마을과 풀숲, 숲, 동굴을
 *  모험하며 노동 게시판의 의뢰를 해결하는 턴제 RPG
 * ========================================================= */

const $ = s => document.querySelector(s);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const rand = (a, b) => a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(rand(a, b + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function mulberry(seed) {
  return () => {
    seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
/* 받침에 따라 조사 고르기: josa('치이카와','은는') → 치이카와는 */
function josa(w, pair) {
  const c = w.charCodeAt(w.length - 1);
  const has = c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28 !== 0;
  return w + (has ? pair[0] : pair[1]);
}
function fmt(n) { return Math.floor(n).toLocaleString('ko-KR'); }

/* ---------- 그림 ---------- */
const INK = '#2b2522';
const XMLNS = 'xmlns="http://www.w3.org/2000/svg"';
const svgUrl = s => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);

function armorSVG() {
  return `<svg ${XMLNS} viewBox="0 0 100 100">
  <path d="M50 20 Q50 4 68 6 Q60 12 57 21Z" fill="#e57373" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
  <path d="M30 94 L31 66 L69 66 L70 94Z" fill="#c4cad3" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M40 72 L60 72 M40 80 L60 80" stroke="${INK}" stroke-width="2" opacity=".4"/>
  <ellipse cx="50" cy="46" rx="27" ry="26" fill="#e1e5ec" stroke="${INK}" stroke-width="3"/>
  <rect x="29" y="40" width="42" height="11" rx="5.5" fill="#3a3540"/>
  <circle cx="41" cy="45.5" r="2.2" fill="#fff"/><circle cx="59" cy="45.5" r="2.2" fill="#fff"/>
  <ellipse cx="33" cy="58" rx="5" ry="3" fill="#f7b6c4"/><ellipse cx="67" cy="58" rx="5" ry="3" fill="#f7b6c4"/>
  <path d="M38 30 Q50 25 62 30" fill="none" stroke="#fff" stroke-width="2.5" opacity=".7" stroke-linecap="round"/>
</svg>`;
}
function kuriSVG() {
  return `<svg ${XMLNS} viewBox="0 0 100 100">
  <path d="M50 12 Q82 40 84 66 Q82 94 50 94 Q18 94 16 66 Q18 40 50 12Z" fill="#b97a4c" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M17 64 Q50 76 83 64 Q82 94 50 94 Q18 94 17 64Z" fill="#edcf9f" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M40 26 Q46 20 50 14" stroke="#fff" stroke-width="2.5" fill="none" opacity=".5" stroke-linecap="round"/>
  <circle cx="40" cy="52" r="3.6" fill="${INK}"/><circle cx="60" cy="52" r="3.6" fill="${INK}"/>
  <path d="M34 44 L45 46 M66 44 L55 46" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M42 62 Q50 58 58 62" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>
  <ellipse cx="30" cy="60" rx="5" ry="3" fill="#f39a9a"/><ellipse cx="70" cy="60" rx="5" ry="3" fill="#f39a9a"/>
</svg>`;
}
function rakkoSVG() {
  return `<svg ${XMLNS} viewBox="0 0 100 100">
  <circle cx="28" cy="26" r="7" fill="#9b7356" stroke="${INK}" stroke-width="3"/>
  <circle cx="72" cy="26" r="7" fill="#9b7356" stroke="${INK}" stroke-width="3"/>
  <path d="M26 92 Q22 66 32 60 L68 60 Q78 66 74 92Z" fill="#9b7356" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <ellipse cx="50" cy="44" rx="28" ry="24" fill="#9b7356" stroke="${INK}" stroke-width="3"/>
  <ellipse cx="50" cy="50" rx="20" ry="15" fill="#efdcc4"/>
  <circle cx="40" cy="42" r="3.4" fill="${INK}"/><circle cx="60" cy="42" r="3.4" fill="${INK}"/>
  <ellipse cx="50" cy="50" rx="4" ry="3" fill="${INK}"/>
  <path d="M50 53 L50 57 M44 58 Q50 61 56 58" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
  <path d="M30 50 L40 51 M30 55 L40 54 M70 50 L60 51 M70 55 L60 54" stroke="${INK}" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M30 60 L70 60" stroke="#e8495f" stroke-width="5" stroke-linecap="round"/>
</svg>`;
}

function monsterSVG(def, boss) {
  const c = def.c, s = INK;
  const eye = (x, y, r = 4.5) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${s}"/><circle cx="${x + r * .35}" cy="${y - r * .35}" r="${r * .35}" fill="#fff"/>`;
  const brows = (y, g = 10) => `<path d="M${50 - g - 7} ${y - 4} L${50 - g + 4} ${y + 1} M${50 + g + 7} ${y - 4} L${50 + g - 4} ${y + 1}" stroke="${s}" stroke-width="2.6" stroke-linecap="round"/>`;
  const teeth = y => `<path d="M40 ${y} L44 ${y + 5} L48 ${y} L52 ${y + 5} L56 ${y} L60 ${y + 5}" fill="none" stroke="${s}" stroke-width="2.2" stroke-linejoin="round"/>`;
  const st = `stroke="${s}" stroke-width="3" stroke-linejoin="round"`;
  let g = '';
  switch (def.t) {
    case 'blob':
      g = `<path d="M18 86 Q10 50 30 32 Q50 16 70 32 Q90 50 82 86 Q50 94 18 86Z" fill="${c}" ${st}/>
        <path d="M30 40 Q36 32 44 31" fill="none" stroke="#fff" stroke-width="3" opacity=".5" stroke-linecap="round"/>
        ${eye(40, 56)}${eye(60, 56)}${brows(50)}${teeth(68)}`;
      break;
    case 'spiky': {
      const pts = [];
      for (let i = 0; i < 14; i++) {
        const a = Math.PI * 2 * i / 14 - Math.PI / 2, r = i % 2 ? 30 : 42;
        pts.push((50 + Math.cos(a) * r).toFixed(1) + ',' + (58 + Math.sin(a) * r * .9).toFixed(1));
      }
      g = `<polygon points="${pts.join(' ')}" fill="${c}" ${st}/><circle cx="50" cy="60" r="24" fill="${c}"/>
        ${eye(41, 56)}${eye(59, 56)}${brows(50, 9)}${teeth(67)}`;
      break;
    }
    case 'mush':
      g = `<path d="M36 64 Q34 90 40 92 L60 92 Q66 90 64 64Z" fill="#fff4e2" ${st}/>
        <path d="M10 64 Q12 22 50 20 Q88 22 90 64 Q50 72 10 64Z" fill="${c}" ${st}/>
        <circle cx="32" cy="42" r="6" fill="#fff"/><circle cx="56" cy="34" r="5" fill="#fff"/><circle cx="72" cy="50" r="5.5" fill="#fff"/>
        ${eye(44, 78, 3.5)}${eye(56, 78, 3.5)}
        <path d="M46 86 Q50 83 54 86" fill="none" stroke="${s}" stroke-width="2" stroke-linecap="round"/>`;
      break;
    case 'bat':
      g = `<path d="M30 56 Q14 36 2 48 Q10 54 8 64 Q18 60 22 70Z" fill="${c}" ${st}/>
        <path d="M70 56 Q86 36 98 48 Q90 54 92 64 Q82 60 78 70Z" fill="${c}" ${st}/>
        <path d="M36 34 L32 18 L44 30 M64 34 L68 18 L56 30" fill="${c}" ${st}/>
        <ellipse cx="50" cy="60" rx="25" ry="27" fill="${c}" ${st}/>
        ${eye(42, 54, 4)}${eye(58, 54, 4)}${brows(49, 8)}
        <path d="M44 68 L46 73 L48 68 M52 68 L54 73 L56 68" fill="#fff" stroke="${s}" stroke-width="1.8"/>`;
      break;
    case 'rock':
      g = `<path d="M14 88 L10 60 L24 34 L46 24 L72 30 L88 52 L90 88Z" fill="${c}" ${st}/>
        <path d="M30 44 L38 52 M70 70 L62 76 M24 72 L30 70" stroke="${s}" stroke-width="2" opacity=".5"/>
        ${eye(40, 60)}${eye(60, 60)}${brows(54)}
        <path d="M42 76 L58 76" stroke="${s}" stroke-width="2.6" stroke-linecap="round"/>`;
      break;
    case 'eye':
      g = `<path d="M18 86 Q8 52 30 32 Q50 14 70 32 Q92 52 82 86 Q50 94 18 86Z" fill="${c}" ${st}/>
        <path d="M24 30 L18 16 M50 22 L50 6 M76 30 L82 16" stroke="${s}" stroke-width="3" stroke-linecap="round"/>
        <circle cx="18" cy="15" r="4" fill="#ffe27a" stroke="${s}" stroke-width="2"/>
        <circle cx="50" cy="6" r="4" fill="#ffe27a" stroke="${s}" stroke-width="2"/>
        <circle cx="82" cy="15" r="4" fill="#ffe27a" stroke="${s}" stroke-width="2"/>
        <ellipse cx="50" cy="56" rx="18" ry="16" fill="#fff" stroke="${s}" stroke-width="2.6"/>
        ${eye(52, 56, 8)}${teeth(74)}`;
      break;
    case 'armor':
      g = `<path d="M20 90 L22 58 Q24 22 50 18 Q76 22 78 58 L80 90Z" fill="${c}" ${st}/>
        <path d="M50 18 L50 6 M44 8 L56 8" stroke="${s}" stroke-width="3" stroke-linecap="round"/>
        <path d="M28 50 L72 50 L70 62 L30 62Z" fill="#2b2522"/>
        <circle cx="40" cy="56" r="3.5" fill="#ff5a5a"/><circle cx="60" cy="56" r="3.5" fill="#ff5a5a"/>
        <path d="M30 72 L70 72 M32 80 L68 80" stroke="${s}" stroke-width="2" opacity=".5"/>`;
      break;
  }
  const crown = boss ? `<path d="M34 10 L38 -4 L44 6 L50 -6 L56 6 L62 -4 L66 10Z" fill="#ffd34d" stroke="${s}" stroke-width="2.4" stroke-linejoin="round"/>` : '';
  return `<svg ${XMLNS} viewBox="0 -8 100 108">${g}${crown}</svg>`;
}

const IMG = {};
function loadImg(key, src) { const i = new Image(); i.src = src; IMG[key] = i; return i; }
['chiikawa', 'hachiware', 'usagi'].forEach(k => loadImg(k, `img/${k}.png`));
loadImg('armor', svgUrl(armorSVG()));
loadImg('kuri', svgUrl(kuriSVG()));
loadImg('rakko', svgUrl(rakkoSVG()));

const SPEAKERS = {
  chiikawa: { name: '치이카와', img: 'img/chiikawa.png' },
  hachiware: { name: '하치와레', img: 'img/hachiware.png' },
  usagi: { name: '우사기', img: 'img/usagi.png' },
  armor: { name: '갑옷씨', img: IMG.armor.src },
  kuri: { name: '쿠리만쥬', img: IMG.kuri.src },
  rakko: { name: '랏코', img: IMG.rakko.src },
  ramen: { name: '라멘 가게 주인' },
  n: { name: '' },
};

/* ---------- 데이터: 동료 ---------- */
const HERO = {
  chiikawa: {
    name: '치이카와', hp: 40, mp: 10, atk: 9, def: 4, spd: 6,
    g: { hp: 9, mp: 2, atk: 2.4, def: 1.5, spd: .8 },
    skills: [
      { id: 'thrust', name: '힘껏 찌르기', lv: 1, mp: 3, target: 'enemy', mult: 1.8, desc: '적 하나에게 1.8배 공격' },
      { id: 'teary', name: '울먹 각성', lv: 4, mp: 4, target: 'self', desc: '3턴 동안 공격력 1.6배 · 치명타율 대폭 업' },
      { id: 'tearstrike', name: '눈물의 일격', lv: 9, mp: 8, target: 'enemy', mult: 3.2, desc: '적 하나에게 3.2배 공격' },
    ],
    say: { atk: ['야ー!', '에잇!', '와!'], hurt: ['으…', '흐에…'] },
  },
  hachiware: {
    name: '하치와레', hp: 44, mp: 14, atk: 8, def: 5, spd: 7,
    g: { hp: 9, mp: 3, atk: 2.1, def: 1.6, spd: .9 },
    skills: [
      { id: 'nantoka', name: '어떻게든 될 거야!', lv: 1, mp: 4, target: 'party', desc: '모두의 HP를 30% 회복' },
      { id: 'song', name: '기타 응원송', lv: 5, mp: 6, target: 'party', desc: '3턴 동안 모두의 공격력 1.4배' },
      { id: 'punch', name: '냥냥 연속 펀치', lv: 8, mp: 6, target: 'random', hits: 3, mult: .8, desc: '무작위 적에게 3번 공격' },
    ],
    say: { atk: ['에잇!', '받아라~!', '하앗!'], hurt: ['앗…!', '괜찮아…!'] },
  },
  usagi: {
    name: '우사기', hp: 52, mp: 10, atk: 12, def: 5, spd: 12,
    g: { hp: 10, mp: 2, atk: 3, def: 1.5, spd: 1.2 },
    skills: [
      { id: 'ura', name: '우라!', lv: 1, mp: 4, target: 'all', mult: 1.1, desc: '적 전체에게 1.1배 공격' },
      { id: 'yaha', name: '야하!!', lv: 1, mp: 7, target: 'enemy', mult: 2.6, desc: '적 하나에게 2.6배 공격' },
      { id: 'fururu', name: '후루루루루', lv: 12, mp: 9, target: 'all', mult: 1.8, desc: '적 전체에게 1.8배 공격' },
    ],
    say: { atk: ['우라!', '야하!', '이야아!'], hurt: ['하아?!', '프르르…'] },
  },
};
const expNext = lv => Math.round(10 * Math.pow(lv, 1.5));
function heroStats(m) {
  const h = HERO[m.id], L = m.lv - 1;
  return {
    maxHp: Math.round(h.hp + h.g.hp * L), maxMp: Math.round(h.mp + h.g.mp * L),
    atk: Math.round(h.atk + h.g.atk * L) + m.wpn * 3, def: Math.round(h.def + h.g.def * L) + m.charm * 2,
    spd: Math.round(h.spd + h.g.spd * L),
  };
}
function newMember(id, lv = 1) {
  const m = { id, lv, exp: 0, wpn: 0, charm: 0, hp: 0, mp: 0 };
  const st = heroStats(m);
  m.hp = st.maxHp; m.mp = st.maxMp;
  return m;
}

/* ---------- 데이터: 아이템 · 적 ---------- */
const ITEMS = {
  herb: { name: '약초', icon: '🌿', desc: 'HP 40 회복', price: 12, hp: 40 },
  bigherb: { name: '큰 약초', icon: '🍀', desc: 'HP 150 회복', price: 45, hp: 150 },
  tea: { name: '보리차', icon: '🍵', desc: '기력(MP) 15 회복', price: 25, mp: 15 },
  onigiri: { name: '주먹밥', icon: '🍙', desc: '쓰러진 동료를 HP 50%로 일으킨다', price: 80, revive: .5 },
};
const RAMEN_PRICE = 20;
const wpnCost = lv => Math.round(40 * Math.pow(1.9, lv));
const charmCost = lv => Math.round(35 * Math.pow(1.9, lv));
const EQUIP_MAX = 8;

const EN = {
  kimera: { n: '작은 키메라', t: 'blob', c: '#c3b0ee', hp: 18, atk: 7, def: 2, spd: 5, exp: 6, coin: 5 },
  grassblob: { n: '풀숲 덩어리', t: 'blob', c: '#94cc72', hp: 24, atk: 6, def: 4, spd: 3, exp: 7, coin: 6 },
  spiky: { n: '뾰족 키메라', t: 'spiky', c: '#f2a7a7', hp: 16, atk: 9, def: 2, spd: 8, exp: 8, coin: 7 },
  mush: { n: '버섯 요괴', t: 'mush', c: '#e86f6f', hp: 45, atk: 13, def: 6, spd: 6, exp: 16, coin: 12 },
  forestk: { n: '숲 키메라', t: 'blob', c: '#78b585', hp: 55, atk: 15, def: 7, spd: 7, exp: 18, coin: 13 },
  shadow: { n: '나무 그림자', t: 'eye', c: '#8c7a68', hp: 40, atk: 17, def: 5, spd: 10, exp: 20, coin: 15 },
  bat: { n: '박쥐 키메라', t: 'bat', c: '#8a75a0', hp: 70, atk: 22, def: 8, spd: 14, exp: 30, coin: 22 },
  rock: { n: '바위 덩어리', t: 'rock', c: '#a3a3b0', hp: 120, atk: 20, def: 16, spd: 4, exp: 34, coin: 25 },
  cavek: { n: '동굴 키메라', t: 'spiky', c: '#7d9bb5', hp: 90, atk: 25, def: 10, spd: 9, exp: 36, coin: 28 },
  boss1: { n: '숲의 주인', t: 'mush', c: '#c0392b', hp: 380, atk: 24, def: 9, spd: 7, exp: 150, coin: 200, boss: true, aoe: '포자 폭발' },
  boss2: { n: '크고 강한 녀석', t: 'armor', c: '#8a5a2a', hp: 1100, atk: 34, def: 14, spd: 9, exp: 500, coin: 600, boss: true, aoe: '땅 울리기', twice: true },
};
loadImg('boss1', svgUrl(monsterSVG(EN.boss1, true)));
loadImg('boss2', svgUrl(monsterSVG(EN.boss2, true)));

/* ---------- 맵 ---------- */
const T = 40;
const THEME = {
  town: { grass: '#cdeeb0', dark: '#a9d68e', path: '#f2e4c0', crown: '#8fd07a', crown2: '#b9e6a6', bg: '#8fc27a', sky: ['#bfe6ff', '#eef9ff'], ground: '#a3d983' },
  field: { grass: '#c2e8a2', dark: '#9fd283', path: '#f0dfb4', crown: '#7cc46c', crown2: '#a7dc96', bg: '#7fb86c', sky: ['#bfe6ff', '#eef9ff'], ground: '#a3d983' },
  forest: { grass: '#a8d692', dark: '#86c070', path: '#e6d6a8', crown: '#5fae68', crown2: '#86c98a', bg: '#4f8a55', sky: ['#a9dcc2', '#e3f6ea'], ground: '#73ad63' },
  cave: { floor: '#aaa2b9', dark: '#958da6', wall: '#5f5872', wallTop: '#7d7592', bg: '#3d3849', sky: ['#5c5672', '#8e87a6'], ground: '#6e667b' },
};
const SOLID = new Set(['T', '~', '#', 'r']);

const grid = (w, h, ch) => Array.from({ length: h }, () => Array(w).fill(ch));
function rect(g, x, y, w, h, ch) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (g[j] && g[j][i] !== undefined) g[j][i] = ch; }
function border(g, ch) { const h = g.length, w = g[0].length; for (let i = 0; i < w; i++) { g[0][i] = ch; g[h - 1][i] = ch; } for (let j = 0; j < h; j++) { g[j][0] = ch; g[j][w - 1] = ch; } }
function hl(g, x1, x2, y, ch) { for (let i = Math.min(x1, x2); i <= Math.max(x1, x2); i++) g[y][i] = ch; }
function vl(g, x, y1, y2, ch) { for (let j = Math.min(y1, y2); j <= Math.max(y1, y2); j++) g[j][x] = ch; }
function nearPath(g, x, y) {
  for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) if (g[y + j] && g[y + j][x + i] === '=') return true;
  return false;
}
function blobs(g, r, ch, n, rad, on) {
  const h = g.length, w = g[0].length;
  for (let k = 0; k < n; k++) {
    const cx = 2 + r() * (w - 4), cy = 2 + r() * (h - 4), rr = rad * (0.7 + r() * 0.6);
    for (let j = 1; j < h - 1; j++) for (let i = 1; i < w - 1; i++) {
      if (g[j][i] === on && ((i - cx) ** 2 + ((j - cy) * 1.3) ** 2) < rr * rr) g[j][i] = ch;
    }
  }
}
function scatter(g, r, ch, prob, cond) {
  for (let j = 1; j < g.length - 1; j++) for (let i = 1; i < g[0].length - 1; i++) if (cond(i, j) && r() < prob) g[j][i] = ch;
}

function buildMaps() {
  const M = {};
  { // 마을
    const w = 24, h = 17, g = grid(w, h, '.'), r = mulberry(11);
    border(g, 'T');
    hl(g, 1, 23, 9, '=');
    vl(g, 4, 5, 8, '='); vl(g, 8, 5, 8, '='); vl(g, 13, 5, 8, '='); vl(g, 19, 5, 8, '=');
    rect(g, 4, 12, 5, 3, '~');
    [[11, 12], [12, 14], [20, 14], [21, 11], [2, 14], [14, 15], [1, 11], [22, 15]].forEach(([x, y]) => g[y][x] = 'T');
    scatter(g, r, 'f', .07, (x, y) => g[y][x] === '.' && !nearPath(g, x, y) && y > 4);
    M.town = {
      id: 'town', name: '마을', theme: 'town', w, h, g,
      buildings: [
        { x: 2, y: 2, w: 4, h: 3, kind: 'home', label: '치이카와네 집', roof: '#f4a6b8' },
        { x: 7, y: 3, w: 3, h: 2, kind: 'board', label: '노동 게시판' },
        { x: 11, y: 2, w: 5, h: 3, kind: 'shop', label: '도구점', roof: '#8fc1e3' },
        { x: 17, y: 2, w: 5, h: 3, kind: 'ramen', label: '라멘', roof: '#f2b45a' },
      ],
      npcs: [
        { id: 'armor', x: 10, y: 5, img: 'armor' },
        { id: 'kuri', x: 21, y: 6, img: 'kuri' },
        { id: 'rakko', x: 16, y: 12, img: 'rakko' },
      ],
      exits: [{ x: 23, y: 9, to: 'field', tx: 1, ty: 10, label: '풀숲 ▶' }],
    };
  }
  { // 풀숲
    const w = 32, h = 20, g = grid(w, h, '.'), r = mulberry(22);
    border(g, 'T');
    hl(g, 0, 12, 10, '='); vl(g, 12, 6, 10, '='); hl(g, 12, 22, 6, '='); vl(g, 22, 6, 12, '='); hl(g, 22, 31, 12, '=');
    rect(g, 3, 3, 5, 3, '~');
    blobs(g, r, ',', 16, 2.6, '.');
    scatter(g, r, 'T', .07, (x, y) => (g[y][x] === '.' || g[y][x] === ',') && !nearPath(g, x, y));
    scatter(g, r, 'f', .05, (x, y) => g[y][x] === '.');
    g[4][17] = '.'; g[5][17] = '.';
    const cand = [];
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      if ((g[y][x] === '.' || g[y][x] === ',' || g[y][x] === 'f') && !(x === 17 && y < 6) &&
        [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => g[y + b][x + a] === '=')) cand.push([x, y]);
    }
    const weeds = [];
    while (weeds.length < 10 && cand.length) {
      const [x, y] = cand.splice(Math.floor(r() * cand.length), 1)[0];
      if (x < 3) continue;
      g[y][x] = '.';
      weeds.push({ x, y });
    }
    M.field = {
      id: 'field', name: '풀숲', theme: 'field', w, h, g, weeds,
      enc: { rate: .1, on: ',', list: ['kimera', 'grassblob', 'spiky'], max: 2 },
      npcs: [{ id: 'usagi', x: 17, y: 4, img: 'usagi' }],
      exits: [
        { x: 0, y: 10, to: 'town', tx: 22, ty: 9, label: '◀ 마을' },
        { x: 31, y: 12, to: 'forest', tx: 1, ty: 12, label: '숲 ▶', need: 3, gate: '숲은 위험하대… 노동 게시판에서 토벌 의뢰를 받고 나서 가자!' },
      ],
    };
  }
  { // 깊은 숲
    const w = 32, h = 24, g = grid(w, h, '.'), r = mulberry(33);
    border(g, 'T');
    hl(g, 0, 8, 12, '='); vl(g, 8, 4, 19, '='); hl(g, 8, 26, 4, '='); hl(g, 8, 31, 19, '=');
    blobs(g, r, ',', 22, 2.8, '.');
    scatter(g, r, 'T', .2, (x, y) => (g[y][x] === '.' || g[y][x] === ',') && !nearPath(g, x, y));
    rect(g, 25, 2, 5, 5, '.');
    scatter(g, r, 'f', .04, (x, y) => g[y][x] === '.');
    M.forest = {
      id: 'forest', name: '깊은 숲', theme: 'forest', w, h, g,
      enc: { rate: .12, on: ',', list: ['mush', 'forestk', 'shadow'], max: 3 },
      npcs: [],
      boss: { id: 'boss1', x: 27, y: 4, flag: 'boss1', need: 3, img: 'boss1' },
      exits: [
        { x: 0, y: 12, to: 'field', tx: 30, ty: 12, label: '◀ 풀숲' },
        { x: 31, y: 19, to: 'cave', tx: 1, ty: 17, label: '동굴 ▶', need: 4, gate: '동굴은 토벌 자격 시험 때 가는 곳이래. 지금은 돌아가자.' },
      ],
    };
  }
  { // 동굴
    const w = 28, h = 22, g = grid(w, h, '#');
    rect(g, 0, 17, 11, 2, '_'); rect(g, 9, 9, 2, 10, '_'); rect(g, 9, 9, 12, 2, '_');
    rect(g, 19, 3, 2, 8, '_'); rect(g, 12, 1, 9, 4, '_');
    rect(g, 3, 3, 5, 5, '_'); rect(g, 5, 8, 2, 9, '_');
    rect(g, 14, 13, 8, 5, '_'); rect(g, 11, 15, 3, 2, '_');
    rect(g, 22, 6, 4, 8, '_'); rect(g, 21, 7, 1, 2, '_');
    [[4, 4], [7, 6], [15, 14], [20, 16], [24, 7], [23, 12], [13, 1]].forEach(([x, y]) => g[y][x] = 'r');
    M.cave = {
      id: 'cave', name: '어두운 동굴', theme: 'cave', w, h, g,
      enc: { rate: .085, on: '_', list: ['bat', 'rock', 'cavek'], max: 3 },
      npcs: [],
      boss: { id: 'boss2', x: 16, y: 2, flag: 'boss2', need: 4, img: 'boss2' },
      exits: [
        { x: 0, y: 17, to: 'forest', tx: 30, ty: 19, label: '◀ 숲' },
        { x: 0, y: 18, to: 'forest', tx: 30, ty: 19 },
      ],
    };
  }
  return M;
}
const MAPS = buildMaps();

/* ---------- 상태 ---------- */
const SAVE_KEY = 'chiikawa-rpg-save-v1';
function freshState() {
  return {
    map: 'town', x: 4, y: 5, dir: 'down',
    coins: 30,
    party: [newMember('chiikawa'), newMember('hachiware')],
    items: { herb: 3, bigherb: 0, tea: 1, onigiri: 0 },
    quest: 0, weeds: 0, kills: 0, repeat: false,
    flags: { usagi: false, boss1: false, boss2: false },
    steps: 0, playTime: 0,
  };
}
let S = null;
function hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } }
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { } }
function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw), f = freshState();
    return Object.assign(f, d, { flags: Object.assign(f.flags, d.flags), items: Object.assign(f.items, d.items) });
  } catch (e) { return null; }
}

/* ---------- 런타임 ---------- */
const cv = $('#map'), ctx = cv.getContext('2d');
const appEl = $('#app');
let VW = 0, VH = 0, DPR = 1;
let mode = 'title';
const held = [];
const rt = { moving: false, t: 0, chain: [], prev: [], pulled: new Set(), encSafe: 4, time: 0 };
const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const MOVE_TIME = 0.16;
let map = null;

function resize() {
  const r = appEl.getBoundingClientRect();
  DPR = window.devicePixelRatio || 1;
  VW = r.width; VH = r.height;
  cv.width = Math.round(VW * DPR); cv.height = Math.round(VH * DPR);
  cv.style.width = VW + 'px'; cv.style.height = VH + 'px';
}
window.addEventListener('resize', resize);

/* ---------- 맵 그리기 ---------- */
function drawTile(g, ch, x, y, th, r) {
  const X = x * T, Y = y * T;
  if (ch === '#') {
    g.fillStyle = th.wall; g.fillRect(X, Y, T, T);
    g.fillStyle = th.wallTop; g.fillRect(X, Y, T, T * .72);
    g.fillStyle = 'rgba(255,255,255,.08)';
    g.beginPath(); g.arc(X + T * r(), Y + T * .35 * r() + 4, 4 + r() * 4, 0, 7); g.fill();
    return;
  }
  g.fillStyle = th.floor || th.grass; g.fillRect(X, Y, T, T);
  if (r() < .35) {
    g.strokeStyle = th.dark; g.lineWidth = 2; g.lineCap = 'round';
    const tx = X + 6 + r() * (T - 12), ty = Y + 8 + r() * (T - 14);
    g.beginPath(); g.moveTo(tx - 3, ty - 4); g.lineTo(tx, ty); g.lineTo(tx + 3, ty - 4); g.stroke();
  }
  g.lineWidth = 2.5; g.strokeStyle = INK; g.lineJoin = 'round'; g.lineCap = 'round';
  switch (ch) {
    case '=':
      g.fillStyle = th.path; g.beginPath(); g.roundRect(X - 1, Y - 1, T + 2, T + 2, 6); g.fill();
      g.fillStyle = 'rgba(160,130,90,.25)';
      for (let k = 0; k < 2; k++) { g.beginPath(); g.arc(X + r() * T, Y + r() * T, 1.6, 0, 7); g.fill(); }
      break;
    case ',':
      for (let k = 0; k < 3; k++) {
        const bx = X + 8 + k * 11 + r() * 3, by = Y + T - 6 - (k % 2) * 12;
        g.fillStyle = th.dark;
        g.beginPath(); g.moveTo(bx - 7, by); g.lineTo(bx - 4, by - 14); g.lineTo(bx - 1, by - 5); g.lineTo(bx + 2, by - 16); g.lineTo(bx + 4, by - 5); g.lineTo(bx + 7, by - 12); g.lineTo(bx + 8, by); g.closePath();
        g.fill(); g.lineWidth = 1.6; g.stroke();
      }
      break;
    case '~':
      g.fillStyle = '#9fd6f4'; g.fillRect(X, Y, T, T);
      g.strokeStyle = '#fff'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(X + 6, Y + 14); g.quadraticCurveTo(X + 12, Y + 10, X + 18, Y + 14); g.stroke();
      g.beginPath(); g.moveTo(X + 20, Y + 28); g.quadraticCurveTo(X + 26, Y + 24, X + 32, Y + 28); g.stroke();
      break;
    case 'f':
      for (let k = 0; k < 2; k++) {
        const fx = X + 8 + r() * (T - 16), fy = Y + 8 + r() * (T - 16);
        g.fillStyle = pick(['#ffb3c6', '#fff3a0', '#ffffff', '#c9b6ff']);
        for (let p = 0; p < 5; p++) { g.beginPath(); g.arc(fx + Math.cos(p * 1.256) * 3.5, fy + Math.sin(p * 1.256) * 3.5, 2.8, 0, 7); g.fill(); }
        g.fillStyle = '#f2b33d'; g.beginPath(); g.arc(fx, fy, 2, 0, 7); g.fill();
      }
      break;
    case 'r':
      g.fillStyle = '#b9b3c4'; g.beginPath(); g.ellipse(X + T / 2, Y + T * .6, T * .4, T * .32, 0, 0, 7); g.fill(); g.stroke();
      g.fillStyle = 'rgba(255,255,255,.4)'; g.beginPath(); g.ellipse(X + T * .4, Y + T * .48, 5, 3, -.4, 0, 7); g.fill();
      break;
    case 'T':
      g.fillStyle = '#a8794f'; g.beginPath(); g.roundRect(X + T * .42, Y + T * .5, T * .16, T * .42, 3); g.fill(); g.lineWidth = 2; g.stroke();
      g.fillStyle = th.crown; g.beginPath(); g.arc(X + T / 2, Y + T * .38, T * .4, 0, 7); g.fill(); g.lineWidth = 2.5; g.stroke();
      g.fillStyle = th.crown2; g.beginPath(); g.arc(X + T * .38, Y + T * .27, T * .12, 0, 7); g.fill();
      break;
  }
}
function drawBuilding(g, b) {
  const X = b.x * T, Y = b.y * T, W = b.w * T, H = b.h * T;
  g.lineWidth = 3; g.strokeStyle = INK; g.lineJoin = 'round';
  if (b.kind === 'board') {
    g.fillStyle = '#a8794f';
    g.fillRect(X + 12, Y + H * .45, 7, H * .55); g.strokeRect(X + 12, Y + H * .45, 7, H * .55);
    g.fillRect(X + W - 19, Y + H * .45, 7, H * .55); g.strokeRect(X + W - 19, Y + H * .45, 7, H * .55);
    g.fillStyle = '#d9a86c'; g.beginPath(); g.roundRect(X + 4, Y + 4, W - 8, H * .62, 6); g.fill(); g.stroke();
    const papers = ['#fff', '#fff6c8', '#ffe1e8', '#e2f1ff'];
    for (let i = 0; i < 4; i++) {
      g.fillStyle = papers[i];
      g.save(); g.translate(X + 18 + i * 22, Y + 24); g.rotate((i % 2 ? 1 : -1) * .08);
      g.fillRect(-8, -9, 16, 20); g.lineWidth = 1.5; g.strokeRect(-8, -9, 16, 20); g.restore();
    }
    label(g, b.label, X + W / 2, Y - 2);
    return;
  }
  const roofH = H * .45;
  g.fillStyle = '#fff8ec';
  g.beginPath(); g.roundRect(X + 6, Y + roofH - 6, W - 12, H - roofH + 2, 6); g.fill(); g.stroke();
  g.fillStyle = b.roof;
  g.beginPath(); g.moveTo(X, Y + roofH); g.lineTo(X + 14, Y + 6); g.lineTo(X + W - 14, Y + 6); g.lineTo(X + W, Y + roofH); g.closePath(); g.fill(); g.stroke();
  const dw = T * .7, dx = X + Math.floor(b.w / 2) * T + (T - dw) / 2;
  g.fillStyle = '#b5845a'; g.beginPath(); g.roundRect(dx, Y + H - T * .85, dw, T * .85, [10, 10, 0, 0]); g.fill(); g.stroke();
  g.fillStyle = INK; g.beginPath(); g.arc(dx + dw - 7, Y + H - T * .42, 2, 0, 7); g.fill();
  g.fillStyle = '#bfe3ff';
  const wy = Y + roofH + 8;
  [X + 16, X + W - 40].forEach(wx => { if (Math.abs(wx + 12 - (dx + dw / 2)) > 30) { g.beginPath(); g.roundRect(wx, wy, 24, 20, 5); g.fill(); g.lineWidth = 2.5; g.stroke(); } });
  if (b.kind === 'ramen') {
    g.fillStyle = '#e8495f';
    g.beginPath(); g.roundRect(X + 10, Y + roofH - 4, W - 20, 12, 4); g.fill(); g.lineWidth = 2; g.stroke();
  }
  label(g, b.label, X + W / 2, Y + roofH * .62);
}
function label(g, text, x, y) {
  g.font = '15px Jua, sans-serif';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  const w = g.measureText(text).width + 14;
  g.fillStyle = '#fff'; g.lineWidth = 2; g.strokeStyle = INK;
  g.beginPath(); g.roundRect(x - w / 2, y - 11, w, 22, 11); g.fill(); g.stroke();
  g.fillStyle = INK; g.fillText(text, x, y + 1);
}

function prerender(m) {
  const SC = 2, c = document.createElement('canvas');
  c.width = m.w * T * SC; c.height = m.h * T * SC;
  const g = c.getContext('2d'); g.scale(SC, SC);
  const th = THEME[m.theme], r = mulberry(m.w * 131 + m.h);
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) drawTile(g, m.g[y][x], x, y, th, r);
  (m.buildings || []).forEach(b => drawBuilding(g, b));
  m.exits.forEach(e => { if (e.label) label(g, e.label, e.x * T + T / 2 + (e.x === 0 ? 26 : -26), e.y * T - 6); });
  m.canvas = c;
}

/* ---------- 맵 로직 ---------- */
function npcVisible(n) { return !(n.id === 'usagi' && S.flags.usagi); }
function bossAlive(m) { return m.boss && !S.flags[m.boss.flag]; }
function buildingAt(x, y) { return (map.buildings || []).find(b => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h); }
function npcAt(x, y) { return map.npcs.find(n => n.x === x && n.y === y && npcVisible(n)); }
function weedAt(x, y) { return (map.weeds || []).find(w => w.x === x && w.y === y && !rt.pulled.has(x + ',' + y)); }
function exitAt(x, y) { return map.exits.find(e => e.x === x && e.y === y); }
function walkable(x, y) {
  if (x < 0 || y < 0 || x >= map.w || y >= map.h) return false;
  if (SOLID.has(map.g[y][x])) return false;
  if (buildingAt(x, y) || npcAt(x, y) || weedAt(x, y)) return false;
  if (bossAlive(map) && map.boss.x === x && map.boss.y === y) return false;
  return true;
}

function enterMap(id, x, y, dir) {
  map = MAPS[id];
  if (!map.canvas) prerender(map);
  S.map = id; S.x = x; S.y = y; if (dir) S.dir = dir;
  rt.pulled = new Set();
  rt.moving = false;
  rt.chain = S.party.map(() => ({ x, y }));
  rt.prev = rt.chain.map(p => ({ ...p }));
  rt.encSafe = 5;
  $('#hud-area').textContent = map.name;
  updateHud();
}

async function changeMap(e) {
  mode = 'trans';
  $('#fade').classList.add('on');
  await sleep(260);
  enterMap(e.to, e.tx, e.ty);
  save();
  $('#fade').classList.remove('on');
  await sleep(150);
  mode = 'map';
}

function tryMove(dir) {
  S.dir = dir;
  const [dx, dy] = DIRS[dir], nx = S.x + dx, ny = S.y + dy;
  const ex = exitAt(nx, ny);
  if (ex && ex.need && S.quest < ex.need) {
    talk([['hachiware', ex.gate]]);
    return;
  }
  if (!walkable(nx, ny)) return;
  rt.prev = rt.chain.map(p => ({ ...p }));
  for (let i = rt.chain.length - 1; i > 0; i--) rt.chain[i] = { ...rt.chain[i - 1] };
  rt.chain[0] = { x: nx, y: ny };
  S.x = nx; S.y = ny;
  rt.moving = true; rt.t = 0;
}

function onStep() {
  S.steps++;
  const ex = exitAt(S.x, S.y);
  if (ex) { changeMap(ex); return; }
  const enc = map.enc;
  if (!enc) return;
  rt.encSafe--;
  if (map.g[S.y][S.x] === enc.on && rt.encSafe <= 0 && Math.random() < enc.rate) {
    rt.encSafe = 4;
    const n = randi(1, enc.max);
    const ids = Array.from({ length: n }, () => pick(enc.list));
    startBattle(ids);
  }
}

function interact() {
  const [dx, dy] = DIRS[S.dir], fx = S.x + dx, fy = S.y + dy;
  const n = npcAt(fx, fy);
  if (n) return EVENTS.npc[n.id]();
  if (bossAlive(map) && map.boss.x === fx && map.boss.y === fy) return EVENTS.boss[map.boss.id]();
  const w = weedAt(fx, fy);
  if (w) return pullWeed(w);
  const b = buildingAt(fx, fy);
  if (b) return EVENTS.building[b.kind]();
  if (map.g[fy] && map.g[fy][fx] === '~') return talk([['chiikawa', '…(물이 반짝반짝)']]);
}

function pullWeed(w) {
  rt.pulled.add(w.x + ',' + w.y);
  const coin = 3;
  S.coins += coin;
  if (S.quest === 1) S.weeds++;
  toast(`🌿 풀을 뽑았다! +${coin}💰` + (S.quest === 1 ? `<br><small>(${Math.min(S.weeds, 5)}/5)</small>` : ''));
  updateHud();
}

/* ---------- 맵 렌더 ---------- */
function drawSprite(img, x, y, h, flip, bob) {
  if (!img || !img.complete || !img.naturalWidth) return;
  const w = h * img.naturalWidth / img.naturalHeight;
  ctx.fillStyle = 'rgba(0,0,0,.14)';
  ctx.beginPath(); ctx.ellipse(x, y - 2, w * .36, 5, 0, 0, 7); ctx.fill();
  ctx.save();
  ctx.translate(x, y - (bob || 0));
  if (flip) ctx.scale(-1, 1);
  ctx.drawImage(img, -w / 2, -h, w, h);
  ctx.restore();
}

function render() {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  const th = THEME[map.theme];
  ctx.fillStyle = th.bg; ctx.fillRect(0, 0, VW, VH);
  const k = rt.moving ? rt.t : 1;
  const lerp = i => ({ x: rt.prev[i].x + (rt.chain[i].x - rt.prev[i].x) * k, y: rt.prev[i].y + (rt.chain[i].y - rt.prev[i].y) * k });
  const p0 = lerp(0);
  const mw = map.w * T, mh = map.h * T;
  const camX = mw < VW ? (mw - VW) / 2 : clamp(p0.x * T + T / 2 - VW / 2, 0, mw - VW);
  const camY = mh < VH ? (mh - VH) / 2 : clamp(p0.y * T + T / 2 - VH / 2, 0, mh - VH);
  ctx.drawImage(map.canvas, Math.round(-camX), Math.round(-camY), mw, mh);
  ctx.translate(Math.round(-camX), Math.round(-camY));

  for (const w of map.weeds || []) {
    if (rt.pulled.has(w.x + ',' + w.y)) continue;
    const X = w.x * T + T / 2, Y = w.y * T + T - 6, sway = Math.sin(rt.time * 3 + w.x) * 2;
    ctx.fillStyle = '#5cb84a'; ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(X - 12, Y); ctx.lineTo(X - 8 + sway, Y - 20); ctx.lineTo(X - 3, Y - 8); ctx.lineTo(X + sway, Y - 26);
    ctx.lineTo(X + 3, Y - 8); ctx.lineTo(X + 9 + sway, Y - 18); ctx.lineTo(X + 12, Y); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff3a0'; ctx.beginPath(); ctx.arc(X + sway, Y - 27, 3, 0, 7); ctx.fill(); ctx.stroke();
  }

  const sprites = [];
  for (const n of map.npcs) {
    if (!npcVisible(n)) continue;
    sprites.push({ y: n.y, draw: () => drawSprite(IMG[n.img], n.x * T + T / 2, n.y * T + T - 2, n.img === 'usagi' ? T * 1.15 : T * 1.05, false, Math.abs(Math.sin(rt.time * 2 + n.x)) * 2) });
  }
  if (bossAlive(map)) {
    const b = map.boss;
    sprites.push({ y: b.y, draw: () => drawSprite(IMG[b.img], b.x * T + T / 2, b.y * T + T, T * 2, false, Math.abs(Math.sin(rt.time * 1.5)) * 3) });
  }
  S.party.forEach((m, i) => {
    if (i >= rt.chain.length) return;
    const p = lerp(i);
    const dir = i === 0 ? S.dir : (rt.chain[i - 1].x < rt.chain[i].x ? 'left' : rt.chain[i - 1].x > rt.chain[i].x ? 'right' : S.dir);
    const bob = rt.moving ? Math.abs(Math.sin(k * Math.PI)) * 5 : Math.abs(Math.sin(rt.time * 2.4 + i)) * 1.5;
    const h = m.id === 'chiikawa' ? T * 1.05 : T * 1.12;
    sprites.push({ y: p.y + (i ? -0.01 * i : 0.02), draw: () => drawSprite(IMG[m.id], p.x * T + T / 2, p.y * T + T - 2, h, dir === 'left', bob) });
  });
  sprites.sort((a, b) => a.y - b.y).forEach(s => s.draw());

  if (mode === 'map' && !rt.moving) {
    const [dx, dy] = DIRS[S.dir], fx = S.x + dx, fy = S.y + dy;
    const can = npcAt(fx, fy) || weedAt(fx, fy) || buildingAt(fx, fy) || (bossAlive(map) && map.boss.x === fx && map.boss.y === fy);
    if (can) {
      const bx = S.x * T + T / 2, by = S.y * T - 22 - Math.abs(Math.sin(rt.time * 4)) * 4;
      ctx.fillStyle = '#fff'; ctx.strokeStyle = INK; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(bx - 11, by - 11, 22, 20, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#e8495f'; ctx.font = '15px Jua, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('!', bx, by);
    }
  }
}

/* ---------- 메인 루프 ---------- */
let last = performance.now();
function frame(now) {
  const dt = Math.min(.05, (now - last) / 1000);
  last = now;
  rt.time += dt;
  if (S) S.playTime += dt;
  if (mode === 'map') {
    if (rt.moving) {
      rt.t += dt / MOVE_TIME;
      if (rt.t >= 1) { rt.t = 1; rt.moving = false; onStep(); }
    }
    if (!rt.moving && mode === 'map' && held.length) tryMove(held[held.length - 1]);
  }
  if (map && mode !== 'title' && mode !== 'battle') render();
  requestAnimationFrame(frame);
}

/* ---------- HUD · 토스트 ---------- */
function updateHud() {
  if (!S) return;
  $('#hud-coins b').textContent = fmt(S.coins);
  $('#objective').textContent = objective();
}
let toastTimer = 0;
function toast(html) {
  const t = $('#toast');
  t.innerHTML = html;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 1500);
}
function objective() {
  switch (S.quest) {
    case 0: return '📌 노동 게시판에 가 보자';
    case 1: return S.weeds >= 5 ? '📌 노동 게시판에 보고하자' : `📌 풀숲에서 풀 뽑기 (${S.weeds}/5)`;
    case 2: return S.kills >= 5 ? '📌 노동 게시판에 보고하자' : `📌 풀숲의 키메라 토벌 (${S.kills}/5)`;
    case 3: return S.flags.boss1 ? '📌 노동 게시판에 보고하자' : '📌 깊은 숲의 「숲의 주인」 토벌';
    case 4: return S.flags.boss2 ? '📌 노동 게시판에 보고하자' : '📌 자격 시험: 동굴의 「크고 강한 녀석」 토벌';
    default: return S.repeat ? (S.kills >= 10 ? '📌 노동 게시판에 보고하자' : `📌 오늘의 토벌 의뢰 (${S.kills}/10)`) : '⭐ 토벌 5급! 자유롭게 모험하자';
  }
}

/* ---------- 대화 ---------- */
let dlgState = null;
function talk(lines) {
  return new Promise(res => {
    const prevMode = mode === 'dialog' ? 'map' : mode;
    mode = 'dialog';
    held.length = 0;
    dlgState = { lines, i: -1, res, prevMode, typing: false, timer: 0 };
    $('#dialog').hidden = false;
    nextLine();
  });
}
function nextLine() {
  const d = dlgState;
  if (d.typing) {
    clearInterval(d.timer); d.typing = false;
    $('#dlg-text').textContent = d.full;
    return;
  }
  d.i++;
  if (d.i >= d.lines.length) {
    $('#dialog').hidden = true;
    dlgState = null;
    mode = d.prevMode === 'trans' ? 'map' : d.prevMode;
    d.res();
    return;
  }
  const [who, text] = d.lines[d.i], sp = SPEAKERS[who] || SPEAKERS.n;
  $('#dlg-name').textContent = sp.name;
  $('#dlg-face').innerHTML = sp.img ? `<img src="${sp.img}" alt="">` : '';
  d.full = text;
  let n = 0;
  d.typing = true;
  const el = $('#dlg-text');
  el.textContent = '';
  d.timer = setInterval(() => {
    n++;
    el.textContent = text.slice(0, n);
    if (n >= text.length) { clearInterval(d.timer); d.typing = false; }
  }, 26);
}

/* ---------- 이벤트 ---------- */
function healAll() {
  for (const m of S.party) { const st = heroStats(m); m.hp = st.maxHp; m.mp = st.maxMp; }
}
function addMember(id) {
  const avg = Math.round(S.party.reduce((a, m) => a + m.lv, 0) / S.party.length);
  S.party.push(newMember(id, Math.max(3, avg)));
  rt.chain.push({ ...rt.chain[rt.chain.length - 1] });
  rt.prev.push({ ...rt.prev[rt.prev.length - 1] });
}

const EVENTS = {
  npc: {
    async armor() { await boardEvent(); },
    async kuri() {
      await talk([['kuri', pick(['프하ー! 일 끝나고 먹는 라멘은 최고지.', '토벌 후엔 뜨끈한 라멘을 먹어 둬. 기력이 쫙 돌아온다고.', '오늘도 수고했어. 맛있는 거 먹고 푹 자는 게 제일이야.'])]]);
    },
    async rakko() {
      const tips = [
        '토벌의 기본은… 잘 먹고, 잘 쉬는 것이다.',
        '숲의 주인은 Lv.7, 동굴의 녀석은 Lv.12 정도면 상대할 수 있을 거다.',
        '도구점에서 무기와 부적을 강화해 둬라. 차이가 크다.',
        '위험하면 무리하지 말고 마을로 돌아와 쉬어라.',
      ];
      await talk([['rakko', pick(tips)]]);
    },
    async usagi() {
      if (S.quest < 2) {
        await talk([['usagi', '…하아?'], ['usagi', '후루루루루…'], ['hachiware', '어디론가 뛰어가 버릴 것 같은 토끼다…']]);
        return;
      }
      await talk([
        ['usagi', '야하!'],
        ['hachiware', '앗, 혹시 엄청 강하다는 소문의 그 토끼…?'],
        ['chiikawa', '…!!'],
        ['usagi', '우라! 우라라!'],
        ['hachiware', '같이 토벌하러 가 준대! 와~ 든든하다!'],
        ['n', '우사기가 동료가 되었다!'],
      ]);
      S.flags.usagi = true;
      addMember('usagi');
      save();
    },
  },
  boss: {
    async boss1() {
      if (S.quest < 3) { await talk([['n', '커다란 버섯이 쿨쿨 자고 있다…'], ['chiikawa', '(살금살금…)']]); return; }
      await talk([['n', '커다란 버섯이 눈을 번쩍 떴다!'], ['chiikawa', '으…!'], ['hachiware', '이게 숲의 주인…! 다 같이 힘내자!']]);
      const won = await startBattle(['boss1', 'mush'], { boss: true });
      if (won) {
        S.flags.boss1 = true;
        await talk([['hachiware', '해냈다~! 숲의 주인을 토벌했어!'], ['chiikawa', '…해냈다!'], ['hachiware', '노동 게시판에 보고하러 가자!']]);
        updateHud(); save();
      }
    },
    async boss2() {
      await talk([['n', '동굴 깊은 곳에서 거대한 그림자가 일어섰다…'], ['chiikawa', '으… 크, 크다…'], ['usagi', '우라!!'], ['hachiware', '이게 자격 시험…! 어떻게든 될 거야!']]);
      const won = await startBattle(['boss2'], { boss: true });
      if (won) {
        S.flags.boss2 = true;
        await talk([['usagi', '야하ー!!'], ['chiikawa', '해냈다…! 해냈어…!'], ['hachiware', '빨리 게시판에 가서 결과를 듣자!']]);
        updateHud(); save();
      }
    },
  },
  building: {
    async home() {
      await talk([['n', '치이카와네 집이다. 폭신한 이불이 있다.']]);
      healAll();
      save();
      $('#fade').classList.add('on'); await sleep(500); $('#fade').classList.remove('on');
      await talk([['chiikawa', '쿨… 쿨…'], ['n', '푹 쉬었다! HP와 기력이 모두 회복되었다.\n(진행 상황을 저장했다)']]);
    },
    async board() { await boardEvent(); },
    async shop() { await talk([['armor', '어서 오세요~ 도구점이에요. 천천히 보세요.']]); openShop(); },
    async ramen() { await talk([['ramen', '어서 오세요! 따끈한 라멘 있어요.']]); openRamen(); },
  },
};

async function boardEvent() {
  const q = S.quest;
  if (q === 0) {
    await talk([
      ['armor', '어서 오세요. 오늘의 일은 「풀뽑기」예요.'],
      ['armor', '마을 오른쪽 출구로 나가면 풀숲이 있어요. 거기서 풀을 5개 뽑아 와 주세요.'],
      ['hachiware', '좋아, 해 보자! 치이카와!'],
      ['chiikawa', '와…!'],
      ['n', '풀 앞에서 「조사」를 누르면 뽑을 수 있다.'],
    ]);
    S.quest = 1; S.weeds = 0;
  } else if (q === 1) {
    if (S.weeds < 5) { await talk([['armor', `풀숲에서 풀을 5개 뽑아 와 주세요. (${S.weeds}/5)`]]); return; }
    S.coins += 50;
    await talk([
      ['armor', '수고하셨어요! 보수 50💰예요.'],
      ['chiikawa', '…!! (반짝반짝)'],
      ['armor', '그런데… 혹시 토벌 일도 해 보시겠어요? 풀숲에 키메라가 늘어나서 다들 곤란하대요.'],
      ['chiikawa', '토, 토벌…!'],
      ['hachiware', '괜찮아! 둘이면 어떻게든 될 거야!'],
      ['armor', '풀숲의 키메라를 5마리 토벌해 주세요. 키 큰 풀숲을 걸으면 나타날 거예요.'],
    ]);
    S.quest = 2; S.kills = 0;
  } else if (q === 2) {
    if (S.kills < 5) {
      await talk([['armor', `풀숲의 키메라를 토벌해 주세요. (${S.kills}/5)`], ['armor', '참, 풀숲에 엄청 강한 토끼가 있다는 소문이 있어요.']]);
      return;
    }
    S.coins += 120;
    await talk([
      ['armor', '대단해요! 보수 120💰예요.'],
      ['armor', '실은… 깊은 숲의 「숲의 주인」이 날뛰고 있어서 큰일이에요. 토벌해 주실 수 있을까요?'],
      ['hachiware', '숲의 주인…! 준비 단단히 하고 가자!'],
      ['n', '풀숲 오른쪽 끝에서 깊은 숲으로 갈 수 있게 되었다.'],
    ]);
    S.quest = 3;
  } else if (q === 3) {
    if (!S.flags.boss1) { await talk([['armor', '숲의 주인은 깊은 숲 오른쪽 위에 있대요. 조심하세요!']]); return; }
    S.coins += 300;
    await talk([
      ['armor', '숲의 주인을 토벌하다니…! 보수 300💰예요.'],
      ['armor', '이 정도 실력이면… 「토벌 자격 시험」을 봐도 되겠어요!'],
      ['chiikawa', '자격… 시험…!'],
      ['armor', '시험 과제는 동굴 깊은 곳의 「크고 강한 녀석」 토벌이에요. 깊은 숲 오른쪽 아래에 동굴 입구가 있어요.'],
      ['usagi', '우라!'],
      ['hachiware', '합격하면 진짜 토벌자다! 해 보자!'],
    ]);
    S.quest = 4;
  } else if (q === 4) {
    if (!S.flags.boss2) { await talk([['armor', '자격 시험, 응원할게요! 동굴 속은 어두우니 약초를 꼭 챙기세요.']]); return; }
    S.coins += 1000;
    await talk([
      ['armor', '…시험 결과를 발표하겠습니다.'],
      ['chiikawa', '(두근두근…)'],
      ['armor', '합격이에요! 오늘부터 여러분은 「토벌 5급」이에요! 축하해요!'],
      ['chiikawa', '…!! 와아…!'],
      ['hachiware', '해냈다ー!! 우리 진짜 토벌자야!'],
      ['usagi', '야하ー!! 우라라라ー!!'],
      ['armor', '기념 보수 1000💰예요. 오늘은 맛있는 걸 잔뜩 드세요.'],
      ['hachiware', '라멘 먹으러 가자~!'],
      ['n', '~ 축하합니다! 이야기 클리어! ~\n앞으로도 자유롭게 토벌을 즐길 수 있어요.'],
    ]);
    S.quest = 5; S.repeat = false;
  } else {
    if (!S.repeat) {
      await talk([['armor', '오늘의 토벌 의뢰예요. 어디서든 키메라를 10마리 토벌해 주세요.']]);
      S.repeat = true; S.kills = 0;
    } else if (S.kills < 10) {
      await talk([['armor', `오늘의 토벌 의뢰 진행 중이에요. (${S.kills}/10)`]]);
    } else {
      const reward = 150 + Math.round(S.party[0].lv * 25);
      S.coins += reward;
      S.repeat = false;
      await talk([['armor', `수고하셨어요! 보수 ${reward}💰예요.`], ['chiikawa', '…헤헤.']]);
    }
  }
  updateHud();
  save();
}

/* ---------- 전투 ---------- */
const B = { units: [], enemies: [], heroes: [], pick: null, cur: null, over: false };
const bEl = {
  root: $('#battle'), field: $('#b-field'), enemies: $('#b-enemies'), msg: $('#b-msg'),
  party: $('#b-party'), cmd: $('#b-cmd'), floats: $('#b-floats'),
};
const alive = arr => arr.filter(u => u.hp > 0);

function makeHeroUnit(m) {
  return {
    side: 'hero', m, id: m.id, name: HERO[m.id].name, buffs: {}, guard: false,
    get hp() { return m.hp; }, set hp(v) { m.hp = v; },
    get mp() { return m.mp; }, set mp(v) { m.mp = v; },
    get st() { return heroStats(m); },
  };
}
function makeEnemyUnit(id, i, letter) {
  const d = EN[id];
  return { side: 'enemy', key: i, id, def: d, name: d.n + letter, hp: d.hp, buffs: {}, acts: 0, st: { maxHp: d.hp, atk: d.atk, def: d.def, spd: d.spd } };
}
const atkOf = u => u.st.atk * (u.buffs.teary > 0 ? 1.6 : 1) * (u.buffs.song > 0 ? 1.4 : 1);
const critOf = u => u.side === 'hero' ? .08 + (u.buffs.teary > 0 ? .4 : 0) : .04;

function startBattle(ids, opts = {}) {
  return new Promise(async res => {
    mode = 'battle';
    held.length = 0;
    B.boss = !!opts.boss;
    B.over = false;
    const counts = {};
    ids.forEach(id => counts[id] = (counts[id] || 0) + 1);
    const seen = {};
    B.enemies = ids.map((id, i) => {
      seen[id] = (seen[id] || 0) + 1;
      return makeEnemyUnit(id, i, counts[id] > 1 ? ' ' + 'ABC'[seen[id] - 1] : '');
    });
    B.heroes = S.party.map(makeHeroUnit);
    const th = THEME[map.theme];
    bEl.field.style.background = `linear-gradient(${th.sky[0]}, ${th.sky[1]} 60%, ${th.ground} 60%, ${th.ground})`;
    bEl.enemies.innerHTML = B.enemies.map(e => `
      <div class="en ${e.def.boss ? 'boss' : ''}" data-k="${e.key}">
        <div class="en-name">${e.name}</div>
        <div class="bar"><i></i></div>
        <div class="en-img">${monsterSVG(e.def, e.def.boss)}</div>
      </div>`).join('');
    bEl.party.innerHTML = B.heroes.map((h, i) => `
      <div class="pc" data-i="${i}">
        <img src="img/${h.id}.png" alt="">
        <div class="pc-name">${h.name} <small>Lv.${h.m.lv}</small></div>
        <div class="bar"><i></i></div>
        <div class="bar mp"><i></i></div>
        <div class="pc-num"><span class="hpn"></span><span class="mpn"></span></div>
        <div class="buffs"></div>
      </div>`).join('');
    bEl.cmd.innerHTML = '';
    bEl.root.hidden = false;
    bEl.root.classList.remove('enter'); void bEl.root.offsetWidth; bEl.root.classList.add('enter');
    refreshBattle();
    const names = [...new Set(B.enemies.map(e => e.def.n))].join(', ');
    await say(B.boss ? `${josa(names, '이가')} 앞을 가로막았다!` : `${josa(names, '이가')} 나타났다!`, 900);
    const result = await battleLoop();
    await endBattle(result);
    res(result === 'win');
  });
}

function refreshBattle() {
  for (const e of B.enemies) {
    const el = enemyEl(e);
    el.querySelector('.bar i').style.width = Math.max(0, e.hp / e.st.maxHp * 100) + '%';
    el.classList.toggle('dead', e.hp <= 0);
  }
  B.heroes.forEach((h, i) => {
    const el = bEl.party.children[i], st = h.st;
    el.querySelector('.bar i').style.width = Math.max(0, h.hp / st.maxHp * 100) + '%';
    el.querySelector('.bar.mp i').style.width = Math.max(0, h.mp / st.maxMp * 100) + '%';
    el.querySelector('.hpn').textContent = `HP ${Math.max(0, h.hp)}/${st.maxHp}`;
    el.querySelector('.mpn').textContent = `기력 ${h.mp}`;
    el.classList.toggle('ko', h.hp <= 0);
    el.classList.toggle('active', B.cur === h);
    el.querySelector('.buffs').textContent = (h.buffs.teary > 0 ? '💧각성 ' : '') + (h.buffs.song > 0 ? '🎸응원 ' : '') + (h.guard ? '🛡️방어' : '');
  });
}
const enemyEl = e => bEl.enemies.querySelector(`.en[data-k="${e.key}"]`);
const heroEl = h => bEl.party.children[B.heroes.indexOf(h)];
const unitEl = u => u.side === 'hero' ? heroEl(u) : enemyEl(u);

async function say(text, ms = 650) {
  bEl.msg.textContent = text;
  await sleep(ms);
}
function floatAt(u, text, cls) {
  const el = unitEl(u), r = el.getBoundingClientRect(), base = bEl.root.getBoundingClientRect();
  const d = document.createElement('div');
  d.className = 'float ' + (cls || '');
  d.textContent = text;
  d.style.left = (r.left - base.left + r.width / 2 + rand(-12, 12)) + 'px';
  d.style.top = (r.top - base.top + (u.side === 'hero' ? 10 : r.height * .35)) + 'px';
  d.addEventListener('animationend', () => d.remove());
  bEl.floats.appendChild(d);
}
function anim(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }

function damage(att, tgt, mult) {
  let dmg = Math.max(1, atkOf(att) * mult - tgt.st.def * .5) * rand(.9, 1.1);
  const crit = Math.random() < critOf(att);
  if (crit) dmg *= 1.6;
  if (tgt.guard) dmg *= .5;
  dmg = Math.max(1, Math.round(dmg));
  tgt.hp = Math.max(0, tgt.hp - dmg);
  floatAt(tgt, (crit ? '치명타! ' : '') + dmg, crit ? 'crit' : '');
  anim(unitEl(tgt), tgt.side === 'hero' ? 'hurt' : 'hit');
  refreshBattle();
  return { dmg, crit };
}

async function battleLoop() {
  while (true) {
    const order = [...B.heroes, ...B.enemies, ...B.enemies.filter(e => e.def.twice)]
      .filter(u => u.hp > 0)
      .map(u => ({ u, s: u.st.spd * rand(.85, 1.15) }))
      .sort((a, b) => b.s - a.s).map(o => o.u);
    for (const u of order) {
      if (u.hp <= 0) continue;
      if (u.side === 'hero') {
        u.guard = false;
        const act = await chooseAction(u);
        if (act.type === 'flee') {
          await say('도망치려고 했다…', 500);
          if (Math.random() < .6) { await say('무사히 도망쳤다!', 700); return 'flee'; }
          await say('하지만 도망칠 수 없었다!', 700);
        } else await heroAct(u, act);
      } else await enemyAct(u);
      for (const k in u.buffs) if (u.buffs[k] > 0) u.buffs[k]--;
      refreshBattle();
      if (!alive(B.enemies).length) return 'win';
      if (!alive(B.heroes).length) return 'lose';
    }
  }
}

function chooseAction(u) {
  return new Promise(res => {
    B.cur = u;
    B.resolve = act => { B.cur = null; B.pick = null; bEl.cmd.innerHTML = ''; clearTargets(); refreshBattle(); res(act); };
    refreshBattle();
    showMainCmd(u);
  });
}
function showMainCmd(u) {
  clearTargets();
  bEl.msg.textContent = `${josa(u.name, '은는')} 무엇을 할까?`;
  bEl.cmd.innerHTML = `
    <button class="btn" data-c="attack">⚔️ 공격</button>
    <button class="btn pink" data-c="skills">✨ 스킬</button>
    <button class="btn yellow" data-c="items">🎒 아이템</button>
    <button class="btn blue" data-c="guard">🛡️ 방어</button>
    <button class="btn white" data-c="flee" ${B.boss ? 'disabled' : ''}>💨 도망</button>`;
}
function showSkills(u) {
  const list = HERO[u.id].skills.filter(s => u.m.lv >= s.lv);
  bEl.cmd.innerHTML = list.map(s =>
    `<button class="btn pink" data-c="skill" data-s="${s.id}" ${u.mp < s.mp ? 'disabled' : ''}>${s.name}<small>기력 ${s.mp} · ${s.desc}</small></button>`).join('') +
    `<button class="btn white" data-c="back">← 뒤로</button>`;
}
function showItems() {
  const own = Object.keys(ITEMS).filter(k => S.items[k] > 0);
  bEl.cmd.innerHTML = (own.length ? own.map(k =>
    `<button class="btn yellow" data-c="item" data-it="${k}">${ITEMS[k].icon} ${ITEMS[k].name} ×${S.items[k]}<small>${ITEMS[k].desc}</small></button>`).join('')
    : '<div class="hint">가진 아이템이 없다…</div>') + `<button class="btn white" data-c="back">← 뒤로</button>`;
}
function clearTargets() {
  bEl.root.querySelectorAll('.targetable').forEach(e => e.classList.remove('targetable'));
}
function askTarget(kind, act) {
  const list = kind === 'enemy' ? alive(B.enemies) : kind === 'ko' ? B.heroes.filter(h => h.hp <= 0) : alive(B.heroes);
  if (!list.length) { bEl.msg.textContent = '대상이 없다!'; return; }
  if (kind === 'enemy' && list.length === 1) { B.resolve({ ...act, target: list[0] }); return; }
  B.pick = { kind, act };
  list.forEach(u => unitEl(u).classList.add('targetable'));
  bEl.msg.textContent = kind === 'enemy' ? '누구를 공격할까?' : '누구에게 쓸까?';
  bEl.cmd.innerHTML = `<div class="hint">대상을 눌러 주세요</div><button class="btn white wide" data-c="back">← 뒤로</button>`;
}

bEl.cmd.addEventListener('click', e => {
  const b = e.target.closest('[data-c]');
  if (!b || b.disabled || !B.cur) return;
  const u = B.cur, c = b.dataset.c;
  if (c === 'attack') askTarget('enemy', { type: 'attack' });
  else if (c === 'skills') showSkills(u);
  else if (c === 'items') showItems();
  else if (c === 'guard') B.resolve({ type: 'guard' });
  else if (c === 'flee') B.resolve({ type: 'flee' });
  else if (c === 'back') { B.pick = null; showMainCmd(u); }
  else if (c === 'skill') {
    const s = HERO[u.id].skills.find(x => x.id === b.dataset.s);
    if (s.target === 'enemy') askTarget('enemy', { type: 'skill', s });
    else B.resolve({ type: 'skill', s });
  } else if (c === 'item') {
    const it = ITEMS[b.dataset.it];
    askTarget(it.revive ? 'ko' : 'ally', { type: 'item', key: b.dataset.it });
  }
});
bEl.root.addEventListener('click', e => {
  if (!B.pick) return;
  const en = e.target.closest('.en.targetable'), pc = e.target.closest('.pc.targetable');
  if (en) B.resolve({ ...B.pick.act, target: B.enemies[+en.dataset.k] });
  else if (pc) B.resolve({ ...B.pick.act, target: B.heroes[+pc.dataset.i] });
});

function retarget(t) { return t && t.hp > 0 ? t : pick(alive(B.enemies)); }

async function heroAct(u, act) {
  const el = heroEl(u);
  anim(el, 'hop');
  const lines = HERO[u.id].say.atk;
  if (act.type === 'attack') {
    const t = retarget(act.target);
    const r = damage(u, t, 1);
    await say(`${u.name}: "${pick(lines)}" ${t.name}에게 ${r.dmg}의 피해!`);
    await checkDead(t);
  } else if (act.type === 'guard') {
    u.guard = true;
    refreshBattle();
    await say(`${josa(u.name, '은는')} 몸을 웅크리고 방어하고 있다!`);
  } else if (act.type === 'item') {
    const it = ITEMS[act.key], t = act.target;
    S.items[act.key]--;
    const st = t.st;
    if (it.revive) {
      if (t.hp > 0) { await say('효과가 없었다…'); return; }
      t.hp = Math.round(st.maxHp * it.revive);
      floatAt(t, '부활!', 'heal');
      refreshBattle();
      await say(`${josa(it.name, '을를')} 먹고 ${josa(t.name, '이가')} 일어났다!`);
    } else {
      if (it.hp) { const v = Math.min(it.hp, st.maxHp - t.hp); t.hp += v; floatAt(t, '+' + v, 'heal'); await say(`${josa(it.name, '을를')} 사용했다! ${t.name}의 HP가 ${v} 회복!`); }
      if (it.mp) { const v = Math.min(it.mp, st.maxMp - t.mp); t.mp += v; floatAt(t, '+' + v, 'heal'); await say(`${josa(it.name, '을를')} 마셨다! ${t.name}의 기력이 ${v} 회복!`); }
      refreshBattle();
    }
  } else if (act.type === 'skill') {
    const s = act.s;
    u.mp -= s.mp;
    refreshBattle();
    await say(`${u.name}의 「${s.name}」!`, 550);
    if (s.id === 'teary') {
      u.buffs.teary = 4;
      refreshBattle();
      await say(`${u.name}: "야ー!! 야ー!!" 눈물을 꾹 참고 각성했다!`);
    } else if (s.id === 'nantoka') {
      for (const h of alive(B.heroes)) {
        const st = h.st, v = Math.min(st.maxHp - h.hp, Math.max(15, Math.round(st.maxHp * .3)));
        h.hp += v; floatAt(h, '+' + v, 'heal');
      }
      refreshBattle();
      await say('하치와레: "어떻게든 될 거야!" 모두의 HP가 회복되었다!');
    } else if (s.id === 'song') {
      for (const h of alive(B.heroes)) h.buffs.song = h === u ? 4 : 3;
      refreshBattle();
      await say('♪ 기타 소리에 모두 힘이 솟는다! 공격력 업!');
    } else if (s.target === 'all') {
      const tg = alive(B.enemies);
      let total = 0;
      for (const t of tg) total += damage(u, t, s.mult).dmg;
      await say(`${u.name}: "${s.name}" 적 전체에게 총 ${total}의 피해!`);
      for (const t of tg) await checkDead(t);
    } else if (s.target === 'random') {
      for (let i = 0; i < s.hits; i++) {
        const t = pick(alive(B.enemies));
        if (!t) break;
        const r = damage(u, t, s.mult);
        await say(`냥! ${t.name}에게 ${r.dmg}의 피해!`, 380);
        await checkDead(t);
      }
    } else {
      const t = retarget(act.target);
      const r = damage(u, t, s.mult);
      await say(`${t.name}에게 ${r.dmg}의 큰 피해!`);
      await checkDead(t);
    }
  }
}
async function checkDead(t) {
  if (t.hp > 0 || t._dead) return;
  t._dead = true;
  refreshBattle();
  await say(`${josa(t.name, '을를')} 토벌했다!`, 500);
}

async function enemyAct(e) {
  const targets = alive(B.heroes);
  if (!targets.length) return;
  e.acts++;
  anim(enemyEl(e), 'act');
  if (e.def.aoe && e.acts % 3 === 0) {
    await say(`${e.name}의 「${e.def.aoe}」!`, 600);
    for (const h of targets) damage(e, h, .8);
    await say('모두에게 큰 피해!');
  } else {
    const t = pick(targets);
    const r = damage(e, t, 1);
    await say(`${e.name}의 공격! ${josa(t.name, '은는')} ${r.dmg}의 피해를 입었다!${Math.random() < .5 ? ' "' + pick(HERO[t.id].say.hurt) + '"' : ''}`);
  }
  for (const h of targets) {
    if (h.hp <= 0) await say(`${josa(h.name, '은는')} 쓰러지고 말았다…`, 600);
  }
}

async function endBattle(result) {
  if (result === 'win') {
    const exp = B.enemies.reduce((a, e) => a + e.def.exp, 0);
    const coin = B.enemies.reduce((a, e) => a + e.def.coin, 0);
    S.coins += coin;
    if ((S.quest === 2 && map.id === 'field') || (S.quest >= 5 && S.repeat)) S.kills += B.enemies.length;
    await say(`승리! 경험치 ${exp}, 보수 ${coin}💰를 얻었다!`, 1000);
    for (const h of B.heroes) {
      if (h.hp <= 0) { h.hp = 1; continue; }
      const m = h.m;
      m.exp += exp;
      while (m.exp >= expNext(m.lv)) {
        m.exp -= expNext(m.lv);
        const before = heroStats(m);
        m.lv++;
        const after = heroStats(m);
        m.hp += after.maxHp - before.maxHp;
        m.mp += after.maxMp - before.maxMp;
        refreshBattle();
        heroEl(h).querySelector('.pc-name small').textContent = 'Lv.' + m.lv;
        anim(heroEl(h), 'hop');
        await say(`🎉 ${h.name}의 레벨이 ${m.lv}(으)로 올랐다!`, 900);
        for (const s of HERO[m.id].skills) if (s.lv === m.lv) await say(`✨ ${josa(h.name, '은는')} 「${s.name}」을(를) 배웠다!`, 1000);
      }
    }
  } else if (result === 'lose') {
    await say('눈앞이 캄캄해졌다…', 1200);
  }
  bEl.root.hidden = true;
  if (result === 'lose') {
    S.coins = Math.floor(S.coins / 2);
    healAll();
    enterMap('town', 4, 5, 'down');
    mode = 'map';
    await talk([['hachiware', '치이카와, 괜찮아…? 집까지 겨우 돌아왔어.'], ['chiikawa', '흐에…'], ['n', '보수의 절반을 잃어버렸다… 푹 쉬고 다시 도전하자.']]);
  } else {
    mode = 'map';
  }
  updateHud();
  save();
}

/* ---------- 패널: 메뉴 · 상점 ---------- */
const panel = { el: $('#panel'), title: $('#panel-title'), tabs: $('#panel-tabs'), body: $('#panel-body'), render: null, tab: null, onClick: null };
function openPanel(title, tabs, render, onClick) {
  mode = 'panel';
  held.length = 0;
  panel.title.textContent = title;
  panel.tab = tabs ? tabs[0][0] : null;
  panel.tabs.innerHTML = tabs ? tabs.map(([k, l]) => `<button data-tab="${k}">${l}</button>`).join('') : '';
  panel.render = render; panel.onClick = onClick;
  panel.el.hidden = false;
  redrawPanel();
}
function redrawPanel() {
  panel.tabs.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.tab === panel.tab));
  panel.body.innerHTML = panel.render(panel.tab);
  updateHud();
}
function closePanel() { panel.el.hidden = true; mode = 'map'; }
$('#panel-close').addEventListener('click', closePanel);
panel.tabs.addEventListener('click', e => { const b = e.target.closest('button'); if (b) { panel.tab = b.dataset.tab; redrawPanel(); } });
panel.body.addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (b && !b.disabled) panel.onClick(b.dataset, b); });

function memberCard(m) {
  const st = heroStats(m), h = HERO[m.id];
  return `<div class="card">
    <div class="ico"><img src="img/${m.id}.png" alt=""></div>
    <div class="main">
      <b>${h.name}</b> <span class="muted">Lv.${m.lv}</span>
      <div class="muted">HP ${m.hp}/${st.maxHp} · 기력 ${m.mp}/${st.maxMp}</div>
      <div class="bar exp"><i style="width:${m.exp / expNext(m.lv) * 100}%"></i></div>
      <div class="stats"><span>공격 ${st.atk}</span><span>방어 ${st.def}</span><span>속도 ${st.spd}</span></div>
      <div class="muted">무기 +${m.wpn} · 부적 +${m.charm} · 다음 레벨까지 ${expNext(m.lv) - m.exp}</div>
      <div class="skills-list">${h.skills.map(s => `<span class="${m.lv >= s.lv ? 'on' : ''}">${m.lv >= s.lv ? '✨' : '🔒'}${s.name}${m.lv >= s.lv ? '' : ' (Lv.' + s.lv + ')'}</span>`).join('')}</div>
    </div>
  </div>`;
}
function useItemField(key, i) {
  const it = ITEMS[key], m = S.party[i], st = heroStats(m);
  if (!S.items[key]) return;
  if (it.revive) { if (m.hp > 0) return toast('쓰러진 동료에게만 쓸 수 있어요'); m.hp = Math.round(st.maxHp * it.revive); }
  else {
    if (m.hp <= 0) return toast('쓰러진 동료는 주먹밥으로 일으켜야 해요');
    if (it.hp) { if (m.hp >= st.maxHp) return toast('HP가 가득해요'); m.hp = Math.min(st.maxHp, m.hp + it.hp); }
    if (it.mp) { if (m.mp >= st.maxMp) return toast('기력이 가득해요'); m.mp = Math.min(st.maxMp, m.mp + it.mp); }
  }
  S.items[key]--;
  toast(`${it.icon} ${HERO[m.id].name}에게 ${josa(it.name, '을를')} 사용했다!`);
}

function openMenu() {
  openPanel('메뉴', [['party', '🐹 동료'], ['items', '🎒 아이템'], ['quest', '📜 의뢰'], ['sys', '⚙️ 설정']], tab => {
    if (tab === 'party') return S.party.map(memberCard).join('');
    if (tab === 'items') {
      const own = Object.keys(ITEMS).filter(k => S.items[k] > 0);
      if (!own.length) return '<div class="box">가진 아이템이 없어요. 도구점에서 살 수 있어요.</div>';
      return own.map(k => `<div class="card"><div class="ico">${ITEMS[k].icon}</div><div class="main">
        <b>${ITEMS[k].name}</b> <span class="muted">×${S.items[k]}</span><div class="muted">${ITEMS[k].desc}</div>
        <div class="use-row">${S.party.map((m, i) => `<button class="btn" data-a="use" data-k="${k}" data-i="${i}">${HERO[m.id].name}</button>`).join('')}</div>
      </div></div>`).join('');
    }
    if (tab === 'quest') {
      const qs = ['풀뽑기 의뢰', '풀숲의 키메라 토벌', '숲의 주인 토벌', '토벌 자격 시험'];
      return `<div class="box"><h3>지금 할 일</h3>${objective()}</div>
        <div class="box"><h3>이야기 진행</h3><ul class="quest-list">${qs.map((q, i) =>
          `<li class="${S.quest > i + 1 ? 'done' : S.quest === i + 1 ? 'now' : ''}">${S.quest > i + 1 ? '✅' : S.quest === i + 1 ? '▶' : '·'} ${q}</li>`).join('')}</ul></div>
        <div class="box muted">보수 ${fmt(S.coins)}💰 · 걸음 수 ${fmt(S.steps)} · 플레이 ${Math.floor(S.playTime / 60)}분</div>`;
    }
    return `<div class="box"><h3>저장</h3><p class="muted">맵을 옮기거나 전투가 끝나면 자동 저장돼요. 치이카와네 집에서 쉬어도 저장돼요.</p>
      <div class="row"><button class="btn blue" data-a="save">지금 저장</button><button class="btn white" data-a="title">타이틀로</button></div></div>
      <div class="box"><h3>조작법</h3><p class="muted">이동: 방향키·WASD 또는 화면 왼쪽 아래 버튼<br>조사·대화: Space·Enter 또는 「조사」 버튼<br>메뉴: Esc</p></div>
      <div class="box"><p class="muted">비영리 팬메이드 게임 · 원작: 나가노 「먼가 작고 귀여운 녀석」</p></div>`;
  }, d => {
    if (d.a === 'use') { useItemField(d.k, +d.i); redrawPanel(); }
    else if (d.a === 'save') { save(); toast('저장했어요!'); }
    else if (d.a === 'title') { save(); location.reload(); }
  });
}

function openShop() {
  openPanel('도구점', [['items', '🎒 도구'], ['equip', '🗡️ 장비 강화']], tab => {
    let h = `<div class="box">보유 보수: <b>${fmt(S.coins)}💰</b></div>`;
    if (tab === 'items') {
      h += Object.entries(ITEMS).map(([k, it]) => `<div class="card"><div class="ico">${it.icon}</div>
        <div class="main"><b>${it.name}</b> <span class="muted">보유 ${S.items[k]}</span><div class="muted">${it.desc}</div></div>
        <button class="btn yellow" data-a="buy" data-k="${k}" ${S.coins < it.price ? 'disabled' : ''}>사기<small>💰 ${it.price}</small></button></div>`).join('');
    } else {
      h += S.party.map((m, i) => {
        const wc = wpnCost(m.wpn), cc = charmCost(m.charm);
        return `<div class="card"><div class="ico"><img src="img/${m.id}.png" alt=""></div>
          <div class="main"><b>${HERO[m.id].name}</b>
            <div class="muted">무기 +${m.wpn} (공격 +${m.wpn * 3}) · 부적 +${m.charm} (방어 +${m.charm * 2})</div>
            <div class="use-row">
              <button class="btn pink" data-a="wpn" data-i="${i}" ${m.wpn >= EQUIP_MAX || S.coins < wc ? 'disabled' : ''}>무기 강화 ${m.wpn >= EQUIP_MAX ? 'MAX' : wc + '💰'}</button>
              <button class="btn blue" data-a="charm" data-i="${i}" ${m.charm >= EQUIP_MAX || S.coins < cc ? 'disabled' : ''}>부적 강화 ${m.charm >= EQUIP_MAX ? 'MAX' : cc + '💰'}</button>
            </div></div></div>`;
      }).join('');
      h += '<p class="muted" style="text-align:center">갑옷씨가 하나하나 정성껏 손봐 준대요</p>';
    }
    return h;
  }, d => {
    if (d.a === 'buy') { const it = ITEMS[d.k]; if (S.coins >= it.price) { S.coins -= it.price; S.items[d.k]++; toast(`${it.icon} ${josa(it.name, '을를')} 샀다!`); } }
    else if (d.a === 'wpn') { const m = S.party[+d.i], c = wpnCost(m.wpn); if (S.coins >= c && m.wpn < EQUIP_MAX) { S.coins -= c; m.wpn++; toast('🗡️ 무기가 튼튼해졌다!'); } }
    else if (d.a === 'charm') { const m = S.party[+d.i], c = charmCost(m.charm); if (S.coins >= c && m.charm < EQUIP_MAX) { S.coins -= c; m.charm++; toast('🧿 부적이 반짝인다!'); } }
    redrawPanel();
  });
}

function openRamen() {
  openPanel('라멘 가게', null, () => `
    <div class="box" style="text-align:center">
      <div style="font-size:54px">🍜</div>
      <p>김이 모락모락 나는 라멘. 다 먹으면 모두의<br><b>HP와 기력이 완전히 회복</b>돼요.</p>
      <p class="muted">보유 보수: ${fmt(S.coins)}💰</p>
      <div class="row"><button class="btn yellow" data-a="eat" ${S.coins < RAMEN_PRICE ? 'disabled' : ''}>라멘 먹기 (💰 ${RAMEN_PRICE})</button></div>
    </div>
    <div class="card"><div class="ico"><img src="${IMG.kuri.src}" alt=""></div><div class="main"><b>쿠리만쥬</b><div class="muted">"여기 라멘은 국물이 진짜라고. 프하ー!"</div></div></div>`,
  d => {
    if (d.a === 'eat' && S.coins >= RAMEN_PRICE) {
      S.coins -= RAMEN_PRICE;
      healAll();
      for (const m of S.party) if (m.hp <= 0) m.hp = heroStats(m).maxHp;
      toast('🍜 후루룩… 맛있다~! 모두 회복했다!');
      redrawPanel();
    }
  });
}

/* ---------- 입력 ---------- */
const KEYDIR = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right' };
function press(dir) { if (!held.includes(dir)) held.push(dir); }
function release(dir) { const i = held.indexOf(dir); if (i >= 0) held.splice(i, 1); }
function actionKey() {
  if (mode === 'dialog') nextLine();
  else if (mode === 'map' && !rt.moving) interact();
}
window.addEventListener('keydown', e => {
  if (KEYDIR[e.key]) { if (mode === 'map') press(KEYDIR[e.key]); e.preventDefault(); return; }
  if (e.repeat) return;
  if (e.key === ' ' || e.key === 'Enter' || e.key === 'z' || e.key === 'Z') { e.preventDefault(); actionKey(); }
  else if (e.key === 'Escape' || e.key === 'x' || e.key === 'X' || e.key === 'm' || e.key === 'M') {
    if (mode === 'panel') closePanel();
    else if (mode === 'map') openMenu();
  }
});
window.addEventListener('keyup', e => { if (KEYDIR[e.key]) release(KEYDIR[e.key]); });
window.addEventListener('blur', () => { held.length = 0; });

document.querySelectorAll('#pad button').forEach(b => {
  const d = b.dataset.d;
  b.addEventListener('pointerdown', e => { e.preventDefault(); b.setPointerCapture(e.pointerId); b.classList.add('on'); if (mode === 'map') press(d); });
  const up = () => { b.classList.remove('on'); release(d); };
  b.addEventListener('pointerup', up);
  b.addEventListener('pointercancel', up);
});
const btnA = $('#btn-a');
btnA.addEventListener('pointerdown', e => { e.preventDefault(); btnA.classList.add('on'); actionKey(); });
btnA.addEventListener('pointerup', () => btnA.classList.remove('on'));
btnA.addEventListener('pointercancel', () => btnA.classList.remove('on'));
$('#dialog').addEventListener('pointerdown', e => { e.preventDefault(); if (mode === 'dialog') nextLine(); });
$('#hud-menu').addEventListener('click', () => { if (mode === 'map') openMenu(); });

document.addEventListener('visibilitychange', () => { if (document.hidden && S && mode !== 'title') save(); });

/* ---------- 시작 ---------- */
async function startGame(fresh) {
  S = fresh ? freshState() : (load() || freshState());
  $('#title').hidden = true;
  enterMap(S.map, S.x, S.y, S.dir);
  mode = 'map';
  if (fresh) {
    save();
    await talk([
      ['n', '여기는 먼가 작고 귀여운 녀석들이 사는 세계.'],
      ['n', '모두 노동 게시판에서 일을 받고, 보수로 맛있는 걸 사 먹으며 살아간다.'],
      ['hachiware', '치이카와~! 좋은 아침!'],
      ['chiikawa', '…!! (꾸벅)'],
      ['hachiware', '노동 게시판에 새 일이 올라왔대! 같이 보러 가자!'],
      ['chiikawa', '와…!'],
      ['n', '노동 게시판은 집 오른쪽에 있다. 앞에 서서 「조사」를 눌러 보자.'],
    ]);
  }
}
$('#t-new').addEventListener('click', () => {
  if (hasSave() && !confirm('저장된 데이터가 있어요. 처음부터 시작할까요?')) return;
  startGame(true);
});
$('#t-cont').addEventListener('click', () => startGame(false));
$('#t-cont').hidden = !hasSave();

resize();
document.fonts && document.fonts.ready.then(() => { for (const k in MAPS) MAPS[k].canvas = null; if (map) prerender(map); });
requestAnimationFrame(frame);
