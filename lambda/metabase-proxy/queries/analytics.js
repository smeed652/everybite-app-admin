// Analytics queries for Athena via Metabase
const analyticsQueries = {
  // New grouped analytics queries
  dashboardMetrics: {
    database: 2,
    type: "native",
    native: {
      query: `
        WITH quarterly_data AS (
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
            AND published_at >= '2024-03-27'
          GROUP BY date_trunc('quarter', published_at)
        ),
        widget_summary AS (
          SELECT
            COUNT(*) AS total_widgets,
            COUNT(CASE WHEN published_at IS NOT NULL THEN 1 END) AS active_widgets,
            SUM(number_of_locations) AS total_locations,
            (SELECT COUNT(*) FROM everybite_analytics.widget_interactions WHERE event = 'order item clicked') AS total_orders
          FROM everybite_analytics.db_widgets
        ),
        kpi_data AS (
          SELECT
            SUM(total_amount) AS total_revenue,
            COUNT(DISTINCT diner_id) AS total_diner_visits,
            AVG(total_amount) AS average_order_value,
            COUNT(*) AS total_orders
          FROM everybite_analytics.db_orders
          WHERE status = 'completed'
        )
        SELECT
          'quarterly_metrics' AS data_type,
          COALESCE(i.quarter, w.quarter) AS quarter,
          COALESCE(i.total_orders, 0) AS total_orders,
          COALESCE(w.active_smartmenus, 0) AS active_smartmenus,
          COALESCE(w.brands, 0) AS brands,
          COALESCE(w.total_locations, 0) AS total_locations
        FROM quarterly_data i
        FULL OUTER JOIN quarterly_widgets w ON i.quarter = w.quarter
        UNION ALL
        SELECT
          'widget_summary' AS data_type,
          NULL AS quarter,
          ws.total_orders,
          ws.active_widgets,
          ws.total_widgets,
          ws.total_locations
        FROM widget_summary ws
        UNION ALL
        SELECT
          'kpi_data' AS data_type,
          NULL AS quarter,
          kd.total_orders,
          kd.total_diner_visits,
          kd.total_revenue,
          kd.average_order_value
        FROM kpi_data kd
        ORDER BY data_type, quarter DESC
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
            AND published_at >= '2024-03-27'
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
};

module.exports = analyticsQueries;
