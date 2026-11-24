// GEARSHED — Signal Chain page.
// Guitar → pedals on the cable → amp. The cable between two boxes is drawn as the waveform leaving the left one.
// Click gear on the shelf to choose it; drag pedals along the cable to reorder, off it to remove. No knobs.

import { GUITARS, PEDALS, AMPS, buildChain, buildMaster, loadDI } from './signal-audio.js';

const $ = (s, r = document) => r.querySelector(s);
const SHORT = { 'maestro-fz1': 'FZ-1', 'fuzz-face': 'Fuzz Face', 'vox-v846': 'V846', 'roland-re-201': 'RE-201', 'boss-ds-1': 'DS-1', 'proco-rat': 'RAT', 'ibanez-ts808': 'TS808', 'klon-centaur': 'Centaur' };
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const state = { guitar: 'es-335', chain: [], amp: 'vox-ac30', playing: false, vol: 0.5 };
const byId = (list, id) => list.find((x) => x.id === id);
const name = (x) => `${x.year} ${x.brand} ${x.model}`;
const say = (t) => { $('#say').textContent = t; };

/* ---------- audio ---------- */
let ac = null, master = null, src = null, cur = null, buildNo = 0;
const volGain = (v) => (v <= 0 ? 0 : 10 ** ((-36 + 36 * v) / 20));    // starts low: the slider's middle is −18 dB

async function rebuild(newSource) {
  if (!ac) return;
  const no = ++buildNo, g = byId(GUITARS, state.guitar);
  let di;
  try { di = await loadDI(ac, g); } catch { say(`The recording for the ${g.model} could not be loaded. Try another guitar.`); return; }
  if (no !== buildNo) return;                                           // a newer change has already started
  const ch = buildChain(ac, state.chain, state.amp, { bpm: g.bpm, inGain: di.inGain });
  const out = ac.createGain(); out.gain.value = 0;
  ch.out.connect(out).connect(master.in);
  let s = src;
  if (newSource || !src) { s = ac.createBufferSource(); s.buffer = di.buf; s.loop = true; s.start(); }
  s.connect(ch.in);
  const t = ac.currentTime, old = cur, oldSrc = s !== src ? src : null, keep = src;
  out.gain.setTargetAtTime(1, t, 0.02);                                 // short crossfade between the old and new chain
  if (old) old.out.gain.setTargetAtTime(0, t, 0.02);
  setTimeout(() => {
    if (!old) return;
    try { (oldSrc || keep).disconnect(old.ch.in); } catch {}
    old.out.disconnect(); old.ch.stop();
    try { oldSrc?.stop(); } catch {}
  }, 300);
  src = s; cur = { ch, out };
}

async function setPlaying(on) {
  const btn = $('.play');
  if (on && !ac) {
    btn.setAttribute('aria-busy', 'true');
    ac = new AudioContext({ latencyHint: 'playback' });
    master = buildMaster(ac);
    await rebuild(true);
    btn.removeAttribute('aria-busy');
    if (!cur) { ac.close(); ac = null; return; }
  }
  if (!ac) return;
  state.playing = on;
  btn.setAttribute('aria-pressed', String(on));
  $('.play-txt').textContent = on ? 'Stop' : 'Play';
  const t = ac.currentTime;
  if (on) { await ac.resume(); master.vol.gain.setTargetAtTime(volGain(state.vol), ac.currentTime, 0.03); loop(); }
  else { master.vol.gain.setTargetAtTime(0, t, 0.03); setTimeout(() => { if (!state.playing) ac.suspend(); }, 160); }
  say(on ? 'Playing.' : 'Stopped.');
}

/* ---------- stage ---------- */
const stage = $('.stage'), board = $('.board'), wire = $('.wire'), g2 = wire.getContext('2d');
let geo = null;            // measured layout: cable y, segment ends, pedal centres

function renderStage() {
  const g = byId(GUITARS, state.guitar), a = byId(AMPS, state.amp);
  const gi = $('.slot-guitar img'), ai = $('.slot-amp img');
  if (!gi.src.endsWith(g.img)) gi.src = g.img;
  if (!ai.src.endsWith(a.img)) ai.src = a.img;
  gi.alt = `${g.brand} ${g.model}`; ai.alt = `${a.brand} ${a.model}`;
  $('.slot-amp').style.setProperty('--ah', a.ar > 2 ? '14svh' : '32svh');   // heads are short and wide, combos tall
  $('.slot-guitar figcaption').innerHTML = `<b>${g.year}</b>${g.brand} ${g.model}`;
  $('.slot-amp figcaption').innerHTML = `<b>${a.year}</b>${a.brand} ${a.model}`;

  const keep = new Map([...board.children].map((li) => [li.dataset.id, li]));
  const frag = document.createDocumentFragment();
  state.chain.forEach((id, i) => {
    const p = byId(PEDALS, id);
    let li = keep.get(id);
    if (!li) {
      li = document.createElement('li');
      li.className = 'pedal'; li.dataset.id = id; li.tabIndex = 0;
      li.style.setProperty('--h', p.h);
      li.innerHTML = `<img src="${p.img}" alt="" draggable="false" /><span class="name">${SHORT[id]}</span>`;
      bindPedal(li);
    }
    li.setAttribute('aria-label', `${p.brand} ${p.model}, ${i + 1} of ${state.chain.length}. Arrow keys move it along the cable; Delete takes it off.`);
    frag.append(li);
  });
  board.replaceChildren(frag);
  layout();
}

function layout() {
  const sr = stage.getBoundingClientRect();
  const gr = $('.slot-guitar img').getBoundingClientRect(), ar = $('.slot-amp img').getBoundingClientRect();
  const probe = getComputedStyle(document.documentElement);
  const svh = sr.height / 100 || innerHeight / 100;
  const cy = (parseFloat(probe.getPropertyValue('--floor')) - 8) * svh;
  const x0 = gr.right - sr.left - gr.width * 0.12, x1 = ar.left - sr.left + 2;
  const items = [...board.children].map((li) => { const p = byId(PEDALS, li.dataset.id); return { li, w: 14 * svh * p.h * p.ar }; });
  const sumW = items.reduce((s, it) => s + it.w, 0), span = x1 - x0, minGap = 34;
  const s = items.length ? Math.min(1, (span - minGap * (items.length + 1)) / sumW) : 1;
  const gap = (span - sumW * s) / (items.length + 1);
  let x = x0 + gap;
  const segs = [];
  let from = x0;
  items.forEach((it) => {
    const w = it.w * s;
    it.li.style.setProperty('--s', s.toFixed(3));
    if (!it.li.classList.contains('is-dragging')) it.li.style.setProperty('--x', `${x + w / 2}px`);
    if (!it.li.dataset.placed) {                                       // a new pedal appears in its place instead of sliding in from the left edge
      it.li.dataset.placed = '1'; it.li.classList.add('is-new');
      requestAnimationFrame(() => requestAnimationFrame(() => it.li.classList.remove('is-new')));
    }
    segs.push([from, x]); from = x + w; it.cx = x + w / 2; x += w + gap;
  });
  segs.push([from, x1]);
  segs.push([ar.right - sr.left - 2, sr.width]);                       // after the amp, out to the room
  geo = { cy, segs, items, x0, x1, svh };
  const dpr = Math.min(2, devicePixelRatio || 1);
  if (wire.width !== Math.round(sr.width * dpr)) { wire.width = Math.round(sr.width * dpr); wire.height = Math.round(sr.height * dpr); }
  g2.setTransform(dpr, 0, 0, dpr, 0, 0);
  draw();
}

/* ---------- the wire: each segment shows the signal leaving the box on its left ---------- */
const scale = [], bufs = [];
const N = 1100;                                                        // samples shown per segment (~25 ms)
function draw() {
  if (!geo) return;
  const { cy, segs, svh } = geo, H = Math.min(9 * svh, 78);
  g2.clearRect(0, 0, wire.width, wire.height);
  g2.lineWidth = 1.6; g2.lineJoin = 'round'; g2.lineCap = 'round'; g2.strokeStyle = '#15130f';
  const taps = state.playing && cur ? cur.ch.taps : null;
  segs.forEach(([a, b], i) => {
    if (b - a < 2) return;
    g2.beginPath(); g2.moveTo(a, cy);
    const an = taps && taps[i];
    if (an) {
      const d = bufs[i] && bufs[i].length === an.fftSize ? bufs[i] : (bufs[i] = new Float32Array(an.fftSize));
      an.getFloatTimeDomainData(d);
      let t0 = 1; for (let k = 1; k < d.length - N; k++) if (d[k - 1] < 0 && d[k] >= 0) { t0 = k; break; }   // trigger on a rising zero crossing
      let pk = 0; for (let k = t0; k < t0 + N; k++) pk = Math.max(pk, Math.abs(d[k]));
      scale[i] = (scale[i] ?? H / 0.3) * 0.82 + (H / Math.max(pk, 0.02)) * 0.18;
      const w = b - a;
      for (let k = 0; k <= w; k += 1.5) {
        const u = k / w, v = d[t0 + Math.floor(u * (N - 1))] || 0, taper = 1 - (2 * u - 1) ** 10;
        g2.lineTo(a + k, cy - v * scale[i] * taper);
      }
    }
    g2.lineTo(b, cy); g2.stroke();
  });
}
let raf = 0, last = 0;
function loop(t = 0) {
  cancelAnimationFrame(raf);
  if (!state.playing) { draw(); return; }
  if (!REDUCED || t - last > 200) { draw(); last = t; }
  raf = requestAnimationFrame(loop);
}

/* ---------- shelf ---------- */
function renderShelf() {
  const gEl = $('.g-guitars .items'), pEl = $('.g-pedals .items'), aEl = $('.g-amps .items');
  gEl.replaceChildren(...GUITARS.map((g) => pick(g, 'radio', () => setGuitar(g.id))));
  pEl.replaceChildren(...PEDALS.map((p) => pick(p, 'pedal', () => togglePedal(p.id))));
  aEl.replaceChildren(...AMPS.map((a) => pick(a, 'radio', () => setAmp(a.id))));
  syncShelf();
}
function pick(x, kind, on) {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'pick'; b.dataset.id = x.id;
  if (kind === 'radio') b.setAttribute('role', 'radio');
  if (x.h) b.style.setProperty('--h', x.h);
  if (x.ar > 2) b.style.setProperty('--th', '3.4svh');
  b.setAttribute('aria-label', name(x));
  b.title = name(x);
  b.innerHTML = `<img src="${x.img}" alt="" draggable="false" /><span class="yr">${x.year}</span>`;
  b.addEventListener('click', on);
  return b;
}
function syncShelf() {
  document.querySelectorAll('.g-guitars .pick').forEach((b) => { const on = b.dataset.id === state.guitar; b.setAttribute('aria-checked', String(on)); b.tabIndex = on ? 0 : -1; });
  document.querySelectorAll('.g-amps .pick').forEach((b) => { const on = b.dataset.id === state.amp; b.setAttribute('aria-checked', String(on)); b.tabIndex = on ? 0 : -1; });
  document.querySelectorAll('.g-pedals .pick').forEach((b) => b.setAttribute('aria-pressed', String(state.chain.includes(b.dataset.id))));
}
// arrow keys inside a radio group move the choice, as native radios do
for (const [sel, list, set] of [['.g-guitars', GUITARS, (id) => setGuitar(id)], ['.g-amps', AMPS, (id) => setAmp(id)]]) {
  $(sel).addEventListener('keydown', (e) => {
    const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!d) return;
    e.preventDefault();
    const cur = sel === '.g-guitars' ? state.guitar : state.amp;
    const i = (list.findIndex((x) => x.id === cur) + d + list.length) % list.length;
    set(list[i].id); $(`${sel} .pick[data-id="${list[i].id}"]`).focus();
  });
}

/* ---------- changes ---------- */
function changed(newSource, msg) { syncShelf(); renderStage(); rebuild(newSource); if (msg) say(msg); }
function setGuitar(id) { if (id === state.guitar) return; state.guitar = id; changed(true, `${name(byId(GUITARS, id))}.`); }
function setAmp(id) { if (id === state.amp) return; state.amp = id; changed(false, `Amp: ${name(byId(AMPS, id))}.`); }
function togglePedal(id) {
  const p = byId(PEDALS, id), i = state.chain.indexOf(id);
  if (i < 0) state.chain.push(id); else state.chain.splice(i, 1);
  changed(false, `${p.model} ${i < 0 ? 'on the cable' : 'taken off'}.`);
}
function move(id, to) {
  const from = state.chain.indexOf(id);
  to = Math.max(0, Math.min(state.chain.length - 1, to));
  if (from === to) return false;
  state.chain.splice(to, 0, state.chain.splice(from, 1)[0]);
  changed(false, `${byId(PEDALS, id).model} is now ${to + 1} of ${state.chain.length}.`);
  return true;
}

/* ---------- pedals on the cable: drag along to reorder, off to remove, click to remove ---------- */
function bindPedal(li) {
  let drag = null;
  li.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    drag = { x: e.clientX, y: e.clientY, moved: false };
    li.setPointerCapture(e.pointerId);
  });
  li.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 6) return;
    drag.moved = true; li.classList.add('is-dragging');
    const sr = stage.getBoundingClientRect();
    li.style.setProperty('--x', `${e.clientX - sr.left}px`);
    li.style.translate = `0 ${dy}px`;
    li.classList.toggle('is-out', Math.abs(dy) > geo.svh * 12);
  });
  const end = (e) => {
    if (!drag) return;
    const id = li.dataset.id, moved = drag.moved, out = li.classList.contains('is-out');
    drag = null; li.classList.remove('is-dragging', 'is-out'); li.style.translate = '';
    if (!moved || out) { togglePedal(id); return; }
    const x = e.clientX - stage.getBoundingClientRect().left;
    const others = geo.items.filter((it) => it.li !== li);
    const to = others.filter((it) => it.cx < x).length;
    if (!move(id, to)) layout();
  };
  li.addEventListener('pointerup', end);
  li.addEventListener('pointercancel', () => { drag = null; li.classList.remove('is-dragging', 'is-out'); li.style.translate = ''; layout(); });
  li.addEventListener('keydown', (e) => {
    const id = li.dataset.id, i = state.chain.indexOf(id);
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); if (move(id, i + (e.key === 'ArrowLeft' ? -1 : 1))) board.querySelector(`[data-id="${id}"]`).focus(); }
    if (e.key === 'Delete' || e.key === 'Backspace' || e.key === 'Enter') { e.preventDefault(); togglePedal(id); $(`.g-pedals .pick[data-id="${id}"]`).focus(); }
  });
}

/* ---------- controls ---------- */
$('.play').addEventListener('click', () => setPlaying(!state.playing));
$('.vol input').addEventListener('input', (e) => {
  state.vol = +e.target.value;
  if (ac && state.playing) master.vol.gain.setTargetAtTime(volGain(state.vol), ac.currentTime, 0.03);
});
addEventListener('keydown', (e) => {
  if (e.key !== ' ' || e.target.closest('button, input, a, li')) return;
  e.preventDefault(); setPlaying(!state.playing);
});
addEventListener('resize', () => layout());
for (const img of document.querySelectorAll('.slot img')) img.addEventListener('load', () => layout());

renderShelf();
renderStage();
