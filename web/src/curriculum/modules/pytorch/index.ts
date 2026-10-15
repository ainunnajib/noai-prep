import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "pytorch",
  order: 22,
  part: "deep-learning",
  domain: "computing",
  title: "PyTorch: tensors to training loops",
  tagline: "The deep-learning library of the NOAI Final and IOAI",
  summary: "Tensors and shape surgery (dtypes, batched matrix products, choosing dim), autograd and why gradients accumulate, nn.Module layers and saving with state_dict, the standard training loop with DataLoader, train/eval modes and gradient accumulation, then devices, reading error messages, GPU memory and freezing layers.",
  prerequisites: ["backpropagation", "numpy"],
  syllabus: ["NOAI Computing: PyTorch, Debugging", "IOAI 1A5 PyTorch Basics", "IOAI 1A6 Tensor Manipulation", "IOAI 1A7 Training Models on CPU and GPU", "autograd, nn.Module, DataLoader, optimizer, state_dict, train/eval, no_grad, devices", "Batched matmul (B, h, T, d) @ (B, h, d, T), choosing dim for softmax, cat and argmax"],
  lessons: [
    {
      slug: "tensors",
      title: "Tensors and shape surgery",
      summary: "Creating tensors and predicting their dtype, shape surgery for image batches, view versus reshape, batched matrix products, and choosing the right dim.",
      minutes: 30,
      objectives: ["You can create tensors and predict their dtype", "You can reshape tensors with view, reshape, unsqueeze, squeeze, permute and transpose, and explain when view refuses", "You can convert images between (H, W, C) and (N, C, H, W) batches", "You can predict batched matmul shapes and choose the right dim for softmax, cat, mean and argmax"],
      load: () => import('./tensors.mdx'),
    },
    {
      slug: "autograd",
      title: "Autograd: automatic gradients",
      summary: "requires_grad and the recorded graph, backward(), why .grad accumulates and must be zeroed, and switching tracking off with no_grad, detach and item.",
      minutes: 20,
      objectives: ["You can predict the gradient that backward() stores in each leaf's .grad", "You can explain why .grad accumulates and must be zeroed", "You can use torch.no_grad(), .detach() and .item() correctly"],
      load: () => import('./autograd.mdx'),
    },
    {
      slug: "modules-and-layers",
      title: "nn.Module, layers and saving models",
      summary: "Writing a model class with __init__ and forward, nn.Linear shapes, nn.Sequential, saving with state_dict, and parameters versus buffers.",
      minutes: 30,
      objectives: ["You can write an nn.Module subclass with layers in __init__ and computation in forward", "You can predict nn.Linear weight shapes and parameter counts", "You can save and load a state_dict and explain why loading can fail", "You can choose between nn.Parameter, register_buffer and a plain attribute"],
      load: () => import('./modules-and-layers.mdx'),
    },
    {
      slug: "training-loop",
      title: "The training loop",
      summary: "The five lines of every training step and their order, Dataset and DataLoader, train versus eval mode, and gradient accumulation.",
      minutes: 30,
      objectives: ["You can write the standard training step in the right order", "You can explain DataLoader batching and shuffling and count the updates in an epoch", "You can explain model.train(), model.eval() and torch.no_grad() during validation", "You can implement gradient accumulation"],
      load: () => import('./training-loop.mdx'),
    },
    {
      slug: "devices-and-common-errors",
      title: "GPUs, devices and common PyTorch errors",
      summary: "Moving models and data to a device, reading PyTorch error messages, what fills GPU memory and how to fix out-of-memory errors, and freezing layers for transfer learning.",
      minutes: 30,
      objectives: ["You can write device-agnostic code with .to(device)", "You can diagnose device-mismatch, dtype and shape errors from their messages", "You can estimate GPU memory for training and choose a fix for out-of-memory errors", "You can freeze layers and keep the optimiser in step with them"],
      load: () => import('./devices-and-common-errors.mdx'),
    },
  ],
}

export default mod
