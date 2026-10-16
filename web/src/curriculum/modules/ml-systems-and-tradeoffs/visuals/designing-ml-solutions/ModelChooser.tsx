import { useState, type ReactNode } from 'react'
import { Figure, Segmented, Toggle, Button } from '../../../../../kit'

/*
  A rule-of-thumb model chooser. The data type picks the family; the dataset size, latency budget,
  deployment target and need for explanations adjust how you use it. Rules (strong defaults, not laws):
    table  -> gradient-boosted trees (a linear model is also fine when data is tiny, decisions must be explained,
              or the target is a microcontroller)
    images -> fine-tune a pretrained CNN or ViT (freeze it and train only the head when data is tiny;
              mobile architectures + int8 on phones; tiny int8 CNN on microcontrollers)
    text   -> fine-tune a pretrained Transformer (embeddings + logistic regression when data is tiny;
              TF-IDF + logistic regression on a microcontroller; distilled + int8 on phones)
    audio  -> pretrained audio model on spectrograms (Transformer or CNN); small int8 CNN on devices
  Training a big network from scratch is never the default.
*/

type Data = 'table' | 'image' | 'text' | 'audio'
type Size = 'tiny' | 'medium' | 'large'
type Lat = 'relaxed' | 'realtime' | 'tight'
type Target = 'cloud' | 'phone' | 'micro'
type Pick = 'linear' | 'gbdt' | 'cnn' | 'transformer' | 'scratch'

interface Rec {
  best: Pick
  accept: Pick[]
  start: string
  baseline: string
  why: string
  notes: string[]
}

const PICKS: { value: Pick; label: string }[] = [
  { value: 'linear', label: 'Linear / logistic regression' },
  { value: 'gbdt', label: 'Gradient-boosted trees' },
  { value: 'cnn', label: 'Pretrained CNN or ViT' },
  { value: 'transformer', label: 'Pretrained Transformer' },
  { value: 'scratch', label: 'Big network from scratch' },
]

const PRESETS: { name: string; data: Data; size: Size; lat: Lat; target: Target; explain: boolean }[] = [
  { name: 'HDB resale price from 20 columns', data: 'table', size: 'medium', lat: 'relaxed', target: 'cloud', explain: false },
  { name: 'Eye disease from 300 retina photos', data: 'image', size: 'tiny', lat: 'relaxed', target: 'cloud', explain: false },
  { name: 'Defects on a factory camera, live', data: 'image', size: 'medium', lat: 'tight', target: 'phone', explain: false },
  { name: 'Sort 5,000 feedback messages', data: 'text', size: 'medium', lat: 'realtime', target: 'cloud', explain: false },
  { name: 'Wake word on a smartwatch', data: 'audio', size: 'medium', lat: 'tight', target: 'micro', explain: false },
  { name: 'Loan decisions a bank must explain', data: 'table', size: 'medium', lat: 'realtime', target: 'cloud', explain: true },
]

const DEEP_EXPLAIN =
  'Deep networks are hard to explain: show which parts of the input mattered (for example saliency maps), and if every decision must be justified in plain terms, compare with a simpler model on hand-made features.'

function recommend(data: Data, size: Size, lat: Lat, target: Target, explain: boolean): Rec {
  const notes: string[] = []
  if (lat === 'relaxed') notes.push('Answers can wait (for example scored overnight in a batch), so a bigger model or an ensemble is affordable.')
  if (lat === 'tight') notes.push('Under 10 ms rules out big models, huge ensembles and k-NN over a large dataset: prediction cost decides.')

  if (data === 'table') {
    const linearOk = size === 'tiny' || explain || target === 'micro'
    const r: Rec = {
      best: explain ? 'linear' : 'gbdt',
      accept: linearOk ? ['gbdt', 'linear'] : ['gbdt'],
      start: explain ? 'Logistic regression or shallow trees, with gradient-boosted trees as the accuracy benchmark' : 'Gradient-boosted trees (XGBoost, LightGBM or CatBoost)',
      baseline: 'Predict the majority class (or the average), then a linear or logistic regression.',
      why: 'Rows of mixed numeric and categorical columns: boosted trees capture non-linear effects and interactions, cope with missing values and unscaled features, and usually beat neural networks on tables.',
      notes,
    }
    if (size === 'tiny') notes.push('With only hundreds of rows, keep trees shallow and compare with a regularised linear model using cross-validation.')
    if (explain) notes.push('Each decision must be explained: a linear model shows exactly how each feature pushed the score; report feature importances for any trees.')
    if (target === 'micro') notes.push('A linear model or a few shallow trees fit in kilobytes and predict with a handful of comparisons.')
    if (target === 'phone') notes.push('Tree ensembles are small and fast enough to run on a phone as they are.')
    return r
  }
  if (data === 'image') {
    const r: Rec = {
      best: 'cnn',
      accept: ['cnn'],
      start:
        target === 'micro'
          ? 'A tiny CNN at low resolution, quantised to int8 (and distilled from a bigger pretrained model)'
          : target === 'phone' || lat === 'tight'
            ? 'A pretrained mobile CNN (MobileNet or EfficientNet-Lite), fine-tuned, then quantised to int8'
            : size === 'large'
              ? 'Fine-tune a large pretrained CNN or Vision Transformer (ViT)'
              : 'Fine-tune a pretrained CNN (such as a ResNet) or a ViT',
      baseline: 'Predict the majority class, then logistic regression on features from a frozen pretrained network (a "linear probe").',
      why: 'Pretrained networks already detect edges, textures and shapes, so they need far less labelled data and compute than training from scratch.',
      notes,
    }
    if (size === 'tiny') notes.push('With a few hundred images, freeze the pretrained layers, train only a new final layer, and use data augmentation (flips, crops, colour changes).')
    if (size === 'large') notes.push('With millions of images, fine-tuning the whole network (or a bigger ViT) pays off.')
    if (target !== 'cloud') notes.push('On a device, shrink the model: int8 quantisation (about 4× smaller), pruning, or distillation from a big teacher.')
    if (explain) notes.push(DEEP_EXPLAIN)
    return r
  }
  if (data === 'text') {
    if (target === 'micro') {
      return {
        best: 'linear',
        accept: ['linear'],
        start: 'Bag-of-words or TF-IDF features with logistic regression (a Transformer will not fit)',
        baseline: 'Predict the majority class, then keyword rules.',
        why: 'A microcontroller has kilobytes of memory; even a small Transformer needs tens of megabytes.',
        notes,
      }
    }
    const r: Rec = {
      best: 'transformer',
      accept: size === 'tiny' ? ['transformer', 'linear'] : ['transformer'],
      start:
        target === 'phone' || lat === 'tight'
          ? 'A small distilled Transformer (DistilBERT or MobileBERT), fine-tuned, then quantised to int8'
          : size === 'tiny'
            ? 'Embeddings from a pretrained Transformer plus logistic regression, or prompt a large language model with a few examples'
            : 'Fine-tune a pretrained Transformer (a BERT-style encoder)',
      baseline: 'Predict the majority class, then TF-IDF features with logistic regression.',
      why: 'Pretrained Transformers already know word meanings and context from huge amounts of text; fine-tuning adapts that knowledge to your labels.',
      notes,
    }
    if (lat !== 'relaxed') notes.push("Attention costs grow with the sequence length squared, so cap the input length (for example 128 tokens).")
    if (explain) notes.push(DEEP_EXPLAIN)
    return r
  }
  // audio
  const device = target !== 'cloud'
  const r: Rec = {
    best: device ? 'cnn' : 'transformer',
    // a microcontroller has kilobytes of memory: only a tiny CNN fits
    accept: target === 'micro' ? ['cnn'] : ['transformer', 'cnn'],
    start: device
      ? 'A small CNN on log-mel spectrograms or MFCCs, quantised to int8 (keyword-spotting style)'
      : 'A pretrained audio model: an audio Transformer or CNN on log-mel spectrograms (such as AST), or a speech model on the raw waveform (wav2vec 2.0, HuBERT)',
    baseline: 'Predict the majority class, then logistic regression on averaged MFCC features.',
    why: 'Turning sound into a spectrogram makes it image-like, and pretrained audio models already recognise speech and everyday sounds.',
    notes,
  }
  if (size === 'tiny') notes.push('With little data, freeze the pretrained model and train only a small classifier on its embeddings.')
  if (explain) notes.push(DEEP_EXPLAIN)
  return r
}

function Card({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'grid', gap: 2 }}>
      <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>{label}</div>
      <div style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.5 }}>{children}</div>
    </div>
  )
}

export default function ModelChooser() {
  const [data, setData] = useState<Data>('table')
  const [size, setSize] = useState<Size>('medium')
  const [lat, setLat] = useState<Lat>('relaxed')
  const [target, setTarget] = useState<Target>('cloud')
  const [explain, setExplain] = useState(false)
  const [pick, setPick] = useState<Pick | null>(null)
  const [shown, setShown] = useState(true)
  const [preset, setPreset] = useState<number | null>(0)

  const rec = recommend(data, size, lat, target, explain)
  const change = <T,>(set: (v: T) => void) => (v: T) => {
    set(v)
    setPick(null)
    setShown(false)
    setPreset(null)
  }
  const revealed = shown || pick !== null
  const ok = pick !== null && rec.accept.includes(pick)
  const kind = data === 'image' ? 'pixels' : data === 'text' ? 'words' : 'sound'
  const their = data === 'audio' ? 'its' : 'their'
  const feedback = (p: Pick): string => {
    switch (p) {
      case 'scratch':
        return 'Training a big network from scratch throws away what pretrained models already know, and needs far more data and compute. It is almost never the right first move.'
      case 'linear':
        return data === 'table'
          ? 'A linear model is the baseline to beat here, but boosted trees usually capture the non-linear patterns in a table better.'
          : `A linear model on raw ${kind} misses ${their} structure. Use it as a baseline on top of good features instead.`
      case 'gbdt':
        return `Boosted trees shine on tables of features, but they cannot see the structure in raw ${kind}.`
      case 'cnn':
        return data === 'table' ? 'A table has no grid of pixels for a CNN to scan, and boosted trees fit tables better.' : 'CNNs and ViTs are built for grids of pixels, not sequences of words.'
      case 'transformer':
        if (data === 'table') return 'Transformers are built for sequences such as text; on tables they rarely beat boosted trees.'
        if (data === 'image') return 'For images, fine-tune a pretrained vision model: a CNN or a Vision Transformer (the "CNN or ViT" pick).'
        if (data === 'audio' && target === 'micro')
          return 'A pretrained audio Transformer is far too big for a microcontroller (tens of megabytes against kilobytes); keyword spotters use a tiny int8 CNN.'
        return 'Even a small Transformer needs tens of megabytes of memory, and a microcontroller has kilobytes.'
    }
  }

  return (
    <Figure
      wide
      title="Choose a model for the job"
      caption={
        <>
          Start from a scenario or set the constraints yourself. Each time you change something, the recommendation hides: make your own pick first, then compare. Notice that the data type
          chooses the family, while size, latency, the device and the need for explanations decide how you use it. These are strong defaults to start from, not laws: the final choice is made by
          comparing candidates against the baseline on your own validation data.
        </>
      }
    >
      <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: 6 }} aria-label="Example scenarios">
        {PRESETS.map((p, i) => (
          <button
            key={p.name}
            type="button"
            aria-pressed={preset === i}
            onClick={() => {
              setData(p.data)
              setSize(p.size)
              setLat(p.lat)
              setTarget(p.target)
              setExplain(p.explain)
              setPick(null)
              setShown(false)
              setPreset(i)
            }}
            style={{
              font: 'inherit',
              fontSize: 12.5,
              fontWeight: 650,
              padding: '0.3rem 0.6rem',
              borderRadius: 999,
              cursor: 'pointer',
              border: `1.5px solid ${preset === i ? 'var(--accent)' : 'var(--rule)'}`,
              background: preset === i ? 'var(--accent-soft)' : 'var(--surface-2)',
              color: 'var(--ink)',
            }}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: '10px 18px', alignItems: 'flex-end' }}>
        <Segmented
          label="Data"
          value={data}
          onChange={change(setData)}
          options={[
            { value: 'table', label: 'Table' },
            { value: 'image', label: 'Images' },
            { value: 'text', label: 'Text' },
            { value: 'audio', label: 'Audio' },
          ]}
        />
        <Segmented
          label="Labelled examples"
          value={size}
          onChange={change(setSize)}
          options={[
            { value: 'tiny', label: 'Hundreds' },
            { value: 'medium', label: 'Thousands' },
            { value: 'large', label: 'Millions' },
          ]}
        />
        <Segmented
          label="Time per prediction"
          value={lat}
          onChange={change(setLat)}
          options={[
            { value: 'relaxed', label: 'Seconds OK' },
            { value: 'realtime', label: '< 100 ms' },
            { value: 'tight', label: '< 10 ms' },
          ]}
        />
        <Segmented
          label="Runs on"
          value={target}
          onChange={change(setTarget)}
          options={[
            { value: 'cloud', label: 'Server' },
            { value: 'phone', label: 'Phone' },
            { value: 'micro', label: 'Microcontroller' },
          ]}
        />
        <Toggle label="Each decision must be explained" checked={explain} onChange={change(setExplain)} />
      </div>

      <div style={{ width: '100%', display: 'grid', gap: 6 }}>
        <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--ink)' }}>Your pick: what would you try first?</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }} role="radiogroup" aria-label="Your pick">
          {PICKS.map((p) => {
            const on = pick === p.value
            const good = on && ok
            return (
              <button
                key={p.value}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setPick(p.value)}
                style={{
                  font: 'inherit',
                  fontSize: 13,
                  fontWeight: 650,
                  padding: '0.35rem 0.65rem',
                  borderRadius: 8,
                  cursor: 'pointer',
                  border: `1.5px solid ${on ? (good ? 'var(--ok)' : 'var(--bad)') : 'var(--rule)'}`,
                  background: on ? (good ? 'var(--ok-soft)' : 'var(--bad-soft)') : 'var(--surface-2)',
                  color: 'var(--ink)',
                }}
              >
                {on ? (good ? '✓ ' : '✗ ') : ''}
                {p.label}
              </button>
            )
          })}
        </div>
        {pick !== null && (
          <div role="status" style={{ fontSize: 13.5, fontWeight: 600, color: ok ? 'var(--ok)' : 'var(--bad)' }}>
            {ok
              ? pick === 'cnn' && target === 'micro'
                ? 'Right family: on a microcontroller it must be a tiny CNN (a ViT will not fit), as the card below explains.'
                : pick === rec.best
                  ? 'Good call: that is the strong default here.'
                  : 'Reasonable: that also works here, though the card below explains the usual first choice.'
              : feedback(pick)}
          </div>
        )}
      </div>

      {revealed ? (
        <div style={{ width: '100%', display: 'grid', gap: 10, padding: '0.8rem 0.9rem', borderRadius: 12, border: '1.5px solid var(--accent-line)', background: 'var(--accent-soft)' }}>
          <Card label="Start with">
            <b>{rec.start}</b>
          </Card>
          <Card label="Baseline to beat">{rec.baseline}</Card>
          <Card label="Why">{rec.why}</Card>
          {rec.notes.length > 0 && (
            <Card label="Constraints">
              <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
                {rec.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      ) : (
        <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, padding: '0.7rem 0.9rem', borderRadius: 12, border: '1.5px dashed var(--rule)', background: 'var(--surface-2)' }}>
          <span style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>Make your pick above to see the recommendation for this scenario.</span>
          <Button onClick={() => setShown(true)}>Just show me</Button>
        </div>
      )}
    </Figure>
  )
}
