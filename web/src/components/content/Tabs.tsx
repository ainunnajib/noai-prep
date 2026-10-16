import { Children, isValidElement, useId, useState, type ReactElement, type ReactNode } from 'react'

export function Tab(props: { label: string; children: ReactNode }) {
  return <>{props.children}</>
}

/** <Tabs><Tab label="Python">…</Tab><Tab label="Maths">…</Tab></Tabs> */
export function Tabs({ children }: { children: ReactNode }) {
  const tabs = Children.toArray(children).filter(isValidElement) as ReactElement<{ label: string; children: ReactNode }>[]
  const [i, setI] = useState(0)
  const id = useId()
  return (
    <div className="tabs">
      <div className="tabs-list" role="tablist">
        {tabs.map((t, k) => (
          <button
            key={k}
            type="button"
            role="tab"
            id={`${id}-t${k}`}
            aria-selected={k === i}
            aria-controls={`${id}-p${k}`}
            className={`tabs-tab${k === i ? ' is-active' : ''}`}
            onClick={() => setI(k)}
          >
            {t.props.label}
          </button>
        ))}
      </div>
      <div className="tabs-panel" role="tabpanel" id={`${id}-p${i}`} aria-labelledby={`${id}-t${i}`}>
        {tabs[i]?.props.children}
      </div>
    </div>
  )
}
