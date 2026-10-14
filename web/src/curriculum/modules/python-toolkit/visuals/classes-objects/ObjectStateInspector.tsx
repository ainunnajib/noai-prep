import { useState } from 'react'
import { Figure, Controls, Segmented, Button } from '../../../../../kit'
import { CodeView, Console, MONO, type ConsoleLine } from '../references-mutability/pyviz'

/*
  fit changes the object's state; predict uses it. Run the commands in any order and watch
  the object's attributes (its state) in the inspector. predict before fit raises AttributeError.
*/

const CODE = `class MeanPredictor:
    def fit(self, y):
        self.mean_ = sum(y) / len(y)
        return self

    def predict(self, X):
        return [self.mean_ for x in X]`

const DATA: Record<string, number[]> = { a: [2, 4, 9], b: [10, 20], c: [3, 3, 6] }

type Last = 'new' | 'fit' | 'predict-ok' | 'predict-err'

const fmt = (v: number) => (Number.isInteger(v) ? v.toFixed(1) : String(v))

export default function ObjectStateInspector() {
  const [which, setWhich] = useState<'a' | 'b' | 'c'>('a')
  const [mean, setMean] = useState<number | null>(null)
  const [last, setLast] = useState<Last>('new')
  const [log, setLog] = useState<ConsoleLine[]>([{ text: '>>> model = MeanPredictor()', tone: 'cmd' }])
  const [explain, setExplain] = useState<string>('A brand-new object. It has methods, but no attributes yet: it has learned nothing.')

  const push = (lines: ConsoleLine[]) => setLog((l) => [...l, ...lines].slice(-7))
  const y = DATA[which]

  const fresh = () => {
    setMean(null)
    setLast('new')
    setLog([{ text: '>>> model = MeanPredictor()', tone: 'cmd' }])
    setExplain('A brand-new object. It has methods, but no attributes yet: it has learned nothing.')
  }
  const fit = () => {
    const total = y.reduce((a, b) => a + b, 0)
    const m = total / y.length
    setMean(m)
    setLast('fit')
    push([
      { text: `>>> model.fit([${y.join(', ')}])`, tone: 'cmd' },
      { text: '# nothing printed: fit changes the object', tone: 'note' },
    ])
    setExplain(`fit worked out sum / len = ${total} / ${y.length} = ${fmt(m)} and stored it on the object as self.mean_. That attribute stays after fit returns.`)
  }
  const predict = () => {
    push([{ text: '>>> print(model.predict([1, 2]))', tone: 'cmd' }])
    if (mean === null) {
      setLast('predict-err')
      push([{ text: "AttributeError: 'MeanPredictor' object has no attribute 'mean_'", tone: 'err' }])
      setExplain('predict tried to read self.mean_, but nothing has created that attribute yet. You must call fit first.')
    } else {
      setLast('predict-ok')
      push([{ text: `[${fmt(mean)}, ${fmt(mean)}]` }])
      setExplain(`predict read the stored self.mean_ (${fmt(mean)}) and returned it once for each of the 2 inputs. It changed nothing.`)
    }
  }

  const active = last === 'fit' ? [2, 3, 4] : last === 'predict-ok' || last === 'predict-err' ? [6, 7] : [1]

  return (
    <Figure
      title="fit stores what the object learned; predict uses it"
      caption={
        <>
          Try <code>predict</code> first and read the error. Then <code>fit</code>, and watch <code>mean_</code> appear in the inspector; then <code>predict</code> again.
          Refit on different data and predictions change, because the object's state changed. This fit/predict pattern is how every scikit-learn model works.
        </>
      }
    >
      <CodeView code={CODE} active={active} activeTone={last === 'predict-err' ? 'bad' : 'highlight'} />
      <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 270px), 1fr))', gap: 12, alignItems: 'start' }}>
        <Console lines={log} title="program" minLines={4} />
        <div style={{ display: 'grid', gap: 10, minWidth: 0 }}>
          <div style={{ border: '2px solid var(--viz-2)', borderRadius: 12, padding: '0.55rem 0.75rem', background: 'var(--surface)' }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-3)', marginBottom: 6 }}>
              Object inspector: <span style={{ fontFamily: MONO, color: 'var(--accent)', fontSize: 14 }}>model</span> → MeanPredictor object
            </div>
            <div style={{ fontFamily: MONO, fontSize: 14, minHeight: '2.2em', display: 'flex', alignItems: 'center' }}>
              {mean === null ? (
                <span style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-body)', fontStyle: 'italic', fontSize: 13.5 }}>no attributes yet</span>
              ) : (
                <span
                  style={{
                    padding: '0.15rem 0.5rem',
                    borderRadius: 6,
                    background: last === 'fit' ? 'color-mix(in srgb, var(--viz-2) 18%, var(--surface))' : 'var(--surface-2)',
                    border: `1px solid ${last === 'fit' ? 'var(--viz-2)' : 'var(--rule)'}`,
                    transition: 'all 0.3s',
                  }}
                >
                  mean_ = {fmt(mean)}
                </span>
              )}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 4 }}>
              <code>vars(model)</code> → <span style={{ fontFamily: MONO }}>{mean === null ? '{}' : `{'mean_': ${fmt(mean)}}`}</span>
            </div>
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.5, background: 'var(--surface-2)', borderRadius: 8, padding: '0.5rem 0.7rem', minHeight: '4.6em' }}>{explain}</div>
        </div>
      </div>
      <Controls>
        <Segmented
          label="training data y"
          value={which}
          onChange={setWhich}
          options={[
            { value: 'a', label: '[2, 4, 9]' },
            { value: 'b', label: '[10, 20]' },
            { value: 'c', label: '[3, 3, 6]' },
          ]}
        />
      </Controls>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, width: '100%' }}>
        <Button onClick={predict}>
          <span style={{ fontFamily: MONO }}>model.predict([1, 2])</span>
        </Button>
        <Button primary onClick={fit}>
          <span style={{ fontFamily: MONO }}>model.fit([{y.join(', ')}])</span>
        </Button>
        <Button onClick={fresh}>
          <span style={{ fontFamily: MONO }}>model = MeanPredictor()</span>
        </Button>
      </div>
    </Figure>
  )
}
