import { MoreHorizontal } from "lucide-react";
import { User, UserAction } from "../types/user";
import { Button } from "./ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/DropdownMenu";

interface UserActionsProps {
  user: User;
  onAction: (action: UserAction, username: string) => void;
  onDelete: (username: string) => void;
  actionLoading: string | null;
}

export function UserActions({
  user,
  onAction,
  onDelete,
  actionLoading,
}: UserActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {user.enabled ? (
          <DropdownMenuItem
            onClick={() => onAction("disable", user.username)}
            disabled={actionLoading === `disable-${user.username}`}
          >
            {actionLoading === `disable-${user.username}`
              ? "Disabling..."
              : "Disable"}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => onAction("enable", user.username)}
            disabled={actionLoading === `enable-${user.username}`}
          >
            {actionLoading === `enable-${user.username}`
              ? "Enabling..."
              : "Enable"}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => onAction("reset-password", user.username)}
          disabled={actionLoading === `reset-password-${user.username}`}
        >
          {actionLoading === `reset-password-${user.username}`
            ? "Resetting..."
            : "Reset Password"}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDelete(user.username)}
          disabled={actionLoading === `delete-${user.username}`}
          className="text-red-600"
        >
          {actionLoading === `delete-${user.username}`
            ? "Deleting..."
            : "Delete"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
