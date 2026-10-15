import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'large-language-models.decoding-and-sampling.1',
    prompt: 'A student changes `T` from 0.7 to 1.5 in this decoding code. What happens to the generated text?',
    code: 'probs = softmax(logits / T)\nnext_id = np.argmax(probs)',
    options: [
      'Nothing changes: dividing by a positive T never changes which logit is largest',
      'It becomes more varied, because a higher temperature flattens the distribution',
      'It becomes more repetitive, because a higher temperature sharpens the distribution',
      'It raises an error, because temperature only works together with top-k filtering',
    ],
    answer: 0,
    explanation:
      'This is greedy decoding: `argmax` always takes the top token. Temperature reshapes the probabilities but never changes their ranking, so the chosen token, and the text, stay the same. A higher T would make output more varied only if the code **sampled** from `probs` (for example with `np.random.choice`).',
    difficulty: 'intermediate',
  },
  {
    id: 'large-language-models.decoding-and-sampling.2',
    prompt: 'At $T = 1$ a model gives three tokens probabilities $0.5$, $0.25$ and $0.25$. What are their probabilities at $T = 0.5$?',
    options: ['$0.67, 0.17, 0.17$', '$0.41, 0.29, 0.29$', '$0.5, 0.25, 0.25$', '$1, 0, 0$'],
    answer: 0,
    explanation:
      'Since $e^{z/T} = (e^z)^{1/T}$, temperature 0.5 squares the odds: $0.5^2 : 0.25^2 : 0.25^2 = 0.25 : 0.0625 : 0.0625 = 4 : 1 : 1$, giving $\\tfrac46, \\tfrac16, \\tfrac16 \\approx 0.67, 0.17, 0.17$. The flatter $0.41, 0.29, 0.29$ is what $T = 2$ gives (square roots). Only $T \\to 0$ gives $1, 0, 0$.',
    difficulty: 'intermediate',
  },
  {
    id: 'large-language-models.decoding-and-sampling.3',
    prompt:
      'Sorted next-token probabilities are $0.45, 0.25, 0.15, 0.10, 0.05$. After **top-p** filtering with $p = 0.8$ and renormalising, what is the probability of the most likely token?',
    options: ['$0.45 / 0.85 \\approx 0.53$', '$0.45 / 0.70 \\approx 0.64$', '$0.45 / 0.80 \\approx 0.56$', '$0.45$, unchanged'],
    answer: 0,
    explanation:
      'Running totals: $0.45$, $0.70$ (still below 0.8), $0.85 \\geq 0.8$, so the nucleus is the first three tokens with total $0.85$. Renormalising divides by that total: $0.45/0.85 \\approx 0.53$. Stopping at 0.70 keeps too few tokens (the total must reach at least $p$), and dividing by $p$ itself or not renormalising leaves probabilities that do not add up to 1.',
    difficulty: 'intermediate',
  },
  {
    id: 'large-language-models.decoding-and-sampling.4',
    prompt:
      'Generating two tokens. Step 1: token A has probability 0.6 and token B 0.4. Step 2: the best token after A has probability 0.3, and the best token after B has probability 0.9. What does beam search with $b = 2$ return?',
    options: [
      'B then its best token, total probability 0.36, while greedy gets 0.18',
      'A then its best token, with total probability 0.18, the same as greedy',
      'B then its best token, with total probability 0.9, judged on the last step',
      'A then its best token, with total probability 0.9, from adding 0.6 and 0.3',
    ],
    answer: 0,
    explanation:
      'Beam search with $b = 2$ keeps both A and B after step 1 and compares whole sequences: $0.6 \\times 0.3 = 0.18$ against $0.4 \\times 0.9 = 0.36$. It returns the B sequence. Greedy commits to A at step 1 and ends with 0.18. Sequence probabilities multiply (or their logs add); they are never judged on one step alone.',
    difficulty: 'intermediate',
  },
  {
    id: 'large-language-models.decoding-and-sampling.5',
    prompt:
      'A school builds two tools on the same LLM: (1) answering questions about exam dates using the student handbook, and (2) brainstorming names for a new CCA. Which decoding settings fit best?',
    options: [
      '(1) greedy or a temperature near 0; (2) a temperature around 1 with top-p around 0.95',
      '(1) temperature 1.5 so answers sound natural; (2) greedy so the names are consistent',
      'Temperature 0 for both, because a low temperature also stops the model inventing facts',
      'Wide beam search for both, because a wider beam always gives more creative output',
    ],
    answer: 0,
    explanation:
      'Factual answers want the single most likely, reproducible output; brainstorming wants variety, which sampling at a moderate temperature with a top-p cut-off provides. Low temperature does not stop hallucination: it only makes the model repeat its favourite answer, right or wrong. Beam search aims for the most probable text, which tends to be bland, not creative.',
    difficulty: 'beginner',
  },
]

export default questions
