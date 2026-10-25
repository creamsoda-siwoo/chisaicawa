'use strict';
/* =========================================================
 *  먼작귀 방치 토벌대
 *  치이카와 · 하치와레 · 우사기와 함께 풀뽑기로 보수를 벌고
 *  키메라를 토벌하며 토벌 자격 시험에 도전하는 방치형 RPG
 * ========================================================= */

const $ = s => document.querySelector(s);
const rand = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

/* ---------- 숫자 표기 (만/억/조…) ---------- */
const KUNITS = [[1e44, '재'], [1e40, '정'], [1e36, '간'], [1e32, '구'], [1e28, '양'], [1e24, '자'],
  [1e20, '해'], [1e16, '경'], [1e12, '조'], [1e8, '억'], [1e4, '만']];
function fmt(n) {
  if (!isFinite(n)) return '∞';
  if (n < 0) return '-' + fmt(-n);
  if (n < 10 && n % 1) return n.toFixed(1);
  if (n < 10000) return Math.floor(n).toLocaleString('ko-KR');
  if (n >= 1e48) return n.toExponential(2).replace('e+', 'e');
  for (const [v, u] of KUNITS) {
    if (n >= v) {
      const x = n / v;
      return (x < 10 ? x.toFixed(2) : x < 100 ? x.toFixed(1) : Math.floor(x)) + u;
    }
  }
}
function fmtTime(sec) {
  sec = Math.floor(sec);
  const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
  if (h) return `${h}시간 ${m}분`;
  if (m) return `${m}분 ${s}초`;
  return `${s}초`;
}

/* ---------- 캐릭터 그림 (SVG) ---------- */
let svgUid = 0;
const INK = '#2b2522';

function chiikawaSVG() {
  return `<svg viewBox="0 0 100 100">
  <circle cx="27" cy="25" r="9.5" fill="#fff" stroke="${INK}" stroke-width="3.2"/>
  <circle cx="73" cy="25" r="9.5" fill="#fff" stroke="${INK}" stroke-width="3.2"/>
  <path d="M33 82 L32 95 Q36 98 40 95 L41 84" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M59 84 L60 95 Q64 98 68 95 L67 82" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <ellipse cx="50" cy="57" rx="38" ry="33" fill="#fff" stroke="${INK}" stroke-width="3.2"/>
  <path d="M14 63 Q7 68 12 75" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
  <path d="M86 63 Q93 68 88 75" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
  <path d="M32 42 Q36.5 39.5 41 41.5" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M59 41.5 Q63.5 39.5 68 42" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>
  <ellipse cx="38" cy="53" rx="4.8" ry="5.6" fill="${INK}"/>
  <ellipse cx="62" cy="53" rx="4.8" ry="5.6" fill="${INK}"/>
  <circle cx="39.6" cy="51" r="1.8" fill="#fff"/><circle cx="63.6" cy="51" r="1.8" fill="#fff"/>
  <path d="M35.6 55.6 Q38 57.4 40.4 55.6" fill="none" stroke="#fff" stroke-width="1.1"/>
  <path d="M59.6 55.6 Q62 57.4 64.4 55.6" fill="none" stroke="#fff" stroke-width="1.1"/>
  <ellipse cx="24" cy="63" rx="8" ry="4.8" fill="#f7b6c4"/>
  <ellipse cx="76" cy="63" rx="8" ry="4.8" fill="#f7b6c4"/>
  <path d="M20.5 61 l-1.5 4 M24 61 l-1.5 4 M27.5 61 l-1.5 4 M72.5 61 l-1.5 4 M76 61 l-1.5 4 M79.5 61 l-1.5 4" stroke="#c4637d" stroke-width="1.3" stroke-linecap="round"/>
  <path d="M47.5 64 Q48 68 50 68.5 Q52 68 52.5 64Z" fill="#f28ca3" stroke="${INK}" stroke-width="1.3"/>
  <path d="M44 61 Q47 65 50 62 Q53 65 56 61" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
}

function hachiwareSVG() {
  const id = 'hw' + (svgUid++);
  const BLUE = '#78acd3';
  return `<svg viewBox="0 0 100 100">
  <defs><clipPath id="${id}"><ellipse cx="50" cy="57" rx="38" ry="33"/></clipPath></defs>
  <path d="M15 44 L19 11 Q21 9 24 11 L44 27Z" fill="${BLUE}" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
  <path d="M85 44 L81 11 Q79 9 76 11 L56 27Z" fill="${BLUE}" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
  <path d="M82 78 Q97 74 95 61 Q93 56 89 59 Q90 70 79 72Z" fill="${BLUE}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M33 82 L32 95 Q36 98 40 95 L41 84" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M59 84 L60 95 Q64 98 68 95 L67 82" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <ellipse cx="50" cy="57" rx="38" ry="33" fill="#fff"/>
  <path clip-path="url(#${id})" d="M0 52 Q4 20 50 18 Q96 20 100 52 Q86 42 70 40 Q57 38 50 30 Q43 38 30 40 Q14 42 0 52Z" fill="${BLUE}" stroke="${INK}" stroke-width="3"/>
  <ellipse cx="50" cy="57" rx="38" ry="33" fill="none" stroke="${INK}" stroke-width="3.2"/>
  <path d="M15 66 Q8 70 12 76" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
  <path d="M85 66 Q92 70 88 76" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
  <path d="M35 46 Q37 45 39 46 M61 46 Q63 45 65 46" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>
  <ellipse cx="38" cy="55" rx="4.8" ry="5.6" fill="${INK}"/>
  <ellipse cx="62" cy="55" rx="4.8" ry="5.6" fill="${INK}"/>
  <circle cx="39.6" cy="53" r="1.8" fill="#fff"/><circle cx="63.6" cy="53" r="1.8" fill="#fff"/>
  <path d="M35.6 57.6 Q38 59.4 40.4 57.6 M59.6 57.6 Q62 59.4 64.4 57.6" fill="none" stroke="#fff" stroke-width="1.1"/>
  <ellipse cx="24" cy="65" rx="8" ry="4.8" fill="#f7b6c4"/>
  <ellipse cx="76" cy="65" rx="8" ry="4.8" fill="#f7b6c4"/>
  <path d="M20.5 63 l-1.5 4 M24 63 l-1.5 4 M27.5 63 l-1.5 4 M72.5 63 l-1.5 4 M76 63 l-1.5 4 M79.5 63 l-1.5 4" stroke="#c4637d" stroke-width="1.3" stroke-linecap="round"/>
  <path d="M43.5 63 Q46.7 67.5 50 63.5 Q53.3 67.5 56.5 63" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
}

function usagiSVG() {
  const L = '#5b3a29', F = '#fff2bf';
  return `<svg viewBox="0 0 100 100">
  <g transform="rotate(-10 40 30)">
    <ellipse cx="40" cy="18" rx="7.5" ry="20" fill="${F}" stroke="${L}" stroke-width="3"/>
    <ellipse cx="40" cy="19" rx="3.2" ry="14" fill="#f5b5c3"/>
  </g>
  <g transform="rotate(8 58 30)">
    <ellipse cx="58" cy="17" rx="7.5" ry="20" fill="${F}" stroke="${L}" stroke-width="3"/>
    <ellipse cx="58" cy="18" rx="3.2" ry="14" fill="#f5b5c3"/>
  </g>
  <path d="M36 82 L35 94 Q39 97 43 94 L44 85" fill="${F}" stroke="${L}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M56 85 L57 94 Q61 97 65 94 L64 82" fill="${F}" stroke="${L}" stroke-width="3" stroke-linejoin="round"/>
  <ellipse cx="50" cy="60" rx="35" ry="31" fill="${F}" stroke="${L}" stroke-width="3.2"/>
  <path d="M18 68 Q11 72 15 78" fill="${F}" stroke="${L}" stroke-width="3" stroke-linecap="round"/>
  <path d="M82 64 Q89 60 88 54" fill="${F}" stroke="${L}" stroke-width="3" stroke-linecap="round"/>
  <path d="M29 47 Q33 38 42 36 M71 47 Q67 38 58 36" fill="none" stroke="${L}" stroke-width="2.2" stroke-linecap="round"/>
  <circle cx="40" cy="57" r="4.2" fill="${L}"/><circle cx="60" cy="57" r="4.2" fill="${L}"/>
  <circle cx="41.3" cy="55.5" r="1.5" fill="#fff"/><circle cx="61.3" cy="55.5" r="1.5" fill="#fff"/>
  <ellipse cx="28" cy="66" rx="7" ry="4.4" fill="#f5b5c3"/>
  <ellipse cx="72" cy="66" rx="7" ry="4.4" fill="#f5b5c3"/>
  <path d="M25 64 l-1.3 3.6 M28 64 l-1.3 3.6 M31 64 l-1.3 3.6 M69 64 l-1.3 3.6 M72 64 l-1.3 3.6 M75 64 l-1.3 3.6" stroke="#c4637d" stroke-width="1.2" stroke-linecap="round"/>
  <path d="M45 63 Q47.5 67 50 63.5 Q52.5 67 55 63" fill="none" stroke="${L}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
}

/* ---------- 몬스터 그림 (SVG) ---------- */
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
      let pts = [];
      for (let i = 0; i < 14; i++) {
        const a = Math.PI * 2 * i / 14 - Math.PI / 2, r = i % 2 ? 30 : 42;
        pts.push((50 + Math.cos(a) * r).toFixed(1) + ',' + (58 + Math.sin(a) * r * .9).toFixed(1));
      }
      g = `<polygon points="${pts.join(' ')}" fill="${c}" ${st}/>
        <circle cx="50" cy="60" r="24" fill="${c}"/>
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
    case 'fish':
      g = `<path d="M74 58 L96 40 L94 78Z" fill="${c}" ${st}/>
        <ellipse cx="46" cy="60" rx="36" ry="26" fill="${c}" ${st}/>
        <path d="M40 36 Q50 22 62 36" fill="${c}" ${st}/>
        <path d="M58 48 Q62 60 58 72" fill="none" stroke="${s}" stroke-width="2" opacity=".6"/>
        ${eye(30, 54, 6)}
        <path d="M14 66 Q22 70 30 66" fill="none" stroke="${s}" stroke-width="2.4" stroke-linecap="round"/>`;
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
  const crown = boss ? `<path d="M34 16 L38 2 L44 12 L50 0 L56 12 L62 2 L66 16Z" fill="#ffd34d" stroke="${s}" stroke-width="2.4" stroke-linejoin="round" transform="translate(0,-6)"/>` : '';
  return `<svg viewBox="0 0 100 100">${g}${crown}</svg>`;
}

/* ---------- 게임 데이터 ---------- */
const HEROES = [
  {
    id: 'chiikawa', name: '치이카와', svg: chiikawaSVG,
    baseDmg: 1, interval: 1.0, baseCost: 10,
    desc: '작고 귀여운 녀석. 겁이 많고 잘 울지만, 토벌도 풀뽑기도 열심히 한다.',
    lines: ['와!', '야ー!', '으…', '후에…', '…!!', '해냈다!', '(꾸벅)', '하아아…', '토벌…!'],
    skill: { name: '울먹 각성!', desc: '10초 동안 치명타 확률 +50%', dur: 10, cd: 60, line: '야ー!! 야ー!!' },
  },
  {
    id: 'hachiware', name: '하치와레', svg: hachiwareSVG,
    baseDmg: 6, interval: 1.2, baseCost: 60,
    desc: '긍정적인 고양이. 말을 잘하고 기타 연주가 특기. 언제나 친구를 응원한다.',
    lines: ['어떻게든 될 거야~!', '치이카와, 괜찮아!', '와~ 대단해!', '오늘도 힘내자!', '보수 받으면 뭐 먹을까?', '맛있는 거 먹자~!', '우리라면 할 수 있어!'],
    skill: { name: '어떻게든 될 거야!', desc: '15초 동안 모두의 공격 속도 2배', dur: 15, cd: 90, line: '어떻게든 되어라ー!!' },
  },
  {
    id: 'usagi', name: '우사기', svg: usagiSVG,
    baseDmg: 25, interval: 0.55, baseCost: 900,
    desc: '예측불가 토끼. 엄청난 체력과 행동력으로 무엇이든 해치운다.',
    lines: ['우라!', '야하!', '후루루루루', '하아?', '우라라라!', '프르르르르', '야ー하ー!', '이야아아!'],
    skill: { name: '우라!! 야하!!', desc: '즉시 전체 DPS×30의 강력한 일격', dur: 0, cd: 45, line: '우라ー!! 야하ー!!' },
  },
];
const HERO_BY = Object.fromEntries(HEROES.map(h => [h.id, h]));
const HERO_R = 1.09;
const SKILL_LV = 10;

const JOBS = [
  { name: '풀뽑기', icon: '🌿', base: 0.6, cost: 15, desc: '노동 게시판의 기본 일. 뽑고 또 뽑자. 풀뽑기 검정도 있다던데…' },
  { name: '포장마차 일손 돕기', icon: '🏮', base: 5, cost: 250, desc: '밤의 포장마차에서 꼬치 굽기. 쿠리만쥬 아저씨도 자주 온다.' },
  { name: '하치와레의 기타 버스킹', icon: '🎸', base: 32, cost: 3000, desc: '광장에서 기타를 치며 노래하면 박수와 동전이 날아온다.' },
  { name: '라멘 가게 아르바이트', icon: '🍜', base: 200, cost: 40000, desc: '라멘 가게 주방 일. 면 삶기는 타이밍이 생명!' },
  { name: '갑옷씨 공방 굿즈 만들기', icon: '🧸', base: 1400, cost: 6e5, desc: '갑옷씨들과 함께 꼼꼼하게 핸드메이드 굿즈를 만든다.' },
  { name: '랏코 선생님 도장 조교', icon: '🦦', base: 10000, cost: 9e6, desc: '최강 토벌자 랏코의 도장에서 수련생들을 돕는다.' },
  { name: '수수께끼의 유적 조사', icon: '🗿', base: 80000, cost: 1.5e8, desc: '아무도 모르는 유적을 조사한다. 무언가 잠들어 있는 듯…' },
];
const JOB_R = 1.13;

const FOODS = [
  { id: 'ramen', name: '라멘 한 그릇', icon: '🍜', desc: '뜨끈한 국물로 기운 충전! 공격력 ×2', short: '공격력×2' },
  { id: 'pudding', name: '커다란 푸딩', icon: '🍮', desc: '탱글탱글 행복의 맛. 보수 ×2', short: '보수×2' },
  { id: 'croquette', name: '갓 튀긴 고로케', icon: '🥔', desc: '바삭바삭! 모두의 공격 속도 ×1.5', short: '속도×1.5' },
];
const FOOD_DUR = 120, FOOD_CAP = 900;

const AREAS = [
  {
    name: '풀숲', sky: ['#bfe6ff', '#eef9ff'], ground: '#a3d983', deco: ['🌿', '🌱', '🌼', '🌿'],
    mons: [{ n: '작은 키메라', t: 'blob', c: '#c3b0ee' }, { n: '풀숲 덩어리', t: 'blob', c: '#94cc72' }, { n: '뾰족 키메라', t: 'spiky', c: '#f2a7a7' }],
    boss: { n: '커다란 키메라', t: 'spiky', c: '#a585e6' },
  },
  {
    name: '깊은 숲', sky: ['#a9dcc2', '#e3f6ea'], ground: '#73ad63', deco: ['🌲', '🍄', '🌳', '🌲'],
    mons: [{ n: '버섯 요괴', t: 'mush', c: '#e86f6f' }, { n: '숲 키메라', t: 'blob', c: '#78b585' }, { n: '나무 그림자', t: 'blob', c: '#8c7a68' }],
    boss: { n: '숲의 주인', t: 'mush', c: '#c0392b' },
  },
  {
    name: '강가', sky: ['#9fd6f4', '#ecf9ff'], ground: '#eadcae', deco: ['🪨', '💧', '🌾', '🐚'],
    mons: [{ n: '물방울 키메라', t: 'blob', c: '#86c9f2' }, { n: '꽥꽥 물고기', t: 'fish', c: '#f5ac63' }, { n: '이끼 바위', t: 'rock', c: '#a7b89a' }],
    boss: { n: '강의 큰 물고기', t: 'fish', c: '#e67e22' },
  },
  {
    name: '어두운 동굴', sky: ['#5c5672', '#8e87a6'], ground: '#6e667b', deco: ['🪨', '💎', '🕯️', '🪨'],
    mons: [{ n: '박쥐 키메라', t: 'bat', c: '#8a75a0' }, { n: '바위 덩어리', t: 'rock', c: '#a3a3b0' }, { n: '동굴 키메라', t: 'spiky', c: '#7d9bb5' }],
    boss: { n: '동굴의 거대 박쥐', t: 'bat', c: '#5a4870' },
  },
  {
    name: '밤의 숲', sky: ['#2e4069', '#51628f'], ground: '#3e5d4c', deco: ['🌙', '✨', '🌲', '⭐'],
    mons: [{ n: '그림자 요괴', t: 'blob', c: '#5a5a7a' }, { n: '눈 큰 키메라', t: 'eye', c: '#a982d4' }, { n: '밤버섯', t: 'mush', c: '#6e5aa8' }],
    boss: { n: '밤의 키메라 왕', t: 'eye', c: '#7b3fa0' },
  },
  {
    name: '수수께끼의 유적', sky: ['#f2d8a6', '#fff3dc'], ground: '#cfab70', deco: ['🗿', '🏛️', '🌵', '⚱️'],
    mons: [{ n: '고대 갑주', t: 'armor', c: '#b8925f' }, { n: '유적 키메라', t: 'spiky', c: '#d6a85e' }, { n: '돌 파수꾼', t: 'rock', c: '#c2b08f' }],
    boss: { n: '크고 강한 녀석', t: 'armor', c: '#8a5a2a' },
  },
];

const KILLS_PER_STAGE = 10;
const BOSS_TIME = 30, BOSS_HP = 10, BOSS_REWARD = 6;
const EXAM_MIN = 40;
const RANKS = [
  { p: 0, n: '무자격' }, { p: 1, n: '토벌 5급' }, { p: 30, n: '토벌 4급' }, { p: 120, n: '토벌 3급' },
  { p: 400, n: '토벌 2급' }, { p: 1200, n: '토벌 1급' }, { p: 4000, n: '특급 토벌자' },
];
const AUTO_SKILL_POINTS = 120;

/* ---------- 상태 ---------- */
const SAVE_KEY = 'chiikawa-idle-save-v1';
function freshState() {
  return {
    coins: 0, stage: 1, kills: 0, maxStage: 1, autoAdvance: true,
    heroes: { chiikawa: 1, hachiware: 0, usagi: 0 },
    tapLv: 1, jobs: JOBS.map(() => 0),
    buffs: { ramen: 0, pudding: 0, croquette: 0 },
    skillCd: { chiikawa: 0, hachiware: 0, usagi: 0 },
    skillOn: { chiikawa: 0, hachiware: 0, usagi: 0 },
    points: 0, prestiges: 0, autoSkill: false, buyMode: 1,
    stats: { kills: 0, bossKills: 0, taps: 0, totalCoins: 0, bestStage: 1, playTime: 0 },
    seenIntro: false, lastTime: Date.now(),
  };
}
function merge(base, saved) {
  for (const k in base) {
    if (saved[k] === undefined) continue;
    if (base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) merge(base[k], saved[k]);
    else if (Array.isArray(base[k])) base[k] = base[k].map((v, i) => saved[k][i] ?? v);
    else base[k] = saved[k];
  }
  return base;
}
let S = freshState();
try {
  const raw = localStorage.getItem(SAVE_KEY);
  if (raw) S = merge(freshState(), JSON.parse(raw));
} catch (e) { /* 저장소를 못 쓰면 새로 시작 */ }

function save() {
  S.lastTime = Date.now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { }
}

const rt = {
  monster: null, respawn: 0, heroTimer: {}, bossTime: 0,
  uiAcc: 0, saveAcc: 0, talkAcc: 4, floatCount: 0, lastHitFx: 0, lastAtkFx: {},
  tab: 'heroes', lastReal: Date.now(), areaIdx: -1,
};

/* ---------- 공식 ---------- */
const geoCost = (base, r, lv, n) => base * Math.pow(r, lv) * (Math.pow(r, n) - 1) / (r - 1);
function geoMax(base, r, lv, money) {
  const a = base * Math.pow(r, lv);
  if (money < a) return 0;
  return Math.floor(Math.log(money * (r - 1) / a + 1) / Math.log(r));
}
function buyN(base, r, lv) {
  if (S.buyMode === 'max') return Math.max(1, geoMax(base, r, lv, S.coins));
  return S.buyMode;
}

const pointMult = () => 1 + 0.1 * S.points;
const dmgMult = () => pointMult() * (S.buffs.ramen > 0 ? 2 : 1);
const coinMult = () => pointMult() * (S.buffs.pudding > 0 ? 2 : 1);
const speedMult = () => (S.skillOn.hachiware > 0 ? 2 : 1) * (S.buffs.croquette > 0 ? 1.5 : 1);
const critChance = () => 0.05 + (S.skillOn.chiikawa > 0 ? 0.5 : 0);
const CRIT_MULT = 3;

const heroBaseDmg = (h, lv) => lv <= 0 ? 0 : h.baseDmg * lv * Math.pow(2, Math.floor(lv / 10));
const heroDmg = h => heroBaseDmg(h, S.heroes[h.id]) * dmgMult();
const heroDps = h => heroDmg(h) / h.interval * speedMult();
const totalDps = () => HEROES.reduce((a, h) => a + heroDps(h), 0);
const heroCost = (h, n) => geoCost(h.baseCost, HERO_R, S.heroes[h.id], n);

const tapBase = lv => lv * Math.pow(2, Math.floor(lv / 10));
const tapDmg = () => (tapBase(S.tapLv) + totalDps() * 0.05) * dmgMult();
const tapCost = n => geoCost(8, 1.1, S.tapLv - 1, n);

const jobIncomeOf = (j, lv) => j.base * lv * Math.pow(2, Math.floor(lv / 25));
const jobIncome = () => JOBS.reduce((a, j, i) => a + jobIncomeOf(j, S.jobs[i]), 0) * pointMult();
const jobCost = (i, n) => geoCost(JOBS[i].cost, JOB_R, S.jobs[i], n);

const isBoss = st => st % 10 === 0;
const areaIdxOf = st => Math.floor((st - 1) / 10) % AREAS.length;
const loopOf = st => Math.floor((st - 1) / (10 * AREAS.length));
const monsterHp = st => 10 * Math.pow(1.2, st - 1) * Math.pow(3, loopOf(st));
const monsterReward = st => Math.ceil(monsterHp(st) * 0.18 / Math.pow(2.2, loopOf(st)));
const foodCost = () => Math.max(40, monsterReward(S.stage) * 25);

function examGain() {
  if (S.maxStage < EXAM_MIN) return 0;
  return Math.floor(Math.pow(S.maxStage - 30, 1.4) / 3);
}
function rankOf(p) {
  let r = RANKS[0];
  for (const x of RANKS) if (p >= x.p) r = x;
  return r;
}
function areaLabel(st) {
  const a = AREAS[areaIdxOf(st)], loop = loopOf(st);
  return a.name + (loop ? ' ' + '★'.repeat(Math.min(loop, 3)) + (loop > 3 ? loop : '') : '');
}

/* ---------- DOM 준비 ---------- */
const el = {
  coins: $('#coins'), dps: $('#dps'), income: $('#income'), rank: $('#rank'),
  field: $('#field'), deco: $('#deco'), stageName: $('#stage-name'), stageProg: $('#stage-progress'),
  bossBar: $('#boss-bar'), bossFill: $('#boss-fill'), bossTime: $('#boss-time'),
  advance: $('#advance-btn'), party: $('#party'), enemy: $('#enemy'), enemyName: $('#enemy-name'),
  hpFill: $('#hp-fill'), hpText: $('#hp-text'), monster: $('#monster'), floats: $('#floats'),
  skills: $('#skills'), buffs: $('#buff-icons'), toast: $('#toast'), tapHint: $('#tap-hint'),
  panel: $('#panel'), modal: $('#modal'), modalBody: $('#modal-body'), modalBtns: $('#modal-btns'),
};

function buildParty() {
  const order = ['usagi', 'hachiware', 'chiikawa'];
  el.party.innerHTML = order.map(id => `
    <div class="hero" data-id="${id}" ${S.heroes[id] > 0 ? '' : 'hidden'}>
      <div class="bubble"></div>
      <div class="hero-body">${HERO_BY[id].svg()}</div>
      <div class="hero-lv">Lv.${S.heroes[id]}</div>
    </div>`).join('');
  el.skills.innerHTML = HEROES.map(h => `
    <button class="skill" data-skill="${h.id}" title="${h.skill.name}" hidden>
      ${h.svg()}<span class="sk-cd"></span>
    </button>`).join('');
}
const heroEl = id => el.party.querySelector(`.hero[data-id="${id}"]`);

function refreshParty() {
  for (const h of HEROES) {
    const e = heroEl(h.id), lv = S.heroes[h.id];
    e.hidden = lv <= 0;
    e.querySelector('.hero-lv').textContent = 'Lv.' + lv;
  }
}

function setArea(force) {
  const idx = areaIdxOf(S.stage);
  if (idx === rt.areaIdx && !force) return;
  rt.areaIdx = idx;
  const a = AREAS[idx];
  el.field.style.background = `linear-gradient(${a.sky[0]}, ${a.sky[1]} 62%, ${a.ground} 62%, ${a.ground})`;
  let html = '';
  for (let i = 0; i < 9; i++) {
    const ground = i < 6;
    const x = rand(2, 94), y = ground ? rand(64, 92) : rand(14, 48);
    const size = ground ? rand(16, 26) : rand(12, 20);
    html += `<span style="left:${x}%;top:${y}%;font-size:${size}px">${ground ? pick(a.deco) : (a.sky[0] < '#6' ? pick(['✨', '⭐', '·']) : pick(['☁️', '·', '☁️']))}</span>`;
  }
  el.deco.innerHTML = html;
}

/* ---------- 몬스터 ---------- */
function spawnMonster() {
  const st = S.stage, boss = isBoss(st), area = AREAS[areaIdxOf(st)];
  const def = boss ? area.boss : pick(area.mons);
  const hp = monsterHp(st) * (boss ? BOSS_HP : 1);
  rt.monster = { def, boss, hp, maxHp: hp, reward: monsterReward(st) * (boss ? BOSS_REWARD : 1) };
  if (boss) {
    rt.bossTime = BOSS_TIME;
    toast(`⚠️ 보스 출현! <b>${def.n}</b>`);
    say('chiikawa', '으…!', true);
  }
  el.enemy.classList.toggle('boss', boss);
  el.enemyName.textContent = def.n;
  el.monster.innerHTML = monsterSVG(def, boss);
  el.monster.className = '';
  void el.monster.offsetWidth;
  el.monster.className = 'spawn';
  setArea();
  updateStageUI();
  updateHp();
}

function updateHp() {
  const m = rt.monster;
  if (!m) { el.hpFill.style.width = '0%'; el.hpText.textContent = ''; return; }
  el.hpFill.style.width = Math.max(0, m.hp / m.maxHp * 100) + '%';
  el.hpText.textContent = fmt(Math.max(0, m.hp)) + ' / ' + fmt(m.maxHp);
}

function updateStageUI() {
  const st = S.stage, inArea = (st - 1) % 10 + 1, areaNo = Math.floor((st - 1) / 10) + 1;
  el.stageName.textContent = `${areaLabel(st)} ${areaNo}-${inArea}`;
  if (isBoss(st)) {
    el.stageProg.innerHTML = '<span class="boss-label">👑 보스전</span>';
  } else {
    let d = '';
    for (let i = 0; i < KILLS_PER_STAGE; i++) d += `<i class="${i < S.kills ? 'on' : ''}"></i>`;
    el.stageProg.innerHTML = d;
  }
  el.bossBar.hidden = !(rt.monster && rt.monster.boss);
  el.advance.hidden = S.autoAdvance;
}

function enemyCenter() {
  const f = el.field.getBoundingClientRect(), m = el.monster.getBoundingClientRect();
  return { x: m.left - f.left + m.width / 2, y: m.top - f.top + m.height * .4 };
}

function floatText(text, cls, x, y) {
  if (rt.floatCount > 28 && cls !== 'crit' && cls !== 'coin' && cls !== 'skill') return;
  if (x === undefined) { const c = enemyCenter(); x = c.x + rand(-30, 30); y = c.y + rand(-20, 15); }
  const d = document.createElement('div');
  d.className = 'float ' + cls;
  d.style.left = x + 'px';
  d.style.top = y + 'px';
  d.textContent = text;
  rt.floatCount++;
  d.addEventListener('animationend', () => { d.remove(); rt.floatCount--; });
  el.floats.appendChild(d);
}

function hit(dmg, kind) {
  const m = rt.monster;
  if (!m) return;
  let crit = false;
  if (kind !== 'skill' && Math.random() < critChance()) { dmg *= CRIT_MULT; crit = true; }
  m.hp -= dmg;
  floatText(fmt(dmg) + (crit ? '!' : ''), kind === 'skill' ? 'skill' : crit ? 'crit' : kind === 'tap' ? 'tap' : 'dmg');
  const now = performance.now();
  if (now - rt.lastHitFx > 90) {
    rt.lastHitFx = now;
    el.monster.classList.remove('hit', 'spawn');
    void el.monster.offsetWidth;
    el.monster.classList.add('hit');
  }
  if (m.hp <= 0) killMonster();
  else updateHp();
}

function killMonster() {
  const m = rt.monster;
  const reward = m.reward * coinMult();
  addCoins(reward);
  floatText('+' + fmt(reward) + ' 💰', 'coin');
  S.stats.kills++;
  if (m.boss) {
    S.stats.bossKills++;
    S.stage++;
    S.kills = 0;
    toast(`🎉 <b>${m.def.n}</b> 토벌 성공!`);
    cheerAll();
  } else {
    S.kills++;
    if (S.kills >= KILLS_PER_STAGE) {
      if (S.autoAdvance) { S.stage++; S.kills = 0; } else S.kills = KILLS_PER_STAGE;
    }
  }
  if (S.stage > S.maxStage) S.maxStage = S.stage;
  if (S.maxStage > S.stats.bestStage) S.stats.bestStage = S.maxStage;
  rt.monster = null;
  rt.respawn = m.boss ? 0.9 : 0.42;
  el.monster.className = 'die';
  updateHp();
  updateStageUI();
}

function bossFail() {
  S.stage = Math.max(1, S.stage - 1);
  S.kills = KILLS_PER_STAGE;
  S.autoAdvance = false;
  rt.monster = null;
  toast('보스를 놓쳤다…<br><small>더 강해져서 다시 도전하자!</small>');
  say('chiikawa', '으… 흑…', true);
  setTimeout(() => say('hachiware', '괜찮아, 다음엔 이길 거야!', true), 900);
  spawnMonster();
}

function addCoins(n) {
  S.coins += n;
  S.stats.totalCoins += n;
}

/* ---------- 연출 ---------- */
let toastTimer = 0;
function toast(html) {
  el.toast.innerHTML = html;
  el.toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.toast.classList.remove('show'), 1800);
}

const bubbleTimers = {};
function say(id, text, big) {
  if (S.heroes[id] <= 0) return;
  const b = heroEl(id).querySelector('.bubble');
  b.textContent = text;
  b.classList.toggle('big', !!big);
  b.classList.add('show');
  clearTimeout(bubbleTimers[id]);
  bubbleTimers[id] = setTimeout(() => b.classList.remove('show'), 2200);
}

function heroAttackFx(id) {
  const now = performance.now();
  if (now - (rt.lastAtkFx[id] || 0) < 200) return;
  rt.lastAtkFx[id] = now;
  const b = heroEl(id).querySelector('.hero-body');
  b.classList.remove('atk', 'cheer');
  void b.offsetWidth;
  b.classList.add('atk');
}

function cheerAll() {
  for (const h of HEROES) {
    if (S.heroes[h.id] <= 0) continue;
    const b = heroEl(h.id).querySelector('.hero-body');
    b.classList.remove('atk', 'cheer');
    void b.offsetWidth;
    b.classList.add('cheer');
  }
  say('chiikawa', '해냈다…!', true);
  setTimeout(() => say('usagi', '야하ー!!', true), 300);
  setTimeout(() => say('hachiware', '와~ 대단해!', true), 600);
}

/* ---------- 행동 ---------- */
function tapAttack(e) {
  if (!rt.monster) return;
  S.stats.taps++;
  const f = el.field.getBoundingClientRect();
  const x = e.clientX - f.left, y = e.clientY - f.top;
  const p = document.createElement('div');
  p.className = 'poof';
  p.style.left = x + 'px';
  p.style.top = y + 'px';
  p.addEventListener('animationend', () => p.remove());
  el.floats.appendChild(p);
  hit(tapDmg(), 'tap');
  if (!el.tapHint.hidden && S.stats.taps >= 15) el.tapHint.hidden = true;
}

function useSkill(id) {
  const h = HERO_BY[id];
  if (S.heroes[id] < SKILL_LV || S.skillCd[id] > 0) return false;
  if (id === 'usagi' && !rt.monster) return false;
  S.skillCd[id] = h.skill.cd;
  if (h.skill.dur) S.skillOn[id] = h.skill.dur;
  say(id, h.skill.line, true);
  heroAttackFx(id);
  if (id === 'usagi') hit(totalDps() * 30, 'skill');
  else toast(`✨ ${h.name}: <b>${h.skill.name}</b>`);
  return true;
}

function buyHero(id) {
  const h = HERO_BY[id], n = buyN(h.baseCost, HERO_R, S.heroes[id]), c = heroCost(h, n);
  if (S.coins < c) return;
  const was = S.heroes[id];
  S.coins -= c;
  S.heroes[id] += n;
  refreshParty();
  if (was === 0) {
    toast(`${h.name}(이)가 동료가 되었다!`);
    setTimeout(() => say(id, pick(h.lines), true), 200);
  } else if (Math.floor(was / 10) !== Math.floor(S.heroes[id] / 10)) {
    say(id, S.heroes[id] >= SKILL_LV && was < SKILL_LV ? '스킬을 배웠다!' : '강해졌다!', true);
  }
}
function buyTap() {
  const n = buyN(8, 1.1, S.tapLv - 1), c = tapCost(n);
  if (S.coins < c) return;
  S.coins -= c;
  S.tapLv += n;
}
function buyJob(i) {
  const n = buyN(JOBS[i].cost, JOB_R, S.jobs[i]), c = jobCost(i, n);
  if (S.coins < c) return;
  S.coins -= c;
  S.jobs[i] += n;
}
function buyFood(id) {
  const c = foodCost();
  if (S.coins < c || S.buffs[id] >= FOOD_CAP - 1) return;
  S.coins -= c;
  S.buffs[id] = Math.min(FOOD_CAP, S.buffs[id] + FOOD_DUR);
  const f = FOODS.find(x => x.id === id);
  toast(`${f.icon} 냠냠! ${f.short}`);
  say(pick(HEROES.filter(h => S.heroes[h.id] > 0)).id, '맛있다~!', true);
}

function doExam() {
  const gain = examGain();
  if (gain <= 0) return;
  showModal(`<h2>📜 토벌 자격 시험</h2>
    <p>지금까지의 경험으로 시험을 보면<br><span class="big-num">+${gain}</span> 자격 포인트를 얻어요.</p>
    <p class="muted">보수 · 동료 레벨 · 노동 · 스테이지는 처음부터 다시 시작해요.<br>자격 포인트 1개당 공격력과 보수가 영구히 +10%!</p>`,
  [{ label: '그만두기', cls: 'pink' }, {
    label: '시험 보기!', cls: 'yellow', fn: () => {
      const keep = { points: S.points + gain, prestiges: S.prestiges + 1, stats: S.stats, autoSkill: S.autoSkill, buyMode: S.buyMode, seenIntro: true };
      S = Object.assign(freshState(), keep);
      S.coins = S.points * 5;
      rt.monster = null;
      rt.heroTimer = {};
      buildParty();
      setArea(true);
      spawnMonster();
      renderPanel();
      save();
      const r = rankOf(S.points);
      setTimeout(() => showModal(`<div class="faces">${chiikawaSVG()}${hachiwareSVG()}${usagiSVG()}</div>
        <h2>합격!</h2><p>자격 포인트 <b>${S.points}</b> · 등급 <b>${r.n}</b><br>모두 다시 처음부터 힘내자!</p>`), 100);
    },
  }]);
}

/* ---------- 모달 ---------- */
function showModal(html, buttons) {
  buttons = buttons || [{ label: '좋아!', cls: '' }];
  el.modalBody.innerHTML = html;
  el.modalBtns.innerHTML = '';
  for (const b of buttons) {
    const btn = document.createElement('button');
    btn.className = 'buy ' + (b.cls || '');
    btn.textContent = b.label;
    btn.onclick = () => { el.modal.hidden = true; b.fn && b.fn(); };
    el.modalBtns.appendChild(btn);
  }
  el.modal.hidden = false;
}

/* ---------- 패널 ---------- */
function buyLabel(n, cost, verb) {
  return `${verb}${n > 1 ? ' ×' + n : ''}<small>💰 ${fmt(cost)}</small>`;
}
function segHtml() {
  return `<div class="seg">${[1, 10, 'max'].map(m =>
    `<button data-act="mode" data-v="${m}" class="${S.buyMode === m ? 'on' : ''}">${m === 'max' ? 'MAX' : '×' + m}</button>`).join('')}</div>`;
}

function renderPanel() {
  const t = rt.tab;
  let h = '';
  if (t === 'heroes') {
    h += `<div class="panel-head"><span>토벌대 동료</span>${segHtml()}</div>`;
    for (const x of HEROES) {
      h += `<div class="card" data-hero="${x.id}">
        <div class="card-ico">${x.svg()}</div>
        <div class="card-main">
          <div class="card-title">${x.name} <span class="lv"></span></div>
          <div class="card-desc">${x.desc}</div>
          <div class="card-stat"></div>
          <div class="card-desc sk"></div>
        </div>
        <button class="buy" data-act="hero" data-id="${x.id}"></button>
      </div>`;
    }
    h += `<div class="card" data-tap>
      <div class="card-ico">👆</div>
      <div class="card-main">
        <div class="card-title">같이 싸우기 연습 <span class="lv"></span></div>
        <div class="card-desc">화면을 누르면 함께 공격! 동료 DPS의 5%가 더해진다.</div>
        <div class="card-stat"></div>
      </div>
      <button class="buy blue" data-act="tap"></button>
    </div>`;
  } else if (t === 'jobs') {
    h += `<div class="panel-head"><span>노동 게시판 <small id="job-total"></small></span>${segHtml()}</div>`;
    JOBS.forEach((j, i) => {
      h += `<div class="card" data-job="${i}">
        <div class="card-ico">${j.icon}</div>
        <div class="card-main">
          <div class="card-title">${j.name} <span class="lv"></span></div>
          <div class="card-desc">${j.desc}</div>
          <div class="card-stat"></div>
        </div>
        <button class="buy pink" data-act="job" data-i="${i}"></button>
      </div>`;
    });
    h += `<p class="card-desc" style="text-align:center">노동 보수는 게임을 꺼둔 동안에도 쌓여요 (최대 12시간)</p>`;
  } else if (t === 'food') {
    h += `<div class="panel-head"><span>맛있는 것 먹고 힘내기</span><small>한 번에 +${FOOD_DUR / 60}분 (최대 ${FOOD_CAP / 60}분)</small></div>`;
    for (const f of FOODS) {
      h += `<div class="card" data-food="${f.id}">
        <div class="card-ico">${f.icon}</div>
        <div class="card-main">
          <div class="card-title">${f.name}</div>
          <div class="card-desc">${f.desc}</div>
          <div class="card-stat"></div>
        </div>
        <button class="buy yellow" data-act="food" data-id="${f.id}"></button>
      </div>`;
    }
    h += `<p class="card-desc" style="text-align:center">가격은 현재 스테이지에 따라 올라가요</p>`;
  } else if (t === 'exam') {
    const r = rankOf(S.points);
    h += `<div class="box">
      <h3>📜 토벌 자격 시험</h3>
      <p>현재 등급: <b>${r.n}</b> · 자격 포인트 <b id="ex-points">${S.points}</b></p>
      <p>영구 보너스: 공격력 · 보수 <b>×${pointMult().toFixed(1)}</b></p>
      <p class="muted">스테이지 ${EXAM_MIN} 이상 도달하면 시험을 볼 수 있어요. 더 멀리 갈수록 포인트가 많아져요.</p>
      <p>이번 도전 최고 스테이지: <b id="ex-max"></b></p>
      <p>얻을 수 있는 포인트: <span class="big-num" id="ex-gain"></span></p>
      <div class="row"><button class="buy yellow" data-act="exam" id="ex-btn">시험 보러 가기!</button></div>
      <label class="toggle" id="auto-wrap"><input type="checkbox" data-act="auto" ${S.autoSkill ? 'checked' : ''}> 스킬 자동 사용 <small class="muted" id="auto-note"></small></label>
    </div>
    <div class="box"><h3>등급표</h3><ul class="rank-list">
      ${RANKS.map(x => `<li class="${x === r ? 'on' : ''}"><span>${x.n}</span><span>${x.p} pt</span></li>`).join('')}
    </ul><p class="muted">토벌 3급부터 스킬 자동 사용이 해금돼요.</p></div>`;
  } else if (t === 'info') {
    h += `<div class="box">
      <h3>🌏 이 세계에 대해</h3>
      <p>작고 귀여운 녀석들이 사는 세계. 모두들 노동 게시판에서 <b>풀뽑기</b> 같은 일을 하고 <b>보수</b>를 받아 맛있는 걸 사 먹으며 살아가요.</p>
      <p>하지만 숲과 동굴에는 무서운 <b>키메라</b>들이 숨어 있어요. 토벌하면 큰 보수를 받을 수 있지만, 위험한 일이죠.</p>
      <p>치이카와, 하치와레, 우사기와 함께 토벌을 떠나고, <b>토벌 자격 시험</b>에 합격해 더 높은 등급을 노려 보세요!</p>
    </div>
    <div class="box"><h3>📊 기록</h3><div class="stats" id="stats"></div></div>
    <div class="box"><h3>⚙️ 설정</h3>
      <p class="muted">진행 상황은 이 브라우저에 자동 저장돼요.</p>
      <div class="row">
        <button class="buy blue" data-act="save">지금 저장</button>
        <button class="buy pink" data-act="reset">처음부터 다시</button>
      </div>
    </div>
    <p class="card-desc" style="text-align:center">비영리 팬메이드 게임 · 원작: 나가노 「먼가 작고 귀여운 녀석」</p>`;
  }
  el.panel.innerHTML = h;
  refreshPanel();
}

function setBuy(btn, html, ok) {
  if (btn._h !== html) { btn.innerHTML = html; btn._h = html; }
  btn.disabled = !ok;
}
function setText(node, text) {
  if (node && node.textContent !== text) node.textContent = text;
}

function refreshPanel() {
  const t = rt.tab, P = el.panel;
  if (t === 'heroes') {
    for (const x of HEROES) {
      const card = P.querySelector(`[data-hero="${x.id}"]`), lv = S.heroes[x.id];
      const n = buyN(x.baseCost, HERO_R, lv), c = heroCost(x, n);
      card.classList.toggle('locked', lv === 0);
      setText(card.querySelector('.lv'), lv ? 'Lv.' + lv : '미합류');
      const nextMs = (Math.floor(lv / 10) + 1) * 10;
      setText(card.querySelector('.card-stat'), lv
        ? `DPS ${fmt(heroDps(x))} · Lv.${nextMs}에 공격력 ×2`
        : `합류하면 DPS ${fmt(heroBaseDmg(x, 1) * dmgMult() / x.interval * speedMult())}`);
      setText(card.querySelector('.sk'), `스킬 「${x.skill.name}」 ${x.skill.desc}` + (lv < SKILL_LV ? ` (Lv.${SKILL_LV} 해금)` : ''));
      setBuy(card.querySelector('.buy'), lv ? buyLabel(n, c, '레벨업') : buyLabel(1, c, '합류시키기'), S.coins >= c);
    }
    const card = P.querySelector('[data-tap]');
    const n = buyN(8, 1.1, S.tapLv - 1), c = tapCost(n);
    setText(card.querySelector('.lv'), 'Lv.' + S.tapLv);
    setText(card.querySelector('.card-stat'), `탭 데미지 ${fmt(tapDmg())}`);
    setBuy(card.querySelector('.buy'), buyLabel(n, c, '연습하기'), S.coins >= c);
  } else if (t === 'jobs') {
    setText($('#job-total'), `(초당 ${fmt(jobIncome())})`);
    JOBS.forEach((j, i) => {
      const card = P.querySelector(`[data-job="${i}"]`), lv = S.jobs[i];
      const n = buyN(j.cost, JOB_R, lv), c = jobCost(i, n);
      card.classList.toggle('locked', lv === 0);
      setText(card.querySelector('.lv'), lv ? 'Lv.' + lv : '');
      const next = (jobIncomeOf(j, lv + n) - jobIncomeOf(j, lv)) * pointMult();
      setText(card.querySelector('.card-stat'), `초당 ${fmt(jobIncomeOf(j, lv) * pointMult())} 💰 (+${fmt(next)})`);
      setBuy(card.querySelector('.buy'), buyLabel(n, c, lv ? '더 일하기' : '일 시작'), S.coins >= c);
    });
  } else if (t === 'food') {
    const c = foodCost();
    for (const f of FOODS) {
      const card = P.querySelector(`[data-food="${f.id}"]`), left = S.buffs[f.id];
      setText(card.querySelector('.card-stat'), left > 0 ? `⏳ 남은 시간 ${fmtTime(left)}` : '');
      setBuy(card.querySelector('.buy'), buyLabel(1, c, '먹기'), S.coins >= c && left < FOOD_CAP - 1);
    }
  } else if (t === 'exam') {
    const g = examGain();
    setText($('#ex-max'), String(S.maxStage));
    setText($('#ex-gain'), g > 0 ? '+' + g : `스테이지 ${EXAM_MIN} 필요`);
    $('#ex-btn').disabled = g <= 0;
    const unlocked = S.points >= AUTO_SKILL_POINTS;
    const cb = $('#auto-wrap input');
    cb.disabled = !unlocked;
    setText($('#auto-note'), unlocked ? '' : `(토벌 3급 필요)`);
  } else if (t === 'info') {
    const s = S.stats;
    const html = [
      ['최고 스테이지', s.bestStage], ['토벌한 키메라', fmt(s.kills)], ['보스 토벌', fmt(s.bossKills)],
      ['톡톡 공격', fmt(s.taps)], ['누적 보수', fmt(s.totalCoins)], ['자격 시험 합격', S.prestiges + '회'],
      ['플레이 시간', fmtTime(s.playTime)],
    ].map(([a, b]) => `<span>${a}</span><span>${b}</span>`).join('');
    const st = $('#stats');
    if (st._h !== html) { st.innerHTML = html; st._h = html; }
  }
}

el.panel.addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (!b || b.disabled) return;
  const act = b.dataset.act;
  if (act === 'mode') { S.buyMode = b.dataset.v === 'max' ? 'max' : +b.dataset.v; renderPanel(); return; }
  if (act === 'hero') buyHero(b.dataset.id);
  else if (act === 'tap') buyTap();
  else if (act === 'job') buyJob(+b.dataset.i);
  else if (act === 'food') buyFood(b.dataset.id);
  else if (act === 'exam') doExam();
  else if (act === 'save') { save(); toast('저장했어요!'); }
  else if (act === 'reset') {
    showModal('<h2>정말 처음부터?</h2><p>모든 진행 상황이 사라져요.</p>', [
      { label: '아니요', cls: 'blue' },
      { label: '지울래요', cls: 'pink', fn: () => { try { localStorage.removeItem(SAVE_KEY); } catch (e) { } S = freshState(); location.reload(); } },
    ]);
    return;
  }
  refreshPanel();
  refreshHud();
});
el.panel.addEventListener('change', e => {
  if (e.target.dataset.act === 'auto') S.autoSkill = e.target.checked;
});

document.querySelectorAll('#tabs button').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('#tabs button').forEach(x => x.classList.toggle('on', x === b));
  rt.tab = b.dataset.tab;
  renderPanel();
  el.panel.scrollTop = 0;
}));

el.field.addEventListener('pointerdown', e => {
  const sk = e.target.closest('.skill');
  if (sk) { useSkill(sk.dataset.skill); return; }
  if (e.target.closest('button')) return;
  tapAttack(e);
});
el.advance.addEventListener('click', () => {
  S.autoAdvance = true;
  if (S.kills >= KILLS_PER_STAGE) { S.stage++; S.kills = 0; spawnMonster(); }
  updateStageUI();
});

/* ---------- HUD ---------- */
function refreshHud() {
  setText(el.coins, fmt(S.coins));
  setText(el.dps, fmt(totalDps()));
  setText(el.income, fmt(jobIncome()));
  setText(el.rank, rankOf(S.points).n);
  for (const h of HEROES) {
    const b = el.skills.querySelector(`[data-skill="${h.id}"]`);
    const unlocked = S.heroes[h.id] >= SKILL_LV;
    b.hidden = !unlocked;
    if (!unlocked) continue;
    const cd = S.skillCd[h.id], on = S.skillOn[h.id] > 0;
    b.classList.toggle('ready', cd <= 0);
    b.classList.toggle('active', on);
    const pct = cd > 0 ? cd / h.skill.cd * 100 : 0;
    b.querySelector('.sk-cd').style.background = cd > 0 ? `conic-gradient(rgba(0,0,0,.45) ${pct}%, transparent 0)` : 'none';
    setText(b.querySelector('.sk-cd'), on ? Math.ceil(S.skillOn[h.id]) + '' : cd > 0 ? Math.ceil(cd) + '' : '');
  }
  let bh = '';
  for (const f of FOODS) if (S.buffs[f.id] > 0) bh += `<div>${f.icon} ${Math.ceil(S.buffs[f.id])}s</div>`;
  if (el.buffs._h !== bh) { el.buffs.innerHTML = bh; el.buffs._h = bh; }
  if (rt.monster && rt.monster.boss) {
    el.bossFill.style.width = (rt.bossTime / BOSS_TIME * 100) + '%';
    setText(el.bossTime, Math.ceil(rt.bossTime) + '초');
  }
}

/* ---------- 오프라인 보상 ---------- */
function applyOffline(sec, show) {
  sec = Math.min(sec, 12 * 3600);
  if (sec <= 0) return;
  const jobs = jobIncome() * sec;
  const dps = HEROES.reduce((a, h) => a + heroBaseDmg(h, S.heroes[h.id]) / h.interval, 0) * pointMult();
  let battle = 0;
  if (dps > 0) {
    const killTime = monsterHp(S.stage) / dps + 0.45;
    battle = sec / killTime * monsterReward(S.stage) * pointMult() * 0.5;
  }
  const total = jobs + battle;
  addCoins(total);
  for (const k in S.buffs) S.buffs[k] = Math.max(0, S.buffs[k] - sec);
  for (const k in S.skillCd) { S.skillCd[k] = Math.max(0, S.skillCd[k] - sec); S.skillOn[k] = Math.max(0, S.skillOn[k] - sec); }
  if (show && sec >= 60 && total > 0) {
    showModal(`<div class="faces">${chiikawaSVG()}${hachiwareSVG()}${usagiSVG()}</div>
      <h2>다녀왔어?</h2>
      <p>${fmtTime(sec)} 동안 모두 열심히 일했어!</p>
      <p>🌿 노동 보수 <b>${fmt(jobs)}</b><br>⚔️ 토벌 보수 <b>${fmt(battle)}</b></p>
      <p class="big-num">+${fmt(total)} 💰</p>`);
  }
}

/* ---------- 메인 루프 ---------- */
function update(dt) {
  S.stats.playTime += dt;
  for (const k in S.buffs) if (S.buffs[k] > 0) S.buffs[k] = Math.max(0, S.buffs[k] - dt);
  for (const k in S.skillCd) {
    if (S.skillCd[k] > 0) S.skillCd[k] = Math.max(0, S.skillCd[k] - dt);
    if (S.skillOn[k] > 0) S.skillOn[k] = Math.max(0, S.skillOn[k] - dt);
  }
  addCoins(jobIncome() * dt);

  if (!rt.monster) {
    rt.respawn -= dt;
    if (rt.respawn <= 0) spawnMonster();
  } else {
    const sp = speedMult();
    for (const h of HEROES) {
      if (S.heroes[h.id] <= 0) continue;
      rt.heroTimer[h.id] = (rt.heroTimer[h.id] || 0) + dt * sp;
      let swings = 0;
      while (rt.heroTimer[h.id] >= h.interval && rt.monster) {
        rt.heroTimer[h.id] -= h.interval;
        hit(heroDmg(h), 'hero');
        swings++;
      }
      if (swings) heroAttackFx(h.id);
    }
    if (rt.monster && rt.monster.boss) {
      rt.bossTime -= dt;
      if (rt.bossTime <= 0) bossFail();
    }
  }

  if (S.autoSkill && S.points >= AUTO_SKILL_POINTS) {
    for (const h of HEROES) if (S.heroes[h.id] >= SKILL_LV && S.skillCd[h.id] <= 0) useSkill(h.id);
  }

  rt.talkAcc -= dt;
  if (rt.talkAcc <= 0) {
    rt.talkAcc = rand(6, 12);
    const joined = HEROES.filter(h => S.heroes[h.id] > 0);
    const h = pick(joined);
    say(h.id, pick(h.lines));
  }

  refreshHud();
  rt.uiAcc += dt;
  if (rt.uiAcc > 0.2) { rt.uiAcc = 0; refreshPanel(); }
  rt.saveAcc += dt;
  if (rt.saveAcc > 10) { rt.saveAcc = 0; save(); }
}

function loop() {
  const now = Date.now();
  const gap = (now - rt.lastReal) / 1000;
  rt.lastReal = now;
  if (gap > 3) applyOffline(gap, gap >= 60);
  else update(Math.max(0, gap));
  requestAnimationFrame(loop);
}

document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
window.addEventListener('pagehide', save);

/* ---------- 시작 ---------- */
buildParty();
setArea(true);
spawnMonster();
renderPanel();
if (S.stats.taps >= 15) el.tapHint.hidden = true;

const away = (Date.now() - (S.lastTime || Date.now())) / 1000;
if (!S.seenIntro) {
  S.seenIntro = true;
  showModal(`<div class="faces">${chiikawaSVG()}${hachiwareSVG()}${usagiSVG()}</div>
    <h2>먼작귀 방치 토벌대</h2>
    <p>작고 귀여운 녀석들이 사는 세계.<br>풀뽑기로 <b>보수</b>를 벌고, 숲의 <b>키메라</b>를 토벌하자!</p>
    <p class="muted">🐹 동료를 모으고 레벨업 · 🌿 노동으로 방치 수입<br>🍜 맛있는 걸 먹고 버프 · 📜 자격 시험으로 영구 강화</p>`,
  [{ label: '토벌하러 가자!', cls: '' }]);
} else if (away > 3) {
  applyOffline(away, true);
}
requestAnimationFrame(loop);
