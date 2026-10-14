import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "pretrained-models-text-speech",
  order: 28,
  part: "language-audio",
  domain: "ai_ml_dl",
  title: "Pretrained models for text and speech",
  tagline: "BERT, GPT, Whisper and friends",
  summary: "Encoder-only (BERT), decoder-only (GPT) and encoder-decoder models, language modelling, using and fine-tuning models with Hugging Face, sound as data (waveforms, sampling, spectrograms), and speech models HuBERT, Whisper and audio-LLMs.",
  prerequisites: ["attention-and-transformers"],
  syllabus: ["IOAI 4A2 Pre-trained Text Encoders (BERT)", "IOAI 4A3 Language Modeling", "IOAI 4A4 Encoder-Decoder Models", "IOAI 4A5 Pre-trained Language Models (open-source and API-based)", "IOAI 4B1 Pre-trained Audio Encoders: HuBERT", "IOAI 4B2 Audio Models: Qwen-Audio, Whisper, Voxtral", "IOAI 2B2 Data Embeddings (audio)"],
  lessons: [
    {
      slug: "bert-and-gpt",
      title: "BERT, GPT and language modelling",
      summary: "Encoder-only models pretrained by filling in masked words, decoder-only models that predict the next token, and how their attention masks differ.",
      minutes: 24,
      objectives: ["You can describe masked language modelling and the 80/10/10 rule", "You can explain how the [CLS] vector is used for classification", "You can write a sentence probability as a product of next-token probabilities and explain perplexity", "You can match encoder-only and decoder-only models to tasks"],
      load: () => import('./bert-and-gpt.mdx'),
    },
    {
      slug: "encoder-decoder-models",
      title: "Encoder-decoder models",
      summary: "Sequence-to-sequence Transformers for translation, summarisation, captioning and speech recognition, with cross-attention linking the two halves.",
      minutes: 18,
      objectives: ["You can describe the encoder-decoder architecture and cross-attention", "You can match tasks to encoder-only, decoder-only or encoder-decoder models", "You can name examples (T5, BART, MarianMT, Whisper)"],
      load: () => import('./encoder-decoder-models.mdx'),
    },
    {
      slug: "hugging-face-in-practice",
      title: "Using and fine-tuning models with Hugging Face",
      summary: "Pipelines, tokenizers and AutoModels, what the tokenizer outputs, fine-tuning with labels and -100, and calling API-based models.",
      minutes: 20,
      objectives: ["You can run a Hugging Face pipeline for a task", "You can explain input_ids, attention_mask and labels", "You can outline a fine-tuning loop (or Trainer) for sequence classification", "You can explain ignore_index = -100 for padded label positions"],
      load: () => import('./hugging-face-in-practice.mdx'),
    },
    {
      slug: "audio-as-data",
      title: "Sound as data: waveforms and spectrograms",
      summary: "Sampling rate and the Nyquist limit, waveforms, the short-time Fourier transform, spectrograms and the mel scale.",
      minutes: 20,
      objectives: ["You can explain sampling rate and the Nyquist limit", "You can describe how a spectrogram is built from short windows", "You can explain why mel spectrograms are used for speech", "You can compute audio tensor sizes"],
      load: () => import('./audio-as-data.mdx'),
    },
    {
      slug: "speech-models",
      title: "Speech models: HuBERT, Whisper and audio LLMs",
      summary: "Self-supervised audio encoders like HuBERT, encoder-decoder speech recognition with Whisper, and audio-language models such as Qwen-Audio and Voxtral.",
      minutes: 20,
      objectives: ["You can explain HuBERT's masked prediction of hidden units", "You can describe Whisper's encoder-decoder pipeline from log-mel input to text tokens", "You can describe how audio LLMs connect an audio encoder to a language model", "You can choose a model for transcription, audio classification or audio question answering"],
      load: () => import('./speech-models.mdx'),
    },
  ],
}

export default mod
