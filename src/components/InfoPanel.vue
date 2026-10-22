<script setup>
import { nextTick, ref, watch } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
})
const emit = defineEmits(['close'])

const panel = ref(null)

watch(
  () => props.open,
  async (open) => {
    if (!open) return
    await nextTick()
    panel.value?.querySelector('button')?.focus()
  },
)

function trapFocus(e) {
  if (e.key !== 'Tab') return
  const items = panel.value.querySelectorAll('button, a[href]')
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
  <!-- v-show, not v-if: the text stays in the page so search engines can read it. -->
  <div v-show="open" class="scrim" @click.self="emit('close')">
    <section
      ref="panel"
      class="panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="info-title"
      @keydown="trapFocus"
    >
      <header class="head">
        <h1 id="info-title">Interval Timer</h1>
        <button class="icon-btn" type="button" aria-label="Close info" @click="emit('close')">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </button>
      </header>

      <p class="lead">ad-free, account-free, tracker-free, subscription-free interval timer. </p>

      <h2>How it works</h2>
      <p>
        Set the interval length and how many you want, then tap the clock. All interfals are introduced with a count down.
      </p>

      <h2>Good for</h2>
      <ul>
        <li>HIIT, Tabata and circuit training</li>
        <li>Pomodoro focus sprints</li>
        <li>Planks and stretching</li>
        <li>Flipping steaks evenly</li>
        <li>Pizza rotation (so the sides don't burn)</li>
        <li>Precise kid swing mittigation</li>
        <li>Board game turns for that one friend who thinks forever</li>
        <li>Timeboxing</li>
      </ul>

      <h2>Keyboard</h2>
      <dl class="keys">
        <dt><kbd>Space</kbd></dt><dd>Start / pause</dd>
        <dt><kbd>R</kbd></dt><dd>Reset</dd>
        <dt><kbd>Esc</kbd></dt><dd>Close panels</dd>
      </dl>

      <h2>Install it from the web</h2>
      <p>Add it to your home screen and it works offline, like a regular app. It is safely contained in a browser container.</p>

      <p class="small">
        Made by <a href="https://devilsberg.com" target="_blank" rel="noopener">Devilsberg</a>.
        Open source under the MIT license.
        <a href="https://github.com/erik-ros-devilsberg/interval-timer" target="_blank" rel="noopener">View on GitHub</a>
      </p>
    </section>
  </div>
</template>

<style scoped>
.scrim {
  position: fixed;
  inset: 0;
  z-index: 10;
  display: flex;
  justify-content: flex-start;
  background: rgb(15 18 20 / 0.4);
  animation: fade 180ms ease-out;
}

/* Same fixed dark palette as the settings panel. */
.panel {
  --panel-bg: #23282c;
  --ink: #eef1ea;
  width: min(400px, 100%);
  height: 100%;
  overflow-y: auto;
  padding: max(20px, env(safe-area-inset-top)) 28px max(24px, env(safe-area-inset-bottom));
  background: color-mix(in srgb, var(--panel-bg) 90%, transparent);
  color: var(--ink);
  user-select: text;
  animation: slide 240ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-right: -10px;
}

h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

h2 {
  margin: 26px 0 8px;
  font-size: 0.95rem;
  font-weight: 500;
  opacity: 0.8;
}

p,
ul,
dl {
  margin: 0;
  line-height: 1.5;
}

.lead {
  margin-top: 18px;
  font-size: 1.1rem;
  font-weight: 600;
}

ul {
  padding-left: 1.2em;
}

.keys {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 6px 16px;
}

.keys dd { margin: 0; }

kbd {
  font: inherit;
  font-size: 0.9rem;
  padding: 1px 8px;
  border: 1.5px solid color-mix(in srgb, var(--ink) 45%, transparent);
  border-radius: 6px;
}

.small {
  margin-top: 32px;
  font-size: 0.9rem;
  opacity: 0.75;
}

a {
  color: inherit;
  text-underline-offset: 3px;
}

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
  from { transform: translateX(-24px); opacity: 0; }
}

@media (max-width: 480px) {
  .panel { padding-inline: 20px; }
}
</style>
