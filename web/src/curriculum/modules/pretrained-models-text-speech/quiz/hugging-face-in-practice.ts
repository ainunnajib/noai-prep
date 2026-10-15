import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'pretrained-models-text-speech.hugging-face-in-practice.1',
    prompt: 'A BERT tokenizer is called on two sentences with `padding=True`. In the returned `attention_mask`, what does a 0 mean?',
    options: [
      'That position is padding added to make the rows the same length, so attention should ignore it',
      'That position holds the `[CLS]` token, whose vector is reserved for the classification head',
      'That token was chosen for masking, so the model has to predict it during fine-tuning',
      'That token is unknown to the vocabulary and was replaced by `[UNK]` before the lookup',
    ],
    answer: 0,
    explanation:
      'The attention mask is 1 for every real token (including `[CLS]` and `[SEP]`) and 0 for padding. The model uses it so no token attends to the padding. Masking for prediction is a separate idea (the `[MASK]` token in pretraining) and does not appear in `attention_mask`.',
    difficulty: 'beginner',
  },
  {
    id: 'pretrained-models-text-speech.hugging-face-in-practice.2',
    prompt: 'What does this code print?',
    code: 'import torch\nimport torch.nn.functional as F\n\nlogits = torch.tensor([[2.0, 0.0], [0.0, 1.0], [1.0, 1.0], [5.0, 0.0]])\nlabels = torch.tensor([0, -100, 1, -100])\nloss = F.cross_entropy(logits, labels)\nprint(loss.shape, (labels != -100).sum().item())',
    options: ['`torch.Size([]) 2`', '`torch.Size([4]) 2`', '`torch.Size([]) 4`', '`torch.Size([2]) 4`'],
    answer: 0,
    explanation:
      'By default `F.cross_entropy` averages over the positions whose label is not the `ignore_index` (−100), returning a single number, a tensor of shape `torch.Size([])`. Two labels are not −100 (positions 0 and 2), so the count printed is 2. A shape of `[4]` would need `reduction="none"`, and even then the −100 positions would contribute 0, not a real loss.',
    difficulty: 'intermediate',
  },
  {
    id: 'pretrained-models-text-speech.hugging-face-in-practice.3',
    prompt:
      'A student loads `AutoModelForSequenceClassification.from_pretrained("bert-base-uncased", num_labels=3)` and immediately uses it to classify news headlines into 3 topics, without training. The predictions look random. Why?',
    options: [
      'The 3-class classification head on top of BERT is newly and randomly initialised, so it must be trained on labelled examples first',
      'BERT\'s tokenizer was not loaded with `num_labels=3` as well, so the input ids do not match the 3 classes of the model',
      'BERT was pretrained only on English and so cannot read news headlines until its embeddings are trained again from scratch',
      'The model needs `return_tensors="pt"` to be passed to `from_pretrained`, otherwise its outputs are NumPy arrays of zeros',
    ],
    answer: 0,
    explanation:
      '`bert-base-uncased` contains the pretrained encoder but no topic classifier. Asking for `num_labels=3` adds a fresh linear head with random weights (Hugging Face even warns that they are newly initialised), so it must be fine-tuned. The tokenizer has nothing to do with the number of labels.',
    difficulty: 'beginner',
  },
  {
    id: 'pretrained-models-text-speech.hugging-face-in-practice.4',
    prompt:
      'When preparing labels for a named-entity tagging model, a student fills the padded positions of the labels with 0, the same value as the `[PAD]` token id. What is the effect?',
    options: [
      'Label 0 is a real class ("O"), so the padding positions are scored as if they were words, distorting the loss; they should be −100',
      'Nothing changes, because the attention mask already makes the cross-entropy loss skip every padded position automatically',
      'Training crashes immediately, because label 0 is reserved for the `[PAD]` token and cannot be used as a class index',
      'The model learns faster, because the extra easy positions give it more examples of the most common label to practise on',
    ],
    answer: 0,
    explanation:
      'The attention mask only controls attention; the loss looks at the labels. With label 0, every padded position is graded as the class "O", so the loss depends on how much padding a batch has and the model wastes effort on positions that do not exist. Labels of −100 are skipped by cross-entropy\'s default `ignore_index`.',
    difficulty: 'intermediate',
  },
  {
    id: 'pretrained-models-text-speech.hugging-face-in-practice.5',
    prompt:
      'An IOAI-style task runs on an offline computer with a GPU and asks you to classify 20,000 product reviews into 5 classes, given 3,000 labelled reviews. Which plan fits best?',
    options: [
      'Load a cached pretrained encoder such as DistilBERT, add a 5-class head, and fine-tune it on the 3,000 labelled reviews',
      'Send each review to an API-based large language model and parse its answers, since API models need no labelled data',
      'Train a Transformer encoder from random weights on the 3,000 reviews, because pretrained models are not allowed offline',
      'Run a pretrained text-generation pipeline on every review and pick the class whose name appears most often in its output',
    ],
    answer: 0,
    explanation:
      'Offline means no API calls, and pretrained weights are cached, so fine-tuning a local encoder with a new 5-class head is the standard, reliable approach; 3,000 labels is plenty. Training from scratch on 3,000 reviews wastes the knowledge of pretraining and performs far worse. Parsing free text from a generator is slow and unreliable compared with a classifier.',
    difficulty: 'intermediate',
  },
]

export default questions
