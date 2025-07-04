import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import SmartMenus from './pages/SmartMenus';
import SmartMenuDetail from './pages/SmartMenuDetail';
import { lazy, Suspense } from 'react';

const SmartMenuFeatures = lazy(() => import('./pages/SmartMenuFeatures'));
const SmartMenuMarketing = lazy(() => import('./pages/SmartMenuMarketing'));
import Forbidden from './pages/Forbidden';
import NotFound from './pages/NotFound';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [apiStatus, setApiStatus] = useState<'ok' | 'offline'>('offline');

  useEffect(() => {
    // Skip health-check in local dev unless explicitly enabled
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // Opt-in: ping only when explicitly enabled via env
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const shouldPing = Boolean(import.meta.env.VITE_ENABLE_HEALTHCHECK);
    if (!shouldPing) return;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore import.meta env types missing
    fetch(`${import.meta.env.VITE_API_URL?.replace('/graphql', '') || 'http://localhost:4000'}/health`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then(() => setApiStatus('ok'))
      .catch(() => setApiStatus('offline'));
  }, []);
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100 flex flex-col">

        <main className="flex-1">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/403" element={<Forbidden />} />

            {/* Protected area */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route
              path="users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route path="smart-menus" element={<SmartMenus />} />
            <Route path="smart-menus/:widgetId" element={<SmartMenuDetail />} />
            <Route path="smart-menus/:widgetId/features" element={<Suspense fallback={<div>Loading...</div>}><SmartMenuFeatures /></Suspense>} />
<Route path="smart-menus/:widgetId/marketing" element={<Suspense fallback={<div>Loading...</div>}><SmartMenuMarketing /></Suspense>} />
            {/* Nested 404 fallback for any unmatched protected route */}
            <Route path="*" element={<NotFound />} />
            </Route>
            {/* 404 fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        {/* Toast portal */}
        <Toaster position="bottom-right" />
      </div>
    </ErrorBoundary>
  );
}
