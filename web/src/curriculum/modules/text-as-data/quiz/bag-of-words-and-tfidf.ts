import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'text-as-data.bag-of-words-and-tfidf.1',
    prompt:
      'A corpus has 8 documents. The word "merlion" appears 3 times in document $d$ and once in one other document, and nowhere else. Using raw counts for tf and $\\mathrm{idf} = \\log_2(N/\\mathrm{df})$, what is $\\mathrm{tfidf}(\\text{merlion}, d)$?',
    options: ['6', '3', '12', '2'],
    answer: 0,
    explanation:
      '"merlion" is in 2 documents, so $\\mathrm{df} = 2$ and $\\mathrm{idf} = \\log_2(8/2) = \\log_2 4 = 2$. Its count in $d$ is 3, so $\\mathrm{tfidf} = 3 \\times 2 = 6$. Using the 4 total occurrences as df gives $\\log_2(8/4) = 1$ and the answer 3, but df counts documents, not occurrences. 12 forgets the log, and 2 is the IDF alone.',
    difficulty: 'beginner',
  },
  {
    id: 'text-as-data.bag-of-words-and-tfidf.2',
    prompt:
      'An HDB help site ranks its 10,000 FAQ pages by cosine similarity between **raw word-count** vectors. A search for "what is the resale levy" keeps returning long pages that are full of "what", "is" and "the". Which change most directly fixes this?',
    options: [
      'Multiply counts by IDF so that words found on almost every page get weights near 0',
      'Rank by Euclidean distance between the raw count vectors instead of cosine similarity',
      'Count bigrams as well, so that pairs of neighbouring words get their own columns',
      'Keep rare words and typos in the vocabulary so that every page has more columns',
    ],
    answer: 0,
    explanation:
      'The problem is that common words dominate the counts. IDF $= \\log(N/\\mathrm{df})$ is close to 0 for words on nearly every page, so "what", "is" and "the" stop contributing and "resale" and "levy" decide the ranking. Euclidean distance on raw counts still lets common words dominate (and adds a length bias); bigrams and a bigger vocabulary do not down-weight common words.',
    difficulty: 'beginner',
  },
  {
    id: 'text-as-data.bag-of-words-and-tfidf.3',
    prompt: 'These are the cosine similarities between a query and five documents. What does the code print?',
    code: 'import numpy as np\nscores = np.array([0.12, 0.85, 0.40, 0.61, 0.05])\nprint(np.argsort(scores)[::-1][:2])',
    options: ['`[1 3]`', '`[4 0]`', '`[0.85 0.61]`', '`[3 1]`'],
    answer: 0,
    explanation:
      '`np.argsort` returns the **indices** that would sort the array in ascending order: `[4 0 2 3 1]`. Reversing with `[::-1]` gives `[1 3 2 0 4]` (largest first), and `[:2]` keeps the top two: `[1 3]`. Without the reversal you would get `[4 0]`, the two worst documents; argsort never returns the scores themselves.',
    difficulty: 'intermediate',
  },
  {
    id: 'text-as-data.bag-of-words-and-tfidf.4',
    prompt:
      'Document $d_2$ is document $d_1$ copied out twice, so every word count in $d_2$ is double the count in $d_1$. For a query $q$, how does $\\cos(q, d_2)$ compare with $\\cos(q, d_1)$?',
    options: ['They are equal', '$\\cos(q, d_2)$ is twice as large', '$\\cos(q, d_2)$ is $\\sqrt{2}$ times as large', '$\\cos(q, d_2)$ is half as large'],
    answer: 0,
    explanation:
      '$d_2 = 2d_1$. The dot product doubles, $q \\cdot d_2 = 2\\,(q \\cdot d_1)$, but so does the length, $\\lVert d_2 \\rVert = 2\\lVert d_1 \\rVert$, and the 2s cancel. Cosine similarity depends only on direction, which is exactly why it is used: a long document does not win just by repeating itself. The raw dot product, by contrast, would double.',
    difficulty: 'intermediate',
  },
  {
    id: 'text-as-data.bag-of-words-and-tfidf.5',
    prompt:
      'Which statement about bag-of-words and TF-IDF vectors is **true**?',
    options: [
      'A word that occurs in every document gets weight 0 with $\\mathrm{idf} = \\log(N/\\mathrm{df})$',
      'The vectors keep word order, so "dog bites man" differs from "man bites dog"',
      'The word with the highest count in a document always gets the highest TF-IDF weight',
      'Changing the log base from 2 to 10 changes which documents are retrieved by cosine',
    ],
    answer: 0,
    explanation:
      'If $\\mathrm{df} = N$, then $\\log(N/N) = \\log 1 = 0$, so the word is switched off. Bag-of-words vectors only keep counts, so word order is lost. A very frequent word such as "the" can have the highest count but an IDF near 0. Changing the base multiplies every IDF by the same constant, which scales every vector and leaves all cosine similarities, and so the ranking, unchanged.',
    difficulty: 'beginner',
  },
]

export default questions
