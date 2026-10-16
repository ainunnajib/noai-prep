/*
  Text-safe versions of the series colours, shared by this module's visuals.
  The plain tokens (var(--viz-2), var(--viz-3)) are for marks and fills; as small text they fall
  below 4.5:1 in light mode. Mixing 35% of --ink in keeps the hue and reaches at least 5:1 on
  --surface and --surface-2 in both themes (darker in light mode, lighter in dark mode).
*/
export const TXT_ORANGE = 'color-mix(in srgb, var(--viz-2) 65%, var(--ink))'
export const TXT_GREEN = 'color-mix(in srgb, var(--viz-3) 65%, var(--ink))'
export const TXT_GOLD = 'color-mix(in srgb, var(--viz-6) 65%, var(--ink))'
