// Metabase API queries for user management and system info
const metabaseQueries = {
  // Get dashboard overview metrics
  dashboard: async (fetchMetabase) => {
    const [users, dashboards, questions] = await Promise.all([
      fetchMetabase("/api/user"),
      fetchMetabase("/api/dashboard"),
      fetchMetabase("/api/card"),
    ]);

    const activeUsers = users.data.filter((u) => u.is_active).length;
    const popularDashboards = dashboards.slice(0, 5);

    return {
      totalUsers: users.data.length,
      totalDashboards: dashboards.length,
      totalQuestions: questions.length,
      activeUsers,
      popularDashboards,
    };
  },

  // Get users data
  users: async (fetchMetabase) => {
    const users = await fetchMetabase("/api/user");

    const transformedUsers = users.data.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.common_name,
      firstName: user.first_name,
      lastName: user.last_name,
      dateJoined: user.date_joined,
      lastLogin: user.last_login,
      isActive: user.is_active,
      isSuperuser: user.is_superuser,
      isQbnewb: user.is_qbnewb,
      locale: user.locale,
      ssoSource: user.sso_source,
      updatedAt: user.updated_at,
    }));

    return {
      users: transformedUsers,
      total: users.total,
      limit: users.limit,
      offset: users.offset,
    };
  },
};

module.exports = metabaseQueries;
