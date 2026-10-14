import { lazy, Suspense } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
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

const Loading = () => <div className="page loading-block">Loading…</div>

export default function App() {
  return (
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Suspense fallback={<Loading />}>
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
            <Route path="papers/:paperId" element={<PaperView />} />
            <Route path="about" element={<About />} />
            <Route path="plan" element={<StudyPlan />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  )
}
