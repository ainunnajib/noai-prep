import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'pandas-and-plotting.plotting-data.1',
    prompt:
      'A teacher has two numbers for each of 40 students: hours of sleep the night before a test, and the test score. She wants to see whether students who sleep more tend to score higher. Which plot should she draw?',
    options: [
      'A scatter plot of score against hours of sleep, one dot per student',
      'A histogram of the 40 test scores, with ten bins from 0 to 100',
      'A bar chart of the average test score of each class in the cohort',
      'A line plot of the 40 scores in the order of the class register',
    ],
    answer: 0,
    explanation:
      'The question is about the relationship between two numeric columns, so each student becomes one dot placed by sleep (across) and score (up); an upward-sloping cloud means more sleep goes with higher scores. A histogram shows only one column, a bar chart compares categories, and a line through register order joins students in an order that means nothing.',
    difficulty: 'beginner',
  },
  {
    id: 'pandas-and-plotting.plotting-data.2',
    prompt: 'What does this code print?',
    code: 'import matplotlib.pyplot as plt\nfig, axes = plt.subplots(2, 3)\nprint(axes.shape)',
    options: ['`(2, 3)`', '`(3, 2)`', '`(6,)`', '`6`'],
    answer: 0,
    explanation:
      '`plt.subplots(nrows, ncols)` returns a NumPy array of Axes with one entry per subplot, arranged as 2 rows and 3 columns, so its shape is `(2, 3)` and `axes[0, 2]` is the top-right plot. It is not flattened to `(6,)`, and the order is (rows, columns), not (columns, rows).',
    difficulty: 'beginner',
  },
  {
    id: 'pandas-and-plotting.plotting-data.3',
    prompt: 'In matplotlib, what is an **Axes**?',
    options: [
      'One plot inside a figure, with its own x-axis, y-axis, title and data',
      'The two lines along the bottom and left edges that carry the tick marks',
      'The whole canvas or window that is shown on screen or saved to a file',
      'The list of tick labels that matplotlib writes along the x-axis',
    ],
    answer: 0,
    explanation:
      'An Axes is a single plot: `fig, ax = plt.subplots()` gives one, and calls such as `ax.scatter` and `ax.set_title` draw on it. The whole canvas is the Figure, which can hold several Axes. The lines with tick marks are the axis lines, two of which belong to every Axes, hence the confusing name.',
    difficulty: 'beginner',
  },
  {
    id: 'pandas-and-plotting.plotting-data.4',
    prompt: "What does `sns.histplot(data=df, x='price', hue='flat_type')` draw?",
    options: [
      'Histograms of price for each flat type, in different colours on the same axes, with a legend',
      'A separate figure for each flat type, each holding one histogram of price with its own title',
      'A histogram of flat_type in which each bar is coloured by the average price of that flat type',
      'One histogram of price that uses only the rows of the most common flat type in the table',
    ],
    answer: 0,
    explanation:
      '`x` names the column to bin and `hue` names a category column: seaborn splits the rows by flat type, draws each group in its own colour on the same axes (layered on shared bins) and adds a legend. It does not make extra figures; for that you would make subplots. The roles of the two columns are not swapped, and no rows are dropped.',
    difficulty: 'intermediate',
  },
  {
    id: 'pandas-and-plotting.plotting-data.5',
    prompt:
      'A box plot of resale prices (in thousands of dollars) has $Q_1 = 400$, median $450$ and $Q_3 = 520$. Above which price is a flat drawn as a separate outlier dot, using the usual $1.5 \\times \\text{IQR}$ rule?',
    options: ['700', '640', '780', '580'],
    answer: 0,
    explanation:
      'IQR $= Q_3 - Q_1 = 520 - 400 = 120$, so the upper fence is $Q_3 + 1.5 \\times 120 = 520 + 180 = 700$. Adding only one IQR gives 640, 580 is only half an IQR above $Q_3$, and $1.5 \\times 520 = 780$ multiplies the wrong number. The whisker stretches to the largest actual price at or below 700; any price above 700 is drawn as a separate dot.',
    difficulty: 'intermediate',
  },
]

export default questions
