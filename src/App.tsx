import { Toaster } from 'react-hot-toast';
import React from 'react';

export default function App() {
  return (
    <>
      <header className="p-4 text-xl font-bold">EveryBite Admin Panel</header>
      <main className="p-4">
        <p className="text-gray-700">Hello, world!</p>
      </main>
      {/* Toast portal */}
      <Toaster position="bottom-right" />
    </>
  );
}
