import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "calculus-and-gradient-descent",
  order: 13,
  part: "classical-ml",
  domain: "mathematics",
  title: "Calculus and gradient descent",
  tagline: "Slopes that tell models where to go",
  summary: "Derivatives as slopes, the rules you need without a calculator (including sigmoid and ReLU), the chain rule behind backpropagation, partial derivatives and gradients, gradient descent on loss landscapes, and curvature: convexity, the Hessian, saddle points and Newton's method.",
  prerequisites: ["vectors-and-matrices", "ai-first-look", "maths-foundations"],
  syllabus: ["NOAI Mathematics: Calculus", "Derivatives and the power, exponential, log rules", "Sigmoid and ReLU derivatives", "Chain rule and computational graphs", "Partial derivatives, gradient vector, gradient of squared norm", "NOAI Mathematics: Optimisation", "IOAI 2A2 Gradient Descent", "Convexity, critical points, the Hessian, saddle points, Taylor approximation and Newton's method"],
  lessons: [
    {
      slug: "derivatives-as-slopes",
      title: "Derivatives are slopes",
      summary: "The derivative as the slope of the tangent line: the limit of secant slopes, a multiplier that predicts small nudges, and a sign that shows where a curve rises or falls.",
      minutes: 20,
      objectives: ["You can explain the derivative as the slope of the tangent: the limit of secant slopes as the run shrinks to 0", "You can predict the effect of a small nudge with f(a + h) ≈ f(a) + f′(a)h", "You can use the sign of the derivative to tell where a function rises, falls or has a minimum"],
      load: () => import('./derivatives-as-slopes.mdx'),
    },
    {
      slug: "derivative-rules",
      title: "Derivative rules you must know cold",
      summary: "Power, sum, exponential, log, product and quotient rules, second derivatives, and the sigmoid and ReLU derivatives that NOAI asks about.",
      minutes: 30,
      objectives: ["You can differentiate polynomials, eˣ and ln x in one line, and take a second derivative", "You can use σ′(x) = σ(x)(1 − σ(x)) and explain why it is never more than 0.25", "You can give the slopes of ReLU and |x| on each side of their kink at 0, and the value code uses at the kink"],
      load: () => import('./derivative-rules.mdx'),
    },
    {
      slug: "chain-rule",
      title: "The chain rule",
      summary: "How to differentiate a function inside a function by multiplying rates: the engine of backpropagation, and the reason deep sigmoid networks suffer from vanishing gradients.",
      minutes: 25,
      objectives: ["You can apply the chain rule to compositions such as (2x + 1)⁴, e to the power 2x², and σ(wx + b)", "You can compute a weight's gradient on a computational graph by multiplying upstream and local derivatives", "You can explain why multiplying many factors below 1 makes gradients vanish in deep sigmoid networks"],
      load: () => import('./chain-rule.mdx'),
    },
    {
      slug: "partial-derivatives-gradients",
      title: "Partial derivatives and the gradient",
      summary: "Slopes for functions of many inputs, combined into the gradient vector that points straight uphill, plus the gradients of wᵀx and ‖w‖².",
      minutes: 25,
      objectives: ["You can compute partial derivatives by treating the other variables as constants", "You can assemble the gradient vector and evaluate it at a point", "You can explain why the gradient points straight uphill, at right angles to the contour lines, with length equal to the steepest slope", "You can use ∇(wᵀx) = x and ∇‖w‖² = 2w"],
      load: () => import('./partial-derivatives-gradients.mdx'),
    },
    {
      slug: "gradient-descent",
      title: "Gradient descent on a loss landscape",
      summary: "The loss as a landscape over the parameters, the update rule w ← w − η∇L, how curvature limits the learning rate, and why long, narrow valleys make gradient descent zig-zag.",
      minutes: 30,
      objectives: ["You can write the update w ← w − η∇L and apply it by hand or in a loop", "You can find the largest safe learning rate from the curvature and diagnose one that is too small or too large", "You can explain why long, narrow valleys cause zig-zagging and how standardising features helps"],
      load: () => import('./gradient-descent.mdx'),
    },
    {
      slug: "curvature-convexity",
      title: "Curvature: second derivatives, convexity and the Hessian",
      summary: "How second derivatives and the Hessian tell minima from maxima and saddles, why convex losses are easy, and how Taylor approximation leads to Newton's method.",
      minutes: 30,
      objectives: ["You can compute a Hessian and classify a critical point from f″, or from det H and trace H", "You can explain why every local minimum of a convex function is a global minimum", "You can use a second-order Taylor approximation, and explain why Newton's method is too costly for deep networks"],
      load: () => import('./curvature-convexity.mdx'),
    },
  ],
}

export default mod
