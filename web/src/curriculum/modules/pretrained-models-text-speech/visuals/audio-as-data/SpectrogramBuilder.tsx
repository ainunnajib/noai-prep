import { useEffect, useMemo, useRef, useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Toggle, usePlayer, PlayerControls, useContainerWidth, useNarrow } from '../../../../../kit'
import {
  applyFilterbank,
  demoClip,
  FONT,
  frameCount,
  hzToMel,
  matrixToCanvas,
  melFilterbank,
  prepCanvas,
  rgbCss,
  spectroLUT,
  stftPower,
  toUnitDb,
  toUnitLinear,
  useAudioTheme,
} from './dsp'

/*
  Build a spectrogram by hand: slide a short window along a synthetic clip (a chirp, a steady
  1,000 Hz tone and a click), Fourier-transform each slice, and stack the results as columns.
  Window/hop, mel scaling and log amplitude are all computed live from the same clip.
*/

const SR = 8000
const N_MELS = 32
const FMAX = SR / 2

export default function SpectrogramBuilder() {
  const [winMs, setWinMs] = useState(32)
  const [hopMs, setHopMs] = useState(10)
  const [mel, setMel] = useState(false)
  const [logAmp, setLogAmp] = useState(true)
  const [wrapRef, width] = useContainerWidth<HTMLDivElement>(560)
  const [narrowRef, narrow] = useNarrow<HTMLDivElement>(480)
  const cvRef = useRef<HTMLCanvasElement>(null)
  const theme = useAudioTheme()

  const clip = useMemo(() => demoClip(SR, 1), [])
  const win = (winMs * SR) / 1000
  const hop = (hopMs * SR) / 1000
  const F = frameCount(clip.length, win, hop)
  const power = useMemo(() => stftPower(clip, win, hop, win), [clip, win, hop])
  const fb = useMemo(() => melFilterbank(N_MELS, win, SR, FMAX), [win])
  const data = useMemo(() => {
    const m = mel ? applyFilterbank(power, fb) : power
    return logAmp ? toUnitDb(m, 70) : toUnitLinear(m)
  }, [power, fb, mel, logAmp])
  const R = data[0]?.length ?? 0

  const player = usePlayer({ steps: F, interval: 35 })
  const started = useRef(false)
  useEffect(() => {
    if (!started.current) {
      started.current = true
      player.setStep(Math.floor(F * 0.45))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const cur = Math.min(player.step, F - 1)

  // layout (CSS px)
  const W = Math.max(300, width)
  const L = 46
  const S = narrow ? 64 : 104 // spectrum panel width
  const GAP = 12
  const plotW = W - L - S - GAP - 4
  const waveTop = 20
  const waveH = narrow ? 52 : 64
  const specTop = waveTop + waveH + 30
  const specH = narrow ? 150 : 196
  const H = specTop + specH + 34

  const tx = (t: number) => L + t * plotW // t in seconds, clip is 1 s
  const lut = useMemo(() => spectroLUT(theme), [theme])
  // the offscreen image is built in the draw effect (never during render), and rebuilt only when data or colours change
  const imgCache = useRef<{ data: unknown; lut: unknown; cv: HTMLCanvasElement | null }>({ data: null, lut: null, cv: null })

  useEffect(() => {
    const ctx = prepCanvas(cvRef.current, W, H)
    if (!ctx) return
    if (imgCache.current.data !== data || imgCache.current.lut !== lut) imgCache.current = { data, lut, cv: matrixToCanvas(data, lut) }
    const img = imgCache.current.cv
    const ink = rgbCss(theme.ink)
    const ink2 = rgbCss(theme.ink2)
    const axis = rgbCss(theme.axis)
    const acc = rgbCss(theme.v2)

    // ---- waveform (min/max per pixel) ----
    const mid = waveTop + waveH / 2
    const amp = waveH / 2 / 1.25
    ctx.strokeStyle = rgbCss(theme.v1)
    ctx.lineWidth = 1
    ctx.beginPath()
    const px = Math.max(1, Math.floor(plotW))
    for (let p = 0; p < px; p++) {
      const a = Math.floor((p / px) * clip.length)
      const b = Math.max(a + 1, Math.floor(((p + 1) / px) * clip.length))
      let lo = Infinity
      let hi = -Infinity
      for (let i = a; i < b; i++) {
        if (clip[i] < lo) lo = clip[i]
        if (clip[i] > hi) hi = clip[i]
      }
      ctx.moveTo(L + p + 0.5, mid - hi * amp)
      ctx.lineTo(L + p + 0.5, mid - lo * amp + 0.5)
    }
    ctx.stroke()
    // current window + its Hann shape
    const w0 = (cur * hop) / SR
    const w1 = (cur * hop + win) / SR
    ctx.fillStyle = rgbCss(theme.v2, 0.18)
    ctx.fillRect(tx(w0), waveTop - 2, Math.max(2, tx(w1) - tx(w0)), waveH + 4)
    ctx.strokeStyle = acc
    ctx.lineWidth = 2
    ctx.strokeRect(tx(w0), waveTop - 2, Math.max(2, tx(w1) - tx(w0)), waveH + 4)
    ctx.beginPath()
    for (let i = 0; i <= 30; i++) {
      const u = i / 30
      const hv = 0.5 - 0.5 * Math.cos(2 * Math.PI * u)
      const xx = tx(w0) + u * (tx(w1) - tx(w0))
      const yy = waveTop + waveH + 2 - hv * (waveH + 2)
      if (i) ctx.lineTo(xx, yy)
      else ctx.moveTo(xx, yy)
    }
    ctx.setLineDash([3, 3])
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.setLineDash([])

    ctx.font = `700 11px ${FONT}`
    ctx.fillStyle = ink2
    ctx.textBaseline = 'alphabetic'
    ctx.textAlign = 'left'
    ctx.fillText(narrow ? 'waveform (8,000 samples/s)' : 'waveform (1 s at 8,000 samples/s)', L, 12)
    ctx.textAlign = 'right'
    ctx.fillStyle = acc
    ctx.fillText(narrow ? `${cur + 1}/${F}` : `window ${cur + 1} of ${F}`, L + plotW, 12)

    // connector from window to column
    const colT0 = (cur * hop + win / 2 - hop / 2) / SR
    const colT1 = colT0 + hop / SR
    const colMid = tx((colT0 + colT1) / 2)
    ctx.strokeStyle = rgbCss(theme.v2, 0.8)
    ctx.setLineDash([2, 3])
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.moveTo(tx((w0 + w1) / 2), waveTop + waveH + 3)
    ctx.lineTo(colMid, specTop - 2)
    ctx.stroke()
    ctx.setLineDash([])

    // ---- spectrogram image ----
    const imgT0 = (win / 2 - hop / 2) / SR
    const imgX0 = tx(imgT0)
    const imgW = (F * hop * plotW) / SR
    ctx.fillStyle = rgbCss(theme.surface2)
    ctx.fillRect(L, specTop, plotW, specH)
    if (img) {
      ctx.imageSmoothingEnabled = false
      ctx.save()
      ctx.beginPath()
      ctx.rect(L, specTop, plotW, specH)
      ctx.clip()
      ctx.globalAlpha = 0.2
      ctx.drawImage(img, imgX0, specTop, imgW, specH)
      ctx.globalAlpha = 1
      ctx.beginPath()
      ctx.rect(L, specTop, Math.max(0, tx(colT1) - L), specH)
      ctx.clip()
      ctx.drawImage(img, imgX0, specTop, imgW, specH)
      ctx.restore()
    }
    ctx.strokeStyle = axis
    ctx.lineWidth = 1
    ctx.strokeRect(L - 0.5, specTop - 0.5, plotW + 1, specH + 1)
    ctx.strokeStyle = acc
    ctx.lineWidth = 2
    ctx.strokeRect(tx(colT0) - 1, specTop - 1, Math.max(2, tx(colT1) - tx(colT0)) + 2, specH + 2)

    // frequency ticks
    const yOf = (f: number) => {
      if (!mel) return specTop + specH - (f / FMAX) * specH
      const mMax = hzToMel(FMAX)
      const pos = (hzToMel(f) / mMax) * (N_MELS + 1) - 1
      const u = Math.max(0, Math.min(1, (pos + 0.5) / N_MELS))
      return specTop + specH - u * specH
    }
    const ticks = mel ? [0, 250, 500, 1000, 2000, 4000] : [0, 1000, 2000, 3000, 4000]
    ctx.font = `600 10.5px ${FONT}`
    ctx.fillStyle = ink2
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    ctx.strokeStyle = axis
    for (const f of ticks) {
      const y = yOf(f)
      ctx.beginPath()
      ctx.moveTo(L - 4, y)
      ctx.lineTo(L, y)
      ctx.stroke()
      ctx.fillText(f >= 1000 ? `${f / 1000}k` : String(f), L - 6, y)
    }
    ctx.save()
    ctx.translate(11, specTop + specH / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = 'center'
    ctx.font = `700 11px ${FONT}`
    ctx.fillText(mel ? 'frequency (Hz, mel-spaced)' : 'frequency (Hz)', 0, 0)
    ctx.restore()

    // time ticks
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'
    ctx.font = `600 10.5px ${FONT}`
    for (const t of [0, 0.25, 0.5, 0.75, 1]) {
      const x = tx(t)
      ctx.beginPath()
      ctx.moveTo(x, specTop + specH)
      ctx.lineTo(x, specTop + specH + 4)
      ctx.stroke()
      ctx.fillText(String(t), x, specTop + specH + 16)
    }
    ctx.textAlign = 'right'
    ctx.font = `700 11px ${FONT}`
    ctx.fillText('time (s)', L + plotW, specTop + specH + 30)
    ctx.textAlign = 'left'
    ctx.fillText(mel ? `mel spectrogram (${N_MELS} rows)` : `spectrogram (${R} rows)`, L, specTop - 8)
    ctx.textAlign = 'left'

    // ---- spectrum of the current window (frequency upwards, aligned with the rows) ----
    const sx = L + plotW + GAP
    ctx.fillStyle = rgbCss(theme.surface2)
    ctx.fillRect(sx, specTop, S, specH)
    const col = data[cur]
    if (col) {
      const rowH = specH / R
      ctx.fillStyle = acc
      for (let r = 0; r < R; r++) {
        const v = col[r]
        if (v <= 0.002) continue
        const y = specTop + specH - (r + 1) * rowH
        ctx.fillRect(sx, y, v * (S - 4), Math.max(rowH - (R <= 64 ? 0.6 : 0), 0.8))
      }
    }
    ctx.strokeStyle = axis
    ctx.strokeRect(sx - 0.5, specTop - 0.5, S + 1, specH + 1)
    ctx.fillStyle = acc
    ctx.textAlign = 'left'
    ctx.font = `700 11px ${FONT}`
    ctx.fillText(narrow ? 'window' : 'this window', sx, specTop - 8)
    ctx.fillStyle = ink2
    ctx.font = `600 10.5px ${FONT}`
    ctx.fillText(logAmp ? (narrow ? 'level (dB)' : 'loudness (dB)') : narrow ? 'level' : 'loudness', sx, specTop + specH + 16)
    ctx.fillStyle = ink
  }, [W, H, theme, clip, cur, win, hop, F, lut, data, R, mel, logAmp, narrow, plotW, S, specH, specTop, waveH])

  const onPick = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - r.left
    const t = (x - L) / plotW
    if (t < 0 || t > 1) return
    const c = Math.round((t * SR - win / 2) / hop)
    player.pause()
    player.setStep(Math.max(0, Math.min(F - 1, c)))
  }

  const bins = win / 2 + 1
  return (
    <Figure
      title="Build a spectrogram one window at a time"
      caption={
        <>
          Press <b>Play</b> and watch each window become one column. Then try the <b>64 ms</b> window (sharp tone line, smeared click) and
          <b> 16 ms</b> (sharp click, fat lines); no window size is sharp in both.
        </>
      }
    >
      <div ref={narrowRef} style={{ width: '100%' }}>
        <div ref={wrapRef} style={{ width: '100%' }}>
          <canvas
            ref={cvRef}
            role="img"
            aria-label={`Waveform with a sliding window, and the ${mel ? 'mel ' : ''}spectrogram built from it: ${R} frequency rows by ${F} time frames`}
            style={{ width: W, height: H, display: 'block', maxWidth: '100%', touchAction: 'manipulation', cursor: 'pointer' }}
            onPointerDown={onPick}
          />
        </div>
      </div>
      <PlayerControls player={player} label={(s) => `t = ${(((Math.min(s, F - 1) * hop + win / 2) / SR) * 1000).toFixed(0)} ms`} />
      <Controls>
        <Slider label="window position" value={cur} min={0} max={F - 1} step={1} onChange={(v) => (player.pause(), player.setStep(v))} format={(v) => `${v + 1} / ${F}`} />
        <Segmented
          label="window"
          value={winMs}
          onChange={setWinMs}
          options={[
            { value: 16, label: '16 ms' },
            { value: 32, label: '32 ms' },
            { value: 64, label: '64 ms' },
          ]}
        />
        <Segmented
          label="hop"
          value={hopMs}
          onChange={setHopMs}
          options={[
            { value: 5, label: '5 ms' },
            { value: 10, label: '10 ms' },
            { value: 20, label: '20 ms' },
          ]}
        />
        <Toggle label="log amplitude (dB)" checked={logAmp} onChange={setLogAmp} />
        <Toggle label={`mel scale (${N_MELS} bands)`} checked={mel} onChange={setMel} />
        <Readout
          items={[
            ['window', `${win} samples`],
            ['hop', `${hop} samples`],
            ['frames', `1 + ⌊(8000 − ${win}) / ${hop}⌋ = ${F}`],
            ['rows', mel ? `${N_MELS} mel bands` : `${win}/2 + 1 = ${bins}`],
            ['image', `${R} × ${F}`],
          ]}
        />
      </Controls>
    </Figure>
  )
}
