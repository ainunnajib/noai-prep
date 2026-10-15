import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "final-lab-pytorch",
  order: 38,
  part: "exam",
  domain: "exam",
  title: "Final lab II: deep-learning tasks in PyTorch",
  tagline: "Rebuild the U-Net and attention tasks",
  summary: "Shape-first PyTorch habits for the Final, the 2026 U-Net debugging task (centre crop) and mean IoU with absent classes, the 2026 attention task (scaled dot-product and multi-head attention, the positional-encoding check, classifier head and causal mask), and a self-checking practice set of likely 2027 tasks.",
  prerequisites: ["final-lab-numpy", "vision-tasks", "attention-and-transformers", "debugging-and-diagnosis"],
  syllabus: ["2026 Task 2 (20 marks): U-Net debugging with centre crop, and mean IoU without sklearn or torchmetrics", "2026 Task 3 (35 marks incl. 5 bonus): scaled dot-product attention, multi-head attention, positional encoding check, classifier head, causal mask", "Likely 2027 task types: from-scratch classical ML in NumPy and debugging or implementing a PyTorch component"],
  lessons: [
    {
      slug: "torch-exam-patterns",
      title: "PyTorch patterns for the Final",
      summary: "Shape comments on every tensor line, NumPy-to-PyTorch translation and its traps, and scratch tests that catch silent bugs.",
      minutes: 25,
      objectives: ["You can write the expected shape after each line of tensor code and check it with an assert", "You can translate common NumPy operations to PyTorch and avoid the dtype, dim and max traps", "You can design scratch tests with distinct sizes and a slow reference that catch bugs a shape check misses"],
      load: () => import('./torch-exam-patterns.mdx'),
    },
    {
      slug: "task-unet-center-crop",
      title: "2026 Task 2 Part 1: Fixing U-Net with a centre crop",
      summary: "Trace how unpadded convolutions shrink the maps, implement center_crop to align the skip connection, and answer the crop, pad or interpolate question.",
      minutes: 25,
      objectives: ["You can trace how unpadded convolutions, pooling and upsampling change a feature map's size", "You can implement center_crop(layer, target_shape) with offsets read from the shapes, and count the channels after torch.cat", "You can write a two- or three-sentence answer on the trade-offs of cropping, same padding and interpolation"],
      load: () => import('./task-unet-center-crop.mdx'),
    },
    {
      slug: "task-mean-iou",
      title: "2026 Task 2 Part 2: Mean IoU from scratch",
      summary: "Implement mean IoU without sklearn or torchmetrics, skip classes whose union is 0, and handle a self-check that contradicts the written rule.",
      minutes: 20,
      objectives: ["You can compute per-class IoU by hand and in PyTorch with boolean masks and sums", "You can skip a class whose union is 0 before dividing, and return 0.0 when no class is left", "You can recompute a self-check by hand and follow the written rule when the two disagree"],
      load: () => import('./task-mean-iou.mdx'),
    },
    {
      slug: "task-attention",
      title: "2026 Task 3 Parts 1 and 2: Attention and multi-head attention",
      summary: "Implement scaled dot-product attention and a multi-head attention module, and explain why the scores are divided by the square root of d_k.",
      minutes: 25,
      objectives: ["You can implement scaled_dot_product_attention with a padding mask and dropout, and say why the mask uses -1e9", "You can implement MultiHeadAttention, splitting and merging the heads with view and transpose", "You can explain in two to four sentences why the scores are divided by the square root of d_k"],
      load: () => import('./task-attention.mdx'),
    },
    {
      slug: "task-pe-classifier-mask",
      title: "2026 Task 3 Parts 3 to 5: Positional encoding, classifier head and causal mask",
      summary: "Check the positional-encoding div_term line against the formula (the released notebook's line was already correct), build the classifier head with mean pooling (and see why masked mean is better), and create a causal mask.",
      minutes: 25,
      objectives: ["You can check a positional-encoding div_term line against the sine and cosine formula on a case small enough to do by hand", "You can build the classifier head and its forward pass, reshaping the padding mask to (B, 1, 1, T) and pooling with a mean", "You can build a float causal mask of shape (1, 1, T, T) with torch.tril"],
      load: () => import('./task-pe-classifier-mask.mdx'),
    },
    {
      slug: "practice-set",
      title: "Practice set: likely 2027 tasks",
      summary: "The evidence for likely 2027 tasks, eight self-checking from-scratch exercises in NumPy (plus a stretch), and vectorising a convolution with im2col.",
      minutes: 25,
      objectives: ["You can describe the kinds of task past Finals set and use them to plan your practice", "You can work test-first: solve a tiny example by hand, write it as an assert, then add one assert per edge case", "You can explain why a vectorised version such as im2col is faster than loops and work out the shapes it uses"],
      load: () => import('./practice-set.mdx'),
    },
  ],
}

export default mod
