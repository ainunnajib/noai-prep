import { useId, useMemo, useState } from 'react'
import { Figure, Controls, Slider, Button, Readout, mulberry32, shuffled, useNarrow } from '../../../../../kit'
import { GardenScene, patchLabels } from '../vision-transformers/scene'
import css from './ssl.module.css'

/*
  Masked image modelling (MAE). The garden picture is cut into 14 × 14 = 196 patches, as for
  ViT-B/16 on a 224 × 224 image. A random subset is hidden; the encoder reads only the visible
  ones. The middle panel is an ILLUSTRATIVE reconstruction: each hidden patch is drawn from a
  blurred copy of the true picture, blurrier the further it is from any visible patch (roughly what
  real MAE outputs look like: right layout, soft details).
  The readouts are exact: how many patches are hidden, how many tokens the encoder reads, and what
  share of hidden patches has no visible neighbour (so cannot be solved by copying a neighbour).
*/

const N = 14
const S = 100 / N
// blur stdDeviation (user units) for 1, 2, 3, 4+ steps from a visible patch; 4+ steps away is only a smudge
const BLUR = [0, 1.1, 2.4, 3.8, 9]

export default function MaskedPatches() {
  const [ratio, setRatio] = useState(0.75)
  const [seed, setSeed] = useState(1)
  const uid = useId().replace(/:/g, '')
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(520)
  const labels = useMemo(() => patchLabels(N), [])
  const sceneId = `mae-scene-${uid}`

  const order = useMemo(() => shuffled(Array.from({ length: N * N }, (_, i) => i), mulberry32(seed * 104729)), [seed])
  const nHidden = Math.round(ratio * N * N)
  const hidden = useMemo(() => {
    const h = new Array<boolean>(N * N).fill(false)
    order.slice(0, nHidden).forEach((i) => (h[i] = true))
    return h
  }, [order, nHidden])
  const nVisible = N * N - nHidden

  // steps (up/down/left/right) from each hidden patch to the nearest visible patch: multi-source BFS
  const dist = useMemo(() => {
    const d = hidden.map((h) => (h ? Infinity : 0))
    let frontier = d.map((v, i) => (v === 0 ? i : -1)).filter((i) => i >= 0)
    while (frontier.length) {
      const nextF: number[] = []
      for (const i of frontier) {
        const r = Math.floor(i / N)
        const c = i % N
        for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const rr = r + dr
          const cc = c + dc
          if (rr < 0 || rr >= N || cc < 0 || cc >= N) continue
          const j = rr * N + cc
          if (d[j] > d[i] + 1) {
            d[j] = d[i] + 1
            nextF.push(j)
          }
        }
      }
      frontier = nextF
    }
    return d.map((v) => (Number.isFinite(v) ? v : 99))
  }, [hidden])
  const isolated = nHidden ? dist.filter((d) => d >= 2).length / nHidden : 0
  const catIdx = labels.map((l, i) => (l === 'cat' ? i : -1)).filter((i) => i >= 0)
  const catVisible = catIdx.filter((i) => !hidden[i]).length

  const level = (d: number) => Math.min(4, d)
  const rectsAt = (lv: number) =>
    hidden.map((h, i) => (h && level(dist[i]) === lv ? <rect key={i} x={(i % N) * S} y={Math.floor(i / N) * S} width={S} height={S} /> : null))

  const gridPath = Array.from({ length: N - 1 }, (_, k) => `M${(k + 1) * S},0V100M0,${(k + 1) * S}H100`).join('')
  const grid = <path d={gridPath} vectorEffect="non-scaling-stroke" style={{ fill: 'none', stroke: 'var(--surface)', strokeWidth: 0.6, opacity: 0.7 }} />

  return (
    <Figure
      wide
      title="Hide most of the patches, then rebuild them"
      caption={
        <>
          The hatched grey squares on the left are the hidden patches. Slide the mask ratio and press <b>New mask</b>. At 10–30% almost every hidden patch has a visible patch right beside it, so copying
          nearby pixels fills the gap: no understanding needed. At 75% about a third of the hidden patches (typically 30–40%) have no visible patch
          beside them, and only about a quarter of the cat is left: to redraw the rest, the model has to know what cats look like. The middle panel is
          illustrative, not a guaranteed output: hidden patches are drawn from a blurred copy of the truth, blurrier the further they are from a
          visible patch (roughly what a well-trained MAE produces: right layout, soft details), and only a smudge far from any visible patch.
        </>
      }
    >
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <g id={sceneId}>
            <GardenScene />
          </g>
          {BLUR.map((b, lv) =>
            lv === 0 ? null : (
              <filter key={lv} id={`${sceneId}-b${lv}`} x="0" y="0" width="100" height="100" filterUnits="userSpaceOnUse">
                <feGaussianBlur stdDeviation={b} edgeMode="duplicate" />
                {lv >= 3 && <feColorMatrix type="saturate" values={lv === 3 ? '0.75' : '0.35'} />}
              </filter>
            ),
          )}
          {BLUR.map((_, lv) =>
            lv === 0 ? null : (
              <clipPath key={lv} id={`${sceneId}-c${lv}`}>
                {rectsAt(lv)}
              </clipPath>
            ),
          )}
          {/* hidden patches: mid-grey with diagonal hatching, so they never blend into the sky */}
          <pattern id={`${sceneId}-hatch`} width={2.4} height={2.4} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width={2.4} height={2.4} style={{ fill: 'color-mix(in srgb, var(--ink) 45%, var(--surface))' }} />
            <line x1={0} y1={0} x2={0} y2={2.4} style={{ stroke: 'var(--surface)', strokeWidth: 0.7, opacity: 0.45 }} />
          </pattern>
          <clipPath id={`${sceneId}-vis`}>{hidden.map((h, i) => (!h ? <rect key={i} x={(i % N) * S} y={Math.floor(i / N) * S} width={S} height={S} /> : null))}</clipPath>
        </defs>
      </svg>

      <div ref={wrapRef} className={css.row} style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: narrow ? '0.5rem' : undefined }}>
        <div className={css.panel}>
          <div className={css.panelTitle}>
            Encoder input
            <br />({nVisible} visible{narrow ? '' : ' patches'})
          </div>
          <svg viewBox="0 0 100 100" className={css.mae} role="img" aria-label={`The picture with ${nHidden} of 196 patches hidden`}>
            <rect width={100} height={100} style={{ fill: `url(#${sceneId}-hatch)` }} />
            <g clipPath={`url(#${sceneId}-vis)`}>
              <use href={`#${sceneId}`} />
            </g>
            {grid}
          </svg>
        </div>
        <div className={css.panel}>
          <div className={css.panelTitle}>
            {narrow ? 'Rebuilt' : 'Reconstruction'}
            <br />
            (illustrative)
          </div>
          <svg viewBox="0 0 100 100" className={css.mae} role="img" aria-label="An illustrative reconstruction: hidden patches are blurrier the further they are from visible patches">
            <g clipPath={`url(#${sceneId}-vis)`}>
              <use href={`#${sceneId}`} />
            </g>
            {BLUR.map((_, lv) =>
              lv === 0 ? null : (
                <g key={lv} clipPath={`url(#${sceneId}-c${lv})`}>
                  <g filter={`url(#${sceneId}-b${lv})`}>
                    <use href={`#${sceneId}`} />
                  </g>
                </g>
              ),
            )}
          </svg>
        </div>
        <div className={css.panel}>
          <div className={css.panelTitle}>
            Original
            <br />
            (the target)
          </div>
          <svg viewBox="0 0 100 100" className={css.mae} role="img" aria-label="The original picture">
            <use href={`#${sceneId}`} />
            {grid}
          </svg>
        </div>
      </div>

      <Controls>
        <Slider label="mask ratio" value={ratio} min={0.1} max={0.9} step={0.05} onChange={setRatio} format={(v) => `${Math.round(v * 100)}%`} />
        <Button onClick={() => setSeed((s) => s + 1)}>New mask</Button>
      </Controls>
      <Readout
        items={[
          ['hidden patches', `${nHidden} of ${N * N}`],
          ['tokens the encoder reads', `${nVisible}`],
          ['hidden with no visible patch beside it', `${Math.round(isolated * 100)}%`],
          ['cat patches still visible', `${catVisible} of ${catIdx.length}`],
          ['encoder attention cost vs all 196', `${((nVisible / (N * N)) ** 2 * 100).toFixed(0)}%`],
        ]}
      />
    </Figure>
  )
}
