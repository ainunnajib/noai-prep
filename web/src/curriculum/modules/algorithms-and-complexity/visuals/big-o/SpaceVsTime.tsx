import { useState } from 'react'
import { Figure, Segmented, CodeBlock, Readout, usePlayer, PlayerControls, M } from '../../../../../kit'
import s from './algo.module.css'

/*
  Two ways to answer "does this list contain a repeat?" on a list with NO repeat (the worst case).
  Comparing every pair: n(n-1)/2 comparisons, but only two index variables of extra memory.
  Remembering what you have seen in a set: n lookups, but the set grows to n items.
*/

const NUMS = [7, 3, 9, 1, 8, 4, 6, 2]
const N = NUMS.length

type Mode = 'pairs' | 'set'

const CODE: Record<Mode, string> = {
  pairs: `def has_repeat(nums):
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            if nums[i] == nums[j]:
                return True
    return False`,
  set: `def has_repeat(nums):
    seen = set()
    for x in nums:
        if x in seen:    # ~1 step
            return True
        seen.add(x)      # grows
    return False`,
}

const PAIRS: [number, number][] = []
for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) PAIRS.push([i, j])

const BIG = '1,000,000'

export default function SpaceVsTime() {
  const [mode, setMode] = useState<Mode>('pairs')
  const frames = mode === 'pairs' ? PAIRS.length + 1 : N + 1
  const player = usePlayer({ steps: frames, interval: mode === 'pairs' ? 450 : 800 })
  const st = Math.min(player.step, frames - 1)
  const done = st === frames - 1

  let time = 0
  let mem = 0
  let hi: number[] = []
  let lo: number[] = []
  let seen: number[] = []
  let line: number[] = []
  let status = ''

  if (mode === 'pairs') {
    time = done ? PAIRS.length : st + 1
    mem = 2
    if (!done) {
      const [i, j] = PAIRS[st]
      hi = [i]
      lo = [j]
      line = [5]
      status = `Compare nums[${i}] = ${NUMS[i]} with nums[${j}] = ${NUMS[j]}: not equal.`
    } else {
      line = [7]
      status = `Every pair checked, no repeat: return False after ${PAIRS.length} comparisons.`
    }
  } else {
    time = done ? N : st + 1
    seen = NUMS.slice(0, done ? N : st + 1)
    mem = seen.length
    if (!done) {
      hi = [st]
      line = [4, 6]
      status = `Is ${NUMS[st]} in seen? No, so add it. The set now holds ${st + 1} number${st ? 's' : ''}.`
    } else {
      line = [7]
      status = `Reached the end, no repeat: return False after ${N} lookups.`
    }
  }

  const cellStyle = (k: number) => {
    const c = hi.includes(k) ? 'var(--viz-1)' : lo.includes(k) ? 'var(--viz-2)' : null
    const passed = mode === 'set' && (done || k < st)
    return {
      borderColor: c ?? undefined,
      background: c ? `color-mix(in srgb, ${c} 22%, var(--surface))` : passed ? 'var(--surface-2)' : undefined,
      color: passed && !c ? 'var(--ink-3)' : undefined,
    }
  }

  return (
    <Figure
      title="Time or memory? Checking a list for repeats"
      caption={
        <>
          Both functions get the same 8 numbers with no repeat (the worst case: nothing ends the search early). Press Play for each method
          and compare the two counters. Comparing every pair is slow but needs only the two counters <code>i</code> and <code>j</code>.
          Remembering what you have seen is fast but stores up to <M>n</M> numbers. Neither is "best": you trade time for space.
        </>
      }
    >
      <div className={s.wrap}>
        <Segmented
          label="Method"
          value={mode}
          onChange={(m) => {
            setMode(m)
            player.reset()
          }}
          options={[
            { value: 'pairs', label: 'compare every pair' },
            { value: 'set', label: 'remember in a set' },
          ]}
        />
        <CodeBlock code={CODE[mode]} highlight={line} title={mode === 'pairs' ? 'compare every pair' : 'remember what you have seen'} />

        <div className={s.memRow}>
          <span className={s.cellLabel}>input nums</span>
          <div className={s.cells} aria-label="The input list">
            {NUMS.map((v, k) => (
              <span key={k} className={s.cell} style={cellStyle(k)}>
                {v}
              </span>
            ))}
          </div>
        </div>
        <div className={s.memRow}>
          <span className={s.cellLabel}>extra memory</span>
          <div className={s.cells} aria-label="Extra memory used">
            {mode === 'pairs' ? (
              <>
                <span className={s.cell} style={{ borderColor: 'var(--viz-1)', minWidth: '3.4rem' }}>
                  i = {done ? '–' : PAIRS[st][0]}
                </span>
                <span className={s.cell} style={{ borderColor: 'var(--viz-2)', minWidth: '3.4rem' }}>
                  j = {done ? '–' : PAIRS[st][1]}
                </span>
              </>
            ) : (
              Array.from({ length: N }, (_, k) => (
                <span
                  key={k}
                  className={s.cell}
                  style={
                    k < seen.length
                      ? { borderColor: 'var(--viz-3)', background: 'color-mix(in srgb, var(--viz-3) 20%, var(--surface))' }
                      : { borderStyle: 'dashed', color: 'transparent' }
                  }
                >
                  {k < seen.length ? seen[k] : '·'}
                </span>
              ))
            )}
          </div>
        </div>

        <div className={s.verdict} aria-live="polite">
          {status}
        </div>
        <Readout
          items={[
            [mode === 'pairs' ? 'time: comparisons' : 'time: lookups', String(time)],
            ['extra memory: values kept', String(mem)],
          ]}
        />
        <PlayerControls player={player} label={(k) => (k >= frames - 1 ? 'Done' : `Step ${k + 1} of ${frames - 1}`)} />

        <div className={s.summary}>
          <div className={s.summaryHead}>
            For <M>n</M> = {BIG} numbers:
          </div>
          <div className={s.summaryRow}>
            <b>compare every pair</b>
            <span>
              time <M>{'O(n^2)'}</M>, extra space <M>O(1)</M>
            </span>
            <span className={s.mono}>≈ 500 billion comparisons, 2 values kept</span>
          </div>
          <div className={s.summaryRow}>
            <b>remember in a set</b>
            <span>
              time <M>O(n)</M>, extra space <M>O(n)</M>
            </span>
            <span className={s.mono}>
              {BIG} lookups, up to {BIG} values kept
            </span>
          </div>
        </div>
      </div>
    </Figure>
  )
}
