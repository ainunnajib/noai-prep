/** localStorage wrappers that never throw (private windows, blocked storage, previews). */
const PREFIX = 'noai-prep:'

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(PREFIX + key)
    return raw == null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

export function writeJSON(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    /* storage unavailable: progress simply isn't remembered */
  }
}

export function removeKey(key: string): void {
  try {
    window.localStorage.removeItem(PREFIX + key)
  } catch {
    /* ignore */
  }
}
