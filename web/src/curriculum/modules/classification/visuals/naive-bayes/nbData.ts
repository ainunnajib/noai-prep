/*
  The running Naive Bayes example: 10 short training messages (4 spam, 6 normal), each cut down to the
  words of a 6-word vocabulary.

    spam   : "win free prize now", "free prize", "win free lunch", "free"
    normal : "homework now", "lunch now", "free lunch", "win", "lunch homework", "homework"

  Word counts (10 words in each class):
               free win prize now lunch homework
    spam         4   2    2    1    1      0
    normal       1   1    0    2    3      3
  Priors: P(spam) = 4/10 = 0.4, P(normal) = 6/10 = 0.6.
  Multinomial Naive Bayes: P(word | class) = (count + α) / (words in class + α·|V|), with |V| = 6.
*/

export const VOCAB = ['free', 'win', 'prize', 'now', 'lunch', 'homework'] as const
export type Word = (typeof VOCAB)[number]

export const CLASSES = ['spam', 'normal'] as const
export type Cls = (typeof CLASSES)[number]

export const MESSAGES: Record<Cls, string[]> = {
  spam: ['win free prize now', 'free prize', 'win free lunch', 'free'],
  normal: ['homework now', 'lunch now', 'free lunch', 'win', 'lunch homework', 'homework'],
}

export const COUNTS: Record<Cls, Record<Word, number>> = {
  spam: { free: 4, win: 2, prize: 2, now: 1, lunch: 1, homework: 0 },
  normal: { free: 1, win: 1, prize: 0, now: 2, lunch: 3, homework: 3 },
}

export const N_MSG: Record<Cls, number> = { spam: 4, normal: 6 }
export const PRIOR: Record<Cls, number> = { spam: 0.4, normal: 0.6 }
export const TOTAL: Record<Cls, number> = { spam: 10, normal: 10 }

export const CLS_C: Record<Cls, string> = { spam: 'var(--viz-4)', normal: 'var(--viz-3)' }
/** the class colours for text: --viz-3 is too light for text on white, so it uses its darker twin */
export const CLS_INK: Record<Cls, string> = { spam: 'var(--viz-4)', normal: 'var(--viz-3-ink)' }

/** numerator and denominator of P(word | class) with add-α smoothing */
export function likelihood(c: Cls, w: Word, alpha: number): { num: number; den: number; p: number } {
  const num = COUNTS[c][w] + alpha
  const den = TOTAL[c] + alpha * VOCAB.length
  return { num, den, p: num / den }
}

/** prior × product of likelihoods, and the posterior after normalising over the two classes */
export function scores(words: readonly Word[], alpha: number) {
  const raw = {} as Record<Cls, number>
  for (const c of CLASSES) raw[c] = words.reduce((acc, w) => acc * likelihood(c, w, alpha).p, PRIOR[c])
  const total = raw.spam + raw.normal
  const post = total > 0 ? { spam: raw.spam / total, normal: raw.normal / total } : null
  return { raw, post }
}

/** Format a probability as a short fraction string like "4/10" or "5/16". */
export const frac = (num: number, den: number) => `${Number.isInteger(num) ? num : num.toFixed(1)}/${Number.isInteger(den) ? den : den.toFixed(1)}`

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹'
const sup = (n: number) => (n < 0 ? '⁻' : '') + String(Math.abs(n)).split('').map((d) => SUP[+d]).join('')

/** Compact number for tiny products: 0.0016, 3.2 × 10⁻⁵ … */
export function small(v: number) {
  if (v === 0) return '0'
  if (v >= 0.001) return String(Number(v.toPrecision(2)))
  let e = Math.floor(Math.log10(v))
  let m = v / 10 ** e
  if (Number(m.toFixed(1)) >= 10) {
    m /= 10
    e += 1
  }
  return `${m.toFixed(1)} × 10${sup(e)}`
}
