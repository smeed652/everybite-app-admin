import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Register() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      // TODO: replace with GraphQL mutation
      login({ accessToken: 'fake.jwt.token' });
    } catch {
      setError('Registration failed');
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-10 p-6 border rounded">
      <h1 className="text-2xl font-semibold mb-4">Create account</h1>
      {error && <p className="mb-2 text-red-600 text-sm">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          className="w-full px-3 py-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-3 py-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Register
        </button>
      </form>
      <p className="mt-3 text-sm text-center">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
