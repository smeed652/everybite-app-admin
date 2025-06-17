import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <h2 className="text-4xl font-bold">404 - Page Not Found</h2>
      <p className="text-gray-600 dark:text-gray-400">The page you’re looking for doesn’t exist.</p>
      <Link to="/" className="text-blue-600 hover:underline">
        Go back home
      </Link>
    </div>
  );
}
