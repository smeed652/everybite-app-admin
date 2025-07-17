#!/usr/bin/env node
/* eslint-disable */
const fs = require("fs");
const { GraphQLClient, gql } = require("graphql-request");
const { format, startOfQuarter } = require("date-fns");

const API_URL =
  process.env.GRAPHQL_API_URL || "https://api.everybite.com/graphql";
const API_KEY = process.env.GRAPHQL_API_KEY || "3SB3ZawcNr3AT11vxKruJ";

const client = new GraphQLClient(API_URL, {
  headers: {
    Authorization: API_KEY,
  },
});

const QUERY = gql`
  query GetAllWidgets {
    widgets {
      id
      name
      createdAt
      publishedAt
      numberOfLocations
    }
  }
`;

function getPublishedQuarter(publishedAt) {
  if (!publishedAt) return "";
  const date = new Date(publishedAt);
  const quarterStart = startOfQuarter(date);
  return format(quarterStart, "QQQ yyyy");
}

// Simple CSV escaping function
function escapeCsvField(field) {
  if (field === null || field === undefined) return "";
  const stringField = String(field);
  // If field contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (
    stringField.includes(",") ||
    stringField.includes('"') ||
    stringField.includes("\n")
  ) {
    return '"' + stringField.replace(/"/g, '""') + '"';
  }
  return stringField;
}

async function main() {
  try {
    const data = await client.request(QUERY);
    const widgets = data.widgets.filter((w) => w.publishedAt);

    const headers = [
      "id",
      "name",
      "createdAt",
      "publishedAt",
      "numberOfLocations",
      "publishedQuarter",
    ];
    const csvRows = [
      headers.join(","),
      ...widgets.map((w) =>
        [
          escapeCsvField(w.id),
          escapeCsvField(w.name || ""),
          escapeCsvField(w.createdAt),
          escapeCsvField(w.publishedAt),
          escapeCsvField(w.numberOfLocations ?? ""),
          escapeCsvField(getPublishedQuarter(w.publishedAt)),
        ].join(",")
      ),
    ];

    fs.writeFileSync("smartmenu_quarterly_raw.csv", csvRows.join("\n"));
    console.log(
      "Exported",
      widgets.length,
      "published SmartMenus to smartmenu_quarterly_raw.csv"
    );
  } catch (err) {
    console.error("Failed to export SmartMenus:", err);
    process.exit(1);
  }
}

main();
