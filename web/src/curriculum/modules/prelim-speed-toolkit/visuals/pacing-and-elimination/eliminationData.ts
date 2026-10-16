/*
  Eight real questions from the NOAI 2026 Preliminary Round (text from src/data/papers; Q266's bullet lists flattened into sentences),
  with every wrong option tagged by the heuristic that eliminates it.
*/

export type Heuristic = 'absolute' | 'swap' | 'offtopic' | 'clash' | 'empty'

export const HEURISTICS: Record<Heuristic, { name: string; colour: string; hint: string }> = {
  absolute: { name: 'Absolute word', colour: 'var(--viz-neg)', hint: '“always”, “never”, “only”, “must”, “all”: a claim about methods with no exceptions is almost never true in ML (maths definitions such as “all eigenvalues > 0” are the exception).' },
  swap: { name: 'Swapped terms', colour: 'var(--viz-4)', hint: 'Describes the partner concept: eigenvalue for eigenvector, recall for precision, sigmoid for ReLU.' },
  offtopic: { name: 'Answers a different question', colour: 'var(--viz-5)', hint: 'A true statement or real formula, but about something the question did not ask.' },
  clash: { name: 'Clashes with the stem', colour: 'var(--viz-2)', hint: 'Contradicts a number or fact given in the question itself.' },
  empty: { name: 'Vague or empty', colour: 'var(--viz-6)', hint: 'Gives no mechanism (“more complex”, “slower”), or says the opposite of a reason.' },
}

export interface TrainerOption {
  text: string
  /** undefined for the correct option */
  tag?: Heuristic
  why: string
}

export interface TrainerQuestion {
  n: number
  stem: string
  options: TrainerOption[]
  answer: number
  lesson: string
}

export const TRAINER: TrainerQuestion[] = [
  {
    n: 202,
    stem: 'Why is ImageNet pretraining so effective?',
    answer: 0,
    options: [
      { text: 'Large diverse dataset teaches general visual features', why: 'The standard reason: over a million varied photos teach edge, texture and shape detectors that transfer to new images.' },
      { text: "It's the only available dataset", tag: 'absolute', why: '“Only” is false on its face: COCO, CIFAR and many other image datasets exist.' },
      { text: 'Always gives best results', tag: 'absolute', why: 'No method “always” wins. Pretraining on a very different domain (X-rays, satellites) can help less.' },
      { text: 'Only works for classification', tag: 'absolute', why: 'Pretrained backbones are reused for detection and segmentation too (U-Net encoders, Faster R-CNN).' },
    ],
    lesson: 'Three absolute words. You could answer this without ever having heard of ImageNet.',
  },
  {
    n: 12,
    stem: 'In eigenvalue decomposition, what does Av = λv represent?',
    answer: 0,
    options: [
      { text: 'v is an eigenvector with eigenvalue λ', why: 'The definition: A only stretches v, by the number λ.' },
      { text: 'λ is an eigenvector with eigenvalue v', tag: 'swap', why: 'The two names are swapped. λ is a single number, so it cannot be a vector.' },
      { text: 'A is diagonal', tag: 'offtopic', why: 'The equation says what A does to one vector; it says nothing about the pattern of A’s entries.' },
      { text: 'v must be orthogonal', tag: 'absolute', why: '“Must”, and orthogonal to what? One vector on its own is not orthogonal to anything.' },
    ],
    lesson: 'Swapped terms are the classic trap: read which word goes with which symbol.',
  },
  {
    n: 55,
    stem: 'In a confusion matrix, precision is defined as:',
    answer: 1,
    options: [
      { text: 'TP / (TP + FN)', tag: 'swap', why: 'That is recall: of the real positives, how many did we catch? Precision divides by everything we predicted positive.' },
      { text: 'TP / (TP + FP)', why: 'Of everything predicted positive (TP + FP), the fraction that really was positive.' },
      { text: '(TP + TN) / Total', tag: 'offtopic', why: 'A real formula, but for accuracy, not precision.' },
      { text: 'TN / (TN + FP)', tag: 'offtopic', why: 'That is specificity, a rate about the negatives. Precision is about positive predictions.' },
    ],
    lesson: 'Every option is a real formula; three of them answer a different question.',
  },
  {
    n: 45,
    stem: "In Newton's method for optimisation, why is it rarely used in deep learning?",
    answer: 0,
    options: [
      { text: 'Requires computing and inverting the Hessian (O(n³))', why: 'A specific, checkable reason: with n = 10 million parameters, an n × n matrix cannot even be stored, let alone inverted.' },
      { text: "Doesn't find minima", tag: 'empty', why: 'No mechanism, only a bare verdict, and a false one: near a minimum Newton’s method converges very fast.' },
      { text: 'Only works for convex functions', tag: 'absolute', why: '“Only”: it runs on any twice-differentiable function, it just is not guaranteed to head downhill.' },
      { text: 'Slower than SGD', tag: 'empty', why: 'Restates “rarely used” without a mechanism. Slower why? The correct option names the cause.' },
    ],
    lesson: 'Prefer the option that names a mechanism or a cost over one that just restates the question.',
  },
  {
    n: 14,
    stem: 'In PCA, what do the eigenvectors of the covariance matrix represent?',
    answer: 0,
    options: [
      { text: 'Principal component directions', why: 'Eigenvectors are directions; in PCA they are the axes of greatest spread.' },
      { text: 'Data variance', tag: 'swap', why: 'That is what the eigenvalues measure: the variance along each eigenvector. Vector and value swapped.' },
      { text: 'Mean of data', tag: 'offtopic', why: 'PCA subtracts the mean before anything else; the eigenvectors are not the mean.' },
      { text: 'Number of features', tag: 'offtopic', why: 'Wrong kind of answer: a count, but an eigenvector is a direction.' },
    ],
    lesson: 'Ask “what kind of thing is the answer?” A direction, a number and a count are different things.',
  },
  {
    n: 172,
    stem: 'Why is ReLU preferred over sigmoid in hidden layers?',
    answer: 3,
    options: [
      { text: 'Always outputs between 0-1', tag: 'swap', why: 'That describes sigmoid, not ReLU (ReLU outputs 0 to infinity). It also starts with “always”.' },
      { text: 'More complex', tag: 'empty', why: 'Not a reason to prefer anything, and false: max(0, x) is simpler than 1/(1 + e^(−x)).' },
      { text: 'Requires less memory', tag: 'offtopic', why: 'Both keep about one number per neuron for the backward pass. Memory is not why ReLU won.' },
      { text: 'Avoids vanishing gradients, faster computation', why: 'ReLU’s slope is 1 for positive inputs, so gradients do not shrink layer after layer, and max(0, x) is cheap.' },
    ],
    lesson: 'A comparison question: check the option describes the right one of the pair.',
  },
  {
    n: 266,
    stem:
      'You’re training models on a text classification dataset (5,000 samples, 10 categories). Three models show different performance patterns:\n\nModel A – Logistic Regression (Linear): training accuracy 68%, validation accuracy 67%, training loss 1.85, validation loss 1.88. Similar errors on both train and validation sets.\n\nModel B – Deep Neural Network (5 layers, 2M parameters): training accuracy 99%, validation accuracy 71%, training loss 0.05, validation loss 2.15. Memorises training data, fails on new examples.\n\nModel C – Neural Network with Regularisation (3 layers, dropout=0.5, L2=0.01): training accuracy 85%, validation accuracy 83%, training loss 0.52, validation loss 0.58. Balanced performance.\n\nWhich diagnosis and solution is correct for each model?',
    answer: 0,
    options: [
      {
        text: 'Model A: High bias (underfitting) → increase capacity or add features; Model B: High variance (overfitting) → add regularisation or get more data; Model C: Well-balanced (target this configuration)',
        why: 'Matches every number: A is low on both sets (bias), B has a 28-point train–validation gap (variance), C is high on both with a small gap.',
      },
      {
        text: 'Model A: Correct fit (train-val gap minimal) → no changes needed; Model B: High bias (needs more training) → train longer; Model C: High variance (dropout too strong) → reduce regularisation',
        tag: 'clash',
        why: '“Model B: high bias” clashes with 99% training accuracy. One wrong part sinks a multi-part option.',
      },
      {
        text: 'Model A: High variance (too simple) → collect more data; Model B: Correct fit (high accuracy achieved) → deploy; Model C: High bias (accuracy too low) → increase capacity',
        tag: 'clash',
        why: 'A 1-point gap (68% vs 67%) is not high variance, and “too simple” describes bias, so the option contradicts itself.',
      },
      { text: 'All models have data quality issues → focus on data cleaning before model tuning', tag: 'absolute', why: '“All”, and nothing in the numbers points at the data: the three models behave very differently on the same data.' },
    ],
    lesson: 'In long multi-part options, check each part against the numbers and stop at the first clash.',
  },
  {
    n: 285,
    stem:
      'You’re training a BERT model (110M parameters) on a 16GB GPU. Batch size 32 causes "CUDA out of memory" error. Batch size 8 fits in memory but training is unstable. You implement gradient accumulation with accumulation_steps=4. What is the effective outcome?',
    answer: 3,
    options: [
      { text: 'Training speed increases 4x because gradients are computed in parallel across accumulation steps', tag: 'clash', why: 'The four micro-batches run one after another on the same GPU. Nothing in the stem adds parallel hardware.' },
      { text: 'Memory usage decreases by 75% because gradients are discarded after each micro-batch', tag: 'clash', why: 'The stem names the technique: in gradient “accumulation” the gradients are added up across micro-batches, not discarded.' },
      { text: 'Model accuracy improves because gradient accumulation acts as implicit regularisation through gradient noise', tag: 'offtopic', why: 'The stem’s problems are memory and unstable training, not overfitting. This answers a question nobody asked.' },
      { text: 'Effective batch size becomes 32 (8×4) while maintaining 8-sample memory footprint; gradients averaged across 4 micro-batches before optimiser step', why: 'Ties straight to the stem’s numbers: 8 × 4 = 32, exactly the batch that did not fit.' },
    ],
    lesson: 'The right option often reuses the stem’s numbers (8 × 4 = 32) to say something exact.',
  },
]
