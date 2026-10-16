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
      summary: "What healthy, underfitting, overfitting, too-high and too-low learning-rate curves look like, what to do about each, and how to tell per-batch noise from real instability.",
      minutes: 25,
      objectives: ["You can diagnose overfitting, underfitting and a healthy run from training and validation curves", "You can recognise a learning rate that is too low, too high or diverging, and explain why big steps overshoot", "You can choose the first fix for each problem, including a sudden NaN"],
      load: () => import('./reading-loss-curves.mdx'),
    },
    {
      slug: "systematic-debugging",
      title: "Systematic debugging and shape bugs",
      summary: "A debugging decision tree, overfitting one batch, decoding shape errors and catching silent broadcasting and wrong-dim bugs.",
      minutes: 30,
      objectives: ["You can run the debugging routine in order, cheapest and most likely checks first", "You can predict the initial loss of a K-class classifier (about ln K) and use it as a sanity check", "You can name the bug behind a failing one-batch overfitting test", "You can decode a shape error and spot silent broadcasting bugs"],
      load: () => import('./systematic-debugging.mdx'),
    },
    {
      slug: "pytorch-gotchas",
      title: "PyTorch gotchas and debugging tools",
      summary: "The bugs examiners love (zero_grad, eval mode, devices, broken graphs and optimiser registration), and the tools that find the rest: asserts, anomaly detection, profilers and memory checks.",
      minutes: 30,
      objectives: ["You can spot a missing zero_grad(), eval() or no_grad() and predict its effect", "You can spot device bugs and custom losses that break the computation graph", "You can explain why an optimiser created before a layer is replaced never updates that layer", "You can pick the right tool: asserts for shapes, anomaly detection for NaN, profilers for time and memory checks for leaks"],
      load: () => import('./pytorch-gotchas.mdx'),
    },
    {
      slug: "nan-and-numerical-issues",
      title: "NaNs, numerical issues and gradient diagnostics",
      summary: "Overflow in exp, log of zero, division by zero, exploding and vanishing gradients, the standard fixes, and per-layer gradient norms to locate the failing layer.",
      minutes: 35,
      objectives: ["You can explain why naive softmax overflows and compute a stable softmax by subtracting the max", "You can predict when a calculation gives inf or NaN (overflow, log 0, 0/0, 0 times infinity)", "You can find the first NaN instead of the last, and choose a fix: epsilon, losses on logits, clipping or a lower learning rate", "You can read per-layer gradient norms to tell vanishing from exploding gradients"],
      load: () => import('./nan-and-numerical-issues.mdx'),
    },
    {
      slug: "data-bugs-and-shift",
      title: "Data bugs, leakage and distribution shift",
      summary: "Label and preprocessing bugs, chance-level accuracy, train/test mismatch, covariate and concept drift, and validating on the right data.",
      minutes: 30,
      objectives: ["You can recognise chance-level accuracy (1/K) and explain why it points to a pipeline bug", "You can spot label-mapping and preprocessing mismatches between training, validation and deployment", "You can tell covariate shift from concept drift", "You can design a time-based validation split for data that changes over time"],
      load: () => import('./data-bugs-and-shift.mdx'),
    },
  ],
}

export default mod
