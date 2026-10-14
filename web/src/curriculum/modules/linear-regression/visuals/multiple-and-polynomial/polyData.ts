/*
  Fixed datasets shared by the polynomial visuals (and the regularisation lesson).
  Generated once from y = sin(0.9πx) + 0.3x plus Gaussian noise (σ = 0.25), seed 1, then rounded.
*/

/** 10 training points used to fit the curves. */
export const TRAIN_X = [-0.885, -0.76, -0.497, -0.242, -0.044, 0.074, 0.314, 0.526, 0.691, 0.959]
export const TRAIN_Y = [-1.18, -1.47, -0.9, -0.43, -0.1, 0.37, 0.31, 1.23, 1.24, 0.48]

/** 25 validation points from the same process, never used for fitting. */
export const VAL_X = [
  -0.98, -0.898, -0.817, -0.735, -0.653, -0.572, -0.49, -0.408, -0.327, -0.245, -0.163, -0.082, 0.0, 0.082, 0.163, 0.245, 0.327, 0.408, 0.49, 0.572, 0.653,
  0.735, 0.817, 0.898, 0.98,
]
export const VAL_Y = [
  -0.59, -1.03, -0.8, -1.08, -1.37, -1.17, -1.2, -0.85, -0.51, -0.55, -0.07, -0.42, -0.17, 0.32, 0.68, 0.85, 1.4, 1.0, 1.0, 1.14, 0.95, 1.15, 1.01, 1.09, 0.5,
]

/** 9 points that follow a cubic, for mixing basis curves by hand: y ≈ 0.5x³ + 0.4x² − 1.2x + 0.6. */
export const CUBIC_X = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2]
export const CUBIC_Y = [0.8, 1.36, 1.85, 1.14, 0.85, -0.04, 0.4, 1.59, 3.65]
