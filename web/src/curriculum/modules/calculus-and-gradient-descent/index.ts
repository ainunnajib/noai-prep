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
      summary: "The derivative is the slope of the tangent line, found by zooming in until a curve looks straight.",
      minutes: 15,
      objectives: ["You can explain a derivative as an instantaneous rate of change", "You can estimate a derivative from a graph", "You can say where a derivative is positive, negative or zero"],
      load: () => import('./derivatives-as-slopes.mdx'),
    },
    {
      slug: "derivative-rules",
      title: "Derivative rules you must know cold",
      summary: "Power, constant, sum, exponential and log rules, plus the sigmoid and ReLU derivatives that appear in NOAI questions.",
      minutes: 22,
      objectives: ["You can differentiate polynomials, eˣ and ln x without a calculator", "You can state σ′(x) = σ(x)(1 − σ(x)) and its maximum", "You can explain ReLU's derivative and its kink at 0", "You can apply the product and quotient rules and derive σ′(x) = σ(x)(1 − σ(x))"],
      load: () => import('./derivative-rules.mdx'),
    },
    {
      slug: "chain-rule",
      title: "The chain rule",
      summary: "How to differentiate a function inside a function by multiplying rates, the engine of backpropagation.",
      minutes: 18,
      objectives: ["You can apply the chain rule to compositions like (3x + 1)² and σ(wx + b)", "You can compute a derivative along a computational graph", "You can explain why multiplying many small factors vanishes"],
      load: () => import('./chain-rule.mdx'),
    },
    {
      slug: "partial-derivatives-gradients",
      title: "Partial derivatives and the gradient",
      summary: "Slopes for functions of many inputs, combined into the gradient vector that points uphill.",
      minutes: 20,
      objectives: ["You can compute partial derivatives by treating other variables as constants", "You can assemble the gradient vector", "You can explain why the gradient is perpendicular to contour lines and points uphill", "You can state ∇(||w||²) = 2w"],
      load: () => import('./partial-derivatives-gradients.mdx'),
    },
    {
      slug: "gradient-descent",
      title: "Gradient descent on a loss landscape",
      summary: "The loss as a landscape over the parameters, the update rule w ← w − η∇L, and why long narrow valleys make gradient descent zig-zag.",
      minutes: 20,
      objectives: ["You can write and apply the gradient-descent update rule", "You can predict the effect of a too-small or too-large learning rate", "You can explain why elongated contours cause zig-zagging"],
      load: () => import('./gradient-descent.mdx'),
    },
    {
      slug: "curvature-convexity",
      title: "Curvature: second derivatives, convexity and the Hessian",
      summary: "How curvature tells minima from maxima and saddles, and how Newton's method uses it.",
      minutes: 18,
      objectives: ["You can classify critical points using second derivatives or the Hessian", "You can explain why convex functions are easy to optimise", "You can describe Taylor approximation and why Newton's method is costly"],
      load: () => import('./curvature-convexity.mdx'),
    },
  ],
}

export default mod
