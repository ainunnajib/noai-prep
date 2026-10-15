import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'pretrained-models-text-speech.speech-models.1',
    prompt: 'During pretraining, what does HuBERT predict for each masked stretch of audio?',
    options: [
      'The k-means cluster number ("hidden unit") of each masked frame',
      'The letters of the transcript spoken during the masked frames',
      'The raw waveform samples that were hidden, one by one',
      'Whether the masked frames come from the same speaker as the rest',
    ],
    answer: 0,
    explanation:
      'HuBERT first clusters frames with k-means (on MFCCs in round 1, on its own features in round 2) and uses each frame\'s cluster number as a discrete target, like BERT\'s masked words. It never sees transcripts: that is the point of self-supervised pretraining. Predicting raw samples would be a regression on noisy numbers, which is not what HuBERT does.',
    difficulty: 'beginner',
  },
  {
    id: 'pretrained-models-text-speech.speech-models.2',
    prompt: 'Which description matches how Whisper turns speech into text?',
    options: [
      'Log-mel spectrogram → Transformer encoder → decoder writing text tokens one by one, with cross-attention to the audio',
      'Raw waveform → k-means clustering of frames → decoder that maps each cluster number straight to a letter',
      'Log-mel spectrogram → decoder-only language model that predicts the next spectrogram frame, then reads it aloud as text',
      'Raw waveform → encoder → a single [CLS] vector → softmax over a fixed list of possible whole sentences',
    ],
    answer: 0,
    explanation:
      'Whisper is an encoder-decoder Transformer: the 80 × 3,000 log-mel goes through the encoder (1,500 vectors), and the decoder generates tokens autoregressively, using cross-attention to look at the audio. k-means units belong to HuBERT, and a [CLS] vector with a softmax over fixed classes is how a classifier works, not a transcriber.',
    difficulty: 'beginner',
  },
  {
    id: 'pretrained-models-text-speech.speech-models.3',
    prompt: 'You have a recording of a Malay speech and want English text from Whisper in one step. Which special tokens should follow `<|startoftranscript|>`?',
    options: ['`<|ms|>` then `<|translate|>`', '`<|en|>` then `<|transcribe|>`', '`<|en|>` then `<|translate|>`', '`<|ms|>` then `<|transcribe|>`'],
    answer: 0,
    explanation:
      'The language token names the language that is **spoken** (Malay, `ms`), and the task token `<|translate|>` asks for English output. `<|ms|>` with `<|transcribe|>` would give Malay text. Putting `<|en|>` claims the audio is English, which is the classic mix-up between input language and output language.',
    difficulty: 'intermediate',
  },
  {
    id: 'pretrained-models-text-speech.speech-models.4',
    prompt: 'In this audio-LLM projector, what does the final line print?',
    code: 'import torch, torch.nn as nn\nenc = torch.randn(1, 1500, 1280)      # audio encoder output for 30 s\nx = enc.reshape(1, 375, 4 * 1280)     # glue 4 neighbouring frames\nproj = nn.Linear(4 * 1280, 4096)      # map to the LLM width\nprint(proj(x).shape)',
    options: ['`torch.Size([1, 375, 4096])`', '`torch.Size([1, 1500, 4096])`', '`torch.Size([1, 375, 5120])`', '`torch.Size([375, 4096])`'],
    answer: 0,
    explanation:
      'The reshape groups 4 frames: $1500 / 4 = 375$ rows of $4 \\times 1280 = 5120$ numbers. `nn.Linear(5120, 4096)` changes only the last dimension, so the result is `(1, 375, 4096)`: 375 audio tokens, each as wide as the LLM\'s embeddings. `(1, 375, 5120)` forgets the projection, and `(1, 1500, 4096)` forgets the grouping.',
    difficulty: 'intermediate',
  },
  {
    id: 'pretrained-models-text-speech.speech-models.5',
    prompt:
      'A call centre has 3,000 short recordings labelled "satisfied" or "frustrated" and wants a fast model to tag new calls. Which approach fits best?',
    options: [
      'Fine-tune a pretrained HuBERT encoder with a small classification head on the clips',
      'Train Whisper from scratch on the 3,000 clips so that it outputs the two labels as text',
      'Run Whisper and classify the transcript, since tone of voice carries no useful signal',
      'Prompt an audio LLM with each call and parse its free-text answer for one of the two labels',
    ],
    answer: 0,
    explanation:
      'The output is one label per clip, and labelled data exists, so a pretrained audio encoder plus a small head is accurate, small and fast. Training Whisper from scratch on 3,000 clips is hopeless (it learned from 680,000 hours). Transcripts throw away tone of voice, which is the main clue to frustration. An audio LLM could work zero-shot, but it is far bigger and slower and does not learn from your labels.',
    difficulty: 'intermediate',
  },
  {
    id: 'pretrained-models-text-speech.speech-models.6',
    prompt: 'A student has a 44.1 kHz recording of a speech in Malay, `rapat.wav`, and wants English text from it in one step. After the line below, which call does that?',
    code: 'from transformers import pipeline\nasr = pipeline("automatic-speech-recognition", model="openai/whisper-small")',
    options: [
      '`asr("rapat.wav", generate_kwargs={"language": "malay", "task": "translate"})`',
      '`asr("rapat.wav", generate_kwargs={"language": "english", "task": "transcribe"})`',
      '`asr("rapat.wav", generate_kwargs={"language": "malay", "task": "transcribe"})`',
      '`pipeline("audio-classification", model="openai/whisper-small")("rapat.wav")`',
    ],
    answer: 0,
    explanation:
      'The `language` argument names the language **spoken** (Malay), and `task: "translate"` asks Whisper for English text. The pipeline loads the file and resamples it to Whisper\'s 16 kHz itself, so the 44.1 kHz rate needs no extra step. Saying `"english"` claims the audio is English, `"transcribe"` with Malay returns Malay text, and an audio-classification pipeline returns labels, not text.',
    difficulty: 'intermediate',
  },
]

export default questions
