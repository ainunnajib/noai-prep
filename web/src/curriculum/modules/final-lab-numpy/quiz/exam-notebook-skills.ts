import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'final-lab-numpy.exam-notebook-skills.1',
    prompt:
      'The protected cell calls your function as `linear_regression_gradient_descent(X=X, y=y, alpha=alpha, iterations=iterations)`. You changed the first line of your function to `def linear_regression_gradient_descent(X, y, lr, iterations):`. What happens when the protected cell runs?',
    options: [
      'It stops with a `TypeError`: the call passes `alpha`, which is no longer a parameter',
      'It runs normally, because Python matches the arguments by their position in the call',
      'It stops with a `NameError` the first time the loop reaches the undefined name `lr`',
      'It runs, but `lr` silently takes its default value of `None` inside the function',
    ],
    answer: 0,
    explanation:
      'The call passes arguments **by keyword**, so Python looks for a parameter called `alpha`, finds none and raises a `TypeError` before the body runs; the loop never gets far enough for a `NameError`. Position does not help with keyword arguments. Keep the stub\'s parameter names exactly; if you want a shorter name, write `lr = alpha` inside the function.',
    difficulty: 'beginner',
  },
  {
    id: 'final-lab-numpy.exam-notebook-skills.2',
    prompt:
      'You find a bug in your function, fix it in its cell, then re-run only the protected test cell. The output has not changed. What is the most likely reason?',
    options: [
      'The kernel still runs the old function, since only the test cell was run again',
      'The test cell caches its last output, so it must be deleted and pasted back in',
      'Jupyter runs cells in page order, so the test cell ran before your function cell',
      'Your fix had no effect, because editing a cell automatically restarts the kernel',
    ],
    answer: 0,
    explanation:
      'Editing text on the page does not change what the kernel remembers. Until you run the function cell again, the kernel keeps the old definition, so the test calls the old code. Re-run the edited cell, then the test; before submitting, use Restart & Run All.',
    difficulty: 'beginner',
  },
  {
    id: 'final-lab-numpy.exam-notebook-skills.3',
    prompt: 'What does this code print?',
    code: 'import numpy as np\ntheta = np.array([0.00297485, 0.99869136])\nprint(tuple(float(v) for v in np.round(theta, 4)))',
    options: ['`(0.003, 0.9987)`', '`(0.0029, 0.9986)`', '`[0.003  0.9987]`', '`(np.float64(0.003), np.float64(0.9987))`'],
    answer: 0,
    explanation:
      '`np.round(theta, 4)` rounds to the nearest 4th decimal: 0.00297… becomes 0.0030 (shown as 0.003) and 0.99869… becomes 0.9987. Cutting off the digits instead of rounding would give 0.0029 and 0.9986. `float(v)` turns each NumPy number into a plain Python float, so the tuple prints without `np.float64(...)`, and as a tuple, not an array.',
    difficulty: 'intermediate',
  },
  {
    id: 'final-lab-numpy.exam-notebook-skills.4',
    prompt:
      'You have 20 minutes left and three unfinished parts: **A** is 8 marks, needs about 20 minutes, and you are 50% sure; **B** is 2 marks, needs 2 minutes, and you are 90% sure; **C** is 5 marks, needs 25 minutes, and you are 40% sure. Which should you do first?',
    options: [
      'B, because it gives about 0.9 expected marks per minute',
      'A, because it carries the most marks of the three',
      'C, because it gives about 0.4 expected marks per minute',
      'A, because 50% is the best chance among the big parts',
    ],
    answer: 0,
    explanation:
      'Expected marks per minute: A = $8 \\times 0.5 / 20 = 0.2$, B = $2 \\times 0.9 / 2 = 0.9$, C = $5 \\times 0.4 / 25 = 0.08$. B banks almost 2 marks in 2 minutes, then A can use the remaining 18. C cannot even be finished in the time. The biggest part is not the best first move.',
    difficulty: 'intermediate',
  },
  {
    id: 'final-lab-numpy.exam-notebook-skills.5',
    prompt:
      'Ten minutes before the end, your last part still crashes with an error, and your earlier parts all passed their tests an hour ago. What is the best use of the time?',
    options: [
      'Make every cell run by commenting out the failing lines, then Restart & Run All and read the outputs',
      'Keep debugging the crashing part until the final second, since the earlier parts were already tested',
      'Delete the protected test cells that fail, so the notebook finishes without showing any errors',
      'Leave everything as it is, because each function is always marked separately from the others',
    ],
    answer: 0,
    explanation:
      'An hour-old test proves little: later cells may have changed variables the earlier parts rely on, and a crash can stop a top-to-bottom run. Making every cell run and doing one clean Restart & Run All protects the marks you have. Editing protected cells is never allowed, and you cannot assume how the marker isolates each function.',
    difficulty: 'intermediate',
  },
]

export default questions
