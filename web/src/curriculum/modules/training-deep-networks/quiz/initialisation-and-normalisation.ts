import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'training-deep-networks.initialisation-and-normalisation.1',
    prompt: 'Every weight in a hidden layer is initialised to the same value, 0.5. What happens during training?',
    options: [
      'Every neuron in the layer computes the same output and receives the same update, so the neurons stay identical',
      'The neurons start identical, but random mini-batches soon make them learn different features',
      'Training fails immediately with an error, because PyTorch does not allow equal weights',
      'The layer works normally, because only the size of the weights matters, not whether they are equal',
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
      'Fan-in is 512, so $\\operatorname{Var}(w) = 2/512 = 1/256$ and the standard deviation is $\\sqrt{1/256} = 1/16 = 0.0625$. 0.0039 is the variance itself, 0.044 is Xavier\'s $\\sqrt{1/512}$, and 0.125 would use the fan-out, $\\sqrt{2/128}$.',
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
      'In training mode BatchNorm normalises with the current batch\'s mean and variance; in eval mode it would use the running averages stored during training',
      'In training mode BatchNorm resets γ and β to 1 and 0 before every batch, so the learned scaling is lost',
      'In training mode the convolution weights are updated after every test batch, so the model keeps changing',
      'In training mode BatchNorm normalises each image across its own pixels only, which depends on the image order',
    ],
    answer: 0,
    explanation:
      "BatchNorm's training mode uses batch statistics, so each image's output depends on its batch-mates (and it keeps updating the running averages). `model.eval()` switches it to the stored running mean and variance, so every image is treated on its own. Weights only change when `optimizer.step()` is called, not because of the mode.",
    difficulty: 'intermediate',
  },
  {
    id: 'training-deep-networks.initialisation-and-normalisation.5',
    prompt: 'Why do Transformers normally use LayerNorm rather than BatchNorm?',
    options: [
      'LayerNorm normalises each example over its own features, so it does not depend on batch size, padding or the other sequences in the batch',
      'LayerNorm normalises each feature over the whole batch, which gives more accurate statistics for long sequences',
      'LayerNorm has no learnable parameters, so it adds nothing to the model size',
      'LayerNorm keeps running averages for evaluation, which BatchNorm cannot do',
    ],
    answer: 0,
    explanation:
      'LayerNorm computes the mean and variance across the features of one token or example, so it behaves the same for any batch size (even 1), at training and evaluation alike. Normalising each feature over the batch is BatchNorm. LayerNorm does have learnable $\\gamma$ and $\\beta$, and it is BatchNorm, not LayerNorm, that keeps running averages.',
    difficulty: 'intermediate',
  },
]

export default questions
