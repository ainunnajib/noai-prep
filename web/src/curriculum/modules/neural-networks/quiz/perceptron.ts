import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'neural-networks.perceptron.1',
    prompt: 'A perceptron and a logistic regression model both start by computing $z = \\mathbf{w}\\cdot\\mathbf{x} + b$. What is the key difference between them?',
    options: [
      'The perceptron snaps $z$ to 0 or 1 with a step function; logistic regression turns $z$ into a probability with a sigmoid',
      'The perceptron draws a straight decision boundary, while logistic regression draws a curved one because the sigmoid is curved',
      'The perceptron adds a bias to shift its boundary, while logistic regression uses only the weights and has no bias',
      'The perceptron can learn XOR with one neuron because its step is non-linear, while logistic regression cannot',
    ],
    answer: 0,
    explanation:
      'Both models are linear classifiers: their boundary is the straight line $z = 0$. The perceptron outputs $\\text{step}(z) \\in \\{0, 1\\}$, while logistic regression outputs $\\sigma(z)$, a probability between 0 and 1. The sigmoid curves the *probability*, not the boundary, and neither model can learn XOR on its own.',
    difficulty: 'beginner',
  },
  {
    id: 'neural-networks.perceptron.2',
    prompt:
      'A perceptron has $\\mathbf{w} = (1, 2)$, $b = -1$ and learning rate $\\eta = 0.5$. It sees the example $\\mathbf{x} = (2, -1)$ with true label $y = 1$. After one step of the perceptron learning rule, what are the weights and bias?',
    options: ['$\\mathbf{w} = (2, 1.5)$, $b = -0.5$', '$\\mathbf{w} = (0, 2.5)$, $b = -1.5$', '$\\mathbf{w} = (3, 1)$, $b = 0$', '$\\mathbf{w} = (1, 2)$, $b = -1$'],
    answer: 0,
    explanation:
      'First predict: $z = 1(2) + 2(-1) - 1 = -1$, so $\\hat y = 0$, which is wrong, and $y - \\hat y = +1$. Update: $\\mathbf{w} = (1, 2) + 0.5(2, -1) = (2, 1.5)$ and $b = -1 + 0.5 = -0.5$. Subtracting gives $(0, 2.5)$ (wrong sign); forgetting $\\eta$ gives $(3, 1)$; leaving everything unchanged would only be right if the prediction had been correct.',
    difficulty: 'intermediate',
  },
  {
    id: 'neural-networks.perceptron.3',
    prompt: 'Why can a single perceptron with inputs $x_1, x_2 \\in \\{0, 1\\}$ never learn the XOR function?',
    options: [
      'The inputs that should give 1 sit on opposite corners, so no straight line can separate them from the other two',
      'The perceptron learning rule is slow on XOR, and it would find the right weights if it were trained for enough extra epochs',
      'The step function has no useful derivative, so the perceptron learning rule cannot compute the gradient it needs for XOR',
      'The learning rate is always too large for XOR, and with a small enough learning rate the weights would settle on a solution',
    ],
    answer: 0,
    explanation:
      'A perceptron outputs 1 on one side of a straight line. XOR wants 1 at $(0,1)$ and $(1,0)$ but 0 at $(0,0)$ and $(1,1)$: the two diagonals cross at $(0.5, 0.5)$, so no line can split them. It is not a training problem: no weights exist, so more epochs or a different $\\eta$ cannot help. The perceptron rule uses no derivatives at all.',
    difficulty: 'beginner',
  },
  {
    id: 'neural-networks.perceptron.4',
    prompt:
      'A student trains a perceptron on 500 labelled points. After 1,000 epochs it still makes a few mistakes in every epoch, and its weights keep changing. What is the most likely explanation?',
    options: [
      'The classes are not linearly separable, so every possible line misclassifies at least one point',
      'The learning rate is too small, so the weights move too slowly to ever reach the separating line',
      'The weights were initialised to zero, which traps the perceptron in a cycle that it can never escape',
      'The perceptron has already found the best line and is now overfitting by memorising the training points',
    ],
    answer: 0,
    explanation:
      'The perceptron convergence theorem says that if a separating line exists, the rule makes only a finite number of mistakes and then stops changing, whatever the learning rate or starting weights. Mistakes that keep coming after 1,000 epochs therefore most likely mean no separating line exists (separable data with a tiny margin can take a long time, but would still stop eventually). A small $\\eta$ only changes the size of each nudge; it does not stop convergence on separable data.',
    difficulty: 'intermediate',
  },
  {
    id: 'neural-networks.perceptron.5',
    prompt: 'What does this code print, and which logic gate does this perceptron compute?',
    code: 'import numpy as np\n\nX = np.array([[0, 0], [0, 1],\n              [1, 0], [1, 1]])\nw = np.array([1, 1])\nb = -0.5\nprint((X @ w + b > 0).astype(int))',
    options: ['`[0 1 1 1]`, so it is an OR gate', '`[0 0 0 1]`, so it is an AND gate', '`[0 1 1 0]`, so it is an XOR gate', '`[1 1 1 0]`, so it is a NAND gate'],
    answer: 0,
    explanation:
      '`X @ w` adds the two inputs in each row: `[0, 1, 1, 2]`. Adding $b = -0.5$ gives `[-0.5, 0.5, 0.5, 1.5]`, and `> 0` turns that into `[0 1 1 1]`: 1 whenever at least one input is 1, which is OR. For AND the bias would need to be lower, such as $-1.5$; XOR is impossible for any single perceptron.',
    difficulty: 'beginner',
  },
]

export default questions
