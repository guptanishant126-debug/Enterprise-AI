import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { AppLayout } from './components/layout/AppLayout.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { RegisterPage } from './pages/RegisterPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { InitiativesPage } from './pages/InitiativesPage.tsx';
import { NewInitiativePage } from './pages/NewInitiativePage.tsx';
import { InitiativeDetailPage } from './pages/InitiativeDetailPage.tsx';
import { WorkflowBoardPage } from './pages/WorkflowBoardPage.tsx';
import { IntelligencePage } from './pages/IntelligencePage.tsx';
import { AuditLogPage } from './pages/AuditLogPage.tsx';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Application Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/initiatives" element={<InitiativesPage />} />
            <Route path="/initiatives/new" element={<NewInitiativePage />} />
            <Route path="/initiatives/:id" element={<InitiativeDetailPage />} />
            <Route path="/workflows" element={<WorkflowBoardPage />} />
            <Route path="/intelligence" element={<IntelligencePage />} />
            <Route path="/audit-log" element={<AuditLogPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
