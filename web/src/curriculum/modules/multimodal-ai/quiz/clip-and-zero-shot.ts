import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'multimodal-ai.clip-and-zero-shot.1',
    prompt:
      'CLIP computes an $N \\times N$ similarity matrix for a batch of $N$ image-caption pairs (row $i$ = image $i$, column $j$ = caption $j$). Which cells does training push **up**?',
    options: [
      'The diagonal cells, where image $i$ meets caption $i$',
      'Every cell whose cosine similarity is already above 0.5',
      'The cells of the first row and the first column',
      'The cells above the diagonal, where $j$ is greater than $i$',
    ],
    answer: 0,
    explanation:
      'Image $i$ and caption $i$ were posted together, so the diagonal holds the $N$ positive pairs and training raises their similarity. Every off-diagonal cell is a negative (another pair\'s caption) and is pushed down, however high it currently is.',
    difficulty: 'beginner',
  },
  {
    id: 'multimodal-ai.clip-and-zero-shot.2',
    prompt: 'A CLIP training batch contains 8 image-caption pairs. How many negative (mismatched) image-caption pairs does the contrastive loss use?',
    options: ['56', '8', '64', '28'],
    answer: 0,
    explanation:
      'The similarity matrix has $8 \\times 8 = 64$ cells. The 8 diagonal cells are positives, so $64 - 8 = 56$ are negatives. 28 counts each unordered pair once, but (image 1, caption 2) and (image 2, caption 1) are different cells.',
    difficulty: 'beginner',
  },
  {
    id: 'multimodal-ai.clip-and-zero-shot.3',
    prompt: 'This PyTorch code computes CLIP\'s loss for a batch of `N` pairs. What must `labels` be?',
    code:
      'img = F.normalize(img_encoder(images), dim=1)     # (N, D)\ntxt = F.normalize(txt_encoder(captions), dim=1)   # (N, D)\nlogits = img @ txt.T / tau                        # (N, N)\nloss = (F.cross_entropy(logits, labels)\n        + F.cross_entropy(logits.T, labels)) / 2',
    options: ['`torch.arange(N)`', '`torch.zeros(N, dtype=torch.long)`', '`torch.ones(N, dtype=torch.long)`', '`torch.randperm(N)`'],
    answer: 0,
    explanation:
      'Row $i$ of `logits` should pick column $i$ (and column $i$ should pick row $i$), so the target class for row $i$ is $i$: `[0, 1, …, N-1]`, which is `torch.arange(N)`. All zeros would tell every image that caption 0 is its partner; a random permutation would teach mismatched pairs.',
    difficulty: 'intermediate',
  },
  {
    id: 'multimodal-ai.clip-and-zero-shot.4',
    prompt: 'Why does CLIP L2-normalise the image and text embeddings before taking dot products?',
    options: [
      'So each dot product equals the cosine similarity, which compares directions and ignores vector length',
      'So the embeddings take up less memory and the matrix product runs faster',
      'So the image and text embeddings get the same number of dimensions',
      'So every dot product is positive and the softmax never sees a negative score',
    ],
    answer: 0,
    explanation:
      'For unit vectors, $\\mathbf{a} \\cdot \\mathbf{b} = \\cos\\theta$, so similarity depends only on the angle, and a long vector cannot win just by being long. Equal dimensions come from the projection layers, not from normalising, and cosine similarities can still be negative.',
    difficulty: 'intermediate',
  },
  {
    id: 'multimodal-ai.clip-and-zero-shot.5',
    prompt:
      'A school wants to sort CCA photos into "badminton", "choir" and "robotics" using a pretrained CLIP model, but has no labelled photos. Which approach is zero-shot classification?',
    options: [
      'Embed "a photo of students playing badminton" (and one sentence per other CCA), then give each photo the class whose sentence has the highest cosine similarity',
      'Label 50 photos per CCA by hand, then fine-tune CLIP\'s image encoder on them with cross-entropy',
      'Cluster the photo embeddings into 3 groups with k-means, then name each cluster by looking at a few photos',
      'Train a new 3-class classifier on the image embeddings using labels produced by CLIP itself',
    ],
    answer: 0,
    explanation:
      'Zero-shot means no training examples for these classes: the classifier is built from text prompts alone, and each photo goes to the prompt it is most similar to. Fine-tuning on 50 labelled photos per class is few-shot supervised learning, and k-means needs a human to name the clusters afterwards.',
    difficulty: 'beginner',
  },
]

export default questions
