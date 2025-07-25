import { render, screen } from "@testing-library/react";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

// Helper to render with router
const renderWithRouter = (ui: React.ReactElement, initialPath = "/") => {
  return render(
    <MemoryRouter
      initialEntries={[initialPath]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      {ui}
    </MemoryRouter>
  );
};

describe("ProtectedRoute", () => {
  // Reset module mocks between tests
  afterEach(() => {
    vi.resetModules();
  });

  it("renders children for ADMIN role", async () => {
    // mock Amplify session with ADMIN group
    vi.doMock("aws-amplify/auth", () => ({
      fetchAuthSession: () =>
        Promise.resolve({
          accessToken: { payload: { "cognito:groups": "ADMIN" } },
        }),
    }));
    const ProtectedRouteLocal = (await import("../components/ProtectedRoute"))
      .default;

    renderWithRouter(
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRouteLocal allowedRoles={["ADMIN"]}>
              <span>Secret</span>
            </ProtectedRouteLocal>
          }
        />
        <Route path="/403" element={<>Forbidden</>} />
      </Routes>
    );

    expect(await screen.findByText("Secret")).toBeInTheDocument();
  });

  it("redirects non-admin user to /403", async () => {
    vi.doMock("aws-amplify/auth", () => ({
      fetchAuthSession: () =>
        Promise.resolve({
          accessToken: { payload: { "cognito:groups": ["USER"] } },
        }),
    }));
    const ProtectedRouteLocal = (await import("../components/ProtectedRoute"))
      .default;

    renderWithRouter(
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRouteLocal allowedRoles={["ADMIN"]}>
              <span>Secret</span>
            </ProtectedRouteLocal>
          }
        />
        <Route path="/403" element={<div>Forbidden</div>} />
      </Routes>
    );

    expect(await screen.findByText("Forbidden")).toBeInTheDocument();
  });
});
