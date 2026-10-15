import { useId, useMemo, useState } from 'react'
import { Figure, Controls, Readout, Toggle, Button, mulberry32, shuffled, useNarrow } from '../../../../../kit'
import { GardenScene } from './scene'
import { clsOutput } from './posModel'
import css from './vit.module.css'

/*
  Why a ViT needs position embeddings. The picture is cut into 3 × 3 patches; the right-hand copy
  has its patches shuffled. A tiny random one-layer Transformer reads both, and we compare the
  output of the [CLS] token. Without position embeddings the two outputs are identical: attention
  treats its input as an unordered set. With position embeddings added, they differ.
  The % on each tile is the attention [CLS] pays to that patch: without positions it travels with the tile.
*/

const S = 100 / 3
const ID = [0, 1, 2, 3, 4, 5, 6, 7, 8]
const fmtVec = (v: number[]) => `[${v.map((x) => (Math.abs(x) < 0.0005 ? 0 : x).toFixed(2).replace('-', '−')).join(', ')}]`

function Board({ perm, attn, usePos, sceneId, label, defineScene }: { perm: number[]; attn: number[]; usePos: boolean; sceneId: string; label: string; defineScene?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className={css.board} role="img" aria-label={label}>
      {defineScene && (
        <defs>
          <g id={sceneId}>
            <GardenScene />
          </g>
        </defs>
      )}
      <rect x={0} y={0} width={100} height={100} style={{ fill: 'var(--surface-2)' }} />
      {perm.map((p, slot) => {
        const tx = (slot % 3) * S
        const ty = Math.floor(slot / 3) * S
        const pc = (p % 3) * S
        const pr = Math.floor(p / 3) * S
        return (
          <g key={p} className={css.tile} style={{ transform: `translate(${tx}px, ${ty}px)` }}>
            <svg x={0.8} y={0.8} width={S - 1.6} height={S - 1.6} viewBox={`${pc} ${pr} ${S} ${S}`} preserveAspectRatio="none">
              <use href={`#${sceneId}`} />
            </svg>
            <text
              x={S - 3}
              y={7.5}
              textAnchor="end"
              style={{ fontSize: 6, fontWeight: 800, fill: 'var(--ink)', stroke: 'var(--surface)', strokeWidth: 1.6, paintOrder: 'stroke' }}
            >
              {Math.round(attn[slot + 1] * 100)}%
            </text>
          </g>
        )
      })}
      {perm.map((_, slot) => (
        <text
          key={`pos${slot}`}
          x={(slot % 3) * S + 3}
          y={Math.floor(slot / 3) * S + S - 3.5}
          style={{
            fontSize: 5.2,
            fontWeight: 700,
            fill: usePos ? 'var(--accent)' : 'var(--ink-3)',
            stroke: 'var(--surface)',
            strokeWidth: 1.4,
            paintOrder: 'stroke',
          }}
        >
          {usePos ? `+pos ${slot + 1}` : `slot ${slot + 1}`}
        </text>
      ))}
    </svg>
  )
}

export default function PositionShuffle() {
  const [seed, setSeed] = useState(1)
  const [usePos, setUsePos] = useState(false)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(480)
  const sceneId = 'vit-shuffle-' + useId().replace(/:/g, '')

  const perm = useMemo(() => {
    // keep shuffling until no patch stays in place, so the change is obvious
    const r = mulberry32(seed * 7919)
    let p = shuffled(ID, r)
    while (p.some((v, i) => v === i)) p = shuffled(ID, r)
    return p
  }, [seed])

  const a = clsOutput(ID, usePos)
  const b = clsOutput(perm, usePos)
  const diff = Math.max(...a.out.map((v, i) => Math.abs(v - b.out[i])))
  const same = diff < 1e-9

  return (
    <Figure
      wide
      title="Shuffle the patches: can the Transformer tell?"
      caption={
        <>
          Both pictures go through the same tiny Transformer (one attention layer with random weights), and we read off the output of the [CLS]
          token. The % on each tile is the attention [CLS] pays to it (the rest goes to [CLS] itself). Press <b>Shuffle</b> a few times with position
          embeddings off: the output never changes, because each tile's weight travels with the tile and the weighted sum ends up the same. Now switch position embeddings on: each slot adds its own vector, and the
          scrambled picture finally gives a different answer.
        </>
      }
    >
      <div ref={wrapRef} className={`${css.row} ${narrow ? '' : css.rowTwo}`}>
        <div className={css.panel}>
          <div className={css.panelTitle}>Original picture</div>
          <Board perm={ID} attn={a.attn} usePos={usePos} sceneId={sceneId} defineScene label="The picture cut into 3 by 3 patches in their original order" />
        </div>
        <div className={css.panel}>
          <div className={css.panelTitle}>Same patches, shuffled</div>
          <Board perm={perm} attn={b.attn} usePos={usePos} sceneId={sceneId} label="The same nine patches in a shuffled order" />
        </div>
      </div>

      <div className={`${css.verdict} ${same ? css.same : css.diff}`} role="status">
        {same
          ? 'Identical outputs: without positions, the Transformer cannot tell the scrambled picture from the real one.'
          : `Different outputs (biggest change ${diff.toFixed(2)}): position embeddings let the model see where each patch is.`}
      </div>

      <Readout
        items={[
          ['[CLS] output, original', fmtVec(a.out)],
          ['[CLS] output, shuffled', fmtVec(b.out)],
        ]}
      />

      <Controls>
        <Button primary onClick={() => setSeed((s) => s + 1)}>
          Shuffle
        </Button>
        <Toggle label="add position embeddings" checked={usePos} onChange={setUsePos} />
      </Controls>
    </Figure>
  )
}
