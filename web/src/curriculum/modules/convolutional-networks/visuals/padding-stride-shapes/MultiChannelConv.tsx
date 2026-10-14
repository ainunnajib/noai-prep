import { useEffect, useState } from 'react'
import { Figure, Readout, Slider, M, usePlayer, PlayerControls, useContainerWidth } from '../../../../../kit'
import s from './pss.module.css'

/*
  One kernel on a 3-channel input. The kernel is 3×3×3: one 3×3 slice per input channel. Step
  through: multiply-and-add in the red channel, then green, then blue, then add the three sums and
  the bias: ONE output number. Tap an output cell to move the window. Below, a parameter counter
  for a whole layer: C_out kernels, each k × k × C_in, plus one bias each.
*/

type G = number[][]
const X: G[] = [
  [
    [1, 0, 2, 1, 0],
    [0, 1, 3, 1, 1],
    [2, 1, 0, 0, 2],
    [1, 3, 1, 2, 0],
    [0, 1, 2, 1, 1],
  ],
  [
    [0, 2, 1, 0, 1],
    [1, 0, 1, 2, 0],
    [3, 1, 2, 1, 0],
    [0, 0, 1, 3, 1],
    [2, 1, 0, 1, 0],
  ],
  [
    [1, 1, 0, 2, 2],
    [2, 0, 1, 0, 1],
    [0, 2, 1, 1, 0],
    [1, 1, 0, 0, 3],
    [0, 2, 1, 2, 1],
  ],
]
const KW: G[] = [
  [
    [1, 0, -1],
    [1, 0, -1],
    [1, 0, -1],
  ],
  [
    [0, 1, 0],
    [1, -1, 1],
    [0, 1, 0],
  ],
  [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ],
]
const BIAS = 1
const CH = [
  { name: 'Red', colour: 'var(--viz-neg)' },
  { name: 'Green', colour: 'var(--viz-pos)' },
  { name: 'Blue', colour: 'var(--viz-1)' },
]
const O = 3
const CIN_OPTS = [1, 3, 16, 32, 64, 128, 256]
const COUT_OPTS = [1, 6, 16, 32, 64, 128, 256, 512]
const K_OPTS = [1, 3, 5, 7]

const chanSum = (ch: number, r: number, c: number) => {
  let t = 0
  for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) t += X[ch][r + a][c + b] * KW[ch][a][b]
  return t
}
const outAt = (r: number, c: number) => chanSum(0, r, c) + chanSum(1, r, c) + chanSum(2, r, c) + BIAS
const fmt = (v: number) => String(v).replace('-', '−')
const big = (v: number) => v.toLocaleString('en-GB')
const texNum = (v: number) => big(v).replace(/,/g, '{,}')

export default function MultiChannelConv() {
  const [pos, setPos] = useState<[number, number]>([1, 1])
  const player = usePlayer({ steps: 5, interval: 1500 })
  const [ref, W] = useContainerWidth<HTMLDivElement>(600)
  const [ci, setCi] = useState(4)
  const [co, setCo] = useState(5)
  const [ki, setKi] = useState(1)
  useEffect(() => {
    player.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos])

  const narrow = W < 420
  const cell = narrow ? 17 : 23
  const st = player.step
  const [r0, c0] = pos
  const sums = [0, 1, 2].map((ch) => chanSum(ch, r0, c0))
  const total = outAt(r0, c0)

  const Cin = CIN_OPTS[ci]
  const Cout = COUT_OPTS[co]
  const k = K_OPTS[ki]
  const perKernel = k * k * Cin
  const params = (perKernel + 1) * Cout

  const grid = (g: G, opts: { hl?: (a: number, b: number) => boolean; colour: string; label: string; strong?: boolean }) => (
    <div className={s.mini} style={{ gridTemplateColumns: `repeat(${g[0].length}, ${cell}px)` }} role="img" aria-label={opts.label}>
      {g.flatMap((row, a) =>
        row.map((v, b) => {
          const on = opts.hl ? opts.hl(a, b) : false
          return (
            <div
              key={`${a}${b}`}
              className={s.miniCell}
              style={{
                width: cell,
                height: cell,
                fontSize: cell < 20 ? '0.7rem' : '0.78rem',
                background: on ? `color-mix(in srgb, ${opts.colour} ${opts.strong ? 34 : 18}%, var(--surface))` : 'var(--surface-2)',
                borderColor: on ? opts.colour : 'transparent',
              }}
            >
              {fmt(v)}
            </div>
          )
        }),
      )}
    </div>
  )

  const stepText = [
    `The kernel has one 3 × 3 slice for each of the 3 input channels: 27 weights in total. Line it up with the same 3 × 3 window in every channel.`,
    `Red channel: multiply the 9 red pixels by the red slice and add: ${fmt(sums[0])}.`,
    `Green channel: same again with the green slice: ${fmt(sums[1])}.`,
    `Blue channel: and with the blue slice: ${fmt(sums[2])}.`,
    `Add the three channel sums and the kernel's single bias: ${fmt(sums[0])} + ${fmt(sums[1])} + ${fmt(sums[2])} + ${BIAS} = ${fmt(total)}. One kernel gives one number per position, so one output channel.`,
  ]

  return (
    <Figure
      title="A kernel spans every input channel"
      caption={
        <>
          Press <b>Next</b> (or Play) to step through one output value, and tap any output cell to move the window. Then use the sliders below to size a whole
          layer: its parameter count is (k × k × C<sub>in</sub> + 1) × C<sub>out</sub>, and notice that the image size appears nowhere in it.
        </>
      }
    >
      <div ref={ref} style={{ width: '100%' }}>
        <div className={s.stackRow} style={narrow ? { gap: '0.6rem 0.3rem' } : undefined}>
          {CH.map((chn, ch) => {
            const active = st === ch + 1
            const done = st > ch
            return (
              <div key={chn.name} className={s.col} style={{ padding: 4, borderRadius: 8, outline: active ? `2px solid ${chn.colour}` : 'none', outlineOffset: 1 }}>
                <span className={s.cap} style={{ color: chn.colour }}>
                  {chn.name} input
                </span>
                {grid(X[ch], { hl: (a, b) => a >= r0 && a < r0 + 3 && b >= c0 && b < c0 + 3, colour: chn.colour, label: `${chn.name} channel, 5 by 5`, strong: active })}
                <span className={s.capSmall}>{chn.name.toLowerCase()} slice of the kernel</span>
                {grid(KW[ch], { hl: () => active, colour: chn.colour, label: `${chn.name} slice of the kernel` })}
                <span className={s.sumLine} style={{ minHeight: '1.4em' }}>
                  {done ? (
                    <>
                      sum = <b>{fmt(sums[ch])}</b>
                    </>
                  ) : (
                    ' '
                  )}
                </span>
              </div>
            )
          })}
          <div className={s.col}>
            <span className={s.cap}>Output (1 channel)</span>
            <svg viewBox={`-2 -2 ${O * 34 + 4} ${O * 34 + 4}`} width={O * 34 + 4} style={{ display: 'block' }} role="group" aria-label="Output feature map, 3 by 3; tap a cell to move the window">
              {Array.from({ length: O * O }, (_, idx) => {
                const r = Math.floor(idx / O)
                const c = idx % O
                const cur = r === r0 && c === c0
                const show = !cur || st >= 4
                return (
                  <g
                    key={idx}
                    onClick={() => setPos([r, c])}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setPos([r, c]))}
                    tabIndex={0}
                    role="button"
                    aria-label={`output row ${r + 1}, column ${c + 1}`}
                    style={{ cursor: 'pointer', outline: 'none' }}
                  >
                    <rect
                      x={c * 34 + 1.5}
                      y={r * 34 + 1.5}
                      width={31}
                      height={31}
                      rx={4}
                      style={{ fill: cur ? 'color-mix(in srgb, var(--viz-2) 40%, var(--surface))' : 'var(--surface-2)', stroke: cur ? 'var(--viz-2)' : 'var(--viz-muted)', strokeWidth: cur ? 2.5 : 1 }}
                    />
                    <text x={c * 34 + 17} y={r * 34 + 17} dy="0.35em" textAnchor="middle" style={{ fontSize: 12.5, fontWeight: 700, fontFamily: 'var(--font-mono)', fill: 'var(--ink)', pointerEvents: 'none' }}>
                      {show ? fmt(outAt(r, c)) : '?'}
                    </text>
                  </g>
                )
              })}
            </svg>
            <span className={s.capSmall}>bias b = {BIAS}</span>
          </div>
        </div>
      </div>
      <div className={s.note} aria-live="polite">
        {stepText[st]}
      </div>
      <PlayerControls player={player} label={(i) => ['Line up', 'Red', 'Green', 'Blue', 'Add up'][i]} />

      <div className={s.panel}>
        <div className={s.panelTitle}>Count a whole layer's parameters</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem 1.25rem', width: '100%' }}>
          <div style={{ flex: '1 1 180px' }}>
            <Slider label={<>input channels C<sub>in</sub></>} value={ci} min={0} max={CIN_OPTS.length - 1} onChange={setCi} format={(i) => CIN_OPTS[i]} />
          </div>
          <div style={{ flex: '1 1 180px' }}>
            <Slider label={<>output channels C<sub>out</sub> (kernels)</>} value={co} min={0} max={COUT_OPTS.length - 1} onChange={setCo} format={(i) => COUT_OPTS[i]} />
          </div>
          <div style={{ flex: '1 1 140px' }}>
            <Slider label="kernel size k" value={ki} min={0} max={K_OPTS.length - 1} onChange={setKi} format={(i) => `${K_OPTS[i]} × ${K_OPTS[i]}`} />
          </div>
        </div>
        <div className={s.formula}>
          <M>{`(\\underbrace{${k} \\times ${k} \\times ${Cin}}_{\\text{weights per kernel}} + \\underbrace{1}_{\\text{bias}}) \\times \\underbrace{${Cout}}_{\\text{kernels}}`}</M>
          <div style={{ marginTop: '0.3rem' }}>
            <M>{`= (${texNum(perKernel)} + 1) \\times ${Cout} = ${texNum(params)}`}</M>
          </div>
        </div>
        <Readout
          items={[
            ['weight tensor shape', `(${Cout}, ${Cin}, ${k}, ${k})`],
            ['weights', big(perKernel * Cout)],
            ['biases', big(Cout)],
            ['total parameters', big(params)],
          ]}
        />
      </div>
    </Figure>
  )
}
