import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'pytorch.devices-and-common-errors.1',
    prompt: 'A training script raises `RuntimeError: mat1 and mat2 shapes cannot be multiplied (32x512 and 256x10)` at the line `logits = self.fc(x)`. Which definition of `self.fc` fixes it?',
    options: ['`nn.Linear(512, 10)`', '`nn.Linear(256, 10)`', '`nn.Linear(32, 10)`', '`nn.Linear(10, 512)`'],
    answer: 0,
    explanation:
      'mat1 is the input: 32 examples with 512 features each. mat2 is the layer\'s weight transposed, $(\\text{in\\_features} \\times \\text{out\\_features}) = 256 \\times 10$. The inner numbers must match, so `in_features` must be 512: `nn.Linear(512, 10)`. 256 is what the layer currently expects, and 32 is the batch size, which a layer never depends on.',
    difficulty: 'intermediate',
  },
  {
    id: 'pytorch.devices-and-common-errors.2',
    prompt: 'On a GPU machine, this loop raises `Expected all tensors to be on the same device`. Why?',
    code: "device = 'cuda' if torch.cuda.is_available() else 'cpu'\nmodel = model.to(device)\nfor inputs, targets in loader:\n    inputs.to(device)\n    targets.to(device)\n    outputs = model(inputs)\n    loss = criterion(outputs, targets)",
    options: [
      '`tensor.to()` returns a moved copy that is never stored, so `inputs` and `targets` stay on the CPU',
      '`model.to(device)` must be called inside the loop on every batch',
      'The `DataLoader` puts batches on the GPU, so the extra `.to(device)` calls move them back to the CPU',
      '`torch.cuda.is_available()` returns a string, so `device` is set incorrectly',
    ],
    answer: 0,
    explanation:
      'For tensors, `.to()` is not in place: it returns a new tensor on the target device. The fix is `inputs = inputs.to(device)` (and the same for `targets`). The model only needs moving once, and its `.to()` works in place. DataLoaders produce CPU tensors, and `is_available()` returns `True` or `False`.',
    difficulty: 'beginner',
  },
  {
    id: 'pytorch.devices-and-common-errors.3',
    prompt: 'Roughly how much GPU memory do the weights, gradients and Adam optimiser state of a 500-million-parameter model take when training in FP32 (4 bytes per number), before counting activations?',
    options: ['8 GB', '2 GB', '4 GB', '6 GB'],
    answer: 0,
    explanation:
      'Per parameter: 4 bytes of weight + 4 bytes of gradient + 8 bytes for Adam\'s two running averages = 16 bytes. $16 \\times 500$ million $= 8000$ million bytes $= 8$ GB. 2 GB counts the weights only, 4 GB forgets Adam\'s state, and 6 GB counts only one of Adam\'s two averages.',
    difficulty: 'intermediate',
  },
  {
    id: 'pytorch.devices-and-common-errors.4',
    prompt: 'Training with batch size 64 raises `CUDA out of memory`. You want to keep the same effective batch size of 64. Which change does that?',
    options: [
      'Batch size 32 with gradient accumulation over 2 steps',
      'Batch size 64 with SGD + momentum replaced by Adam',
      'Batch size 128 with half as many epochs',
      'Batch size 64 with `torch.cuda.empty_cache()` after every step',
    ],
    answer: 0,
    explanation:
      'Activations grow with the batch size, so halving it roughly halves activation memory; accumulating 2 micro-batches of 32 before each `step()` gives the same 64-example gradient. Adam needs *more* memory than SGD with momentum, a larger batch needs more, and `empty_cache()` only returns cached memory that PyTorch is not using, so the step still needs the same amount.',
    difficulty: 'intermediate',
  },
  {
    id: 'pytorch.devices-and-common-errors.5',
    prompt: 'You freeze a pretrained backbone and build `optimizer = Adam([p for p in model.parameters() if p.requires_grad])`. After 5 epochs you unfreeze the last backbone block with `requires_grad_(True)` and keep training. That block\'s weights never change. Why?',
    options: [
      'The optimiser only updates the tensors it was built with, and the block was not among them',
      'Gradients cannot flow through a block once it has been frozen, even after it is unfrozen',
      'Unfreezing only takes effect after the next call to `model.train()`, which re-reads `requires_grad`',
      'Adam skips parameters whose gradients are much smaller than those of the new head',
    ],
    answer: 0,
    explanation:
      'The block now receives gradients, but the optimiser was built from the trainable parameters at that time, so it does not hold the block and `step()` never touches it. No error is raised. Rebuild the optimiser or use `optimizer.add_param_group(...)`. `requires_grad_` takes effect immediately, gradients do flow through unfrozen layers, and Adam never skips a parameter for having small gradients.',
    difficulty: 'advanced',
  },
]

export default questions
