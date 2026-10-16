import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'road-to-ioai.baseline-to-better.1',
    prompt:
      'A task gives you HDB resale transactions from 2017 to 2024 for training. The hidden test set is every transaction from the first half of 2025. Which validation scheme best mirrors the test?',
    options: [
      'Train only on 2017–2023 and validate on all of the 2024 transactions',
      'A random 20% of rows, stratified by town so every town appears on both sides',
      '5-fold cross-validation over randomly shuffled rows, for a more stable estimate',
      'No validation set: submit to the public leaderboard after each change instead',
    ],
    answer: 0,
    explanation:
      'The test lies in the future, so validation should too: train on earlier years and validate on the latest period. Random rows (stratified or in shuffled folds) let the model train on transactions that come after the ones it is validated on, so prices and trends leak backwards and the estimate is too optimistic. Tuning on the public leaderboard overfits a small, noisy sample of the test.',
    difficulty: 'intermediate',
  },
  {
    id: 'road-to-ioai.baseline-to-better.2',
    prompt:
      'In one run you switch to a pretrained backbone, add augmentation and change the learning-rate schedule. Validation accuracy rises by 6 points. What is the best next step?',
    options: [
      'Run an ablation: remove each change in turn, over a few seeds, to see what each one actually contributes',
      'Keep the three changes for good, since a 6-point rise shows that each of them helped',
      'Add two or three more changes in the next run, since changing many things at once is working',
      'Re-run the same configuration once with a new seed and keep everything if it scores higher again',
    ],
    answer: 0,
    explanation:
      'Six points is far bigger than seed noise, so something helped, but with three changes at once you cannot tell which; one of them may even hurt. An ablation removes one component at a time and measures the drop. A re-run with a new seed checks noise, not which change mattered.',
    difficulty: 'beginner',
  },
  {
    id: 'road-to-ioai.baseline-to-better.3',
    prompt:
      'A public leaderboard scores accuracy on 400 test images, and good submissions get about 80%. Using $\\text{SE} = \\sqrt{p(1-p)/n}$, roughly how big is the random wobble in a public score?',
    options: ['2 percentage points', '0.1 percentage points', '0.8 percentage points', '4 percentage points'],
    answer: 0,
    explanation:
      '$p(1-p) = 0.8 \\times 0.2 = 0.16$, and $\\sqrt{0.16/400} = \\dfrac{0.4}{20} = 0.02$, which is 2 percentage points. So a 0.5-point public gain is well within luck. 4 points would be the wobble for only 100 images. 0.1 points comes from dividing $\\sqrt{0.16} = 0.4$ by $n = 400$ instead of by $\\sqrt{n} = 20$, and 0.8 points is $0.16 / \\sqrt{400} = 0.008$, taking the square root of $n$ but not of $p(1-p)$.',
    difficulty: 'intermediate',
  },
  {
    id: 'road-to-ioai.baseline-to-better.4',
    prompt: 'What does this code print?',
    code: 'import torch\ntorch.manual_seed(0); a = torch.rand(2)\ntorch.manual_seed(0); b = torch.rand(2)\nc = torch.rand(2)\nprint(torch.equal(a, b), torch.equal(b, c))',
    options: ['`True False`', '`True True`', '`False False`', '`False True`'],
    answer: 0,
    explanation:
      'Resetting the seed to 0 restarts the random number generator, so `b` repeats exactly the numbers in `a`. `c` is drawn next without a reset, so the generator has moved on and `c` differs from `b`. This is why fixing the seed at the top of a notebook makes a run repeatable.',
    difficulty: 'beginner',
  },
  {
    id: 'road-to-ioai.baseline-to-better.5',
    prompt:
      "A 2025 Singapore camp task gave labelled English tweets and unlabelled Spanish tweets, and asked for predictions on Spanish tweets. Only `xlm-roberta-base` was allowed, with no translation tools or LLMs. Which plan fits the rules and the data best?",
    options: [
      'Fine-tune XLM-R on the English tweets, then add its most confident Spanish predictions as pseudo-labels and retrain on both',
      'Translate the Spanish tweets into English with a translation model, then classify them with the English-trained model',
      'Label a sample of the Spanish tweets by asking a chat LLM, then fine-tune XLM-R on those machine labels',
      'Train a new small network from scratch on the Spanish tweets alone, since they match the test language',
    ],
    answer: 0,
    explanation:
      'XLM-R is multilingual, so fine-tuning on English transfers to Spanish, and confident pseudo-labels on the unlabelled Spanish tweets adapt it further while respecting every rule. Translation tools and LLMs were explicitly banned, and the Spanish tweets have no labels, so a network trained only on them has nothing to learn from.',
    difficulty: 'intermediate',
  },
]

export default questions
