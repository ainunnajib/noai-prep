import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Figure, Segmented, useNarrow } from '../../../../../kit'
import { LINKS } from '../../../../../data/facts'
import styles from './roadmap.module.css'

/*
  Every subtopic of the IOAI 2026 syllabus (the latest published), with the syllabus's own
  category (Theory / Practice / Both) and how deeply THIS course covers it:
    3 = in depth: theory plus worked code (often from scratch)
    2 = solid: concepts and examples; practise more with the library
    1 = introduced: you know what it is; IOAI expects hands-on practice beyond this course
  Filter by section and category; click a cell for lessons, what IOAI adds and a free resource.
  Depth is shown by shape as well as colour, so it reads the same in light and dark mode:
  solid fill = in depth, light tint = solid, dashed outline with no fill = introduced only.
*/

type Cat = 'T' | 'P' | 'B'
interface Lnk {
  to: string
  label: string
}
interface Topic {
  sec: 1 | 2 | 3 | 4
  name: string
  cat: Cat
  depth: 1 | 2 | 3
  lessons: Lnk[]
  beyond: string
  res: [string, string]
}

const L = (m: string, l: string, label: string): Lnk => ({ to: `/learn/${m}/${l}`, label })
const SK = (path: string): [string, string] => ['scikit-learn user guide', `https://scikit-learn.org/stable/modules/${path}`]
const PT: [string, string] = ['PyTorch tutorials', 'https://pytorch.org/tutorials/']
const HF: [string, string] = ['Hugging Face Learn (free courses)', 'https://huggingface.co/learn']
const HFDOC = (m: string, label: string): [string, string] => [`Hugging Face docs: ${label}`, `https://huggingface.co/docs/transformers/model_doc/${m}`]

const TOPICS: Topic[] = [
  // §1 Foundational skills and classical ML
  { sec: 1, name: 'Python basics', cat: 'P', depth: 3, lessons: [L('python-basics', 'loops', 'Loops'), L('python-toolkit', 'functions', 'Functions')], beyond: 'Write small scripts daily without AI autocomplete.', res: ['Python tutorial', 'https://docs.python.org/3/tutorial/'] },
  { sec: 1, name: 'NumPy and pandas', cat: 'P', depth: 3, lessons: [L('numpy', 'broadcasting', 'Broadcasting'), L('pandas-and-plotting', 'groupby-merge', 'groupby and merge')], beyond: 'Clean a messy real CSV end to end (missing values, types, group features).', res: ['pandas: getting started', 'https://pandas.pydata.org/docs/getting_started/index.html'] },
  { sec: 1, name: 'Matplotlib and seaborn', cat: 'P', depth: 2, lessons: [L('pandas-and-plotting', 'plotting-data', 'Plotting data')], beyond: 'Plot class balance, loss curves and errors in every practice task.', res: ['seaborn tutorial', 'https://seaborn.pydata.org/tutorial.html'] },
  { sec: 1, name: 'scikit-learn', cat: 'P', depth: 2, lessons: [L('ml-fundamentals', 'first-sklearn-model', 'First sklearn model'), L('model-evaluation', 'cross-validation', 'Cross-validation')], beyond: 'Pipelines, ColumnTransformer and leak-free cross-validation on real tables.', res: SK('compose.html') },
  { sec: 1, name: 'PyTorch basics', cat: 'P', depth: 3, lessons: [L('pytorch', 'modules-and-layers', 'nn.Module'), L('pytorch', 'training-loop', 'Training loop')], beyond: 'Write the training loop from memory, including eval mode and checkpoints.', res: PT },
  { sec: 1, name: 'Tensor manipulation', cat: 'P', depth: 3, lessons: [L('pytorch', 'tensors', 'Tensors'), L('final-lab-pytorch', 'torch-exam-patterns', 'Exam patterns')], beyond: 'Shape surgery on real batches: images (N, C, H, W), padded text, audio.', res: PT },
  { sec: 1, name: 'Training on CPU and GPU', cat: 'P', depth: 1, lessons: [L('pytorch', 'devices-and-common-errors', 'Devices and errors')], beyond: 'Train real models on a free cloud GPU; manage memory and time budgets.', res: PT },
  { sec: 1, name: 'Linear regression', cat: 'B', depth: 3, lessons: [L('linear-regression', 'least-squares', 'Least squares'), L('final-lab-numpy', 'task-linear-regression-gd', '2025 Final task')], beyond: 'Feature engineering for linear models under constraints (IOAI 2024).', res: SK('linear_model.html') },
  { sec: 1, name: 'Logistic regression', cat: 'B', depth: 3, lessons: [L('classification', 'logistic-regression', 'Logistic regression')], beyond: 'Use it as a fast baseline and as a linear probe on embeddings.', res: SK('linear_model.html') },
  { sec: 1, name: 'L1 and L2 regularisation', cat: 'B', depth: 3, lessons: [L('linear-regression', 'regularisation', 'Regularisation')], beyond: 'Tune the strength by cross-validation.', res: SK('linear_model.html') },
  { sec: 1, name: 'k-nearest neighbours', cat: 'B', depth: 3, lessons: [L('classification', 'k-nearest-neighbours', 'k-NN')], beyond: 'k-NN on frozen embeddings with cosine distance.', res: SK('neighbors.html') },
  { sec: 1, name: 'Decision trees', cat: 'B', depth: 3, lessons: [L('trees-and-ensembles', 'decision-trees', 'Decision trees')], beyond: 'Read feature importances; know when trees overfit.', res: SK('tree.html') },
  { sec: 1, name: 'Ensembles: boosting, bagging, forests', cat: 'P', depth: 3, lessons: [L('trees-and-ensembles', 'gradient-boosting', 'Gradient boosting'), L('final-lab-numpy', 'task-gradient-boosting', '2026 Final task')], beyond: 'XGBoost, LightGBM and CatBoost on tabular tasks, with early stopping.', res: SK('ensemble.html') },
  { sec: 1, name: 'Support vector machines', cat: 'B', depth: 2, lessons: [L('classification', 'support-vector-machines', 'SVMs and kernels')], beyond: 'Scale features first; try RBF kernels on small data.', res: SK('svm.html') },
  { sec: 1, name: 'k-means', cat: 'B', depth: 3, lessons: [L('unsupervised-learning', 'k-means', 'k-means'), L('final-lab-numpy', 'task-kmeans', '2025 Final task')], beyond: 'Clustering embeddings to explore unlabelled data.', res: SK('clustering.html') },
  { sec: 1, name: 'PCA', cat: 'B', depth: 3, lessons: [L('unsupervised-learning', 'pca', 'PCA'), L('linear-algebra-deeper', 'covariance-and-pca', 'Covariance and PCA')], beyond: 'PCA as compact features under a feature cap (IOAI 2024).', res: SK('decomposition.html') },
  { sec: 1, name: 't-SNE and UMAP', cat: 'P', depth: 2, lessons: [L('unsupervised-learning', 'tsne-umap-and-anomalies', 't-SNE and UMAP')], beyond: 'Visualise embeddings to see whether classes separate.', res: SK('manifold.html') },
  { sec: 1, name: 'DBSCAN, hierarchical, spectral', cat: 'P', depth: 2, lessons: [L('unsupervised-learning', 'hierarchical-dbscan-spectral', 'Other clustering')], beyond: 'Know which to pick for odd-shaped clusters and noise.', res: SK('clustering.html') },
  { sec: 1, name: 'Evaluation metrics', cat: 'B', depth: 3, lessons: [L('model-evaluation', 'confusion-matrix-and-metrics', 'Metrics'), L('model-evaluation', 'regression-and-overlap-metrics', 'Regression metrics, IoU')], beyond: 'Optimise exactly the task metric (macro-F1, mIoU, RMSE) in validation.', res: SK('model_evaluation.html') },
  { sec: 1, name: 'Underfitting and overfitting', cat: 'T', depth: 3, lessons: [L('ml-fundamentals', 'generalisation-and-overfitting', 'Generalisation')], beyond: 'Diagnose from learning curves during real training runs.', res: ['d2l.ai (Dive into Deep Learning)', 'https://d2l.ai/'] },
  { sec: 1, name: 'Hyperparameter tuning', cat: 'P', depth: 2, lessons: [L('model-evaluation', 'hyperparameter-tuning', 'Tuning')], beyond: 'Small, logged searches under a time budget.', res: SK('grid_search.html') },
  { sec: 1, name: 'Cross-validation', cat: 'P', depth: 3, lessons: [L('model-evaluation', 'cross-validation', 'Cross-validation'), L('data-and-features', 'splitting-and-leakage', 'Splitting and leakage')], beyond: 'Make folds that mirror the hidden test set (groups, time).', res: SK('cross_validation.html') },
  { sec: 1, name: 'Confusion matrix and ROC', cat: 'B', depth: 3, lessons: [L('model-evaluation', 'roc-and-pr-curves', 'ROC and PR curves')], beyond: 'Pick thresholds for the task metric, not 0.5 by habit.', res: SK('model_evaluation.html') },
  { sec: 1, name: 'Feature engineering', cat: 'P', depth: 2, lessons: [L('data-and-features', 'feature-engineering', 'Feature engineering')], beyond: 'Group statistics and domain features: often the winning move.', res: ['Kaggle Learn', 'https://www.kaggle.com/learn'] },
  { sec: 1, name: 'Data processing', cat: 'P', depth: 2, lessons: [L('data-and-features', 'missing-data-and-outliers', 'Missing data'), L('data-and-features', 'scaling-and-normalisation', 'Scaling')], beyond: 'Padding, tokenising and patching real text, audio and images.', res: SK('preprocessing.html') },
  // §2 Neural networks and deep learning
  { sec: 2, name: 'Perceptron', cat: 'B', depth: 3, lessons: [L('neural-networks', 'perceptron', 'Perceptron')], beyond: 'Mostly theory; know it cold.', res: ['d2l.ai', 'https://d2l.ai/'] },
  { sec: 2, name: 'Gradient descent', cat: 'B', depth: 3, lessons: [L('calculus-and-gradient-descent', 'gradient-descent', 'Gradient descent')], beyond: 'Read real loss curves and fix learning rates.', res: ['d2l.ai', 'https://d2l.ai/'] },
  { sec: 2, name: 'Backpropagation', cat: 'B', depth: 3, lessons: [L('backpropagation', 'backprop-step-by-step', 'Backprop by hand'), L('pytorch', 'autograd', 'Autograd')], beyond: 'Use gradients creatively: input gradients, saliency.', res: PT },
  { sec: 2, name: 'Activation functions', cat: 'B', depth: 3, lessons: [L('neural-networks', 'activation-functions', 'Activations')], beyond: 'Know which each architecture uses (GELU in Transformers).', res: ['PyTorch nn docs', 'https://pytorch.org/docs/stable/nn.html'] },
  { sec: 2, name: 'Loss functions', cat: 'B', depth: 3, lessons: [L('neural-networks', 'outputs-and-losses', 'Outputs and losses'), L('road-to-ioai', 'ioai-task-techniques', 'Focal loss')], beyond: 'Weighted, focal and custom losses for odd metrics.', res: ['PyTorch nn docs', 'https://pytorch.org/docs/stable/nn.html'] },
  { sec: 2, name: 'Multi-layer perceptrons', cat: 'B', depth: 3, lessons: [L('neural-networks', 'multilayer-perceptrons', 'MLPs'), L('backpropagation', 'network-from-scratch', 'Network from scratch')], beyond: 'Small MLP heads on top of frozen features.', res: PT },
  { sec: 2, name: 'Embeddings (text, image, audio)', cat: 'B', depth: 2, lessons: [L('text-as-data', 'word-embeddings', 'Word embeddings'), L('multimodal-ai', 'clip-and-zero-shot', 'CLIP')], beyond: 'Extract, cache and reuse embeddings from pretrained encoders.', res: HF },
  { sec: 2, name: 'Pooling', cat: 'B', depth: 3, lessons: [L('convolutional-networks', 'pooling-and-receptive-field', 'Pooling')], beyond: 'Mean-pooling token embeddings into one vector.', res: PT },
  { sec: 2, name: 'Attention', cat: 'B', depth: 3, lessons: [L('attention-and-transformers', 'scaled-dot-product-attention', 'Scaled dot-product'), L('final-lab-pytorch', 'task-attention', '2026 Final task')], beyond: 'Read attention code inside library models.', res: ['d2l.ai', 'https://d2l.ai/'] },
  { sec: 2, name: 'Transformers', cat: 'B', depth: 3, lessons: [L('attention-and-transformers', 'positional-encoding-and-blocks', 'Transformer block'), L('multimodal-ai', 'vision-transformers', 'Vision Transformers')], beyond: 'Load, fine-tune and run Transformers from Hugging Face.', res: HF },
  { sec: 2, name: 'Autoencoders', cat: 'P', depth: 2, lessons: [L('generative-models', 'autoencoders-and-vaes', 'Autoencoders and VAEs')], beyond: 'Train one for anomaly detection or compression.', res: PT },
  { sec: 2, name: 'SGD and mini-batches', cat: 'B', depth: 3, lessons: [L('training-deep-networks', 'sgd-and-mini-batches', 'SGD and mini-batches')], beyond: 'Batch size versus GPU memory in practice.', res: ['PyTorch optim docs', 'https://pytorch.org/docs/stable/optim.html'] },
  { sec: 2, name: 'Adam and AdamW', cat: 'P', depth: 3, lessons: [L('training-deep-networks', 'momentum-and-adam', 'Momentum and Adam')], beyond: 'Parameter groups with different learning rates.', res: ['PyTorch optim docs', 'https://pytorch.org/docs/stable/optim.html'] },
  { sec: 2, name: 'Convergence and learning rates', cat: 'P', depth: 2, lessons: [L('training-deep-networks', 'learning-rate-warmup-schedules', 'LR schedules'), L('debugging-and-diagnosis', 'reading-loss-curves', 'Reading loss curves')], beyond: 'Warm-up and cosine schedules on real fine-tuning runs.', res: ['PyTorch optim docs', 'https://pytorch.org/docs/stable/optim.html'] },
  { sec: 2, name: 'Dropout, early stopping, weight decay', cat: 'P', depth: 3, lessons: [L('training-deep-networks', 'regularising-deep-networks', 'Regularising networks')], beyond: 'Early-stop on the task metric, not the loss.', res: PT },
  { sec: 2, name: 'Weight initialisation', cat: 'P', depth: 2, lessons: [L('training-deep-networks', 'initialisation-and-normalisation', 'Initialisation')], beyond: 'Mostly library defaults; know when they break.', res: ['PyTorch nn.init docs', 'https://pytorch.org/docs/stable/nn.init.html'] },
  { sec: 2, name: 'Batch normalisation', cat: 'P', depth: 2, lessons: [L('training-deep-networks', 'initialisation-and-normalisation', 'BatchNorm and LayerNorm')], beyond: 'Train versus eval mode in frozen backbones.', res: PT },
  { sec: 2, name: 'Fine-tuning (full and PEFT)', cat: 'P', depth: 1, lessons: [L('large-language-models', 'fine-tuning-and-lora', 'Fine-tuning and LoRA'), L('vision-tasks', 'transfer-learning-and-augmentation', 'Transfer learning')], beyond: 'Fine-tune with the peft library (LoRA) and Trainer on a GPU.', res: ['Hugging Face PEFT docs', 'https://huggingface.co/docs/peft/index'] },
  // §3 Computer vision
  { sec: 3, name: 'Convolutional layers', cat: 'B', depth: 3, lessons: [L('convolutional-networks', 'convolution', 'Convolution'), L('convolutional-networks', 'padding-stride-shapes', 'Shapes')], beyond: 'Shape arithmetic for real architectures.', res: ['CS231n notes', 'https://cs231n.github.io/'] },
  { sec: 3, name: 'Image classification', cat: 'P', depth: 2, lessons: [L('convolutional-networks', 'cnn-architectures-and-resnets', 'CNNs and ResNets')], beyond: 'Train and fine-tune on CIFAR-10-sized data to convergence.', res: PT },
  { sec: 3, name: 'Object detection (YOLO, SSD, DETR)', cat: 'P', depth: 1, lessons: [L('vision-tasks', 'vision-tasks-and-detection', 'Detection')], beyond: 'Fine-tune a torchvision or Hugging Face detector; read box formats.', res: ['torchvision detection tutorial', 'https://pytorch.org/tutorials/intermediate/torchvision_tutorial.html'] },
  { sec: 3, name: 'Segmentation (U-Net)', cat: 'P', depth: 3, lessons: [L('vision-tasks', 'u-net-segmentation', 'U-Net'), L('final-lab-pytorch', 'task-mean-iou', 'Mean IoU task')], beyond: 'Pretrained encoders and joint image–mask augmentation.', res: PT },
  { sec: 3, name: 'Pretrained vision encoders', cat: 'P', depth: 2, lessons: [L('vision-tasks', 'transfer-learning-and-augmentation', 'Transfer learning')], beyond: 'torchvision weights, ImageNet normalisation, swapping heads.', res: ['torchvision models', 'https://pytorch.org/vision/stable/models.html'] },
  { sec: 3, name: 'Image augmentation', cat: 'P', depth: 2, lessons: [L('vision-tasks', 'transfer-learning-and-augmentation', 'Augmentation')], beyond: 'Augmentations that keep labels valid; test-time augmentation.', res: ['torchvision transforms', 'https://pytorch.org/vision/stable/transforms.html'] },
  { sec: 3, name: 'GANs', cat: 'P', depth: 2, lessons: [L('generative-models', 'gans', 'GANs')], beyond: 'Train a DCGAN; read its two loss curves.', res: PT },
  { sec: 3, name: 'Self-supervised vision', cat: 'P', depth: 2, lessons: [L('multimodal-ai', 'self-supervised-vision', 'Self-supervised vision')], beyond: 'Use DINO-style features as frozen embeddings.', res: HF },
  { sec: 3, name: 'Vision–text encoders (CLIP)', cat: 'P', depth: 2, lessons: [L('multimodal-ai', 'clip-and-zero-shot', 'CLIP')], beyond: 'Zero-shot prompts, prompt ensembles, linear probes on cached features.', res: HFDOC('clip', 'CLIP') },
  { sec: 3, name: 'Diffusion models', cat: 'P', depth: 1, lessons: [L('generative-models', 'diffusion-models', 'Diffusion models')], beyond: 'Run and steer a pipeline with the diffusers library.', res: ['Hugging Face diffusers docs', 'https://huggingface.co/docs/diffusers/index'] },
  // §4 NLP and audio
  { sec: 4, name: 'Text classification', cat: 'P', depth: 2, lessons: [L('text-as-data', 'text-classification', 'Text classification')], beyond: 'Fine-tune an encoder; handle imbalance and unlabelled text.', res: HF },
  { sec: 4, name: 'Pretrained text encoders (BERT)', cat: 'B', depth: 2, lessons: [L('pretrained-models-text-speech', 'bert-and-gpt', 'BERT and GPT')], beyond: 'Tokenisers, attention masks and [CLS] features in code.', res: HFDOC('bert', 'BERT') },
  { sec: 4, name: 'Language modelling', cat: 'B', depth: 3, lessons: [L('large-language-models', 'how-llms-are-built', 'How LLMs are built'), L('large-language-models', 'decoding-and-sampling', 'Decoding')], beyond: 'Score text with a small LM; continued pre-training.', res: HF },
  { sec: 4, name: 'Encoder–decoder models', cat: 'P', depth: 2, lessons: [L('pretrained-models-text-speech', 'encoder-decoder-models', 'Encoder–decoder models')], beyond: 'Run T5- or Whisper-style models with generate().', res: HFDOC('t5', 'T5') },
  { sec: 4, name: 'Pretrained LMs (open and API)', cat: 'P', depth: 2, lessons: [L('prompting-and-rag', 'prompt-engineering', 'Prompting'), L('prompting-and-rag', 'rag-pipeline', 'RAG')], beyond: 'Use a small open model, and an in-contest assistant LLM, efficiently.', res: HF },
  { sec: 4, name: 'Audio encoders (HuBERT)', cat: 'P', depth: 1, lessons: [L('pretrained-models-text-speech', 'audio-as-data', 'Sound as data'), L('pretrained-models-text-speech', 'speech-models', 'Speech models')], beyond: 'Extract HuBERT features and train a small classifier on them.', res: HFDOC('hubert', 'HuBERT') },
  { sec: 4, name: 'Audio models (Whisper, Qwen-Audio, Voxtral)', cat: 'P', depth: 1, lessons: [L('pretrained-models-text-speech', 'speech-models', 'Speech models')], beyond: 'Transcribe and embed audio; IOAI 2026 opened with an audio task.', res: ['Hugging Face audio course', 'https://huggingface.co/learn/audio-course'] },
]

const SECTIONS = ['Foundational skills and classical ML', 'Neural networks and deep learning', 'Computer vision', 'NLP and audio']
const CAT_NAME: Record<Cat, string> = { T: 'Theory', P: 'Practice', B: 'Both' }
const CAT_MEAN: Record<Cat, string> = {
  T: 'Theory: understand how and why it works.',
  P: 'Practice: know when to use it and how to run it with a library.',
  B: 'Both: understand it and implement or use it in code.',
}
const DEPTH: Record<1 | 2 | 3, { name: string; key: string }> = {
  3: { name: 'in depth (theory + code)', key: 'solid fill, in depth' },
  2: { name: 'solid (concepts + examples)', key: 'light tint, solid' },
  1: { name: 'introduced (practise beyond the course)', key: 'dashed, introduced only' },
}
/** cell look for each depth: strong fill, light tint, or no fill (the dashed border comes from .cellIntro) */
const cellStyle = (d: 1 | 2 | 3) =>
  d === 3
    ? { background: 'color-mix(in srgb, var(--viz-1) 85%, var(--surface))', color: 'var(--surface)' }
    : d === 2
      ? { background: 'color-mix(in srgb, var(--viz-1) 30%, var(--surface))', color: 'var(--ink)' }
      : { background: 'var(--surface)', color: 'var(--ink)' }

const matches = (t: Topic, sec: number, cat: 'all' | Cat) => (sec === 0 || t.sec === sec) && (cat === 'all' || t.cat === cat)

export default function SyllabusCoverageGrid() {
  const [ref, narrow] = useNarrow<HTMLDivElement>(560)
  const [sec, setSec] = useState<0 | 1 | 2 | 3 | 4>(0)
  const [cat, setCat] = useState<'all' | Cat>('all')
  const [open, setOpen] = useState(TOPICS.findIndex((t) => t.name.startsWith('Fine-tuning')))
  const panelRef = useRef<HTMLDivElement>(null)
  const picked = useRef(false)

  const shown = TOPICS.map((t, i) => ({ t, i })).filter(({ t }) => matches(t, sec, cat))
  const tally = [3, 2, 1].map((d) => shown.filter(({ t }) => t.depth === d).length)
  const sel = TOPICS[open]
  const selShown = matches(sel, sec, cat)

  // keep the open topic among the visible ones when a filter changes
  const refilter = (s2: number, c2: 'all' | Cat) => {
    if (matches(TOPICS[open], s2, c2)) return
    const first = TOPICS.findIndex((t) => matches(t, s2, c2))
    if (first >= 0) setOpen(first)
  }
  // bring the details into view (on a phone they open right after the tapped cell's section)
  useEffect(() => {
    if (picked.current) panelRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    picked.current = false
  }, [open, narrow])

  const panel = (
    <div ref={panelRef} className={styles.topicPanel} aria-live="polite">
      <div className={styles.panelHead} style={{ borderColor: 'var(--viz-1)' }}>
        <strong>{sel.name}</strong>
        <span className={styles.when}>
          §{sel.sec} · {CAT_NAME[sel.cat]}
        </span>
      </div>
      <p>
        {CAT_MEAN[sel.cat]} This course: <strong>{DEPTH[sel.depth].name}</strong>.
      </p>
      <p>
        <span className={styles.sampleLabel}>Lessons</span>{' '}
        {sel.lessons.map((l, k) => (
          <span key={l.to + l.label}>
            <Link to={l.to}>{l.label}</Link>
            {k < sel.lessons.length - 1 ? ' · ' : ''}
          </span>
        ))}
      </p>
      <p>
        <span className={styles.sampleLabel}>For IOAI</span> {sel.beyond}
      </p>
      <p>
        <span className={styles.sampleLabel}>Free resource</span>{' '}
        <a href={sel.res[1]} target="_blank" rel="noreferrer">
          {sel.res[0]}
        </a>
      </p>
    </div>
  )

  return (
    <Figure
      title="The IOAI syllabus, mapped onto this course"
      caption={
        <>
          All {TOPICS.length} subtopics of the latest IOAI syllabus. Filled cells are covered here; dashed outlines need practice beyond this course. Filter to Practice and notice where the dashed
          cells cluster, then tap any cell.
        </>
      }
      wide
    >
      <div ref={ref} className={styles.filters}>
        <Segmented
          label="Section"
          value={sec}
          onChange={(v) => {
            setSec(v)
            refilter(v, cat)
          }}
          options={[
            { value: 0, label: 'All' },
            { value: 1, label: '§1 ML' },
            { value: 2, label: '§2 DL' },
            { value: 3, label: '§3 CV' },
            { value: 4, label: '§4 NLP' },
          ]}
        />
        <Segmented
          label="Category"
          value={cat}
          onChange={(v) => {
            setCat(v)
            refilter(sec, v)
          }}
          options={[
            { value: 'all', label: 'All' },
            { value: 'T', label: 'Theory' },
            { value: 'P', label: 'Practice' },
            { value: 'B', label: 'Both' },
          ]}
        />
      </div>
      <div className={styles.depthKey} aria-hidden="true">
        {([3, 2, 1] as const).map((d, k) => (
          <span key={d}>
            <span className={`${styles.keyCell}${d === 1 ? ` ${styles.cellIntro}` : ''}`} style={{ background: cellStyle(d).background }} />
            {DEPTH[d].key} (<strong>{tally[k]}</strong>)
          </span>
        ))}
      </div>
      <div className={styles.secGrid}>
        {[1, 2, 3, 4]
          .filter((s) => shown.some(({ t }) => t.sec === s))
          .map((s) => (
            <div key={s} style={{ display: 'contents' }}>
            <section className={styles.secBlock} aria-label={`Section ${s}: ${SECTIONS[s - 1]}`}>
              <div className={styles.secTitle}>
                §{s} {SECTIONS[s - 1]}
              </div>
              <div className={styles.topicWrap}>
                {shown
                  .filter(({ t }) => t.sec === s)
                  .map(({ t, i }) => (
                    <button
                      key={t.name}
                      type="button"
                      aria-pressed={open === i}
                      title={`${t.name}: ${CAT_NAME[t.cat]}, ${DEPTH[t.depth].name}`}
                      className={`${styles.topic}${t.depth === 1 ? ` ${styles.cellIntro}` : ''}${open === i ? ` ${styles.topicOpen}` : ''}`}
                      style={cellStyle(t.depth)}
                      onClick={() => {
                        picked.current = true
                        setOpen(i)
                      }}
                    >
                      <span className={styles.topicCat}>{t.cat}</span>
                      {t.name}
                    </button>
                  ))}
              </div>
            </section>
            {narrow && selShown && sel.sec === s && panel}
            </div>
          ))}
        {shown.length === 0 && <p>No subtopic matches both filters.</p>}
      </div>
      {!narrow && selShown && panel}
      <div className={styles.source}>
        Source: the IOAI 2026 syllabus (<a href={LINKS.ioaiSyllabus} target="_blank" rel="noreferrer">PDF</a>), the latest published as of October 2026. It says
        topics not listed are excluded and that breadth should be prioritised over depth.
      </div>
    </Figure>
  )
}
