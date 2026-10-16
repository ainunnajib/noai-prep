import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'prompting-and-rag.rag-pipeline.1',
    prompt: 'A user asks a RAG chatbot a question. In which order does the system handle it?',
    options: [
      'Embed the question → retrieve the most similar chunks → add them to the prompt → only then generate',
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
      'Use bigger chunks or add overlap, so deadline and penalty share a chunk',
      'Switch to a larger LLM, so that it can work out the missing deadline by itself',
      'Lower the temperature, so the answer sticks more closely to the context',
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
      'A student asks the club bot "When does the library close on Friday?". The two retrieved chunks, [3] and [5], are both about the canteen. The bot replies "The library closes at 6 pm." with no citation. What should be fixed first?',
    options: [
      'Retrieval: chunking, $k$ or the embeddings, so the library chunk reaches the prompt',
      'Generation: the model ignored the library chunk, so tighten the grounding instructions',
      'Citations: add "cite each fact" to the prompt, so that the 6 pm answer gets a source',
      'The LLM: switch to a larger model that is more likely to know the library hours',
    ],
    answer: 0,
    explanation:
      'Neither retrieved chunk mentions the library, so the fact the answer needs never reached the model: a retrieval failure, and no prompt or model can cite a chunk it was not given. A well-grounded generator should also have said it did not know, so stricter instructions help as a second fix, but they cannot produce the right time. A larger model would only guess more fluently.',
    difficulty: 'intermediate',
  },
  {
    id: 'prompting-and-rag.rag-pipeline.5',
    prompt:
      "A polyclinic wants a chatbot that answers patients' questions about its own opening hours, fees and procedures. These change every few weeks, and each answer should point to the page it came from. Which approach fits best?",
    options: [
      'RAG over the clinic\'s own documents, re-indexing only the pages that change',
      "Fine-tuning the LLM on the clinic's documents again each time they change",
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
