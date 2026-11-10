/* =========================================================
   GEARSHED — 첫 화면(랜딩)
   1) 프리로더 = 밀착 인화지: 들어올 때마다. 가운데 바둑판 칸에 모든 자료가 챕터 순서대로 한 장씩 맺히고,
      다 차면 각 사진이 그 칸에서 첫 화면의 제자리로 퍼져 나간다. 칸의 사진과 첫 화면의 사진은 같은 요소다.
      스크롤·클릭·키를 누르면 기다리지 않고 바로 퍼진다.
   2) 흩어진 자료(Floema 방식): 여러 깊이에 떠 있는 자료가 스크롤과 무관하게 천천히 다가와 지나간다.
   3) 세 섹션: 전체 화면 사진이 한 장씩 겹쳐 올라온다.
   움직임 무게: 완성도·절제 위주(들어올 때 투명도+살짝 위치+흐림, 퍼질 때 튀지 않는 곡선). 움직임 줄이기에서는 바로 첫 화면.
   ========================================================= */

const $ = (s, el = document) => el.querySelector(s);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const range = (p, a, b) => clamp((p - a) / (b - a));
const smooth = (m) => m * m * (3 - 2 * m);
const outExpo = (m) => (m >= 1 ? 1 : 1 - Math.pow(2, -10 * m));
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const NARROW = () => innerWidth <= 760;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- 자료 — 파일, 종류(cut 누끼 · ph 사진 · doc 광고·특허), 챕터 ---------- */
const ITEMS = [
  ['frying-pan.png', 'cut', 'frying-pan'], ['f-ad-1930s.jpg', 'doc', 'frying-pan'], ['f-patent-1932.jpg', 'doc', 'frying-pan'], ['f-archive.jpg', 'ph', 'frying-pan'],
  ['es-150.png', 'cut', 'es-150'], ['f-charlie.jpg', 'ph', 'es-150'], ['f-gibson-ad.jpg', 'doc', 'es-150'], ['f-catalog.jpg', 'doc', 'es-150'], ['f-launch.jpg', 'ph', 'es-150'],
  ['es-175.png', 'cut', 'es-175'], ['f-players-175.jpg', 'ph', 'es-175'],
  ['les-paul-goldtop.png', 'cut', 'les-paul-goldtop'], ['f-sensation.jpg', 'doc', 'les-paul-goldtop'], ['f-gold.jpg', 'ph', 'les-paul-goldtop'],
  ['bassman.png', 'cut', 'bassman'], ['f-n59-chassis.jpg', 'ph', 'bassman'],
  ['f-drafting.jpg', 'ph', 'stratocaster'], ['f-cashbox.jpg', 'doc', 'stratocaster'],
  ['gretsch-6120.png', 'cut', 'gretsch-6120'], ['f-cochran.jpg', 'ph', 'gretsch-6120'], ['f-head-1957.jpg', 'ph', 'gretsch-6120'], ['f-western-head.jpg', 'ph', 'gretsch-6120'],
  ['tweed-deluxe.png', 'cut', 'tweed-deluxe'], ['f-chassis56.jpg', 'ph', 'tweed-deluxe'],
  ['es-335.png', 'cut', 'es-335'], ['f-paf58.jpg', 'ph', 'es-335'], ['f-clapton.jpg', 'ph', 'es-335'],
  ['f-albert-king.jpg', 'ph', 'flying-v'], ['f-patent-v.jpg', 'doc', 'flying-v'],
  ['f-patent-explorer.jpg', 'doc', 'explorer'], ['f-korina-head.jpg', 'ph', 'explorer'],
  ['vox-ac30.png', 'cut', 'vox-ac30'], ['f-beatles.jpg', 'ph', 'vox-ac30'], ['f-brian-may.jpg', 'ph', 'vox-ac30'], ['f-top-boost.jpg', 'ph', 'vox-ac30'], ['f-shadows.jpg', 'ph', 'vox-ac30'],
  ['f-derek-trucks.jpg', 'ph', 'gibson-sg'], ['f-sg-head.jpg', 'ph', 'gibson-sg'],
  ['maestro-fz1.png', 'cut', 'maestro-fz1'], ['f-marty-robbins.jpg', 'ph', 'maestro-fz1'], ['f-ad-1962.jpg', 'doc', 'maestro-fz1'], ['f-fz1-board.jpg', 'ph', 'maestro-fz1'],
  ['marshall-jtm45.png', 'cut', 'marshall-jtm45'], ['f-jim-drums.jpg', 'ph', 'marshall-jtm45'], ['f-early-chassis.jpg', 'ph', 'marshall-jtm45'],
  ['twin-reverb.png', 'cut', 'twin-reverb'], ['f-panel-1966.jpg', 'ph', 'twin-reverb'],
].map(([file, kind, ch]) => ({ file, kind, ch, src: `assets/home/${file}` }));
const byFile = Object.fromEntries(ITEMS.map((it) => [it.file, it]));

// 첫 화면 구도 — 파일, 화면 비율(x, y %), 높이(svh). 가운데 문장 자리는 비워 둔다
const HERO_WIDE = [
  ['es-150.png', 8, 30, 34], ['f-ad-1930s.jpg', 22, 15, 17], ['f-cochran.jpg', 36, 12, 15], ['maestro-fz1.png', 50, 16, 8],
  ['f-patent-v.jpg', 63, 13, 16], ['marshall-jtm45.png', 77, 8, 6], ['les-paul-goldtop.png', 91, 36, 34], ['f-brian-may.jpg', 78, 30, 13],
  ['f-chassis56.jpg', 21, 47, 10], ['frying-pan.png', 16, 77, 36], ['f-sensation.jpg', 31, 84, 16], ['bassman.png', 46, 85, 12],
  ['f-clapton.jpg', 60, 87, 13], ['twin-reverb.png', 73, 84, 12], ['gretsch-6120.png', 86, 79, 32], ['f-paf58.jpg', 3.5, 62, 11],
];
const HERO_SLIM = [
  ['es-150.png', 14, 19, 24], ['f-ad-1930s.jpg', 50, 13, 10], ['les-paul-goldtop.png', 86, 21, 24],
  ['marshall-jtm45.png', 36, 30, 3.6], ['maestro-fz1.png', 68, 31, 5.5],
  ['frying-pan.png', 14, 79, 26], ['f-cochran.jpg', 50, 70, 10], ['gretsch-6120.png', 86, 80, 24],
];
// 깊은 곳 자료의 높이(svh) — 종류와 물건에 맞춘다
const sizeOf = (it) => {
  if (it.kind === 'cut') {
    if (it.file.includes('maestro')) return 8;
    if (it.file.includes('marshall')) return 6;
    return /vox|tweed|bassman|twin/.test(it.file) ? 12 : 30;
  }
  return it.kind === 'doc' ? 18 : 15;
};

/* ---------- 원근 — 카메라가 스스로 천천히 나아간다(스크롤과 무관) ---------- */
const P = 1000;                        // 시점 거리
const Z_FAR = -3000;                   // 가장 깊은 자리
const Z_PASS = 660;                    // 이만큼 다가오면(배율 약 2.9) 지나간 것으로 보고 다시 깊은 곳으로 보낸다
const LOOP = Z_PASS - Z_FAR;
const SPEED = 112;                     // 초당 다가오는 거리 — 한 장이 나타나 지나가기까지 약 25초(사용자 요청으로 70에서 60% 빠르게)
const inOut = (m) => (m < 0.5 ? 4 * m * m * m : 1 - Math.pow(-2 * m + 2, 3) / 2);
let nodes = [];
let order = [];                        // 인화지에 맺히는 순서(챕터 순서) — nodes의 순번
let loadedCount = 0;

function buildField() {
  const field = $('.field');
  field.textContent = '';
  const narrow = NARROW();
  const hero = narrow ? HERO_SLIM : HERO_WIDE;
  const used = new Set(hero.map((h) => h[0]));
  const old = new Map(nodes.map((nd) => [nd.it.file, nd]));
  nodes = [];
  // 첫 화면 자료 — 깊이를 조금씩 달리하되, 처음 보이는 자리·크기는 정해 둔 구도와 같게 되돌려 계산한다
  hero.forEach(([file, x, y, h], i) => {
    const z0 = -((i * 37) % hero.length) / hero.length * 600;
    const s0 = P / (P - z0);
    nodes.push(node(byFile[file], 0.5 + (x / 100 - 0.5) / s0, 0.5 + (y / 100 - 0.5) / s0, h / s0, z0, old));
  });
  // 깊은 곳 자료 — 황금각으로 방향을 흩고, 깊이를 고르게 나눠 끊기지 않고 이어서 다가오게 한다
  const deep = ITEMS.filter((it) => !used.has(it.file));
  const n = deep.length;
  const GOLD = 2.39996;
  deep.forEach((it, i) => {
    const a = i * GOLD + 0.6;
    const r = 0.78 + 0.32 * ((i * 7) % 5) / 4;
    const z0 = lerp(-650, Z_FAR, (i + 0.5) / n);
    nodes.push(node(it, 0.5 + Math.cos(a) * r * 0.5, 0.5 + Math.sin(a) * r * 0.5, sizeOf(it) * (narrow ? 0.7 : 1), z0, old));
  });
  for (const nd of nodes) field.appendChild(nd.el);
  const idx = new Map(nodes.map((nd, i) => [nd.it.file, i]));
  order = ITEMS.map((it) => idx.get(it.file));
}
function node(it, x, y, h, z0, old) {
  const prev = old.get(it.file);
  const im = prev ? prev.el : new Image();
  if (!prev) {
    im.className = `it is-${it.kind}`;
    im.alt = '';
    im.decoding = 'async';
    im.onload = () => { loadedCount++; };
    im.src = it.src;
  }
  im.style.setProperty('--h', `${h}svh`);
  return { el: im, it, x, y, z0, w: 0, hpx: 0, shownAt: prev ? prev.shownAt : 0 };
}

/* ---------- 밀착 인화지 — 칸의 크기와 자리 ---------- */
// 인화지에 넣을 자료 — 첫 화면에서 처음부터 또렷한 것만(멀리 있어 옅은 자료를 넣으면 퍼지는 동안 옅어져 보인다)
let sheetOrder = [];
const nearRange = () => (NARROW() ? [0.6, 0.85] : [0.45, 0.72]);
function pickSheet() {
  const [a, b] = nearRange();
  sheetOrder = order.filter((ni) => {
    const s0 = P / (P - nodes[ni].z0);
    return smooth(range(s0, a, b)) * (1 - smooth(range(s0, 1.9, 2.8))) >= 0.98;
  });
}
function sheetGeom(W, H) {
  const n = Math.max(1, sheetOrder.length);
  const cols = NARROW() ? 6 : 12;
  const rows = Math.ceil(n / cols);
  const gap = NARROW() ? 8 : 12;
  const cell = Math.min((W * (NARROW() ? 0.86 : 0.7) - gap * (cols - 1)) / cols, (H * 0.56 - gap * (rows - 1)) / rows);
  const gw = cols * cell + (cols - 1) * gap, gh = rows * cell + (rows - 1) * gap;
  return { cols, cell, gap, x0: (W - gw) / 2, y0: (H - gh) / 2 - H * 0.02, gh };
}

/* ---------- 움직임 ---------- */
const stage = $('.stage');
const pin = $('.stage-pin');
const panels = [...document.querySelectorAll('.panel')];
const foot = $('.pre-foot');
const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
addEventListener('pointermove', (e) => {
  if (e.pointerType === 'touch') return;
  ptr.tx = (e.clientX / innerWidth) * 2 - 1;
  ptr.ty = (e.clientY / innerHeight) * 2 - 1;
}, { passive: true });

let releasedAt = 0;                    // 인화지에서 퍼지기 시작한 시각
let travelled = 0;
let last = 0;
const FLY = 1250;                      // 칸에서 제자리까지 — 멀리 가는 움직임이라 넉넉하게
const APPEAR = 320;                    // 한 장이 칸에 맺히는 시간
function frame(now) {
  const dt = Math.min(0.05, (now - (last || now)) / 1000);
  last = now;
  const W = innerWidth, H = pin.clientHeight;
  const r = stage.getBoundingClientRect();
  ptr.x = lerp(ptr.x, REDUCED ? 0 : ptr.tx, 0.06);
  ptr.y = lerp(ptr.y, REDUCED ? 0 : ptr.ty, 0.06);
  const near = nearRange();   // 먼 자료는 가운데 문장 주변이 붐비지 않게 가까이 와서야 보인다
  const g = sheetGeom(W, H);
  const slot = new Map(sheetOrder.map((ni, k) => [ni, k]));

  if (r.bottom > 0) {
    if (releasedAt && !REDUCED) travelled += dt * SPEED;
    nodes.forEach((nd, ni) => {
      const k = slot.has(ni) ? slot.get(ni) : -1;
      const el = nd.el;
      if (!nd.hpx || !nd.w) { nd.hpx = el.offsetHeight; nd.w = el.offsetWidth; }
      if (!nd.w) return;
      // 첫 화면의 자리
      const Z = Z_FAR + ((((nd.z0 + travelled) - Z_FAR) % LOOP) + LOOP) % LOOP;
      const s = P / (P - Z);
      const fOp = smooth(range(s, near[0], near[1])) * (1 - smooth(range(s, 1.9, 2.8)));
      const fx = W / 2 + (nd.x - 0.5) * W * s + ptr.x * 16 * s;
      const fy = H / 2 + (nd.y - 0.5) * H * s + ptr.y * 10 * s;
      if (k < 0) {
        // 인화지에 없던 자료 — 퍼진 뒤 제자리에서 나타난다(옅어지지 않고 나타나기만 한다)
        const b = releasedAt ? outExpo(clamp((now - releasedAt - 350) / 900)) : 0;
        const op = fOp * b;
        if (op <= 0.002) { el.style.visibility = 'hidden'; return; }
        el.style.visibility = 'visible';
        el.style.opacity = op.toFixed(3);
        el.style.filter = '';
        el.style.zIndex = Math.round(s * 100);
        el.style.transform = `translate3d(${(fx - nd.w / 2).toFixed(1)}px, ${(fy - nd.hpx / 2).toFixed(1)}px, 0) scale(${s.toFixed(4)})`;
        return;
      }
      // 인화지의 칸 — 사진은 제 비율 그대로 칸 안에 들어간다
      const gx = g.x0 + (k % g.cols) * (g.cell + g.gap) + g.cell / 2;
      const gy = g.y0 + Math.floor(k / g.cols) * (g.cell + g.gap) + g.cell / 2;
      const gs = Math.min(g.cell / nd.w, g.cell / nd.hpx);
      // 맺힘(0→1)과 퍼짐(0→1)
      const a = nd.shownAt ? outExpo(clamp((now - nd.shownAt) / APPEAR)) : 0;
      const delay = (Math.hypot(gx - W / 2, gy - H / 2) / Math.hypot(W / 2, H / 2)) * 180;   // 가운데 칸부터 먼저 떠난다
      const m = releasedAt ? inOut(clamp((now - releasedAt - delay) / FLY)) : 0;
      const cx = lerp(gx, fx, m), cy = lerp(gy, fy, m) + (1 - a) * 8;
      const sc = lerp(gs, s, m);
      const op = lerp(a, fOp, m);
      const blur = (1 - a) * 6;
      if (op <= 0.002) { el.style.visibility = 'hidden'; return; }
      el.style.visibility = 'visible';
      el.style.opacity = op.toFixed(3);
      el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : '';
      el.style.zIndex = m > 0.5 ? Math.round(s * 100) : 50;
      el.style.transform = `translate3d(${(cx - nd.w / 2).toFixed(1)}px, ${(cy - nd.hpx / 2).toFixed(1)}px, 0) scale(${sc.toFixed(4)})`;
    });
    // 진행 막대와 연도는 인화지 바로 아래
    if (foot) foot.style.top = `${(g.y0 + g.gh + 22).toFixed(0)}px`;
  }

  // 섹션 사진 — 올라오는 동안 살짝 줄어들며 자리 잡는다
  for (const pn of panels) {
    const t = pn.getBoundingClientRect().top;
    if (t > H || t < -H) continue;
    pn.style.setProperty('--ps', (REDUCED ? 1 : 1 + 0.08 * clamp(t / H)).toFixed(4));
  }
  headlineFrame();
  requestAnimationFrame(frame);
}

/* ---------- 제목 인터랙션 — Extrafazant 히어로처럼 ----------
   · 커서 가까운 글자일수록 산세리프는 가늘고 넓어지고(Instrument Sans 굵기 700 → 400, 폭 80% → 100%),
     세리프는 굵어진다(Instrument Serif는 굵기가 하나뿐이라 글자 외곽선을 덧그려 굵힌다)
   · 굵기와 함께 자간도 벌어진다(최대 0.07em)
   · 터치 기기와 움직임 줄이기에서는 쓰지 않는다 */
const HOVER = matchMedia('(hover: hover) and (pointer: fine)').matches && !REDUCED;
const hx = { chars: [], box: null, mx: -1e4, my: -1e4, sx: -1e4, sy: -1e4 };
function splitHeadline() {
  const addWord = (parent, text, serif) => {
    const ws = document.createElement('span');
    ws.className = 'hx-w';
    for (const ch of text) {
      const c = document.createElement('span');
      c.className = 'hx-c';
      c.textContent = ch;
      ws.appendChild(c);
      hx.chars.push({ el: c, serif, x: 0, y: 0, t: 0, w: -1, ls: -1 });
    }
    parent.appendChild(ws);
  };
  for (const line of document.querySelectorAll('.hl')) {
    const parts = [...line.childNodes];
    line.textContent = '';
    for (const node of parts) {
      if (node.nodeType === 1 && node.classList.contains('sf')) {
        // 세리프 단어 — 자기 감싸개를 그대로 두고 그 안을 글자로 나눈다
        const em = node.cloneNode(false);
        addWord(em, node.textContent.trim(), true);
        line.appendChild(em);
        continue;
      }
      const words = node.textContent.split(/(\s+)/);
      for (const w of words) {
        if (!w) continue;
        if (/^\s+$/.test(w)) line.appendChild(document.createTextNode(' '));
        else addWord(line, w, false);
      }
    }
  }
}
function measureHeadline() {
  const h = $('#h-title');
  if (!h) return;
  hx.box = h.getBoundingClientRect();
  for (const c of hx.chars) {
    const r = c.el.getBoundingClientRect();
    c.x = r.left + r.width / 2;
    c.y = r.top + r.height / 2;
  }
}
addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse') return;
  hx.mx = e.clientX; hx.my = e.clientY;
}, { passive: true });
document.documentElement.addEventListener('pointerleave', () => { hx.mx = hx.my = -1e4; });
let hxMeasure = 0;
addEventListener('scroll', () => { cancelAnimationFrame(hxMeasure); hxMeasure = requestAnimationFrame(measureHeadline); }, { passive: true });

function headlineFrame() {
  if (!HOVER || !hx.box || document.body.classList.contains('is-booting')) return;
  const b = hx.box;
  const R = clamp(innerWidth * 0.21, 240, 420);              // 반응하는 반경
  const near = hx.mx >= b.left - R * 0.5 && hx.mx <= b.right + R * 0.5 && hx.my >= b.top - R * 0.5 && hx.my <= b.bottom + R * 0.5;
  // 커서를 조금 늦게 따라가는 점을 기준으로 물결처럼 번진다
  hx.sx = hx.sx < -9e3 ? hx.mx : lerp(hx.sx, hx.mx, 0.2);
  hx.sy = hx.sy < -9e3 ? hx.my : lerp(hx.sy, hx.my, 0.2);
  const fs = parseFloat(getComputedStyle($('#h-title')).fontSize);
  for (const c of hx.chars) {
    const d = Math.hypot(c.x - hx.sx, c.y - hx.sy);
    const target = near ? 1 - smooth(clamp(d / R)) : 0;
    c.t = lerp(c.t, target, 0.14);
    if (c.serif) {
      const w = +(c.t * fs * 0.032).toFixed(2);              // 외곽선 굵기(px)
      if (w !== c.w) { c.w = w; c.el.style.webkitTextStroke = w > 0.01 ? `${w}px currentColor` : ''; }
    } else {
      const w = Math.round(700 - 300 * c.t);
      if (w !== c.w) { c.w = w; c.el.style.fontWeight = w; c.el.style.fontStretch = `${(80 + 20 * c.t).toFixed(1)}%`; }
    }
    const ls = +(c.t * 0.07).toFixed(3);                     // 자간(em) — 글자 오른쪽에 더해진다
    if (ls !== c.ls) { c.ls = ls; c.el.style.marginRight = ls > 0.001 ? `${ls}em` : ''; }
  }
}

/* ---------- 공개 범위 — Timeline(js/timeline.js)의 BUILD_UNTIL·BUILD_SKIP을 그대로 읽는다 ---------- */
async function chapters() {
  const [src, data] = await Promise.all([
    fetch('js/timeline.js?v=202611100954').then((r) => r.text()),
    fetch('data/timeline.en.json?v=202611100954').then((r) => r.json()),
  ]);
  const until = (src.match(/const BUILD_UNTIL = '([^']+)'/) || [])[1];
  const skip = ((src.match(/const BUILD_SKIP = \[([^\]]*)\]/) || [])[1] || '').match(/'([^']+)'/g)?.map((s) => s.slice(1, -1)) || [];
  let list = data.chapters.filter((c) => !skip.includes(c.id));
  const cut = until ? list.findIndex((c) => c.id === until) : -1;
  if (cut >= 0) list = list.slice(0, cut + 1);
  return list.map((c) => ({ id: c.id, year: c.year, name: `${c.brand} ${c.model}`.trim() }));
}

/* ---------- 프리로더 — 한 장씩 맺히고, 다 차면 퍼진다 ---------- */
let skipping = false;
const skip = () => { skipping = true; };
for (const ev of ['wheel', 'touchstart', 'keydown', 'pointerdown']) addEventListener(ev, skip, { passive: true, once: true });

async function sheet(list) {
  const yr = $('.pre-year');
  const bar = $('.pre-bar');
  const yearOf = Object.fromEntries(list.map((c) => [c.id, c.year]));
  const done = () => document.body.classList.add('pre-gone');
  if (REDUCED) {
    pickSheet();
    for (const nd of nodes) nd.shownAt = 1;
    releasedAt = performance.now() - FLY * 2;
    document.body.classList.remove('is-booting');
    done();
    return;
  }
  document.body.classList.add('pre-sheet');
  pickSheet();
  for (const ni of sheetOrder) {
    const nd = nodes[ni];
    if (!skipping && !nd.el.complete) {
      // 사진이 올 때까지 기다리되, 너무 늦으면 넘어간다 — 느린 연결에서 붙잡지 않게
      await Promise.race([new Promise((r) => nd.el.addEventListener('load', r, { once: true })), wait(600)]);
    }
    nd.shownAt = performance.now();
    if (yearOf[nd.it.ch]) yr.textContent = yearOf[nd.it.ch];
    bar.style.setProperty('--load', (loadedCount / ITEMS.length).toFixed(3));
    if (!skipping) await wait(42);
  }
  bar.style.setProperty('--load', 1);
  if (!skipping) await wait(260);
  // 퍼진다 — 막대와 연도는 먼저 물러나고, 사진이 제자리에 닿을 즈음 가운데 문장이 맺힌다
  document.body.classList.add('pre-release');
  releasedAt = performance.now();
  await wait(FLY * 0.55);
  document.body.classList.remove('is-booting');
  setTimeout(measureHeadline, 900);                  // 제목이 자리 잡은 뒤 글자 위치를 잰다
  await wait(FLY * 0.6);
  done();
}

/* ---------- 시작 ---------- */
async function start() {
  splitHeadline();
  document.fonts?.ready.then(() => setTimeout(measureHeadline, 50));
  scrollTo(0, 0);
  buildField();
  requestAnimationFrame(frame);
  let list = [];
  try { list = await chapters(); } catch (e) { console.warn('챕터 목록을 읽지 못했습니다', e); }
  if (list.length) {
    const first = list[0], lastC = list[list.length - 1];
    const span = `${first.year}–${lastC.year}`;
    for (const el of document.querySelectorAll('[data-range]')) el.textContent = `${span} · ${list.length} instruments`;
    // 인화지 순서 — 공개된 챕터 순서대로, 그 챕터의 자료를 모두
    const pos = new Map(list.map((c, i) => [c.id, i]));
    order = [...order].sort((a, b) => (pos.get(nodes[a].it.ch) ?? 99) - (pos.get(nodes[b].it.ch) ?? 99) || a - b);
  }
  await sheet(list);
}

let rz = 0;
let wasNarrow = NARROW();
addEventListener('resize', () => {
  cancelAnimationFrame(rz);
  rz = requestAnimationFrame(() => {
    if (NARROW() !== wasNarrow) { wasNarrow = NARROW(); const keep = order.map((i) => nodes[i].it.file); buildField(); const idx = new Map(nodes.map((nd, i) => [nd.it.file, i])); order = keep.map((f) => idx.get(f)); }
    for (const nd of nodes) { nd.hpx = 0; nd.w = 0; }
    measureHeadline();
  });
});

start();
