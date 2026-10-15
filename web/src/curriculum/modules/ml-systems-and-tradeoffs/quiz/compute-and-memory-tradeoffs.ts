import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'ml-systems-and-tradeoffs.compute-and-memory-tradeoffs.1',
    prompt: 'What does **activation (gradient) checkpointing** trade?',
    options: [
      'Less activation memory, paid for with about one extra forward pass of compute',
      'Less compute, paid for with extra memory to store every activation',
      'Less weight memory, paid for by storing the weights in 16 bits',
      'Safety against crashes, paid for with time spent saving the model to disk',
    ],
    answer: 0,
    explanation:
      'Checkpointing keeps only some activations during the forward pass and recomputes the rest when the backward pass needs them: less memory, about one extra forward pass of compute (a step costs about 4 units instead of 3), and exactly the same gradients. Storing weights in 16 bits is mixed precision, and saving a model to disk to resume training is a different use of the word "checkpoint".',
    difficulty: 'beginner',
  },
  {
    id: 'ml-systems-and-tradeoffs.compute-and-memory-tradeoffs.2',
    prompt:
      'A recipe was tuned on 1 GPU with batch 64 and learning rate 0.1. You now train on 8 GPUs with 32 examples per GPU and accumulate gradients over 2 micro-batches per update. Using the linear scaling rule, what learning rate should you use?',
    options: ['0.8', '0.4', '1.6', '0.1'],
    answer: 0,
    explanation:
      'Effective batch $= 8 \\times 32 \\times 2 = 512$, which is $512/64 = 8$ times the tuned batch, so the learning rate becomes $0.1 \\times 8 = 0.8$ (reached after a warm-up). Forgetting the accumulation gives $256/64 = 4$ and 0.4; multiplying by GPUs × accumulation steps ($8 \\times 2 = 16$) without noticing that each GPU takes 32 examples, not 64, gives 1.6.',
    difficulty: 'intermediate',
  },
  {
    id: 'ml-systems-and-tradeoffs.compute-and-memory-tradeoffs.3',
    prompt:
      'Training needs 2 GB for weights, gradients and optimiser state plus 20 GB of activations, on a 16 GB GPU with Tensor Cores. You must keep the effective batch size and want the highest throughput. Which **single** change is best?',
    options: [
      'Mixed precision, which roughly halves activations to about 10 GB and speeds up the matrix maths',
      'Activation checkpointing, which cuts activations to a few GB but adds about one forward pass of compute',
      'Halving the batch size with no accumulation, which halves activations to about 10 GB',
      'Calling `torch.cuda.empty_cache()` after every backward pass to free the activations',
    ],
    answer: 0,
    explanation:
      'With mixed precision the total is about $2 + 10 = 12$ GB, which fits, the batch is unchanged, and Tensor Cores make it faster. Checkpointing also fits but makes each step about a third more expensive. Halving the batch without accumulation changes the effective batch, which was not allowed. `empty_cache()` only releases cached memory that is not in use, so it cannot remove activations the backward pass still needs.',
    difficulty: 'intermediate',
  },
  {
    id: 'ml-systems-and-tradeoffs.compute-and-memory-tradeoffs.4',
    prompt:
      '`nvidia-smi` shows the GPU busy only about 30% of the time. The `DataLoader` uses `num_workers=0`, and every batch is decoded from JPEG and heavily augmented on the CPU. What is the most effective first fix?',
    options: [
      'Raise `num_workers` so the CPU prepares batches in parallel',
      'Switch to a GPU with twice the compute, since the current one is too slow',
      'Turn on mixed precision so that each GPU step finishes sooner',
      'Increase the learning rate so the model needs fewer steps',
    ],
    answer: 0,
    explanation:
      'The GPU is waiting for data: with 0 workers the main process prepares each batch while the GPU sits idle. More workers prepare batches in parallel, so the step time drops towards the GPU\'s own time; `pin_memory=True` also speeds up the copy to the GPU. A faster GPU or mixed precision only shortens the part that is already waiting, and the learning rate does not change how fast batches are produced.',
    difficulty: 'beginner',
  },
  {
    id: 'ml-systems-and-tradeoffs.compute-and-memory-tradeoffs.5',
    prompt: 'In data-parallel training (PyTorch DDP) on 4 GPUs, what happens in every training step?',
    options: [
      'Each GPU has a full model copy and its own slice of the batch; gradients are averaged before one identical update',
      'Each GPU holds a different quarter of the layers, and activations are passed from GPU to GPU along the network',
      'Each GPU trains its own model on its own data, and the weights are averaged once at the end of every epoch',
      'Each GPU computes gradients on the whole batch, and only GPU 0 applies the update and stores the weights',
    ],
    answer: 0,
    explanation:
      'DDP keeps a full copy of the model on every GPU, splits each batch between them, and uses an all-reduce to average the gradients so every GPU applies the same update and the copies stay identical. Splitting the layers across GPUs is model (pipeline) parallelism, used when a model is too big for one GPU. Averaging weights only once per epoch would let the copies drift apart in between.',
    difficulty: 'beginner',
  },
]

export default questions
