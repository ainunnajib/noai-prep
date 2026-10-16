// Generated from src/data/papers/*.json (subtopic counts per paper). Do not edit by hand.
export interface TrendRow {
  id: string
  name: string
  counts: [number, number, number]
  lessons: { to: string; title: string }[]
}
export const PAPER_SIZES: [number, number, number] = [20, 300, 20]
export const TREND_ROWS: TrendRow[] = [
  { id: "cnn-vision", name: "CNNs and vision", counts: [5, 23, 2], lessons: [{ to: "convolutional-networks/convolution", title: "The convolution operation" }, { to: "vision-tasks/vision-tasks-and-detection", title: "Vision tasks and object detection" }] },
  { id: "training-regularisation", name: "Training and regularisation", counts: [3, 23, 4], lessons: [{ to: "training-deep-networks/regularising-deep-networks", title: "Dropout, weight decay, early stopping and augmentation" }, { to: "training-deep-networks/learning-rate-warmup-schedules", title: "Learning-rate schedules and warm-up" }] },
  { id: "pytorch", name: "PyTorch", counts: [0, 24, 2], lessons: [{ to: "pytorch/autograd", title: "Autograd: automatic gradients" }, { to: "pytorch/training-loop", title: "The training loop" }] },
  { id: "linear-algebra", name: "Linear algebra", counts: [0, 25, 0], lessons: [{ to: "vectors-and-matrices/matrices-and-multiplication", title: "Matrices, shapes and matrix multiplication" }, { to: "linear-algebra-deeper/eigenvectors-eigenvalues", title: "Eigenvectors and eigenvalues" }] },
  { id: "nlp-transformers", name: "NLP and Transformers", counts: [4, 12, 4], lessons: [{ to: "attention-and-transformers/scaled-dot-product-attention", title: "Scaled dot-product attention and masks" }, { to: "text-as-data/tokenisation", title: "Tokenisation, vocabularies and padding" }] },
  { id: "optimisation", name: "Optimisation", counts: [1, 17, 0], lessons: [{ to: "calculus-and-gradient-descent/gradient-descent", title: "Gradient descent on a loss landscape" }, { to: "training-deep-networks/momentum-and-adam", title: "Momentum, RMSProp and Adam" }] },
  { id: "probability-statistics", name: "Probability and statistics", counts: [0, 16, 0], lessons: [{ to: "probability-and-statistics/bayes-theorem", title: "Bayes' theorem" }, { to: "probability-and-statistics/distributions-and-clt", title: "Distributions, the normal curve and the CLT" }] },
  { id: "python", name: "Python", counts: [0, 15, 0], lessons: [{ to: "python-toolkit/references-mutability", title: "Names, references and surprises" }, { to: "python-toolkit/iteration-tools", title: "Comprehensions, zip, enumerate and generators" }] },
  { id: "calculus", name: "Calculus", counts: [0, 14, 0], lessons: [{ to: "calculus-and-gradient-descent/derivative-rules", title: "Derivative rules you must know cold" }, { to: "calculus-and-gradient-descent/chain-rule", title: "The chain rule" }] },
  { id: "neural-networks", name: "Neural networks", counts: [1, 12, 1], lessons: [{ to: "neural-networks/activation-functions", title: "Activation functions and non-linearity" }, { to: "backpropagation/vanishing-and-exploding-gradients", title: "Vanishing and exploding gradients" }] },
  { id: "model-evaluation", name: "Model evaluation", counts: [1, 10, 2], lessons: [{ to: "model-evaluation/confusion-matrix-and-metrics", title: "Confusion matrix, precision, recall and F1" }, { to: "model-evaluation/cross-validation", title: "Cross-validation" }] },
  { id: "numpy", name: "NumPy", counts: [0, 12, 0], lessons: [{ to: "numpy/arrays-and-shapes", title: "Arrays, shape and dtype" }, { to: "numpy/broadcasting", title: "Broadcasting" }] },
  { id: "trees-ensembles", name: "Trees and ensembles", counts: [2, 7, 3], lessons: [{ to: "trees-and-ensembles/bagging-and-random-forests", title: "Bagging and random forests" }, { to: "trees-and-ensembles/boosting-adaboost", title: "Boosting and AdaBoost" }] },
  { id: "llms", name: "Large language models", counts: [1, 10, 0], lessons: [{ to: "large-language-models/decoding-and-sampling", title: "Decoding: greedy, beam search, temperature, top-k and top-p" }, { to: "large-language-models/fine-tuning-and-lora", title: "Fine-tuning and LoRA" }] },
  { id: "generative-models", name: "Generative models", counts: [0, 10, 0], lessons: [{ to: "generative-models/gans", title: "Generative adversarial networks" }, { to: "generative-models/diffusion-models", title: "Diffusion models" }] },
  { id: "ml-debugging-diagnosis", name: "ML debugging and diagnosis", counts: [0, 9, 1], lessons: [{ to: "debugging-and-diagnosis/reading-loss-curves", title: "Reading loss curves" }, { to: "debugging-and-diagnosis/data-bugs-and-shift", title: "Data bugs, leakage and distribution shift" }] },
  { id: "classification", name: "Classification", counts: [0, 8, 1], lessons: [{ to: "classification/logistic-regression", title: "Logistic regression" }, { to: "classification/softmax-and-multiclass", title: "Softmax, cross-entropy and multi-class problems" }] },
  { id: "multimodal", name: "Multimodal AI", counts: [0, 9, 0], lessons: [{ to: "multimodal-ai/clip-and-zero-shot", title: "CLIP: one space for images and words" }, { to: "multimodal-ai/vision-language-models", title: "Vision-language models" }] },
  { id: "code-debugging", name: "Code debugging", counts: [0, 6, 0], lessons: [{ to: "debugging-and-diagnosis/systematic-debugging", title: "Systematic debugging and shape bugs" }, { to: "python-toolkit/exceptions-debugging", title: "Exceptions and debugging" }] },
  { id: "ml-fundamentals", name: "ML fundamentals", counts: [0, 6, 0], lessons: [{ to: "ml-fundamentals/generalisation-and-overfitting", title: "Generalisation, overfitting and bias-variance" }, { to: "ml-fundamentals/curse-of-dimensionality", title: "The curse of dimensionality" }] },
  { id: "unsupervised", name: "Unsupervised learning", counts: [1, 5, 0], lessons: [{ to: "unsupervised-learning/pca", title: "Principal component analysis" }, { to: "unsupervised-learning/hierarchical-dbscan-spectral", title: "Hierarchical, DBSCAN and spectral clustering" }] },
  { id: "data-preprocessing", name: "Data preprocessing", counts: [0, 5, 0], lessons: [{ to: "data-and-features/scaling-and-normalisation", title: "Scaling, normalisation and standardisation" }, { to: "data-and-features/missing-data-and-outliers", title: "Missing data and outliers" }] },
  { id: "ml-system-design", name: "ML system design", counts: [0, 5, 0], lessons: [{ to: "ml-systems-and-tradeoffs/lifecycle-and-deployment", title: "The ML lifecycle, deployment and monitoring" }, { to: "ml-systems-and-tradeoffs/designing-ml-solutions", title: "Designing an ML solution under constraints" }] },
  { id: "optimisation-tradeoffs", name: "Compute and memory trade-offs", counts: [0, 5, 0], lessons: [{ to: "ml-systems-and-tradeoffs/compute-and-memory-tradeoffs", title: "Compute and memory trade-offs in training" }, { to: "training-deep-networks/stability-and-scale", title: "Gradient clipping, mixed precision and accumulation" }] },
  { id: "prompting-rag", name: "Prompting and RAG", counts: [0, 4, 0], lessons: [{ to: "prompting-and-rag/rag-pipeline", title: "The RAG pipeline" }] },
  { id: "pandas", name: "pandas", counts: [0, 3, 0], lessons: [{ to: "pandas-and-plotting/cleaning-data", title: "Cleaning data: missing values, types and duplicates" }, { to: "pandas-and-plotting/groupby-merge", title: "groupby, aggregation and merging" }] },
  { id: "sequence-models", name: "Sequence models", counts: [0, 3, 0], lessons: [{ to: "text-as-data/rnns-and-lstms", title: "Recurrent networks and LSTMs" }] },
  { id: "regression", name: "Regression", counts: [0, 2, 0], lessons: [{ to: "linear-regression/regression-by-gradient-descent", title: "Regression by gradient descent (from scratch)" }] },
  { id: "reinforcement-learning", name: "Reinforcement learning", counts: [1, 0, 0], lessons: [{ to: "ml-fundamentals/reinforcement-learning", title: "Reinforcement learning: learning from rewards" }] },
]
export const STYLE_KEYS = ["definition", "why-reasoning", "comparison", "scenario-diagnosis", "computation", "code-reading"] as const
export const STYLE_COUNTS: Record<string, number[]> = {
  noai2025: [14, 3, 2, 1, 0, 0],
  prelim2026: [166, 42, 34, 24, 21, 13],
  final2026: [0, 3, 1, 4, 1, 11],
}
