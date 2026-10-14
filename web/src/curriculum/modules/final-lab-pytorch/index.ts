import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "final-lab-pytorch",
  order: 38,
  part: "exam",
  domain: "exam",
  title: "Final lab II: deep-learning tasks in PyTorch",
  tagline: "Rebuild the U-Net and attention tasks",
  summary: "Shape-first PyTorch habits for the Final, the 2026 U-Net debugging task (centre crop) and mean IoU with absent classes, the 2026 attention task (scaled dot-product and multi-head attention, positional-encoding bug, classifier head and causal mask), and a self-checking practice set of likely 2027 tasks.",
  prerequisites: ["final-lab-numpy", "vision-tasks", "attention-and-transformers", "debugging-and-diagnosis"],
  syllabus: ["2026 Task 2 (20 marks): U-Net debugging with centre crop, and mean IoU without sklearn or torchmetrics", "2026 Task 3 (35 marks incl. 5 bonus): scaled dot-product attention, multi-head attention, positional encoding fix, classifier head, causal mask", "Likely 2027 task types: from-scratch classical ML in NumPy and debugging or implementing a PyTorch component"],
  lessons: [
    {
      slug: "torch-exam-patterns",
      title: "PyTorch patterns for the Final",
      summary: "Shape-first coding, NumPy-to-torch translation and test-cell habits.",
      minutes: 15,
      objectives: ["You can annotate shapes on every line of tensor code", "You can translate common NumPy operations to PyTorch", "You can run small shape tests before the full test cell"],
      load: () => import('./torch-exam-patterns.mdx'),
    },
    {
      slug: "task-unet-center-crop",
      title: "2026 Task 2 Part 1: Fixing U-Net with center crop",
      summary: "Implement center_crop to align encoder and decoder feature maps.",
      minutes: 24,
      objectives: ["You can explain the valid-padding shrinkage", "You can implement center_crop(layer, target_shape) with correct offsets", "You can write a two-to-three sentence trade-off answer for crop versus pad versus interpolate"],
      load: () => import('./task-unet-center-crop.mdx'),
    },
    {
      slug: "task-mean-iou",
      title: "2026 Task 2 Part 2: Mean IoU from scratch",
      summary: "Implement mIoU without sklearn or torchmetrics, including the missing-class edge case.",
      minutes: 22,
      objectives: ["You can implement per-class IoU with boolean masks", "You can handle union == 0 and empty lists correctly"],
      load: () => import('./task-mean-iou.mdx'),
    },
    {
      slug: "task-attention",
      title: "2026 Task 3 Parts 1-2: Attention and multi-head attention",
      summary: "Implement scaled dot-product attention and a multi-head attention module, and explain the sqrt(d_k) scaling.",
      minutes: 25,
      objectives: ["You can implement scaled_dot_product_attention with mask and dropout", "You can implement MultiHeadAttention with split and merge of heads", "You can write a 2-4 sentence explanation of sqrt(d_k) scaling"],
      load: () => import('./task-attention.mdx'),
    },
    {
      slug: "task-pe-classifier-mask",
      title: "2026 Task 3 Parts 3-5: Positional encoding, classifier head and causal mask",
      summary: "Fix the div_term bug, build the classification head with masked mean pooling, and create a causal mask.",
      minutes: 20,
      objectives: ["You can fix the positional encoding div_term to exp(arange(0, d, 2) * -(ln 10000 / d))", "You can implement a classifier head with mean pooling over the sequence", "You can build a causal mask with torch.tril"],
      load: () => import('./task-pe-classifier-mask.mdx'),
    },
    {
      slug: "practice-set",
      title: "Practice set: likely 2027 tasks",
      summary: "New from-scratch tasks in the Final's style, from logistic regression and PCA in NumPy to a conv2d, normalisation layer or loss in PyTorch, with self-checking tests.",
      minutes: 25,
      objectives: ["You can predict the kinds of task the 2027 Final is likely to set", "You can work test-first: tiny example, assert, then implement", "You can turn a correct loop implementation into a vectorised one"],
      load: () => import('./practice-set.mdx'),
    },
  ],
}

export default mod
