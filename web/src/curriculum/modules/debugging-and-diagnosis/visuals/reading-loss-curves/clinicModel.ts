import { mulberry32 } from '../../../../../kit'

/*
  A small curve "simulator" for the loss-curve clinic. Each training run is described by a few
  settings (learning rate relative to a good one, model capacity, regularisation, an unstable
  operation, gradient clipping, number of epochs). The curves are stylised sketches of the shapes
  real runs produce, with a little deterministic noise, so that every symptom is easy to recognise.
*/

export type Capacity = 'small' | 'right' | 'big' | 'huge'

export interface RunSpec {
  /** learning rate as a multiple of a good learning rate (1 = good) */
  lr: number
  capacity: Capacity
  reg: boolean
  /** an operation that can blow up (e.g. log of a tiny number, one exploding gradient) */
  unstable: boolean
  clip: boolean
  epochs: number
  seed: number
}

export interface Curves {
  train: [number, number][]
  val: [number, number][]
  /** epoch at which the loss became NaN (curves stop there), or null */
  nanAt: number | null
}

export const Y_MAX = 1.6
const L0 = 1.4

/** Learning-rate regimes. */
export const OSC_FROM = 1.6
export const DIVERGE_FROM = 8

export function simulate(spec: RunSpec): Curves {
  const r = mulberry32(spec.seed)
  const jitter = () => r() * 2 - 1
  const { lr, capacity, reg, epochs } = spec
  const speed = 0.12 * Math.min(lr, 1.5)
  // where the training loss settles, and how far validation sits above it
  let floorTr = capacity === 'small' ? 0.62 : capacity === 'right' ? 0.17 : 0.03
  let floorVal = capacity === 'small' ? 0.66 : capacity === 'right' ? 0.23 : 0.3
  let overfitRate = capacity === 'right' ? 0.0012 : capacity === 'big' ? 0.012 : capacity === 'huge' ? 0.02 : 0
  let overfitFrom = capacity === 'right' ? 45 : capacity === 'big' ? 15 : 10
  if (reg) {
    if (capacity === 'small') {
      floorTr += 0.08
      floorVal += 0.08
    } else if (capacity === 'right') {
      floorTr += 0.06
      floorVal += 0.04
      overfitRate = 0
    } else {
      floorTr = 0.16
      floorVal = 0.22
      overfitRate = capacity === 'huge' ? 0.001 : 0.0004
      overfitFrom = 30
    }
  }
  // too-high learning rate: bounces around a higher level
  const osc = lr > OSC_FROM && lr < DIVERGE_FROM ? Math.min(1, (lr - OSC_FROM) / 3) : 0
  const oscAmp = osc * (spec.clip ? 0.12 : 0.24)
  const oscLift = osc * (spec.clip ? 0.12 : 0.2)
  const diverges = lr >= DIVERGE_FROM
  // the unstable operation fires at epoch 32 unless the steps are small or gradients are clipped
  const cliff = spec.unstable && !spec.clip && lr > 0.5 ? 32 : null
  const blip = spec.unstable && spec.clip && lr > 0.5 ? 32 : null

  const train: [number, number][] = []
  const val: [number, number][] = []
  let nanAt: number | null = null
  for (let t = 0; t <= epochs; t++) {
    let tr: number
    if (capacity === 'big' || capacity === 'huge') {
      const fast = Math.exp(-speed * t)
      const slow = Math.exp((-speed * t) / 4)
      tr = floorTr + (L0 - floorTr) * (reg ? fast : 0.7 * fast + 0.3 * slow)
    } else tr = floorTr + (L0 - floorTr) * Math.exp(-speed * t)
    let va = floorVal + (L0 + 0.04 - floorVal) * Math.exp(-speed * t) + overfitRate * Math.max(0, t - overfitFrom) * Math.min(1, lr)
    // tiny measurement noise
    const n1 = jitter()
    const n2 = jitter()
    tr += 0.008 * n1
    va += 0.008 * n2 + 0.006 * n1
    if (osc > 0 && t > 0) {
      // overshooting only ever lands higher than a well-tuned run would be at this point
      const ramp = Math.min(1, t / 4)
      const kick = r()
      const spike = r() < 0.12 ? 1.8 : 1
      tr += ramp * (oscLift + oscAmp * (kick * spike - 0.3))
      va += ramp * (oscLift + 0.03 + oscAmp * (0.8 * kick * spike + 0.2 * r() - 0.3))
    }
    if (blip !== null && t === blip) {
      tr += 0.16
      va += 0.18
    }
    if (diverges && t >= 2) {
      const g = Math.pow(3, t - 1)
      tr = Math.max(tr, 0.6 * g)
      va = Math.max(va, 0.6 * g * 1.05)
    }
    if (cliff !== null && t >= cliff) {
      const g = Math.pow(25, t - cliff + 1)
      tr = tr * (1 + g)
      va = va * (1 + g)
    }
    tr = Math.max(0.005, tr)
    va = Math.max(0.005, va)
    if (tr > 1e3 || va > 1e3) {
      // the next value overflows: from here on the loss is NaN
      train.push([t, Math.min(tr, 1e3)])
      val.push([t, Math.min(va, 1e3)])
      nanAt = t + 1 <= epochs ? t + 1 : null
      break
    }
    train.push([t, tr])
    val.push([t, va])
  }
  return { train, val, nanAt }
}

export type DiagnosisId = 'healthy' | 'overfit' | 'underfit' | 'lrHigh' | 'lrLow' | 'nan'
export type RemedyId = 'lower' | 'raise' | 'reg' | 'bigger' | 'longer' | 'clip'

export const DIAGNOSES: { id: DiagnosisId; label: string }[] = [
  { id: 'healthy', label: 'Healthy' },
  { id: 'overfit', label: 'Overfitting' },
  { id: 'underfit', label: 'Underfitting' },
  { id: 'lrHigh', label: 'Learning rate too high' },
  { id: 'lrLow', label: 'Learning rate too low' },
  { id: 'nan', label: 'Numerical blow-up (NaN)' },
]

export const REMEDIES: { id: RemedyId; label: string }[] = [
  { id: 'lower', label: 'Lower the learning rate ÷10' },
  { id: 'raise', label: 'Raise the learning rate ×10' },
  { id: 'reg', label: 'Add regularisation (dropout, weight decay)' },
  { id: 'bigger', label: 'Use a bigger model' },
  { id: 'longer', label: 'Train for longer' },
  { id: 'clip', label: 'Clip the gradients' },
]

export function applyRemedy(spec: RunSpec, rem: RemedyId): RunSpec {
  const next = { ...spec }
  switch (rem) {
    case 'lower':
      next.lr = spec.lr / 10
      break
    case 'raise':
      next.lr = spec.lr * 10
      break
    case 'reg':
      next.reg = true
      break
    case 'bigger':
      next.capacity = spec.capacity === 'small' ? 'right' : spec.capacity === 'right' ? 'big' : 'huge'
      break
    case 'longer':
      next.epochs = spec.epochs * 2.5
      break
    case 'clip':
      next.clip = true
      break
  }
  return next
}

export type Outcome = 'fixed' | 'better' | 'same' | 'worse'

export interface Patient {
  name: string
  spec: RunSpec
  diagnosis: DiagnosisId
  /** shown after a wrong diagnosis: where to look */
  hint: string
  /** shown after the right diagnosis */
  confirm: string
  remedies: Record<RemedyId, [Outcome, string]>
}

const base: Omit<RunSpec, 'seed'> = { lr: 1, capacity: 'right', reg: false, unstable: false, clip: false, epochs: 60 }

export const PATIENTS: Patient[] = [
  {
    name: 'Run 1',
    spec: { ...base, lr: 4, seed: 11 },
    diagnosis: 'lrHigh',
    hint: 'Look at how the curves move from one epoch to the next: do they settle, or keep jumping up and down?',
    confirm: 'Both curves jump up and down and never settle, at a level well above where they should end. The steps are so big that each update overshoots.',
    remedies: {
      lower: ['fixed', 'Smaller steps stop the overshooting: both curves now fall smoothly and settle low. This is the first thing to try for a jumpy curve.'],
      raise: ['worse', 'Even bigger steps: the loss explodes within a few epochs and becomes NaN.'],
      reg: ['same', 'Regularisation fights overfitting, not overshooting. The curves still bounce.'],
      bigger: ['same', 'A bigger model does not make the steps smaller. Still bouncing.'],
      longer: ['same', 'More epochs of bouncing are still bouncing: the loss never settles.'],
      clip: ['better', 'Clipping caps the largest steps, so the bouncing shrinks a little, but the learning rate is still too high. Lowering it is the real fix.'],
    },
  },
  {
    name: 'Run 2',
    spec: { ...base, capacity: 'big', seed: 22 },
    diagnosis: 'overfit',
    hint: 'Compare the two curves after about epoch 20. Are they moving together or apart?',
    confirm: 'Training loss keeps falling, but validation loss bottoms out near epoch 20 and then climbs. The widening gap is overfitting: the model is memorising the training set.',
    remedies: {
      lower: ['same', 'Ten times smaller steps make everything ten times slower. The overfitting is not cured, only postponed: the gap opens later.'],
      raise: ['worse', 'Ten times the learning rate: the loss explodes and becomes NaN.'],
      reg: ['fixed', 'Dropout and weight decay make memorising harder: the validation curve no longer climbs and the gap stays small. (Stopping at the lowest validation loss, early stopping, also works.)'],
      bigger: ['worse', 'More capacity means even more memorising: the gap opens sooner and wider.'],
      longer: ['worse', 'Training longer only gives the model more time to memorise: validation loss keeps rising.'],
      clip: ['same', 'Nothing was exploding, so clipping changes nothing. Still overfitting.'],
    },
  },
  {
    name: 'Run 3',
    spec: { ...base, lr: 0.08, seed: 33 },
    diagnosis: 'lrLow',
    hint: 'Is the curve still going down at the last epoch? Does it look like a curve or almost a straight line?',
    confirm: 'A slow, almost straight decline that is still going down at epoch 60. Each step is tiny, so the model has barely started.',
    remedies: {
      lower: ['worse', 'Even tinier steps: the curve is now almost flat.'],
      raise: ['fixed', 'Ten times bigger steps: a fast drop, then the curve flattens at a low loss. That is the healthy shape.'],
      reg: ['same', 'The model was not overfitting, so regularisation does not help. Same slow slope.'],
      bigger: ['same', 'Capacity was not the problem. Same slow slope.'],
      longer: ['better', 'With 150 epochs it gets further, but it is still crawling down after 2.5 times the compute. Raising the learning rate is the real fix.'],
      clip: ['same', 'The gradients were not too big, so clipping does nothing.'],
    },
  },
  {
    name: 'Run 4',
    spec: { ...base, capacity: 'small', seed: 44 },
    diagnosis: 'underfit',
    hint: 'Look at the level the curves settle at, and at the gap between them.',
    confirm: 'Both curves flatten early at a high loss and stay close together. The model is too simple to capture the pattern: underfitting (high bias).',
    remedies: {
      lower: ['same', 'Slower progress to the same high plateau.'],
      raise: ['worse', 'The steps become too big: the loss explodes and becomes NaN.'],
      reg: ['worse', 'Regularisation makes a model simpler: the plateau rises even higher.'],
      bigger: ['fixed', 'A model with more capacity can fit the pattern: both curves drop to a low level and stay close.'],
      longer: ['same', 'The curves had already flattened. More epochs at the same plateau change nothing.'],
      clip: ['same', 'Nothing was exploding. Still stuck at the same plateau.'],
    },
  },
  {
    name: 'Run 5',
    spec: { ...base, unstable: true, seed: 55 },
    diagnosis: 'nan',
    hint: 'What happens around epoch 32?',
    confirm: 'Training looked fine for 31 epochs, then the loss shot up to an enormous value and became NaN. One step produced a huge gradient (or an operation such as log 0 overflowed) and the weights blew up.',
    remedies: {
      lower: ['fixed', 'Smaller steps keep the weights out of the region where things blow up. No NaN; training is a bit slower.'],
      raise: ['worse', 'Bigger steps blow up straight away.'],
      reg: ['same', 'Regularisation does not stop one huge gradient. It still turns into NaN at epoch 32.'],
      bigger: ['same', 'A bigger model has the same weak spot. Still NaN at epoch 32.'],
      longer: ['same', 'Once the loss is NaN every later number is NaN too, however long you train.'],
      clip: ['fixed', 'Gradient clipping caps the size of that one huge gradient: a small bump at epoch 32 and training carries on.'],
    },
  },
  {
    name: 'Run 6',
    spec: { ...base, seed: 66 },
    diagnosis: 'healthy',
    hint: 'Check all three: does the loss fall quickly, does it settle, and are the two curves close?',
    confirm: 'A fast drop, then both curves level off close together. Nothing to fix: this is what you want to see.',
    remedies: {
      lower: ['worse', 'Training gets ten times slower for no benefit.'],
      raise: ['worse', 'The steps become far too big and the loss explodes. Never change a healthy run blindly.'],
      reg: ['worse', 'A little more regularisation raises both curves slightly: the model now fits a little worse.'],
      bigger: ['worse', 'Extra capacity starts to overfit: watch the validation curve turn upward.'],
      longer: ['same', 'Nothing more to gain: the curves were already flat (validation even creeps up a little).'],
      clip: ['same', 'Nothing was exploding, so nothing changes.'],
    },
  },
]
