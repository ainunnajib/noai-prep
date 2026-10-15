import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'calculus-and-gradient-descent.derivatives-as-slopes.1',
    prompt: 'Which description of the derivative $f\'(a)$ is correct?',
    options: [
      'The slope of the straight line joining the two ends of the graph of $f$',
      'The slope of the tangent line to the graph of $f$ at $x = a$',
      'The height of the graph of $f$ at $x = a$',
      'The value of $f(a + h) - f(a)$ when $h = 1$',
    ],
    answer: 1,
    explanation:
      'The derivative is the limit of secant slopes $\\frac{f(a+h) - f(a)}{h}$ as $h \\to 0$, which is the slope of the tangent at $a$: the instantaneous rate of change. A line joining the two ends gives an average rate over the whole graph, and $f(a+1) - f(a)$ is a rise over a run of 1, not a limit. The height $f(a)$ is a different quantity altogether.',
    difficulty: 'beginner',
  },
  {
    id: 'calculus-and-gradient-descent.derivatives-as-slopes.2',
    prompt: 'For $f(x) = x^2$, what is the slope of the secant line joining $x = 2$ and $x = 2.1$?',
    options: ['4', '4.1', '0.41', '4.41'],
    answer: 1,
    explanation:
      'Rise $= 2.1^2 - 2^2 = 4.41 - 4 = 0.41$ and run $= 0.1$, so the slope is $0.41 \\div 0.1 = 4.1$. It is a little more than the tangent slope $f\'(2) = 2 \\times 2 = 4$ because the curve gets steeper between 2 and 2.1. 0.41 forgets to divide by the run, and 4.41 is just $f(2.1)$.',
    difficulty: 'beginner',
  },
  {
    id: 'calculus-and-gradient-descent.derivatives-as-slopes.3',
    prompt:
      'While training a model you find that the derivative of the loss with respect to one weight is $\\frac{dL}{dw} = 2.5$ at the current value of $w$. Which small change to $w$ will lower the loss?',
    options: ['Decrease $w$ slightly', 'Increase $w$ slightly', 'Leave $w$ alone, because the loss is at a minimum', 'Set $w$ to 2.5'],
    answer: 0,
    explanation:
      'A positive slope means the loss goes up as $w$ goes up, so to go downhill you move $w$ the other way. For example, decreasing $w$ by $0.01$ changes the loss by about $2.5 \\times (-0.01) = -0.025$. A minimum would need the slope to be 0, and 2.5 is the slope, not a good value for $w$.',
    difficulty: 'beginner',
  },
  {
    id: 'calculus-and-gradient-descent.derivatives-as-slopes.4',
    prompt: 'A function $g$ has derivative $g\'(x) = (x - 1)(x - 4)$. At which value of $x$ does $g$ have a local minimum?',
    options: ['$x = 1$', '$x = 0$', 'At both $x = 1$ and $x = 4$', '$x = 4$'],
    answer: 3,
    explanation:
      'Check the sign of $g\'$ on each side. Below 1 both brackets are negative, so $g\' > 0$ (rising); between 1 and 4, $g\' < 0$ (falling); above 4, $g\' > 0$ again. Falling then rising happens at $x = 4$, a valley. At $x = 1$ it goes from rising to falling, which is a peak, so "both" is wrong even though $g\' = 0$ at both.',
    difficulty: 'intermediate',
  },
  {
    id: 'calculus-and-gradient-descent.derivatives-as-slopes.5',
    prompt: 'You know that $f(4) = 10$ and $f\'(4) = -2$. Using the tangent line, what is the best estimate of $f(4.05)$?',
    options: ['9.9', '10.1', '8', '9.95'],
    answer: 0,
    explanation:
      'Near $x = 4$, $f(4 + h) \\approx f(4) + f\'(4)\\,h = 10 + (-2)(0.05) = 10 - 0.1 = 9.9$. 10.1 ignores the minus sign of the slope, 8 adds the whole slope as if the step were 1, and 9.95 forgets to multiply the step by the slope.',
    difficulty: 'intermediate',
  },
]

export default questions
