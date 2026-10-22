import { reactive, watch } from 'vue'

const KEY = 'interval-timer.settings'

export const DEFAULTS = Object.freeze({
  background: '#1E3B32',
  clock: '#D3DBC8',
  clockType: 'analog', // 'digital' | 'analog'
  intervalSeconds: 60,
  intervals: 5,
})

export const LIMITS = Object.freeze({
  intervalSeconds: { min: 10, max: 3600, step: 5 },
  intervals: { min: 1, max: 99, step: 1 },
})

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}')
    return { ...DEFAULTS, ...saved }
  } catch {
    return { ...DEFAULTS }
  }
}

export const settings = reactive(load())

watch(settings, (value) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(value))
  } catch {
    // Storage unavailable (private mode); settings stay for this session only.
  }
})

export function resetSettings() {
  Object.assign(settings, DEFAULTS)
}
