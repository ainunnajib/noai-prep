import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'generative-models.autoencoders-and-vaes.1',
    prompt: 'An autoencoder for 64-pixel images is given a bottleneck of 64 numbers, as many as the input. What is the main risk?',
    options: [
      'It can pass the pixels straight through, reconstructing well without learning a useful summary',
      'It cannot be trained, because the loss is undefined when the code and the input are exactly the same size',
      'It now needs a label for every image, because the bottleneck no longer compresses anything',
      'It becomes a variational autoencoder, because a wide latent space is automatically smooth',
    ],
    answer: 0,
    explanation:
      'With no squeeze, copying the input is an easy way to reach a low error, so the network is under no pressure to discover what the images have in common. An undercomplete bottleneck ($k$ smaller than the input) is what forces compression. The loss is still a perfectly good squared error, no labels are involved, and smoothness comes from the VAE’s KL term, not from width.',
    difficulty: 'beginner',
  },
  {
    id: 'generative-models.autoencoders-and-vaes.2',
    prompt:
      'An input image has pixels $x = [0,\\ 1,\\ 1,\\ 0]$ and the autoencoder outputs $\\hat x = [0.2,\\ 0.8,\\ 1,\\ 0.4]$. What is the mean squared reconstruction error?',
    options: ['$0.06$', '$0.24$', '$0.2$', '$0.8$'],
    answer: 0,
    explanation:
      'Differences: $-0.2, 0.2, 0, -0.4$. Squares: $0.04 + 0.04 + 0 + 0.16 = 0.24$. Mean over 4 pixels: $0.24/4 = 0.06$. $0.24$ forgets to average, $0.2$ is the mean absolute error and $0.8$ is the sum of absolute differences.',
    difficulty: 'beginner',
  },
  {
    id: 'generative-models.autoencoders-and-vaes.3',
    prompt: 'This is the sampling step of a VAE, for one latent number. What does it print?',
    code: `import torch
mu = torch.tensor([1.0])
logvar = torch.tensor([1.3863])     # about ln(4)
eps = torch.tensor([0.5])
sigma = torch.exp(0.5 * logvar)
z = mu + sigma * eps
print(z)`,
    options: ['`tensor([2.0000])`', '`tensor([3.0000])`', '`tensor([1.6931])`', '`tensor([2.5000])`'],
    answer: 0,
    explanation:
      '`logvar` is $\\ln\\sigma^2 = \\ln 4$, so $\\sigma = e^{0.5 \\ln 4} = \\sqrt 4 = 2$. Then $z = \\mu + \\sigma\\varepsilon = 1 + 2 \\times 0.5 = 2$. Using the variance 4 as if it were $\\sigma$ gives 3; plugging `logvar` in directly gives $1 + 1.3863 \\times 0.5 = 1.6931$; and $\\mu\\sigma + \\varepsilon = 2.5$ mixes up the scale and the shift.',
    difficulty: 'intermediate',
  },
  {
    id: 'generative-models.autoencoders-and-vaes.4',
    prompt:
      'A factory trains an autoencoder on 10,000 photos of good circuit boards only. On new boards the reconstruction error is usually about 0.01, but one board scores 0.20. What is the most sensible conclusion?',
    options: [
      'The board looks unlike the good boards, the only kind seen in training, so it should be flagged for a closer inspection',
      'The autoencoder is underfitting this board, so it should be retrained on it until its error is as small as usual',
      'The board is fine: a high error means the autoencoder found it unusually easy to squeeze into its code',
      'Nothing can be concluded, since autoencoders need labelled faulty boards before they can spot faults',
    ],
    answer: 0,
    explanation:
      'An autoencoder trained only on normal data rebuilds normal inputs well and unfamiliar ones badly, so an error 20 times the usual level is exactly the anomaly signal. A high error means the board was *hard* to rebuild, not easy, and retraining on the odd board would only teach the model to accept it. No labelled faults are needed, which is the main attraction of this method.',
    difficulty: 'beginner',
  },
  {
    id: 'generative-models.autoencoders-and-vaes.5',
    prompt: 'Why can a VAE generate new images from random codes $z \\sim \\mathcal N(0, I)$ when a plain autoencoder usually cannot?',
    options: [
      'Its KL term pulls every code towards $\\mathcal N(0, I)$, filling that region with codes the decoder knows how to decode',
      'Its decoder is trained with digit labels, so it knows which digit each random code is supposed to turn into',
      'A plain autoencoder has no decoder of its own; it can only encode images into codes and never back',
      'Its bottleneck is always much larger, so a random code is likely to match one training code exactly',
    ],
    answer: 0,
    explanation:
      'Reconstruction + KL makes the codes of real data overlapping clouds packed around the origin, so random draws from $\\mathcal N(0, I)$ land where the decoder was trained. A plain autoencoder places codes anywhere, with gaps, so random codes often decode to junk. VAEs need no labels, every autoencoder has a decoder, and the bottleneck is often tiny (2 in this lesson).',
    difficulty: 'intermediate',
  },
]

export default questions
