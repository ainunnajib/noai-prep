import { useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Plot, Path, Label, Arrow, DraggablePoint, usePlot, M } from '../../../../../kit'

/*
  A ladder of powers of ten from 10^-8 to 10^9, each rung tagged with where that size of number
  turns up in machine learning. "Read" mode: drag the marker to a rung and set the number in front
  to see one number written three ways. "Multiply" mode: drag A and B; the answer's rung lights up
  and the rule card shows the exponents adding (or subtracting, for division).
*/

const LO = -8
const HI = 9
const RAIL_L = 1.8
const RAIL_R = 2.8
const ARROW_X = 1.0
const MID = (RAIL_L + RAIL_R) / 2

const ML: Record<number, { short: string; long: string }> = {
  [-8]: { short: 'ε = 1e-8 (Adam)', long: 'ε = 1e-8: the tiny number Adam adds to a denominator so it never divides by zero' },
  [-5]: { short: 'ε = 1e-5 in norm layers', long: 'ε = 1e-5: the default safety constant inside PyTorch’s BatchNorm and LayerNorm' },
  [-4]: { short: 'learning rate 3e-4', long: '3e-4: a popular learning rate for the Adam optimiser' },
  [-3]: { short: 'Adam’s default lr', long: '1e-3 = 0.001: Adam’s default learning rate in PyTorch' },
  [-2]: { short: 'weight decay 0.01', long: '0.01: AdamW’s default weight decay in PyTorch' },
  [-1]: { short: 'SGD learning rate 0.1', long: '0.1: a common starting learning rate for plain SGD' },
  [0]: { short: '1', long: '10⁰ = 1: any number to the power 0 is 1' },
  [1]: { short: '10 digit classes', long: '10: the number of classes in MNIST (the digits 0 to 9)' },
  [3]: { short: '1000 ImageNet classes', long: '1000: the number of classes in ImageNet-1k' },
  [4]: { short: 'MNIST test set', long: '10,000: the number of images in the MNIST test set' },
  [6]: { short: 'ImageNet training set', long: 'about 1.3 million (1.3e6): ImageNet-1k training images; a small CNN also has around 1e6 parameters' },
  [8]: { short: 'GPT-2 small', long: 'about 1.24e8: the number of parameters in GPT-2 small' },
  [9]: { short: 'a “small” LLM', long: 'about 1e9: the parameter count of a small modern language model' },
}

const SUP: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
const pow10 = (n: number) => '10' + String(n).split('').map((c) => SUP[c] ?? c).join('')

/** Exact decimal string for (digits as integer) × 10^k, with thin-space-free commas for big numbers. */
function decimal(intDigits: number, k: number): string {
  let s = String(intDigits)
  if (k >= 0) {
    s = s + '0'.repeat(k)
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }
  const places = -k
  if (s.length <= places) s = '0'.repeat(places - s.length + 1) + s
  const whole = s.slice(0, s.length - places)
  const frac = s.slice(s.length - places).replace(/0+$/, '')
  return frac ? `${whole}.${frac}` : whole
}

/** mantissa (1 to 9.5, step 0.5) times 10^n as an exact decimal string */
function mantDecimal(mant: number, n: number) {
  const tenths = Math.round(mant * 10)
  return decimal(tenths, n - 1)
}
const mantStr = (m: number) => (Number.isInteger(m) ? String(m) : m.toFixed(1))

/** Faint glow behind the answer rung in multiply mode. */
function Glow({ y }: { y: number }) {
  const { xs, ys } = usePlot()
  return <rect x={xs(RAIL_L) - 10} y={ys(y) - 9} width={xs(RAIL_R) - xs(RAIL_L) + 20} height={18} rx={9} style={{ fill: 'color-mix(in srgb, var(--viz-3) 30%, transparent)' }} />
}

export default function PowerLadder() {
  const [mode, setMode] = useState<'read' | 'multiply'>('read')
  const [n, setN] = useState(-4)
  const [mant, setMant] = useState(3)
  const [a, setA] = useState(-4)
  const [b, setB] = useState(6)
  const [op, setOp] = useState<'times' | 'divide'>('times')

  const snapY = (y: number) => Math.max(LO, Math.min(HI, Math.round(y)))
  /** snap to a rung, but always move at least one rung once the pointer (or an arrow key) has moved a third of the way */
  const stepTo = (raw: number, cur: number) => {
    const r = snapY(raw)
    if (r === cur && Math.abs(raw - cur) > 0.33) return snapY(cur + Math.sign(raw - cur))
    return r
  }
  const s = op === 'times' ? a + b : a - b
  const sOnLadder = s >= LO && s <= HI
  const rungs = Array.from({ length: HI - LO + 1 }, (_, i) => LO + i)

  const highlighted = mode === 'read' ? [n] : [a, b]

  return (
    <Figure
      title="The powers-of-ten ladder"
      caption={
        mode === 'read' ? (
          <>
            Drag the orange marker up and down the ladder, and change the number in front. Each rung is ten times the one below it. Notice that{' '}
            <M>{'3 \\times 10^{-4}'}</M>, <code>3e-4</code> and <M>{'0.0003'}</M> are the same number written three ways, and that the exponent counts how many
            places the decimal point moves.
          </>
        ) : (
          <>
            Drag A and B. Multiplying powers of ten <b>adds</b> their exponents (one rung per factor of ten), so the green answer rung is just A’s rung moved by B’s
            exponent. Switch to ÷ and the exponents <b>subtract</b>. This is why ML people think in “orders of magnitude”.
          </>
        )
      }
    >
      <Segmented
        label="Mode"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'read', label: 'Read a number' },
          { value: 'multiply', label: 'Multiply two' },
        ]}
      />
      <Plot
        x={[0, 10]}
        y={[LO - 0.7, HI + 0.7]}
        width={480}
        height={480}
        minHeight={460}
        margin={{ left: 6, right: 6, top: 6, bottom: 6 }}
        ariaLabel={mode === 'read' ? `Ladder of powers of ten with the marker at 10 to the ${n}` : `Ladder of powers of ten: A at 10 to the ${a}, B at 10 to the ${b}, answer 10 to the ${s}`}
      >
        {/* rails and rungs */}
        <Path points={[[RAIL_L, LO - 0.5], [RAIL_L, HI + 0.5]]} color="var(--viz-axis)" width={3} />
        <Path points={[[RAIL_R, LO - 0.5], [RAIL_R, HI + 0.5]]} color="var(--viz-axis)" width={3} />
        {mode === 'multiply' && sOnLadder && <Glow y={s} />}
        {rungs.map((r) => {
          const on = highlighted.includes(r) || (mode === 'multiply' && r === s)
          const ml = ML[r]
          return (
            <g key={r}>
              <Path points={[[RAIL_L, r], [RAIL_R, r]]} color={r === 0 ? 'var(--viz-ink)' : 'var(--viz-muted)'} width={r === 0 ? 2.5 : 1.5} />
              <Label x={RAIL_R} y={r} dx={16} dy={4} color={on ? 'var(--viz-ink)' : 'var(--ink-3)'} weight={on ? 800 : 600} size={13}>
                {pow10(r)}
              </Label>
              {ml && (
                <Label x={RAIL_R} y={r} dx={58} dy={4} color={on ? 'var(--viz-ink)' : 'var(--ink-3)'} weight={on ? 700 : 500} size={12}>
                  {ml.short}
                </Label>
              )}
            </g>
          )
        })}

        {mode === 'read' ? (
          <DraggablePoint x={MID} y={n} lockX color="var(--viz-2)" r={9} constrain={(x, y) => [x, stepTo(y, n)]} onChange={(_, y) => setN(y)} />
        ) : (
          <>
            {s !== a && (
              <>
                <Arrow from={[ARROW_X, a]} to={[ARROW_X, sOnLadder ? s : s > HI ? HI + 0.5 : LO - 0.5]} color="var(--viz-3)" width={2.5} />
                <Label x={ARROW_X} y={(a + Math.max(LO, Math.min(HI, s))) / 2} dx={-6} dy={4} anchor="end" color="var(--viz-3)" size={13} weight={800}>
                  {`${s > a ? '+' : '−'}${Math.abs(s - a)}`}
                </Label>
              </>
            )}
            <DraggablePoint x={RAIL_L} y={a} lockX color="var(--viz-2)" r={8} label="A" constrain={(x, y) => [x, stepTo(y, a)]} onChange={(_, y) => setA(y)} />
            <DraggablePoint x={RAIL_R} y={b} lockX color="var(--viz-5)" r={8} label="" constrain={(x, y) => [x, stepTo(y, b)]} onChange={(_, y) => setB(y)} />
            <Label x={RAIL_R} y={b} dx={-14} dy={-10} anchor="end" color="var(--viz-5)" weight={800}>
              B
            </Label>
          </>
        )}
      </Plot>

      {mode === 'read' ? (
        <>
          <Controls>
            <Slider label="number in front" value={mant} min={1} max={9.5} step={0.5} onChange={setMant} format={mantStr} />
            <Slider label="exponent (rung)" value={n} min={LO} max={HI} step={1} onChange={setN} />
          </Controls>
          <Readout
            items={[
              ['power of ten', <M key="p">{`${mantStr(mant)} \\times 10^{${n}}`}</M>],
              ['e-notation (code)', `${mantStr(mant)}e${n}`],
              ['decimal', mantDecimal(mant, n)],
            ]}
          />
          <div style={{ width: '100%', fontSize: '0.9rem', color: 'var(--ink-2)', lineHeight: 1.5 }} aria-live="polite">
            {n === 0
              ? 'Exponent 0: the decimal point does not move.'
              : n > 0
                ? `Exponent ${n}: move the decimal point ${n} place${n > 1 ? 's' : ''} to the right (a big number).`
                : `Exponent ${n}: move the decimal point ${-n} place${n < -1 ? 's' : ''} to the left (a small number, but still positive).`}
            {ML[n] && (
              <>
                <br />
                <b>In ML:</b> {ML[n].long}
              </>
            )}
          </div>
        </>
      ) : (
        <>
          <Controls>
            <Segmented
              label="Operation"
              value={op}
              onChange={setOp}
              options={[
                { value: 'times', label: 'A × B' },
                { value: 'divide', label: 'A ÷ B' },
              ]}
            />
          </Controls>
          <div
            style={{ width: '100%', display: 'grid', gap: '0.3rem', padding: '0.6rem 0.8rem', border: '1px solid var(--rule)', borderRadius: 10, background: 'var(--surface-2)' }}
            aria-live="polite"
          >
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink-3)' }}>RULE CARD</div>
            <div>
              <M>{`10^{${a}} ${op === 'times' ? '\\times' : '\\div'} 10^{${b}}`}</M>
            </div>
            <div>
              <M>{`= 10^{${a} ${op === 'times' ? (b < 0 ? `+ (${b})` : `+ ${b}`) : b < 0 ? `- (${b})` : `- ${b}`}}`}</M>{' '}
              <span style={{ fontSize: '0.85rem', color: 'var(--viz-3)', fontWeight: 700 }}>
                {op === 'times' ? 'same base, multiplying: add the exponents' : 'same base, dividing: subtract the exponents'}
              </span>
            </div>
            <div>
              <M>{`= 10^{${s}}`}</M>
              {s < 0 && (
                <>
                  {' '}
                  <M>{`= \\dfrac{1}{10^{${-s}}}`}</M>{' '}
                  <span style={{ fontSize: '0.85rem', color: 'var(--ink-3)' }}>(a negative exponent means “one over”)</span>
                </>
              )}
            </div>
            <div>
              <M>{`= ${Math.abs(s) <= 12 ? decimal(1, s).replace(/,/g, '{,}') : `\\text{1e${s}}`}`}</M>
              {!sOnLadder && <span style={{ fontSize: '0.85rem', color: 'var(--ink-3)' }}> (off this ladder)</span>}
            </div>
          </div>
        </>
      )}
    </Figure>
  )
}
