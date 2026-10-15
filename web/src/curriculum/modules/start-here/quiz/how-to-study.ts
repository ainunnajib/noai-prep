import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'start-here.how-to-study.1',
    prompt: 'Why does testing yourself usually build longer-lasting memory than re-reading the same notes?',
    options: [
      'Pulling an answer out of memory strengthens it and exposes gaps; re-reading mostly builds familiarity',
      'Testing takes less total time than re-reading, so you can cover more pages of notes in the same study session',
      'Re-reading works for subjects such as history, while self-testing is the only method that works for maths',
      'Tests come with marks, and the marks themselves are what make the brain store information for a longer time',
    ],
    answer: 0,
    explanation:
      'Effortful recall (retrieval practice) strengthens the memory itself, and each failed recall shows you exactly what to fix. Re-reading makes the page feel familiar, which is easy to mistake for knowing it. In Roediger and Karpicke\'s 2006 experiment, re-readers did slightly better after five minutes, but self-testers remembered much more a week later. Saving time is not the reason: a self-test can take longer than a skim.',
    difficulty: 'beginner',
  },
  {
    id: 'start-here.how-to-study.2',
    prompt: 'In the model $R = 2^{-t/h}$, a topic has a half-life of $h = 5$ days. If you do not review it, what fraction is left after 20 days?',
    options: ['$\\frac{1}{16}$', '$\\frac{1}{4}$', '$\\frac{1}{20}$', '$\\frac{1}{8}$'],
    answer: 0,
    explanation:
      '20 days is $20 \\div 5 = 4$ half-lives, so $R = 2^{-4} = \\frac{1}{16}$: halve four times ($1 \\to \\frac12 \\to \\frac14 \\to \\frac18 \\to \\frac{1}{16}$). $\\frac14$ comes from dividing by the number of half-lives instead of halving that many times, $\\frac{1}{20}$ is one over the number of days, and $\\frac18$ halves only three times (or multiplies 2 by 4 instead of raising 2 to the power 4).',
    difficulty: 'beginner',
  },
  {
    id: 'start-here.how-to-study.3',
    prompt: 'Ming has time for four short review sessions on one topic before the Prelim, six weeks away. Which plan follows this lesson\'s advice best?',
    options: [
      'Test herself on days 1, 4, 11 and 30 after first learning it, letting the gaps grow each time',
      'Re-read her notes four times on the evening she first learns it, while it is still fresh',
      'Re-read her notes once a day on the four days just before the Prelim, so it is fresh on the day',
      'Test herself four times in a row on the day before the Prelim, so nothing is forgotten overnight',
    ],
    answer: 0,
    explanation:
      'Two habits work best: retrieval (testing yourself, not re-reading) and spacing (reviews spread out, with growing gaps). Only the plan that tests her on days 1, 4, 11 and 30 does both. Reviewing four times on the first evening is too early: you have hardly forgotten anything, so each review adds little. Cramming just before the exam can work for one day, but it fades quickly, and the Final is two weeks later.',
    difficulty: 'beginner',
  },
  {
    id: 'start-here.how-to-study.4',
    prompt:
      'The lessons you still have to do need 60 hours, including practice. The Prelim is 14 weeks away, and you want to keep the last 2 weeks free for mock exams. About how many hours a week should you plan?',
    options: ['5', '4.3', '7.5', '12'],
    answer: 0,
    explanation:
      'Weeks available for lessons $= 14 - 2 = 12$, so hours per week $= 60 \\div 12 = 5$. Dividing by all 14 weeks gives about 4.3, which leaves no time for the mock fortnight. 7.5 multiplies by 1.5 for practice a second time ($90 \\div 12$), but the 60 hours already include practice. 12 is the number of weeks, not hours.',
    difficulty: 'beginner',
  },
  {
    id: 'start-here.how-to-study.5',
    prompt: 'You reach an interactive visual in one of this course\'s lessons. What does this lesson suggest you do first?',
    options: [
      'Always predict what will happen first, then move the control and compare the result with your prediction',
      'Skip the figure and go straight to the Key idea box below it, since the box sums up the visual anyway',
      'Move the controls at random as fast as you can until the picture looks interesting, then read on',
      'Copy the whole figure into your notes by hand before touching any of its controls or reading its caption',
    ],
    answer: 0,
    explanation:
      'Predicting first turns the visual into a small self-test: if the result surprises you, you have found exactly what you misunderstood. Skipping to the Key idea gives you the sentence without the understanding behind it, and random clicking shows changes without making you think about why.',
    difficulty: 'beginner',
  },
]

export default questions
