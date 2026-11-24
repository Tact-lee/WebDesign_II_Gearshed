// GEARSHED — Signal Chain sound engine (Web Audio only).
// Each guitar plays its own dry recording; pedals and amps are fixed settings (no knobs).
// Every stage is followed by an AnalyserNode so the page can draw the signal between the boxes.

const G = 'assets/signal/gear/';
const DI = new URL('../assets/signal/di/', import.meta.url).href;   // resolved from this module so tools/signal-check.html can load it too
const db = (d) => 10 ** (d / 20);

/* ---------- gear lists, in Timeline order ---------- */
// bpm/key from the Looperman pages. The loops were not recorded on these guitars; each guitar is paired with one loop.
export const GUITARS = [
  { id: 'es-150', year: 1936, brand: 'Gibson', model: 'ES-150', di: 'es-150', bpm: 76, ar: 0.4173 },
  { id: 'es-175', year: 1949, brand: 'Gibson', model: 'ES-175', di: 'es-175', bpm: 99, ar: 0.4273 },
  { id: 'les-paul-goldtop', year: 1952, brand: 'Gibson', model: 'Les Paul Goldtop', di: 'les-paul-goldtop', bpm: 120, ar: 0.3564 },
  { id: 'gretsch-6120', year: 1955, brand: 'Gretsch', model: '6120', di: 'gretsch-6120', bpm: 154, ar: 0.3945 },
  { id: 'es-335', year: 1958, brand: 'Gibson', model: 'ES-335', di: 'es-335', bpm: 144, ar: 0.39 },
  { id: 'prs-custom-24', year: 1985, brand: 'PRS', model: 'Custom 24', di: 'prs-custom-24', bpm: 174, ar: 0.3382 },
  { id: 'strandberg-boden', year: 2012, brand: 'Strandberg', model: 'Boden', di: 'strandberg-boden', bpm: 100, ar: 0.4327 },
].map((g) => ({ ...g, img: G + g.id + '.png' }));

/* ---------- helpers ---------- */
const IN = (n) => n.in || n;
const OUT = (n) => n.out || n;
function series(...nodes) { for (let i = 0; i < nodes.length - 1; i++) OUT(nodes[i]).connect(IN(nodes[i + 1])); return { in: IN(nodes[0]), out: OUT(nodes.at(-1)) }; }
function gain(ctx, g) { const n = ctx.createGain(); n.gain.value = g; return n; }
function bq(ctx, type, f, q = 0.707, g = 0) { const n = ctx.createBiquadFilter(); n.type = type; n.frequency.value = f; n.Q.value = q; n.gain.value = g; return n; }
// WaveShaper clamps its input to ±1, so scale down by 1/k first and bake k into the curve: fn sees the full signal up to ±k.
function shaper(ctx, fn, k = 1) {
  const pre = gain(ctx, 1 / k), w = ctx.createWaveShaper(), n = 8192, c = new Float32Array(n);
  for (let i = 0; i < n; i++) c[i] = fn((i / (n - 1) * 2 - 1) * k);
  w.curve = c; w.oversample = '4x'; pre.connect(w);
  return { in: pre, out: w };
}
const tube = (b) => (u) => Math.tanh(u + b) - Math.tanh(b);              // biased triode: uneven halves → even harmonics
function noise(ctx, sec, fn) {
  const len = Math.round(ctx.sampleRate * sec), buf = ctx.createBuffer(2, len, ctx.sampleRate);
  let s = 12345;
  for (let ch = 0; ch < 2; ch++) { const d = buf.getChannelData(ch); for (let i = 0; i < len; i++) { s = (s * 1103515245 + 12345) >>> 0; d[i] = fn(i / ctx.sampleRate, (s / 4294967296) * 2 - 1); } }
  return buf;
}

/* ---------- speaker cabinets: minimum-phase impulse responses built from a magnitude curve ---------- */
function fft(re, im, inv) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
  for (let len = 2; len <= n; len <<= 1) {
    const a = (inv ? 2 : -2) * Math.PI / len, wr = Math.cos(a), wi = Math.sin(a);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const ur = re[i + k], ui = im[i + k], vr = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci, vi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr;
        re[i + k] = ur + vr; im[i + k] = ui + vi; re[i + k + len / 2] = ur - vr; im[i + k + len / 2] = ui - vi;
        const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
      }
    }
  }
  if (inv) for (let i = 0; i < n; i++) { re[i] /= n; im[i] /= n; }
}
// spec: lo (Hz, low resonance), loQ, hi (Hz, top roll-off, 4th order), bumps [[Hz, dB, width in octaves]], ripple (dB of cone break-up wiggle above 1 kHz)
function cabDb(f, s) {
  const x = f / s.lo, hp = 20 * Math.log10((x * x) / Math.sqrt((1 - x * x) ** 2 + (x / s.loQ) ** 2) || 1e-9);
  const y = f / s.hi, lp = -10 * Math.log10(1 + y ** 8);
  let b = 0; for (const [f0, g, w] of s.bumps) b += g * Math.exp(-((Math.log2(f / f0)) ** 2) / (2 * w * w));
  const r = f > 900 ? s.ripple * (Math.sin(Math.log2(f) * 9.1 + s.seed) * 0.6 + Math.sin(Math.log2(f) * 23.7 + s.seed * 2) * 0.4) : 0;
  return Math.max(-90, hp) + lp + b + r;
}
function cabinet(ctx, s) {
  const N = 8192, sr = ctx.sampleRate, re = new Float64Array(N), im = new Float64Array(N);
  for (let k = 0; k <= N / 2; k++) { const f = Math.max(k * sr / N, 1); re[k] = cabDb(f, s) / 20 * Math.LN10; if (k > 0 && k < N / 2) re[N - k] = re[k]; }
  fft(re, im, true);                                                    // real cepstrum
  for (let i = 1; i < N / 2; i++) { re[i] *= 2; im[i] = 0; }
  for (let i = N / 2 + 1; i < N; i++) { re[i] = 0; im[i] = 0; }
  im[0] = 0; im[N / 2] = 0;
  fft(re, im, false);
  for (let i = 0; i < N; i++) { const m = Math.exp(re[i]); const p = im[i]; re[i] = m * Math.cos(p); im[i] = m * Math.sin(p); }
  fft(re, im, true);                                                    // minimum-phase impulse
  const L = 3072, buf = ctx.createBuffer(1, L, sr), d = buf.getChannelData(0);
  for (let i = 0; i < L; i++) d[i] = re[i] * (i > L - 512 ? 0.5 + 0.5 * Math.cos(Math.PI * (i - (L - 512)) / 512) : 1);
  const c = ctx.createConvolver(); c.normalize = false; c.buffer = buf;
  return c;
}
// curves set so 1 kHz sits near 0 dB
const CABS = {
  jensen15: { lo: 72, loQ: 1.3, hi: 3900, bumps: [[140, 1.5, 0.8], [1300, 2, 0.7], [2600, 1.5, 0.4]], ripple: 1.0, seed: 1 },
  jensen12open: { lo: 105, loQ: 0.9, hi: 4800, bumps: [[220, 1, 0.6], [1100, 1.5, 0.6], [2500, 4, 0.5]], ripple: 1.2, seed: 2 },
  blue2x12: { lo: 95, loQ: 1.1, hi: 5600, bumps: [[400, -1.5, 0.7], [1600, 1.5, 0.5], [3100, 6, 0.45]], ripple: 1.5, seed: 3 },
  greenback4x12: { lo: 98, loQ: 1.7, hi: 4700, bumps: [[180, 2, 0.6], [650, -1.5, 0.6], [2100, 4.5, 0.5], [3600, 2, 0.3]], ripple: 1.4, seed: 4 },
  twin2x12: { lo: 85, loQ: 1.0, hi: 6200, bumps: [[600, -1, 0.8], [2900, 2.5, 0.6]], ripple: 0.8, seed: 5 },
  t75_4x12: { lo: 105, loQ: 2.0, hi: 5600, bumps: [[120, 3, 0.5], [450, -3.5, 0.8], [3300, 4.5, 0.5]], ripple: 1.3, seed: 6 },
};

function springIR(ctx, sec, tail) {
  return noise(ctx, sec, (t, r) => r * Math.exp(-t / tail) * (0.6 + 0.4 * Math.sin(t * 2 * Math.PI * 41)));
}
function spring(ctx, mix, sec = 2.2, tail = 0.55) {
  const io = gain(ctx, 1), out = gain(ctx, 1), cv = ctx.createConvolver(), lo = bq(ctx, 'highpass', 450, 0.6), hi = bq(ctx, 'lowpass', 3800, 0.7), w = gain(ctx, mix);
  cv.buffer = springIR(ctx, sec, tail);
  io.connect(out); series(io, lo, cv, hi, w, out);
  return { in: io, out };
}

/* ---------- pedals (fixed settings) ---------- */
export const PEDALS = [
  {
    id: 'maestro-fz1', year: 1962, brand: 'Maestro', model: 'FZ-1 Fuzz-Tone', ar: 0.7538, h: 1.1,
    // thin and buzzy; notes cut off as they decay
    build(ctx) {
      const s = shaper(ctx, (u) => { const t = 0.35, v = Math.abs(u) < t ? 0 : u - Math.sign(u) * t; return v > 0 ? Math.tanh(v * 2.2) * 0.9 : Math.max(-0.5, Math.tanh(v * 0.9)); }, 60);
      return series(bq(ctx, 'highpass', 320, 0.7), gain(ctx, 55), s, bq(ctx, 'highpass', 40), bq(ctx, 'peaking', 1250, 1.2, 6), bq(ctx, 'lowpass', 4300, 0.8), gain(ctx, db(-13.5)));
    },
  },
  {
    id: 'fuzz-face', year: 1966, brand: 'Arbiter', model: 'Fuzz Face', ar: 1.0196, h: 1.05,
    // germanium: fat, rounded, uneven halves
    build(ctx) {
      const s = shaper(ctx, (u) => { const v = u + 0.45; return (v > 0 ? Math.tanh(v * 1.1) : Math.tanh(v * 0.7) * 0.8) - Math.tanh(0.45 * 1.1); }, 40);   // bias shift: the two halves clip at different points
      return series(bq(ctx, 'highpass', 85, 0.7), gain(ctx, 38), s, bq(ctx, 'highpass', 35), bq(ctx, 'lowshelf', 220, 0.7, 2), bq(ctx, 'lowpass', 5200, 0.7), gain(ctx, db(-13.6)));
    },
  },
  {
    id: 'vox-v846', year: 1967, brand: 'Vox', model: 'V846 Wah-Wah', ar: 0.4125, h: 1.55,
    // the foot rocks once every two beats
    build(ctx, env) {
      const bp = bq(ctx, 'bandpass', 820, 4.6), lfo = ctx.createOscillator(), depth = gain(ctx, 560), mk = gain(ctx, db(13)), lp = bq(ctx, 'lowpass', 4200, 0.7);
      lfo.frequency.value = env.bpm / 60 / 2; lfo.connect(depth).connect(bp.frequency); lfo.start();
      const io = gain(ctx, 1), out = gain(ctx, 1);
      series(io, bp, mk, lp, out); series(io, gain(ctx, 0.12), out);
      return { in: io, out, stop: () => lfo.stop() };
    },
  },
  {
    id: 'roland-re-201', year: 1974, brand: 'Roland', model: 'RE-201 Space Echo', ar: 2.2082, h: 0.95,
    // dotted-eighth tape echo with wow and flutter, plus the spring reverb
    build(ctx, env) {
      const io = gain(ctx, 1), out = gain(ctx, 1), dl = ctx.createDelay(2), fb = gain(ctx, 0.44), sat = shaper(ctx, (u) => Math.tanh(u), 2.5);
      const t = Math.min(0.6, Math.max(0.22, 60 / env.bpm * 0.75)); dl.delayTime.value = t;
      const wow = ctx.createOscillator(), wd = gain(ctx, 0.0018), flt = ctx.createOscillator(), fd = gain(ctx, 0.00025);
      wow.frequency.value = 0.6; flt.frequency.value = 7; wow.connect(wd).connect(dl.delayTime); flt.connect(fd).connect(dl.delayTime); wow.start(); flt.start();
      io.connect(out);
      series(io, dl, bq(ctx, 'lowpass', 2700, 0.7), bq(ctx, 'highpass', 170, 0.7), sat, fb, dl);
      series(sat, gain(ctx, db(-5)), out);
      const spWet = ctx.createConvolver(); spWet.buffer = springIR(ctx, 2.4, 0.6);
      series(io, bq(ctx, 'highpass', 450, 0.6), spWet, bq(ctx, 'lowpass', 3600, 0.7), gain(ctx, 0.3), out);
      return { in: io, out, stop: () => { wow.stop(); flt.stop(); } };
    },
  },
  {
    id: 'boss-ds-1', year: 1978, brand: 'BOSS', model: 'DS-1 Distortion', ar: 0.6577, h: 1.0,
    // op-amp gain into hard diode clipping, a scooped tone
    build(ctx) {
      const s = shaper(ctx, (u) => Math.max(-1, Math.min(1, Math.tanh(u * 1.6) * 1.15)), 40);
      return series(bq(ctx, 'highpass', 110, 0.7), gain(ctx, 70), s, bq(ctx, 'peaking', 520, 0.9, -6), bq(ctx, 'highshelf', 2800, 0.7, 2), bq(ctx, 'lowpass', 5400, 0.7), gain(ctx, db(-17)));
    },
  },
  {
    id: 'proco-rat', year: 1979, brand: 'ProCo', model: 'RAT', ar: 1.215, h: 1.0,
    // more gain in the upper mids, hard clip, filter rolled back
    build(ctx) {
      const s = shaper(ctx, (u) => Math.tanh(u * 2.4), 60);
      return series(bq(ctx, 'highpass', 70, 0.7), bq(ctx, 'highshelf', 900, 0.7, 9), gain(ctx, 48), s, bq(ctx, 'lowpass', 3300, 0.7), bq(ctx, 'lowpass', 6500, 0.7), gain(ctx, db(-18.5)));
    },
  },
  {
    id: 'ibanez-ts808', year: 1979, brand: 'Ibanez', model: 'TS808 Tube Screamer', ar: 0.6365, h: 1.0,
    // mid hump: low end kept clean, the drive path clipped softly, output up to push the amp
    build(ctx) {
      const io = gain(ctx, 1), out = gain(ctx, 1), s = shaper(ctx, (u) => Math.tanh(u), 16);
      series(io, bq(ctx, 'highpass', 720, 0.6), gain(ctx, 24), s, gain(ctx, 0.5), out);
      series(io, bq(ctx, 'lowpass', 720, 0.6), gain(ctx, 0.5), out);
      const tone = series(out, bq(ctx, 'lowpass', 3400, 0.6), bq(ctx, 'peaking', 900, 0.8, 2), gain(ctx, db(-7.2)));
      return { in: io, out: tone.out };
    },
  },
  {
    id: 'klon-centaur', year: 1994, brand: 'Klon', model: 'Centaur', ar: 1.3065, h: 1.0,
    // clean signal blended with a clipped, treble-lifted copy; mostly a louder version of the guitar
    build(ctx) {
      const io = gain(ctx, 1), out = gain(ctx, 1), s = shaper(ctx, (u) => Math.tanh(u * 1.4) / Math.tanh(1.4), 12);
      series(io, bq(ctx, 'highpass', 300, 0.6), gain(ctx, 6), s, gain(ctx, 0.45), out);
      series(io, gain(ctx, 1), out);
      const tone = series(out, bq(ctx, 'highshelf', 1600, 0.7, 4), gain(ctx, db(-4.6)));
      return { in: io, out: tone.out };
    },
  },
].map((p) => ({ ...p, img: G + p.id + '.png' }));

/* ---------- amps ---------- */
// hp: input high-pass · g1/b1: first stage gain and bias · hp2/g2/b2: optional second stage · tone: [type, Hz, Q, dB]
// pg: power-stage drive · cab: speaker curve · rev: spring reverb mix
export const AMPS = [
  { id: 'bassman', year: 1952, brand: 'Fender', model: 'Bassman', ar: 1.0239, hp: 60, g1: 3.2, b1: 0.15, tone: [['lowshelf', 130, 0.7, 2], ['peaking', 800, 0.8, 1], ['highshelf', 2600, 0.7, -3]], pg: 1.8, cab: 'jensen15' },
  { id: 'tweed-deluxe', year: 1955, brand: 'Fender', model: 'Deluxe 5E3', ar: 1.1984, hp: 80, g1: 7, b1: 0.25, tone: [['lowshelf', 150, 0.7, -1], ['peaking', 950, 0.7, 3], ['highshelf', 3000, 0.7, -1]], pg: 3.4, cab: 'jensen12open' },
  { id: 'vox-ac30', year: 1960, brand: 'Vox', model: 'AC30/6', ar: 1.2216, hp: 120, g1: 4.5, b1: 0.1, tone: [['lowshelf', 160, 0.7, -3], ['peaking', 1500, 0.8, 2], ['highshelf', 3000, 0.7, 5]], pg: 3.6, cab: 'blue2x12' },
  { id: 'marshall-jtm45', year: 1962, brand: 'Marshall', model: 'JTM45', ar: 2.5, hp: 90, g1: 6, b1: 0.2, tone: [['lowshelf', 120, 0.7, 1], ['peaking', 650, 0.7, -2], ['highshelf', 3000, 0.7, 2]], pg: 2.8, cab: 'greenback4x12' },
  { id: 'twin-reverb', year: 1963, brand: 'Fender', model: 'Twin Reverb', ar: 1.2552, hp: 70, g1: 1.5, b1: 0.05, tone: [['lowshelf', 100, 0.7, 3], ['peaking', 600, 0.6, -6], ['highshelf', 3000, 0.7, 4]], pg: 0.8, cab: 'twin2x12', rev: 0.22 },
  { id: 'marshall-super-lead', year: 1965, brand: 'Marshall', model: '1959 Super Lead', ar: 2.3364, hp: 110, g1: 11, b1: 0.2, tone: [['peaking', 700, 0.8, 1.5], ['highshelf', 3000, 0.7, 3]], pg: 4.2, cab: 'greenback4x12' },
  { id: 'marshall-jcm800', year: 1981, brand: 'Marshall', model: 'JCM800 2203', ar: 2.6667, hp: 120, g1: 9, b1: 0.25, hp2: 320, g2: 7, b2: 0.3, tone: [['lowshelf', 100, 0.7, 2], ['peaking', 480, 0.8, -3], ['peaking', 1800, 0.9, 3], ['highshelf', 3500, 0.7, 2]], pg: 2.2, cab: 't75_4x12' },
].map((a) => ({ ...a, img: G + a.id + '.png' }));

// output levels measured with tools/signal-check.html (clean chain, all seven guitars averaged) — keeps every amp near −18 dBFS RMS
const TRIM = { 'bassman': -1.1, 'tweed-deluxe': -5.5, 'vox-ac30': -3.6, 'marshall-jtm45': -5.8, 'twin-reverb': 10, 'marshall-super-lead': -8.5, 'marshall-jcm800': -5.4 };

function buildAmp(ctx, a) {
  const parts = [bq(ctx, 'highpass', a.hp, 0.7), gain(ctx, a.g1), shaper(ctx, tube(a.b1), 24), bq(ctx, 'highpass', 30, 0.7)];
  if (a.g2) parts.push(bq(ctx, 'highpass', a.hp2, 0.7), gain(ctx, a.g2), shaper(ctx, tube(a.b2), 24), bq(ctx, 'highpass', 30, 0.7));
  for (const [t, f, q, g] of a.tone) parts.push(bq(ctx, t, f, q, g));
  const comp = ctx.createDynamicsCompressor();                         // power-supply sag
  comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 3; comp.attack.value = 0.004; comp.release.value = 0.14;
  parts.push(gain(ctx, a.pg / 3), shaper(ctx, (u) => Math.tanh(u), 8), comp);
  if (a.rev) parts.push(spring(ctx, a.rev));
  parts.push(cabinet(ctx, CABS[a.cab]), gain(ctx, db(-6 + (TRIM[a.id] ?? 0))));
  return series(...parts);
}

/* ---------- one complete chain: source level → pedals → amp, with a tap after every stage ---------- */
// returns { in, out, taps: [dry, after pedal 1, …, after amp], stop() }
export function buildChain(ctx, pedalIds, ampId, env) {
  const input = gain(ctx, env.inGain), taps = [], stops = [];
  const tap = (n) => { const an = ctx.createAnalyser(); an.fftSize = 2048; an.smoothingTimeConstant = 0; OUT(n).connect(an); taps.push(an); };
  tap(input);
  let last = input;
  for (const id of pedalIds) {
    const p = PEDALS.find((x) => x.id === id).build(ctx, env);
    OUT(last).connect(IN(p)); last = p; tap(p);
    if (p.stop) stops.push(p.stop);
  }
  const amp = buildAmp(ctx, AMPS.find((x) => x.id === ampId));
  OUT(last).connect(IN(amp)); tap(amp);
  return { in: input, out: OUT(amp), taps, stop: () => stops.forEach((s) => { try { s(); } catch {} }) };
}

/* ---------- master: volume → small room → limiter ---------- */
export function buildMaster(ctx) {
  const input = gain(ctx, 1), vol = gain(ctx, 0), room = ctx.createConvolver(), wet = gain(ctx, 0.1), lim = ctx.createDynamicsCompressor();
  room.buffer = noise(ctx, 0.5, (t, r) => r * Math.exp(-t / 0.09));
  lim.threshold.value = -3; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = 0.002; lim.release.value = 0.12;
  input.connect(vol); input.connect(room).connect(wet).connect(vol);
  vol.connect(lim).connect(ctx.destination);
  return { in: input, vol };
}

/* ---------- dry recordings ---------- */
const cache = new Map();
// decoded buffer plus the gain that brings it to −20 dBFS RMS
export async function loadDI(ctx, guitar) {
  if (cache.has(guitar.id)) return cache.get(guitar.id);
  const p = fetch(DI + guitar.di + '.wav').then((r) => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
    .then((b) => ctx.decodeAudioData(b))
    .then((buf) => { const d = buf.getChannelData(0); let s = 0; for (let i = 0; i < d.length; i++) s += d[i] * d[i]; return { buf, inGain: db(-20) / Math.max(1e-4, Math.sqrt(s / d.length)) }; });
  cache.set(guitar.id, p);
  p.catch(() => cache.delete(guitar.id));
  return p;
}
