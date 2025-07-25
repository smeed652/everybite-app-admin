import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { useAuth } from "../context/AuthContext";
import { currentSession, signIn } from "../lib/auth";
import { logger } from "../lib/logger";

export default function Login() {
  const navigate = useNavigate();
  const { login, accessToken } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if already authenticated
  useEffect(() => {
    if (accessToken) {
      navigate("/", { replace: true });
    } else {
      setIsLoading(false);
    }
  }, [accessToken, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    // DEBUG: log attempt
    logger.info("[login] attempting signIn", email);

    try {
      const result = await signIn(email, password);
      // DEBUG: inspect signIn result
      logger.debug("[login] signIn result", result);

      // If Cognito requires a new password, send user to change password flow
      // Amplify v6 returns nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD' when a new password is needed.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore – type defs outdated
      const needsNewPw =
        result?.nextStep?.signInStep ===
        "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED";
      if (needsNewPw) {
        navigate("/change-password", { state: { cognitoUser: result, email } });
        return;
      }

      const session = await currentSession();
      const idToken = session.tokens?.idToken?.toString();
      if (!idToken) throw new Error("No id token");
      login({ accessToken: idToken });
      navigate("/");
    } catch (err: unknown) {
      // DEBUG: log error details
      logger.error("[login] signIn error", err);
      if (err && typeof err === "object" && "message" in err) {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        setError(
          (err as { message?: string }).message || "Invalid credentials"
        );
      } else {
        setError("Invalid credentials");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-sm mx-auto mt-10 p-6 border rounded shadow-sm bg-white">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto mt-10 p-6 border rounded shadow-sm bg-white">
      <h1 className="text-2xl font-semibold mb-4">Login</h1>
      {error && <p className="mb-2 text-error text-sm font-medium">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            data-testid="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            data-testid="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" data-testid="login-submit" className="w-full">
          Sign in
        </Button>
      </form>
    </div>
  );
}
