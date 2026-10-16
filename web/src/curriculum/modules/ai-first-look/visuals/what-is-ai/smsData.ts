/*
  Twenty made-up SMS messages (10 spam, 10 normal), listed in the order the learner reads them,
  plus 8 NEW messages (4 spam, 4 normal) that are never used for learning: they are the fair test.
  spam = 1 means the message is spam. The word-score learner and the keyword rules in
  RulesVsExamples are checked in Python (same tokeniser): the learner reaches 20/20 after reading
  all 20 and then gets 7/8 new messages right; the default rules (free, win, prize) score 7/20 and 2/8.
  Every set of the 12 palette keywords that scores 20/20 on the training messages gets only 3 or 4
  of the 8 new ones right (the best any palette set manages on the new messages is 5/8).
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

/** New messages: neither method learns from these. They are only used to test both at the end. */
export const NEW_SMS: Sms[] = [
  { text: 'Your package could not be delivered. Reschedule the delivery at bit.ly/redeliver7', spam: 1 },
  { text: 'Are you free now? Can call you after dinner', spam: 0 },
  { text: 'Hi, I am a recruiter. Work from home 2 hours a day and earn big. WhatsApp me', spam: 1 },
  { text: 'Mum says can bring the cash for the class trip tomorrow', spam: 0 },
  { text: 'Your bank login has expired. Log in again at bank-secure-sg.co to keep your account', spam: 1 },
  { text: 'Happy to help! I won the class quiz prize, will treat you', spam: 0 },
  { text: 'Final notice: pay your $4.50 road toll today at toll-pay-sg.co', spam: 1 },
  { text: 'Is this your water bottle? You left it at the canteen', spam: 0 },
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
export const NEW_TOKENS: string[][] = NEW_SMS.map((m) => tokens(m.text))

/** Word scores after reading the first k messages: +1 per spam message containing the word, −1 per normal one. */
export function scoresAfter(k: number): Map<string, number> {
  const sc = new Map<string, number>()
  for (let i = 0; i < k; i++) {
    const d = SMS[i].spam ? 1 : -1
    for (const w of SMS_TOKENS[i]) sc.set(w, (sc.get(w) ?? 0) + d)
  }
  return sc
}

/** Total score of a tokenised message under the given word scores (unseen words score 0). Above 0 means "spam". */
export function tokensScore(toks: string[], sc: Map<string, number>): number {
  return toks.reduce((a, w) => a + (sc.get(w) ?? 0), 0)
}

/** Total score of training message i under the given word scores. Above 0 means "spam". */
export function messageScore(i: number, sc: Map<string, number>): number {
  return tokensScore(SMS_TOKENS[i], sc)
}
