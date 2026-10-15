import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'debugging-and-diagnosis.reading-loss-curves.1',
    prompt:
      'Run P: the training loss keeps falling towards 0.05, while the validation loss bottoms out at epoch 15 and then climbs. Run Q: the training and validation losses both flatten early at about 1.2 and stay close together. What are the diagnoses?',
    options: [
      'P is overfitting; Q is underfitting',
      'P is underfitting; Q is overfitting',
      'P has too high a learning rate; Q has too low a learning rate',
      'P is overfitting; Q has converged and is healthy',
    ],
    answer: 0,
    explanation:
      'A widening gap, with training loss still falling while validation loss rises, is overfitting: P is memorising its training set (stop near epoch 15, or regularise). Both curves stuck at a high level and close together is underfitting (or a bug): Q is too simple to fit even its training data. A flat curve is only healthy if it flattens at a low loss.',
    difficulty: 'beginner',
  },
  {
    id: 'debugging-and-diagnosis.reading-loss-curves.2',
    prompt: 'You run gradient descent on $L(w) = w^2$ with learning rate $\\eta = 1.5$, starting at $w = 1$. The update is $w \\leftarrow w - \\eta \\cdot 2w$. What is $w$ after **two** steps?',
    options: ['$4$', '$-2$', '$0$', '$0.25$'],
    answer: 0,
    explanation:
      'Each step multiplies $w$ by $1 - 2\\eta = 1 - 3 = -2$. So $w$ goes $1 \\to -2 \\to 4$, and the loss goes $1 \\to 4 \\to 16$. The multiplier is outside $[-1, 1]$, so the run diverges. $-2$ is the value after only one step.',
    difficulty: 'intermediate',
  },
  {
    id: 'debugging-and-diagnosis.reading-loss-curves.3',
    prompt:
      'Run A: the training loss falls in an almost straight line and is still falling when training ends. Run B: the training loss drops in the first few epochs, then jumps up and down around a fairly high value. Which changes should you try first?',
    options: [
      'A: raise the learning rate; B: lower the learning rate',
      'A: lower the learning rate; B: raise the learning rate',
      'A: add dropout; B: use a bigger model',
      'A: use a bigger model; B: add weight decay',
    ],
    answer: 0,
    explanation:
      'A slow, nearly straight decline is the fingerprint of tiny steps, so raise the learning rate. Jumping around a high value means the steps overshoot, so lower it. Dropout, weight decay and model size address overfitting or underfitting, which neither curve shows.',
    difficulty: 'intermediate',
  },
  {
    id: 'debugging-and-diagnosis.reading-loss-curves.4',
    prompt: 'Why does lowering the learning rate usually stop a training loss that oscillates wildly?',
    options: [
      'Each update was overshooting the bottom of the valley; smaller steps land nearer the bottom instead of jumping past it',
      'A lower learning rate acts as regularisation, which stops the model from overfitting the training batches',
      'A lower learning rate makes each mini-batch contain more examples, so the gradient becomes less noisy',
      'A lower learning rate clears the old gradients before each update, the same way that zero_grad() does',
    ],
    answer: 0,
    explanation:
      'The update is $w \\leftarrow w - \\eta \\, \\partial L / \\partial w$. When $\\eta$ is too big, each step jumps past the minimum to a point that can be higher than before, so the loss goes up and down. The learning rate does not change the batch size or clear gradients, and oscillation is not overfitting.',
    difficulty: 'beginner',
  },
  {
    id: 'debugging-and-diagnosis.reading-loss-curves.5',
    prompt: 'A model trains normally for 30 epochs. At epoch 31 the loss jumps to about $10^{12}$, and from epoch 32 onwards it is `nan`. Which pair of changes is most appropriate?',
    options: [
      'Lower the learning rate and clip the gradients',
      'Add dropout and stop training earlier',
      'Use a bigger model and train for more epochs',
      'Raise the learning rate and remove weight decay',
    ],
    answer: 0,
    explanation:
      'A sudden explosion to a huge value followed by NaN is numerical instability: one update (or an operation such as log of 0) blew up, and NaN then spreads to everything. Smaller steps and gradient clipping cap the size of updates. Dropout and early stopping treat overfitting; a bigger model or a higher learning rate make an explosion more likely, not less.',
    difficulty: 'beginner',
  },
]

export default questions
