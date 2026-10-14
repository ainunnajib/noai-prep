/** Course parts, in order. Modules reference a part by id. Generated from the curriculum spec. */
export interface PartDef {
  id: string
  order: number
  title: string
  summary: string
}

export const parts: PartDef[] = [
  { id: "start", order: 0, title: "Start here", summary: "What NOAI is and how to use this course." },
]
