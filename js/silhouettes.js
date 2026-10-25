/* =========================================================
   GEARSHED — 실루엣 플레이스홀더
   실제 누끼 PNG가 들어오면 makeSil()만 <img>로 바꾸면 되고,
   레이아웃/인터랙션 코드는 손댈 필요가 없다.

   손으로 그린 베지어는 틀리면 조용히 깨진다. 그래서 검증 가능한
   도형(ellipse/rect/polygon)을 겹쳐서 만든다. 그룹에 opacity를 걸어
   겹친 부분이 진해지지 않게 한다.
   ========================================================= */

const E = (cx, cy, rx, ry) => ['ellipse', { cx, cy, rx, ry }];
const R = (x, y, width, height, rx = 0) => ['rect', { x, y, width, height, rx }];
const P = (points) => ['polygon', { points }];
const C = (cx, cy, r) => ['circle', { cx, cy, r }];

export const SIL = {
  /* 솔리드바디 더블컷 */
  solid: {
    box: [360, 1000],
    body: [
      R(118, 14, 124, 94, 22),      // 헤드스톡
      R(152, 96, 56, 476),          // 넥
      E(58, 624, 46, 58), E(302, 624, 46, 58),   // 뿔
      E(180, 650, 130, 122),        // 어퍼 바웃
      E(180, 802, 156, 180),        // 로워 바웃
    ],
    detail: [R(140, 700, 80, 150, 8), C(252, 836, 15), C(286, 806, 15)],
    shape: '33% 0%, 58% 0%, 57% 55%, 78% 60%, 95% 72%, 93% 88%, 72% 99%, 38% 99%, 15% 87%, 13% 70%, 36% 59%, 42% 55%',
  },
  /* 솔리드바디 싱글컷 */
  single: {
    box: [360, 1000],
    body: [
      R(118, 14, 124, 94, 22),
      R(152, 96, 56, 472),
      E(54, 616, 44, 56),
      E(182, 648, 134, 128),
      E(182, 796, 158, 186),
    ],
    detail: [R(142, 696, 80, 148, 8), C(258, 832, 15), C(292, 800, 15)],
    shape: '33% 0%, 58% 0%, 57% 54%, 82% 62%, 95% 78%, 88% 93%, 58% 99%, 30% 96%, 14% 82%, 16% 62%, 38% 56%',
  },
  /* 아치탑 (f홀) */
  archtop: {
    box: [400, 1000],
    body: [
      R(136, 12, 128, 92, 22),
      R(172, 92, 56, 420),
      E(200, 606, 152, 142),
      E(200, 800, 180, 176),
    ],
    detail: [R(160, 700, 80, 140, 8)],
    holes: true,
    shape: '34% 0%, 62% 0%, 60% 46%, 82% 52%, 96% 68%, 92% 80%, 95% 90%, 70% 99%, 36% 99%, 12% 90%, 16% 78%, 12% 66%, 32% 52%, 40% 46%',
  },
  /* 플라잉 V */
  vee: {
    box: [400, 1000],
    body: [
      R(154, 12, 128, 92, 22),
      R(188, 92, 56, 450),
      P('216,478 396,946 294,982 216,788 138,982 36,946'),
    ],
    detail: [C(238, 640, 16), C(272, 700, 16)],
    shape: '38% 0%, 62% 0%, 60% 50%, 96% 95%, 76% 99%, 54% 76%, 32% 99%, 12% 95%, 46% 50%',
  },
  /* 랩스틸 (프라잉 팬) */
  lapsteel: {
    box: [300, 1000],
    body: [
      R(108, 16, 90, 74, 18),
      R(126, 80, 52, 560),
      C(152, 800, 128),
    ],
    detail: [R(118, 600, 68, 120, 8), C(152, 870, 22)],
    shape: '36% 0%, 66% 0%, 60% 64%, 90% 74%, 93% 88%, 70% 98%, 36% 98%, 10% 86%, 14% 72%, 42% 63%',
  },
  /* 헤드리스 (스타인버거) */
  stick: {
    box: [260, 1000],
    body: [
      R(104, 20, 52, 572, 6),
      R(50, 580, 160, 368, 30),
    ],
    detail: [R(78, 648, 104, 112, 8), C(130, 850, 20)],
    shape: '40% 0%, 60% 0%, 60% 58%, 81% 60%, 81% 95%, 19% 95%, 19% 60%, 40% 58%',
  },
  /* 콤보 앰프 */
  combo: {
    box: [820, 640],
    body: [R(8, 36, 804, 530, 34), R(96, 566, 72, 34, 6), R(652, 566, 72, 34, 6)],
    detail: [R(70, 70, 680, 76, 8), R(70, 174, 680, 338, 10)],
    knobs: [[140, 108], [275, 108], [410, 108], [545, 108], [680, 108]],
    shape: '2% 6%, 98% 6%, 98% 88%, 2% 88%',
  },
  /* 스택 (헤드 + 캐비닛) */
  stack: {
    box: [820, 900],
    body: [R(18, 20, 784, 248, 38), R(50, 324, 720, 552, 42)],
    detail: [R(70, 124, 680, 124, 8), R(100, 370, 620, 462, 10)],
    knobs: [[150, 76], [280, 76], [410, 76], [540, 76], [670, 76],
            [255, 480], [565, 480], [255, 724], [565, 724]],
    shape: '2% 2%, 98% 2%, 98% 98%, 6% 98%, 6% 34%, 2% 34%',
  },
  /* 이펙터 */
  pedal: {
    box: [620, 760],
    body: [R(32, 24, 556, 712, 54)],
    detail: [R(110, 330, 400, 176, 14)],
    knobs: [[180, 168, 44], [310, 142, 44], [440, 168, 44], [310, 606, 58]],
    shape: '5% 3%, 95% 3%, 95% 97%, 5% 97%',
  },
};

const NS = 'http://www.w3.org/2000/svg';

function put(parent, [tag, attrs]) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  parent.appendChild(n);
  return n;
}

/* rotate: -90이면 헤드스톡이 왼쪽으로 간다 (넥이 먼저 들어오는 연출용).
   CSS로 돌리면 preserveAspectRatio가 먼저 먹어서 크기를 예측할 수 없다.
   그래서 viewBox 자체를 눕히고 내용만 회전시킨다. */
export function makeSil(key, { label = '', rotate = 0 } = {}) {
  const s = SIL[key] || SIL.solid;
  const [bw, bh] = s.box;
  const horiz = rotate === -90 || rotate === 90;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', horiz ? `0 0 ${bh} ${bw}` : `0 0 ${bw} ${bh}`);
  svg.setAttribute('class', `sil sil--${key}`);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', label || key);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

  const root = document.createElementNS(NS, 'g');
  if (horiz) {
    root.setAttribute('transform',
      rotate === -90 ? `translate(0 ${bw}) rotate(-90)` : `translate(${bh} 0) rotate(90)`);
  }
  svg.appendChild(root);

  // 본체 — 그룹에 opacity를 걸어 겹친 부분이 진해지지 않게
  const g = document.createElementNS(NS, 'g');
  g.setAttribute('class', 'sil-body');
  s.body.forEach((p) => put(g, p));
  root.appendChild(g);

  if (s.detail) {
    const d = document.createElementNS(NS, 'g');
    d.setAttribute('class', 'sil-panel');
    s.detail.forEach((p) => put(d, p));
    root.appendChild(d);
  }
  if (s.holes) {
    const f = document.createElementNS(NS, 'g');
    f.setAttribute('class', 'sil-cut');
    [[132, 706], [268, 706]].forEach(([cx, cy], i) => {
      const e = put(f, E(cx, cy, 11, 62));
      e.setAttribute('transform', `rotate(${i ? 10 : -10} ${cx} ${cy})`);
    });
    root.appendChild(f);
  }
  if (s.knobs) {
    const k = document.createElementNS(NS, 'g');
    k.setAttribute('class', 'sil-knob');
    s.knobs.forEach(([cx, cy, r]) => put(k, C(cx, cy, r || 17)));
    root.appendChild(k);
  }
  return svg;
}

export const shapeOf = (key) => (SIL[key] || SIL.solid).shape;
export const boxOf = (key) => (SIL[key] || SIL.solid).box;
