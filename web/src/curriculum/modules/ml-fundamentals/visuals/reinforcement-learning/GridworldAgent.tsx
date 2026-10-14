import { useEffect, useReducer, useRef, useState, type CSSProperties } from 'react'
import { Figure, Controls, Readout, Slider, Toggle, Button, Segmented, useContainerWidth } from '../../../../../kit'
import {
  ROWS,
  COLS,
  N_STATES,
  MOVES,
  START,
  MAX_STEPS,
  EPS_ON,
  ALPHA,
  GAMMA,
  tile,
  isTerminal,
  newAgent,
  step,
  runEpisodes,
  bestAction,
  maxQ,
  type Agent,
  type Outcome,
} from './gridworld'

/*
  A Q-learning agent in a 5 × 4 maze. Each tile is a state; the four moves are the actions.
  Reaching the goal or the pit ends the episode with that tile's reward; every other move gives 0.
  Tile colour = the value of the tile (best Q), arrow = the policy (best known move).
*/

const MOVE_NAMES = ['up', 'right', 'down', 'left']
const OUT_LABEL: Record<Outcome, string> = { G: 'goal', P: 'pit', T: 'gave up after 40 moves' }
const OUT_COLOUR: Record<Outcome, string> = { G: 'var(--viz-pos)', P: 'var(--viz-neg)', T: 'var(--viz-muted)' }
const OPEN_TILES = Array.from({ length: N_STATES }, (_, s) => s).filter((s) => tile(s) !== '#' && !isTerminal(s)).length

const fmtR = (v: number) => (v > 0 ? `+${v}` : v < 0 ? `−${-v}` : '0')

/** The figure opens part-way through learning, so the first frame already shows values leaking back from the goal. */
const PRE_EPISODES = 15
function startingAgent(): Agent {
  const a = newAgent(7)
  runEpisodes(a, PRE_EPISODES, EPS_ON, { G: 10, P: -10 })
  return a
}

export default function GridworldAgent() {
  const [seed, setSeed] = useState(7)
  const agRef = useRef<Agent | null>(null)
  if (agRef.current === null) agRef.current = startingAgent()
  const [, force] = useReducer((x: number) => x + 1, 0)
  const [playing, setPlaying] = useState(false)
  const [fast, setFast] = useState<'watch' | 'fast'>('watch')
  const [explore, setExplore] = useState(true)
  const [showValues, setShowValues] = useState(true)
  const [goalR, setGoalR] = useState(10)
  const [pitR, setPitR] = useState(-10)
  const [wrapRef, width] = useContainerWidth<HTMLDivElement>(420)

  const eps = explore ? EPS_ON : 0
  const R = { G: goalR, P: pitR }
  const ag = agRef.current!

  useEffect(() => {
    if (!playing) return
    const id = window.setInterval(
      () => {
        const n = fast === 'fast' ? 6 : 1
        for (let k = 0; k < n; k++) step(agRef.current!, eps, { G: goalR, P: pitR })
        force()
      },
      fast === 'fast' ? 40 : 160,
    )
    return () => window.clearInterval(id)
  }, [playing, fast, eps, goalR, pitR])

  const restart = (newSeed = seed) => {
    agRef.current = newAgent(newSeed)
    force()
  }
  const changeReward = (which: 'G' | 'P', v: number) => {
    if (which === 'G') setGoalR(v)
    else setPitR(v)
    restart()
  }

  const cell = Math.max(52, Math.min(84, Math.floor(Math.min(width, 460) / COLS)))
  const W = cell * COLS
  const H = cell * ROWS
  const scale = Math.max(1, Math.abs(goalR), Math.abs(pitR))
  const planned = Array.from({ length: N_STATES }, (_, s) => s).filter((s) => tile(s) !== '#' && !isTerminal(s) && bestAction(ag.Q, s) >= 0).length
  const last = ag.outcomes[ag.outcomes.length - 1]
  const recent = ag.outcomes.slice(-30)
  const agentR = ag.pos
  const ax = (agentR % COLS) * cell + cell / 2
  const ay = Math.floor(agentR / COLS) * cell + cell / 2

  const tileFill = (s: number): string => {
    const t = tile(s)
    if (t === '#') return 'color-mix(in srgb, var(--ink-3) 45%, var(--surface))'
    if (t === 'G' || t === 'P') {
      const v = t === 'G' ? goalR : pitR
      const c = v >= 0 ? 'var(--viz-pos)' : 'var(--viz-neg)'
      return `color-mix(in srgb, ${c} 42%, var(--surface))`
    }
    const v = maxQ(ag.Q, s)
    if (Math.abs(v) < 1e-9) return 'var(--surface)'
    const p = Math.round(8 + 40 * Math.min(1, Math.abs(v) / scale))
    return `color-mix(in srgb, ${v > 0 ? 'var(--viz-pos)' : 'var(--viz-neg)'} ${p}%, var(--surface))`
  }

  let status: string
  if (ag.episode === 0 && ag.t === 0) status = 'Episode 1 has not started. The agent knows nothing yet: every move looks equally good.'
  else if (ag.t === 0 && ag.episode === PRE_EPISODES && seed === 7 && goalR === 10 && pitR === -10)
    status = `${PRE_EPISODES} episodes played so far: the goal's value has started to leak back towards the start. Press Play to keep going, or Reset to start from scratch.`
  else if (ag.t === 0) status = `Episode ${ag.episode} ended at the ${OUT_LABEL[last ?? 'T']} (total reward ${fmtR(ag.lastReturn)}). The agent is back at the start.`
  else
    status = `Episode ${ag.episode + 1}, move ${ag.t}: went ${MOVE_NAMES[ag.lastAction]} (${ag.lastExplored ? 'a random move: exploring' : 'its best known move: exploiting'}).`

  const label: CSSProperties = { fontSize: Math.round(cell * 0.2), fontWeight: 800 }

  return (
    <Figure
      title="Watch an agent learn a maze from rewards alone"
      caption={
        <>
          Press Play. Each tile is a <b>state</b>, each move an <b>action</b>; only the goal and the pit give a <b>reward</b>, and either one
          ends the episode. Nobody tells the agent the way: the value of the goal leaks backwards one tile at a time (tile colour and number =
          value; arrow = best known move, the <b>policy</b>). Then switch exploration off and reset, or make the pit worth +10, and see what the
          agent learns instead. Learning rate α = {ALPHA}, discount γ = {GAMMA}.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', justifyItems: 'center' }}>
        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`Maze after ${ag.episode} episodes. The agent is in row ${Math.floor(agentR / COLS) + 1}, column ${(agentR % COLS) + 1}. ${planned} of ${OPEN_TILES} tiles have a learned best move.`}
          style={{ maxWidth: '100%', height: 'auto', display: 'block', fontFamily: 'var(--font-body)' }}
        >
          {Array.from({ length: N_STATES }, (_, s) => {
            const x = (s % COLS) * cell
            const y = Math.floor(s / COLS) * cell
            const t = tile(s)
            const a = isTerminal(s) || t === '#' ? -1 : bestAction(ag.Q, s)
            const v = maxQ(ag.Q, s)
            const cx = x + cell / 2
            const cy = y + cell / 2
            const L = cell * 0.27
            return (
              <g key={s}>
                <rect x={x + 1.5} y={y + 1.5} width={cell - 3} height={cell - 3} rx={7} style={{ fill: tileFill(s), stroke: 'var(--viz-grid)', strokeWidth: 1.5 }} />
                {t === 'S' && (
                  <text x={x + 6} y={y + 14} style={{ fontSize: 11, fontWeight: 700, fill: 'var(--ink-3)' }}>
                    start
                  </text>
                )}
                {(t === 'G' || t === 'P') && (
                  <>
                    <text x={cx} y={cy - 2} textAnchor="middle" style={{ ...label, fill: 'var(--ink)' }}>
                      {fmtR(t === 'G' ? goalR : pitR)}
                    </text>
                    <text x={cx} y={cy + cell * 0.22} textAnchor="middle" style={{ fontSize: 11, fontWeight: 700, fill: 'var(--ink-2)' }}>
                      {t === 'G' ? 'goal' : 'pit'}
                    </text>
                  </>
                )}
                {a >= 0 && (
                  <g style={{ stroke: 'var(--viz-ink)', fill: 'var(--viz-ink)', opacity: 0.85 }}>
                    <line x1={cx - MOVES[a][1] * L * 0.55} y1={cy - MOVES[a][0] * L * 0.55} x2={cx + MOVES[a][1] * L * 0.55} y2={cy + MOVES[a][0] * L * 0.55} strokeWidth={2.4} strokeLinecap="round" />
                    <path
                      d={(() => {
                        const tx = cx + MOVES[a][1] * L
                        const ty = cy + MOVES[a][0] * L
                        const px = -MOVES[a][0] * L * 0.42
                        const py = MOVES[a][1] * L * 0.42
                        const bx = cx + MOVES[a][1] * L * 0.4
                        const by = cy + MOVES[a][0] * L * 0.4
                        return `M${tx},${ty}L${bx + px},${by + py}L${bx - px},${by - py}Z`
                      })()}
                      style={{ stroke: 'none' }}
                    />
                  </g>
                )}
                {showValues && t !== '#' && !isTerminal(s) && Math.abs(v) > 1e-9 && (
                  <text x={x + cell - 6} y={y + cell - 6} textAnchor="end" style={{ fontSize: 11, fontWeight: 700, fill: 'var(--ink-2)', fontVariantNumeric: 'tabular-nums' }}>
                    {v.toFixed(1)}
                  </text>
                )}
              </g>
            )
          })}
          <g style={{ transform: `translate(${ax}px, ${ay}px)`, transition: playing && fast === 'fast' ? 'none' : 'transform 120ms ease-out' }}>
            <circle r={cell * 0.2} style={{ fill: 'var(--viz-1)', stroke: 'var(--surface)', strokeWidth: 3 }} />
            <circle cx={-cell * 0.06} cy={-cell * 0.04} r={cell * 0.035} style={{ fill: 'var(--surface)' }} />
            <circle cx={cell * 0.06} cy={-cell * 0.04} r={cell * 0.035} style={{ fill: 'var(--surface)' }} />
          </g>
        </svg>
      </div>
      <div style={{ width: '100%', fontSize: '0.875rem', color: 'var(--ink-2)', minHeight: '2.6em' }}>{status}</div>
      <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.35rem 0.6rem', fontSize: '0.8125rem', color: 'var(--ink-3)' }}>
        <span>Last 30 episodes:</span>
        <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 3 }} aria-label={`Recent outcomes: ${recent.map((o) => OUT_LABEL[o]).join(', ') || 'none yet'}`}>
          {recent.length === 0 && <span>none yet</span>}
          {recent.map((o, i) => (
            <span key={i} title={OUT_LABEL[o]} style={{ width: 10, height: 14, borderRadius: 2, background: OUT_COLOUR[o], display: 'inline-block' }} />
          ))}
        </span>
        <span style={{ display: 'inline-flex', gap: '0.6rem' }}>
          <span style={{ color: 'var(--viz-pos)', fontWeight: 700 }}>■ goal</span>
          <span style={{ color: 'var(--viz-neg)', fontWeight: 700 }}>■ pit</span>
          <span style={{ color: 'var(--viz-muted)', fontWeight: 700 }}>■ gave up</span>
        </span>
      </div>
      <Controls>
        <Button primary onClick={() => setPlaying((p) => !p)}>
          {playing ? 'Pause' : 'Play'}
        </Button>
        <Button
          onClick={() => {
            step(agRef.current!, eps, R)
            force()
          }}
        >
          One move
        </Button>
        <Button
          onClick={() => {
            runEpisodes(agRef.current!, 10, eps, R)
            force()
          }}
        >
          +10 episodes
        </Button>
        <Button
          onClick={() => {
            const s = seed + 1
            setSeed(s)
            restart(s)
          }}
        >
          Reset
        </Button>
        <Segmented
          label="Speed"
          value={fast}
          onChange={setFast}
          options={[
            { value: 'watch', label: 'watch' },
            { value: 'fast', label: 'fast' },
          ]}
        />
      </Controls>
      <Controls>
        <Toggle label={`Exploration (ε = ${EPS_ON})`} checked={explore} onChange={setExplore} />
        <Toggle label="Show values" checked={showValues} onChange={setShowValues} />
      </Controls>
      <Controls>
        <Slider label="goal reward" value={goalR} min={1} max={20} step={1} onChange={(v) => changeReward('G', v)} format={fmtR} />
        <Slider label="pit reward" value={pitR} min={-20} max={20} step={1} onChange={(v) => changeReward('P', v)} format={fmtR} />
      </Controls>
      <Readout
        items={[
          ['episodes', String(ag.episode)],
          ['value of start', maxQ(ag.Q, START).toFixed(2)],
          ['tiles with a plan', `${planned} / ${OPEN_TILES}`],
          ['max moves per episode', String(MAX_STEPS)],
        ]}
      />
    </Figure>
  )
}
