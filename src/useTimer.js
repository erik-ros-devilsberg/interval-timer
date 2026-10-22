import { computed, onBeforeUnmount, ref } from 'vue'
import { countBeep, doneChime, goBeep, unlockAudio } from './audio'

const LEAD_MS = 3000

/**
 * Elapsed time `t` starts at -LEAD_MS so the lead-in before the first interval
 * uses the same 3-2-1 logic as every interval boundary after it.
 */
export function useTimer(intervalMs, intervalCount) {
  const status = ref('idle') // idle | running | paused | done
  const t = ref(-LEAD_MS)

  let base = -LEAD_MS
  let resumedAt = 0
  let timerId = null
  let rafId = null
  let lastBoundary = -1
  let lastCountKey = ''
  let wakeLock = null

  const totalMs = computed(() => intervalMs.value * intervalCount.value)
  const inLead = computed(() => t.value < 0)
  const intervalIndex = computed(() =>
    inLead.value ? 0 : Math.min(intervalCount.value - 1, Math.floor(t.value / intervalMs.value)),
  )
  const intervalRemainingMs = computed(() => {
    if (status.value === 'done') return 0
    if (inLead.value) return intervalMs.value
    return intervalMs.value - (t.value - intervalIndex.value * intervalMs.value)
  })
  const intervalFraction = computed(() => intervalRemainingMs.value / intervalMs.value)

  // 3, 2 or 1 in the last three seconds before any boundary (start, interval change, end); else 0.
  const countdown = computed(() => {
    if (status.value !== 'running' && status.value !== 'paused') return 0
    const toNext = inLead.value ? -t.value : intervalRemainingMs.value
    const sec = Math.ceil(toNext / 1000)
    return sec >= 1 && sec <= 3 ? sec : 0
  })

  function tick() {
    if (status.value !== 'running') return
    const now = base + (performance.now() - resumedAt)
    t.value = now

    if (now >= totalMs.value) {
      t.value = totalMs.value
      finish()
      return
    }

    const boundary = now < 0 ? -1 : Math.floor(now / intervalMs.value)
    if (boundary > lastBoundary) {
      lastBoundary = boundary
      goBeep()
    }

    const toNext = now < 0 ? -now : intervalMs.value - (now % intervalMs.value)
    const sec = Math.ceil(toNext / 1000)
    const key = `${boundary}:${sec}`
    if (sec >= 1 && sec <= 3 && key !== lastCountKey) {
      lastCountKey = key
      countBeep()
    }
  }

  function loop() {
    tick()
    rafId = requestAnimationFrame(loop)
  }

  function startClock() {
    resumedAt = performance.now()
    status.value = 'running'
    // rAF gives smooth visuals; the interval keeps beeps going while the tab is hidden.
    timerId = setInterval(tick, 100)
    rafId = requestAnimationFrame(loop)
    requestWakeLock()
  }

  function stopClock() {
    clearInterval(timerId)
    cancelAnimationFrame(rafId)
    timerId = rafId = null
    releaseWakeLock()
  }

  function start() {
    unlockAudio()
    if (status.value === 'running') return
    if (status.value === 'done') reset()
    startClock()
    tick()
  }

  function pause() {
    if (status.value !== 'running') return
    base = base + (performance.now() - resumedAt)
    stopClock()
    status.value = 'paused'
  }

  function toggle() {
    status.value === 'running' ? pause() : start()
  }

  function finish() {
    stopClock()
    status.value = 'done'
    doneChime()
  }

  function reset() {
    stopClock()
    base = -LEAD_MS
    t.value = -LEAD_MS
    lastBoundary = -1
    lastCountKey = ''
    status.value = 'idle'
  }

  async function requestWakeLock() {
    try {
      wakeLock = await navigator.wakeLock?.request('screen')
    } catch {
      wakeLock = null
    }
  }

  function releaseWakeLock() {
    wakeLock?.release().catch(() => {})
    wakeLock = null
  }

  function onVisibility() {
    // Wake locks drop when the page is hidden; take it back on return.
    if (document.visibilityState === 'visible' && status.value === 'running') requestWakeLock()
  }
  document.addEventListener('visibilitychange', onVisibility)

  onBeforeUnmount(() => {
    stopClock()
    document.removeEventListener('visibilitychange', onVisibility)
  })

  return {
    status,
    inLead,
    countdown,
    intervalIndex,
    intervalRemainingMs,
    intervalFraction,
    start,
    pause,
    toggle,
    reset,
  }
}
