import type { ReactNode } from 'react'

/** Frame for every visual explainer: an index card clipped onto the notebook page. */
export function Figure({
  title,
  caption,
  children,
  wide,
}: {
  title?: ReactNode
  caption?: ReactNode
  children: ReactNode
  /** let the figure use the full content width instead of the reading measure */
  wide?: boolean
}) {
  return (
    <figure className={`figure${wide ? ' figure-wide' : ''}`}>
      {title && <div className="figure-title">{title}</div>}
      <div className="figure-body">{children}</div>
      {caption && <figcaption className="figure-caption">{caption}</figcaption>}
    </figure>
  )
}

/** A row of controls (sliders, toggles, buttons) under or above a visual. */
export function Controls({ children }: { children: ReactNode }) {
  return <div className="controls">{children}</div>
}

/** Small read-out of live values next to a visual: <Readout items={[['slope', '2.0'], …]} /> */
export function Readout({ items }: { items: [ReactNode, ReactNode][] }) {
  return (
    <dl className="readout">
      {items.map(([k, v], i) => (
        <div key={i} className="readout-item">
          <dt>{k}</dt>
          <dd className="tabular">{v}</dd>
        </div>
      ))}
    </dl>
  )
}
