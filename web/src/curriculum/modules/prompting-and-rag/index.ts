import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "prompting-and-rag",
  order: 30,
  part: "generative-ai",
  domain: "generative_ai",
  title: "Prompting and retrieval-augmented generation",
  tagline: "Getting reliable answers from LLMs",
  summary: "Prompt engineering (zero-, one- and few-shot, chain-of-thought, structured output), the RAG pipeline from chunking to grounded answers, building a RAG retriever from scratch in NumPy (2025 Final Q3), and tool-using agents.",
  prerequisites: ["large-language-models", "text-as-data"],
  syllabus: ["NOAI Generative AI: prompting and RAG", "NOAI 2025 Final Q3: Retrieval-Augmented Generation (vectorisation, cosine similarity, answer extraction)", "Zero-shot, few-shot and in-context learning", "Chunking, embeddings, vector search, grounding", "Tool use and agent loops"],
  lessons: [
    {
      slug: "prompt-engineering",
      title: "Prompt engineering",
      summary: "Writing clear instructions, using examples (few-shot), asking for step-by-step reasoning, and requesting structured output.",
      minutes: 16,
      objectives: ["You can distinguish zero-shot, one-shot and few-shot prompting", "You can explain in-context learning (no weight updates)", "You can improve a prompt with role, context, format and examples", "You can explain chain-of-thought prompting"],
      load: () => import('./prompt-engineering.mdx'),
    },
    {
      slug: "rag-pipeline",
      title: "The RAG pipeline",
      summary: "Why LLMs need retrieval, the steps (chunk, embed, store, retrieve, augment, generate), and when to choose prompting, RAG or fine-tuning.",
      minutes: 22,
      objectives: ["You can list the stages of a RAG pipeline and explain how RAG reduces hallucination and handles new or private data", "You can reason about chunk size and top-k trade-offs", "You can tell retrieval failures from generation failures", "You can choose between prompting, RAG and fine-tuning for a scenario"],
      load: () => import('./rag-pipeline.mdx'),
    },
    {
      slug: "rag-from-scratch",
      title: "Building a RAG retriever from scratch",
      summary: "Implementing vectorisation, cosine similarity and top-k retrieval in NumPy and assembling an answer, as in the 2025 Final.",
      minutes: 22,
      objectives: ["You can implement TF-IDF (or count) vectors for documents and a query in NumPy", "You can compute cosine similarities with vectorised operations", "You can return top-k documents with argsort", "You can explain your design choices in words"],
      load: () => import('./rag-from-scratch.mdx'),
    },
    {
      slug: "tools-and-agents",
      title: "Tool use and agents",
      summary: "Letting LLMs call functions and tools in a loop of thinking, acting and observing, and how such systems are evaluated.",
      minutes: 15,
      objectives: ["You can describe function calling", "You can trace a think-act-observe agent loop", "You can identify failure points and evaluation methods for LLM applications"],
      load: () => import('./tools-and-agents.mdx'),
    },
  ],
}

export default mod
