/** localStorage wrappers that never throw (private windows, blocked storage, previews). */
export const PREFIX = 'noai-prep:'

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(PREFIX + key)
    return raw == null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

/** The stored text itself (null when absent or storage is blocked), for telling whether another tab has written a key. */
export function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(PREFIX + key)
  } catch {
    return null
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
