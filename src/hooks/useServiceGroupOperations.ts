import { SERVICE_GROUPS } from "../components/cache/constants";
import { useToast } from "../components/ui/ToastProvider";
import { lambdaService } from "../services/base/lambdaService";

export function useServiceGroupOperations(
  handleRefreshOperation: (
    operationName: string
  ) => Promise<{ success: boolean; error?: unknown }>,
  handleClearOperation: (
    operationName: string
  ) => Promise<{ success: boolean; error?: unknown }>,
  updateStatus: () => void
) {
  const { showToast } = useToast();

  const handleRefreshServiceGroup = async (serviceGroupName: string) => {
    const serviceGroup = SERVICE_GROUPS.find(
      (group) => group.name === serviceGroupName
    );

    if (!serviceGroup) {
      throw new Error(`Unknown service group: ${serviceGroupName}`);
    }

    // Clear cache for all operations in the service group
    lambdaService.clearOperationsCache(serviceGroup.operations);

    // Refresh each operation in the group
    const refreshPromises = serviceGroup.operations.map((operation) =>
      handleRefreshOperation(operation)
    );

    await Promise.all(refreshPromises);
    updateStatus();

    return { success: true };
  };

  const handleClearServiceGroup = async (serviceGroupName: string) => {
    const serviceGroup = SERVICE_GROUPS.find(
      (group) => group.name === serviceGroupName
    );

    if (!serviceGroup) {
      throw new Error(`Unknown service group: ${serviceGroupName}`);
    }

    // Clear cache for all operations in the service group
    lambdaService.clearOperationsCache(serviceGroup.operations);
    updateStatus();

    return { success: true };
  };

  const handleRefreshServiceGroupWithToast = async (
    serviceGroupName: string
  ) => {
    const serviceGroup = SERVICE_GROUPS.find(
      (group) => group.name === serviceGroupName
    );

    showToast({
      title: `Starting ${serviceGroup?.displayName || serviceGroupName} refresh...`,
      description: "Refreshing cache data. This may take a moment.",
      variant: "default",
    });

    try {
      const result = await handleRefreshServiceGroup(serviceGroupName);

      if (result.success) {
        showToast({
          title: `${serviceGroup?.displayName || serviceGroupName} refreshed successfully!`,
          description: "Cache data has been updated.",
          variant: "success",
        });
      } else {
        showToast({
          title: "Failed to refresh service group",
          description: "Please try again.",
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error refreshing service group:", error);
      showToast({
        title: "Failed to refresh service group",
        description: "Please try again.",
        variant: "error",
      });
    }
  };

  const handleClearServiceGroupWithToast = async (serviceGroupName: string) => {
    const serviceGroup = SERVICE_GROUPS.find(
      (group) => group.name === serviceGroupName
    );

    showToast({
      title: `Starting ${serviceGroup?.displayName || serviceGroupName} cache clear...`,
      description: "Clearing cache data. This may take a moment.",
      variant: "default",
    });

    try {
      const result = await handleClearServiceGroup(serviceGroupName);

      if (result.success) {
        showToast({
          title: `${serviceGroup?.displayName || serviceGroupName} cache cleared successfully!`,
          description: "Cache data has been cleared.",
          variant: "success",
        });
      } else {
        showToast({
          title: "Failed to clear service group cache",
          description: "Please try again.",
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error clearing service group cache:", error);
      showToast({
        title: "Failed to clear service group cache",
        description: "Please try again.",
        variant: "error",
      });
    }
  };

  return {
    handleRefreshServiceGroup,
    handleClearServiceGroup,
    handleRefreshServiceGroupWithToast,
    handleClearServiceGroupWithToast,
  };
}
