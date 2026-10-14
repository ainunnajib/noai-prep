import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "training-deep-networks",
  order: 23,
  part: "deep-learning",
  domain: "ai_ml_dl",
  title: "Optimisers and training deep networks well",
  tagline: "Tricks that make deep learning work",
  summary: "Stochastic and mini-batch gradient descent, momentum, RMSProp, Adam and AdamW, weight initialisation, BatchNorm and LayerNorm, dropout, weight decay and early stopping, learning-rate warm-up and schedules, and stability tools: gradient clipping, mixed precision and gradient accumulation.",
  prerequisites: ["pytorch", "calculus-and-gradient-descent"],
  syllabus: ["NOAI Mathematics: Optimisation", "IOAI 2B7 SGD, Mini-Batch Gradient Descent", "IOAI 2B8 Momentum Methods (Adam, AdamW)", "IOAI 2B9 Convergence and Learning Rates", "IOAI 2B10 Regularization: Dropout, Early Stopping, Weight Decay", "IOAI 2B11 Weight Initialization", "IOAI 2B12 Batch Normalization", "NOAI: gradient clipping, mixed precision, gradient accumulation, warm-up and cosine schedules, LayerNorm"],
  lessons: [
    {
      slug: "sgd-and-mini-batches",
      title: "Stochastic and mini-batch gradient descent",
      summary: "Using small random batches to estimate the gradient cheaply, and the vocabulary of epochs, iterations and batch size.",
      minutes: 20,
      objectives: ["You can contrast batch, stochastic and mini-batch gradient descent", "You can compute iterations per epoch", "You can explain why noisy mini-batch gradients still work and tend to find flatter minima"],
      load: () => import('./sgd-and-mini-batches.mdx'),
    },
    {
      slug: "momentum-and-adam",
      title: "Momentum, RMSProp and Adam",
      summary: "Smoothing gradients with moving averages and giving each parameter its own step size.",
      minutes: 20,
      objectives: ["You can explain an exponential moving average", "You can describe momentum, RMSProp and Adam in one sentence each", "You can choose between Adam/AdamW and SGD with momentum"],
      load: () => import('./momentum-and-adam.mdx'),
    },
    {
      slug: "initialisation-and-normalisation",
      title: "Initialisation, BatchNorm and LayerNorm",
      summary: "Starting weights at the right scale, and normalising activations so deep networks train stably.",
      minutes: 22,
      objectives: ["You can explain why all-zero initialisation fails (symmetry)", "You can choose Xavier or He initialisation", "You can describe BatchNorm's train and eval behaviour", "You can contrast BatchNorm and LayerNorm axes"],
      load: () => import('./initialisation-and-normalisation.mdx'),
    },
    {
      slug: "regularising-deep-networks",
      title: "Dropout, weight decay, early stopping and augmentation",
      summary: "Keeping big networks from memorising the training set.",
      minutes: 18,
      objectives: ["You can describe dropout at train and test time", "You can explain weight decay and AdamW", "You can apply early stopping with patience", "You can explain how augmentation regularises"],
      load: () => import('./regularising-deep-networks.mdx'),
    },
    {
      slug: "learning-rate-warmup-schedules",
      title: "Learning-rate schedules and warm-up",
      summary: "Finding a good learning rate, warm-up for Adam and Transformers, and reading what schedules do to the loss curve.",
      minutes: 20,
      objectives: ["You can use a learning-rate range test", "You can explain why warm-up stabilises early training", "You can compute the learning rate at a step for warm-up + cosine", "You can predict the loss curve under step decay"],
      load: () => import('./learning-rate-warmup-schedules.mdx'),
    },
    {
      slug: "stability-and-scale",
      title: "Gradient clipping, mixed precision and accumulation",
      summary: "Tools for stable and memory-efficient training: clipping exploding gradients, FP16/BF16 with loss scaling, and simulating big batches.",
      minutes: 20,
      objectives: ["You can explain gradient-norm clipping", "You can explain FP16 underflow/overflow and why loss scaling (GradScaler) is used", "You can compute the effective batch size with accumulation", "You can explain linear learning-rate scaling for large batches"],
      load: () => import('./stability-and-scale.mdx'),
    },
  ],
}

export default mod
