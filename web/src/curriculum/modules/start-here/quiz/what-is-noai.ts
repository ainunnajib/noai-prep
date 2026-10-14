import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'start-here.what-is-noai.1',
    prompt: 'Which sequence correctly describes the path from NOAI 2027 to the IOAI 2027 team?',
    options: [
      'Prelim (open entry) → Final (top 150) → NTU selection and training (about 60) → IOAI team',
      'Final (top 150) → Prelim (open entry) → NTU selection and training (about 60) → IOAI team',
      'Prelim (open entry) → NTU selection and training (about 60) → Final (top 150) → IOAI team',
      'Prelim (open entry) → Final (top 60) → NTU selection and training (top 150) → IOAI team',
    ],
    answer: 0,
    explanation:
      'Everyone eligible sits the Prelim; the top 150 sit the Final; about the top 60 finalists are invited to NTU\'s Selection Test and training; a small team (4 to 8) goes to IOAI. The numbers shrink at each stage, so "Final (top 60) → NTU (top 150)" cannot be right: a later stage never has more students than an earlier one.',
    difficulty: 'beginner',
  },
  {
    id: 'start-here.what-is-noai.2',
    prompt: 'The Prelim is on Friday 19 February 2027 and the Final on Friday 5 March 2027. How many days apart are they?',
    options: ['14', '16', '12', '21'],
    answer: 0,
    explanation:
      'February 2027 has 28 days (2027 is not a leap year), so from 19 February there are $28 - 19 = 9$ days to the end of the month, plus 5 days of March: $9 + 5 = 14$. Assuming February has 30 days gives the trap answer 16. Two Fridays exactly two weeks apart are always 14 days apart.',
    difficulty: 'beginner',
  },
  {
    id: 'start-here.what-is-noai.3',
    prompt: 'Aisha is a Sec 3 student at an MOE secondary school and wants to sit the 2027 Prelim. What should she do?',
    options: [
      "Ask her school's NOAI teacher representative, so the school includes her when it signs up",
      'Email AI Singapore herself before 27 November 2026 with her full name, age and school',
      'Turn up on Prelim day at the AI Singapore office at NUS and register there in person',
      'Wait until she reaches JC, because NOAI only accepts students who are aged 17 and above on the day',
    ],
    answer: 0,
    explanation:
      'Registration for MOE students is school-based: the school signs up (by 15 January 2027) through its NOAI teacher representative, and requests from individual MOE students are not accepted. Emailing AI Singapore directly is the route for home-schooled, between-school and private or international school students only. Any full-time MOE student below 20 can enter, including Sec 3 students.',
    difficulty: 'beginner',
  },
  {
    id: 'start-here.what-is-noai.4',
    prompt: 'Ravi is 16, studies full-time at an MOE junior college, and is neither a Singapore Citizen nor a PR. Which statement is correct?',
    options: [
      'He can enter NOAI through his school and win an award, but he cannot be picked for the IOAI team',
      'He cannot enter NOAI at all, because only Singapore Citizens and PRs may take part in it',
      'He can enter, but only by emailing AI Singapore himself before the direct-entry deadline',
      'He can join the IOAI team if he wins a Gold award, because citizenship only matters for the first round of entry',
    ],
    answer: 0,
    explanation:
      'NOAI is open to full-time MOE students below 20 whatever their nationality, and they register through their school like everyone else. Citizenship matters only at the last step: only Singapore Citizens and PRs can represent Singapore at IOAI, however well they do in NOAI.',
    difficulty: 'beginner',
  },
  {
    id: 'start-here.what-is-noai.5',
    prompt: 'Why does the course tell you to start from-scratch coding practice for the Final before the Prelim, rather than after you hear you are a finalist?',
    options: [
      'The Final is only two weeks after the Prelim and tests implementation, a different skill that takes weeks to build',
      'The Prelim itself contains three long programming tasks, so all coding must be finished before the Prelim begins',
      'Prelim results are always released after the Final, so finalists never find out in time to start preparing',
      'Every Prelim question asks you to write code, so coding practice is the only way to raise your Prelim score at all',
    ],
    answer: 0,
    explanation:
      'The Prelim (150 MCQs, no programming) rewards breadth and speed; the Final adds three Python programming tasks where you implement algorithms such as K-means or attention from scratch. With only 14 days between them, that skill has to be built in advance. The Prelim has no programming tasks: it is all multiple choice.',
    difficulty: 'beginner',
  },
]

export default questions
