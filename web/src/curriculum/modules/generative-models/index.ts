import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "generative-models",
  order: 31,
  part: "generative-ai",
  domain: "generative_ai",
  title: "Generative models: autoencoders, GANs and diffusion",
  tagline: "Machines that create new data",
  summary: "Generative versus discriminative models, autoencoders and VAEs with latent spaces, GANs and their training game, and diffusion models from forward noising to latent diffusion and classifier-free guidance.",
  prerequisites: ["convolutional-networks", "probability-and-statistics", "large-language-models"],
  syllabus: ["IOAI 2B6 Autoencoders", "IOAI 3A7 Generating Images with GANs", "IOAI 3A10 Diffusion Models", "NOAI Generative AI: generative models, DDPM, Stable Diffusion, latent diffusion, classifier-free guidance", "Generative vs discriminative models"],
  lessons: [
    {
      slug: "generative-vs-discriminative",
      title: "Generative versus discriminative models",
      summary: "Modelling P(y | x) to classify versus modelling P(x) or P(x, y) to generate: Bayes' rule, what sampling means, and the main families of generative models.",
      minutes: 30,
      objectives: ["You can tell a discriminative model, which learns P(y | x), from a generative one, which learns P(x) or P(x, y), and place well-known models on the right side", "You can work out joint, marginal and conditional probabilities from a table of counts and use Bayes' rule to turn P(x | y) and P(y) into a classifier", "You can explain what sampling from a generative model means, such as picking a label and then features for that label", "You can choose a generative model when a task needs new data or a score of how typical an input is"],
      load: () => import('./generative-vs-discriminative.mdx'),
    },
    {
      slug: "autoencoders-and-vaes",
      title: "Autoencoders and variational autoencoders",
      summary: "Compressing data through a bottleneck and reconstructing it, latent spaces, denoising and anomaly detection, and VAEs that make latent spaces smooth enough to sample from.",
      minutes: 30,
      objectives: ["You can describe an autoencoder's encoder, bottleneck and decoder and compute its mean squared reconstruction error", "You can explain why the bottleneck must be smaller than the input and what changing its size does", "You can use an autoencoder trained only on normal data to clean up noise and to flag anomalies by their reconstruction error", "You can explain how a VAE's mean, spread, reparameterisation trick and KL term give a latent space you can sample from"],
      load: () => import('./autoencoders-and-vaes.mdx'),
    },
    {
      slug: "gans",
      title: "Generative adversarial networks",
      summary: "A generator and a discriminator locked in a game, their losses and alternating training loop, failure modes like mode collapse, and why GANs generate faster than diffusion models.",
      minutes: 25,
      objectives: ["You can describe what the generator and the discriminator take in, output and try to achieve", "You can compute the discriminator's binary cross-entropy loss and explain each step of the alternating training loop, including why the fakes are detached", "You can recognise mode collapse and training instability from a GAN's outputs", "You can explain why a GAN generates an image much faster than a diffusion model"],
      load: () => import('./gans.mdx'),
    },
    {
      slug: "diffusion-models",
      title: "Diffusion models",
      summary: "Gradually adding noise, learning to remove it, sampling step by step, latent diffusion (Stable Diffusion) and classifier-free guidance.",
      minutes: 30,
      objectives: ["You can compute a noised value with the forward jump formula and explain why training can jump straight to any step", "You can explain that the network is trained to predict the noise and why sampling needs many network calls", "You can explain how latent diffusion uses a VAE to make Stable Diffusion cheaper", "You can compute a classifier-free guidance prediction and say what raising the guidance scale does"],
      load: () => import('./diffusion-models.mdx'),
    },
  ],
}

export default mod
