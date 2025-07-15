import { useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { useAuth } from "../context/AuthContext";
import { completeNewPassword, currentSession } from "../lib/auth";

interface LocationState {
  cognitoUser: unknown; // object returned from Auth.signIn
  email: string;
}

export default function ChangePassword() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { login } = useAuth();
  const { cognitoUser, email } = (state || {}) as LocationState;

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  // If this page was hit directly without required state, bounce to login
  if (!cognitoUser) {
    navigate("/login");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      await completeNewPassword(cognitoUser, password);
      // Retrieve session + log user in
      const session = await currentSession();
      const idToken = session.tokens?.idToken?.toString();
      if (!idToken) throw new Error("No id token");
      login({ accessToken: idToken });
      toast.success("Password updated");
      navigate("/");
    } catch (err: unknown) {
      let message = "Failed to update password";
      if (
        err &&
        typeof err === "object" &&
        "message" in err &&
        typeof (err as { message?: unknown }).message === "string"
      ) {
        message = (err as { message: string }).message;
      }
      setError(message);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-10 p-6 border rounded shadow-sm bg-white">
      <h1 className="text-2xl font-semibold mb-4">Set New Password</h1>
      <p className="mb-4 text-sm text-gray-600">Account: {email}</p>
      {error && <p className="mb-2 text-error text-sm font-medium">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="confirm">Confirm Password</Label>
          <Input
            id="confirm"
            type="password"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full">
          Update Password
        </Button>
      </form>
    </div>
  );
}
