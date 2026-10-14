import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "ml-systems-and-tradeoffs",
  order: 34,
  part: "problem-solving",
  domain: "problem_solving",
  title: "ML systems and trade-offs",
  tagline: "Designing models for the real world",
  summary: "The ML lifecycle, deployment and monitoring for drift, what fills GPU memory and how to feed and scale training, counting the compute cost of ML operations, and choosing and compressing models under latency, memory and accuracy constraints.",
  prerequisites: ["debugging-and-diagnosis", "attention-and-transformers", "algorithms-and-complexity"],
  syllabus: ["NOAI Problem Solving: System Design, Optimisation", "ML pipelines, orchestration, ETL", "Data, code and model versioning, model registry, reproducibility", "Monitoring, data drift, concept drift, retraining", "GPU memory, mixed precision, gradient accumulation, distributed data parallel, quantisation and distillation", "Complexity of matrix multiplication, k-NN, attention and convolution; FLOP counting"],
  lessons: [
    {
      slug: "lifecycle-and-deployment",
      title: "The ML lifecycle, deployment and monitoring",
      summary: "From problem framing to monitoring in production: the lifecycle loop, batch versus real-time serving, and catching data and concept drift.",
      minutes: 24,
      objectives: ["You can describe the stages of the ML lifecycle and why it loops", "You can choose batch or real-time serving for a scenario", "You can tell data drift from concept drift and choose a monitoring signal", "You can list what must be versioned to reproduce a model (data, code, config, seed, weights)"],
      load: () => import('./lifecycle-and-deployment.mdx'),
    },
    {
      slug: "compute-and-memory-tradeoffs",
      title: "Compute and memory trade-offs in training",
      summary: "What fills GPU memory, how batch size, precision and accumulation trade speed for memory, and scaling across GPUs.",
      minutes: 20,
      objectives: ["You can explain activation checkpointing and its compute cost", "You can choose the best fix for an out-of-memory error with the least cost to throughput", "You can explain data loading bottlenecks", "You can explain data-parallel training and the linear learning-rate scaling rule"],
      load: () => import('./compute-and-memory-tradeoffs.mdx'),
    },
    {
      slug: "cost-of-ml",
      title: "The computational cost of ML operations",
      summary: "Counting the work in matrix multiplication, dense and conv layers, k-NN, trees and attention, at training and at inference.",
      minutes: 18,
      objectives: ["You can compute the multiply-adds of a matrix product (m×n)(n×p)", "You can compare training and prediction costs of k-NN, trees and linear models", "You can estimate the cost of attention and convolution layers"],
      load: () => import('./cost-of-ml.mdx'),
    },
    {
      slug: "designing-ml-solutions",
      title: "Designing an ML solution under constraints",
      summary: "Framing the problem, picking a baseline and a model family for the data type, and trading accuracy against latency, size and cost with quantisation and distillation.",
      minutes: 20,
      objectives: ["You can match data types to strong default models (tabular → gradient boosting, images → pretrained CNN/ViT, text → pretrained Transformer)", "You can choose a metric and baseline for a business problem", "You can choose compression techniques for edge deployment", "You can reason about accuracy-latency-cost trade-offs"],
      load: () => import('./designing-ml-solutions.mdx'),
    },
  ],
}

export default mod
