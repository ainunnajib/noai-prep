/* The Python code shown by PlotRecipeBuilder, generated from the current choices (pure TS, no React). */
import { FRIENDLY, defaultTitle, yLabelFor, type Spec } from './labels'

export type Lib = 'mpl' | 'sns'
export type Layout = 'one' | 'row' | 'col'
export type Part = 'import' | 'blank' | 'fig' | 'data' | 'marks' | 'labels' | 'title' | 'legend' | 'show' | 'note'
export interface Line {
  t: string
  p: Part
}

export function genCode(spec: Spec, lib: Lib, labels: boolean, layout: Layout, second: 'price' | 'area'): Line[] {
  const L: Line[] = []
  const A = layout === 'one' ? 'ax' : 'ax1'
  const { kind, x, y, hue } = spec
  const boxFallback = lib === 'mpl' && kind === 'box' && !!hue
  const pandasBar = lib === 'mpl' && kind === 'bar' && !!hue
  L.push({ t: 'import matplotlib.pyplot as plt', p: 'import' })
  if (lib === 'sns' || boxFallback) L.push({ t: 'import seaborn as sns', p: 'import' })
  if (lib === 'mpl' && kind === 'hist' && hue) L.push({ t: 'import numpy as np', p: 'import' })
  L.push({ t: '', p: 'blank' })
  if (layout === 'one') L.push({ t: 'fig, ax = plt.subplots(figsize=(6, 4))', p: 'fig' })
  else if (layout === 'row') L.push({ t: 'fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4))', p: 'fig' })
  else L.push({ t: 'fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(6, 7))', p: 'fig' })

  const h = hue ? `, hue='${hue}'` : ''
  if (lib === 'sns') {
    if (kind === 'scatter') L.push({ t: `sns.scatterplot(data=df, x='${x}', y='${y}'${h}, ax=${A})`, p: 'marks' })
    if (kind === 'line') L.push({ t: `sns.lineplot(data=df, x='year', y='${y}'${h}, estimator='median', errorbar=None, marker='o', ax=${A})`, p: 'marks' })
    if (kind === 'hist') L.push({ t: `sns.histplot(data=df, x='${x}'${h}, bins=${spec.bins}, ax=${A})`, p: 'marks' })
    if (kind === 'bar')
      L.push(
        y === 'count'
          ? { t: `sns.countplot(data=df, x='${x}'${h}, ax=${A})`, p: 'marks' }
          : { t: `sns.barplot(data=df, x='${x}', y='price'${h}, errorbar=None, ax=${A})`, p: 'marks' },
      )
    if (kind === 'box') L.push({ t: `sns.boxplot(data=df, x='${x}', y='${y}'${h}, ax=${A})`, p: 'marks' })
  } else {
    if (kind === 'scatter') {
      if (hue) {
        L.push({ t: `for name, grp in df.groupby('${hue}'):`, p: 'marks' })
        L.push({ t: `    ${A}.scatter(grp['${x}'], grp['${y}'], label=name)`, p: 'marks' })
      } else L.push({ t: `${A}.scatter(df['${x}'], df['${y}'])`, p: 'marks' })
    }
    if (kind === 'line') {
      if (hue) {
        L.push({ t: `for name, grp in df.groupby('${hue}'):`, p: 'marks' })
        L.push({ t: `    med = grp.groupby('year')['${y}'].median()`, p: 'marks' })
        L.push({ t: `    ${A}.plot(med.index, med.values, marker='o', label=name)`, p: 'marks' })
      } else {
        L.push({ t: `med = df.groupby('year')['${y}'].median()`, p: 'data' })
        L.push({ t: `${A}.plot(med.index, med.values, marker='o')`, p: 'marks' })
      }
    }
    if (kind === 'hist') {
      if (hue) {
        L.push({ t: `edges = np.histogram_bin_edges(df['${x}'], bins=${spec.bins})`, p: 'data' })
        L.push({ t: `for name, grp in df.groupby('${hue}'):`, p: 'marks' })
        L.push({ t: `    ${A}.hist(grp['${x}'], bins=edges, alpha=0.5, label=name)`, p: 'marks' })
      } else L.push({ t: `${A}.hist(df['${x}'], bins=${spec.bins})`, p: 'marks' })
    }
    if (kind === 'bar') {
      if (hue) {
        L.push({
          t: y === 'count' ? `table = df.groupby(['${x}', '${hue}']).size().unstack()` : `table = df.groupby(['${x}', '${hue}'])['price'].mean().unstack()`,
          p: 'data',
        })
        L.push({ t: `table.plot.bar(ax=${A}, rot=0)   # pandas draws grouped bars`, p: 'marks' })
      } else {
        L.push({ t: y === 'count' ? `vals = df['${x}'].value_counts().sort_index()` : `vals = df.groupby('${x}')['price'].mean()`, p: 'data' })
        L.push({ t: `${A}.bar(vals.index, vals.values)`, p: 'marks' })
      }
    }
    if (kind === 'box') {
      if (hue) {
        L.push({ t: '# grouped box plots take many lines in plain matplotlib, so:', p: 'note' })
        L.push({ t: `sns.boxplot(data=df, x='${x}', y='${y}', hue='${hue}', ax=${A})`, p: 'marks' })
      } else {
        L.push({ t: `names = sorted(df['${x}'].unique())`, p: 'data' })
        L.push({ t: `groups = [df.loc[df['${x}'] == n, '${y}'] for n in names]`, p: 'data' })
        L.push({ t: `${A}.boxplot(groups)`, p: 'marks' })
        L.push({ t: `${A}.set_xticks(range(1, len(names) + 1), names)`, p: 'marks' })
      }
    }
  }
  if (labels) {
    L.push({ t: `${A}.set_xlabel('${FRIENDLY[x]}')`, p: 'labels' })
    L.push({ t: `${A}.set_ylabel('${yLabelFor(spec)}')`, p: 'labels' })
    L.push({ t: `${A}.set_title('${defaultTitle(spec)}')`, p: 'title' })
  }
  if (lib === 'mpl' && hue && !pandasBar && !boxFallback) L.push({ t: `${A}.legend(title='${hue}')`, p: 'legend' })
  if (layout !== 'one') {
    L.push({ t: '', p: 'blank' })
    L.push(lib === 'sns' ? { t: `sns.histplot(data=df, x='${second}', bins=12, ax=ax2)`, p: 'marks' } : { t: `ax2.hist(df['${second}'], bins=12)`, p: 'marks' })
    if (labels) {
      L.push({ t: `ax2.set_xlabel('${FRIENDLY[second]}')`, p: 'labels' })
      L.push({ t: "ax2.set_ylabel('number of flats')", p: 'labels' })
      L.push({ t: `ax2.set_title('Distribution of ${second === 'area' ? 'floor area' : 'price'}')`, p: 'title' })
    }
    L.push({ t: 'plt.tight_layout()   # stop the two axes overlapping', p: 'fig' })
  }
  L.push({ t: 'plt.show()', p: 'show' })
  return L
}
