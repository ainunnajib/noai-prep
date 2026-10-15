import { useMemo, useState } from 'react'
import { Figure, Controls, Segmented, Button, Bars, PlayerControls, mulberry32, useBump } from '../../../../../kit'
import { useStepper } from './useStepper'
import s from './decode.module.css'

/*
  The decoding loop: get next-token probabilities → choose one token → append it → repeat.
  A toy language model that only looks at the last word (a real LLM looks at the whole context,
  but the loop is identical). Greedy always takes the top token and gets stuck in a loop;
  sampling picks at random in proportion to the probabilities.
*/

const MODEL: Record<string, [string, number][]> = {
  I: [
    ['like', 0.6],
    ['love', 0.4],
  ],
  like: [
    ['to', 0.7],
    ['chicken', 0.3],
  ],
  love: [
    ['to', 0.5],
    ['laksa', 0.5],
  ],
  to: [
    ['eat', 0.8],
    ['go', 0.2],
  ],
  eat: [
    ['chicken', 0.6],
    ['laksa', 0.4],
  ],
  go: [['home', 1]],
  home: [['.', 1]],
  chicken: [
    ['rice', 0.9],
    ['wings', 0.1],
  ],
  wings: [['and', 1]],
  rice: [
    ['and', 0.55],
    ['.', 0.45],
  ],
  laksa: [
    ['and', 0.5],
    ['.', 0.5],
  ],
  and: [
    ['I', 0.6],
    ['then', 0.4],
  ],
  then: [
    ['I', 0.5],
    ['we', 0.5],
  ],
  we: [['go', 1]],
}
const MAX = 18

function generate(mode: 'greedy' | 'sample', seed: number) {
  const rng = mulberry32(99 + seed * 7919)
  const toks = ['I']
  const choices: { dist: [string, number][]; pick: number }[] = []
  while (toks.length < MAX && toks[toks.length - 1] !== '.') {
    const dist = MODEL[toks[toks.length - 1]]
    let pick = 0
    if (mode === 'greedy') {
      dist.forEach((d, i) => d[1] > dist[pick][1] && (pick = i))
    } else {
      const u = rng()
      let c = 0
      pick = dist.length - 1
      for (let i = 0; i < dist.length; i++) {
        c += dist[i][1]
        if (u < c) {
          pick = i
          break
        }
      }
    }
    choices.push({ dist, pick })
    toks.push(dist[pick][0])
  }
  return { toks, choices }
}

/** index where a repeated 4-token phrase first starts again, or -1 */
function loopStart(toks: string[]) {
  for (let i = 4; i + 4 <= toks.length; i++) {
    const g = toks.slice(i, i + 4).join(' ')
    for (let j = 0; j < i; j++) if (toks.slice(j, j + 4).join(' ') === g) return i
  }
  return -1
}

export default function GenerationLoop() {
  const [mode, setMode] = useState<'greedy' | 'sample'>('greedy')
  const [seed, bump] = useBump()
  const gen = useMemo(() => generate(mode, seed), [mode, seed])
  const nSteps = gen.choices.length
  const player = useStepper({ steps: nSteps + 1, interval: 700 })
  const step = Math.min(player.step, nSteps)
  const shown = gen.toks.slice(0, step + 1)
  const loopAt = loopStart(gen.toks)
  const cur = step < nSteps ? gen.choices[step] : null
  const ended = gen.toks[gen.toks.length - 1] === '.'

  return (
    <Figure
      wide
      title="The decoding loop: predict, choose, append, repeat"
      caption={
        <>
          <b>Try:</b> step with <b>Back</b>/<b>Next</b>, then switch to <b>sampling</b> and press <b>New sample</b>. <b>Notice:</b> greedy always takes
          the top bar, so it repeats itself and here gets stuck in a loop. (A toy model that reads only the last word.)
        </>
      }
    >
      <div className={s.wrap}>
        <Controls>
          <Segmented
            label="choose the next token by"
            value={mode}
            onChange={(m) => {
              setMode(m)
              player.pause()
              player.setStep(generate(m, seed).choices.length)
            }}
            options={[
              { value: 'greedy', label: 'greedy (top token)' },
              { value: 'sample', label: 'sampling' },
            ]}
          />
          {mode === 'sample' && (
            <Button
              onClick={() => {
                bump()
                player.pause()
                player.setStep(generate('sample', seed + 1).choices.length)
              }}
            >
              New sample
            </Button>
          )}
        </Controls>

        <div className={s.prompt} aria-live="polite">
          {shown.map((t, i) => (
            <span key={i}>
              {i > 0 && t !== '.' ? ' ' : ''}
              {i === step && i > 0 ? <b>{t}</b> : <span style={{ color: loopAt >= 0 && i >= loopAt ? 'var(--viz-neg)' : 'var(--ink)' }}>{t}</span>}
            </span>
          ))}
          {step === nSteps && !ended && <span style={{ color: 'var(--ink-3)' }}> … (stopped after {nSteps} generated tokens)</span>}
        </div>

        {cur ? (
          <div style={{ width: '100%' }}>
            <div className={s.colTitle}>
              Step {step + 1}: after “{gen.toks[step]}”, the model's next-token probabilities
            </div>
            <Bars
              max={1}
              ariaLabel="Next-token probabilities at this step"
              data={cur.dist.map(([t, p], i) => ({ label: t, value: p, strong: i === cur.pick, color: i === cur.pick ? 'var(--viz-2)' : 'var(--viz-1)' }))}
            />
            <p className={s.note}>
              Chosen: <b>{cur.dist[cur.pick][0]}</b>
              {mode === 'greedy' ? ' (the most likely token)' : ` (drawn at random; it had probability ${cur.dist[cur.pick][1].toFixed(2)})`}. It is appended, and the loop
              runs again.
            </p>
          </div>
        ) : (
          <p className={s.note}>
            {ended ? (
              <>
                Generation finished: the model chose the end token “.” after {nSteps} steps.
              </>
            ) : (
              <>
                <b style={{ color: 'var(--viz-neg)' }}>Stuck in a loop:</b> the red words repeat a phrase already written. Greedy decoding will
                repeat it forever, so generation was cut off after {nSteps} generated tokens.
              </>
            )}{' '}
            Press <b>Restart</b> to watch it token by token.
          </p>
        )}

        <PlayerControls player={player} label={(i) => (i >= nSteps ? `Done: ${nSteps} tokens generated` : `Step ${i + 1} of ${nSteps}`)} />
      </div>
    </Figure>
  )
}
