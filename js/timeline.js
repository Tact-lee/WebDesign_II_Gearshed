/* =========================================================
   GEARSHED — Timeline
   - data/timeline.<lang>.json 하나로 41챕터를 조립한다
   - 챕터는 archetype에 따라 서로 다른 렌더러를 탄다
   - 스크롤 연출은 rAF 한 개 + IntersectionObserver로만 돌린다
   ========================================================= */

import { makeSil, shapeOf } from './silhouettes.js';
import { cutout } from './media.js';
import { m3Prepare, m3Near, m3Draw, m3Status } from './model3d.js';

const $ = (s, r = document) => r.querySelector(s);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

const KIND_LABEL = {
  '3d': '3D model', 'image': 'Photograph', 'image+diagram': 'Photo + diagram',
  'image+link': 'Photo + link', 'image+sound': 'Photo + sound', 'image+audio': 'Photo + audio',
  'diagram': 'Diagram', 'diagram+sound': 'Diagram + sound', 'diagram+image': 'Diagram + photo',
  'document': 'Document', 'document+image': 'Document + photo', 'document+diagram': 'Document + diagram',
  'interaction': 'Interaction', 'interaction+sound': 'Interaction + sound',
  'sound': 'Sound', 'sound+link': 'Sound + link', 'chart': 'Chart', 'quote': 'Quote',
  '3d+anno': '3D + annotations', '3d+image': '3D + photo', '3d+anno+interaction': '3D + interaction',
  '3d+interaction': '3D + interaction', '3d-or-image': '3D or photo', 'none': '—',
};
const kindLabel = (k) => KIND_LABEL[k] || k || '—';

/* ---------- 0. 입장 시퀀스 ----------
   암전 → 2026 에서 1931 까지 한 해씩 거슬러 올라가는 연도판 →
   1931 의 네 숫자가 자리 그대로 T·i·m·e 로 넘어가고,
   l·i·n·e 가 그 뒤를 따라 오른쪽으로 하나씩 돌아 나온다. */
const boot = $('#boot');
const tLine = $('.intro-title .t-line');

const BOOT = {
  word: 'Timeline',
  from: 2026,
  to: 1931,
  /* 연도판은 한 덩어리 애니메이션으로 굴린다. 끊기지 않게 칸마다 속도를
     이어서 깎아 내려가고, 끝으로 갈수록 머무는 시간이 붙어 연도가 읽힌다. */
  cStart: 78,            // 2026 에서 떨어지는 첫 칸 (ms)
  cFast: 13,             // 한창 훑고 지나갈 때 한 칸 (ms)
  cSlow: 300,            // 마지막 1932 → 1931 한 칸 (ms)
  accel: 9,              // 최고 속도까지 쓰는 칸 수
  decel: 14,             // 감속에 쓰는 칸 수
  holdMax: 0.42,         // 마지막 해가 멈춰 서 있는 비율
  flowEase: 'linear',                            // 훑는 구간 — 속도가 이어진다
  moveEase: 'cubic-bezier(.42, .02, .46, 1)',    // 감속 구간 — 부드럽게 앉는다
  countLag: 0,           // 네 자리를 딱 맞물려 돌린다 — 없는 연도가 비치지 않게
  lead: 420,             // 2026 을 먼저 읽히고 나서 거슬러 올라간다
  hold: 160,             // 1931 에서 숨 고르기
  morphMs: 620,          // 숫자가 걷히고 글자가 올라오는 시간
  morphLag: 60,          // T·i·m·e 사이 시차
  morphEase: 'cubic-bezier(.3, 1, .33, 1)',
  tailAt: 250,           // Time 이 올라오기 시작하고 나서 line 이 따라붙는다
  tailGap: 115,          // l·i·n·e 사이 시차
  tailMs: 540,
  tailSpin: 9,           // 글자가 앉기 전에 지나가는 글자 수
  tailEase: 'cubic-bezier(.18, 1, .3, 1)',
  follow: [              // 전환 이후 뒤따라 들어오는 요소들
    ['.eyebrow', 'boot-rise', 680],
    ['.topbar', 'boot-fade', 760],
    ['.intro-sub', 'boot-rise', 790],
    ['.intro-stats', 'boot-rise', 890],
    ['.scroll-cue', 'boot-rise', 1000],
    ['#rail', 'boot-fade', 1080],
    ['#progress', 'boot-fade', 1080],
    ['#nowyear', 'boot-fade', 1080],
  ],
};

const YEARS = [];
for (let y = BOOT.from; y >= BOOT.to; y--) YEARS.push(String(y));
const LAST = YEARS.length - 1;
const DIGITS = String(BOOT.to).length;

/* line 칸이 돌 때 지나가는 글자 — 폭이 비슷한 것끼리 묶어야 칸이 들썩이지 않는다 */
const SPIN_NARROW = ['i', 'l', 't', '1', 'j', 'f'];
const SPIN_WIDE = ['n', 'u', 'o', 'e', 'c', 's'];
const spinSet = (ch) => (SPIN_NARROW.includes(ch) ? SPIN_NARROW : SPIN_WIDE);

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
scrollTo(0, 0);

const cell = (t) => {
  const i = document.createElement('i');
  i.textContent = t;
  return i;
};

// 글자 수만큼 칸을 깔고, 먼저 글자만 넣은 상태에서 폭을 재 둔다
const slots = [...BOOT.word].map((chr, j) => {
  const slot = document.createElement('span');
  slot.className = 'slot';
  const strip = document.createElement('span');
  strip.className = 'slot-strip';
  strip.appendChild(cell(chr));
  slot.appendChild(strip);
  return { slot, strip, chr, j };
});
tLine.textContent = '';
slots.forEach((s) => tLine.appendChild(s.slot));

function layoutSlots() {
  const cell = Math.round(parseFloat(getComputedStyle($('.intro-title')).fontSize));
  tLine.style.setProperty('--cell', `${cell}px`);
  const wLetter = slots.map((s) => s.slot.getBoundingClientRect().width);
  slots[0].strip.firstChild.textContent = '0';
  const wDigit = slots[0].slot.getBoundingClientRect().width;
  slots[0].strip.firstChild.textContent = slots[0].chr;
  return { wLetter, wDigit, cell };
}

function buildReels(wDigit) {
  slots.forEach((s) => {
    const frag = document.createDocumentFragment();
    if (s.j < DIGITS) {
      YEARS.forEach((y) => frag.appendChild(cell(y[s.j])));   // 네 칸이 맞물려 진짜 연도를 읽는다
      s.wordAt = YEARS.length;
      s.slot.style.setProperty('--w', `${wDigit}px`);
    } else {
      frag.appendChild(cell(''));                             // 연도 뒤쪽 칸은 접혀 있다
      const set = spinSet(s.chr);
      for (let i = 0; i < BOOT.tailSpin; i++) frag.appendChild(cell(set[(i * 5 + s.j) % set.length]));
      s.wordAt = BOOT.tailSpin + 1;
      s.slot.style.setProperty('--w', '0px');
      s.slot.style.setProperty('--ww', '420ms');              // 칸이 먼저 열리고 그 안에서 돈다
    }
    s.strip.insertBefore(frag, s.strip.firstChild);
    s.strip.style.setProperty('--i', '0');
  });
}

/* 연도판의 속도 곡선을 @keyframes 한 벌로 구워 둔다.
   메인 스레드가 41개 챕터를 그리는 동안에도 컴포지터에서 혼자 돈다. */
function countFrames(cellPx) {
  const A = BOOT.accel;
  const B = LAST - BOOT.decel;
  const cycle = [];
  const hold = [];
  for (let i = 0; i < LAST; i++) {
    const up = i < A ? (1 - i / A) ** 2 : 0;                     // 멈춰 있던 2026 에서 가속
    const dn = i >= B ? ((i - B) / (LAST - 1 - B)) ** 2.1 : 0;   // 1940년대부터 감속
    cycle[i] = BOOT.cFast + (BOOT.cStart - BOOT.cFast) * up + (BOOT.cSlow - BOOT.cFast) * dn;
    hold[i] = cycle[i] * BOOT.holdMax * dn;
  }
  const total = cycle.reduce((a, b) => a + b, 0);
  const at = (ms) => `${((ms / total) * 100).toFixed(4)}%`;
  const pos = (i) => `translate3d(0,${(-i * cellPx).toFixed(2)}px,0)`;

  const rows = [];
  let t = 0;
  for (let i = 0; i < LAST; i++) {
    if (hold[i] > 0.5) {
      rows.push(`${at(t)}{transform:${pos(i)}}`);                                  // 머무는 동안
      rows.push(`${at(t + hold[i])}{transform:${pos(i)};animation-timing-function:${BOOT.moveEase}}`);
    } else {
      rows.push(`${at(t)}{transform:${pos(i)};animation-timing-function:${i >= B ? BOOT.moveEase : BOOT.flowEase}}`);
    }
    t += cycle[i];
  }
  rows.push(`100%{transform:${pos(LAST)}}`);

  const sheet = document.createElement('style');
  sheet.id = 'gs-count-frames';
  sheet.textContent = `@keyframes gs-count{${rows.join('')}}`;
  document.head.appendChild(sheet);
  return total;
}

/* 연도판을 굴린다. 다 굴러가는 데 걸리는 시간을 돌려준다 */
function count(cellPx) {
  const total = countFrames(cellPx);
  slots.forEach((s) => {
    if (s.j >= DIGITS) return;
    const lag = (DIGITS - 1 - s.j) * BOOT.countLag;
    s.strip.style.animation = `gs-count ${total.toFixed(0)}ms linear ${BOOT.lead + lag}ms both`;
  });
  return BOOT.lead + total + (DIGITS - 1) * BOOT.countLag;
}

function morph(wLetter) {
  document.body.classList.add('boot-morph');
  // 애니메이션이 멈춘 자리와 같은 값을 박아 두고 넘겨받는다 — 화면은 그대로다
  slots.forEach((s) => {
    if (s.j >= DIGITS) return;
    s.strip.style.animation = 'none';
    s.strip.style.setProperty('--i', String(LAST));
  });
  void tLine.offsetHeight;
  slots.forEach((s) => {
    const head = s.j < DIGITS;
    const d = head
      ? s.j * BOOT.morphLag
      : BOOT.tailAt + (s.j - DIGITS) * BOOT.tailGap;
    s.strip.style.setProperty('--dur', `${head ? BOOT.morphMs : BOOT.tailMs}ms`);
    s.strip.style.setProperty('--d', `${d}ms`);
    s.strip.style.setProperty('--sp-ease', head ? BOOT.morphEase : BOOT.tailEase);
    s.strip.style.setProperty('--i', String(s.wordAt));
    s.slot.style.setProperty('--wd', `${d}ms`);
    s.slot.style.setProperty('--w', `${wLetter[s.j]}px`);
  });
}

function settle() {
  // 숫자 칸을 걷어내고 폭을 자동으로 — 창 크기가 바뀌어도 타이틀이 어긋나지 않게
  slots.forEach((s) => {
    while (s.strip.children.length > 1) s.strip.removeChild(s.strip.firstChild);
    s.strip.removeAttribute('style');
    s.slot.removeAttribute('style');
  });
  tLine.style.removeProperty('--cell');
  $('#gs-count-frames')?.remove();       // 다 쓴 연도판 키프레임은 걷는다
  tLine.classList.add('is-done');
  document.body.classList.remove('booting', 'boot-ready', 'boot-morph');
  document.body.classList.add('booted');
  boot?.remove();
  BOOT.follow.forEach(([sel, cls]) => {
    const el = $(sel);
    if (!el) return;
    el.classList.remove(cls);
    el.style.removeProperty('--fi');
  });
}

BOOT.follow.forEach(([sel, cls, delay]) => {
  const el = $(sel);
  if (!el) return;
  el.classList.add(cls);
  el.style.setProperty('--fi', `${delay}ms`);
});

function runBoot() {
  if (REDUCED) {
    // 연도판을 돌리지 않는다 — 칸에는 이미 글자만 들어 있다
    document.body.classList.add('boot-ready', 'boot-morph');
    setTimeout(settle, 60);
    return;
  }

  const { wLetter, wDigit, cell } = layoutSlots();
  buildReels(wDigit);
  document.body.classList.add('boot-ready');
  void tLine.offsetHeight;                       // 2026 을 한 번 그리고 나서 굴린다

  const tail = Math.max(
    BOOT.tailAt + BOOT.tailGap * (slots.length - DIGITS - 1) + BOOT.tailMs,
    ...BOOT.follow.map(([, , d]) => d + 1000),
  );
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const morphAt = count(cell) + BOOT.hold;
    setTimeout(() => morph(wLetter), morphAt);
    setTimeout(settle, morphAt + tail + 120);
  }));
}

// 폭은 타이틀 폰트가 올라온 뒤에 재야 한다
Promise.race([
  document.fonts ? document.fonts.ready : Promise.resolve(),
  new Promise((r) => setTimeout(r, 1200)),
]).then(runBoot);

/* ---------- 1. 데이터 ---------- */
/* 언어: ?lang= 이 있으면 그 언어, 없으면 늘 영어(문서 기본값). 고른 언어를 저장해 두지 않는다 — 첫 화면은 언제나 영어 */
const LANGS = ['en', 'ko', 'ja'];
const ALIAS = { kr: 'ko', jp: 'ja' };                        // 표기는 EN / KR / JP, 내부 코드는 en / ko / ja
const qraw = new URLSearchParams(location.search).get('lang');
const qp = ALIAS[qraw] || qraw;
const lang = LANGS.includes(qp) ? qp : (document.documentElement.lang || 'en');
document.documentElement.lang = lang;

// CJK는 본문 글꼴이 따로 필요하다. 해당 언어일 때만 받아 온다
if (lang !== 'en') {
  const fam = lang === 'ko' ? 'Noto+Serif+KR' : 'Noto+Serif+JP';
  const l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = `https://fonts.googleapis.com/css2?family=${fam}:wght@400;600&display=swap`;
  document.head.appendChild(l);
}

document.querySelectorAll('.lang button[data-lang]').forEach((b) => {
  b.classList.toggle('is-on', b.dataset.lang === lang);
  b.addEventListener('click', () => {
    if (b.dataset.lang === lang) return;
    const u = new URL(location.href);
    if (b.dataset.lang === 'en') u.searchParams.delete('lang');   // 영어는 기본 주소 그대로
    else u.searchParams.set('lang', b.dataset.lang);
    u.hash = '';
    location.href = u.toString();
  });
});
if (new URLSearchParams(location.search).has('notes')) document.body.classList.add('show-notes');

const data = await fetch(`data/timeline.${lang}.json`).then((r) => r.json());

/* 작업 범위 — 지금은 이 챕터까지만 그린다. null 이면 전부 */
const BUILD_UNTIL = 'stratocaster';
const BUILD_SKIP = ['bassman'];          // 순서상 앞이지만 아직 작업하지 않은 챕터
data.chapters = data.chapters.filter((c) => !BUILD_SKIP.includes(c.id));
if (BUILD_UNTIL) {
  const cut = data.chapters.findIndex((c) => c.id === BUILD_UNTIL);
  if (cut >= 0) {
    data.chapters = data.chapters.slice(0, cut + 1);
    const used = new Set(data.chapters.map((c) => c.era));
    data.eras = data.eras.filter((e) => used.has(e.id));
    data.stats = { ...data.stats, chapters: data.chapters.length,
      years: [data.chapters[0].year, data.chapters[data.chapters.length - 1].year] };
  }
}

/* ---------- 2. 조립 ---------- */
const tl = $('#tl');
const railList = $('#rail ol');
const frag = document.createDocumentFragment();

const para = (text) =>
  String(text).split('\n\n').map((p, i) => `<p${i === 0 ? ' class="lede"' : ''}>${esc(p)}</p>`).join('');

const blockHTML = (b, i, withNote = true) => `
  <article class="block" data-i="${i}">
    ${b.h ? `<h3>${esc(b.h)}</h3>` : ''}
    ${para(b.b)}
    ${withNote && b.media.note ? `<p class="mnote">${esc(kindLabel(b.media.kind))} · ${esc(b.media.note)}</p>` : ''}
  </article>`;

/* 실루엣 블록 하나 */
function silWrap(ch, kind, rotate = 0) {
  const w = document.createElement('div');
  w.className = 'sil-wrap fade';
  w.dataset.kind = kindLabel(kind);
  w.style.setProperty('--r', '0');
  w.appendChild(makeSil(ch.sil, { label: `${ch.model} silhouette`, rotate }));
  return w;
}

/* ---------- 찢긴 종이 경계 ----------
   경계선은 매 프레임 노이즈로 다시 그려 들끓듯 움직이고,
   흰 섬유는 경계에 붙어 흔들리고, 부스러기는 사진 쪽으로 흩어지며 사라진다. */
function seeded(s) {
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
function noise1d(rand, n = 96) {
  const v = Array.from({ length: n }, rand);
  return (t) => {
    const i = Math.floor(t);
    const f = t - i;
    const u = f * f * (3 - 2 * f);
    const a = v[((i % n) + n) % n];
    const b = v[(((i + 1) % n) + n) % n];
    return (a + (b - a) * u) * 2 - 1;        // -1 ~ 1
  };
}

const TEAR = {
  swell: 0.07,        // 큰 굴곡 진폭 (화면 높이 비율)
  flow: 0.16,         // 큰 굴곡이 옆으로 흐르는 속도
  ripple: 0.02,       // 중간 굴곡
  tooth: 7,           // 잔 톱니 (px) — 빠르게 들끓는다
  rimMin: 6,          // 흰 테두리 최소 두께 (px)
  rimVar: 18,         // 흰 테두리 변화량 (px)
  boil: 1.7,          // 들끓는 속도 배율
  idle: 0.38,         // 스크롤이 멎었을 때의 움직임 (1 = 최대)
  surge: 3.2,         // 스크롤할 때 움직임이 빨라지는 배율
  lift: 0.7,          // 스크롤할 때 굴곡이 커지는 비율
  fibers: 2.6,        // 섬유 밀도 (px 당 1개의 역수)
  dust: 6,            // 부스러기 밀도
  rim: [248, 246, 241],
};

function tearEdge(seed, dir) {
  // dir: -1 = 종이가 아래(경계 위로 섬유가 뻗음), +1 = 종이가 위
  const rand = seeded(seed);
  const N = Array.from({ length: 9 }, () => noise1d(rand));
  const fib = [];
  const dust = [];
  let W = 0, dpr = 1;

  const newFiber = (x) => ({
    x: x ?? rand() * W,
    k: rand(),                                  // 테두리 안쪽 어디에서 시작하나
    len: (2 + rand() * rand() * 13) * dpr,
    ang: (rand() - 0.5) * 1.5,
    wob: 0.6 + rand() * 2.2,
    ph: rand() * 6.28,
    a: 0.35 + rand() * 0.6,
    w: rand() < 0.7 ? 0 : 1,
    life: 1.2 + rand() * 3.5,
  });
  const newDust = () => ({
    x: rand() * W,
    d: 0,
    v: (6 + rand() * 26) * dpr,
    vx: (rand() - 0.5) * 10 * dpr,
    r: (0.5 + rand() * 1.4) * dpr,
    life: 0.5 + rand() * 1.6,
    t: 0,
  });

  return {
    fit(w, d) {
      W = w; dpr = d;
      fib.length = 0; dust.length = 0;
      const nf = Math.round(W / (TEAR.fibers * dpr));
      for (let i = 0; i < nf; i++) { const f = newFiber(); f.life *= rand(); fib.push(f); }
      const nd = Math.round(W / (TEAR.dust * dpr));
      for (let i = 0; i < nd; i++) { const p = newDust(); p.t = rand() * p.life; dust.push(p); }
    },

    // ph: 경계가 흐른 '시간' — 스크롤할 때만 빨리 흐른다. en: 스크롤 기세 0~1
    draw(g, E, Hc, vh, t, dt, paper, swirl, ph, en, band) {
      const A = vh * dpr;
      const step = 3 * dpr;
      const s = dir;                                 // 바깥(사진) 쪽 방향
      const tb = ph * TEAR.boil;
      const amp = 1 + TEAR.lift * en;            // 스크롤 기세만큼 굴곡이 부푼다
      const xs = [], outer = [], inner = [];
      for (let x = -step; x <= W + step; x += step) {
        const y = E
          + amp * A * (TEAR.swell * N[0](x / (W / 2.6) + ph * TEAR.flow) + TEAR.ripple * N[1](x / (W / 11) - ph * TEAR.flow * 1.8))
          + amp * dpr * (TEAR.tooth * (0.6 * N[2](x / (34 * dpr) + tb * 0.5) + 0.4 * N[3](x / (21 * dpr) - tb * 0.7))
                 + 2.4 * N[4](x / (6 * dpr) + tb * 2.1) + 1.2 * N[5](x / (2.5 * dpr) - tb * 3.3));
        const rim = dpr * (TEAR.rimMin + TEAR.rimVar * (N[6](x / (170 * dpr) + tb * 0.08) * 0.5 + 0.5)
                         + 3.5 * N[7](x / (14 * dpr) + tb * 0.9));
        xs.push(x);
        outer.push(y + s * Math.max(2 * dpr, rim));
        inner.push(y + s * dpr * 1.8 * N[8](x / (8 * dpr) + tb * 1.4));
      }
      const far = s < 0 ? Hc + 4 : -4;
      const shape = (line) => {
        g.beginPath();
        g.moveTo(xs[0], far);
        for (let i = 0; i < xs.length; i++) g.lineTo(xs[i], line[i]);
        g.lineTo(xs[xs.length - 1], far);
        g.closePath();
      };
      const at = (arr, x) => arr[Math.max(0, Math.min(arr.length - 1, Math.round(x / step) + 1))];

      // 그림자 — 경계 바깥으로 번지는 띠를 겹쳐 그린다
      g.save();
      g.lineJoin = 'round';
      for (const [off, lw, al] of [[9, 22, 0.07], [5, 12, 0.1], [2.5, 5, 0.14]]) {
        g.translate(0, s * off * dpr);
        g.strokeStyle = `rgba(18, 14, 10, ${al})`;
        g.lineWidth = lw * dpr;
        g.beginPath();
        for (let i = 0; i < xs.length; i++) (i ? g.lineTo : g.moveTo).call(g, xs[i], outer[i]);
        g.stroke();
        g.translate(0, -s * off * dpr);
      }
      g.restore();

      // 흰 테두리 — band 모드에서는 경계선과 바깥선 사이의 띠만 칠한다(종이 자리에는 실제 패널이 있다)
      const [R, G, B] = TEAR.rim;
      g.fillStyle = `rgb(${R}, ${G}, ${B})`;
      if (band) {
        g.beginPath();
        for (let i = 0; i < xs.length; i++) (i ? g.lineTo : g.moveTo).call(g, xs[i], outer[i]);
        for (let i = xs.length - 1; i >= 0; i--) g.lineTo(xs[i], inner[i]);
        g.closePath();
      } else shape(outer);
      g.fill();

      // 섬유 — 경계에 붙어 흔들리고, 수명이 다하면 다른 자리에서 다시 돋는다
      const buckets = [new Path2D(), new Path2D(), new Path2D(), new Path2D(), new Path2D(), new Path2D()];
      for (let i = 0; i < fib.length; i++) {
        const f = fib[i];
        f.life -= dt;
        if (f.life <= 0) { fib[i] = newFiber(); continue; }
        const oy = at(outer, f.x), iy = at(inner, f.x);
        const y0 = oy + (iy - oy) * f.k * 0.5;
        const sway = f.ang + (0.12 + 0.3 * en) * Math.sin(ph * f.wob * 2.4 + f.ph) + swirl * 0.6;
        const L = f.len * (0.75 + 0.25 * Math.sin(t * f.wob * 1.3 + f.ph));
        const dx = Math.sin(sway) * L, dy = s * Math.cos(sway) * L;
        const fade = Math.min(1, f.life * 2);
        const a = f.a * fade * (0.65 + 0.35 * Math.sin(t * 2.3 + f.ph));
        const p = buckets[Math.min(2, Math.floor(a * 3)) + f.w * 3];
        p.moveTo(f.x, y0);
        p.quadraticCurveTo(f.x + dx * 0.4 + Math.sin(f.ph) * 2 * dpr, y0 + dy * 0.5, f.x + dx, y0 + dy);
      }
      for (let b = 0; b < 6; b++) {
        g.strokeStyle = `rgba(${R + 2}, ${G + 2}, ${B + 4}, ${[0.3, 0.6, 0.9][b % 3]})`;
        g.lineWidth = (b < 3 ? 0.6 : 1.25) * dpr;
        g.stroke(buckets[b]);
      }

      // 부스러기 — 사진 쪽으로 흩어지며 사라진다
      const dots = [new Path2D(), new Path2D(), new Path2D()];
      for (let i = 0; i < dust.length; i++) {
        const p = dust[i];
        p.t += dt;
        if (p.t >= p.life) { dust[i] = newDust(); continue; }
        p.d += p.v * dt * (0.35 + en * 4 + Math.abs(swirl) * 3);
        p.x += p.vx * dt;
        const y = at(outer, p.x) + s * p.d;
        const k = 1 - p.t / p.life;
        const bi = Math.min(2, Math.floor(k * 3));
        dots[bi].rect(p.x, y, p.r, p.r);
      }
      for (let b = 0; b < 3; b++) {
        g.fillStyle = `rgba(252, 250, 246, ${[0.25, 0.5, 0.85][b]})`;
        g.fill(dots[b]);
      }

      // 종이 몸통
      if (!band) {
        g.fillStyle = paper;
        shape(inner);
        g.fill();
      }
      return { xs, inner };
    },
  };
}

function makeTear(cv, band = false, off = 0) {
  const vertical = band === 'right';        // 들어오는 패널이 오른쪽에서 밀려올 때 그 왼쪽 변이 찢긴 세로 경계
  const g = cv.getContext('2d');
  const top = tearEdge(1931, 1);       // 위 종이 — 경계 아래로 섬유가 뻗는다
  const bot = tearEdge(1936, -1);      // 아래 종이 — 경계 위로 섬유가 뻗는다
  let W = 0, Hc = 0, cwP = 0, chP = 0, dpr = 1, paper = '#ece9e1', prev = 0, lastTop = null, lastBot = null;
  let ph = 0, en = 0;
  const fit = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    cwP = Math.round(cv.clientWidth * dpr);
    chP = Math.round(cv.clientHeight * dpr);
    if (!cwP || !chP) return false;
    cv.width = cwP; cv.height = chP;
    W = vertical ? chP : cwP;                // 경계를 따라가는 길이
    Hc = vertical ? cwP : chP;               // 경계에 수직인 길이
    paper = getComputedStyle(cv).getPropertyValue('--paper').trim() || paper;
    top.fit(W, dpr); bot.fit(W, dpr);
    return true;
  };
  return {
    // eTop: 위 종이의 아래 경계, eBot: 아래 종이의 위 경계 (css px, 핀 기준)
    draw(eTop, eBot, now) {
      if (Math.round(cv.clientWidth * dpr) !== cwP || Math.round(cv.clientHeight * dpr) !== chP) {
        if (!fit()) return;
      }
      const t = now / 1000;
      const dt = prev ? Math.min(0.05, t - prev) : 0.016;
      prev = t;
      const vh = cv.clientHeight;
      const per = vertical ? cv.clientWidth : vh;     // 경계가 가로질러 움직이는 방향의 길이
      const m = per * 0.16;
      // 경계가 움직이는 속도만큼 섬유가 휘고 부스러기가 더 흩어진다
      const swT = lastTop === null ? 0 : clamp((eTop - lastTop) / (vh * 0.02), -1, 1);
      const swB = lastBot === null ? 0 : clamp((eBot - lastBot) / (vh * 0.02), -1, 1);
      // 경계가 움직인 속도(화면 높이/초) → 기세. 붙을 땐 빨리, 식을 땐 천천히
      const v = lastTop === null ? 0
        : Math.max(Math.abs(eTop - lastTop), Math.abs(eBot - lastBot)) / vh / Math.max(dt, 0.008);
      const goal = clamp(v * 0.9);
      en += (goal - en) * (goal > en ? 0.22 : 0.035);
      ph += dt * (TEAR.idle + TEAR.surge * en);
      lastTop = eTop; lastBot = eBot;
      g.clearRect(0, 0, cv.width, cv.height);
      let poly = '';
      if (band !== 'bottom' && eTop > -m) {
        const e = top.draw(g, eTop * dpr, Hc, vh, t, dt, paper, swT, ph, en, band);
        if (band) {                                  // 경계선 위쪽만 보이게 하는 clip-path
          const step = 3;
          const pts = [];
          for (let i = 0; i < e.xs.length; i += step) pts.push(`${(e.xs[i] / dpr).toFixed(1)}px ${(e.inner[i] / dpr).toFixed(1)}px`);
          poly = `polygon(-4px -4px, ${pts.join(',')}, ${(W / dpr + 4).toFixed(1)}px -4px)`;
        }
      }
if (band === 'right') {
  if (eBot < per + m && eBot > -m) {
    g.setTransform(0, 1, 1, 0, 0, 0);          // x 와 y 를 맞바꿔 가로 경계 그림을 세로 경계로 쓴다
    const e = bot.draw(g, eBot * dpr, Hc, vh, t, dt, paper, swB, ph, en, true);
    g.setTransform(1, 0, 0, 1, 0, 0);
    const pts = [];
    // 들어오는 패널은 eBot 만큼 오른쪽으로 밀려 있으니, 패널 안 좌표는 경계선에서 eBot 을 뺀 값
    for (let i = 0; i < e.xs.length; i += 3) pts.push(`${(e.inner[i] / dpr - eBot).toFixed(1)}px ${(e.xs[i] / dpr).toFixed(1)}px`);
    poly = `polygon(${pts.join(',')}, ${(per + 4).toFixed(1)}px ${(vh + 4).toFixed(1)}px, ${(per + 4).toFixed(1)}px -4px)`;
  }
} else if (band === 'bottom') {
        if (eBot < vh + m && eBot > -m) {
          const e = bot.draw(g, eBot * dpr, Hc, vh, t, dt, paper, swB, ph, en, true);
          const pts = [];
          // 들어오는 패널은 eBot 만큼 내려앉아 있으니, 패널 안 좌표는 경계선에서 eBot 을 뺀 값
          for (let i = 0; i < e.xs.length; i += 3) pts.push(`${(e.xs[i] / dpr).toFixed(1)}px ${(e.inner[i] / dpr - eBot + off).toFixed(1)}px`);
          poly = `polygon(-4px ${vh * 2}px, ${pts.join(',')}, ${(W / dpr + 4).toFixed(1)}px ${vh * 2}px)`;
        }
      } else if (!band && eBot < vh + m) bot.draw(g, eBot * dpr, Hc, vh, t, dt, paper, swB, ph, en);
      return poly;
    },
  };
}

/* ---------- 가로 무대 ----------
   모서리 이미지 → 찢긴 종이 → 전면 사진까지는 제자리에서 일어나고,
   그다음부터는 화면이 왼쪽으로 밀리며 패널이 하나씩 들어온다. */
const HX = { span: 1.5, dwell: 0.15, tail: 0.8, slideFrom: 0.44 };   // 칸의 앞 44% 는 머물고 나머지 56% 에서 이동 — 스냅 지점(0.36)과 사이에 여유를 둔다
const M3 = { move: 0.62, dwell: 0.12, tail: 0.9 };   // 3D 챕터 — 다음 칸으로 옮겨 가는 스크롤(화면) · 스냅 위치 · 끝에서 어두워지는 꼬리
/* 이징 — 가운데에서 가장 빠르고 양 끝에서 천천히 붙는 3차 곡선 */
const easeIO = (m) => (m < 0.5 ? 4 * m * m * m : 1 - Math.pow(-2 * m + 2, 3) / 2);
/* 시간 기준 지수 감쇠 — 스크롤이 끊겨도 값이 부드럽게 따라붙는다 */
const chase = (cur, goal, dt, rate) => cur + (goal - cur) * (1 - Math.exp(-dt * rate));   // 패널 한 칸 = 1.5 화면 높이, 뒤쪽 절반이 이동 구간

function heroStage(sec, ch) {
  const dir = ch.assets.dir.replace(/\/$/, '') + '/';
  const st = ch.assets.stage;
  const idx = Object.fromEntries(ch.blocks.map((b, i) => [b.id, i]));
  const blk = (id) => ch.blocks[idx[id]];
  const full = st.full;
  const panels = full ? [{ layout: 'full', block: full.block, side: full.side, fit: full.fit, ar: full.ar, steps: full.steps }, ...(st.panels || [])] : (st.panels || []);
  const N = panels.length;
  const W = panels.map((p) => p.span || 1);                  // 칸 길이 — 기본 1, 가로 갤러리처럼 오래 머무는 칸은 더 길다
  const B = W.map((_, k) => W.slice(0, k).reduce((a, b) => a + b, 0));
  const total = N ? 2 + (B[N - 1] + W[N - 1] - 1) * HX.span + HX.tail : 1.6;   // 래퍼 높이 (화면 높이 단위). 패널이 없으면 무대만 잠깐 붙든다

  const media = (p) => {
    if (p.layout === 'video') {
      return `<figure class="hx-media hx-video is-video" data-yt="${p.youtube}" data-cap=""><div class="hero-video"></div></figure>`;
    }
    const cls = p.layout === 'sheets' ? 'hx-sheets' : `hx-${p.layout}`;
    return `<figure class="hx-media ${cls}">${(p.images || []).map((s) =>
      `<img src="${dir + s}" alt="" decoding="async" loading="lazy">`).join('')}</figure>`;
  };
// 언어별 문자열 — 문자열이면 그대로, {en, ko, ja} 면 지금 언어
const tr = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? (v[lang] ?? v.en ?? '') : (v ?? ''));
const capHTML = (c, cls = '') => {
  if (!c) return '';
  const a = Array.isArray(c) ? c : [c];
  return `<figcaption class="hx-cap${cls}"><b>${esc(tr(a[0]))}</b>${a[1] ? `<span>${esc(tr(a[1]))}</span>` : ''}</figcaption>`;
};
const stepsHTML = (steps, big) => (steps ? `<ol class="hx-steps${big ? ' hx-steps--big' : ''}" style="--cnt:${steps.length}">${steps.map(([a, b], n) =>
  `<li style="--n:${n}"><b>${esc(tr(a))}</b><span>${esc(tr(b))}</span></li>`).join('')}</ol>` : '');
// 본문에서 첫 인용구를 뽑아 크게 — “…” / "…" / 「…」
const pullHTML = (text) => {
  const m = String(text).match(/[“"「]([^”"」]+)[”"」]/);
  return m ? `<blockquote class="hx-pull">${esc(m[1].replace(/[.。]$/, ''))}</blockquote>` : '';
};
const vars = (o) => Object.entries(o).filter(([, x]) => x != null && x !== '').map(([a, x]) => `--${a}:${x}`).join(';');
// 펼침 패널 — 그림 상자(정해진 비율, 안의 이미지는 전부 % 좌표) + 글 칼럼
const spreadHTML = (p, k, i) => {
  const b = p.box;
  const pc = (v) => (v == null ? null : `${v}%`);
  const items = b.items.map((it, n) => `<figure class="hx-it k-${it.kind || 'print'}${it.cc ? ' cap-c' : ''}" style="${vars({
    x: pc(it.x), y: pc(it.y), w: pc(it.w), iar: it.ar, rot: it.r || 0, n, mx: pc(it.mx), my: pc(it.my), mw: pc(it.mw) })}">${capHTML(it.cap)}`
    + `<img src="${dir + it.src}" alt="" decoding="async" loading="lazy"></figure>`).join('');
  const notes = (b.notes || []).map((c, n) => `<div class="hx-note hx-note--${c.side}" style="${vars({ bx: pc(c.x), by: pc(c.y), n })}">`
    + `<span>${esc(tr(c.t))}</span><i></i><b></b></div>`).join('');
  const d = b.dim;
  const dim = d ? `<div class="hx-dimline" style="${vars({ x0: pc(d.x0), x1: pc(d.x1), y: pc(d.y), mx0: pc(d.mx0), mx1: pc(d.mx1) })}"><i></i><span>${esc(tr(d.t))}</span></div>` : '';
  const extra = [
    p.mono ? `<div class="hx-mono">${p.mono.map(([a, c], n) => `<span style="--n:${n}"><b>${esc(a)}</b><em>${esc(c)}</em></span>`).join('')}</div>` : '',
    p.kicker ? `<p class="hx-kicker">${esc(tr(p.kicker))}</p>` : '',
    stepsHTML(p.steps, p.stepsBig),
    p.pull ? pullHTML(blk(p.block).b) : '',
    p.inset ? `<figure class="hx-inset">${capHTML(p.inset.cap)}<img src="${dir + p.inset.src}" alt="" decoding="async" loading="lazy" style="aspect-ratio:${p.inset.ar}"></figure>` : '',
  ].join('');
  const cls = `hx-panel hx-spread${p.tone === 'dark' ? ' hx-dark' : ''}${p.side === 'r' ? ' side-r' : ''}${p.big ? ' hx-bigtext' : ''}`;
  return `<section class="${cls}" data-k="${k}" data-enter="${p.enter || 'slide'}" style="${vars({ fw: p.fw, tw: p.tw, mfh: p.mfh })}">`
    + `<div class="hx-fig"><div class="hx-box${b.items.length > 1 ? ' is-multi' : ''}" style="${vars({ ar: b.ar, mar: b.mar, lw: b.lw })}">${items}${notes}${dim}</div></div>`
    + `<div class="hx-text"><div class="hx-tin">${extra}${blockHTML(blk(p.block), i, false)}</div></div></section>`;
};
  const panelHTML = (p, k) => {
    const i = idx[p.block];
if (p.layout === 'spread') return spreadHTML(p, k, i);
if (p.layout === 'photohalf') {
  // 왼쪽 반을 사진으로 꽉 채우고 글은 오른쪽. 사진 판은 왼쪽으로 더 뻗어 있어 찢긴 세로 경계가 들어와도 판의 곧은 모서리가 드러나지 않는다
  return `<section class="hx-panel hx-photohalf${p.side === 'r' ? ' side-r' : ''}${p.tone === 'dark' ? ' hx-dark' : ''}${p.fit ? ' hx-phfit' : ''}" data-k="${k}" data-enter="${p.enter || 'slide'}">`
    + `<div class="hx-ph"><img src="${dir + p.image}" alt="" decoding="async" loading="lazy"></div>`
    + `<div class="hx-text">${(p.blocks || [p.block]).map((id) => blockHTML(blk(id), idx[id], false)).join('')}</div>`
    + (p.audio ? `<div class="hx-aud" data-yt="${p.audio.youtube}" data-start="${p.audio.start || 0}" aria-hidden="true"><div class="hx-vwrap"></div></div>` : '')   // 소리만 — 보이지 않는 플레이어
    + '</section>';
}
if (p.layout === 'gallery') {
  // 긴 가로 띠에 이미지와 글 조각을 흩어 놓고, 머무는 동안 띠가 왼쪽으로 흐른다. 화면 가운데에 온 것이 커지고 나머지는 작고 살짝 어둡다
  const ps = String(blk(p.block).b).split('\n\n');
  // 글 조각 — texts: [{p: 문단 번호, drop: 앞에서 뺄 문장 수}]. 16.25 같은 소수점에서는 문장을 끊지 않는다
  const dropFirst = (q, n) => { let r = q; for (let j = 0; j < n; j++) { const mm = r.match(/^(.+?(?:。|\.(?=\s|$)))\s*([\s\S]*)$/); if (!mm) break; r = mm[2]; } return r; };
  const chunks = (p.texts || ps.map((_, j) => ({ p: j }))).map((c) => dropFirst(ps[c.p] || '', c.drop || 0));
  const items = p.items.map((it) => (it.src
    ? `<figure class="gl-it gl-img${it.b != null ? ' gl-b' : ''}" style="--x:${it.x}svh;--y:${it.y ?? 0}svh;--b:${it.b ?? 0}svh;--h:${it.h}svh;--ar:${it.ar}"><img src="${dir + it.src}" alt="" decoding="async" loading="lazy"></figure>`
    : `<div class="gl-it gl-txt${it.big ? ' gl-big' : ''}${it.b != null ? ' gl-b' : ''}" style="--x:${it.x}svh;--y:${it.y ?? 0}svh;--b:${it.b ?? 0}svh;--w:${it.w}svh"><article class="block" data-i="${i}">${para(chunks[it.t] || '')}</article></div>`)).join('');
  // pass: 옆으로 누운 기타가 화면 가운데를 가로질러 지나가고, 지나간 자리에 조각들이 차례로 생긴다
  const pass = p.pass ? `<img class="gl-pass" src="${dir + p.pass}" alt="" decoding="async">` : '';
  return `<section class="hx-panel hx-gallery${p.pass ? ' has-pass' : ''}" data-k="${k}" data-enter="${p.enter || 'slide'}" data-gw="${p.width}"><div class="gl-track" style="--tw:${p.width}svh">${items}</div>${pass}</section>`;
}
if (p.layout === 'riseimg') {
  // 패널이 밀려 들어온 뒤 누끼가 아래에서 솟아 왼쪽 반을 채운다. 글은 오른쪽
  return `<section class="hx-panel hx-riseimg" data-k="${k}" data-enter="${p.enter || 'slide'}" style="--lh:${p.h || '115svh'};--lt:${p.top || '-22svh'}">`
    + `<img class="hx-rise${p.anchor === 'edge' ? ' hx-rise--edge' : ''}${p.from === 'top' ? ' hx-rise--top' : ''}" src="${dir + p.image}" alt="" decoding="async" loading="lazy">`
    + `<div class="hx-text">${blockHTML(blk(p.block), i, false)}</div></section>`;
}
if (p.layout === 'collage') {
  // 들쭉날쭉한 크기와 높이로 흩어 놓고 작은 캡션을 다는 구성 — 글은 한쪽에 따로 선다
  const th = p.then || {};
  const thenStyle = [th.h && `--th:${th.h}`, th.top && `--tt:${th.top}`, th.w && `--tw:${th.w}`].filter(Boolean).join(';');
  const items = (p.items || []).map((it, n) =>
    `<figure class="hx-item" style="--x:${it.x};--y:${it.y};--h:${it.h};--r:${it.r || 0};--n:${n}">`
    + `${it.cap ? `<figcaption>${esc(it.cap)}</figcaption>` : ''}<img src="${dir + it.src}" alt="" decoding="async" loading="lazy"></figure>`).join('');
  const then = p.then ? `<img class="hx-then" src="${dir + p.then.image}" alt="" decoding="async" loading="lazy"${thenStyle ? ` style="${thenStyle}"` : ''}>` : '';
  const tx = p.text || {};
  return `<section class="hx-panel hx-collage" data-k="${k}" data-enter="${p.enter || 'slide'}"${p.then ? ' data-then="1"' : ''}>${items}${then}`
    + `<div class="hx-text" style="--tx:${tx.x || '60vw'};--ty:${tx.y || '17svh'};--tw:${tx.w || '32vw'}">${blockHTML(blk(p.block), i, false)}</div></section>`;
}
if (p.layout === 'videofull') {
      return `<section class="hx-panel hx-vfull${p.fit === 'top' ? ' hx-vfull--top' : ''}" data-k="${k}" data-enter="${p.enter || 'slide'}" data-yt="${p.youtube}"${p.start ? ` data-start="${p.start}"` : ''}>`
        + '<div class="hx-vwrap"></div><div class="hx-vclick" role="button" aria-label="Play / pause"></div><i class="hx-vpause" aria-hidden="true"></i></section>';
    }
    if (p.layout === 'fullphoto') {
      return `<section class="hx-panel hx-full hx-fullphoto" data-k="${k}" data-enter="${p.enter || 'slide'}">`
        + `<img class="hx-fullimg" src="${dir + p.images[0]}" alt="" decoding="async" loading="lazy"><div class="hx-dim"></div>`
        + `<div class="hx-text">${blockHTML(blk(p.block), i, false)}</div></section>`;
    }
    if (p.layout === 'full') {
      if (p.fit) {
        return `<section class="hx-panel hx-full hx-full--fit${p.side === 'r' ? ' hx-full--r' : ''}" data-k="${k}" style="--ar:${p.ar}">`
          + `<div class="hx-text"><div class="hx-tin">${stepsHTML(p.steps)}${blockHTML(blk(p.block), i, false)}</div></div></section>`;
      }
      return `<section class="hx-panel hx-full${p.side === 'r' ? ' hx-full--r' : ''}" data-k="${k}"><div class="hx-text">${blockHTML(blk(p.block), i, false)}</div></section>`;
    }
    const th = p.then || {};
    const thenStyle = [th.h && `--th:${th.h}`, th.top && `--tt:${th.top}`, th.w && `--tw:${th.w}`].filter(Boolean).join(';');
    const then = p.then ? `<img class="hx-then" src="${dir + p.then.image}" alt="" decoding="async" loading="lazy"${thenStyle ? ` style="${thenStyle}"` : ''}>` : '';
    return `<section class="hx-panel hx-${p.layout}${p.side === 'r' ? ' side-r' : ''}${p.bleed ? ' hx-bleed' : ''}${p.diag ? ' hx-diag' : ''}" data-k="${k}" data-enter="${p.enter || 'slide'}"${p.then ? ' data-then="1"' : ''}>${media(p)}${then}`
      + `<div class="hx-text">${blockHTML(blk(p.block), i, false)}</div></section>`;
  };
  // 스냅 — 각 패널이 제자리에 있는 구간의 가운데
  const EDGE = ['tear', 'tear-down', 'seam', 'seamx'];                   // 경계를 보여 주는 전환 — 중간에 멈춰서 볼 수 있어야 한다
  const snaps = panels.flatMap((p, k) => (p.then ? [HX.dwell, 0.36] : [HX.dwell]).map((d) =>
    `<i class="hx-snap"${d === HX.dwell && EDGE.includes(p.enter) ? ' data-free="1"' : ''} style="top:${((1 + (B[k] + d) * HX.span + 0.5) * 100).toFixed(2)}svh"></i>`)).join('');

  sec.classList.add('has-stage', 'has-hx');
  sec.dataset.hxn = String(N);
  sec.dataset.hxw = W.join(',');
  sec.innerHTML = head(ch) + `
    <div class="hero-wrap" style="--hx-total:${total.toFixed(2)};--n:${N}">
      <div class="hero-pin">
        <div class="hero-layers" data-stage="1"></div>
        <div class="hx"><div class="hx-track">${panels.map(panelHTML).join('')}</div><canvas class="hx-tear" hidden></canvas></div>
        ${N && panels[N - 1].exit === 'dark' ? '<div class="hx-enddark" aria-hidden="true"></div>' : ''}
      </div>
      <div class="hero-steps"><section class="hero-step">${blockHTML(ch.blocks[0], 0, false)}</section></div>
      ${snaps}
    </div>`;

  sec.querySelectorAll('.hx-vfull').forEach((pn) => {
    $('.hx-vclick', pn).addEventListener('click', () => {
      const v = pn._v;
      if (!v || !v.fr) return;
      v.paused = !v.paused;
      v.fr.contentWindow.postMessage(JSON.stringify({ event: 'command', func: v.paused ? 'pauseVideo' : 'playVideo', args: [] }), '*');
      pn.classList.toggle('is-paused', v.paused);
    });
  });

  const box = $('.hero-layers', sec);
  if (st.whole) box.classList.add('stage--whole');
  if (full) {
    // 전면 사진 — 위쪽 크림 종이가 찢긴 경계로 열리며 드러난다
    const F = document.createElement('div');
    F.className = 'stage-full';
    F.hidden = true;
    if (full.fit) {                     // 사진을 꽉 채우지 않고 온전한 한 장으로 — 어두운 바탕 위에 놓는다
      F.classList.add('stage-full--fit');
      if (full.side !== 'r') F.classList.add('stage-full--photo-r');   // 글이 왼쪽이면 사진은 오른쪽
      F.style.setProperty('--ar', full.ar);
    }
    F.innerHTML = `<img class="stage-full-img" alt="" decoding="async" src="${dir + full.src}">`
      + (full.fit ? capHTML(full.cap, ' stage-full-cap') : '')
      + '<div class="stage-full-dim"></div><canvas class="stage-tear"></canvas>';
    box.appendChild(F);
  }
  // 반쪽 기타 — 오른쪽 가장자리에 중심축을 걸어 왼쪽 반만 크게 보이고, 위에서 내려온다 (모서리 이미지 대신)
  if (st.half) {
    const hf = new Image();
    hf.className = 'stage-img stage-half';
    hf.alt = '';
    hf.decoding = 'async';
    hf.src = dir + st.half.src;
    hf.style.setProperty('--sh', st.half.h);
    hf.style.setProperty('--cx', st.half.cx);
    hf.style.setProperty('--st', st.half.top);
    box.appendChild(hf);
  }
  // 모서리 이미지
  [['tl', 'stage-tl'], ['br', 'stage-br']].forEach(([k, cls]) => {
    if (!st[k]) return;
    const im = new Image();
    im.className = `stage-img ${cls}`;
    im.alt = '';
    im.decoding = 'async';
    im.src = dir + st[k];
    if (st.sizes && st.sizes[k]) im.style.setProperty('--sh', st.sizes[k]);
    if (st.offsets && st.offsets[k]) im.style.setProperty('--so', st.offsets[k]);
    box.appendChild(im);
  });

  sec.querySelectorAll('.hero-step .block, .hx-full .block').forEach((b) => {
    b.classList.add('fade');
    b.style.setProperty('--r', '0');
  });
}

/* 앞 챕터 연도에서 이 챕터 연도로 굴러가는 슬롯 — 바뀌는 자리만 릴이 되고, 한 바퀴 더 돈 뒤 멈춘다 */
function yearReel(ch) {
  const i = data.chapters.indexOf(ch);
  const prev = i > 0 ? String(data.chapters[i - 1].year) : '';
  const cur = String(ch.year);
  if (prev.length !== cur.length) return cur;
  return [...cur].map((d, k) => {
    const a = +prev[k];
    const b = +d;
    if (a === b) return `<span class="yr-d">${d}</span>`;
    const seq = [];
    for (let v = a, n = 0; n < 10 || v !== b; n++, v = (v + 1) % 10) seq.push(v);
    seq.push(b);
    return `<span class="yr-reel" style="--n:${seq.length - 1}"><span class="yr-strip">${seq.map((v) => `<i>${v}</i>`).join('')}</span></span>`;
  }).join('');
}

function head(ch) {
  const a = ch.assets || {};
  const half = !!(a.entry && a.entry.mode === 'half');
  const darkIn = half && a.entry.dark === 'in';                 // 앞 화면이 검정 — 경계 없이 검정으로 이어진다          // 반쪽 기타 들머리: 오른쪽에 크게, 위에서 내려온다
  // 들머리 — 좌측에서 헤드가 솟아 들어오고, 타이틀은 그 위에 얹힌다
  const entry = a.entry && a.dir
    ? `<div class="ch-entry${half ? ' ch-entry--half' : ''}" aria-hidden="true"><img src="${
        a.dir.replace(/\/$/, '')}/${a.entry.src}" alt="" decoding="async" loading="lazy"></div>`
    : '';
  // 반쪽 들머리의 치수는 머리글에 둔다 — 제목·연도가 바디 가장자리를 기준으로 자리를 잡는다. tg: 바디와 제목 사이 틈, yx·yy: 연도를 챕터마다 옮기는 값
  const ev = half ? Object.entries({ eh: a.entry.h, ecx: a.entry.cx, et: a.entry.top, tg: a.entry.tg, yx: a.entry.yx, yy: a.entry.yy })
    .filter(([, x]) => x != null && x !== '').map(([k, x]) => `;--${k}:${x}`).join('') : '';
  return `
    ${entry ? '' : `<div class="ch-bgyear" aria-hidden="true">${ch.year}</div>`}
    <header class="ch-head${entry ? ' has-entry' : ''}${half ? ' has-entry--half' : ''}${darkIn ? ' has-entry--darkin' : ''}${half && a.entry.side === 'l' ? ' has-entry--left' : ''}"${entry ? ` style="--p:0${ev}"` : ''}>${half ? '<div class="ch-dark" aria-hidden="true" hidden></div><canvas class="ch-tear" aria-hidden="true" hidden></canvas>' : ''}${entry}
      <div class="ch-title">
        ${entry ? `<div class="ch-bgyear ch-bgyear--in" aria-hidden="true">${half ? yearReel(ch) : ch.year}</div>` : ''}
        <h2><span class="ch-brand">${esc(ch.brand)}</span> ${esc(ch.model)}${ch.nickname ? `<span class="ch-nick">“${esc(ch.nickname)}”</span>` : ''}</h2>
        <p class="ch-meta"><span>${ch.year}</span><span>${esc(ch.maker)}</span><span class="cat">${esc(ch.category)}</span></p>
      </div>
    </header>`;
}

/* --- 아키타입 렌더러 --- */
const RENDER = {
hero(sec, ch) {
  if (ch.assets && ch.assets.stage && ch.assets.stage.panels) return heroStage(sec, ch);
  const dir = ch.assets ? ch.assets.dir.replace(/\/$/, '') + '/' : null;
  sec.innerHTML = head(ch) + `
    <div class="hero-wrap">
      <div class="hero-pin">
        <div class="hero-layers"></div>
        <div class="hero-scrim"></div>
        <p class="hero-cap"></p>
      </div>
      <div class="hero-steps">
        ${ch.blocks.map((b, i) => `<section class="hero-step">${blockHTML(b, i)}</section>`).join('')}
      </div>
    </div>`;

  const box = $('.hero-layers', sec);

  // 기본 레이어: 누끼 딴 본체. 블록에 전용 미디어가 없으면 이게 보인다
  const base = document.createElement('figure');
  const baseMotion = (ch.assets && ch.assets.motion) || 'rise';
  base.className = 'hero-layer is-base';
  base.dataset.motion = baseMotion;
  base.dataset.i = '-1';
  base.style.setProperty('--r', '0');
  if (dir && ch.assets.cutout) {
    const im = new Image();
    im.alt = `${ch.model}`;
    im.className = 'hero-img hero-img--cut';
    im.decoding = 'async';
    im.loading = 'lazy';          // 41챕터 누끼가 한꺼번에 뜨지 않게
    const src = dir + ch.assets.cutout;
    if (ch.assets.cutoutKey === 'edge') {
      const opt = {};
      if (ch.assets.cutoutLocal)  opt.local  = ch.assets.cutoutLocal;
      if (ch.assets.cutoutGlobal) opt.global = ch.assets.cutoutGlobal;
      cutout(src, opt).then((u) => { im.src = u; }).catch(() => { im.src = src; });
    } else { im.src = src; }
    base.appendChild(im);
  } else {
    base.appendChild(silWrap(ch, ch.blocks[0].media.kind));
  }
  box.appendChild(base);

  // 블록 전용 미디어 레이어
  ch.blocks.forEach((b, i) => {
    const m = b.media || {};
    if (!m.src && !m.youtube) return;
    const L = document.createElement('figure');
    const motion = m.motion || 'push';
    L.className = 'hero-layer';
    L.dataset.motion = motion;
    L.dataset.i = String(i);
    L.dataset.cap = m.caption || '';
    L.style.setProperty('--r', '0');
    if (m.youtube) {
      L.classList.add('is-video');
      L.dataset.yt = m.youtube;
      L.innerHTML = '<div class="hero-video"></div>';
    } else {
      const im = new Image();
      im.alt = m.caption || ch.model;
      im.className = 'hero-img';
      im.loading = 'lazy';
      im.decoding = 'async';
      im.src = dir + m.src;
      L.appendChild(im);
    }
    box.appendChild(L);
  });

  sec.querySelectorAll('.hero-step .block').forEach((b) => {
    b.classList.add('fade');
    b.style.setProperty('--r', '0');
  });
},

model3d(sec, ch) {
  // 3D 챕터 — 화면에 고정된 장면에서 카메라가 부품마다 다가간다. 글은 칸마다 한쪽에 선다
  const a = ch.assets;
  const M = a.model3d;
  const idx = Object.fromEntries(ch.blocks.map((b, i) => [b.id, i]));
  const shots = M.shots;
  const W = shots.map((s) => s.span || 1.4);
  const B = W.map((_, k) => W.slice(0, k).reduce((x, y) => x + y, 0));
  const total = B[B.length - 1] + W[W.length - 1] + M3.tail + 1;        // 화면 높이 단위 — 마지막 칸 뒤 어두워지는 꼬리 + 핀 한 화면
  const steps = shots.map((s, k) => {
    if (!s.block) return '';
    const i = idx[s.block];
    const b = ch.blocks[i];
    const body = s.p ? { ...b, b: String(b.b).split('\n\n').filter((_, n) => s.p.includes(n)).join('\n\n') } : b;   // 한 블록을 문단으로 나눠 여러 칸에
    return `<div class="m3-t side-${s.side || 'l'}${s.textY === 'b' ? ' pos-b' : ''}" data-k="${k}"><div class="m3-tin">${blockHTML(body, i, false)}</div></div>`;
  }).join('');
  const imgs = shots.map((s, k) => (s.image
    ? `<figure class="m3-img side-${s.side === 'r' ? 'l' : 'r'}${s.fit ? ' is-fit' : ''}" data-k="${k}"><img src="${a.dir.replace(/\/$/, '')}/${s.image}" alt="" decoding="async" loading="lazy"></figure>` : '')).join('');   // fit: 문서·인쇄물은 자르지 않고 온전히
  // 전면 영상 칸 — ES-150 영상과 같은 방식(UI 없음, 시작 지점, 자막 끔, 소리는 서서히)
  const vids = shots.map((s, k) => (s.video
    ? `<section class="m3-video hx-vfull" data-k="${k}" data-yt="${s.video.youtube}" data-start="${s.video.start || 0}">`
      + '<div class="hx-vwrap"></div><div class="hx-vclick" role="button" aria-label="Play / pause"></div><i class="hx-vpause" aria-hidden="true"></i></section>' : '')).join('');
  // 스냅 — 글이 있는 칸·영상 칸의 머무름 앞쪽에만. 글 없는 칸(회전·훑기)은 스크롤하는 만큼 흘러간다.
  // 첫 칸(도착)은 위에서 다가올 때만 반쪽 들머리처럼 조금 굴려도 끝까지 넘어간다
  const snaps = shots.map((s, k) => (k === 0 || s.block || s.video || s.snap
    ? `<i class="hx-snap"${k === 0 ? ' data-arrive="1"' : ''} style="top:${(((k === 0 ? 0 : B[k] + M3.dwell) + 0.5) * 100).toFixed(2)}svh"></i>` : '')).join('');
  sec.classList.add('has-m3');
  sec.innerHTML = `
    <div class="m3-wrap" style="height:${(total * 100).toFixed(2)}svh">
      <div class="m3-pin">
        <div class="m3-glow" aria-hidden="true"></div>
        <div class="m3-gl" aria-hidden="true"></div>
        <div class="m3-scrim l" aria-hidden="true"></div><div class="m3-scrim r" aria-hidden="true"></div>
        <div class="m3-year" aria-hidden="true">${yearReel(ch)}</div>
        <header class="m3-title">
          <h2><span class="ch-brand">${esc(ch.brand)}</span> ${esc(ch.model)}</h2>
          <p class="ch-meta"><span>${ch.year}</span><span>${esc(ch.maker)}</span><span class="cat">${esc(ch.category)}</span></p>
        </header>
        ${imgs}
        ${steps}
        ${vids}
        <div class="m3-load" hidden><i></i><span></span></div>
        ${M.credit ? `<p class="m3-credit">${esc(typeof M.credit === 'object' ? (M.credit[lang] ?? M.credit.en) : M.credit)}</p>` : ''}
      </div>
      ${snaps}
    </div>`;
  sec._m3 = { shots, W, B };
  sec.querySelectorAll('.m3-video').forEach((pn) => {
    $('.hx-vclick', pn).addEventListener('click', () => {
      const v = pn._v;
      if (!v || !v.fr) return;
      v.paused = !v.paused;
      v.fr.contentWindow.postMessage(JSON.stringify({ event: 'command', func: v.paused ? 'pauseVideo' : 'playVideo', args: [] }), '*');
      pn.classList.toggle('is-paused', v.paused);
    });
  });
  m3Prepare(sec, { ...M, dir: a.dir.replace(/\/$/, '') });
},

  sidearm(sec, ch) {
    sec.innerHTML = head(ch) + `
      <div class="ch-body">
        <div class="ch-text">${ch.blocks.map((b, i) => blockHTML(b, i)).join('')}</div>
        <div class="side-stage"><div class="side-rule"></div><div class="side-sil"></div></div>
      </div>`;
    $('.side-sil', sec).appendChild(silWrap(ch, ch.blocks[0].media.kind, -90));
  },

  contour(sec, ch) {
    sec.innerHTML = head(ch) + `
      <div class="ch-body">
        <div class="ch-text">
          <div class="contour-float"></div>
          ${ch.blocks.map((b, i) => blockHTML(b, i)).join('')}
          <div class="contour-end"></div>
        </div>
      </div>`;
    const f = $('.contour-float', sec);
    // 본문이 외곽선을 따라 흐르게 한다
    const poly = `polygon(${shapeOf(ch.sil)})`;
    f.style.shapeOutside = poly;
    f.style.webkitShapeOutside = poly;
    f.appendChild(silWrap(ch, ch.blocks[0].media.kind));
  },

  plate(sec, ch) {
    sec.innerHTML = head(ch) + `
      <div class="ch-body">
        <div class="plate-stage plate">
          <div class="plate-frame">
            <span class="plate-tag">${esc(ch.maker)} · ${ch.year}</span>
            <span class="plate-tick" style="left:14px;top:12px">PL. ${ch.num}</span>
            <span class="plate-tick" style="right:14px;bottom:12px">FIG. 1</span>
          </div>
        </div>
        <div class="ch-text">${ch.blocks.map((b, i) => blockHTML(b, i)).join('')}</div>
      </div>`;
    $('.plate-frame', sec).appendChild(silWrap(ch, ch.blocks[0].media.kind));
  },

  quiet(sec, ch) {
    sec.innerHTML = head(ch) + `
      <div class="ch-body">
        <div class="ch-text">${ch.blocks.map((b, i) => blockHTML(b, i)).join('')}</div>
        <div class="quiet-stage"></div>
      </div>`;
    $('.quiet-stage', sec).appendChild(silWrap(ch, ch.blocks[0].media.kind));
  },
};

let eraEl = null;
let prevEra = null;
let prevTone = null;
let lastCh = null;
const endsDark = (c) => { const lp = c?.assets?.stage?.panels; return !!(lp && lp.length && lp[lp.length - 1].exit === 'dark'); };

data.chapters.forEach((ch) => {
  const era = data.eras.find((e) => e.id === ch.era);
  const tone = ch.assets?.tone || era.tone;          // 챕터가 바탕을 따로 정하면(assets.tone) 같은 시대 안에서도 바탕 구역을 새로 연다

  if (ch.era !== prevEra || tone !== prevTone) {
    if (prevEra && ch.era !== prevEra) {
      const seam = document.createElement('div');
      seam.className = 'seam';
      seam.dataset.to = tone;
      seam.dataset.from = endsDark(lastCh) ? 'dark' : prevTone;   // 앞 챕터가 검게 덮이며 끝나면 경계 띠도 검정 그대로
      seam.innerHTML = '<div class="seam-fill"></div>';
      frag.appendChild(seam);
    }
    eraEl = document.createElement('section');
    eraEl.className = `era era--${tone}${ch.era === prevEra ? ' era--cont' : ''}`;   // 같은 시대 안에서 바탕만 바뀌면 경계 띠 없이 바로 잇는다
    eraEl.dataset.era = era.id;
    eraEl.dataset.tone = tone;
    eraEl.style.setProperty('--accent', era.accent);
    frag.appendChild(eraEl);
    prevEra = ch.era;
    prevTone = tone;
  }

  const sec = document.createElement('section');
  sec.className = `chapter chapter--${ch.archetype}`;
  sec.id = `ch-${ch.id}`;
  sec.dataset.order = ch.order;
  sec.dataset.archetype = ch.archetype;
  sec.dataset.year = ch.year;
  (RENDER[ch.archetype] || RENDER.quiet)(sec, ch);
  eraEl.appendChild(sec);

  lastCh = ch;
  const li = document.createElement('li');
  li.innerHTML = `<button type="button" data-target="ch-${ch.id}"><span class="nm">${esc(ch.model)}</span><span class="yr">${ch.year}</span></button>`;
  railList.appendChild(li);
});

// 마지막 시대 → 콜로폰도 같은 경계 처리로 닫는다
const endSeam = document.createElement('div');
endSeam.className = 'seam';
endSeam.dataset.to = 'dark';
endSeam.dataset.from = endsDark(lastCh) ? 'dark' : prevTone;
endSeam.innerHTML = '<div class="seam-fill"></div>';
frag.appendChild(endSeam);

tl.appendChild(frag);
tl.removeAttribute('aria-busy');
document.body.classList.remove('is-loading');

$('[data-stat="chapters"]').textContent = data.stats.chapters;
$('[data-stat="years"]').textContent = `${data.stats.years[0]}–${data.stats.years[1]}`;

railList.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  const sec = b && document.getElementById(b.dataset.target);
  if (!sec) return;
  // 지나가는 챕터의 들머리는 건너뛴다 — 굴러가지 않고 곧장 옮겨 가서, 도착한 챕터의 들머리만 처음부터 보인다
  const hd = sec.querySelector('.ch-head');
  if (hd) { hd._ts = 0; hd._pv = null; hd.dataset.yv = '0'; }
  if (sec._m3) sec._m3.ts = 0;
  unlockScroll();
  scrollTo({ top: Math.round(sec.getBoundingClientRect().top + scrollY), behavior: 'instant' });
});

/* 들머리 연출 동안 스크롤 잠금 — 연도 릴이 돌고 기타·제목이 나오는 사이에는 입력을 받지 않고 그 자리에 세워 둔다.
   잠그는 자리는 그 머리글(3D 챕터는 무대)이 화면 윗변에 닿는 스크롤 위치. 모델을 받느라 오래 걸리면 6초 뒤에 푼다 */
const LOCK_MAX = 6000;
let lockWant = null;          // 이번 프레임에 잠가 둘 스크롤 위치 (없으면 null)
let lockOn = false, lockStart = 0, lockSpent = false, lockY = 0;
function unlockScroll() { lockOn = false; lockSpent = false; document.documentElement.classList.remove('scroll-lock'); }
function updateLock(now) {
  if (lockWant != null && !lockOn && !lockSpent) { lockOn = true; lockStart = now; document.documentElement.classList.add('scroll-lock'); }
  if (lockOn) {
    if (lockWant == null || now - lockStart > LOCK_MAX) {
      lockOn = false; document.documentElement.classList.remove('scroll-lock');
      lockSpent = lockWant != null;          // 시간이 다 돼서 풀었으면 이 자리를 벗어날 때까지 다시 잠그지 않는다
    } else lockY = lockWant;
  }
  if (lockWant == null) lockSpent = false;
}
addEventListener('touchmove', (e) => { if (lockOn) e.preventDefault(); }, { passive: false });

/* ---------- 3. 스크롤 엔진 ---------- */
const chapters = [...document.querySelectorAll('.chapter')];
const seams = [...document.querySelectorAll('.seam')];
const eras = [...document.querySelectorAll('.era')];
const railItems = [...railList.children];
const bar = $('#progress span');
const nowYear = $('#nowyear');

const live = new Set();
const io = new IntersectionObserver(
  (es) => es.forEach((en) => (en.isIntersecting ? live.add(en.target) : live.delete(en.target))),
  { rootMargin: '30% 0px 30% 0px' }
);
[...chapters, ...seams].forEach((el) => io.observe(el));

const blockIO = new IntersectionObserver(
  (es) => es.forEach((en) => en.target.classList.toggle('is-near', en.isIntersecting)),
  { rootMargin: '-16% 0px -34% 0px' }
);
document.querySelectorAll('.chapter:not(.chapter--hero):not(.chapter--model3d) .block').forEach((b) => blockIO.observe(b));

// 3D 챕터 — 여섯 화면 앞에서부터 모델을 받아 두고, 멀어지면 내린다
const m3IO = new IntersectionObserver(
  (es) => es.forEach((en) => m3Near(en.target, en.isIntersecting)),
  { rootMargin: '600% 0px 600% 0px' }
);
document.querySelectorAll('.chapter--model3d').forEach((el) => m3IO.observe(el));
const m3Vids = [...document.querySelectorAll('.m3-video')];

/* 화면에 들어오면 음소거 자동재생으로 붙이고, 나가면 떼어내 자원을 돌려준다 */
const ytSrc = (id, muted) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=${muted ? 1 : 0}&loop=1&playlist=${id}`
  + `&controls=${muted ? 0 : 1}&modestbranding=1&rel=0&playsinline=1`;

function mountVideo(layer, want) {
  const host = layer.querySelector('.hero-video');
  if (!host) return;
  const has = !!host.querySelector('iframe');
  if (want && !has) {
    const id = layer.dataset.yt;
    const f = document.createElement('iframe');
    f.src = ytSrc(id, true);
    f.title = layer.dataset.cap || 'video';
    f.allow = 'autoplay; encrypted-media; picture-in-picture';
    f.setAttribute('frameborder', '0');
    f.setAttribute('allowfullscreen', '');
    host.appendChild(f);

    // 소리는 사용자가 켠다 — 브라우저는 음소거 상태에서만 자동재생을 허용한다
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'hero-sound';
    b.textContent = 'Sound on';
    b.addEventListener('click', () => {
      const on = b.classList.toggle('is-on');
      f.src = ytSrc(id, !on);
      b.textContent = on ? 'Sound off' : 'Sound on';
    });
    host.parentElement.appendChild(b);
  } else if (!want && has) {
    host.replaceChildren();
    const b = host.parentElement.querySelector('.hero-sound');
    if (b) b.remove();
  }
}

/* ---------- 전면 영상 패널 ----------
   YouTube 자체 UI 는 쓰지 않는다 — controls=0 에 iframe 을 화면보다 크게 깔아 제목줄·로고를 잘라 내고,
   클릭은 위에 덮은 투명 레이어가 받아 재생/일시정지로 바꾼다. 소리는 0 에서 천천히 올라 최대치 60% 에서 멈춘다. */
const VIDEO_VOL_MAX = 60;
let userGesture = false;
['pointerdown', 'keydown', 'touchstart'].forEach((ev) =>
  addEventListener(ev, () => { userGesture = true; }, { capture: true, passive: true }));

function videoCtl(pn, inT, leave) {
  const v = pn._v || (pn._v = { fr: null, ready: false, paused: false, t0: 0, vol: -1, unmuted: false, last: 0 });
  const want = inT > 0.04 && leave < 0.5;
  const now = performance.now();
  if (want && !v.fr) {
    const id = pn.dataset.yt;
    const fr = document.createElement('iframe');
    const st = +(pn.dataset.start || 0);                                  // 시작 지점(초) — 자막은 끈다
    fr.src = `https://www.youtube-nocookie.com/embed/${id}?enablejsapi=1&autoplay=1&mute=1&controls=0&disablekb=1&fs=0&cc_load_policy=0${st ? `&start=${st}` : ''}`
      + `&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1&loop=1&playlist=${id}&origin=${encodeURIComponent(location.origin)}`;
    fr.allow = 'autoplay; encrypted-media';
    fr.tabIndex = -1;
    fr.setAttribute('aria-hidden', 'true');
    fr.setAttribute('frameborder', '0');
    fr.addEventListener('load', () => {
      v.ready = true;
      fr.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }), '*');
    });
    pn.querySelector('.hx-vwrap').appendChild(fr);
    Object.assign(v, { fr, ready: false, paused: false, t0: now, vol: -1, unmuted: false, last: 0 });
    pn.classList.remove('is-paused');
  } else if (!want && v.fr) {
    v.fr.remove();
    v.fr = null;
  }
  if (!v.fr || !v.ready) return;

  const send = (f, args = []) => v.fr.contentWindow.postMessage(JSON.stringify({ event: 'command', func: f, args }), '*');
  if (!v.ccT || now - v.ccT > 1500) {      // 재생하는 동안 1.5초마다 자막을 다시 내린다 — 계정 설정으로 자막이 켜져도 곧 꺼진다
    v.ccT = now;
    send('unloadModule', ['captions']); send('unloadModule', ['cc']); send('setOption', ['captions', 'track', {}]);
  }
  const ramp = clamp((now - v.t0 - 500) / 3200);                          // 시작 후 0.5초 뒤부터 3초 남짓 걸려 올라간다
  const target = Math.round(VIDEO_VOL_MAX * ramp * ramp * (3 - 2 * ramp) * (1 - clamp(leave * 2)));
  const canSound = userGesture || (navigator.userActivation && navigator.userActivation.hasBeenActive);
  if (canSound && target > 0 && (target !== v.vol || now - v.last > 600)) {
    send('setVolume', [target]);                                            // 소리를 켜기 전에 먼저 낮은 값으로 맞춘다
    if (!v.unmuted || now - v.last > 600) { send('unMute'); v.unmuted = true; }
    v.vol = target; v.last = now;
  }
}

/* 가로 무대 구동 — s 는 핀이 화면에 닿은 뒤 스크롤한 거리 */
function stageFrame(el, h) {
  const wr = el.querySelector('.hero-wrap').getBoundingClientRect();
  const sT = -wr.top;
  const nowS = performance.now();
  const dtS = Math.min(0.05, (nowS - (el._st || nowS)) / 1000);
  el._st = nowS;
  if (el._ss == null) el._ss = sT;
  el._ss = chase(el._ss, sT, dtS, 9);                      // 모든 전환이 이 값을 따라 움직인다
  if (Math.abs(sT - el._ss) < 0.4) el._ss = sT;
  const s = el._ss;
  const pin = el.querySelector('.hero-pin');
  // 옆에 대기 중인 패널은 화면 밖이라 lazy 이미지가 늦게 뜬다 — 챕터가 가까워지면 한꺼번에 받아 둔다
  if (!el._eager) { el._eager = 1; el.querySelectorAll('img[loading="lazy"]').forEach((im) => { im.loading = 'eager'; }); }
  const L = el.querySelector('.hero-layers');
  const N = +el.dataset.hxn;
  const S = h * HX.span;

  // 패널 이동 — 칸의 앞쪽 절반은 머물고, 뒤쪽 절반에서 한 칸 밀린다
  let x = 0;
  const u = (s - h) / S;
  if (!el._W) { el._W = (el.dataset.hxw || '').split(',').map(Number); el._B = el._W.map((_, k) => el._W.slice(0, k).reduce((a, b) => a + b, 0)); }
  const Bk = (k) => (el._B[k] ?? k);
  if (u > 0) {
    let i = 0;
    while (i < N - 1 && u >= Bk(i) + (el._W[i] || 1)) i++;
    const dwellLen = (el._W[i] || 1) - (1 - HX.slideFrom);
    const m = clamp((u - Bk(i) - dwellLen) / (1 - HX.slideFrom));
    x = i + easeIO(m);
  }
  x = Math.min(x, N - 1);

let seg = 0, t = 0;
if (N > 0) {
// 패널 배치 — 겹쳐 놓고 칸마다 이행 방식을 따른다.
//   slide: 옆으로 민다 / wheel: 오른쪽 가운데를 축으로 시계 방향으로 돌아 나가고, 다음 패널이 아래에서 돌아 들어온다
const panels = el._hxp || (el._hxp = [...el.querySelectorAll('.hx-panel')]);
seg = Math.min(N - 2, Math.floor(x));
t = x - seg;
const firstSeam = !!(panels[1] && panels[1].dataset.enter === 'seam');     // 첫 칸이 경계선을 달고 그대로 밑으로 스크롤되는 방식
const firstSeamX = !!(panels[1] && panels[1].dataset.enter === 'seamx');
pin.style.setProperty('--hx', (firstSeam || firstSeamX ? 0 : Math.min(x, 1)).toFixed(4));   // 전면 사진 레이어는 첫 칸에서만 민다
pin.style.setProperty('--hy', '0');
const nextEnter = seg + 1 < N ? panels[seg + 1].dataset.enter : '';
const tearDown = nextEnter === 'tear-down';                  // 다음 패널이 위에서 내려오며 경계가 위→아래로 간다
const tearOn = (nextEnter === 'tear' || tearDown) && t > 0.001 && t < 0.999;
const seamOn = nextEnter === 'seam' && t > 0.001 && t < 0.999;
const seamxOn = nextEnter === 'seamx' && t > 0.001 && t < 0.999;
const tc = el.querySelector('.hx-tear');
let poly = '';
if (seamxOn) {
  if (!tc._tearR) tc._tearR = makeTear(tc, 'right');
  if (tc.hidden) tc.hidden = false;
  poly = tc._tearR.draw(-h * 4, tc.clientWidth * (1 - t), performance.now());     // 경계가 들어오는 패널의 왼쪽 변을 따라 왼쪽으로 온다
} else if (seamOn) {
  if (!tc._tearB) tc._tearB = makeTear(tc, 'bottom');
  if (tc.hidden) tc.hidden = false;
  poly = tc._tearB.draw(-h * 4, h * (1 - t), performance.now());          // 경계가 들어오는 패널의 윗변을 따라 올라온다
} else if (tearOn) {
  if (!tc._tear) tc._tear = makeTear(tc, true);
  if (tc.hidden) tc.hidden = false;
  poly = tc._tear.draw(h * (tearDown ? -0.08 + t * 1.16 : 1.08 - t * 1.16), h * 4, performance.now());      // tear: 아래→위 / tear-down: 위→아래
} else if (!tc.hidden) tc.hidden = true;

const next_is_seamx = nextEnter === 'seamx';
panels.forEach((pn, k) => {
  let tx = 0, ty = 0, rot = 0, op = 1, on = true, z = '', clip = '';
  const enter = k > 0 ? pn.dataset.enter : 'slide';
  if (k < seg || k > seg + 1) on = false;
  else {
    const next = panels[seg + 1].dataset.enter;
    if (next === 'seamx') {                       // 옆으로 미는 전환 그대로, 두 화면 사이의 세로 경계만 찢긴 종이 가장자리로
      if (k === seg) { on = t < 0.999; z = '1'; }       // 절반 속도 — 들어오는 종이 아래로 계속 겹쳐 있다
      else { on = t > 0.001; tx = 1 - t; z = '2'; clip = poly; }
    } else if (next === 'seam') {                        // 한 장의 페이지처럼 그대로 밑으로 — 나가는 화면은 위로, 들어오는 화면은 찢긴 윗변을 달고 아래서 올라온다
      if (k === seg) { on = t < 0.999; z = '1'; }
      else { on = t > 0.001; ty = 1 - t; z = '2'; clip = poly; }
    } else if (next === 'tear' || next === 'tear-down') {
      const dn = next === 'tear-down';
      // tear: 나가는 패널이 경계 위쪽만 남고 들어오는 패널이 아래에서 드러난다
      // tear-down: 들어오는 패널이 경계 위쪽에 얹혀 내려오고 나가는 패널은 그 아래에 남는다
      if (k === seg) { on = t < 0.999; z = dn ? '1' : '2'; clip = dn ? '' : poly; }
      else { on = t > 0.001; z = dn ? '2' : '1'; clip = dn ? poly : ''; }
    } else if (next === 'rise') {                  // 나가는 화면은 그대로 서 있고, 들어오는 화면이 아래에서 올라온다
      if (k === seg) { on = t < 0.999; z = '1'; }
      else { ty = 1 - t; on = t > 0.001; z = '2'; }
    } else if (k === seg) {
      if (next === 'wheel') { rot = 90 * t; op = 1 - clamp((t - 0.25) / 0.55); }
      else tx = -t;
    } else if (next === 'wheel') { rot = -90 * (1 - t); op = clamp((t - 0.05) / 0.5); }
    else tx = 1 - t;
    if (op <= 0.001) on = false;
  }
  if (enter === 'tear') {                                            // 사진 위의 글은 경계가 거의 지난 뒤에 뜬다
    pn.querySelector('.block').style.setProperty('--r', (k === seg + 1 ? clamp((t - 0.55) / 0.3) : k > seg + 1 ? 0 : 1).toFixed(3));
    const e = clamp((t - 0.1) / 0.75);                                 // 패널 안 이미지의 대각선 입장 진행도
    pn.style.setProperty('--e', (k === seg + 1 ? e * e * (3 - 2 * e) : k > seg + 1 ? 0 : 1).toFixed(4));
  }
  pn.style.visibility = on ? 'visible' : 'hidden';
  pn.style.zIndex = z;
  pn.style.clipPath = clip;
  pn.classList.toggle('is-seamx', next_is_seamx && k === seg + 1 && on);
  pn.classList.toggle('is-seam', nextEnter === 'seam' && k === seg + 1 && on);
  if (on) {
    pn.style.setProperty('--tx', tx.toFixed(4));
    pn.style.setProperty('--ty', ty.toFixed(4));
    pn.style.setProperty('--rot', rot.toFixed(3));
    pn.style.setProperty('--op', op.toFixed(3));
  }
});

// 자리 잡은 패널 — 주석 선·연표 같은 장식이 시간을 두고 그려진다(--ia). 화면을 벗어나면 처음으로 돌린다.
// 글이 칸보다 길면(좁은 화면) 패널이 머무는 동안 글을 위로 흘려 끝까지 읽히게 한다.
panels.forEach((pn, k) => {
  const vis = k === seg || k === seg + 1;
  const settled = (k === seg && t < 0.02) || (k === seg + 1 && t > 0.98);
  let ia = pn._ia || 0;
  if (!vis) ia = 0;
  else if (settled && ia < 1) ia = Math.min(1, ia + (1 - ia) * 0.05 + 0.004);
  if (ia !== pn._ia) { pn._ia = ia; pn.style.setProperty('--ia', ia.toFixed(3)); }
if (pn.classList.contains('hx-gallery')) {
  // 지나가는 기타(pass) — 패널 밖(트랙 위)으로 옮겨 두어 패널이 밀려 들어오는 중에도 화면 기준으로 움직인다
  if (pn._ps === undefined) { pn._ps = pn.querySelector('.gl-pass'); if (pn._ps) pn.parentElement.appendChild(pn._ps); }
  const ps = pn._ps;
  if (ps && !vis) ps.style.visibility = 'hidden';
}
if (pn.classList.contains('hx-gallery') && vis) {
  // 머무는 동안(칸 길이 - 이동 구간) 띠가 처음부터 끝까지 흐른다
  const dwellLen = (el._W[k] || 1) - (1 - HX.slideFrom);
  const ps = pn._ps;
  const lu = u - Bk(k);
  const vw = innerWidth;
  // 기타: 패널이 들어오는 중(L0)부터 화면 정중앙 높이로 왼쪽→오른쪽을 한 번에 빠르게 지나간다(L1에 화면 밖).
  //   조각은 기타 꼬리가 지나간 자리부터 원래 배치대로 차례로 생기고, 띠는 그 뒤에 흐른다
  const L0 = -0.25, L1 = 0.35;
  const g = ps ? clamp((lu - 0.45) / Math.max(0.1, dwellLen - 0.55)) : clamp((lu - 0.04) / Math.max(0.1, dwellLen - 0.08));
  let front = Infinity;
  if (ps) {
    const pw = ps.offsetWidth, ph = ps.offsetHeight;
    const p1 = clamp((lu - L0) / (L1 - L0));
    const left = -pw + (vw + pw + 8) * (0.15 * p1 + 0.85 * easeIO(p1));
    ps.style.transform = `translate3d(${left.toFixed(1)}px, ${((h - ph) / 2).toFixed(1)}px, 0)`;
    ps.style.visibility = p1 > 0 && p1 < 1 ? 'visible' : 'hidden';
    // 조각이 생기는 앞선 — 지나가는 동안은 기타 꼬리, 지나간 뒤에는 화면 오른쪽 끝 너머로 물러나 띠를 따라 들어오는 조각이 차례로 생긴다
    front = p1 < 1 ? left : Math.max(left, vw * 1.1);
  }
  const tr = pn._tr || (pn._tr = pn.querySelector('.gl-track'));
  const off = g * Math.max(0, tr.offsetWidth - pn.clientWidth);
  tr.style.transform = `translate3d(${(-off).toFixed(1)}px, 0, 0)`;
  // 화면 가운데에 가까울수록 1 — 크기와 밝기
  (pn._its || (pn._its = [...pn.querySelectorAll('.gl-it')])).forEach((it) => {
    const r = it.getBoundingClientRect();
    const c = r.left + r.width / 2;
    const f = 1 - clamp(Math.abs(c - vw / 2) / (vw * 0.42));
    const ff = f * f * (3 - 2 * f);
    it.style.setProperty('--f', ff.toFixed(3));
    if (ps) { const rv = clamp((front - (it.offsetLeft - off)) / (vw * 0.24)); it.style.setProperty('--rv', (rv * rv * (3 - 2 * rv)).toFixed(3)); }
  });
}
  if (vis && pn.classList.contains('hx-dark') && ((k === seg && t < 0.5) || (k === seg + 1 && t >= 0.5))) headDark = true;   // 어두운 패널이 화면을 차지하면 머리 메뉴도 밝게
  if (pn.classList.contains('hx-riseimg')) {             // 들어오는 이동의 뒤쪽 65%에서 누끼가 솟는다
    const tt = k === seg + 1 ? t : k <= seg ? 1 : 0;
    pn.style.setProperty('--e', easeIO(clamp((tt - 0.35) / 0.65)).toFixed(4));
    pn.style.setProperty('--lv', easeIO(k === seg ? clamp(t / 0.45) : k < seg ? 1 : 0).toFixed(4));   // 다음 칸으로 넘어가는 진행도
  }
  if (pn._tin === undefined) pn._tin = pn.querySelector('.hx-tin');
  const tin = pn._tin;
  if (!tin || !vis) return;
  const key = `${h}x${innerWidth}`;
  if (pn._ovKey !== key || nowS - (pn._ovT || 0) > 1000) {
    pn._ovKey = key;
    pn._ovT = nowS;
    pn._ov = Math.max(0, tin.scrollHeight - tin.parentElement.clientHeight);
    tin.parentElement.classList.toggle('is-ov', pn._ov > 2);
  }
  const sc = pn._ov > 2 ? -pn._ov * clamp((u - Bk(k) - 0.03) / 0.36) : 0;
  if (sc !== pn._sc) { pn._sc = sc; tin.style.transform = sc ? `translate3d(0, ${sc.toFixed(1)}px, 0)` : ''; }
});

}
  // 마지막 칸이 exit: 'dark' — 핀이 풀리기 직전, 화면이 제자리에서 서서히 검게 덮인다(다음 시대의 검정으로 경계 없이 잇는다)
  if (el._ed === undefined) el._ed = el.querySelector('.hx-enddark');
  if (el._ed) {
    const uEnd = Bk(N - 1) + (el._W[N - 1] || 1) - 1 + HX.tail / HX.span;
    const v = easeIO(clamp((u - (uEnd - 0.5)) / 0.42));
    el._ed.style.opacity = v.toFixed(3);
    if (v > 0.5) headDark = true;
  }
  // 첫 블록 — 핀 중앙에서 읽힌다
  const b0 = el.querySelector('.hero-step .block');
  b0.style.setProperty('--r', clamp(1.75 - (Math.abs(s) / (h * 0.75)) * 1.75).toFixed(3));

  // 모서리 이미지 — 핀이 완전히 닿은 뒤에 들어오고, 첫 이동 전에 각자 옆으로 빠진다
  const arrived = wr.top <= h * 0.02;
  [['s1', 0.055], ['s2', 0.045]].forEach(([k, rate]) => {
    let v = +(el.dataset[k] || 0);
    v += ((arrived ? 1 : 0) - v) * rate;
    if (Math.abs((arrived ? 1 : 0) - v) < 0.002) v = arrived ? 1 : 0;
    el.dataset[k] = v.toFixed(4);
    L.style.setProperty('--' + k, v.toFixed(4));
  });
  L.style.setProperty('--x', N ? clamp((s - h * 0.08) / (h * 0.36)).toFixed(3) : '0');   // 뒤에 패널이 없으면 모서리 이미지는 빠지지 않는다
  L.style.visibility = (+el.dataset.s1 > 0.003 || +el.dataset.s2 > 0.003) ? 'visible' : 'hidden';   // 들어오기 전 모서리 조각이 비치지 않게

  // 전면 사진 + 찢긴 종이 (위쪽 종이만 — 아래는 화면이 밀려 나간다)
  const sf = L.querySelector('.stage-full');
  if (sf) {
  const q = s / h - 1;
  const eTop = clamp(h * (1.08 - ((q + 0.52) / 0.47) * 1.16), -h * 0.5, h * 1.5);
  const off = eTop >= h * 1.16 || x >= 1;
  if (sf.hidden !== off) sf.hidden = off;
  if (!off) {
    sf.style.setProperty('--q', q.toFixed(4));
    if (!sf._tear) sf._tear = makeTear(sf.querySelector('canvas'));
    sf._tear.draw(eTop, h * 4, performance.now());
  }
  }
  if (N > 0) {
  const fr = clamp((s - h * 0.55) / (h * 0.4)).toFixed(3);
  el.querySelector('.hx-full .block').style.setProperty('--r', fr);
  el.querySelector('.hx-full .hx-text')?.style.setProperty('--r', fr);
  }

  // 패널 안의 교체 — 도면이 떨어지고(--g1) 풀샷이 위에서 내려온다(--g2)
  el.querySelectorAll('.hx-panel[data-then]').forEach((pn) => {
    const k = +pn.dataset.k;
    // 첫 스냅(k+0.15)에서는 도면이 온전하고, 다음 스냅(k+0.36)으로 넘어갈 때 도면이 떨어지는 것과 동시에 풀샷이 내려온다
    pn.style.setProperty('--g1', easeIO(clamp((u - Bk(k) - 0.17) / 0.19)).toFixed(4));
    pn.style.setProperty('--g2', easeIO(clamp((u - Bk(k) - 0.17) / 0.2)).toFixed(4));
  });

  // 전면 영상 — 올라오기 시작하면 재생하고, 떠나면 소리부터 줄인다
  el.querySelectorAll('.hx-vfull').forEach((pn) => {
    const k = +pn.dataset.k;
    videoCtl(pn, k === seg + 1 ? t : k <= seg ? 1 : 0, k < seg ? 1 : k === seg ? t : 0);
  });
  // 소리만 나오는 패널 — 영상과 같은 규칙으로 들어올 때 켜고, 떠날 때 줄인다
  el.querySelectorAll('.hx-aud').forEach((au) => {
    const k = +au.closest('.hx-panel').dataset.k;
    videoCtl(au, k === seg + 1 ? t : k <= seg ? 1 : 0, k < seg ? 1 : k === seg ? t : 0);
  });
}

let activeChapter = null;
let onNight = false;
let pastIntro = false;
let shownYear = '';

/* 요소가 화면을 지나는 진행도 0→1 */
const travel = (r, h) => clamp((h - r.top) / (h + r.height));
/* 3D 챕터 한 프레임 — 들머리(연도 릴 → 어둠에서 기타 → 제목), 스크롤 → 칸 위치, 글, 그리고 장면 */
function m3Frame(el, h) {
  const g = el._m3;
  const wrap = g.wrap || (g.wrap = el.querySelector('.m3-wrap'));
  const pin = g.pin || (g.pin = el.querySelector('.m3-pin'));
  const wr = wrap.getBoundingClientRect();
  const now = performance.now();
  const dt = Math.min(0.05, (now - (g.pt || now)) / 1000);
  g.pt = now;
  // 들머리 — 핀이 거의 도착하면(위 12%) 시간이 흐르고, 벗어나면 되감긴다
  const inPlace = REDUCED || wr.top <= h * 0.12;
  g.ts = REDUCED ? 3.6 : clamp((g.ts || 0) + (inPlace ? dt : -dt * 2.2), 0, 3.6);
  if (!REDUCED && g.ts < 3.6 && wr.top <= h * 0.12 && wr.top > -h * 0.15) lockWant = scrollY + wr.top;   // 연출 중 — 무대 첫 자리에 세워 둔다
  const stt = m3Status(el);
  if (stt && (stt.status === 'loading' || stt.status === 'idle')) g.ts = Math.min(g.ts, 1.7);   // 모델이 준비될 때까지 1951에서 기다린다
  const ts = g.ts;
  const rp = 1 - Math.pow(1 - clamp((ts - 0.25) / 1.4), 3);     // 1949 → 1951, 빠르게 돌다 천천히 선다
  const fd = easeIO(clamp((ts - 1.75) / 0.6));                    // 연도가 제자리로 줄어든다
  const rv = clamp((ts - 1.6) / 1.8);                             // 어둠에서 기타가 떠오른다
  const k1 = clamp((ts - 2.3) / 0.7), k2 = clamp((ts - 2.55) / 0.7);

  // 스크롤 → 칸 위치 x (정수 = 머무름, 소수 = 다음 칸으로 가는 중)
  const u = Math.max(0, -wr.top) / h;
  const { W, B, shots } = g;
  const N = shots.length;
  let i = 0;
  while (i < N - 1 && u >= B[i + 1]) i++;
  const last = i === N - 1;
  const dwellLen = last ? W[i] : W[i] - M3.move;
  const lp = clamp((u - B[i]) / dwellLen);
  const m = last ? 0 : clamp((u - B[i] - dwellLen) / M3.move);
  const x = i + m;
  const fade = clamp((u - (B[N - 1] + W[N - 1])) / M3.tail);

  // 제목과 연도 — 첫 칸에서만. 다음 칸으로 넘어가며 걷힌다
  const tv = 1 - smooth01(clamp(x / 0.3));
  const title = g.title || (g.title = pin.querySelector('.m3-title'));
  title.style.setProperty('--k1', (k1 * tv).toFixed(3));
  title.style.setProperty('--k2', (k2 * tv).toFixed(3));
  pin.style.setProperty('--cr', (k2 * tv).toFixed(3));                      // 모델 출처 — 좁은 화면에서는 제목과 함께만
  const yr = g.yr || (g.yr = pin.querySelector('.m3-year'));
  yr.style.setProperty('--rp', rp.toFixed(4));
  if (yr.offsetWidth) {
    // 릴이 도는 동안은 화면을 꽉 채우는 크기로 가운데, 다 돌면 제목 뒤 제자리로 줄어들며 옅어진다
    const PW = pin.clientWidth, PH = pin.clientHeight, w = yr.offsetWidth, hh = yr.offsetHeight;
    const Sx = Math.max(1, Math.min(PW * 0.92 / w, PH * 0.78 / hh));
    const k = 1 - fd;
    const tx = ((PW - w * Sx) / 2 - yr.offsetLeft) * k;
    const ty = ((PH - hh * Sx) / 2 - yr.offsetTop) * k;
    yr.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) scale(${(1 + (Sx - 1) * k).toFixed(4)})`;
    yr.style.opacity = (lerp01(0.92, 0.07, fd) * (fd < 1 ? 1 : tv)).toFixed(3);
  }

  // 칸마다의 글 — 머무는 동안 또렷하고, 옮겨 가는 동안 위로 빠지며 다음 글이 아래에서 올라온다
  const side = { l: 0, r: 0 };
  (g.texts || (g.texts = [...pin.querySelectorAll('.m3-t')])).forEach((t) => {
    const k = +t.dataset.k;
    let v = smooth01(clamp(1 - Math.abs(x - k) / 0.32)) * (1 - fade);
    const out = shots[k].textOut;                                   // 칸 안에서 글을 먼저 읽히고 걷어 화면을 장면에 내준다
    if (out != null && k === i) v *= 1 - smooth01(clamp((lp - out) / 0.1));
    const sd = t.classList.contains('side-r') ? 'r' : 'l';
    if (shots[k].scrim !== false) side[sd] = Math.max(side[sd], v);   // 빈 바탕 위에 놓인 글은 어둡게 깔 필요가 없다
    t.style.opacity = v.toFixed(3);
    t.style.visibility = v > 0.001 ? 'visible' : 'hidden';
    t.style.setProperty('--ty', `${((x - k) * -46).toFixed(1)}px`);
    if (v > 0.001) {
      // 좁은 화면에서 글이 칸보다 길면 머무는 동안 위로 흘려 끝까지 읽히게
      const tin = t.firstElementChild;
      const ov = Math.max(0, tin.scrollHeight - t.clientHeight);
      tin.style.transform = ov > 2 && k === i ? `translate3d(0, ${(-ov * clamp((lp - 0.08) / 0.7)).toFixed(1)}px, 0)` : '';
    }
  });

  // 이미지 칸 — 화면 절반을 꽉 채운 사진이 자기 쪽 가장자리에서 밀려 들어왔다 나간다. 그동안 3D는 뒤에서 어두워진다
  let iv = 0;
  (g.imgs || (g.imgs = [...pin.querySelectorAll('.m3-img')])).forEach((f) => {
    const k = +f.dataset.k;
    const v = easeIO(clamp(1 - Math.abs(x - k) / 0.5));
    iv = Math.max(iv, v);
    f.style.visibility = v > 0.001 ? 'visible' : 'hidden';
    f.style.setProperty('--tx', `${((1 - v) * (f.classList.contains('side-l') ? -100 : 100)).toFixed(2)}%`);
  });

  // 영상 칸 — 화면 전체. 앞 칸에서 오른쪽에서 밀려 들어오고, 다음 칸으로 갈 때 왼쪽으로 빠진다
  let vv = 0;
  (g.vids || (g.vids = [...pin.querySelectorAll('.m3-video')])).forEach((pn) => {
    const k = +pn.dataset.k;
    const d = clamp(k - x, -1, 1);
    vv = Math.max(vv, 1 - Math.abs(d));
    pn.style.visibility = Math.abs(d) < 0.999 ? 'visible' : 'hidden';
    pn.style.setProperty('--tx', `${(easeIO(Math.abs(d)) * Math.sign(d) * 100).toFixed(2)}%`);
    videoCtl(pn, clamp(x - (k - 1)), clamp(x - k) * 0.5);           // 화면 밖으로 다 빠질 때까지 영상을 두고, 그동안 소리가 줄어든다
  });

  // 글이 놓이는 쪽을 어둡게 — 기타가 화면을 채우는 근접 장면에서도 글이 읽히게
  pin.style.setProperty('--sl', side.l.toFixed(3));
  pin.style.setProperty('--sr', side.r.toFixed(3));

  // 불러오는 중이면 진행 표시
  const ld = g.ld || (g.ld = pin.querySelector('.m3-load'));
  const loading = stt && stt.status === 'loading' && wr.top < h;
  if (ld.hidden === loading) ld.hidden = !loading;
  if (loading) {
    ld.style.setProperty('--lp', stt.progress.toFixed(3));
    ld.lastElementChild.textContent = `${Math.round(stt.progress * 100)}%`;
  }

  // 장면 — 핀이 화면에 걸쳐 있을 때만, 영상이 화면을 다 덮은 동안은 쉰다
  if (wr.top < h && wr.bottom > 0 && vv < 0.999) {
    const P = m3Draw(el, { x, lp, rv: REDUCED ? 1 : rv, fade, now });
    if (P) {
      pin.style.setProperty('--gx', P.sx.toFixed(3));
      pin.style.setProperty('--gy', P.sy.toFixed(3));
    }
    pin.style.setProperty('--gl', (rv * (1 - fade)).toFixed(3));
    pin.style.setProperty('--cv', (clamp(rv * 4) * (1 - fade) * (1 - 0.82 * iv) * (1 - vv)).toFixed(3));   // 빛이 들기 전·꺼진 뒤에는 검은 실루엣도 보이지 않게
  }
}
const smooth01 = (m) => m * m * (3 - 2 * m);
const lerp01 = (a, b, t) => a + (b - a) * t;

/* 핀 구간 진행도 0→1 */
const pinned = (r, h) => clamp(-r.top / (r.height - h));

let headDark = false;
function frame() {
  const h = innerHeight;
  headDark = false;
  lockWant = null;

  for (const el of live) {
    const r = el.getBoundingClientRect();

    if (el.classList.contains('seam')) {
      el.firstElementChild.style.setProperty('--r', travel(r, h).toFixed(3));
      continue;
    }

// 들머리 — 머리글이 화면을 지나는 동안 헤드가 나왔다 들어간다
const ent = el.querySelector('.ch-entry');
if (ent) {
  const hd = ent.parentElement;
  const hr = hd.getBoundingClientRect();
  const t2 = clamp((h - hr.top) / (h + hr.height));
  const raw = REDUCED ? 1
    : clamp(t2 / 0.5);           // 머리글이 화면 가운데에 올 때(스냅 지점) 끝난다 — 이전보다 약 40% 긴 스크롤 거리
  const nowH = performance.now();
  const dtH = Math.min(0.05, (nowH - (hd._pt || nowH)) / 1000);
  hd._pt = nowH;
let pe;
if (hd.classList.contains('has-entry--half')) {
  // 머리글이 화면 윗변 가까이(12%) 온 뒤에야 내려오기 시작한다. 스크롤 도중에 일부만 걸쳐 보이지 않게 한다.
const inPlace = REDUCED || hr.top <= h * 0.12;
// 순서: 앞 챕터 연도(1931)가 진하게 떠 있다가 → 슬롯처럼 이 챕터 연도로 굴러가고 → 옅어지며 → 기타가 내려오고 → 제목이 나온다
hd._ts = Math.min(3.4, Math.max(0, (hd._ts || 0) + (inPlace ? dtH : -dtH * 2.2)));
if (!REDUCED && hd._ts < 3.4 && hr.top <= h * 0.12 && hr.top > -h * 0.15) lockWant = scrollY + hr.top;   // 연출 중 — 머리글 자리에 세워 둔다
const ts = REDUCED ? 3.4 : hd._ts;
const m = clamp((ts - 0.25) / 1.4);
const rp = 1 - Math.pow(1 - m, 3);                         // 빠르게 돌다 천천히 선다
const fd = easeIO(clamp((ts - 1.75) / 0.6));
const reveal = clamp(t2 / 0.45);                           // 스크롤해 들어오는 동안 앞 연도가 먼저 보인다
hd.style.setProperty('--rp', rp.toFixed(4));
// 앞 챕터의 크림 종이가 찢겨 올라가며 어두운 바탕이 드러나고, 연도는 밝게 떠 있다가 바탕이 돌아오면서 원래 색·농도로 돌아간다
hd.style.setProperty('--fd', fd.toFixed(4));
hd.style.setProperty('--yo', (reveal * (0.95 * (1 - fd) + 0.07 * fd)).toFixed(3));
// 어두운 막 — 경계 없이, 머리글이 올라오는 동안 화면 전체가 부드럽게 어두워진다. 연도가 자리 잡은 뒤 다시 걷힌다
const tcv = hd.querySelector('.ch-tear');
const dk = hd.querySelector('.ch-dark');
let dkO = 0;
if (dk) {
  if (tcv && !tcv.hidden) tcv.hidden = true;
  const a = hd.classList.contains('has-entry--darkin') ? 1 : easeIO(clamp((h - hr.top) / (h * 0.7)));   // 머리글 윗변이 화면 아래 → 화면 30% 선까지 (앞이 검정이면 처음부터)
  dkO = hr.bottom > 0 ? a * (1 - fd) : 0;
  dk.hidden = dkO < 0.002;
  if (!dk.hidden) { dk.style.transform = 'none'; dk.style.clipPath = ''; dk.style.opacity = dkO.toFixed(3); }
}
// 연도 — 어두운 동안은 머리글을 꽉 채우는 크기로 가운데 떠 있고, 바탕이 걷히는 동안 원래 자리·크기로 줄어든다
const yr = hd.querySelector('.ch-bgyear--in');
if (yr && yr.offsetWidth) {
  const W = hd.clientWidth, H = hd.clientHeight, w = yr.offsetWidth, hh = yr.offsetHeight;
  const S = Math.max(1, Math.min(W * 0.92 / w, H * 0.78 / hh));
  const k = 1 - fd;
  const tx = ((W - w * S) / 2 - yr.offsetLeft) * k;
  const ty = ((H - hh * S) / 2 - yr.offsetTop) * k;
  yr.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) scale(${(1 + (S - 1) * k).toFixed(4)})`;
}
headDark = headDark || dkO > 0.5;
hd._lp = clamp((ts - 1.85) / 1.5);
pe = easeIO(hd._lp);
} else {
  pe = chase(hd._pv == null ? easeIO(raw) : hd._pv, easeIO(raw), dtH, 4.2);   // 곡선 + 시간으로 한 번 더 부드럽게
  if (Math.abs(easeIO(raw) - pe) < 0.0008) pe = easeIO(raw);
}
hd._pv = pe;
hd.style.setProperty('--p', pe.toFixed(3));   // 끝에서 느려지게
// 연도는 스크롤이 아니라 시간으로 굴린다 — 스크롤이 빨라도 천천히 올라온다
const goal = pe > 0.93 ? 1 : 0;
let yv = +(hd.dataset.yv || 0);
yv += (goal - yv) * 0.034;
if (Math.abs(goal - yv) < 0.002) yv = goal;
hd.dataset.yv = yv.toFixed(4);
hd.style.setProperty('--k4', yv.toFixed(4));
}

const a = el.dataset.archetype;

if (el.classList.contains('has-hx')) {
  stageFrame(el, h);
} else if (a === 'model3d') {
  m3Frame(el, h);
} else if (a === 'hero') {
  const wrap = el.querySelector('.hero-wrap');
  const wr = wrap.getBoundingClientRect();
  const p = pinned(wr, h);

  // 활성 블록 = 화면 한가운데에 가장 가까운 것
  const steps = el.querySelectorAll('.hero-step');
  let act = 0, bd = Infinity;
  steps.forEach((st, i) => {
    const r2 = st.getBoundingClientRect();
    const dd = Math.abs(r2.top + r2.height / 2 - h * 0.5);
    if (dd < bd) { bd = dd; act = i; }
  });

  // 무대 이미지 — 무대가 화면에 닿으면 시간을 두고 들어온다. 좌상단이 먼저, 우하단이 조금 늦게
const layers = el.querySelectorAll('.hero-layer');
  let want = -1;
  layers.forEach((L) => { if (+L.dataset.i === act) want = act; });

  layers.forEach((L) => {
    const on = +L.dataset.i === want;
    const cur = +(L.dataset.r || 0);
let next = cur + ((on ? 1 : 0) - cur) * 0.18;     // 부드럽게 수렴
if (!on && next < 0.012) next = 0;                // 잔상이 남지 않게 끊는다
if (on && next > 0.995) next = 1;
L.dataset.r = next.toFixed(4);
L.style.setProperty('--r', next.toFixed(3));
L.style.opacity = next <= 0 ? '0' : '1';
    // 디테일로 파고드는 줌은 누끼 레이어에만. 사진·도면은 화면 밖으로 나가면 안 된다
    const base = L.classList.contains('is-base');
    L.style.setProperty('--z', (base ? 1 + p * 0.42 : 1.0 + (on ? 0 : -0.03)).toFixed(3));
    L.style.setProperty('--ty', base ? `${(p * -5).toFixed(1)}vh` : '0px');
    L.classList.toggle('is-on', on);
    if (L.classList.contains('is-video')) mountVideo(L, next > 0.08);
  });

  const capEl = el.querySelector('.hero-cap');
  const onLayer = [...layers].find((L) => +L.dataset.i === want);
  const cap = onLayer ? (onLayer.dataset.cap || '') : '';
  if (capEl && capEl.textContent !== cap) capEl.textContent = cap;

  el.querySelectorAll('.hero-step .block').forEach((b) => {
    const br = b.getBoundingClientRect();
    const c = br.top + br.height / 2;
    const dd = Math.abs(c - h * 0.5) / (h * 0.75);
    b.style.setProperty('--r', clamp(1.75 - dd * 1.75).toFixed(3));
  });
} else if (a === 'sidearm') {
      const p = travel(r, h);
      // 1 → 0 : 오른쪽 바깥에서 넥부터 밀려 들어온다
      el.querySelector('.side-sil').style.setProperty('--px', clamp(1 - p * 1.9).toFixed(3));
      el.querySelector('.side-sil .sil-wrap').style.setProperty('--r', clamp(p * 2.4).toFixed(3));
    } else {
      const w = el.querySelector('.sil-wrap');
      if (w) w.style.setProperty('--r', clamp(travel(r, h) * 2.2).toFixed(3));
    }

    if (r.top < h * 0.5 && r.bottom > h * 0.5) activeChapter = el;
  }

  // 3D 챕터의 영상 — 챕터를 건너뛰어 벗어나면(레일 클릭 등) 소리가 남지 않게 떼어 낸다
  for (const pn of m3Vids) if (pn._v && pn._v.fr && !live.has(pn.closest('.chapter'))) videoCtl(pn, 0, 1);

  if (activeChapter) {
    const i = chapters.indexOf(activeChapter);
    if (i >= 0) railItems.forEach((li, k) => li.classList.toggle('is-on', k === i));
    const y = activeChapter.dataset.year;
    if (y !== shownYear) { shownYear = y; nowYear.textContent = y; }
  }

  const past = scrollY > h * 0.55;
  if (past !== pastIntro) { pastIntro = past; document.body.classList.toggle('past-intro', past); }

  const max = document.documentElement.scrollHeight - h;
  bar.style.transform = `scaleX(${clamp(scrollY / max).toFixed(4)})`;

  const night = headDark || eras.some((e) => {
    if (e.dataset.tone !== 'dark') return false;
    const r = e.getBoundingClientRect();
    return r.top < h * 0.5 && r.bottom > h * 0.5;
  });
  if (night !== onNight) { onNight = night; document.body.classList.toggle('on-night', night); }

  updateLock(performance.now());
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

/* ---------- 4. 스크롤 감각 ----------
   휠 입력을 목표값에 쌓고 현재 위치가 천천히 따라가게 해서 무겁게 만든다.
   입력이 멎으면 가장 가까운 블록(없으면 챕터 머리)에 중앙을 맞춰 멈춘다. */
const FEEL = {
  ease: 0.1,            // 한 프레임에 목표까지 좁히는 비율 — 작을수록 무겁다
  wheel: 0.82,           // 휠 한 칸의 반영 배율
  maxStep: 220,          // 한 이벤트가 밀 수 있는 최대 거리 (트랙패드 플릭 억제)
  idle: 280,             // 입력이 멎었다고 보는 시간 (ms)
  snapReach: 0.14,       // 이 비율(뷰포트 높이) 안에 블록이 있으면 끌어당긴다
  anchor: 0.5,           // 블록 중심을 맞출 화면 높이 비율
};

if (!REDUCED) {
  let cur = scrollY;
  let target = scrollY;
  let lastSet = scrollY;
  let idleTimer = 0;
  let dir = 1;                 // 마지막으로 굴린 방향
  const maxY = () => document.documentElement.scrollHeight - innerHeight;

  const snapTarget = (y) => {
    const h = innerHeight;
    const pts = [];
    const narrow = new Set();           // 챕터 머리 — 가까이 왔을 때만 끌어당겨서 헤드가 나오는 중간에도 멈출 수 있다
    const wide = new Set();
    const half = new Set();             // 반쪽 들머리 — 앞뒤 간격이 커서 조금만 굴려도(0.12화면) 넘어간다
    const arrive = new Set();
    const free = new Set();             // 이 지점으로 들어오는 전환은 중간에 멈출 수 있다             // 가로 무대의 점 — 이동 구간 어디서 멈춰도 끌어당긴다
    const base = scrollY;               // 문서 좌표는 지금 실제 위치에서 잰다. 목표값에서 재면 어긋난다
    const push = (el) => {
      const r = el.getBoundingClientRect();
      pts.push(base + r.top + r.height / 2 - h * FEEL.anchor);
    };
    document.querySelectorAll('.hero-step, .chapter:not(.chapter--hero):not(.chapter--model3d) .block, .intro').forEach(push);
    document.querySelectorAll('.ch-head').forEach((el) => {
      push(el);
      // 반쪽 들머리는 막이 덮는 전환이 있어 어중간하게 멈추면 안 된다 — 가로 무대 점처럼 끝까지 넘기거나 되돌린다
      (el.classList.contains('has-entry--half') ? wide : narrow).add(pts[pts.length - 1]);
      if (el.classList.contains('has-entry--half')) half.add(pts[pts.length - 1]);
    });
    // 가로 무대 첫 화면(인용)도 무대 점 — 반쪽 들머리에서 넘어올 때 건너뛰지 않게
    document.querySelectorAll('.ch-head.has-entry--half ~ .hero-wrap .hero-step').forEach((el) => { push(el); wide.add(pts[pts.length - 1]); });
    document.querySelectorAll('.hx-snap').forEach((el) => {
      pts.push(base + el.getBoundingClientRect().top - h * FEEL.anchor);
      wide.add(pts[pts.length - 1]);
      if (el.dataset.free) free.add(pts[pts.length - 1]);
      if (el.dataset.arrive) arrive.add(pts[pts.length - 1]);   // 3D 챕터 도착 — 위에서 다가올 때만 반쪽 들머리처럼 넘기거나 되돌린다
    });
// 가로 무대 안에서는 두 스냅 지점 사이 어디에서 멈추든, 가던 방향으로 조금(22%) 넘어갔으면 끝까지 가고
// 그보다 덜 갔으면 원래 자리로 돌아온다. 살짝 움직이다 되돌아오는 '꺼떡'이 생기지 않게 한다.
const wp = [...wide].sort((a, b) => a - b);
let prevW = null;
let nextW = null;
for (const v of wp) { if (v <= y + 1) prevW = v; else { nextW = v; break; } }
if (prevW !== null && nextW !== null && nextW - prevW < h * 3) {
  const q = (y - prevW) / (nextW - prevW);
  if (free.has(nextW)) {                       // 경계 전환 구간: 양 끝 8% 안쪽에서만 끌어당기고, 그 사이는 놓아 둔다
    if (q < 0.08) return clamp(prevW, 0, maxY());
    if (q > 0.92) return clamp(nextW, 0, maxY());
    return clamp(y, 0, maxY());
  }
  if (!(half.has(prevW) || half.has(nextW) || arrive.has(nextW))) {
    // 굴리던 방향 앞쪽 점에 거의 닿았을 때만 붙는다 — 뒤로 끌어당기지 않는다
    if (dir > 0 && q > 0.88) return clamp(nextW, 0, maxY());
    if (dir < 0 && q < 0.12) return clamp(prevW, 0, maxY());
    return clamp(y, 0, maxY());
  }
  const thr = Math.min(0.22, (h * 0.12) / (nextW - prevW));
  return clamp(dir > 0 ? (q > thr ? nextW : prevW) : (q < 1 - thr ? prevW : nextW), 0, maxY());
}
// 굴리던 방향에 있는 블록을 우선한다. 내려가는데 뒤로 끌려가면 이상하다
let best = y;
let bd = h * 0.95;
for (const s of pts) {
  const d = Math.abs(s - y);
  const reach = wide.has(s) ? h * 0.2 : narrow.has(s) ? h * 0.12 : h * FEEL.snapReach;
  if (d > reach) continue;
  const behind = (s - y) * dir < -h * 0.04;
  const score = behind ? d * 2.6 : d;
  if (score < bd) { bd = score; best = s; }
}
return clamp(best, 0, maxY());
  };

  addEventListener('wheel', (e) => {
    if (e.ctrlKey || document.body.classList.contains('booting')) return;   // 확대·시퀀스 중에는 건드리지 않는다
    e.preventDefault();
    if (lockOn) return;                                                      // 들머리 연출 중 — 입력을 버린다
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1;
    const dy = clamp(e.deltaY * unit * FEEL.wheel, -FEEL.maxStep, FEEL.maxStep);
    if (dy) dir = Math.sign(dy);
    target = clamp(target + dy, 0, maxY());
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => { target = snapTarget(target); }, FEEL.idle);
  }, { passive: false });

  function glide() {
    const y = scrollY;
    if (Math.abs(y - lastSet) > 1.5) {           // 키보드·스크롤바·앵커 이동 — 따라가지 않고 받아들인다
      cur = target = y;
    }
    if (lockOn) target = lockY;                  // 들머리 연출 중 — 머리글 자리로 붙여 세운다(굴리던 기세가 지나쳐 가지 않게)
    if (Math.abs(target - cur) > 0.1) {
      cur += (target - cur) * FEEL.ease;
      if (Math.abs(target - cur) < 0.3) cur = target;
      scrollTo({ top: cur, behavior: 'instant' });
    }
    lastSet = scrollY;
    requestAnimationFrame(glide);
  }
  requestAnimationFrame(glide);
}
