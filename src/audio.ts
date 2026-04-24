type WinCtx = AudioContext

let ctx: WinCtx | null = null
let muted = false

const getCtx = (): WinCtx | null => {
  if (!ctx) {
    try {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return null
      ctx = new Ctor()
    } catch {
      return null
    }
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

export const AudioFX = {
  setMuted(m: boolean) {
    muted = m
  },
  isMuted() {
    return muted
  },
  resume() {
    getCtx()
  },
  tick(volume = 0.12) {
    if (muted) return
    const c = getCtx()
    if (!c) return
    const o = c.createOscillator()
    const g = c.createGain()
    o.type = 'square'
    o.frequency.value = 1400
    g.gain.setValueAtTime(volume, c.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.04)
    o.connect(g).connect(c.destination)
    o.start()
    o.stop(c.currentTime + 0.05)
  },
  win() {
    if (muted) return
    const c = getCtx()
    if (!c) return
    const now = c.currentTime
    const notes: Array<{ f: number; t: number; d: number; type: OscillatorType; v: number }> = [
      { f: 220, t: 0, d: 0.5, type: 'sawtooth', v: 0.15 },
      { f: 330, t: 0.15, d: 0.5, type: 'sawtooth', v: 0.14 },
      { f: 523, t: 0.3, d: 0.9, type: 'triangle', v: 0.22 },
      { f: 1046, t: 0.35, d: 0.9, type: 'sine', v: 0.12 },
    ]
    for (const { f, t, d, type, v } of notes) {
      const o = c.createOscillator()
      const g = c.createGain()
      o.type = type
      o.frequency.value = f
      g.gain.setValueAtTime(0, now + t)
      g.gain.linearRampToValueAtTime(v, now + t + 0.04)
      g.gain.exponentialRampToValueAtTime(0.001, now + t + d)
      o.connect(g).connect(c.destination)
      o.start(now + t)
      o.stop(now + t + d + 0.1)
    }
  },
  spinStart() {
    if (muted) return
    const c = getCtx()
    if (!c) return
    const now = c.currentTime
    const o = c.createOscillator()
    const g = c.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(80, now)
    o.frequency.exponentialRampToValueAtTime(400, now + 0.3)
    g.gain.setValueAtTime(0.2, now)
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
    o.connect(g).connect(c.destination)
    o.start(now)
    o.stop(now + 0.4)
  },
}
