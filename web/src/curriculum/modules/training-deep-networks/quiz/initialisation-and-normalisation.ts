import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'training-deep-networks.initialisation-and-normalisation.1',
    prompt: 'Every weight in a hidden layer is initialised to the same value, 0.5. What happens during training?',
    options: [
      'All the neurons compute the same output and get the same update, so they stay identical copies',
      'The neurons start identical, but random mini-batches soon push them to learn different features',
      'Training stops at once with an error, because PyTorch refuses to train a layer whose weights are equal',
      'Training works normally, because only the size of the initial weights matters, not whether they are equal',
    ],
    answer: 0,
    explanation:
      'Identical neurons receive identical inputs, so they produce identical outputs and identical gradients; every update keeps them equal, so the layer acts like a single neuron. A mini-batch is shared by all neurons, so it cannot break the tie. Only random initial weights do (symmetry breaking).',
    difficulty: 'beginner',
  },
  {
    id: 'training-deep-networks.initialisation-and-normalisation.2',
    prompt: 'A ReLU layer is created with `nn.Linear(512, 128)`. Using He initialisation, $\\operatorname{Var}(w) = 2/\\text{fan-in}$, what is the standard deviation of its weights?',
    options: ['0.0625', '0.0039', '0.044', '0.125'],
    answer: 0,
    explanation:
      'Fan-in is 512, so $\\operatorname{Var}(w) = 2/512 = 1/256$ and the standard deviation is $\\sqrt{1/256} = 1/16 = 0.0625$. 0.0039 is the variance itself, 0.044 is $\\sqrt{1/512}$ (the LeCun, 1/fan-in value), and 0.125 would use the fan-out, $\\sqrt{2/128}$.',
    difficulty: 'intermediate',
  },
  {
    id: 'training-deep-networks.initialisation-and-normalisation.3',
    prompt: 'In a mini-batch, one feature takes the values $1, 1, 5, 5$. BatchNorm has $\\gamma = 2$ and $\\beta = 1$. Ignoring $\\epsilon$, what is the output for the value 5?',
    options: ['3', '1', '5', '2'],
    answer: 0,
    explanation:
      'Mean $\\mu = 12/4 = 3$. The gaps are $-2, -2, 2, 2$, so the variance is $16/4 = 4$ and $\\sigma = 2$. Then $\\hat x = (5 - 3)/2 = 1$ and $y = \\gamma \\hat x + \\beta = 2 \\times 1 + 1 = 3$. Stopping at $\\hat x$ gives 1; forgetting $\\beta$ gives 2.',
    difficulty: 'intermediate',
  },
  {
    id: 'training-deep-networks.initialisation-and-normalisation.4',
    prompt:
      'A CNN with BatchNorm layers is tested on batches of 16 images, but you forgot to call `model.eval()`. The prediction for the same image changes depending on which other images share its batch. Why?',
    options: [
      "In training mode BatchNorm uses each test batch's own mean and variance instead of its stored running statistics",
      'In training mode BatchNorm resets $\\gamma$ and $\\beta$ to 1 and 0 before every batch, so the learned scale and shift are lost',
      'In training mode the optimiser keeps training the `running_mean` and `running_var` buffers on every test batch',
      'In training mode BatchNorm normalises each image over its own pixels, so the result depends on the order of the images',
    ],
    answer: 0,
    explanation:
      "Training mode normalises with the current batch's statistics, so each image's output depends on its batch-mates. `model.eval()` switches to the stored `running_mean` and `running_var`, so every image is treated on its own. Those are buffers: the forward pass updates them in place, but the optimiser never trains them, and $\\gamma$ and $\\beta$ are not reset.",
    difficulty: 'intermediate',
  },
  {
    id: 'training-deep-networks.initialisation-and-normalisation.5',
    prompt: 'Why do Transformers normally use LayerNorm rather than BatchNorm?',
    options: [
      'It normalises each token over its own features, so it works the same for any batch size or padding',
      'It normalises each feature over the whole batch, which gives more accurate statistics for long sequences',
      'It has no learnable parameters at all, so it adds nothing to the size of a very large model',
      'It keeps running averages of the mean and variance for evaluation, which BatchNorm cannot do',
    ],
    answer: 0,
    explanation:
      'LayerNorm computes the mean and variance across the features of one token or example, so it behaves the same for any batch size (even 1), at training and evaluation alike. Normalising each feature over the batch is BatchNorm. LayerNorm does have learnable $\\gamma$ and $\\beta$, and it is BatchNorm, not LayerNorm, that keeps running averages.',
    difficulty: 'intermediate',
  },
]

export default questions
