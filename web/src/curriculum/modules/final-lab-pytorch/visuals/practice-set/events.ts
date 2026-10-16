/** Shared between PredictionMatrix (sender) and TestDrivenLoop (receiver). */
export const PRACTICE_EVENT = 'flp-practice-open'
export const PRACTICE_ANCHOR = 'flp-practice'

/** Ask the practice loop to open a task and scroll to it. */
export function openPractice(id: string) {
  window.dispatchEvent(new CustomEvent(PRACTICE_EVENT, { detail: id }))
  document.getElementById(PRACTICE_ANCHOR)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
