// Seconds are rounded up so the display reads 0:01 until the moment time is up.
export function formatMs(ms) {
  return formatSeconds(Math.ceil(ms / 1000))
}

export function formatSeconds(total) {
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const ss = String(s).padStart(2, '0')
  return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`
}
