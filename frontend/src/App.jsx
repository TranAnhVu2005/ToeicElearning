import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';


// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Load page code only when a route is visited so the first screen stays small.
const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PracticePage = lazy(() => import('./pages/PracticePage'));
const CoursesPage = lazy(() => import('./pages/CoursesPage'));
const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage'));
const ExamTakePage = lazy(() => import('./pages/ExamTakePage'));
const DictationTakePage = lazy(() => import('./pages/DictationTakePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const UserManagementPage = lazy(() => import('./pages/admin/UserManagementPage'));
const TestManagementPage = lazy(() => import('./pages/admin/TestManagementPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const TestResultPage = lazy(() => import('./pages/TestResultPage'));
const ClassroomsPage = lazy(() => import('./pages/ClassroomsPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const PaymentManagementPage = lazy(() => import('./pages/admin/PaymentManagementPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const TeacherApplicationPage = lazy(() => import('./pages/TeacherApplicationPage'));
const PaymentResultPage = lazy(() => import('./pages/PaymentResultPage'));
const TeacherApplicationsPage = lazy(() => import('./pages/admin/TeacherApplicationsPage'));

const CourseDetailRoute = () => {
  const { testId } = useParams();
  return <CourseDetailPage key={testId} />;
};

import ErrorBoundary from './components/common/ErrorBoundary';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <ErrorBoundary>
              <Suspense fallback={<div className="neo-route-loading" role="status" aria-live="polite">Đang mở trang…</div>}>
                <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/practice" element={<PracticePage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/:testId" element={<CourseDetailRoute />} />
              <Route path="/courses/:testId/take" element={<ProtectedRoute><ExamTakePage /></ProtectedRoute>} />
              <Route path="/results/:resultId" element={<ProtectedRoute><TestResultPage /></ProtectedRoute>} />
              <Route path="/classrooms" element={<ProtectedRoute><ClassroomsPage /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
              <Route path="/teacher/application" element={<ProtectedRoute><TeacherApplicationPage /></ProtectedRoute>} />
              <Route path="/payment/result" element={<ProtectedRoute><PaymentResultPage /></ProtectedRoute>} />
              <Route path="/courses/:testId/dictation" element={<DictationTakePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected User Routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Admin & Teacher Management Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/teacher-applications"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <TeacherApplicationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <UserManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/payments"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <PaymentManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/tests"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <TestManagementPage />
                  </ProtectedRoute>
                }
              />


              {/* 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
          </ErrorBoundary>
        </main>
        <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
