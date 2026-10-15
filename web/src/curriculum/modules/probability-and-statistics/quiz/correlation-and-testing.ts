import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'probability-and-statistics.correlation-and-testing.1',
    prompt: 'Heights are converted from metres to centimetres. What does this code print?',
    code: 'import numpy as np\nh = np.array([1.5, 1.6, 1.7, 1.8])   # heights in metres\nm = np.array([50, 56, 60, 70])       # masses in kg\ncov_ratio = np.cov(h * 100, m)[0, 1] / np.cov(h, m)[0, 1]\nr_ratio = np.corrcoef(h * 100, m)[0, 1] / np.corrcoef(h, m)[0, 1]\nprint(round(cov_ratio), round(r_ratio))',
    options: ['`100 1`', '`100 100`', '`1 1`', '`10000 1`'],
    answer: 0,
    explanation:
      'Multiplying every height by 100 multiplies each $(x - \\bar{x})$ by 100, so the covariance grows 100 times. The correlation divides by $\\sigma_X$, which also grows 100 times, so the factors cancel and $r$ is unchanged (ratio 1). `100 100` forgets that correlation is unit-free; `1 1` wrongly assumes the covariance is unit-free too; `10000 1` squares the factor, which would happen to the *variance* of the heights, not to the covariance.',
    difficulty: 'intermediate',
  },
  {
    id: 'probability-and-statistics.correlation-and-testing.2',
    prompt:
      'A survey of 500 students finds that those who sleep more tend to get higher exam scores, with correlation $r = 0.6$. Which conclusion does this data alone support?',
    options: [
      'Getting more sleep will raise any student\'s exam score, by an amount that $r$ lets us predict',
      'Sleep and scores rise together, but this data cannot show that more sleep causes higher scores',
      'Higher scores must cause students to sleep more, because the correlation between them is positive',
      'Exactly 60% of the differences in exam scores are caused by differences in sleep',
    ],
    answer: 1,
    explanation:
      'A correlation shows that two variables move together, not why. A confounder (for example, students with less stressful schedules may both sleep more and revise better) or reverse causation could produce the same $r$; only a randomised experiment could show cause. A positive $r$ says nothing about which way causation runs, and $r = 0.6$ does not mean "60% caused by" anything.',
    difficulty: 'beginner',
  },
  {
    id: 'probability-and-statistics.correlation-and-testing.3',
    prompt:
      'A team tests $H_0$: "the new model is no more accurate than the old one" and gets $p = 0.04$, with significance level $\\alpha = 0.05$. Which statement is correct?',
    options: [
      'The new model is 4% more accurate than the old one, and this improvement is statistically significant',
      'There is a 4% probability that $H_0$ is true, so $H_0$ is rejected at the 5% significance level',
      'Results at least this extreme would occur about 4% of the time if $H_0$ were true, so $H_0$ is rejected',
      'Because $p$ is so close to $\\alpha$, the result is not significant and $H_0$ should be kept',
    ],
    answer: 2,
    explanation:
      'The p-value is computed assuming $H_0$ is true: it is the probability of data at least as extreme as observed. Since $0.04 \\le 0.05$, $H_0$ is rejected. It is not the probability that $H_0$ is true (that would need Bayes\' theorem and a prior), it is not an effect size, and there is no "too close" rule: $p \\le \\alpha$ decides.',
    difficulty: 'intermediate',
  },
  {
    id: 'probability-and-statistics.correlation-and-testing.4',
    prompt:
      'A screening test uses $H_0$: "the patient does not have the disease". The result leads the doctor **not** to reject $H_0$, but the patient actually has the disease. What has happened?',
    options: [
      'A Type II error: a false negative',
      'A Type I error: a false positive',
      'A Type I error: a false negative',
      'No error: keeping $H_0$ is always the safe decision',
    ],
    answer: 0,
    explanation:
      '$H_0$ was false (the patient is ill) but was not rejected: a real effect was missed. That is a Type II error, a false negative. A Type I error is the opposite: rejecting a true $H_0$, a false positive (telling a healthy patient they are ill). Missing a disease is far from "safe", which is why screening tests are tuned to keep Type II errors low.',
    difficulty: 'beginner',
  },
  {
    id: 'probability-and-statistics.correlation-and-testing.5',
    prompt:
      'A team lowers its significance level from $\\alpha = 0.05$ to $\\alpha = 0.01$ but keeps the same sample size and the same test. What happens to the two kinds of error?',
    options: [
      'Type I errors become rarer, while Type II errors stay exactly the same',
      'Type I and Type II errors both become rarer at the same time',
      'Type I errors become more common, but Type II errors become rarer',
      'Type I errors become rarer, but Type II errors become more common',
    ],
    answer: 3,
    explanation:
      'The probability of a Type I error is $\\alpha$ itself, so it falls from 5% to 1%. But a stricter threshold also lets more real effects slip through, so $\\beta$ (the Type II error rate) rises. With the data fixed you can only trade one error for the other; collecting more data is what lowers both.',
    difficulty: 'intermediate',
  },
]

export default questions
