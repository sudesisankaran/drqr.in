import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicOnlyRoute } from './routes/ProtectedRoute';

// Layout & Common
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import RegisterTypePage from './pages/RegisterTypePage';
import HospitalRegisterPage from './pages/HospitalRegisterPage';
import PatientRegisterPage from './pages/PatientRegisterPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import PasswordResetPage from './pages/PasswordResetPage';
import EmailVerifyPage from './pages/EmailVerifyPage';

// Dashboards
import HospitalDashboardPage from './pages/HospitalDashboardPage';
import PatientDashboardPage from './pages/PatientDashboardPage';

// Patient Dedicated Workflow Pages
import AddHospitalPage from './pages/AddHospitalPage';
import ViewHospitalPage from './pages/ViewHospitalPage';
import EditHospitalPage from './pages/EditHospitalPage';
import UploadRecordPage from './pages/UploadRecordPage';
import PatientRecordsPage from './pages/PatientRecordsPage';
import PatientProfilePage from './pages/PatientProfilePage';

// Hospital & Verification Details
import ViewRecordPage from './pages/ViewRecordPage';
import EditRecordPage from './pages/EditRecordPage';
import QRPreviewPage from './pages/QRPreviewPage';
import PDFPreviewPage from './pages/PDFPreviewPage';
import SettingsPage from './pages/SettingsPage';
import PublicVerifyPage from './pages/PublicVerifyPage';
import QRVerifyPatientPage from './pages/QRVerifyPatientPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
          <Navbar />
          <main className="flex-1 flex flex-col">
            <Routes>
              {/* Public & Informational Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/register" element={<RegisterTypePage />} />
              <Route
                path="/register/hospital"
                element={
                  <PublicOnlyRoute>
                    <HospitalRegisterPage />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/register/patient"
                element={
                  <PublicOnlyRoute>
                    <PatientRegisterPage />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/patient/register"
                element={
                  <PublicOnlyRoute>
                    <PatientRegisterPage />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/login"
                element={
                  <PublicOnlyRoute>
                    <LoginPage />
                  </PublicOnlyRoute>
                }
              />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<PasswordResetPage />} />
              <Route path="/verify-email" element={<EmailVerifyPage />} />

              {/* Public QR Code Scanner Target */}
              <Route path="/verify/:id" element={<PublicVerifyPage />} />
              <Route path="/patient/qr/:publicUuid" element={<QRVerifyPatientPage />} />

              {/* Patient Core Routes */}
              <Route
                path="/patient/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <PatientDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/hospitals/add"
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <AddHospitalPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/hospitals/:id"
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <ViewHospitalPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/hospitals/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <EditHospitalPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/records/upload"
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <UploadRecordPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/records"
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <PatientRecordsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/records/:id"
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <PatientRecordsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/profile"
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <PatientProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Hospital Role Routes */}
              <Route
                path="/hospital/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['hospital']}>
                    <HospitalDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Backwards Compatible / Universal Record Routes */}
              <Route
                path="/records/add"
                element={<Navigate to="/patient/hospitals/add" replace />}
              />
              <Route
                path="/records/:id"
                element={
                  <ProtectedRoute>
                    <ViewRecordPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/records/:id/edit"
                element={
                  <ProtectedRoute>
                    <EditRecordPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/records/:id/qr"
                element={
                  <ProtectedRoute>
                    <QRPreviewPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/records/:id/pdf"
                element={
                  <ProtectedRoute>
                    <PDFPreviewPage />
                  </ProtectedRoute>
                }
              />

              {/* Account Settings */}
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Error and Fallback Routes */}
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
