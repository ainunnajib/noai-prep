import { useMemo, useState } from 'react'
import {
  Figure,
  Controls,
  Readout,
  Slider,
  Plot,
  Path,
  Dots,
  Label,
  Axes,
  Bars,
  usePlayer,
  PlayerControls,
  useNarrow,
  type DotDatum,
} from '../../../../../kit'
import { PICTURES, Picture } from './pictures'
import { K, STEPS, trajectory, partnerProbs } from './simclr'
import css from './ssl.module.css'

/*
  Contrastive learning, really trained (see simclr.ts). Six images, two augmented views each,
  embedded on the unit circle by a tiny encoder. Play training: each pair is pulled together,
  different images are pushed apart, and the encoder learns to ignore the augmentations.
  The temperature τ sharpens or softens the "which view is my partner?" softmax.
*/

const CIRCLE: [number, number][] = Array.from({ length: 121 }, (_, i) => [Math.cos((i / 120) * 2 * Math.PI), Math.sin((i / 120) * 2 * Math.PI)])
const brightnessOf = (b: number) => 1 + 0.2 * b
const zoomOf = (z: number) => 1 + 0.18 * (z + 2)

export default function ContrastivePairs() {
  const [tau, setTau] = useState(0.5)
  const [sel, setSel] = useState(0)
  const frames = useMemo(() => trajectory(tau), [tau])
  const player = usePlayer({ steps: STEPS + 1, interval: 110 })
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(620)

  const f = frames[Math.min(player.step, STEPS)]
  const Z = f.Z
  const v1 = 2 * sel
  const v2 = v1 + 1
  const probs = partnerProbs(Z, v1, tau)
  const cos12 = Z[v1][0] * Z[v2][0] + Z[v1][1] * Z[v2][1]
  const lossMax = frames[0].loss

  // view-2 squares (hollow) first, then view-1 circles on top, so a matched pair shows a dot inside a square
  const dots: DotDatum[] = [1, 0].flatMap((which) =>
    Z.map(([x, y], v) => ({ x, y, v }))
      .filter((d) => (d.v & 1) === which)
      .map(({ x, y, v }) => {
        const isSel = v >> 1 === sel
        return which
          ? { x, y, color: PICTURES[v >> 1].color, r: isSel ? 10 : 8, shape: 'square' as const, hollow: true }
          : { x, y, color: PICTURES[v >> 1].color, r: isSel ? 6 : 4.5, shape: 'circle' as const }
      }),
  )

  const pickNearest = ([x, y]: [number, number]) => {
    let best = 0
    let bd = Infinity
    Z.forEach(([zx, zy], v) => {
      const d = (zx - x) ** 2 + (zy - y) ** 2
      if (d < bd) [best, bd] = [v, d]
    })
    if (bd < 0.09) setSel(best >> 1)
  }

  const plot = (
    <div className={css.panel}>
      <div className={css.panelTitle}>The embedding circle (each view's z)</div>
      <Plot x={[-1.35, 1.35]} y={[-1.35, 1.35]} width={340} height={340} margin={{ top: 10, right: 10, bottom: 10, left: 10 }} ariaLabel={`Twelve views of six images on the unit circle at training step ${player.step}. Loss ${f.loss.toFixed(2)}.`} onPointerDown={pickNearest}>
        <Path points={CIRCLE} color="var(--viz-grid)" width={2} />
        <Path points={[[-1.3, 0], [1.3, 0]]} color="var(--viz-grid)" width={1} />
        <Path points={[[0, -1.3], [0, 1.3]]} color="var(--viz-grid)" width={1} />
        {Array.from({ length: K }, (_, i) => (
          <Path key={i} points={[Z[2 * i], Z[2 * i + 1]]} color={PICTURES[i].color} width={i === sel ? 3 : 1.6} dash={i === sel ? undefined : '4 3'} opacity={i === sel ? 1 : 0.7} />
        ))}
        <Dots points={dots} />
        <Label x={Z[v1][0] * 1.17} y={Z[v1][1] * 1.17} anchor="middle" dy={4} color={PICTURES[sel].color} weight={800}>
          {PICTURES[sel].name}
        </Label>
      </Plot>
      <div className={css.legendRow}>
        <span>
          <svg width="12" height="12" aria-hidden="true">
            <circle cx="6" cy="6" r="4.5" style={{ fill: 'var(--ink-2)' }} />
          </svg>{' '}
          view 1
        </span>
        <span>
          <svg width="12" height="12" aria-hidden="true">
            <rect x="1.5" y="1.5" width="9" height="9" style={{ fill: 'none', stroke: 'var(--ink-2)', strokeWidth: 2 }} />
          </svg>{' '}
          view 2
        </span>
        <span>a line joins each positive pair</span>
      </div>
      <div className={css.panelTitle}>Loss over the {STEPS} training steps</div>
      <Plot x={[0, STEPS]} y={[0, lossMax * 1.05]} width={340} height={110} margin={{ top: 8, right: 14, bottom: 24, left: 40 }} ariaLabel="Training loss: the whole run faintly, the part played so far in bold">
        <Axes yTicks={2} xTicks={4} />
        <Path points={frames.map((fr, t) => [t, fr.loss] as [number, number])} color="var(--viz-muted)" width={1.5} dash="3 3" />
        <Path points={frames.slice(0, player.step + 1).map((fr, t) => [t, fr.loss] as [number, number])} color="var(--viz-1)" width={2.5} />
        <Dots points={[{ x: player.step, y: f.loss, r: 4 }]} />
      </Plot>
    </div>
  )

  const side = (
    <div className={css.side}>
      <div className={css.panelTitle}>Follow one image</div>
      <div className={css.pickRow} role="group" aria-label="Choose an image">
        {PICTURES.map((p, i) => (
          <button key={p.name} type="button" className={`${css.pick} ${i === sel ? css.pickSel : ''}`} onClick={() => setSel(i)} aria-pressed={i === sel} style={{ borderColor: i === sel ? p.color : undefined }}>
            <Picture index={i} size={34} label={p.name} />
            <span>{p.name}</span>
          </button>
        ))}
      </div>
      <div className={css.panelTitle}>Two augmented views of the {PICTURES[sel].name}</div>
      <div className={css.views}>
        {[v1, v2].map((v, k) => (
          <figure key={v} className={css.viewFig}>
            <Picture
              index={sel}
              size={88}
              zoom={zoomOf(f.aug[v][1])}
              brightness={brightnessOf(f.aug[v][0])}
              label={`View ${k + 1} of the ${PICTURES[sel].name}: brightness ×${brightnessOf(f.aug[v][0]).toFixed(2)}, zoom ×${zoomOf(f.aug[v][1]).toFixed(2)}`}
            />
            <figcaption>
              view {k + 1}: brightness ×{brightnessOf(f.aug[v][0]).toFixed(2)}, zoom ×{zoomOf(f.aug[v][1]).toFixed(2)}
            </figcaption>
          </figure>
        ))}
      </div>
      <div className={css.small}>
        Cosine similarity of the two views: <b className="tabular">{cos12.toFixed(2)}</b> (1 = same direction).
      </div>
      <div className={css.panelTitle}>View 1 asks: which of the other 11 is my partner?</div>
      <Bars
        ariaLabel="Softmax probabilities that view 1 assigns to each other view"
        max={1}
        format={(x) => `${(x * 100).toFixed(0)}%`}
        data={Z.map((_, k) => k)
          .filter((k) => k !== v1)
          .map((k) => ({
            label: `${PICTURES[k >> 1].name} ${(k & 1) + 1}${k === v2 ? ' ✓' : ''}`,
            value: probs[k],
            color: PICTURES[k >> 1].color,
            strong: k === v2,
          }))}
      />
    </div>
  )

  return (
    <Figure
      wide
      title="Pull the pairs together, push the rest apart"
      caption={
        <>
          A tiny encoder (4 inputs → 2 numbers, then scaled to length 1) trained with SimCLR's real loss on 6 images. Each view's input is 2 numbers
          about the object plus 2 random augmentation numbers (brightness and zoom), redrawn at every step. Press <b>Play</b>: at first the two views
          of an image land far apart and jump about; soon each pair locks together and the six images spread round the circle, because the encoder
          has learned to ignore brightness and zoom (watch <i>weight on augmentations</i> fall). Click a point or a picture to follow another image.
          Slide τ: a low temperature makes the partner probabilities sharper and the pulls and pushes stronger.
        </>
      }
    >
      <PlayerControls player={player} label={(s) => `Step ${s} of ${STEPS}`} />
      <Controls>
        <Slider label="temperature τ" value={tau} min={0.05} max={1} step={0.05} onChange={setTau} format={(v) => v.toFixed(2)} />
        <Readout
          items={[
            ['loss', f.loss.toFixed(2)],
            ['partner probability', `${(probs[v2] * 100).toFixed(0)}%`],
            ['weight on augmentations', `${(f.augShare * 100).toFixed(0)}%`],
          ]}
        />
      </Controls>
      <div ref={wrapRef} className={`${css.row} ${narrow ? '' : css.rowWide}`}>
        {plot}
        {side}
      </div>
    </Figure>
  )
}
