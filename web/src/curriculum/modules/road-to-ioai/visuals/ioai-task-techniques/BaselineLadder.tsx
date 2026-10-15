import { useEffect, useRef, useState } from 'react'
import { Figure, Toggle, useNarrow } from '../../../../../kit'
import styles from './techniques.module.css'

/*
  A ladder of approaches for one real task: CIFAR-10 (10 balanced classes of 32×32 photos).
  Every accuracy is the figure the official Singapore notebooks tell students to expect:
  2024 Selection Test (CV) warm-up, and the 2024 residential camp CV test, Q1.1–Q1.4.
  Rungs are ordered by cost. Constraint toggles rule rungs out; the best allowed rung is marked.
*/

type Need = 'pretrained' | 'learns' | 'gpu'

interface Rung {
  name: string
  short: string
  score: number // expected test accuracy, %
  scoreLabel: string
  /** a short caveat shown under the score on the rung itself */
  scoreNote?: string
  cost: string
  needs: Need[]
  what: string
  source: string
  code: string
}

const RUNGS: Rung[] = [
  {
    name: 'Guess the most common class',
    short: 'majority class',
    score: 10,
    scoreLabel: '10%',
    cost: 'no training · instant',
    needs: [],
    what: 'CIFAR-10 has exactly 1,000 test photos per class, so always answering one class is right 1 time in 10. Every other rung must beat this line; on an imbalanced task this line can be surprisingly high.',
    source: 'Arithmetic: 1,000 of the 10,000 test images are in any one class.',
    code: `from collections import Counter
guess = Counter(train_labels).most_common(1)[0][0]
preds = [guess] * len(test_labels)      # 10% on CIFAR-10`,
  },
  {
    name: 'Small network on raw pixels',
    short: 'MLP on pixels',
    score: 35,
    scoreLabel: '≈ 35%',
    cost: '2 epochs · fine on a CPU',
    needs: ['learns'],
    what: 'Flatten each 32×32×3 photo into 3,072 numbers and train fully connected layers. Pixels are a poor representation: a cat shifted 3 pixels to the left looks like a completely different vector.',
    source: 'Expected accuracy stated in the 2024 Singapore Selection Test (CV) warm-up notebook.',
    code: `model = nn.Sequential(nn.Flatten(),
    nn.Linear(3*32*32, 1024), nn.ReLU(),
    nn.Linear(1024, 512), nn.ReLU(),
    nn.Linear(512, 512), nn.ReLU(),
    nn.Linear(512, 10))                 # trained for 2 epochs`,
  },
  {
    name: 'Frozen CLIP, zero-shot (no training)',
    short: 'frozen embeddings',
    score: 90,
    scoreLabel: '≈ 90% (91% with 7 prompts)',
    cost: 'no training · one forward pass per photo',
    needs: ['pretrained'],
    what: 'A pretrained CLIP model turns every photo and the sentence "a photo of a {class}" into embeddings. Pick the class whose text is most similar (cosine) to the photo. Nothing is trained; averaging 7 prompt wordings adds about a point. The same frozen embeddings also feed k-NN or a logistic-regression head.',
    source: 'Expected accuracies stated in the 2024 Singapore camp CV test, Q1.3 (≈ 90%) and Q1.4 (≈ 91%). Q1.5 then trained a small head on the cached CLIP features, with full marks at 96%.',
    code: `text = clip.tokenize([f"a photo of a {c}" for c in classes]).to(device)
with torch.no_grad():
    img = clip_model.encode_image(images)
    txt = clip_model.encode_text(text)
img = img / img.norm(dim=-1, keepdim=True)    # unit length, so @ gives cosine
txt = txt / txt.norm(dim=-1, keepdim=True)
preds = (img @ txt.T).argmax(dim=-1)`,
  },
  {
    name: 'Frozen CLIP features + a linear probe',
    short: 'linear probe',
    score: 96,
    scoreLabel: '≈ 96%',
    cost: 'one forward pass per photo, then a small head trains in seconds',
    needs: ['pretrained', 'learns'],
    what: 'Compute the frozen CLIP embedding of every training photo once, cache them, and train only a logistic-regression (linear) head on top. Best value for money on many tasks. A k-NN on the same cached features needs no learned weights at all, so it still works under a "no new learned parameters" rule.',
    source: 'Expected accuracy stated in the 2024 Singapore camp CV test, Q1.5: a small head trained on the cached CLIP features, full marks at 96%.',
    code: `with torch.no_grad():
    feats = clip_model.encode_image(images)       # once, then cache
feats = feats / feats.norm(dim=-1, keepdim=True)
probe = LogisticRegression(max_iter=2000).fit(feats_train, y_train)
print(probe.score(feats_test, y_test))           # about 0.96`,
  },
  {
    name: 'Fine-tune a pretrained ResNet-18 for 1 epoch',
    short: 'fine-tuned',
    score: 88,
    scoreLabel: '≈ 88% after 1 epoch (well above 90% with more)',
    scoreNote: 'after 1 epoch',
    cost: '1 epoch · needs a GPU',
    needs: ['pretrained', 'learns', 'gpu'],
    what: 'Start from ResNet-18 weights learned on ImageNet, swap the 1,000-class head for a 10-class one and train everything for one epoch. The early layers already detect edges, textures and parts, so one epoch is enough to get close to 90%; more epochs typically go well above 90%.',
    source: 'Expected accuracy stated in the 2024 Singapore camp CV test, Q1.1.',
    code: `net = resnet18(weights=ResNet18_Weights.IMAGENET1K_V1)
net.fc = nn.Linear(512, 10)                   # new head for 10 classes
opt = optim.SGD(net.parameters(), lr=0.01, momentum=0.9, weight_decay=5e-4)
train(net, opt, trainloader, num_epochs=1)`,
  },
  {
    name: 'Train ResNet-18 from scratch',
    short: 'from scratch',
    score: 55,
    scoreLabel: '≈ 55%',
    cost: '1 epoch · needs a GPU',
    needs: ['learns', 'gpu'],
    what: 'The same network and the same epoch of training, but starting from random weights. It costs exactly as much as fine-tuning and scores about 33 points less, because it must learn edges and textures from CIFAR-10 alone.',
    source: 'Expected accuracy stated in the 2024 Singapore camp CV test, Q1.2.',
    code: `net = resnet18(weights=None, num_classes=10)  # random start
opt = optim.SGD(net.parameters(), lr=0.01, momentum=0.9, weight_decay=5e-4)
train(net, opt, trainloader, num_epochs=1)`,
  },
]

const RULES: { key: Need; label: string; why: string }[] = [
  { key: 'pretrained', label: 'Pretrained weights banned', why: 'uses pretrained weights' },
  { key: 'learns', label: 'No new learned parameters', why: 'trains new parameters' },
  { key: 'gpu', label: 'CPU only (no GPU)', why: 'needs GPU training' },
]

const NEED_LABEL: Record<Need, string> = { pretrained: 'pretrained model', learns: 'trains parameters', gpu: 'GPU' }

export default function BaselineLadder() {
  const [ref, narrow] = useNarrow<HTMLDivElement>(560)
  const [banned, setBanned] = useState<Record<Need, boolean>>({ pretrained: false, learns: false, gpu: false })
  const [open, setOpen] = useState(2)
  const detailRef = useRef<HTMLDivElement>(null)
  const picked = useRef(false)

  const allowed = (r: Rung) => r.needs.every((n) => !banned[n])
  const best = RUNGS.reduce((b, r, i) => (allowed(r) && (b < 0 || r.score > RUNGS[b].score) ? i : b), -1)
  const sel = RUNGS[open]
  const broken = sel.needs.filter((n) => banned[n])

  // bring the details into view (on a phone they open right under the tapped rung)
  useEffect(() => {
    if (picked.current) detailRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    picked.current = false
  }, [open, narrow])

  const detail = (
    <div ref={detailRef} className={styles.detail} aria-live="polite">
      <strong>
        Rung {open + 1}: {sel.name}
      </strong>{' '}
      <span style={{ color: 'var(--ink-3)' }}>· expected accuracy {sel.scoreLabel}</span>
      {broken.length > 0 && <p className={styles.ruledOut}>Ruled out: it {broken.map((n) => RULES.find((c) => c.key === n)!.why).join(' and ')}.</p>}
      <p>{sel.what}</p>
      <pre className={styles.code}>{sel.code}</pre>
      <div className={styles.source}>{sel.source}</div>
    </div>
  )

  return (
    <Figure
      title="The baseline ladder: CIFAR-10 photos, ten classes"
      caption={
        <>
          Rungs are ordered by cost, not accuracy. Tap a rung for its code, then switch on task rules. Notice that cheap frozen embeddings beat a costly run from scratch, and one rule can knock out
          your plan.
        </>
      }
    >
      <div ref={ref} style={{ width: '100%' }}>
        <div className={styles.constraints} role="group" aria-label="Task rules">
          <span className={styles.constraintsHead}>Task rules (switch on to apply):</span>
          {RULES.map((c) => (
            <Toggle key={c.key} label={c.label} checked={banned[c.key]} onChange={(v) => setBanned((b) => ({ ...b, [c.key]: v }))} />
          ))}
        </div>
        <div className={styles.ladder}>
          {RUNGS.map((r, i) => {
            const ok = allowed(r)
            return (
              <div key={r.name} style={{ display: 'contents' }}>
                <button
                  type="button"
                  aria-pressed={open === i}
                  aria-expanded={narrow ? open === i : undefined}
                  className={`${styles.rung}${open === i ? ` ${styles.rungActive}` : ''}${ok ? '' : ` ${styles.rungOut}`}${i === best ? ` ${styles.rungBest}` : ''}`}
                  onClick={() => {
                    picked.current = true
                    setOpen(i)
                  }}
                >
                  <span className={styles.rungNum}>{i + 1}</span>
                  <span>
                    <span className={styles.rungName}>{r.name}</span>
                    <span className={styles.rungMeta}>{r.cost}</span>
                    <span style={{ display: 'block' }}>
                      {i === best && <span className={`${styles.badge} ${styles.badgeBest}`}>best allowed</span>}
                      {!ok && <span className={`${styles.badge} ${styles.badgeOut}`}>ruled out</span>}
                      {r.needs.length === 0 && <span className={styles.badge}>needs nothing</span>}
                      {r.needs.map((n) => (
                        <span key={n} className={`${styles.badge}${banned[n] ? ` ${styles.badgeBad}` : ''}`}>
                          {banned[n] ? '✕ ' : ''}
                          {NEED_LABEL[n]}
                        </span>
                      ))}
                    </span>
                  </span>
                  <span className={styles.rungScore}>
                    <span className={styles.scoreNum}>{r.score}%</span>
                    {r.scoreNote && <span className={styles.scoreNote}>{r.scoreNote}</span>}
                    <span className={styles.scoreBar} aria-hidden="true">
                      <span className={styles.scoreFill} style={{ width: `${r.score}%`, background: ok ? 'var(--viz-1)' : 'var(--viz-muted)' }} />
                    </span>
                  </span>
                </button>
                {narrow && open === i && detail}
              </div>
            )
          })}
        </div>
        {!narrow && detail}
      </div>
    </Figure>
  )
}
