import { useMemo, useState, type CSSProperties } from 'react'
import { Figure, Controls, Slider, Segmented, Toggle, Button, MatrixGrid, Readout, useNarrow } from '../../../../../kit'

/*
  The NOAI 2025 Final Question 1 data, run three ways:
    1. vectorised      theta -= alpha * X.T @ (X @ theta - y) / m
    2. loop with a copy (simultaneous update, same numbers as 1)
    3. loop in place   (sequential update: theta[1] uses the new theta[0], a different algorithm)
  Toggles: the gradient scale 1/m (the task, ½ in the loss) or 2/m (plain MSE), and adding an
  extra bias column (a mistake, because X already has an intercept column).
  Official answer after 1000 iterations: [0.003, 0.9987].
*/

const X0 = [
  [2, 2],
  [2, 4],
  [2, 6],
]
const Y = [2, 4, 6]
const ALPHA = 0.01
const T_MAX = 1000

type Mode = 'vec' | 'copy' | 'seq'

function history(mode: Mode, scale: number, extraBias: boolean): number[][] {
  const X = extraBias ? X0.map((r) => [1, ...r]) : X0
  const m = X.length
  const n = X[0].length
  const grad = (th: number[], j: number) => {
    let s = 0
    for (let i = 0; i < m; i++) {
      let h = 0
      for (let k = 0; k < n; k++) h += th[k] * X[i][k]
      s += (h - Y[i]) * X[i][j]
    }
    return (scale * s) / m
  }
  let th = new Array(n).fill(0)
  const out = [th.slice()]
  for (let t = 0; t < T_MAX; t++) {
    if (mode === 'seq') {
      for (let j = 0; j < n; j++) th[j] -= ALPHA * grad(th, j)
    } else if (mode === 'copy') {
      const nw = th.slice()
      for (let j = 0; j < n; j++) nw[j] = th[j] - ALPHA * grad(th, j)
      th = nw
    } else {
      // vectorised: compute every gradient from the same theta, then update all at once
      const g = th.map((_, j) => grad(th, j))
      th = th.map((v, j) => v - ALPHA * g[j])
    }
    out.push(th.slice())
  }
  return out
}

const r4 = (v: number) => {
  const r = Math.round(v * 1e4) / 1e4
  return Object.is(r, -0) ? 0 : r
}
const show = (th: number[]) => `[${th.map((v) => r4(v).toFixed(4)).join(', ')}]`
const same = (a: number[], b: number[]) => a.length === b.length && a.every((v, i) => r4(v) === r4(b[i]))

const card: CSSProperties = { border: '1px solid var(--rule)', borderRadius: 'var(--radius-m)', padding: '0.7rem 0.8rem', display: 'grid', gap: '0.45rem', background: 'var(--surface)', minWidth: 0 }
const pre: CSSProperties = { margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.74rem', lineHeight: 1.45, background: 'var(--surface-2)', borderRadius: 6, padding: '0.45rem 0.55rem', overflowX: 'auto', whiteSpace: 'pre', color: 'var(--ink)' }

export default function SimultaneousUpdateCheck() {
  const [t, setT] = useState(1)
  const [scale, setScale] = useState<1 | 2>(1)
  const [extraBias, setExtraBias] = useState(false)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(560)

  const runs = useMemo(
    () => ({
      vec: history('vec', scale, extraBias),
      copy: history('copy', scale, extraBias),
      seq: history('seq', scale, extraBias),
      ref: history('vec', 1, false),
    }),
    [scale, extraBias],
  )
  const ref = runs.ref[t]
  const g = scale === 2 ? '2 * ' : ''
  const cards: { mode: Mode; title: string; code: string }[] = [
    {
      mode: 'vec',
      title: 'Vectorised (one line)',
      code: `error = X @ theta - y\ntheta -= alpha * ${g}X.T @ error / m`,
    },
    {
      mode: 'copy',
      title: 'Loop over j, with a copy',
      code: `error = X @ theta - y\nnew = theta.copy()\nfor j in range(n):\n    grad = ${g}np.sum(error * X[:, j]) / m\n    new[j] = theta[j] - alpha * grad\ntheta = new`,
    },
    {
      mode: 'seq',
      title: 'Loop over j, in place (bug)',
      code: `for j in range(n):\n    # j = 1 sees the NEW theta[0]\n    error = X @ theta - y\n    grad = ${g}np.sum(error * X[:, j]) / m\n    theta[j] -= alpha * grad`,
    },
  ]

  return (
    <Figure
      title="Same data, three loops: which one matches the official answer?"
      caption={
        <>
          The 2025 Final data. Step through the first iterations: the vectorised loop and the loop with a copy agree exactly, but the in-place loop
          already differs after one iteration, because when it updates <code>theta[1]</code> it uses the <i>new</i> <code>theta[0]</code>. Run to 1000
          and compare with the official <code>[0.003, 0.9987]</code>. Then switch the gradient to 2/m, or add your own bias column, and watch even the
          correct loops stop matching.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: '0.9rem', alignItems: 'center', justifyContent: 'center' }}>
        <MatrixGrid label={extraBias ? 'X with your extra column of 1s (3 × 3)' : 'X (3 × 2), intercept column of 2s'} data={extraBias ? X0.map((r) => [1, ...r]) : X0} cellSize={34} cols={extraBias ? [0] : []} />
        <MatrixGrid label="y" data={Y.map((v) => [v])} cellSize={34} />
        <Readout
          items={[
            ['α', String(ALPHA)],
            ['start', 'θ = zeros'],
            ['effective α on the 1/m formula', scale === 2 ? '0.02 (doubled)' : '0.01'],
          ]}
        />
      </div>
      <Controls>
        <Slider label="iterations run" value={t} min={0} max={T_MAX} step={1} onChange={setT} />
      </Controls>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', width: '100%' }}>
        <Button onClick={() => setT(Math.min(T_MAX, t + 1))}>+1 iteration</Button>
        <Button onClick={() => setT(Math.min(T_MAX, t + 10))}>+10</Button>
        <Button primary onClick={() => setT(T_MAX)}>
          Run to 1000
        </Button>
        <Button onClick={() => setT(0)}>Back to 0</Button>
      </div>
      <Controls>
        <Segmented
          label="Gradient used"
          value={scale}
          onChange={(v) => setScale(v)}
          options={[
            { value: 1, label: '(1/m)·Xᵀe, as in the task' },
            { value: 2, label: '(2/m)·Xᵀe, plain MSE' },
          ]}
        />
        <Toggle label="Also add my own bias column of 1s" checked={extraBias} onChange={setExtraBias} />
      </Controls>
      <div style={{ width: '100%', display: 'grid', gap: '0.6rem' }}>
        {cards.map((c) => {
          const th = runs[c.mode][t]
          const ok = same(th, ref)
          return (
            <div key={c.mode} style={{ ...card, borderColor: ok ? 'color-mix(in srgb, var(--viz-pos) 55%, var(--rule))' : 'color-mix(in srgb, var(--viz-neg) 55%, var(--rule))' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ink)' }}>{c.title}</div>
              <div style={{ display: 'grid', gridTemplateColumns: narrow ? '1fr' : 'minmax(0, 1fr) 12.5rem', gap: '0.6rem', alignItems: 'center' }}>
                <pre style={pre}>{c.code}</pre>
                <div style={{ display: 'grid', gap: '0.25rem' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--ink)', overflowWrap: 'anywhere' }}>θ = {show(th)}</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: ok ? 'var(--viz-pos)' : 'var(--viz-neg)' }}>
                    {ok
                      ? t === T_MAX
                        ? 'matches the official answer'
                        : 'matches the task method'
                      : th.length !== ref.length
                        ? `${th.length} numbers: the task expects ${ref.length} (θ already contains the bias)`
                        : 'differs at 4 d.p.'}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <Readout items={[[`task method, t = ${t}`, show(ref)], ['official, t = 1000', '[0.0030, 0.9987]']]} />
    </Figure>
  )
}
