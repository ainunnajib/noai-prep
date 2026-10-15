import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'ml-systems-and-tradeoffs.cost-of-ml.1',
    prompt:
      'In a dense layer, the batch `X` has shape `(64, 512)` and the weight matrix `W` has shape `(512, 256)`. About how many multiply-adds does `X @ W` take?',
    options: [
      '$64 \\times 512 \\times 256 \\approx 8.4$ million',
      '$64 \\times 256 \\approx 16$ thousand',
      '$512 \\times 256 \\approx 131$ thousand',
      '$64 \\times 512 + 512 \\times 256 \\approx 164$ thousand',
    ],
    answer: 0,
    explanation:
      'An $(m \\times n)(n \\times p)$ product costs $m \\cdot n \\cdot p$: the answer has $64 \\times 256$ cells and each one sums $512$ products, so $2^6 \\cdot 2^9 \\cdot 2^8 = 2^{23} \\approx 8.4$ million. $16$ thousand counts only the output cells, and $131$ thousand is the number of weights, which is the cost for a single example, not a batch of 64.',
    difficulty: 'beginner',
  },
  {
    id: 'ml-systems-and-tradeoffs.cost-of-ml.2',
    prompt:
      'Two models are trained on the same $n = 1{,}000{,}000$ examples with $d = 100$ features: brute-force k-NN with $k = 5$, and logistic regression. Which statement about their costs is correct?',
    options: [
      'k-NN does almost no training work but needs about $n \\cdot d = 10^8$ operations per prediction; logistic regression costs more to train but only about $d = 100$ per prediction.',
      'k-NN needs only about $k \\cdot d = 500$ operations per prediction because just the 5 nearest neighbours vote, so it predicts about as fast as logistic regression.',
      'Both need about $n \\cdot d = 10^8$ operations per prediction, because both models have to consult the whole training set every time they make a prediction.',
      'k-NN needs about $n \\cdot d$ operations to train and $d$ per prediction, while logistic regression needs $d$ to train and about $n \\cdot d$ per prediction.',
    ],
    answer: 0,
    explanation:
      'k-NN only stores the data, but to find the 5 nearest points it must measure the distance to all $n$ stored points, $d$ multiply-adds each: $10^6 \\times 100 = 10^8$ per prediction. Logistic regression learns $d + 1$ numbers during training and then predicts with one dot product. The "$k \\cdot d$" option forgets that you cannot know which 5 points are nearest without checking them all.',
    difficulty: 'intermediate',
  },
  {
    id: 'ml-systems-and-tradeoffs.cost-of-ml.3',
    prompt:
      "A team raises a Transformer's context length from 2,000 to 8,000 tokens and keeps the model width $d$ the same. By roughly what factor does the work of computing the attention scores $QK^\\top$ grow?",
    options: ['16', '4', '64', '8'],
    answer: 0,
    explanation:
      'The score matrix is $T \\times T$ and each score is a dot product of length $d$, so the work is $T^2 d$. The context is 4 times longer, so the work grows $4^2 = 16$ times. 4 is how the projections grow (they are linear in $T$), and 64 would be cubic growth. The number of parameters does not change at all.',
    difficulty: 'intermediate',
  },
  {
    id: 'ml-systems-and-tradeoffs.cost-of-ml.4',
    prompt: 'Ignoring biases, how many multiply-adds does `conv(x)` perform?',
    code: 'import torch\nimport torch.nn as nn\n\nconv = nn.Conv2d(in_channels=2, out_channels=5,\n                 kernel_size=3, padding=1)\nx = torch.randn(1, 2, 10, 10)  # one image, 2 channels\ny = conv(x)                    # y.shape: (1, 5, 10, 10)',
    options: ['9,000', '90', '1,800', '450'],
    answer: 0,
    explanation:
      'Each output number is a $3 \\times 3 \\times 2$ patch times a filter: 18 multiply-adds. There are $10 \\times 10 \\times 5 = 500$ output numbers, so $500 \\times 18 = 9{,}000$, which is $H_{out} W_{out} k^2 C_{in} C_{out} = 100 \\cdot 9 \\cdot 2 \\cdot 5$. 90 is the number of weights, forgetting that each weight is re-used at all 100 positions; 1,800 forgets the 5 output channels.',
    difficulty: 'intermediate',
  },
  {
    id: 'ml-systems-and-tradeoffs.cost-of-ml.5',
    prompt:
      "A model's parameter count $p$ grows 10 times. For one step of Newton's method, roughly how do the memory for the Hessian and the time to solve with it change?",
    options: ['Memory ×100, time ×1,000', 'Memory ×10, time ×100', 'Memory ×100, time ×100', 'Memory ×10, time ×10'],
    answer: 0,
    explanation:
      "The Hessian is a $p \\times p$ matrix, so its memory grows as $p^2$: $10^2 = 100$ times. Solving with it (like inverting it) costs about $p^3$: $10^3 = 1{,}000$ times. A gradient step only grows about 10 times, since the gradient has $p$ numbers, which is why deep learning uses gradient methods rather than Newton's method.",
    difficulty: 'intermediate',
  },
]

export default questions
