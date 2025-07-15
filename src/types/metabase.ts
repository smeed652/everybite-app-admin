// Metabase API Types

export interface MetabaseUser {
  id: number;
  email: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  dateJoined: string;
  lastLogin: string | null;
  isActive: boolean;
  isSuperuser: boolean;
  isQbnewb: boolean;
  locale: string | null;
  ssoSource: string | null;
  updatedAt: string;
}

export interface MetabaseUsersResponse {
  users: MetabaseUser[];
  total: number;
  limit: number;
  offset: number;
}

// Dashboard metrics types
export interface DashboardMetrics {
  totalUsers: number;
  totalDashboards: number;
  totalQuestions: number;
  activeUsers: number;
  popularDashboards: MetabaseDashboard[];
}

export interface MetabaseDashboard {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  creator_id: number;
  creator: MetabaseUser;
  collection_id: number | null;
  parameters: Array<Record<string, unknown>>;
  cards: Array<Record<string, unknown>>;
}

export interface MetabaseDatabase {
  id: number;
  name: string;
  description: string | null;
  engine: string;
  is_sample: boolean;
  is_full_sync: boolean;
  is_on_demand: boolean;
  created_at: string;
  updated_at: string;
}

export interface MetabaseCollection {
  id: number;
  name: string;
  description: string | null;
  color: string;
  slug: string;
  parent_id: number | null;
  personal_owner_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface MetabaseQuestion {
  id: number;
  name: string;
  description: string | null;
  display: string;
  visualization_settings: Record<string, unknown>;
  dataset_query: Record<string, unknown>;
  collection_id: number | null;
  created_at: string;
  updated_at: string;
  creator_id: number;
  creator: MetabaseUser;
}

export interface MetabaseActivity {
  id: number;
  user_id: number;
  model: string;
  model_id: number;
  topic: string;
  details: Record<string, unknown>;
  timestamp: string;
  user: MetabaseUser;
}

export interface MetabaseSession {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  common_name: string;
  is_superuser: boolean;
  is_active: boolean;
}

// API Response types
export interface MetabaseApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}
