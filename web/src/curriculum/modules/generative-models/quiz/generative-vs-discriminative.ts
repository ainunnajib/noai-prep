import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'generative-models.generative-vs-discriminative.1',
    prompt: 'Which statement correctly pairs each model with what it learns?',
    options: [
      'Logistic regression learns $P(y \\mid x)$; a diffusion model learns the image distribution $P(x)$',
      'Logistic regression learns the joint $P(x, y)$; a GAN learns only $P(y \\mid x)$, real or fake',
      'Naive Bayes learns only $P(y \\mid x)$; GPT learns a decision boundary between tokens',
      'A random forest learns the input distribution $P(x)$; Stable Diffusion learns $P(y \\mid x)$',
    ],
    answer: 0,
    explanation:
      'Logistic regression is the textbook discriminative model: it learns $P(y \\mid x) = \\sigma(w \\cdot x + b)$ and nothing about the inputs themselves. A diffusion model is generative: it learns where real images lie so it can produce new ones. The other options swap the roles: GANs, GPT and Stable Diffusion are generative, Naive Bayes learns $P(x \\mid y)$ and $P(y)$ (generative), and a random forest only learns labels for regions of feature space.',
    difficulty: 'beginner',
  },
  {
    id: 'generative-models.generative-vs-discriminative.2',
    prompt: 'Why can a model of $P(x \\mid y)$ and $P(y)$ be turned into a classifier, while a model of $P(y \\mid x)$ cannot generate new examples?',
    options: [
      'Bayes’ rule turns $P(x \\mid y)P(y)$ into $P(y \\mid x)$, but $P(y \\mid x)$ holds no information about $P(x)$',
      'Generative models contain an extra classifier layer, while discriminative models have no hidden layers to generate with',
      '$P(y \\mid x)$ is always smaller than $P(x, y)$, so it holds too little probability to sample from',
      'Discriminative models are trained without labels, so they never see what the inputs look like',
    ],
    answer: 0,
    explanation:
      '$P(y \\mid x) = P(x \\mid y)P(y) / P(x)$, where $P(x) = \\sum_y P(x \\mid y)P(y)$, so the generative pieces give the classifier directly. Going back is impossible: many different input distributions share the same $P(y \\mid x)$. The size claim is backwards: $P(x, y) = P(y \\mid x)P(x) \\le P(y \\mid x)$. And discriminative models are trained with labels.',
    difficulty: 'intermediate',
  },
  {
    id: 'generative-models.generative-vs-discriminative.3',
    prompt:
      'Of 40 students, 10 are in the robotics CCA and 8 of those 10 took NOAI. Of the 30 students not in robotics, 6 took NOAI. What are $P(\\text{NOAI} \\mid \\text{robotics})$ and $P(\\text{robotics})$?',
    options: ['$0.8$ and $0.25$', '$0.2$ and $0.25$', '$0.57$ and $0.25$', '$0.8$ and $0.35$'],
    answer: 0,
    explanation:
      'Look only at the robotics row: $8/10 = 0.8$. The marginal is the row total over everyone: $10/40 = 0.25$. The tempting $0.2$ is the joint $P(\\text{NOAI}, \\text{robotics}) = 8/40$; $0.57 = 8/14$ is the reverse conditional $P(\\text{robotics} \\mid \\text{NOAI})$; and $0.35 = 14/40$ is $P(\\text{NOAI})$.',
    difficulty: 'beginner',
  },
  {
    id: 'generative-models.generative-vs-discriminative.4',
    prompt: 'This code samples 10,000 emails from a tiny generative model. The printed number is closest to which value?',
    code: `import numpy as np
rng = np.random.default_rng(0)
p_spam = 0.2                          # P(spam)
p_free = {True: 0.5, False: 0.05}     # P(contains "free" | spam?)
rows = []
for _ in range(10000):
    spam = rng.random() < p_spam          # 1. pick the label
    free = rng.random() < p_free[spam]    # 2. pick the feature given the label
    rows.append((spam, free))
print(np.mean([free for spam, free in rows]))`,
    options: ['`0.14`', '`0.10`', '`0.50`', '`0.275`'],
    answer: 0,
    explanation:
      'The code samples a label first, then the feature given the label, so the share of emails containing "free" is $P(\\text{free}) = 0.2 \\times 0.5 + 0.8 \\times 0.05 = 0.10 + 0.04 = 0.14$ (the run prints `0.1369`). `0.10` forgets the free-containing emails that are not spam; `0.50` is $P(\\text{free} \\mid \\text{spam})$ only; `0.275` averages the two conditionals without weighting by how common each class is.',
    difficulty: 'intermediate',
  },
  {
    id: 'generative-models.generative-vs-discriminative.5',
    prompt:
      'A hospital has 50,000 heart scans, all from healthy patients. It wants to flag new scans that look unlike anything seen before, and to create realistic synthetic scans for teaching. Which approach fits both goals?',
    options: [
      'A generative model of the scans, $P(x)$: a low $P(x)$ flags an odd scan, and sampling makes new ones',
      'Train a discriminative classifier $P(y \\mid x)$ on the healthy scans, which learns a tight boundary around them',
      'Train logistic regression with a high threshold, then run it backwards from the label to produce scans',
      'Fit a decision tree, whose leaves store typical scans that can be handed out as new synthetic data',
    ],
    answer: 0,
    explanation:
      'Both goals need knowledge of what scans look like: how typical a scan is ($P(x)$) and the ability to sample from that distribution. A classifier cannot even be trained here, because every scan has the same label, and $P(y \\mid x)$ cannot be "run backwards" to recover inputs. Decision-tree leaves store labels, not scans.',
    difficulty: 'intermediate',
  },
]

export default questions
