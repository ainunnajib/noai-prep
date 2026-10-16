/*
  Per-layer gradient norms (‖∂L/∂W‖ of each Linear layer's weights) from real PyTorch runs.
  Network: 10 Linear layers (20 → 32 → … → 32 → 4), trained with plain SGD (lr 0.05, batch 64) for 50 epochs
  on a 4-class synthetic dataset (sklearn make_classification, 1024 samples, 20 standardised features).
  'first' = the very first mini-batch, before any update. 'last' = average over the batches of epoch 50.
  Chance level: loss ln 4 ≈ 1.39, accuracy 25%.
  Problems:  vanish  = sigmoid activations, PyTorch default init
             explode = ReLU activations, weights ~ N(0, (3/√fan_in)²)
  Fixes:     he = ReLU + He init, bn = BatchNorm before each activation, res = residual connections
             (layers 2–9: x + act(Wx + b)), clip = clip_grad_norm_(max_norm=1).
  Values rounded to 2 significant figures.
*/

export interface RunData { first: number[]; firstLoss: number; last: number[]; lastLoss: number; lastAcc: number }

export const RUNS: Record<string, RunData> = {
  'vanish-none': {
    first: [2.3e-08, 8.5e-08, 6.6e-07, 5.6e-06, 4.3e-05, 0.00025, 0.0016, 0.01, 0.071, 0.54],
    firstLoss: 1.4,
    last: [2.2e-08, 4.7e-08, 3e-07, 2.4e-06, 1.9e-05, 0.00012, 0.00079, 0.0055, 0.037, 0.26],
    lastLoss: 1.4,
    lastAcc: 0.25,
  },
  'vanish-he': {
    first: [0.44, 0.58, 0.57, 0.44, 0.42, 0.43, 0.56, 0.94, 0.83, 1.2],
    firstLoss: 1.6,
    last: [0.16, 0.18, 0.18, 0.17, 0.15, 0.16, 0.16, 0.14, 0.11, 0.092],
    lastLoss: 0.029,
    lastAcc: 0.99,
  },
  'vanish-bn': {
    first: [0.22, 0.26, 0.25, 0.29, 0.35, 0.32, 0.3, 0.3, 0.25, 0.53],
    firstLoss: 1.4,
    last: [0.8, 0.88, 0.91, 0.85, 0.8, 0.66, 0.52, 0.37, 0.24, 0.17],
    lastLoss: 0.25,
    lastAcc: 0.96,
  },
  'vanish-res': {
    first: [0.13, 0.28, 0.55, 0.74, 0.89, 0.96, 1, 1.4, 1.3, 16],
    firstLoss: 2,
    last: [0.26, 0.2, 0.28, 0.28, 0.27, 0.24, 0.26, 0.19, 0.19, 1.1],
    lastLoss: 0.6,
    lastAcc: 0.77,
  },
  'vanish-clip': {
    first: [2.3e-08, 8.5e-08, 6.6e-07, 5.6e-06, 4.3e-05, 0.00025, 0.0016, 0.01, 0.071, 0.54],
    firstLoss: 1.4,
    last: [2.2e-08, 4.7e-08, 3e-07, 2.4e-06, 1.9e-05, 0.00012, 0.00079, 0.0055, 0.037, 0.26],
    lastLoss: 1.4,
    lastAcc: 0.25,
  },
  'explode-none': {
    first: [520, 870, 930, 730, 760, 780, 1300, 1800, 1700, 2500],
    firstLoss: 1200,
    last: [NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN],
    lastLoss: NaN,
    lastAcc: 0.25,
  },
  'explode-he': {
    first: [0.44, 0.58, 0.57, 0.44, 0.42, 0.43, 0.56, 0.94, 0.83, 1.2],
    firstLoss: 1.6,
    last: [0.16, 0.18, 0.18, 0.17, 0.15, 0.16, 0.16, 0.14, 0.11, 0.092],
    lastLoss: 0.029,
    lastAcc: 0.99,
  },
  'explode-bn': {
    first: [2.3, 2.3, 1.8, 1.5, 1.3, 1, 0.76, 0.67, 0.53, 1.4],
    firstLoss: 3,
    last: [0.8, 0.79, 0.6, 0.49, 0.4, 0.35, 0.29, 0.24, 0.19, 0.22],
    lastLoss: 0.39,
    lastAcc: 0.94,
  },
  'explode-res': {
    first: [2100, 2400, 2700, 3500, 3600, 5200, 7600, 7900, 8200, 10000],
    firstLoss: 6200,
    last: [NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN],
    lastLoss: NaN,
    lastAcc: 0.25,
  },
  'explode-clip': {
    first: [520, 870, 930, 730, 760, 780, 1300, 1800, 1700, 2500],
    firstLoss: 1200,
    last: [36, 47, 42, 38, 37, 47, 57, 76, 90, 110],
    lastLoss: 4.2,
    lastAcc: 0.77,
  },
}
