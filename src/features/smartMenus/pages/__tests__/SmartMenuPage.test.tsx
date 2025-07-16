/* eslint-disable @typescript-eslint/no-explicit-any */
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { ToastProvider } from "../../../../components/ui/ToastProvider";
import { useUpdateWidget } from "../../hooks/useUpdateWidget";
import { useWidget } from "../../hooks/useWidget";
vi.mock("../../hooks/useWidget");
const mockedUseWidget = useWidget as unknown as Mock;
vi.mock("../../hooks/useUpdateWidget");
const mockedUseUpdateWidget = useUpdateWidget as unknown as Mock;

// ----- mocks: must come before importing SmartMenuPage -----
vi.mock("@apollo/client", () => ({
  __esModule: true,
  gql: (lits: any) => (Array.isArray(lits) ? lits.join("") : lits),
  useQuery: () => ({ data: undefined, loading: false, error: undefined }),
  useApolloClient: () => ({
    cache: { identify: () => null, readFragment: () => null },
    mutate: vi.fn(),
  }),
  useMutation: vi.fn(() => [vi.fn(), { loading: false, error: undefined }]),
}));

vi.mock("../../hooks/useWidgetDiff");

vi.mock("../../../../generated/graphql", () => ({ __esModule: true }));

import SmartMenuPage from "../SmartMenuPage";

// ----- helpers -----
const baseWidget = { id: "1", name: "Demo", isSyncEnabled: false } as any;

function renderPage(
  widgetOverrides: Partial<typeof baseWidget> = {},
  props = {}
) {
  mockedUseWidget.mockReturnValue({
    widget: { ...baseWidget, ...widgetOverrides },
    loading: false,
    error: null,
  });

  return render(
    <MemoryRouter>
      <ToastProvider>
        <SmartMenuPage
          // simple panel: one input that calls onFieldChange
          renderPanels={(widget: any, _key: number, onFieldChange: any) => (
            <input
              aria-label="name"
              defaultValue={widget.name}
              onChange={(e) => onFieldChange({ name: e.target.value })}
            />
          )}
          {...props}
        />
      </ToastProvider>
    </MemoryRouter>
  );
}

// ----- tests -----

describe("SmartMenuPage", () => {
  beforeEach(() => {
    mockedUseUpdateWidget.mockReturnValue({ updateWidgetFields: vi.fn() });
    vi.clearAllMocks();
  });

  it("shows skeleton while loading", () => {
    mockedUseWidget.mockReturnValue({
      widget: null,
      loading: true,
      error: null,
    });

    render(
      <MemoryRouter>
        <ToastProvider>
          <SmartMenuPage renderPanels={() => null} />
        </ToastProvider>
      </MemoryRouter>
    );

    expect(screen.getByTestId("smartmenu-generic-page")).toBeInTheDocument();
    // skeleton rendered
    expect(screen.getAllByRole("status").length).toBeGreaterThan(0);
  });

  it("enables Save button after diff and calls default save", async () => {
    const updateWidgetFields = vi.fn();
    mockedUseUpdateWidget.mockReturnValue({ updateWidgetFields });

    renderPage();

    // change the input to mark dirty
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "New Name" },
    });

    const saveButton = await screen.findByRole("button", { name: /save/i });
    expect(saveButton).toBeEnabled();

    fireEvent.click(saveButton);

    expect(updateWidgetFields).toHaveBeenCalledWith("1", { name: "New Name" });
  });

  it("calls custom onSave when provided", async () => {
    const customSave = vi.fn();

    renderPage({}, { onSave: customSave });

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "X" },
    });

    const saveButton = await screen.findByRole("button", { name: /save/i });
    fireEvent.click(saveButton);

    expect(customSave).toHaveBeenCalled();
  });
});
