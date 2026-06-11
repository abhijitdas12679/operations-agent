import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";

import Dashboard from "./pages/Dashboard";
import GenerateEmail from "./pages/GenerateEmail";
import EmailGenerator from "./pages/EmailGenerator";
import BulkEmailSender from "./pages/BulkEmailSender";
import EmailSettings from "./pages/EmailSettings";
import DailyReport from "./pages/DailyReport";
import SendReport from "./pages/SendReport";
import MeetingMOM from "./pages/MeetingMOM";
import SendMOM from "./pages/SendMOM";
import TaskTracker from "./pages/TaskTracker";
import PublicTaskUpdate from "./pages/PublicTaskUpdate";

function PrivateRoute({ children }) {
  return localStorage.getItem("token") ? children : <Navigate to="/login" replace />;
}

function ProtectedPage({ children }) {
  return (
    <PrivateRoute>
      <Layout>{children}</Layout>
    </PrivateRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Public task update link for assigned person */}
        <Route path="/task-update/:token" element={<PublicTaskUpdate />} />

        {/* Protected Admin Routes */}
        <Route path="/" element={<ProtectedPage><Dashboard /></ProtectedPage>} />
        <Route path="/generate-email" element={<ProtectedPage><GenerateEmail /></ProtectedPage>} />
        <Route path="/email" element={<ProtectedPage><EmailGenerator /></ProtectedPage>} />
        <Route path="/bulk-email" element={<ProtectedPage><BulkEmailSender /></ProtectedPage>} />
        <Route path="/email-settings" element={<ProtectedPage><EmailSettings /></ProtectedPage>} />
        <Route path="/report" element={<ProtectedPage><DailyReport /></ProtectedPage>} />
        <Route path="/send-report" element={<ProtectedPage><SendReport /></ProtectedPage>} />
        <Route path="/meeting" element={<ProtectedPage><MeetingMOM /></ProtectedPage>} />
        <Route path="/send-mom" element={<ProtectedPage><SendMOM /></ProtectedPage>} />
        <Route path="/tasks" element={<ProtectedPage><TaskTracker /></ProtectedPage>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}