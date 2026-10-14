import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PAPERS } from '../data/papers'
import { LINKS } from '../data/facts'

export default function PastPapers() {
  useEffect(() => {
    document.title = 'Past papers · NOAI Prep'
    return () => {
      document.title = 'NOAI Prep'
    }
  }, [])
  return (
    <div className="page page-narrow">
      <div className="page-head">
        <span className="eyebrow">Official past papers</span>
        <h1>Real NOAI questions, solved</h1>
        <p className="page-lede">
          AI Singapore has published its past papers. Here every multiple-choice question is answered and explained. Try each one before revealing the answer.
        </p>
      </div>
      <div className="paper-list">
        {PAPERS.map((p) => (
          <article key={p.id} className="paper-card">
            <div style={{ display: 'grid', gap: '0.35rem', minWidth: 0 }}>
              <span className="eyebrow">
                {p.round} · {p.date}
              </span>
              <h3>{p.title}</h3>
              <p>{p.format}</p>
              <a href={p.sourceUrl} target="_blank" rel="noreferrer" className="fineprint">
                Original paper from AI Singapore
              </a>
            </div>
            <Link to={`/papers/${p.id}`} className="btn btn-primary">
              Open paper
            </Link>
          </article>
        ))}
      </div>

      <section className="section">
        <div className="section-head">
          <span className="eyebrow">Programming rounds</span>
          <h2>Final programming tasks</h2>
          <p>
            The Final's Section 2 is three Jupyter notebook tasks. The course's exam-practice part walks through each past task step by step. The original notebooks and official
            solutions are on GitHub.
          </p>
        </div>
        <ul style={{ display: 'grid', gap: '0.4rem', paddingLeft: '1.2rem' }}>
          <li>
            <a href={LINKS.final2026Repo} target="_blank" rel="noreferrer">
              NOAI 2026 Final tasks
            </a>
            : gradient boosting from scratch, debugging a U-Net and computing mean IoU, implementing attention.
          </li>
          <li>
            <a href={LINKS.noai2025Repo} target="_blank" rel="noreferrer">
              NOAI 2025 tasks
            </a>
            : linear regression with gradient descent, K-means clustering, a retrieval-augmented generation pipeline.
          </li>
          <li>
            <a href={LINKS.ioaiGithub} target="_blank" rel="noreferrer">
              IOAI tasks
            </a>{' '}
            for students aiming beyond NOAI.
          </li>
        </ul>
      </section>
      <p className="fineprint" style={{ marginTop: '2rem' }}>
        Questions are © AI Singapore and reproduced for study with links to the originals. Answers and explanations are written by NOAI Prep, because no official answer key was
        published for 2026. Each answer was checked by two independent solvers; questions we found ambiguous are marked.
      </p>
    </div>
  )
}
