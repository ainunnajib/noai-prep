import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "large-language-models",
  order: 29,
  part: "generative-ai",
  domain: "generative_ai",
  title: "Large language models",
  tagline: "How ChatGPT-style models really work",
  summary: "How LLMs are pretrained, instruction-tuned and aligned, how decoding settings (greedy, beam, temperature, top-k, top-p) shape outputs, context windows and the KV cache, fine-tuning with LoRA and other parameter-efficient methods, and their limits and risks.",
  prerequisites: ["pretrained-models-text-speech"],
  syllabus: ["NOAI Generative AI: LLMs", "IOAI 4A5 Pre-trained Language Models (open-source and API-based)", "IOAI 2B13 Model Finetuning (parameter-efficient)", "Pretraining, SFT, RLHF, scaling, sampling strategies, context length, LoRA", "Hallucination, bias, safety and responsible use"],
  lessons: [
    {
      slug: "how-llms-are-built",
      title: "How LLMs are built",
      summary: "Pretraining on next-token prediction, instruction tuning, preference alignment (RLHF and DPO), reasoning models, and what scale changes.",
      minutes: 25,
      objectives: ["You can describe the three training stages (pretraining, supervised fine-tuning and preference alignment) and what each one learns from", "You can explain why pretraining is self-supervised", "You can explain how RLHF uses a reward model, and how DPO and reasoning models train without one", "You can use scaling laws and the rule of about 20 tokens per parameter to plan a training run"],
      load: () => import('./how-llms-are-built.mdx'),
    },
    {
      slug: "decoding-and-sampling",
      title: "Decoding: greedy, beam search, temperature, top-k and top-p",
      summary: "How an LLM turns next-token probabilities into text, and how each setting trades accuracy against creativity.",
      minutes: 30,
      objectives: ["You can apply temperature to logits and work out how the probabilities change", "You can carry out top-k and top-p filtering on a small distribution and renormalise", "You can contrast greedy decoding and beam search and find which sequence each returns", "You can choose decoding settings for factual tasks and for creative ones"],
      load: () => import('./decoding-and-sampling.mdx'),
    },
    {
      slug: "context-and-cost",
      title: "Context windows, the KV cache and cost",
      summary: "What the context window is, why long contexts are expensive, how caching keys and values speeds up generation, and how tokens set cost and latency.",
      minutes: 25,
      objectives: ["You can explain what a context window limits and convert between words and tokens", "You can explain why attention work grows with the square of the context length", "You can explain why the KV cache speeds up generation and estimate the memory it needs", "You can work out how re-sent chat history drives the token bill"],
      load: () => import('./context-and-cost.mdx'),
    },
    {
      slug: "fine-tuning-and-lora",
      title: "Fine-tuning and LoRA",
      summary: "Full fine-tuning versus parameter-efficient methods, the low-rank idea behind LoRA, and catastrophic forgetting.",
      minutes: 25,
      objectives: ["You can explain how LoRA adds a trainable low-rank update BA to a frozen weight matrix, and why B starts at zero", "You can count LoRA's trainable parameters and compare them with full fine-tuning", "You can recognise catastrophic forgetting and name ways to reduce it"],
      load: () => import('./fine-tuning-and-lora.mdx'),
    },
    {
      slug: "limits-and-responsible-ai",
      title: "Limits, risks and responsible use of AI",
      summary: "Hallucination, bias, privacy, prompt injection and misuse, and how they are evaluated and governed, including Singapore's approach.",
      minutes: 25,
      objectives: ["You can explain why LLMs hallucinate and why low temperature does not fix it", "You can explain how biased labels and proxies lead to biased models, and why fairness is checked per group", "You can recognise indirect prompt injection and explain why it is hard to prevent", "You can describe Singapore's risk-based approach to responsible AI governance"],
      load: () => import('./limits-and-responsible-ai.mdx'),
    },
  ],
}

export default mod
