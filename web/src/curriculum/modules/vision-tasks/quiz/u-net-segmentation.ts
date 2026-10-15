import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'vision-tasks.u-net-segmentation.1',
    prompt:
      'A student trains an encoder-decoder network **without** skip connections for road segmentation. Objects end up in roughly the right places, but the masks have blobby edges and thin roads are missing. What is the most likely reason?',
    options: [
      'The decoder sees only the small bottleneck map, so fine detail lost in pooling can never return',
      'The transposed convolutions have too few output channels to draw thin roads and sharp edges',
      'Pixel-wise cross-entropy cannot be used when the output has the same size as the input',
      'Max pooling blurs the edges, so the pools should be swapped for average pooling layers',
    ],
    answer: 0,
    explanation:
      'Each pooling step halves the resolution, so the bottleneck only knows roughly where things are. Upsampling it can only enlarge that coarse map, which gives blobs and loses anything thinner than one bottleneck cell. Skip connections fix this by handing the decoder the high-resolution encoder maps. Changing the pooling type does not help (average pooling also throws away position detail), more channels cannot restore positions the coarse map never had, and cross-entropy works per pixel at any output size.',
    difficulty: 'beginner',
  },
  {
    id: 'vision-tasks.u-net-segmentation.2',
    prompt: 'A decoder layer is `nn.ConvTranspose2d(128, 64, kernel_size=4, stride=2, padding=1)`. Its input has shape `(1, 128, 16, 16)`. What is the output shape?',
    options: ['`(1, 64, 32, 32)`', '`(1, 64, 34, 34)`', '`(1, 64, 8, 8)`', '`(1, 128, 32, 32)`'],
    answer: 0,
    explanation:
      'Use $(n-1)s - 2p + k = 15 \\cdot 2 - 2 + 4 = 32$, and the channel count becomes `out_channels` = 64. 34 forgets to subtract $2p$. 8 comes from the ordinary convolution formula $\\lfloor(16 + 2 - 4)/2\\rfloor + 1$, which shrinks the map instead of growing it, and 128 channels ignores the layer\'s `out_channels`.',
    difficulty: 'intermediate',
  },
  {
    id: 'vision-tasks.u-net-segmentation.3',
    prompt: 'Why does U-Net join each skip map to the decoder by **concatenating** along the channel axis rather than adding the two maps?',
    options: [
      'Concatenation lets the next convolution learn separate weights for the skip channels and the upsampled channels',
      'Concatenation keeps the channel count unchanged, so the decoder convolutions need fewer parameters',
      'Concatenation works even when the two maps have different heights and widths, but addition does not',
      'Concatenation lets gradients flow back to the encoder, whereas addition would block them',
    ],
    answer: 0,
    explanation:
      'After `torch.cat(..., dim=1)` the next convolution sees both sets of channels side by side and gives each its own weights, so it can learn how much to trust the sharp encoder detail versus the upsampled context. Adding first would force them to share weights. Concatenation actually doubles the channels, it still needs equal height and width (that is why U-Nets crash on mismatches), and addition passes gradients perfectly well, as ResNet shows.',
    difficulty: 'intermediate',
  },
  {
    id: 'vision-tasks.u-net-segmentation.4',
    prompt:
      'In a U-Net with valid (unpadded) convolutions, the skip map has shape `(1, 64, 15, 15)` and the upsampled decoder map has shape `(1, 64, 12, 12)`. Which slice does this function return?',
    code: 'def center_crop(layer, target_shape):\n    _, _, h, w = layer.shape\n    th, tw = target_shape[2], target_shape[3]\n    top = (h - th) // 2\n    left = (w - tw) // 2\n    return layer[:, :, top:top + th, left:left + tw]',
    options: ['`layer[:, :, 1:13, 1:13]`', '`layer[:, :, 1:-1, 1:-1]`', '`layer[:, :, 3:15, 3:15]`', '`layer[1:13, 1:13]`'],
    answer: 0,
    explanation:
      '`top = (15 - 12) // 2 = 1`, so the slice is `1:1 + 12`, rows 1 to 12: exactly 12 rows, with 1 cut from the top and 2 from the bottom. `1:-1` keeps 13 rows (still a mismatch), `3:15` has the right size but is not centred, and `layer[1:13, 1:13]` crops the batch and channel axes instead of height and width.',
    difficulty: 'intermediate',
  },
  {
    id: 'vision-tasks.u-net-segmentation.5',
    prompt:
      'A U-Net uses same padding (every 3×3 convolution keeps the size), three 2×2 max-pooling steps and `ConvTranspose2d(kernel_size=2, stride=2)` upsampling. Which input size runs **without** any size mismatch at the skip connections?',
    options: ['296 × 296', '300 × 300', '250 × 250', '330 × 330'],
    answer: 0,
    explanation:
      'The size must survive three halvings without rounding, so it must be divisible by $2^3 = 8$: $296 / 8 = 37$, giving $296 \\to 148 \\to 74 \\to 37$ and back up exactly. For 300: $300 \\to 150 \\to 75 \\to 37$, then $2 \\times 37 = 74 \\ne 75$. Being even (300, 250, 330) is not enough, because pooling floors any odd size further down.',
    difficulty: 'intermediate',
  },
]

export default questions
