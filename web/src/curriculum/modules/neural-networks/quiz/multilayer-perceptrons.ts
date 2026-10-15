import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'neural-networks.multilayer-perceptrons.1',
    prompt: 'A fully connected layer computes $\\mathbf{h} = \\text{ReLU}(W\\mathbf{x} + \\mathbf{b})$. It takes 4 inputs and has 3 neurons. What is the shape of $W$?',
    options: ['$3 \\times 4$', '$4 \\times 3$', '$3 \\times 1$', '$4 \\times 4$'],
    answer: 0,
    explanation:
      '$W$ has one row per neuron (3) and one column per input (4), so it is $3 \\times 4$; then $(3 \\times 4)(4 \\times 1)$ gives one value per neuron, $3 \\times 1$. $4 \\times 3$ is the transpose $W^\\top$, which appears when inputs are stored as rows ($XW^\\top$). $3 \\times 1$ is the shape of $\\mathbf{b}$ and of the output, not of $W$.',
    difficulty: 'beginner',
  },
  {
    id: 'neural-networks.multilayer-perceptrons.2',
    prompt: 'How many trainable parameters does a fully connected 20-10-10-2 network have (20 inputs, two hidden layers of 10, 2 outputs)?',
    options: ['342', '320', '22', '4,000'],
    answer: 0,
    explanation:
      'Each layer has in × out weights plus out biases: $20 \\times 10 + 10 = 210$, $10 \\times 10 + 10 = 110$ and $10 \\times 2 + 2 = 22$, so $210 + 110 + 22 = 342$. 320 forgets the biases, 22 is the number of neurons with weights ($10 + 10 + 2$), and 4,000 multiplies all the layer sizes together, which counts nothing real.',
    difficulty: 'beginner',
  },
  {
    id: 'neural-networks.multilayer-perceptrons.3',
    prompt: 'What does this code print?',
    code: 'import numpy as np\nx = np.array([1, 2])\nW = np.array([[ 1,  1],\n              [ 2, -1],\n              [-1,  0]])\nb = np.array([0, 1, 0])\nh = np.maximum(0, W @ x + b)\nprint(h)',
    options: ['`[3 1 0]`', '`[3 1 -1]`', '`[3 0 0]`', 'A shape error, because `W` has 3 rows but `x` has only 2 entries'],
    answer: 0,
    explanation:
      'Each row of `W` times `x`: $1+2 = 3$, $2-2 = 0$, $-1+0 = -1$. Adding `b` gives $[3, 1, -1]$, and `np.maximum(0, …)` is ReLU, so the $-1$ becomes 0: `[3 1 0]`. `[3 1 -1]` forgets the ReLU and `[3 0 0]` forgets the bias. There is no error: `W @ x` only needs the number of **columns** of `W` (2) to match the length of `x`.',
    difficulty: 'intermediate',
  },
  {
    id: 'neural-networks.multilayer-perceptrons.4',
    prompt: 'Which statement about the universal approximation theorem is correct?',
    options: [
      'With a non-polynomial activation such as ReLU and enough neurons, one hidden layer can approximate any continuous function on a closed, bounded region.',
      'With enough training epochs, gradient descent is guaranteed to find weights that let one wide hidden layer fit any continuous function exactly.',
      'Without any activation function, one hidden layer with enough neurons can approximate any continuous function on a closed, bounded region of inputs.',
      'A network can approximate any continuous function only if it has at least as many hidden layers as there are input features, whatever its width.',
    ],
    answer: 0,
    explanation:
      'The theorem is an existence result: one hidden layer with a non-polynomial activation (such as ReLU, sigmoid or tanh) and enough neurons **has** weights that approximate any continuous function on a closed, bounded region. It says nothing about training finding those weights, and the number of neurons needed may be huge. Without an activation the network is linear, so it can only make straight-line functions; and one hidden layer is enough in principle, whatever the number of features.',
    difficulty: 'intermediate',
  },
  {
    id: 'neural-networks.multilayer-perceptrons.5',
    prompt:
      'A network with **one hidden layer of 2 ReLU neurons** is trained on a two-spiral dataset. After 2,000 epochs the loss has stopped falling, and both training and test accuracy are stuck at about 60%. What is the most sensible next step?',
    options: [
      'Add more neurons and hidden layers, because two straight folds cannot carve out a spiral',
      'Train for another 20,000 epochs, because the loss always reaches zero eventually',
      'Remove the ReLU activations so that the gradients can flow more easily',
      'Collect more training data, because the network is overfitting the spirals',
    ],
    answer: 0,
    explanation:
      'Training and test accuracy are both low, so the model is **underfitting**: two ReLU neurons give only two straight folds, which cannot follow a spiral, so the network needs more capacity (more neurons and layers). More epochs will not help once the loss has plateaued. Removing ReLU makes the whole network linear, so the boundary becomes one straight line. Overfitting would show high training accuracy with low test accuracy.',
    difficulty: 'intermediate',
  },
]

export default questions
