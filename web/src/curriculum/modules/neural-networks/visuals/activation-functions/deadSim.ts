/*
  A tiny, deterministic training run for the dying-ReLU visual.
  Network: 2 inputs → 16 hidden ReLU (or Leaky ReLU) neurons → 1 linear output, trained by full-batch
  gradient descent on mean squared error. The 120 training inputs are spread over the square [−2, 2]² and
  the target is y = sin(1.5·x₁) + 0.5·x₂ (rounded to 3 decimals). The data and the starting weights are
  stored as literal numbers (made once with NumPy, seed 6) and training uses only + − × ÷ and √, so every
  browser computes exactly the same run. Gradients are clipped to a total length of 3, so a huge learning
  rate makes big jumps instead of overflowing to NaN.
  A neuron is dead when its pre-activation z = w·x + b is ≤ 0 for every training input: with ReLU its
  output and all its gradients are then exactly 0 on every step, so gradient descent can never move it again.
*/

export const N_HIDDEN = 16
export const BOX = 2
export const CLIP = 3
export const LEAK = 0.1

export interface Net {
  w1: number[][] // [hidden][2]
  b1: number[]
  w2: number[]
  b2: number
}

export interface Data {
  x: number[][]
  y: number[]
}

export const DATA: Data = {
  x: [[0.15, -0.63], [-0.52, -0.5], [1.95, 0.53], [0.7, -0.68], [0.72, -1.51], [-1.79, 1.4], [-1.96, 1.92], [1.31, 1.14], [-1.81, -1.17], [1.4, -0.27], [0.51, -1.51], [-1.25, -0.01], [1.04, 0.16], [-1.57, 1.46], [-1.44, -0.24], [0.35, -0.72], [-0.33, 1.55], [-0.18, 0.16], [1.88, -0.9], [1.58, -0.55], [-0.75, 1.53], [-1.74, 1.47], [1.31, 1.58], [-1.76, -1.04], [1.1, -0.25], [-1.98, 0.77], [1.2, 1.89], [-1.4, -0.99], [1.37, -1.63], [-0.9, -0.19], [-0.33, 0.17], [1.47, 0.53], [0.62, 0.37], [-1.16, -0.2], [1.95, 1.64], [1.07, 0.13], [1.48, 0.52], [-0.41, 0.11], [-1.21, 0.29], [-0.75, 1.13], [1.31, 1.98], [1.34, -1.76], [0.9, 1.23], [1.49, -0.03], [-0.1, 0.12], [-1.38, 1.83], [1.95, -0.95], [1.83, -1.17], [-1.66, 0.93], [1.27, -1.2], [1.82, -0.4], [-1.26, -0.8], [-1.55, 1.09], [-0.86, 0.77], [-0.16, -1.5], [0.35, 1.87], [-1.26, 1.85], [-1.53, 0.31], [-1.31, 1.98], [0.2, 1.49], [0.83, -0.21], [-0.96, 1.49], [1.54, 1.14], [1.23, -1.83], [-1.12, 0.22], [-1.69, 0.36], [1.79, -0.58], [0.76, -1.19], [1.19, 1.59], [1.26, -0.24], [-0.61, -1.67], [1.39, 1.62], [0.23, 1.06], [-1.09, 1.02], [-1, 0.92], [-1.95, -0.46], [-1.05, -1.84], [-0.96, 1.67], [-0.79, -1.53], [0.67, 1.09], [-0.62, 1.69], [0.79, 0.15], [1.59, 1.24], [0.42, -0.99], [0.09, 0.48], [1.59, 1.76], [-1.75, 0.11], [1.75, -0.28], [1.02, -1.08], [1.48, -1.3], [-0.95, -1.02], [-1.43, 0.68], [1.37, -1.37], [-1.2, -0.41], [-0.8, 0.55], [-1.53, 0.33], [0.01, -1.53], [-0.21, -0.5], [-1.73, -0.7], [0.57, 1.5], [1.81, 0.95], [-0.37, -1.4], [0.73, 0.29], [1.44, -0.98], [0.63, -1.63], [-0.76, -0.28], [1.22, -0.61], [0.48, 1.94], [1.79, -0.09], [-1.16, 0.46], [1.17, 0.38], [0.99, -1.15], [-0.86, -1.38], [-1.77, -0.16], [1.09, -0.5], [1.81, -0.59], [-0.48, 1.41], [0.64, 0.14], [-1.06, -1.65], [-1.34, -1.34]],
  y: [-0.092, -0.953, 0.48, 0.527, 0.127, 0.259, 0.76, 1.493, -0.999, 0.728, -0.062, -0.959, 1.08, 0.022, -0.951, 0.141, 0.3, -0.187, -0.134, 0.422, -0.137, 0.228, 1.713, -1.001, 0.872, 0.214, 1.919, -1.358, 0.07, -1.071, -0.39, 1.071, 0.987, -1.086, 1.035, 1.064, 1.057, -0.522, -0.825, -0.337, 1.913, 0.025, 1.591, 0.772, -0.089, 0.037, -0.26, -0.199, -0.141, 0.345, 0.2, -1.349, -0.184, -0.576, -0.988, 1.436, -0.024, -0.594, 0.067, 1.041, 0.842, -0.246, 1.309, 0.048, -0.884, -0.39, 0.151, 0.314, 1.772, 0.829, -1.628, 1.681, 0.868, -0.488, -0.537, -0.445, -1.92, -0.156, -1.691, 1.389, 0.043, 1.001, 1.306, 0.094, 0.375, 1.566, -0.439, 0.354, 0.459, 0.147, -1.499, -0.5, 0.2, -1.179, -0.657, -0.584, -0.75, -0.56, -0.87, 1.505, 0.889, -1.227, 1.034, 0.341, -0.005, -1.049, 0.662, 1.629, 0.396, -0.756, 1.173, 0.421, -1.651, -0.548, 0.748, 0.119, 0.046, 0.889, -1.825, -1.575],
}

export const NET0: Net = {
  w1: [[0.29, -1.167], [-0.595, 0.066], [0.691, -0.843], [-1.06, 1.14], [0.067, -0.381], [-0.74, -0.658], [1.585, 0.969], [-0.418, -1.254], [1.673, 1.57], [1.204, 0.842], [-1.887, -1.291], [0.565, -0.285], [0.255, -0.525], [-0.657, 0.553], [-0.401, -0.003], [0.255, 0.232]],
  b1: Array.from({ length: N_HIDDEN }, () => 0.1),
  w2: [0.29, 0.342, -0.342, -0.067, -0.162, 0.188, -0.268, 0.193, 0.175, 0.144, -0.244, -0.054, -0.271, 0.098, 0.238, -0.381],
  b2: 0,
}

const act = (z: number, leaky: boolean) => (z > 0 ? z : leaky ? LEAK * z : 0)
const dact = (z: number, leaky: boolean) => (z > 0 ? 1 : leaky ? LEAK : 0)

/** Train for `steps` full-batch gradient-descent steps; returns a new Net (the input is not modified). */
export function train(net0: Net, data: Data, lr: number, leaky: boolean, steps: number): Net {
  const net: Net = { w1: net0.w1.map((r) => [...r]), b1: [...net0.b1], w2: [...net0.w2], b2: net0.b2 }
  const n = data.x.length
  const H = N_HIDDEN
  const z = new Float64Array(H)
  for (let s = 0; s < steps; s++) {
    const gw1 = Array.from({ length: H }, () => [0, 0])
    const gb1 = new Float64Array(H)
    const gw2 = new Float64Array(H)
    let gb2 = 0
    for (let i = 0; i < n; i++) {
      const x1 = data.x[i][0]
      const x2 = data.x[i][1]
      let p = net.b2
      for (let j = 0; j < H; j++) {
        z[j] = net.w1[j][0] * x1 + net.w1[j][1] * x2 + net.b1[j]
        p += net.w2[j] * act(z[j], leaky)
      }
      const dp = (2 * (p - data.y[i])) / n
      gb2 += dp
      for (let j = 0; j < H; j++) {
        gw2[j] += dp * act(z[j], leaky)
        const dz = dp * net.w2[j] * dact(z[j], leaky)
        gw1[j][0] += dz * x1
        gw1[j][1] += dz * x2
        gb1[j] += dz
      }
    }
    let g2 = gb2 * gb2
    for (let j = 0; j < H; j++) g2 += gw1[j][0] * gw1[j][0] + gw1[j][1] * gw1[j][1] + gb1[j] * gb1[j] + gw2[j] * gw2[j]
    const g = Math.sqrt(g2)
    const k = g > CLIP ? (lr * CLIP) / g : lr
    for (let j = 0; j < H; j++) {
      net.w1[j][0] -= k * gw1[j][0]
      net.w1[j][1] -= k * gw1[j][1]
      net.b1[j] -= k * gb1[j]
      net.w2[j] -= k * gw2[j]
    }
    net.b2 -= k * gb2
  }
  return net
}

/** Share of training inputs with z > 0 for each hidden neuron, and the mean squared error. */
export function stats(net: Net, data: Data, leaky: boolean) {
  const H = N_HIDDEN
  const active = new Array(H).fill(0)
  let sse = 0
  for (let i = 0; i < data.x.length; i++) {
    const x1 = data.x[i][0]
    const x2 = data.x[i][1]
    let p = net.b2
    for (let j = 0; j < H; j++) {
      const zz = net.w1[j][0] * x1 + net.w1[j][1] * x2 + net.b1[j]
      if (zz > 0) active[j]++
      p += net.w2[j] * act(zz, leaky)
    }
    const e = p - data.y[i]
    sse += e * e
  }
  return { frac: active.map((a) => a / data.x.length), loss: sse / data.x.length }
}
