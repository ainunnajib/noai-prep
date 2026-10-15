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
      summary: "The lifecycle loop and the MLOps tools that automate it, batch versus real-time serving, exporting with TorchScript, catching data and concept drift, and versioning everything needed to rebuild a model.",
      minutes: 30,
      objectives: ["You can describe the ML lifecycle loop and what an orchestrator, experiment tracker and model registry each do", "You can choose batch or real-time serving and explain why torch.jit.trace can freeze the wrong branch", "You can tell data drift from concept drift and say which monitoring signal shows each one first", "You can list everything that must be versioned to rebuild a past model exactly"],
      load: () => import('./lifecycle-and-deployment.mdx'),
    },
    {
      slug: "compute-and-memory-tradeoffs",
      title: "Compute and memory trade-offs in training",
      summary: "What fills GPU memory and the price of each out-of-memory fix, activation checkpointing, keeping the GPU fed with data, and data-parallel training across GPUs.",
      minutes: 35,
      objectives: ["You can choose an out-of-memory fix by weighing what each one costs in speed, memory and training behaviour", "You can explain what activation checkpointing saves and why it costs about one extra forward pass", "You can spot a GPU waiting for its data loader and fix it with more workers", "You can explain data-parallel training and scale the learning rate with the effective batch"],
      load: () => import('./compute-and-memory-tradeoffs.mdx'),
    },
    {
      slug: "cost-of-ml",
      title: "The computational cost of ML operations",
      summary: "Counting multiply-adds in matrix products and in dense, conv and attention layers, comparing training and prediction costs of k-NN, linear models and trees, and why Newton's method does not scale.",
      minutes: 30,
      objectives: ["You can count the multiply-adds of an (m × n) by (n × p) matrix product", "You can estimate the cost of convolution and attention layers and how attention grows with sequence length", "You can compare the training and prediction costs of k-NN, linear models and trees", "You can explain why the Hessian makes Newton's method too costly for large models"],
      load: () => import('./cost-of-ml.mdx'),
    },
    {
      slug: "designing-ml-solutions",
      title: "Designing an ML solution under constraints",
      summary: "Framing the problem with a metric and a baseline, strong default models for each data type, shrinking models with quantisation, pruning and distillation, and choosing on the accuracy-latency frontier.",
      minutes: 30,
      objectives: ["You can choose a metric and a trivial baseline that reflect what each kind of mistake costs", "You can pick a strong default model for tables, images, text and audio", "You can tell quantisation, pruning and distillation apart and work out the size quantisation saves", "You can pick the best model under a latency budget using the Pareto frontier"],
      load: () => import('./designing-ml-solutions.mdx'),
    },
  ],
}

export default mod
