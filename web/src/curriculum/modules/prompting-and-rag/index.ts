import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "prompting-and-rag",
  order: 30,
  part: "generative-ai",
  domain: "generative_ai",
  title: "Prompting and retrieval-augmented generation",
  tagline: "Getting reliable answers from LLMs",
  summary: "Prompt engineering (zero-, one- and few-shot, chain-of-thought, structured output), the RAG pipeline from chunking to grounded answers, building a RAG retriever from scratch in NumPy (2025 Final Q3), and tool-using agents and how to evaluate them.",
  prerequisites: ["large-language-models", "text-as-data"],
  syllabus: ["NOAI Generative AI: prompting and RAG", "NOAI 2025 Final Q3: Retrieval-Augmented Generation (vectorisation, cosine similarity, answer extraction)", "Zero-shot, few-shot and in-context learning", "Chunking, embeddings, vector search, grounding", "Tool use and agent loops"],
  lessons: [
    {
      slug: "prompt-engineering",
      title: "Prompt engineering",
      summary: "Zero-, one- and few-shot prompting, in-context learning, the parts of a good prompt, structured output that code can read, and chain-of-thought reasoning.",
      minutes: 30,
      objectives: ["You can tell zero-shot, one-shot and few-shot prompts apart by counting the solved examples", "You can explain why in-context learning changes no weights, unlike fine-tuning", "You can improve a prompt with a role, context, constraints and an exact output format such as JSON", "You can explain why chain-of-thought prompting helps on multi-step problems"],
      load: () => import('./prompt-engineering.mdx'),
    },
    {
      slug: "rag-pipeline",
      title: "The RAG pipeline",
      summary: "Why LLMs need retrieval, the pipeline from chunking to grounded answers, chunk-size and top-k trade-offs, retrieval versus generation failures, and when to choose prompting, RAG or fine-tuning.",
      minutes: 25,
      objectives: ["You can put the stages of a RAG pipeline in order and rank chunks by cosine similarity", "You can reason about chunk size, overlap and top-k trade-offs", "You can tell a retrieval failure from a generation failure and say what to fix", "You can choose between prompting, RAG and fine-tuning for a scenario"],
      load: () => import('./rag-pipeline.mdx'),
    },
    {
      slug: "rag-from-scratch",
      title: "Building a RAG retriever from scratch",
      summary: "Building a count or TF-IDF retriever in NumPy, as in the 2025 Final: vectorisation, cosine scores, top-k with argsort, awkward inputs and a grounded template answer.",
      minutes: 30,
      objectives: ["You can build count or TF-IDF vectors for documents and a query from one shared vocabulary", "You can compute every cosine score at once with D @ q and the row norms, and predict the array shapes", "You can return the top-k documents, best first, with argsort", "You can guard against empty or unknown queries and answer only from retrieved text"],
      load: () => import('./rag-from-scratch.mdx'),
    },
    {
      slug: "tools-and-agents",
      title: "Tool use and agents",
      summary: "Function calling, the think-act-observe agent loop, how errors compound over many steps and how to guard against them, and evaluating retrieval and generation separately.",
      minutes: 25,
      objectives: ["You can explain function calling: the model writes the call and your application runs it", "You can trace a think-act-observe agent loop and work out how reliability falls over n steps", "You can name agent failure modes, such as prompt injection, and the guardrails against them", "You can use retrieval and answer scores to decide whether to fix the retriever or the generator"],
      load: () => import('./tools-and-agents.mdx'),
    },
  ],
}

export default mod
