import { useEffect } from 'react'
import { ACCOUNTS_ENABLED } from './accounts/config'

// with accounts on, only the first two modules are free
const BASE = ACCOUNTS_ENABLED ? 'NOAI Prep: NOAI 2027 course' : 'NOAI Prep: free NOAI 2027 course'

/** Sets the browser tab title to "<title> · NOAI Prep" while the page is shown (the home page passes nothing). */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · NOAI Prep` : BASE
    return () => {
      document.title = BASE
    }
  }, [title])
}
