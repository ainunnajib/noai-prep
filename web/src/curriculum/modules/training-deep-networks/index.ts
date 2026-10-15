import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "training-deep-networks",
  order: 23,
  part: "deep-learning",
  domain: "ai_ml_dl",
  title: "Optimisers and training deep networks well",
  tagline: "Tricks that make deep learning work",
  summary: "Stochastic and mini-batch gradient descent, momentum, RMSProp, Adam and AdamW, weight initialisation, BatchNorm and LayerNorm, dropout, weight decay, early stopping and data augmentation, learning-rate range tests, schedules and warm-up, and the tools for stable training at scale: gradient clipping, mixed precision, gradient accumulation and learning-rate scaling for large batches.",
  prerequisites: ["pytorch", "calculus-and-gradient-descent"],
  syllabus: ["NOAI Mathematics: Optimisation", "IOAI 2B7 SGD, Mini-Batch Gradient Descent", "IOAI 2B8 Momentum Methods (Adam, AdamW)", "IOAI 2B9 Convergence and Learning Rates", "IOAI 2B10 Regularisation: Dropout, Early Stopping, Weight Decay", "IOAI 2B11 Weight Initialisation", "IOAI 2B12 Batch Normalisation", "NOAI: gradient clipping, mixed precision, gradient accumulation, warm-up and cosine schedules, LayerNorm"],
  lessons: [
    {
      slug: "sgd-and-mini-batches",
      title: "Stochastic and mini-batch gradient descent",
      summary: "Using small random batches to estimate the gradient cheaply, the vocabulary of epochs, iterations and batch size, and why noisy training tends to end up in flat minima.",
      minutes: 35,
      objectives: ["You can contrast batch, stochastic and mini-batch gradient descent, and say how the batch size changes the gradient noise and the number of updates", "You can compute the iterations per epoch and in total, with or without drop_last", "You can explain why noisy mini-batch gradients still work and why flat minima generalise better than sharp ones"],
      load: () => import('./sgd-and-mini-batches.mdx'),
    },
    {
      slug: "momentum-and-adam",
      title: "Momentum, RMSProp and Adam",
      summary: "Smoothing gradients with moving averages (momentum), giving each parameter its own step size (RMSProp), and combining the two in Adam and AdamW.",
      minutes: 30,
      objectives: ["You can compute an exponential moving average by hand and explain bias correction", "You can explain how momentum damps zig-zags and why RMSProp keeps learning where Adagrad stalls", "You can work out the size of Adam's first step and explain why it is about the learning rate whatever the gradient", "You can explain why AdamW applies weight decay outside Adam's per-parameter scaling"],
      load: () => import('./momentum-and-adam.mdx'),
    },
    {
      slug: "initialisation-and-normalisation",
      title: "Initialisation, BatchNorm and LayerNorm",
      summary: "Starting weights at the right scale, and normalising activations so deep networks train stably.",
      minutes: 30,
      objectives: ["You can explain why equal or all-zero initial weights fail (symmetry)", "You can choose Xavier or He initialisation and work out its standard deviation", "You can apply BatchNorm to a batch by hand and describe how it behaves in training and evaluation mode", "You can contrast BatchNorm and LayerNorm and explain why Transformers use LayerNorm"],
      load: () => import('./initialisation-and-normalisation.mdx'),
    },
    {
      slug: "regularising-deep-networks",
      title: "Dropout, weight decay, early stopping and augmentation",
      summary: "Keeping big networks from memorising the training set with dropout, weight decay and AdamW, early stopping and data augmentation.",
      minutes: 30,
      objectives: ["You can describe what dropout does at training and test time and how much the surviving neurons are scaled up", "You can work out a weight-decay update by hand and explain what it does to the weights", "You can trace early stopping with a given patience and say which checkpoint is restored", "You can choose data augmentations that keep the label true"],
      load: () => import('./regularising-deep-networks.mdx'),
    },
    {
      slug: "learning-rate-warmup-schedules",
      title: "Learning-rate schedules and warm-up",
      summary: "Finding a good learning rate with a range test, step, cosine and 1cycle schedules, warm-up for Adam and Transformers, and reading what schedules do to the loss curve.",
      minutes: 30,
      objectives: ["You can read a learning-rate range test and pick a learning rate from it", "You can explain why warm-up stabilises the early training of Adam and Transformers", "You can compute the learning rate at any step of a warm-up plus cosine or step-decay schedule", "You can recognise a schedule from the loss curve and contrast 1cycle with ReduceLROnPlateau"],
      load: () => import('./learning-rate-warmup-schedules.mdx'),
    },
    {
      slug: "stability-and-scale",
      title: "Gradient clipping, mixed precision and accumulation",
      summary: "Tools for stable and memory-efficient training: clipping exploding gradients, FP16 and BF16 with loss scaling, simulating big batches with gradient accumulation, and scaling the learning rate for large batches.",
      minutes: 35,
      objectives: ["You can clip gradients by their global norm and place the clip correctly in a mixed-precision training loop", "You can explain FP16 underflow and overflow, why loss scaling (GradScaler) fixes them and why BF16 needs no scaling", "You can compute the effective batch size with gradient accumulation and several GPUs", "You can apply the linear scaling rule for large batches and say when LARS or LAMB is needed"],
      load: () => import('./stability-and-scale.mdx'),
    },
  ],
}

export default mod
