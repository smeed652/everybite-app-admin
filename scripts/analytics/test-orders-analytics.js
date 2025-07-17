#!/usr/bin/env node
/* eslint-disable */
const axios = require("axios");

const LAMBDA_URL =
  process.env.LAMBDA_URL || "https://your-lambda-function-url.amazonaws.com";

async function testOrdersAnalytics() {
  try {
    console.log("Testing orders analytics endpoint...");

    const response = await axios.get(`${LAMBDA_URL}/orders-analytics`);

    console.log("Response status:", response.status);
    console.log("Response data:", JSON.stringify(response.data, null, 2));

    if (response.data.data && response.data.data.rows) {
      console.log("\nOrders by Widget:");
      response.data.data.rows.forEach((row) => {
        console.log(`  ${row[0]}: ${row[1]} orders`);
      });
    }
  } catch (error) {
    console.error(
      "Error testing orders analytics:",
      error.response?.data || error.message
    );
  }
}

testOrdersAnalytics();
