/* eslint-disable @typescript-eslint/no-explicit-any */
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import ProtectedRoute from "./ProtectedRoute";

// Mock Amplify auth BEFORE imports are evaluated
vi.mock("aws-amplify/auth", () => {
  return {
    fetchAuthSession: vi.fn(),
  };
});

import { fetchAuthSession } from "aws-amplify/auth";
const mockedFetch = vi.mocked(fetchAuthSession);

afterEach(() => {
  vi.resetAllMocks();
});

function renderWithRouter(element: React.ReactElement, initialEntries = ["/"]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/403" element={<div>Forbidden</div>} />
        <Route path="/" element={element} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  it("redirects to /login when not signed in", async () => {
    mockedFetch.mockRejectedValueOnce(new Error("No session"));

    renderWithRouter(
      <ProtectedRoute>
        <div>Private</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(screen.getByText(/login page/i)).toBeInTheDocument();
    });
  });

  it("redirects to /403 when user lacks required group", async () => {
    mockedFetch.mockResolvedValueOnce({
      tokens: {
        accessToken: {
          toString: () => "valid-access-token",
          payload: { "cognito:groups": ["USER"] },
        },
        idToken: {
          toString: () => "valid-id-token",
          payload: { "cognito:groups": ["USER"] },
        },
      },
      credentials: { accessKeyId: "a", secretAccessKey: "b" },
      identityId: "test-identity",
      userSub: "test-user",
    } as any);

    renderWithRouter(
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <div>Private</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(screen.getByText(/forbidden/i)).toBeInTheDocument();
    });
  });

  it("renders children when authorised", async () => {
    mockedFetch.mockResolvedValueOnce({
      tokens: {
        accessToken: {
          toString: () => "valid-access-token",
          payload: { "cognito:groups": ["ADMIN"] },
        },
        idToken: {
          toString: () => "valid-id-token",
          payload: { "cognito:groups": ["ADMIN"] },
        },
      },
      credentials: { accessKeyId: "a", secretAccessKey: "b" },
      identityId: "test-identity",
      userSub: "test-user",
    } as any);

    renderWithRouter(
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <div>Private</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(screen.getByText(/private/i)).toBeInTheDocument();
    });
  });
});
