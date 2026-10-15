import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'multimodal-ai.self-supervised-vision.1',
    prompt: 'What makes self-supervised learning different from supervised learning?',
    options: [
      'A program creates the labels from unlabelled data, e.g. by hiding part of the input',
      'People label a small part of the data and the model labels the rest for itself',
      'The model learns by receiving rewards from an environment for the actions it takes',
      'The model groups the data into clusters and is never given any training objective',
    ],
    answer: 0,
    explanation:
      'In self-supervised learning the "answer" comes free with the data: the hidden patch, the next word or the rotation angle chosen by the program. Labelling a few examples and pseudo-labelling the rest is semi-supervised learning; rewards from an environment are reinforcement learning.',
    difficulty: 'beginner',
  },
  {
    id: 'multimodal-ai.self-supervised-vision.2',
    prompt: 'In SimCLR, which of these is a **positive pair**?',
    options: [
      'Two randomly augmented versions of the same photo',
      'Two different photos that both show a cat',
      'A photo and the class label that describes it',
      'Two photos whose raw pixels are the most similar',
    ],
    answer: 0,
    explanation:
      'SimCLR never sees class labels, so it cannot know that two different photos are both cats. Its only free information is which views came from the same photo: two augmentations of one image form the positive pair. Two different cat photos in a batch are treated as a negative pair.',
    difficulty: 'beginner',
  },
  {
    id: 'multimodal-ai.self-supervised-vision.3',
    prompt: 'A SimCLR batch has $N = 128$ images, each augmented twice. For one view, how many **negatives** appear in the bottom of its NT-Xent loss?',
    options: ['254', '127', '255', '256'],
    answer: 0,
    explanation:
      'There are $2N = 256$ views. Leave out the view itself (255 others) and its one partner, the positive: $256 - 2 = 254$ negatives. 255 counts the positive as a negative; 127 counts other images instead of other views.',
    difficulty: 'intermediate',
  },
  {
    id: 'multimodal-ai.self-supervised-vision.4',
    prompt: 'BERT hides about 15% of the words in a sentence, but MAE hides about 75% of an image\'s patches. Why so many?',
    options: [
      'Images are redundant, so with few patches hidden the gaps can be filled from nearby pixels',
      'A ViT encoder can only read 25% of the patches at once, so the rest must be removed',
      'Hiding more patches gives more labelled examples, which removes the need for pretraining',
      'Pixels are harder to predict than words, so a larger mask makes the task easier to learn',
    ],
    answer: 0,
    explanation:
      'Neighbouring patches are very similar, so a low mask ratio lets the model fill gaps by interpolation without understanding the scene. Hiding 75% removes that shortcut and forces it to learn objects and context. Encoding only the visible quarter is a welcome speed-up, not a limit of ViTs.',
    difficulty: 'intermediate',
  },
  {
    id: 'multimodal-ai.self-supervised-vision.5',
    prompt: 'This is MAE-style random masking for a batch of patch tokens. What does it print?',
    code: 'import torch\nx = torch.randn(8, 196, 768)\nn_keep = int(196 * (1 - 0.75))\nnoise = torch.rand(8, 196)\nkeep = noise.argsort(dim=1)[:, :n_keep]\nvisible = torch.gather(x, 1, keep.unsqueeze(-1).expand(-1, -1, 768))\nprint(visible.shape)',
    options: ['`torch.Size([8, 49, 768])`', '`torch.Size([8, 147, 768])`', '`torch.Size([8, 196, 768])`', '`torch.Size([2, 196, 768])`'],
    answer: 0,
    explanation:
      '`n_keep = int(196 × 0.25) = 49`. Each image keeps the 49 patches with the smallest random numbers, and `gather` picks those rows along dimension 1, giving `(8, 49, 768)`. 147 is the number of hidden patches, which the encoder never sees; the batch dimension 8 is untouched.',
    difficulty: 'intermediate',
  },
]

export default questions
