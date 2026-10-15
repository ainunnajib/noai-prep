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
      objectives: ["You can describe the stages pretraining → supervised fine-tuning → preference alignment", "You can explain why pretraining is self-supervised", "You can explain how DPO and reasoning-model training differ from classic RLHF", "You can describe what scaling laws say about size, data and compute"],
      load: () => import('./how-llms-are-built.mdx'),
    },
    {
      slug: "decoding-and-sampling",
      title: "Decoding: greedy, beam search, temperature, top-k and top-p",
      summary: "How an LLM turns next-token probabilities into text, and how each setting trades accuracy against creativity.",
      minutes: 30,
      objectives: ["You can apply temperature to logits and predict the effect", "You can perform top-k and top-p filtering on a small distribution", "You can contrast greedy decoding and beam search", "You can choose settings for factual vs creative tasks"],
      load: () => import('./decoding-and-sampling.mdx'),
    },
    {
      slug: "context-and-cost",
      title: "Context windows, the KV cache and cost",
      summary: "What the context window is, why long contexts are expensive, and how caching keys and values speeds up generation.",
      minutes: 25,
      objectives: ["You can explain what a context window limits", "You can explain the KV cache and why it speeds up generation", "You can reason about cost and latency in tokens"],
      load: () => import('./context-and-cost.mdx'),
    },
    {
      slug: "fine-tuning-and-lora",
      title: "Fine-tuning and LoRA",
      summary: "Full fine-tuning versus parameter-efficient methods, the low-rank idea behind LoRA, and catastrophic forgetting.",
      minutes: 25,
      objectives: ["You can explain how LoRA adds a trainable low-rank update BA to a frozen weight", "You can compute LoRA's trainable parameter count", "You can explain catastrophic forgetting"],
      load: () => import('./fine-tuning-and-lora.mdx'),
    },
    {
      slug: "limits-and-responsible-ai",
      title: "Limits, risks and responsible use of AI",
      summary: "Hallucination, bias, privacy, prompt injection and misuse, and how they are evaluated and governed, including Singapore's approach.",
      minutes: 25,
      objectives: ["You can explain why LLMs hallucinate", "You can explain how biased data leads to biased models", "You can describe prompt injection and why it is hard to prevent", "You can name principles of responsible AI governance"],
      load: () => import('./limits-and-responsible-ai.mdx'),
    },
  ],
}

export default mod
