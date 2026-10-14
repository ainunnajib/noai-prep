import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'backpropagation.vanishing-and-exploding-gradients.1',
    prompt:
      'A chain of sigmoid neurons has every weight equal to 1 and every pre-activation $z = 0$. The loss sends a gradient of 1 back to the last neuron. How big is the gradient after it has passed back through **five** of these neurons?',
    options: ['$1/1024 \\approx 0.001$', '$1.25$', '$0.25$', '$0.05$'],
    answer: 0,
    explanation:
      'Each neuron multiplies the gradient by $w \\cdot \\sigma\'(0) = 1 \\times 0.25$. Five of them give $0.25^5 = 1/4^5 = 1/1024 \\approx 0.001$. $1.25$ comes from *adding* $0.25$ five times, but along a chain the chain rule multiplies; $0.25$ counts only one neuron.',
    difficulty: 'beginner',
  },
  {
    id: 'backpropagation.vanishing-and-exploding-gradients.2',
    prompt: 'He initialisation draws a ReLU layer\'s weights with variance $2/n_{in}$, twice the $1/n_{in}$ that suits tanh. Why the factor of 2?',
    options: [
      'ReLU outputs 0 for about half its inputs, which halves the signal\'s squared size at each layer; doubling the weight variance cancels that so the per-layer factor stays near 1',
      'ReLU\'s derivative is 2 for positive inputs, so the weights must be twice as large to match it and keep the backward factor equal to 1',
      'Larger weights make the gradients grow slightly at every layer, and a little explosion speeds up training of deep ReLU networks',
      'A ReLU layer has two weight matrices, one for positive and one for negative inputs, so the variance is split between the two of them',
    ],
    answer: 0,
    explanation:
      'With weights of standard deviation $k/\\sqrt{n}$ a layer scales the signal by about $k$ times the typical slope. ReLU passes signal through only its active half, halving the squared size, so $k^2 = 2$ (variance $2/n_{in}$) brings the factor back to about 1. ReLU\'s derivative is 1, not 2, for positive inputs, and deliberately making gradients grow is exactly the exploding-gradient problem.',
    difficulty: 'intermediate',
  },
  {
    id: 'backpropagation.vanishing-and-exploding-gradients.3',
    prompt: 'Which pairing of a training problem with a fix is correct?',
    options: [
      'The loss jumps from about 2 to 845 and then prints `nan` → clip the gradient norm and lower the learning rate',
      'The first layers of a 40-layer sigmoid network barely change → clip the gradient norm to 1.0 so the layers update evenly',
      'Gradients vanish in a deep ReLU network initialised with std 0.01 → initialise every weight to exactly 0 instead',
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
      'Clipping must act on the gradients after `loss.backward()` has computed them and before `optimiser.step()` uses them. After `step()` the update has already happened; before `backward()` the `.grad` values are still zero (or last step\'s), so there is nothing useful to clip, and anything clipped before `zero_grad()` is wiped anyway.',
    difficulty: 'intermediate',
  },
]

export default questions
