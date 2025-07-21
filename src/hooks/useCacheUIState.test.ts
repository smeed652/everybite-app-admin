import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useCacheUIState } from "./useCacheUIState";

describe("useCacheUIState", () => {
  it("initializes with null operation and viewer closed", () => {
    const { result } = renderHook(() => useCacheUIState());
    expect(result.current.selectedOperation).toBeNull();
    expect(result.current.isViewerOpen).toBe(false);
  });

  it("setSelectedOperation sets the operation", () => {
    const { result } = renderHook(() => useCacheUIState());
    act(() => result.current.setSelectedOperation("READ" as any));
    expect(result.current.selectedOperation).toBe("READ");
  });

  it("setIsViewerOpen sets the viewer state", () => {
    const { result } = renderHook(() => useCacheUIState());
    act(() => result.current.setIsViewerOpen(true));
    expect(result.current.isViewerOpen).toBe(true);
  });

  it("handleViewContents sets operation and opens viewer", () => {
    const { result } = renderHook(() => useCacheUIState());
    act(() => result.current.handleViewContents("WRITE" as any));
    expect(result.current.selectedOperation).toBe("WRITE");
    expect(result.current.isViewerOpen).toBe(true);
  });

  it("handleCloseViewer closes viewer and clears operation", () => {
    const { result } = renderHook(() => useCacheUIState());
    act(() => {
      result.current.setSelectedOperation("READ" as any);
      result.current.setIsViewerOpen(true);
    });
    act(() => result.current.handleCloseViewer());
    expect(result.current.isViewerOpen).toBe(false);
    expect(result.current.selectedOperation).toBeNull();
  });
});
