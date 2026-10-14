/*
  Twenty made-up SMS messages (10 spam, 10 normal), listed in the order the learner reads them.
  spam = 1 means the message is spam. The word-score learner and the keyword rules in
  RulesVsExamples are checked in Python (same tokeniser): the learner reaches 20/20 after reading
  all 20; the default rules (free, win, prize) score 7/20.
*/
export interface Sms {
  text: string
  spam: 0 | 1
}

export const SMS: Sms[] = [
  { text: 'WIN a FREE phone! Reply YES now to claim your prize', spam: 1 },
  { text: 'Are you free for lunch later? Thinking chicken rice', spam: 0 },
  { text: 'Congratulations! You have been selected for a $500 voucher. Claim at bit.ly/vch88', spam: 1 },
  { text: 'Did our CCA team win the match today?', spam: 0 },
  { text: 'URGENT: your bank account is locked. Verify now at secure-bank-login.co', spam: 1 },
  { text: 'Buy eggs on the way home can?', spam: 0 },
  { text: 'Your parcel is held at customs. Pay the $2.50 fee at parcel-sg-help.com', spam: 1 },
  { text: 'Meet at Tampines MRT at 7, ok lah', spam: 0 },
  { text: 'Earn $300 a day from home! Txt JOB to 72888', spam: 1 },
  { text: 'Reminder: maths tuition moved to Thursday 4pm', spam: 0 },
  { text: 'Exclusive offer: 90% off luxury watches, today only at lux-deals.com', spam: 1 },
  { text: 'Can you send me the chem notes? Thanks!', spam: 0 },
  { text: 'Hi dear, part-time job, $200/day, no experience needed. WhatsApp me', spam: 1 },
  { text: 'Happy birthday!! Free tonight? Let’s go makan', spam: 0 },
  { text: 'You have won a cash reward! Call 9123 4567 to collect', spam: 1 },
  { text: 'Running late, bus is packed. Reach in 10 min', spam: 0 },
  { text: 'Your account will be suspended. Update your details at acct-renew.com', spam: 1 },
  { text: 'Call me when you reach home', spam: 0 },
  { text: 'Last chance! Your $1,000 shopping credit expires tonight. Tap to redeem', spam: 1 },
  { text: 'Got the prize for best project!! So happy', spam: 0 },
]

const LINK = /[a-z0-9./-]+\.(com|co|ly)(\/[a-z0-9]*)?/

/** Split a message into the distinct "words" the learner scores: lower-case words, plus "$" and "[web link]". */
export function tokens(text: string): string[] {
  let s = text.toLowerCase().replace(/’/g, "'")
  const out: string[] = []
  if (LINK.test(s)) {
    out.push('[web link]')
    s = s.replace(new RegExp(LINK.source, 'g'), ' ')
  }
  if (s.includes('$')) out.push('$')
  for (const w of s.match(/[a-z]+/g) ?? []) if (!out.includes(w)) out.push(w)
  return out
}

export const SMS_TOKENS: string[][] = SMS.map((m) => tokens(m.text))

/** Word scores after reading the first k messages: +1 per spam message containing the word, −1 per normal one. */
export function scoresAfter(k: number): Map<string, number> {
  const sc = new Map<string, number>()
  for (let i = 0; i < k; i++) {
    const d = SMS[i].spam ? 1 : -1
    for (const w of SMS_TOKENS[i]) sc.set(w, (sc.get(w) ?? 0) + d)
  }
  return sc
}

/** Total score of message i under the given word scores. Above 0 means "spam". */
export function messageScore(i: number, sc: Map<string, number>): number {
  return SMS_TOKENS[i].reduce((a, w) => a + (sc.get(w) ?? 0), 0)
}
