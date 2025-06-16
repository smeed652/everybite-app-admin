import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { logout } = useAuth();
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button variant="outline" onClick={logout}>Log out</Button>
      </div>
      <p>Welcome to EveryBite Admin!</p>
    </div>
  );
}
