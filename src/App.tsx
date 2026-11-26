import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CompareTray } from './components/CompareTray';
import { AuthModal } from './components/AuthModal';
import { BookingWizardModal } from './components/BookingWizardModal';
import { ReportModal } from './components/ReportModal';
import {
  CookieBanner,
  OfflineIndicator,
  SkeletonGrid,
  ToastContainer,
} from './components/GlobalChrome';

const LandingPage = lazy(() => import('./pages/LandingPage').then((m) => ({ default: m.LandingPage })));
const SearchPage = lazy(() => import('./pages/SearchPage').then((m) => ({ default: m.SearchPage })));
const ComparePage = lazy(() => import('./pages/ComparePage').then((m) => ({ default: m.ComparePage })));
const CenterProfilePage = lazy(() =>
  import('./pages/CenterProfilePage').then((m) => ({ default: m.CenterProfilePage }))
);
const TutorProfilePage = lazy(() =>
  import('./pages/TutorProfilePage').then((m) => ({ default: m.TutorProfilePage }))
);
const MatchmakerPage = lazy(() =>
  import('./pages/MatchmakerPage').then((m) => ({ default: m.MatchmakerPage }))
);
const StudentDashboardPage = lazy(() =>
  import('./pages/StudentDashboardPage').then((m) => ({ default: m.StudentDashboardPage }))
);
const CenterDashboardPage = lazy(() =>
  import('./pages/CenterDashboardPage').then((m) => ({ default: m.CenterDashboardPage }))
);
const AdminDashboardPage = lazy(() =>
  import('./pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
);
const ForCentersPage = lazy(() =>
  import('./pages/InfoPages').then((m) => ({ default: m.ForCentersPage }))
);
const VerificationPage = lazy(() =>
  import('./pages/InfoPages').then((m) => ({ default: m.VerificationPage }))
);
const GuidesPage = lazy(() => import('./pages/InfoPages').then((m) => ({ default: m.GuidesPage })));
const StaticInfoPage = lazy(() =>
  import('./pages/InfoPages').then((m) => ({ default: m.StaticInfoPage }))
);
const NotFoundPage = lazy(() =>
  import('./pages/InfoPages').then((m) => ({ default: m.NotFoundPage }))
);

const PageFallback: React.FC = () => (
  <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <SkeletonGrid count={6} />
  </div>
);

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <Header />
        <main className="flex-1">
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/center/:slug" element={<CenterProfilePage />} />
              <Route path="/tutor/:slug" element={<TutorProfilePage />} />
              <Route path="/matchmaker" element={<MatchmakerPage />} />
              <Route path="/dashboard/student" element={<StudentDashboardPage />} />
              <Route path="/dashboard/center" element={<CenterDashboardPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/for-centers" element={<ForCentersPage />} />
              <Route path="/verification" element={<VerificationPage />} />
              <Route path="/guides" element={<GuidesPage />} />
              <Route path="/about" element={<StaticInfoPage page="about" />} />
              <Route path="/contact" element={<StaticInfoPage page="contact" />} />
              <Route path="/privacy" element={<StaticInfoPage page="privacy" />} />
              <Route path="/terms" element={<StaticInfoPage page="terms" />} />
              {/* SEO Subject + City (+ District) landing routes */}
              <Route path="/:subject/:city/:district" element={<SearchPage />} />
              <Route path="/:subject/:city" element={<SearchPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </main>
        <CookieBanner />
        <Footer />
        <CompareTray />
        <AuthModal />
        <BookingWizardModal />
        <ReportModal />
        <ToastContainer />
        <OfflineIndicator />
      </div>
    </BrowserRouter>
  );
};

export default App;
