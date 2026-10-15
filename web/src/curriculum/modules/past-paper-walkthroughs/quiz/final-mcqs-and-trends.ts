import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'past-paper-walkthroughs.final-mcqs-and-trends.1',
    prompt:
      'This loop accumulates gradients over 8 micro-batches but never divides the loss. Compared with training on one real batch 8 times as large, the gradient used at each optimiser step is:',
    code: 'accumulation_steps = 8\nfor i, (x, y) in enumerate(loader):\n    loss = criterion(model(x), y)   # mean over the micro-batch\n    loss.backward()\n    if (i + 1) % accumulation_steps == 0:\n        optimiser.step()\n        optimiser.zero_grad()',
    options: [
      '8 times too large, since .backward() always adds onto .grad',
      'Exactly right, because .backward() averages its calls automatically',
      '8 times too small, because each micro-batch holds 1/8 of the data',
      'Zero, because the gradients are cleared after each micro-batch',
    ],
    answer: 0,
    explanation:
      'Each `.backward()` adds onto `.grad`, and `zero_grad()` only runs after every 8th micro-batch, so the step uses the **sum** of 8 mean-gradients: 8 times the gradient of one big batch (with plain SGD, the same effect as an 8× learning rate). Dividing each loss by `accumulation_steps` turns the sum into the average. PyTorch never averages across separate `.backward()` calls.',
    difficulty: 'intermediate',
  },
  {
    id: 'past-paper-walkthroughs.final-mcqs-and-trends.2',
    prompt: 'This loop is meant to minimise $(w - 3)^2$ by gradient descent. What does it print (approximately)?',
    code: 'w, lr = 0.0, 0.1\nfor step in range(50):\n    grad = 2 * (w - 3)      # derivative of (w - 3)**2\n    w = w + lr * grad\nprint(w)',
    options: [
      'A large negative number: w moves further away from 3 with each step',
      'About 3.0: gradient descent has converged to the minimum',
      'About 0.0: the learning rate is too small for w to move',
      'A value that keeps alternating between roughly 2.9 and 3.1',
    ],
    answer: 0,
    explanation:
      'The update has the wrong sign: descent needs `w = w - lr * grad`. With `+`, the distance to 3 is multiplied by $1 + 2 \\times 0.1 = 1.2$ every step: $w - 3$ starts at $-3$, so after 50 steps it is $-3 \\times 1.2^{50} \\approx -27{,}300$ (running the code prints about $-27298$). Converging to 3 would need the minus sign; alternating around 3 happens when the learning rate is too big with the correct sign.',
    difficulty: 'intermediate',
  },
  {
    id: 'past-paper-walkthroughs.final-mcqs-and-trends.3',
    prompt: 'The goal is to standardise each of the 10 features (columns). What happens when this runs?',
    code: 'x = torch.randn(32, 10)    # 32 examples, 10 features\nmean = x.mean(dim=0)\nstd = x.std(dim=1)\nx_norm = (x - mean) / std',
    options: [
      'A shape error: `std` has shape (32,), which cannot broadcast against `x`\'s shape (32, 10)',
      'It runs correctly, because broadcasting matches `std` to the rows of `x`',
      'It runs, but `mean` should use `dim=1` so that it matches `std`',
      'It runs, but each example is divided by its own std instead of each feature',
    ],
    answer: 0,
    explanation:
      '`x.mean(dim=0)` averages down the rows, giving one mean per feature, shape (10,), which is right. `x.std(dim=1)` gives one value per example, shape (32,). Broadcasting aligns trailing dimensions, so (32, 10) against (32,) compares 10 with 32 and PyTorch raises a RuntimeError; it never quietly matches (32,) to the rows, which would need shape (32, 1). The fix is `x.std(dim=0)`; moving the mean to `dim=1` would only make the subtraction fail as well.',
    difficulty: 'intermediate',
  },
  {
    id: 'past-paper-walkthroughs.final-mcqs-and-trends.4',
    prompt: 'How did the MCQ section change from NOAI 2025 to the 2026 Final?',
    options: [
      'From one-fact definitions to code snippets decided by one line',
      'From code-reading questions to one-fact definitions with short answers',
      'It kept one-fact definitions but doubled the number of questions to 40',
      'The 2026 Final dropped its MCQs and kept only the three programming tasks',
    ],
    answer: 0,
    explanation:
      'In 2025, 14 of the 20 MCQs were short definitions ("What is the primary function of pooling layers?"). In the 2026 Final, 18 of the 20 showed a code snippet and asked which line must change, what the bug is or why a line is needed. The Final still had 20 MCQs worth 20 of its 100 marks.',
    difficulty: 'beginner',
  },
  {
    id: 'past-paper-walkthroughs.final-mcqs-and-trends.5',
    prompt:
      'Your per-class IoU function returns `inter / union`, and the mean IoU over 5 classes sometimes comes out as `nan`, but only on images where one class is missing. What is the most likely cause?',
    options: [
      'A class missing from both prediction and target always gives 0/0',
      'The learning rate is too high, so the predicted class indices became NaN',
      'Integer division rounds each IoU below 1 down to 0 before averaging',
      'IoU is undefined on class indices and needs softmax probabilities',
    ],
    answer: 0,
    explanation:
      'When a class appears in neither mask, intersection and union are both 0, and $0/0$ is `nan`, which then poisons the mean. Handle the edge case explicitly: skip that class (return `nan` and average with `np.nanmean`), as 2026 Final Q13 keyed. Class indices from `argmax` are integers and cannot be NaN, Python 3 and PyTorch division are true division, and IoU is defined on hard class masks.',
    difficulty: 'beginner',
  },
]

export default questions
