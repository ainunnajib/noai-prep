import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'ai-first-look.what-is-ai.1',
    prompt: 'Which statement about artificial intelligence (AI), machine learning (ML) and deep learning (DL) is correct?',
    options: [
      'Every deep learning system is also a machine learning system',
      'Every AI system learns its behaviour from data',
      'Deep learning and machine learning are separate fields that do not overlap',
      'Machine learning is a special kind of deep learning',
    ],
    answer: 0,
    explanation:
      'DL sits inside ML, which sits inside AI, so every DL system is also ML (and AI). Not every AI system learns: a chess engine scoring moves with hand-written rules is AI but not ML. The nesting goes DL ⊂ ML ⊂ AI, not the other way round.',
    difficulty: 'beginner',
  },
  {
    id: 'ai-first-look.what-is-ai.2',
    prompt:
      'An online bookshop has the purchase histories of 50,000 customers but no information about what “type” of reader each one is. It wants the computer to discover groups of customers with similar tastes. Which kind of learning is this?',
    options: ['Unsupervised learning', 'Supervised learning', 'Reinforcement learning', 'Rule-based programming'],
    answer: 0,
    explanation:
      'There are no labels (nobody says which group a customer belongs to), and the goal is to find groups: that is clustering, a classic unsupervised task. Supervised learning would need a right answer for every customer, and reinforcement learning would need rewards for actions.',
    difficulty: 'beginner',
  },
  {
    id: 'ai-first-look.what-is-ai.3',
    prompt:
      'A team’s hand-written spam rules (“flag any message containing FREE or WIN”) keep making mistakes. What is the best reason to switch to a machine learning model instead?',
    options: [
      'It can pick up clues from labelled examples that nobody thought to write as rules',
      'It is guaranteed to classify every future message correctly once it is trained',
      'It needs no examples at all, so it is quicker to build than a rule list',
      'It has no numbers inside it, so its decisions are easier to explain',
    ],
    answer: 0,
    explanation:
      'Learning from many labelled messages lets the model find patterns such as “your”, money amounts and web links, which people rarely think to list, and it improves by adding examples rather than rules. It is not guaranteed to be perfect, it needs examples to learn from, and its behaviour lives in learned numbers (parameters).',
    difficulty: 'beginner',
  },
  {
    id: 'ai-first-look.what-is-ai.4',
    prompt: 'In machine learning, what is a **model**?',
    options: [
      'A function with learned numbers inside that turns an input into an output',
      'The table of labelled examples that is used for training',
      'A list of if-then rules typed in by a programmer',
      'The computer hardware on which the training runs',
    ],
    answer: 0,
    explanation:
      'A model is a function whose behaviour is set by adjustable numbers (parameters) learned during training, such as word scores in a spam filter. The labelled examples are the training data, not the model, and a hand-typed rule list is ordinary programming.',
    difficulty: 'beginner',
  },
  {
    id: 'ai-first-look.what-is-ai.5',
    prompt: 'Which situation is the clearest example of **reinforcement learning**?',
    options: [
      'A robot arm learns to stack cups, earning a point each time a cup stays on the stack',
      'A model learns to predict exam marks from 2,000 past students’ study hours and marks',
      'A program sorts 1,000 untagged photos into piles of similar-looking pictures',
      'A program flags emails using a list of banned words that the IT team typed in',
    ],
    answer: 0,
    explanation:
      'The robot arm acts and then receives a reward (a point) for good outcomes, without being shown the correct movement: that is reinforcement learning. Predicting marks from past students who all have known marks is supervised (regression), sorting untagged photos is unsupervised, and a typed-in word list is not learning at all.',
    difficulty: 'beginner',
  },
]

export default questions
