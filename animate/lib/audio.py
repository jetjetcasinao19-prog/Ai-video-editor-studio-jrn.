"""Soundtrack for a code-animated short — everything synthesised, no samples.

    python3 -I lib/audio.py build/cues.json

cues.json (written by lib/engine.mjs):
  voice     the voice-over file
  duration  video length in seconds; start/end: the part being rendered
  music     {bpm, root, maqam, gain, sections:[{from,to,mood}]} or null
  sfx       [{t, type, gain, pitch}]
  out       output .wav (voice + score + effects, ducked and loudness-normalised)

Scores: music.kit = 'ottoman' (default) or 'mind' (INKBLOT: music box, felt
piano, low strings, ticking clock, heartbeat; music.scale = minor | dorian |
harmonic | major | lydian).
Space (both kits): the score sits in a synthetic stereo hall/room, effects in
a lighter room, the voice stays dry but gets a rumble filter + gentle
compression, notes are humanised (timing/velocity), and a faint analog bed
(tape hiss / room tone) runs under everything. Optional cues.space =
{reverb, wet, sfxWet, bed, polish}.
Ottoman kit: — ney drone, plucked oud and kanun (Karplus-Strong
strings), def/darbuka (düm / tek / ka) in a maqsum rhythm; moods: intro,
groove, sad, drive, triumph, end. Needs numpy and ffmpeg.
"""
import json, subprocess, sys
import numpy as np

SR = 44100
RNG = np.random.default_rng(7)
HUM = np.random.default_rng(11)  # timing / velocity humanizer


def load_voice(path, dur):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                         check=True, capture_output=True).stdout
    v = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
    out = np.zeros(int(dur * SR))
    out[:min(len(v), len(out))] = v[:len(out)]
    return out


def env_adsr(n, a=0.005, d=0.1, s=0.0, r=0.1):
    t = np.arange(n) / SR
    e = np.where(t < a, t / max(a, 1e-6), 1.0)
    e = e * np.where(t >= a, s + (1 - s) * np.exp(-(t - a) / max(d, 1e-6)), 1)
    return e


def lowpass(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc; y[i] = acc
    return y


def onepole_hp(x, cutoff):
    return x - lowpass(x, cutoff)


def bandnoise(n, lo, hi):
    spec = np.fft.rfft(RNG.standard_normal(n))
    f = np.fft.rfftfreq(n, 1 / SR)
    spec[(f < lo) | (f > hi)] = 0
    y = np.fft.irfft(spec, n)
    return y / (np.abs(y).max() + 1e-9)


def ks_string(freq, dur, bright=0.5, decay=0.996):
    """Karplus-Strong plucked string (oud / kanun)."""
    n = int(dur * SR); p = max(2, int(SR / freq))
    buf = RNG.uniform(-1, 1, p)
    buf = lowpass(buf, 1500 + bright * 6000)
    out = np.zeros(n)
    for i in range(n):
        j = i % p
        out[i] = buf[j]
        buf[j] = decay * 0.5 * (buf[j] + buf[(j + 1) % p])
    return out * env_adsr(n, 0.002, dur * 0.9, 0, 0)


def ney(freq, dur, breath=0.25):
    n = int(dur * SR); t = np.arange(n) / SR
    vib = 1 + 0.006 * np.sin(2 * np.pi * 5.2 * t) * np.clip(t / 0.6, 0, 1)
    ph = 2 * np.pi * freq * np.cumsum(vib) / SR
    tone = np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.12 * np.sin(3 * ph)
    air = bandnoise(n, freq * 0.8, freq * 4) * breath
    e = np.clip(t / 0.35, 0, 1) * np.clip((dur - t) / 0.4, 0, 1)
    return (tone + air) * e


def drum_dum(dur=0.45):
    n = int(dur * SR); t = np.arange(n) / SR
    f = 55 + 60 * np.exp(-t * 30)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)
    return body + 0.15 * bandnoise(n, 80, 600) * np.exp(-t * 40)


def drum_tek(dur=0.12, lo=1800, hi=6000):
    n = int(dur * SR); t = np.arange(n) / SR
    return bandnoise(n, lo, hi) * np.exp(-t * 55) + 0.4 * np.sin(2 * np.pi * 900 * t) * np.exp(-t * 80)


NOTE = {'C': 261.63, 'D': 293.66, 'E': 329.63, 'F': 349.23, 'G': 392.0, 'A': 440.0, 'B': 493.88}
MAQAM = {  # semitones from the root
    'hicaz': [0, 1, 4, 5, 7, 8, 10, 12],
    'rast': [0, 2, 3.5, 5, 7, 9, 10.5, 12],
    'nihavend': [0, 2, 3, 5, 7, 8, 10, 12],
}


def degree_freq(root, scale, deg, octave=0):
    o, d = divmod(deg, 7)
    return root * 2 ** ((scale[d] + 12 * (o + octave)) / 12)


# little Hicaz phrases (scale degrees), one per bar, eighth notes; None = rest
MOTIFS = [
    [0, 1, 2, 3, 4, None, 3, 2], [4, 5, 4, 3, 2, 1, 2, None], [2, 3, 4, 6, 5, 4, 3, 2],
    [4, None, 4, 5, 6, 7, 6, 5], [3, 2, 1, 2, 3, None, 1, 0], [7, 6, 5, 4, 5, 4, 3, 2],
]
MAQSUM = ['D', 'T', None, 'T', 'D', None, 'T', None]  # 8 eighths


def score(cfg, dur):
    L = int(dur * SR)
    left = np.zeros(L + SR * 4); right = np.zeros(L + SR * 4)
    root = NOTE.get(cfg.get('root', 'D'), 293.66) / 2  # D3
    scale = MAQAM.get(cfg.get('maqam', 'hicaz'), MAQAM['hicaz'])
    beat = 60 / cfg.get('bpm', 96); eighth = beat / 2
    cache = {}

    def add(sig, t, g=1.0, pan=0.0):
        # a player is never sample-exact: a few ms early/late, a little louder/softer
        t = t + HUM.normal(0, 0.006); g = g * (1 + HUM.normal(0, 0.09))
        i = int(t * SR)
        if i < 0 or i >= len(left): return
        s = sig[:len(left) - i] * g
        left[i:i + len(s)] += s * (1 - max(0, pan)); right[i:i + len(s)] += s * (1 + min(0, pan))

    def pluck(freq, d, bright, decay):
        k = (round(freq, 1), d, bright, decay)
        if k not in cache: cache[k] = ks_string(freq, d, bright, decay)
        return cache[k]

    dum, tek, ka = drum_dum(), drum_tek(), drum_tek(0.08, 2500, 8000) * 0.5
    zil = bandnoise(int(1.2 * SR), 5000, 14000) * np.exp(-np.arange(int(1.2 * SR)) / SR * 4)
    for sec in cfg.get('sections', []):
        a, b, mood = sec['from'], sec['to'], sec['mood']
        # drone (ney on root + fifth), swelling across the section
        if mood in ('intro', 'sad', 'groove', 'drive', 'triumph'):
            g = {'intro': 0.22, 'sad': 0.18, 'groove': 0.1, 'drive': 0.1, 'triumph': 0.12}[mood]
            add(ney(root, b - a + 0.6), a, g, -0.2)
            add(ney(root * 1.5, b - a + 0.6, 0.35), a, g * 0.55, 0.2)
        bar = int(a / (eighth * 8))
        t = bar * eighth * 8
        while t < b:
            motif = MOTIFS[bar % len(MOTIFS)]
            for k in range(8):
                tt = t + k * eighth
                if tt < a or tt >= b: continue
                # percussion
                hit = MAQSUM[k]
                if mood in ('groove', 'drive', 'triumph'):
                    if hit == 'D': add(dum, tt, 0.9)
                    elif hit == 'T': add(tek, tt, 0.45, 0.3)
                    if mood in ('drive', 'triumph') and hit is None: add(ka, tt, 0.5, -0.3)
                    if mood in ('drive', 'triumph'): add(ka, tt + eighth / 2, 0.3, 0.3)
                    if mood == 'triumph' and k == 0 and bar % 2 == 0: add(zil, tt, 0.18, 0.4)
                elif mood == 'sad' and k == 0: add(dum, tt, 0.5)
                # melody: oud (low, every eighth in groove), kanun (high) in drive/triumph
                deg = motif[k]
                if deg is None: continue
                if mood == 'intro' and k % 2 == 0:
                    add(pluck(degree_freq(root, scale, deg, 1), 1.2, 0.8, 0.997), tt, 0.25, 0.3)
                elif mood == 'groove':
                    add(pluck(degree_freq(root, scale, deg, 0), 0.9, 0.5, 0.995), tt, 0.32, -0.1)
                elif mood == 'sad' and k % 4 == 0:
                    add(pluck(degree_freq(root, scale, 7 - deg % 8, 0), 1.6, 0.3, 0.996), tt, 0.3, 0)
                elif mood in ('drive', 'triumph'):
                    add(pluck(degree_freq(root, scale, deg, 0), 0.8, 0.55, 0.995), tt, 0.28, -0.15)
                    if mood == 'triumph' or k % 2 == 0:
                        add(pluck(degree_freq(root, scale, deg, 1), 0.6, 0.9, 0.994), tt + 0.01, 0.2, 0.25)
            t += eighth * 8; bar += 1
        if mood == 'end':  # final chord and one last big düm
            for deg, pan in ((0, -0.3), (2, 0), (4, 0.3), (7, 0)):
                add(pluck(degree_freq(root, scale, deg, 0), 3.0, 0.6, 0.998), a + 0.02 * deg, 0.35, pan)
            add(ney(root, 3.0), a, 0.25)
            add(dum, a, 1.2)
    return left[:L], right[:L]


# ---------- 'mind' kit (INKBLOT style): music box, felt piano, low strings,
# a ticking clock and a heartbeat. Moods: intro, groove, sad, drive, tense,
# triumph, end. Select with music.kit = 'mind' and music.scale. ----------
SCALES = {
    'minor': [0, 2, 3, 5, 7, 8, 10, 12], 'dorian': [0, 2, 3, 5, 7, 9, 10, 12],
    'harmonic': [0, 2, 3, 5, 7, 8, 11, 12], 'major': [0, 2, 4, 5, 7, 9, 11, 12],
    'lydian': [0, 2, 4, 6, 7, 9, 11, 12],
}
PROGRESSION = [0, 5, 2, 6]  # i – VI – III – VII (the "sad but driving" loop)


def musicbox(freq, dur=1.6):
    t = np.arange(int(dur * SR)) / SR
    s = (np.sin(2 * np.pi * freq * t) * np.exp(-t * 3.2)
         + 0.35 * np.sin(2 * np.pi * freq * 2.005 * t) * np.exp(-t * 5)
         + 0.12 * np.sin(2 * np.pi * freq * 5.43 * t) * np.exp(-t * 11))
    return s * np.clip(t / 0.002, 0, 1)


def piano(freq, dur=2.0, soft=0.6):
    """Felt piano: 3 slightly detuned strings per note (they beat, like a real
    unison), stretched partials, upper partials die first, a soft hammer thump."""
    t = np.arange(int(dur * SR)) / SR
    s = np.zeros_like(t)
    for k in range(1, 9):
        fk = freq * k * (1 + 0.0004 * k * k)
        if fk > 9000: break
        amp = (1 / k ** 1.5) * (0.55 if k == 1 else 1)
        dec = 1.2 + k * soft * 0.9
        for det, ph in ((-0.0009, 0.0), (0.0, 1.3), (0.0011, 2.1)):
            s += amp / 3 * np.sin(2 * np.pi * fk * (1 + det) * t + ph) * np.exp(-t * dec)
    # two-stage decay: a quick drop after the strike, then the long ring
    s *= (0.6 + 0.4 * np.exp(-t * 6)) * np.clip(t / 0.004, 0, 1)
    n = min(len(t), int(0.05 * SR))
    s[:n] += (bandnoise(n, 60, 900) * 0.5 + bandnoise(n, 900, 4000) * 0.15) * np.exp(-t[:n] * 120) * 0.25
    return s * 0.55


def strings(freq, dur):
    """A small bowed ensemble: 5 players slightly out of tune with each other,
    each with their own slow vibrato, a soft bow attack and a dark tone."""
    t = np.arange(int(dur * SR)) / SR
    s = np.zeros_like(t)
    g = np.random.default_rng(int(freq * 10) % 9973)
    for det in (-0.006, -0.0025, 0.0, 0.003, 0.0055):
        rate, depth, ph0 = g.uniform(4.6, 5.6), g.uniform(0.0018, 0.003), g.uniform(0, 6.28)
        vib = 1 + depth * np.sin(2 * np.pi * rate * t + ph0) * np.clip((t - 0.25) / 0.6, 0, 1)
        ph = 2 * np.pi * freq * (1 + det) * np.cumsum(vib) / SR
        for k in range(1, 8):
            s += (1 / k ** 1.6) * np.sin(k * ph + g.uniform(0, 6.28))
    e = np.clip(t / 0.9, 0, 1) ** 1.5 * np.clip((dur - t) / 0.7, 0, 1)
    bow = bandnoise(len(t), freq * 1.5, freq * 6) * 0.05
    return (s * 0.2 + bow) * e * 0.12


def tick(high=True):
    n = int(0.05 * SR); t = np.arange(n) / SR
    f = 3200 if high else 2100
    return (bandnoise(n, f * 0.7, f * 2.2) * 0.6 + np.sin(2 * np.pi * f * t)) * np.exp(-t * 160)


def kick(dur=0.35):
    t = np.arange(int(dur * SR)) / SR
    f = 48 + 90 * np.exp(-t * 35)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11)


def brush(dur=0.25):
    t = np.arange(int(dur * SR)) / SR
    return bandnoise(len(t), 1800, 9000) * np.clip(t / 0.02, 0, 1) * np.exp(-t * 18) * 0.5


def heartbeat():
    out = np.zeros(int(0.7 * SR))
    for at, g in ((0, 1.0), (0.22, 0.7)):
        k = kick(0.3) * g; i = int(at * SR); out[i:i + len(k)] += k
    return out


def score_mind(cfg, dur):
    L = int(dur * SR)
    left = np.zeros(L + SR * 4); right = np.zeros(L + SR * 4)
    root = NOTE.get(cfg.get('root', 'D'), 293.66) / 2
    scale = SCALES.get(cfg.get('scale', 'minor'), SCALES['minor'])
    beat = 60 / cfg.get('bpm', 92); eighth = beat / 2
    cache = {}

    def add(sig, t, g=1.0, pan=0.0):
        # a player is never sample-exact: a few ms early/late, a little louder/softer
        t = t + HUM.normal(0, 0.006); g = g * (1 + HUM.normal(0, 0.09))
        i = int(t * SR)
        if i < 0 or i >= len(left): return
        s = sig[:len(left) - i] * g
        left[i:i + len(s)] += s * (1 - max(0, pan)); right[i:i + len(s)] += s * (1 + min(0, pan))

    def inst(name, f, d):
        k = (name, round(f, 2), d)
        if k not in cache: cache[k] = {'box': musicbox, 'piano': piano}[name](f, d)
        return cache[k]

    tk, tc, kk, br, hb = tick(True), tick(False), kick(), brush(), heartbeat()
    F = lambda deg, octv=0: degree_freq(root, scale, deg, octv)
    for sec in cfg.get('sections', []):
        a, b, mood = sec['from'], sec['to'], sec['mood']
        bar = int(a / (beat * 4)); t = bar * beat * 4
        while t < b:
            ch = PROGRESSION[bar % 4]
            tones = [ch, ch + 2, ch + 4]
            # pad under each bar
            if mood in ('intro', 'sad', 'tense', 'drive', 'triumph', 'groove'):
                pg = {'intro': 0.5, 'sad': 0.6, 'tense': 0.55, 'drive': 0.35, 'triumph': 0.45, 'groove': 0.25}[mood]
                st = max(t, a); d = min(beat * 4, b - st) + 0.5
                if d > 0.3:
                    for j, dg in enumerate(tones):
                        add(strings(F(dg, -1 if mood == 'tense' else 0), d), st, pg * (0.9 if j == 0 else 0.6), (j - 1) * 0.4)
            for k8 in range(8):
                tt = t + k8 * eighth
                if tt < a or tt >= b: continue
                on_beat = k8 % 2 == 0
                # clock ticks
                if mood in ('intro', 'tense', 'groove') and on_beat: add(tk if (k8 // 2) % 2 == 0 else tc, tt, 0.35 if mood != 'groove' else 0.22, 0.35)
                if mood == 'drive': add(tk, tt, 0.16, 0.4)
                # drums
                if mood in ('groove',) and k8 in (0, 4): add(kk, tt, 0.6)
                if mood in ('drive', 'triumph') and on_beat: add(kk, tt, 0.7)
                if mood in ('drive', 'triumph') and k8 in (2, 6): add(br, tt, 0.9, -0.2)
                if mood in ('tense', 'sad') and k8 == 0: add(hb, tt, 0.8 if mood == 'tense' else 0.5)
                # piano broken chords
                if mood in ('groove', 'drive', 'triumph'):
                    pat = [0, 2, 1, 2, 0, 2, 1, 2] if mood == 'groove' else [0, 1, 2, 1, 2, 1, 0, 1]
                    dg = tones[pat[k8]]
                    add(inst('piano', F(dg, 0 if pat[k8] else -1), 1.2), tt, 0.5 if mood == 'groove' else 0.45, -0.15)
                if mood == 'sad' and k8 == 0:
                    for j, dg in enumerate(tones): add(inst('piano', F(dg, -1 if j == 0 else 0), 3.0), tt + j * 0.03, 0.4)
                # music box
                if mood == 'intro' and on_beat: add(inst('box', F(tones[(k8 // 2) % 3], 2), 1.6), tt, 0.35, 0.3)
                if mood == 'sad' and k8 in (2, 6): add(inst('box', F(tones[(k8 // 4 + bar) % 3], 2), 1.6), tt, 0.3, 0.3)
                if mood == 'tense' and k8 == 6 and bar % 2: add(inst('box', F(ch, 2) * 2 ** (1 / 12), 1.6), tt, 0.25, 0.3)
                if mood == 'triumph': add(inst('box', F(tones[[0, 1, 2, 1, 2, 3, 2, 1][k8] % 3] + (7 if k8 == 5 else 0), 2), 1.6), tt, 0.3, 0.3)
                if mood == 'groove' and k8 in (3, 7) and bar % 2: add(inst('box', F(tones[2], 2), 1.6), tt, 0.2, 0.35)
            t += beat * 4; bar += 1
        if mood == 'end':
            for j, dg in enumerate((0, 2, 4, 7)):
                add(inst('piano', F(dg, -1 if j == 0 else 0), 4.0), a + 0.03 * j, 0.55, (j - 1.5) * 0.3)
                add(inst('box', F(dg, 2), 1.6), a + 0.25 + 0.18 * j, 0.3, 0.3)
            add(strings(F(0, -1), 4.0), a, 0.5)
            add(kk, a, 0.8)
    return left[:L], right[:L]


# ---------- sound effects ----------
def sfx_signal(kind, pitch=1.0):
    t = lambda d: np.arange(int(d * SR)) / SR
    if kind == 'pop':
        tt = t(0.09); f = 900 * pitch * np.exp(-tt * 25) + 300
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 60) + bandnoise(len(tt), 2000, 9000) * np.exp(-tt * 120) * 0.6
    if kind == 'whoosh':  # air rushing past: the noise band sweeps up then down
        tt = t(0.5); n = len(tt); out = np.zeros(n); seg = n // 10
        for k in range(10):
            c = 500 + 2600 * np.sin(np.pi * (k + 0.5) / 10) * pitch
            b = bandnoise(seg * 2, c * 0.5, c * 1.6)
            w = np.hanning(seg * 2); a = k * seg
            out[a:a + seg * 2] += (b * w)[:n - a]
        return out * np.sin(np.pi * tt / tt[-1]) ** 1.5 * 0.55
    if kind == 'paper':
        tt = t(0.6); n = bandnoise(len(tt), 1500, 9000)
        crackle = (RNG.random(len(tt)) < 0.02) * RNG.uniform(-1, 1, len(tt))
        return (n * 0.4 + crackle) * np.sin(np.pi * tt / tt[-1])
    if kind == 'chime':
        tt = t(1.6); s = 0
        for f, g in ((1318, 1), (1975, 0.6), (2637, 0.35)):
            s = s + g * np.sin(2 * np.pi * f * pitch * tt) * np.exp(-tt * 3)
        return s * 0.5
    if kind == 'stamp':
        tt = t(0.4); return drum_dum(0.4) * 0.9 + bandnoise(len(tt), 200, 3000) * np.exp(-tt * 30) * 0.7
    if kind == 'thud':
        return drum_dum(0.5)
    if kind == 'pluck':
        return ks_string(293.66 * pitch, 1.2, 0.8, 0.997)
    if kind == 'slide':
        tt = t(0.5); return bandnoise(len(tt), 400, 2500) * np.sin(np.pi * tt / tt[-1]) * 0.35
    if kind == 'sizzle':
        tt = t(1.3); n = bandnoise(len(tt), 3000, 12000)
        return n * (0.5 + 0.5 * RNG.random(len(tt))) * np.exp(-tt * 2.2) * 0.5
    if kind in ('wind', 'rain', 'waves'):
        d = {'wind': 2.2, 'rain': 1.6, 'waves': 2.5}[kind]; tt = t(d)
        lo, hi = {'wind': (200, 1200), 'rain': (1500, 9000), 'waves': (100, 900)}[kind]
        mod = 0.6 + 0.4 * np.sin(2 * np.pi * (0.7 if kind != 'waves' else 0.4) * tt)
        return bandnoise(len(tt), lo, hi) * mod * np.sin(np.pi * tt / tt[-1]) * 0.5
    if kind == 'crickets':
        tt = t(1.3); chirp = (np.sin(2 * np.pi * 30 * tt) > 0.3) * (np.sin(2 * np.pi * 2.2 * tt) > 0)
        return np.sin(2 * np.pi * 4300 * tt) * chirp * 0.35
    if kind == 'flop':  # sad slide-whistle
        tt = t(0.9); f = 700 * np.exp(-tt * 1.4)
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.clip(tt / 0.05, 0, 1) * np.exp(-tt * 1.5) * 0.5
    if kind == 'riser':
        tt = t(0.6); f = 200 + 1400 * (tt / tt[-1]) ** 2
        return (np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.3 + bandnoise(len(tt), 1000, 8000) * 0.3) * (tt / tt[-1]) ** 2
    if kind == 'gong':
        tt = t(3.0); s = 0
        for f, g, d in ((110, 1, 1.2), (164, 0.6, 1.5), (233, 0.4, 2), (397, 0.25, 3)):
            s = s + g * np.sin(2 * np.pi * f * pitch * tt * (1 + 0.002 * np.sin(2 * np.pi * 3 * tt))) * np.exp(-tt * d)
        s = s * 0.45; d = drum_dum(0.5); s[:len(d)] += d * 0.5
        return s
    if kind == 'clank':
        tt = t(0.3); s = sum(np.sin(2 * np.pi * f * tt) for f in (523, 1187, 1873)) * np.exp(-tt * 18)
        return s * 0.35
    if kind == 'alarm':
        tt = t(0.5); return (drum_dum(0.5) * 0.7 + np.sin(2 * np.pi * 220 * tt) * np.exp(-tt * 5) * 0.4)
    if kind == 'thunder':
        tt = t(2.5); return lowpass(RNG.standard_normal(len(tt)), 180) * 3 * np.exp(-tt * 1.6) * (0.6 + 0.4 * np.sin(2 * np.pi * 3 * tt))
    if kind == 'crack':
        tt = t(0.35); burst = bandnoise(len(tt), 1500, 12000) * np.exp(-tt * 25)
        tink = sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt * 14) for f in (3100, 4700, 6200)) * 0.25
        return burst + tink
    if kind == 'coins':
        out = np.zeros(int(1.4 * SR))
        for i in range(14):
            s = int(RNG.uniform(0, 1.0) * SR); tt = t(0.25)
            c = sum(np.sin(2 * np.pi * f * RNG.uniform(0.9, 1.2) * tt) for f in (2600, 3900, 5200)) * np.exp(-tt * 22) * 0.2
            out[s:s + len(c)] += c[:len(out) - s]
        return out
    # --- inkblot kit ---
    if kind == 'tick':
        out = np.zeros(int(1.0 * SR))
        for i in range(4):
            k = tick(i % 2 == 0); j = int(i * 0.25 * SR); out[j:j + len(k)] += k
        return out * 0.8
    if kind == 'heartbeat':
        out = np.zeros(int(1.6 * SR)); h = heartbeat()
        for at in (0, 0.8): j = int(at * SR); out[j:j + len(h)] += h[:len(out) - j]
        return out
    if kind == 'splat':  # wet ink hitting card
        tt = t(0.4)
        out = bandnoise(len(tt), 150, 2500) * np.exp(-tt * 14) * 0.9
        k = kick(0.3); out[:len(k)] += k * 0.5
        return out
    if kind == 'fold':  # card folding: soft swish + crease
        tt = t(0.45); sw = bandnoise(len(tt), 600, 5000) * np.sin(np.pi * tt / tt[-1]) ** 3 * 0.45
        c = bandnoise(int(0.05 * SR), 1500, 7000) * np.exp(-np.arange(int(0.05 * SR)) / SR * 90) * 0.5
        sw[-len(c):] += c
        return sw
    if kind == 'blink':
        tt = t(0.3); return bandnoise(len(tt), 200, 1500) * np.sin(np.pi * tt / tt[-1]) ** 2 * 0.4
    if kind == 'typewriter':
        out = np.zeros(int(0.9 * SR)); g = np.random.default_rng(3)
        for i in range(7):
            j = int((i * 0.11 + g.uniform(0, 0.03)) * SR); n = int(0.04 * SR); tt = np.arange(n) / SR
            k = (bandnoise(n, 1000, 7000) + 0.6 * np.sin(2 * np.pi * 1400 * tt)) * np.exp(-tt * 140)
            out[j:j + n] += k * 0.7
        return out
    if kind == 'bell':  # typewriter carriage bell
        tt = t(1.2); return sum(g * np.sin(2 * np.pi * f * pitch * tt) for f, g in ((2093, 1), (4186, 0.3), (5600, 0.15))) * np.exp(-tt * 4) * 0.5
    if kind == 'click':  # mouse click
        tt = t(0.04); return bandnoise(len(tt), 2000, 9000) * np.exp(-tt * 260)
    if kind == 'snap':  # a loop snapping shut
        tt = t(0.25); f = 1800 * np.exp(-tt * 18) + 200
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 22) * 0.6 + bandnoise(len(tt), 3000, 10000) * np.exp(-tt * 90) * 0.4
    if kind == 'buzz':  # phone vibrating on a nightstand
        tt = t(0.9); on = ((tt % 0.45) < 0.3).astype(float)
        return (np.sign(np.sin(2 * np.pi * 150 * tt)) * 0.3 + np.sin(2 * np.pi * 300 * tt) * 0.3) * on * 0.5
    if kind == 'pen':  # pen scratching paper
        tt = t(0.6); n = bandnoise(len(tt), 2500, 9000)
        return n * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 7 * tt))) * np.sin(np.pi * tt / tt[-1]) * 0.35
    if kind == 'moth':  # fluttering wings
        tt = t(1.0); return bandnoise(len(tt), 150, 900) * (0.5 + 0.5 * np.sin(2 * np.pi * 24 * tt)) * np.sin(np.pi * tt / tt[-1]) * 0.6
    # --- cinematic + story effects (both kits) ---
    if kind == 'boom':  # cinematic impact: sub drop + body + air
        tt = t(2.2); f = 30 + 70 * np.exp(-tt * 9)
        sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 1.8)
        body = lowpass(RNG.standard_normal(len(tt)), 400) * np.exp(-tt * 6) * 2.5
        return (sub * 1.1 + body + bandnoise(len(tt), 2000, 9000) * np.exp(-tt * 18) * 0.4) * 0.8
    if kind == 'hit':  # trailer hit: boom + metallic ring
        tt = t(1.8); s = sfx_signal('boom')[:len(tt)] * 0.8
        s += sum(g * np.sin(2 * np.pi * f * tt) for f, g in ((311, 1), (467, 0.7), (933, 0.4), (1490, 0.25))) * np.exp(-tt * 3.5) * 0.25
        return s
    if kind == 'slam':  # a heavy door / book slammed shut
        tt = t(0.6); return drum_dum(0.6) * 1.1 + bandnoise(len(tt), 150, 3500) * np.exp(-tt * 28) * 0.9
    if kind == 'reverse':  # reverse cymbal swelling INTO the next moment (place it ~1 s early)
        tt = t(1.1); c = bandnoise(len(tt), 3000, 14000) * np.exp(-tt * 3.2)
        return c[::-1] * 0.7
    if kind == 'scratch':  # record scratch ("wait, what?") — for freeze frames
        tt = t(0.5); out = np.zeros(len(tt))
        for a, b, d in ((0, 0.18, 1), (0.2, 0.42, -1)):
            i, j = int(a * SR), int(b * SR); u = np.arange(j - i) / SR
            f = (600 + 2200 * (u / u[-1] if d > 0 else 1 - u / u[-1]))
            out[i:j] += (bandnoise(j - i, 800, 5000) * 0.6 + np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.4) * np.sin(np.pi * u / u[-1])
        return out * 0.7
    if kind == 'ding':  # right answer / a small win
        tt = t(1.2); return sum(g * np.sin(2 * np.pi * f * pitch * tt) for f, g in ((1568, 1), (3136, 0.25), (2349, 0.4))) * np.exp(-tt * 4) * np.clip(tt / 0.003, 0, 1) * 0.5
    if kind == 'buzzer':  # wrong answer
        tt = t(0.7); s = np.sign(np.sin(2 * np.pi * 110 * tt)) * 0.4 + np.sign(np.sin(2 * np.pi * 116 * tt)) * 0.4
        return lowpass(s, 2500) * np.clip(tt / 0.01, 0, 1) * np.clip((0.7 - tt) / 0.05, 0, 1) * 0.55
    if kind == 'sparkle':  # magic shimmer: a run of high bell tones
        out = np.zeros(int(1.4 * SR)); g = np.random.default_rng(13)
        for i in range(12):
            f = 2000 + g.uniform(0, 3500); j = int(i * 0.06 * SR); tt = t(0.6)
            k = np.sin(2 * np.pi * f * pitch * tt) * np.exp(-tt * 9) * 0.25
            out[j:j + len(k)] += k[:len(out) - j]
        return out
    if kind == 'zoom':  # whoosh that rises into a zoom
        tt = t(0.55); f = 300 + 3000 * (tt / tt[-1]) ** 2
        n = bandnoise(len(tt), 500, 7000) * (tt / tt[-1]) ** 1.5
        return (n * 0.6 + np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.12 * (tt / tt[-1])) * np.clip((tt[-1] - tt) / 0.04, 0, 1)
    if kind == 'shutter':  # camera shutter: two mechanical clicks
        out = np.zeros(int(0.3 * SR))
        for at, g in ((0, 1.0), (0.09, 0.7)):
            n = int(0.03 * SR); tt = np.arange(n) / SR; j = int(at * SR)
            out[j:j + n] += (bandnoise(n, 1500, 9000) + np.sin(2 * np.pi * 2400 * tt) * 0.5) * np.exp(-tt * 200) * g
        return out
    if kind == 'glitch':  # digital stutter: chopped noise and blips
        out = np.zeros(int(0.45 * SR)); g = np.random.default_rng(17)
        for i in range(10):
            j = int(g.uniform(0, 0.4) * SR); n = int(g.uniform(0.008, 0.04) * SR); tt = np.arange(n) / SR
            k = np.sign(np.sin(2 * np.pi * g.uniform(200, 3000) * tt)) * 0.3 if g.random() < 0.5 else bandnoise(n, 1000, 12000) * 0.5
            out[j:j + n] += k[:len(out) - j]
        return out * 0.8
    if kind == 'static':  # radio / TV static
        tt = t(1.0); return bandnoise(len(tt), 800, 12000) * (0.6 + 0.4 * (RNG.random(len(tt)) < 0.3)) * np.sin(np.pi * tt / tt[-1]) * 0.4
    if kind == 'rip':  # paper tearing
        tt = t(0.55); g = np.random.default_rng(23)
        crackle = (g.random(len(tt)) < 0.08) * g.uniform(-1, 1, len(tt))
        return (bandnoise(len(tt), 1200, 8000) * 0.5 + lowpass(crackle, 5000) * 2) * np.clip(tt / 0.03, 0, 1) * np.exp(-tt * 2.5) * 0.7
    if kind == 'page':  # a page turning
        tt = t(0.6); sw = bandnoise(len(tt), 800, 7000) * np.sin(np.pi * tt / tt[-1]) ** 2 * 0.4
        flick = bandnoise(int(0.05 * SR), 2000, 9000) * np.exp(-np.arange(int(0.05 * SR)) / SR * 80) * 0.6
        sw[int(0.42 * SR):int(0.42 * SR) + len(flick)] += flick[:len(sw) - int(0.42 * SR)]
        return sw
    if kind == 'fire':  # fire catching: a whump, a roar, crackles
        tt = t(1.4); g = np.random.default_rng(29)
        roar = lowpass(RNG.standard_normal(len(tt)), 600) * 2.2 * np.clip(tt / 0.15, 0, 1) * np.exp(-tt * 1.8)
        cr = (g.random(len(tt)) < 0.004) * g.uniform(-1, 1, len(tt))
        cr = np.convolve(cr, np.exp(-np.arange(80) / 10), mode='same') * 0.9
        k = kick(0.3); out = roar + cr; out[:len(k)] += k * 0.3
        return out * 0.6
    if kind == 'drip':  # one fat ink drop: a bloop that rises
        tt = t(0.35); f = 400 * pitch + 900 * pitch * (tt / tt[-1]) ** 0.5
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 14) * 0.6
    if kind == 'bubble':
        out = np.zeros(int(0.8 * SR)); g = np.random.default_rng(31)
        for i in range(6):
            j = int(g.uniform(0, 0.6) * SR); k = sfx_signal('drip', g.uniform(0.8, 1.6)) * 0.5
            out[j:j + len(k)] += k[:len(out) - j]
        return out
    if kind == 'clack':  # tiles clacking over in a wave
        out = np.zeros(int(0.9 * SR)); g = np.random.default_rng(37)
        for i in range(9):
            j = int((i * 0.07 + g.uniform(0, 0.02)) * SR); n = int(0.04 * SR); tt = np.arange(n) / SR
            f = g.uniform(1400, 2400)
            out[j:j + n] += (np.sin(2 * np.pi * f * tt) * 0.6 + bandnoise(n, 1500, 6000) * 0.5) * np.exp(-tt * 120) * 0.6
        return out
    if kind == 'door':  # heavy wooden door: creak, then a thud
        tt = t(1.0); f = 180 + 60 * np.sin(2 * np.pi * 3 * tt) + 40 * tt
        creak = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.15 * np.clip((0.45 - tt) / 0.1, 0, 1) * np.clip(tt / 0.05, 0, 1)
        creak = lowpass(creak, 1800)
        th = drum_dum(0.5); out = creak; j = int(0.45 * SR); out[j:j + len(th)] += th[:len(out) - j] * 0.9
        return out
    if kind == 'knock':  # three knocks on wood
        out = np.zeros(int(0.8 * SR))
        for i in range(3):
            n = int(0.08 * SR); tt = np.arange(n) / SR; j = int(i * 0.2 * SR)
            out[j:j + n] += (np.sin(2 * np.pi * 180 * tt) + bandnoise(n, 300, 2500) * 0.6) * np.exp(-tt * 45)
        return out * 0.8
    if kind == 'footsteps':  # four steps on stone
        out = np.zeros(int(1.6 * SR))
        for i in range(4):
            n = int(0.12 * SR); tt = np.arange(n) / SR; j = int(i * 0.38 * SR)
            out[j:j + n] += (bandnoise(n, 150, 1800) * 0.8 + np.sin(2 * np.pi * 90 * tt) * 0.5) * np.exp(-tt * 40) * (0.8 + 0.2 * (i % 2))
        return out * 0.8
    if kind == 'glass':  # glass shattering
        tt = t(1.2); g = np.random.default_rng(41); out = bandnoise(len(tt), 3000, 14000) * np.exp(-tt * 9) * 0.5
        for i in range(18):
            j = int(g.uniform(0, 0.7) * SR); u = t(0.2); f = g.uniform(3000, 9000)
            k = np.sin(2 * np.pi * f * u) * np.exp(-u * 30) * 0.2
            out[j:j + len(k)] += k[:len(out) - j]
        return out
    if kind == 'rumble':  # earthquake / dread
        tt = t(2.5); return lowpass(RNG.standard_normal(len(tt)), 90) * 6 * np.sin(np.pi * tt / tt[-1]) * (0.7 + 0.3 * np.sin(2 * np.pi * 7 * tt))
    if kind == 'crowd':  # a murmuring crowd / bazaar
        tt = t(2.5); out = np.zeros(len(tt)); g = np.random.default_rng(43)
        for i in range(14):  # many voices = noise through moving vowel formants
            f1 = g.uniform(300, 800); f2 = g.uniform(900, 2400); rate = g.uniform(2, 5)
            v = bandnoise(len(tt), f1 * 0.8, f1 * 1.2) + bandnoise(len(tt), f2 * 0.85, f2 * 1.15) * 0.6
            out += v * (0.5 + 0.5 * np.sin(2 * np.pi * rate * tt + g.uniform(0, 6))) ** 2
        return out / 14 * np.sin(np.pi * tt / tt[-1]) ** 0.5 * 1.4
    if kind == 'applause':
        tt = t(2.2); out = np.zeros(len(tt)); g = np.random.default_rng(47)
        for i in range(260):
            j = int(g.uniform(0, 2.0) * SR); n = int(0.012 * SR); u = np.arange(n) / SR
            out[j:j + n] += bandnoise(n, 800, 6000) * np.exp(-u * 300) * g.uniform(0.3, 1)
        return out * np.clip((2.2 - tt) / 0.8, 0, 1) * 0.6
    if kind == 'cannon':
        tt = t(2.5); s = sfx_signal('boom')[:len(tt)]; s = np.concatenate([s, np.zeros(len(tt) - len(s))])
        return (s + bandnoise(len(tt), 200, 6000) * np.exp(-tt * 12) * 0.8) * 0.9
    if kind == 'sword':  # blade drawn from its sheath: a scrape into a ring
        tt = t(1.0); sc = bandnoise(len(tt), 3000, 10000) * np.clip(tt / 0.25, 0, 1) * np.clip((0.35 - tt) / 0.05, 0, 1) * 0.4
        ring = sum(g * np.sin(2 * np.pi * f * tt) for f, g in ((2960, 1), (4430, 0.5), (6100, 0.3))) * np.exp(-(tt - 0.3).clip(0) * 4) * (tt > 0.3) * 0.25
        return sc + ring
    if kind == 'hooves':  # horses galloping (da-da-dum)
        out = np.zeros(int(2.0 * SR))
        for bar in range(5):
            for k, off in enumerate((0, 0.09, 0.18)):
                n = int(0.08 * SR); u = np.arange(n) / SR; j = int((bar * 0.38 + off) * SR)
                out[j:j + n] += (np.sin(2 * np.pi * 120 * u) * 0.7 + bandnoise(n, 200, 2500) * 0.6) * np.exp(-u * 50) * (1 if k == 2 else 0.7)
        return out * np.linspace(0.5, 1, len(out)) * 0.8
    if kind == 'strum':  # an oud strum: four strings, fast down-stroke
        out = np.zeros(int(2.0 * SR))
        for i, deg in enumerate((0, 4, 7, 12)):
            k = ks_string(146.83 * pitch * 2 ** (deg / 12), 1.8, 0.6, 0.996); j = int(i * 0.025 * SR)
            out[j:j + len(k)] += k[:len(out) - j] * 0.5
        return out
    if kind == 'zil':  # finger cymbals
        tt = t(1.6); return sum(g * np.sin(2 * np.pi * f * pitch * tt) for f, g in ((3520, 1), (5280, 0.6), (7900, 0.3))) * np.exp(-tt * 3) * 0.35
    raise ValueError('unknown sfx ' + kind)


# ---------- space: stereo reverb, a room bed, voice polish ----------
def _fftconv(x, ir):
    n = 1 << int(np.ceil(np.log2(len(x) + len(ir))))
    y = np.fft.irfft(np.fft.rfft(x, n) * np.fft.rfft(ir, n), n)
    return y[:len(x)]


def impulse(seconds, seed, damp=0.5, pre=0.018):
    """Synthetic room: early reflections, then a dense tail whose highs die
    sooner than its lows (like a real hall)."""
    g = np.random.default_rng(seed)
    n = int(seconds * SR); t = np.arange(n) / SR
    lo = bandnoise(n, 40, 1500) * np.exp(-t * 6.9 / seconds)
    hi = bandnoise(n, 1500, 9000) * np.exp(-t * 6.9 / (seconds * (1 - damp * 0.75))) * 0.6
    ir = (lo + hi) * np.clip(t / 0.03, 0, 1)
    for k in range(9):  # early reflections off near walls
        j = int((0.006 + g.uniform(0, 0.06)) * SR)
        if j < n: ir[j] += g.uniform(0.3, 0.8) * (1 if g.random() < 0.5 else -1) * 3
    ir = np.concatenate([np.zeros(int(pre * SR)), ir])
    return ir / np.sqrt(np.sum(ir ** 2))


def reverb(L, R, seconds=1.8, wet=0.25, damp=0.5, seed=21):
    if wet <= 0: return L, R
    il, ir = impulse(seconds, seed, damp), impulse(seconds, seed + 1, damp)
    mono = (L + R) / 2
    wl = _fftconv(L * 0.7 + mono * 0.3, il); wr = _fftconv(R * 0.7 + mono * 0.3, ir)
    k = np.sqrt(np.mean(L ** 2 + R ** 2) / max(1e-12, np.mean(wl ** 2 + wr ** 2)))
    return L * (1 - wet * 0.5) + wl * k * wet, R * (1 - wet * 0.5) + wr * k * wet


def room_bed(n, kind):
    """A faint analog bed under the whole film — dead digital silence between
    lines sounds 'generated'. mind: tape hiss + soft vinyl crackle; ottoman:
    a warm room tone."""
    g = np.random.default_rng(5)
    bed = bandnoise(n, 60, 400) * 0.6 + bandnoise(n, 2000, 10000) * (0.16 if kind == 'mind' else 0.06)
    if kind == 'mind':
        pops = (g.random(n) < 7 / SR) * g.uniform(-1, 1, n)
        bed += np.convolve(pops, np.exp(-np.arange(60) / 8), mode='same') * 2
    return bed * 0.012


def polish_voice(v):
    """Rumble filter (below 70 Hz) and gentle 2.5:1 compression, so the voice
    sits clear and even on top of the score."""
    if not np.any(v): return v
    n = len(v); spec = np.fft.rfft(v); f = np.fft.rfftfreq(n, 1 / SR)
    spec *= np.clip((f - 40) / 40, 0, 1)
    v = np.fft.irfft(spec, n)
    win = int(0.03 * SR)
    rms = np.sqrt(np.convolve(v ** 2, np.ones(win) / win, mode='same') + 1e-12)
    thr = np.percentile(rms[rms > 1e-4], 60) if np.any(rms > 1e-4) else 0.05
    gain = np.where(rms > thr, (thr / rms) ** (1 - 1 / 2.5), 1.0)
    gain = np.convolve(gain, np.ones(int(0.01 * SR)) / int(0.01 * SR), mode='same')
    return v * gain



def main(path):
    cue = json.load(open(path))
    dur = float(cue['duration'])
    voice = load_voice(cue['voice'], dur)
    mind = (cue.get('music') or {}).get('kit') == 'mind'
    space = cue.get('space') or {}  # optional: {reverb: seconds, wet, sfxWet, bed}
    if space.get('polish', True): voice = polish_voice(voice)
    n = int(dur * SR)
    L = np.zeros(n); R = np.zeros(n)
    if cue.get('music'):
        ml, mr = (score_mind if mind else score)(cue['music'], dur)
        # the score lives in a room: an intimate one for the mind kit, a hall for Ottoman
        ml, mr = reverb(ml, mr, space.get('reverb', 1.5 if mind else 2.3), space.get('wet', 0.28 if mind else 0.33), 0.55 if mind else 0.4, 21)
        # duck the score under the voice
        win = int(0.02 * SR)
        rms = np.sqrt(np.convolve(voice ** 2, np.ones(win) / win, mode='same'))
        env = np.zeros_like(rms); acc = 0.0
        for i in range(0, len(rms), 64):  # attack 10 ms, release 300 ms (per 64-sample block)
            x = rms[i:i + 64].max()
            acc = acc + (x - acc) * (0.6 if x > acc else 0.0045)
            env[i:i + 64] = acc
        duck = 1 - 0.6 * np.clip(env / 0.05, 0, 1)
        g = cue['music'].get('gain', 0.3)
        L = ml * duck * g; R = mr * duck * g
    # sound effects get their own lighter room, so they sit in the same space
    SL = np.zeros(n); SR_ = np.zeros(n)
    for s in cue.get('sfx', []):
        sig = sfx_signal(s['type'], s.get('pitch', 1.0)) * s.get('gain', 0.5) * 0.6
        i = int(s['t'] * SR)
        if i >= n or i < 0: continue
        k = min(len(sig), n - i)
        pan = RNG.uniform(-0.25, 0.25)
        SL[i:i + k] += sig[:k] * (1 - max(0, pan)); SR_[i:i + k] += sig[:k] * (1 + min(0, pan))
    if cue.get('sfx'): SL, SR_ = reverb(SL, SR_, 1.2 if mind else 1.6, space.get('sfxWet', 0.16), 0.6, 31)
    L = L + SL + voice; R = R + SR_ + voice
    if space.get('bed', True):
        bl, br = room_bed(n, 'mind' if mind else 'ottoman'), room_bed(n, 'mind' if mind else 'ottoman')[::-1]
        L = L + bl; R = R + br
    a, b = int(cue.get('start', 0) * SR), int(cue.get('end', dur) * SR)
    st = np.stack([L[a:b], R[a:b]], axis=1)
    st = st / max(1.0, np.abs(st).max() / 0.95)
    raw = (st * 32767).astype('<i2').tobytes()
    tmp = cue['out'] + '.raw.wav'
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 's16le', '-ar', str(SR), '-ac', '2', '-i', '-', tmp], input=raw, check=True)
    # social-video loudness: -14 LUFS, -1.5 dBTP
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', tmp, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', str(SR), cue['out']], check=True)
    print('soundtrack →', cue['out'])


if __name__ == '__main__':
    main(sys.argv[1])
