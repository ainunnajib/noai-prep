import { PyRunner } from '../../../../../kit'
import css from './runner.module.css'

/*
  The kit's PyRunner, with soft wrapping switched off in its editor, so that on a phone a long line
  scrolls sideways instead of wrapping to column 0 (which looks like wrong Python indentation).
  Used by the code runners in every lesson of this module.
*/
export default function NoWrapRunner({ code, packages = ['numpy'], title }: { code: string; packages?: string[]; title?: string }) {
  return (
    <div className={css.wrap} style={{ maxWidth: '100%' }}>
      <PyRunner code={code} packages={packages} title={title} />
    </div>
  )
}
