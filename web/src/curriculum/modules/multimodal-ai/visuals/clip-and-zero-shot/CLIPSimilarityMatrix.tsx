import { useEffect, useMemo, useState } from 'react'
import {
  Figure,
  Controls,
  Readout,
  Slider,
  Segmented,
  Button,
  usePlayer,
  PlayerControls,
  Plot,
  Axes,
  Grid,
  Path,
  Dots,
  useContainerWidth,
  M,
} from '../../../../../kit'
import { Thumb } from './Thumb'
import type { ImageId } from './toyClip'
import { trainToy, clipLoss } from './trainToy'
import s from './clip.module.css'

/*
  CLIP's training game on one batch of six image-caption pairs. A toy model is trained for real,
  in the browser, with CLIP's symmetric cross-entropy loss: the N × N cosine-similarity matrix,
  divided by the temperature τ, is pushed towards "bright diagonal, dim everything else".
*/

const PAIRS: { img: ImageId; caption: string; short: string }[] = [
  { img: 'cat', caption: 'a cat asleep on a sofa', short: 'cat asleep' },
  { img: 'dog', caption: 'a dog chasing a ball', short: 'dog + ball' },
  { img: 'train', caption: 'an MRT train pulling in', short: 'MRT train' },
  { img: 'laksa', caption: 'a bowl of spicy laksa', short: 'spicy laksa' },
  { img: 'sunset', caption: 'sunset over the sea', short: 'sea sunset' },
  { img: 'bicycle', caption: 'a red bicycle', short: 'red bike' },
]
const N = PAIRS.length
const STEPS = 50
const TAUS = [0.03, 0.05, 0.07, 0.1, 0.2, 0.3, 0.5, 1]

type Mode = 'cos' | 'prob'

export default function CLIPSimilarityMatrix() {
  const [tauIdx, setTauIdx] = useState(3)
  const [mode, setMode] = useState<Mode>('cos')
  const [perm, setPerm] = useState<number[]>(() => PAIRS.map((_, i) => i))
  const [sel, setSel] = useState<number | null>(null)
  const tau = TAUS[tauIdx]
  const run = useMemo(() => trainToy(tau, { steps: STEPS, seed: 1 }), [tau])
  const player = usePlayer({ steps: STEPS + 1, interval: 110 })
  const [wrapRef, width] = useContainerWidth<HTMLDivElement>(520)
  const step = Math.min(player.step, STEPS)
  // start fully trained, so the figure is complete at rest; Replay trains from scratch
  useEffect(() => player.setStep(STEPS), []) // eslint-disable-line react-hooks/exhaustive-deps

  // what is shown: column j holds caption perm[j]
  const shownAt = (k: number) => run[k].S.map((row) => perm.map((c) => row[c]))
  const S = shownAt(step)
  const { loss, lossI, lossT, Pr } = clipLoss(S, tau)
  const curve = useMemo(() => run.map((_, k) => clipLoss(shownAt(k), tau).loss), [run, perm, tau]) // eslint-disable-line react-hooks/exhaustive-deps
  const swapped = perm.some((c, j) => c !== j)
  const yMax = Math.max(2, Math.ceil(Math.max(...curve)))

  let diag = 0
  let off = 0
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++) {
      if (i === j) diag += S[i][j]
      else off += S[i][j]
    }
  diag /= N
  off /= N * N - N

  const cell = Math.max(40, Math.min(66, Math.floor((Math.min(width, 560) - 6 * 3) / (N + 1))))
  const shade = (v: number) => {
    const t = mode === 'cos' ? Math.max(0, Math.min(1, v / 0.85)) : Math.max(0, Math.min(1, v))
    return t
  }

  const clickCaption = (j: number) => {
    if (sel === null) setSel(j)
    else if (sel === j) setSel(null)
    else {
      const p = perm.slice()
      ;[p[sel], p[j]] = [p[j], p[sel]]
      setPerm(p)
      setSel(null)
    }
  }

  return (
    <Figure
      wide
      title="CLIP's training game on one batch of six pairs"
      caption={
        <>
          Rows are images, columns are captions; each cell is the cosine similarity of their embeddings, and the six true pairs sit on the outlined
          diagonal. <b>Try:</b>
          <ol className="try">
            <li>
              Press <b>Replay</b> to train from random weights: the diagonal brightens and the rest dims.
            </li>
            <li>
              Drag the temperature <M>{'\\tau'}</M>: a small <M>{'\\tau'}</M> is satisfied once the diagonal merely wins; a large one keeps pushing the numbers apart, but
              the loss never gets near 0.
            </li>
            <li>Tap two captions to swap them, as if the data had mismatched them: the bright cells leave the diagonal and the loss shoots up.</li>
          </ol>
          <b>Notice:</b> the loss rewards every row and every column for putting its biggest number on the diagonal.
          <span className="fine">This is a real (tiny) model trained in your browser: each encoder is one linear layer on made-up features.</span>
        </>
      }
    >
      <Controls>
        <Segmented<Mode>
          label="cells show"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'cos', label: 'cosine similarity' },
            { value: 'prob', label: 'row softmax' },
          ]}
        />
      </Controls>

      <div ref={wrapRef} className={s.full}>
        <div
          className={s.mgrid}
          style={{ gridTemplateColumns: `${cell}px repeat(${N}, ${cell}px)`, gridAutoRows: `${cell}px`, width: 'max-content' }}
          role="table"
          aria-label="Similarity matrix of six images (rows) and six captions (columns)"
        >
          <div className={s.corner} role="columnheader" style={{ height: 'auto' }}>
            <span>image ↓</span>
            <span>caption →</span>
          </div>
          {perm.map((c, j) => (
            <button
              key={`h${j}`}
              type="button"
              role="columnheader"
              className={`${s.capBtn} ${sel === j ? s.capSel : ''} ${c !== j ? s.capSwapped : ''}`}
              style={{ height: 'auto', alignSelf: 'stretch' }}
              title={`"${PAIRS[c].caption}" (tap two captions to swap them)`}
              aria-pressed={sel === j}
              aria-label={`Caption: ${PAIRS[c].caption}. Tap two captions to swap them.`}
              onClick={() => clickCaption(j)}
            >
              {PAIRS[c].short}
            </button>
          ))}
          {PAIRS.map((p, i) => (
            <div key={`r${i}`} style={{ display: 'contents' }} role="row">
              <div className={s.rowHead} role="rowheader">
                <Thumb id={p.img} size={cell - 4} title={p.caption} />
              </div>
              {perm.map((c, j) => {
                const v = mode === 'cos' ? S[i][j] : Pr[i][j]
                const t = shade(v)
                return (
                  <div
                    key={`c${i}-${j}`}
                    role="cell"
                    className={`${s.cell} ${i === j ? s.cellDiag : ''}`}
                    title={`${p.caption} × “${PAIRS[c].caption}”: cosine ${S[i][j].toFixed(2)}, probability ${Pr[i][j].toFixed(2)}`}
                    style={{
                      // capped at a 52% mix so the theme's ink stays readable (≥ 4.5:1) on every shade, light or dark
                      background: `color-mix(in srgb, var(--viz-1) ${Math.round(5 + t * 47)}%, var(--surface))`,
                      color: 'var(--ink)',
                      fontWeight: i === j ? 750 : 500,
                    }}
                  >
                    {v.toFixed(2).replace('-', '−')}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div className={s.legend} aria-hidden="true">
        <span>
          <span className={s.diagSwatch} />
          true pair (the "label")
        </span>
        <span>
          <span className={s.swatch} style={{ background: 'color-mix(in srgb, var(--viz-1) 52%, var(--surface))' }} />
          {mode === 'cos' ? 'high similarity' : 'high probability'}
        </span>
        <span>
          <span className={s.swatch} style={{ background: 'color-mix(in srgb, var(--viz-1) 8%, var(--surface))', border: '1px solid var(--rule)' }} />
          {mode === 'cos' ? 'low or negative' : 'near 0'}
        </span>
      </div>

      <p className={s.hint}>
        {swapped ? (
          <>
            <span className={s.warn}>Captions swapped.</span> The bright cells are off the diagonal now, so the loss is high.{' '}
            <Button
              onClick={() => {
                setPerm(PAIRS.map((_, i) => i))
                setSel(null)
              }}
            >
              Restore true pairs
            </Button>
          </>
        ) : sel !== null ? (
          <>Now tap another caption to swap it with “{PAIRS[perm[sel]].caption}”.</>
        ) : (
          <>Tap two captions to swap them.</>
        )}
      </p>

      <Plot x={[0, STEPS]} y={[0, yMax]} width={520} height={150} minHeight={130} maxWidth={600} margin={{ left: 40, bottom: 34, top: 12, right: 14 }} ariaLabel={`Loss curve over ${STEPS} training steps; current loss ${loss.toFixed(2)}`}>
        <Grid xTicks={5} yTicks={4} />
        <Axes xLabel="training step" yLabel="loss" xTicks={5} yTicks={4} />
        <Path points={curve.map((l, k) => [k, l] as [number, number])} color="var(--viz-muted)" width={1.6} dash="4 3" />
        <Path points={curve.slice(0, step + 1).map((l, k) => [k, l] as [number, number])} color="var(--viz-2)" width={2.6} />
        <Dots points={[{ x: step, y: curve[step], color: 'var(--viz-2)' }]} r={5} />
      </Plot>

      <PlayerControls player={player} label={(k) => `Step ${Math.min(k, STEPS)} of ${STEPS}`} />

      <Controls>
        <Slider label={<>temperature <M>{'\\tau'}</M></>} value={tauIdx} min={0} max={TAUS.length - 1} step={1} onChange={setTauIdx} format={(i) => TAUS[i].toString()} />
        <Readout
          items={[
            ['loss', loss.toFixed(2)],
            ['image→text', lossI.toFixed(2)],
            ['text→image', lossT.toFixed(2)],
            ['avg cos, diagonal', diag.toFixed(2).replace('-', '−')],
            ['avg cos, off-diagonal', off.toFixed(2).replace('-', '−')],
          ]}
        />
      </Controls>
    </Figure>
  )
}
