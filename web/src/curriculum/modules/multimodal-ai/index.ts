import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "multimodal-ai",
  order: 32,
  part: "generative-ai",
  domain: "generative_ai",
  title: "Multimodal AI: ViT, self-supervision, CLIP and VLMs",
  tagline: "Connecting images, text and more",
  summary: "Vision Transformers that treat image patches as tokens, self-supervised learning for vision (contrastive and masked objectives), CLIP's contrastive training on image-text pairs with zero-shot classification, and vision-language models that feed image features into LLMs (Flamingo, LLaVA, GPT-4V style).",
  prerequisites: ["attention-and-transformers", "vision-tasks", "large-language-models", "generative-models"],
  syllabus: ["IOAI 2B5 Transformers (image): ViT patches and patch embeddings", "IOAI 3A8 Self-Supervised Learning for Vision", "IOAI 3A9 Vision-text encoders (e.g. CLIP)", "IOAI 4A4 Encoder-Decoder Models for Vision-Language Modeling", "IOAI 2B2 Data Embeddings (image)", "NOAI Generative AI: multimodal models, contrastive loss, zero-shot classification, cross-attention, Flamingo, GPT-4V"],
  lessons: [
    {
      slug: "vision-transformers",
      title: "Vision Transformers",
      summary: "Treating an image as a sequence of patches with position embeddings and a class token, and how ViTs compare with CNNs.",
      minutes: 25,
      objectives: ["You can compute the number of patches (tokens) for an image and patch size", "You can describe patch embedding, position embedding and the [CLS] token", "You can contrast ViT and CNN inductive biases and data needs"],
      load: () => import('./vision-transformers.mdx'),
    },
    {
      slug: "self-supervised-vision",
      title: "Self-supervised learning for vision",
      summary: "Learning visual features without labels through pretext tasks, contrastive learning (SimCLR) and masked image modelling (MAE).",
      minutes: 25,
      objectives: ["You can explain how self-supervised learning creates its own training signal", "You can describe contrastive learning with positive and negative pairs", "You can describe masked autoencoding for images"],
      load: () => import('./self-supervised-vision.mdx'),
    },
    {
      slug: "clip-and-zero-shot",
      title: "CLIP: one space for images and words",
      summary: "Contrastive training on image-caption pairs builds a joint embedding space, which turns text prompts into zero-shot classifiers.",
      minutes: 30,
      objectives: ["You can explain CLIP's contrastive objective on a batch similarity matrix", "You can describe the joint image-text embedding space", "You can run zero-shot classification with text prompts"],
      load: () => import('./clip-and-zero-shot.mdx'),
    },
    {
      slug: "vision-language-models",
      title: "Vision-language models",
      summary: "How models like Flamingo, LLaVA and GPT-4V let an LLM see: vision encoders, projections, and cross-attention versus token concatenation.",
      minutes: 30,
      objectives: ["You can describe how image features are fed into an LLM", "You can contrast cross-attention fusion (Flamingo) with token concatenation (LLaVA-style)", "You can explain self-attention versus cross-attention", "You can name tasks VLMs perform (captioning, VQA, OCR)"],
      load: () => import('./vision-language-models.mdx'),
    },
  ],
}

export default mod
