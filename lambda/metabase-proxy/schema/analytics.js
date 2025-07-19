const analyticsSchema = `
  type DailyInteraction {
    date: String!
    count: Int!
  }

  type WidgetViewMetrics {
    totalVisits: Int!
    uniqueVisitors: Int!
    repeatedVisits: Int!
  }

  type WidgetAnalytics {
    views: WidgetViewMetrics!
    dailyInteractions: [DailyInteraction!]!
  }

  type QuarterlyMetrics {
    quarter: String!
    year: Int!
    quarterLabel: String!
    # Enhanced fields for dashboard
    brands: MetricWithGrowth!
    locations: MetricWithGrowth!
    orders: MetricWithGrowth!
    activeSmartMenus: MetricWithGrowth!
    totalRevenue: RevenueMetric
  }

  type MetricWithGrowth {
    count: Int!
    qoqGrowth: Int!
    qoqGrowthPercent: Float!
  }

  type RevenueMetric {
    amount: Float!
    qoqGrowth: Float!
    qoqGrowthPercent: Float!
  }

  type DailyOrders {
    date: String!
    count: Int!
  }

  type TotalMetrics {
    totalOrders: Int!
    totalDinerVisits: Int!
    startDate: String!
    endDate: String!
  }

  # New grouped analytics types
  type DashboardMetrics {
    quarterlyMetrics: [QuarterlyMetrics!]!
    widgetSummary: WidgetSummaryData!
    kpis: KPIData!
  }

  type WidgetSummaryData {
    totalWidgets: Int!
    activeWidgets: Int!
    totalLocations: Int!
    totalOrders: Int!
    averageOrdersPerWidget: Float!
  }

  type KPIData {
    totalRevenue: Float!
    totalDinerVisits: Int!
    averageOrderValue: Float!
    conversionRate: Float!
  }

  type DetailedAnalytics {
    dailyInteractions: [DailyInteraction!]!
    detailedWidgetAnalytics: [DetailedWidgetAnalyticsData!]!
    trends: TrendsData!
  }

  type DetailedWidgetAnalyticsData {
    widgetId: String!
    widgetName: String!
    totalVisits: Int!
    uniqueVisitors: Int!
    orders: Int!
    revenue: Float!
    conversionRate: Float!
  }

  type TrendsData {
    dailyOrders: [DailyOrders!]!
    weeklyGrowth: Float!
    monthlyGrowth: Float!
  }

  # Schema exploration types
  type TableInfo {
    tableName: String!
  }

  type ColumnInfo {
    columnName: String!
    dataType: String
    comment: String
  }

  type SampleRow {
    values: [String!]!
  }

  type SchemaExploration {
    tables: [TableInfo!]!
    widgetInteractionsColumns: [ColumnInfo!]!
    dbWidgetsColumns: [ColumnInfo!]!
    widgetInteractionsSample: [SampleRow!]!
    dbWidgetsSample: [SampleRow!]!
  }

  # Enhanced schema exploration types
  type ColumnMetadata {
    name: String!
    dataType: String
    isNullable: Boolean
    comment: String
    isPrimaryKey: Boolean
    isForeignKey: Boolean
  }

  type TableRelationship {
    targetTable: String!
    foreignKeyColumn: String!
    primaryKeyColumn: String!
  }

  type TableMetadata {
    columns: [ColumnMetadata!]!
    rowCount: Int
    relationships: [TableRelationship!]!
  }

  type DataVolume {
    rowCount: Int!
    estimatedSize: String
    lastUpdated: String
  }

  type ForeignKey {
    columnName: String!
    targetTable: String!
    targetColumn: String!
    relationshipType: String!
  }

  type ReferencedBy {
    sourceTable: String!
    sourceColumn: String!
    relationshipType: String!
  }

  type TableRelationships {
    foreignKeys: [ForeignKey!]!
    referencedBy: [ReferencedBy!]!
  }

  type SampleData {
    columns: [String!]!
    rows: [[String!]!]!
  }

  type LambdaInfo {
    version: String!
    gitCommit: String!
    deployTimestamp: String!
    environment: String!
    region: String!
    functionName: String!
    nodeVersion: String!
    memoryLimitInMB: String!
    apiKeySet: Boolean!
  }

  # Pagination support
  type PaginationInfo {
    total: Int!
    page: Int!
    pageSize: Int!
    totalPages: Int!
    hasNext: Boolean!
    hasPrevious: Boolean!
  }

  # Key table types with detailed column mapping
  type WidgetInteractions {
    eventTime: String!
    userId: String!
    amplitudeId: Int!
    location: String!
    widgetId: String!
    contextPageUrl: String!
    event: String!
    restaurantName: String!
    moreInfo: String!
    eventHour: String!
  }

  type DbWidgets {
    id: String!
    restaurantId: String!
    createdAt: String!
    updatedAt: String!
    deletedAt: String
    backgroundColor: String
    highlightColor: String
    name: String!
    primaryBrandColor: String
    displayImages: Boolean
    fontFamily: String
    displayFeedbackButton: Boolean
    displaySoftSignUp: Boolean
    publishedAt: String
    displayDishDetailsLink: Boolean
    displayGiveFeedbackBanner: Boolean
    displayNotifyMeBanner: Boolean
    layout: String
    isByoEnabled: Boolean
    isOrderButtonEnabled: Boolean
    supportedAllergens: [String]
    orderUrl: String
    numberOfLocations: Int
    numberOfLocationsSource: String
  }

  type DbOrders {
    id: String!
    dinerId: String!
    restaurantId: String!
    createdAt: String!
    updatedAt: String!
    status: String!
    totalAmount: Float
    currency: String
  }

  type DbDiners {
    id: String!
    email: String
    createdAt: String!
    updatedAt: String!
    firstName: String
    lastName: String
    phone: String
  }

  type Restaurants {
    id: String!
    name: String!
    createdAt: String!
    updatedAt: String!
    address: String
    city: String
    state: String
    zipCode: String
    phone: String
    website: String
  }

  type Dishes {
    id: String!
    restaurantId: String!
    name: String!
    description: String
    price: Float
    category: String
    createdAt: String!
    updatedAt: String!
  }

  # List types for pagination
  type WidgetInteractionsList {
    items: [WidgetInteractions!]!
    pagination: PaginationInfo!
  }

  type DbWidgetsList {
    items: [DbWidgets!]!
    pagination: PaginationInfo!
  }

  type DbOrdersList {
    items: [DbOrders!]!
    pagination: PaginationInfo!
  }

  type DbDinersList {
    items: [DbDiners!]!
    pagination: PaginationInfo!
  }

  type RestaurantsList {
    items: [Restaurants!]!
    pagination: PaginationInfo!
  }

  type DishesList {
    items: [Dishes!]!
    pagination: PaginationInfo!
  }

  # Filter input types
  input WidgetInteractionsFilter {
    eventTime: String
    eventTime_in: [String]
    eventTime_like: String
    userId: String
    userId_in: [String]
    userId_like: String
    amplitudeId: Int
    amplitudeId_in: [Int]
    location: String
    location_in: [String]
    location_like: String
    widgetId: String
    widgetId_in: [String]
    widgetId_like: String
    contextPageUrl: String
    contextPageUrl_in: [String]
    contextPageUrl_like: String
    event: String
    event_in: [String]
    event_like: String
    restaurantName: String
    restaurantName_in: [String]
    restaurantName_like: String
    moreInfo: String
    moreInfo_in: [String]
    moreInfo_like: String
    eventHour: String
    eventHour_in: [String]
    eventHour_like: String
    eventTime_gte: String
    eventTime_lte: String
    eventHour_gte: String
    eventHour_lte: String
    limit: Int
    offset: Int
  }

  input DbWidgetsFilter {
    id: String
    id_in: [String]
    id_like: String
    restaurantId: String
    restaurantId_in: [String]
    restaurantId_like: String
    createdAt: String
    createdAt_in: [String]
    createdAt_like: String
    updatedAt: String
    updatedAt_in: [String]
    updatedAt_like: String
    deletedAt: String
    deletedAt_in: [String]
    deletedAt_like: String
    backgroundColor: String
    backgroundColor_in: [String]
    backgroundColor_like: String
    highlightColor: String
    highlightColor_in: [String]
    highlightColor_like: String
    name: String
    name_in: [String]
    name_like: String
    primaryBrandColor: String
    primaryBrandColor_in: [String]
    primaryBrandColor_like: String
    displayImages: Boolean
    displayImages_in: [Boolean]
    fontFamily: String
    fontFamily_in: [String]
    fontFamily_like: String
    displayFeedbackButton: Boolean
    displayFeedbackButton_in: [Boolean]
    displaySoftSignUp: Boolean
    displaySoftSignUp_in: [Boolean]
    publishedAt: String
    publishedAt_in: [String]
    publishedAt_like: String
    displayDishDetailsLink: Boolean
    displayDishDetailsLink_in: [Boolean]
    displayGiveFeedbackBanner: Boolean
    displayGiveFeedbackBanner_in: [Boolean]
    displayNotifyMeBanner: Boolean
    displayNotifyMeBanner_in: [Boolean]
    layout: String
    layout_in: [String]
    layout_like: String
    isByoEnabled: Boolean
    isByoEnabled_in: [Boolean]
    isOrderButtonEnabled: Boolean
    isOrderButtonEnabled_in: [Boolean]
    orderUrl: String
    orderUrl_in: [String]
    orderUrl_like: String
    numberOfLocations: Int
    numberOfLocations_in: [Int]
    numberOfLocationsSource: String
    numberOfLocationsSource_in: [String]
    numberOfLocationsSource_like: String
    createdAt_gte: String
    createdAt_lte: String
    updatedAt_gte: String
    updatedAt_lte: String
    deletedAt_gte: String
    deletedAt_lte: String
    publishedAt_gte: String
    publishedAt_lte: String
    limit: Int
    offset: Int
  }

  input DbOrdersFilter {
    id: String
    id_in: [String]
    id_like: String
    dinerId: String
    dinerId_in: [String]
    dinerId_like: String
    restaurantId: String
    restaurantId_in: [String]
    restaurantId_like: String
    createdAt: String
    createdAt_in: [String]
    createdAt_like: String
    updatedAt: String
    updatedAt_in: [String]
    updatedAt_like: String
    status: String
    status_in: [String]
    status_like: String
    totalAmount: Float
    totalAmount_in: [Float]
    currency: String
    currency_in: [String]
    currency_like: String
    createdAt_gte: String
    createdAt_lte: String
    updatedAt_gte: String
    updatedAt_lte: String
    limit: Int
    offset: Int
  }

  input DbDinersFilter {
    id: String
    id_in: [String]
    id_like: String
    email: String
    email_in: [String]
    email_like: String
    createdAt: String
    createdAt_in: [String]
    createdAt_like: String
    updatedAt: String
    updatedAt_in: [String]
    updatedAt_like: String
    firstName: String
    firstName_in: [String]
    firstName_like: String
    lastName: String
    lastName_in: [String]
    lastName_like: String
    phone: String
    phone_in: [String]
    phone_like: String
    createdAt_gte: String
    createdAt_lte: String
    updatedAt_gte: String
    updatedAt_lte: String
    limit: Int
    offset: Int
  }

  input RestaurantsFilter {
    id: String
    id_in: [String]
    id_like: String
    name: String
    name_in: [String]
    name_like: String
    createdAt: String
    createdAt_in: [String]
    createdAt_like: String
    updatedAt: String
    updatedAt_in: [String]
    updatedAt_like: String
    address: String
    address_in: [String]
    address_like: String
    city: String
    city_in: [String]
    city_like: String
    state: String
    state_in: [String]
    state_like: String
    zipCode: String
    zipCode_in: [String]
    zipCode_like: String
    phone: String
    phone_in: [String]
    phone_like: String
    website: String
    website_in: [String]
    website_like: String
    createdAt_gte: String
    createdAt_lte: String
    updatedAt_gte: String
    updatedAt_lte: String
    limit: Int
    offset: Int
  }

  input DishesFilter {
    id: String
    id_in: [String]
    id_like: String
    restaurantId: String
    restaurantId_in: [String]
    restaurantId_like: String
    name: String
    name_in: [String]
    name_like: String
    description: String
    description_in: [String]
    description_like: String
    price: Float
    price_in: [Float]
    category: String
    category_in: [String]
    category_like: String
    createdAt: String
    createdAt_in: [String]
    createdAt_like: String
    updatedAt: String
    updatedAt_in: [String]
    updatedAt_like: String
    createdAt_gte: String
    createdAt_lte: String
    updatedAt_gte: String
    updatedAt_lte: String
    limit: Int
    offset: Int
  }

  input AnalyticsFilters {
    dateRange: String
    restaurantName: String
    widgetId: String
    contextPageUrl: String
    startDate: String
    endDate: String
  }

  # Metabase users types
  type MetabaseUser {
    id: Int!
    email: String!
    firstName: String
    lastName: String
    name: String
    dateJoined: String
    lastLogin: String
    isActive: Boolean!
    isSuperuser: Boolean!
    isQbnewb: Boolean!
    locale: String
    ssoSource: String
  }

  type MetabaseUsersResponse {
    users: [MetabaseUser!]!
    total: Int!
  }

  type Query {
    # New grouped analytics queries
    dashboardMetrics: DashboardMetrics!
    detailedAnalytics(filters: AnalyticsFilters): DetailedAnalytics!
    
    # Legacy individual queries (for backward compatibility)
    widgetAnalytics(filters: AnalyticsFilters): WidgetAnalytics!
    dailyInteractions(filters: AnalyticsFilters): [DailyInteraction!]!
    quarterlyMetrics(startQuarter: String, endQuarter: String): [QuarterlyMetrics!]!
    dailyOrders(startDate: String, endDate: String): [DailyOrders!]!
    totalMetrics(startDate: String!, endDate: String!): TotalMetrics!
    schemaExploration: SchemaExploration!
    info: LambdaInfo!
    
    # Enhanced schema exploration queries
    tableMetadata(tableName: String!): TableMetadata
    dataVolume(tableName: String!): DataVolume
    tableRelationships(tableName: String!): TableRelationships
    sampleData(tableName: String!, limit: Int): SampleData
    
    # Table-specific queries for key tables
    widget_interactions(id: ID!): WidgetInteractions
    widget_interactionsList(filter: WidgetInteractionsFilter): WidgetInteractionsList
    widget_interactionsCount(filter: WidgetInteractionsFilter): Int!
    
    db_widgets(id: ID!): DbWidgets
    db_widgetsList(filter: DbWidgetsFilter): DbWidgetsList
    db_widgetsCount(filter: DbWidgetsFilter): Int!
    
    db_orders(id: ID!): DbOrders
    db_ordersList(filter: DbOrdersFilter): DbOrdersList
    db_ordersCount(filter: DbOrdersFilter): Int!
    
    db_diners(id: ID!): DbDiners
    db_dinersList(filter: DbDinersFilter): DbDinersList
    db_dinersCount(filter: DbDinersFilter): Int!
    
    restaurants(id: ID!): Restaurants
    restaurantsList(filter: RestaurantsFilter): RestaurantsList
    restaurantsCount(filter: RestaurantsFilter): Int!
    
    dishes(id: ID!): Dishes
    dishesList(filter: DishesFilter): DishesList
    dishesCount(filter: DishesFilter): Int!

    # Metabase users queries
    metabaseUsers(page: Int, pageSize: Int): MetabaseUsersResponse!
  }
`;

module.exports = analyticsSchema;
