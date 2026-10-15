import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'past-paper-walkthroughs.prelim-problem-solving.1',
    prompt: 'You meet a 120-word scenario question in the Prelim. Using stem-first reading, what do you read first?',
    options: [
      'The question line, usually the last sentence of the stem',
      'The first sentence of the stem, then every number in order',
      'All four options in full, starting with the longest one',
      'Every number in the stem, before reading any of the text',
    ],
    answer: 0,
    explanation:
      'The question line tells you what kind of answer you need (a diagnosis, a metric, a fix or a mechanism), so you then know which numbers to hunt for. Starting from the top of the stem means reading the scenery before you know what matters, and scanning every number without the question gives you nothing to compare them against.',
    difficulty: 'beginner',
  },
  {
    id: 'past-paper-walkthroughs.prelim-problem-solving.2',
    prompt:
      'Training loss falls smoothly to 0.01, but validation accuracy stays at exactly 10% on a balanced 10-class problem. Why does this point to a label bug rather than to overfitting?',
    options: [
      'An overfitted model still learns some real patterns, so it would score above chance',
      'Overfitting pushes validation accuracy to exactly 1/K once the training loss is small',
      'A label bug would stop the training loss falling, so the falling loss rules out a bug',
      'Overfitting needs more features than samples, and this stem gives no feature count',
    ],
    answer: 0,
    explanation:
      'Chance level for 10 balanced classes is $1/10 = 10\\%$. Even a badly overfitted model picks up some genuine patterns and beats chance; landing exactly on chance while the training loss clearly falls means the validation labels carry no relationship to what was learnt, for example a different class-to-index mapping. A label bug in the validation set does not affect training at all, so the falling loss is no argument against it.',
    difficulty: 'intermediate',
  },
  {
    id: 'past-paper-walkthroughs.prelim-problem-solving.3',
    prompt: 'Which set of results shows high bias (underfitting) rather than high variance or another problem?',
    options: [
      'Training 68%, validation 67%, from a simple linear model',
      'Training 99%, validation 71%',
      'Training 98%, validation 62%, with 100 features and 50 samples',
      'Training 99.8%, validation 92%, test on data from two years later 64%',
    ],
    answer: 0,
    explanation:
      'Underfitting means the model does badly even on its own training data, with only a small gap to validation: 68% and 67%. A 28- or 36-point train–validation gap is high variance (overfitting). The 99.8% / 92% / 64% set has a modest train–validation gap but collapses only on later data, which is distribution drift.',
    difficulty: 'beginner',
  },
  {
    id: 'past-paper-walkthroughs.prelim-problem-solving.4',
    prompt: 'A spam filter is tested on 2,000 emails, 40 of which are spam. It flags 50 emails, and 30 of those really are spam. What are its precision and recall?',
    options: ['Precision 60%, recall 75%', 'Precision 75%, recall 60%', 'Precision 60%, recall 1.5%', 'Precision 98.5%, recall 75%'],
    answer: 0,
    explanation:
      '$TP = 30$, $FP = 50 - 30 = 20$ and $FN = 40 - 30 = 10$. Precision $= TP/(TP+FP) = 30/50 = 60\\%$; recall $= TP/(TP+FN) = 30/40 = 75\\%$. Swapping the two formulas gives the reversed pair, dividing by all 2,000 emails gives 1.5%, and 98.5% is the accuracy $(30 + 1940)/2000$, which looks great only because 98% of emails are not spam.',
    difficulty: 'intermediate',
  },
  {
    id: 'past-paper-walkthroughs.prelim-problem-solving.5',
    prompt:
      'Fine-tuning a model with batch size 64 gives "CUDA out of memory"; batch size 16 fits. You want every optimiser step to behave like a batch of 64 on the same GPU. What should you do?',
    options: [
      'Run 4 micro-batches of 16, add up their gradients, then take one optimiser step',
      'Train with batch 16 and multiply the learning rate by 4 to make up the difference',
      'Call torch.cuda.empty_cache() after every backward pass to free the extra memory',
      'Keep batch 64 but train for a quarter of the epochs so that less memory is needed',
    ],
    answer: 0,
    explanation:
      'Gradient accumulation gives an effective batch of $b \\times k = 16 \\times 4 = 64$ while only one micro-batch of 16 is in memory at a time (divide each micro-batch loss by 4 so the summed gradient is an average; only BatchNorm layers would still see batches of 16). A bigger learning rate on batch 16 changes the step size, not the gradient estimate. `empty_cache()` only returns cached blocks to the driver, and the number of epochs has no effect on the memory one step needs.',
    difficulty: 'intermediate',
  },
]

export default questions
