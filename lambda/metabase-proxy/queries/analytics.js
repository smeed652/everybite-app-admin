// Analytics queries for Athena via Metabase
const analyticsQueries = {
  // Dashboard metrics query - returns calculated metrics directly
  dashboardMetrics: {
    database: 2,
    type: "native",
    native: {
      query: `
        SELECT
          COUNT(*) AS total_widgets,
          COUNT(CASE WHEN published_at IS NOT NULL THEN 1 END) AS active_widgets,
          SUM(CASE WHEN published_at IS NOT NULL THEN number_of_locations ELSE 0 END) AS total_locations,
          (SELECT COUNT(*) FROM everybite_analytics.widget_interactions WHERE event = 'order item clicked') AS total_orders
        FROM everybite_analytics.db_widgets
      `,
    },
  },

  detailedAnalytics: {
    database: 2,
    type: "native",
    native: {
      query: `
        WITH daily_interactions AS (
          SELECT
            date_trunc('day', event_time) AS day,
            COUNT(*) AS interactions
          FROM everybite_analytics.widget_interactions
          WHERE event_time >= current_date - INTERVAL '30 days'
          GROUP BY date_trunc('day', event_time)
          ORDER BY day
        ),
        widget_analytics AS (
          SELECT
            w.id AS widget_id,
            w.name AS widget_name,
            COUNT(i.session_id) AS total_visits,
            COUNT(DISTINCT i.session_id) AS unique_visitors,
            COUNT(CASE WHEN i.event = 'order item clicked' THEN 1 END) AS orders,
            SUM(CASE WHEN i.event = 'order item clicked' THEN 1 ELSE 0 END) AS revenue
          FROM everybite_analytics.db_widgets w
          LEFT JOIN everybite_analytics.widget_interactions i ON w.id = i.widget_id
          WHERE w.published_at IS NOT NULL
          GROUP BY w.id, w.name
        ),
        trends_data AS (
          SELECT
            date_trunc('day', event_time) AS day,
            COUNT(*) AS orders
          FROM everybite_analytics.widget_interactions
          WHERE event = 'order item clicked'
            AND event_time >= current_date - INTERVAL '30 days'
          GROUP BY date_trunc('day', event_time)
          ORDER BY day
        )
        SELECT
          'daily_interactions' AS data_type,
          di.day AS date,
          di.interactions AS count,
          NULL AS widget_id,
          NULL AS widget_name,
          NULL AS total_visits,
          NULL AS unique_visitors,
          NULL AS orders,
          NULL AS revenue
        FROM daily_interactions di
        UNION ALL
        SELECT
          'widget_analytics' AS data_type,
          NULL AS date,
          NULL AS count,
          wa.widget_id,
          wa.widget_name,
          wa.total_visits,
          wa.unique_visitors,
          wa.orders,
          wa.revenue
        FROM widget_analytics wa
        UNION ALL
        SELECT
          'trends_data' AS data_type,
          td.day AS date,
          td.orders AS count,
          NULL AS widget_id,
          NULL AS widget_name,
          NULL AS total_visits,
          NULL AS unique_visitors,
          NULL AS orders,
          NULL AS revenue
        FROM trends_data td
        ORDER BY data_type, date DESC, widget_name
      `,
    },
  },

  // Get total orders per quarter
  ordersPerQuarter: {
    database: 2,
    type: "native",
    native: {
      query: `
        SELECT
          date_trunc('quarter', event_time) AS quarter,
          COUNT(*) AS total_orders
        FROM everybite_analytics.widget_interactions
        WHERE event = 'order item clicked'
        GROUP BY date_trunc('quarter', event_time)
        ORDER BY date_trunc('quarter', event_time)
      `,
    },
  },

  // Feature adoption analytics query
  featureAdoption: {
    database: 2,
    type: "native",
    native: {
      query: `
        SELECT
          COUNT(*) AS total_active,
          COUNT(CASE WHEN display_images = true THEN 1 END) AS with_images,
          COUNT(CASE WHEN layout = 'CARD' THEN 1 END) AS with_card_layout,
          COUNT(CASE WHEN is_order_button_enabled = true THEN 1 END) AS with_ordering,
          COUNT(CASE WHEN is_byo_enabled = true THEN 1 END) AS with_byo
        FROM everybite_analytics.db_widgets
        WHERE published_at IS NOT NULL
      `,
    },
  },

  // Retention analytics query
  retentionAnalytics: {
    database: 2,
    type: "native",
    native: {
      query: `
        WITH user_orders AS (
          SELECT
            user_id,
            widget_id,
            event_time,
            ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY event_time) AS order_sequence
          FROM everybite_analytics.widget_interactions
          WHERE event = 'order item clicked'
        ),
        retention_cohorts AS (
          SELECT
            date_trunc('month', MIN(event_time)) AS cohort_month,
            COUNT(DISTINCT user_id) AS cohort_size,
            COUNT(DISTINCT CASE WHEN order_sequence = 1 THEN user_id END) AS first_time_users,
            COUNT(DISTINCT CASE WHEN order_sequence > 1 THEN user_id END) AS returning_users
          FROM user_orders
          GROUP BY date_trunc('month', event_time)
        )
        SELECT
          cohort_month,
          cohort_size,
          first_time_users,
          returning_users,
          CASE 
            WHEN cohort_size > 0 THEN 
              ROUND((returning_users::float / cohort_size) * 100, 2)
            ELSE 0 
          END AS retention_rate
        FROM retention_cohorts
        ORDER BY cohort_month DESC
        LIMIT 12
      `,
    },
  },

  // Activation insights query
  activationInsights: {
    database: 2,
    type: "native",
    native: {
      query: `
        WITH widget_activation AS (
          SELECT
            id,
            name,
            published_at,
            number_of_locations,
            CASE 
              WHEN published_at IS NOT NULL THEN 'activated'
              ELSE 'inactive'
            END AS status
          FROM everybite_analytics.db_widgets
        ),
        activation_stats AS (
          SELECT
            status,
            COUNT(*) AS count,
            AVG(number_of_locations) AS avg_locations
          FROM widget_activation
          GROUP BY status
        ),
        recent_activations AS (
          SELECT
            date_trunc('week', published_at) AS week,
            COUNT(*) AS activations
          FROM widget_activation
          WHERE published_at IS NOT NULL
            AND published_at >= CURRENT_DATE - INTERVAL '8 weeks'
          GROUP BY date_trunc('week', published_at)
          ORDER BY week DESC
        )
        SELECT
          'activation_stats' AS data_type,
          status,
          count,
          avg_locations
        FROM activation_stats
        UNION ALL
        SELECT
          'recent_activations' AS data_type,
          week::text,
          activations,
          0
        FROM recent_activations
      `,
    },
  },

  // Daily orders trends query
  dailyOrdersTrends: {
    database: 2,
    type: "native",
    native: {
      query: `
        SELECT
          date_trunc('day', event_time) AS day,
          COUNT(*) AS total_orders,
          COUNT(DISTINCT widget_id) AS active_widgets,
          COUNT(DISTINCT user_id) AS unique_users
        FROM everybite_analytics.widget_interactions
        WHERE event = 'order item clicked'
        GROUP BY date_trunc('day', event_time)
        ORDER BY day DESC
        LIMIT 30
      `,
    },
  },

  // Monthly growth query for trend analysis
  monthlyGrowth: {
    database: 2,
    type: "native",
    native: {
      query: `
        WITH monthly_orders AS (
          SELECT
            date_trunc('month', event_time) AS month,
            COUNT(*) AS total_orders,
            COUNT(DISTINCT widget_id) AS active_widgets
          FROM everybite_analytics.widget_interactions
          WHERE event = 'order item clicked'
          GROUP BY date_trunc('month', event_time)
        ),
        monthly_widgets AS (
          SELECT
            date_trunc('month', published_at) AS month,
            COUNT(DISTINCT id) AS new_widgets,
            COUNT(DISTINCT name) AS new_brands
          FROM everybite_analytics.db_widgets
          WHERE published_at IS NOT NULL
          GROUP BY date_trunc('month', published_at)
        )
        SELECT
          COALESCE(mo.month, mw.month) AS month,
          COALESCE(mo.total_orders, 0) AS total_orders,
          COALESCE(mo.active_widgets, 0) AS active_widgets,
          COALESCE(mw.new_widgets, 0) AS new_widgets,
          COALESCE(mw.new_brands, 0) AS new_brands
        FROM monthly_orders mo
        FULL OUTER JOIN monthly_widgets mw ON mo.month = mw.month
        ORDER BY month DESC
        LIMIT 12
      `,
    },
  },

  // Quarterly trends query for time-based analysis
  quarterlyTrends: {
    database: 2,
    type: "native",
    native: {
      query: `
        WITH quarterly_orders AS (
          SELECT
            date_trunc('quarter', event_time) AS quarter,
            COUNT(*) AS total_orders,
            COUNT(DISTINCT widget_id) AS active_widgets
          FROM everybite_analytics.widget_interactions
          WHERE event = 'order item clicked'
          GROUP BY date_trunc('quarter', event_time)
        ),
        quarterly_widgets AS (
          SELECT
            date_trunc('quarter', published_at) AS quarter,
            COUNT(DISTINCT id) AS new_widgets,
            COUNT(DISTINCT name) AS new_brands,
            SUM(number_of_locations) AS new_locations
          FROM everybite_analytics.db_widgets
          WHERE published_at IS NOT NULL
          GROUP BY date_trunc('quarter', published_at)
        )
        SELECT
          COALESCE(qo.quarter, qw.quarter) AS quarter,
          COALESCE(qo.total_orders, 0) AS total_orders,
          COALESCE(qo.active_widgets, 0) AS active_widgets,
          COALESCE(qw.new_widgets, 0) AS new_widgets,
          COALESCE(qw.new_brands, 0) AS new_brands,
          COALESCE(qw.new_locations, 0) AS new_locations
        FROM quarterly_orders qo
        FULL OUTER JOIN quarterly_widgets qw ON qo.quarter = qw.quarter
        ORDER BY quarter DESC
      `,
    },
  },

  // Get comprehensive quarterly metrics (orders, brands, locations)
  quarterlyMetrics: {
    database: 2,
    type: "native",
    native: {
      query: `
        WITH quarterly_interactions AS (
          SELECT
            date_trunc('quarter', event_time) AS quarter,
            COUNT(*) AS total_orders
          FROM everybite_analytics.widget_interactions
          WHERE event = 'order item clicked'
          GROUP BY date_trunc('quarter', event_time)
        ),
        quarterly_widgets AS (
          SELECT
            date_trunc('quarter', published_at) AS quarter,
            COUNT(DISTINCT id) AS active_smartmenus,
            COUNT(DISTINCT name) AS brands,
            SUM(number_of_locations) AS total_locations
          FROM everybite_analytics.db_widgets
          WHERE published_at IS NOT NULL
            AND published_at >= TIMESTAMP '2024-03-27 00:00:00'
          GROUP BY date_trunc('quarter', published_at)
        )
        SELECT
          COALESCE(i.quarter, w.quarter) AS quarter,
          COALESCE(i.total_orders, 0) AS total_orders,
          COALESCE(w.active_smartmenus, 0) AS active_smartmenus,
          COALESCE(w.brands, 0) AS brands,
          COALESCE(w.total_locations, 0) AS total_locations
        FROM quarterly_interactions i
        FULL OUTER JOIN quarterly_widgets w ON i.quarter = w.quarter
        ORDER BY quarter DESC
        LIMIT 8
      `,
    },
  },

  // Get total orders count
  totalOrders: {
    database: 2,
    type: "native",
    native: {
      query: `
        SELECT COUNT(*) as total_orders 
        FROM everybite_analytics.widget_interactions 
        WHERE event = 'order item clicked'
        LIMIT 1
      `,
    },
  },

  // Get total metrics between two dates (orders and diner visits)
  totalMetrics: {
    database: 2,
    type: "native",
    native: {
      query: `
        SELECT
          COUNT(*) AS total_orders,
          COUNT(DISTINCT session_id) AS total_diner_visits
        FROM everybite_analytics.widget_interactions
        WHERE event = 'order item clicked'
          AND event_time >= CAST('{{startDate}}' AS timestamp)
          AND event_time <= CAST('{{endDate}}' AS timestamp)
      `,
    },
  },

  // Schema exploration queries
  listTables: {
    database: 2,
    type: "native",
    native: {
      query: `
        SHOW TABLES IN everybite_analytics
      `,
    },
  },

  describeWidgetInteractions: {
    database: 2,
    type: "native",
    native: {
      query: `
        DESCRIBE everybite_analytics.widget_interactions
      `,
    },
  },

  describeDbWidgets: {
    database: 2,
    type: "native",
    native: {
      query: `
        DESCRIBE everybite_analytics.db_widgets
      `,
    },
  },

  sampleWidgetInteractions: {
    database: 2,
    type: "native",
    native: {
      query: `
        SELECT *
        FROM everybite_analytics.widget_interactions
        LIMIT 5
      `,
    },
  },

  sampleDbWidgets: {
    database: 2,
    type: "native",
    native: {
      query: `
        SELECT *
        FROM everybite_analytics.db_widgets
        LIMIT 5
      `,
    },
  },

  // Get orders analytics with filters
  ordersAnalyticsFiltered: (filters = {}) => {
    const { event_time, widget_id, restaurant_name } = filters;

    let whereClause = `1 = 1`;

    if (event_time) {
      whereClause += ` AND "everybite_analytics"."widget_interactions"."event_time" >= '${event_time}'`;
    }
    if (widget_id) {
      whereClause += ` AND "everybite_analytics"."widget_interactions"."widget_id" = '${widget_id}'`;
    }
    if (restaurant_name) {
      whereClause += ` AND "everybite_analytics"."db_widgets"."name" ILIKE '%${restaurant_name}%'`;
    }

    return {
      database: 2,
      type: "native",
      native: {
        query: `
          SELECT
            "everybite_analytics"."db_widgets"."name" AS "Db Widgets - Widget__name",
            COUNT(distinct session_id) AS "count"
          FROM
            "everybite_analytics"."widget_interactions"
          LEFT JOIN "everybite_analytics"."db_widgets" ON "everybite_analytics"."widget_interactions"."widget_id" = "everybite_analytics"."db_widgets"."id"
          WHERE
            ${whereClause}
          GROUP BY
            "everybite_analytics"."db_widgets"."name"
          ORDER BY
            "everybite_analytics"."db_widgets"."name" ASC
        `,
      },
    };
  },

  // Get widget performance metrics
  widgetPerformance: {
    database: 2,
    type: "native",
    native: {
      query: `
        SELECT
          w.name AS widget_name,
          w.name AS brand_name,
          w.number_of_locations,
          w.published_at,
          COUNT(i.session_id) AS total_orders,
          COUNT(DISTINCT i.session_id) AS unique_sessions
        FROM everybite_analytics.db_widgets w
        LEFT JOIN everybite_analytics.widget_interactions i ON w.id = i.widget_id
        WHERE w.published_at IS NOT NULL
        GROUP BY w.id, w.name, w.number_of_locations, w.published_at
        ORDER BY total_orders DESC
      `,
    },
  },

  // Get daily orders trend
  dailyOrdersTrend: {
    database: 2,
    type: "native",
    native: {
      query: `
        SELECT
          date_trunc('day', event_time) AS day,
          COUNT(*) AS orders
        FROM everybite_analytics.widget_interactions
        WHERE event_time >= current_date - INTERVAL '1 year'
        GROUP BY date_trunc('day', event_time)
        ORDER BY day
      `,
    },
  },

  // Unified SmartMenu Analytics - combines widget data with analytics
  smartMenuAnalytics: {
    database: 2,
    type: "native",
    native: {
      query: `
        WITH widget_analytics AS (
          SELECT
            w.id,
            w.name,
            w.slug,
            w.layout,
            w.display_images,
            w.is_order_button_enabled,
            w.is_byo_enabled,
            w.primary_brand_color,
            w.highlight_color,
            w.background_color,
            w.order_url,
            w.updated_at,
            w.published_at,
            w.is_sync_enabled,
            w.number_of_locations,
            -- Analytics from data warehouse
            COUNT(CASE WHEN wi.event = 'order item clicked' THEN 1 END) AS total_orders,
            COUNT(CASE WHEN wi.event = 'order item clicked' AND wi.event_time >= NOW() - INTERVAL '30 days' THEN 1 END) AS recent_orders,
            COUNT(CASE WHEN wi.event = 'order item clicked' AND wi.event_time >= NOW() - INTERVAL '60 days' AND wi.event_time < NOW() - INTERVAL '30 days' THEN 1 END) AS previous_period_orders,
            COUNT(DISTINCT CASE WHEN wi.event = 'order item clicked' THEN DATE(wi.event_time) END) AS active_days,
            MAX(CASE WHEN wi.event = 'order item clicked' THEN wi.event_time END) AS last_order_date,
            COUNT(DISTINCT CASE WHEN wi.event = 'widget viewed' THEN wi.session_id END) AS total_sessions,
            -- Feature usage indicators
            CASE WHEN w.display_images THEN 1 ELSE 0 END AS has_images,
            CASE WHEN w.is_order_button_enabled THEN 1 ELSE 0 END AS has_ordering,
            CASE WHEN w.is_byo_enabled THEN 1 ELSE 0 END AS has_byo,
            CASE WHEN w.layout = 'card' THEN 1 ELSE 0 END AS uses_card_layout
          FROM everybite_analytics.db_widgets w
          LEFT JOIN everybite_analytics.widget_interactions wi ON w.id = wi.widget_id
          GROUP BY 
            w.id, w.name, w.slug, w.layout, w.display_images, 
            w.is_order_button_enabled, w.is_byo_enabled, w.primary_brand_color,
            w.highlight_color, w.background_color, w.order_url, w.updated_at,
            w.published_at, w.is_sync_enabled, w.number_of_locations
        )
        SELECT
          id,
          name,
          slug,
          layout,
          display_images,
          is_order_button_enabled,
          is_byo_enabled,
          primary_brand_color,
          highlight_color,
          background_color,
          order_url,
          updated_at,
          published_at,
          is_sync_enabled,
          number_of_locations,
          -- Analytics
          total_orders,
          recent_orders,
          previous_period_orders,
          active_days,
          last_order_date,
          total_sessions,
          -- Calculated metrics
          CASE 
            WHEN previous_period_orders > 0 THEN 
              ROUND(((recent_orders - previous_period_orders)::DECIMAL / previous_period_orders) * 100, 2)
            ELSE 0 
          END AS order_growth_percent,
          CASE 
            WHEN total_sessions > 0 THEN 
              ROUND((total_orders::DECIMAL / total_sessions) * 100, 2)
            ELSE 0 
          END AS conversion_rate,
          -- Feature usage
          has_images,
          has_ordering,
          has_byo,
          uses_card_layout,
          -- Status indicators
          CASE WHEN published_at IS NOT NULL THEN 'active' ELSE 'inactive' END AS status,
          CASE WHEN last_order_date >= NOW() - INTERVAL '7 days' THEN 'recent' 
               WHEN last_order_date >= NOW() - INTERVAL '30 days' THEN 'active'
               WHEN last_order_date IS NOT NULL THEN 'stale'
               ELSE 'no_orders' END AS activity_status
        FROM widget_analytics
        ORDER BY total_orders DESC, name ASC
      `,
    },
  },
};

module.exports = analyticsQueries;
