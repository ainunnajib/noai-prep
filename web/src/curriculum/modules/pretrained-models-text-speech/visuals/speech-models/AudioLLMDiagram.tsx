import { useState, type ReactNode } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, useNarrow } from '../../../../../kit'
import { fmtInt } from '../audio-as-data/dsp'
import s from './sm.module.css'

/*
  An audio LLM (Qwen-Audio / Voxtral style): audio encoder → projector → audio tokens placed next to text tokens → LLM.
  Click a block to see what it does; switch the training stage to see which parts are typically frozen.
  Shapes follow a Voxtral-style design: a Whisper-large-v3-style encoder (1,280-d, 50 vectors per second),
  4 neighbouring vectors glued together and projected to the LLM's width (4,096 here, as in a 7B LLM).
*/

type Part = 'audio' | 'encoder' | 'projector' | 'sequence' | 'llm' | 'answer'
type Stage = 'align' | 'instruct'
type Status = 'frozen' | 'trained' | 'none'

const D_ENC = 1280
const D_LLM = 4096
const PER_SEC = 12.5 // audio tokens per second after 4× downsampling (50 → 12.5)
const CONTEXT = 32768
const PROMPT = ['Which', 'station', 'is', 'the', 'train', 'going', 'to', '?']

const STATUS: Record<Stage, Record<Part, Status>> = {
  align: { audio: 'none', encoder: 'frozen', projector: 'trained', sequence: 'none', llm: 'frozen', answer: 'none' },
  instruct: { audio: 'none', encoder: 'frozen', projector: 'trained', sequence: 'none', llm: 'trained', answer: 'none' },
}

export default function AudioLLMDiagram() {
  const [part, setPart] = useState<Part>('projector')
  const [stage, setStage] = useState<Stage>('align')
  const [mins, setMins] = useState(0.5)
  const [ref, narrow] = useNarrow<HTMLDivElement>(600)

  const secs = mins * 60
  const chunks = Math.ceil(secs / 30)
  const nAudio = Math.round(secs * PER_SEC)
  const nEnc = Math.round(secs * 50)
  const total = nAudio + PROMPT.length
  const fits = total <= CONTEXT

  const badge = (p: Part) => {
    const st = STATUS[stage][p]
    if (st === 'none') return null
    return <span className={`${s.badge} ${st === 'frozen' ? s.badgeFrozen : s.badgeTrained}`}>{st}</span>
  }

  const info: Record<Part, { title: string; body: ReactNode }> = {
    audio: {
      title: 'Audio in',
      body: (
        <>
          The sound is resampled to 16 kHz and cut into 30-second chunks, each turned into a log-mel spectrogram (128 × 3,000 for a
          Whisper-large-v3-style encoder). A {mins < 1 ? `${secs}-second` : `${mins}-minute`} clip is {fmtInt(secs * 16000)} samples in{' '}
          {chunks} chunk{chunks > 1 ? 's' : ''}.
        </>
      ),
    },
    encoder: {
      title: 'Audio encoder',
      body: (
        <>
          A pretrained speech encoder, usually <b>Whisper's encoder</b> (Qwen-Audio and Voxtral both start from one). It turns each 30 s chunk into 1,500
          vectors of size {fmtInt(D_ENC)}: 50 per second. It already "understands" speech, so it is usually <b>kept frozen</b>, or only lightly tuned. (Qwen-Audio
          is an exception: it trained its encoder in the first stage while keeping the LLM frozen.)
        </>
      ),
    },
    projector: {
      title: 'Projector (adapter)',
      body: (
        <>
          The small, newly trained bridge. It glues 4 neighbouring encoder vectors together (4 × {fmtInt(D_ENC)} = {fmtInt(4 * D_ENC)} numbers) and an MLP
          maps them to the LLM's embedding size ({fmtInt(D_LLM)} here). That cuts 50 vectors per second to <b>12.5 audio tokens per second</b>, each a vector
          the LLM can read like a word embedding. It has about 38 million parameters, tiny next to a 7-billion-parameter LLM, and it is trained in
          every stage.
        </>
      ),
    },
    sequence: {
      title: 'One mixed sequence',
      body: (
        <>
          The audio tokens are placed in the LLM's input next to the embeddings of the text prompt, like extra words. From here on the LLM does
          not know which inputs came from sound: it simply attends over all {fmtInt(total)} vectors.
        </>
      ),
    },
    llm: {
      title: 'LLM decoder',
      body: (
        <>
          A pretrained decoder-only language model (Qwen-7B for Qwen-Audio; Mistral models for Voxtral). It generates the answer one token at a time,
          attending to audio and text tokens alike. It is <b>frozen while the projector learns to align</b>, then fine-tuned (often with LoRA) on audio
          instruction data so it follows spoken requests and answers questions about sounds.
        </>
      ),
    },
    answer: {
      title: 'Text out',
      body: (
        <>
          Ordinary text tokens: "The train is going to Jurong East." The same model can transcribe, translate, summarise a meeting, or describe
          non-speech sounds (a siren, rain, music), depending only on the prompt.
        </>
      ),
    },
  }

  const blocks: { id: Part; name: string; sub: string }[] = [
    { id: 'audio', name: `Audio clip (${mins < 1 ? `${secs} s` : `${mins} min`})`, sub: `${fmtInt(secs * 16000)} samples → log-mel (128, 3000) per 30 s chunk` },
    { id: 'encoder', name: 'Audio encoder (Whisper-style)', sub: `→ (${nEnc}, ${D_ENC}): 50 vectors per second` },
    { id: 'projector', name: 'Projector: stack 4, then MLP', sub: `(${nEnc / 4}, ${4 * D_ENC}) → (${nAudio}, ${D_LLM})` },
    { id: 'sequence', name: 'Audio tokens + text prompt', sub: `(${nAudio} + ${PROMPT.length}, ${D_LLM}) = (${total}, ${D_LLM})` },
    { id: 'llm', name: 'LLM decoder', sub: 'generates the answer token by token' },
    { id: 'answer', name: 'Answer (text)', sub: '"The train is going to Jurong East."' },
  ]

  const used = Math.min(100, (total / CONTEXT) * 100)

  const infoPanel = (
    <div className={s.panel} aria-live="polite">
      <p className={s.panelTitle}>{info[part].title}</p>
      <p className={s.hint}>{info[part].body}</p>
      <p className={s.small}>
        Stage {stage === 'align' ? '1 (alignment, on speech–text pairs such as transcripts)' : '2 (instruction tuning, on audio question–answer pairs)'}:{' '}
        {STATUS[stage][part] === 'none' ? 'no weights here.' : <b>{STATUS[stage][part]}.</b>}
      </p>
    </div>
  )

  return (
    <Figure
      title="An audio LLM: a speech encoder, a small adapter and an LLM"
      caption={
        <>
          Click any block to see what it does and its tensor shape. Switch the <b>training stage</b>: in stage 1 only the small projector learns
          (both big pretrained parts stay frozen); in stage 2 the LLM is fine-tuned too. Drag the audio length: every second of sound costs 12.5
          tokens of the LLM's context. Shapes follow a Voxtral-style design.
        </>
      }
    >
      <div ref={ref} className={`${s.cols} ${narrow ? s.colsNarrow : ''}`}>
        <div className={s.flow} role="list" aria-label="Audio LLM components">
          {blocks.map((b, i) => (
            <div key={b.id} role="listitem">
              {i > 0 && <div className={s.down}>↓</div>}
              <button type="button" className={`${s.block} ${part === b.id ? s.blockOn : ''}`} onClick={() => setPart(b.id)} aria-pressed={part === b.id}>
                <span className={s.blockName}>{b.name}</span>
                {badge(b.id) ?? <span />}
                <span className={s.blockSub}>{b.sub}</span>
                {b.id === 'sequence' && (
                  <span className={s.tokens} style={{ gridColumn: '1 / -1', marginTop: '0.3rem' }}>
                    {['a1', 'a2', '…', `a${nAudio}`].map((t, j) => (
                      <span key={j} className={`${s.tok} ${s.tokAudio}`}>
                        {t}
                      </span>
                    ))}
                    {PROMPT.slice(0, narrow ? 4 : 8).map((t, j) => (
                      <span key={`p${j}`} className={s.tok} style={{ fontSize: '0.8rem', minHeight: '1.6rem' }}>
                        {t}
                      </span>
                    ))}
                    {narrow && <span className={s.tok} style={{ fontSize: '0.8rem', minHeight: '1.6rem' }}>…</span>}
                  </span>
                )}
              </button>
              {/* on phones the explanation opens right under the tapped block, instead of below the whole flow */}
              {narrow && part === b.id && <div style={{ marginTop: '0.4rem' }}>{infoPanel}</div>}
            </div>
          ))}
        </div>
        <div className={s.stack}>
          {!narrow && infoPanel}
          <div className={s.panel}>
            <p className={s.panelTitle}>Context budget (32,768 tokens)</p>
            <div className={s.meter} role="img" aria-label={`${used.toFixed(0)}% of the context used`}>
              <span className={s.meterFill} style={{ width: `${used}%`, background: fits ? 'var(--viz-5)' : 'var(--viz-neg)' }} />
            </div>
            <p className={s.small}>
              {fmtInt(secs)} s × 12.5 = {fmtInt(nAudio)} audio tokens + {PROMPT.length} prompt tokens ={' '}
              <b style={{ color: fits ? undefined : 'var(--viz-neg)' }}>
                {fmtInt(total)} ({used.toFixed(0)}%){fits ? '' : ': too long, split the audio'}
              </b>
            </p>
          </div>
        </div>
      </div>
      <Controls>
        <Segmented
          label="training stage"
          value={stage}
          onChange={(v) => setStage(v)}
          options={[
            { value: 'align', label: '1 · align' },
            { value: 'instruct', label: '2 · instruction-tune' },
          ]}
        />
        <Slider label="audio length" value={mins} min={0.5} max={50} step={0.5} onChange={setMins} format={(v) => (v < 1 ? `${v * 60} s` : `${v} min`)} />
        <Readout
          items={[
            ['audio tokens', fmtInt(nAudio)],
            ['per second', '12.5'],
          ]}
        />
      </Controls>
    </Figure>
  )
}
