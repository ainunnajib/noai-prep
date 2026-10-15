import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'training-deep-networks.learning-rate-warmup-schedules.1',
    prompt:
      'A learning-rate range test gives this curve: the loss is flat for learning rates from $10^{-5}$ to $10^{-3}$, falls steeply between $10^{-3}$ and $10^{-2}$, reaches its lowest point at $0.1$, and shoots up beyond $0.3$. Which learning rate is the best choice for training?',
    options: ['$0.01$', '$0.1$', '$10^{-5}$', '$0.3$'],
    answer: 0,
    explanation:
      'Pick a value on the steep downhill part, about ten times below the minimum: $0.1 / 10 = 0.01$. The minimum itself ($0.1$) is already at the edge of instability, and $0.3$ is where training falls apart. The flat left end ($10^{-5}$) is not "safest" in a useful sense: the steps are too small to make progress.',
    difficulty: 'beginner',
  },
  {
    id: 'training-deep-networks.learning-rate-warmup-schedules.2',
    prompt: 'A Transformer trained with Adam diverges in its first few hundred steps, but trains well once a linear warm-up is added. What is the main reason warm-up helps?',
    options: [
      "Adam's average of squared gradients starts from a few noisy steps, so some weights get huge steps; a small learning rate keeps them safe until it settles",
      'Warm-up lets the BatchNorm running mean and variance settle before any large updates are made, which Transformers rely on in every layer',
      'Warm-up grows the batch size step by step in the early phase, so that the first gradients are averaged over more examples and contain less noise',
      'Warm-up lets the network memorise the easy training examples first using small steps, and only later generalise to the hard ones using large steps',
    ],
    answer: 0,
    explanation:
      'Adam divides each step by $\\sqrt{\\hat v}$. Early on $\\hat v$ is estimated from a handful of large, erratic gradients, so for some weights it is far too small and the steps are huge. Keeping the learning rate small for the first steps gives the statistics time to settle. Transformers use LayerNorm, not BatchNorm, and warm-up changes the learning rate, not the batch size.',
    difficulty: 'intermediate',
  },
  {
    id: 'training-deep-networks.learning-rate-warmup-schedules.3',
    prompt: 'What does this code print?',
    code: 'import math\n\ndef get_lr(step, base=0.002, warmup=500, total=5500):\n    if step < warmup:\n        return base * step / warmup\n    progress = (step - warmup) / (total - warmup)\n    return 0.5 * base * (1 + math.cos(math.pi * progress))\n\nprint(round(get_lr(100), 6), round(get_lr(3000), 6))',
    options: ['`0.0004 0.001`', '`0.002 0.001`', '`0.0004 0.002`', '`0.0004 0.0005`'],
    answer: 0,
    explanation:
      'Step 100 is still in the warm-up: $0.002 \\times \\frac{100}{500} = 0.0004$. Step 3000 is $\\frac{3000 - 500}{5500 - 500} = \\frac{2500}{5000} = \\frac12$ of the way through the cosine, and $\\cos\\frac{\\pi}{2} = 0$, so the rate is $0.5 \\times 0.002 \\times 1 = 0.001$: exactly halfway between the peak and 0. Warm-up starts from 0, not from the base rate, so `0.002` is wrong for step 100.',
    difficulty: 'intermediate',
  },
  {
    id: 'training-deep-networks.learning-rate-warmup-schedules.4',
    prompt:
      "A CNN is trained with SGD for 90 epochs. Its training loss falls quickly, then levels off and keeps bouncing around the same value, until it suddenly drops at epoch 30 and again at epoch 60, levelling off after each drop. What is the most likely explanation?",
    options: [
      'A step-decay schedule divides the learning rate at epochs 30 and 60, so the smaller steps can settle deeper into the valley',
      'A warm-up phase ends at epochs 30 and 60, so the learning rate jumps to its full value and the model suddenly learns faster',
      'Early stopping restores the best checkpoint at epochs 30 and 60, which resets the loss to its lowest value seen so far',
      'The training data is reshuffled at epochs 30 and 60, so the model sees its mini-batches in a new and easier order',
    ],
    answer: 0,
    explanation:
      'Sudden drops at fixed epochs are the fingerprint of step decay. Before each cut, the big learning rate keeps the weights bouncing across the valley; after the cut, the smaller steps settle lower and the loss falls at once. Warm-up happens only at the very start and raises the rate; early stopping ends training rather than continuing it; data is normally reshuffled every epoch, not only at 30 and 60.',
    difficulty: 'intermediate',
  },
  {
    id: 'training-deep-networks.learning-rate-warmup-schedules.5',
    prompt: 'Which statement correctly compares the 1cycle policy with `ReduceLROnPlateau`?',
    options: [
      '1cycle follows a plan fixed before training (up to a high peak, then far below the start); ReduceLROnPlateau cuts the rate only when the validation loss stops improving',
      'ReduceLROnPlateau follows a plan fixed before training (up to a high peak, then far below the start); 1cycle cuts the rate only when the validation loss stops improving',
      '1cycle and ReduceLROnPlateau both lower the learning rate at fixed epochs chosen in advance; they differ only in how big each cut is',
      'ReduceLROnPlateau raises the learning rate when the validation loss stalls, to escape the plateau; 1cycle lowers it steadily from the first step',
    ],
    answer: 0,
    explanation:
      '1cycle is a fixed schedule: it climbs from a low rate to a high peak (exploring, escaping sharp minima) and then anneals to far below its start (settling). ReduceLROnPlateau has no fixed plan: it watches the validation loss and, after `patience` epochs without improvement, multiplies the rate by a factor such as 0.1. It never raises the rate.',
    difficulty: 'intermediate',
  },
]

export default questions
