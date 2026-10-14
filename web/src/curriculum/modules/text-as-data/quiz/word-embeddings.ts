import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'text-as-data.word-embeddings.1',
    prompt:
      'Words are represented as **one-hot** vectors over a 10,000-word vocabulary. What is the cosine similarity between the vectors for "cat" and "kitten"?',
    options: ['0', '1', '$\\sqrt{2}$', '$1/10{,}000$'],
    answer: 0,
    explanation:
      'Two different one-hot vectors have their single 1 in different positions, so their dot product, and therefore their cosine similarity, is 0, however close the meanings are. That is the weakness embeddings fix. $\\sqrt{2}$ is the Euclidean **distance** between any two different one-hot vectors, not their cosine.',
    difficulty: 'beginner',
  },
  {
    id: 'text-as-data.word-embeddings.2',
    prompt:
      'Word2Vec **skip-gram** with a window of 1 is trained on "i love chicken rice". Which list is exactly the set of training pairs whose centre word is "chicken"?',
    options: [
      '(chicken → love), (chicken → rice)',
      '(love → chicken), (rice → chicken)',
      '(chicken → i), (chicken → love), (chicken → rice)',
      '([love, rice] → chicken)',
    ],
    answer: 0,
    explanation:
      'With a window of 1 the context of "chicken" is the one word on each side: "love" and "rice". Skip-gram predicts each context word **from** the centre word, giving the two pairs (chicken → love) and (chicken → rice). Predicting the centre from its context, `([love, rice] → chicken)`, is CBOW; including "i" would need a window of 2.',
    difficulty: 'beginner',
  },
  {
    id: 'text-as-data.word-embeddings.3',
    prompt: 'What does this code print?',
    code: 'import torch\nimport torch.nn as nn\n\nemb = nn.Embedding(1000, 64)\nids = torch.tensor([[4, 8, 15], [16, 23, 42]])\nprint(emb(ids).shape)',
    options: ['`torch.Size([2, 3, 64])`', '`torch.Size([2, 3])`', '`torch.Size([1000, 64])`', '`torch.Size([6, 1000])`'],
    answer: 0,
    explanation:
      'The embedding table has shape (1000, 64): one 64-number row per token id. Each of the $2 \\times 3$ ids is replaced by its row, so the output has shape (batch 2, sequence length 3, embedding size 64). `(1000, 64)` is the shape of `emb.weight`, the table itself, which holds $1000 \\times 64 = 64{,}000$ learnable numbers; no one-hot vectors of length 1000 are ever built.',
    difficulty: 'intermediate',
  },
  {
    id: 'text-as-data.word-embeddings.4',
    prompt:
      'In a 2-D embedding, man $= [1, 1]$, woman $= [1, 3]$ and king $= [4, 1]$. To answer "man is to king as woman is to ?", which vector do you search near?',
    options: ['$[4, 3]$', '$[6, 5]$', '$[-2, 3]$', '$[4, -1]$'],
    answer: 0,
    explanation:
      'Compute king − man + woman entry by entry: $[4 - 1 + 1,\\; 1 - 1 + 3] = [4, 3]$, then return the nearest word other than the three inputs (ideally queen). $[6, 5]$ adds all three vectors; $[-2, 3]$ is man − king + woman; $[4, -1]$ is king − woman + man, which answers "woman is to king as man is to ?".',
    difficulty: 'beginner',
  },
  {
    id: 'text-as-data.word-embeddings.5',
    prompt:
      'A museum wants visitors to type "a red dragon boat" and get matching photos from 50,000 untagged images. Which approach fits best?',
    options: [
      'Embed the text and every image with a model such as CLIP that maps both into one space, then rank images by cosine similarity',
      'Build TF-IDF vectors from the raw pixel values of every image and compare them with the TF-IDF vector of the query words',
      'One-hot encode each image file name and return the image whose one-hot vector is closest to the one-hot vector of the query',
      'Train Word2Vec on the query words only, then return the images whose file sizes are closest to the average query vector',
    ],
    answer: 0,
    explanation:
      'Embeddings are not just for words: models like CLIP are trained so that an image and a caption describing it get nearby vectors in a shared space, so cosine similarity between the query embedding and each image embedding finds matching photos without any tags. TF-IDF needs words, which pixels are not, and one-hot vectors make every pair equally dissimilar, so they cannot rank anything.',
    difficulty: 'intermediate',
  },
]

export default questions
