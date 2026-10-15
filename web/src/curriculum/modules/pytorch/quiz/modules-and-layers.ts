import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'pytorch.modules-and-layers.1',
    prompt: 'What happens when the last line runs?',
    code: 'class Net(nn.Module):\n    def __init__(self):\n        self.fc = nn.Linear(4, 2)\n\n    def forward(self, x):\n        return self.fc(x)\n\nmodel = Net()',
    options: [
      '`AttributeError: cannot assign module before Module.__init__() call`',
      'It runs, but `list(model.parameters())` is empty, so the optimiser has nothing to train',
      'It runs normally, because Python calls `nn.Module.__init__` automatically for every subclass',
      '`TypeError`, because `forward` must be called once inside `__init__` to build the layers',
    ],
    answer: 0,
    explanation:
      '`super().__init__()` is missing. It is `nn.Module.__init__` that creates the registries for sub-modules and parameters, and Python does not call a parent’s `__init__` for you when the child defines its own. So the first assignment of a module, `self.fc = nn.Linear(4, 2)`, has nowhere to go and fails while the model is being built. An empty parameter list is what you get from storing layers in a plain Python list, a different bug.',
    difficulty: 'beginner',
  },
  {
    id: 'pytorch.modules-and-layers.2',
    prompt:
      'For `model = nn.Sequential(nn.Linear(10, 32), nn.ReLU(), nn.Linear(32, 4))`, what is `model[2].weight.shape`, and how many parameters does the whole model have?',
    options: ['`(4, 32)` and 484', '`(32, 4)` and 484', '`(4, 32)` and 448', '`(32, 4)` and 448'],
    answer: 0,
    explanation:
      '`nn.Linear(in, out)` stores its weight as `(out, in)`, so `model[2].weight` is `(4, 32)`. Parameters: first layer $10 \\times 32 + 32 = 352$, ReLU none, last layer $32 \\times 4 + 4 = 132$, total $352 + 132 = 484$. 448 counts only the weights and forgets the $32 + 4 = 36$ biases.',
    difficulty: 'beginner',
  },
  {
    id: 'pytorch.modules-and-layers.3',
    prompt: 'Why should you run a model with `model(x)` rather than `model.forward(x)`?',
    options: [
      '`model(x)` goes through `nn.Module`’s call method, which runs `forward` and also any hooks attached to the model',
      '`model(x)` also calls `loss.backward()` at the end, so the gradients are ready as soon as the forward pass ends',
      '`model.forward(x)` uses the weights created in `__init__` and ignores every update the optimiser has made since',
      '`model(x)` switches the model to eval mode automatically, while `model.forward(x)` leaves it in training mode',
    ],
    answer: 0,
    explanation:
      'Calling the module runs `forward` inside a wrapper that also runs any registered hooks (used by tools that record activations, prune or quantise). `model.forward(x)` usually gives the same numbers but silently skips them. Neither form computes gradients (that needs a loss and `backward()`), both use the current weights, and only `model.eval()` changes the mode.',
    difficulty: 'intermediate',
  },
  {
    id: 'pytorch.modules-and-layers.4',
    prompt:
      'You trained `Net(hidden=128)` and saved it with `torch.save(model.state_dict(), "net.pt")`. In a new notebook you run `model = Net(hidden=64)` and then `model.load_state_dict(torch.load("net.pt"))`. What happens?',
    options: [
      'A `RuntimeError` that reports a size mismatch for each tensor whose shape depends on `hidden`',
      'The first 64 hidden units are loaded and the remaining 64 saved units are skipped with a warning',
      'The model is rebuilt with 128 hidden units to match the file, and then the weights are loaded',
      'It loads without an error, but the predictions are random until the model has been trained again',
    ],
    answer: 0,
    explanation:
      'A state_dict is only named tensors; `load_state_dict` matches them by name and checks every shape. With `hidden=64` the first layer’s weight is `(64, in)` but the file holds `(128, in)`, so PyTorch raises `Error(s) in loading state_dict` with a `size mismatch for …` line per affected tensor. It never crops or resizes, because the file holds no code: you must rebuild exactly the class you trained.',
    difficulty: 'intermediate',
  },
  {
    id: 'pytorch.modules-and-layers.5',
    prompt:
      'A Transformer module needs a fixed positional-encoding table `pe` (computed once with sines and cosines, never learned). It must move to the GPU with `model.to(device)` and be saved in the state_dict. Which line belongs in `__init__`?',
    options: ["`self.register_buffer('pe', pe)`", '`self.pe = nn.Parameter(pe)`', '`self.pe = pe`', '`self.pe = pe.cuda()`'],
    answer: 0,
    explanation:
      'A buffer is saved in the state_dict and moved by `.to(device)`, but it is not a parameter, so the optimiser never changes it. `nn.Parameter` would hand the table to the optimiser and training would change it. A plain attribute is neither saved nor moved, so it stays on the CPU and causes a device error. `.cuda()` hard-codes one device (it fails on a CPU-only machine) and still is not saved.',
    difficulty: 'intermediate',
  },
]

export default questions
