import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'prompting-and-rag.rag-from-scratch.1',
    prompt:
      'The query vector is $q = [1, 1, 0]$. Which document vector has the **highest cosine similarity** with $q$?',
    options: ['$d = [1, 1, 0]$', '$d = [4, 4, 4]$', '$d = [2, 2, 1]$', '$d = [3, 0, 0]$'],
    answer: 0,
    explanation:
      '$[1, 1, 0]$ points in exactly the same direction as $q$, so its cosine is $2/(\\sqrt{2}\\sqrt{2}) = 1$, the maximum. $[4, 4, 4]$ has the largest dot product (8) but also the largest length: $8/(\\sqrt{48}\\sqrt{2}) \\approx 0.82$. $[2, 2, 1]$ gives $4/(3\\sqrt{2}) \\approx 0.94$ and $[3, 0, 0]$ gives $3/(3\\sqrt{2}) \\approx 0.71$. Cosine rewards the same mix of words, not more words.',
    difficulty: 'beginner',
  },
  {
    id: 'prompting-and-rag.rag-from-scratch.2',
    prompt: 'What does this code print?',
    code: 'import numpy as np\nscores = np.array([0.2, 0.9, 0.5, 0.7])\nprint(np.argsort(scores)[::-1][:2])',
    options: ['`[1 3]`', '`[0 2]`', '`[0.9 0.7]`', '`[3 1]`'],
    answer: 0,
    explanation:
      '`np.argsort(scores)` gives the positions in ascending order of score, `[0 2 3 1]`. Reversing gives `[1 3 2 0]` (best first) and `[:2]` keeps `[1 3]`: documents 1 and 3. Forgetting `[::-1]` gives the two worst, `[0 2]`; `[0.9 0.7]` would be the sorted values (from `np.sort`), not positions; `[3 1]` is what `scores.argsort()[-2:]` gives before it is reversed.',
    difficulty: 'intermediate',
  },
  {
    id: 'prompting-and-rag.rag-from-scratch.3',
    prompt:
      'A retriever computes `scores = D @ q / (np.linalg.norm(D, axis=1) * np.linalg.norm(q))`. For the query "Quantum?" it prints `[nan nan nan nan]`. What is the most likely cause?',
    options: [
      'No query word is in the vocabulary, so $q = 0$ and every score is $0/0$',
      'The query is shorter than every document, so the cosine is undefined for it',
      'Stop words were not removed, so the dot products became too large to store',
      'Two documents tie, and `np.linalg.norm` returns nan for ties',
    ],
    answer: 0,
    explanation:
      '"quantum" never appears in the documents, so it has no column and $q$ is the zero vector. Then every dot product is 0 and every denominator is $\\lVert d \\rVert \\times 0 = 0$, and NumPy returns nan for $0/0$. Cosine works for texts of any length, and ties do not produce nan. Fix it with a small epsilon in the denominator (or an early return), then answer "I don\'t know".',
    difficulty: 'intermediate',
  },
  {
    id: 'prompting-and-rag.rag-from-scratch.4',
    prompt:
      'A document-term matrix `D` has shape `(50, 1200)`: 50 documents and a 1200-word vocabulary. The query vector `q` has shape `(1200,)`. What are the shapes of `D @ q` and `np.linalg.norm(D, axis=1)`?',
    options: ['`(50,)` and `(50,)`', '`(1200,)` and `(50,)`', '`(50,)` and `(1200,)`', '`(50, 1200)` and `(50,)`'],
    answer: 0,
    explanation:
      '`D @ q` takes the dot product of each of the 50 rows with `q`, giving one score per document: `(50,)`. `axis=1` means "along each row", so the norm squashes the 1200 columns and leaves one length per document: also `(50,)`. That is why the two can be divided element by element. `(50, 1200)` would come from `D * q`, which multiplies element by element without adding.',
    difficulty: 'beginner',
  },
  {
    id: 'prompting-and-rag.rag-from-scratch.5',
    prompt:
      'In a NumPy-only RAG task (no language model allowed), you must produce a `response` string from the retrieved documents. Which approach keeps the answer **grounded** in the documents?',
    options: [
      'Join the retrieved sentences into a template, and say "I don\'t know" when no document scores above 0',
      'Hard-code the expected sentence, and return it whenever the retrieved documents contain the right keywords',
      'Always return the top 2 documents, even when they score 0, so that the response is never empty',
      'Write a fluent paragraph that adds well-known facts about the topic to the retrieved sentences',
    ],
    answer: 0,
    explanation:
      'Grounded means every claim comes from a retrieved source, and "I don\'t know" is the honest output when nothing relevant was found. A hard-coded sentence fires on unrelated questions that share the keywords and can contain claims that are in no document. Returning zero-score documents passes irrelevant text off as evidence, and adding outside facts is exactly how hallucination enters an answer.',
    difficulty: 'intermediate',
  },
]

export default questions
