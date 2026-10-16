import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'training-deep-networks.stability-and-scale.1',
    prompt:
      'A tiny network has two parameter tensors with gradients $[3, 0]$ and $[4]$. You call `clip_grad_norm_(params, max_norm=1.0)`. What are the gradients afterwards?',
    options: ['$[0.6, 0]$ and $[0.8]$', '$[1, 0]$ and $[1]$', '$[0.43, 0]$ and $[0.57]$', '$[3, 0]$ and $[4]$'],
    answer: 0,
    explanation:
      'The global norm covers every parameter: $\\sqrt{3^2 + 0^2 + 4^2} = 5$. Since $5 > 1$, everything is multiplied by $\\frac{1}{5}$, giving $[0.6, 0]$ and $[0.8]$, still pointing the same way. $[1, 0]$ and $[1]$ is clipping by value (or clipping each tensor separately), and $[0.43, 0]$, $[0.57]$ divides by the sum $3 + 4 = 7$ instead of the length.',
    difficulty: 'beginner',
  },
  {
    id: 'training-deep-networks.stability-and-scale.2',
    prompt: 'Why does training in BF16 usually need no loss scaling, while training in FP16 does?',
    options: [
      'BF16 has 8 exponent bits like FP32, so it covers the same tiny and huge values; FP16 has only 5, so small gradients underflow to 0',
      'BF16 has more mantissa bits than FP16, so it stores every number with more significant digits and small gradients keep their value',
      'BF16 stores each number in 32 bits, the same as FP32, so it has exactly the same range and precision as single precision',
      'BF16 is used just for the forward pass, while the backward pass runs entirely in FP32, so the gradients are not stored in 16 bits',
    ],
    answer: 0,
    explanation:
      "Range comes from the exponent. BF16 keeps FP32's 8 exponent bits, so values down to about $10^{-38}$ (and below) survive, while FP16's 5 exponent bits stop at about $6 \\times 10^{-8}$. BF16 pays with **fewer** mantissa bits (7 versus FP16's 10), so it is less precise, not more. It is a 16-bit format, and under autocast the backward pass computes in it too.",
    difficulty: 'intermediate',
  },
  {
    id: 'training-deep-networks.stability-and-scale.3',
    prompt:
      'In this mixed-precision loop, the loss is scaled by a GradScaler whose scale is $65\\,536$. What goes wrong because `scaler.unscale_(optimiser)` is missing before the clip?',
    code: 'with torch.autocast("cuda", dtype=torch.float16):\n    loss = criterion(model(x), y)\nscaler.scale(loss).backward()\ntorch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)\nscaler.step(optimiser)\nscaler.update()',
    options: [
      'The clip sees gradients 65,536 times too big, so nearly every step is cut far below its real size and training crawls',
      'Nothing goes wrong: clipping keeps the direction of the gradient, so the scale factor cancels out completely in the update',
      'The gradients are never divided by 65,536 at all, so every update is 65,536 times too large and training diverges',
      'The clip turns the FP16 gradients into FP32, so the GradScaler can no longer detect inf values and stops skipping steps',
    ],
    answer: 0,
    explanation:
      'Until `unscale_` divides by $S$, every `.grad` is $S = 65\\,536$ times too big. A true norm of 0.5 looks like $32\\,768$, far above 1.0, so the clip shrinks it to length 1, and `scaler.step` then divides by $S$: the real gradient used has length $1/65\\,536 \\approx 0.000015$ instead of 0.5. `scaler.step` still unscales, so updates are never too large; the problem is the meaningless threshold.',
    difficulty: 'advanced',
  },
  {
    id: 'training-deep-networks.stability-and-scale.4',
    prompt:
      'A model was tuned with batch size 128 and learning rate 0.1. You now train it on 4 GPUs, each with micro-batches of 16 and 8 gradient-accumulation steps. What is the effective batch size, and what learning rate does the linear scaling rule suggest?',
    options: ['512, with learning rate 0.4', '128, with learning rate 0.1', '512, with learning rate 0.1', '512, with learning rate 0.025'],
    answer: 0,
    explanation:
      'Effective batch $= 16 \\times 8 \\times 4 = 512$, which is $4\\times$ the original 128. Linear scaling multiplies the learning rate by the same factor: $0.1 \\times 4 = 0.4$, ramped up with a warm-up. Forgetting the GPUs gives $16 \\times 8 = 128$; keeping 0.1 ignores the rule; 0.025 scales the wrong way.',
    difficulty: 'intermediate',
  },
  {
    id: 'training-deep-networks.stability-and-scale.5',
    prompt:
      'A team trains an image model with a batch of 32,768 using linear learning-rate scaling and warm-up, but accuracy is clearly worse than at batch 1,024 and some layers become unstable. Which change is designed for exactly this situation?',
    options: [
      'Switch to LARS, which scales each layer\'s step by the ratio of that layer\'s weight norm to its gradient norm',
      'Add gradient accumulation over 8 micro-batches, so that each update averages the gradients of even more examples',
      'Switch from BF16 to FP16 with a GradScaler, so that the small gradients of the unstable layers stop underflowing',
      'Raise the learning rate a further 32 times, so that the run takes the same number of steps as the batch-1,024 run',
    ],
    answer: 0,
    explanation:
      'Beyond a few thousand examples per batch, one global learning rate is too big for some layers and too small for others. LARS (and LAMB, its Adam version) multiplies each layer\'s step by $\\lVert w_l \\rVert / \\lVert g_l \\rVert$, so every layer moves by a similar fraction of its size. Accumulation would make the batch even bigger, FP16 has a smaller range than BF16, and a larger learning rate makes the instability worse.',
    difficulty: 'advanced',
  },
]

export default questions
