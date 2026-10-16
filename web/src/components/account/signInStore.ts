import { useSyncExternalStore } from 'react'

/*
  Whether the sign-in dialog is open. Anything can open it (the header's Sign in button, a locked module's note)
  with openSignIn(); the one dialog lives in the layout, so nothing has to be passed down to reach it.
*/

let open = false
const listeners = new Set<() => void>()

function set(next: boolean) {
  if (open === next) return
  open = next
  listeners.forEach((l) => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

export const openSignIn = () => set(true)
export const closeSignIn = () => set(false)

export function useSignInOpen(): boolean {
  return useSyncExternalStore(subscribe, () => open, () => open)
}
