import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "debugging-and-diagnosis",
  order: 33,
  part: "problem-solving",
  domain: "problem_solving",
  title: "Debugging and diagnosing ML models",
  tagline: "From symptom to cause to fix",
  summary: "Reading loss curves, a systematic debugging routine with shape checks, the PyTorch gotchas examiners love, numerical problems (NaN, overflow, vanishing and exploding gradients) and data problems (label bugs, leakage, distribution shift), in the scenario style of the Prelim and the code-reading style of the Final.",
  prerequisites: ["training-deep-networks", "model-evaluation"],
  syllabus: ["NOAI Problem Solving: Debugging, Optimisation", "Diagnosing loss curves, overfitting and underfitting", "NaN losses, exploding gradients, numerical stability, softmax overflow", "Label and pipeline bugs, chance-level accuracy, distribution shift", "Systematic hypothesis-driven debugging", "NOAI Computing: Debugging (shape errors, silent broadcasting, zero_grad, eval mode, devices, optimiser registration)"],
  lessons: [
    {
      slug: "reading-loss-curves",
      title: "Reading loss curves",
      summary: "What healthy, underfitting, overfitting, too-high and too-low learning-rate curves look like, and what to do about each.",
      minutes: 25,
      objectives: ["You can diagnose common training curves", "You can choose the most likely cause of oscillation, plateaus, divergence and a widening gap", "You can propose a fix for each"],
      load: () => import('./reading-loss-curves.mdx'),
    },
    {
      slug: "systematic-debugging",
      title: "Systematic debugging and shape bugs",
      summary: "A debugging decision tree, overfitting one batch, decoding shape errors and catching silent broadcasting and wrong-dim bugs.",
      minutes: 30,
      objectives: ["You can order debugging steps from cheapest and most likely to most expensive", "You can use 'overfit one small batch' as a test", "You can use the expected initial loss as a sanity check", "You can decode shape errors and catch silent broadcasting and wrong-dim bugs"],
      load: () => import('./systematic-debugging.mdx'),
    },
    {
      slug: "pytorch-gotchas",
      title: "PyTorch gotchas and debugging tools",
      summary: "The bugs examiners love: zero_grad, eval mode, devices, graphs and optimiser registration.",
      minutes: 30,
      objectives: ["You can spot missing zero_grad, eval or no_grad", "You can spot device bugs and graph-breaking operations in custom losses", "You can spot optimiser and freezing mistakes", "You can use asserts, anomaly detection and profilers to find bugs and bottlenecks"],
      load: () => import('./pytorch-gotchas.mdx'),
    },
    {
      slug: "nan-and-numerical-issues",
      title: "NaNs, numerical issues and gradient diagnostics",
      summary: "Overflow in exp, log of zero, division by zero, exploding and vanishing gradients, the standard fixes, and per-layer gradient norms to locate the failing layer.",
      minutes: 35,
      objectives: ["You can explain why naive softmax overflows and how subtracting the max fixes it", "You can identify sources of NaN and Inf (log 0, 0/0, overflow)", "You can apply fixes: epsilon, log-sum-exp, clipping, lower learning rate, loss scaling", "You can use per-layer gradient norms and anomaly detection to locate where training breaks"],
      load: () => import('./nan-and-numerical-issues.mdx'),
    },
    {
      slug: "data-bugs-and-shift",
      title: "Data bugs, leakage and distribution shift",
      summary: "Label and preprocessing bugs, chance-level accuracy, train/test mismatch, covariate and concept drift, and validating on the right data.",
      minutes: 35,
      objectives: ["You can recognise chance-level accuracy (1/K) and what it implies", "You can spot label-mapping and preprocessing mismatches between training and testing", "You can distinguish covariate shift from concept drift", "You can design a time-based validation split"],
      load: () => import('./data-bugs-and-shift.mdx'),
    },
  ],
}

export default mod
