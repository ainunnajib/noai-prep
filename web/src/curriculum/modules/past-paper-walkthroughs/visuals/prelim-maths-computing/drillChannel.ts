/*
  A tiny in-page channel between the two figures of this lesson: the template catalogue (PatternCards)
  can ask the drill (TemplateDrill) to deal a variant of one template, and the drill can ask the
  catalogue to open a template's card. Listeners are added and removed by each figure's effects.
*/

type Listener = (templateId: string) => void

function channel() {
  const listeners = new Set<Listener>()
  return {
    send(templateId: string) {
      listeners.forEach((l) => l(templateId))
    },
    listen(l: Listener) {
      listeners.add(l)
      return () => {
        listeners.delete(l)
      }
    },
  }
}

/** "Drill a variant of this" on a card → the drill deals that template */
export const drillRequests = channel()
/** a template name in the drill's feedback → the catalogue opens that card */
export const cardRequests = channel()
