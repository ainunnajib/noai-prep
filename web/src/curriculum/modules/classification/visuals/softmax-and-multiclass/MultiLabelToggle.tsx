import { useState, type CSSProperties } from 'react'
import { Figure, Controls, Readout, Segmented, Toggle, useNarrow, M } from '../../../../../kit'
import { CLASSES, softmax } from './shared'

/*
  Multi-class vs multi-label. A "photo" contains any mix of a cat, dog, bird and fish. The network's
  four output units give a high logit for each object that is present and a low one otherwise.
  A softmax head makes the four outputs share one total of 1 (they compete); a sigmoid head judges
  each label on its own. Prediction: softmax → the single top class; sigmoids → every label with p ≥ 0.5.
*/

const PRESENT = [2.6, 3.0, 2.2, 2.8]
const ABSENT = [-3.0, -2.5, -2.0, -3.5]
const ICON_C = ['var(--viz-1)', 'var(--viz-2)', 'var(--viz-3)', 'var(--viz-5)']
type Head = 'softmax' | 'sigmoid'

const sig = (v: number) => 1 / (1 + Math.exp(-v))

function Icon({ k, x, y }: { k: number; x: number; y: number }) {
  const c = ICON_C[k]
  const dark = `color-mix(in srgb, ${c} 70%, var(--viz-ink))`
  const eye = { fill: 'var(--surface)' }
  const pupil = { fill: 'var(--viz-ink)' }
  switch (CLASSES[k]) {
    case 'cat':
      return (
        <g transform={`translate(${x},${y})`}>
          <path d="M-14,-6 L-13,-25 L-1,-14 Z M14,-6 L13,-25 L1,-14 Z" style={{ fill: dark }} />
          <circle r={16} style={{ fill: c }} />
          <circle cx={-6} cy={-3} r={3.6} style={eye} />
          <circle cx={6} cy={-3} r={3.6} style={eye} />
          <circle cx={-6} cy={-3} r={1.7} style={pupil} />
          <circle cx={6} cy={-3} r={1.7} style={pupil} />
          <path d="M-2.5,4 L2.5,4 L0,7 Z" style={pupil} />
          <path d="M-4,8 L-19,5 M-4,9 L-19,11 M4,8 L19,5 M4,9 L19,11" style={{ stroke: 'var(--viz-ink)', strokeWidth: 1, opacity: 0.7 }} />
        </g>
      )
    case 'dog':
      return (
        <g transform={`translate(${x},${y})`}>
          <ellipse cx={-16} cy={0} rx={7} ry={14} transform="rotate(15 -16 0)" style={{ fill: dark }} />
          <ellipse cx={16} cy={0} rx={7} ry={14} transform="rotate(-15 16 0)" style={{ fill: dark }} />
          <circle r={16} style={{ fill: c }} />
          <circle cx={-6} cy={-4} r={3.4} style={eye} />
          <circle cx={6} cy={-4} r={3.4} style={eye} />
          <circle cx={-6} cy={-4} r={1.7} style={pupil} />
          <circle cx={6} cy={-4} r={1.7} style={pupil} />
          <ellipse cx={0} cy={6} rx={4.6} ry={3.4} style={pupil} />
        </g>
      )
    case 'bird':
      return (
        <g transform={`translate(${x},${y})`}>
          <ellipse cx={-3} cy={4} rx={17} ry={12} style={{ fill: c }} />
          <circle cx={11} cy={-8} r={9} style={{ fill: c }} />
          <path d="M19,-10 L29,-7 L19,-4 Z" style={{ fill: 'var(--viz-6)' }} />
          <path d="M-12,2 Q-2,-10 8,2 Q-2,8 -12,2 Z" style={{ fill: dark }} />
          <circle cx={13} cy={-10} r={2.8} style={eye} />
          <circle cx={13.5} cy={-10} r={1.4} style={pupil} />
        </g>
      )
    default:
      return (
        <g transform={`translate(${x},${y})`}>
          <path d="M-15,0 L-29,-11 L-29,11 Z" style={{ fill: dark }} />
          <ellipse rx={19} ry={12} style={{ fill: c }} />
          <path d="M-2,-11 Q4,-19 9,-10 Z" style={{ fill: dark }} />
          <circle cx={10} cy={-3} r={3.2} style={eye} />
          <circle cx={10.5} cy={-3} r={1.6} style={pupil} />
        </g>
      )
  }
}

function Photo({ present }: { present: boolean[] }) {
  const pos: [number, number][] = [
    [52, 42],
    [148, 42],
    [52, 104],
    [148, 104],
  ]
  const names = CLASSES.filter((_, i) => present[i])
  return (
    <svg viewBox="0 0 200 140" style={{ width: 200, maxWidth: '100%', display: 'block' }} role="img" aria-label={names.length ? `A photo containing: ${names.join(', ')}` : 'An empty photo'}>
      <rect x={1} y={1} width={198} height={138} rx={10} style={{ fill: 'var(--surface-2)', stroke: 'var(--rule)', strokeWidth: 1.5 }} />
      {present.map((on, k) => (on ? <Icon key={k} k={k} x={pos[k][0]} y={pos[k][1]} /> : null))}
      {names.length === 0 && (
        <text x={100} y={75} textAnchor="middle" style={{ fill: 'var(--ink-3)', fontSize: 13 }}>
          (nothing in the photo)
        </text>
      )}
    </svg>
  )
}

export default function MultiLabelToggle() {
  const [present, setPresent] = useState([true, true, false, false])
  const [head, setHead] = useState<Head>('softmax')
  const [gridRef, narrow] = useNarrow<HTMLDivElement>(480)

  const z = present.map((on, i) => (on ? PRESENT[i] : ABSENT[i]))
  const p = head === 'softmax' ? softmax(z) : z.map(sig)
  const top = p.indexOf(Math.max(...p))
  const predicted = head === 'softmax' ? p.map((_, i) => i === top) : p.map((v) => v >= 0.5)
  const sum = p.reduce((a, b) => a + b, 0)
  const missed = CLASSES.filter((_, i) => present[i] && !predicted[i])
  const wrong = CLASSES.filter((_, i) => !present[i] && predicted[i])

  const grid: CSSProperties = {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: narrow ? '2.3rem 2.3rem 3.1rem minmax(0, 1fr) 1.9rem' : 'minmax(2.6rem, auto) 2.6rem 4.4rem minmax(0, 1fr) 2.6rem',
    alignItems: 'center',
    gap: narrow ? '0.45rem 0.3rem' : '0.45rem 0.5rem',
    fontSize: '0.85rem',
  }
  const headCell: CSSProperties = { fontSize: '0.75rem', fontWeight: 700, color: 'var(--ink-3)' }

  return (
    <Figure
      title="One label or many? Softmax versus sigmoids"
      caption={
        <>
          Tick the animals in the photo. The network's four output units give a high score to each animal that is there. With a <b>softmax</b> head the four
          outputs must share a total of 1, so two animals have to split the probability and the model can only name one of them. With a <b>sigmoid</b> head each
          output is its own yes/no question (is there a dog? is there a cat?), the outputs need not add up to 1, and every label with <M>{'p \\ge 0.5'}</M> is
          predicted. Try one animal, then two, then three, with each head.
        </>
      }
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem 1.25rem', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <Photo present={present} />
        <div style={{ display: 'grid', gap: '0.35rem' }}>
          {CLASSES.map((name, i) => (
            <Toggle
              key={name}
              label={`${name} in the photo`}
              checked={present[i]}
              onChange={(v) => {
                const np = present.slice()
                np[i] = v
                setPresent(np)
              }}
            />
          ))}
        </div>
      </div>
      <Segmented
        label="Output head"
        value={head}
        onChange={setHead}
        options={[
          { value: 'softmax', label: 'softmax (multi-class)' },
          { value: 'sigmoid', label: 'sigmoid per label (multi-label)' },
        ]}
      />
      <div ref={gridRef} style={grid} role="group" aria-label={`Outputs with a ${head} head`}>
        <span style={headCell}>label</span>
        <span style={{ ...headCell, textAlign: 'center' }}>logit</span>
        <span style={{ ...headCell, textAlign: 'center' }}>head</span>
        <span style={headCell}>{narrow ? 'p (line = 0.5)' : 'probability (line = 0.5)'}</span>
        <span style={{ ...headCell, textAlign: 'right' }}>say?</span>
        {head === 'softmax' && (
          <div
            style={{
              gridColumn: 3,
              gridRow: '2 / span 4',
              alignSelf: 'stretch',
              display: 'grid',
              placeItems: 'center',
              textAlign: 'center',
              border: '2px solid var(--viz-5)',
              borderRadius: 8,
              background: 'color-mix(in srgb, var(--viz-5) 12%, var(--surface))',
              fontWeight: 800,
              fontSize: narrow ? '0.7rem' : '0.78rem',
              color: 'var(--ink)',
              padding: '0.2rem',
              lineHeight: 1.3,
            }}
          >
            softmax
            <br />
            {narrow ? 'shared total' : 'one shared total'}
          </div>
        )}
        {CLASSES.map((name, i) => {
          const row = i + 2
          const on = predicted[i]
          return [
            <span key={`l${i}`} style={{ gridRow: row, gridColumn: 1, fontWeight: 700, color: present[i] ? 'var(--ink)' : 'var(--ink-3)' }}>
              {name}
            </span>,
            <span
              key={`z${i}`}
              style={{
                gridRow: row,
                gridColumn: 2,
                justifySelf: 'center',
                display: 'grid',
                placeItems: 'center',
                width: narrow ? '2.2rem' : '2.5rem',
                height: '1.7rem',
                borderRadius: 999,
                border: '1.5px solid var(--viz-ink)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                background: `color-mix(in srgb, var(--viz-1) ${present[i] ? 30 : 0}%, var(--surface))`,
              }}
            >
              {z[i].toFixed(1).replace('-', '−')}
            </span>,
            head === 'sigmoid' ? (
              <span
                key={`h${i}`}
                style={{
                  gridRow: row,
                  gridColumn: 3,
                  textAlign: 'center',
                  border: '2px solid var(--viz-4)',
                  borderRadius: 8,
                  background: 'color-mix(in srgb, var(--viz-4) 12%, var(--surface))',
                  fontWeight: 800,
                  padding: '0.1rem 0',
                }}
              >
                σ
              </span>
            ) : null,
            <span key={`b${i}`} style={{ gridRow: row, gridColumn: 4, position: 'relative', height: '1rem', borderRadius: 4, background: 'var(--surface-2)', overflow: 'hidden' }}>
              <span
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: `${(p[i] * 100).toFixed(1)}%`,
                  borderRadius: 4,
                  background: on ? 'var(--viz-2)' : 'color-mix(in srgb, var(--viz-1) 55%, var(--surface))',
                  transition: 'width 0.25s ease',
                }}
              />
              <span style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', borderLeft: '2px dashed var(--viz-ink)', opacity: 0.6 }} />
              <span style={{ position: 'absolute', right: 4, top: -1, fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ink)' }}>
                {p[i].toFixed(2)}
              </span>
            </span>,
            <span key={`o${i}`} style={{ gridRow: row, gridColumn: 5, textAlign: 'right', fontWeight: 800, color: on ? 'var(--viz-2)' : 'var(--ink-3)' }}>
              {on ? 'yes' : 'no'}
            </span>,
          ]
        })}
      </div>
      <Readout
        items={[
          ['outputs add up to', sum.toFixed(2)],
          ['model says', CLASSES.filter((_, i) => predicted[i]).join(', ') || 'nothing'],
          ['verdict', missed.length || wrong.length ? `${missed.length ? `missed ${missed.join(', ')}` : ''}${missed.length && wrong.length ? '; ' : ''}${wrong.length ? `wrongly said ${wrong.join(', ')}` : ''}` : 'all labels right'],
        ]}
      />
      <Controls>
        <span style={{ fontSize: '0.85rem', color: 'var(--ink-2)' }}>
          {head === 'softmax'
            ? 'Softmax prediction rule: pick the single class with the highest probability (argmax).'
            : 'Sigmoid prediction rule: say yes to every label whose own probability is at least 0.5.'}
        </span>
      </Controls>
    </Figure>
  )
}
