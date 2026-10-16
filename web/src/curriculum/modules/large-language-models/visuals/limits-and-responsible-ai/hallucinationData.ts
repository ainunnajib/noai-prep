/*
  Shared data for the hallucination visuals. The same answer template is filled in with the "fact"
  token, whose probability depends on how well the fact was learnt. All other tokens are confident,
  so the sentence reads equally fluently whether the fact is right or wrong.
  Probabilities are illustrative (chosen by hand), not read from a real model.
*/

export type QId = 'known' | 'rare' | 'madeup'
export type Kind = 'right' | 'wrong' | 'honest'

export interface Option {
  /** the fact token, or null for the "I'm not sure" reply */
  fact: string | null
  p: number
}

export interface Question {
  id: QId
  tab: string
  prompt: string
  remark: string
  template: [string, number][] // '{X}' marks the fact token
  truth: string | null // null: the thing does not exist
  source: string
  noSource: Option[]
  withSource: Option[]
}

const ABSTAIN: [string, number][] = [
  ["'m", 0.9],
  [' not', 0.95],
  [' sure', 0.93],
  ['.', 0.9],
]

export const QUESTIONS: Question[] = [
  {
    id: 'known',
    tab: 'Well-known fact',
    prompt: 'In what year did Singapore become independent?',
    remark: 'This fact appears on thousands of web pages, so the model learnt it well.',
    template: [
      ['Singapore', 0.71],
      [' became', 0.88],
      [' independent', 0.95],
      [' in', 0.97],
      ['{X}', 0],
      ['.', 0.96],
    ],
    truth: '1965',
    source: 'Singapore separated from Malaysia and became an independent country on 9 August 1965.',
    noSource: [
      { fact: '1965', p: 0.94 },
      { fact: '1963', p: 0.03 },
      { fact: '1959', p: 0.02 },
      { fact: null, p: 0.01 },
    ],
    withSource: [
      { fact: '1965', p: 0.99 },
      { fact: '1963', p: 0.005 },
      { fact: '1959', p: 0.003 },
      { fact: null, p: 0.002 },
    ],
  },
  {
    id: 'rare',
    tab: 'Rare fact',
    prompt: "In what year did Singapore's first MRT trains start carrying passengers?",
    remark: 'This fact appears only a few times in the training text, often next to other dates.',
    template: [
      ['The', 0.58],
      [' first', 0.86],
      [' MRT', 0.93],
      [' trains', 0.84],
      [' ran', 0.62],
      [' in', 0.95],
      ['{X}', 0],
      ['.', 0.97],
    ],
    truth: '1987',
    source: 'The first MRT section, between Yio Chu Kang and Toa Payoh, opened to passengers on 7 November 1987.',
    noSource: [
      { fact: '1987', p: 0.37 },
      { fact: '1988', p: 0.28 },
      { fact: '1990', p: 0.14 },
      { fact: '1984', p: 0.09 },
      { fact: '1983', p: 0.07 },
      { fact: null, p: 0.05 },
    ],
    withSource: [
      { fact: '1987', p: 0.97 },
      { fact: '1988', p: 0.01 },
      { fact: '1990', p: 0.005 },
      { fact: '1984', p: 0.005 },
      { fact: '1983', p: 0.005 },
      { fact: null, p: 0.005 },
    ],
  },
  {
    id: 'madeup',
    tab: 'Made-up prize',
    prompt: 'In what year was the Merlion Prize for Robotics first awarded?',
    remark: 'We invented this prize. It does not exist, so the only correct reply is "I\'m not sure".',
    template: [
      ['The', 0.66],
      [' Merlion', 0.97],
      [' Prize', 0.98],
      [' was', 0.9],
      [' first', 0.91],
      [' awarded', 0.95],
      [' in', 0.97],
      ['{X}', 0],
      ['.', 0.97],
    ],
    truth: null,
    source: 'Search found no document that mentions a "Merlion Prize for Robotics".',
    noSource: [
      { fact: '2016', p: 0.22 },
      { fact: '2018', p: 0.19 },
      { fact: '2015', p: 0.17 },
      { fact: '2012', p: 0.14 },
      { fact: '2019', p: 0.12 },
      { fact: '2010', p: 0.1 },
      { fact: null, p: 0.06 },
    ],
    withSource: [
      { fact: null, p: 0.9 },
      { fact: '2016', p: 0.03 },
      { fact: '2018', p: 0.02 },
      { fact: '2015', p: 0.02 },
      { fact: '2012', p: 0.01 },
      { fact: '2019', p: 0.01 },
      { fact: '2010', p: 0.01 },
    ],
  },
]

export const kindOf = (q: Question, o: Option): Kind => {
  if (o.fact === null) return q.truth === null ? 'right' : 'honest'
  return o.fact === q.truth ? 'right' : 'wrong'
}

export const KIND_COLOUR: Record<Kind, string> = { right: 'var(--viz-pos)', wrong: 'var(--viz-neg)', honest: 'var(--viz-6)' }

/** The tokens of one reply, with the probability the model gave each. */
export function tokensOf(q: Question, o: Option): [string, number][] {
  if (o.fact === null) return [['I', o.p], ...ABSTAIN]
  return q.template.map(([t, p]) => (t === '{X}' ? [` ${o.fact}`, o.p] : [t, p]))
}

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length

/** x: how fluent the most likely reply is (mean token probability); y: chance the reply is true. */
export function point(q: Question, src: boolean): [number, number] {
  const opts = src ? q.withSource : q.noSource
  const top = opts.reduce((a, b) => (b.p > a.p ? b : a))
  const fluency = mean(tokensOf(q, top).map(([, p]) => p))
  const truth = opts.filter((o) => kindOf(q, o) === 'right').reduce((a, o) => a + o.p, 0)
  return [fluency, truth]
}

export const sentence = (toks: [string, number][]) => toks.map(([t]) => t).join('')
export const pct = (p: number) => (p >= 0.995 ? '99%' : p < 0.01 ? '<1%' : `${Math.round(p * 100)}%`)

export const SHORT: Record<QId, string> = { known: 'well-known fact', rare: 'rare fact', madeup: 'made-up prize' }
export const QCOL: Record<QId, string> = { known: 'var(--viz-1)', rare: 'var(--viz-2)', madeup: 'var(--viz-4)' }
