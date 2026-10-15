import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'final-lab-pytorch.task-unet-center-crop.1',
    prompt:
      'In the Task 2 network, the skip map `x2` has shape `(1, 128, 59, 59)` and `d1` has shape `(1, 128, 50, 50)`. `center_crop` computes `off = (H - h) // 2`. Which rows of `x2` does it keep?',
    options: ['`4:54`', '`4:55`', '`5:55`', '`0:50`'],
    answer: 0,
    explanation:
      '$\\text{off} = (59 - 50) // 2 = 9 // 2 = 4$, and the slice `off:off + h` is `4:54`: 50 rows, with 4 dropped above and 5 below (rounding down puts the extra row at the bottom). `4:55` is what the `d:-d` shortcut gives (`4:-4`), 51 rows, one too many. `5:55` and `0:50` have the right length but are not where this formula puts the window.',
    difficulty: 'beginner',
  },
  {
    id: 'final-lab-pytorch.task-unet-center-crop.2',
    prompt:
      'A U-Net level joins a cropped skip map of shape `(1, 64, 100, 100)` with an upsampled map of shape `(1, 64, 100, 100)` using `torch.cat([skip, up], dim=1)`. What must `in_channels` be for the next `nn.Conv2d`?',
    options: ['128', '64', '200', '256'],
    answer: 0,
    explanation:
      '`dim=1` is the channel axis of `(B, C, H, W)`, so the channels add: $64 + 64 = 128$, and the joined map is `(1, 128, 100, 100)`. 64 forgets that the join doubles the channels, and 200 adds the heights, which would be `dim=2`. In the 2026 task the same rule gave $128 + 128 = 256$ for `dec1_1`.',
    difficulty: 'beginner',
  },
  {
    id: 'final-lab-pytorch.task-unet-center-crop.3',
    prompt:
      'A student writes `return layer[:, :, 4:118, 4:118]` inside `center_crop`, copying the docstring example. The 256 × 256 self-check cell passes. What happens in the grader\'s test with a 128 × 128 input?',
    options: [
      'It crashes: the skip map is only 58 × 58, so the slice keeps 54 rows while `d1` has 50',
      'It passes: the offset is 4 for every input size, so the hard-coded slice is still correct',
      'It passes but returns an empty tensor, because the stop index 118 is larger than 58',
      'It crashes inside the first convolution, because 128 is too small for this network',
    ],
    answer: 0,
    explanation:
      'With a 128 input, `x2` is 58 × 58 and `d1` is 50 × 50. On a 58-row axis, `4:118` keeps rows 4 to 57: 54 rows, so `torch.cat` fails with "Expected size 54 but got size 50". The offset is indeed 4 again, but the stop index 118 was only right for 122; Python clips a too-large stop rather than returning an empty slice, and the network accepts any input from 40 × 40 up.',
    difficulty: 'intermediate',
  },
  {
    id: 'final-lab-pytorch.task-unet-center-crop.4',
    prompt: 'Which statement about the alternatives to centre cropping (Q2.1b) is correct?',
    options: [
      'Same padding lets the skip maps line up with no crop at all, but the border pixels are then computed partly from zeros',
      'Interpolating the decoder map up to the skip map\'s size recovers the exact values that the unpadded convolutions removed',
      'Cropping keeps the output the same size as the input, because the skip map is cut and the decoder map is not',
      'Padding the decoder map with `F.pad` adds no artificial values, because the next convolution skips over zeros',
    ],
    answer: 0,
    explanation:
      'With padding=1 a 3 × 3 convolution keeps the height and width, so for inputs such as 256 or 128 the maps meet at the same size with nothing to crop, at the cost of a little more compute and less reliable values at the zero-padded edges. Interpolation only estimates in-between values (and stretches the map out of line); it cannot recover lost information. With valid convolutions and cropping the output is 110 × 110 for a 256 × 256 input (same padding would give 128 × 128 in this half-resolution network), and the zeros from `F.pad` are multiplied by real weights like any other input: a convolution does not skip them.',
    difficulty: 'intermediate',
  },
  {
    id: 'final-lab-pytorch.task-unet-center-crop.5',
    prompt:
      'In `forward`, a student writes `x2_cropped = self.center_crop(x2, d1)` and gets `IndexError: index 2 is out of bounds for dimension 0 with size 1`. What is wrong?',
    code: 'def center_crop(self, layer, target_shape):\n    _, _, h_layer, w_layer = layer.shape\n    target_h, target_w = target_shape[2], target_shape[3]\n    ...',
    options: [
      '`d1` was passed instead of `d1.shape`, so `target_shape[2]` asks for image 2 of a batch of 1',
      'The crop offsets are negative because `d1` is bigger than `x2`, so the slice starts before row 0',
      '`layer.shape` has only three dimensions, so it cannot be unpacked into the four names on line 2',
      'The arguments are the wrong way round: the call must be `self.center_crop(d1, x2.shape)`',
    ],
    answer: 0,
    explanation:
      'Indexing a tensor picks along dim 0, the batch axis: `d1[2]` means the third image, but the batch holds only one, hence "index 2 is out of bounds for dimension 0 with size 1". Passing `d1.shape` makes `target_shape[2]` the height, 114. The offsets are not the issue (`x2` is the bigger map), unpacking four names works on a 4-D shape, and swapping the arguments would try to crop the smaller map, giving negative offsets.',
    difficulty: 'intermediate',
  },
]

export default questions
