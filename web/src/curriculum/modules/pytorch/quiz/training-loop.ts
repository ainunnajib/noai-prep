import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'pytorch.training-loop.1',
    prompt: 'Which order of lines is a correct PyTorch training step?',
    options: [
      '`optimizer.zero_grad()`, `outputs = model(x)`, `loss = criterion(outputs, y)`, `loss.backward()`, `optimizer.step()`',
      '`outputs = model(x)`, `loss = criterion(outputs, y)`, `optimizer.step()`, `loss.backward()`, `optimizer.zero_grad()`',
      '`optimizer.zero_grad()`, `outputs = model(x)`, `loss = criterion(outputs, y)`, `optimizer.step()`, `loss.backward()`',
      '`outputs = model(x)`, `loss = criterion(outputs, y)`, `loss.backward()`, `optimizer.zero_grad()`, `optimizer.step()`',
    ],
    answer: 0,
    explanation:
      'Gradients must be cleared, then computed by `backward()`, and only then applied by `step()`. Calling `step()` before `backward()` uses old (or no) gradients, and `zero_grad()` between `backward()` and `step()` wipes the gradients just before they are needed, so the weights never move.',
    difficulty: 'beginner',
  },
  {
    id: 'pytorch.training-loop.2',
    prompt: 'A model has one weight $w$ with `w.grad` equal to $-10$ after the first batch. The training loop has no `optimizer.zero_grad()`. The second batch\'s own gradient is $-5$. What is `w.grad` when `optimizer.step()` runs in the second iteration?',
    options: ['$-15$', '$-5$', '$-10$', '$-7.5$'],
    answer: 0,
    explanation:
      '`loss.backward()` adds the new gradient to whatever `.grad` already holds: $-10 + (-5) = -15$. Only `zero_grad()` would have reset it so that the step used $-5$. PyTorch never averages old and new gradients ($-7.5$) on its own.',
    difficulty: 'intermediate',
  },
  {
    id: 'pytorch.training-loop.3',
    prompt: 'A training set has 1,000 examples and the `DataLoader` uses `batch_size=64` and `drop_last=False`. How many weight updates happen in 3 epochs?',
    options: ['48', '45', '15', '3'],
    answer: 0,
    explanation:
      '$64 \\times 15 = 960$, leaving 40 examples for a 16th, smaller batch, so one epoch is $\\lceil 1000/64 \\rceil = 16$ iterations and 3 epochs give $3 \\times 16 = 48$ updates. 45 forgets the final partial batch (that would be `drop_last=True`), and 3 confuses epochs with updates.',
    difficulty: 'intermediate',
  },
  {
    id: 'pytorch.training-loop.4',
    prompt: 'A student validates a model that contains Dropout, wrapping the code in `with torch.no_grad():` but never calling `model.eval()`. What happens?',
    options: [
      'Dropout stays on, so the validation scores are noisy and unreliable',
      '`torch.no_grad()` switches the model into eval mode, so the results are correct',
      'PyTorch raises an error because Dropout cannot run without gradients',
      'The weights keep being updated during validation because the model is in train mode',
    ],
    answer: 0,
    explanation:
      '`torch.no_grad()` only stops autograd recording the graph; it does not touch the `model.training` flag that Dropout and BatchNorm read. So dropout stays on and validation is noisy. No error is raised, and weights only change when `optimizer.step()` is called, which validation code never does.',
    difficulty: 'intermediate',
  },
  {
    id: 'pytorch.training-loop.5',
    prompt: 'Only micro-batches of 16 fit in GPU memory, but you want each update to use the gradient of 64 examples. Which loop does that?',
    code: 'optimizer.zero_grad()\nfor i, (x, y) in enumerate(loader):        # batches of 16\n    loss = criterion(model(x), y) / K\n    loss.backward()\n    if (i + 1) % K == 0:\n        optimizer.step()\n        optimizer.zero_grad()',
    options: [
      'The code shown with `K = 4`',
      'The code shown with `K = 64`',
      'The code shown with `K = 4`, but without dividing the loss by `K`',
      'The code shown with `K = 4`, but with `optimizer.zero_grad()` moved to just before `loss.backward()`',
    ],
    answer: 0,
    explanation:
      '$16 \\times 4 = 64$, so accumulate 4 micro-batches and divide each mean loss by 4 so the summed gradient equals the mean over 64 examples. Without the division the gradient is 4 times too large. Zeroing before every `backward()` would throw away the first three micro-batches, leaving an ordinary batch of 16.',
    difficulty: 'advanced',
  },
]

export default questions
