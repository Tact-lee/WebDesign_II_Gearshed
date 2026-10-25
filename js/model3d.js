/* =========================================================
   3D 챕터 — three.js
   - 렌더러(캔버스) 하나를 모든 3D 챕터가 같이 쓴다
   - 챕터가 가까워지면 모델을 받아 GPU에 미리 올리고, 멀어지면 내린다
   - 카메라는 칸(shot)마다 정한 구도 사이를 곡선으로 옮겨 다닌다
   - 데스크톱은 고화질 모델, 좁은 화면·터치·메모리 적은 기기는 경량 모델
   ========================================================= */

// three.js는 jsDelivr의 ESM 주소로 바로 받는다 — HTML의 importmap에 기대지 않아, 예전 HTML이 캐시에 남아 있어도 동작한다
const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.170.0/';
const CDN = THREE_URL + 'examples/jsm/';
const LITE = matchMedia('(max-width: 900px), (pointer: coarse)').matches || (navigator.deviceMemory || 8) <= 4;
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (m) => (m < 0.5 ? 4 * m * m * m : 1 - Math.pow(-2 * m + 2, 3) / 2);
const smooth = (m) => m * m * (3 - 2 * m);
const RAD = Math.PI / 180;

let T = null;          // three
let R = null;          // WebGLRenderer — 하나만
let ENV = null;        // 스튜디오 반사 환경
let LOADER = null;
let booting = null;
const S = new Map();   // 챕터 → 상태

function boot() {
  if (!booting) booting = (async () => {
    const [three, { GLTFLoader }, { DRACOLoader }, { KTX2Loader }] = await Promise.all([
      import(THREE_URL + '+esm'),
      import(CDN + 'loaders/GLTFLoader.js/+esm'),
      import(CDN + 'loaders/DRACOLoader.js/+esm'),
      import(CDN + 'loaders/KTX2Loader.js/+esm'),
    ]);
    T = three;
    R = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    R.outputColorSpace = T.SRGBColorSpace;
    R.toneMapping = T.NeutralToneMapping;          // 원목·블론드 색을 바꾸지 않는 톤 매핑
    R.setClearColor(0x000000, 0);
    R.domElement.className = 'm3-canvas';
    const ktx2 = new KTX2Loader().setTranscoderPath(CDN + 'libs/basis/').detectSupport(R);
    const draco = new DRACOLoader().setDecoderPath(CDN + 'libs/draco/gltf/');
    LOADER = new GLTFLoader().setDRACOLoader(draco).setKTX2Loader(ktx2);
    ENV = studio();
  })();
  return booting;
}

/* 검은 스튜디오에 소프트박스 몇 개 — 크롬과 래커에 또렷한 하이라이트가 맺힌다 */
function studio() {
  const sc = new T.Scene();
  sc.background = new T.Color(0x1c1a17);           // 완전한 검정이 아니라 어둑한 회색 — 크롬이 검은 구멍처럼 보이지 않게
  const panel = (w, h, pos, I, col = 0xffffff) => {
    const m = new T.Mesh(new T.PlaneGeometry(w, h),
      new T.MeshBasicMaterial({ color: new T.Color(col).multiplyScalar(I), side: T.DoubleSide }));
    m.position.set(...pos);
    m.lookAt(0, 0, 0);
    sc.add(m);
  };
  panel(5, 5, [0, 6, 1.5], 2.2, 0xfff4e8);       // 위 큰 소프트박스
  panel(1.4, 7, [-6, 0.8, 2], 3.2);               // 왼쪽 세로 스트립
  panel(1.2, 7, [6, 0.4, -0.5], 2.4, 0xe8efff);   // 오른쪽 스트립 — 조금 차갑게
  panel(7, 1.2, [0, 1.5, -6], 1.8);               // 뒤 림
  panel(5, 1, [0, -4, 4], 0.35);                  // 아래 앞 반사판
  panel(9, 3, [0, 2.5, 5.5], 0.9, 0xfff6ec);       // 앞 위쪽 넓은 반사판 — 정면에서 본 크롬·픽업 윗면이 살아난다
  const pm = new T.PMREMGenerator(R);
  const tex = pm.fromScene(sc, 0.03).texture;
  pm.dispose();
  return tex;
}

/* ---------- 챕터 등록 · 불러오기 · 내리기 ---------- */
export function m3Prepare(el, cfg) {
  S.set(el, { el, cfg, host: el.querySelector('.m3-gl'), status: 'idle', progress: 0, near: false, timer: 0, dpr: 0, slow: 0, fast: 0, lastT: 0 });
}

export function m3Near(el, near) {
  const st = S.get(el);
  if (!st) return;
  st.near = near;
  clearTimeout(st.timer);
  if (near && st.status === 'idle') load(st);
  if (!near && st.status === 'ready') st.timer = setTimeout(() => { if (!st.near) unload(st); }, 8000);
}

export function m3Status(el) {
  const st = S.get(el);
  return st ? { status: st.status, progress: st.progress } : null;
}

async function load(st) {
  st.status = 'loading';
  st.progress = 0;
  try { await boot(); } catch (e) { console.warn('3D 비활성', e); st.status = 'failed'; return; }
  const c = st.cfg;
  const url = `${c.dir}/${LITE && c.lite ? c.lite : c.src}${c.v ? `?v=${c.v}` : ''}`;
  LOADER.load(url, (g) => {
    if (!st.near) { st.status = 'idle'; dispose(g.scene); return; }    // 받는 사이에 멀어졌다
    setup(st, g.scene);
  }, (ev) => { if (ev.total) st.progress = ev.loaded / ev.total; },
  (err) => { console.warn('3D 모델을 불러오지 못했다', err); st.status = 'failed'; });
}

function dispose(root) {
  root.traverse((o) => {
    if (!o.isMesh) return;
    o.geometry.dispose();
    for (const m of [].concat(o.material)) {
      for (const k in m) if (m[k] && m[k].isTexture) m[k].dispose();
      m.dispose();
    }
  });
}

function unload(st) {
  if (st.status !== 'ready') return;
  dispose(st.scene);
  if (R.domElement.parentNode === st.host) st.host.removeChild(R.domElement);
  Object.assign(st, { status: 'idle', scene: null, cam: null, pivot: null, parts: null, fades: null });
}

/* ---------- 장면 ---------- */
function setup(st, model) {
  const scene = new T.Scene();
  scene.environment = ENV;
  scene.environmentIntensity = 0;
  const cam = new T.PerspectiveCamera(30, 1, 0.004, 30);
  scene.add(cam);

  // 카메라에 붙은 조명 — 어느 쪽에서 보든 왼쪽 위에서 키, 뒤에서 테두리 빛
  const light = (col, pos, tgt) => {
    const l = new T.DirectionalLight(col, 0);
    l.position.set(...pos);
    cam.add(l); cam.add(l.target);
    l.target.position.set(...tgt);
    return l;
  };
  const key = light(0xfff1e2, [-1.2, 1.4, 1.6], [0, 0, -1]);
  const rim = light(0xe6eeff, [1.5, 0.9, -3], [0, 0, 0]);
  const rim2 = light(0xffd2a0, [-1.6, -0.3, -3], [0, 0, 0]);

  const pivot = new T.Group();
  scene.add(pivot);
  model.updateMatrixWorld(true);
  const c = new T.Box3().setFromObject(model).getCenter(new T.Vector3());
  model.position.sub(c);
  pivot.add(model);
  pivot.updateMatrixWorld(true);

  const ex = st.cfg.explode || {};
  const { parts, fades } = explodeParts(model, ex);

  Object.assign(st, { scene, cam, pivot, model, key, rim, rim2, parts, fades, status: 'ready' });

  // 텍스처를 한 프레임에 하나씩 미리 GPU에 올리고, 셰이더도 미리 엮어 둔다 — 처음 보일 때 끊기지 않게
  const q = [];
  model.traverse((o) => {
    if (!o.isMesh) return;
    const m = o.material;
    for (const k of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap']) if (m[k] && !q.includes(m[k])) q.push(m[k]);
  });
  const step = () => {
    if (st.status !== 'ready') return;
    const t = q.shift();
    if (t) { R.initTexture(t); requestAnimationFrame(step); }
  };
  requestAnimationFrame(step);
  R.compileAsync(scene, cam).catch(() => {});
}

/* 분해 — 노드 이름으로 부품을 묶어 정해진 방향으로 떼어 낸다.
   나사처럼 한 덩어리에 섞인 메시는 서로 붙은 조각끼리 나눠, 걸쳐 있는 부품을 따라가게 한다 */
function explodeParts(model, ex) {
  const parts = [];
  const fades = [];
  const groups = Object.entries(ex.groups || {}).map(([id, g]) => ({ id, re: new RegExp(g.match), v: new T.Vector3(...g.v), box: new T.Box3() }));
  const fadeRe = ex.fade ? new RegExp(ex.fade) : null;
  const splitRe = ex.split ? new RegExp(ex.split) : null;
  const root = model.getObjectByName(ex.root || 'RootNode') || model;
  const toModel = new T.Matrix4().copy(model.matrixWorld).invert();
  const local = (o, v) => {
    // 모델 좌표의 이동량을 o의 부모 좌표로 — 부모 쪽 회전·축척을 거꾸로 푼다
    const m = new T.Matrix4().copy(o.parent.matrixWorld).invert().multiply(model.matrixWorld);
    return v.clone().applyMatrix3(new T.Matrix3().setFromMatrix4(m));
  };
  const splits = [];
  for (const node of [...root.children]) {
    if (fadeRe && fadeRe.test(node.name)) {
      node.traverse((o) => { if (o.isMesh) { o.material.transparent = true; fades.push(o.material); } });
      continue;
    }
    if (splitRe && splitRe.test(node.name)) { splits.push(node); continue; }
    const g = groups.find((x) => x.re.test(node.name));
    if (!g) continue;
    g.box.union(new T.Box3().setFromObject(node).applyMatrix4(toModel));
    parts.push({ o: node, base: node.position.clone(), dir: local(node, g.v) });
  }
  // 나사 — 서로 맞닿은 조각을 한 개로 묶고, 그 상자가 걸치는 부품 가운데 가장 작은 것을 따라간다
  const pad = 0.004;
  const meshes = [];
  for (const node of splits) node.traverse((o) => { if (o.isMesh) meshes.push(o); });   // 새 메시를 붙이기 전에 먼저 모아 둔다
  for (const mesh of meshes) {
    const geo = mesh.geometry;
    const pos = geo.attributes.position;
    const idx = geo.index.array;
    const n = pos.count;
    const par = new Int32Array(n).map((_, i) => i);
    const find = (a) => { while (par[a] !== a) { par[a] = par[par[a]]; a = par[a]; } return a; };
    for (let i = 0; i < idx.length; i += 3) {
      const a = find(idx[i]), b = find(idx[i + 1]), c = find(idx[i + 2]);
      par[b] = a; par[find(c)] = a;
    }
    const m = new T.Matrix4().copy(toModel).multiply(mesh.matrixWorld);
    const v = new T.Vector3();
    const boxes = new Map();
    for (let i = 0; i < n; i++) {
      const r = find(i);
      let b = boxes.get(r);
      if (!b) { b = new T.Box3(); boxes.set(r, b); }
      b.expandByPoint(v.fromBufferAttribute(pos, i).applyMatrix4(m));
    }
    // 겹치는 조각끼리 합친다(머리·몸통이 UV 경계로 갈라져 있어도 나사 하나로)
    const keys = [...boxes.keys()];
    const cl = new Map(keys.map((k) => [k, k]));
    const cf = (a) => { while (cl.get(a) !== a) a = cl.get(a); return a; };
    for (let i = 0; i < keys.length; i++) {
      const bi = boxes.get(keys[i]).clone().expandByScalar(0.0003);
      for (let k = i + 1; k < keys.length; k++) {
        if (bi.intersectsBox(boxes.get(keys[k]))) cl.set(cf(keys[k]), cf(keys[i]));
      }
    }
    const cbox = new Map();
    for (const k of keys) { const c = cf(k); cbox.set(c, (cbox.get(c) || new T.Box3()).union(boxes.get(k))); }
    const pick = new Map();
    for (const [c, b] of cbox) {
      let best = null, vol = Infinity;
      for (const g of groups) {
        if (g.box.isEmpty() || !g.box.clone().expandByScalar(pad).intersectsBox(b)) continue;
        const s = g.box.getSize(v);
        const vv = s.x * s.y * Math.max(s.z, 0.002);
        if (vv < vol) { vol = vv; best = g; }
      }
      pick.set(c, best);
    }
    // 부품마다 삼각형을 모아 메시를 새로 만든다(정점 버퍼는 같이 쓴다)
    const tri = new Map();
    for (let i = 0; i < idx.length; i += 3) {
      const g = pick.get(cf(find(idx[i])));
      const key = g ? g.id : '';
      if (!tri.has(key)) tri.set(key, []);
      tri.get(key).push(idx[i], idx[i + 1], idx[i + 2]);
    }
    for (const [key, list] of tri) {
      const sub = new T.BufferGeometry();
      for (const a in geo.attributes) sub.setAttribute(a, geo.attributes[a]);
      sub.setIndex(new T.BufferAttribute(n > 65535 ? new Uint32Array(list) : new Uint16Array(list), 1));
      const sm = new T.Mesh(sub, mesh.material);
      sm.position.copy(mesh.position); sm.quaternion.copy(mesh.quaternion); sm.scale.copy(mesh.scale);
      mesh.parent.add(sm);
      sm.updateMatrixWorld(true);
      const g = groups.find((x) => x.id === key);
      if (g) {
        // 나사는 판보다 조금 더 멀리 — 판에서 빠져나오는 게 보이게
        const extra = g.v.clone().setLength(g.v.length() + 0.025);
        parts.push({ o: sm, base: sm.position.clone(), dir: local(sm, extra) });
      }
    }
    mesh.parent.remove(mesh);
  }
  return { parts, fades };
}

/* ---------- 카메라 ----------
   칸(shot): t 바라보는 점(m) · az/el 방위·고도(도) · r 담을 반경 또는 d 거리 · roll · fov · side 글 쪽(l | r | c)
   머무는 동안(스크롤 lp 0→1): path [시작, 끝] 바라보는 점이 미끄러진다 · orbit 방위 변화 · elv 고도 변화
     keys [{at, t, az, el, r|d, roll, full}] 여러 구도를 차례로 지난다(빠진 값은 칸 값). az는 감지 않아 한 바퀴 넘게도 돈다.
       full 0→1: 글을 걷고 화면 전체를 쓴다(데스크톱은 가운데로, 좁은 화면은 위쪽에서 한가운데로)
   모델: spin 한 바퀴(360의 배수) · turn 일부만 돌았다가 다음 칸으로 가며 되돌아온다 · sway {amp, period} 시간에 따라 천천히 좌우로
     explode 분해 세기 · explodeAt [벌어지기 시작, 다 벌어짐, 붙기 시작, 다 붙음](lp)
   drift 가만히 있을 때 카메라가 숨 쉬는 세기(기본 1, 0이면 고정) · sx/sy 바라보는 점의 화면 위치를 직접(데스크톱)
   글: textY 'b' 오른쪽·왼쪽 아래 · scrim false 글 쪽을 어둡게 깔지 않는다 · mobile {…} 좁은 화면에서만 덮어쓸 값 */
function pose(sh, w, h, lp = 0) {
  const narrow = w <= 900;
  if (narrow && sh.mobile) sh = { ...sh, ...sh.mobile };
  const fov = sh.fov || 30;
  const tn = Math.tan(fov * RAD / 2);
  const asp = w / h;
  // 관심 반경 r이 화면의 정해진 구역에 들어오게 — 데스크톱은 글 반대편 반쪽, 좁은 화면은 위쪽(full이면 화면 전체)
  const dist = (k) => {
    let d = k.d ?? (k.r == null ? sh.d : null);
    const r = k.r ?? sh.r;
    const f = k.full || 0;
    if (d == null) {
      const fy = narrow ? lerp(0.44, 0.84, f) : 0.84;
      const fx = narrow ? 0.88 : lerp(0.5, 0.9, f);
      d = Math.max(r / (fy * tn), r / (fx * asp * tn));
    } else if (narrow) d *= 1.35;
    return d;
  };
  const side = sh.side === 'r' ? 0.37 : sh.side === 'c' ? 0.5 : 0.63;
  const sxOf = (k) => (narrow ? 0.5 : (k.sx ?? lerp(side, 0.5, k.full || 0)));
  const syOf = (k) => (narrow ? lerp(0.33, 0.5, k.full || 0) : (k.sy ?? 0.5));
  const P = { t: sh.t, az: sh.az, el: sh.el, d: dist(sh), roll: sh.roll || 0, fov, sx: sxOf(sh), sy: syOf(sh), drift: sh.drift ?? 1 };
  if (sh.keys) {
    const K = sh.keys;
    let j = 0;
    while (j < K.length - 2 && lp > K[j + 1].at) j++;
    const a = K[j], b = K[Math.min(K.length - 1, j + 1)];
    const u = b === a ? 0 : ease(clamp((lp - a.at) / (b.at - a.at)));   // 구도마다 잠깐 머물렀다 넘어간다
    const v = (k, f) => k[f] ?? sh[f];
    P.t = [0, 1, 2].map((i) => lerp(v(a, 't')[i], v(b, 't')[i], u));
    P.az = lerp(v(a, 'az'), v(b, 'az'), u);
    P.el = lerp(v(a, 'el'), v(b, 'el'), u);
    P.roll = lerp(v(a, 'roll') || 0, v(b, 'roll') || 0, u);
    P.d = Math.exp(lerp(Math.log(dist(a)), Math.log(dist(b)), u));
    P.sx = lerp(sxOf(a), sxOf(b), u);
    P.sy = lerp(syOf(a), syOf(b), u);
    return P;
  }
  const k = ease(lp);
  if (sh.path) P.t = sh.path[0].map((v, j) => lerp(v, sh.path[1][j], k));
  P.az += (sh.orbit || 0) * k;
  P.el += (sh.elv || 0) * k;
  return P;
}

const wrapDeg = (a) => ((a % 360) + 540) % 360 - 180;
const wave = (t, period, phase = 0) => Math.sin((2 * Math.PI * t) / period + phase);   // 주기(초)로 쓰는 사인

function between(A, B, m, now) {
  const e = ease(m);
  const span = Math.hypot(B.t[0] - A.t[0], B.t[1] - A.t[1], B.t[2] - A.t[2]);
  const swoop = 0.18 + 0.5 * clamp(span / 0.5);                  // 멀리 갈수록 크게 물러났다 다시 다가간다
  const lift = Math.sin(Math.PI * m);
  const P = {
    t: [0, 1, 2].map((i) => lerp(A.t[i], B.t[i], e)),
    az: A.az + wrapDeg(B.az - A.az) * e,
    el: lerp(A.el, B.el, e),
    d: Math.exp(lerp(Math.log(A.d), Math.log(B.d), e)) * (1 + swoop * lift),
    roll: lerp(A.roll, B.roll, e) + 7 * lift * Math.sign(wrapDeg(B.az - A.az) || 1),
    fov: lerp(A.fov, B.fov, e),
    sx: lerp(A.sx, B.sx, e),
    sy: lerp(A.sy, B.sy, e),
  };
  if (!REDUCED) {
    // 가만히 있어도 멈춘 화면처럼 보이지 않게 — 몇 초 안에 알아챌 만큼 천천히 떠다닌다. 옮겨 가는 중에는 잦아든다
    const w = lerp(A.drift, B.drift, e) * (1 - 0.85 * lift);
    const t = now / 1000;
    P.az += 3.2 * wave(t, 11, 1.3) * w;
    P.el += 1.6 * wave(t, 14) * w;
    P.roll += 1.0 * wave(t, 17, 0.4) * w;
    P.d *= 1 + 0.025 * wave(t, 13, 2.1) * w;
  }
  return P;
}

function mixPose(A, B, k) {
  return {
    t: [0, 1, 2].map((i) => lerp(A.t[i], B.t[i], k)),
    az: A.az + wrapDeg(B.az - A.az) * k, el: lerp(A.el, B.el, k),
    d: Math.exp(lerp(Math.log(A.d), Math.log(B.d), k)), roll: lerp(A.roll, B.roll, k),
    fov: lerp(A.fov, B.fov, k), sx: lerp(A.sx, B.sx, k), sy: lerp(A.sy, B.sy, k),
  };
}

function place(cam, P, w, h) {
  const a = P.az * RAD, e = P.el * RAD;
  cam.fov = P.fov;
  cam.aspect = w / h;
  cam.position.set(P.t[0] + Math.sin(a) * Math.cos(e) * P.d, P.t[1] + Math.sin(e) * P.d, P.t[2] + Math.cos(a) * Math.cos(e) * P.d);
  cam.up.set(0, 1, 0);
  cam.lookAt(P.t[0], P.t[1], P.t[2]);
  cam.rotateZ(P.roll * RAD);
  // 바라보는 점을 화면의 (sx, sy)에 — 글이 놓이는 반대편으로 비켜 세운다
  cam.setViewOffset(w, h, (0.5 - P.sx) * w, (0.5 - P.sy) * h, w, h);
  cam.updateProjectionMatrix();
}

/* ---------- 매 프레임 ----------
   s = { x: 칸 위치(정수 = 머무름, 소수 = 다음 칸으로 가는 중), lp: 지금 칸의 머무름 진행도,
         rv: 들머리 밝아짐 0→1, fade: 끝 어두워짐 0→1, now } */
export function m3Draw(el, s) {
  const st = S.get(el);
  if (!st || st.status !== 'ready') return null;
  const host = st.host;
  const w = host.clientWidth, h = host.clientHeight;
  if (!w || !h) return null;
  if (R.domElement.parentNode !== host) host.appendChild(R.domElement);

  // 해상도 — 프레임이 느리면 픽셀 비율을 낮추고, 여유가 있으면 다시 올린다
  const maxDpr = Math.min(2, devicePixelRatio || 1);
  if (!st.dpr) st.dpr = maxDpr;
  const dt = st.lastT ? s.now - st.lastT : 16;
  st.lastT = s.now;
  if (dt < 100) {
    if (dt > 24) { st.slow++; st.fast = 0; } else if (dt < 17.5) { st.fast++; st.slow = 0; }
    if (st.slow > 40 && st.dpr > 1) { st.dpr = Math.max(1, st.dpr - 0.25); st.slow = 0; }
    if (st.fast > 240 && st.dpr < maxDpr) { st.dpr = Math.min(maxDpr, st.dpr + 0.25); st.fast = 0; }
  }
  if (R.getPixelRatio() !== st.dpr) R.setPixelRatio(st.dpr);
  const size = R.getSize(new T.Vector2());
  if (size.x !== w || size.y !== h) R.setSize(w, h, false);

  const shots = st.cfg.shots;
  const N = shots.length;
  const i = Math.min(N - 1, Math.floor(s.x));
  const m = s.x - i;
  const sh = shots[i];
  const nx = shots[Math.min(N - 1, i + 1)];
  const A = pose(sh, w, h, s.lp);                                   // 머무는 동안의 움직임까지 들어간 지금 칸
  const B = pose(nx, w, h, 0);
  let P = between(A, B, m, s.now);
  if (s.rv < 1 && st.cfg.intro) P = mixPose(pose(st.cfg.intro, w, h), P, ease(s.rv));

  // 모델 — 한 바퀴(spin), 일부만 돌았다 되돌아옴(turn), 시간에 따른 좌우 흔들림(sway), 분해(explode)
  const sway = (x) => (x.sway && !REDUCED ? x.sway.amp * Math.sin((s.now / 1000) * (2 * Math.PI / x.sway.period)) : 0);
  let yaw = 0;
  if (sh.spin) yaw += sh.spin * ease(s.lp);
  if (sh.turn) yaw += sh.turn * (m > 0 ? 1 - ease(m) : ease(s.lp));
  yaw += sway(sh) * (1 - ease(m)) + (m > 0 ? sway(nx) * ease(m) : 0);
  // 분해 정도는 두 칸 사이에서 이어진다 — 분해된 칸에서 다음 칸으로 옮겨 가는 동안 부품이 제자리로 붙는다
  const exOf = (x, lp) => {
    if (!x.explode) return 0;
    const [u0, u1, d0, d1] = x.explodeAt || [0, 0.42, 0.72, 1];
    return x.explode * smooth(clamp((lp - u0) / (u1 - u0))) * (1 - smooth(clamp((lp - d0) / (d1 - d0))));
  };
  const exA = lerp(exOf(sh, s.lp), exOf(nx, 0), ease(m));
  st.pivot.rotation.y = yaw * RAD;
  for (const p of st.parts) p.o.position.copy(p.base).addScaledVector(p.dir, exA);
  const so = 1 - clamp(exA * 2.5);
  for (const f of st.fades) { f.opacity = so; f.depthWrite = so > 0.99; }

  // 빛 — 들머리에서는 테두리 빛이 먼저, 그다음 키 조명과 반사. 끝에서는 함께 꺼진다.
  // 가만히 있을 때도 반사가 표면 위를 천천히 흐르고 키 조명이 조금씩 자리를 옮긴다
  const on = 1 - s.fade;
  let pulse = 1;
  if (!REDUCED) {
    const tt = s.now / 1000;
    st.scene.environmentRotation.y = 0.35 * wave(tt, 16) + 0.1 * wave(tt, 7, 1);
    st.key.position.set(-1.2 + 0.7 * wave(tt, 12), 1.4 + 0.35 * wave(tt, 15, 1), 1.6);
    pulse = 1 + 0.12 * wave(tt, 9);
  }
  st.rim.intensity = 2.6 * pulse * clamp(s.rv * 2.5) * on;
  st.rim2.intensity = 1.4 * (2 - pulse) * clamp(s.rv * 2) * on;
  st.key.intensity = 1.5 * clamp((s.rv - 0.3) / 0.7) * on;
  st.scene.environmentIntensity = clamp((s.rv - 0.2) / 0.8) * on;
  R.toneMappingExposure = 1;

  place(st.cam, P, w, h);
  R.render(st.scene, st.cam);
  return P;
}
