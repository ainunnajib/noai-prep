import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "backpropagation",
  order: 21,
  part: "deep-learning",
  domain: "ai_ml_dl",
  title: "Backpropagation by hand and in NumPy",
  tagline: "How networks learn from errors",
  summary: "Computational graphs, the backward pass as repeated chain rule, vanishing and exploding gradients, and a complete neural network trained from scratch in NumPy with gradient checking.",
  prerequisites: ["neural-networks"],
  syllabus: ["IOAI 2A2 Gradient Descent", "IOAI 2A3 Backpropagation", "NOAI Mathematics: chain rule, computational graphs and automatic differentiation", "Vanishing/exploding gradients, residual connections", "Gradient checking with finite differences"],
  lessons: [
    {
      slug: "computational-graphs",
      title: "Computational graphs",
      summary: "Breaking any calculation into small nodes so that values flow forward and gradients flow backward.",
      minutes: 15,
      objectives: ["You can draw a computational graph for a small expression", "You can compute the forward values", "You can write each node's local derivative"],
      load: () => import('./computational-graphs.mdx'),
    },
    {
      slug: "backprop-step-by-step",
      title: "Backprop step by step",
      summary: "Running the backward pass through a small network, multiplying local gradients, and summing where paths branch.",
      minutes: 22,
      objectives: ["You can compute gradients for a two-layer network by hand", "You can explain why gradients add where a value is used twice", "You can relate backprop to the chain rule"],
      load: () => import('./backprop-step-by-step.mdx'),
    },
    {
      slug: "vanishing-and-exploding-gradients",
      title: "Vanishing and exploding gradients",
      summary: "Why gradients shrink or blow up in deep networks and the fixes: ReLU, good initialisation, normalisation, residual connections and clipping.",
      minutes: 18,
      objectives: ["You can explain vanishing gradients as a product of small factors", "You can explain exploding gradients and NaN losses", "You can match fixes (ReLU, He init, BatchNorm, residuals, clipping) to problems"],
      load: () => import('./vanishing-and-exploding-gradients.mdx'),
    },
    {
      slug: "network-from-scratch",
      title: "A neural network from scratch in NumPy",
      summary: "Implementing the forward pass, loss, backward pass and update for a small classifier, and verifying gradients numerically.",
      minutes: 25,
      objectives: ["You can implement forward and backward passes for a one-hidden-layer network in NumPy", "You can write a training loop that reduces loss", "You can check analytic gradients with finite differences"],
      load: () => import('./network-from-scratch.mdx'),
    },
  ],
}

export default mod
