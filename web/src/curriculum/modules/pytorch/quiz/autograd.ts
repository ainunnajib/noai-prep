import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'pytorch.autograd.1',
    prompt: 'What does this code print?',
    code: 'w = torch.tensor(3.0, requires_grad=True)\nx = torch.tensor(2.0)\nL = w ** 2 + x * w\nL.backward()\nprint(w.grad, x.grad)',
    options: ['`tensor(8.) None`', '`tensor(8.) tensor(3.)`', '`tensor(15.) None`', '`tensor(6.) None`'],
    answer: 0,
    explanation:
      '$\\frac{\\partial L}{\\partial w} = 2w + x = 2 \\times 3 + 2 = 8$. Only leaves with `requires_grad=True` get a `.grad`, so `x.grad` stays `None` even though $\\frac{\\partial L}{\\partial x} = w = 3$. 15 is the value of $L$ itself ($9 + 6$), and 6 forgets the $x \\cdot w$ term.',
    difficulty: 'beginner',
  },
  {
    id: 'pytorch.autograd.2',
    prompt: 'What is printed?',
    code: 'w = torch.tensor(1.0, requires_grad=True)\nfor i in range(3):\n    L = 5 * w\n    L.backward()\nprint(w.grad)',
    options: ['`tensor(15.)`', '`tensor(5.)`', '`tensor(0.)`', 'a RuntimeError, because `backward()` is called more than once'],
    answer: 0,
    explanation:
      'Each pass builds a fresh graph and contributes $\\frac{dL}{dw} = 5$, and PyTorch adds it to `.grad` instead of replacing it: $5 + 5 + 5 = 15$. There is no error, because every `backward()` runs on a new `L`; the error usually appears only when `backward()` is called twice on the same graph. Getting 5 each step would need `w.grad.zero_()` (or `optimizer.zero_grad()`) inside the loop.',
    difficulty: 'beginner',
  },
  {
    id: 'pytorch.autograd.3',
    prompt:
      'A student’s validation loop appends `loss` (the tensor returned by the loss function) to a list after every batch and never uses `torch.no_grad()`. GPU memory climbs with every batch until a CUDA out-of-memory error. What is the main cause?',
    options: [
      'Each stored loss tensor keeps its batch’s computational graph, with its saved activations, alive',
      'Without `optimizer.zero_grad()`, the `.grad` of every weight grows with each validation batch',
      'The list of Python floats becomes too large, because each float takes several megabytes',
      'Validation data is copied to the GPU twice, once for the model and once for the loss',
    ],
    answer: 0,
    explanation:
      'Outside `torch.no_grad()` every forward pass is recorded, and a loss tensor keeps a reference to its whole graph, including the activations saved for backward. Storing it keeps all of that alive for every batch. No `backward()` runs in validation, so `.grad` never changes, and the list does not hold Python floats at all; it would if the student had used `loss.item()`, which (with `no_grad`) is the fix.',
    difficulty: 'intermediate',
  },
  {
    id: 'pytorch.autograd.4',
    prompt: 'Which statement about `.item()` and `.detach()` is correct?',
    options: [
      '`.item()` returns a Python number from a one-element tensor; `.detach()` returns a tensor cut off from the graph',
      '`.item()` returns a tensor cut off from the graph; `.detach()` returns a Python number from a one-element tensor',
      '`.item()` moves a tensor to the CPU and keeps its graph; `.detach()` deletes the tensor to free GPU memory',
      '`.item()` and `.detach()` both return Python numbers, but only `.detach()` also frees the saved activations',
    ],
    answer: 0,
    explanation:
      '`loss.item()` gives a plain Python `float` (it fails on tensors with more than one element), which is what you log. `t.detach()` gives a **tensor** with the same numbers, sharing memory, but with `requires_grad=False` and no history, which is what you need before `.numpy()`. Neither deletes or moves anything.',
    difficulty: 'beginner',
  },
  {
    id: 'pytorch.autograd.5',
    prompt: 'In a hand-written gradient descent loop, why is the update `w -= lr * w.grad` placed inside `with torch.no_grad():`?',
    options: [
      'The update must not be recorded: PyTorch raises an error for an in-place change to a leaf that requires grad',
      'Inside `no_grad()` the gradients are zeroed automatically after the update, so `w.grad.zero_()` is no longer needed',
      'Outside `no_grad()` the subtraction would use float64, which does not match the float32 weights and raises a dtype error',
      'The update only reaches the GPU copy of `w` inside `no_grad()`; outside it, only the CPU copy of `w` would change',
    ],
    answer: 0,
    explanation:
      'Autograd would try to record the in-place subtraction on `w`, a leaf that requires grad, and stops with `RuntimeError: a leaf Variable that requires grad is being used in an in-place operation.` Inside `no_grad()` the change is plain bookkeeping. `no_grad()` never touches `.grad`, so you still zero it yourself, and it has nothing to do with dtypes or devices.',
    difficulty: 'intermediate',
  },
]

export default questions
