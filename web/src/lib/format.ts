export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const mm = String(m).padStart(h ? 2 : 1, '0')
  const ss = String(sec).padStart(2, '0')
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

export function pct(n: number, d: number): string {
  if (!d) return '0%'
  return `${Math.round((n / d) * 100)}%`
}

export function plural(n: number, word: string, pluralWord = word + 's'): string {
  return `${n} ${n === 1 ? word : pluralWord}`
}
