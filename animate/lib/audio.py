"""Soundtrack for a code-animated short — everything synthesised, no samples.

    python3 -I lib/audio.py build/cues.json

cues.json (written by lib/engine.mjs):
  voice     the voice-over file
  duration  video length in seconds; start/end: the part being rendered
  music     {bpm, root, maqam, gain, sections:[{from,to,mood}]} or null
  sfx       [{t, type, gain, pitch}]
  out       output .wav (voice + score + effects, ducked and loudness-normalised)

Score: Ottoman-flavoured — ney drone, plucked oud and kanun (Karplus-Strong
strings), def/darbuka (düm / tek / ka) in a maqsum rhythm; moods: intro,
groove, sad, drive, triumph, end. Needs numpy and ffmpeg.
"""
import json, subprocess, sys
import numpy as np

SR = 44100
RNG = np.random.default_rng(7)


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


# ---------- sound effects ----------
def sfx_signal(kind, pitch=1.0):
    t = lambda d: np.arange(int(d * SR)) / SR
    if kind == 'pop':
        tt = t(0.09); f = 900 * pitch * np.exp(-tt * 25) + 300
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 60) + bandnoise(len(tt), 2000, 9000) * np.exp(-tt * 120) * 0.6
    if kind == 'whoosh':
        tt = t(0.45); n = bandnoise(len(tt), 300, 4000)
        return n * np.sin(np.pi * tt / tt[-1]) ** 2 * 0.6
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
    if kind == 'spray':  # pressurised water jet
        tt = t(1.1); n = bandnoise(len(tt), 1200, 11000)
        return n * np.clip(tt / 0.03, 0, 1) * np.exp(-tt * 1.8) * (0.8 + 0.2 * np.sin(2 * np.pi * 23 * tt)) * 0.7
    if kind == 'splash':
        tt = t(0.8); body = bandnoise(len(tt), 300, 5000) * np.exp(-tt * 6)
        drops = sum(np.sin(2 * np.pi * f * tt) * np.exp(-((tt - d) * 30) ** 2) for f, d in ((1400, 0.12), (1900, 0.22), (1100, 0.35), (2300, 0.45)))
        return body * 0.7 + drops * 0.25
    if kind == 'drip':
        tt = t(0.25); f = 1200 * pitch + 900 * np.exp(-tt * 40)
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 22) * 0.6
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
    raise ValueError('unknown sfx ' + kind)


def main(path):
    cue = json.load(open(path))
    dur = float(cue['duration'])
    voice = load_voice(cue['voice'], dur)
    L = R = np.zeros(int(dur * SR))
    if cue.get('music'):
        ml, mr = score(cue['music'], dur)
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
    L = L + voice; R = R + voice
    for s in cue.get('sfx', []):
        sig = sfx_signal(s['type'], s.get('pitch', 1.0)) * s.get('gain', 0.5) * 0.6
        i = int(s['t'] * SR)
        if i >= len(L) or i < 0: continue
        n = min(len(sig), len(L) - i)
        pan = RNG.uniform(-0.25, 0.25)
        L[i:i + n] += sig[:n] * (1 - max(0, pan)); R[i:i + n] += sig[:n] * (1 + min(0, pan))
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
