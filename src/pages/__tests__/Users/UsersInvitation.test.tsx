import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  mockFetch,
  mockShowToast,
  mockUsers,
  renderUsers,
  setupTestEnvironment,
} from "./test-utils";

describe("Users Invitation", () => {
  beforeEach(() => {
    setupTestEnvironment();
  });

  it("should invite user successfully", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          users: mockUsers,
          nextToken: null,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: "User created successfully",
        }),
      });

    renderUsers();

    await waitFor(() => {
      expect(screen.getByText("user1@example.com")).toBeInTheDocument();
    });

    // Fill invite form
    const emailInput = screen.getByPlaceholderText("Email address");
    fireEvent.change(emailInput, { target: { value: "newuser@example.com" } });

    // Submit invite
    const inviteButton = screen.getByText("Invite User");
    fireEvent.click(inviteButton);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith({
        title: "User invited successfully",
        variant: "success",
      });
    });
  });

  it("should not invite with empty email", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        users: mockUsers,
        nextToken: null,
      }),
    });

    renderUsers();

    await waitFor(() => {
      expect(screen.getByText("user1@example.com")).toBeInTheDocument();
    });

    // Try to submit without email
    const inviteButton = screen.getByText("Invite User");
    expect(inviteButton).toBeDisabled();
  });

  it("should handle invitation failure", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          users: mockUsers,
          nextToken: null,
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          message: "Email already exists",
        }),
      });

    renderUsers();

    await waitFor(() => {
      expect(screen.getByText("user1@example.com")).toBeInTheDocument();
    });

    // Fill invite form
    const emailInput = screen.getByPlaceholderText("Email address");
    fireEvent.change(emailInput, { target: { value: "existing@example.com" } });

    // Submit invite
    const inviteButton = screen.getByText("Invite User");
    fireEvent.click(inviteButton);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith({
        title: "Email already exists",
        variant: "error",
      });
    });
  });

  it("should handle invitation network error", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          users: mockUsers,
          nextToken: null,
        }),
      })
      .mockRejectedValueOnce(new Error("Network error"));

    renderUsers();

    await waitFor(() => {
      expect(screen.getByText("user1@example.com")).toBeInTheDocument();
    });

    // Fill invite form
    const emailInput = screen.getByPlaceholderText("Email address");
    fireEvent.change(emailInput, { target: { value: "newuser@example.com" } });

    // Submit invite
    const inviteButton = screen.getByText("Invite User");
    fireEvent.click(inviteButton);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith({
        title: "Network error",
        variant: "error",
      });
    });
  });

  it("should show loading state during invitation", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          users: mockUsers,
          nextToken: null,
        }),
      })
      .mockImplementation(() => new Promise(() => {})); // Never resolves for invite

    renderUsers();

    await waitFor(() => {
      expect(screen.getByText("user1@example.com")).toBeInTheDocument();
    });

    // Fill invite form
    const emailInput = screen.getByPlaceholderText("Email address");
    fireEvent.change(emailInput, { target: { value: "newuser@example.com" } });

    // Submit invite
    const inviteButton = screen.getByText("Invite User");
    fireEvent.click(inviteButton);

    // Should show loading state
    expect(screen.getByText("Inviting...")).toBeInTheDocument();
  });
});
