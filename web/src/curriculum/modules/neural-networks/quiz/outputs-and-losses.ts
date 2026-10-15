import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'neural-networks.outputs-and-losses.1',
    prompt: 'A network predicts the resale price of an HDB flat in dollars. Which output layer and loss are the standard choice?',
    options: [
      'One output neuron with no activation, trained with mean squared error',
      'One output neuron with a sigmoid, trained with binary cross-entropy',
      'Ten output neurons with a softmax over price bands, trained with mean absolute error',
      'One output neuron with a sigmoid, trained with mean squared error',
    ],
    answer: 0,
    explanation:
      'A price can be any size (say 450,000), so the last neuron must output a raw number: no sigmoid or softmax to squash it into $(0, 1)$. Regression is trained with MSE (or MAE if you want less sensitivity to outliers). A sigmoid output can never reach 450,000, whatever loss you pair it with, and binary cross-entropy is for yes/no labels.',
    difficulty: 'beginner',
  },
  {
    id: 'neural-networks.outputs-and-losses.2',
    prompt:
      'A model looks at a photo and must say which of 5 hawker dishes appear in it. One photo can contain several dishes. Which head and PyTorch loss should you use?',
    options: [
      '5 logits with `nn.BCEWithLogitsLoss` and 0/1 targets of length 5',
      '5 logits with `nn.CrossEntropyLoss` and one class index per photo',
      '5 logits, a softmax layer in the model, then `nn.CrossEntropyLoss`',
      '1 logit with `nn.BCEWithLogitsLoss` and a target from 0 to 4',
    ],
    answer: 0,
    explanation:
      'This is **multi-label**: each dish is its own yes/no question, so each of the 5 logits gets its own sigmoid and binary cross-entropy, which is what `nn.BCEWithLogitsLoss` does with a multi-hot target such as $[1, 1, 0, 0, 0]$. Cross-entropy uses a softmax, which forces the 5 probabilities to add up to 1 as if exactly one dish were allowed; adding your own softmax before it also applies softmax twice.',
    difficulty: 'intermediate',
  },
  {
    id: 'neural-networks.outputs-and-losses.3',
    prompt: 'You train a freshly initialised classifier on 100 balanced classes. Roughly what cross-entropy loss should the very first batch give?',
    options: ['4.6', '2.3', '0.01', '0.69'],
    answer: 0,
    explanation:
      'An untrained model gives every class about $1/100$, so the loss is $-\\ln\\frac{1}{100} = \\ln 100 = 2\\ln 10 \\approx 2 \\times 2.303 = 4.6$. 2.3 is $\\ln 10$, the value for 10 classes; 0.01 is the probability $1/K$, not the loss; 0.69 is $\\ln 2$, the value for two classes.',
    difficulty: 'intermediate',
  },
  {
    id: 'neural-networks.outputs-and-losses.4',
    prompt: 'A student trains a 3-class model with this code. Training runs without errors, but the loss never drops below about 0.55, even when every prediction is correct. What is the bug?',
    code: 'model = nn.Sequential(\n    nn.Linear(16, 32),\n    nn.ReLU(),\n    nn.Linear(32, 3),\n    nn.Softmax(dim=1),\n)\nloss_fn = nn.CrossEntropyLoss()\n# y holds class indices 0, 1 or 2\nloss = loss_fn(model(x), y)',
    options: [
      'The softmax is applied twice, because `nn.CrossEntropyLoss` already applies log-softmax to its input',
      'The targets `y` must be one-hot vectors such as `[0, 1, 0]`, not class indices',
      'The last layer needs a sigmoid instead of a softmax, because cross-entropy expects values between 0 and 1',
      'The softmax should use `dim=0`, so that it normalises over the batch instead of over the classes',
    ],
    answer: 0,
    explanation:
      '`nn.CrossEntropyLoss` expects raw logits and applies (log-)softmax itself. With `nn.Softmax` at the end of the model the scores are squashed twice, pulled towards $1/3$ each, so even a perfect model has loss at least $\\ln(1 + 2/e) \\approx 0.55$ and learns slowly. Remove the softmax from the model. Class-index targets are exactly what this loss wants, and `dim=0` would mix different examples together.',
    difficulty: 'intermediate',
  },
  {
    id: 'neural-networks.outputs-and-losses.5',
    prompt:
      'A spam classifier ends with a sigmoid and is trained with mean squared error. Many spam emails start with $p \\approx 0.01$ (confidently "not spam"), and their loss barely changes from one step to the next. What is the best explanation?',
    options: [
      'The MSE gradient is multiplied by the sigmoid slope $p(1 - p) \\approx 0$, so confidently wrong examples barely move',
      'The learning rate is too high, so each update overshoots the minimum and cancels out the previous update for these emails',
      'MSE is bounded by 1 for sigmoid outputs, so the loss of these emails has already reached its minimum value',
      'The model is overfitting the spam emails, so their training loss has stopped falling while the test loss rises',
    ],
    answer: 0,
    explanation:
      'With $p = \\sigma(z)$, squared error gives $\\partial L/\\partial z = 2(p - y)\\,p(1 - p)$. For $p = 0.01$ and $y = 1$ that is about $2(-0.99)(0.0099) \\approx -0.02$, while binary cross-entropy gives $p - y = -0.99$, roughly 50 times stronger. The saturated sigmoid kills the MSE gradient exactly when the model is most wrong. The loss is not at a minimum (0.98 is near the maximum of 1), and these are training examples being got wrong, not memorised.',
    difficulty: 'advanced',
  },
]

export default questions
