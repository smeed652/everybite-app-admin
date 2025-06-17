export default function Forbidden() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-5xl font-semibold text-red-600">403</h1>
      <p className="text-lg">You do not have permission to access this page.</p>
    </div>
  );
}
