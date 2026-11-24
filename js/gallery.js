// GEARSHED — Gallery
// Timeline 21개 챕터 모델 + Artists 악기 12개, 한 모델에 사진 한 장(누끼 없음).
// 흐름: 사진이 여섯 줄(좁은 화면 세 줄)로 나뉘어 줄마다 다른 속도로 위로 흐르고, 가운데 제목 근처에서는 옆으로 비켜나며 옅어진다.
// 정렬: Year·Brand·Type·Player를 누르면 같은 사진들이 지금 자리에서 묶음 자리로 옮겨 간다(사진마다 속도가 조금씩 달라 한꺼번에 움직이지 않는다).
// 주소: '' = 목록, '#<id>' = 한 모델 크게, '#sources' = 출처.

const IMG = 'assets/gallery/';
const TL = 'timeline.html';
const AR = 'artists.html';

// [id, 이름, 만든 곳, 연도(정렬), 연도(표시), 종류, 나온 곳, 링크, alt, 사진 출처, 출처 주소, 가로/세로]
// 출처 주소가 비어 있으면 사진 출처는 Timeline 챕터의 Sources에 함께 적혀 있다.
const RAW = [
  ['frying-pan', 'Electro A-22', 'Rickenbacker', 1932, '1932', 'guitar', 'Timeline', TL, 'A Rickenbacker Electro A-22 Frying Pan lap steel', '', '', 1.333],
  ['es-150', 'ES-150', 'Gibson', 1936, '1936', 'guitar', 'Timeline', TL, 'The sunburst body and bar pickup of a Gibson ES-150', '', '', 0.75],
  ['es-175', 'ES-175', 'Gibson', 1949, '1949', 'guitar', 'Timeline', TL, 'A natural-finish Gibson ES-175 lying on a table', '', '', 1.506],
  ['telecaster', 'Telecaster', 'Fender', 1951, '1951', 'guitar', 'Timeline', TL, 'Three early Fender headstocks: Broadcaster, no-name and Telecaster decals', '', '', 1],
  ['les-paul-goldtop', 'Les Paul Goldtop', 'Gibson', 1952, '1952', 'guitar', 'Timeline', TL, 'A 1952 Gibson Les Paul goldtop with a trapeze tailpiece', '', '', 1.333],
  ['bassman', 'Bassman', 'Fender', 1952, '1952', 'amp', 'Timeline', TL, 'Front of a 1959 Fender Bassman with tweed covering', 'Chicago Music Exchange', 'https://www.chicagomusicexchange.com/products/fender-5f6-a-bassman-2-channel-40-watt-4x10-guitar-2663132', 1],
  ['stratocaster', 'Stratocaster', 'Fender', 1954, '1954', 'guitar', 'Timeline', TL, 'Fender Stratocaster advertisement from International Musician, 1954', 'International Musician, 1954. Via Fuzzfaced', 'https://www.fuzzfaced.net/stratocaster-origin.html', 0.744],
  ['gretsch-6120', '6120', 'Gretsch', 1955, '1955', 'guitar', 'Timeline', TL, 'An orange Gretsch 6120 hollow-body, 1960', 'Chicago Music Exchange', 'https://www.chicagomusicexchange.com/products/gretsch-chet-atkins-6120-orange-1956-2533036', 1],
  ['tweed-deluxe', 'Deluxe 5E3', 'Fender', 1955, '1955', 'amp', 'Timeline', TL, 'Front of a 1960 Fender Deluxe 5E3 tweed amplifier', 'RetroFret', 'https://retrofret.com/products/fender-deluxe-5e3-tube-amplifier-1956-13052', 0.666],
  ['les-paul-standard', 'Les Paul Standard', 'Gibson', 1958, '1958', 'guitar', 'Timeline', TL, 'A 1959 and a 1960 Gibson Les Paul Standard side by side', 'Lightburst, CC BY-SA 4.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:1959_and_1960_Gibson_Les_Paul_Standard.jpg', 1.002],
  ['es-335', 'ES-335', 'Gibson', 1958, '1958', 'guitar', 'Timeline', TL, 'A cherry Gibson ES-335, 1964', 'RetroFret', 'https://retrofret.com/products/gibson-es-335td-semi-hollow-body-electric-guitar-1959-10864', 0.666],
  ['flying-v', 'Flying V', 'Gibson', 1958, '1958', 'guitar', 'Timeline', TL, 'A cherry Gibson Flying V, 1967', 'GuitarPoint', 'https://guitarpoint.de/product/1967-gibson-flying-v-cherry-001764/', 0.638],
  ['explorer', 'Explorer', 'Gibson', 1958, '1958', 'guitar', 'Timeline', TL, 'A natural korina Gibson Explorer, 1959', 'Dave’s Guitar Shop, Dave Rogers Collection', 'https://www.davesguitar.com/products/1959-gibson-explorer-natural', 0.666],
  ['jazzmaster', 'Jazzmaster', 'Fender', 1958, '1958', 'guitar', 'Timeline', TL, 'A sunburst Fender Jazzmaster leaning on a tweed amplifier', '', '', 1],
  ['rickenbacker-325', '325', 'Rickenbacker', 1958, '1958', 'guitar', 'Timeline', TL, 'The Beatles on The Ed Sullivan Show, 1964, John Lennon with his Rickenbacker 325', 'Bernard Gotfryd, Library of Congress, public domain (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:The_Beatles_performing_at_The_Ed_Sullivan_Show.jpg', 1.468],
  ['vox-ac30', 'AC30', 'Vox', 1960, '1960', 'amp', 'Timeline', TL, 'A 1963 Vox AC30/6, serial 7005', 'Vox AC30 archive, serial 7005', 'https://www.voxac30.org.uk/vox_ac30_7000s.html', 1.282],
  ['gibson-sg', 'SG', 'Gibson', 1961, '1961', 'guitar', 'Timeline', TL, 'A 1961 Gibson SG-shaped Les Paul with a side-pull Vibrola', 'True Vintage Guitar', 'https://truevintageguitar.com/products/1961-gibson-les-paul-standard-cherry', 1.119],
  ['maestro-fz1', 'FZ-1 Fuzz-Tone', 'Maestro', 1962, '1962', 'effect', 'Timeline', TL, 'A Maestro FZ-1A Fuzz-Tone on a dark table', '', '', 1.499],
  ['marshall-jtm45', 'JTM45', 'Marshall', 1962, '1962', 'amp', 'Timeline', TL, 'A Marshall JTM45 head on a 4x12 cabinet', 'Unbeirrt, GFDL (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:JTM_45_MK_II_Reissue_1997.jpg', 1.502],
  ['twin-reverb', 'Twin Reverb', 'Fender', 1963, '1963', 'amp', 'Timeline', TL, 'A 1968 silverface Fender Twin Reverb', 'Chicago Music Exchange', 'https://www.chicagomusicexchange.com/products/fender-twin-2x12-combo-1953-2236747', 1],
  ['super-lead', '1959 Super Lead', 'Marshall', 1965, '1965', 'amp', 'Timeline', TL, 'A road-worn Marshall 100-watt Plexi head', 'Nick Bowcott, Sweetwater inSync', 'https://www.sweetwater.com/insync/marshall-100-watt-plexi-head-history/', 1.916],
  ['monterey', 'Monterey Stratocaster', 'Fender', 1964, '1964', 'guitar', 'Jimi Hendrix', `${AR}#jimi-hendrix/monterey`, 'The painted Monterey Stratocaster in a museum case', 'Roland Tanglao, CC BY 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:EMP_Museum_-_Jimi_Hendrix_(15201352540).jpg', 0.75],
  ['sg-custom', 'SG Custom', 'Gibson', 1967, '1967', 'guitar', 'Jimi Hendrix', `${AR}#jimi-hendrix/sg-custom`, 'Hendrix’s white SG Custom in a Hard Rock Cafe display case', 'Ira, Flickr, via Ground Guitar', 'https://www.groundguitar.com/jimi-hendrix-gear/jimi-hendrixs-1967-gibson-sg-custom/', 1.333],
  ['izabella', 'Izabella', 'Fender', 1968, '1968', 'guitar', 'Jimi Hendrix', `${AR}#jimi-hendrix/izabella`, 'Izabella, an Olympic White Stratocaster, in a glass case at the Met', 'Eden, Janine and Jim, CC BY 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Jimi_Hendrix%27s_Fender_Stratocaster_(1968)_in_Olympic_White,_purchased_in_New_York_in_1968,_played_on_legendary_1969_Woodstock_performance,_and_used_until_about_1970_-_Play_It_Loud._MET_(2019-05-13_19.43.28_by_Eden,_Janine_and_Jim).jpg', 0.571],
  ['maybellene', 'Maybellene', 'Gibson', 1959, '1959', 'guitar', 'Chuck Berry', `${AR}#chuck-berry/maybellene`, 'Maybellene, Chuck Berry’s natural-finish Gibson ES-350T', 'Smithsonian NMAAHC, CC0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Maybellene,_Chuck_Berry%27s_guitar,_a_Gibson_ES-350T.jpg', 0.418],
  ['es-355', 'ES-355', 'Gibson', 1965, '1960s', 'guitar', 'Chuck Berry', `${AR}#chuck-berry/es-355`, 'Chuck Berry with a cherry ES-355 at the Virgin Festival, 2008', 'docmonstereyes, CC BY 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Chuck_Berry_(2760039335).jpg', 0.666],
  ['dragon', 'Dragon', 'Fender', 1959, '1959', 'guitar', 'Jimmy Page', `${AR}#jimmy-page/dragon`, 'Jimmy Page’s Dragon Telecaster at the Met', 'Eden, Janine and Jim, CC BY 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Jimmy_Page%27s_Dragon_Telecaster_(1959_Fender,_serial_no._50062),_received_from_Jeff_Beck_ca.1965,_hand_painted_%26_replaced_the_pickguard_by_Jimmy_Page,_played_with_violin_bow_-_Play_It_Loud._MET_(2019-05-13_19.27.12_by_Eden,_Janine_and_Jim).jpg', 0.663],
  ['number-one', 'Number One', 'Gibson', 1959, '1959', 'guitar', 'Jimmy Page', `${AR}#jimmy-page/number-one`, 'Jimmy Page’s Les Paul Number One hanging at the Met', 'Eden, Janine and Jim, CC BY 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Jimmy_Page%27s_%22Number_One%22_ca.1959-1960_Gibson_Les_Paul_Standard_-_Play_It_Loud._MET_(2019-05-13_18.43.02_by_Eden,_Janine_and_Jim).jpg', 1.751],
  ['eds-1275', 'EDS-1275', 'Gibson', 1971, '1971', 'guitar', 'Jimmy Page', `${AR}#jimmy-page/eds-1275`, 'Jimmy Page’s cherry double-neck and dragon suit at the Met', 'Eden, Janine and Jim, CC BY 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Jimmy_Page%27s_Gibson_EDS-1275_Double_neck_(1971),_Dragon_suit_(1975)_by_CoCo_-_Play_It_Loud._MET_(2019-05-13_19.29.54_by_Eden,_Janine_and_Jim).jpg', 0.663],
  ['red-special', 'Red Special', 'Brian and Harold May', 1964, '1963–64', 'guitar', 'Brian May', `${AR}#brian-may/red-special`, 'The Red Special’s three pickups, switches and vibrato bridge', 'Premier Guitar, via Ground Guitar', 'https://www.groundguitar.com/brian-may-guitars-and-gear/brian-mays-red-special-guitar/', 0.954],
  ['frankenstein', 'Frankenstein', 'Eddie Van Halen', 1977, '1977', 'guitar', 'Eddie Van Halen', `${AR}#eddie-van-halen/frankenstein`, 'Eddie Van Halen with the black-and-white Frankenstein, 1978', 'Via Guitar World', 'https://www.guitarworld.com/news/david-lee-roth-eddie-van-halen-frankenstrat-stripes', 1.779],
  ['mustang', 'Mustang', 'Fender', 1969, '1969', 'guitar', 'Kurt Cobain', `${AR}#kurt-cobain/mustang`, 'Kurt Cobain’s Competition Mustang in a case at the Experience Music Project', 'Razvan Orendovici, CC BY 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Kurt_Cobain,_Smells_Like_Teen_Spirit_guitar,_EMP_Museum.jpg', 0.479],
  ['jag-stang', 'Jag-Stang', 'Fender', 1993, '1993', 'guitar', 'Kurt Cobain', `${AR}#kurt-cobain/jag-stang`, 'Kurt Cobain playing the Sonic Blue Jag-Stang on stage', 'Via Mixdown', 'https://mixdownmag.com.au/features/the-story-of-kurt-cobains-signature-fender-jag-stang', 1.502],
];
const MODELS = RAW.map(([id, name, maker, year, yearText, type, from, link, alt, credit, url, ar]) =>
  ({ id, name, maker, year, yearText, type, from, link, alt, credit, url, ar }));
const BY_YEAR = [...MODELS].sort((a, b) => a.year - b.year || a.name.localeCompare(b.name));

const TYPE = { guitar: 'Guitars', amp: 'Amps', effect: 'Effects' };
const PLAYERS = ['Chuck Berry', 'Jimi Hendrix', 'Jimmy Page', 'Brian May', 'Eddie Van Halen', 'Kurt Cobain'];
// 연주자가 직접 만든 기타는 한 묶음으로
const brandOf = (m) => (m.from !== 'Timeline' && m.maker.includes(' ') ? 'Player-built' : m.maker);
const byCount = (a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]);
const GROUPS = {
  year: () => groupBy(BY_YEAR, (m) => `${Math.floor(m.year / 10) * 10}s`),
  brand: () => groupBy(BY_YEAR, brandOf).sort((a, b) => (a[0] === 'Player-built') - (b[0] === 'Player-built') || byCount(a, b)),
  type: () => groupBy(BY_YEAR, (m) => TYPE[m.type]),
  player: () => PLAYERS.map((p) => [p, BY_YEAR.filter((m) => m.from === p)]),
};
function groupBy(list, key) {
  const map = new Map();
  for (const m of list) { const k = key(m); if (!map.has(k)) map.set(k, []); map.get(k).push(m); }
  return [...map];
}

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const mod = (a, n) => ((a % n) + n) % n;

const stage = document.getElementById('stage');
const titleEl = document.getElementById('title');
const info = document.getElementById('info');
const src = document.getElementById('src');
const sorter = document.getElementById('sorter');

/* ---------- 사진 ---------- */
// 한 모델에 사진이 둘: 흐름에서 한 바퀴의 정반대 자리로 한 번 더 지나간다(같은 사진이 한 화면에 함께 보이지 않는다).
// 정렬·크게 보기에는 첫째(primary)만 쓰고 둘째는 흐름에만 나온다.
const tiles = MODELS.flatMap((m) => [true, false].map((primary) => {
  const el = document.createElement('a');
  el.className = 'tile';
  el.href = `#${m.id}`;
  el.innerHTML = `<img src="${IMG}${m.id}.jpg" alt="${esc(m.alt)}" decoding="async" draggable="false" /><span class="t-cap" aria-hidden="true"><b>${esc(m.name)}</b><span>${esc(m.yearText)}</span></span>`;
  el.setAttribute('aria-label', `${m.name}, ${m.maker}, ${m.yearText}`);
  if (!primary) { el.tabIndex = -1; el.setAttribute('aria-hidden', 'true'); }
  stage.appendChild(el);
  // 내려받기 전의 빈 회색 칸이 보이지 않게, 사진이 오면 맺힌다
  const im = el.firstChild;
  const show = () => im.classList.add('is-in');
  if (im.complete) show(); else { im.addEventListener('load', show); im.addEventListener('error', show); }
  return {
    m, el, primary, x: 0, y: 0, w: 0, o: 0,
    size: 0.8 + 0.45 * Math.random(), // 같은 겹 안의 크기 차이 — 큰 차이는 겹(LAYERS)이 만든다
    layer: 1,
    ghost: false,
    rate: 2.4 + Math.random() * 2.6, // 정렬할 때 옮겨 가는 빠르기 — 사진마다 달라 유기적으로 보인다
  };
}));
const twin = (t) => tiles[tiles.indexOf(t) + (t.primary ? 1 : -1)];

const setGhost = (t, g) => { t.ghost = g; t.el.classList.toggle('is-ghost', g); };
// 다시 고를 때 — 이미 보이는 다른 사진과 겹치는 자리면 회색 박스로 남는다(사진끼리 포개지지 않게)
const hitsReal = (t) => tiles.some((o) => o !== t && !o.ghost && o.o > 0.5
  && t.x < o.x + o.w && o.x < t.x + t.w && t.y < o.y + o.w / o.m.ar && o.y < t.y + t.w / t.m.ar);
// 화면 밖에서만 고른다(보이는 동안에는 바뀌지 않는다). 최근에 사진으로 지나간 모델은 한동안 박스로, 오래 안 보인 모델은 사진이 되기 쉽게 — 계속 흘러도 같은 사진만 되풀이되지 않는다
let rollN = 0;
const lastReal = {};
const roll = (t) => {
  rollN++;
  const since = rollN - (lastReal[t.m.id] ?? -1e9);
  const pReal = since < 24 ? 0.06 : since < 60 ? 1 - FLOW.ghost : 0.62;
  const real = Math.random() < pReal && !hitsReal(t);
  if (real) lastReal[t.m.id] = rollN;
  setGhost(t, !real);
};

let mode = 'flow';
let openId = null;
let flowT = 0, flowC = 0;     // 흐름 위치(한 화면 = 1)
let scrollT = 0, scrollC = 0; // 정렬 화면 스크롤(px)
let maxScroll = 0;
let hover = 0;                // 사진을 가리키면 흐름이 멈춘다
let labels = [];
let vw = innerWidth, vh = innerHeight, narrow = vw < 760;

/* 흐름 — Getty "the World of the GPI"처럼: 화면 아래 바깥의 소실점에서 사진이 올라오며 점점 커지고 바깥으로 퍼진다(원근).
   가운데 제목 둘레는 타원으로 비워 두되, 화면 전체의 사진이 제목에서 멀수록 덜, 가까울수록 더 밀려난다. */
// 소실점 높이(화면 높이 배수) · 초당 흐름(한 화면=1) · 겹침 검사 횟수 · 회색 박스로 지나가는 비율(가리키면 사진이 드러난다)
const FLOW = { vp: 2.6, speed: 0.028, samples: 48, ghost: 0.6 };
// 깊이 — 먼 겹은 작고 느리게, 가까운 겹은 크고 빠르게(Getty처럼 겹마다 속도가 달라 깊이가 느껴진다). share: 사진이 그 겹에 놓일 비율
// sway: 마우스가 화면 끝에 있을 때 그 겹이 커서 반대쪽으로 비켜나는 거리(px)
const LAYERS = [
  { speed: 0.6, scale: 0.66, share: 0.4, sway: 10 },
  { speed: 1, scale: 1, share: 0.35, sway: 20 },
  { speed: 1.5, scale: 1.38, share: 0.25, sway: 34 },
];
let F = null;

// 흐름 위치 p(0=화면 아래 바깥, 1=화면 위 바깥)에서 사진의 화면 사각형
function flowAt(t, p) {
  const s = 1 / (F.qIn - F.dq * p);
  const sc = s / F.sMid;                      // 화면 가운데 높이에서 1
  const w = t.w0 * sc, h = w / t.m.ar;
  // 사진 가운데. 위로 갈수록 바깥으로 퍼지는 원근은 약하게(크기는 그대로 커진다)
  let x = vw / 2 + t.u * (1 + (sc - 1) * 0.3), y = F.VPy - s;
  // 제목 둘레 — 눈(아몬드) 모양: 아래에서 올라오며 제목 높이에서 제목 가장자리까지 벌어지고, 지나가면 다시 원래 줄로 모인다.
  // 세로로 긴 타원으로 가로 방향만 민다. r을 (rⁿ+1)^(1/n)로 — 제목 높이에서 정확히 가장자리, 위아래로 갈수록 0
  // 제목 글자 높이(사진 절반 포함) 안에서는 끝까지 밀어 두고, 그 위아래로 ay에 걸쳐 원래 줄로 돌아온다
  const ax = F.tw + w / 2, ay = vh * 0.5;
  const dx = (x - F.cx) / ax, dy = Math.max(0, Math.abs(y - F.cy) - F.th - h / 2) / ay;
  const r = Math.hypot(dx, dy) || 1e-4;
  x = F.cx + dx * (Math.pow(r ** 2.6 + 1, 1 / 2.6) / r) * ax;
  return { x: x - w / 2, y: y - h / 2, w, h };
}
const sampleRects = (t) => Array.from({ length: FLOW.samples }, (_, i) => {
  const p = mod(t.p0 + (i * F.P) / FLOW.samples, F.P);
  return p < 1 ? flowAt(t, p) : null;
});
// Getty처럼 가장자리끼리는 조금 겹쳐도 된다(작은 쪽 변의 g만큼). 진짜 사진이 박스 위에 온다
const hits = (a, b, g) => a.some((r, i) => {
  const q = b[i];
  if (!r || !q) return false;
  const sx = g * Math.min(r.w, q.w), sy = g * Math.min(r.h, q.h);
  return r.x < q.x + q.w - sx && q.x < r.x + r.w - sx && r.y < q.y + q.h - sy && q.y < r.y + r.h - sy;
});

function layoutFlow() {
  const VPy = vh * FLOW.vp, m = vh * 0.34; // m: 화면 위아래 바깥 여유(가장 큰 사진의 절반쯤)
  const sIn = VPy - vh - m, sOut = VPy + m;
  F = {
    VPy, qIn: 1 / sIn, dq: 1 / sIn - 1 / sOut, sMid: VPy - vh / 2, P: 2.1,
    cx: (titleBox.left + titleBox.right) / 2, cy: (titleBox.top + titleBox.bottom) / 2,
    tw: ((titleBox.right - titleBox.left) / 2) * 0.98, th: ((titleBox.bottom - titleBox.top) / 2) * 1.05,
  };
  // 크기 — 넓이가 비슷하게(가로/세로 비율 보정) 한 뒤 사진마다 크기 배수를 곱한다
  const B = narrow ? vw * 0.22 : clamp(vw * 0.085, 110, 220);
  for (const t of tiles) {
    if (t.primary) { const r = Math.random(); t.layer = r < LAYERS[0].share ? 0 : r < LAYERS[0].share + LAYERS[1].share ? 1 : 2; }
    else t.layer = twin(t).layer; // 둘째 사진은 첫째와 같은 겹(같은 속도라야 한 바퀴 정반대 자리가 유지된다)
    t.el.dataset.layer = t.layer;
    t.w0 = B * t.size * LAYERS[t.layer].scale * Math.sqrt(t.m.ar);
    const hMax = vh * (narrow ? 0.3 : 0.44);
    if (t.w0 / t.m.ar > hMax) t.w0 = hMax * t.m.ar;
  }
  // 큰 사진부터, 한 바퀴 도는 동안 같은 겹의 다른 사진과 겹치지 않는 자리를 찾는다(다른 겹끼리는 앞뒤로 지나간다)
  const gap = 0.2, uMax = vw * 0.56, uMin = narrow ? 0 : F.tw * 0.25; // 정가운데 줄만 뺀다(제목 앞에서 좌우 어느 쪽으로 갈지 갈리지 않게)
  const area = (t) => t.w0 * t.w0 / t.m.ar;
  const order = tiles.filter((t) => t.primary).sort((a, b) => area(twin(b)) + area(b) - area(twin(a)) - area(a));
  const lane = () => (Math.random() < 0.5 ? -1 : 1) * (uMin + Math.random() * (uMax - uMin));
  for (let attempt = 0; attempt < 6; attempt++) {
    const placed = [];
    let ok = true;
    for (const t of order) {
      const d = twin(t);
      let rs = null;
      for (let k = 0; k < 420 && !rs; k++) {
        t.u = lane(); d.u = lane();
        t.p0 = Math.random() * F.P; d.p0 = mod(t.p0 + F.P / 2, F.P);
        const a = sampleRects(t), b = sampleRects(d);
        if (!hits(a, b, gap) && !placed.some((o) => o.L === t.layer && (hits(o.rs, a, gap) || hits(o.rs, b, gap)))) rs = [a, b];
      }
      if (!rs) { if (attempt < 5) { ok = false; break; } rs = [sampleRects(t), sampleRects(d)]; }
      placed.push({ L: t.layer, rs: rs[0] }, { L: t.layer, rs: rs[1] });
    }
    if (ok) break;
    F.P *= 1.15; // 자리가 모자라면 흐름 한 바퀴를 늘린다(한 화면에 보이는 사진이 줄어든다)
  }
}

function flowTarget(t) {
  const p = mod(t.p0 + flowC * LAYERS[t.layer].speed, F.P);
  const r = flowAt(t, p < 1 ? p : 0); // 한 바퀴의 나머지 동안은 화면 아래 바깥에서 기다린다
  const sw = LAYERS[t.layer].sway;
  return { x: r.x - sway.x * sw, y: r.y - sway.y * sw * 0.6, w: r.w, o: p < 1 ? 1 : 0 };
}

// 마우스 — 화면 가운데에서 얼마나 떨어졌는지(-1~1)를 천천히 따라간다. 터치·움직임 줄이기에서는 쓰지 않는다
const sway = { x: 0, y: 0, tx: 0, ty: 0 };
if (!reduce) addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse') return;
  sway.tx = clamp((e.clientX / vw) * 2 - 1, -1, 1);
  sway.ty = clamp((e.clientY / vh) * 2 - 1, -1, 1);
}, { passive: true });
document.documentElement.addEventListener('pointerleave', () => { sway.tx = sway.ty = 0; });

/* 정렬 — 왼쪽에 묶음 이름, 오른쪽에 높이가 같은 사진이 같은 간격으로 줄 바꿈 */
let groupPos = new Map();
function layoutGroups() {
  groupPos = new Map();
  labels.forEach((l) => l.el.remove());
  labels = [];
  if (mode === 'flow') return;
  const g = parseFloat(getComputedStyle(document.querySelector('.bar')).paddingLeft); // --gutter(clamp)를 px로
  const gap = narrow ? 12 : 22;
  const rh = narrow ? 112 : clamp(vh * 0.2, 120, 250);
  const capH = narrow ? 34 : 40;
  const labelW = narrow ? 0 : clamp(vw * 0.2, 180, 400);
  const x0 = g + labelW, x1 = vw - g;
  let gy = narrow ? 92 : 128;
  for (const [name, items] of GROUPS[mode]()) {
    const el = document.createElement('p');
    el.className = 'glabel';
    el.innerHTML = `<b>${esc(name).replace(/(\d)s$/, '$1<i>s</i>')}</b><span>${items.length} ${items.length === 1 ? 'model' : 'models'}</span>`;
    if (!narrow) el.style.width = `${labelW - 32}px`; // 긴 이름(Eddie Van Halen)은 칸 안에서 줄을 바꾼다
    stage.appendChild(el);
    labels.push({ el, x: g, y: gy });
    let y = narrow ? gy + el.offsetHeight + 20 : gy;
    let x = x0;
    for (const m of items) {
      const w = rh * m.ar;
      // 좁은 사진은 아래 이름이 옆 이름과 겹치지 않게 이름 폭만큼 자리를 둔다
      const slot = Math.max(w, tiles.find((t) => t.m === m).el.querySelector('.t-cap').offsetWidth + 6);
      if (x > x0 && x + slot > x1) { x = x0; y += rh + capH; }
      groupPos.set(m.id, { x, y, w });
      x += slot + gap;
    }
    if (!narrow) y = Math.max(y, gy + el.offsetHeight - rh - capH + 40);
    gy = y + rh + capH + (narrow ? 56 : clamp(vh * 0.13, 90, 160));
  }
  maxScroll = Math.max(0, gy - vh + 40);
  scrollT = clamp(scrollT, 0, maxScroll);
}

function openTarget(t) {
  const ar = t.m.ar;
  let h, w, x, y;
  if (narrow) {
    h = vh * 0.44; w = h * ar;
    if (w > vw - 36) { w = vw - 36; h = w / ar; }
    x = (vw - w) / 2; y = 76 + (vh * 0.44 - h) / 2;
  } else {
    h = vh * 0.74; w = h * ar;
    const maxW = vw * 0.46;
    if (w > maxW) { w = maxW; h = w / ar; }
    x = (vw * 0.52 - w) / 2 + vw * 0.01; y = (vh - h) / 2 + 12;
  }
  return { x, y, w, o: 1 };
}

/* 정렬을 바꿀 때 — Getty처럼 사진이 먼저 가운데에 구(공) 모양으로 모여 천천히 돈 뒤, 새 배열로 펼쳐진다 */
const GATHER = 1300;  // 구로 모여 있는 시간(ms)
const SPREAD = 1600;  // 펼쳐지는 동안은 사진마다 다른 빠르기(t.rate)로
let gatherEnd = 0, gathering = false;
// 피보나치 구 — 사진이 고르게 퍼지고, 반지름을 조금씩 달리해 속이 찬 공처럼
tiles.forEach((t, i) => {
  t.sph = { th: i * 2.39996, ph: Math.acos(1 - (2 * (i + 0.5)) / tiles.length), r: 0.62 + 0.38 * Math.random() };
});
function sphereTarget(t) {
  const R = Math.min(vw, vh) * (narrow ? 0.4 : 0.3);
  const a = t.sph.th + performance.now() * 0.0006;    // 세로축으로 천천히 돈다
  const rr = R * t.sph.r, sp = Math.sin(t.sph.ph);
  const x3 = rr * sp * Math.cos(a), z3 = rr * sp * Math.sin(a), y3 = rr * Math.cos(t.sph.ph);
  const depth = (z3 / R + 1) / 2;                       // 0 = 뒤, 1 = 앞
  const w = R * 0.19 * (0.65 + 0.55 * depth) * Math.sqrt(t.m.ar);
  return { x: vw / 2 + x3 - w / 2, y: vh / 2 + y3 - w / t.m.ar / 2, w, o: 0.28 + 0.72 * depth, z: 10 + Math.round(depth * 20) };
}

function target(t) {
  if (openId === t.m.id && t.primary) return openTarget(t);
  if (gathering) return sphereTarget(t);
  let p;
  if (mode === 'flow') p = flowTarget(t);
  else {
    const gp = t.primary && groupPos.get(t.m.id);
    // 둘째 사진과 이 묶음에 없는 사진(Player에서 Timeline 모델)은 흐름 자리에서 사라진다
    p = gp ? { x: gp.x, y: gp.y - scrollC, w: gp.w, o: 1 } : { ...flowTarget(t), o: 0 };
  }
  if (openId) p.o = 0;
  return p;
}

/* ---------- 매 프레임 ---------- */
let titleBox = { left: 0, right: 0, top: 0, bottom: 0 };
function measureTitle() {
  // 큰 글자의 실제 폭 — 아래 한 줄은 더 좁아서 h1만 잰다. 높이는 두 줄 전체
  const r = titleEl.getBoundingClientRect();
  const h = titleEl.querySelector('h1').getBoundingClientRect();
  const pad = narrow ? 6 : 16;
  titleBox = { left: h.left - pad, right: h.right + pad, top: r.top - pad, bottom: r.bottom + pad };
}

let last = performance.now();
function frame(now = performance.now(), snap = false) {
  const dt = Math.min(250, Math.max(0, now - last)) / 1000; last = now; // 프레임이 드물어도(느린 기기·숨은 탭) 제시간에 도착
  const k = (rate) => (snap || reduce ? 1 : 1 - Math.exp(-rate * dt));
  if (mode === 'flow' && !openId && !reduce) flowT += FLOW.speed * (1 - hover) * dt;
  flowC += (flowT - flowC) * k(6);
  scrollC += (scrollT - scrollC) * k(7);
  sway.x += (sway.tx - sway.x) * k(2.5);
  sway.y += (sway.ty - sway.y) * k(2.5);
  const g = now < gatherEnd;
  if (g !== gathering) { gathering = g; document.body.classList.toggle('is-gather', g); }
  const spreading = now < gatherEnd + SPREAD;
  for (const t of tiles) {
    const p = target(t);
    const kk = k(gathering ? Math.max(t.rate, 5) : mode === 'flow' && !openId && !spreading ? 9 : t.rate);
    // 줄 끝에서 위로 넘어간 사진은 아래에서 바로 다시 나타난다(따라가며 화면을 가로지르지 않게)
    const inFlow = mode === 'flow' && !openId && !gathering;
    if (inFlow && t.pt && Math.abs(p.y - t.pt.y) > vh * 0.6) {
      t.x += p.x - t.pt.x; t.y += p.y - t.pt.y; t.w += p.w - t.pt.w;
      roll(t); // 한 바퀴 돌 때마다 박스·사진을 새로 정한다
    }
    t.pt = inFlow ? p : null;
    t.x += (p.x - t.x) * kk;
    t.y += (p.y - t.y) * kk;
    t.w += (p.w - t.w) * kk;
    t.o += (p.o - t.o) * kk;
    t.el.style.transform = `translate3d(${t.x.toFixed(1)}px,${t.y.toFixed(1)}px,0)`;
    t.el.style.width = `${t.w.toFixed(1)}px`;
    t.el.style.height = `${(t.w / t.m.ar).toFixed(1)}px`;
    t.el.style.opacity = t.o.toFixed(3);
    t.el.classList.toggle('is-off', p.o < 0.5);
    t.el.style.zIndex = openId === t.m.id && t.primary ? 40 : gathering ? p.z : mode === 'flow' ? 1 + t.layer + (t.ghost ? 0 : 3) : ''; // 사진은 박스 위, 그 안에서는 가까운 겹이 위
  }
  for (const l of labels) l.el.style.transform = `translate3d(${l.x}px,${(l.y - scrollC).toFixed(1)}px,0)`;
}
const loop = (now) => { frame(now); requestAnimationFrame(loop); };

/* ---------- 입력 ---------- */
function nudge(d) {
  if (openId) return;
  if (mode === 'flow') flowT += d / (vh * 1.3);
  else scrollT = clamp(scrollT + d, 0, maxScroll);
  if (document.hidden) frame(undefined, true);
}
addEventListener('wheel', (e) => {
  if (location.hash === '#sources') return;
  e.preventDefault();
  nudge(e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY);
}, { passive: false });

let touchY = null;
stage.addEventListener('touchstart', (e) => { touchY = e.touches[0].clientY; }, { passive: true });
stage.addEventListener('touchmove', (e) => {
  if (touchY === null) return;
  const y = e.touches[0].clientY;
  nudge((touchY - y) * 1.2);
  touchY = y;
  e.preventDefault();
}, { passive: false });
stage.addEventListener('touchend', () => { touchY = null; });

addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && (openId || location.hash === '#sources')) { location.hash = ''; return; }
  if (openId || location.hash === '#sources' || e.target.closest?.('button, input')) return;
  const page = vh * 0.8;
  const d = { ArrowDown: 80, ArrowUp: -80, PageDown: page, PageUp: -page, ' ': e.shiftKey ? -page : page }[e.key];
  if (d) { e.preventDefault(); nudge(d); }
  if (e.key === 'Home' && mode !== 'flow') scrollT = 0;
  if (e.key === 'End' && mode !== 'flow') scrollT = maxScroll;
});

stage.addEventListener('pointerover', (e) => { if (e.pointerType === 'mouse' && e.target.closest('.tile')) hover = 1; });
stage.addEventListener('pointerout', (e) => { if (!e.relatedTarget?.closest?.('.tile')) hover = 0; });
// 정렬 화면에서 키보드로 화면 밖 사진에 닿으면 그 사진이 보이게
stage.addEventListener('focusin', (e) => {
  const t = tiles.find((x) => x.el === e.target);
  if (!t) return;
  if (mode === 'flow') { hover = 1; return; }
  const gp = groupPos.get(t.m.id);
  if (gp && (gp.y - scrollT < 90 || gp.y - scrollT + gp.w / t.m.ar > vh - 90)) scrollT = clamp(gp.y - vh * 0.35, 0, maxScroll);
});
stage.addEventListener('focusout', () => { hover = 0; });

// 사진이 아닌 곳을 누르면 크게 보기를 닫는다
stage.addEventListener('click', (e) => {
  const t = tiles.find((x) => x.el === e.target.closest('.tile'));
  if (t && !t.primary) Object.assign(twin(t), { x: t.x, y: t.y, w: t.w, o: t.o }); // 누른 둘째 자리에서 크게 열린다
  if (openId && !t) location.hash = '';
});

sorter.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b || b.dataset.mode === mode) return;
  setMode(b.dataset.mode);
});
function setMode(m) {
  mode = m;
  document.body.dataset.mode = m;
  sorter.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === m)));
  scrollT = scrollC = 0;
  layoutGroups();
  if (!reduce && !document.hidden) gatherEnd = performance.now() + GATHER;
  if (document.hidden) frame(undefined, true);
}

let resizeT;
addEventListener('resize', () => {
  clearTimeout(resizeT);
  resizeT = setTimeout(() => {
    vw = innerWidth; vh = innerHeight; narrow = vw < 760;
    measureTitle(); layoutFlow(); layoutGroups();
    frame(undefined, true);
  }, 120);
});

/* ---------- 크게 보기 · 출처 ---------- */
function renderInfo(m) {
  const i = BY_YEAR.indexOf(m);
  const next = BY_YEAR[(i + 1) % BY_YEAR.length];
  const seen = m.from === 'Timeline'
    ? `<a href="${TL}">Timeline</a>`
    : `<a href="${m.link}">${esc(m.from)}</a>`;
  const credit = m.url
    ? `Photograph: <a href="${esc(m.url)}" target="_blank" rel="noopener">${esc(m.credit)}</a>`
    : `Photograph: credited in the <a href="${TL}">Timeline</a> sources for the ${esc(m.maker)} ${esc(m.name)}.`;
  info.innerHTML = `
    <h2 class="i-name">${esc(m.name)}</h2>
    <dl class="i-meta">
      <div><dt>Maker</dt><dd>${esc(m.maker)}</dd></div>
      <div><dt>Year</dt><dd>${esc(m.yearText)}</dd></div>
      <div><dt>Type</dt><dd>${esc(TYPE[m.type].replace(/s$/, ''))}</dd></div>
      <div><dt>${m.from === 'Timeline' ? 'Chapter in' : 'Played by'}</dt><dd>${seen}</dd></div>
    </dl>
    <p class="i-credit">${credit}</p>
    <p class="i-nav"><a href="#">All models</a><a href="#${next.id}">Next: ${esc(next.name)}</a></p>`;
}

function renderSources() {
  src.innerHTML = `
    <h2>Sources</h2>
    <p>One photograph per model, resized for this page. Text and further photographs are credited on the Timeline and Artists pages.</p>
    <ol>${BY_YEAR.map((m) => `<li><b>${esc(m.maker === m.name ? m.name : `${m.maker} ${m.name}`)}</b><span>${m.url
      ? `<a href="${esc(m.url)}" target="_blank" rel="noopener">${esc(m.credit)}</a>`
      : `Credited in the <a href="${TL}">Timeline</a> sources`}</span></li>`).join('')}</ol>
    <a class="back" href="#">All models</a>`;
}

function route() {
  const id = location.hash.slice(1);
  const m = MODELS.find((x) => x.id === id);
  const wasOpen = openId;
  openId = m ? m.id : null;
  document.body.classList.toggle('is-open', !!m);
  if (m) renderInfo(m);
  src.hidden = id !== 'sources';
  document.body.classList.toggle('is-src', !src.hidden);
  if (!src.hidden) renderSources();
  document.title = m ? `GEARSHED — ${m.name}` : id === 'sources' ? 'GEARSHED — Gallery · Sources' : 'GEARSHED — Gallery';
  if (m) info.querySelector('a[href="#"]')?.focus({ preventScroll: true });
  else if (wasOpen) tiles.find((t) => t.m.id === wasOpen)?.el.focus({ preventScroll: true });
  if (document.hidden) frame(undefined, true);
}
addEventListener('hashchange', route);

/* ---------- 시작 ---------- */
measureTitle();
layoutFlow();
tiles.forEach((t) => { const real = Math.random() >= FLOW.ghost; if (real) lastReal[t.m.id] = 0; setGhost(t, !real); });
route();
// 처음엔 제자리에 놓고 천천히 맺힌다. 숨은 탭(rAF가 멈춤)에서는 바로 보이게
for (const t of tiles) { Object.assign(t, target(t)); if (!document.hidden && !reduce) t.o = 0; }
frame(undefined, document.hidden);
requestAnimationFrame(loop);
// 서체가 늦게 오면 제목 폭이 달라지므로 자리를 다시 잡는다(사진이 맺히는 동안이라 눈에 띄지 않는다)
document.fonts?.ready.then(() => {
  const w = titleBox.right - titleBox.left;
  measureTitle();
  if (Math.abs(titleBox.right - titleBox.left - w) > w * 0.03) layoutFlow();
});
