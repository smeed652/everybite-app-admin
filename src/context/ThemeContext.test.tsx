import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0,
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Import after mocks
import { ThemeProvider, useTheme } from "./ThemeContext";

describe("ThemeContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockImplementation(() => {});
    mockLocalStorage.removeItem.mockImplementation(() => {});
  });

  describe("ThemeProvider", () => {
    const TestComponent = () => {
      const theme = useTheme();
      return (
        <div>
          <span data-testid="current-theme">{theme.theme}</span>
          <button onClick={theme.toggleTheme}>Toggle Theme</button>
        </div>
      );
    };

    it("provides light theme by default when no localStorage value", () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId("current-theme")).toHaveTextContent("light");
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("theme", "light");
    });

    it("uses stored light theme from localStorage", () => {
      mockLocalStorage.getItem.mockReturnValue("light");

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId("current-theme")).toHaveTextContent("light");
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("theme", "light");
    });

    it("uses stored dark theme from localStorage", () => {
      mockLocalStorage.getItem.mockReturnValue("dark");

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId("current-theme")).toHaveTextContent("dark");
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("theme", "dark");
    });

    it("falls back to light theme for invalid localStorage value", () => {
      mockLocalStorage.getItem.mockReturnValue("invalid");

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId("current-theme")).toHaveTextContent("light");
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("theme", "light");
    });

    it("toggles theme from light to dark", async () => {
      mockLocalStorage.getItem.mockReturnValue("light");

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId("current-theme")).toHaveTextContent("light");

      await act(async () => {
        screen.getByText("Toggle Theme").click();
      });

      expect(screen.getByTestId("current-theme")).toHaveTextContent("dark");
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("theme", "dark");
    });

    it("toggles theme from dark to light", async () => {
      mockLocalStorage.getItem.mockReturnValue("dark");

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId("current-theme")).toHaveTextContent("dark");

      await act(async () => {
        screen.getByText("Toggle Theme").click();
      });

      expect(screen.getByTestId("current-theme")).toHaveTextContent("light");
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("theme", "light");
    });
  });

  describe("useTheme hook", () => {
    it("throws error when used outside ThemeProvider", () => {
      const TestComponent = () => {
        useTheme();
        return <div>Test</div>;
      };

      expect(() => render(<TestComponent />)).toThrow(
        "useTheme must be used within ThemeProvider"
      );
    });

    it("returns theme context when used within ThemeProvider", () => {
      mockLocalStorage.getItem.mockReturnValue("light");

      const TestComponent = () => {
        const theme = useTheme();
        return (
          <div>
            <span data-testid="has-theme">{typeof theme.theme}</span>
            <span data-testid="has-toggle">{typeof theme.toggleTheme}</span>
          </div>
        );
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId("has-theme")).toHaveTextContent("string");
      expect(screen.getByTestId("has-toggle")).toHaveTextContent("function");
    });
  });
});
