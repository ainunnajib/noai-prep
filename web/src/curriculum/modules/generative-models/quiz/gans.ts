import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'generative-models.gans.1',
    prompt: 'In a generative adversarial network, what does the discriminator output for an input image $x$?',
    options: [
      'The probability that $x$ is a real training image rather than a generated fake',
      'The noise vector $z$ that the generator used to make $x$',
      'Which class of the training set $x$ belongs to, such as "cat" or "dog"',
      'A cleaned-up copy of $x$ with the generator\'s mistakes removed',
    ],
    answer: 0,
    explanation:
      'The discriminator is a binary classifier: $D(x)$ is a single number in $(0, 1)$, its probability that $x$ is real. It does not reconstruct images (that is an autoencoder) and does not classify into dataset classes (a plain image classifier, or the label input of a conditional GAN).',
    difficulty: 'beginner',
  },
  {
    id: 'generative-models.gans.2',
    prompt: 'Why does this discriminator update call `fake.detach()`?',
    code: 'fake = G(torch.randn(B, z_dim))\nloss_D = bce(D(real), ones) + bce(D(fake.detach()), zeros)\nopt_D.zero_grad()\nloss_D.backward()\nopt_D.step()',
    options: [
      'So that `loss_D.backward()` stops at the fakes and computes gradients for the discriminator only, without backpropagating into G',
      'So that the fake images are converted from tensors into NumPy arrays, which carry no gradients, before the discriminator scores them',
      'So that the fakes are removed from the batch and the discriminator trains on real images only',
      'So that the discriminator\'s weights stay frozen during this update, leaving the generator\'s optimiser to do all the learning',
    ],
    answer: 0,
    explanation:
      '`.detach()` cuts the fakes off from the computation graph that produced them, so backpropagating `loss_D` stops at the fakes and never reaches $G$. That saves work and keeps $G$\'s graph intact for the generator\'s own backward pass. Without it, the generator\'s turn can crash with "backward through the graph a second time", or, in loops that do not zero $G$\'s gradients first, collect stray gradients that push $G$ the wrong way. It does not freeze $D$: freezing $D$ is what happens in the generator\'s turn, where only `opt_G.step()` is called.',
    difficulty: 'intermediate',
  },
  {
    id: 'generative-models.gans.3',
    prompt:
      'A discriminator outputs $D(x) = 0.8$ for a real image and $D(G(z)) = 0.3$ for a fake. With binary cross-entropy (natural log), labels 1 for real and 0 for fake, which expression is the discriminator\'s loss for this pair?',
    options: ['$-\\ln 0.8 - \\ln 0.7$', '$-\\ln 0.8 - \\ln 0.3$', '$-\\ln 0.2 - \\ln 0.7$', '$-\\ln 0.8 + \\ln 0.3$'],
    answer: 0,
    explanation:
      'For the real image (target 1) the loss is $-\\ln D(x) = -\\ln 0.8$. For the fake (target 0) it is $-\\ln(1 - D(G(z))) = -\\ln(1 - 0.3) = -\\ln 0.7$. Adding gives about $0.22 + 0.36 = 0.58$. Using $-\\ln 0.3$ would treat the fake as if its target were 1, which is the generator\'s loss, not the discriminator\'s.',
    difficulty: 'intermediate',
  },
  {
    id: 'generative-models.gans.4',
    prompt:
      'A GAN is trained on handwritten digits 0 to 9. Its outputs are sharp and the discriminator is often fooled, but nearly every generated image is a 7, and after more training nearly every one is a 1. What is happening?',
    options: [
      'Mode collapse: the generator has found a few outputs that fool the discriminator and produces only those, hopping between them',
      'Overfitting: the generator has memorised a handful of training images of 7s and 1s and copies them pixel for pixel',
      'Vanishing gradients: the discriminator has stopped learning, so the generator gets no signal and can no longer change what it draws',
      'Underfitting: the generator is too small to draw digits, so it falls back on the simplest shapes',
    ],
    answer: 0,
    explanation:
      'Covering only one or two modes of the data, and jumping from one to another as the discriminator catches up, is the textbook picture of mode collapse. The fakes are convincing one at a time, so this is not underfitting, and nothing suggests copies of training images. If the generator could no longer change its outputs, it would not be hopping from 7s to 1s.',
    difficulty: 'beginner',
  },
  {
    id: 'generative-models.gans.5',
    prompt: 'A trained GAN generates an image in a fraction of a second, while a diffusion model of similar size takes much longer. Which statement explains the difference?',
    options: [
      'The GAN needs just one forward pass of its generator, while the diffusion model runs its denoising network once for every one of many steps',
      'The GAN skips its discriminator at generation time, while the diffusion model must also run a discriminator to check each image it makes',
      'The diffusion model is slower because it has far more parameters; with equal parameter counts both would need the same time',
      'The GAN generates at a lower resolution and then upsamples, while the diffusion model always works directly on full-resolution pixels',
    ],
    answer: 0,
    explanation:
      'Generation time is driven by the number of network calls: one for a GAN generator, typically 20 to 1000 for a diffusion model, one per denoising step. Diffusion models have no discriminator at all. Parameter count is not the reason, and many diffusion models (such as Stable Diffusion) actually work in a small latent space rather than on full-resolution pixels.',
    difficulty: 'beginner',
  },
]

export default questions
