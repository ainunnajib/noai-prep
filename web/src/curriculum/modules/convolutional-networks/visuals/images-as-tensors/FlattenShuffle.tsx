import { useMemo, useState } from 'react'
import { Figure, Readout, Segmented, useContainerWidth, mulberry32, shuffled } from '../../../../../kit'
import { SEVEN } from './images'
import s from './it.module.css'

/*
  What a dense (fully connected) layer sees. The 10×10 picture is flattened into a list of
  100 numbers. Shuffling the pixels with one fixed permutation gives noise to our eyes but
  exactly the same information to an MLP. Shifting the 7 by one pixel keeps the picture the
  same to us but changes many entries of the list. Tap a pixel to follow it.
*/

type Mode = 'shuffle' | 'right' | 'down'
const N = 10
const PERM = shuffled(
  Array.from({ length: N * N }, (_, i) => i),
  mulberry32(7),
) // changed[i] = original[PERM[i]]
const INV = (() => {
  const inv = new Array<number>(N * N)
  PERM.forEach((src, i) => (inv[src] = i))
  return inv
})()

const flatOf = (img: number[][]) => img.flat()

function transform(mode: Mode): number[] {
  const v = flatOf(SEVEN)
  if (mode === 'shuffle') return PERM.map((src) => v[src])
  const out = new Array<number>(N * N).fill(0)
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++) {
      const rr = mode === 'down' ? r + 1 : r
      const cc = mode === 'right' ? c + 1 : c
      if (rr < N && cc < N) out[rr * N + cc] = v[r * N + c]
    }
  return out
}

/** where does original flat index j end up after the change? (-1 if it falls off the edge) */
function destination(mode: Mode, j: number): number {
  if (mode === 'shuffle') return INV[j]
  const r = Math.floor(j / N)
  const c = j % N
  const rr = mode === 'down' ? r + 1 : r
  const cc = mode === 'right' ? c + 1 : c
  return rr < N && cc < N ? rr * N + cc : -1
}

const grey = (v: number) => `rgb(${v}, ${v}, ${v})`

function PixelGrid({ vals, sel, onPick, label }: { vals: number[]; sel: number; onPick?: (j: number) => void; label: string }) {
  const c = 18
  const size = N * c
  return (
    <svg viewBox={`-2 -2 ${size + 4} ${size + 4}`} style={{ width: '100%', maxWidth: 200, height: 'auto', display: 'block' }} role="img" aria-label={label}>
      {vals.map((v, j) => (
        <rect
          key={j}
          x={(j % N) * c}
          y={Math.floor(j / N) * c}
          width={c}
          height={c}
          style={{ fill: grey(v), stroke: 'var(--surface-3)', strokeWidth: 0.6, cursor: onPick ? 'pointer' : undefined }}
          onClick={onPick ? () => onPick(j) : undefined}
        />
      ))}
      {sel >= 0 && (
        <rect
          x={(sel % N) * c}
          y={Math.floor(sel / N) * c}
          width={c}
          height={c}
          style={{ fill: 'none', stroke: 'var(--viz-2)', strokeWidth: 3.5, pointerEvents: 'none' }}
        />
      )}
    </svg>
  )
}

function Strip({ vals, sel, diff }: { vals: number[]; sel: number; diff?: boolean[] }) {
  const [ref, w] = useContainerWidth<HTMLDivElement>(420)
  const W = Math.max(200, w)
  const cw = W / vals.length
  const H = 26
  return (
    <div ref={ref} style={{ width: '100%' }}>
      <svg viewBox={`0 0 ${W} ${H + 18}`} className={s.strip} role="img" aria-label="The picture flattened into one list of 100 numbers">
        {vals.map((v, i) => (
          <rect key={i} x={i * cw} y={4} width={cw + 0.3} height={H - 4} style={{ fill: grey(v) }} />
        ))}
        {diff?.map((d, i) => (d ? <rect key={`d${i}`} x={i * cw} y={0} width={Math.max(1, cw - 0.5)} height={3} style={{ fill: 'var(--viz-4)' }} /> : null))}
        {sel >= 0 && <rect x={sel * cw - 1} y={2} width={cw + 2} height={H - 0} style={{ fill: 'none', stroke: 'var(--viz-2)', strokeWidth: 2.5 }} />}
        {[0, 20, 40, 60, 80, 99].map((t) => (
          <text key={t} x={t * cw + cw / 2} y={H + 15} textAnchor={t === 0 ? 'start' : t === 99 ? 'end' : 'middle'} style={{ fontSize: 11, fill: 'var(--ink-3)' }}>
            {t}
          </text>
        ))}
      </svg>
    </div>
  )
}

export default function FlattenShuffle() {
  const [mode, setMode] = useState<Mode>('shuffle')
  const [sel, setSel] = useState(3 * N + 7) // a bright pixel of the 7's stroke
  const orig = useMemo(() => flatOf(SEVEN), [])
  const changed = useMemo(() => transform(mode), [mode])
  const diff = changed.map((v, i) => v !== orig[i])
  const nDiff = diff.filter(Boolean).length
  const dest = destination(mode, sel)
  const changedLabel = mode === 'shuffle' ? 'Shuffled (fixed order)' : mode === 'right' ? 'Shifted 1 pixel right' : 'Shifted 1 pixel down'

  return (
    <Figure
      title="Flatten the picture: what a dense layer sees"
      caption={
        <>
          Tap any pixel of the original to follow it (orange outline) into the flattened list and into the changed picture. Pink marks above a list show the
          entries that differ from the original list. Compare the two changes: one destroys the picture for <i>us</i>, the other destroys it for the <i>dense
          layer</i>.
        </>
      }
    >
      <Segmented
        label="Change the picture"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'shuffle', label: 'Shuffle pixels' },
          { value: 'right', label: 'Shift right' },
          { value: 'down', label: 'Shift down' },
        ]}
      />
      <div className={s.row}>
        <div className={s.tile} style={{ maxWidth: 260, flexBasis: 220 }}>
          <span className={s.cap}>Original 10 × 10</span>
          <PixelGrid vals={orig} sel={sel} onPick={setSel} label="The original 10 by 10 picture of a handwritten 7; tap a pixel to follow it" />
          <span className={s.capSmall}>flattened: 100 numbers</span>
          <Strip vals={orig} sel={sel} />
        </div>
        <div className={s.tile} style={{ maxWidth: 260, flexBasis: 220 }}>
          <span className={s.cap}>{changedLabel}</span>
          <PixelGrid vals={changed} sel={dest} label={`The picture after the change: ${changedLabel}`} />
          <span className={s.capSmall}>flattened: 100 numbers</span>
          <Strip vals={changed} sel={dest} diff={diff} />
        </div>
      </div>
      <div className={s.note} aria-live="polite">
        {mode === 'shuffle' ? (
          <>
            To you this is noise. To a dense layer it is <b>exactly as good</b> as the original: all 100 numbers are still there, just fed in a fixed new order, and
            a dense layer never knew which inputs were neighbours anyway. Train an MLP on shuffled images and it reaches the same accuracy.
          </>
        ) : (
          <>
            To you this is the same 7. To a dense layer, <b>{nDiff} of the 100 inputs changed</b>, so it is a different input, and the weights that learned to
            spot the 7 in the old position do not fire. It would have to learn the 7 again at every position.
          </>
        )}
      </div>
      <Readout
        items={[
          ['pixel you are following', `row ${Math.floor(sel / N)}, column ${sel % N} → list position ${sel}`],
          ['after the change', dest >= 0 ? `list position ${dest}` : 'fell off the edge'],
          ['entries that differ', `${nDiff} of 100`],
        ]}
      />
    </Figure>
  )
}
