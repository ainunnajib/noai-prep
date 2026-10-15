import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'start-here.exam-format-and-strategy.1',
    prompt: 'The Prelim has 150 questions in 90 minutes. On average, how long can you spend on each question?',
    options: ['36 seconds', '60 seconds', '1 minute 40 seconds', '54 seconds'],
    answer: 0,
    explanation:
      '$90 \\times 60 = 5400$ seconds, and $5400 \\div 150 = 36$ seconds. The trap "60 seconds" comes from working out $90 \\div 150 = 0.6$ minutes and then reading 0.6 minutes as 60 seconds; 0.6 of a minute is $0.6 \\times 60 = 36$ seconds. "1 minute 40 seconds" is $150 \\div 90$, the division done the wrong way round, and "54 seconds" is $5400 \\div 100$, dividing by 100 instead of 150.',
    difficulty: 'beginner',
  },
  {
    id: 'start-here.exam-format-and-strategy.2',
    prompt:
      'With 2 minutes left you have 12 blank questions. On 4 of them you can cross out two options you are sure are wrong; the other 8 you guess blind. Wrong answers lose nothing. How many marks do you expect to gain from these 12 guesses?',
    options: ['4', '3', '6', '2'],
    answer: 0,
    explanation:
      'A guess among $k$ remaining options is worth $\\frac{1}{k}$ of a mark on average. The 4 questions with two options crossed out give $4 \\times \\frac12 = 2$; the 8 blind guesses give $8 \\times \\frac14 = 2$. Total: $2 + 2 = 4$. Treating all 12 as blind guesses gives 3, which ignores the value of eliminating options; 6 treats all 12 as 50:50 guesses ($12 \\times \\frac12$); and 2 counts only one of the two groups.',
    difficulty: 'beginner',
  },
  {
    id: 'start-here.exam-format-and-strategy.3',
    prompt: 'Why should you give an answer to every Prelim question, even ones you have no idea about?',
    options: [
      'A blank always scores 0, while even a blind guess among four options earns a quarter of a mark on average',
      'Blank answers are marked as wrong and cost a quarter of a mark each, so leaving blanks lowers your score',
      'A fully answered paper is treated as complete by the marking system, which then adds a bonus mark',
      'Guessing pays only once you can cross out two options; with fewer crossed out, a blank is safer',
    ],
    answer: 0,
    explanation:
      'The Prelim gives 1 mark per correct answer with no deduction for wrong ones. A blind guess among four options is right 1 time in 4, so it is worth $\\frac14$ of a mark on average; a blank is worth exactly 0. That makes every guess better than a blank, even with nothing crossed out (crossing out two only raises it to $\\frac12$). Blanks are not penalised and there is no bonus for a complete paper: blanks just earn nothing.',
    difficulty: 'beginner',
  },
  {
    id: 'start-here.exam-format-and-strategy.4',
    prompt: 'Which description of the NOAI Final is correct?',
    options: [
      '20 MCQs plus 3 Python programming tasks in Jupyter, implementing algorithms such as k-means from scratch',
      '150 MCQs in 90 minutes, like the Prelim, but with harder questions on generative AI and problem solving',
      'A one-week take-home project in which you train any model you like on a dataset the organisers provide',
      '3 written essays on AI ethics, followed by an interview with NTU professors about a model of your choice',
    ],
    answer: 0,
    explanation:
      'The Final has two sections: 20 theory MCQs (often code-reading in 2026) and 3 AI programming tasks in Python. Past tasks included gradient descent, k-means and RAG (2025) and gradient boosting, a U-Net fix with mean IoU, and attention (2026). The 150-MCQ format describes the Prelim, not the Final.',
    difficulty: 'beginner',
  },
  {
    id: 'start-here.exam-format-and-strategy.5',
    prompt:
      'You plan on about 30 seconds per question, so "question number ÷ 2 = minutes gone". After 45 minutes you have just finished Q60. What does that tell you, and what should you do?',
    options: [
      'You are 30 questions (15 minutes) behind: cap your time on every slow question, guess and flag it',
      'You are exactly on schedule, because 60 questions in 45 minutes matches the 36-second average pace',
      'You are about 15 questions ahead of plan, so you can slow down and double-check each answer from here on',
      'You are behind, so jump straight to the final block and leave the questions in between blank',
    ],
    answer: 0,
    explanation:
      'At 30 s per question you should reach Q90 at 45 minutes ($90 \\div 2 = 45$). You are at Q60, so you are 30 questions, or $30 \\times 30 = 900$ s $= 15$ minutes, behind. Even at the 36 s average, 45 minutes should cover $2700 \\div 36 = 75$ questions, so you are not on schedule. The fix is to cap your time per question; skipping a whole block throws away the marks in it.',
    difficulty: 'intermediate',
  },
]

export default questions
