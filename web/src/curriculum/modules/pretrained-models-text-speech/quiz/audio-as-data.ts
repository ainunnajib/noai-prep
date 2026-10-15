import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'pretrained-models-text-speech.audio-as-data.1',
    prompt: 'A speech dataset holds 1,000 mono clips, each 10 seconds long, recorded at 16 kHz. How many samples are there in total?',
    options: ['$1.6 \\times 10^8$', '$1.6 \\times 10^5$', '$1.6 \\times 10^7$', '$3.2 \\times 10^8$'],
    answer: 0,
    explanation:
      'One clip has $16{,}000 \\times 10 = 160{,}000 = 1.6 \\times 10^5$ samples, and 1,000 clips multiply that by $10^3$: $1.6 \\times 10^8$. The $1.6 \\times 10^5$ option forgets the 1,000 clips, and $3.2 \\times 10^8$ wrongly doubles the rate as if the Nyquist rule changed the number of samples stored.',
    difficulty: 'beginner',
  },
  {
    id: 'pretrained-models-text-speech.audio-as-data.2',
    prompt: 'An old telephone line samples speech at 8 kHz. What is the highest frequency such a recording can represent?',
    options: ['4 kHz', '8 kHz', '16 kHz', '2 kHz'],
    answer: 0,
    explanation:
      'The Nyquist frequency is half the sampling rate: $8 / 2 = 4$ kHz. Answering 8 kHz confuses the rate with the limit, and 16 kHz is the rate you would need to capture 8 kHz. This 4 kHz ceiling is why "s" and "f" sounds, which have energy above 4 kHz, sound muffled on the phone.',
    difficulty: 'beginner',
  },
  {
    id: 'pretrained-models-text-speech.audio-as-data.3',
    prompt:
      'A 7 kHz whistle is recorded at a sampling rate of 10 kHz, and the microphone has no filter to remove high frequencies first. Which frequency appears in the recording?',
    options: ['3 kHz', '7 kHz', '5 kHz', '17 kHz'],
    answer: 0,
    explanation:
      'The limit is $10/2 = 5$ kHz, and 7 kHz is above it, so it aliases. The nearest multiple of the rate is $1 \\times 10 = 10$ kHz, so the fake frequency is $|7 - 10| = 3$ kHz. "7 kHz" assumes nothing goes wrong, and 5 kHz is the limit itself, not where the tone lands.',
    difficulty: 'intermediate',
  },
  {
    id: 'pretrained-models-text-speech.audio-as-data.4',
    prompt: 'What does this code print?',
    code: 'import numpy as np\nx = np.zeros(16000)        # 1 second of audio at 16 kHz\nwin, hop = 400, 160\nn = 1 + (len(x) - win) // hop\nframes = np.stack([x[i*hop : i*hop + win] for i in range(n)])\nspec = np.abs(np.fft.rfft(frames, axis=1))\nprint(spec.shape)',
    options: ['`(98, 201)`', '`(98, 400)`', '`(97, 201)`', '`(201, 98)`'],
    answer: 0,
    explanation:
      'Frames: $1 + \\lfloor (16000 - 400)/160 \\rfloor = 1 + \\lfloor 97.5 \\rfloor = 98$. Each row of 400 samples goes through `rfft`, which returns $400/2 + 1 = 201$ frequency bins, so the shape is `(98, 201)`. `(98, 400)` forgets that `rfft` keeps only frequencies up to the Nyquist limit, and `(97, 201)` drops the "1 +" for the first window.',
    difficulty: 'intermediate',
  },
  {
    id: 'pretrained-models-text-speech.audio-as-data.5',
    prompt: 'Why do speech models such as Whisper take a log-mel spectrogram rather than a plain spectrogram with a linear frequency axis?',
    options: [
      'Mel spacing gives more rows to low frequencies, where hearing and speech detail are finest, and the log brings quiet and loud sounds to a similar scale',
      'Mel spacing raises the Nyquist limit so that frequencies above half the sampling rate can be kept, and the log removes background noise',
      'Mel spacing gives more rows to high frequencies, where most speech information sits, and the log makes every frame the same length',
      'Mel spacing replaces the Fourier transform so no windows are needed, and the log converts the image back into a waveform',
    ],
    answer: 0,
    explanation:
      'The mel scale, $2595\\log_{10}(1 + f/700)$, is nearly linear below 1 kHz and squeezed above it, so mel filters are narrow at low frequencies and wide at high ones, matching human hearing. The log (decibels) compresses a huge range of loudness so quiet consonants stay visible. Nothing can raise the Nyquist limit after sampling, and mel filters are applied to the Fourier transform output; they do not replace it.',
    difficulty: 'intermediate',
  },
]

export default questions
