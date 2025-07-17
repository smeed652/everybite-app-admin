import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MetabaseUsersTable } from "../components/MetabaseUsersTable";
import { useMetabaseUsersGraphQL } from "../hooks/useMetabaseGraphQL";

// Mock the useMetabaseUsersGraphQL hook
vi.mock("../hooks/useMetabaseGraphQL", () => ({
  useMetabaseUsersGraphQL: vi.fn(),
}));

const mockUseMetabaseUsersGraphQL = useMetabaseUsersGraphQL as ReturnType<
  typeof vi.fn
>;

// Mock data
const mockUsers = {
  users: [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      firstName: "John",
      lastName: "Doe",
      dateJoined: "2024-01-15T10:00:00Z",
      lastLogin: "2024-12-01T15:30:00Z",
      isActive: true,
      isSuperuser: false,
      isQbnewb: false,
      locale: "en",
      ssoSource: null,
      updatedAt: "2024-12-01T15:30:00Z",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      firstName: "Jane",
      lastName: "Smith",
      dateJoined: "2024-02-20T09:00:00Z",
      lastLogin: "2024-12-02T14:20:00Z",
      isActive: true,
      isSuperuser: true,
      isQbnewb: false,
      locale: "en",
      ssoSource: "google",
      updatedAt: "2024-12-02T14:20:00Z",
    },
    {
      id: 3,
      name: "Bob Wilson",
      email: "bob@example.com",
      firstName: "Bob",
      lastName: "Wilson",
      dateJoined: "2024-03-10T11:00:00Z",
      lastLogin: null,
      isActive: false,
      isSuperuser: false,
      isQbnewb: true,
      locale: "es",
      ssoSource: null,
      updatedAt: "2024-03-10T11:00:00Z",
    },
  ],
  total: 3,
};

describe("MetabaseUsersTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", () => {
    mockUseMetabaseUsersGraphQL.mockReturnValue({
      users: null,
      loading: true,
      error: null,
      refetch: vi.fn(),
    });

    render(<MetabaseUsersTable />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    // The button shows "Loading..." when loading, not "Refresh"
    expect(screen.getByText("Loading...")).toBeDisabled();
  });

  it("renders users table when data is loaded", () => {
    mockUseMetabaseUsersGraphQL.mockReturnValue({
      users: mockUsers,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<MetabaseUsersTable />);

    expect(screen.getByText("3 total users • 3 shown")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    expect(screen.getByText("Bob Wilson")).toBeInTheDocument();
  });

  it("displays user status badges correctly", () => {
    mockUseMetabaseUsersGraphQL.mockReturnValue({
      users: mockUsers,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<MetabaseUsersTable />);

    // Active users should have "Active" badge
    const activeBadges = screen.getAllByText("Active");
    expect(activeBadges).toHaveLength(2);

    // Inactive user should have "Inactive" badge
    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });

  it("displays role badges correctly", () => {
    mockUseMetabaseUsersGraphQL.mockReturnValue({
      users: mockUsers,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<MetabaseUsersTable />);

    // Regular users should have "User" badge
    const userBadges = screen.getAllByText("User");
    expect(userBadges).toHaveLength(2);

    // Admin user should have "Admin" badge
    expect(screen.getByText("Admin")).toBeInTheDocument();

    // QB Newb user should have "QB Newb" badge
    expect(screen.getByText("QB Newb")).toBeInTheDocument();
  });

  it("filters users by search term", async () => {
    mockUseMetabaseUsersGraphQL.mockReturnValue({
      users: mockUsers,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<MetabaseUsersTable />);

    const searchInput = screen.getByPlaceholderText(
      "Search by name, email, or first/last name..."
    );
    fireEvent.change(searchInput, { target: { value: "john" } });

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
      expect(screen.queryByText("Bob Wilson")).not.toBeInTheDocument();
    });
  });

  it("filters users by email", async () => {
    mockUseMetabaseUsersGraphQL.mockReturnValue({
      users: mockUsers,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<MetabaseUsersTable />);

    const searchInput = screen.getByPlaceholderText(
      "Search by name, email, or first/last name..."
    );
    fireEvent.change(searchInput, { target: { value: "jane@example.com" } });

    await waitFor(() => {
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
      expect(screen.queryByText("Bob Wilson")).not.toBeInTheDocument();
    });
  });

  it("handles name header click without errors", () => {
    mockUseMetabaseUsersGraphQL.mockReturnValue({
      users: mockUsers,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<MetabaseUsersTable />);

    const nameHeader = screen.getByText("Name");

    // Click should not cause errors
    expect(() => {
      fireEvent.click(nameHeader);
    }).not.toThrow();

    // Table should still be rendered
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("Bob Wilson")).toBeInTheDocument();
  });

  it("sorts users by date joined", async () => {
    mockUseMetabaseUsersGraphQL.mockReturnValue({
      users: mockUsers,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<MetabaseUsersTable />);

    const joinedHeader = screen.getByText("Joined");
    fireEvent.click(joinedHeader);

    await waitFor(() => {
      const rows = screen.getAllByRole("row");
      // Should be sorted by date joined (ascending)
      expect(rows[1]).toHaveTextContent("John Doe"); // 2024-01-15
      expect(rows[2]).toHaveTextContent("Jane Smith"); // 2024-02-20
      expect(rows[3]).toHaveTextContent("Bob Wilson"); // 2024-03-10
    });
  });

  it("handles empty search results", async () => {
    mockUseMetabaseUsersGraphQL.mockReturnValue({
      users: mockUsers,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<MetabaseUsersTable />);

    const searchInput = screen.getByPlaceholderText(
      "Search by name, email, or first/last name..."
    );
    fireEvent.change(searchInput, { target: { value: "nonexistent" } });

    await waitFor(() => {
      expect(
        screen.getByText("No users found matching your search criteria.")
      ).toBeInTheDocument();
    });
  });

  it("calls refetch when refresh button is clicked", () => {
    const mockRefetch = vi.fn();
    mockUseMetabaseUsersGraphQL.mockReturnValue({
      users: mockUsers,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<MetabaseUsersTable />);

    const refreshButton = screen.getByText("Refresh");
    fireEvent.click(refreshButton);

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it("disables refresh button when loading", () => {
    mockUseMetabaseUsersGraphQL.mockReturnValue({
      users: null,
      loading: true,
      error: null,
      refetch: vi.fn(),
    });

    render(<MetabaseUsersTable />);

    const refreshButton = screen.getByText("Loading...");
    expect(refreshButton).toBeDisabled();
  });

  it("displays error state with retry button", () => {
    const mockRefetch = vi.fn();
    mockUseMetabaseUsersGraphQL.mockReturnValue({
      users: null,
      loading: false,
      error: "Failed to fetch users",
      refetch: mockRefetch,
    });

    render(<MetabaseUsersTable />);

    expect(screen.getByText("Metabase Users")).toBeInTheDocument();
    expect(screen.getByText("Error loading users:")).toBeInTheDocument();
    expect(screen.getByText("Failed to fetch users")).toBeInTheDocument();
    expect(screen.getByText("Retry")).toBeInTheDocument();

    const retryButton = screen.getByText("Retry");
    fireEvent.click(retryButton);

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it("displays empty state when no users exist", () => {
    mockUseMetabaseUsersGraphQL.mockReturnValue({
      users: { users: [], total: 0 },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<MetabaseUsersTable />);

    expect(screen.getByText("0 total users • 0 shown")).toBeInTheDocument();
    expect(screen.getByText("No users found in Metabase.")).toBeInTheDocument();
  });

  it("formats dates correctly", () => {
    mockUseMetabaseUsersGraphQL.mockReturnValue({
      users: mockUsers,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<MetabaseUsersTable />);

    // Check that dates are formatted as locale date strings
    expect(screen.getByText("1/15/2024")).toBeInTheDocument(); // John's join date
    expect(screen.getByText("12/1/2024")).toBeInTheDocument(); // John's last login
    expect(screen.getByText("2/20/2024")).toBeInTheDocument(); // Jane's join date
    expect(screen.getByText("12/2/2024")).toBeInTheDocument(); // Jane's last login
  });

  it("handles null dates gracefully", () => {
    const usersWithNullDates = {
      users: [
        {
          ...mockUsers.users[0],
          lastLogin: null,
        },
      ],
      total: 1,
    };

    mockUseMetabaseUsersGraphQL.mockReturnValue({
      users: usersWithNullDates,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<MetabaseUsersTable />);

    // Should display "-" for null dates
    const dashElements = screen.getAllByText("-");
    expect(dashElements.length).toBeGreaterThan(0);
  });
});
