import { useCallback, useEffect, useRef, useState } from 'react'

/** Drives a step-by-step animation: step 0..steps-1, with play/pause. */
export function usePlayer({ steps, interval = 900, loop = false, autoplay = false }: { steps: number; interval?: number; loop?: boolean; autoplay?: boolean }) {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(autoplay)
  useEffect(() => {
    if (!playing) return
    const t = window.setInterval(() => {
      setStep((s) => {
        if (s >= steps - 1) {
          if (loop) return 0
          setPlaying(false)
          return s
        }
        return s + 1
      })
    }, interval)
    return () => window.clearInterval(t)
  }, [playing, steps, interval, loop])
  useEffect(() => {
    if (step > steps - 1) setStep(Math.max(0, steps - 1))
  }, [steps, step])
  return {
    step,
    setStep,
    playing,
    play: () => {
      if (step >= steps - 1) setStep(0)
      setPlaying(true)
    },
    pause: () => setPlaying(false),
    toggle: () => (playing ? setPlaying(false) : (step >= steps - 1 && setStep(0), setPlaying(true))),
    next: () => setStep((s) => Math.min(steps - 1, s + 1)),
    prev: () => setStep((s) => Math.max(0, s - 1)),
    reset: () => {
      setPlaying(false)
      setStep(0)
    },
    steps,
  }
}

export type Player = ReturnType<typeof usePlayer>

export function PlayerControls({ player, label }: { player: Player; label?: (step: number) => React.ReactNode }) {
  return (
    <div className="player">
      <button type="button" className="btn btn-small" onClick={player.reset} aria-label="Restart">
        Restart
      </button>
      <button type="button" className="btn btn-small" onClick={player.prev} disabled={player.step === 0} aria-label="Previous step">
        Back
      </button>
      <button type="button" className="btn btn-primary btn-small" onClick={player.toggle}>
        {player.playing ? 'Pause' : player.step >= player.steps - 1 ? 'Replay' : 'Play'}
      </button>
      <button type="button" className="btn btn-small" onClick={player.next} disabled={player.step >= player.steps - 1} aria-label="Next step">
        Next
      </button>
      <span className="player-status tabular">{label ? label(player.step) : `Step ${player.step + 1} of ${player.steps}`}</span>
    </div>
  )
}

/** Calls cb(dtSeconds) every animation frame while active. */
export function useAnimationFrame(cb: (dt: number) => void, active: boolean) {
  const ref = useRef(cb)
  ref.current = cb
  useEffect(() => {
    if (!active) return
    let raf = 0
    let last = performance.now()
    const loop = (t: number) => {
      ref.current(Math.min(0.1, (t - last) / 1000))
      last = t
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [active])
}

/** Re-render on demand, e.g. a "Shuffle data" button: const [seed, bump] = useBump() */
export function useBump(): [number, () => void] {
  const [n, setN] = useState(0)
  return [n, useCallback(() => setN((x) => x + 1), [])]
}
