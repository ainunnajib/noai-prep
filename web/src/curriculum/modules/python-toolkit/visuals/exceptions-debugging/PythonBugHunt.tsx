import { useState, type ReactNode } from 'react'
import { Figure, Segmented, Readout, Toggle } from '../../../../../kit'
import { CodeView, Console, MONO, type ConsoleLine } from '../references-mutability/pyviz'

/*
  Print debugging on a silent bug. average([4, 8, 6]) should be 6.0 but returns 4.666...
  Click lines to insert print probes and read the trace; then switch to "mark the bug"
  and click the faulty line. The off-by-one is range(1, len(nums)), which skips nums[0].
*/

const NUMS = [4, 8, 6]

const codeFor = (fixed: boolean) => `def average(nums):
    total = 0
    for i in range(${fixed ? '' : '1, '}len(nums)):
        total = total + nums[i]
    return total / len(nums)

print(average([4, 8, 6]))`

type Probe = 2 | 3 | 4 | 5
const PROBE_CODE: Record<Probe, string> = {
  2: '    print("total =", total)',
  3: '        print("i =", i)',
  4: '        print(i, total)  # i, total',
  5: '    print("before return:", total)',
}

const pyNum = (x: number) => (Number.isInteger(x) ? `${x}.0` : String(x))

function run(fixed: boolean, probes: Set<Probe>): { lines: ConsoleLine[]; result: number } {
  const lines: ConsoleLine[] = []
  let total = 0
  if (probes.has(2)) lines.push({ text: `total = ${total}`, tone: 'ok' })
  for (let i = fixed ? 0 : 1; i < NUMS.length; i++) {
    if (probes.has(3)) lines.push({ text: `i = ${i}`, tone: 'ok' })
    total = total + NUMS[i]
    if (probes.has(4)) lines.push({ text: `${i} ${total}`, tone: 'ok' })
  }
  if (probes.has(5)) lines.push({ text: `before return: ${total}`, tone: 'ok' })
  const result = total / NUMS.length
  lines.push({ text: pyNum(result) })
  return { lines, result }
}

const VERDICT: Record<number, string> = {
  1: 'The definition line only names the function and its parameter. Nothing is computed here.',
  2: 'Starting the running total at 0 is correct.',
  4: 'Adding nums[i] to the total is correct. The question is which values of i reach this line.',
  5: 'Dividing by len(nums) is right for an average of 3 numbers. The total it divides is what is too small.',
  6: 'A blank line cannot be wrong!',
  7: 'The call and the input are fine: the expected answer for [4, 8, 6] really is 18 / 3 = 6.0.',
}

export default function PythonBugHunt() {
  const [mode, setMode] = useState<'probe' | 'accuse'>('probe')
  const [probes, setProbes] = useState<Set<Probe>>(new Set([4]))
  const [accused, setAccused] = useState<number | null>(null)
  const [fixed, setFixed] = useState(false)
  const [hint, setHint] = useState<ReactNode>(null)

  const found = accused === 3
  const { lines, result } = run(fixed, probes)

  const click = (n: number) => {
    if (mode === 'probe') {
      if (n >= 2 && n <= 5) {
        const p = n as Probe
        const next = new Set(probes)
        if (next.has(p)) next.delete(p)
        else next.add(p)
        setProbes(next)
        setHint(null)
      } else setHint(<>Probes go inside the function: click line 2, 3, 4 or 5.</>)
    } else {
      setAccused(n)
      setHint(null)
    }
  }

  const inserts: Record<number, ReactNode> = {}
  const probeRow = (p: Probe) => (
    <div
      key={p}
      style={{
        display: 'flex',
        whiteSpace: 'pre',
        padding: '0 0.5rem 0 0.4rem',
        background: 'color-mix(in srgb, var(--viz-pos) 12%, var(--surface))',
        color: 'var(--viz-pos)',
        fontWeight: 600,
      }}
    >
      <span style={{ width: '1.6em', flex: 'none', textAlign: 'right', marginRight: '0.9em', marginLeft: '0.3em' }}>+</span>
      <span>{PROBE_CODE[p]}</span>
    </div>
  )
  for (const after of [2, 3, 4]) {
    const rows: ReactNode[] = []
    if (probes.has(after as Probe)) rows.push(probeRow(after as Probe))
    if (after === 4 && probes.has(5)) rows.push(probeRow(5))
    if (rows.length) inserts[after] = <>{rows}</>
  }

  const verdict =
    accused === null ? null : accused === 3 ? (
      <>
        <b style={{ color: 'var(--ok)' }}>Found it.</b> <code>range(1, len(nums))</code> gives i = 1, 2, so <code>nums[0]</code> (the 4) is never added: total is 8 + 6 = 14
        and 14 / 3 ≈ 4.67. This is an <b>off-by-one</b> error. The fix is <code>range(len(nums))</code>, which gives i = 0, 1, 2.
      </>
    ) : (
      <>
        <b style={{ color: 'var(--bad)' }}>Not line {accused}.</b> {VERDICT[accused]}
      </>
    )

  return (
    <Figure
      title="Bug hunt: why is the average wrong?"
      caption={
        <>
          The function runs without any error, yet prints the wrong answer. Click lines to add or remove <code>print</code> probes (green) and read the trace: which values of{' '}
          <code>i</code> appear? Then switch to <b>Mark the bug</b> and click the line you blame. Once found, apply the fix and check the probes again.
        </>
      }
    >
      <Segmented
        label="Click a line to"
        value={mode}
        onChange={(m) => {
          setMode(m)
          setHint(null)
        }}
        options={[
          { value: 'probe', label: 'add a print probe' },
          { value: 'accuse', label: 'mark the bug' },
        ]}
      />
      <div style={{ width: '100%', display: 'grid', gap: 12, alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 6, minWidth: 0 }}>
          <CodeView
            code={codeFor(fixed)}
            onLineClick={click}
            lineLabel={(n) => (mode === 'probe' ? (n === 5 ? 'Toggle a print probe before line 5 (the return)' : `Toggle a print probe after line ${n}`) : `Mark line ${n} as the bug`)}
            active={mode === 'accuse' && accused !== null ? [accused] : fixed ? [3] : []}
            activeTone={mode === 'accuse' && accused !== null ? (found ? 'ok' : 'bad') : 'ok'}
            inserts={inserts}
            fitChars={Math.max(33, ...[...probes].map((p) => PROBE_CODE[p].length))}
          />
          <div style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>
            {mode === 'probe' ? 'Probe mode: click lines 2 to 5 to add or remove a print (line 5 puts it just before the return).' : 'Bug-marking mode: click the line you think is wrong.'}
          </div>
        </div>
        <div style={{ display: 'grid', gap: 8, minWidth: 0 }}>
          <Console lines={lines} title="output (probe lines in green)" minLines={4} />
          <Readout
            items={[
              ['expected', '6.0'],
              ['got', <span style={{ color: Math.abs(result - 6) < 1e-9 ? 'var(--ok)' : 'var(--bad)', fontFamily: MONO }}>{pyNum(result)}</span>],
            ]}
          />
        </div>
      </div>
      {(hint || verdict) && (
        <div style={{ width: '100%', fontSize: 14.5, lineHeight: 1.5, background: 'var(--surface-2)', borderRadius: 8, padding: '0.5rem 0.7rem' }}>{hint ?? verdict}</div>
      )}
      {found && <Toggle label={<>Apply the fix: <code>range(len(nums))</code></>} checked={fixed} onChange={setFixed} />}
    </Figure>
  )
}
