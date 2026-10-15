import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'debugging-and-diagnosis.pytorch-gotchas.1',
    prompt: 'What does this code print?',
    code: 'import torch\nw = torch.tensor(1.0, requires_grad=True)\nfor _ in range(2):\n    loss = 5 * w\n    loss.backward()\nprint(w.grad)',
    options: ['`tensor(5.)`', '`tensor(10.)`', '`tensor(0.)`', 'A `RuntimeError`, because backward() is called twice'],
    answer: 1,
    explanation:
      'Each pass builds a fresh graph, so calling backward() twice is allowed. The gradient of $5w$ is 5, and `backward()` adds it to `w.grad` without clearing it: $5 + 5 = 10$. That is why a training loop needs `optimizer.zero_grad()` every step. The error only appears if you call backward() twice on the *same* loss tensor.',
    difficulty: 'beginner',
  },
  {
    id: 'debugging-and-diagnosis.pytorch-gotchas.2',
    prompt: 'A model trained with this custom loss runs without any error, but its accuracy never improves. Why?',
    code: 'def my_loss(pred, y):\n    l = ((pred - y) ** 2).mean().item()\n    return torch.tensor(l, requires_grad=True)',
    options: [
      '`.item()` returns a plain Python number, which cuts the graph',
      '`requires_grad=True` freezes the loss, so backward() skips it',
      'Mean squared error cannot be used for training a neural network',
      '`torch.tensor` moves the loss to the CPU, away from the model\'s GPU',
    ],
    answer: 0,
    explanation:
      '`.item()` returns a plain float with no history. The new tensor has `requires_grad=True`, so `backward()` runs, but the graph stops at that tensor: every weight\'s `.grad` stays `None` and `optimizer.step()` changes nothing. Return `((pred - y) ** 2).mean()` directly.',
    difficulty: 'intermediate',
  },
  {
    id: 'debugging-and-diagnosis.pytorch-gotchas.3',
    prompt: 'This model trains on a GPU server but crashes on a laptop without a GPU. Which change makes it run on both?',
    code: 'class Net(nn.Module):\n    def forward(self, x):\n        x = x.cuda()\n        return self.fc(x)',
    options: [
      'Remove `x.cuda()`; choose `device` once with `torch.cuda.is_available()` and move the model and each batch with `.to(device)`',
      'Replace `x.cuda()` with `x.cpu()` in `forward`, so that the whole model always runs on the CPU on every machine',
      'Wrap the body of `forward` in `torch.no_grad()`, so that no GPU memory has to be allocated for the computation',
      'Call `model.eval()` before running the model on the laptop, so that it switches to its CPU inference mode',
    ],
    answer: 0,
    explanation:
      'A model should not decide its own device. Choose `device = "cuda" if torch.cuda.is_available() else "cpu"` once, then `model.to(device)` and `x = x.to(device)` in the loop. Hard-coding `.cpu()` runs everywhere but throws the GPU away, and neither `no_grad()` nor `eval()` has anything to do with devices.',
    difficulty: 'intermediate',
  },
  {
    id: 'debugging-and-diagnosis.pytorch-gotchas.4',
    prompt: 'You fine-tune a pretrained network for 5 classes. After training, the new `fc` layer\'s weights are exactly the same as when it was created. What is the most likely cause?',
    code: 'for p in model.parameters():\n    p.requires_grad = False\noptimizer = torch.optim.Adam(model.parameters(), lr=1e-3)\nmodel.fc = nn.Linear(512, 5)\n# ... training loop ...',
    options: [
      'The new `fc` layer still has `requires_grad = False` from the loop above',
      'The optimiser was built before the new `fc` existed, so it does not hold it',
      'Adam cannot update a layer that comes after frozen layers in the network',
      'The learning rate of $10^{-3}$ is far too small for a freshly created layer',
    ],
    answer: 1,
    explanation:
      'An optimiser keeps the parameter tensors it was given when it was created. `nn.Linear(512, 5)` makes brand-new tensors (with `requires_grad=True`, so they do get gradients), but the optimiser never sees them. Create the optimiser after replacing the head, from `[p for p in model.parameters() if p.requires_grad]`.',
    difficulty: 'intermediate',
  },
  {
    id: 'debugging-and-diagnosis.pytorch-gotchas.5',
    prompt: 'GPU memory use rises a little after every training step until the run crashes with "CUDA out of memory". Which tool helps you confirm the leak, and which line is the usual culprit?',
    options: [
      '`torch.autograd.set_detect_anomaly(True)`; the culprit is a NaN that appears in the loss',
      '`torch.cuda.memory_allocated()` every few hundred steps; the culprit is `total += loss`',
      '`torch.profiler` sorted by CPU time; the culprit is a learning rate that is far too high',
      '`model.eval()` before every step; the culprit is dropout keeping all its masks in memory',
    ],
    answer: 1,
    explanation:
      'If `memory_allocated()` climbs steadily instead of levelling off, tensors are being kept alive. `total += loss` adds a tensor that carries autograd history, so the history of every step stays in memory; `loss.item()` adds a plain number. Anomaly detection finds NaN, the profiler finds slow operations, and `eval()` changes layer behaviour.',
    difficulty: 'intermediate',
  },
]

export default questions
