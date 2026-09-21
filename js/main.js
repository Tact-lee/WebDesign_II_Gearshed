/* =========================================================
   GEARSHED — Timeline / Stratocaster 1950s
   - three.js 실시간 3D 뷰어 + 스크롤 카메라 연출
   - 거대한 연도 레이어, 3D 주석, 사운드 인터랙션
   ========================================================= */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import Lenis from 'lenis';

const DEBUG = new URLSearchParams(location.search).has('debug');
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/* ---------------------------------------------------------
   1. 카메라 키프레임 (모델 좌표: 기타 전체 높이 = 1, 바디 아래 y=-0.5, 헤드 위 y=+0.5)
   focus : 화면 중심에 올 모델 좌표
   rot   : 기타 회전 [x, y(긴 축 회전), z(눕히기)]  — Euler 'XZY'
   dist  : 카메라 거리 (작을수록 확대)
   off   : 화면 오프셋 (뷰포트 비율, +x 오른쪽 / +y 위)
   --------------------------------------------------------- */
const CAMS = {
  hero:        { focus: [0, 0.02, 0],         rot: [0.12, -0.45, -0.28], dist: 1.85, off: [0.2, 0.0], spin: 1 },
  origin:      { focus: [0, 0, 0],            rot: [0.2, 0.75, -0.55],   dist: 2.2,  off: [0.17, 0] },
  shape:       { focus: [0, -0.24, 0],        rot: [0.04, -0.1, 0.06],   dist: 1.3, off: [-0.2, 0] },
  contour:     { focus: [-0.02, -0.26, 0],    rot: [0.18, 2.55, 0.22],   dist: 1.05, off: [0.2, 0] },
  tremolo:     { focus: [0.005, -0.34, 0.02], rot: [0.62, -0.4, 0.32],   dist: 0.5,  off: [0.2, 0] },
  tremPatent:  { focus: [0, -0.3, 0],         rot: [0.25, 0.35, 0.95],   dist: 1.0,  off: [0.26, 0] },
  tremSpec:    { focus: [0.01, -0.33, -0.02], rot: [0.35, -2.8, -0.2],   dist: 0.55, off: [-0.2, 0] },
  whammy:      { focus: [0.005, -0.35, 0.02], rot: [0.5, -0.45, 0.18],   dist: 0.52, off: [0.22, 0.02] },
  pickups:     { focus: [0, -0.25, 0.02],     rot: [0.1, 0.12, -0.12],   dist: 0.6,  off: [-0.22, 0] },
  switch:      { focus: [0.03, -0.27, 0.02],  rot: [0.14, -0.18, 0.12],  dist: 0.66, off: [0.22, 0] },
  controls:    { focus: [0.08, -0.34, 0.02],  rot: [0.45, -0.35, 0.25],  dist: 0.48, off: [-0.24, 0] },
  headstock:   { focus: [-0.01, 0.43, 0],     rot: [0.25, 0.5, -0.25],   dist: 0.42, off: [0.2, 0] },
  sunburst:    { focus: [0, -0.28, 0],        rot: [0.12, -0.35, -0.4],  dist: 1.05, off: [-0.18, 0] },
  launch:      { focus: [0, 0, 0],            rot: [0.1, 0.0, 0.0],      dist: 2.7,  off: [0.0, 0.0], spin: 0.6 },
  evo:         { focus: [0, 0, 0],            rot: [0.25, 0, 1.5708],    dist: 1.85, off: [0.04, 0.22], evo: 1 },
  outro:       { focus: [0, 0, 0],            rot: [0.1, -0.35, -1.15],  dist: 2.7,  off: [0, 0.3], spin: 1 },
};

/* ---------------------------------------------------------
   2. 3D 주석 (모델 좌표) — ?debug 모드에서 모델을 클릭하면 좌표가 콘솔에 찍힘
   d: 라벨 오프셋(px)
   --------------------------------------------------------- */
const ANNOS = {
  hornUpper:   { p: [-0.102, -0.034, 0.009],  t: 'Upper horn',       s: 'Borrowed from the P-Bass',          d: [-170, -60] },
  hornLower:   { p: [0.124, -0.108, 0.011],   t: 'Lower horn',       s: 'Room to reach the high frets',      d: [40, -130] },
  waist:       { p: [0.133, -0.22, 0.01],     t: 'Offset waist',     s: 'An asymmetric outline',             d: [60, 150] },
  bellyCut:    { p: [-0.074, -0.172, -0.027], t: 'Belly cut',        s: 'Where the body meets your ribs',    d: [-190, -70] },
  edge:        { p: [-0.146, -0.346, 0.0],    t: 'Rounded edge',     s: 'No more hard corners',              d: [-170, 60] },
  bridge:      { p: [0.005, -0.352, 0.021],   t: 'Tremolo bridge',   s: 'The whole unit moves with the strings', d: [-210, -70] },
  saddles:     { p: [-0.02, -0.355, 0.022],   t: '6 saddles',        s: 'Height & length per string',        d: [-190, 60] },
  pivot:       { p: [0.03, -0.339, 0.02],     t: 'Knife-edge pivot', s: 'Rocks on six screws',               d: [170, -60] },
  tremCover:   { p: [0.013, -0.305, -0.028],  t: 'Back cavity',      s: 'Where the springs hide',            d: [170, -60] },
  springs:     { p: [0.012, -0.36, -0.028],   t: 'Springs 3 → 5',    s: 'Balanced against string tension',   d: [170, 60] },
  puNeck:      { p: [0.0, -0.184, 0.018],     t: 'Neck',             s: 'Alnico 3 single coil',              d: [180, -50] },
  puMid:       { p: [0.0, -0.245, 0.018],     t: 'Middle',           s: 'Staggered pole pieces',             d: [200, 0] },
  puBridge:    { p: [0.0, -0.3, 0.018],       t: 'Bridge',           s: 'Slanted — no tone control',         d: [180, 50] },
  switch:      { p: [0.093, -0.287, 0.014],   t: '3-way switch',     s: '+ two unofficial in-betweens',      d: [150, -70] },
  vol:         { p: [0.054, -0.311, 0.03],    t: 'Volume',           s: 'Master volume',                     d: [240, -110] },
  tone1:       { p: [0.09, -0.332, 0.03],     t: 'Tone 1',           s: 'Neck pickup',                       d: [230, -30] },
  tone2:       { p: [0.122, -0.359, 0.031],   t: 'Tone 2',           s: 'Middle pickup',                     d: [200, 40] },
  jack:        { p: [0.087, -0.405, 0.0],     t: 'Output jack',      s: 'Angled into the face',              d: [170, 110] },
  tuners:      { p: [-0.03, 0.46, 0.0],       t: '6-in-line tuners', s: 'All on one side',                   d: [-200, -50] },
  retainer:    { p: [0.002, 0.435, 0.013],    t: 'String tree',      s: 'This model: post-1956 butterfly',   d: [170, 50] },
  burstEdge:   { p: [-0.136, -0.394, 0.006],  t: 'Dark Salem',       s: 'Brownish-black edges',              d: [-30, 150] },
  burstCenter: { p: [-0.07, -0.37, 0.012],    t: 'Canary Yellow',    s: 'A golden center',                   d: [-70, -190] },
};

/* 픽업 위치 (선택기 하이라이트) */
const PICKUPS = [
  { p: [0.0, -0.184, 0.019], w: 0.075, r: 0 },
  { p: [0.0, -0.245, 0.019], w: 0.075, r: 0 },
  { p: [0.0, -0.3, 0.019],   w: 0.075, r: -0.16 },
];

/* =========================================================
   3. SMOOTH SCROLL
   ========================================================= */
const lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
lenis.stop();

/* =========================================================
   4. THREE.JS STAGE
   ========================================================= */
const canvas = $('#stage');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, innerWidth / innerHeight, 0.01, 50);
camera.position.set(0, 0, 2);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.9;

const key = new THREE.DirectionalLight(0xfff1e0, 2.2);
key.position.set(2, 3, 4);
scene.add(key);
const rim = new THREE.DirectionalLight(0xffd7a8, 1.6);
rim.position.set(-3, 1, -3);
scene.add(rim);
scene.add(new THREE.AmbientLight(0xffffff, 0.25));

// pivot(회전/위치) → modelSpace(focus 오프셋) → norm(정규화) → fix(기울기 보정) → gltf
const pivot = new THREE.Group();
pivot.rotation.order = 'XZY';
scene.add(pivot);
const modelSpace = new THREE.Group();
pivot.add(modelSpace);

/* 픽업 하이라이트용 글로우 */
const glowMat = () => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  uniforms: { uI: { value: 0 }, uC: { value: new THREE.Color(0xffa640) } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader: `varying vec2 vUv; uniform float uI; uniform vec3 uC;
    void main(){ vec2 q=abs(vUv-.5)*2.; q.x=pow(q.x,4.); float d=max(q.x, q.y*.9);
      float a=smoothstep(1.,.15,d)*uI; gl_FragColor=vec4(uC*a*1.6, a*.9); }`,
});
const glows = PICKUPS.map((pu) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(pu.w * 1.45, 0.034), glowMat());
  m.position.set(...pu.p);
  m.rotation.z = pu.r;
  m.renderOrder = 10;
  modelSpace.add(m);
  return m;
});

/* 모델 로드 */
const manager = new THREE.LoadingManager();
const loader = new GLTFLoader(manager);
let model = null;

function onProgress(e) {
  if (!e.lengthComputable && !e.total) return;
  const pct = Math.round((e.loaded / (e.total || 13562328)) * 100);
  $('#loaderPct').textContent = Math.min(99, pct);
  $('.loader-progress').style.strokeDashoffset = 603.2 * (1 - Math.min(1, pct / 100));
}

loader.load('assets/model/stratocaster.glb', (gltf) => {
  const fix = new THREE.Group();
  fix.rotation.x = 0.2957; // 원본 모델이 뒤로 약 17° 기울어져 있어 세워줌
  fix.add(gltf.scene);
  const norm = new THREE.Group();
  norm.add(fix);
  norm.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(fix);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const s = 1 / size.y;
  norm.scale.setScalar(s);
  norm.position.set(-center.x * s, -center.y * s, -center.z * s);
  gltf.scene.traverse((o) => {
    if (o.isMesh) {
      o.material.envMapIntensity = 1;
      if (o.material.map) o.material.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
    }
  });
  modelSpace.add(norm);
  model = norm;
  window.__norm = { size: size.toArray(), s };
  start();
}, onProgress, (err) => {
  console.error(err);
  $('.loader-note').textContent = 'Couldn’t load the 3D model — open this page through a local server.';
});

/* =========================================================
   5. SCROLL ANCHORS (data-cam 요소들)
   ========================================================= */
let anchors = [];
function measureAnchors() {
  const H = innerHeight;
  anchors = $$('[data-cam]').map((el) => {
    const focusEl = el.matches("section") && el.querySelector(":scope > .panel") || el;
    const r = focusEl.getBoundingClientRect();
    const top = r.top + scrollY;
    let at = top + r.height / 2 - H / 2;
    if (el.classList.contains('hero')) at = 0;
    if (el.id === 'evo') at = el.getBoundingClientRect().top + scrollY + H * 0.15;
    return { el, at, cam: CAMS[el.dataset.cam], name: el.dataset.cam,
      annos: (el.dataset.annos || '').split(',').filter(Boolean) };
  }).sort((a, b) => a.at - b.at);
}

/* 현재 스크롤 → 키프레임 보간 */
const target = { focus: new THREE.Vector3(), rot: new THREE.Vector3(), dist: 2, off: new THREE.Vector2(), spin: 0, evo: 0 };
const state = { focus: new THREE.Vector3(), rot: new THREE.Vector3(), dist: 2, off: new THREE.Vector2(), spin: 0, evo: 0 };
let activeAnchor = null;
let anchorCloseness = 0;

function computeTarget(y) {
  if (!anchors.length) return;
  let i = 0;
  while (i < anchors.length - 1 && y >= anchors[i + 1].at) i++;
  const a = anchors[i];
  const b = anchors[Math.min(i + 1, anchors.length - 1)];
  let t = a === b ? 0 : clamp((y - a.at) / (b.at - a.at));
  // 각 앵커 근처에서 잠시 머물도록
  const tt = easeInOut(smooth(0.18, 0.82, t));
  const A = a.cam, B = b.cam;
  target.focus.set(lerp(A.focus[0], B.focus[0], tt), lerp(A.focus[1], B.focus[1], tt), lerp(A.focus[2], B.focus[2], tt));
  target.rot.set(lerp(A.rot[0], B.rot[0], tt), lerp(A.rot[1], B.rot[1], tt), lerp(A.rot[2], B.rot[2], tt));
  target.dist = lerp(A.dist, B.dist, tt);
  target.off.set(lerp(A.off[0], B.off[0], tt), lerp(A.off[1], B.off[1], tt));
  target.spin = lerp(A.spin || 0, B.spin || 0, tt);
  target.evo = lerp(A.evo || 0, B.evo || 0, tt);

  const near = t < 0.5 ? a : b;
  const d = t < 0.5 ? t : 1 - t;
  activeAnchor = near;
  anchorCloseness = 1 - smooth(0.12, 0.32, d);
}

/* =========================================================
   6. 연도 레이어
   ========================================================= */
const yearsEl = $('#years');
let yearItems = [];
function buildYears() {
  yearsEl.innerHTML = '';
  yearItems = $$('[data-year]').filter((el) => el.classList.contains('chapter')).map((el) => {
    const y = document.createElement('div');
    y.className = 'year';
    y.innerHTML = splitDigits(el.dataset.year);
    yearsEl.appendChild(y);
    return { el, y, text: el.dataset.year, evo: el.id === 'evo' };
  });
}
function splitDigits(str) { return [...str].map((c) => `<span class="digit">${c}</span>`).join(''); }

function setYearText(item, text) {
  if (item.text === text) return;
  item.text = text;
  item.y.innerHTML = splitDigits(text);
  item.y.animate([{ transform: 'translate(-50%,-44%)', filter: 'blur(8px)', offset: 0 }, { transform: 'translate(-50%,-50%)', filter: 'blur(0)' }],
    { duration: 700, easing: 'cubic-bezier(.22,1,.36,1)' });
  $$('.digit', item.y).forEach((d, k) => d.animate(
    [{ transform: 'translateY(30%)', opacity: 0 }, { transform: 'none', opacity: 1 }],
    { duration: 800, delay: k * 50, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' }));
}

function updateYears(y) {
  const H = innerHeight;
  for (const it of yearItems) {
    const r = it.el.getBoundingClientRect();
    let op, ty, sc;
    if (it.evo) {
      const p = clamp(-r.top / (r.height - H));
      const inn = smooth(-0.6 * H, 0, -r.top) * (1 - smooth(r.height - H * 1.2, r.height - H * 0.5, -r.top));
      op = inn; ty = lerp(8, -8, p); sc = 1;
    } else {
      const enter = H - r.top;               // 섹션 상단이 화면 아래로 들어온 뒤 스크롤한 거리
      const isHero = it.el.classList.contains('hero');
      const fadeIn = isHero ? 1 : smooth(0.1 * H, 0.7 * H, enter);
      const fadeOut = 1 - smooth((isHero ? 1.0 : 1.3) * H, (isHero ? 1.9 : 2.3) * H, enter);
      op = fadeIn * fadeOut;
      const p = clamp(enter / (2.4 * H));
      ty = lerp(18, -22, p);
      sc = lerp(1.14, 0.92, p);
    }
    it.y.style.opacity = op.toFixed(3);
    it.y.style.transform = `translate(-50%, calc(-50% + ${ty.toFixed(2)}vh)) scale(${sc.toFixed(4)})`;
    it.y.style.letterSpacing = `${lerp(-0.01, 0.04, clamp(op)) .toFixed(3)}em`;
  }
}

/* =========================================================
   7. 주석 (3D → 화면 투영)
   ========================================================= */
const annoSvg = $('#annos');
const annoLabels = $('#annoLabels');
const SVGNS = 'http://www.w3.org/2000/svg';
const annoNodes = {};
for (const [id, a] of Object.entries(ANNOS)) {
  const g = document.createElementNS(SVGNS, 'g');
  g.style.opacity = 0;
  const line = document.createElementNS(SVGNS, 'line');
  const ring = document.createElementNS(SVGNS, 'circle'); ring.setAttribute('class', 'ring'); ring.setAttribute('r', 7);
  const core = document.createElementNS(SVGNS, 'circle'); core.setAttribute('class', 'core'); core.setAttribute('r', 2.5);
  g.append(line, ring, core);
  annoSvg.appendChild(g);
  const lab = document.createElement('div');
  lab.className = 'anno-label' + (a.d[0] < 0 ? ' to-left' : '');
  lab.innerHTML = `<b>${a.t}</b><span>${a.s}</span>`;
  annoLabels.appendChild(lab);
  const anchor = new THREE.Object3D();
  anchor.position.set(...a.p);
  modelSpace.add(anchor);
  annoNodes[id] = { g, line, ring, lab, anchor, a, o: 0 };
}
const _v = new THREE.Vector3();
function updateAnnos(dt, time) {
  const list = activeAnchor ? activeAnchor.annos : [];
  const W = innerWidth, H = innerHeight;
  for (const [id, n] of Object.entries(annoNodes)) {
    const want = list.includes(id) ? anchorCloseness : 0;
    n.o = snapping ? want : lerp(n.o, want, 1 - Math.exp(-dt * 6));
    if (n.o < 0.01) { n.g.style.opacity = 0; n.lab.style.opacity = 0; continue; }
    n.anchor.getWorldPosition(_v);
    _v.project(camera);
    const x = (_v.x * 0.5 + 0.5) * W;
    const y = (-_v.y * 0.5 + 0.5) * H;
    const k = easeInOut(clamp(n.o));
    const lx = x + n.a.d[0] * k, ly = y + n.a.d[1] * k;
    n.line.setAttribute('x1', x); n.line.setAttribute('y1', y);
    n.line.setAttribute('x2', lx); n.line.setAttribute('y2', ly);
    n.ring.setAttribute('cx', x); n.ring.setAttribute('cy', y);
    n.ring.setAttribute('r', 6 + Math.sin(time * 3 + x) * 1.5);
    n.g.lastChild.setAttribute('cx', x); n.g.lastChild.setAttribute('cy', y);
    n.g.style.opacity = n.o;
    n.lab.style.opacity = smooth(0.5, 1, n.o);
    const ox = n.a.d[0] < 0 ? -8 : 8;
    n.lab.style.transform = `translate(${lx + ox}px, ${ly - 16}px) translateX(${n.a.d[0] < 0 ? '-100%' : '0'})`;
  }
}

/* =========================================================
   8. RAIL / PROGRESS
   ========================================================= */
const rail = $('#rail');
const railItems = $$('[data-rail]').map((el) => {
  const b = document.createElement('button');
  b.innerHTML = `<span>${el.dataset.rail}</span><i></i>`;
  b.addEventListener('click', () => lenis.scrollTo(el, { offset: el.id === 'evo' ? 0 : innerHeight * 0.1, duration: 2 }));
  rail.appendChild(b);
  return { el, b };
});
function updateRail(y) {
  let cur = railItems[0];
  for (const it of railItems) if (it.el.getBoundingClientRect().top < innerHeight * 0.5) cur = it;
  railItems.forEach((it) => it.b.classList.toggle('is-active', it === cur));
  const max = document.documentElement.scrollHeight - innerHeight;
  $('#progress span').style.transform = `scaleX(${clamp(y / max)})`;
}

/* =========================================================
   9. REVEAL / COUNTERS / PARALLAX PHOTOS
   ========================================================= */
$$('.panel, .evo-head, .launch-title, .mini-timeline, .price-cards, .outro-inner > *').forEach((el) => el.setAttribute('data-reveal', ''));
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    e.target.classList.add('is-in');
    $$('[data-count]', e.target).forEach(countUp);
    if (e.target.matches('[data-count]')) countUp(e.target);
    io.unobserve(e.target);
  }
}, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });
$$('[data-reveal], .reveal-photo').forEach((el) => io.observe(el));

function countUp(el) {
  if (el.dataset.done) return;
  el.dataset.done = 1;
  const to = parseFloat(el.dataset.count);
  const dec = parseInt(el.dataset.decimals || 0, 10);
  const t0 = performance.now();
  const dur = 1600;
  const tick = (now) => {
    const p = clamp((now - t0) / dur);
    const v = to * (1 - Math.pow(1 - p, 4));
    el.textContent = v.toFixed(dec);
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const parallaxEls = $$('[data-parallax]');
function updateParallax() {
  const H = innerHeight;
  for (const el of parallaxEls) {
    const r = el.getBoundingClientRect();
    if (r.bottom < -200 || r.top > H + 200) continue;
    const c = (r.top + r.height / 2 - H / 2) / H;
    el.style.translate = `0 ${(-c * parseFloat(el.dataset.parallax) * 100).toFixed(2)}vh`;
  }
}

/* =========================================================
   10. EVOLUTION — 가로 스크롤
   ========================================================= */
const evo = $('#evo');
const evoTrack = $('#evoTrack');
const evoCards = $$('.evo-card');
let evoProgress = 0;
function updateEvo() {
  const r = evo.getBoundingClientRect();
  const H = innerHeight;
  evoProgress = clamp(-r.top / (r.height - H));
  const dist = evoTrack.scrollWidth - innerWidth * 0.62;
  evoTrack.style.transform = `translate3d(${(-evoProgress * dist).toFixed(1)}px,0,0)`;
  $('#evoBar').style.transform = `scaleX(${evoProgress})`;
  let best = null, bd = Infinity;
  const focusX = innerWidth * 0.5;
  for (const c of evoCards) {
    const cr = c.getBoundingClientRect();
    const d = Math.abs(cr.left + cr.width / 2 - focusX);
    if (d < bd) { bd = d; best = c; }
  }
  evoCards.forEach((c) => c.classList.toggle('is-current', c === best));
  const yi = yearItems.find((i) => i.evo);
  if (yi && best) setYearText(yi, best.dataset.year);
}

/* =========================================================
   11. SOUND — Karplus-Strong 기타 합성
   ========================================================= */
let actx = null, master = null, soundOn = false;
let amp = null, ampMode = 'drive';
const bufCache = new Map();
const activeSources = new Set();
const CHORD = [82.41, 123.47, 164.81, 207.65, 246.94, 329.63]; // E major (clean)
const POWER = [82.41, 123.47, 164.81, 246.94];                // E5 파워코드 (drive)
// E 마이너 펜타토닉 리프 [주파수, 시작 시각(초)]
const RIFF = [[164.81, 0], [196.0, 0.18], [220.0, 0.36], [220.0, 0.54], [246.94, 0.72], [220.0, 0.9], [196.0, 1.08], [164.81, 1.26], [146.83, 1.5], [164.81, 1.7]];
// 픽업 위치 (브리지로부터의 거리 비율) — 브리지일수록 얇고 밝은 소리
const PU_POS = [[0.25], [0.25, 0.155], [0.155], [0.155, 0.068], [0.068]];
// 픽업별 보이싱 EQ — 드라이브를 거치면 차이가 더 확실히 들린다
const PU_EQ = [
  [['lowpass', 2400, 0.8], ['peaking', 180, 1, 4], ['peaking', 2500, 1, -4]],                          // neck: 둥글고 두꺼움
  [['lowpass', 5200, 0.7], ['peaking', 700, 1.2, -6], ['peaking', 3200, 1.2, 8]],                     // neck+mid: 유리알, 스쿱
  [['lowpass', 2900, 0.7], ['peaking', 600, 0.9, 3]],                                                 // middle: 중립
  [['lowpass', 6500, 0.7], ['peaking', 900, 1.4, -7], ['peaking', 2600, 1.4, 6], ['lowshelf', 200, 0, -4]], // mid+bridge: 쿽
  [['lowpass', 7500, 0.7], ['lowshelf', 250, 0, -7], ['highshelf', 2200, 0, 6]],                     // bridge: 얇고 쏘는
];
const AMP_MODES = {
  clean: { pre: 1.2, post: 0.6, curve: 1.2 },
  drive: { pre: 14, post: 0.2, curve: 5 },
};
const PU_DESC = [
  'Neck — round, warm and full.',
  'Neck + Mid — glassy and chimey. The first in-between secret.',
  'Middle — plain, balanced, neutral.',
  'Mid + Bridge — quacky and funky, a little nasal.',
  'Bridge — thin, bright and cutting. No tone knob.',
];

function ensureAudio() {
  if (actx) return actx;
  actx = new (window.AudioContext || window.webkitAudioContext)();
  master = actx.createGain();
  master.gain.value = 0;
  const comp = actx.createDynamicsCompressor();
  master.connect(comp).connect(actx.destination);
  amp = buildAmp();
  setAmp(ampMode);
  if (DEBUG) window.G.audio = { actx, master, amp };
  return actx;
}

/* 앰프 시뮬레이션: 입력 → 로우컷 → 프리 게인 → 웨이브셰이퍼(클리핑) → 톤 스택 → 캐비닛 → 룸 리버브 */
function biquad(type, freq, Q = 0.7, gain = 0) {
  const f = actx.createBiquadFilter();
  f.type = type; f.frequency.value = freq; f.Q.value = Q; f.gain.value = gain;
  return f;
}
function clipCurve(k) {
  const n = 2048, c = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    // 살짝 비대칭인 소프트 클리핑 (진공관 느낌)
    c[i] = x >= 0 ? Math.tanh(k * x) / Math.tanh(k) : Math.tanh(k * 0.85 * x) / Math.tanh(k * 0.85);
  }
  return c;
}
function buildAmp() {
  const input = actx.createGain();
  const lowCut = biquad('highpass', 90);
  const pre = actx.createGain();
  const tight = biquad('highpass', 140, 0.5);           // 클리핑 전 저음 정리 (뭉개짐 방지)
  const shaper = actx.createWaveShaper();
  shaper.oversample = '4x';
  const bass = biquad('lowshelf', 120, 0, 3);
  const mid = biquad('peaking', 750, 0.8, 2);
  const presence = biquad('peaking', 2400, 1, 3);
  const cab1 = biquad('lowpass', 5200, 0.9);            // 스피커 캐비닛: 고음 롤오프
  const cab2 = biquad('lowpass', 7000, 0.6);
  const cabNotch = biquad('peaking', 3800, 3, -5);
  const post = actx.createGain();
  input.connect(lowCut).connect(pre).connect(tight).connect(shaper)
    .connect(bass).connect(mid).connect(presence).connect(cab1).connect(cab2).connect(cabNotch).connect(post);
  // 작은 룸 리버브
  const verb = actx.createConvolver();
  const len = Math.floor(actx.sampleRate * 1.3);
  const ir = actx.createBuffer(2, len, actx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
  }
  verb.buffer = ir;
  const wet = actx.createGain(); wet.gain.value = 0.14;
  post.connect(master);
  post.connect(verb).connect(wet).connect(master);
  return { input, pre, tight, shaper, post };
}
function setAmp(mode) {
  ampMode = mode;
  $$('[data-amp]').forEach((b) => b.classList.toggle('is-on', b.dataset.amp === mode));
  if (!amp) return;
  const m = AMP_MODES[mode];
  const t = actx.currentTime;
  amp.shaper.curve = clipCurve(m.curve);
  amp.pre.gain.setTargetAtTime(m.pre, t, 0.02);
  amp.post.gain.setTargetAtTime(m.post, t, 0.02);
  amp.tight.frequency.setTargetAtTime(mode === 'drive' ? 140 : 40, t, 0.02);
}
function setSound(on) {
  ensureAudio();
  actx.resume();
  soundOn = on;
  master.gain.setTargetAtTime(on ? 0.9 : 0, actx.currentTime, 0.05);
  const t = $('#soundToggle');
  t.setAttribute('aria-pressed', on);
  $('.sound-label', t).textContent = on ? 'Sound on' : 'Sound off';
}
$('#soundToggle').addEventListener('click', () => setSound(!soundOn));

function pluckBuffer(pos, freqs = CHORD, strum = 0.018, dur = 3.2) {
  const k = `${pos.join('-')}|${freqs.join(',')}|${strum}|${dur}`;
  if (bufCache.has(k)) return bufCache.get(k);
  const sr = actx.sampleRate;
  const len = Math.floor(sr * dur);
  const out = new Float32Array(len);
  freqs.forEach((f, si) => {
    const N = Math.round(sr / f);
    const y = new Float32Array(len);
    let last = 0;
    for (let n = 0; n < N; n++) { last = last * 0.5 + (Math.random() * 2 - 1) * 0.5; y[n] = last; }
    const decay = 0.996 + Math.min(0.0035, f / 200000);
    for (let n = N + 1; n < len; n++) y[n] = decay * 0.5 * (y[n - N] + y[n - N - 1]);
    const offset = Math.floor(si * strum * sr);
    for (const p of pos) {
      const d = Math.max(1, Math.round(p * N));
      for (let n = d; n < len - offset; n++) out[n + offset] += (y[n] - y[n - d]) * (1 / pos.length);
    }
  });
  let peak = 0;
  for (let n = 0; n < len; n++) peak = Math.max(peak, Math.abs(out[n]));
  const g = 0.8 / (peak || 1);
  const fadeN = sr * 0.4;
  for (let n = 0; n < len; n++) out[n] *= g * (n > len - fadeN ? (len - n) / fadeN : 1);
  const buf = actx.createBuffer(1, len, sr);
  buf.copyToChannel(out, 0);
  bufCache.set(k, buf);
  return buf;
}

function play(pos, opts = {}) {
  ensureAudio();
  if (!soundOn) setSound(true);
  const src = actx.createBufferSource();
  src.buffer = pluckBuffer(pos, opts.freqs, opts.strum, opts.dur);
  src.playbackRate.value = Math.pow(2, bendSemis / 12);
  const g = actx.createGain();
  g.gain.value = opts.gain ?? 0.9;
  // 픽업 보이싱 EQ → 앰프 (clean 옵션이면 앰프 우회)
  let node = src;
  for (const [type, f, q, gain] of PU_EQ[opts.eq ?? 2]) node = node.connect(biquad(type, f, q, gain));
  node.connect(g).connect(opts.clean ? master : amp.input);
  const when = actx.currentTime + (opts.when || 0);
  if (opts.stopAt) { g.gain.setValueAtTime(g.gain.value, when + opts.stopAt); g.gain.setTargetAtTime(0, when + opts.stopAt, 0.03); }
  src.start(when);
  activeSources.add(src);
  src.onended = () => activeSources.delete(src);
  setTimeout(() => { vizEnergy = 1; }, (opts.when || 0) * 1000);
  return src;
}

/* 픽업 비교용: 코드 스트럼 / 리프 */
function strum(i) {
  if (ampMode === 'drive') play(PU_POS[i], { eq: i, freqs: POWER, strum: 0.012 });
  else play(PU_POS[i], { eq: i });
}
function riff(i) {
  RIFF.forEach(([f, t], n) => play(PU_POS[i], {
    eq: i, freqs: [f], strum: 0, dur: 1.4, when: t,
    stopAt: n === RIFF.length - 1 ? 1.2 : (RIFF[n + 1][1] - t) + 0.04,
  }));
}

/* 픽업 선택기 */
let puSel = 2;
const lever = $('#lever');
const selBtns = $$('#selector button');
function selectPickup(i, sound = true) {
  puSel = i;
  selBtns.forEach((b) => b.setAttribute('aria-checked', String(+b.dataset.pos === i)));
  lever.style.top = `${12 + i * 19}%`;
  $('#toneDesc').textContent = PU_DESC[i];
  if (sound) strum(i);
}
selBtns.forEach((b) => b.addEventListener('click', () => selectPickup(+b.dataset.pos)));
$('#strumBtn').addEventListener('click', () => strum(puSel));
$('#riffBtn').addEventListener('click', () => riff(puSel));
$$('[data-amp]').forEach((b) => b.addEventListener('click', () => {
  ensureAudio();
  setAmp(b.dataset.amp);
  strum(puSel);
}));
selectPickup(2, false);
const glowOn = (i) => ({ 0: [1, 0, 0], 1: [1, 1, 0], 2: [0, 1, 0], 3: [0, 1, 1], 4: [0, 0, 1] }[i]);

/* 트레몰로 암 */
let bendSemis = 0, vizEnergy = 0;
const whammy = $('#whammy');
const handle = $('.whammy-handle', whammy);
let dragging = false;
function setBend(v) {
  bendSemis = clamp(v, -3, 1);
  const pct = 25 + (-bendSemis / 3) * 75 * (bendSemis < 0 ? 1 : 0) - (bendSemis > 0 ? bendSemis * 25 : 0);
  handle.style.top = `${pct}%`;
  whammy.setAttribute('aria-valuenow', bendSemis.toFixed(1));
  $('#semiVal').textContent = (bendSemis > 0 ? '+' : '') + bendSemis.toFixed(1);
  if (actx) for (const s of activeSources) s.playbackRate.setTargetAtTime(Math.pow(2, bendSemis / 12), actx.currentTime, 0.02);
}
function bendFromPointer(e) {
  const r = whammy.getBoundingClientRect();
  const p = clamp((e.clientY - r.top) / r.height);
  setBend(p < 0.25 ? (0.25 - p) / 0.25 : -((p - 0.25) / 0.75) * 3);
}
whammy.addEventListener('pointerdown', (e) => {
  dragging = true; whammy.classList.add('is-drag'); whammy.setPointerCapture(e.pointerId);
  if (!activeSources.size) play(PU_POS[4], { eq: 4, freqs: [98, 146.83, 196, 293.66], strum: 0.01 });
  bendFromPointer(e);
});
whammy.addEventListener('pointermove', (e) => dragging && bendFromPointer(e));
const release = () => {
  if (!dragging) return;
  dragging = false; whammy.classList.remove('is-drag');
  const from = bendSemis, t0 = performance.now();
  const back = (now) => { // 스프링처럼 0으로 복귀 (살짝 흔들림)
    const t = (now - t0) / 700;
    if (dragging) return;
    setBend(from * Math.exp(-t * 4) * Math.cos(t * 9));
    if (t < 1.2) requestAnimationFrame(back); else setBend(0);
  };
  requestAnimationFrame(back);
};
whammy.addEventListener('pointerup', release);
whammy.addEventListener('pointercancel', release);
whammy.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown') { setBend(bendSemis - 0.25); e.preventDefault(); }
  if (e.key === 'ArrowUp') { setBend(bendSemis + 0.25); e.preventDefault(); }
});
$('#pickBtn').addEventListener('click', () => play(PU_POS[4], { eq: 4, freqs: [98, 146.83, 196, 293.66], strum: 0.01 }));

const viz = $('#stringViz');
const vctx = viz.getContext('2d');
function drawViz(time) {
  const w = viz.width, h = viz.height;
  vctx.clearRect(0, 0, w, h);
  vizEnergy *= 0.985;
  const rate = Math.pow(2, bendSemis / 12);
  for (let s = 0; s < 6; s++) {
    const y0 = 30 + s * 28;
    vctx.beginPath();
    vctx.lineWidth = 0.8 + (5 - s) * 0.35;
    vctx.strokeStyle = s < 3 ? '#8a6a3a' : '#4a4239';
    for (let x = 0; x <= w; x += 4) {
      const env = Math.sin((x / w) * Math.PI);
      const a = vizEnergy * 9 * env * Math.sin(time * (18 + s * 6) * rate + s);
      const y = y0 + a * Math.sin((x / w) * Math.PI * (1 + (s % 3)));
      x === 0 ? vctx.moveTo(x, y) : vctx.lineTo(x, y);
    }
    vctx.stroke();
  }
}

/* 선버스트 스와치 */
const BURSTS = {
  2: { bg: 'radial-gradient(ellipse 60% 62% at 50% 54%, #e8b43a 0%, #d99a2b 30%, #9a5315 52%, #3a1d0b 70%, #150a04 100%)',
    legend: [['#e8b43a', 'Canary Yellow'], ['#2a170c', 'Dark Salem']] },
  3: { bg: 'radial-gradient(ellipse 60% 62% at 50% 54%, #eab73d 0%, #d9982c 26%, #a8341b 46%, #5a1b0e 62%, #150a04 90%)',
    legend: [['#e8b43a', 'Yellow'], ['#a8341b', 'Red (1958 on)'], ['#2a170c', 'Dark Brown']] },
};
function setBurst(n) {
  $('#burstSwatch').style.background = BURSTS[n].bg;
  $('#burstLegend').innerHTML = BURSTS[n].legend.map(([c, t]) => `<li><i style="background:${c}"></i>${t}</li>`).join('');
  $$('[data-burst]').forEach((b) => b.classList.toggle('is-on', b.dataset.burst == n));
}
$$('[data-burst]').forEach((b) => b.addEventListener('click', () => setBurst(b.dataset.burst)));
setBurst(2);

/* coming soon */
const toast = $('#toast');
$$('[data-soon]').forEach((a) => a.addEventListener('click', (e) => {
  e.preventDefault();
  toast.textContent = 'Coming soon — the next chapter is in the works';
  toast.classList.add('is-on');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('is-on'), 1800);
}));

/* =========================================================
   12. MOUSE PARALLAX
   ========================================================= */
const mouse = new THREE.Vector2(), mouseS = new THREE.Vector2();
addEventListener('pointermove', (e) => {
  mouse.set((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1);
});

/* =========================================================
   13. LOOP
   ========================================================= */
const clock = new THREE.Clock();
let lastAnchorName = '';
let snapping = false;

function frame() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const time = clock.elapsedTime;
  const y = scrollY;

  if (!(DEBUG && window.G?.freeze)) computeTarget(y);
  snapping = window.G?.snapN > 0; // 디버그: 전환 없이 즉시 목표 포즈로
  if (snapping) window.G.snapN--;
  const k = snapping ? 1 : 1 - Math.exp(-dt * 3.2);
  state.focus.lerp(target.focus, k);
  state.rot.lerp(target.rot, k);
  state.dist = lerp(state.dist, target.dist, k);
  state.off.lerp(target.off, k);
  state.spin = lerp(state.spin, target.spin, k);
  state.evo = lerp(state.evo, target.evo, k);
  mouseS.lerp(DEBUG && window.G?.freeze ? new THREE.Vector2() : mouse, 1 - Math.exp(-dt * 2.5));

  const mobile = innerWidth < 900;
  modelSpace.position.set(-state.focus.x, -state.focus.y, -state.focus.z);
  pivot.rotation.set(
    state.rot.x + mouseS.y * 0.06,
    state.rot.y + mouseS.x * 0.12 + Math.sin(time * 0.35) * 0.45 * state.spin + state.evo * evoProgress * Math.PI * 2,
    state.rot.z + Math.sin(time * 0.5) * 0.015,
  );
  pivot.position.y = Math.sin(time * 0.8) * 0.004;
  camera.position.set(0, 0, state.dist * (mobile ? 1.75 : 1));
  const W = innerWidth, H = innerHeight;
  camera.setViewOffset(W, H, -(mobile ? 0 : state.off.x) * W, (state.off.y) * H, W, H);

  // 픽업 글로우: 픽업/스위치 앵커 근처에서만
  const inPU = activeAnchor && (activeAnchor.name === 'pickups' || activeAnchor.name === 'switch') ? anchorCloseness : 0;
  const on = glowOn(puSel);
  glows.forEach((g, i) => {
    const u = g.material.uniforms.uI;
    u.value = lerp(u.value, on[i] * inPU * (0.75 + Math.sin(time * 4) * 0.15), 1 - Math.exp(-dt * 6));
  });

  if (activeAnchor && activeAnchor.name !== lastAnchorName) {
    lastAnchorName = activeAnchor.name;
    if (soundOn && anchorCloseness > 0.5) play([0.2], { freqs: [CHORD[Math.floor(Math.random() * 6)] * 2], gain: 0.25, clean: true });
  }

  updateYears(y);
  updateEvo();
  updateAnnos(dt, time);
  updateRail(y);
  updateParallax();
  drawViz(time);

  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }

function start() {
  buildYears();
  measureAnchors();
  computeTarget(scrollY);
  state.focus.copy(target.focus); state.rot.copy(target.rot);
  state.dist = target.dist + 1.2; state.off.copy(target.off); state.spin = target.spin;
  $('#loaderPct').textContent = 100;
  $('.loader-progress').style.strokeDashoffset = 0;
  setTimeout(() => {
    document.body.classList.remove('is-loading');
    document.body.classList.add('is-ready');
    lenis.start();
  }, 450);
  requestAnimationFrame(raf);
  requestAnimationFrame(frame);
}

addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  measureAnchors();
});
addEventListener('load', measureAnchors);
new ResizeObserver(() => measureAnchors()).observe(document.body);

/* =========================================================
   DEBUG: ?debug → 클릭한 지점의 모델 좌표 출력
   ========================================================= */
window.G = { lenis, pivot, modelSpace, camera, target, state, CAMS, ANNOS, freeze: false, anchors: () => anchors };
if (DEBUG) {
  const ray = new THREE.Raycaster();
  addEventListener('click', (e) => {
    const p = new THREE.Vector2((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    ray.setFromCamera(p, camera);
    const hit = model && ray.intersectObject(model, true)[0];
    if (!hit) return;
    const lp = modelSpace.worldToLocal(hit.point.clone());
    const s = `[${lp.x.toFixed(3)}, ${lp.y.toFixed(3)}, ${lp.z.toFixed(3)}]`;
    console.log('model point', s);
    window.lastPoint = s;
  });
  G.pick = (sx, sy, fw = 800) => { const k = innerWidth / fw; const p = new THREE.Vector2((sx * k / innerWidth) * 2 - 1, -(sy * k / innerHeight) * 2 + 1); ray.setFromCamera(p, camera); const h = ray.intersectObject(model, true)[0]; if (!h) return null; const lp = modelSpace.worldToLocal(h.point.clone()); return lp.toArray().map((v) => +v.toFixed(3)); };
}
