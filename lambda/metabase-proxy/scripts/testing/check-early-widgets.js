#!/usr/bin/env node

/**
 * Check for widgets with early published_at dates
 *
 * This script identifies widgets that might have incorrect published_at dates
 * before the actual launch date of 3/27/24.
 */

const { defaultClient } = require("../utils/test-helpers");

async function checkEarlyWidgets() {
  console.log("🔍 Checking for widgets with early published_at dates");
  console.log("=====================================================\n");

  try {
    // Query to get all widgets with their published_at dates
    const query = `
      query GetWidgetsWithDates {
        db_widgets {
          id
          name
          published_at
          created_at
          number_of_locations
        }
      }
    `;

    console.log("📊 Querying widgets...");
    const response = await defaultClient.query(query);

    if (response.data?.db_widgets) {
      const widgets = response.data.db_widgets;
      console.log(`✅ Found ${widgets.length} total widgets\n`);

      // Filter widgets published before 3/27/24
      const launchDate = new Date("2024-03-27");
      const earlyWidgets = widgets.filter((widget) => {
        if (!widget.published_at) return false;
        const publishedAt = new Date(widget.published_at);
        return publishedAt < launchDate;
      });

      if (earlyWidgets.length > 0) {
        console.log("⚠️  WARNING: Found widgets published before 3/27/24:");
        console.log("=".repeat(80));

        earlyWidgets.forEach((widget) => {
          const publishedAt = new Date(widget.published_at);
          const createdAt = new Date(widget.created_at);
          console.log(`\nWidget: ${widget.name}`);
          console.log(`  ID: ${widget.id}`);
          console.log(
            `  Published: ${publishedAt.toISOString().split("T")[0]} (${publishedAt.toDateString()})`
          );
          console.log(
            `  Created: ${createdAt.toISOString().split("T")[0]} (${createdAt.toDateString()})`
          );
          console.log(`  Locations: ${widget.number_of_locations}`);
        });

        console.log(
          `\n📊 Summary: ${earlyWidgets.length} widgets with early published dates`
        );
        console.log(
          "These widgets are causing incorrect quarterly metrics for Q1 2024."
        );
      } else {
        console.log("✅ No widgets found with published dates before 3/27/24");
      }

      // Show all published widgets for context
      const publishedWidgets = widgets.filter((w) => w.published_at);
      console.log(`\n📋 All published widgets (${publishedWidgets.length}):`);
      console.log("=".repeat(80));

      publishedWidgets
        .sort((a, b) => new Date(a.published_at) - new Date(b.published_at))
        .forEach((widget) => {
          const publishedAt = new Date(widget.published_at);
          console.log(
            `${publishedAt.toISOString().split("T")[0]}: ${widget.name} (${widget.number_of_locations} locations)`
          );
        });
    } else {
      console.log("❌ No widgets data returned");
      console.log("Response:", JSON.stringify(response, null, 2));
    }
  } catch (error) {
    console.log("❌ Check early widgets failed");
    console.error("Error:", error.message);
    process.exit(1);
  }
}

// Run the check
checkEarlyWidgets();
