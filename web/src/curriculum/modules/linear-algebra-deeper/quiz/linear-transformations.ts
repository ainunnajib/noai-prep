import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'linear-algebra-deeper.linear-transformations.1',
    prompt: 'A 2×2 matrix $A$ sends $(1, 0)$ to $(0, -1)$ and sends $(0, 1)$ to $(1, 0)$. Which matrix is $A$?',
    options: [
      String.raw`$\begin{bmatrix} 0 & 1 \\ -1 & 0 \end{bmatrix}$`,
      String.raw`$\begin{bmatrix} 0 & -1 \\ 1 & 0 \end{bmatrix}$`,
      String.raw`$\begin{bmatrix} 0 & 1 \\ 1 & 0 \end{bmatrix}$`,
      String.raw`$\begin{bmatrix} 1 & 0 \\ 0 & -1 \end{bmatrix}$`,
    ],
    answer: 0,
    explanation:
      'The columns are where the basis vectors land: column 1 is $(0, -1)$ and column 2 is $(1, 0)$, giving $\\begin{bmatrix} 0 & 1 \\\\ -1 & 0 \\end{bmatrix}$, a $90°$ clockwise rotation. Writing the images as rows gives $\\begin{bmatrix} 0 & -1 \\\\ 1 & 0 \\end{bmatrix}$, which is the anticlockwise rotation: it sends $(1, 0)$ up to $(0, 1)$, not down.',
    difficulty: 'beginner',
  },
  {
    id: 'linear-algebra-deeper.linear-transformations.2',
    prompt: 'A matrix leaves $\\hat\\imath = (1, 0)$ where it is and sends $\\hat\\jmath = (0, 1)$ to $(0, -1)$. What does it do to a picture drawn on the plane?',
    options: [
      'Reflects it in the x-axis, so it ends up upside down (a mirror image)',
      'Reflects it in the y-axis, so its left and right swap',
      'Rotates it by 180°, so it is upside down and back to front',
      'Projects it flat onto the x-axis, so its height becomes 0',
    ],
    answer: 0,
    explanation:
      'The matrix is $\\begin{bmatrix} 1 & 0 \\\\ 0 & -1 \\end{bmatrix}$: $(x, y) \\mapsto (x, -y)$, so every point jumps to the other side of the x-axis (det $= -1$, a mirror image). A reflection in the y-axis would flip $\\hat\\imath$ instead. A $180°$ rotation flips **both** arrows ($-I$), so it would also swap left and right, and a projection would crush $\\hat\\jmath$ to $(0, 0)$ rather than flip it.',
    difficulty: 'beginner',
  },
  {
    id: 'linear-algebra-deeper.linear-transformations.3',
    prompt: 'A student builds a 5-layer network in which each layer only computes `x = W @ x` (no bias, no activation). Why can it represent nothing more than a single layer could?',
    options: [
      'The five matrices always multiply into one matrix, so the network is one linear map',
      'Matrix multiplication is commutative, so the five layers can be merged in any order',
      'Without biases every layer outputs zero, so the later layers never receive a signal',
      'Each extra layer multiplies the rounding error, so the deeper layers learn nothing',
    ],
    answer: 0,
    explanation:
      '$W_5W_4W_3W_2W_1x = (W_5W_4W_3W_2W_1)x$, and the product in brackets is a single matrix: stacked linear maps compose into one linear map, so straight grid lines stay straight however deep you go. The merging works because of associativity, not commutativity (matrix multiplication is **not** commutative). Without biases the output is $Wx$, which is not zero in general (only the inputs that $W$ squashes flat give 0). A non-linear activation between layers is what breaks the collapse.',
    difficulty: 'intermediate',
  },
  {
    id: 'linear-algebra-deeper.linear-transformations.4',
    prompt:
      'Let $R = \\begin{bmatrix} 0 & -1 \\\\ 1 & 0 \\end{bmatrix}$ (rotate $90°$ anticlockwise) and $D = \\begin{bmatrix} 2 & 0 \\\\ 0 & 1 \\end{bmatrix}$ (double the x-coordinate). You **rotate first, then apply $D$**. Where does the point $(1, 0)$ end up?',
    options: ['$(0, 1)$', '$(0, 2)$', '$(2, 0)$', '$(0, -1)$'],
    answer: 0,
    explanation:
      'Rotate first: $R(1, 0) = (0, 1)$. Then $D$ doubles the x-coordinate, which is 0, so the point stays at $(0, 1)$. The single matrix is $DR = \\begin{bmatrix} 0 & -2 \\\\ 1 & 0 \\end{bmatrix}$, whose first column is $(0, 1)$. $(0, 2)$ is what you get in the other order ($D$ first gives $(2, 0)$, then $R$ turns it to $(0, 2)$), and $(0, -1)$ comes from rotating the wrong way.',
    difficulty: 'intermediate',
  },
  {
    id: 'linear-algebra-deeper.linear-transformations.5',
    prompt:
      'A layer `nn.Linear(784, 128)` turns a flattened 28×28 image (784 numbers) into 128 hidden values. Viewed as a transformation $y = Wx$ on column vectors, what is the shape of $W$?',
    options: ['128 × 784', '784 × 128', '128 × 128', '784 × 784'],
    answer: 0,
    explanation:
      'An $m \\times n$ matrix takes $n$ numbers in and gives $m$ numbers out: columns count the inputs, rows count the outputs. So $W$ is $128 \\times 784$, and PyTorch indeed stores `weight` with shape `(out_features, in_features)` = `(128, 784)`. $784 \\times 128$ would expect 128 inputs; the square shapes cannot change the size of the vector at all.',
    difficulty: 'beginner',
  },
]

export default questions
