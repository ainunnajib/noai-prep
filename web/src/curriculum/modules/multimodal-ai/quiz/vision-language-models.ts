import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'multimodal-ai.vision-language-models.1',
    prompt: 'In a LLaVA-style vision-language model, in what order does a picture pass through the parts before an answer is produced?',
    options: [
      'Vision encoder → projector → LLM (reading image tokens and text tokens together)',
      'Projector → vision encoder → LLM (reading only the image tokens)',
      'LLM → projector → vision encoder (which generates the answer from the image)',
      'Text tokeniser → LLM → vision encoder (which checks the answer against the image)',
    ],
    answer: 0,
    explanation:
      'The vision encoder (often a frozen CLIP ViT) turns patches into feature vectors, the projector maps them to the LLM\'s embedding size, and the LLM reads those image tokens in front of the text tokens and generates the answer. The projector cannot come first because it works on the encoder\'s output.',
    difficulty: 'beginner',
  },
  {
    id: 'multimodal-ai.vision-language-models.2',
    prompt: 'In the cross-attention layers that Flamingo adds to a frozen LLM, where do the queries, keys and values come from?',
    options: [
      'Queries from the text tokens; keys and values from the visual tokens',
      'Queries from the visual tokens; keys and values from the text tokens',
      'Queries, keys and values all from the visual tokens',
      'Queries and keys from the text tokens; values from the visual tokens',
    ],
    answer: 0,
    explanation:
      'The text being generated asks the questions, so its tokens supply the queries, and the picture supplies the information through keys and values. Taking all three from one sequence would be self-attention; swapping the roles would let the image look things up in the text instead. Keys and values must come from the same sequence, because each value is handed over according to the score of its own key.',
    difficulty: 'beginner',
  },
  {
    id: 'multimodal-ai.vision-language-models.3',
    prompt: 'A VLM\'s vision encoder cuts a $224 \\times 224$ picture into $14 \\times 14$-pixel patches and makes one image token per patch. The question adds 20 text tokens. How many tokens does the LLM read?',
    options: ['276', '256', '36', '3,604'],
    answer: 0,
    explanation:
      '$224 / 14 = 16$ patches per side, so $16 \\times 16 = 256$ image tokens, plus 20 text tokens gives 276. 256 forgets the text; 36 is $16 + 20$ (one side only); 3,604 comes from dividing the area $224 \\times 224$ by 14 instead of by $14^2$, then adding 20.',
    difficulty: 'intermediate',
  },
  {
    id: 'multimodal-ai.vision-language-models.4',
    prompt: 'Flamingo adds each cross-attention output as $\\mathbf{x} \\leftarrow \\mathbf{x} + \\tanh(\\alpha)\\,\\mathrm{CrossAttn}(\\mathbf{x}, \\text{image})$ with $\\alpha$ initialised to 0. Why start the gate at 0?',
    options: [
      'At the start, the model gives exactly the same outputs as the original frozen LLM',
      'It blocks gradients from reaching the new layers until the LLM has been fine-tuned',
      'It makes the model ignore images unless a user switches the gate on at inference',
      'It halves the memory that the new cross-attention layers use in the first epoch',
    ],
    answer: 0,
    explanation:
      'Since $\\tanh(0) = 0$, the cross-attention adds nothing at first, so the output equals the original LLM\'s and the new random layers cannot damage its language skills; as training increases $\\alpha$, image information is blended in gradually. Gradients still flow to $\\alpha$ and the new layers (the LLM itself stays frozen), the gate is learned rather than switched by users, and its value does not change memory use.',
    difficulty: 'intermediate',
  },
  {
    id: 'multimodal-ai.vision-language-models.5',
    prompt:
      'A team wants a model that answers questions about Singapore street signs, but has only 5,000 photos with good questions and answers. Which plan is most sensible?',
    options: [
      'Reuse a pretrained CLIP encoder and LLM, and at first train only a small projector',
      'Train a new vision encoder and a new LLM from scratch on just the 5,000 examples',
      'Reuse a pretrained text-only LLM and feed it hand-written captions instead of photos',
      'Train a CNN classifier with one output class for each kind of Singapore street sign',
    ],
    answer: 0,
    explanation:
      'Paired image-text data is scarce, so VLMs reuse pretrained parts that already understand images and language, and first train only a small bridge, which needs little data (light fine-tuning can follow). 5,000 examples are far too few to train an encoder and LLM from scratch. A text-only LLM fed hand-written captions loses whatever the captions leave out, and someone would have to caption every new photo; a fixed-class CNN cannot answer open questions.',
    difficulty: 'intermediate',
  },
  {
    id: 'multimodal-ai.vision-language-models.6',
    prompt:
      'An image captioner has a ViT encoder and a Transformer text decoder, and is trained on photo-caption pairs. Which describes its standard training on one caption?',
    options: [
      'Feed in the true words so far and predict each next word, with cross-entropy at every position',
      'Feed in only the image and predict all the words of the caption at once, ignoring their order',
      'Embed the image and the caption, pull the true pair together and push mismatched pairs apart',
      'Feed in the whole true caption at once and predict only its final word, scored by cross-entropy',
    ],
    answer: 0,
    explanation:
      'The decoder is trained like a language model, with teacher forcing: at each position it sees the image features (through cross-attention) and the true words before that position, predicts the next word, and the cross-entropy is averaged over every caption token. Predicting all the words at once throws away their order; pulling true pairs together and pushing others apart is CLIP\'s contrastive loss, which matches pictures with captions but cannot write one; and scoring only the final word wastes every other position, so the model would never learn how a caption starts.',
    difficulty: 'intermediate',
  },
]

export default questions
