import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'generative-models.diffusion-models.1',
    prompt:
      'In a diffusion model, $x_t = \\sqrt{\\bar\\alpha_t}\\,x_0 + \\sqrt{1 - \\bar\\alpha_t}\\,\\varepsilon$. A pixel has clean value $x_0 = 1$, the noise drawn for it is $\\varepsilon = 0.5$, and $\\bar\\alpha_t = 0.36$. What is $x_t$?',
    options: ['$1.0$', '$0.68$', '$0.8$', '$0.92$'],
    answer: 0,
    explanation:
      '$\\sqrt{0.36} = 0.6$ and $\\sqrt{1 - 0.36} = \\sqrt{0.64} = 0.8$, so $x_t = 0.6 \\times 1 + 0.8 \\times 0.5 = 0.6 + 0.4 = 1.0$. Forgetting the square roots gives $0.36 + 0.64 \\times 0.5 = 0.68$, and making the two coefficients add up to 1 ($0.6$ and $0.4$) gives $0.8$. It is their *squares* that add up to 1.',
    difficulty: 'intermediate',
  },
  {
    id: 'generative-models.diffusion-models.2',
    prompt: 'During DDPM training, why can each training example use a different, randomly chosen step $t$ without running the noising process step by step?',
    options: [
      'Because the noising steps combine into one formula, $x_t = \\sqrt{\\bar\\alpha_t}\\,x_0 + \\sqrt{1-\\bar\\alpha_t}\\,\\varepsilon$, that jumps from $x_0$ straight to any $t$',
      'Because the forward process is learned by the network, which can output the noisy image at any step it is asked for',
      'Because only the final step $t = T$ is used in training, so the intermediate noisy images are never needed at all',
      'Because the noise schedule is the same at every step, so all noisy images $x_1, \\dots, x_T$ are identical',
    ],
    answer: 0,
    explanation:
      'Adding independent Gaussian noise many times is the same as adding one suitably scaled noise, so $x_t$ can be made from $x_0$ in a single line for any $t$. The forward process has no learnable weights, training uses all steps (chosen at random), and the images get noisier as $t$ grows, so they are not identical.',
    difficulty: 'intermediate',
  },
  {
    id: 'generative-models.diffusion-models.3',
    prompt: 'With classifier-free guidance, $\\hat\\varepsilon = \\varepsilon_\\text{uncond} + w(\\varepsilon_\\text{cond} - \\varepsilon_\\text{uncond})$. For one pixel, $\\varepsilon_\\text{uncond} = 0.2$, $\\varepsilon_\\text{cond} = 0.5$ and $w = 3$. What is $\\hat\\varepsilon$?',
    options: ['$1.1$', '$0.9$', '$1.5$', '$0.5$'],
    answer: 0,
    explanation:
      '$\\hat\\varepsilon = 0.2 + 3 \\times (0.5 - 0.2) = 0.2 + 0.9 = 1.1$. Forgetting to add $\\varepsilon_\\text{uncond}$ back gives 0.9, and $3 \\times 0.5 = 1.5$ scales only the conditional prediction. The answer 0.5 is what $w = 1$ would give: plain conditional sampling.',
    difficulty: 'beginner',
  },
  {
    id: 'generative-models.diffusion-models.4',
    prompt:
      'Stable Diffusion runs its denoising loop on a $4 \\times 64 \\times 64$ latent instead of a $3 \\times 512 \\times 512$ image. What is the main benefit, and what turns the final latent into a picture?',
    options: [
      'Each of the many U-Net calls works on about 48 times fewer numbers; the VAE decoder converts the final latent into pixels once at the end',
      'The latent contains no noise, so fewer denoising steps are needed; the text encoder converts the final latent into pixels at the end',
      'Latents let the model skip the forward process during training; a GAN generator converts the final latent into pixels at the end',
      'The U-Net can only accept 64 × 64 inputs; the image is then produced by upsampling the latent with bilinear interpolation',
    ],
    answer: 0,
    explanation:
      '$3 \\times 512 \\times 512 = 786{,}432$ versus $4 \\times 64 \\times 64 = 16{,}384$, a factor of 48, and that saving applies to every one of dozens of steps. The latent is noised and denoised just like pixels would be. A VAE trained beforehand provides the encoder (used to make training latents) and the decoder (used once at the end of generation); the text encoder only reads the prompt.',
    difficulty: 'intermediate',
  },
  {
    id: 'generative-models.diffusion-models.5',
    prompt:
      'A designer finds that images from a text-to-image diffusion model only loosely match her prompts. She raises the guidance scale from 1 to 7.5. What should she expect?',
    options: [
      'Images follow the prompt more closely but are less varied, and each step needs both a conditional and an unconditional prediction',
      'Images become more varied and creative, because a larger guidance scale adds extra random noise to the latent at every step',
      'Generation becomes about 7.5 times faster, because the guidance scale sets how many noise levels are skipped in each step',
      'Nothing visible changes, because the guidance scale is only used while training the U-Net and is ignored during sampling',
    ],
    answer: 0,
    explanation:
      'A larger $w$ pushes each noise prediction further in the direction "prompt minus no prompt", so samples become more faithful to the prompt and less diverse (very large $w$ looks over-saturated). Guidance is applied at sampling time and needs both predictions at every step; it does not add noise or skip steps.',
    difficulty: 'beginner',
  },
]

export default questions
