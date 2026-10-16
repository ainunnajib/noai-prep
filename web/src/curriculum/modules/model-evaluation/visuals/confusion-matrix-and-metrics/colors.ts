/*
  Text colours for the model-evaluation visuals.
  The orange and green data colours (--viz-2, --viz-3, --viz-pos) reach only about 3:1 against white,
  which is fine for dots and lines but too faint for small text. txt() mixes a data colour with the
  ink: darker in light mode (about 5:1) and lighter in dark mode, so a label keeps its hue and reads well.
*/
export const txt = (c: string) => `color-mix(in srgb, ${c} 70%, var(--ink))`
