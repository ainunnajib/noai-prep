import { lazy } from 'react'
import { HashRouter, Route, Routes, useParams } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import Home from './pages/Home'
import Roadmap from './pages/Roadmap'
import ModulePage from './pages/ModulePage'
import LessonPage from './pages/LessonPage'
import NotFound from './pages/NotFound'

const ExamGuide = lazy(() => import('./pages/ExamGuide'))
const Practice = lazy(() => import('./pages/Practice'))
const MockExam = lazy(() => import('./pages/MockExam'))
const PastPapers = lazy(() => import('./pages/PastPapers'))
const PaperView = lazy(() => import('./pages/PaperView'))
const About = lazy(() => import('./pages/About'))
const StudyPlan = lazy(() => import('./pages/StudyPlan'))
const Account = lazy(() => import('./pages/Account'))

/** Remount the paper view for each paper so answers and filters do not carry over from one paper to the next. */
function PaperRoute() {
  const { paperId } = useParams()
  return <PaperView key={paperId} />
}

export default function App() {
  // No startTransition: while a page's code loads, the layout shows a skeleton instead of keeping the old page on screen.
  return (
    <HashRouter future={{ v7_startTransition: false, v7_relativeSplatPath: true }}>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Home />} />
          <Route path="learn" element={<Roadmap />} />
          <Route path="learn/:moduleSlug" element={<ModulePage />} />
          <Route path="learn/:moduleSlug/:lessonSlug" element={<LessonPage />} />
          <Route path="exam" element={<ExamGuide />} />
          <Route path="practice" element={<Practice />} />
          <Route path="mock" element={<MockExam />} />
          <Route path="papers" element={<PastPapers />} />
          <Route path="papers/:paperId" element={<PaperRoute />} />
          <Route path="about" element={<About />} />
          <Route path="plan" element={<StudyPlan />} />
          <Route path="account" element={<Account />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
