import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "pretrained-models-text-speech",
  order: 28,
  part: "language-audio",
  domain: "ai_ml_dl",
  title: "Pretrained models for text and speech",
  tagline: "BERT, GPT, Whisper and friends",
  summary: "Encoder-only (BERT), decoder-only (GPT) and encoder-decoder models, language modelling and perplexity, using and fine-tuning models with Hugging Face, sound as data (waveforms, sampling, spectrograms), and the speech models HuBERT, Whisper and audio LLMs.",
  prerequisites: ["attention-and-transformers"],
  syllabus: ["IOAI 4A2 Pre-trained Text Encoders (BERT)", "IOAI 4A3 Language Modeling", "IOAI 4A4 Encoder-Decoder Models", "IOAI 4A5 Pre-trained Language Models (open-source and API-based)", "IOAI 4B1 Pre-trained Audio Encoders: HuBERT", "IOAI 4B2 Audio Models: Qwen-Audio, Whisper, Voxtral", "IOAI 2B2 Data Embeddings (audio)"],
  lessons: [
    {
      slug: "bert-and-gpt",
      title: "BERT, GPT and language modelling",
      summary: "Encoder-only BERT, pretrained by filling in masked words, and its [CLS] vector for classification; decoder-only GPT, which predicts the next token; perplexity; and how their attention masks differ.",
      minutes: 35,
      objectives: ["You can describe masked language modelling and use the 15% and 80/10/10 rule to count masked and scored tokens", "You can explain how the [CLS] vector is used for classification and work out the head's output shape", "You can write a sentence probability as a product of next-token probabilities and compute perplexity", "You can explain how the attention masks of BERT and GPT differ and match each to tasks"],
      load: () => import('./bert-and-gpt.mdx'),
    },
    {
      slug: "encoder-decoder-models",
      title: "Encoder-decoder models",
      summary: "Sequence-to-sequence Transformers for translation, summarisation, captioning and speech recognition: cross-attention linking the two halves, which attention layers are causal, how they are trained and generate, and which model family fits which task.",
      minutes: 25,
      objectives: ["You can describe the encoder-decoder architecture and work out the shapes in cross-attention", "You can explain why only the decoder's self-attention needs a causal mask", "You can explain why the encoder runs once while the decoder runs once per output token", "You can match tasks to encoder-only, decoder-only or encoder-decoder models such as BERT, GPT, T5 and Whisper"],
      load: () => import('./encoder-decoder-models.mdx'),
    },
    {
      slug: "hugging-face-in-practice",
      title: "Using and fine-tuning models with Hugging Face",
      summary: "Pipelines, tokenisers and AutoModels, what the tokeniser returns, fine-tuning with a new head and labels of −100, and open-weights versus API-based models.",
      minutes: 30,
      objectives: ["You can run a Hugging Face pipeline and trace its three stages: tokenise, model, post-process", "You can explain the input ids and attention mask that a tokeniser returns", "You can fine-tune a pretrained model with a new head, and choose between local and API-based models", "You can explain why padded labels are −100 and compute a cross-entropy loss that skips them"],
      load: () => import('./hugging-face-in-practice.mdx'),
    },
    {
      slug: "audio-as-data",
      title: "Sound as data: waveforms and spectrograms",
      summary: "Waveforms, sampling rate, the Nyquist limit and aliasing, the Fourier transform, spectrograms and the log-mel input of speech models.",
      minutes: 30,
      objectives: ["You can explain sampling rate, the Nyquist limit and aliasing", "You can describe how a spectrogram is built from short windows and count its frames and frequency bins", "You can explain why speech models use log-mel spectrograms", "You can compute the number of samples in a batch of audio clips"],
      load: () => import('./audio-as-data.mdx'),
    },
    {
      slug: "speech-models",
      title: "Speech models: HuBERT, Whisper and audio LLMs",
      summary: "Self-supervised audio encoders like HuBERT, encoder-decoder speech recognition with Whisper, and audio-language models such as Qwen-Audio and Voxtral.",
      minutes: 30,
      objectives: ["You can explain HuBERT's masked prediction of hidden units", "You can describe Whisper's encoder-decoder pipeline from log-mel input to text tokens", "You can describe how audio LLMs connect an audio encoder to a language model", "You can choose a model for transcription, audio classification or audio question answering"],
      load: () => import('./speech-models.mdx'),
    },
  ],
}

export default mod
