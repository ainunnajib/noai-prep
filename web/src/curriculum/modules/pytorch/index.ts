import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "pytorch",
  order: 22,
  part: "deep-learning",
  domain: "computing",
  title: "PyTorch: tensors to training loops",
  tagline: "The tool every IOAI task uses",
  summary: "Tensors and shape surgery including batched matrix products and choosing dim, autograd and why gradients accumulate, nn.Module, layers and saving with state_dict, the standard training loop with DataLoader and train/eval modes, devices, GPU memory and freezing layers.",
  prerequisites: ["backpropagation", "numpy"],
  syllabus: ["NOAI Computing: PyTorch, Debugging", "IOAI 1A5 PyTorch Basics", "IOAI 1A6 Tensor Manipulation", "IOAI 1A7 Training Models on CPU and GPU", "autograd, nn.Module, DataLoader, optimizer, state_dict, train/eval, no_grad, devices", "Batched matmul (B, h, T, d) @ (B, h, d, T), choosing dim for softmax, cat and argmax"],
  lessons: [
    {
      slug: "tensors",
      title: "Tensors and shape surgery",
      summary: "Creating tensors, dtypes, reshaping and transposing, batched matrix products and choosing the right dim.",
      minutes: 30,
      objectives: ["You can create tensors and predict their dtype", "You can transform shapes with view, reshape, unsqueeze, squeeze, permute and transpose", "You can read and build (N, C, H, W) image batches", "You can predict batched matmul shapes and choose the right dim for softmax, cat, mean and argmax"],
      load: () => import('./tensors.mdx'),
    },
    {
      slug: "autograd",
      title: "Autograd: automatic gradients",
      summary: "requires_grad, the recorded graph, backward(), accumulating .grad, zeroing gradients, no_grad and detach.",
      minutes: 20,
      objectives: ["You can compute gradients with backward()", "You can explain why .grad accumulates and must be zeroed", "You can use torch.no_grad(), .detach() and .item() correctly"],
      load: () => import('./autograd.mdx'),
    },
    {
      slug: "modules-and-layers",
      title: "nn.Module, layers and saving models",
      summary: "Writing a model class with __init__ and forward, nn.Linear shapes, nn.Sequential, parameters and state_dict.",
      minutes: 35,
      objectives: ["You can write an nn.Module subclass with layers in __init__ and computation in forward", "You can predict nn.Linear weight shapes and output shapes", "You can save and load a state_dict", "You can choose between nn.Parameter, register_buffer and a plain attribute"],
      load: () => import('./modules-and-layers.mdx'),
    },
    {
      slug: "training-loop",
      title: "The training loop",
      summary: "Dataset and DataLoader, the five essential lines of every training step, and train versus eval mode.",
      minutes: 25,
      objectives: ["You can write the standard training step in the right order", "You can explain what DataLoader batching and shuffling do", "You can explain model.train(), model.eval() and torch.no_grad() during validation", "You can implement gradient accumulation"],
      load: () => import('./training-loop.mdx'),
    },
    {
      slug: "devices-and-common-errors",
      title: "GPUs, devices and common PyTorch errors",
      summary: "Moving models and data to a device, device-mismatch and shape errors, CUDA out-of-memory, freezing layers, and reading PyTorch error messages.",
      minutes: 30,
      objectives: ["You can write device-agnostic code with .to(device)", "You can diagnose device-mismatch, dtype and shape errors from messages", "You can reduce GPU memory use (batch size, no_grad, mixed precision)", "You can freeze layers correctly"],
      load: () => import('./devices-and-common-errors.mdx'),
    },
  ],
}

export default mod
