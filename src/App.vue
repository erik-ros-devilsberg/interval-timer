<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { settings } from './settings'
import { useTimer } from './useTimer'
import { formatMs } from './format'
import AnalogClock from './components/AnalogClock.vue'
import SettingsPanel from './components/SettingsPanel.vue'

const intervalMs = computed(() => settings.intervalSeconds * 1000)
const intervalCount = computed(() => settings.intervals)

const {
  status, inLead, countdown, intervalIndex, intervalRemainingMs, intervalFraction,
  toggle, reset,
} = useTimer(intervalMs, intervalCount)

const settingsOpen = ref(false)
const gear = ref(null)

const time = computed(() => formatMs(intervalRemainingMs.value))
// Countdown disc strength: builds from 0 at the interval start to 1 when the 3-2-1 begins.
const veil = computed(() => {
  if (status.value === 'idle' || status.value === 'done') return 0
  if (inLead.value || countdown.value) return 1
  const elapsed = intervalMs.value - intervalRemainingMs.value
  return Math.min(1, elapsed / (intervalMs.value - 3000))
})
// Flash toward white for a light clock on a dark background, toward black otherwise.
function luminance(hex) {
  const n = parseInt(hex.slice(1), 16)
  return 0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)
}
const flashTone = computed(() =>
  luminance(settings.clock) >= luminance(settings.background) ? '#ffffff' : '#000000',
)

const active = computed(() => status.value === 'running' || status.value === 'paused')

const hint = computed(() => ({
  idle: 'Tap to start',
  running: '',
  paused: 'Paused. Tap to resume',
  done: 'Done. Tap to go again',
})[status.value])

const dotsVisible = computed(() => settings.intervals <= 24)
function dotState(i) {
  if (status.value === 'done' || i < intervalIndex.value) return 'past'
  if (i === intervalIndex.value && status.value !== 'idle' && !inLead.value) return 'now'
  return 'next'
}

// New timing means a new session.
watch(() => [settings.intervalSeconds, settings.intervals], reset)

// Keep the browser chrome (and installed app title bar) in the chosen background.
watch(
  () => settings.background,
  (bg) => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg)
    document.documentElement.style.background = bg
  },
  { immediate: true },
)

function closeSettings() {
  settingsOpen.value = false
  gear.value?.focus()
}

function onKey(e) {
  if (e.key === 'Escape' && settingsOpen.value) return closeSettings()
  if (settingsOpen.value || e.target.closest?.('button, input')) return
  if (e.code === 'Space') {
    e.preventDefault()
    toggle()
  } else if (e.key === 'r' || e.key === 'R') {
    reset()
  }
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

const statusLabel = computed(() => {
  if (countdown.value && inLead.value) return `Starting in ${countdown.value}`
  if (status.value === 'done') return 'All intervals done'
  return `Interval ${intervalIndex.value + 1} of ${settings.intervals}, ${time.value} left`
})
</script>

<template>
  <main
    class="stage"
    :class="`is-${status}`"
    :style="{ '--bg': settings.background, '--clock': settings.clock, '--flash': flashTone }"
  >
    <button
      ref="gear"
      class="gear"
      type="button"
      aria-label="Settings"
      :aria-expanded="settingsOpen"
      @click="settingsOpen = true"
    >
      <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
        <path
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linejoin="round"
          d="M10.3 2.8h3.4l.5 2.6 1.6.9 2.5-.9 1.7 3-2 1.7v1.8l2 1.7-1.7 3-2.5-.9-1.6.9-.5 2.6h-3.4l-.5-2.6-1.6-.9-2.5.9-1.7-3 2-1.7v-1.8l-2-1.7 1.7-3 2.5.9 1.6-.9z"
        />
        <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.5" />
      </svg>
    </button>

    <button
      class="face"
      type="button"
      :aria-label="status === 'running' ? 'Pause timer' : 'Start timer'"
      @click="toggle"
    >
      <span v-if="settings.clockType === 'analog'" class="analog-wrap">
        <AnalogClock :fraction="status === 'done' ? 0 : intervalFraction" :count="countdown" :veil="veil" />
      </span>
      <!-- Digital: the numerals themselves blink softly on each 3-2-1 beat. -->
      <span v-else :key="`d-${countdown}`" class="digits big" :class="{ flash: countdown }">{{ time }}</span>
      <!-- Analog: the hint takes the place of the small time; digital: it sits under the numerals. -->
      <span v-if="settings.clockType === 'analog'" class="line">
        <span v-if="hint" class="hint">{{ hint }}</span>
        <span v-else class="digits small">{{ time }}</span>
      </span>
      <span v-else class="line">
        <span class="hint" :class="{ hidden: !hint }">{{ hint || '\u00a0' }}</span>
      </span>
    </button>

    <p class="sr-only" aria-live="polite">{{ status === 'running' ? '' : statusLabel }}</p>

    <div class="meta">
      <ol v-if="dotsVisible" class="dots" :aria-label="statusLabel">
        <li v-for="i in settings.intervals" :key="i" :class="dotState(i - 1)" />
      </ol>
      <p v-else class="count">{{ intervalIndex + 1 }} / {{ settings.intervals }}</p>


      <button
        class="reset"
        type="button"
        :class="{ hidden: !active }"
        :tabindex="active ? 0 : -1"
        @click="reset"
      >Reset</button>
    </div>

    <SettingsPanel v-if="settingsOpen" :timer-active="active" @close="closeSettings" />
  </main>
</template>

<style scoped>
.stage {
  min-height: 100dvh;
  display: grid;
  grid-template-rows: 1fr auto;
  justify-items: center;
  align-items: center;
  row-gap: 24px;
  padding: max(64px, env(safe-area-inset-top)) 16px max(28px, env(safe-area-inset-bottom));
  background: var(--bg);
  color: var(--clock);
  transition: background-color 300ms ease, color 300ms ease;
}

.gear {
  position: fixed;
  top: max(12px, env(safe-area-inset-top));
  right: max(12px, env(safe-area-inset-right));
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: inherit;
  opacity: 0.7;
  cursor: pointer;
  transition: opacity 150ms ease, transform 400ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.gear:hover { opacity: 1; }
.gear[aria-expanded='true'] { transform: rotate(60deg); }

.face {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2vmin;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
  padding: 0;
  border-radius: 24px;
  -webkit-tap-highlight-color: transparent;
}

.digits {
  font-weight: 640;
  font-variant-numeric: tabular-nums;
  line-height: 0.9;
  letter-spacing: -0.035em;
  font-variation-settings: 'wdth' 100, 'opsz' 96;
}

.big {
  font-size: clamp(5rem, 30vw, 38vh);
}

.flash {
  /* Must finish inside one second, before the next beat. */
  animation: flash 950ms both;
}

.small {
  font-size: clamp(1.6rem, 6vmin, 3rem);
  font-weight: 560;
  opacity: 0.85;
}

.analog-wrap {
  display: block;
}

.line {
  /* Fixed height so swapping hint and time never shifts the layout. */
  height: calc(clamp(1.6rem, 6vmin, 3rem) * 0.9);
  display: flex;
  align-items: center;
}

/* Dim the clock, never the hint telling you what to do. */
.is-paused .face > :not(.line) { opacity: 0.45; }
.is-done .face > :not(.line) { opacity: 0.6; }

.meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  min-height: 110px;
}

.dots {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  list-style: none;
  margin: 0;
  padding: 0;
  max-width: 340px;
}

.dots li {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1.5px solid currentColor;
  transition: background-color 300ms ease, transform 300ms ease;
}

.dots .past { background: currentColor; opacity: 0.45; }
.dots .now { background: currentColor; transform: scale(1.35); }
.dots .next { opacity: 0.6; }

.count {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 560;
  font-variant-numeric: tabular-nums;
}

.hint {
  font-size: 1.1rem;
  opacity: 0.75;
}

.reset {
  /* Keeps Reset where it sat when the hint line lived above it. */
  margin-top: 33px;
  border: 1.5px solid color-mix(in srgb, currentColor 45%, transparent);
  border-radius: 999px;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 0.95rem;
  padding: 8px 20px;
  cursor: pointer;
}

.hidden { visibility: hidden; }

:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 4px;
}

/* Warms up to a brighter tone on the beat, then cools back like a filament. */
@keyframes flash {
  0% {
    color: var(--clock);
    animation-timing-function: cubic-bezier(0.3, 0, 0.5, 1);
  }
  15% {
    color: color-mix(in srgb, var(--clock) 15%, var(--flash));
    animation-timing-function: cubic-bezier(0.15, 0.5, 0.3, 1);
  }
  100% { color: var(--clock); }
}

@media (prefers-reduced-motion: reduce) {
  .gear { transition: opacity 150ms ease; }
}
</style>
