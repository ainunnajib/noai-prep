import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'large-language-models.how-llms-are-built.1',
    prompt: 'The "P" in GPT stands for *pre-trained*, and this pretraining stage is described as **self-supervised**. Why?',
    options: [
      'The label for each position is the next token, taken from the text itself, so nobody has to label the data',
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
      'A team downloads a model that has only been pretrained. Asked "List three tips for revising for the O-levels.", it replies: "List three tips for revising for the A-levels. List three tips for revising for PSLE." What is the best explanation?',
    options: [
      'It was trained only to continue text and has not been fine-tuned on prompt–response examples',
      'Its sampling temperature is set too low, so it keeps repeating the most likely phrase',
      'Its pretraining data contained no text about exams, so it has nothing to say about them',
      'Its context window is too short to hold the whole question, so it starts again',
    ],
    answer: 0,
    explanation:
      'A base model is a text continuer: on the web, a question like this is often followed by more questions in a list, so that is the likely continuation. Supervised fine-tuning on prompt and ideal-response pairs teaches it that a request should be followed by an answer. Temperature changes how randomly it picks tokens, not whether it understands that it should answer.',
    difficulty: 'beginner',
  },
  {
    id: 'large-language-models.how-llms-are-built.3',
    prompt: 'In RLHF, what is the reward model trained on, and how is it then used?',
    options: [
      "People's comparisons of pairs of answers; it then scores the LLM's answers during reinforcement learning",
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
      'With $D = 20N$: $6 \\cdot N \\cdot 20N = 120N^2 = 1.2 \\times 10^{20}$, so $N^2 = 10^{18}$ and $N = 10^9$ (1 billion), giving $D = 2 \\times 10^{10}$ (20 billion tokens). Every option spends the same budget (check: $6 \\times 10^{10} \\times 2 \\times 10^{9} = 1.2 \\times 10^{20}$ too), but only the first has 20 tokens per parameter; the 10-billion-parameter model would be badly undertrained.',
    difficulty: 'intermediate',
  },
  {
    id: 'large-language-models.how-llms-are-built.5',
    prompt:
      'Researchers plot the best pretraining loss they can reach against training compute, both on log scales, and the points lie on a straight line sloping down. What does this tell them?',
    options: [
      'Every 10× more compute multiplies the loss by the same factor, so a bigger run can be predicted from small ones',
      'Every extra FLOP lowers the loss by the same fixed amount, so the loss will reach zero at a predictable budget',
      'Model size has stopped mattering, so from now on only the number of training steps affects the loss',
      'The model is overfitting, because a training loss that keeps falling means it is memorising its data',
    ],
    answer: 0,
    explanation:
      'A straight line on log–log axes is a power law, $L \\approx a C^{-k}$: multiplying $C$ by 10 always multiplies $L$ by $10^{-k}$. That predictability is what lets labs plan big training runs. A fixed drop per FLOP would be a straight line on ordinary (linear) axes, and a power law never reaches zero.',
    difficulty: 'intermediate',
  },
]

export default questions
