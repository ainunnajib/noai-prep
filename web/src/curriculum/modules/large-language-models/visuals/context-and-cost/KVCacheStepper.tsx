import { useState } from 'react'
import { Figure, Controls, Toggle, PlayerControls, Plot, Grid, Axes, FnPath, Dots, VLine, Label, mulberry32, hashString } from '../../../../../kit'
import { useStepper } from './useStepper'
import s from './ctx.module.css'

/*
  The KV cache. To generate each new token, the new token's query q must be compared with the keys K
  of every token so far, and the values V are then averaged. Because of the causal mask, earlier
  tokens never attend to later ones, so their keys and values never change: compute them once, store
  them (the KV cache), and each pass only computes q, k, v for the newest token.
  Without the cache, every pass pushes the whole text through the model again.
  Vectors are tiny (4 numbers) random illustrations; one layer and one head are shown.
*/

const PROMPT = ['The', 'MRT', 'is']
const GEN = ['packed', 'every', 'morning', '.']
const D = 4

function vec(tag: string): number[] {
  const r = mulberry32(hashString(tag))
  return Array.from({ length: D }, () => Math.round((r() * 2 - 1) * 100) / 100)
}

/** Neutral grey ramp (light = low, dark = high), so that orange and blue mean only "computed now" and "cached". */
function cellColour(v: number) {
  const t = (Math.max(-1, Math.min(1, v)) + 1) / 2
  return `color-mix(in srgb, var(--ink-2) ${Math.round(10 + t * 60)}%, var(--surface))`
}

function Vec({ v, cls, label }: { v: number[]; cls?: string; label: string }) {
  return (
    <span className={`${s.vec} ${cls ?? ''}`} role="img" aria-label={`${label}: ${v.join(', ')}`}>
      {v.map((x, i) => (
        <span key={i} className={s.cell} style={{ background: cellColour(x) }} />
      ))}
    </span>
  )
}

const P = PROMPT.length
const workNoCache = (n: number) => n * P + (n * (n - 1)) / 2 // passes 1..n each process P + (i − 1) tokens
const workCache = (n: number) => P + n - 1 // prompt once, then one token per pass

export default function KVCacheStepper() {
  const [cache, setCache] = useState(true)
  const player = useStepper({ steps: GEN.length, interval: 1400 })
  const pass = player.step + 1 // 1..4
  const toks = [...PROMPT, ...GEN.slice(0, pass - 1)] // input positions at this pass
  const newestFrom = pass === 1 ? 0 : toks.length - 1 // rows whose K, V are computed for the first time
  const K = toks.map((t, i) => vec(`k${t}${i}`))
  const V = toks.map((t, i) => vec(`v${t}${i}`))
  const q = vec(`q${toks[toks.length - 1]}${toks.length - 1}`)
  const scores = K.map((k) => k.reduce((a, b, j) => a + b * q[j], 0) / Math.sqrt(D))
  const m = Math.max(...scores)
  const e = scores.map((x) => Math.exp(x - m))
  const Z = e.reduce((a, b) => a + b, 0)
  const w = e.map((x) => x / Z)
  const rowsNow = cache ? toks.length - newestFrom : toks.length

  return (
    <Figure
      wide
      title="The KV cache: compute keys and values once, reuse them"
      caption={
        <>
          <b>Try:</b> press <b>Next</b> to generate each token, then switch the cache off. <b>Notice:</b> with the cache only the row tagged{' '}
          <b>new</b> (orange) is computed and the rows tagged <b>cached</b> (blue) are reused, so the work grows in a straight line, not a curve.
        </>
      }
    >
      <div className={s.wrap}>
        <Controls>
          <Toggle label="use the KV cache" checked={cache} onChange={setCache} />
        </Controls>

        <div className={s.output} aria-live="polite">
          <b>Pass {pass}:</b> input {cache && pass > 1 ? <>only “{toks[toks.length - 1]}” (the rest is cached)</> : <>“{toks.join(' ')}”</>} → model outputs{' '}
          <span className={s.gen}>{GEN[pass - 1] === '.' ? '“.”' : GEN[pass - 1]}</span>
        </div>

        <PlayerControls player={player} label={(i) => `Pass ${i + 1} of ${GEN.length}`} />

        <div className={s.twoCols}>
          <div>
            <div className={s.kv}>
              <span className={s.kvHead}>token</span>
              <span className={s.kvHead}>key k</span>
              <span className={s.kvHead}>value v</span>
              <span className={s.kvHead}>weight from q</span>
              {toks.map((t, i) => {
                const fresh = !cache || i >= newestFrom
                const cls = fresh ? s.vecNew : s.vecCached
                return (
                  <div key={`${t}${i}`} style={{ display: 'contents' }}>
                    <span className={`${s.kvTok} ${fresh ? s.kvTokNew : s.kvTokCached}`}>
                      {t}
                      <span className={`${s.tag} ${fresh ? s.tagNew : s.tagCache}`}>{fresh ? (cache ? 'new' : 'redo') : 'cached'}</span>
                    </span>
                    <Vec v={K[i]} cls={cls} label={`key of ${t}`} />
                    <Vec v={V[i]} cls={cls} label={`value of ${t}`} />
                    <span className={s.wbar}>
                      <span className={s.wtrack}>
                        <span className={s.wfill} style={{ width: `${w[i] * 100}%` }} />
                      </span>
                      <span className={s.wval}>{w[i].toFixed(2)}</span>
                    </span>
                  </div>
                )
              })}
              <span className={s.kvTok} style={{ color: 'var(--ink-2)' }}>
                q of “{toks[toks.length - 1]}”
              </span>
              <Vec v={q} cls={s.vecNew} label="query of the newest token" />
              <span className={s.kvHead} style={{ gridColumn: 'span 2', textTransform: 'none', letterSpacing: 0 }}>
                ← used once, never stored
              </span>
            </div>
          </div>

          <div>
            <p className={s.subhead}>Token positions pushed through the model, in total</p>
            <Plot x={[1, 8]} y={[0, 56]} width={300} height={190} minHeight={170} margin={{ left: 36, right: 12, top: 12 }} ariaLabel="Total work without the cache grows quadratically with the number of generated tokens; with the cache it grows linearly">
              <Grid xTicks={7} yTicks={4} />
              <Axes xLabel="tokens generated" xTicks={7} yTicks={4} />
              <VLine x={pass} color="var(--viz-muted)" />
              <FnPath f={workNoCache} color="var(--viz-2)" width={2.6} />
              <FnPath f={workCache} color="var(--viz-1)" width={2.6} />
              <Dots
                points={[
                  { x: pass, y: workNoCache(pass), color: 'var(--viz-2)', r: cache ? 4.5 : 6.5 },
                  { x: pass, y: workCache(pass), color: 'var(--viz-1)', r: cache ? 6.5 : 4.5 },
                ]}
              />
              <Label x={pass} y={workNoCache(pass)} dx={8} dy={-6} size={12} weight={800}>
                {workNoCache(pass)}
              </Label>
              <Label x={pass} y={workCache(pass)} dx={8} dy={-6} size={12} weight={800}>
                {workCache(pass)}
              </Label>
            </Plot>
            <div className={s.legend}>
              <span>
                <i className={s.swatch} style={{ background: 'var(--viz-2)' }} /> no cache
              </span>
              <span>
                <i className={s.swatch} style={{ background: 'var(--viz-1)' }} /> with cache
              </span>
            </div>
          </div>
        </div>

        <div className={s.counter}>
          <div className={`${s.count} ${cache ? '' : s.countOn}`}>
            no cache: positions processed so far
            <strong>{workNoCache(pass)}</strong>
          </div>
          <div className={`${s.count} ${cache ? s.countOn : ''}`}>
            with cache: positions processed so far
            <strong>{workCache(pass)}</strong>
          </div>
        </div>
        <p className={s.note}>
          This pass computes <b>{rowsNow}</b> new k, v row{rowsNow === 1 ? '' : 's'}. {cache ? 'Memory held in the cache' : 'Memory needed for k, v'}:{' '}
          <b>{toks.length}</b> rows × 2 vectors × {D} numbers = <b>{toks.length * 2 * D}</b> numbers, per layer (and per head). It grows by one row
          per generated token.
        </p>
      </div>
    </Figure>
  )
}
