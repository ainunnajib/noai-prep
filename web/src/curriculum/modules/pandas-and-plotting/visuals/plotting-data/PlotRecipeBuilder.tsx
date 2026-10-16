import { useState } from 'react'
import { Figure, Controls, Segmented, Toggle, Slider, useNarrow } from '../../../../../kit'
import { Chart, FRIENDLY, PART_COLOURS, defaultTitle, yLabelFor, type CatCol, type Kind, type Spec, type YCol } from './charts'
import { genCode, type Layout, type Lib, type Part } from './recipeCode'
import { DATA } from './hdb'
import s from './pc.module.css'

/*
  Build a plot from a DataFrame and read the code that makes it. Every choice rewrites both the
  live figure and the code, and (with "anatomy" on) each code line is colour-matched to the part
  of the figure it creates: figure, axes, title, axis labels, legend.
*/

const X_OPTIONS: Record<Kind, Spec['x'][]> = {
  scatter: ['area', 'year'],
  line: ['year'],
  hist: ['price', 'area'],
  bar: ['town', 'flat_type'],
  box: ['flat_type', 'town'],
}
const Y_OPTIONS: Record<Kind, YCol[]> = {
  scatter: ['price', 'area'],
  line: ['price', 'area'],
  hist: ['count'],
  bar: ['price', 'count'],
  box: ['price', 'area'],
}
const PREVIEW_ROWS = [3, 31, 58, 86, 115, 140]

const LINE_COLOUR: Partial<Record<Part, string>> = {
  fig: PART_COLOURS.fig,
  marks: PART_COLOURS.axes,
  labels: PART_COLOURS.labels,
  title: PART_COLOURS.title,
  legend: PART_COLOURS.legend,
}

const KIND_DEFAULTS: Record<Kind, [Spec['x'], YCol]> = {
  scatter: ['area', 'price'],
  line: ['year', 'price'],
  hist: ['price', 'count'],
  bar: ['town', 'price'],
  box: ['flat_type', 'price'],
}

export default function PlotRecipeBuilder() {
  const [kind, setKindRaw] = useState<Kind>('scatter')
  const [x, setX] = useState<Spec['x']>('area')
  const [y, setY] = useState<YCol>('price')
  const [hue, setHue] = useState<CatCol | null>(null)
  const [bins, setBins] = useState(12)
  const [lib, setLib] = useState<Lib>('mpl')
  const [labels, setLabels] = useState(true)
  const [layout, setLayout] = useState<Layout>('one')
  const [anatomy, setAnatomy] = useState(true)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(600)

  const setKind = (k: Kind) => {
    setKindRaw(k)
    const [dx, dy] = KIND_DEFAULTS[k]
    setX(dx)
    setY(dy)
    if (hue && hue === dx) setHue(null)
  }
  const validHue = hue && hue !== x ? hue : null
  const spec: Spec = { kind, x, y, hue: validHue, bins }
  const second: 'price' | 'area' = kind === 'hist' && x === 'price' ? 'area' : 'price'

  const autoLabels = lib === 'sns' || (kind === 'box' && !!validHue)
  const pandasBar = lib === 'mpl' && kind === 'bar' && !!validHue
  const autoY = kind === 'hist' ? 'Count' : kind === 'bar' && y === 'count' ? 'count' : y
  const xlabel = labels ? FRIENDLY[x] : autoLabels || pandasBar ? x : undefined
  const ylabel = labels ? yLabelFor(spec) : autoLabels ? autoY : undefined
  const title = labels ? defaultTitle(spec) : undefined
  const code = genCode(spec, lib, labels, layout, second)

  const two = layout !== 'one'
  const chartW = layout === 'row' ? 360 : 540
  const chartH = layout === 'row' ? 300 : 320

  let note: string
  if (two)
    note = `plt.subplots(${layout === 'row' ? '1, 2' : '2, 1'}) returned one figure holding two axes, ax1 and ax2. Every plotting and labelling call names the axes it draws on.`
  else if (!labels && lib === 'mpl')
    note =
      'Without set_xlabel, set_ylabel and set_title, matplotlib leaves the axes unlabelled: nobody can tell what the numbers mean or which units they are in.'
  else if (!labels && lib === 'sns')
    note =
      'seaborn labelled the axes with the column names and drew the legend by itself. You still add a title, and friendlier labels with units, using the usual ax methods.'
  else if (lib === 'mpl' && validHue && kind !== 'box' && kind !== 'bar')
    note = `With a hue, plain matplotlib needs one plotting call per group: a for loop over df.groupby('${validHue}'), each call with label=name, then ax.legend() to draw the key. Switch the library to seaborn to see the same plot in one call with hue='${validHue}'.`
  else if (lib === 'mpl' && validHue)
    note = `Grouped ${kind === 'box' ? 'box plots' : 'bars'} take many lines in plain matplotlib, so the code hands over to ${kind === 'box' ? 'seaborn' : "pandas' own .plot.bar()"} for this one. The figure, axes and labels around it are the same recipe.`
  else if (lib === 'sns')
    note =
      'The seaborn call replaces the plotting step only: the figure, the axes and the labels are the same matplotlib recipe. seaborn takes the whole DataFrame plus column names.'
  else
    note =
      'Every matplotlib plot is the same recipe: make a figure and axes, call one plotting method on the axes, then label it. Only the middle step changes between plot types.'

  const xOpts = X_OPTIONS[kind]
  const yOpts = Y_OPTIONS[kind]
  const hueOpts: { value: string; label: string }[] = [
    { value: 'none', label: 'none' },
    ...(['flat_type', 'town'] as CatCol[]).filter((c) => c !== x).map((c) => ({ value: c, label: c })),
  ]

  const thCls = (c: string) => (c === x ? s.colX : c === y ? s.colY : c === validHue ? s.colH : undefined)

  return (
    <Figure
      title="The plotting recipe, line by line"
      caption={
        <>
          Pick a plot type and the columns. Switch between <b>matplotlib</b> and <b>seaborn</b>, turn the labels off and on, and add a second subplot. With{' '}
          <b>anatomy</b> on, each line of code is colour-matched to the part of the figure it creates. Notice that only the plotting call in the middle changes;
          the figure → axes → labels frame around it never does.
        </>
      }
    >
      <div className={s.ctrlStack}>
        <Controls>
          <Segmented
            label="plot"
            value={kind}
            onChange={setKind}
            options={(['scatter', 'line', 'hist', 'bar', 'box'] as Kind[]).map((k) => ({ value: k, label: k }))}
          />
          <Segmented
            label="library"
            value={lib}
            onChange={setLib}
            options={[
              { value: 'mpl', label: 'matplotlib' },
              { value: 'sns', label: 'seaborn' },
            ]}
          />
        </Controls>
        <Controls>
          {xOpts.length > 1 && <Segmented label="x" value={x} onChange={(v) => setX(v)} options={xOpts.map((c) => ({ value: c, label: c }))} />}
          {yOpts.length > 1 && (
            <Segmented
              label={kind === 'bar' ? 'bar height' : 'y'}
              value={y}
              onChange={(v) => setY(v)}
              options={yOpts.map((c) => ({ value: c, label: kind === 'bar' ? (c === 'count' ? 'count' : 'mean price') : c }))}
            />
          )}
          <Segmented label="hue" value={validHue ?? 'none'} onChange={(v) => setHue(v === 'none' ? null : (v as CatCol))} options={hueOpts} />
          {kind === 'hist' && <Slider label="bins" value={bins} min={4} max={30} step={1} onChange={setBins} />}
        </Controls>
        <Controls>
          <Segmented
            label="subplots"
            value={layout}
            onChange={setLayout}
            options={[
              { value: 'one', label: '1 axes' },
              { value: 'row', label: '1 × 2' },
              { value: 'col', label: '2 × 1' },
            ]}
          />
          <Toggle label="labels and title" checked={labels} onChange={setLabels} />
          <Toggle label="anatomy" checked={anatomy} onChange={setAnatomy} />
        </Controls>
      </div>

      <div className={s.preview}>
        <table className={s.tbl}>
          <thead>
            <tr>
              <th />
              {(['town', 'flat_type', 'area', 'price', 'year'] as const).map((c) => (
                <th key={c} className={thCls(c)}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PREVIEW_ROWS.map((i) => (
              <tr key={i}>
                <td style={{ color: 'var(--ink-3)' }}>{i}</td>
                {(['town', 'flat_type', 'area', 'price', 'year'] as const).map((c) => (
                  <td key={c} className={thCls(c)}>
                    {DATA[i][c]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className={s.tblCaption}>
          6 of the 144 rows of <code>df</code>. Highlighted: <span className={s.colX}>&nbsp;x&nbsp;</span> <span className={s.colY}>&nbsp;y&nbsp;</span>{' '}
          <span className={s.colH}>&nbsp;hue&nbsp;</span>
        </div>
      </div>

      <div ref={wrapRef} className={`${s.figFrame} ${anatomy ? s.figFrameOn : ''}`}>
        {anatomy && <span className={s.figTag}>Figure</span>}
        <div className={s.scroller}>
          <div className={s.axesGrid} style={{ gridTemplateColumns: layout === 'row' ? '1fr 1fr' : '1fr', minWidth: layout === 'row' ? 600 : undefined }}>
            <Chart
              spec={spec}
              width={chartW}
              height={chartH}
              maxWidth={layout === 'row' ? 460 : 640}
              minHeight={two && layout === 'row' ? 190 : 240}
              title={title}
              xlabel={xlabel}
              ylabel={ylabel}
              legendTitle={validHue ?? null}
              anatomy={anatomy}
              ariaLabel={`${kind} plot of ${y} against ${x}${validHue ? ` coloured by ${validHue}` : ''}`}
            />
            {two && (
              <Chart
                spec={{ kind: 'hist', x: second, y: 'count', hue: null, bins: 12 }}
                width={chartW}
                height={chartH}
                maxWidth={layout === 'row' ? 460 : 640}
                minHeight={layout === 'row' ? 190 : 240}
                title={labels ? `Distribution of ${second === 'area' ? 'floor area' : 'price'}` : undefined}
                xlabel={labels ? FRIENDLY[second] : lib === 'sns' ? second : undefined}
                ylabel={labels ? 'number of flats' : lib === 'sns' ? 'Count' : undefined}
                anatomy={anatomy}
                ariaLabel={`Histogram of ${second} on the second axes`}
              />
            )}
          </div>
        </div>
      </div>
      {layout === 'row' && narrow && <div className={s.tblCaption}>Scroll sideways inside the figure to see both axes.</div>}

      {anatomy && (
        <div className={s.key} aria-label="Colour key for the anatomy outlines">
          {(
            [
              ['Figure (plt.subplots)', PART_COLOURS.fig],
              ['Axes + plotting call', PART_COLOURS.axes],
              ['title', PART_COLOURS.title],
              ['axis labels', PART_COLOURS.labels],
              ['legend', PART_COLOURS.legend],
            ] as const
          ).map(([t, c]) => (
            <span key={t} className={s.keyItem} style={{ color: c }}>
              <span className={s.keySwatch} />
              <span style={{ color: 'var(--ink-2)' }}>{t}</span>
            </span>
          ))}
        </div>
      )}

      <pre className={s.code} aria-label="Python code that draws this figure">
        {code.map((l, i) => (
          <span
            key={i}
            className={s.codeLine}
            style={{
              borderLeftColor: anatomy && LINE_COLOUR[l.p] ? LINE_COLOUR[l.p] : 'transparent',
              color: l.p === 'note' || l.p === 'import' ? 'var(--ink-3)' : undefined,
            }}
          >
            {l.t || ' '}
          </span>
        ))}
      </pre>
      <div className={s.verdict} aria-live="polite">
        {note}
      </div>
    </Figure>
  )
}
