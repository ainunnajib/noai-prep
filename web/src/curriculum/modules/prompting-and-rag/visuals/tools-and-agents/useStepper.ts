import { useEffect, useState } from 'react'

/**
 * Same interface as the kit's usePlayer (so it works with <PlayerControls>), but it can start on
 * any step. Steppers here start on the LAST step, so the figure is complete at rest; Restart walks
 * through it from the beginning.
 */
export function useStepper({ steps, interval = 1400, initial = steps - 1 }: { steps: number; interval?: number; initial?: number }) {
  const [step, setStep] = useState(Math.max(0, Math.min(initial, steps - 1)))
  const [playing, setPlaying] = useState(false)
  useEffect(() => {
    if (!playing) return
    const t = window.setInterval(() => {
      setStep((x) => {
        if (x >= steps - 1) {
          setPlaying(false)
          return x
        }
        return x + 1
      })
    }, interval)
    return () => window.clearInterval(t)
  }, [playing, steps, interval])
  useEffect(() => {
    if (step > steps - 1) setStep(Math.max(0, steps - 1))
  }, [steps, step])
  return {
    step,
    setStep,
    playing,
    steps,
    play: () => {
      if (step >= steps - 1) setStep(0)
      setPlaying(true)
    },
    pause: () => setPlaying(false),
    toggle: () => {
      if (playing) setPlaying(false)
      else {
        if (step >= steps - 1) setStep(0)
        setPlaying(true)
      }
    },
    next: () => setStep((x) => Math.min(steps - 1, x + 1)),
    prev: () => setStep((x) => Math.max(0, x - 1)),
    reset: () => {
      setPlaying(false)
      setStep(0)
    },
  }
}
