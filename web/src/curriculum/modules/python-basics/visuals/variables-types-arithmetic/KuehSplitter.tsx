import { useEffect, useState } from 'react'
import { Figure, Controls, Slider, Button, M } from '../../../../../kit'
import { floatRepr } from './miniPython'
import s from './kueh.module.css'

/*
  Deal kueh to friends one round at a time. Full rounds dealt = a // b; what is left in the
  box (fewer than one per friend) = a % b. So a = (a // b) * b + a % b.
*/

function Kueh({ fresh }: { fresh?: boolean }) {
  return <span className={`${s.kueh} ${fresh ? s.fresh : ''}`} aria-hidden="true" />
}

export default function KuehSplitter() {
  const [a, setA] = useState(7)
  const [b, setB] = useState(2)
  const q = Math.floor(a / b)
  const r = a % b
  const total = q * b
  const [dealt, setDealt] = useState(total)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    setDealt(q * b)
    setPlaying(false)
  }, [a, b, q])

  useEffect(() => {
    if (!playing) return
    const t = window.setInterval(() => {
      setDealt((d) => {
        if (d >= total) {
          setPlaying(false)
          return d
        }
        return d + 1
      })
    }, 260)
    return () => window.clearInterval(t)
  }, [playing, total])

  const perFriend = (f: number) => Math.floor(dealt / b) + (f < dealt % b ? 1 : 0)
  const inBox = a - dealt
  const finished = dealt >= total
  const rounds = Math.floor(dealt / b)

  return (
    <Figure
      title="Sharing kueh: // and %"
      caption={
        <>
          Set the number of kueh and friends, then press <strong>Deal</strong> to hand them out one kueh at a time, round after round. The number of full rounds is{' '}
          <code>a // b</code>; whatever is left in the box, too few for another round, is <code>a % b</code>.
        </>
      }
    >
      <div className={s.wrap}>
        <div className={s.box}>
          <div className={s.boxHead}>
            <span>Box</span>
            <span className={s.count}>{inBox} left</span>
          </div>
          <div className={s.kuehRow}>
            {Array.from({ length: inBox }, (_, i) => (
              <Kueh key={i} />
            ))}
            {inBox === 0 && <span className={s.empty}>empty</span>}
          </div>
        </div>
        <div className={s.plates}>
          {Array.from({ length: b }, (_, f) => (
            <div key={f} className={s.plate}>
              <div className={s.boxHead}>
                <span>Friend {f + 1}</span>
                <span className={s.count}>{perFriend(f)}</span>
              </div>
              <div className={s.kuehRow}>
                {Array.from({ length: perFriend(f) }, (_, i) => (
                  <Kueh key={i} fresh={playing && i === perFriend(f) - 1 && f === (dealt - 1) % b} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className={s.maths} aria-live="polite">
          {finished ? (
            <>
              <div>
                <code>
                  {a} // {b} = {q}
                </code>{' '}
                <span>each friend gets {q}</span>
              </div>
              <div>
                <code>
                  {a} % {b} = {r}
                </code>{' '}
                <span>{r === 1 ? '1 is' : `${r} are`} left in the box</span>
              </div>
              <div className={s.check}>
                Check: <M>{`${q} \\times ${b} + ${r} = ${a}`}</M>
                <span className={s.aside}>
                  {' '}
                  (and <code>{a} / {b}</code> would be <code>{floatRepr(a / b)}</code> if you could cut kueh)
                </span>
              </div>
            </>
          ) : (
            <div>
              Dealing… round {rounds + 1}: {dealt} of {total} kueh handed out
            </div>
          )}
        </div>
        <Controls>
          <Slider label="kueh, a" value={a} min={0} max={20} onChange={setA} />
          <Slider label="friends, b" value={b} min={1} max={6} onChange={setB} />
          <Button
            primary
            onClick={() => {
              setDealt(0)
              setPlaying(true)
            }}
            disabled={playing || total === 0}
          >
            Deal
          </Button>
        </Controls>
      </div>
    </Figure>
  )
}
