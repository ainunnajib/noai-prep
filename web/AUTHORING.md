# Authoring guide: NOAI Prep lessons

This guide is for anyone (human or agent) writing a course module. Read it fully before writing. A complete, working reference module lives in `src/curriculum/modules/_template/` — copy its patterns.

## 1. Who we write for

- Singapore students aged about 14–19 (Sec 3 to JC/Poly). They know school algebra. Many have never coded.
- They are preparing for **NOAI 2027**: a Preliminary Round of **150 four-option MCQs in 90 minutes (≈36 s each, no calculator)** across five domains (Mathematics, Computing, AI/ML/DL, Generative AI, Problem Solving), then a Final of **20 MCQs + 3 Python programming tasks** (implement-from-scratch in NumPy/PyTorch, in Jupyter, no internet).
- Use **British spelling** (optimisation, normalise, colour, modelling), as Singapore and AI Singapore do.

## 2. Files in a module

```
src/curriculum/modules/<module-slug>/
  index.ts                        module metadata + lesson list (generated; folder name = slug)
  .spec.json                      the curriculum design for this module (concepts + visual specs)
  <lesson-slug>.mdx               one file per lesson (Markdown + JSX)
  quiz.ts                         index of checkpoint files (generated; don't edit)
  quiz/<lesson-slug>.ts           checkpoint questions for one lesson
  visuals/<lesson-slug>/<Name>.tsx  interactive visual explainers for that lesson (default export)
  visuals/<lesson-slug>/*.module.css  optional local styles
```

Only edit files inside your own module folder, and within it only the lessons you were assigned: their `.mdx`, `quiz/<lesson>.ts` and `visuals/<lesson>/`. Other authors may be writing the module's other lessons at the same time. Never edit shared files (`src/components`, `src/styles`, `src/kit.ts`, other modules). If you need something the kit lacks, build it inside your module's `visuals/`.

### index.ts

```ts
import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: 'linear-algebra',          // = folder name
  order: 7,                        // from the curriculum spec
  part: 'maths',                   // part id from src/curriculum/parts.ts
  domain: 'mathematics',           // orientation | mathematics | computing | ai_ml_dl | generative_ai | problem_solving | exam
  title: '…', tagline: '…', summary: '…',
  prerequisites: ['…'],            // module slugs (must have a lower order)
  syllabus: ['…'],
  lessons: [
    { slug: 'vectors', title: '…', summary: '…', minutes: 15, objectives: ['…'], load: () => import('./vectors.mdx') },
  ],
}
export default mod
```

Use `import type` for types. Lesson `load` must point at the lesson's own `.mdx` file.

### quiz/<lesson-slug>.ts

```ts
import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  { id: 'linear-algebra.vectors.1', prompt: 'What is …?', options: ['…', '…', '…', '…'], answer: 0, explanation: '…', difficulty: 'beginner' },
]

export default questions
```

- **4–6 questions per lesson**, NOAI style: four options, exactly one correct, distractors built from real misconceptions.
- Mix styles: definition, quick computation (doable without a calculator), code reading (`code: '…'` field, rendered as Python), scenario/diagnosis, comparison.
- `prompt`, `options` and `explanation` are Markdown: `$…$` maths and `` `code` `` work. In TS strings, escape backslashes: `'$\\sqrt{2}$'`.
- Avoid answer give-aways that real NOAI papers suffer from: the correct option must **not** be systematically the longest or most detailed one (make distractors equally specific), and don't make every absolute-word option ("always", "never", "only") wrong.
- Options are **shuffled** on screen. Never write "A", "option B", "all of the above" or "none of the above". Refer to options by content.
- Explanations: 2–4 sentences: why the right answer is right and why the most tempting wrong one is wrong. Show arithmetic.
- ids: `<module-slug>.<lesson-slug>.<n>`, unique.

## 3. Lesson structure (each .mdx)

Every lesson follows this arc. Headings are `##` (the page already shows the lesson title as `#`).

1. **Hook** (1–3 sentences, no heading): why this matters, in plain words.
2. **Intuition first**: an `<Analogy>` from everyday life (Singapore-relatable where natural: MRT, hawker centres, HDB, CCA, exams, Grab, NDP).
3. **Visual explainer** for each key concept: `<YourVisual />` imported from `./visuals/<lesson-slug>/YourVisual`. The learner must *do* something (drag, slide, step, toggle) and *see* the idea.
4. **Formal idea**: the definition/formula with $\LaTeX$, every symbol explained in words. A `<KeyIdea>` with the one sentence to remember.
5. **Worked example** with `<Steps>`/`<Step title>`: small numbers that can be done by hand.
6. **Code** where relevant: a fenced ```python block, or `<PyRunner>` for runnable NumPy/pandas/scikit-learn. PyTorch cannot run in the browser: show the code in a fenced block followed by its **real** output in a ```text block (run it locally with Python to get the exact output).
7. **`<Mistake>`** for the classic error and **`<ExamTip>`** for how it shows up in NOAI (speed tricks, traps).
8. **Real exam questions**: embed 1–3 relevant official questions with `<PastPaperQuestion paper="prelim2026" n={42} />` (see §6).
9. **`<QuickCheck>`** at least once mid-lesson.
10. **`<Takeaways>`** with a 3–5 item bullet list at the end.

The checkpoint from `quiz.ts` is appended automatically after the lesson. Lessons should take 10–25 minutes. Aim for roughly 900–1800 words of prose per lesson plus visuals, never a wall of text: alternate short paragraphs with visuals, steps and checks.

### Components available in MDX without importing

| Component | Use |
|---|---|
| `<KeyIdea>`, `<Analogy>`, `<Tip>`, `<Mistake>`, `<Note>`, `<TryIt>`, `<ExamTip>` | callouts; optional `title="…"` |
| `<Figure title caption wide>` | frame for any visual (your visuals should render their own `<Figure>`) |
| `<Steps title>` + `<Step title="…">` | step-by-step walkthrough |
| `<Tabs>` + `<Tab label="…">` | alternatives (e.g. Maths / Code) |
| `<Reveal label="Show answer">` | hidden worked answer |
| `<Term def="plain definition">word</Term>` | glossary hover/tap |
| `<Columns min={240}>` | side-by-side blocks that stack on phones |
| `<Takeaways>` | end summary (put a Markdown list inside) |
| `<Hl>` | highlighter on a key phrase |
| `<QuickCheck q options answer explain code? />` | inline MCQ |
| `<PastPaperQuestion paper n />` | real NOAI question |
| `<PyRunner code packages={['numpy']} />` | runnable Python (numpy, pandas, scikit-learn) |
| `<CodeBlock code language title highlight={[2,3]} />` | code with highlighted lines |
| `<MatrixGrid data rows cols cells heat diverging />` | matrices, heat maps, image patches |
| `<Bars data max format />` | horizontal bars (probabilities, weights, metrics) |
| `<NeuralNet layers layerLabels activations weights focus />` | network diagrams |

### MDX gotchas (these break the build)

- `{` and `}` in prose start JavaScript. Write `\{` `\}` or put the text in backticks or maths. Inside `$…$` maths, braces are fine.
- `<` followed by a letter starts JSX. In prose write `&lt;` or use maths ($x < 3$) or backticks.
- No HTML comments `<!-- -->`; use `{/* comment */}`.
- JSX attribute strings are literal: `q="What is $\sqrt{2}$?"` works (single backslash). Inside `{…}` JS expressions or template literals, escape: `{'$\\sqrt{2}$'}`.
- Leave a blank line before and after JSX blocks that contain Markdown, e.g. `<KeyIdea>` on its own line, content, `</KeyIdea>` on its own line.
- Indented text (4 spaces) is not a code block in MDX; use fences.

## 4. Visual explainers (`visuals/*.tsx`)

Each concept gets a visual that produces an "aha". Good visuals let the learner manipulate the one variable that matters and see the consequence immediately (think TensorFlow Playground, Seeing Theory, CNN Explainer, 3Blue1Brown).

```tsx
import { useState } from 'react'
// file: visuals/<lesson-slug>/GradientStep.tsx
import { Figure, Controls, Readout, Slider, Plot, Grid, Axes, FnPath, DraggablePoint, M } from '../../../../../kit'

export default function GradientStep() {
  const [lr, setLr] = useState(0.1)
  return (
    <Figure title="…" caption={<>What to try, and what to notice.</>}>
      <Plot x={[-3, 3]} y={[0, 9]} ariaLabel="…"> … </Plot>
      <Controls>
        <Slider label="learning rate" value={lr} min={0.01} max={1} step={0.01} onChange={setLr} />
        <Readout items={[['loss', '1.23']]} />
      </Controls>
    </Figure>
  )
}
```

Kit exports (`src/kit.ts`): `Figure, Controls, Readout, Slider, Segmented, Toggle, Button, usePlayer, PlayerControls, useAnimationFrame, useBump, Plot, usePlot, Grid, Axes, FnPath, Path, Dots, Arrow, Label, HLine, VLine, Rect, DraggablePoint, MatrixGrid, Bars, NeuralNet, PyRunner, QuickCheck, QuestionCard, M, MBlock, Steps, Step, Tabs, Tab, Reveal, Term, Columns, Takeaways, Hl, callouts, CodeBlock, mulberry32, shuffled, sample, hashString`. Read `src/components/interactive/Plot.tsx` for props: everything in Plot is in **data coordinates**; `usePlot()` gives `xs`/`ys` scales for custom SVG.

Rules:
- **Colours only from theme tokens** so light and dark mode both work: `var(--viz-1)` … `var(--viz-6)`, `var(--viz-pos)`, `var(--viz-neg)`, `var(--viz-axis)`, `var(--viz-grid)`, `var(--viz-ink)`, `var(--viz-muted)`, `var(--viz-fill)`, `var(--surface)`, `var(--surface-2)`, `var(--ink)`, `var(--ink-2)`, `var(--accent)`, `var(--highlight)`. Never hard-code hex colours. In SVG, set colours via `style={{ fill: …, stroke: … }}`.
- For mixing: `color-mix(in srgb, var(--viz-1) 40%, var(--surface))`.
- **Responsive**: SVG via `viewBox` (Plot does this). Nothing wider than its container; works at 360 px wide. Text in SVG ≥ 12 px in viewBox units.
- **Complete at rest**: the first frame already shows something meaningful (not an empty canvas waiting for a click).
- **Deterministic data**: generate datasets with `mulberry32(seed)`, never `Math.random()` during render.
- **Accessible**: every `Plot`/`svg` gets an `ariaLabel`; controls have labels; draggable points are keyboard-operable (DraggablePoint already is).
- **Performance**: keep SVG under ~2,000 elements; use `<canvas>` for pixel grids larger than ~40×40 or heavy animation. Clean up timers/animation frames (use the kit hooks).
- Caption says what to try and what to notice.
- No network requests, no new npm packages, no images from the internet. Draw everything (SVG/canvas) or generate it.
- Numbers shown must be correct: compute them in code from the same formula you teach.

## 5. Accuracy

- Every formula, number, code output and claim must be correct. Verify computations with Python (numpy, pandas, scikit-learn and torch are installed locally). Paste real outputs.
- Use the notation and conventions common in NOAI/IOAI materials (e.g. conv output size $\lfloor (n + 2p - k)/s \rfloor + 1$, PyTorch tensor shapes `(N, C, H, W)`).
- Don't invent facts about NOAI. Exam facts live in `src/data/facts.ts`.

## 6. Embedding real exam questions

Solved official papers are in `src/data/papers/*.json` (fields: `n`, `question`, `options`, `answer`, `domain`, `subtopic`, `concepts`, `explanation`). Paper ids for `<PastPaperQuestion paper=… n=… />`:

- `prelim2026` (n = 1–300, files `prelim2026_chunk1..6.json`)
- `final2026` (n = 1–20, file `final2026_section1.json`)
- `noai2025` (file `noai2025_mcq.json`)

Find candidates with Python, e.g. filter by `subtopic` and keywords in `question`/`concepts`, then pick questions your lesson fully prepares the learner for. Place each right after the part of the lesson that teaches it.

## 7. Check your work

```bash
cd web
MODULE=<module-slug> npx vitest run tests/content.test.tsx   # compiles + renders every lesson, validates quiz
scripts/typecheck-module.sh <module-slug>                     # type errors in your module only
```

Both must be clean. To look at a lesson in a browser, a dev server runs at `http://localhost:5173/#/learn/<module-slug>/<lesson-slug>`; screenshot it with:

```bash
node scripts/screenshot.mjs --out /tmp/shots/<module-slug> --width 1280 /learn/<module-slug>/<lesson-slug>
node scripts/screenshot.mjs --out /tmp/shots/<module-slug> --width 390 --theme dark /learn/<module-slug>/<lesson-slug>
```

It prints horizontal overflow and console errors, and exits non-zero if anything is wrong. Open the PNGs and look at them: are the visuals legible, correctly drawn, and readable in dark mode and on a phone?
