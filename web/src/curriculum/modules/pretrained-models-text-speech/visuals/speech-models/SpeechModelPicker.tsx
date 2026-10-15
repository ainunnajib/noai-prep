import { useState } from 'react'
import { Figure, Controls, Readout, Button, useNarrow } from '../../../../../kit'
import s from './sm.module.css'

/*
  Pick the right kind of speech model for a job: an audio encoder with a small head (HuBERT, wav2vec 2.0, AST),
  an encoder-decoder speech recogniser (Whisper), or an audio LLM (Qwen-Audio, Voxtral).
*/

type Family = 'encoder' | 'whisper' | 'llm'

const FAMILIES: { id: Family; name: string; sub: string }[] = [
  { id: 'encoder', name: 'Audio encoder + head', sub: 'HuBERT, wav2vec 2.0, AST: one label per clip' },
  { id: 'whisper', name: 'Speech recogniser', sub: 'Whisper (encoder-decoder): speech → text' },
  { id: 'llm', name: 'Audio LLM', sub: 'Qwen-Audio, Voxtral: audio + question → answer' },
]

const SCENARIOS: { short: string; text: string; answer: Family; why: string; code: string }[] = [
  {
    short: 'Lecture subtitles',
    text: 'Write subtitles for a one-hour recorded lecture in English.',
    answer: 'whisper',
    why: 'The output is the exact words, in order: a sequence-to-sequence job. Whisper is trained for exactly this and works through long audio 30 seconds at a time. An audio LLM could do it, but it is much bigger and slower for plain transcription.',
    code: 'asr = pipeline("automatic-speech-recognition",\n               model="openai/whisper-small")\nasr("lecture.wav", return_timestamps=True)',
  },
  {
    short: 'Angry callers',
    text: 'Flag angry callers from 5-second clips. You have 2,000 clips labelled calm or angry.',
    answer: 'encoder',
    why: 'The output is one label per clip. Take a pretrained encoder, average its frame vectors into one clip vector, add a small linear head and fine-tune on your 2,000 labels. It is small and fast, and the labels teach it exactly what you want.',
    code: 'clf = pipeline("audio-classification",\n               model="superb/hubert-base-superb-er")\nclf("call.wav")   # emotion labels with scores',
  },
  {
    short: 'Mandarin → English',
    text: 'Turn a Mandarin voice message into English text.',
    answer: 'whisper',
    why: 'Whisper can translate speech straight into English text: set the language token to Mandarin and the task token to translate. No separate translation model is needed. (Whisper only translates into English.)',
    code: 'asr("voice_note.wav",\n    generate_kwargs={"language": "chinese", "task": "translate"})',
  },
  {
    short: 'Sound questions',
    text: 'Answer free-form questions such as "What can you hear in the background, and does the speaker sound calm?"',
    answer: 'llm',
    why: 'The question is open-ended and the answer is a sentence. Whisper only writes down speech, and a classifier only picks from fixed labels. An audio LLM reads the audio tokens and the question together and writes an answer.',
    code: '# e.g. Qwen/Qwen2-Audio-7B-Instruct or mistralai/Voxtral-Mini-3B-2507\n# prompt = [audio] + "What can you hear in the background?"',
  },
  {
    short: 'Who is speaking?',
    text: 'Recognise which of 50 CCA members is speaking, from short recordings of each member.',
    answer: 'encoder',
    why: 'Speaker identity is a property of the whole clip, so use clip embeddings from a pretrained encoder (HuBERT or wav2vec 2.0 layers carry a lot of speaker information) and train a 50-way classifier on top. A transcript would throw away the voice itself.',
    code: 'h = encoder(wave).last_hidden_state  # (batch, frames, 768)\nclip = h.mean(dim=1)                 # (batch, 768)\nlogits = head(clip)                  # head = nn.Linear(768, 50)',
  },
  {
    short: 'Meeting summary',
    text: 'Summarise a 20-minute meeting recording and list the action items.',
    answer: 'llm',
    why: 'Summarising needs language understanding on top of hearing. An audio LLM does both in one step (20 min is 15,000 audio tokens at 12.5 per second, which fits a 32k context). Whisper alone only gives a transcript, which you would then pass to a text LLM: a workable two-step "cascade".',
    code: '# audio LLM: [audio tokens] + "Summarise this meeting and list the action items."',
  },
  {
    short: 'Wake word',
    text: 'Detect the wake word "Hey Merlion" on a phone, offline, many times per second.',
    answer: 'encoder',
    why: 'Keyword spotting is classification on short clips ("wake word" or "not"), and it must be tiny and fast. A small audio encoder with a classification head fits; running Whisper or an LLM non-stop on a phone would be far too slow.',
    code: 'kws = pipeline("audio-classification",\n               model="superb/hubert-base-superb-ks")\nkws("clip.wav")   # keyword labels with scores',
  },
]

export default function SpeechModelPicker() {
  const [i, setI] = useState(0)
  const [picks, setPicks] = useState<Record<number, Family>>({})
  const [ref, narrow] = useNarrow<HTMLDivElement>(560)
  const sc = SCENARIOS[i]
  const pick = picks[i]
  const right = Object.entries(picks).filter(([k, v]) => SCENARIOS[Number(k)].answer === v).length

  return (
    <Figure
      title="Which speech model would you use?"
      caption={
        <>
          Choose a model family for each job, then read why. The rule of thumb: <b>a label per clip</b> → encoder + head;{' '}
          <b>the words that were said</b> → Whisper; <b>an open-ended answer about the sound</b> → audio LLM.
        </>
      }
    >
      <div ref={ref} className={s.stack}>
        <div className={s.scenarios} role="tablist" aria-label="Scenarios">
          {SCENARIOS.map((x, j) => (
            <button
              key={x.short}
              type="button"
              role="tab"
              aria-selected={j === i}
              className={`${s.scenario} ${j === i ? s.scenarioOn : ''} ${picks[j] ? s.scenarioDone : ''}`}
              onClick={() => setI(j)}
            >
              {j + 1}. {x.short}
            </button>
          ))}
        </div>
        <p className={s.hint} style={{ fontSize: '1rem', color: 'var(--ink)' }}>
          <b>Job {i + 1}:</b> {sc.text}
        </p>
        <div className={`${s.choices} ${narrow ? s.choicesNarrow : ''}`}>
          {FAMILIES.map((f) => {
            const chosen = pick === f.id
            const cls = pick ? (f.id === sc.answer ? s.choiceRight : chosen ? s.choiceWrong : '') : ''
            return (
              <button key={f.id} type="button" className={`${s.choice} ${cls}`} onClick={() => setPicks((p) => ({ ...p, [i]: f.id }))} aria-pressed={chosen}>
                <span className={s.choiceName}>{f.name}</span>
                <span className={s.choiceSub}>{f.sub}</span>
              </button>
            )
          })}
        </div>
        {pick ? (
          <div className={s.panel} aria-live="polite">
            <p className={`${s.verdict} ${pick === sc.answer ? s.verdictRight : s.verdictWrong}`} style={{ margin: '0 0 0.3rem' }}>
              {pick === sc.answer ? 'Good choice.' : `Better: ${FAMILIES.find((f) => f.id === sc.answer)!.name.toLowerCase()}.`}
            </p>
            <p className={s.hint}>{sc.why}</p>
            <pre className={s.code}>{sc.code}</pre>
          </div>
        ) : (
          <p className={s.small}>Pick one of the three families to see the reasoning.</p>
        )}
      </div>
      <Controls>
        <Button onClick={() => setI((i + SCENARIOS.length - 1) % SCENARIOS.length)}>Previous job</Button>
        <Button primary onClick={() => setI((i + 1) % SCENARIOS.length)}>
          Next job
        </Button>
        <Readout
          items={[
            ['answered', `${Object.keys(picks).length} / ${SCENARIOS.length}`],
            ['correct', String(right)],
          ]}
        />
      </Controls>
    </Figure>
  )
}
