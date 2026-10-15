import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'debugging-and-diagnosis.systematic-debugging.1',
    prompt:
      'A 10-class image classifier trains for 5 epochs. The loss stays at about 2.30 and the accuracy at 10%. What is the best **first** step?',
    options: [
      'Check a few inputs against their labels, then try to overfit one small batch',
      'Run an overnight grid search over learning rates, batch sizes and dropout rates',
      'Collect twice as much training data and train for 20 more epochs',
      'Replace the model with a deeper network that has more parameters',
    ],
    answer: 0,
    explanation:
      'A loss stuck at $\\ln 10 \\approx 2.30$ means the model is no better than guessing, which points to a bug. Cheap checks come first: look at the data, then see whether the model can drive the loss on one batch near 0. A grid search, more data or a bigger model each cost hours and cannot fix a bug in the data or training loop.',
    difficulty: 'beginner',
  },
  {
    id: 'debugging-and-diagnosis.systematic-debugging.2',
    prompt: 'Before any training, roughly what cross-entropy loss should a correctly set-up classifier with **100** balanced classes report? (Use $\\ln 10 \\approx 2.30$.)',
    options: ['$0.01$', '$2.30$', '$4.61$', '$6.91$'],
    answer: 2,
    explanation:
      'An untrained model spreads its belief evenly, $p_y = \\frac{1}{100}$, so the loss is $-\\ln \\frac{1}{100} = \\ln 100 = 2 \\ln 10 \\approx 4.61$. $2.30$ is $\\ln 10$ (10 classes), $6.91$ is $\\ln 1000$, and $0.01$ is the probability itself, not the loss.',
    difficulty: 'beginner',
  },
  {
    id: 'debugging-and-diagnosis.systematic-debugging.3',
    prompt: 'Running this model raises `RuntimeError: mat1 and mat2 shapes cannot be multiplied (64x2048 and 512x10)`. Which change fixes it?',
    code: 'model = nn.Sequential(\n    nn.Linear(1000, 2048),\n    nn.ReLU(),\n    nn.Linear(512, 10),\n)\nout = model(x)   # x has shape (64, 1000)',
    options: ['Change the batch size from 64 to 512', 'Change `nn.Linear(512, 10)` to `nn.Linear(2048, 10)`', 'Change `nn.Linear(512, 10)` to `nn.Linear(512, 2048)`', 'Call `model(x.T)` instead of `model(x)`'],
    answer: 1,
    explanation:
      'mat1 is the data reaching the second Linear layer: 64 examples with 2048 features. mat2 is that layer, written in_features × out_features = 512 × 10. The inner numbers 2048 and 512 must match, so the layer needs `in_features=2048`. Changing out_features or the batch size leaves 2048 ≠ 512, and transposing the input breaks the first layer instead.',
    difficulty: 'intermediate',
  },
  {
    id: 'debugging-and-diagnosis.systematic-debugging.4',
    prompt: 'What is the shape of `diff`?',
    code: 'pred   = model(x)          # shape (8, 1)\ntarget = batch["price"]    # shape (8,)\ndiff = pred - target\nloss = (diff ** 2).mean()',
    options: ['`(8,)`', '`(8, 1)`', '`(8, 8)`', 'It raises a shape error'],
    answer: 2,
    explanation:
      'Lined up on the right, `(8, 1)` and `(8,)` become `(8, 1)` and `(1, 8)`; each size-1 dimension is stretched, giving `(8, 8)`: every prediction minus every target. No error is raised, and the loss silently averages 64 differences instead of 8. Use `pred.squeeze(1)` so both are `(8,)`.',
    difficulty: 'intermediate',
  },
  {
    id: 'debugging-and-diagnosis.systematic-debugging.5',
    prompt:
      'In the one-batch test, a 10-class model\'s loss falls from 2.30 to about 1.46 and then refuses to go lower, however long you train. The model ends with `nn.Softmax(dim=1)` and the loss is `nn.CrossEntropyLoss()`. What is the most likely explanation?',
    options: [
      'The batch is too large for the network to memorise all of it',
      'The learning rate is too high, so the loss bounces above its minimum',
      'Softmax is applied twice, so the loss can never get close to 0',
      'The labels have been shuffled separately from the inputs',
    ],
    answer: 2,
    explanation:
      '`CrossEntropyLoss` applies its own softmax, so it expects raw scores. Fed probabilities between 0 and 1, the best it can give the correct class is $\\frac{e}{e + 9}$, a loss of $\\ln(1 + 9/e) \\approx 1.46$. Remove the `nn.Softmax` layer. A network with thousands of weights can memorise one small batch, so size is not the limit. Labels re-shuffled at every step would keep the loss wandering near $\\ln 10 \\approx 2.30$, and labels shuffled once would simply be memorised towards 0; neither gives a steady floor at 1.46.',
    difficulty: 'advanced',
  },
]

export default questions
