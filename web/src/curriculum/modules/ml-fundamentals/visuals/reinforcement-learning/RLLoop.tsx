import { useState, type CSSProperties, type ReactNode } from 'react'
import { Figure, Segmented, usePlayer, PlayerControls, useNarrow } from '../../../../../kit'

/*
  The agent–environment loop, stepped through for four everyday examples.
  Step 0 observe the state, 1 act, 2 receive reward + next state, 3 learn. Then repeat.
*/

interface Scenario {
  label: string
  /** shorter label so the four examples fit on one row on a phone */
  short: string
  agent: string
  env: string
  state: string
  action: string
  reward: string
  next: string
  learn: string
  goal: string
}

const SCENARIOS: Record<string, Scenario> = {
  dog: {
    label: 'Dog training',
    short: 'Dog',
    agent: 'the dog',
    env: 'the owner and the room',
    state: 'The owner says "sit" and is holding a treat.',
    action: 'The dog sits.',
    reward: '+1: a treat.',
    next: 'The owner now says "roll over".',
    learn: 'Sitting when it hears "sit" becomes a little more likely next time.',
    goal: 'collect as many treats as possible',
  },
  game: {
    label: 'Video game',
    short: 'Game',
    agent: 'the game-playing program',
    env: 'the game',
    state: 'The screen: a ghost two squares to the left, a row of dots to the right.',
    action: 'Move right.',
    reward: '+10: it ate a dot.',
    next: 'A new screen: the ghost is now three squares away.',
    learn: 'Moving away from ghosts towards dots now looks more valuable.',
    goal: 'score as many points as possible before the game ends',
  },
  chess: {
    label: 'Chess',
    short: 'Chess',
    agent: 'the chess program',
    env: 'the board and the opponent',
    state: 'The board position after move 23.',
    action: 'Move the knight to f5.',
    reward: '0: the game is not over. The only reward comes at the very end: +1 for a win, −1 for a loss.',
    next: "The board after the opponent's reply.",
    learn: 'Only when the game ends does it find out whether moves like this one helped: the reward is delayed.',
    goal: 'win the game',
  },
  traffic: {
    label: 'Traffic lights',
    short: 'Traffic',
    agent: 'the traffic-light controller',
    env: 'the junction and its cars',
    state: '12 cars queuing north–south, 3 queuing east–west.',
    action: 'Turn north–south green for 30 seconds.',
    reward: '−11: 11 cars are still waiting (fewer waiting cars = less negative reward).',
    next: '2 cars queuing north–south, 9 queuing east–west.',
    learn: 'Giving green to the longer queue gets a higher value in situations like this.',
    goal: 'keep total waiting time as small as possible',
  },
}

const STEP_NAMES = ['1. Observe the state', '2. Choose an action', '3. Get a reward and the next state', '4. Learn']

function Arrow({ dir, active, children }: { dir: 'right' | 'left' | 'down' | 'up'; active: boolean; children: ReactNode }) {
  const c = active ? 'var(--accent)' : 'var(--viz-muted)'
  const horiz = dir === 'right' || dir === 'left'
  const path =
    dir === 'right'
      ? 'M2,8 H50 M42,2 L52,8 L42,14'
      : dir === 'left'
        ? 'M52,8 H4 M12,2 L2,8 L12,14'
        : dir === 'down'
          ? 'M8,2 V30 M2,22 L8,32 L14,22'
          : 'M8,32 V4 M2,12 L8,2 L14,12'
  return (
    <div style={{ display: 'flex', flexDirection: horiz ? 'column' : 'row', alignItems: 'center', gap: horiz ? 2 : 6, color: c, fontWeight: active ? 800 : 600, fontSize: '0.8125rem', transition: 'color 150ms' }}>
      <svg width={horiz ? 54 : 16} height={horiz ? 16 : 34} viewBox={horiz ? '0 0 54 16' : '0 0 16 34'} aria-hidden="true" style={{ flex: 'none' }}>
        <path d={path} style={{ fill: 'none', stroke: c, strokeWidth: active ? 3 : 2, strokeLinecap: 'round', strokeLinejoin: 'round' }} />
      </svg>
      <span style={{ whiteSpace: 'nowrap' }}>{children}</span>
    </div>
  )
}

function Box({ title, name, active, colour }: { title: string; name: string; active: boolean; colour: string }) {
  return (
    <div
      style={{
        border: `2px solid ${active ? colour : 'var(--rule)'}`,
        background: active ? `color-mix(in srgb, ${colour} 14%, var(--surface))` : 'var(--surface-2)',
        borderRadius: 12,
        padding: '0.6rem 0.75rem',
        textAlign: 'center',
        transition: 'all 150ms',
        minWidth: 0,
      }}
    >
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', color: active ? colour : 'var(--ink)' }}>{title}</div>
      <div style={{ fontSize: '0.8125rem', color: 'var(--ink-2)', lineHeight: 1.3 }}>{name}</div>
    </div>
  )
}

export default function RLLoop() {
  const [key, setKey] = useState('dog')
  const player = usePlayer({ steps: 4, interval: 2200, loop: true })
  const [ref, narrow] = useNarrow<HTMLDivElement>(500)
  const sc = SCENARIOS[key]
  const st = player.step

  const rows: [string, string, number[]][] = [
    ['State', sc.state, [0]],
    ['Action', sc.action, [1]],
    ['Reward', sc.reward, [2]],
    ['Next state', sc.next, [2]],
    ['Learning', sc.learn, [3]],
  ]
  const rowStyle = (on: boolean): CSSProperties => ({
    display: 'grid',
    gridTemplateColumns: '6.2em 1fr',
    gap: '0.6rem',
    padding: '0.35rem 0.55rem',
    borderRadius: 8,
    background: on ? 'var(--highlight-soft)' : 'transparent',
    color: on ? 'var(--highlight-ink)' : 'var(--ink-2)',
    fontSize: '0.875rem',
    lineHeight: 1.4,
    transition: 'background 150ms',
  })

  return (
    <Figure
      title="The reinforcement learning loop"
      caption={
        <>
          Pick an example and press Play (or step with Next). The <b>agent</b> sees a <b>state</b>, picks an <b>action</b>, and the{' '}
          <b>environment</b> answers with a <b>reward</b> and a new state. Nobody ever tells the agent the right action; it only learns which actions
          tend to lead to more total reward. Notice the chess reward: it arrives only when the game ends.
        </>
      }
    >
      <Segmented label="Example" value={key} onChange={(k) => {
          setKey(k)
          player.reset()
        }} options={Object.entries(SCENARIOS).map(([k, s]) => ({ value: k, label: narrow ? s.short : s.label }))} />
      <div
        ref={ref}
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: narrow ? '1fr' : 'minmax(0, 1fr) auto minmax(0, 1fr)',
          gap: narrow ? '0.4rem' : '0.75rem',
          alignItems: 'center',
          justifyItems: narrow ? 'stretch' : undefined,
        }}
      >
        <Box title="Agent" name={sc.agent} active={st === 0 || st === 1 || st === 3} colour="var(--viz-1)" />
        <div style={{ display: 'flex', flexDirection: narrow ? 'row' : 'column', justifyContent: 'center', alignItems: 'center', gap: narrow ? '1.1rem' : '0.5rem', flexWrap: 'wrap' }}>
          <Arrow dir={narrow ? 'down' : 'right'} active={st === 1}>
            action
          </Arrow>
          <Arrow dir={narrow ? 'up' : 'left'} active={st === 2}>
            reward
          </Arrow>
          <Arrow dir={narrow ? 'up' : 'left'} active={st === 0 || st === 2}>
            state
          </Arrow>
        </div>
        <Box title="Environment" name={sc.env} active={st === 2} colour="var(--viz-2)" />
      </div>
      <div style={{ width: '100%', display: 'grid', gap: '0.15rem' }}>
        <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--ink)', marginBottom: '0.2rem' }}>{STEP_NAMES[st]}</div>
        {rows.map(([k, v, on]) => (
          <div key={k} style={rowStyle(on.includes(st))}>
            <span style={{ fontWeight: 800 }}>{k}</span>
            <span>{v}</span>
          </div>
        ))}
        <div style={{ ...rowStyle(false), color: 'var(--ink-2)' }}>
          <span style={{ fontWeight: 800 }}>Goal</span>
          <span>Learn a policy (which action to take in each state) that will {sc.goal}.</span>
        </div>
      </div>
      <PlayerControls player={player} label={(s) => `Step ${s + 1} of 4`} />
    </Figure>
  )
}
