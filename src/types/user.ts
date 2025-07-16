export interface User {
  username: string;
  email: string;
  emailVerified: boolean;
  status: string;
  enabled: boolean;
  createdAt: string;
  lastModified: string;
}

export interface UsersResponse {
  users: User[];
  nextToken?: string;
}

export interface InviteUserRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export type UserAction = "enable" | "disable" | "reset-password" | "delete";
