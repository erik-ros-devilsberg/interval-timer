// Soft sine tones built with Web Audio, so the app needs no sound files and works offline.
let ctx = null

// Must be called from a user gesture (tap/click) so browsers allow playback.
export function unlockAudio() {
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    ctx = new AudioCtx()
  }
  if (ctx.state === 'suspended') ctx.resume()
}

function tone(freq, duration, peak = 0.18) {
  if (!ctx) return
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = freq
  // Slow attack and long exponential release keep the tone round, never clicky.
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(peak, now + 0.03)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
  osc.connect(gain).connect(ctx.destination)
  osc.start(now)
  osc.stop(now + duration + 0.05)
}

// 3, 2, 1: a low, short tone.
export const countBeep = () => tone(523.25, 0.35) // C5

// Interval boundary: a brighter tone with a soft fifth on top.
export function goBeep() {
  tone(783.99, 0.9, 0.2) // G5
  tone(1174.66, 0.9, 0.06) // D6
}

// Session finished: a slow falling three-note chime.
export function doneChime() {
  if (!ctx) return
  ;[783.99, 659.25, 523.25].forEach((f, i) => setTimeout(() => tone(f, 1.4, 0.18), i * 380))
}
