import { useState } from 'react'
import { Figure, Controls, Readout, Slider, Toggle, Button, useNarrow, mulberry32, shuffled } from '../../../../../kit'
import { Py } from './PyCode'
import styles from './tl.module.css'

/*
  A Dataset of 12 labelled examples (stored sorted: 6 cats then 6 dogs, as files often are) is dealt
  into batches by a DataLoader. Change batch_size, shuffle and drop_last; press "Next epoch" to deal
  again. Shuffling draws a fresh random order every epoch, exactly like DataLoader(shuffle=True).
*/

const N = 12
const isCat = (i: number) => i < 6
const range = (n: number) => Array.from({ length: n }, (_, i) => i)

function Card({ id, delay, anim }: { id: number; delay?: number; anim?: boolean }) {
  const c = isCat(id) ? 'var(--viz-1)' : 'var(--viz-2)'
  return (
    <div className={`${styles.card}${anim ? ' ' + styles.deal : ''}`} style={{ borderColor: c, animationDelay: delay != null ? `${delay}ms` : undefined }} title={`ds[${id}]: ${isCat(id) ? 'cat' : 'dog'}`}>
      <span className={styles.cardNum}>{id}</span>
      <span className={styles.cardTag} style={{ background: `color-mix(in srgb, ${c} 28%, var(--surface))`, color: 'var(--ink)' }}>
        {isCat(id) ? 'cat' : 'dog'}
      </span>
    </div>
  )
}

export default function DataLoaderShuffle() {
  const [bs, setBs] = useState(5)
  const [shuffle, setShuffle] = useState(true)
  const [dropLast, setDropLast] = useState(false)
  const [epoch, setEpoch] = useState(1)
  // deal with an animation only after the learner changes something (the first frame is complete)
  const [touched, setTouched] = useState(false)
  const act = <T,>(f: (v: T) => void) => (v: T) => {
    setTouched(true)
    f(v)
  }
  const [ref, narrow] = useNarrow<HTMLDivElement>(520)

  const order = shuffle ? shuffled(range(N), mulberry32(7 + epoch * 101)) : range(N)
  const batches: number[][] = []
  for (let i = 0; i < N; i += bs) batches.push(order.slice(i, i + bs))
  const dropped = dropLast && batches[batches.length - 1].length < bs ? batches.pop()! : null
  const used = batches.reduce((s, b) => s + b.length, 0)
  const key = `${epoch}-${bs}-${shuffle}-${dropLast}`

  return (
    <Figure
      title="A DataLoader deals the dataset into batches"
      caption={
        <>
          The dataset is stored sorted by label (all cats, then all dogs). Press <b>Next epoch</b> a few times with shuffle on, then turn shuffle off: every batch becomes the same, and most are all one
          class, so the model would see 'cats, cats, then dogs' every epoch. Try a batch size that does not divide 12, and switch on <code>drop_last</code>.
        </>
      }
    >
      <div ref={ref} className={narrow ? styles.narrow : undefined} style={{ width: '100%', display: 'grid', gap: 12, minWidth: 0 }}>
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--rule)', borderRadius: 10, padding: '0.45rem 0.7rem', overflowWrap: 'anywhere' }}>
          <Py code={`loader = DataLoader(ds, batch_size=${bs}, shuffle=${shuffle ? 'True' : 'False'}${dropLast ? ', drop_last=True' : ''})`} size={narrow ? 12 : 13} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 650, color: 'var(--ink-2)', marginBottom: 5 }}>
            <code>ds</code>: 12 examples, each an image of shape <code>(1, 28, 28)</code> with a label
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {range(N).map((i) => (
              <Card key={i} id={i} />
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 750, fontSize: 15, color: 'var(--ink)' }}>Epoch {epoch}</span>
          <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>
            {shuffle ? 'a new random order this epoch' : 'the same order as every epoch'} ({batches.length} {batches.length === 1 ? 'batch' : 'batches'})
          </span>
        </div>
        <div key={key} style={{ display: 'grid', gap: 8 }}>
          {batches.map((b, k) => {
            const cats = b.filter(isCat).length
            const dogs = b.length - cats
            const pure = b.length > 1 && (cats === 0 || dogs === 0)
            return (
              <div
                key={k}
                style={{
                  display: 'grid',
                  gridTemplateColumns: narrow ? '1fr' : '64px minmax(0, 1fr) auto',
                  gap: narrow ? 4 : 10,
                  alignItems: 'center',
                  padding: '6px 8px',
                  borderRadius: 10,
                  border: '1px solid var(--rule)',
                  background: 'var(--surface)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 12.5, fontWeight: 700, color: 'var(--ink-2)' }}>
                  <span>batch {k + 1}</span>
                  {narrow && <BatchInfo n={b.length} cats={cats} dogs={dogs} pure={pure} />}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {b.map((id, j) => (
                    <Card key={id} id={id} anim={touched} delay={(k * bs + j) * 45} />
                  ))}
                </div>
                {!narrow && <BatchInfo n={b.length} cats={cats} dogs={dogs} pure={pure} />}
              </div>
            )
          })}
          {dropped && (
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 10, border: '1.5px dashed var(--rule)', opacity: 0.6 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-3)' }}>dropped (drop_last):</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {dropped.map((id) => (
                  <Card key={id} id={id} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Controls>
        <Slider label="batch_size" value={bs} min={1} max={12} onChange={act(setBs)} />
        <Toggle label="shuffle=True" checked={shuffle} onChange={act(setShuffle)} />
        <Toggle label="drop_last=True" checked={dropLast} onChange={act(setDropLast)} />
      </Controls>
      <Controls>
        <Button primary onClick={() => act(setEpoch)(epoch + 1)}>
          Next epoch
        </Button>
        <Button onClick={() => act(setEpoch)(1)} disabled={epoch === 1}>
          Back to epoch 1
        </Button>
        <Readout
          items={[
            ['len(loader)', String(batches.length)],
            ['examples used per epoch', `${used} of ${N}`],
          ]}
        />
      </Controls>
    </Figure>
  )
}

function BatchInfo({ n, cats, dogs, pure }: { n: number; cats: number; dogs: number; pure: boolean }) {
  return (
    <div style={{ display: 'grid', gap: 1, justifyItems: 'end', fontSize: 12, lineHeight: 1.35, textAlign: 'right' }}>
      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink)', fontWeight: 600 }}>x: ({n}, 1, 28, 28) y: ({n},)</span>
      <span style={{ color: pure ? 'var(--warn)' : 'var(--ink-3)', fontWeight: pure ? 700 : 500 }}>
        {pure ? `all ${cats ? 'cat' : 'dog'}` : `${cats} cat · ${dogs} dog`}
      </span>
    </div>
  )
}
