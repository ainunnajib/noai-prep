import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'road-to-ioai.study-roadmap.1',
    prompt:
      'Which description matches the NOAI **Final** rung of the skills ladder, as opposed to the rungs just below and above it?',
    options: [
      'Writing a known algorithm, such as K-means or attention, as correct code in a notebook with tests',
      'Recognising a concept and choosing the right option in about half a minute, without a calculator',
      'Filling the gaps in a runnable baseline notebook, then improving its score with a pretrained model',
      'Designing an approach to an unseen task whose rules forbid the obvious model, ranked on a leaderboard',
    ],
    answer: 0,
    explanation:
      'The Final asks you to implement known algorithms from scratch (in 2026: gradient boosting, mean IoU and attention). Quick recall is the Prelim rung below it; completing and improving a baseline is the NTU Selection Test rung above it; inventing under unusual rules is IOAI.',
    difficulty: 'beginner',
  },
  {
    id: 'road-to-ioai.study-roadmap.2',
    prompt:
      'A finalist has excellent Prelim scores but has never trained a model on a GPU or fine-tuned a pretrained network. It is March. According to the ladder, what should they practise next?',
    options: [
      'A PyTorch training loop on a GPU and fine-tuning a pretrained model on a past selection task',
      'More timed MCQ sets, since fast recall was what got them into the Final',
      'Past IOAI on-site tasks straight away, since IOAI is the final goal and its tasks are the hardest',
      'Reading the theory of new model families such as diffusion and CLIP, without running any code',
    ],
    answer: 0,
    explanation:
      'Their gap is rung 3 (complete and improve a real pipeline), the lowest rung with missing skills, so that is where practice pays off; the NTU Selection Test on 8 May tests exactly this. More MCQs repeat a rung they have already climbed, jumping to IOAI tasks skips the tools those tasks assume, and reading theory without running code leaves the gap exactly where it was.',
    difficulty: 'intermediate',
  },
  {
    id: 'road-to-ioai.study-roadmap.3',
    prompt:
      'You want regular, timed, IOAI-style contests with a leaderboard during the months before the Selection Test. Which source fits best?',
    options: [
      'The AI Community Contest (AICC), run every month in the IOAI style',
      'The NOAI 2026 Prelim paper, which has 300 multiple-choice questions',
      'The IOAI syllabus PDF, which lists each topic with its category',
      'The NOAI 2025 Final notebooks, which ask for from-scratch NumPy code',
    ],
    answer: 0,
    explanation:
      'AICC is run monthly by IOAI alumni in the IOAI style, with timed tasks and rankings. The Prelim paper is MCQ recall, the syllabus is a topic list rather than practice, and the 2025 Final notebooks train the from-scratch rung, not leaderboard contests.',
    difficulty: 'beginner',
  },
  {
    id: 'road-to-ioai.study-roadmap.4',
    prompt:
      'You can give 10 hours a week in 2-hour blocks, from Monday 8 March until the end of the week containing the Selection Test (9 weeks). If half the blocks go to full practice tasks of 2 blocks each, how many practice tasks is that?',
    options: ['11 tasks', '22 tasks', '45 tasks', '5 tasks'],
    answer: 0,
    explanation:
      '10 hours is $10 \\div 2 = 5$ blocks a week, so $9 \\times 5 = 45$ blocks. Half is 22.5 blocks, and $22.5 \\div 2 = 11.25$, so 11 complete tasks (22 blocks). 22 counts blocks rather than tasks, 45 is all the blocks, and 5 is one week\'s blocks.',
    difficulty: 'beginner',
  },
  {
    id: 'road-to-ioai.study-roadmap.5',
    prompt:
      'The IOAI syllabus labels "Object detection (YOLO, SSD, DETR)" as **Practice**. What does that ask of you?',
    options: [
      'Know when to use a detector and be able to run or fine-tune one with a library and read its outputs',
      'Be able to derive and implement a detector such as YOLO from scratch, including its full loss function',
      'Nothing for the hands-on tasks, because Practice topics are tested as short definition questions',
      'Memorise the published accuracy and speed of each detector, since tasks ask you to compare them',
    ],
    answer: 0,
    explanation:
      'The syllabus defines Practice as knowing what a method does, when to use it and how to implement it with library functions and interpret its output, without dissecting its internals. Theory topics are the ones whose inner workings you must understand. Practice topics are exactly what hands-on IOAI tasks use.',
    difficulty: 'intermediate',
  },
]

export default questions
