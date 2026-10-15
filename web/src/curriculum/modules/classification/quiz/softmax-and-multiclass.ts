import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'classification.softmax-and-multiclass.1',
    prompt: 'A model outputs the logits $(3, 1, -2)$ for three classes. Which of these logit vectors gives exactly the same softmax probabilities?',
    options: ['$(13, 11, 8)$', '$(6, 2, -4)$', '$(1.5, 0.5, -1)$', '$(3, 1, 0)$'],
    answer: 0,
    explanation:
      'Softmax depends only on the differences between logits: adding 10 to every logit multiplies every $e^{z_i}$ and the total by $e^{10}$, which cancels. Doubling $(6, 2, -4)$ or halving $(1.5, 0.5, -1)$ changes the differences, so it sharpens or flattens the distribution (it acts like a temperature). Replacing $-2$ by $0$ changes one difference.',
    difficulty: 'intermediate',
  },
  {
    id: 'classification.softmax-and-multiclass.2',
    prompt: 'For one example, a classifier gives the correct class a softmax probability of $0.25$. What is the cross-entropy loss for this example (natural log)?',
    options: ['$\\ln 4 \\approx 1.39$', '$0.75$', '$\\ln 0.25 \\approx -1.39$', '$0.25$'],
    answer: 0,
    explanation:
      'With a one-hot target, cross-entropy is $-\\ln p_{\\text{correct}} = -\\ln 0.25 = \\ln 4 = 2\\ln 2 \\approx 1.39$. $\\ln 0.25$ forgets the minus sign (a loss is never negative), and $0.75 = 1 - p$ is not a log loss at all.',
    difficulty: 'beginner',
  },
  {
    id: 'classification.softmax-and-multiclass.3',
    prompt: 'A brand-new 3-class network outputs nearly equal logits $(1, 1, 1)$ for every input. What are its softmax probabilities, and what training loss should you expect at the start?',
    options: [
      '$(\\tfrac13, \\tfrac13, \\tfrac13)$ and a loss of about $\\ln 3 \\approx 1.10$',
      '$(\\tfrac13, \\tfrac13, \\tfrac13)$ and a loss of about $0$, since the three classes are treated equally',
      '$(1, 1, 1)$ and a loss of about $0$, since each logit already equals 1',
      '$(\\tfrac13, \\tfrac13, \\tfrac13)$ and a loss of about $\\tfrac13$, the probability of the correct class',
    ],
    answer: 0,
    explanation:
      'Equal logits give equal shares, $e^1/(3e^1) = \\tfrac13$ each, so the correct class always gets $\\tfrac13$ and the loss is $-\\ln\\tfrac13 = \\ln 3 \\approx 1.10$. In general an untrained $K$-class model starts near $\\ln K$, a useful bug check. The loss is $-\\ln p$, not $p$ itself, and softmax outputs must add up to 1, so $(1, 1, 1)$ is impossible.',
    difficulty: 'intermediate',
  },
  {
    id: 'classification.softmax-and-multiclass.4',
    prompt:
      'A model must tag news photos with any of 20 labels (for example "people", "car" and "night" can all be true for one photo). Which output layer and loss are most appropriate?',
    options: [
      '20 logits, each through its own sigmoid, trained with binary cross-entropy per label',
      '20 logits through one softmax, trained with cross-entropy against the set of true labels',
      '20 logits through one softmax, trained with mean squared error against a 0/1 vector',
      'A single logit through a sigmoid, trained with binary cross-entropy on whether any label applies',
    ],
    answer: 0,
    explanation:
      'This is multi-label: several labels can be true at once, so each label needs its own independent yes/no probability (sigmoid + binary cross-entropy, `BCEWithLogitsLoss` in PyTorch). A softmax forces the 20 probabilities to share a total of 1, so labels compete as if exactly one could be true. A single output cannot say *which* labels apply.',
    difficulty: 'beginner',
  },
  {
    id: 'classification.softmax-and-multiclass.5',
    prompt: 'This PyTorch code trains a 10-class digit classifier, but it learns poorly. What is the bug?',
    code: 'logits = model(x)                       # shape (batch, 10)\nprobs = torch.softmax(logits, dim=1)\nloss = nn.CrossEntropyLoss()(probs, y)  # y: class indices, shape (batch,)\nloss.backward()',
    options: [
      '`CrossEntropyLoss` must get raw logits because it applies log-softmax itself; pass `logits`, not `probs`',
      '`y` must be one-hot encoded with shape `(batch, 10)`, because `CrossEntropyLoss` cannot read class indices',
      'The softmax should use `dim=0`, because the probabilities should add up to 1 over the batch dimension',
      '`CrossEntropyLoss` handles just two classes, so a 10-class model needs `BCEWithLogitsLoss` here instead',
    ],
    answer: 0,
    explanation:
      '`nn.CrossEntropyLoss` combines log-softmax and the negative log-likelihood, so it expects raw logits; here softmax is applied twice. Feeding it probabilities squashes them a second time: values in $[0, 1]$ produce a nearly flat distribution, a wrong loss and tiny gradients, with no error message. Class indices of shape `(batch,)` are exactly what it expects, it works for any number of classes, and the class scores are along `dim=1`.',
    difficulty: 'intermediate',
  },
]

export default questions
