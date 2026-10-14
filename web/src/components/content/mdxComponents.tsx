import type { MDXComponents } from 'mdx/types'
import { Callout, KeyIdea, Analogy, Tip, Mistake, Note, TryIt, ExamTip } from './Callout'
import { CodeBlock, MdxPre } from './CodeBlock'
import { Figure, Controls, Readout } from './Figure'
import { Steps, Step } from './Steps'
import { Tabs, Tab } from './Tabs'
import { Reveal } from './Reveal'
import { Term } from './Term'
import { Columns, Takeaways, Hl } from './Layout'
import { QuickCheck } from '../quiz/QuickCheck'
import { PastPaperQuestion } from '../quiz/PastPaperQuestion'
import { PyRunner } from '../interactive/PyRunner'
import { MatrixGrid } from '../interactive/MatrixGrid'
import { Bars } from '../interactive/Bars'
import { NeuralNet } from '../interactive/NeuralNet'

/** Components available in every lesson .mdx WITHOUT importing them. */
export const mdxComponents: MDXComponents = {
  pre: MdxPre,
  table: (p) => (
    <div className="table-wrap">
      <table {...p} />
    </div>
  ),
  a: ({ href = '', ...rest }) =>
    /^https?:/.test(href) ? <a href={href} target="_blank" rel="noreferrer" {...rest} /> : <a href={href} {...rest} />,
  Callout,
  KeyIdea,
  Analogy,
  Tip,
  Mistake,
  Note,
  TryIt,
  ExamTip,
  CodeBlock,
  Figure,
  Controls,
  Readout,
  Steps,
  Step,
  Tabs,
  Tab,
  Reveal,
  Term,
  Columns,
  Takeaways,
  Hl,
  QuickCheck,
  PastPaperQuestion,
  PyRunner,
  MatrixGrid,
  Bars,
  NeuralNet,
}
