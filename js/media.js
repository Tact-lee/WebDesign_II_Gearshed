/* =========================================================
   GEARSHED — 미디어 유틸
   스튜디오 배경(흰색/회색) 위의 제품 사진에서 배경만 떼어낸다.
   ImageMagick 같은 도구가 없는 환경이라 브라우저에서 한 번만 처리하고
   결과를 캐시한다. 가장자리에서 플러드필을 하므로 피사체 안쪽의
   밝은 금속은 지워지지 않는다.
   ========================================================= */

const cache = new Map();

const load = (src) =>
  new Promise((res, rej) => {
    const i = new Image();
    i.crossOrigin = 'anonymous';
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });

/* 네 모서리 색의 중앙값을 배경색으로 본다 */
function seedColour(d, w, h) {
  const pts = [[2, 2], [w - 3, 2], [2, h - 3], [w - 3, h - 3],
               [w >> 1, 2], [w >> 1, h - 3], [2, h >> 1], [w - 3, h >> 1]];
  const r = [], g = [], b = [];
  for (const [x, y] of pts) {
    const i = (y * w + x) * 4;
    r.push(d[i]); g.push(d[i + 1]); b.push(d[i + 2]);
  }
  const mid = (a) => a.sort((x, y) => x - y)[a.length >> 1];
  return [mid(r), mid(g), mid(b)];
}

/* 스튜디오 배경은 보통 비네팅이 들어간 그라데이션이라 고정 허용치로는
   한쪽 구석이 남는다. 그래서 '이미 배경으로 인정한 이웃 픽셀'과 비교하는
   로컬 허용치로 번져나가고, 씨앗색에서 너무 멀어지면 멈춘다. */
export async function cutout(src, { local = 20, global = 118, feather = true } = {}) {
  if (cache.has(src)) return cache.get(src);
  const p = (async () => {
    const img = await load(src);
    const w = img.naturalWidth, h = img.naturalHeight;
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);
    const id = ctx.getImageData(0, 0, w, h);
    const d = id.data;
    const [sr, sg, sb] = seedColour(d, w, h);
    const N = w * h;

    const dist2 = (a, b) => {
      const dr = d[a] - d[b], dg = d[a + 1] - d[b + 1], db = d[a + 2] - d[b + 2];
      return dr * dr + dg * dg + db * db;
    };
    const distSeed2 = (a) => {
      const dr = d[a] - sr, dg = d[a + 1] - sg, db = d[a + 2] - sb;
      return dr * dr + dg * dg + db * db;
    };
    const L2 = local * local, G2 = global * global;

    const bg = new Uint8Array(N);
    const q = new Int32Array(N);
    let head = 0, tail = 0;
    const push = (i) => { if (!bg[i] && distSeed2(i * 4) <= G2) { bg[i] = 1; q[tail++] = i; } };
    for (let x = 0; x < w; x++) { push(x); push((h - 1) * w + x); }
    for (let y = 0; y < h; y++) { push(y * w); push(y * w + w - 1); }

    while (head < tail) {
      const p0 = q[head++];
      const i0 = p0 * 4;
      const x = p0 % w, y = (p0 / w) | 0;
      const tryN = (p1) => {
        if (bg[p1]) return;
        const i1 = p1 * 4;
        if (dist2(i1, i0) <= L2 && distSeed2(i1) <= G2) { bg[p1] = 1; q[tail++] = p1; }
      };
      if (x > 0) tryN(p0 - 1);
      if (x < w - 1) tryN(p0 + 1);
      if (y > 0) tryN(p0 - w);
      if (y < h - 1) tryN(p0 + w);
    }

    // 알파 적용
    const alpha = new Uint8ClampedArray(N);
    for (let i = 0; i < N; i++) alpha[i] = bg[i] ? 0 : 255;

    // 경계 1px 부드럽게 — 톱니와 배경색 테두리를 줄인다
    if (feather) {
      const out = new Uint8ClampedArray(N);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = y * w + x;
          let sum = 0, n = 0;
          for (let dy = -1; dy <= 1; dy++) {
            const yy = y + dy; if (yy < 0 || yy >= h) continue;
            for (let dx = -1; dx <= 1; dx++) {
              const xx = x + dx; if (xx < 0 || xx >= w) continue;
              sum += alpha[yy * w + xx]; n++;
            }
          }
          out[i] = sum / n;
        }
      }
      alpha.set(out);
    }
    for (let i = 0; i < N; i++) d[i * 4 + 3] = alpha[i];

    ctx.putImageData(id, 0, 0);
    return cv.toDataURL('image/png');
  })();
  cache.set(src, p);
  return p;
}

export const plain = (src) => Promise.resolve(src);
