<script setup>
import { nextTick, onMounted, ref } from 'vue'
import { LIMITS, resetSettings, settings } from '../settings'
import { formatSeconds } from '../format'

defineProps({
  timerActive: { type: Boolean, default: false },
})
const emit = defineEmits(['close'])

const BACKGROUNDS = [
  { name: 'Lichen', hex: '#D3DBC8' },
  { name: 'Lilac', hex: '#E4DAEE' },
  { name: 'Paper', hex: '#F7F7F4' },
  { name: 'Marigold', hex: '#F2C77B' },
  { name: 'Navy', hex: '#1F2A44' },
  { name: 'Pine', hex: '#1E3B32' },
]
const CLOCKS = [
  { name: 'Pine', hex: '#1E3B32' },
  { name: 'Navy', hex: '#1F2A44' },
  { name: 'Signal red', hex: '#C2412D' },
  { name: 'Marigold', hex: '#F2C77B' },
  { name: 'Paper', hex: '#F7F7F4' },
  { name: 'Lichen', hex: '#D3DBC8' },
]

const panel = ref(null)

// Finer steps for short intervals, coarser ones as they get long.
function stepFor(seconds, direction) {
  if (direction < 0 ? seconds <= 60 : seconds < 60) return 5
  if (direction < 0 ? seconds <= 300 : seconds < 300) return 15
  return 60
}

function changeInterval(direction) {
  const { min, max } = LIMITS.intervalSeconds
  const s = settings.intervalSeconds
  const step = stepFor(s, direction)
  // Snap to the step grid so values stay round after crossing a step boundary.
  const next = direction > 0 ? Math.floor(s / step) * step + step : Math.ceil(s / step) * step - step
  settings.intervalSeconds = Math.min(max, Math.max(min, next))
}

function changeCount(direction) {
  const { min, max } = LIMITS.intervals
  settings.intervals = Math.min(max, Math.max(min, settings.intervals + direction))
}

const same = (a, b) => a.toLowerCase() === b.toLowerCase()

onMounted(async () => {
  await nextTick()
  panel.value?.querySelector('button, input')?.focus()
})

function trapFocus(e) {
  if (e.key !== 'Tab') return
  const items = panel.value.querySelectorAll('button, input, a[href]')
  const first = items[0]
  const last = items[items.length - 1]
  if (e.shiftKey && document.activeElement === first) {
    last.focus()
    e.preventDefault()
  } else if (!e.shiftKey && document.activeElement === last) {
    first.focus()
    e.preventDefault()
  }
}
</script>

<template>
  <div class="scrim" @click.self="emit('close')">
    <section
      ref="panel"
      class="panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      @keydown="trapFocus"
    >
      <header class="head">
        <h2 id="settings-title">Settings</h2>
        <button class="icon-btn" type="button" aria-label="Close settings" @click="emit('close')">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </button>
      </header>

      <p v-if="timerActive" class="note">Changing the timing resets the current run.</p>

      <fieldset class="field">
        <legend>Background</legend>
        <div class="swatches">
          <button
            v-for="c in BACKGROUNDS"
            :key="c.hex"
            type="button"
            class="swatch"
            :style="{ background: c.hex }"
            :aria-label="c.name"
            :aria-pressed="same(settings.background, c.hex)"
            @click="settings.background = c.hex"
          />
          <label class="swatch custom" title="Pick any color">
            <input v-model="settings.background" type="color" aria-label="Custom background color" />
          </label>
        </div>
      </fieldset>

      <fieldset class="field">
        <legend>Clock color</legend>
        <div class="swatches">
          <button
            v-for="c in CLOCKS"
            :key="c.hex"
            type="button"
            class="swatch"
            :style="{ background: c.hex }"
            :aria-label="c.name"
            :aria-pressed="same(settings.clock, c.hex)"
            @click="settings.clock = c.hex"
          />
          <label class="swatch custom" title="Pick any color">
            <input v-model="settings.clock" type="color" aria-label="Custom clock color" />
          </label>
        </div>
      </fieldset>

      <fieldset class="field">
        <legend>Clock type</legend>
        <div class="segmented">
          <button
            type="button"
            :aria-pressed="settings.clockType === 'digital'"
            @click="settings.clockType = 'digital'"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <text x="12" y="16.5" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor">1:00</text>
            </svg>
            Digital
          </button>
          <button
            type="button"
            :aria-pressed="settings.clockType === 'analog'"
            @click="settings.clockType = 'analog'"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" stroke-width="1.5" />
              <path d="M12 12V4.5A7.5 7.5 0 0 0 4.5 12Z" fill="currentColor" />
            </svg>
            Analog
          </button>
        </div>
      </fieldset>

      <div class="field row">
        <span id="len-label" class="legend">Interval length</span>
        <div class="stepper" role="group" aria-labelledby="len-label">
          <button
            type="button"
            aria-label="Shorter interval"
            :disabled="settings.intervalSeconds <= LIMITS.intervalSeconds.min"
            @click="changeInterval(-1)"
          >−</button>
          <output aria-live="polite">{{ formatSeconds(settings.intervalSeconds) }}</output>
          <button
            type="button"
            aria-label="Longer interval"
            :disabled="settings.intervalSeconds >= LIMITS.intervalSeconds.max"
            @click="changeInterval(1)"
          >+</button>
        </div>
      </div>

      <div class="field row">
        <span id="count-label" class="legend">Intervals</span>
        <div class="stepper" role="group" aria-labelledby="count-label">
          <button
            type="button"
            aria-label="Fewer intervals"
            :disabled="settings.intervals <= LIMITS.intervals.min"
            @click="changeCount(-1)"
          >−</button>
          <output aria-live="polite">{{ settings.intervals }}</output>
          <button
            type="button"
            aria-label="More intervals"
            :disabled="settings.intervals >= LIMITS.intervals.max"
            @click="changeCount(1)"
          >+</button>
        </div>
      </div>

      <button type="button" class="text-btn" @click="resetSettings">Restore defaults</button>

      <footer class="support">
        <button type="button" class="pill" @click="emit('close')">Close</button>
        <a class="pill" href="https://ko-fi.com/devilsberg" target="_blank" rel="noopener">
          Thanks for appreciating
        </a>
      </footer>
    </section>
  </div>
</template>

<style scoped>
.scrim {
  position: fixed;
  inset: 0;
  z-index: 10;
  display: flex;
  justify-content: flex-end;
  background: rgb(15 18 20 / 0.4);
  animation: fade 180ms ease-out;
}

/* Fixed dark palette: stays readable whatever colors the user picks for the timer. */
.panel {
  --panel-bg: #23282c;
  --ink: #eef1ea;
  width: min(400px, 100%);
  height: 100%;
  overflow-y: auto;
  padding: max(20px, env(safe-area-inset-top)) 28px max(24px, env(safe-area-inset-bottom));
  background: color-mix(in srgb, var(--panel-bg) 90%, transparent);
  color: var(--ink);
  display: flex;
  flex-direction: column;
  gap: 26px;
  animation: slide 240ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-right: -10px;
}

h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.note {
  margin: -12px 0 0;
  font-size: 0.9rem;
  opacity: 0.75;
}

.field {
  border: 0;
  margin: 0;
  padding: 0;
  min-width: 0;
}

legend,
.legend {
  padding: 0;
  margin-bottom: 12px;
  font-size: 0.95rem;
  font-weight: 500;
  opacity: 0.8;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.row .legend {
  margin: 0;
}

.swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.swatch {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1.5px solid color-mix(in srgb, var(--ink) 35%, transparent);
  padding: 0;
  cursor: pointer;
}

.swatch[aria-pressed='true'] {
  outline: 2px solid var(--ink);
  outline-offset: 3px;
}

.custom {
  background: conic-gradient(#e2725b, #f2c77b, #9fc38a, #6aa6c9, #8e7cc3, #e2725b);
  display: block;
}

.custom input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.custom:has(input:focus-visible) {
  outline: 2px solid var(--ink);
  outline-offset: 3px;
}

.segmented {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border: 1.5px solid color-mix(in srgb, var(--ink) 45%, transparent);
  border-radius: 999px;
  padding: 3px;
}

.segmented button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 999px;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}

.segmented button[aria-pressed='true'] {
  background: var(--ink);
  color: var(--panel-bg);
}

.stepper {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stepper button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1.5px solid color-mix(in srgb, var(--ink) 45%, transparent);
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 1.3rem;
  line-height: 1;
  cursor: pointer;
}

.stepper button:disabled {
  opacity: 0.3;
  cursor: default;
}

.stepper output {
  min-width: 4.2ch;
  text-align: center;
  font-size: 1.35rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.text-btn {
  align-self: flex-end;
  margin-top: -8px;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  font-size: 0.9rem;
  text-decoration: underline;
  text-underline-offset: 3px;
  opacity: 0.75;
  cursor: pointer;
  padding: 6px 0;
}

.text-btn:hover { opacity: 1; }

.support {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pill {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 13px 20px;
  border: 1.5px solid color-mix(in srgb, var(--ink) 55%, transparent);
  border-radius: 999px;
  background: transparent;
  color: var(--ink);
  font: inherit;
  font-size: 1.05rem;
  cursor: pointer;
  font-weight: 600;
  text-decoration: none;
  transition: transform 150ms ease, background-color 150ms ease, border-color 150ms ease;
}

.pill:hover {
  border-color: var(--ink);
  background: color-mix(in srgb, var(--ink) 8%, transparent);
}

.pill:active { transform: scale(0.98); }

.icon-btn {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.panel :focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 3px;
}

@keyframes fade {
  from { opacity: 0; }
}

@keyframes slide {
  from { transform: translateX(24px); opacity: 0; }
}

@media (max-width: 480px) {
  .panel { padding-inline: 20px; }
}
</style>
