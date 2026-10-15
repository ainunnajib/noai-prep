/*
  The concept clusters of the 2026 Prelim's AI/ML/DL block (Q120–178), Generative AI block (Q179–237)
  and the short generative and multimodal definitions that opened the Problem-solving block (Q238–255).
  Every one of those 136 questions sits in exactly one cluster.
*/

export interface Cluster {
  id: string
  name: string
  short: string
  colour: string
  items: number[]
  tests: string
  pairs: string[]
  lessons: { href: string; label: string }[]
}

const L = (m: string, l: string, label: string) => ({ href: `#/learn/${m}/${l}`, label })
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i)

export const CLUSTERS: Cluster[] = [
  {
    id: 'nn',
    name: 'Neural-network parts and training tricks',
    short: 'NN parts and training tricks',
    colour: 'var(--viz-1)',
    items: [132, 161, 162, 163, 164, 165, 166, 167, 168, 170, 172, 173, 174, 175, 176, 177, 179, 180, 181, 182, 183, 184, 185, 222],
    tests: 'Activations (ReLU, sigmoid, softmax), backprop, epochs and batches, initialisation, normalisation, residual connections, learning-rate schedules and gradient clipping.',
    pairs: ['Xavier (tanh, sigmoid) vs He (ReLU)', 'BatchNorm (across the batch) vs LayerNorm (across features)', 'sigmoid (0 to 1, slope ≤ ¼) vs ReLU (slope 1 when positive)', 'vanishing vs exploding gradients'],
    lessons: [L('neural-networks', 'activation-functions', 'Activation functions'), L('training-deep-networks', 'initialisation-and-normalisation', 'Initialisation, BatchNorm and LayerNorm')],
  },
  {
    id: 'cnn',
    name: 'CNNs and computer vision',
    short: 'CNNs and vision',
    colour: 'var(--viz-2)',
    items: [...range(186, 205), 223],
    tests: 'Convolution, pooling, stride, padding, receptive fields, ResNet, transfer learning, detection (YOLO, R-CNN) and segmentation (semantic, instance, U-Net).',
    pairs: ['semantic (a class per pixel) vs instance segmentation (which object each pixel belongs to)', 'YOLO (one stage) vs R-CNN (propose regions, then classify)', 'one 5×5 vs two stacked 3×3 convolutions'],
    lessons: [L('convolutional-networks', 'pooling-and-receptive-field', 'Pooling and receptive fields'), L('vision-tasks', 'vision-tasks-and-detection', 'Vision tasks and object detection')],
  },
  {
    id: 'classic',
    name: 'Classical ML models and evaluation',
    short: 'Classical ML',
    colour: 'var(--viz-3)',
    items: [136, 137, 138, 139, 140, 141, 143, 144, 145, 146, 150, 153, 156, 157, 158, 159, 160, 171],
    tests: 'Supervised vs unsupervised, regression vs classification, k-NN, trees, SVMs, Naive Bayes, PCA, k-means, the curse of dimensionality, validation, cross-validation and ROC curves.',
    pairs: ['supervised (labels) vs unsupervised (no labels)', 'validation set (tuning) vs test set (final check)', 'hard margin vs soft margin SVM', 'ROC (TPR vs FPR) vs precision–recall'],
    lessons: [L('classification', 'support-vector-machines', 'Support vector machines'), L('model-evaluation', 'cross-validation-and-tuning', 'Cross-validation and tuning')],
  },
  {
    id: 'nlp',
    name: 'NLP and Transformers',
    short: 'NLP and Transformers',
    colour: 'var(--viz-4)',
    items: [206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 218, 219, 220, 224, 236],
    tests: 'Embeddings, Word2Vec, RNNs and LSTMs, attention, positional encoding, BERT, tokenisation, the CLS token, O(n²) attention cost and causal masking.',
    pairs: ['BERT (encoder, both directions) vs GPT (decoder, left to right)', 'masked-token vs next-token training', 'RNN vs LSTM (gates keep long-range memory)'],
    lessons: [L('pretrained-models-text-speech', 'bert-and-gpt', 'BERT and GPT'), L('attention-and-transformers', 'scaled-dot-product-attention', 'Scaled dot-product attention and masks')],
  },
  {
    id: 'torch',
    name: 'PyTorch tools and debugging',
    short: 'PyTorch and debugging',
    colour: 'var(--viz-5)',
    items: [120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 133, 134, 135],
    tests: 'nn.Sequential, freezing layers, DataLoader, saving with state_dict, mixed precision, TorchScript, devices, .item() vs .detach(), and error messages (IndexError, CUDA out of memory, NaN loss).',
    pairs: ['.item() (Python number) vs .detach() (tensor off the graph)', 'CUDA out of memory → batch size, not the optimiser'],
    lessons: [L('pytorch', 'modules-and-layers', 'nn.Module, layers and saving'), L('pytorch', 'devices-and-common-errors', 'GPUs, devices and common errors')],
  },
  {
    id: 'llm',
    name: 'LLMs: decoding, adaptation and prompting',
    short: 'LLMs',
    colour: 'var(--viz-6)',
    items: [217, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 237],
    tests: 'GPT, autoregressive generation, temperature, top-k, zero- and few-shot prompting, fine-tuning vs prompting, LoRA and RAG.',
    pairs: ['temperature (reshapes all probabilities) vs top-k (keeps only k tokens)', 'zero-shot vs few-shot', 'fine-tuning (weights change) vs prompting (weights fixed)', 'LoRA vs full fine-tuning'],
    lessons: [L('large-language-models', 'decoding-and-sampling', 'Decoding and sampling'), L('large-language-models', 'fine-tuning-and-lora', 'Fine-tuning and LoRA')],
  },
  {
    id: 'mm',
    name: 'Multimodal models',
    short: 'Multimodal',
    colour: 'color-mix(in srgb, var(--viz-1) 55%, var(--viz-3))',
    items: [246, 247, 248, 249, 250, 251, 252, 253, 254, 255],
    tests: 'CLIP and contrastive learning, zero-shot image classification, ViT patches, Flamingo, GPT-4V and cross-attention.',
    pairs: ['self-attention (one sequence) vs cross-attention (one modality looks at another)', 'CLIP (aligns images and text) vs a captioning model (generates text)'],
    lessons: [L('multimodal-ai', 'clip-and-zero-shot', 'CLIP and zero-shot'), L('multimodal-ai', 'vision-language-models', 'Vision-language models')],
  },
  {
    id: 'gen',
    name: 'Diffusion and generative models',
    short: 'Diffusion and generative',
    colour: 'color-mix(in srgb, var(--viz-4) 55%, var(--viz-2))',
    items: [225, 238, 239, 240, 241, 242, 243, 244, 245],
    tests: 'Generative vs discriminative models, forward and reverse diffusion, latent diffusion, classifier-free guidance, DDPM and why diffusion is slower than a GAN.',
    pairs: ['forward process (adds noise, fixed) vs reverse process (removes noise, learnt)', 'DDPM (random) vs DDIM (deterministic)', 'diffusion (many steps) vs GAN (one step)'],
    lessons: [L('generative-models', 'diffusion-models', 'Diffusion models'), L('generative-models', 'generative-vs-discriminative', 'Generative vs discriminative')],
  },
  {
    id: 'biasvar',
    name: 'Bias–variance and regularisation',
    short: 'Bias–variance',
    colour: 'color-mix(in srgb, var(--viz-5) 55%, var(--viz-2))',
    items: [142, 147, 148, 149, 169, 178],
    tests: 'Overfitting, the bias–variance trade-off, L1 vs L2, dropout and early stopping.',
    pairs: ['L1 (sparse, many zeros) vs L2 (small, non-zero weights)', 'underfitting (high bias) vs overfitting (high variance)'],
    lessons: [L('ml-fundamentals', 'generalisation-and-overfitting', 'Generalisation and overfitting'), L('linear-regression', 'regularisation', 'L1 and L2 regularisation')],
  },
  {
    id: 'ens',
    name: 'Ensembles',
    short: 'Ensembles',
    colour: 'color-mix(in srgb, var(--viz-6) 55%, var(--viz-3))',
    items: [151, 152, 154, 155, 221],
    tests: 'Random forests, gradient boosting, what bagging and boosting each reduce, and out-of-bag error.',
    pairs: ['bagging (parallel, cuts variance) vs boosting (sequential, cuts bias)'],
    lessons: [L('trees-and-ensembles', 'bagging-and-random-forests', 'Bagging and random forests'), L('trees-and-ensembles', 'boosting-adaboost', 'Boosting and AdaBoost')],
  },
]

export const CLUSTER_TOTAL = CLUSTERS.reduce((a, c) => a + c.items.length, 0)

/** which 2026 block a question number sits in */
export function blockOf(n: number) {
  if (n <= 178) return 'AI/ML/DL block'
  if (n <= 237) return 'Generative AI block'
  return 'Problem-solving block'
}
