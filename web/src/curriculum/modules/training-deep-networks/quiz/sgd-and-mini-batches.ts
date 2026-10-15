import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'training-deep-networks.sgd-and-mini-batches.1',
    prompt: 'A training set has 2,000 images. You train for 5 epochs with batch size 64, keeping the last smaller batch. How many times are the weights updated?',
    options: ['160', '155', '10,000', '32'],
    answer: 0,
    explanation:
      'Iterations per epoch $= \\lceil 2000/64 \\rceil = \\lceil 31.25 \\rceil = 32$, so 5 epochs give $32 \\times 5 = 160$ updates. Rounding down (31 per epoch, 155 in total) is what `drop_last=True` would do; 10,000 is the number of images seen, and 32 is only one epoch.',
    difficulty: 'beginner',
  },
  {
    id: 'training-deep-networks.sgd-and-mini-batches.2',
    prompt: '`train_set` holds 1,000 examples. What does this code print?',
    code: 'loader = DataLoader(train_set, batch_size=32,\n                    shuffle=True, drop_last=True)\nprint(len(loader))',
    options: ['`31`', '`32`', '`31.25`', '`1000`'],
    answer: 0,
    explanation:
      '`len(loader)` is the number of batches per epoch. $1000/32 = 31.25$; with `drop_last=True` the incomplete final batch of 8 is thrown away, so it rounds down to 31. Without `drop_last` it would be $\\lceil 31.25 \\rceil = 32$.',
    difficulty: 'beginner',
  },
  {
    id: 'training-deep-networks.sgd-and-mini-batches.3',
    prompt: 'You increase the batch size from 16 to 256 on the same dataset. Which statement is correct?',
    options: [
      'Each gradient estimate is about 4 times less noisy, and there are 16 times fewer updates per epoch',
      'Each gradient estimate is about 16 times less noisy, and there are 16 times fewer updates per epoch',
      'Each gradient estimate is about 4 times less noisy, and the number of updates per epoch is unchanged',
      'Each gradient estimate becomes exact, and there are 16 times more updates per epoch',
    ],
    answer: 0,
    explanation:
      'The batch is $256/16 = 16$ times bigger. Noise shrinks like $1/\\sqrt{B}$, so it falls by $\\sqrt{16} = 4$ times, not 16. Each epoch is cut into 16 times fewer batches, so there are 16 times fewer updates. The estimate is only exact when the batch is the whole dataset.',
    difficulty: 'intermediate',
  },
  {
    id: 'training-deep-networks.sgd-and-mini-batches.4',
    prompt: 'Mini-batch gradients are noisy, yet mini-batch gradient descent still reaches a good minimum. What is the main reason?',
    options: [
      'Each mini-batch gradient equals the full gradient on average, so the errors cancel out over many steps',
      'Shuffling the data before each epoch makes every mini-batch gradient exactly equal to the full-batch gradient',
      'The learning rate is small enough to filter the noise out of each mini-batch gradient before the update',
      'The optimiser stores every previous gradient and uses their exact average in place of the current one',
    ],
    answer: 0,
    explanation:
      'A random mini-batch gives an unbiased estimate: averaged over all possible batches it equals the true gradient, so there is no systematic error and the noise averages out over many steps. Shuffling makes batches fair random samples but does not make them exact, and the learning rate only scales the step; it cannot remove noise.',
    difficulty: 'intermediate',
  },
  {
    id: 'training-deep-networks.sgd-and-mini-batches.5',
    prompt:
      'Two networks reach the same training loss. Network A sits in a narrow, sharp minimum; network B sits in a wide, flat one. On new test data, which is more likely to do better, and why?',
    options: [
      'B, because a flat minimum stays low when the test data shift the loss surface slightly',
      'A, because a sharp minimum fits the training data more precisely, so it also predicts new data better',
      'Neither, because two models with equal training loss must also have equal test loss',
      'A, because sharp minima have larger gradients, which keep the model improving at test time',
    ],
    answer: 0,
    explanation:
      'The test loss surface is like the training one but slightly shifted. Near a minimum the loss rises by about $\\tfrac{1}{2}c\\,\\delta^2$, so a small curvature $c$ (flat) barely changes it while a large $c$ (sharp) makes it shoot up. Equal training loss does not imply equal test loss, and a model does not learn at test time.',
    difficulty: 'intermediate',
  },
]

export default questions
