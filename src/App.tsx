import { Button } from '@/components/ui/button';

export function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">EveryBite Admin</h1>
          <nav>
            <ul className="flex space-x-4">
              <li><Button variant="ghost">Dashboard</Button></li>
              <li><Button variant="ghost">Menus</Button></li>
              <li><Button variant="ghost">Settings</Button></li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900">Welcome to EveryBite Admin</h2>
            <p className="mt-2 text-sm text-gray-600">
              Manage your restaurant menus and settings from one place.
            </p>
            <div className="mt-5">
              <Button>Get Started</Button>
            </div>
          </div>
        </div>
      </main>
    </div>

  )
}

export default App
