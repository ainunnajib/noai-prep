/** The mock exam lengths on offer (the Mock exam page, and its history on the Account page). */
export interface MockFormat {
  id: string
  title: string
  questions: number
  minutes: number
  note: string
}

export const MOCK_FORMATS: MockFormat[] = [
  { id: 'prelim2027', title: 'Full prelim', questions: 150, minutes: 90, note: 'The NOAI 2027 Preliminary Round format: 150 questions, 90 minutes.' },
  { id: 'half', title: 'Half paper', questions: 75, minutes: 45, note: 'Same pace, half the length. Good for a weekday evening.' },
  { id: 'sprint', title: 'Sprint', questions: 30, minutes: 18, note: 'A quick 18-minute burst at exam pace.' },
  { id: 'marathon', title: '2026 marathon', questions: 300, minutes: 180, note: 'The 2026 format: 300 questions in 3 hours. For stamina.' },
]
