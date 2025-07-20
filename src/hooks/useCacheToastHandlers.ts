import { useToast } from "../components/ui/ToastProvider";

export function useCacheToastHandlers() {
  const { showToast } = useToast();

  const createToastHandler = (
    operation: () => Promise<{ success: boolean; error?: unknown }>,
    operationName: string,
    action: "refresh" | "clear" | "save"
  ) => {
    return async () => {
      const actionText =
        action === "refresh"
          ? "refreshing"
          : action === "clear"
            ? "clearing"
            : "saving";
      const successText =
        action === "refresh"
          ? "refreshed"
          : action === "clear"
            ? "cleared"
            : "saved";

      showToast({
        title: `Starting ${operationName} ${actionText}...`,
        description: `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} cache data. This may take a moment.`,
        variant: "default",
      });

      const result = await operation();

      if (result.success) {
        showToast({
          title: `${operationName} ${successText} successfully!`,
          description: `Cache data has been ${successText}.`,
          variant: "success",
        });
      } else {
        showToast({
          title: `Failed to ${action} ${operationName}`,
          description: "Please try again.",
          variant: "error",
        });
      }
    };
  };

  return {
    createToastHandler,
  };
}
