# NOAI Prep website

A free, beginner-friendly course for Singapore's National Olympiad in Artificial Intelligence (NOAI). It takes a student who knows school algebra, and may never have coded, step by step to being ready for the NOAI 2027 Preliminary Round and Final.

## What is in it

- **The course**: 10 parts, 39 modules and 178 lessons, in order from "what is AI?" to the Final programming tasks. Every lesson explains each idea from zero, with an everyday analogy, an interactive visual explainer for each key concept, worked examples, runnable Python where it helps, "common mistake" and "in the exam" notes, and a checkpoint quiz.
- **Exam guide** (`#/exam`): the 2027 format, dates and selection path, what the 2026 papers actually asked, and a timing strategy for 150 questions in 90 minutes.
- **Practice** (`#/practice`): about 2,900 questions (the course checkpoints, a 1,660-question verified bank and every past-paper question), filterable by domain and subtopic.
- **Mock exams** (`#/mock`): timed papers in the Prelim format (150 questions in 90 minutes) plus shorter sprints, with a domain breakdown at the end.
- **Past papers** (`#/papers`): the 2026 Preliminary Round (300 questions), the 2026 Final MCQs and the 2025 paper, each question solved and explained.
- **Study plan** (`#/plan`): a week-by-week plan to the Prelim, packed to the hours per week you choose.

Progress is saved in your browser only (no account and no server).

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
npm run test:e2e         # Playwright: every page at desktop and phone widths
```

## Where things live

| Path | What |
|---|---|
| `src/curriculum/modules/<module>/` | One folder per module: `index.ts` (lesson list), `<lesson>.mdx`, `quiz/<lesson>.ts`, `visuals/<lesson>/*.tsx`, and `.spec.json` (the module's design). |
| `src/curriculum/parts.ts`, `registry.ts` | Course parts and the module registry (modules are discovered automatically). |
| `src/components/` | The shared kit: content blocks (callouts, maths, code, steps, tabs), interactive pieces (plots with draggable points, sliders, matrix grids, bar charts, network diagrams, an in-browser Python runner) and quiz components. |
| `src/data/` | Exam facts, past papers and the practice bank. |
| `src/pages/` | Home, roadmap, lesson, exam guide, practice, mock exam, past papers, study plan. |
| `AUTHORING.md` | How to write or edit a lesson: style, visuals, quizzes and accuracy rules. |
| `../docs/` | Research notes (official facts with sources, the IOAI syllabus, past-paper analyses) and the curriculum design. |

Exam dates and formats were checked against AI Singapore's published information on 14 October 2026. Check the official NOAI page before relying on them.
