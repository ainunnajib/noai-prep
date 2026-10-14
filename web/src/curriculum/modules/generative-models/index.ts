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
      summary: "Modelling P(y | x) to classify versus modelling P(x) to generate new samples.",
      minutes: 14,
      objectives: ["You can contrast P(y | x) with P(x) or P(x, y)", "You can explain what sampling from a generative model means", "You can name generative model families"],
      load: () => import('./generative-vs-discriminative.mdx'),
    },
    {
      slug: "autoencoders-and-vaes",
      title: "Autoencoders and variational autoencoders",
      summary: "Compressing data through a bottleneck and reconstructing it, latent spaces, denoising and anomaly detection, and VAEs that make latent spaces smooth enough to sample from.",
      minutes: 22,
      objectives: ["You can describe encoder, bottleneck (latent) and decoder", "You can explain reconstruction loss and the effect of bottleneck size", "You can explain the VAE's mean/variance, reparameterisation and KL term", "You can use autoencoders for denoising and anomaly detection"],
      load: () => import('./autoencoders-and-vaes.mdx'),
    },
    {
      slug: "gans",
      title: "Generative adversarial networks",
      summary: "A generator and a discriminator locked in a game, how training proceeds, and failure modes like mode collapse.",
      minutes: 18,
      objectives: ["You can describe the roles of generator and discriminator", "You can describe the adversarial training loop", "You can explain mode collapse and training instability", "You can contrast GAN and diffusion sampling speed"],
      load: () => import('./gans.mdx'),
    },
    {
      slug: "diffusion-models",
      title: "Diffusion models",
      summary: "Gradually adding noise, learning to remove it, sampling step by step, latent diffusion (Stable Diffusion) and classifier-free guidance.",
      minutes: 24,
      objectives: ["You can describe the forward (noising) and reverse (denoising) processes", "You can explain that the network predicts the noise", "You can explain why sampling is slower than GANs", "You can describe latent diffusion and classifier-free guidance"],
      load: () => import('./diffusion-models.mdx'),
    },
  ],
}

export default mod
