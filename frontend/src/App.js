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
import MemberWorkoutHistoryPage from './pages/Member/MemberWorkoutHistoryPage';
import ServiceUserRatingPage from './pages/Member/ServiceUserRatingPage';
import MemberBookingPage from './pages/Member/MemberBookingPage';
// Package Page (can be public or private depending on requirements)
import ViewPackagesPage from './pages/Member/ViewPackagesPage';

// New pages
import OwnerEquipmentStatusPage from './pages/Owner/OwnerEquipmentStatusPage';
import StaffRegisterMemberPage from './pages/Staff/StaffRegisterMemberPage';
import StaffRenewPackagePage from './pages/Staff/StaffRenewPackagePage';
import StaffFeedbackManagementPage from './pages/Staff/StaffFeedbackManagementPage';
import StaffMemberServiceHistoryPage from './pages/Staff/RecordServiceUsagePage';
import TrainerMemberListPage from './pages/Trainer/TrainerMemberListPage';
import TrainerMemberProgressPage from './pages/Trainer/TrainerMemberProgressPage'; // Import the new page
import EquipmentStatusPage from './pages/Staff/EquipmentStatusPage';
import EvaluateWorkoutPage from './pages/Trainer/EvaluateWorkoutPage'; // Import the new page for evaluating workouts
import UserManagementPage from './pages/Owner/UserManagementPage';

import './App.css';
import TrackWorkoutPage from './pages/Trainer/TrackWorkoutPage';
import SystemSettingsPage from './pages/Owner/SystemSettingsPage';  

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
                  <MemberWorkoutHistoryPage />
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
              <Route path="/trainer/member-progress" element={
                <PrivateRoute allowedRoles={['trainer', 'owner']}>
                  <TrackWorkoutPage/>
                </PrivateRoute>
              } />

              <Route 
                path="/trainer/evaluate-member" 
                element={
                <PrivateRoute roles={['trainer', 'owner']}>
                  <EvaluateWorkoutPage />
                  </PrivateRoute>
              } 
        />

              {/* Admin/Owner Specific Routes - Example placeholder */}
              <Route path="/admin/manage-equipment" element={
                <PrivateRoute allowedRoles={['owner']}>
                  <OwnerEquipmentStatusPage />
                </PrivateRoute>
              } />
              <Route path="/admin/manage-system" element={
                <PrivateRoute allowedRoles={['owner']}>
                  <SystemSettingsPage />
                </PrivateRoute>
              } />

              <Route path="/admin/manage-users" element={
                <PrivateRoute allowedRoles={['owner']}>
                  <UserManagementPage />
                </PrivateRoute>
              } />

              <Route path="/staff/register-member" element={
                <PrivateRoute allowedRoles={['staff', 'trainer']}>
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
              
              <Route path="/staff/equipment" element={
                <PrivateRoute allowedRoles={['staff', 'owner']}>
                  <EquipmentStatusPage />
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
