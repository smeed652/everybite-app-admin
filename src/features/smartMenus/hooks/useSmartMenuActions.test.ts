import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the useSyncWidget hook
vi.mock("./useSyncWidget", () => ({
  useSyncWidget: vi.fn(),
}));

// Mock the useUpdateWidget hook
vi.mock("./useUpdateWidget", () => ({
  useUpdateWidget: vi.fn(),
}));

// Mock the useToast hook
vi.mock("../../../components/ui/ToastProvider", () => ({
  useToast: vi.fn(),
}));

// Import after mocks
import { useToast } from "../../../components/ui/ToastProvider";
import { useSmartMenuActions } from "./useSmartMenuActions";
import { useSyncWidget } from "./useSyncWidget";
import { useUpdateWidget } from "./useUpdateWidget";

const mockUseSyncWidget = useSyncWidget as ReturnType<typeof vi.fn>;
const mockUseUpdateWidget = useUpdateWidget as ReturnType<typeof vi.fn>;
const mockUseToast = useToast as ReturnType<typeof vi.fn>;

describe("useSmartMenuActions", () => {
  const mockSync = vi.fn(() => Promise.resolve({ success: true }));
  const mockUpdateWidgetFields = vi.fn(() => Promise.resolve());
  const mockShowToast = vi.fn();

  const mockWidget = {
    id: "widget-123",
    name: "Test Widget",
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSyncWidget.mockReturnValue({
      sync: mockSync,
      loading: false,
    });
    mockUseUpdateWidget.mockReturnValue({
      updateWidgetFields: mockUpdateWidgetFields,
    });
    mockUseToast.mockReturnValue({
      showToast: mockShowToast,
    });
  });

  it("should return action functions and loading states", () => {
    const { result } = renderHook(() =>
      useSmartMenuActions({
        widget: mockWidget,
        dirty: false,
        pendingChanges: {},
        refreshSnapshot: vi.fn(),
        reset: vi.fn(),
      })
    );

    expect(result.current.handleSave).toBeDefined();
    expect(result.current.handleCancel).toBeDefined();
    expect(result.current.handleSyncNow).toBeDefined();
    expect(result.current.saving).toBe(false);
    expect(result.current.syncing).toBe(false);
  });

  it("should handle save with onSave callback", async () => {
    const onSave = vi.fn(() => Promise.resolve());
    const refreshSnapshot = vi.fn();
    const { result } = renderHook(() =>
      useSmartMenuActions({
        widget: mockWidget,
        dirty: true,
        pendingChanges: { name: "Updated Name" },
        refreshSnapshot,
        reset: vi.fn(),
        onSave,
      })
    );

    await act(async () => {
      await result.current.handleSave();
    });

    expect(onSave).toHaveBeenCalledWith({
      widget: mockWidget,
      pendingChanges: { name: "Updated Name" },
      updateFields: expect.any(Function),
    });
    expect(mockShowToast).toHaveBeenCalledWith({
      title: "Changes saved",
      variant: "success",
    });
    expect(refreshSnapshot).toHaveBeenCalled();
  });

  it("should handle save without onSave callback", async () => {
    const refreshSnapshot = vi.fn();
    const { result } = renderHook(() =>
      useSmartMenuActions({
        widget: mockWidget,
        dirty: true,
        pendingChanges: { name: "Updated Name" },
        refreshSnapshot,
        reset: vi.fn(),
      })
    );

    await act(async () => {
      await result.current.handleSave();
    });

    expect(mockUpdateWidgetFields).toHaveBeenCalledWith("widget-123", {
      name: "Updated Name",
    });
    expect(mockShowToast).toHaveBeenCalledWith({
      title: "Changes saved",
      variant: "success",
    });
    expect(refreshSnapshot).toHaveBeenCalled();
  });

  it("should not save when not dirty", async () => {
    const refreshSnapshot = vi.fn();
    const { result } = renderHook(() =>
      useSmartMenuActions({
        widget: mockWidget,
        dirty: false,
        pendingChanges: { name: "Updated Name" },
        refreshSnapshot,
        reset: vi.fn(),
      })
    );

    await act(async () => {
      await result.current.handleSave();
    });

    expect(mockUpdateWidgetFields).not.toHaveBeenCalled();
    expect(refreshSnapshot).not.toHaveBeenCalled();
  });

  it("should not save when widget has no ID", async () => {
    const widgetWithoutId = { ...mockWidget, id: undefined };
    const refreshSnapshot = vi.fn();
    const { result } = renderHook(() =>
      useSmartMenuActions({
        widget: widgetWithoutId,
        dirty: true,
        pendingChanges: { name: "Updated Name" },
        refreshSnapshot,
        reset: vi.fn(),
      })
    );

    await act(async () => {
      await result.current.handleSave();
    });

    expect(mockUpdateWidgetFields).not.toHaveBeenCalled();
    expect(refreshSnapshot).not.toHaveBeenCalled();
  });

  it("should handle cancel action", () => {
    const reset = vi.fn();
    const { result } = renderHook(() =>
      useSmartMenuActions({
        widget: mockWidget,
        dirty: true,
        pendingChanges: { name: "Updated Name" },
        refreshSnapshot: vi.fn(),
        reset,
      })
    );

    act(() => {
      result.current.handleCancel();
    });

    expect(reset).toHaveBeenCalled();
  });

  it("should handle sync now action", async () => {
    const { result } = renderHook(() =>
      useSmartMenuActions({
        widget: mockWidget,
        dirty: false,
        pendingChanges: {},
        refreshSnapshot: vi.fn(),
        reset: vi.fn(),
      })
    );

    await act(async () => {
      await result.current.handleSyncNow();
    });

    expect(mockSync).toHaveBeenCalledWith("widget-123");
    expect(mockShowToast).toHaveBeenCalledWith({
      title: "Sync started",
      variant: "success",
    });
  });

  it("should handle sync now error", async () => {
    mockSync.mockRejectedValue(new Error("Sync failed"));
    const { result } = renderHook(() =>
      useSmartMenuActions({
        widget: mockWidget,
        dirty: false,
        pendingChanges: {},
        refreshSnapshot: vi.fn(),
        reset: vi.fn(),
      })
    );

    await act(async () => {
      await result.current.handleSyncNow();
    });

    expect(mockSync).toHaveBeenCalledWith("widget-123");
    expect(mockShowToast).toHaveBeenCalledWith({
      title: "Sync failed",
      variant: "error",
    });
  });

  it("should not sync when widget has no ID", async () => {
    const widgetWithoutId = { ...mockWidget, id: undefined };
    const { result } = renderHook(() =>
      useSmartMenuActions({
        widget: widgetWithoutId,
        dirty: false,
        pendingChanges: {},
        refreshSnapshot: vi.fn(),
        reset: vi.fn(),
      })
    );

    await act(async () => {
      await result.current.handleSyncNow();
    });

    expect(mockSync).not.toHaveBeenCalled();
  });

  it("should return syncing state from useSyncWidget", () => {
    mockUseSyncWidget.mockReturnValue({
      sync: mockSync,
      loading: true, // syncing state
    });

    const { result } = renderHook(() =>
      useSmartMenuActions({
        widget: mockWidget,
        dirty: false,
        pendingChanges: {},
        refreshSnapshot: vi.fn(),
        reset: vi.fn(),
      })
    );

    expect(result.current.syncing).toBe(true);
  });
});
