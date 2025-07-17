import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { AuthConfigCheck } from "./components/AuthConfigCheck";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastProvider } from "./components/ui/ToastProvider";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import CacheManagement from "./pages/CacheManagement";
import Dashboard from "./pages/Dashboard";
import Forbidden from "./pages/Forbidden";
import Login from "./pages/Login";
import MetabaseUsers from "./pages/MetabaseUsers";
import NotFound from "./pages/NotFound";
import SmartMenuDetail from "./pages/SmartMenuDetail";
import SmartMenuFeatures from "./pages/SmartMenuFeatures";
import SmartMenuMarketing from "./pages/SmartMenuMarketing";
import SmartMenus from "./pages/SmartMenus";
import Users from "./pages/Users";

export default function App() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [apiStatus, setApiStatus] = useState<"ok" | "offline">("offline");

  useEffect(() => {
    // Skip health-check in local dev unless explicitly enabled
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // Opt-in: ping only when explicitly enabled via env
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const shouldPing = Boolean(import.meta.env.VITE_ENABLE_HEALTHCHECK);
    if (!shouldPing) return;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore import.meta env types missing
    fetch(
      `${import.meta.env.VITE_API_URL?.replace("/graphql", "") || "http://localhost:4000"}/health`
    )
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(() => setApiStatus("ok"))
      .catch(() => setApiStatus("offline"));
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <AuthConfigCheck />
          {/* Skip link for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:border-2 focus:border-black focus:rounded focus:outline-none"
          >
            Skip to main content
          </a>

          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/403" element={<Forbidden />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route
                path="users"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <Users />
                  </ProtectedRoute>
                }
              />
              <Route
                path="metabase-users"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <MetabaseUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/cache"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <CacheManagement />
                  </ProtectedRoute>
                }
              />
              <Route path="smartmenus" element={<SmartMenus />} />
              <Route
                path="smartmenus/:widgetId"
                element={<SmartMenuDetail />}
              />
              <Route
                path="smartmenus/:widgetId/features"
                element={<SmartMenuFeatures />}
              />
              <Route
                path="smartmenus/:widgetId/marketing"
                element={<SmartMenuMarketing />}
              />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
