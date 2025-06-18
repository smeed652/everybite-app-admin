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
import Forbidden from './pages/Forbidden';
import NotFound from './pages/NotFound';
import Layout from './components/Layout';
import { ThemeToggle } from './components/ui/ThemeToggle';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [apiStatus, setApiStatus] = useState<'ok' | 'offline'>('offline');

  useEffect(() => {
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
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-xl font-bold">EveryBite Admin Panel</h1>
          <ThemeToggle />
        </header>
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
