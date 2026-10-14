import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "attention-and-transformers",
  order: 27,
  part: "language-audio",
  domain: "ai_ml_dl",
  title: "Attention and Transformers",
  tagline: "Every token looks at every token",
  summary: "Attention as a soft dictionary lookup, scaled dot-product attention with masks, multi-head attention with its reshapes, positional encoding, and the full Transformer block, all as needed for the 2026 Final Task 3.",
  prerequisites: ["text-as-data", "pytorch"],
  syllabus: ["IOAI 2B4 Attention Mechanism", "IOAI 2B5 Transformers (theory for text and image)", "NOAI 2026 Final Task 3: scaled dot-product attention, multi-head attention, positional encoding", "Causal masks, cross-attention, O(n²) complexity, LayerNorm and residuals"],
  lessons: [
    {
      slug: "attention-intuition",
      title: "Attention as a soft lookup",
      summary: "Queries, keys and values: matching a question against labels to blend the answers.",
      minutes: 18,
      objectives: ["You can describe the roles of query, key and value", "You can compute attention weights with softmax over similarities", "You can explain how attention builds context-dependent word representations"],
      load: () => import('./attention-intuition.mdx'),
    },
    {
      slug: "scaled-dot-product-attention",
      title: "Scaled dot-product attention and masks",
      summary: "The formula softmax(QKᵀ/√d_k)V step by step with shapes, why we divide by √d_k, and padding and causal masks.",
      minutes: 24,
      objectives: ["You can compute attention for a tiny Q, K, V by hand", "You can state the shapes of QKᵀ and the output", "You can explain the √d_k scaling", "You can build causal and padding masks and apply them with −∞ before softmax"],
      load: () => import('./scaled-dot-product-attention.mdx'),
    },
    {
      slug: "multi-head-attention",
      title: "Multi-head attention",
      summary: "Running several attention heads in parallel on slices of the embedding, the view/transpose reshapes, concatenation and output projection.",
      minutes: 20,
      objectives: ["You can compute head_dim = d_model / num_heads", "You can trace the shape changes (B, T, d) → (B, h, T, d/h) and back", "You can explain why multiple heads help", "You can count the parameters of a multi-head attention layer"],
      load: () => import('./multi-head-attention.mdx'),
    },
    {
      slug: "positional-encoding-and-blocks",
      title: "Positional encoding and the Transformer block",
      summary: "Why attention needs position information, sinusoidal and learned encodings, and how attention, feed-forward layers, residuals and LayerNorm form a block.",
      minutes: 24,
      objectives: ["You can explain why self-attention is permutation-invariant without positions", "You can compute sinusoidal positional encoding values", "You can describe a Transformer block and encoder vs decoder blocks", "You can explain O(n²) cost in sequence length"],
      load: () => import('./positional-encoding-and-blocks.mdx'),
    },
  ],
}

export default mod
