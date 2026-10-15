import { useState } from 'react'
import { Figure, Segmented, useNarrow } from '../../../../../kit'
import s from './after.module.css'

/*
  Four stages side by side: what you are given, how long, which tools, how it is marked, and how
  open-ended it is. Hover (or tap) a cell for a real example from a past paper or task.
  Sources: NOAI 2026/2027 pages, released NOAI Final notebooks, the 2024–25 Singapore selection and
  camp notebooks, and the IOAI 2026 contest rules and task statements.
*/

type StageId = 'prelim' | 'final' | 'ntu' | 'ioai'
type RowId = 'format' | 'time' | 'tools' | 'scoring' | 'open'

interface Cell {
  text: string
  example: string
}

const STAGES: { id: StageId; name: string; when: string; colour: string; open: number }[] = [
  { id: 'prelim', name: 'NOAI Prelim', when: '19 Feb 2027', colour: 'var(--viz-1)', open: 1 },
  { id: 'final', name: 'NOAI Final', when: '5 Mar 2027', colour: 'var(--viz-5)', open: 2 },
  { id: 'ntu', name: 'NTU test + camp', when: 'May – Jun 2027', colour: 'var(--viz-3)', open: 4 },
  { id: 'ioai', name: 'IOAI', when: '4 – 10 Jul 2027', colour: 'var(--viz-2)', open: 5 },
]

const ROWS: { id: RowId; label: string }[] = [
  { id: 'format', label: 'What you get' },
  { id: 'time', label: 'Time' },
  { id: 'tools', label: 'Tools' },
  { id: 'scoring', label: 'Marking' },
  { id: 'open', label: 'Open-ended?' },
]

const CELLS: Record<StageId, Record<RowId, Cell>> = {
  prelim: {
    format: { text: '150 four-option MCQs on a Google Form', example: 'A typical 2026 Prelim question: "Transfer learning in vision involves: …" One line, four options, one of them right.' },
    time: { text: '90 minutes: about 36 s per question', example: 'At 36 seconds a question there is no time to work things out from first principles. Fast recall of ideas you truly understand is what scores.' },
    tools: { text: 'Pen and paper only: no calculator, notes or AI', example: 'Any arithmetic, such as a square root or a fraction, has to be done by hand on rough paper.' },
    scoring: { text: '1 mark per correct answer, no penalty, ranked by total', example: 'A blank scores the same as a wrong answer, so a guess between two remaining options is always worth making.' },
    open: { text: 'Closed: the answer is on the screen', example: 'Exactly one of the four options is correct, and you only have to recognise it.' },
  },
  final: {
    format: { text: '20 MCQs + 3 Python tasks in Jupyter notebooks', example: '2026 Task 2: fix a U-Net whose skip connections no longer line up, then compute mean IoU from scratch.' },
    time: { text: '3 hours in 2026', example: 'In 2026: about 30 minutes recommended for the 20 MCQs, leaving about 2.5 hours for three notebooks.' },
    tools: { text: 'CPU, no internet; NumPy and PyTorch, some libraries banned', example: '2026 Task 2 allowed torch and NumPy but banned scikit-learn and torchmetrics, so mean IoU had to be written by hand.' },
    scoring: { text: 'Fixed marks per part, checked against expected outputs (2026: 20 + 80)', example: 'Your function either returns the expected numbers or it does not. There is no leaderboard.' },
    open: { text: 'Mostly closed: the algorithm is named for you', example: '"Implement gradient boosting", "implement scaled dot-product attention": you know the target, you just have to code it correctly.' },
  },
  ntu: {
    format: { text: 'A notebook per area (vision, language, tabular ML): fill in missing lines, improve, write short answers', example: '2025 vision test: fill in a U-Net for Pascal VOC segmentation, add a class-weighted loss, then raise mIoU with a pretrained ResNet-34 encoder.' },
    time: { text: 'Not published: a test day, then a training week', example: 'Training runs take minutes to hours, so you plan experiments around GPU time and write your report while a model trains.' },
    tools: { text: 'GPU; PyTorch, torchvision, Hugging Face, scikit-learn; rules limit web and AI use', example: '2025 camp, vision task: PyTorch documentation only, no ChatGPT, Stack Overflow or Hugging Face.' },
    scoring: { text: 'Marks for completed parts, for results (accuracy, mIoU, sometimes ranked) and for clear explanations', example: '2025 mental-health task: marked on accuracy and on documenting the approaches you tried.' },
    open: { text: 'Open: the baseline runs, how far you take it is up to you', example: 'The starter code can contain bugs too: the 2024 vision test scaled pixels differently in training and evaluation.' },
  },
  ioai: {
    format: { text: '2 contest days, 3 tasks each (2025, 2026): a story, a dataset and a baseline notebook', example: 'IOAI 2026 "Double Agent Dilemma": make tiny pixel changes so that a ResNet-18 and a ViT-Tiny disagree on each image.' },
    time: { text: '6 hours a day for 3 tasks', example: 'In 2026 each graded notebook also had to finish within its own run-time limit of 5 to 12 minutes.' },
    tools: { text: 'One GPU slice, no internet except documentation; a contest AI assistant in 2026', example: 'IOAI 2026 whitelisted sites such as pytorch.org and huggingface.co/docs, and offered Gemma 3 with at most 1,000 output tokens per query.' },
    scoring: { text: 'Each task 0–100, measured from the baseline to the best result; medals by total', example: 'A submission that only matches the baseline scores 0, however much work went into it.' },
    open: { text: 'Fully open, often with an unusual constraint', example: 'IOAI 2024 machine-learning task: only linear regression was allowed, with at most 300 features.' },
  },
}

function Meter({ n, colour }: { n: number; colour: string }) {
  return (
    <span className={s.meter} aria-label={`${n} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={s.meterPip} style={{ background: i <= n ? colour : 'var(--surface-3)' }} />
      ))}
    </span>
  )
}

export default function FormatComparison() {
  const [ref, narrow] = useNarrow<HTMLDivElement>(600)
  const [sel, setSel] = useState<{ stage: StageId; row: RowId }>({ stage: 'ioai', row: 'scoring' })
  const stage = STAGES.find((x) => x.id === sel.stage)!
  const cell = CELLS[sel.stage][sel.row]
  const rowLabel = ROWS.find((r) => r.id === sel.row)!.label

  const pick = (st: StageId, row: RowId) => setSel({ stage: st, row })

  return (
    <Figure
      title="Four stages, four different kinds of test"
      caption={
        <>
          Hover over or tap any cell for a real example (on a phone, pick a stage first). From the Prelim to IOAI the time per problem grows, the tools get more powerful, and the marking moves from
          "is this option right?" to "how much better than the baseline is your model?". Each stage is more open-ended than the last.
        </>
      }
      wide
    >
      <div ref={ref} style={{ width: '100%' }}>
        {narrow ? (
          <div style={{ display: 'grid', gap: '0.6rem', width: '100%' }}>
            <Segmented
              label="Stage"
              value={sel.stage}
              onChange={(v) => setSel((p) => ({ stage: v, row: p.row }))}
              options={STAGES.map((st) => ({ value: st.id, label: st.id === 'ntu' ? 'NTU' : st.name.replace('NOAI ', '') }))}
            />
            <div className={s.stageCard}>
              {ROWS.map((r) => (
                <button key={r.id} type="button" className={`${s.stageRow} ${sel.row === r.id ? s.stageRowOn : ''}`} onClick={() => pick(sel.stage, r.id)} aria-pressed={sel.row === r.id}>
                  <span className={s.stageRowLabel}>{r.label}</span>
                  <span>
                    {CELLS[sel.stage][r.id].text}
                    {r.id === 'open' && <Meter n={stage.open} colour={stage.colour} />}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className={s.fmtGrid} style={{ gridTemplateColumns: '6.2rem repeat(4, minmax(0, 1fr))' }} role="table" aria-label="Comparison of the four stages">
            <div className={s.fmtHead} role="columnheader" />
            {STAGES.map((st) => (
              <div key={st.id} className={s.fmtHead} role="columnheader" style={{ borderTop: `4px solid ${st.colour}` }}>
                {st.name}
                <span className={s.fmtHeadSub}>{st.when}</span>
              </div>
            ))}
            {ROWS.map((r) => (
              <div key={r.id} style={{ display: 'contents' }} role="row">
                <div className={s.fmtRowHead} role="rowheader">
                  {r.label}
                </div>
                {STAGES.map((st) => {
                  const on = sel.stage === st.id && sel.row === r.id
                  return (
                    <button
                      key={st.id}
                      type="button"
                      role="cell"
                      className={`${s.fmtCell} ${on ? s.fmtCellOn : ''}`}
                      onMouseEnter={() => pick(st.id, r.id)}
                      onFocus={() => pick(st.id, r.id)}
                      onClick={() => pick(st.id, r.id)}
                      aria-pressed={on}
                    >
                      {CELLS[st.id][r.id].text}
                      {r.id === 'open' && <Meter n={st.open} colour={st.colour} />}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className={s.example} aria-live="polite">
        <div className={s.exampleTag} style={{ color: stage.colour }}>
          Example · {stage.name} · {rowLabel}
        </div>
        {cell.example}
      </div>
    </Figure>
  )
}
