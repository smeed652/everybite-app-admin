const AWS = require("aws-sdk");

// Configuration
const REGION = "us-west-1";
const DATABASE = "everybite_analytics";
const OUTPUT_LOCATION = "s3://your-query-results-bucket/athena-results/";

// Initialize Athena client
const athena = new AWS.Athena({ region: REGION });

async function executeAthenaQuery(query, queryName) {
  console.log(`📋 Executing: ${queryName}`);
  console.log(`🔧 Query: ${query}`);
  console.log("");

  try {
    // Start query execution
    const startResponse = await athena
      .startQueryExecution({
        QueryString: query,
        QueryExecutionContext: {
          Database: DATABASE,
        },
        ResultConfiguration: {
          OutputLocation: OUTPUT_LOCATION,
        },
      })
      .promise();

    const queryExecutionId = startResponse.QueryExecutionId;
    console.log(`🚀 Query started with ID: ${queryExecutionId}`);

    // Wait for query to complete
    console.log("⏳ Waiting for query to complete...");
    let status = "RUNNING";
    while (status === "RUNNING" || status === "QUEUED") {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const statusResponse = await athena
        .getQueryExecution({
          QueryExecutionId: queryExecutionId,
        })
        .promise();

      status = statusResponse.QueryExecution.Status.State;
      console.log(`⏳ Status: ${status}`);

      if (status === "FAILED" || status === "CANCELLED") {
        console.log(`❌ Query failed with status: ${status}`);
        return null;
      }
    }

    console.log("✅ Query completed successfully");

    // Get results
    console.log("📊 Results:");
    console.log("----------------------------------------");

    const resultsResponse = await athena
      .getQueryResults({
        QueryExecutionId: queryExecutionId,
      })
      .promise();

    const rows = resultsResponse.ResultSet.Rows;

    // Display results in a table format
    if (rows && rows.length > 0) {
      rows.forEach((row, index) => {
        const values = row.Data.map((col) => col.VarCharValue || "NULL").join(
          " | "
        );
        console.log(`Row ${index + 1}: ${values}`);
      });
    } else {
      console.log("No results returned");
    }

    console.log("----------------------------------------");
    console.log("");

    return rows;
  } catch (error) {
    console.error(`❌ Error executing query "${queryName}":`, error.message);
    return null;
  }
}

async function exploreAthenaSchema() {
  console.log("🔍 Getting Athena schema using AWS SDK...");
  console.log(`📍 Region: ${REGION}`);
  console.log(`🗄️  Database: ${DATABASE}`);
  console.log("");

  // Check AWS credentials
  try {
    const sts = new AWS.STS();
    const identity = await sts.getCallerIdentity().promise();
    console.log(`🔐 AWS Identity: ${identity.Arn}`);
    console.log("");
  } catch (error) {
    console.error(
      '❌ AWS credentials not configured. Please run "aws configure" first.'
    );
    process.exit(1);
  }

  // Check if OUTPUT_LOCATION is configured
  if (OUTPUT_LOCATION === "s3://your-query-results-bucket/athena-results/") {
    console.error(
      "❌ Please update OUTPUT_LOCATION in the script with your S3 bucket"
    );
    console.log("Example: s3://my-athena-results-bucket/athena-results/");
    process.exit(1);
  }

  console.log("📋 SCHEMA EXPLORATION QUERIES");
  console.log("==============================");
  console.log("");

  // Execute schema queries
  const queries = [
    {
      query: `SHOW TABLES IN ${DATABASE}`,
      name: "List All Tables",
    },
    {
      query: `DESCRIBE ${DATABASE}.widget_interactions`,
      name: "Describe widget_interactions Table",
    },
    {
      query: `DESCRIBE ${DATABASE}.db_widgets`,
      name: "Describe db_widgets Table",
    },
    {
      query: `SELECT * FROM ${DATABASE}.widget_interactions LIMIT 3`,
      name: "Sample widget_interactions Data",
    },
    {
      query: `SELECT * FROM ${DATABASE}.db_widgets LIMIT 3`,
      name: "Sample db_widgets Data",
    },
    {
      query: `SELECT COUNT(*) as total_records FROM ${DATABASE}.widget_interactions`,
      name: "Total Records in widget_interactions",
    },
    {
      query: `SELECT COUNT(*) as total_records FROM ${DATABASE}.db_widgets`,
      name: "Total Records in db_widgets",
    },
    {
      query: `SELECT MIN(event_time) as earliest_date, MAX(event_time) as latest_date, COUNT(*) as total_records FROM ${DATABASE}.widget_interactions`,
      name: "Date Range in widget_interactions",
    },
  ];

  for (const queryInfo of queries) {
    await executeAthenaQuery(queryInfo.query, queryInfo.name);
  }

  console.log("✅ Schema exploration completed!");
  console.log("");
  console.log("💡 TIPS:");
  console.log("• Use these column names when creating new queries");
  console.log("• Check data types to ensure proper filtering");
  console.log("• Sample data shows the actual data format");
  console.log("• Date ranges help you understand available data periods");
}

// Run the exploration
exploreAthenaSchema().catch(console.error);
