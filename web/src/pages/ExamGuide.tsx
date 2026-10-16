import { Link } from 'react-router-dom'
import { CONTACT_EMAIL, DOMAINS, FACTS_CHECKED_ON, FINAL, FORMAT_HISTORY, FUNNEL, IOAI_RESULTS, LINKS, PRELIM, TIMELINE, daysUntil, nextMilestone, plural } from '../data/facts'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { useState } from 'react'
import { Bars } from '../components/interactive/Bars'
import { SUBTOPIC_LABEL } from '../data/bank'
import paperStats from '../data/paperStats.json'

const STYLE_LABEL: Record<string, string> = {
  definition: 'Know the definition',
  'why-reasoning': 'Explain why',
  comparison: 'Compare two ideas',
  'scenario-diagnosis': 'Diagnose a scenario',
  computation: 'Quick calculation',
  'code-reading': 'Read code',
}

function CopyEmail() {
  const [copied, setCopied] = useState(false)
  return (
    <span className="copyable">
      {CONTACT_EMAIL}
      <button
        type="button"
        className="btn btn-ghost btn-small"
        onClick={() =>
          navigator.clipboard?.writeText(CONTACT_EMAIL).then(
            () => setCopied(true),
            () => setCopied(false),
          )
        }
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </span>
  )
}

export default function ExamGuide() {
  const today = new Date()
  const next = nextMilestone(today)
  const writeInDays = daysUntil('2026-11-27T23:59:00+08:00', today)
  const schoolDays = daysUntil('2027-01-15T23:59:00+08:00', today)
  const longest = paperStats.cues.longest
  const absolute = paperStats.cues.absoluteStart
  const pct = (r: { right: number; of: number }) => Math.round((100 * r.right) / r.of)
  useDocumentTitle('NOAI 2027 exam guide')

  return (
    <div className="page">
      <div className="page-head">
        <span className="eyebrow">Exam guide · facts checked {FACTS_CHECKED_ON}</span>
        <h1>NOAI 2027: what you'll face and when</h1>
        <p className="page-lede">
          The National Olympiad in Artificial Intelligence is run by AI Singapore. It has two rounds, and the strongest finalists go on to NTU's selection and training
          for the International Olympiad in AI, which Singapore hosts in July 2027.
        </p>
        {next && (
          <div className="lesson-meta">
            <span className="chip chip-accent tabular">
              {next.days === 0 ? `${next.name}: today` : `${next.name} in ${plural(next.days, 'day')}`}
            </span>
          </div>
        )}
        {(writeInDays >= 0 || schoolDays >= 0) && (
          <div className="guide-now" role="note" aria-label="Do this now">
            <strong>Do this now</strong>
            <ul>
              {schoolDays >= 0 && (
                <li>
                  <b>In an MOE school, IP, JC, ITE or poly:</b> ask your school's NOAI teacher representative whether your school has signed up. Schools register interest by 15 Jan
                  2027, and only 12 had done so by 29 Sep 2026 (the list is on the <a href={LINKS.noai2027}>NOAI 2027 page</a>). Students cannot register on their own.
                </li>
              )}
              {writeInDays >= 0 && (
                <li>
                  <b>Not in an MOE school:</b> email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> by 27 Nov 2026 ({plural(writeInDays, 'day')} left).
                  Home-schooled Singapore Citizens and PRs: give your full name, age and learning arrangement. Between schools (for example, finished Sec 4 and joining a JC or
                  poly): your name, your most recent school and where you will study next. Private or international school students: your name, school, year level and
                  nationality (decided case by case, with no guarantee).
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      <div className="guide-grid">
        <section className="guide-card" aria-labelledby="g-prelim">
          <span className="eyebrow">Round 1</span>
          <h3 id="g-prelim">Preliminary Round</h3>
          <dl>
            <dt>When</dt>
            <dd>{PRELIM.dateLabel}</dd>
            <dt>Format</dt>
            <dd>
              <strong>{PRELIM.questions} multiple-choice questions</strong> in <strong>{PRELIM.minutes} minutes</strong> (about {PRELIM.secondsPerQuestion} seconds each)
            </dd>
            <dt>Where</dt>
            <dd>{PRELIM.mode}</dd>
            <dt>Marking</dt>
            <dd>{PRELIM.marking}</dd>
            <dt>Allowed</dt>
            <dd>{PRELIM.materials}</dd>
            <dt>Next</dt>
            <dd>{PRELIM.advance}</dd>
          </dl>
        </section>
        <section className="guide-card" aria-labelledby="g-final">
          <span className="eyebrow">Round 2</span>
          <h3 id="g-final">Final Assessment</h3>
          <dl>
            <dt>When</dt>
            <dd>{FINAL.dateLabel}</dd>
            <dt>Format</dt>
            <dd>{FINAL.format}</dd>
            <dt>Last year</dt>
            <dd>{FINAL.lastYear}</dd>
            <dt>Results</dt>
            <dd>{FINAL.results}</dd>
          </dl>
          <p className="fineprint">The 2027 Final's venue, duration and marks had not been announced when we last checked. Expect a format like 2026's.</p>
        </section>
      </div>

      <section className="section" aria-labelledby="g-domains">
        <div className="section-head">
          <span className="eyebrow">What is tested</span>
          <h2 id="g-domains">Five domains, roughly equal weight</h2>
          <p>
            These are AI Singapore's official assessment areas, with how the 2026 paper split them. The 300 questions of the 2026 Preliminary Round were divided almost evenly
            across five blocks, so you cannot skip any of them.
          </p>
        </div>
        <div className="domains">
          {DOMAINS.map((d) => (
            <div key={d.domain} className={`domain-card dom-${d.domain}`}>
              <h3>{d.title}</h3>
              {d.items.length > 0 ? (
                <ul>
                  {d.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              ) : (
                <p className="domain-note">
                  A separate fifth block in the 2026 paper and the FAQ; AI Singapore gives no sub-list. By our tags, the 2026 block was mostly CNNs and vision (21 questions),
                  NLP and transformers (12), LLMs (10), and prompting and RAG (4).
                </p>
              )}
              <span className="domain-share tabular">{d.share2026} of 300 questions in 2026</span>
            </div>
          ))}
        </div>
        <p className="fineprint" style={{ marginTop: '0.75rem' }}>
          The 2027 page lists the first four areas, with GenAI inside AI/ML/DL; the 2026 paper and the FAQ count Generative AI as a separate fifth block. Question counts are
          the sizes of the official blocks in the 2026 paper; the topics inside a block do not always match its name.
        </p>
      </section>


      <section className="section" aria-labelledby="g-asked">
        <div className="section-head">
          <span className="eyebrow">Evidence from the 2026 paper</span>
          <h2 id="g-asked">What the Preliminary Round actually asked</h2>
          <p>
            We solved and tagged all {paperStats.total} questions of the 2026 Preliminary Round. Most test whether you know and understand an idea; few need long calculations.
            That is why this course pairs every concept with a picture and plenty of quick questions.
          </p>
        </div>
        <div className="guide-grid">
          <div className="guide-card">
            <h3>Most-tested topics</h3>
            <Bars
              data={(paperStats.subtopics as [string, number][]).slice(0, 12).map(([s, n]) => ({ label: SUBTOPIC_LABEL[s] ?? s, value: n }))}
              format={(v) => String(v)}
              ariaLabel="Number of 2026 prelim questions per topic"
            />
          </div>
          <div className="guide-card">
            <h3>Kinds of question</h3>
            <Bars
              data={(paperStats.styles as [string, number][]).map(([s, n]) => ({ label: STYLE_LABEL[s] ?? s, value: n / paperStats.total }))}
              max={1}
              format={(v) => `${Math.round(v * 100)}%`}
              ariaLabel="Share of question styles"
            />
            <h3 style={{ marginTop: '0.75rem' }}>Difficulty</h3>
            <Bars
              data={(paperStats.difficulty as [string, number][]).map(([s, n]) => ({ label: s[0].toUpperCase() + s.slice(1), value: n / paperStats.total }))}
              max={1}
              format={(v) => `${Math.round(v * 100)}%`}
              ariaLabel="Share of difficulty levels"
            />
            <p className="fineprint">Difficulty and style are our own labels.</p>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="g-timeline">
        <div className="section-head">
          <span className="eyebrow">Key dates</span>
          <h2 id="g-timeline">The 2027 season</h2>
        </div>
        <ol className="timeline">
          {TIMELINE.map((t) => (
            <li key={t.title} className={`${t.key ? 'is-key' : ''}${new Date(t.iso) < today ? ' is-past' : ''}`}>
              <span className="timeline-date">{t.date}</span>
              <span className="timeline-dot" aria-hidden="true" />
              <span className="timeline-body">
                <strong>{t.title}</strong>
                <span>{t.detail}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="section" aria-labelledby="g-funnel">
        <div className="section-head">
          <span className="eyebrow">The path to IOAI</span>
          <h2 id="g-funnel">How students are selected</h2>
          <p>
            NOAI is run by AI Singapore. NTU runs the IOAI selection and training that follows. Only Singapore Citizens and Permanent Residents can represent Singapore, and IOAI
            requires contestants to be 20 or younger on 1 July 2027.
          </p>
        </div>
        <div className="funnel">
          {FUNNEL.map((f, i) => (
            <div key={f.n} className="funnel-row" style={{ ['--w' as string]: `${100 - i * 11}%`, ['--mix' as string]: `${12 + i * 14}%` }}>
              <strong>{f.n}</strong>
              <span>{f.label}</span>
            </div>
          ))}
        </div>
        <p className="fineprint" style={{ marginTop: '0.75rem' }}>
          Singapore sent 8 contestants (two teams of 4) in past years. From 2027 IOAI allows one national team per country, normally up to 4 contestants; any extra places for
          the host have not been announced. The NTU stage re-ranks students: at IOAI 2025, a NOAI Bronze winner placed 2nd in the world.
        </p>
      </section>

      <section className="section" aria-labelledby="g-entry">
        <div className="section-head">
          <span className="eyebrow">Taking part</span>
          <h2 id="g-entry">Who can enter, and how</h2>
        </div>
        <div className="guide-grid">
          <div className="guide-card">
            <h3>Eligibility</h3>
            <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
              <li>Full-time students below 20 in MOE Secondary, IP, JC, ITE or Polytechnic, of any nationality.</li>
              <li>Home-schooled Singapore Citizens and PRs.</li>
              <li>New for 2027: students between schools (e.g. after Sec 4) and, case by case, private or international school students.</li>
              <li>Individual event. Free for accepted students. No prior AI experience is required for the Preliminary Round.</li>
            </ul>
          </div>
          <div className="guide-card">
            <h3>Registration is through your school</h3>
            <p>
              MOE schools register interest until <strong>15 January 2027</strong>. Ask your school's NOAI teacher representative; individual requests from MOE students are not
              accepted.
            </p>
            <p>
              Not in an MOE school? Email AI Singapore by <strong>27 November 2026</strong> with your name and situation: <CopyEmail />
            </p>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="g-strategy">
        <div className="section-head">
          <span className="eyebrow">Strategy</span>
          <h2 id="g-strategy">How to approach each round</h2>
        </div>
        <div className="guide-grid">
          <div className="guide-card">
            <h3>Preliminary Round: speed and breadth</h3>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'grid', gap: '0.4rem' }}>
              <li>
                You have about <strong>36 seconds per question</strong>. Most questions test recall of a definition or a quick calculation, so knowledge has to be automatic.
              </li>
              <li>
                <strong>Answer every question.</strong> Wrong answers cost nothing, so a guess is always better than a blank.
              </li>
              <li>No calculator: practise mental arithmetic for dot products, matrix shapes, derivatives, simple probabilities and convolution output sizes.</li>
              <li>Learn to trace short Python, NumPy and PyTorch snippets in your head (shapes, slicing, list aliasing, broadcasting).</li>
              <li>Ties may be broken by domain performance and time taken, so steady pacing matters.</li>
              <li>
                Last resort only, after eliminating what you can: in the 2026 paper, the option longer than all the others was the answer in {longest.right} of {longest.of}{' '}
                questions ({pct(longest)}%), but only {longest.byDomain.mathematics.right} of {longest.byDomain.mathematics.of} in Mathematics and{' '}
                {longest.lastThirty.right} of {longest.lastThirty.of} in the long scenarios at the end. Options starting with <em>always</em>, <em>never</em>, <em>only</em>,{' '}
                <em>cannot</em>, <em>all</em> or <em>none</em> were right {absolute.right === 1 ? 'once' : `${absolute.right} times`} in {absolute.of}. This is a habit of past
                question writers, not a rule, and the 2027 setters may have changed it.
              </li>
            </ul>
            <Link to="/mock" className="btn btn-primary" style={{ justifySelf: 'start' }}>
              Take a timed mock exam
            </Link>
          </div>
          <div className="guide-card">
            <h3>Final: understand it, then build it</h3>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'grid', gap: '0.4rem' }}>
              <li>The 20 MCQs go deeper than the prelim: classical ML, neural networks, computer vision, NLP and problem solving.</li>
              <li>
                The programming tasks ask you to <strong>implement algorithms from scratch</strong> in NumPy or PyTorch inside Jupyter: gradient descent, k-means, gradient
                boosting, mean IoU, attention, and a small retrieval pipeline in past years.
              </li>
              <li>There is no internet and no AI autocomplete. Practise writing these by hand until you can do them without looking anything up.</li>
              <li>Read the scaffold code first: function signatures, shapes and the checks the markers will run.</li>
            </ul>
            <Link to="/papers" className="btn" style={{ justifySelf: 'start' }}>
              See past papers with solutions
            </Link>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="g-history">
        <div className="section-head">
          <span className="eyebrow">History</span>
          <h2 id="g-history">How the format has changed</h2>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Year</th>
                <th>Preliminary Round</th>
                <th>Final</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {FORMAT_HISTORY.map((r) => (
                <tr key={r.year}>
                  <td>
                    <strong>{r.year}</strong>
                  </td>
                  <td>{r.prelim}</td>
                  <td>{r.final}</td>
                  <td>{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Singapore at IOAI</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {IOAI_RESULTS.map((r) => (
                <tr key={r.year}>
                  <td>{r.year}</td>
                  <td>{r.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section" aria-labelledby="g-links">
        <div className="section-head">
          <span className="eyebrow">Official sources</span>
          <h2 id="g-links">Always check the official pages</h2>
          <p>Details can change. These are AI Singapore's and IOAI's own pages.</p>
        </div>
        <ul style={{ display: 'grid', gap: '0.4rem', paddingLeft: '1.2rem' }}>
          <li>
            <a href={LINKS.noai2027} target="_blank" rel="noreferrer">
              NOAI 2027 page
            </a>{' '}
            and{' '}
            <a href={LINKS.faqs} target="_blank" rel="noreferrer">
              FAQs
            </a>
          </li>
          <li>
            <a href={LINKS.resources} target="_blank" rel="noreferrer">
              Official learning resources
            </a>{' '}
            and the{' '}
            <a href={LINKS.selfAssessment} target="_blank" rel="noreferrer">
              2026 prelim self-assessment tool
            </a>
          </li>
          <li>
            <a href={LINKS.ioaiSyllabus} target="_blank" rel="noreferrer">
              IOAI 2026 syllabus (PDF)
            </a>{' '}
            — NOAI tells students to review the IOAI syllabus
          </li>
          <li>
            Past Final programming tasks:{' '}
            <a href={LINKS.final2026Repo} target="_blank" rel="noreferrer">
              NOAI 2026
            </a>
            ,{' '}
            <a href={LINKS.noai2025Repo} target="_blank" rel="noreferrer">
              NOAI 2025
            </a>
          </li>
          <li>
            <a href={LINKS.ioai2027} target="_blank" rel="noreferrer">
              IOAI 2027 in Singapore
            </a>
          </li>
        </ul>
      </section>
    </div>
  )
}
