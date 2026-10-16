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
      'Everyone eligible sits the Prelim; the top 150 sit the Final; about the top 60 finalists are invited to NTU\'s Selection Test and training; a small team (4 to 8) goes to IOAI. The numbers shrink at each stage, so "Final (top 60) → NTU (top 150)" cannot be right: a later stage never has more students than an earlier one. "Top 150" is approximate: seats come with school quotas, so no single school takes too many, and where appropriate tied students may all go through.',
    difficulty: 'beginner',
  },
  {
    id: 'start-here.what-is-noai.2',
    prompt: 'The Prelim is on Friday 19 February 2027 and the Final on Friday 5 March 2027. How many days apart are they?',
    options: ['14', '16', '13', '21'],
    answer: 0,
    explanation:
      'February 2027 has 28 days (2027 is not a leap year), so from 19 February there are $28 - 19 = 9$ days to the end of the month, plus 5 days of March: $9 + 5 = 14$. Assuming February has 30 days gives the trap answer 16; 13 counts only the days strictly between the two dates (20 February to 4 March); and 21 is three weeks. Two Fridays exactly two weeks apart are always 14 days apart.',
    difficulty: 'beginner',
  },
  {
    id: 'start-here.what-is-noai.3',
    prompt: 'Aisha is a Sec 3 student at an MOE secondary school and wants to sit the 2027 Prelim. What should she do?',
    options: [
      "Ask her school's NOAI teacher representative: MOE students can only register through their school",
      'Email AI Singapore herself before 27 November 2026 with her full name, age, school and year level',
      'Turn up at the AI Singapore office at NUS on Prelim day and register there in person before it starts',
      'Wait until she reaches JC, because the Prelim is open to students aged 17 and over, and she is in Sec 3',
    ],
    answer: 0,
    explanation:
      'Registration for MOE students is school-based: the school signs up (by 15 January 2027) through its NOAI teacher representative, and requests from individual MOE students are not accepted. Emailing AI Singapore directly is the route for home-schooled, between-school and private or international school students only, and nobody can register on the day. The age rule is an upper limit, not a lower one: any full-time MOE student below 20 can enter, including Sec 3 students.',
    difficulty: 'beginner',
  },
  {
    id: 'start-here.what-is-noai.4',
    prompt: 'Ravi is 16, studies full-time at an MOE junior college, and is neither a Singapore Citizen nor a PR. Which statement is correct?',
    options: [
      'He can enter through his school and win an award, but only Citizens and PRs can join the IOAI team',
      'He cannot enter NOAI, because taking part is restricted to Singapore Citizens and permanent residents',
      'He can enter, but only by emailing AI Singapore himself before the direct-entry deadline in November',
      'He can join the IOAI team if he wins Gold, because citizenship matters at the entry stage and nowhere else',
    ],
    answer: 0,
    explanation:
      'NOAI is open to full-time MOE students below 20 whatever their nationality, and they register through their school like everyone else; emailing AI Singapore is for students outside MOE schools. Citizenship matters only at the last step: only Singapore Citizens and PRs can represent Singapore at IOAI, however well they do in NOAI.',
    difficulty: 'beginner',
  },
  {
    id: 'start-here.what-is-noai.5',
    prompt: 'Each stage between you and the IOAI team rewards a different skill. Which pairing is correct?',
    options: [
      'Prelim: breadth and speed; Final: from-scratch coding; NTU and IOAI: building models on real data',
      'Prelim: from-scratch coding; Final: breadth and speed; NTU and IOAI: building models on real data',
      'Prelim: breadth and speed; Final: building models on real data; NTU and IOAI: from-scratch coding',
      'Prelim: building models on real data; Final: from-scratch coding; NTU and IOAI: breadth and speed',
    ],
    answer: 0,
    explanation:
      'The Prelim is 150 short MCQs in 90 minutes across five domains, so it rewards breadth and speed. The Final adds three Python programming tasks in which you implement a classic algorithm such as k-means or attention from scratch. NTU training and IOAI set open-ended tasks on real datasets, where you build, test and improve a model. Because the Final is only 14 days after the Prelim, the from-scratch coding has to start well before the Prelim.',
    difficulty: 'beginner',
  },
]

export default questions
