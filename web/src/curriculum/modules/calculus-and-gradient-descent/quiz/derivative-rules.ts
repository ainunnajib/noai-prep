import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'calculus-and-gradient-descent.derivative-rules.1',
    prompt: 'What is the second derivative $f\'\'(x)$ of $f(x) = 2x^4 - 3x^2 + 7$?',
    options: ['$24x^2 - 6$', '$8x^3 - 6x$', '$24x^2 - 6x$', '$12x^2 - 6$'],
    answer: 0,
    explanation:
      'First derivative: $f\'(x) = 8x^3 - 6x$ (the constant 7 vanishes). Differentiate again: $f\'\'(x) = 24x^2 - 6$. $8x^3 - 6x$ stops after one step, $24x^2 - 6x$ forgets that $-6x$ becomes $-6$, and $12x^2 - 6$ drops the coefficient 2 from $2x^4$.',
    difficulty: 'beginner',
  },
  {
    id: 'calculus-and-gradient-descent.derivative-rules.2',
    prompt: 'What is the derivative of $g(x) = 5e^x - 2\\ln x$ (for $x > 0$)?',
    options: ['$5e^x - \\dfrac{2}{x}$', '$5x e^{x-1} - \\dfrac{2}{x}$', '$5e^x - 2\\ln x$', '$5e^x - 2x$'],
    answer: 0,
    explanation:
      'Constant multiples stay and sums split: $5 \\cdot e^x$ differentiates to $5e^x$ because $e^x$ is its own derivative, and $-2\\ln x$ differentiates to $-2 \\cdot \\frac{1}{x}$. $5xe^{x-1}$ wrongly applies the power rule to an exponential; leaving $-2\\ln x$ or writing $-2x$ forgets that the slope of $\\ln x$ is $\\frac{1}{x}$.',
    difficulty: 'beginner',
  },
  {
    id: 'calculus-and-gradient-descent.derivative-rules.3',
    prompt: 'Which statement about the sigmoid\'s derivative $\\sigma\'(x) = \\sigma(x)(1 - \\sigma(x))$ is true?',
    options: [
      'It is largest at $x = 0$, where it equals $0.25$',
      'It is largest at $x = 0$, where it equals $0.5$',
      'It is largest at $x = 0$, where it equals $1$',
      'It keeps growing as $x$ grows, because $\\sigma(x)$ keeps growing',
    ],
    answer: 0,
    explanation:
      '$\\sigma$ and $1 - \\sigma$ add up to 1, so their product is largest when both are $0.5$: $0.5 \\times 0.5 = 0.25$, at $x = 0$. $0.5$ is the value of $\\sigma(0)$ itself, not its slope, and $1$ is the maximum slope of $\\tanh$. For large $x$, $\\sigma$ approaches 1, so $1 - \\sigma$ and the slope approach 0: the sigmoid saturates.',
    difficulty: 'intermediate',
  },
  {
    id: 'calculus-and-gradient-descent.derivative-rules.4',
    prompt: 'This NumPy code computes the slope of ReLU at three inputs. What does it print, and what does it assume at $x = 0$?',
    code: 'import numpy as np\nx = np.array([-2.0, 0.0, 3.0])\ngrad = (x > 0).astype(float)\nprint(grad)',
    options: [
      '`[0. 0. 1.]`, using slope 0 at the kink',
      '`[0. 1. 1.]`, using slope 1 at the kink',
      '`[-1.  0.  1.]`, because the slope is the sign of $x$',
      '`[0.  0.5 1. ]`, averaging the slopes on each side',
    ],
    answer: 0,
    explanation:
      '`x > 0` is `[False, False, True]`, which becomes `[0. 0. 1.]` as floats. ReLU has slope 0 for negative inputs and 1 for positive ones; at the kink $x = 0$ its derivative is undefined, and this code (like PyTorch) uses 0 there. The sign of $x$ is the slope of $|x|$, not of ReLU.',
    difficulty: 'intermediate',
  },
  {
    id: 'calculus-and-gradient-descent.derivative-rules.5',
    prompt:
      'A model\'s prediction $F$ is scored with the absolute error $L = |y - F|$. For a sample with $y = 5$ and $F = 3$, what is the **negative** gradient $-\\frac{dL}{dF}$?',
    options: ['$+1$', '$-1$', '$+2$', '$0$'],
    answer: 0,
    explanation:
      'As a function of $F$, $|y - F|$ has slope $-\\text{sign}(y - F)$, so the negative gradient is $\\text{sign}(y - F) = \\text{sign}(5 - 3) = +1$: raise $F$ towards $y$. $+2$ is the plain residual $y - F$, which is the negative gradient of the squared loss $\\tfrac{1}{2}(y - F)^2$, not of the absolute loss. $0$ would only apply at the corner, where $F = y$.',
    difficulty: 'advanced',
  },
]

export default questions
