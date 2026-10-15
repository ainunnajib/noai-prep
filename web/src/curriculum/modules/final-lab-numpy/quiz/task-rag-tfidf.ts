import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'final-lab-numpy.task-rag-tfidf.1',
    prompt: 'In TF-IDF, what is the **document frequency** $\\mathrm{df}(t)$ of a word $t$?',
    options: [
      'The number of documents that contain $t$ at least once',
      'The total number of times $t$ occurs across all the documents',
      'The number of times $t$ occurs in one document, divided by its length',
      'The number of documents that do not contain $t$ at all',
    ],
    answer: 0,
    explanation:
      'df counts **documents**, not occurrences: a word used five times in one document and nowhere else has $\\mathrm{df} = 1$. The total count across the corpus is the classic mix-up, and "count divided by length" is one version of the term frequency (TF), which belongs to a single document.',
    difficulty: 'beginner',
  },
  {
    id: 'final-lab-numpy.task-rag-tfidf.2',
    prompt:
      'Over the vocabulary `[machine, learning, data, science]`, a query has count vector $\\mathbf{q} = [1, 1, 0, 0]$ and a document has $\\mathbf{d} = [1, 1, 1, 1]$. What is their cosine similarity?',
    options: ['$\\frac{1}{\\sqrt{2}} \\approx 0.71$', '$0.5$', '$2$', '$1$'],
    answer: 0,
    explanation:
      'Dot product $= 1 + 1 + 0 + 0 = 2$. Lengths: $\\lVert \\mathbf{q} \\rVert = \\sqrt{2}$ and $\\lVert \\mathbf{d} \\rVert = \\sqrt{4} = 2$. So $\\cos = \\frac{2}{2\\sqrt{2}} = \\frac{1}{\\sqrt{2}} \\approx 0.71$. The answer 2 is the dot product without dividing by the lengths, 0.5 forgets a square root, and 1 would need both vectors to point the same way, but the document also contains "data" and "science".',
    difficulty: 'intermediate',
  },
  {
    id: 'final-lab-numpy.task-rag-tfidf.3',
    prompt: 'A student keeps "the top 2 documents" like this. What does it print?',
    code: 'import numpy as np\nscores = np.array([0.0, 0.57, 0.17, 0.46, 0.0])\nprint(np.argsort(scores)[:2])',
    options: ['`[0 4]`', '`[1 3]`', '`[3 1]`', '`[2 4]`'],
    answer: 0,
    explanation:
      '`np.argsort` lists indices from the **smallest** score to the largest: `[0 4 2 3 1]`. Taking `[:2]` therefore gives the two *worst* documents, `[0 4]`. The intended answer `[1 3]` (documents 2 and 4) needs `np.argsort(-scores)[:2]` or `np.argsort(scores)[::-1][:2]`. `[2 4]` confuses 0-based indices with document numbers.',
    difficulty: 'intermediate',
  },
  {
    id: 'final-lab-numpy.task-rag-tfidf.4',
    prompt:
      'In the official 2025 solution (split on spaces, raw counts), documents 3 and 4 each share exactly one word with "How does machine learning work?", yet document 4 scores higher (0.169 against 0.158). Why?',
    options: [
      'Document 4 has 7 tokens and document 3 has 8, so document 4\'s vector is shorter',
      'Document 4 contains both "machine" and "learning", while document 3 contains only "learning"',
      'The word "machine" has a higher IDF than "learning", so the word document 4 shares is worth more',
      'The two scores tie, and `argsort` breaks ties in favour of the later document',
    ],
    answer: 0,
    explanation:
      'Each shares one word, so both dot products are 1, and cosine divides by the lengths: $\\frac{1}{\\sqrt{7}}$ beats $\\frac{1}{\\sqrt{8}}$ (times the same query length). Document 4 ends in `learning.` with a full stop, which never matches `learning` after `.split()`, so it does **not** share both words. The official solution uses TF only, with no IDF, and the scores are not tied.',
    difficulty: 'intermediate',
  },
  {
    id: 'final-lab-numpy.task-rag-tfidf.5',
    prompt:
      'Your RAG pipeline always returns 2 documents. For "What is quantum computing?" every cosine score is 0, but it still prints two unrelated documents and builds an answer from them. What is the best fix?',
    options: [
      'Keep only documents whose score is above 0 (or a threshold), and answer "I don\'t know" when none are left',
      'Increase k to 5 so that the right document is more likely to be among those returned',
      'Replace cosine similarity with the raw dot product so that the scores are no longer exactly 0',
      'Remove the IDF weighting so that common words such as "is" can match the query',
    ],
    answer: 0,
    explanation:
      'A score of 0 means the document shares no vocabulary word with the query, so it cannot support an answer. Filtering by a minimum score and admitting "I don\'t know" is the honest behaviour. A bigger k returns even more irrelevant documents, the dot product of vectors with no shared words is also 0, and letting stop words match only creates false matches.',
    difficulty: 'beginner',
  },
]

export default questions
