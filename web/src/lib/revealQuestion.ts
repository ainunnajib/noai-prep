/**
 * After a new question replaces the old one (Next, Previous, the mock navigator): if its card now starts out of sight,
 * above the screen or under the sticky header (or `stickyBar`, e.g. the mock-exam timer bar), scroll it back to the top
 * of the visible area. Then move focus to the card so keyboard and screen-reader users land on the new question.
 */
export function revealQuestion(card: HTMLElement | null, stickyBar = '.site-header') {
  if (!card) return
  const bar = document.querySelector(stickyBar)
  const top = (bar ? bar.getBoundingClientRect().bottom : 0) + 12
  const y = card.getBoundingClientRect().top
  if (y < top || y > window.innerHeight - 120) window.scrollTo({ top: window.scrollY + y - top })
  card.focus({ preventScroll: true })
}
