import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'large-language-models.how-llms-are-built.1',
    prompt: 'The "P" in GPT stands for *pre-trained*, and this pretraining stage is described as **self-supervised**. Why?',
    options: [
      'Each position\'s label is the next token, taken from the raw text itself, so nobody has to label the data',
      'The model checks its own answers against a reward model, so no human feedback is needed at this stage',
      'People label a small sample of the text, and the model then labels the remaining text by itself',
      'The model is trained without any loss function, simply by reading the text many times over',
    ],
    answer: 0,
    explanation:
      'In next-token prediction, the "correct answer" at every position is just the token that comes next in the document, so labels come free with the raw text. That is what lets pretraining use trillions of tokens. A reward model belongs to RLHF, a later stage; and pretraining certainly has a loss: the average $-\\ln p(\\text{real next token})$.',
    difficulty: 'beginner',
  },
  {
    id: 'large-language-models.how-llms-are-built.2',
    prompt:
      'Classic RLHF trains a reward model on human comparisons, then improves the LLM with reinforcement learning. What does **DPO** (direct preference optimisation) change?',
    options: [
      'It learns from the same comparisons directly, with no reward model and no reinforcement learning',
      'It swaps the human comparisons for scores from a reward model trained on pretraining text instead',
      'It skips supervised fine-tuning and aligns the base model with comparisons straight after pretraining',
      'It drops the comparisons and trains on ideal replies written by people instead, just as SFT does',
    ],
    answer: 0,
    explanation:
      'DPO turns the comparisons into an ordinary loss on the LLM itself: raise the probability of the preferred answer relative to the rejected one, while staying close to the SFT model. So the separate reward model and the reinforcement-learning loop disappear, but the human comparisons stay. It still starts from an SFT model, and it does not go back to copying hand-written replies.',
    difficulty: 'intermediate',
  },
  {
    id: 'large-language-models.how-llms-are-built.3',
    prompt: 'In RLHF, what is the reward model trained on, and how is it then used?',
    options: [
      'People\'s comparisons of pairs of answers; it then scores the LLM\'s new answers during reinforcement learning',
      "People's hand-written ideal answers; it then writes the replies that the LLM learns to copy word for word",
      'The next tokens of web text; it then tells the LLM which single token to write at each position',
      'Sentences labelled toxic or safe; it then deletes unsafe tokens from the LLM vocabulary for good',
    ],
    answer: 0,
    explanation:
      'People compare answers ("A is better than B"); the reward model learns scores $r$ so that $\\sigma(r_A - r_B)$ matches those preferences. Reinforcement learning then updates the LLM to produce answers the reward model scores highly. Hand-written ideal answers are the data for SFT, the stage before.',
    difficulty: 'intermediate',
  },
  {
    id: 'large-language-models.how-llms-are-built.4',
    prompt:
      'Use $C \\approx 6ND$ (compute, parameters, training tokens) and the Chinchilla rule of about 20 training tokens per parameter. Which plan is compute-optimal for a budget of $C = 1.2 \\times 10^{20}$ FLOPs?',
    options: [
      '1 billion parameters trained on 20 billion tokens',
      '10 billion parameters trained on 2 billion tokens',
      '100 million parameters trained on 200 billion tokens',
      '20 billion parameters trained on 1 billion tokens',
    ],
    answer: 0,
    explanation:
      'With $D = 20N$: $6 \\cdot N \\cdot 20N = 120N^2 = 1.2 \\times 10^{20}$, so $N^2 = 10^{18}$ and $N = 10^9$ (1 billion), giving $D = 2 \\times 10^{10}$ (20 billion tokens). Every option spends the same budget (check: $6 \\times 10^{10} \\times 2 \\times 10^{9} = 1.2 \\times 10^{20}$ too), but only 1 billion parameters on 20 billion tokens has 20 tokens per parameter. The 10-billion-parameter plan gets only 0.2 tokens per parameter and would be badly undertrained.',
    difficulty: 'intermediate',
  },
  {
    id: 'large-language-models.how-llms-are-built.5',
    prompt:
      'Researchers plot the best pretraining loss they can reach against training compute, both on log scales, and the points lie on a straight line sloping down. What does this tell them?',
    options: [
      'Every 10× more compute multiplies the loss by the same factor, so big runs can be predicted from small ones',
      'Every extra FLOP lowers the loss by the same fixed amount, so the loss will reach zero at a predictable budget',
      'Model size has stopped mattering, so from now on only the number of training steps affects the loss',
      'The model is overfitting, because a training loss that keeps falling means it is memorising its data',
    ],
    answer: 0,
    explanation:
      'A straight line on log–log axes is a power law, $L \\approx a C^{-k}$: multiplying $C$ by 10 always multiplies $L$ by $10^{-k}$. That predictability is what lets labs plan big training runs. A fixed drop per FLOP would be a straight line on ordinary (linear) axes, and a power law never reaches zero.',
    difficulty: 'intermediate',
  },
  {
    id: 'large-language-models.how-llms-are-built.6',
    prompt:
      'A lab trains a reasoning model on maths problems. The model writes out its working, and it gets reward 1 if its final answer matches the known answer and 0 otherwise. How does this reward differ from classic RLHF?',
    options: [
      'Only a program checking the final answer decides the reward; no reward model of human preferences is needed at all',
      'People still compare pairs of the model\'s answers, exactly as in RLHF, but only on maths questions',
      'It is the next-token loss on the working, so this stage is really another round of pretraining on maths text',
      'It is copied from ideal worked solutions that people wrote, so this stage is really supervised fine-tuning',
    ],
    answer: 0,
    explanation:
      'The reward is computed by checking the answer (a *verifiable* reward), so nobody compares answers and no reward model is trained. It is still reinforcement learning: the model is updated to make high-reward answers more likely. It does not copy written solutions (that would be SFT) or predict the next token of existing text (that is pretraining).',
    difficulty: 'intermediate',
  },
]

export default questions
