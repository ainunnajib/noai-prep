import { useEffect, useState } from 'react'
import { readJSON, writeJSON } from './storage'

export type ThemeChoice = 'system' | 'light' | 'dark'

export function applyTheme(choice: ThemeChoice) {
  const root = document.documentElement
  if (choice === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', choice)
}

export function useTheme(): [ThemeChoice, (t: ThemeChoice) => void] {
  const [choice, setChoice] = useState<ThemeChoice>(() => readJSON<ThemeChoice>('theme', 'system'))
  useEffect(() => {
    applyTheme(choice)
    writeJSON('theme', choice)
  }, [choice])
  return [choice, setChoice]
}
