/*
  Audit checkpoint questions (quiz/*.ts) and <QuickCheck>s (lesson .mdx) for answer give-aways:
  the correct option being the longest one, or absolute words appearing only in wrong options.
  Options are shuffled on screen, so the answer index itself does not matter.

    npx vite-node scripts/quiz-audit.ts              # whole course: summary + modules with the most give-aways
    MODULE=numpy npx vite-node scripts/quiz-audit.ts # one module: every flagged question
*/
type Q = { id: string; options: string[]; answer: number }

const quizzes = import.meta.glob('../src/curriculum/modules/*/quiz/*.ts', { eager: true }) as Record<string, { default: Q[] }>
const lessons = import.meta.glob('../src/curriculum/modules/*/*.mdx', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>
const only = process.env.MODULE
const ABS = /\b(always|never|all|none|only|every|guarantees?|impossible|must)\b/i
const moduleOf = (path: string) => path.split('/')[4]

function quickChecks(path: string, src: string): Q[] {
  const out: Q[] = []
  let k = 0
  for (const m of src.matchAll(/<QuickCheck\b[\s\S]*?\/>/g)) {
    k++
    const opts = /options=\{(\[[\s\S]*?\])\}\s*(?:answer|explain|q|code|id)=/.exec(m[0]) ?? /options=\{(\[[\s\S]*?\])\}/.exec(m[0])
    const ans = /answer=\{(\d+)\}/.exec(m[0])
    if (!opts || !ans) continue
    try {
      const options = new Function(`return ${opts[1]}`)() as string[]
      out.push({ id: `${path.split('/').slice(4).join('/')} quickcheck ${k}`, options, answer: Number(ans[1]) })
    } catch {
      /* options built from expressions: skip */
    }
  }
  return out
}

const all: { mod: string; kind: 'checkpoint' | 'quickcheck'; q: Q }[] = []
for (const [p, m] of Object.entries(quizzes)) if (!moduleOf(p).startsWith('_')) for (const q of m.default ?? []) all.push({ mod: moduleOf(p), kind: 'checkpoint', q })
for (const [p, src] of Object.entries(lessons)) if (!moduleOf(p).startsWith('_')) for (const q of quickChecks(p, src)) all.push({ mod: moduleOf(p), kind: 'quickcheck', q })

const rows = all.filter((r) => !only || r.mod === only)
let longest = 0
let strict = 0
let absRight = 0
let absWrong = 0
const per: Record<string, { n: number; strict: number }> = {}
const flagged: string[] = []
for (const { mod, kind, q } of rows) {
  const len = q.options.map((o) => o.length)
  const right = len[q.answer]
  const others = len.filter((_, i) => i !== q.answer)
  const maxOther = Math.max(...others)
  per[mod] ??= { n: 0, strict: 0 }
  per[mod].n++
  if (right >= maxOther) longest++
  if (right > maxOther) {
    strict++
    per[mod].strict++
    flagged.push(`${kind === 'checkpoint' ? q.id : q.id}: correct option is the longest (${right} chars vs ${maxOther}${right > maxOther * 1.15 ? ', more than 15% longer' : ''})`)
  }
  q.options.forEach((o, i) => ABS.test(o) && (i === q.answer ? absRight++ : absWrong++))
}
const n = rows.length
console.log(
  `${only ?? 'course'}: ${n} questions; correct option strictly longest in ${strict} (${((100 * strict) / Math.max(1, n)).toFixed(0)}%, chance is about 25%), longest or tied in ${longest}; absolute words in ${absRight} correct vs ${absWrong} wrong options`,
)
if (only) console.log(flagged.join('\n'))
else
  console.log(
    Object.entries(per)
      .sort((a, b) => b[1].strict / b[1].n - a[1].strict / a[1].n)
      .slice(0, 15)
      .map(([k, v]) => `  ${k}: ${v.strict}/${v.n}`)
      .join('\n'),
  )
