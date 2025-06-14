import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  const [apiStatus, setApiStatus] = useState<'ok' | 'offline'>('offline');

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL?.replace('/graphql', '') || 'http://localhost:4000'}/health`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then(() => setApiStatus('ok'))
      .catch(() => setApiStatus('offline'));
  }, []);
  return (
    <ErrorBoundary>
      <>
        <header className="p-4 text-xl font-bold">EveryBite Admin Panel</header>
        <main className="p-4">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        {/* Toast portal */}
        <Toaster position="bottom-right" />
      </>
    </ErrorBoundary>
  );
}
