import { useState } from 'react'
import { Figure, Controls, Toggle, Button, mulberry32, hashString, useNarrow } from '../../../../../kit'
import css from './modules.module.css'
import { Num, StepperRow } from './Steppers'

/*
  A model file is just named tensors. Yesterday's trained TinyNet (Linear(4, 8) -> ReLU -> Linear(8, 3),
  last layer called fc2) is saved with torch.save(model.state_dict(), 'model.pt'). Today the learner
  edits the class (sizes, the last layer's name) and loads the file into a fresh model2.
  The loading rules and messages mirror PyTorch 2.x load_state_dict:
    - keys in the model but not in the file are "Missing", keys in the file but not in the model are
      "Unexpected", same key with a different shape is a "size mismatch";
    - strict=True raises if there is any of the three; strict=False tolerates missing/unexpected keys
      (returning _IncompatibleKeys) but still raises on a size mismatch;
    - keys that DO match are copied even when an error is raised afterwards (a half-loaded model).
  Values are PyTorch's default nn.Linear initialisation, U(-1/sqrt(fan_in), 1/sqrt(fan_in)), drawn
  from a seeded generator; the trained model's values are just a different draw.
*/

interface Cfg {
  nIn: number
  hidden: number
  nOut: number
  last: 'fc2' | 'out'
}

interface Entry {
  key: string
  shape: number[]
  fanIn: number
}

const TRAINED: Cfg = { nIn: 4, hidden: 8, nOut: 3, last: 'fc2' }

function entries(c: Cfg): Entry[] {
  return [
    { key: 'fc1.weight', shape: [c.hidden, c.nIn], fanIn: c.nIn },
    { key: 'fc1.bias', shape: [c.hidden], fanIn: c.nIn },
    { key: `${c.last}.weight`, shape: [c.nOut, c.hidden], fanIn: c.hidden },
    { key: `${c.last}.bias`, shape: [c.nOut], fanIn: c.hidden },
  ]
}

const numel = (s: number[]) => s.reduce((a, b) => a * b, 1)
const shapeStr = (s: number[]) => `(${s.join(', ')}${s.length === 1 ? ',' : ''})`
const sizeStr = (s: number[]) => `torch.Size([${s.join(', ')}])`

/** first few values of a freshly initialised tensor: U(-1/sqrt(fan_in), 1/sqrt(fan_in)) */
function firstValues(seed: string, e: Entry, k = 3, spread = 1): number[] {
  const rng = mulberry32(hashString(`${seed}|${e.key}|${e.shape.join('x')}`))
  const b = spread / Math.sqrt(e.fanIn)
  return Array.from({ length: Math.min(k, numel(e.shape)) }, () => (rng() * 2 - 1) * b)
}

const fmt = (v: number) => (v < 0 ? '−' : ' ') + Math.abs(v).toFixed(2)

type Status = 'match' | 'size' | 'missing'

export default function StateDictViewer() {
  const [cfg, setCfg] = useState<Cfg>(TRAINED)
  const [saved, setSaved] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [strict, setStrict] = useState(true)
  const [ref, narrow] = useNarrow<HTMLDivElement>(560)
  const k = narrow ? 2 : 3
  const I = (level: number) => ' '.repeat(level * (narrow ? 2 : 4))

  const edit = (patch: Partial<Cfg>) => {
    setCfg((c) => ({ ...c, ...patch }))
    setLoaded(false) // a new class means a new, untouched model2
  }

  const file = entries(TRAINED)
  const model = entries(cfg)
  const fileMap = new Map(file.map((e) => [e.key, e]))
  const modelKeys = new Set(model.map((e) => e.key))

  const status = (e: Entry): Status => {
    const f = fileMap.get(e.key)
    if (!f) return 'missing'
    return f.shape.join() === e.shape.join() ? 'match' : 'size'
  }
  const missing = model.filter((e) => status(e) === 'missing').map((e) => e.key)
  const unexpected = file.filter((e) => !modelKeys.has(e.key)).map((e) => e.key)
  const sizeBad = model.filter((e) => status(e) === 'size')
  const raises = sizeBad.length > 0 || (strict && (missing.length > 0 || unexpected.length > 0))

  const result = (() => {
    if (raises) {
      const lines = ['RuntimeError: Error(s) in loading state_dict for TinyNet:']
      if (strict && missing.length) lines.push(`\tMissing key(s) in state_dict: ${missing.map((m) => `"${m}"`).join(', ')}. `)
      if (strict && unexpected.length) lines.push(`\tUnexpected key(s) in state_dict: ${unexpected.map((m) => `"${m}"`).join(', ')}. `)
      for (const e of sizeBad) {
        const f = fileMap.get(e.key)!
        lines.push(`\tsize mismatch for ${e.key}: copying a param with shape ${sizeStr(f.shape)} from checkpoint, the shape in current model is ${sizeStr(e.shape)}.`)
      }
      return { ok: false, text: lines.join('\n') }
    }
    if (missing.length || unexpected.length)
      return {
        ok: true,
        text: `_IncompatibleKeys(missing_keys=[${missing.map((m) => `'${m}'`).join(', ')}], unexpected_keys=[${unexpected.map((m) => `'${m}'`).join(', ')}])`,
      }
    return { ok: true, text: '<All keys matched successfully>' }
  })()

  const freshSeed = `fresh-${cfg.nIn}-${cfg.hidden}-${cfg.nOut}-${cfg.last}`
  const copied = (e: Entry) => loaded && status(e) === 'match'
  const nCopied = model.filter((e) => status(e) === 'match').length
  const totalNumbers = file.reduce((a, e) => a + numel(e.shape), 0)

  const tag = (s: Status | 'unexpected' | 'copied') => {
    const map = {
      copied: [css.tagYes, '✓ copied'],
      match: [css.tag, 'key + shape match'],
      size: [css.tagWarn, 'size mismatch'],
      missing: [css.tagMiss, 'missing in file'],
      unexpected: [css.tagMiss, 'unexpected'],
    } as const
    const [cls, text] = map[s]
    return <span className={`${css.tag} ${cls}`}>{text}</span>
  }

  const table = (rows: Entry[], seed: string, side: 'file' | 'model') => (
    <table className={css.table} style={{ fontSize: narrow ? '0.74rem' : undefined }}>
      <thead>
        <tr>
          <th>key</th>
          <th>shape</th>
          <th>values</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((e) => {
          const s = side === 'model' ? status(e) : modelKeys.has(e.key) ? null : 'unexpected'
          const vals = side === 'model' && copied(e) ? firstValues('trained', fileMap.get(e.key)!, k, 1.6) : firstValues(seed, e, k, side === 'file' ? 1.6 : 1)
          const isCopied = side === 'model' && copied(e)
          return (
            <tr key={e.key} className={isCopied ? css.rowCopied : s === 'size' || s === 'missing' || s === 'unexpected' ? css.rowBad : ''}>
              <td>
                <div>{e.key}</div>
                {side === 'model' && (loaded || s !== 'match') && <div>{tag(isCopied ? 'copied' : s!)}</div>}
                {side === 'file' && s && saved && <div>{tag('unexpected')}</div>}
              </td>
              <td className={s === 'size' ? css.badText : undefined} style={{ whiteSpace: 'nowrap' }}>
                {shapeStr(e.shape)}
              </td>
              <td style={{ whiteSpace: 'nowrap' }}>
                {vals.map(fmt).join(' ')}
                {numel(e.shape) > k ? ' …' : ''}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )

  return (
    <Figure
      wide
      title="state_dict: a model file is just named tensors"
      caption={
        <>
          Save yesterday's trained model, then load the file into <code>model2</code>. It works because every key and shape matches. Now change the class
          code with ◀ ▶ (− and + on a phone), for example a different <code>hidden</code> size or more classes, or click the dashed name <code>fc2</code> in the code to
          rename the last layer, and load again:
          PyTorch names each key that is missing, unexpected or the wrong size. Try <code>strict=False</code> too: it forgives renamed layers but never a size mismatch.
        </>
      }
    >
      <pre className={`${css.code} ${narrow ? css.codeNarrow : ''}`} aria-label="Today's version of the model class">
        <span className={css.line}>
          <span className={css.comment}># today's code: edit it with {narrow ? '− and + below' : '◀ ▶'}</span>
        </span>
        <span className={css.line}>
          <span className={css.kw}>class</span> TinyNet(nn.Module):
        </span>
        <span className={css.line}>
          {I(1)}
          <span className={css.kw}>def</span> __init__(self):
        </span>
        <span className={css.line}>{I(2) + 'super().__init__()'}</span>
        <span className={css.line}>
          {I(2) + 'self.fc1 = nn.Linear('}
          <Num v={cfg.nIn} set={(n) => edit({ nIn: n })} min={1} max={8} arrows={!narrow} label="input features" />
          {', '}
          <Num v={cfg.hidden} set={(n) => edit({ hidden: n })} min={2} max={16} arrows={!narrow} label="hidden size" />)
        </span>
        <span className={css.line}>{I(2) + 'self.act = nn.ReLU()'}</span>
        <span className={css.line}>
          {I(2) + 'self.'}
          <button type="button" className={css.nameBtn} onClick={() => edit({ last: cfg.last === 'fc2' ? 'out' : 'fc2' })} aria-label="rename the last layer">
            {cfg.last}
          </button>
          {` = nn.Linear(${cfg.hidden}, `}
          <Num v={cfg.nOut} set={(n) => edit({ nOut: n })} min={1} max={10} arrows={!narrow} label="number of classes" />)
        </span>
      </pre>
      {narrow && (
        <StepperRow
          items={[
            { label: 'in', v: cfg.nIn, set: (n) => edit({ nIn: n }), min: 1, max: 8 },
            { label: 'hidden', v: cfg.hidden, set: (n) => edit({ hidden: n }), min: 2, max: 16 },
            { label: 'classes', v: cfg.nOut, set: (n) => edit({ nOut: n }), min: 1, max: 10 },
          ]}
        />
      )}

      <div ref={ref} className={css.panels}>
        <div className={css.panel}>
          <div className={css.panelTitle}>
            Yesterday: trained <code>model</code>
            <span className={css.panelSub}>Linear(4, 8) → ReLU → Linear(8, 3), last layer named fc2</span>
          </div>
          {table(file, 'trained', 'file')}
          <Button primary={!saved} onClick={() => setSaved(true)}>
            <span className={css.btnCode}>torch.save(model.state_dict(), 'model.pt')</span>
          </Button>
          <div className={saved ? css.fileCard : `${css.fileCard} ${css.fileGhost}`}>
            {saved ? (
              <>
                <b>model.pt</b> saved: an OrderedDict of {file.length} named tensors, {totalNumbers} numbers in all. No code, no class, just keys → tensors.
              </>
            ) : (
              <>No file yet. Press the button to save.</>
            )}
          </div>
        </div>

        <div className={css.panel}>
          <div className={css.panelTitle}>
            Today: <code>model2 = TinyNet()</code>
            <span className={css.panelSub}>a fresh model built from the code above, with random starting values</span>
          </div>
          {table(model, freshSeed, 'model')}
          <Controls>
            <Button primary={saved && !loaded} disabled={!saved} onClick={() => setLoaded(true)}>
              <span className={css.btnCode}>
                model2.load_state_dict(
                <wbr />
                torch.load('model.pt'){strict ? '' : ', strict=False'})
              </span>
            </Button>
            <Toggle
              label={<code>strict=False</code>}
              checked={!strict}
              onChange={(v) => {
                setStrict(!v)
                setLoaded(false)
              }}
            />
          </Controls>
        </div>
      </div>

      {loaded &&
        (result.ok ? (
          <div className={css.ok}>
            <span className={css.mono}>{result.text}</span>
            <div style={{ fontWeight: 400, color: 'var(--ink-2)', marginTop: 4 }}>
              {missing.length || unexpected.length
                ? `Loaded ${nCopied} of ${model.length} tensors. ${missing.length === 1 ? 'The missing one keeps its' : `The ${missing.length} missing ones keep their`} random starting values: fine when you are deliberately swapping in a new head, a silent bug otherwise.`
                : `Every tensor in model2 now holds yesterday's trained values (compare the values columns). model2 is the trained model again.`}
            </div>
          </div>
        ) : (
          <div className={css.err} role="alert">
            {result.text}
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 400, color: 'var(--ink-2)', marginTop: 4 }}>
              The file and the class disagree. {nCopied > 0 &&
                `Careful: ${nCopied === 1 ? 'the 1 tensor that did match was' : `the ${nCopied} tensors that did match were`} already copied before the error was raised, so model2 is half-loaded. `}
              Rebuild the model with exactly the class you trained, then load again.
            </div>
          </div>
        ))}
    </Figure>
  )
}
