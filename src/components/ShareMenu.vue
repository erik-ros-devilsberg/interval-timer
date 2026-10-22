<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

// Always share the public address, never a dev or preview URL.
const LINK = 'https://interval-timer.devilsberg.com/'
const SUBJECT = 'A free interval timer with no trackers'
const BODY = `Found a free interval timer with no ads or trackers. Good for workouts, focus sprints or flipping steaks evenly:\n\n${LINK}`
const mailto = `mailto:?subject=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(BODY)}`

const open = ref(false)
const copied = ref(false)
const root = ref(null)
const toggleBtn = ref(null)
let copiedTimer

async function copyLink() {
  try {
    await navigator.clipboard.writeText(LINK)
  } catch {
    // Clipboard blocked: fall back to a prompt the user can copy from.
    window.prompt('Copy this link:', LINK)
    return
  }
  copied.value = true
  clearTimeout(copiedTimer)
  copiedTimer = setTimeout(() => (copied.value = false), 2000)
}

function close() {
  open.value = false
  toggleBtn.value?.focus()
}

function onOutside(e) {
  if (!root.value?.contains(e.target)) open.value = false
}

watch(open, async (isOpen) => {
  if (isOpen) {
    await nextTick()
    root.value?.querySelector('.menu button')?.focus()
    document.addEventListener('pointerdown', onOutside)
  } else {
    document.removeEventListener('pointerdown', onOutside)
  }
})

onBeforeUnmount(() => {
  clearTimeout(copiedTimer)
  document.removeEventListener('pointerdown', onOutside)
})
</script>

<template>
  <div ref="root" class="share" @keydown.esc.stop="close">
    <div v-if="open" class="menu" role="menu">
      <button type="button" role="menuitem" @click="copyLink">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"
          />
        </svg>
        <span aria-live="polite">{{ copied ? 'Link copied' : 'Copy link' }}</span>
      </button>
      <a role="menuitem" :href="mailto" @click="open = false">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <rect x="3" y="5.5" width="18" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="1.6" />
          <path d="M3.5 7l8.5 6 8.5-6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
        </svg>
        Email
      </a>
    </div>

    <button
      ref="toggleBtn"
      class="toggle"
      type="button"
      aria-label="Share"
      aria-haspopup="menu"
      :aria-expanded="open"
      @click="open = !open"
    >
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
        <g fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="18" cy="5.5" r="2.5" />
          <circle cx="6" cy="12" r="2.5" />
          <circle cx="18" cy="18.5" r="2.5" />
          <path d="M8.2 10.8l7.6-4.1M8.2 13.2l7.6 4.1" />
        </g>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.share {
  position: fixed;
  right: max(12px, env(safe-area-inset-right));
  bottom: max(12px, env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.toggle {
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
  transition: opacity 150ms ease;
}

.toggle:hover,
.toggle[aria-expanded='true'] { opacity: 1; }

/* Fixed dark palette, matching the side panels. */
.menu {
  display: flex;
  flex-direction: column;
  min-width: 170px;
  padding: 6px;
  border-radius: 14px;
  background: color-mix(in srgb, #23282c 94%, transparent);
  color: #eef1ea;
  box-shadow: 0 10px 30px rgb(0 0 0 / 0.3);
  animation: pop 160ms ease-out;
}

.menu button,
.menu a {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 0.98rem;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
}

.menu button:hover,
.menu a:hover {
  background: rgb(238 241 234 / 0.08);
}

.menu :focus-visible {
  outline: 2px solid #eef1ea;
  outline-offset: -2px;
}

@keyframes pop {
  from { opacity: 0; transform: translateY(6px); }
}

@media (prefers-reduced-motion: reduce) {
  .menu { animation: none; }
}
</style>
