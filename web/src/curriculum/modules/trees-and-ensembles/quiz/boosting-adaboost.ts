import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'trees-and-ensembles.boosting-adaboost.1',
    prompt: 'Which statement correctly contrasts bagging with boosting?',
    options: [
      'Bagging trains its models independently on bootstrap samples and mainly reduces variance; boosting trains them in sequence on re-weighted data and mainly reduces bias.',
      'Bagging trains its models in sequence on re-weighted data and mainly reduces bias; boosting trains them independently on bootstrap samples and mainly reduces variance.',
      'Both train their models independently, but bagging uses deep trees to reduce bias while boosting uses stumps to reduce variance.',
      'Both train their models in sequence, but bagging combines them with a weighted vote while boosting gives every model an equal vote.',
    ],
    answer: 0,
    explanation:
      'Bagging grows strong, deep trees in parallel on different bootstrap samples and averages them, which cancels their random wobbles (variance). Boosting adds weak learners one at a time, each focusing on the examples the team still gets wrong, which removes systematic error (bias). The second option swaps the two exactly, and boosting, not bagging, is the one with the weighted vote.',
    difficulty: 'beginner',
  },
  {
    id: 'trees-and-ensembles.boosting-adaboost.2',
    prompt: 'In AdaBoost, a weak learner has weighted error $\\varepsilon = 0.1$. What is its say $\\alpha = \\tfrac12 \\ln \\frac{1-\\varepsilon}{\\varepsilon}$?',
    options: ['$\\ln 3 \\approx 1.10$', '$\\ln 9 \\approx 2.20$', '$-\\ln 3 \\approx -1.10$', '$0.9$'],
    answer: 0,
    explanation:
      '$\\frac{1-0.1}{0.1} = 9$, so $\\alpha = \\tfrac12 \\ln 9 = \\ln 9^{1/2} = \\ln 3 \\approx 1.10$. Forgetting the $\\tfrac12$ gives $\\ln 9$, and turning the fraction upside down gives the negative value. 0.9 is the learner\'s weighted accuracy, not its say.',
    difficulty: 'intermediate',
  },
  {
    id: 'trees-and-ensembles.boosting-adaboost.3',
    prompt:
      'Ten training examples each have weight 0.1, and this round\'s stump misclassifies exactly two of them. After the lines below run, what is the weight of **each misclassified** example?',
    code: 'incorrect = (stump.predict(X) != y)\neps = np.sum(weights[incorrect])\nalpha = 0.5 * np.log((1 - eps) / eps)\nweights *= np.exp(alpha * (2 * incorrect - 1))\nweights /= weights.sum()',
    options: ['0.25', '0.2', '0.0625', '0.5'],
    answer: 0,
    explanation:
      '$\\varepsilon = 0.2$, so $\\alpha = \\tfrac12 \\ln 4 = \\ln 2$, $e^{\\alpha} = 2$ and $e^{-\\alpha} = 0.5$. Mistakes become $0.2$ and correct examples $0.05$; the total is $2(0.2) + 8(0.05) = 0.8$, so each mistake ends at $0.2 / 0.8 = 0.25$. 0.2 skips the last line (normalising), 0.0625 is the weight of each correct example, and 0.5 is the two mistakes together.',
    difficulty: 'intermediate',
  },
  {
    id: 'trees-and-ensembles.boosting-adaboost.4',
    prompt: 'Why does AdaBoost need each weak learner to have a weighted error below 0.5?',
    options: [
      'At $\\varepsilon = 0.5$ its say $\\alpha$ is 0, so it adds nothing to the vote, and above 0.5 $\\alpha$ turns negative; only learners that beat a coin flip push the vote the right way.',
      'At $\\varepsilon = 0.5$ the weights can no longer be normalised to sum to 1, so the re-weighting step divides by zero and training crashes.',
      'A learner with $\\varepsilon$ above 0.5 has overfitted the weighted data, so its say $\\alpha$ grows very large and it drowns out the earlier learners.',
      'Above 0.5 the misclassified examples would lose weight while the correct ones gain it, which halves the size of every later learner\'s $\\alpha$.',
    ],
    answer: 0,
    explanation:
      'With $\\varepsilon = 0.5$, $\\frac{1-\\varepsilon}{\\varepsilon} = 1$ and $\\ln 1 = 0$: a coin-flip learner gets no say and does not change the weights. Above 0.5 the ratio is below 1, so $\\alpha < 0$. Normalising still works fine (the total is positive), and a learner worse than chance gets a negative say, not a huge positive one.',
    difficulty: 'intermediate',
  },
  {
    id: 'trees-and-ensembles.boosting-adaboost.5',
    prompt:
      'About 5% of the labels in a training set are known to be wrong. An AdaBoost model with stumps reaches 91% validation accuracy after 50 rounds. After 1,000 rounds its training accuracy is 100%, but validation accuracy has dropped to 84%. What is the most likely cause?',
    options: [
      'The mislabelled examples kept gaining weight round after round, so later stumps bent the boundary to fit them; choose the number of rounds on validation data.',
      'Boosting only reduces bias, so it cannot overfit; the drop must come from a validation set that is drawn from a different distribution.',
      'The stumps are too weak to fit the data; replacing them with fully grown trees would bring validation accuracy back above 91%.',
      'After round 50 every stump had a weighted error above 0.5, so all the later $\\alpha$ values were negative and reversed the earlier votes.',
    ],
    answer: 0,
    explanation:
      'AdaBoost multiplies the weight of a misclassified example by $e^{\\alpha}$ every round it stays wrong, so mislabelled points grow exponentially heavy and the later stumps chase them: 100% training accuracy with falling validation accuracy is classic overfitting to label noise. Boosting mainly reduces bias but can certainly overfit, and fully grown trees would overfit even faster. Training accuracy that keeps rising rules out a run of negative votes.',
    difficulty: 'advanced',
  },
]

export default questions
