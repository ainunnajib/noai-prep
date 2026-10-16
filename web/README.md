# NOAI Prep website

A free, beginner-friendly course for Singapore's National Olympiad in Artificial Intelligence (NOAI). It takes a student who knows school algebra, and may never have coded, step by step to being ready for the NOAI 2027 Preliminary Round and Final.

## What is in it

- **The course**: 10 parts, 39 modules and 184 lessons, in order from "what is AI?" to the Final programming tasks. Every lesson explains each idea from zero, with an everyday analogy, an interactive visual explainer for each key concept, worked examples, runnable Python where it helps, "common mistake" and "in the exam" notes, and a checkpoint quiz.
- **Exam guide** (`#/exam`): the 2027 format, dates and selection path, what the 2026 papers actually asked, and a timing strategy for 150 questions in 90 minutes.
- **Practice** (`#/practice`): about 2,900 questions (the course checkpoints, a 1,660-question verified bank and every past-paper question), filterable by domain and subtopic.
- **Mock exams** (`#/mock`): timed papers in the Prelim format (150 questions in 90 minutes) plus shorter sprints, with a domain breakdown at the end.
- **Past papers** (`#/papers`): the 2026 Preliminary Round (300 questions), the 2026 Final MCQs and the 2025 paper, each question solved and explained.
- **Study plan** (`#/plan`): a week-by-week plan to the Prelim, packed to the hours per week you choose.

Progress is saved in your browser. Optionally, the site can also have **accounts**: sign-in with Google or Apple, progress synced to the account across devices, and a one-time S$10 unlock (the first two modules stay free; invited email addresses get full access free). Accounts switch on only when the Firebase web config is set at build time (see `.env.example`); without it the site is fully open and works with no account and no server, exactly as before. The backend (Firebase rules and Cloud Functions, Stripe) and the owner's setup guide are in [`../backend/`](../backend/README.md).

## Running it

```bash
cd web
npm ci
npm run dev          # http://localhost:5173
npm run build        # static site in web/dist
```

The site is a static single-page app (hash routing, relative asset paths), so `web/dist` can be hosted anywhere. On pushes to `main`, `.github/workflows/web.yml` builds it and deploys it to GitHub Pages.

## Checks

```bash
npm run typecheck        # TypeScript
npm run check:content    # every lesson renders; quiz, past-paper and bank data are valid
npm run test:e2e         # Playwright: every page at desktop and phone widths (accounts off)
npx vitest run tests/accounts                        # accounts: the progress CRDT, tabs, sync, simulated devices, access
npx playwright test -c playwright.accounts.config.ts # accounts end to end, against a pretend backend
```

The accounts end-to-end tests build the site with `VITE_ACCOUNTS_MOCK=1` (an offline, pretend account backend that keeps everything in `localStorage`) into `dist-accounts/` and serve it on port 4174. To click around that version yourself: `VITE_ACCOUNTS_MOCK=1 npm run dev`.

## Where things live

| Path | What |
|---|---|
| `src/curriculum/modules/<module>/` | One folder per module: `index.ts` (lesson list), `<lesson>.mdx`, `quiz/<lesson>.ts`, `visuals/<lesson>/*.tsx`, and `.spec.json` (the module's design). |
| `src/curriculum/parts.ts`, `registry.ts` | Course parts and the module registry (modules are discovered automatically). |
| `src/components/` | The shared kit: content blocks (callouts, maths, code, steps, tabs), interactive pieces (plots with draggable points, sliders, matrix grids, bar charts, network diagrams, an in-browser Python runner) and quiz components. |
| `src/data/` | Exam facts, past papers and the practice bank. |
| `src/pages/` | Home, roadmap, lesson, exam guide, practice, mock exam, past papers, study plan, account. |
| `src/lib/progress.ts`, `progress-crdt.ts` | The viewer's progress, kept so that copies (tabs, devices, the account) always combine without losing anything. |
| `src/lib/accounts/`, `src/components/account/` | Accounts (only when switched on): the account store, progress sync and the Firebase and pretend backends; the sign-in dialog, the lock on paid pages and the header's account button. |
| `AUTHORING.md` | How to write or edit a lesson: style, visuals, quizzes and accuracy rules. |
| `../docs/` | Research notes (official facts with sources, the IOAI syllabus, past-paper analyses) and the curriculum design. |

Exam dates and formats were checked against AI Singapore's published information on 14 October 2026. Check the official NOAI page before relying on them.
