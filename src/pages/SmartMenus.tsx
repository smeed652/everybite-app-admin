import { useNavigate } from "react-router-dom";
import { TanStackDataTable } from "../components/ui/TanStackDataTable";
import { useSmartMenusColumns } from "../features/smartMenus/components/SmartMenusColumns";
import { SmartMenusError } from "../features/smartMenus/components/SmartMenusError";
import { useSmartMenus } from "../features/smartMenus/hooks/useSmartMenus";

export default function SmartMenus() {
  const navigate = useNavigate();
  const { smartMenus, loading, error } = useSmartMenus();
  const columns = useSmartMenusColumns();

  if (error) {
    return <SmartMenusError error={error} />;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">SmartMenus</h1>
        {/* Removed Create SmartMenu button */}
      </div>

      <TanStackDataTable
        columns={columns}
        data={smartMenus || []}
        loading={loading}
        selectable={false}
        onRowClick={(row) => navigate(`/smartmenus/${row.id}`)}
        label="SmartMenus list"
        data-testid="smartmenus-table"
        id="smartmenus-table"
      />
    </div>
  );
}
