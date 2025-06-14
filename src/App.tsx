import { Toaster } from 'react-hot-toast';
import React, { useEffect, useState } from 'react';
import ErrorBoundary from './components/ErrorBoundary';

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
        <main className="p-4 space-y-2">
          <p className="text-gray-700">Hello, world!</p>
          <p className="text-sm text-gray-500">
            API status: {apiStatus === 'ok' ? (
              <span className="text-green-600">online</span>
            ) : (
              <span className="text-red-600">offline</span>
            )}
          </p>
        </main>
        {/* Toast portal */}
        <Toaster position="bottom-right" />
      </>
    </ErrorBoundary>
  );
}
