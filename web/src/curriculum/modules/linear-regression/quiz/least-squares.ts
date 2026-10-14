import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'linear-regression.least-squares.1',
    prompt: 'Three data points are $(1, 2)$, $(2, 5)$ and $(3, 4)$. What is the mean squared error (MSE) of the line $\\hat{y} = 2x$?',
    options: ['$5/3 \\approx 1.67$', '$5$', '$-1/3 \\approx -0.33$', '$1$'],
    answer: 0,
    explanation:
      'Predictions are $2, 4, 6$, so the residuals $y - \\hat{y}$ are $0, 1, -2$. Squares: $0, 1, 4$, which sum to $5$; dividing by $n = 3$ gives $\\text{MSE} = 5/3$. The value $5$ forgets to divide by $n$ (that is the SSE), $-1/3$ averages the residuals without squaring, and $1$ is the mean *absolute* error.',
    difficulty: 'beginner',
  },
  {
    id: 'linear-regression.least-squares.2',
    prompt:
      'A regression model predicts that a flat will sell for 500 thousand dollars. It actually sells for 450 thousand dollars. Using residual $= y - \\hat{y}$, which statement is correct?',
    options: [
      'The residual is $-50$: the model over-predicted, so the point lies below the line',
      'The residual is $+50$: the model over-predicted, so the point lies above the line',
      'The residual is $-50$: the model under-predicted, so the point lies above the line',
      'The residual is $+50$: the model under-predicted, so the point lies below the line',
    ],
    answer: 0,
    explanation:
      'The residual is true minus predicted: $450 - 500 = -50$. A negative residual means the prediction was too high (over-prediction), and on a graph the true point sits below the fitted line. Getting $+50$ comes from subtracting the other way round ($\\hat{y} - y$).',
    difficulty: 'beginner',
  },
  {
    id: 'linear-regression.least-squares.3',
    prompt: 'Why does least squares minimise the sum of **squared** residuals rather than the plain sum of residuals?',
    options: [
      'Positive and negative residuals cancel, so a poor line can still have a plain sum of zero',
      'Squaring makes the fitted line less sensitive to outliers than the plain sum of residuals would be',
      'The plain sum of residuals can only be computed when every single residual is positive',
      'Squared residuals are always smaller than the residuals themselves, so training is faster',
    ],
    answer: 0,
    explanation:
      'Residuals above and below the line cancel: every line through $(\\bar{x}, \\bar{y})$ has residuals that sum to exactly $0$, even a terrible one, so the plain sum cannot tell good lines from bad. Squaring makes every term non-negative. It actually makes the fit *more* sensitive to outliers (a residual of 4 costs 16), and squares are larger, not smaller, whenever $|r| > 1$.',
    difficulty: 'intermediate',
  },
  {
    id: 'linear-regression.least-squares.4',
    prompt: 'For linear regression $\\hat{y} = wx + b$ with MSE loss, what does the loss look like when plotted over every possible pair $(w, b)$?',
    options: [
      'A convex bowl with a single lowest point, which is the least-squares line',
      'A landscape with many valleys, so the starting guess decides which line you end up with',
      'A flat plane, because the model is linear in $x$',
      'A saddle that curves upwards along $w$ but downwards along $b$',
    ],
    answer: 0,
    explanation:
      'MSE is a quadratic function of $w$ and $b$ (for example $11w^2 + 6wb + b^2 - 42w - 12b + 40.8$ for the Grab rides) whose squared terms dominate, so it is a convex bowl with one minimum (as long as the $x$ values are not all equal). There are no separate valleys to get trapped in, which is why gradient descent always reaches the same best line. "Linear" refers to the model, not to the shape of its loss.',
    difficulty: 'intermediate',
  },
  {
    id: 'linear-regression.least-squares.5',
    prompt: 'A least-squares fit of test score against hours of revision gives $\\hat{y} = 6x + 42$. Which interpretation is correct?',
    options: [
      'Each extra hour of revision raises the predicted score by about 6 marks',
      'A student who revises for 6 hours is predicted to score 42 marks in the test',
      'The predictions are typically about 6 marks away from the true test scores',
      'Every student who does no revision at all will score exactly 42 marks',
    ],
    answer: 0,
    explanation:
      'The slope $w = 6$ is the change in the *prediction* per extra unit of $x$: one more hour, 6 more predicted marks. The intercept $42$ is the predicted score at $x = 0$, a prediction rather than a guarantee for every student, since real points scatter around the line. A typical error size would be the RMSE, which the equation does not show; and 6 hours predicts $6 \\times 6 + 42 = 78$.',
    difficulty: 'beginner',
  },
]

export default questions
