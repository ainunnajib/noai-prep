import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'large-language-models.context-and-cost.1',
    prompt: "What does an LLM's **context window** limit?",
    options: [
      'The most tokens it can attend to at once; prompt, history and reply must all fit inside',
      'The number of words it learned during pretraining, which caps how many facts it can ever know',
      'The number of past conversations it can remember between separate chat sessions',
      'The number of attention heads that can run in parallel inside each Transformer layer',
    ],
    answer: 0,
    explanation:
      'The context window is working memory for one request: a fixed number of tokens that must hold the instructions, the conversation, any documents and the reply. Knowledge comes from training, not the window, and the model keeps nothing between sessions unless the app sends it again.',
    difficulty: 'beginner',
  },
  {
    id: 'large-language-models.context-and-cost.2',
    prompt:
      'A model processes a 4,000-token document. If the document is 8,000 tokens instead, roughly how does the number of self-attention scores computed per head per layer change?',
    options: ['It is multiplied by 4', 'It is multiplied by 2', 'It is multiplied by 8', 'It stays the same, because the model size is fixed'],
    answer: 0,
    explanation:
      'Every token is compared with every token, so there are $T^2$ scores. $(2T)^2 = 4T^2$: doubling the length quadruples the attention work. Linear growth (×2) is true of the number of token vectors, not of the attention table; the model size is fixed, but the work depends on the input length.',
    difficulty: 'beginner',
  },
  {
    id: 'large-language-models.context-and-cost.3',
    prompt: 'Why is it valid to reuse the cached keys and values of earlier tokens when a GPT-style model generates the next token?',
    options: [
      'The causal mask stops earlier tokens attending to later ones, so their keys and values never change as text is added',
      'Keys and values are fixed numbers learned in pretraining, so they are the same for every input text',
      'Each new token attends only to the token just before it, so older keys and values are never needed',
      'The cache stores the final output tokens, and tokens that have been written cannot change afterwards',
    ],
    answer: 0,
    explanation:
      "A token's key and value depend only on itself and earlier tokens (causal mask), so appending text cannot change them. The new token still needs **all** old keys and values for its attention, which is exactly why caching them pays off. The weight matrices are learned, but the keys and values themselves are computed from the text.",
    difficulty: 'intermediate',
  },
  {
    id: 'large-language-models.context-and-cost.4',
    prompt:
      'A model has $L = 32$ layers and $d_\\text{model} = 4{,}096$, and stores each number in 2 bytes. About how much memory does its KV cache need for one 1,000-token conversation? (Use size $= 2 \\times L \\times T \\times d_\\text{model} \\times$ bytes.)',
    options: ['About 0.5 GB', 'About 0.26 GB', 'About 16 MB', 'About 1 GB'],
    answer: 0,
    explanation:
      '$2 \\times 32 \\times 4{,}096 \\times 2 = 524{,}288$ bytes ≈ 0.5 MB per token, so 1,000 tokens ≈ 0.5 GB. Forgetting the factor 2 (one key **and** one value) gives 0.26 GB; forgetting the 32 layers gives about 16 MB; using 4 bytes per number gives about 1 GB.',
    difficulty: 'intermediate',
  },
  {
    id: 'large-language-models.context-and-cost.5',
    prompt:
      "A school's chatbot app is billed per token. Each student question is about 100 tokens and each reply about 300 tokens, yet the bill per conversation grows much faster than the number of turns. What is the most likely reason?",
    options: [
      'Every turn re-sends the whole chat so far as input, so later turns carry far more tokens',
      'The KV cache is billed as extra output tokens, and it grows longer with each turn of the chat',
      "The model's vocabulary grows during a chat, so each new token costs a little more to produce",
      'Later replies are sampled at a higher temperature, which uses more compute per token',
    ],
    answer: 0,
    explanation:
      'The model has no memory between calls, so turn $k$ sends all $k - 1$ earlier exchanges plus the new question: about $400(k-1) + 100$ input tokens. Summed over the turns, that grows like the square of the number of turns. The KV cache is internal memory, not billed tokens, and neither the vocabulary nor the temperature changes during a chat.',
    difficulty: 'beginner',
  },
  {
    id: 'large-language-models.context-and-cost.6',
    prompt:
      'A model has a 4,096-token context window. You want to paste in an English document and leave 1,000 tokens for the reply. About how many **words** of document fit? (Use 1 token ≈ ¾ of a word.)',
    options: ['About 2,300 words', 'About 3,100 words', 'About 4,100 words', 'About 5,500 words'],
    answer: 0,
    explanation:
      'The reply must fit in the window too, so the document gets $4{,}096 - 1{,}000 = 3{,}096$ tokens. Each token is about ¾ of a word, so that is $3{,}096 \\times \\tfrac34 \\approx 2{,}300$ words. Answering 3,100 treats tokens as words (or forgets the reply); 4,100 converts the wrong way ($\\times \\tfrac43$), as if there were fewer tokens than words; 5,500 converts the wrong way and forgets the reply.',
    difficulty: 'intermediate',
  },
]

export default questions
