import { Toaster } from 'react-hot-toast';
import React from 'react';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <>
        <header className="p-4 text-xl font-bold">EveryBite Admin Panel</header>
        <main className="p-4">
          <p className="text-gray-700">Hello, world!</p>
        </main>
        {/* Toast portal */}
        <Toaster position="bottom-right" />
      </>
    </ErrorBoundary>
  );
}
