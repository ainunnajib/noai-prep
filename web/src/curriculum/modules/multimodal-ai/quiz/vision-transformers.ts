import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'multimodal-ai.vision-transformers.1',
    prompt: 'A Vision Transformer cuts $256 \\times 256$ images into $32 \\times 32$ patches. How many **patch** tokens does one image give (not counting [CLS])?',
    options: ['64', '8', '2,048', '65'],
    answer: 0,
    explanation:
      'Divide each side by the patch size first: $256 / 32 = 8$ patches per side, so $8 \\times 8 = 64$ patches. 8 is only one side; 2,048 divides the area $256 \\times 256 = 65\\,536$ by 32 instead of by $32^2 = 1024$; 65 adds the [CLS] token, which the question excludes.',
    difficulty: 'beginner',
  },
  {
    id: 'multimodal-ai.vision-transformers.2',
    prompt: 'This is the patch-embedding step of a small ViT. What does it print?',
    code: 'import torch, torch.nn as nn\nx = torch.randn(8, 3, 224, 224)\nproj = nn.Conv2d(3, 384, kernel_size=16, stride=16)\nt = proj(x).flatten(2).transpose(1, 2)\nprint(t.shape)',
    options: ['`torch.Size([8, 196, 384])`', '`torch.Size([8, 384, 196])`', '`torch.Size([8, 197, 384])`', '`torch.Size([8, 14, 14, 384])`'],
    answer: 0,
    explanation:
      'The conv with kernel = stride = 16 turns each of the $14 \\times 14$ patches into a 384-vector: shape `(8, 384, 14, 14)`. `flatten(2)` merges the grid into 196 positions, `(8, 384, 196)`, and `transpose(1, 2)` makes each row one token: `(8, 196, 384)`. There are 196 rows, not 197, because no [CLS] token has been added yet.',
    difficulty: 'intermediate',
  },
  {
    id: 'multimodal-ai.vision-transformers.3',
    prompt: 'What is the [CLS] token in a Vision Transformer?',
    options: [
      'A learned extra token at position 0 whose final vector summarises the image for the head',
      'The top-left patch of the image, which the model treats as the reference point for the other patches',
      'A vector containing the correct class label, which is fed to the model during training',
      'A marker placed after the last patch so the model knows where one image ends in a batch',
    ],
    answer: 0,
    explanation:
      '[CLS] contains no pixels: it is a learned vector prepended to the patch tokens. Because it attends to every patch in every layer, its output gathers information about the whole image, and the head reads only that vector. It never contains the label; feeding the answer in would let the model cheat.',
    difficulty: 'beginner',
  },
  {
    id: 'multimodal-ai.vision-transformers.4',
    prompt: 'You build a ViT **without** position embeddings. You then cut one photo into patches and feed the patches in two different shuffled orders. What happens to the [CLS] output?',
    options: [
      'It is exactly the same both times, because attention treats all the tokens as an unordered set',
      'It differs slightly both times, because the patch-embedding convolution mixes neighbouring patches',
      'It becomes random noise, because patch embeddings cannot be computed without positions',
      'It is the same only when the image is symmetric, because attention compares mirror-image patches',
    ],
    answer: 0,
    explanation:
      'Attention weights depend only on token contents, so shuffling the tokens shuffles the weights in the same way and the weighted sum for [CLS] is unchanged. The patch-embedding conv has stride equal to its kernel size, so patches never overlap or mix; each patch embedding is computed from its own pixels and needs no position, and symmetry of the image plays no part. This is why ViTs add a learned position embedding to every token.',
    difficulty: 'intermediate',
  },
  {
    id: 'multimodal-ai.vision-transformers.5',
    prompt: 'A clinic has 2,000 labelled skin-lesion photos and wants to use a Vision Transformer. Which plan is most likely to give good accuracy?',
    options: [
      'Take a ViT pretrained on a large image collection and fine-tune it on the 2,000 photos',
      'Train a ViT from scratch with a smaller patch size so that each photo provides more tokens',
      'Take a Transformer language model pretrained on web text and fine-tune it on the 2,000 photos',
      'Train a ViT from scratch with a higher learning rate to make up for the small dataset',
    ],
    answer: 0,
    explanation:
      'ViTs have weak image-specific inductive biases: apart from cutting the image into patches, nothing tells them that neighbouring patches belong together (self-attention is global from layer 1), so from scratch they need far more than 2,000 images and would overfit. Pretraining on a large collection of images supplies that knowledge; a language model pretrained on text has learned about words, not about how the patches of a photo relate. Smaller patches add tokens and cost but not more labelled examples, and a higher learning rate adds no data and usually makes overfitting or instability worse.',
    difficulty: 'intermediate',
  },
]

export default questions
