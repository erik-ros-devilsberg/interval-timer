<script setup>
import { computed } from 'vue'

const props = defineProps({
  fraction: { type: Number, required: true }, // 1 = full interval left, 0 = none
  count: { type: Number, default: 0 }, // 3-2-1 countdown digit, 0 = hidden
  veil: { type: Number, default: 0 }, // 0..1 strength of the countdown disc
})

const C = 100
const FACE = 92
const DISC = 80

const ticks = Array.from({ length: 60 }, (_, i) => {
  const major = i % 5 === 0
  const a = (i / 60) * Math.PI * 2
  const r1 = FACE - (major ? 7 : 3.5)
  return {
    major,
    x1: C + r1 * Math.sin(a),
    y1: C - r1 * Math.cos(a),
    x2: C + FACE * Math.sin(a),
    y2: C - FACE * Math.cos(a),
  }
})

// A disc that shrinks back toward twelve o'clock, like a mechanical kitchen timer.
const wedge = computed(() => {
  const f = Math.min(1, Math.max(0, props.fraction))
  if (f >= 0.9999) return null
  const a = f * Math.PI * 2
  const x = C - DISC * Math.sin(a)
  const y = C - DISC * Math.cos(a)
  const large = f > 0.5 ? 1 : 0
  return `M ${C} ${C} L ${C} ${C - DISC} A ${DISC} ${DISC} 0 ${large} 0 ${x.toFixed(3)} ${y.toFixed(3)} Z`
})
</script>

<template>
  <svg class="analog" viewBox="0 0 200 200" aria-hidden="true">
    <line
      v-for="(tk, i) in ticks"
      :key="i"
      :x1="tk.x1" :y1="tk.y1" :x2="tk.x2" :y2="tk.y2"
      :stroke-width="tk.major ? 1.8 : 0.8"
      :opacity="tk.major ? 0.9 : 0.45"
      stroke="currentColor"
      stroke-linecap="round"
    />
    <circle v-if="fraction >= 0.9999" :cx="C" :cy="C" :r="DISC" fill="currentColor" />
    <path v-else-if="fraction > 0" :d="wedge" fill="currentColor" />

    <!-- See-through disc that builds up over the interval, ready to carry the 3-2-1. -->
    <circle v-if="veil > 0" class="veil" :cx="C" :cy="C" :r="DISC" :opacity="veil" />
    <text v-if="count" :key="count" class="count" :x="C" :y="C">{{ count }}</text>
    <circle v-else :cx="C" :cy="C" r="5" fill="currentColor" />
  </svg>
</template>

<style scoped>
.analog {
  width: min(64vmin, 560px);
  height: auto;
  display: block;
  overflow: visible;
}

.veil {
  fill: color-mix(in srgb, color-mix(in srgb, var(--clock), var(--bg)) 50%, transparent);
}

.count {
  fill: var(--bg);
  font-size: 110px;
  font-weight: 400;
  letter-spacing: -0.04em;
  text-anchor: middle;
  dominant-baseline: central;
  transform-box: fill-box;
  transform-origin: center;
  animation: count-in 700ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

@keyframes count-in {
  from { opacity: 0; transform: scale(0.92); }
}

@media (prefers-reduced-motion: reduce) {
  .count { animation: none; }
}
</style>
