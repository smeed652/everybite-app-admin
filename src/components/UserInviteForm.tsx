import { useState } from "react";
import { InviteUserRequest } from "../types/user";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { useToast } from "./ui/ToastProvider";

interface UserInviteFormProps {
  onInvite: (userData: InviteUserRequest) => Promise<boolean>;
  onCancel: () => void;
}

export function UserInviteForm({ onInvite, onCancel }: UserInviteFormProps) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePassword, setInvitePassword] = useState("");
  const [inviteFirstName, setInviteFirstName] = useState("");
  const [inviteLastName, setInviteLastName] = useState("");
  const [inviting, setInviting] = useState(false);

  const { showToast } = useToast();

  const handleSubmit = async () => {
    if (!inviteEmail || !invitePassword) {
      showToast({
        title: "❌ Email and password are required",
        variant: "error",
      });
      return;
    }

    setInviting(true);
    try {
      const userData: InviteUserRequest = {
        email: inviteEmail,
        password: invitePassword,
        ...(inviteFirstName && { firstName: inviteFirstName }),
        ...(inviteLastName && { lastName: inviteLastName }),
      };

      const success = await onInvite(userData);
      if (success) {
        // Reset form
        setInviteEmail("");
        setInvitePassword("");
        setInviteFirstName("");
        setInviteLastName("");
        onCancel();
      }
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Invite New User</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          placeholder="Email"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          type="email"
        />
        <Input
          placeholder="Password"
          value={invitePassword}
          onChange={(e) => setInvitePassword(e.target.value)}
          type="password"
        />
        <Input
          placeholder="First Name (optional)"
          value={inviteFirstName}
          onChange={(e) => setInviteFirstName(e.target.value)}
        />
        <Input
          placeholder="Last Name (optional)"
          value={inviteLastName}
          onChange={(e) => setInviteLastName(e.target.value)}
        />
      </div>
      <div className="flex gap-2 mt-4">
        <Button onClick={handleSubmit} disabled={inviting}>
          {inviting ? "Inviting..." : "Invite User"}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
