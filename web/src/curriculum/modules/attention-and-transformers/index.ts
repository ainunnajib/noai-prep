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
      summary: "Queries, keys and values: score a query against every key, softmax the scores and blend the values; then self-attention, contextual word vectors and cross-attention.",
      minutes: 25,
      objectives: ["You can describe the roles of the query, the keys and the values in attention", "You can turn dot-product scores into softmax weights and blend the values into the output", "You can explain why self-attention gives the same word a different vector in different sentences"],
      load: () => import('./attention-intuition.mdx'),
    },
    {
      slug: "scaled-dot-product-attention",
      title: "Scaled dot-product attention and masks",
      summary: "The formula softmax(QKᵀ/√dₖ)V step by step with shapes, why we divide by √dₖ, and causal and padding masks in PyTorch.",
      minutes: 35,
      objectives: ["You can compute scaled dot-product attention for a tiny Q, K and V by hand", "You can give the shapes of the scores, the weights and the output, with or without a batch", "You can explain why the scores are divided by √dₖ", "You can build causal and padding masks and apply them with −∞ before the softmax"],
      load: () => import('./scaled-dot-product-attention.mdx'),
    },
    {
      slug: "multi-head-attention",
      title: "Multi-head attention",
      summary: "Running several attention heads in parallel on slices of the embedding: the view and transpose reshapes, concatenation, the output projection and the parameter count.",
      minutes: 20,
      objectives: ["You can work out the head size dₖ = d_model / h", "You can trace the reshapes from (B, T, d_model) to (B, h, T, dₖ) and back, and spot a missing transpose", "You can explain why several heads can learn different patterns", "You can count the parameters of a multi-head attention layer"],
      load: () => import('./multi-head-attention.mdx'),
    },
    {
      slug: "positional-encoding-and-blocks",
      title: "Positional encoding and the Transformer block",
      summary: "Why attention needs position information, sinusoidal and learned encodings, how attention, feed-forward layers, residuals and LayerNorm form encoder and decoder blocks, and why the cost grows with T².",
      minutes: 30,
      objectives: ["You can explain why self-attention needs positional encodings to see word order", "You can compute sinusoidal positional encoding values by hand", "You can describe a Transformer block and tell encoder, decoder and cross-attention apart", "You can explain why attention's cost grows with the square of the sequence length"],
      load: () => import('./positional-encoding-and-blocks.mdx'),
    },
  ],
}

export default mod
