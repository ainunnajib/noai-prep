import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "multimodal-ai",
  order: 32,
  part: "generative-ai",
  domain: "generative_ai",
  title: "Multimodal AI: ViT, self-supervision, CLIP and VLMs",
  tagline: "Connecting images and text",
  summary: "Vision Transformers that treat image patches as tokens, self-supervised learning for vision (contrastive and masked objectives), CLIP's contrastive training on image-text pairs with zero-shot classification, and vision-language models, from encoder-decoder captioners to LLMs that read image tokens (LLaVA, Flamingo, GPT-4V).",
  prerequisites: ["attention-and-transformers", "vision-tasks", "large-language-models", "generative-models"],
  syllabus: ["IOAI 2B5 Transformers (image): ViT patches and patch embeddings", "IOAI 3A8 Self-Supervised Learning for Vision", "IOAI 3A9 Vision-text encoders (e.g. CLIP)", "IOAI 4A4 Encoder-Decoder Models for Vision-Language Modeling", "IOAI 2B2 Data Embeddings (image)", "NOAI Generative AI: multimodal models, contrastive loss, zero-shot classification, cross-attention, Flamingo, GPT-4V"],
  lessons: [
    {
      slug: "vision-transformers",
      title: "Vision Transformers",
      summary: "Treating an image as a sequence of patches with position embeddings and a class token, and how ViTs compare with CNNs.",
      minutes: 25,
      objectives: ["You can count the patch tokens for an image and patch size, with and without [CLS]", "You can explain what the patch embedding, the [CLS] token and position embeddings each do", "You can explain why a ViT needs more data or pretraining than a CNN"],
      load: () => import('./vision-transformers.mdx'),
    },
    {
      slug: "self-supervised-vision",
      title: "Self-supervised learning for vision",
      summary: "Learning visual features without labels through pretext tasks, contrastive learning (SimCLR) and masked image modelling (MAE).",
      minutes: 25,
      objectives: ["You can explain how self-supervised learning makes its own labels from unlabelled data", "You can identify SimCLR's positive and negative pairs and count the negatives in a batch", "You can explain why MAE hides about 75% of the patches and encodes only the visible ones"],
      load: () => import('./self-supervised-vision.mdx'),
    },
    {
      slug: "clip-and-zero-shot",
      title: "CLIP: one space for images and words",
      summary: "Contrastive training on image-caption pairs builds a joint embedding space, which turns text prompts into zero-shot classifiers.",
      minutes: 30,
      objectives: ["You can explain CLIP's contrastive loss on a batch similarity matrix and count its positives and negatives", "You can explain why CLIP normalises its embeddings and how one shared space supports search", "You can classify images zero-shot by comparing them with one text prompt per class"],
      load: () => import('./clip-and-zero-shot.mdx'),
    },
    {
      slug: "vision-language-models",
      title: "Vision-language models",
      summary: "How models like LLaVA, Flamingo and GPT-4V let an LLM see: vision encoder, projector and LLM, encoder-decoder captioners, and cross-attention versus token concatenation.",
      minutes: 30,
      objectives: ["You can trace a picture through the vision encoder, projector and LLM, and count its image tokens", "You can contrast LLaVA-style concatenation with Flamingo's gated cross-attention, including where Q, K and V come from", "You can describe how an encoder-decoder captioner uses cross-attention and is trained on every caption token", "You can explain why VLM builders reuse pretrained parts and first train only a small bridge"],
      load: () => import('./vision-language-models.mdx'),
    },
  ],
}

export default mod
