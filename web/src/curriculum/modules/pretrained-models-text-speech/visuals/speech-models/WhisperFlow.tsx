import { useEffect, useMemo, useRef, useState } from 'react'
import { Figure, Controls, Segmented, usePlayer, PlayerControls, useContainerWidth, useNarrow, mulberry32 } from '../../../../../kit'
import { FONT, matrixToCanvas, prepCanvas, rgbCss, spectroLUT, useAudioTheme, mixRGB } from '../audio-as-data/dsp'
import { SR, logMel, synth, wordsToSegments } from './speech'
import s from './sm.module.css'

/*
  Whisper, step by step: audio → 30 s log-mel (80 × 3000) → encoder (conv stride 2 → 1500 vectors)
  → decoder that starts from special task tokens and writes one token at a time, cross-attending to the audio.
  The clips are synthetic speech-like sounds; the attention pattern is illustrative (Whisper's real
  cross-attention lines up with time in a similar way, which is how its word timestamps are found).
*/

type ClipId = 'en' | 'ms' | 'zh'
type Task = 'transcribe' | 'translate'
interface Clip {
  name: string
  lang: string
  join: string
  words: { text: string; syl: number }[]
  /** English output words, each with the source words it looks at */
  translation: [string, number[]][]
}

const CLIPS: Record<ClipId, Clip> = {
  en: {
    name: 'English',
    lang: 'en',
    join: ' ',
    words: [
      { text: 'The', syl: 1 },
      { text: 'next', syl: 1 },
      { text: 'train', syl: 1 },
      { text: 'to', syl: 1 },
      { text: 'Jurong', syl: 2 },
      { text: 'East', syl: 1 },
      { text: 'will', syl: 1 },
      { text: 'arrive', syl: 2 },
      { text: 'soon.', syl: 1 },
    ],
    translation: [],
  },
  ms: {
    name: 'Malay',
    lang: 'ms',
    join: ' ',
    words: [
      { text: 'Kereta', syl: 3 },
      { text: 'api', syl: 2 },
      { text: 'seterusnya', syl: 4 },
      { text: 'ke', syl: 1 },
      { text: 'Jurong', syl: 2 },
      { text: 'East', syl: 1 },
      { text: 'akan', syl: 2 },
      { text: 'tiba', syl: 2 },
      { text: 'sebentar', syl: 3 },
      { text: 'lagi.', syl: 2 },
    ],
    translation: [
      ['The', [0, 1]],
      ['next', [2]],
      ['train', [0, 1]],
      ['to', [3]],
      ['Jurong', [4]],
      ['East', [5]],
      ['will', [6]],
      ['arrive', [7]],
      ['soon.', [8, 9]],
    ],
  },
  zh: {
    name: 'Mandarin',
    lang: 'zh',
    join: '',
    words: [
      { text: '下一班', syl: 3 },
      { text: '开往', syl: 2 },
      { text: '裕廊东', syl: 3 },
      { text: '的', syl: 1 },
      { text: '列车', syl: 2 },
      { text: '即将', syl: 2 },
      { text: '抵达。', syl: 2 },
    ],
    translation: [
      ['The', [4]],
      ['next', [0]],
      ['train', [4]],
      ['to', [1]],
      ['Jurong', [2]],
      ['East', [2]],
      ['will', [5]],
      ['arrive', [6]],
      ['soon.', [5]],
    ],
  },
}
CLIPS.en.translation = CLIPS.en.words.map((w, i) => [w.text, [i]])

const ENC_ROWS = 12

export default function WhisperFlow() {
  const [clipId, setClipId] = useState<ClipId>('ms')
  const [task, setTask] = useState<Task>('transcribe')
  const clip = CLIPS[clipId]
  const [wrapRef, width] = useContainerWidth<HTMLDivElement>(620)
  const [narrowRef, narrow] = useNarrow<HTMLDivElement>(500)
  const cvRef = useRef<HTMLCanvasElement>(null)
  const theme = useAudioTheme()

  const audio = useMemo(() => {
    const { segs, spans, duration } = wordsToSegments(clip.words, `whisper-${clipId}`)
    const x = synth(segs, `whisper-${clipId}`)
    const mel = logMel(x) // [frames][80], frames every 10 ms
    // illustrative encoder output: fixed random projection of pairs of mel frames (stride 2), squashed with tanh
    const rng = mulberry32(99)
    const R = Array.from({ length: ENC_ROWS }, () => Array.from({ length: 80 }, () => (rng() * 2 - 1) * 0.35))
    const enc: Float64Array[] = []
    for (let p = 0; p * 2 < mel.length; p++) {
      const a = mel[2 * p]
      const b = mel[Math.min(mel.length - 1, 2 * p + 1)]
      enc.push(Float64Array.from(R, (row) => Math.tanh(row.reduce((acc, r, m) => acc + r * (a[m] + b[m] - 0.6), 0))))
    }
    return { x, mel, enc, spans, duration }
  }, [clip, clipId])

  const outputs: [string, number[]][] = task === 'transcribe' ? clip.words.map((w, i) => [w.text, [i]]) : clip.translation
  const M = outputs.length
  const STEPS = 5 + M // audio, log-mel, encoder, prompt, M tokens, end
  const player = usePlayer({ steps: STEPS, interval: 1100 })
  const st = Math.min(player.step, STEPS - 1)
  const tokIdx = st >= 4 && st < 4 + M ? st - 4 : -1
  useEffect(() => {
    // keep the learner at the decoder when switching clip/task mid-way
    if (player.step >= 4) player.setStep(3)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clipId, task])

  // attention over time (seconds) for the current output token: bumps over the source words it is aligned to
  const attn = useMemo(() => {
    if (tokIdx < 0) return null
    const nPos = audio.enc.length
    const w = new Float64Array(nPos)
    const src = outputs[tokIdx][1]
    for (let p = 0; p < nPos; p++) {
      const t = (p * 2 * 160 + 200) / SR
      let v = 0.002
      for (const wi of src) {
        const [a, b] = audio.spans[wi]
        const mid = (a + b) / 2
        const half = Math.max(0.05, (b - a) / 2)
        v += Math.exp(-(((t - mid) / (half * 0.9)) ** 4))
      }
      w[p] = v
    }
    const z = w.reduce((x, y) => x + y, 0)
    return w.map((v) => v / z)
  }, [tokIdx, audio, outputs])

  // ---- canvas ----
  const W = Math.max(300, width)
  const L = 8
  const plotW = W - 2 * L
  const rowA = 18 // waveform top
  const waveH = 40
  const miniY = rowA + waveH + 8
  const melY = miniY + 44
  const melH = narrow ? 96 : 120
  const encY = melY + melH + 24
  const encH = 30
  const attY = encY + encH + 22
  const attH = 34
  const H = attY + attH + 18
  const dur = audio.duration
  const tx = (t: number) => L + (t / dur) * plotW

  const lut = useMemo(() => spectroLUT(theme), [theme])
  const cache = useRef<{ key: unknown; lut: unknown; mel: HTMLCanvasElement | null; enc: HTMLCanvasElement | null }>({ key: null, lut: null, mel: null, enc: null })

  useEffect(() => {
    const ctx = prepCanvas(cvRef.current, W, H)
    if (!ctx) return
    if (cache.current.key !== audio || cache.current.lut !== lut) {
      const encLut = Array.from({ length: 256 }, (_, i) => {
        const v = i / 127.5 - 1
        return mixRGB(v < 0 ? theme.v1 : theme.v2, theme.surface, 0.08 + 0.85 * Math.abs(v))
      })
      cache.current = {
        key: audio,
        lut,
        mel: matrixToCanvas(audio.mel, lut),
        enc: matrixToCanvas(
          audio.enc.map((r) => Float64Array.from(r, (v) => (v + 1) / 2)),
          encLut,
        ),
      }
    }
    const ink2 = rgbCss(theme.ink2)
    const axis = rgbCss(theme.axis)
    // later stages show as a faint preview, so the whole pipeline is visible from the first frame
    const fade = (on: boolean) => (ctx.globalAlpha = on ? 1 : 0.3)
    ctx.font = `700 11px ${FONT}`
    ctx.textBaseline = 'alphabetic'

    // waveform
    fade(true)
    ctx.fillStyle = st === 0 ? rgbCss(theme.v2) : ink2
    ctx.textAlign = 'left'
    ctx.fillText(`audio: ${dur.toFixed(1)} s of speech, 16,000 samples/s`, L, 12)
    ctx.strokeStyle = rgbCss(theme.v1)
    ctx.lineWidth = 1
    ctx.beginPath()
    const xw = audio.x
    let peak = 1e-6
    for (let i = 0; i < xw.length; i++) peak = Math.max(peak, Math.abs(xw[i]))
    const px = Math.floor(plotW)
    for (let p = 0; p < px; p++) {
      const a = Math.floor((p / px) * xw.length)
      const b = Math.max(a + 1, Math.floor(((p + 1) / px) * xw.length))
      let lo = 0
      let hi = 0
      for (let i = a; i < b; i++) {
        if (xw[i] < lo) lo = xw[i]
        if (xw[i] > hi) hi = xw[i]
      }
      ctx.moveTo(L + p + 0.5, rowA + waveH / 2 - (hi / peak) * (waveH / 2))
      ctx.lineTo(L + p + 0.5, rowA + waveH / 2 - (lo / peak) * (waveH / 2) + 0.6)
    }
    ctx.stroke()
    // 30 s mini-map: speech, then padding
    const frac = dur / 30
    ctx.fillStyle = rgbCss(theme.surface2)
    ctx.fillRect(L, miniY, plotW, 8)
    ctx.fillStyle = rgbCss(theme.v1)
    ctx.fillRect(L, miniY, plotW * frac, 8)
    ctx.strokeStyle = axis
    ctx.strokeRect(L - 0.5, miniY - 0.5, plotW + 1, 9)
    ctx.font = `600 10.5px ${FONT}`
    ctx.fillStyle = ink2
    ctx.textAlign = 'left'
    ctx.fillText(narrow ? `whole 30 s window (rest = silence)` : `the whole 30 s window: speech, then padded with silence to 480,000 samples`, L + plotW * frac + 4, miniY + 19)

    // log-mel
    fade(st >= 1)
    ctx.font = `700 11px ${FONT}`
    ctx.fillStyle = st === 1 ? rgbCss(theme.v2) : ink2
    ctx.fillText(narrow ? 'log-mel: 80 rows (zoomed in)' : 'log-mel spectrogram: 80 mel rows × 3,000 frames (zoomed in on the speech)', L, melY - 6)
    if (cache.current.mel) {
      ctx.imageSmoothingEnabled = false
      const nF = audio.mel.length
      ctx.drawImage(cache.current.mel, L, melY, (nF * 0.01 * plotW) / dur, melH)
    }
    ctx.strokeStyle = axis
    ctx.strokeRect(L - 0.5, melY - 0.5, plotW + 1, melH + 1)

    // encoder strip
    fade(st >= 2)
    ctx.fillStyle = st === 2 ? rgbCss(theme.v2) : ink2
    ctx.fillText(narrow ? 'encoder: 1,500 vectors (1 per 20 ms)' : 'encoder output: 1,500 vectors, one per 20 ms (colours = a few illustrative numbers)', L, encY - 6)
    if (cache.current.enc) {
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(cache.current.enc, L, encY, (audio.enc.length * 0.02 * plotW) / dur, encH)
    }
    ctx.strokeRect(L - 0.5, encY - 0.5, plotW + 1, encH + 1)

    // cross-attention
    fade(true)
    if (attn && tokIdx >= 0) {
      const src = outputs[tokIdx][1]
      ctx.fillStyle = rgbCss(theme.v2, 0.22)
      ctx.strokeStyle = rgbCss(theme.v2)
      ctx.lineWidth = 2
      for (const wi of src) {
        const [a, b] = audio.spans[wi]
        // one box over the spectrogram, one over the encoder strip (leaving the label between them readable)
        for (const [y0, h] of [
          [melY, melH],
          [encY, encH],
        ]) {
          ctx.fillRect(tx(a), y0, tx(b) - tx(a), h)
          ctx.strokeRect(tx(a), y0, tx(b) - tx(a), h)
        }
      }
      let mx = 0
      for (const v of attn) mx = Math.max(mx, v)
      ctx.beginPath()
      for (let p = 0; p < attn.length; p++) {
        const x = tx(p * 0.02 + 0.0125)
        const y = attY + attH - (attn[p] / mx) * (attH - 2)
        if (p) ctx.lineTo(x, y)
        else ctx.moveTo(x, y)
      }
      ctx.lineTo(tx(attn.length * 0.02), attY + attH)
      ctx.lineTo(L, attY + attH)
      ctx.closePath()
      ctx.fillStyle = rgbCss(theme.v2, 0.3)
      ctx.fill()
      ctx.stroke()
      ctx.fillStyle = rgbCss(theme.v2)
      ctx.font = `700 11px ${FONT}`
      ctx.fillText(narrow ? `cross-attention of "${outputs[tokIdx][0]}" over the audio` : `cross-attention of "${outputs[tokIdx][0]}" over the 1,500 audio vectors`, L, attY - 6)
    } else {
      ctx.fillStyle = ink2
      ctx.font = `600 11px ${FONT}`
      ctx.fillText(st >= 4 ? 'done: the decoder wrote <|endoftext|>' : narrow ? 'cross-attention: shown for each word' : 'cross-attention appears when the decoder writes a word', L, attY - 6)
    }
    ctx.strokeStyle = axis
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(L, attY + attH + 0.5)
    ctx.lineTo(L + plotW, attY + attH + 0.5)
    ctx.stroke()
    // time ticks
    ctx.fillStyle = ink2
    ctx.font = `600 10px ${FONT}`
    for (let t = 0; t <= dur; t += 1) {
      ctx.textAlign = t === 0 ? 'left' : 'center'
      ctx.fillText(`${t} s`, tx(t), attY + attH + 13)
    }
  }, [W, H, theme, lut, audio, st, attn, tokIdx, outputs, narrow, dur, plotW])

  const promptToks = ['<|startoftranscript|>', `<|${clip.lang}|>`, `<|${task}|>`, '<|notimestamps|>']
  const shown = st >= 4 ? Math.min(M, st - 3) : 0
  const join = task === 'translate' ? ' ' : clip.join
  const text = outputs
    .slice(0, shown)
    .map(([w]) => w)
    .join(join)
  const stageOf = (i: number) => (i <= 2 ? i : 3)
  const STAGES = ['Audio', 'Log-mel', 'Encoder', 'Decoder']
  const hints = [
    <>Every input is cut or padded to exactly <b>30 s</b> at 16 kHz: 480,000 numbers. Short clips are padded with silence.</>,
    <>The audio becomes an <b>80 × 3,000</b> log-mel image (25 ms windows every 10 ms). This is the encoder's "source sentence".</>,
    <>Two 1-D convolutions (the second with stride 2) halve the time axis to <b>1,500</b> positions; Transformer blocks then let every position attend to every other. Output: 1,500 vectors.</>,
    <>The decoder starts from special tokens: start, the <b>language</b> ({`<|${clip.lang}|>`}) and the <b>task</b> ({`<|${task}|>`}). If you leave out the language, Whisper predicts that token first.</>,
  ]

  return (
    <Figure
      title="Whisper: from sound to text, one token at a time"
      caption={
        <>
          Press <b>Play</b>, then switch the clip's language and the task (transcribe, or translate into English). Notice the orange bump:
          each new word's cross-attention points at the audio it came from. (Synthetic clips, word-sized tokens, illustrative attention.)
        </>
      }
    >
      <div className={s.stack} ref={narrowRef}>
        <div className={s.stages} aria-label="Whisper stages">
          {STAGES.map((t, i) => (
            <span key={t} style={{ display: 'contents' }}>
              {i > 0 && <span className={s.arrow}>→</span>}
              <button
                type="button"
                className={`${s.stage} ${stageOf(st) === i ? s.stageOn : stageOf(st) > i ? s.stageDone : ''}`}
                onClick={() => (player.pause(), player.setStep(i))}
              >
                {t}
              </button>
            </span>
          ))}
        </div>
        <div ref={wrapRef} style={{ width: '100%' }}>
          <canvas
            ref={cvRef}
            role="img"
            aria-label={`Whisper pipeline for a ${clip.name} clip: waveform, 80-band log-mel spectrogram, 1,500 encoder vectors and the decoder's cross-attention`}
            style={{ width: W, height: H, display: 'block', maxWidth: '100%' }}
          />
        </div>
        <div className={s.panel}>
          <p className={s.panelTitle}>Decoder tokens</p>
          <div className={s.tokens} aria-live="polite">
            {promptToks.map((t, i) => (
              <span key={t} className={`${s.tok} ${s.tokSpecial} ${i === 1 ? s.tokLang : i === 2 ? s.tokTask : ''} ${st < 3 ? s.tokGhost : ''}`}>
                {t}
              </span>
            ))}
            {outputs.slice(0, shown).map(([w], i) => (
              <button key={i} type="button" className={`${s.tok} ${i === tokIdx ? s.tokNow : ''}`} onClick={() => (player.pause(), player.setStep(4 + i))}>
                {w}
              </button>
            ))}
            {st === STEPS - 1 && <span className={`${s.tok} ${s.tokSpecial}`}>{'<|endoftext|>'}</span>}
          </div>
          <p className={s.hint} style={{ marginTop: '0.5rem' }}>
            {st < 4 ? hints[st] : <>Output so far: <b>{text || '…'}</b></>}
          </p>
        </div>
        <PlayerControls
          player={player}
          label={(i) => (i < 3 ? STAGES[i] : i === 3 ? 'prompt tokens' : i < 4 + M ? `token ${i - 3} of ${M}` : 'end')}
        />
        <Controls>
          <Segmented
            label="clip"
            value={clipId}
            onChange={(v) => setClipId(v)}
            options={(Object.keys(CLIPS) as ClipId[]).map((k) => ({ value: k, label: CLIPS[k].name }))}
          />
          <Segmented
            label="task"
            value={task}
            onChange={(v) => setTask(v)}
            options={[
              { value: 'transcribe', label: 'transcribe' },
              { value: 'translate', label: 'translate' },
            ]}
          />
        </Controls>
      </div>
    </Figure>
  )
}
