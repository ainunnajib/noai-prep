import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'past-paper-walkthroughs.prelim-ml-genai.1',
    prompt: 'Which statement correctly contrasts bagging and boosting?',
    options: [
      'Bagging trains models independently on bootstrap samples and mainly cuts variance; boosting trains them in sequence and mainly cuts bias',
      'Bagging trains models in sequence on the previous errors and mainly cuts bias; boosting trains them independently and mainly cuts variance',
      'Both train their models independently on bootstrap samples; bagging then averages them, while boosting takes a majority vote',
      'Both train their models in sequence on the previous errors; bagging uses deep trees, while boosting uses shallow stumps',
    ],
    answer: 0,
    explanation:
      'Bagging averages many independently trained (usually deep) models, so their separate random errors cancel: variance falls. Boosting adds weak learners one after another, each fixing the current errors: bias falls. The option that has bagging training in sequence and cutting bias is the classic twin swap, with every property moved to the other method.',
    difficulty: 'beginner',
  },
  {
    id: 'past-paper-walkthroughs.prelim-ml-genai.2',
    prompt: 'A Prelim question asks: "Why do large language models use causal masking during training?" Which concept cluster and confusable pair does it belong to?',
    options: [
      'NLP and Transformers: encoder (sees both sides) versus decoder (sees only earlier tokens)',
      'CNNs and vision: semantic segmentation (a class per pixel) versus instance segmentation',
      'Bias–variance and regularisation: dropout (random zeros) versus early stopping (halting training)',
      'PyTorch tools: `.item()` (a Python number) versus `.detach()` (a tensor off the graph)',
    ],
    answer: 0,
    explanation:
      'A causal mask stops each token attending to later tokens, which is what makes a decoder such as GPT autoregressive. Its twin is the encoder (BERT), which sees both sides. Dropout also "masks" things, which makes the regularisation option tempting, but dropout switches off neurons at random rather than blocking future tokens.',
    difficulty: 'intermediate',
  },
  {
    id: 'past-paper-walkthroughs.prelim-ml-genai.3',
    prompt: 'LoRA is applied to a $2048 \\times 2048$ weight matrix with rank $r = 4$. How many numbers does LoRA train for this matrix?',
    options: ['$16{,}384$', '$4{,}194{,}304$', '$8{,}192$', '$16$'],
    answer: 0,
    explanation:
      '$B$ is $2048 \\times 4 = 8{,}192$ numbers and $A$ is $4 \\times 2048 = 8{,}192$, so $16{,}384$ in total, about $0.4\\%$ of the $2048^2 = 4{,}194{,}304$ that full fine-tuning would update. $8{,}192$ counts only one of the two matrices, and $16 = r^2$ is a half-done calculation.',
    difficulty: 'intermediate',
  },
  {
    id: 'past-paper-walkthroughs.prelim-ml-genai.4',
    prompt: 'In the 2026 question "Early stopping prevents:", what kind of distractor is the option "Underfitting"?',
    options: [
      'An opposite effect: early stopping guards against overfitting, so underfitting flips the direction',
      'A confusable twin: underfitting is the correct answer to a neighbouring question about dropout',
      'True but not the point: early stopping does mainly prevent underfitting, but the question asks about something else',
      'An overclaim: it uses an absolute word to make a partly true statement sound complete',
    ],
    answer: 0,
    explanation:
      'Early stopping halts training when the validation error starts rising, which is where overfitting begins, so "Underfitting" is the same topic with the direction flipped. It is not a twin, because dropout also fights overfitting, and there is no absolute word in it. (Stopping far too early can cause underfitting, which is exactly why the flip is tempting.)',
    difficulty: 'beginner',
  },
  {
    id: 'past-paper-walkthroughs.prelim-ml-genai.5',
    prompt:
      'A team builds an image-captioning model. While writing each word, the text decoder must look at the most relevant patches of the image. Which mechanism lets it do this?',
    options: [
      'Cross-attention, with queries from the text tokens and keys and values from the image patches',
      'Self-attention over the image patches only, with queries, keys and values all from the image',
      'Causal self-attention over the text tokens only, so each word sees just the earlier words',
      'Cross-attention, with queries from the image patches and keys and values from the text tokens',
    ],
    answer: 0,
    explanation:
      'The words are doing the looking, so the queries come from the text, and what they look at (keys) and read off (values) comes from the image. Self-attention keeps everything inside one sequence, so neither self-attention option lets the words see the image. The option with queries from the image patches has cross-attention running the wrong way: the image would be looking at the text.',
    difficulty: 'intermediate',
  },
]

export default questions
