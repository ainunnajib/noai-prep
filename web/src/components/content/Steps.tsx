import { Children, isValidElement, useState, type ReactElement, type ReactNode } from 'react'
import { RichText } from '../quiz/RichText'

const rich = (t: ReactNode) => (typeof t === 'string' ? <RichText text={t} inline /> : t)

/** One step inside <Steps>. */
export function Step(props: { title: ReactNode; children: ReactNode }) {
  return <>{props.children}</>
}

/**
 * Step-by-step walkthrough. Shows one step at a time with Back/Next, or all at once.
 *   <Steps>
 *     <Step title="Multiply row by column">…</Step>
 *     <Step title="Add the products">…</Step>
 *   </Steps>
 */
export function Steps({ children, title }: { children: ReactNode; title?: ReactNode }) {
  const steps = Children.toArray(children).filter(isValidElement) as ReactElement<{ title: ReactNode; children: ReactNode }>[]
  const [i, setI] = useState(0)
  const [all, setAll] = useState(false)
  const n = steps.length
  if (n === 0) return null
  const cur = steps[Math.min(i, n - 1)]

  return (
    <section className="steps" aria-label={typeof title === 'string' ? title : 'Step-by-step walkthrough'}>
      <div className="steps-head">
        <span className="steps-title">{rich(title ?? 'Step by step')}</span>
        <button type="button" className="btn btn-ghost btn-small" onClick={() => setAll((v) => !v)}>
          {all ? 'One at a time' : 'Show all steps'}
        </button>
      </div>
      {all ? (
        <ol className="steps-all">
          {steps.map((s, k) => (
            <li key={k} className="steps-item">
              <div className="steps-item-title">
                <span className="steps-num tabular">{k + 1}</span>
                {rich(s.props.title)}
              </div>
              <div className="steps-item-body">{s.props.children}</div>
            </li>
          ))}
        </ol>
      ) : (
        <>
          <ol className="steps-dots" aria-hidden="true">
            {steps.map((_, k) => (
              <li key={k} className={k === i ? 'is-current' : k < i ? 'is-done' : ''} />
            ))}
          </ol>
          <div className="steps-item" aria-live="polite">
            <div className="steps-item-title">
              <span className="steps-num tabular">{i + 1}</span>
              {rich(cur.props.title)}
              <span className="steps-count tabular">
                {i + 1} / {n}
              </span>
            </div>
            <div className="steps-item-body">{cur.props.children}</div>
          </div>
          <div className="steps-nav">
            <button type="button" className="btn btn-small" disabled={i === 0} onClick={() => setI(i - 1)}>
              Back
            </button>
            <button type="button" className="btn btn-primary btn-small" disabled={i === n - 1} onClick={() => setI(i + 1)}>
              Next step
            </button>
          </div>
        </>
      )}
    </section>
  )
}
