interface SmartMenuErrorStateProps {
  error?: Error;
}

export const SmartMenuErrorState = ({ error }: SmartMenuErrorStateProps) => {
  return (
    <div className="p-8 text-center">
      <div className="text-red-600">
        <h2 className="text-lg font-semibold mb-2">Failed to load widget</h2>
        {error && (
          <p className="text-sm text-gray-600 mt-2">Error: {error.message}</p>
        )}
        <p className="text-sm text-gray-500 mt-2">
          Please check the URL and try refreshing the page.
        </p>
      </div>
    </div>
  );
};
