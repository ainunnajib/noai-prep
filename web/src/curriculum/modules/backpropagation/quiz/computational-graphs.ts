import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'backpropagation.computational-graphs.1',
    prompt: 'In a computational graph used for automatic differentiation, what do the edges (arrows) represent?',
    options: [
      'Values flowing from one operation into the next',
      'Learnable weights between layers of neurons',
      'The order in which training examples are processed',
      'Derivatives that the model learns during training',
    ],
    answer: 0,
    explanation:
      'Nodes are single operations (or inputs), and each edge carries a value into the operation that uses it, so the graph records which values depend on which. The "weights" option describes a neural-network diagram, where lines stand for weights; in a computational graph a weight is a leaf node like any other input.',
    difficulty: 'beginner',
  },
  {
    id: 'backpropagation.computational-graphs.2',
    prompt: 'A computational graph computes $q = a + b$ and then $f = q \\times c$. With $a = 1$, $b = 3$ and $c = -2$, what does the forward pass give for $f$?',
    options: ['$-8$', '$-5$', '$4$', '$8$'],
    answer: 0,
    explanation:
      'Compute in order: first $q = 1 + 3 = 4$, then $f = 4 \\times (-2) = -8$. The tempting $-5$ comes from evaluating $a + b \\times c = 1 + 3 \\times (-2)$, which is a different graph (the multiply happens first). $4$ stops at the add node, and $8$ drops the minus sign of $c$.',
    difficulty: 'beginner',
  },
  {
    id: 'backpropagation.computational-graphs.3',
    prompt:
      'An add node and a multiply node each have inputs $a = 2$ and $b = 5$, and each receives an upstream gradient of $3$. What gradient does input $a$ receive from each node?',
    options: ['add: $3$; multiply: $15$', 'add: $1.5$; multiply: $6$', 'add: $3$; multiply: $6$', 'add: $6$; multiply: $30$'],
    answer: 0,
    explanation:
      'Add distributes: its local derivative is 1, so $a$ gets $3 \\times 1 = 3$. Multiply swaps: the local derivative for $a$ is the other input $b = 5$, so $a$ gets $3 \\times 5 = 15$. Splitting $3$ in half between the inputs is wrong (each input gets the whole $3$), and $3 \\times 2 = 6$ uses $a$\'s own value instead of the other input\'s. The pair $6$ and $30$ wrongly multiplies by $a = 2$ as well: $3 \\times 2$ for add and $3 \\times 5 \\times 2$ for multiply.',
    difficulty: 'intermediate',
  },
  {
    id: 'backpropagation.computational-graphs.4',
    prompt: 'A sigmoid node outputs $\\sigma(z) = 0.8$. What is its local derivative $\\frac{\\partial \\sigma}{\\partial z}$ at this point?',
    options: ['$0.16$', '$0.8$', '$0.2$', '$0.64$'],
    answer: 0,
    explanation:
      'The sigmoid rule is $\\sigma(1 - \\sigma) = 0.8 \\times 0.2 = 0.16$. Answering $0.8$ treats the sigmoid like $e^x$, whose slope equals its height. $0.64 = 0.8^2$ squares the output instead, and $0.2$ is only the $(1 - \\sigma)$ half of the product. The sigmoid\'s local derivative is never more than $0.25$, so $0.8$ and $0.64$ are impossible.',
    difficulty: 'intermediate',
  },
  {
    id: 'backpropagation.computational-graphs.5',
    prompt:
      'A student builds the graph for $L = (\\hat y - y)^2$ but writes the local derivative of the subtract node $e = \\hat y - y$ as $1$ for **both** inputs. With $\\hat y = 4$ and $y = 1$, what goes wrong?',
    options: [
      '$\\partial L / \\partial y$ comes out as $+6$ instead of $-6$',
      '$\\partial L / \\partial \\hat y$ comes out as $-6$ instead of $+6$',
      'Both $\\partial L / \\partial \\hat y$ and $\\partial L / \\partial y$ come out as $0$',
      'Only the forward value of $L$ changes, from $9$ to $25$',
    ],
    answer: 0,
    explanation:
      'The square node sends back $2e = 2 \\times 3 = 6$. The subtract node should pass $6 \\times 1 = 6$ to $\\hat y$ and $6 \\times (-1) = -6$ to $y$; with the wrong rule $y$ gets $+6$, so its gradient has the wrong sign. The forward pass does not use local derivatives at all, so $L = 9$ is unaffected, and $\\partial L / \\partial \\hat y$ is still correct.',
    difficulty: 'intermediate',
  },
]

export default questions
