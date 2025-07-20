import { gql } from "@apollo/client";

// GraphQL query for MetabaseUsers
export const METABASE_USERS_QUERY = gql`
  query MetabaseUsers($page: Int, $pageSize: Int) {
    metabaseUsers(page: $page, pageSize: $pageSize) {
      users {
        id
        email
        firstName
        lastName
        name
        dateJoined
        lastLogin
        isActive
        isSuperuser
        isQbnewb
        locale
        ssoSource
      }
      total
    }
  }
`;

// Service groups for organization
export const SERVICE_GROUPS = [
  {
    name: "dashboard",
    displayName: "Dashboard Analytics",
    operations: ["SmartMenuSettingsHybrid"],
  },
  {
    name: "users",
    displayName: "Metabase Users",
    operations: ["MetabaseUsers"],
  },
];
