const axios = require("axios");

const LAMBDA_URL =
  "https://ldfubm7l7k2hj4ln3pxtqylcwe0isjau.lambda-url.us-west-1.on.aws";
const API_KEY = "3SB3ZawcNr3AT11vxKruJ";

async function inspectWidgets() {
  console.log("🔍 Inspecting Widget Data (created_at vs published_at)...\n");

  const headers = {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
  };

  try {
    const query = {
      query: `
        query InspectWidgets {
          dbWidgetsList(filter: { limit: 100 }) {
            items {
              id
              name
              createdAt
              publishedAt
              numberOfLocations
            }
            pagination {
              total
            }
          }
        }
      `,
    };

    const response = await axios.post(`${LAMBDA_URL}/graphql`, query, {
      headers,
    });

    console.log("✅ Widget Data Response:");
    console.log("Full response:", JSON.stringify(response.data, null, 2));
    const widgets = response.data.data?.dbWidgetsList?.items || [];

    if (widgets.length === 0) {
      console.log("No widgets found");
      return;
    }

    console.log(`Found ${widgets.length} widgets\n`);

    // Sort by published_at date
    const sortedWidgets = widgets
      .filter((w) => w.publishedAt) // Only show published widgets
      .sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt));

    console.log("📊 First 10 Published Widgets (by published_at):");
    console.log("=".repeat(100));
    console.log(
      "ID".padEnd(40) +
        "Name".padEnd(30) +
        "Created".padEnd(20) +
        "Published".padEnd(20) +
        "Locations"
    );
    console.log("=".repeat(100));

    sortedWidgets.slice(0, 10).forEach((widget) => {
      const created = new Date(widget.createdAt).toLocaleDateString();
      const published = new Date(widget.publishedAt).toLocaleDateString();
      const name = (widget.name || "Unnamed").substring(0, 28);

      console.log(
        widget.id.padEnd(40) +
          name.padEnd(30) +
          created.padEnd(20) +
          published.padEnd(20) +
          (widget.numberOfLocations || 0)
      );
    });

    // Check for widgets with early published dates
    const launchDate = new Date("2024-03-27");
    const earlyWidgets = sortedWidgets.filter(
      (w) => new Date(w.publishedAt) < launchDate
    );

    if (earlyWidgets.length > 0) {
      console.log(
        `\n⚠️  Found ${earlyWidgets.length} widgets with published_at before launch date (3/27/24):`
      );
      earlyWidgets.forEach((w) => {
        console.log(
          `  - ${w.name || w.id}: published ${new Date(w.publishedAt).toLocaleDateString()}`
        );
      });
    }

    // Check quarterly distribution
    console.log("\n📈 Quarterly Distribution (by published_at):");
    const quarters = {};

    sortedWidgets.forEach((widget) => {
      const publishedDate = new Date(widget.publishedAt);
      const year = publishedDate.getFullYear();
      const month = publishedDate.getMonth();
      const quarter = Math.floor(month / 3) + 1;
      const quarterKey = `Q${quarter} ${year}`;

      if (!quarters[quarterKey]) {
        quarters[quarterKey] = {
          count: 0,
          totalLocations: 0,
          widgets: [],
        };
      }

      quarters[quarterKey].count++;
      quarters[quarterKey].totalLocations += widget.numberOfLocations || 0;
      quarters[quarterKey].widgets.push(widget);
    });

    Object.keys(quarters)
      .sort()
      .forEach((quarter) => {
        const data = quarters[quarter];
        console.log(
          `  ${quarter}: ${data.count} widgets, ${data.totalLocations} locations`
        );
      });

    // Check for unpublished widgets
    const unpublishedWidgets = widgets.filter((w) => !w.publishedAt);
    if (unpublishedWidgets.length > 0) {
      console.log(
        `\n📝 Found ${unpublishedWidgets.length} unpublished widgets`
      );
    }
  } catch (error) {
    console.error("❌ Widget Inspection Error:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("Error:", error.message);
    }
  }
}

inspectWidgets();
