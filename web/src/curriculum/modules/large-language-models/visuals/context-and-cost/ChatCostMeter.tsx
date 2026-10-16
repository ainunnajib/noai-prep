import { useState } from 'react'
import { Figure, Controls, Slider, Segmented, Readout, Plot, Grid, Axes, Rect, HLine, Path, Dots } from '../../../../../kit'
import s from './ctx.module.css'

/*
  Why long chats get expensive. The model keeps no memory between calls, so a chat app sends the whole
  history as input on every turn. Turn k's input = all earlier messages + the new one, so the input
  per turn grows linearly and the total billed input grows like the square of the number of turns.
  Alternative strategy: send a fixed-size summary of the history plus only the latest exchange.
  Prices and speeds are illustrative assumptions, stated on screen.
*/

const PRICE_IN = 1 // $ per million input tokens (illustrative)
const PRICE_OUT = 4 // $ per million output tokens (illustrative)
const READ_SPEED = 5000 // prompt tokens read per second (prefill), illustrative
const WRITE_SPEED = 50 // output tokens written per second (decode), illustrative
const WINDOW = 8192
const SUMMARY = 300

type Strategy = 'all' | 'summary'

/** Tokens the app would like to send on each turn (before any truncation to the window). */
function turnWanted(turns: number, u: number, r: number, strat: Strategy) {
  return Array.from({ length: turns }, (_, i) => {
    const k = i + 1
    if (strat === 'all') return (k - 1) * (u + r) + u
    return k === 1 ? u : Math.min((k - 1) * (u + r), SUMMARY + u + r) + u
  })
}

const fmt = (v: number) => Math.round(v).toLocaleString('en-GB')

export default function ChatCostMeter() {
  const [turns, setTurns] = useState(24)
  const [u, setU] = useState(100)
  const [r, setR] = useState(300)
  const [strat, setStrat] = useState<Strategy>('all')
  const wanted = turnWanted(turns, u, r, strat)
  const room = WINDOW - r // the reply must fit in the window too
  const inputs = wanted.map((x) => Math.min(x, room)) // anything longer is cut to fit
  const totalIn = inputs.reduce((a, b) => a + b, 0)
  const totalOut = turns * r
  const costPer1000 = ((totalIn * PRICE_IN + totalOut * PRICE_OUT) / 1e6) * 1000
  const last = inputs[inputs.length - 1]
  const ttft = last / READ_SPEED
  const replyTime = r / WRITE_SPEED
  const overflowTurn = wanted.findIndex((x) => x > room)
  const yMax = WINDOW * 1.15
  let cum = 0
  const cumPts: [number, number][] = inputs.map((x, i) => {
    cum += x
    return [i + 1, cum]
  })

  return (
    <Figure
      wide
      title="Why long chats cost more: the whole history is input, every turn"
      caption={
        <>
          <b>Try:</b> add turns, then switch to <b>summary + last exchange</b>. <b>Notice:</b> each turn re-sends the whole history, so the total bill
          grows like the square of the number of turns, and old messages are cut once the window is full (red bars).
        </>
      }
    >
      <div className={s.wrap}>
        <Controls>
          <Slider label="turns in the chat" value={turns} min={1} max={30} step={1} onChange={setTurns} />
          <Slider label="tokens per question" value={u} min={20} max={400} step={10} onChange={setU} />
          <Slider label="tokens per reply" value={r} min={20} max={800} step={10} onChange={setR} />
          <Segmented
            label="history sent each turn"
            value={strat}
            onChange={setStrat}
            options={[
              { value: 'all', label: 'everything' },
              { value: 'summary', label: 'summary + last exchange' },
            ]}
          />
        </Controls>

        <div style={{ width: '100%' }}>
          <p className={s.subhead}>Input tokens sent on each turn</p>
          <Plot x={[0.4, turns + 0.6]} y={[0, yMax]} width={560} height={240} minHeight={220} margin={{ left: 46, right: 12, top: 16 }} ariaLabel="Bar chart of input tokens per turn, with the context window limit">
            <Grid xTicks={6} yTicks={5} />
            <Axes xLabel="turn" xTicks={Math.min(turns, 10)} yTicks={5} tickFormat={(v) => (v >= 1000 ? `${+(v / 1000).toFixed(1)}k` : String(v))} />
            {inputs.map((x, i) => (
              <Rect
                key={i}
                x0={i + 1 - 0.36}
                x1={i + 1 + 0.36}
                y0={0}
                y1={x}
                rx={2}
                fill={wanted[i] > room ? 'var(--viz-neg)' : strat === 'all' ? 'var(--viz-1)' : 'var(--viz-3)'}
              />
            ))}
            <HLine y={room} color="var(--viz-2)" dash="6 4" width={2} label={`context window minus reply = ${fmt(room)}`} />
          </Plot>
        </div>

        <div style={{ width: '100%' }}>
          <p className={s.subhead}>Total input tokens billed so far (running sum)</p>
          <Plot x={[0.4, turns + 0.6]} y={[0, Math.max(1000, cum * 1.1)]} width={560} height={160} minHeight={150} margin={{ left: 46, right: 12, top: 10 }} ariaLabel="Running total of billed input tokens">
            <Grid xTicks={6} yTicks={3} />
            <Axes xLabel="turn" xTicks={Math.min(turns, 10)} yTicks={3} tickFormat={(v) => (v >= 1e6 ? `${+(v / 1e6).toFixed(1)}M` : v >= 1000 ? `${+(v / 1000).toFixed(0)}k` : String(v))} />
            <Path points={[[0.4, 0], ...cumPts]} color="var(--viz-4)" width={2.6} />
            <Dots points={[{ x: turns, y: cum, color: 'var(--viz-4)', r: 5 }]} />
          </Plot>
        </div>

        <Readout
          items={[
            ['input billed', `${fmt(totalIn)} tokens`],
            ['output', `${fmt(totalOut)} tokens`],
            ['cost per 1,000 chats', `$${costPer1000.toFixed(2)}`],
          ]}
        />
        <Readout
          items={[
            ['last turn: wait before the first word', `${ttft.toFixed(2)} s`],
            ['then writing the reply', `${replyTime.toFixed(1)} s`],
          ]}
        />
        <p className={s.note}>
          {overflowTurn >= 0 ? (
            <>
              From turn <b>{overflowTurn + 1}</b> the history plus the reply no longer fit in the {fmt(WINDOW)}-token window (red bars): the app must cut
              the oldest messages, so the model forgets the start of the chat.{' '}
            </>
          ) : null}
          Assumptions: ${PRICE_IN} per million input tokens, ${PRICE_OUT} per million output tokens; the model reads {fmt(READ_SPEED)} prompt tokens/s and
          writes {WRITE_SPEED} tokens/s; the summary is {SUMMARY} tokens. Prices and speeds are illustrative and change often.
        </p>
      </div>
    </Figure>
  )
}
