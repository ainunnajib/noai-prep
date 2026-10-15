import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'calculus-and-gradient-descent.curvature-convexity.1',
    prompt: 'What is the Hessian of $f(x, y) = x^3 + 2xy + y^2$ at the point $(1, 0)$?',
    options: [
      '$\\begin{bmatrix} 6 & 2 \\\\ 2 & 2 \\end{bmatrix}$',
      '$\\begin{bmatrix} 6 & 0 \\\\ 0 & 2 \\end{bmatrix}$',
      '$\\begin{bmatrix} 3 & 2 \\\\ 2 & 2 \\end{bmatrix}$',
      '$\\begin{bmatrix} 6 & 4 \\\\ 4 & 2 \\end{bmatrix}$',
    ],
    answer: 0,
    explanation:
      'First partials: $f_x = 3x^2 + 2y$ and $f_y = 2x + 2y$. Second partials: $f_{xx} = 6x = 6$ at $x = 1$, $f_{yy} = 2$, and the mixed $f_{xy} = f_{yx} = 2$. Leaving out the mixed partials gives the diagonal matrix; putting the first derivative $3x^2 = 3$ on the diagonal confuses first and second derivatives; $4$ off the diagonal counts the $2xy$ term twice.',
    difficulty: 'intermediate',
  },
  {
    id: 'calculus-and-gradient-descent.curvature-convexity.2',
    prompt:
      'Gradient descent stops at a point where $\\nabla L = 0$. The Hessian there is $H = \\begin{bmatrix} 1 & 2 \\\\ 2 & 1 \\end{bmatrix}$. What has it found?',
    options: [
      'A saddle point: $\\det H < 0$, so the eigenvalues must have opposite signs',
      'A local minimum: every entry of $H$ is positive, so it curves up',
      'A local maximum: $\\det H < 0$, so the surface bends downwards',
      'A global minimum: a zero gradient means the lowest point has been reached',
    ],
    answer: 0,
    explanation:
      '$\\det H = 1 \\times 1 - 2 \\times 2 = -3 < 0$, and $\\det H$ is the product of the eigenvalues, so one is positive and one negative (they are $3$ and $-1$): a saddle point. A maximum would need $\\det H > 0$ and a negative trace. Positive entries are not enough for a minimum; you need positive eigenvalues (positive definite). A zero gradient only says the ground is flat.',
    difficulty: 'intermediate',
  },
  {
    id: 'calculus-and-gradient-descent.curvature-convexity.3',
    prompt: 'Use the second-order Taylor approximation of $e^x$ around $x = 0$ to estimate $e^{0.2}$.',
    options: ['$1.22$', '$1.2$', '$1.24$', '$1.02$'],
    answer: 0,
    explanation:
      'All derivatives of $e^x$ equal $1$ at $0$, so $e^{d} \\approx 1 + d + \\tfrac{1}{2}d^2 = 1 + 0.2 + 0.02 = 1.22$ (the true value is $1.2214\\ldots$). $1.2$ is only the first-order (tangent line) estimate, $1.24$ forgets the $\\tfrac{1}{2}$, and $1.02$ forgets the first-order term $d = 0.2$.',
    difficulty: 'beginner',
  },
  {
    id: 'calculus-and-gradient-descent.curvature-convexity.4',
    prompt:
      'A small network has $n = 10{,}000$ parameters. For one step of Newton\'s method, about how many numbers does its Hessian contain, and about how many operations does solving with it take?',
    options: [
      '$10^8$ numbers and about $10^{12}$ operations',
      '$10^4$ numbers and about $10^8$ operations',
      '$10^8$ numbers and about $10^8$ operations',
      '$2 \\times 10^4$ numbers and about $10^{12}$ operations',
    ],
    answer: 0,
    explanation:
      'The Hessian is $n \\times n$, so it has $n^2 = (10^4)^2 = 10^8$ entries (about 400 MB in 32-bit floats), and inverting or solving with it costs about $n^3 = 10^{12}$ operations, every step. $10^4$ is the size of the gradient, which is all gradient descent needs. This is why Newton\'s method is rarely used for deep networks.',
    difficulty: 'intermediate',
  },
  {
    id: 'calculus-and-gradient-descent.curvature-convexity.5',
    prompt:
      'You train a logistic regression model (whose cross-entropy loss is convex) twice on the same data, from two different random starting weights, with a suitable learning rate and enough steps. What should you expect?',
    options: [
      'Each run settles in a different local minimum',
      'Both runs reach the same lowest loss value',
      'The run that starts closer to the answer ends at a lower loss',
      'Both runs stop at saddle points, where the gradient is zero',
    ],
    answer: 1,
    explanation:
      'For a convex loss every local minimum is a global minimum, so gradient descent with a suitable learning rate heads to the same lowest loss from any start. Different valleys for different starts happen on non-convex losses, such as those of neural networks. A convex function has no saddle points, and the starting point only changes how many steps it takes.',
    difficulty: 'beginner',
  },
]

export default questions
