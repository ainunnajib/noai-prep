import type { ReactNode } from 'react'

/*
  Short two-line figure caption shared by this module's visuals: one action to try, one thing to
  notice, and an optional small side note. Keeps captions readable on a phone.
*/
export function TryNotice({ tryIt, notice, note }: { tryIt: ReactNode; notice: ReactNode; note?: ReactNode }) {
  return (
    <>
      <span style={{ display: 'block' }}>
        <b>Try:</b> {tryIt}
      </span>
      <span style={{ display: 'block', marginTop: '0.3rem' }}>
        <b>Notice:</b> {notice}
      </span>
      {note && <span style={{ display: 'block', marginTop: '0.4rem', fontSize: '0.92em', color: 'var(--ink-2)', fontStyle: 'italic' }}>{note}</span>}
    </>
  )
}

/** Series colours darkened (light mode) or lightened (dark mode) towards the ink colour, so small coloured text keeps a 4.5:1 contrast. */
export const textTone = (v: string) => `color-mix(in srgb, ${v} 65%, var(--ink))`
