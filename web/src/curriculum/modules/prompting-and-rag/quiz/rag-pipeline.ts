import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'prompting-and-rag.rag-pipeline.1',
    prompt: 'A user asks a RAG chatbot a question. In which order does the system handle it?',
    options: [
      'Embed the question → retrieve the most similar chunks → add them to the prompt → generate the answer',
      'Retrieve the most similar chunks → fine-tune the LLM on those chunks → generate the answer',
      'Embed the question → generate the answer → retrieve chunks that agree with it → attach them as citations',
      'Split the question into chunks → store them in the vector database → generate the answer from the database',
    ],
    answer: 0,
    explanation:
      'Retrieve, augment, generate: the question is embedded with the same model as the chunks, the top-$k$ similar chunks are retrieved, inserted into the prompt, and only then does the LLM write the answer. No weights are trained at any point, and citations come from the chunks the answer was written from, not ones found afterwards to support it.',
    difficulty: 'beginner',
  },
  {
    id: 'prompting-and-rag.rag-pipeline.2',
    prompt:
      'A question has embedding $\\mathbf{q} = [3, 4]$. Using cosine similarity, which of these chunk embeddings is retrieved first?',
    options: ['$[4, 3]$', '$[12, 5]$', '$[0, 10]$', '$[5, 0]$'],
    answer: 0,
    explanation:
      '$\\lVert \\mathbf{q} \\rVert = 5$. Cosines: $[4,3]$: $\\frac{24}{5 \\times 5} = 0.96$; $[12,5]$: $\\frac{56}{5 \\times 13} \\approx 0.86$; $[0,10]$: $\\frac{40}{5 \\times 10} = 0.8$; $[5,0]$: $\\frac{15}{5 \\times 5} = 0.6$. The trap is $[12, 5]$, which has the largest dot product (56) only because it is a long vector; cosine divides by the lengths.',
    difficulty: 'intermediate',
  },
  {
    id: 'prompting-and-rag.rag-pipeline.3',
    prompt:
      'A RAG bot often gives half-answers. Asked about late projects, it says "you lose 10% per day" but never mentions the deadline, which is in the sentence just before. It uses 15-word chunks, no overlap and $k = 1$. Which change is most likely to help?',
    options: [
      'Use bigger chunks or add overlap, so the deadline and the penalty end up in the same chunk',
      'Switch to a larger LLM, so that it can work out the missing deadline by itself',
      'Lower the sampling temperature, so the answer sticks more closely to the context',
      'Use smaller chunks, so that each retrieved chunk matches the question more precisely',
    ],
    answer: 0,
    explanation:
      'This is a retrieval failure: the deadline never reaches the prompt because tiny chunks cut the answer in half and only one chunk is kept. Bigger chunks, some overlap (or a larger $k$) bring the whole answer in. A larger LLM or a lower temperature changes generation, and no model can report a deadline it was never shown; even smaller chunks make the cutting worse.',
    difficulty: 'intermediate',
  },
  {
    id: 'prompting-and-rag.rag-pipeline.4',
    prompt:
      'A student asks "When is the AI Club mock exam?". The retrieved chunk [2] says "Saturday 23 January". The bot answers "The mock exam is on 30 January [2]." What went wrong, and what should be fixed first?',
    options: [
      'A generation failure: the right chunk was retrieved, so tighten the grounding instructions or use a stronger model',
      'A retrieval failure: the right chunk was missed, so raise $k$ so that more chunks reach the prompt',
      'A retrieval failure: the chunks are too long, so split the handbook into single sentences',
      'A generation failure: the embedding model is wrong, so re-embed the handbook with a newer model',
    ],
    answer: 0,
    explanation:
      'The correct date was in the retrieved context, so retrieval worked; the model then contradicted its own cited source. That is a generation failure, fixed on the generation side ("answer only from the context", a stronger model). Raising $k$ or re-chunking fixes retrieval, and the embedding model only affects which chunks are retrieved, not what the LLM writes from them.',
    difficulty: 'intermediate',
  },
  {
    id: 'prompting-and-rag.rag-pipeline.5',
    prompt:
      "A polyclinic wants a chatbot that answers patients' questions about its own opening hours, fees and procedures. These change every few weeks, and each answer should point to the page it came from. Which approach fits best?",
    options: [
      "RAG over the clinic's own documents, re-indexing them whenever they change",
      "Fine-tuning the LLM on the clinic's documents again every time they change",
      'Few-shot prompting with three example questions and answers about the clinic',
      "Training a new language model from scratch on the clinic's website",
    ],
    answer: 0,
    explanation:
      'The model lacks knowledge that is private and changes often, and answers must cite sources: exactly what RAG is for, and updating means editing documents, not retraining. Repeated fine-tuning is slow and costly, cannot cite pages and is out of date between runs; three examples cannot hold all the clinic\'s facts; training from scratch is wildly expensive.',
    difficulty: 'beginner',
  },
]

export default questions
