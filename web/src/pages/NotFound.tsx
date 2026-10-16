import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../lib/useDocumentTitle'

export default function NotFound() {
  useDocumentTitle('Page not found')
  return (
    <div className="page page-narrow">
      <div className="page-head">
        <span className="eyebrow">404</span>
        <h1>This page isn't in the notebook</h1>
        <p className="page-lede">The link may be out of date. The course map lists every lesson.</p>
      </div>
      <Link className="btn btn-primary" to="/learn">
        Open the course map
      </Link>
    </div>
  )
}
