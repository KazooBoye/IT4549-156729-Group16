import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Common/Navbar';
import Footer from './components/Common/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import PrivateRoute from './utils/PrivateRoute'; // Import PrivateRoute
import { AuthProvider } from './contexts/AuthContext';

// Member Pages
import MemberProfilePage from './pages/Member/MemberProfilePage';
import MemberPaymentPage from './pages/Member/MemberPaymentPage';
import MemberTrainingHistoryPage from './pages/Member/MemberTrainingHistoryPage';
import ServiceUserRatingPage from './pages/Member/ServiceUserRatingPage';
import MemberBookingPage from './pages/Member/MemberBookingPage';
// Package Page (can be public or private depending on requirements)
import ViewPackagesPage from './pages/Packages/ViewPackagesPage';

// New pages
import OwnerEquipmentStatusPage from './pages/Owner/OwnerEquipmentStatusPage';
import StaffRegisterMemberPage from './pages/Staff/StaffRegisterMemberPage';
import StaffRenewPackagePage from './pages/Staff/StaffRenewPackagePage';
import StaffFeedbackManagementPage from './pages/Staff/StaffFeedbackManagementPage';
import StaffMemberServiceHistoryPage from './pages/Staff/StaffMemberServiceHistoryPage';
import TrainerMemberListPage from './pages/Trainer/TrainerMemberListPage';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="container">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
              
              {/* Publicly accessible package viewing page */}
              <Route path="/packages/view" element={<ViewPackagesPage />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
              
              {/* Member Specific Routes */}
              <Route path="/member/profile" element={
                <PrivateRoute allowedRoles={['member', 'owner']}> {/* Owner might also access/edit member profiles */}
                  <MemberProfilePage />
                </PrivateRoute>
              } />
              <Route path="/member/payment" element={
                <PrivateRoute allowedRoles={['member']}>
                  <MemberPaymentPage />
                </PrivateRoute>
              } />
              <Route path="/member/history" element={
                <PrivateRoute allowedRoles={['member']}>
                  <MemberTrainingHistoryPage />
                </PrivateRoute>
              } />
              <Route path="/member/feedback" element={
                <PrivateRoute allowedRoles={['member']}>
                  <ServiceUserRatingPage />
                </PrivateRoute>
              } />
              <Route path="/member/booking" element={
                <PrivateRoute allowedRoles={['member']}>
                  <MemberBookingPage />
                </PrivateRoute>
              } />
              {/* Add other member routes here: /member/booking */}


              {/* Staff Specific Routes - Example placeholder */}
              {/* <Route path="/staff/equipment" element={
                <PrivateRoute allowedRoles={['staff', 'owner']}>
                  <StaffEquipmentPage />
                </PrivateRoute>
              } /> */}

              {/* Trainer Specific Routes */}
              <Route path="/trainer/my-members" element={
                <PrivateRoute allowedRoles={['trainer', 'owner']}>
                  <TrainerMemberListPage />
                </PrivateRoute>
              } />

              {/* Admin/Owner Specific Routes - Example placeholder */}
              <Route path="/admin/manage-equipment" element={
                <PrivateRoute allowedRoles={['owner']}>
                  <OwnerEquipmentStatusPage />
                </PrivateRoute>
              } />

              <Route path="/staff/register-member" element={
                <PrivateRoute allowedRoles={['staff']}>
                  <StaffRegisterMemberPage />
                </PrivateRoute>
              } />

              <Route path="/staff/renew-package" element={
                <PrivateRoute allowedRoles={['staff']}>
                  <StaffRenewPackagePage />
                </PrivateRoute>
              } />

              <Route path="/staff/feedback-management" element={
                <PrivateRoute allowedRoles={['staff']}>
                  <StaffFeedbackManagementPage />
                </PrivateRoute>
              } />

              <Route path="/staff/member-service-history" element={
                <PrivateRoute allowedRoles={['staff']}>
                  <StaffMemberServiceHistoryPage />
                </PrivateRoute>
              } />

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
