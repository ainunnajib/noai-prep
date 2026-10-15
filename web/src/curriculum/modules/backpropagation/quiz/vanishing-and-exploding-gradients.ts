import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'backpropagation.vanishing-and-exploding-gradients.1',
    prompt:
      'A chain of sigmoid neurons has every weight equal to 1 and every pre-activation $z = 0$, the sigmoid\'s steepest point. The loss sends a gradient of 1 back into the chain. After passing back through how many of these neurons does the gradient first drop below $1/1000$?',
    options: ['$5$', '$4$', '$10$', '$3$'],
    answer: 0,
    explanation:
      'Each neuron multiplies the gradient by $w \\cdot \\sigma\'(0) = 1 \\times 0.25 = 1/4$, so after $n$ neurons it is $1/4^n$. After four it is $1/256 \\approx 0.004$, still above $1/1000$; after five it is $1/1024$, just below. So $4$ stops one neuron early. $10$ assumes each neuron halves the gradient (using $\\sigma(0) = 0.5$ instead of $\\sigma\'(0) = 0.25$), and $3$ comes from dividing by 10 at each neuron and stopping at exactly $1/1000 = 0.1^3$, which is not even below the threshold.',
    difficulty: 'beginner',
  },
  {
    id: 'backpropagation.vanishing-and-exploding-gradients.2',
    prompt: 'He initialisation draws a ReLU layer\'s weights with variance $2/n_{in}$, twice the $1/n_{in}$ that suits tanh. Why the factor of 2?',
    options: [
      'ReLU passes only about half its inputs, which halves the signal\'s squared size; doubling the variance cancels that',
      'ReLU\'s derivative is 2 for positive inputs, so the weights must double to match it and keep the backward factor at 1',
      'Larger weights make the gradients grow slightly at each layer, and that small growth speeds up deep ReLU training',
      'A ReLU layer keeps separate weights for positive and negative inputs, so the variance is split across the two sets',
    ],
    answer: 0,
    explanation:
      'With weights of standard deviation $k/\\sqrt{n}$ a layer scales the signal by about $k$ times the root-mean-square slope. ReLU passes signal through only its active half, halving the squared size, so $k^2 = 2$ (variance $2/n_{in}$) brings the factor back to about 1. ReLU\'s derivative is 1, not 2, for positive inputs, and deliberately making gradients grow is exactly the exploding-gradient problem.',
    difficulty: 'intermediate',
  },
  {
    id: 'backpropagation.vanishing-and-exploding-gradients.3',
    prompt: 'Which pairing of a training problem with a fix is correct?',
    options: [
      'The loss jumps from about 2 to 845 and then prints `nan` → clip the gradient norm and lower the learning rate',
      'The first layers of a 40-layer sigmoid network barely change → clip the gradient norm to 1.0 so the layers update evenly',
      'Gradients vanish in a deep ReLU network initialised with std 0.01 → initialise the weights to exactly 0 instead',
      'Gradients grow layer after layer in a deep ReLU network → initialise with even larger weights so the outputs saturate',
    ],
    answer: 0,
    explanation:
      'A spike followed by `nan` is the signature of exploding gradients, and clipping (plus a smaller learning rate) caps the update. Clipping can only shrink gradients, so it does nothing for vanishing ones. All-zero weights give every neuron the same (zero) gradient and nothing learns, and larger weights make an exploding ReLU network worse, since ReLU never saturates for positive inputs.',
    difficulty: 'intermediate',
  },
  {
    id: 'backpropagation.vanishing-and-exploding-gradients.4',
    prompt:
      'A residual block computes $y = x + F(x)$. In the backward pass the gradient arriving at $y$ is $2$, and the block\'s own layers have derivative $F\'(x) = 0.1$. What gradient reaches $x$?',
    options: ['$2.2$', '$0.2$', '$2.1$', '$1.1$'],
    answer: 0,
    explanation:
      '$\\frac{\\partial y}{\\partial x} = 1 + F\'(x) = 1.1$, so the gradient at $x$ is $2 \\times 1.1 = 2.2$: the upstream $2$ comes straight back along the skip path, plus $2 \\times 0.1 = 0.2$ through $F$. $0.2$ forgets the skip path (a plain network), $2.1$ adds $0.1$ instead of multiplying, and $1.1$ forgets the upstream gradient.',
    difficulty: 'intermediate',
  },
  {
    id: 'backpropagation.vanishing-and-exploding-gradients.5',
    prompt:
      'You want to add `torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)` to this training loop so that it limits every update. Where must it go?',
    code: 'for x, y in loader:\n    optimiser.zero_grad()\n    loss = loss_fn(model(x), y)\n    loss.backward()\n    optimiser.step()',
    options: [
      'Between `loss.backward()` and `optimiser.step()`',
      'Straight after `optimiser.step()`, at the end of the loop body',
      'Between computing `loss` and calling `loss.backward()`',
      'At the start of the loop body, before `optimiser.zero_grad()`',
    ],
    answer: 0,
    explanation:
      'Clipping must act on the gradients after `loss.backward()` has computed them and before `optimiser.step()` uses them. After `step()` the update has already happened; before `backward()` the `.grad` values are still `None` (what `zero_grad()` leaves by default) or last step\'s, so there is nothing useful to clip, and anything clipped before `zero_grad()` is wiped anyway.',
    difficulty: 'intermediate',
  },
]

export default questions
