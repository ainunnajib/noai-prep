import { useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Toggle, Button, useNarrow } from '../../../../../kit'
import { traceNet, catError, type Pad } from './netShapes'
import { OutBox } from '../torch-exam-patterns/code'
import u from './unet.module.css'

/*
  The feature-map size after every layer of the 2026 Task 2 network, as a table with a bar per row
  (bar length = H / input size). Toggle padding between 0 ("valid", what the intern did) and 1
  ("same"), change the input size, and switch the centre crop on to see the network run to the end.
*/

export default function ShapeShrinkTable() {
  const [pad, setPad] = useState<Pad>(0)
  const [n, setN] = useState(256)
  const [crop, setCrop] = useState(false)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(520)
  const t = traceNet(n, pad, crop ? 'crop' : 'none')
  const mismatch = !t.tooSmall && t.x2 !== t.d1
  const crashed = mismatch && t.joined == null
  const pct = (h: number) => `${Math.max(0, Math.min(100, (h / n) * 100))}%`

  const colour = (role?: string) =>
    role === 'skip' ? 'var(--viz-2)' : role === 'up' ? 'var(--viz-3)' : role === 'cat' ? 'var(--viz-4)' : role === 'out' ? 'var(--viz-5)' : 'var(--viz-1)'

  return (
    <Figure
      wide
      title="Where the sizes go: every layer of the Task 2 network"
      caption={
        <>
          Each bar is a feature map's height as a fraction of the input. With <b>padding 0</b> every 3 × 3 conv shaves 2 pixels, so the skip map <code>x2</code>{' '}
          (orange) ends up bigger than the upsampled map <code>d1</code> (green) and <code>torch.cat</code> fails. Switch to <b>padding 1</b>: the convs stop
          shrinking and the two meet at 128. Then try padding 1 with input 250, where pooling's rounding down breaks the match anyway, or switch the centre crop on.
        </>
      }
    >
      <div ref={wrapRef} className={narrow ? u.narrow : ''} style={{ width: '100%', display: 'grid', gap: '0.8rem' }}>
        <Controls>
          <Segmented
            label="padding in every 3×3 conv"
            options={[
              { value: 0, label: '0 (valid)' },
              { value: 1, label: '1 (same)' },
            ]}
            value={pad}
            onChange={(v) => setPad(v as Pad)}
          />
          <Toggle label="crop x2 with center_crop" checked={crop} onChange={setCrop} />
        </Controls>
        <Controls>
          <Slider label="input size (H = W)" value={n} min={40} max={320} step={1} onChange={setN} format={(v) => `${v} × ${v}`} />
          <Button onClick={() => setN(256)}>256</Button>
          <Button onClick={() => setN(128)}>128</Button>
          <Button onClick={() => setN(250)}>250</Button>
        </Controls>
        <div className={u.table} role="table" aria-label="Feature-map shape after every layer">
          <div className={`${u.tr} ${u.th}`} role="row">
            <span role="columnheader">layer</span>
            {!narrow && <span role="columnheader">operation</span>}
            <span role="columnheader">{narrow ? 'C × H (H = W)' : 'shape (C × H × W)'}</span>
            <span role="columnheader">H compared with the input</span>
          </div>
          <div className={u.tr} role="row">
            <span className={u.name}>input x</span>
            {!narrow && <span className={u.op}>3 colour channels</span>}
            <span className={u.shape}>{narrow ? `3 × ${n}` : `3 × ${n} × ${n}`}</span>
            <span className={u.barTrack}>
              <span className={u.bar} style={{ width: '100%', background: 'var(--viz-muted)' }} />
            </span>
          </div>
          {t.rows.map((r) => (
            <div key={r.name} role="row" className={`${u.tr} ${r.role === 'skip' || r.role === 'up' ? u.trKey : ''} ${r.role === 'cat' ? u.trOk : ''}`}>
              <span className={u.name}>{r.name}</span>
              {!narrow && <span className={u.op}>{r.op}</span>}
              <span className={u.shape}>{r.h >= 1 ? (narrow ? `${r.c} × ${r.h}` : `${r.c} × ${r.h} × ${r.h}`) : 'too small'}</span>
              <span className={u.barTrack}>
                {r.role === 'cat' && t.x2 !== t.d1 && (
                  <span className={u.ghost} style={{ width: pct(t.x2) }} title="x2 before the crop" />
                )}
                <span className={u.bar} style={{ width: pct(r.h), background: colour(r.role) }} />
              </span>
            </div>
          ))}
          {crashed && (
            <div className={`${u.tr} ${u.trBad}`} role="row">
              <span className={u.name}>torch.cat</span>
              {!narrow && <span className={u.op}>join on dim 1</span>}
              <span className={u.shape} style={{ color: 'var(--bad)', fontWeight: 700 }}>
                {t.x2} ≠ {t.d1}{narrow ? '' : ': crash'}
              </span>
              <span className={u.barTrack}>
                <span className={u.bar} style={{ width: pct(t.x2), background: 'var(--viz-2)', opacity: 0.9 }} />
                <span className={u.bar} style={{ width: pct(t.d1), background: 'var(--viz-3)', marginTop: 3 }} />
              </span>
            </div>
          )}
          {crashed &&
            ['dec1_1', 'dec1_2', 'final'].map((nm) => (
              <div key={nm} className={`${u.tr} ${u.trOff}`} role="row">
                <span className={u.name}>{nm}</span>
                {!narrow && <span className={u.op}>never runs</span>}
                <span className={u.shape}>–</span>
                <span className={u.barTrack} />
              </div>
            ))}
        </div>
        {t.tooSmall && <OutBox tone="err">The input is too small: a map shrinks below 1 pixel. With padding 0 this network needs at least 40 × 40.</OutBox>}
        {crashed && <OutBox tone="err" title="forward pass">{catError(t.x2, t.d1)}</OutBox>}
        {!crashed && !t.tooSmall && t.out != null && (
          <OutBox tone="ok" title="forward pass">
            {`Input ${n} × ${n}  ->  output ${t.out} × ${t.out}, 2 class scores per pixel` +
              (t.x2 !== t.d1 ? `\n(x2 cropped from ${t.x2} to ${t.d1}: offset (${t.x2} - ${t.d1}) // 2 = ${Math.floor((t.x2 - t.d1) / 2)})` : '')}
          </OutBox>
        )}
        <Readout
          items={[
            ['skip x2', `${t.x2} × ${t.x2}`],
            ['up d1', `${t.d1} × ${t.d1}`],
            ['difference', `${t.x2 - t.d1} px`],
            ['output', t.out != null && !crashed ? `${t.out} × ${t.out}` : '–'],
          ]}
        />
      </div>
    </Figure>
  )
}
