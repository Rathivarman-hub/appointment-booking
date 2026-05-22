import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import BookingFlow from './pages/BookingFlow';
import MyBookings from './pages/MyBookings';
import ManageAppointments from './pages/ManageAppointments';
import OrganiserBookings from './pages/OrganiserBookings';
import AdminUsers from './pages/AdminUsers';

const App = () => {
  return (
    <AuthProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />
          <Route path="/verify-otp"      element={<VerifyOTP />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/"                element={<Navigate to="/dashboard" replace />} />

          {/* Protected: All authenticated users */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard"   element={<Dashboard />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/book/:apptId" element={<BookingFlow />} />
            <Route path="/my-bookings"  element={<MyBookings />} />
          </Route>

          {/* Protected: Organisers & Admins */}
          <Route element={<PrivateRoute allowedRoles={['organiser', 'admin']} />}>
            <Route path="/manage-appointments" element={<ManageAppointments />} />
            <Route path="/organiser/bookings"  element={<OrganiserBookings />} />
          </Route>

          {/* Protected: Admin only */}
          <Route element={<PrivateRoute allowedRoles={['admin']} />}>
            <Route path="/admin/users"    element={<AdminUsers />} />
            <Route path="/admin/bookings" element={<OrganiserBookings />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="colored"
        />
      </Router>
    </AuthProvider>
  );
};

export default App;
