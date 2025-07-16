interface SmartMenusErrorProps {
  error: Error;
}

export const SmartMenusError = ({ error }: SmartMenusErrorProps) => {
  return (
    <div className="p-8">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900">
          Error loading SmartMenus
        </h2>
        <p className="text-gray-600 mt-2">{error.message}</p>
      </div>
    </div>
  );
};
