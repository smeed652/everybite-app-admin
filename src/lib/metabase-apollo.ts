import axios from "axios";

// Metabase configuration
const METABASE_URL =
  import.meta.env.VITE_METABASE_URL || "https://analytics.everybite.com";
const METABASE_USERNAME = import.meta.env.VITE_METABASE_USERNAME || "";
const METABASE_PASSWORD = import.meta.env.VITE_METABASE_PASSWORD || "";

// Create axios instance for Metabase API
export const metabaseApi = axios.create({
  baseURL: METABASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "User-Agent": "EveryBite-Admin/1.0",
  },
});

// Metabase authentication state
let sessionToken: string | null = null;
let isAuthenticated = false;

/**
 * Authenticate with Metabase
 */
export const authenticateMetabase = async (): Promise<string> => {
  if (isAuthenticated && sessionToken) {
    return sessionToken;
  }

  try {
    const response = await metabaseApi.post("/api/session", {
      username: METABASE_USERNAME,
      password: METABASE_PASSWORD,
    });

    sessionToken = response.data.id;
    isAuthenticated = true;

    // Update axios instance with session token
    if (sessionToken) {
      metabaseApi.defaults.headers["X-Metabase-Session"] = sessionToken;
    }

    return sessionToken!;
  } catch (error) {
    console.error("Metabase authentication failed:", error);
    throw error;
  }
};

/**
 * Logout from Metabase
 */
export const logoutMetabase = async (): Promise<void> => {
  if (sessionToken) {
    try {
      await metabaseApi.delete("/api/session");
    } catch (error) {
      console.warn("Metabase logout failed:", error);
    } finally {
      sessionToken = null;
      isAuthenticated = false;
      delete metabaseApi.defaults.headers["X-Metabase-Session"];
    }
  }
};

/**
 * Ensure we're authenticated before making requests
 */
export const ensureAuthenticated = async (): Promise<void> => {
  if (!isAuthenticated || !sessionToken) {
    await authenticateMetabase();
  }
};

// Export configuration
export { METABASE_PASSWORD, METABASE_URL, METABASE_USERNAME };
