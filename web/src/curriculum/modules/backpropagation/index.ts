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
      minutes: 20,
      objectives: ["You can break a formula into a computational graph and run its forward pass", "You can give each node's local derivative from the gate rules, including subtract and sigmoid", "You can send an upstream gradient back through an add or a multiply node"],
      load: () => import('./computational-graphs.mdx'),
    },
    {
      slug: "backprop-step-by-step",
      title: "Backprop step by step",
      summary: "Running the backward pass through a small network, multiplying local gradients, and summing where paths branch.",
      minutes: 30,
      objectives: ["You can run a backward pass by hand, multiplying upstream gradient by local derivative at each node", "You can explain why gradients add where a value feeds more than one node", "You can find a weight's gradient as input activation times delta, and spot when ReLU blocks it"],
      load: () => import('./backprop-step-by-step.mdx'),
    },
    {
      slug: "vanishing-and-exploding-gradients",
      title: "Vanishing and exploding gradients",
      summary: "Why gradients shrink or blow up in deep networks and the fixes: ReLU, good initialisation, normalisation, residual connections and clipping.",
      minutes: 30,
      objectives: ["You can explain vanishing and exploding gradients as a product of one factor per layer", "You can explain why He initialisation doubles the weight variance for ReLU", "You can work out the gradient through a residual connection y = x + F(x)", "You can match symptoms such as a nan loss to fixes, and place gradient clipping in a training loop"],
      load: () => import('./vanishing-and-exploding-gradients.mdx'),
    },
    {
      slug: "network-from-scratch",
      title: "A neural network from scratch in NumPy",
      summary: "Implementing the forward pass, loss, backward pass and update for a small classifier, and verifying gradients numerically.",
      minutes: 25,
      objectives: ["You can write the forward pass, loss, backward pass and update for a one-hidden-layer network in NumPy", "You can use P − Y and the shape rules to write and check each gradient line", "You can check backprop gradients with central differences and tell a bug from a bad step size"],
      load: () => import('./network-from-scratch.mdx'),
    },
  ],
}

export default mod
