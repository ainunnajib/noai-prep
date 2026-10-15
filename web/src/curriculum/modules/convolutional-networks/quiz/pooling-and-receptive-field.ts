import type { QuizQuestion } from '../../../types'

const M4 = '$\\begin{bmatrix} 2 & 0 & 1 & 3 \\\\ 4 & 1 & 0 & 2 \\\\ 0 & 6 & 2 & 2 \\\\ 1 & 3 & 5 & 1 \\end{bmatrix}$'
const m2 = (a: string, b: string, c: string, d: string) => `$\\begin{bmatrix} ${a} & ${b} \\\\ ${c} & ${d} \\end{bmatrix}$`

const questions: QuizQuestion[] = [
  {
    id: 'convolutional-networks.pooling-and-receptive-field.1',
    prompt: `2×2 **average** pooling with stride 2 is applied to this feature map. What is the output?\n\n${M4}`,
    options: [m2('1.75', '1.5', '2.5', '2.5'), m2('1.5', '1.75', '2.5', '2.5'), m2('4', '3', '6', '5'), m2('7', '6', '10', '10')],
    answer: 0,
    explanation:
      'Split the map into four 2×2 windows and take each mean: $(2+0+4+1)/4 = 1.75$, $(1+3+0+2)/4 = 1.5$, $(0+6+1+3)/4 = 2.5$, $(2+2+5+1)/4 = 2.5$. Averaging each row of four values instead of each 2×2 square gives $[1.5, 1.75; 2.5, 2.5]$; taking the largest value in each window gives the max-pooling answer $[4, 3; 6, 5]$; and forgetting to divide by 4 gives the sums $[7, 6; 10, 10]$.',
    difficulty: 'beginner',
  },
  {
    id: 'convolutional-networks.pooling-and-receptive-field.2',
    prompt: 'What does this code print?',
    code: 'import torch\nimport torch.nn as nn\n\nx = torch.randn(16, 32, 28, 28)\npool = nn.MaxPool2d(kernel_size=2)\ny = pool(x)\nprint(y.shape, sum(p.numel() for p in pool.parameters()))',
    options: ['`torch.Size([16, 32, 14, 14]) 0`', '`torch.Size([16, 32, 27, 27]) 0`', '`torch.Size([16, 16, 14, 14]) 0`', '`torch.Size([16, 32, 14, 14]) 4`'],
    answer: 0,
    explanation:
      "`nn.MaxPool2d`'s stride defaults to the kernel size, so this is 2×2 pooling with stride 2: $\\lfloor (28-2)/2 \\rfloor + 1 = 14$. Batch size (16) and channels (32) are untouched, and pooling has no weights, so the parameter count is 0. A size of 27 would need stride 1; a 2×2 window is not a set of 4 learnable weights.",
    difficulty: 'beginner',
  },
  {
    id: 'convolutional-networks.pooling-and-receptive-field.3',
    prompt:
      'A CNN applies, in order: conv 3×3 (stride 1), max-pool 2×2 (stride 2), conv 3×3 (stride 1), conv 3×3 (stride 1). What is the receptive field of one neuron in the last layer?',
    options: ['12 × 12', '8 × 8', '7 × 7', '11 × 11'],
    answer: 0,
    explanation:
      'Use $r_l = r_{l-1} + (k_l - 1)\\,j_{l-1}$ and $j_l = j_{l-1} s_l$, starting from $r = j = 1$: conv gives $r = 3$ ($j = 1$); the pool gives $r = 3 + 1 \\times 1 = 4$ and $j = 2$; the next conv gives $4 + 2 \\times 2 = 8$; the last gives $8 + 2 \\times 2 = 12$. Forgetting that the pool doubles the jump gives 8, ignoring the pool entirely gives 7, and simply adding the kernel sizes ($3+2+3+3$) gives 11.',
    difficulty: 'intermediate',
  },
  {
    id: 'convolutional-networks.pooling-and-receptive-field.4',
    prompt: 'VGG replaces each 5×5 convolution with two stacked 3×3 convolutions (stride 1, $C$ channels in and out). Why is this a good trade?',
    options: [
      'Same 5×5 receptive field, fewer weights ($18C^2$ vs $25C^2$) and an extra ReLU',
      'A larger 9×9 receptive field than one 5×5, for exactly the same number of weights',
      'More weights in total than one 5×5 layer, so the pair can learn finer detail',
      'Same 5×5 receptive field and no padding needed, so the map keeps its size',
    ],
    answer: 0,
    explanation:
      'Each 3×3 layer adds 2 to the receptive field, so two of them see $5 \\times 5$, the same as one 5×5 kernel (not $3 \\times 3 = 9$ wide). Weights: $2 \\times 3^2 C^2 = 18C^2$ against $5^2 C^2 = 25C^2$, 28% fewer, and the ReLU between the two layers adds an extra non-linearity. Padding is a separate choice and is needed by both designs to keep the size.',
    difficulty: 'intermediate',
  },
  {
    id: 'convolutional-networks.pooling-and-receptive-field.5',
    prompt:
      'A classifier ends with `nn.Flatten()` followed by `nn.Linear(512 * 7 * 7, 10)` and was trained on 224×224 photos. A teammate feeds it 320×320 photos and gets `RuntimeError: mat1 and mat2 shapes cannot be multiplied`. Which change lets one network accept both sizes?',
    options: [
      'Put `nn.AdaptiveAvgPool2d(1)` before `Flatten` and make the last layer `nn.Linear(512, 10)`',
      'Put one more `nn.MaxPool2d(2)` before `Flatten` and keep `nn.Linear(512 * 7 * 7, 10)`',
      'Normalise the 320×320 photos with the training set\'s per-channel mean and standard deviation',
      'Swap `nn.Flatten()` for `x.view(x.size(0), -1)` and keep `nn.Linear(512 * 7 * 7, 10)`',
    ],
    answer: 0,
    explanation:
      'At 320×320 the last maps are $512 \\times 10 \\times 10$, so Flatten produces 51,200 numbers instead of the $512 \\times 7 \\times 7 = 25{,}088$ the linear layer expects. Global average pooling turns any $512 \\times H \\times W$ into 512 numbers, so `nn.Linear(512, 10)` works for every size. An extra pool would give $5 \\times 5$ maps (12,800 numbers), which still does not match; `x.view(x.size(0), -1)` flattens exactly as `nn.Flatten()` does, so it gives the same 51,200; and normalisation changes values, not shapes.',
    difficulty: 'intermediate',
  },
]

export default questions
