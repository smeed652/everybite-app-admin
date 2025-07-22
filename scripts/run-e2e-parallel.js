#!/usr/bin/env node

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

// Get command line arguments
const args = process.argv.slice(2);
const threads = args.includes("--threads")
  ? parseInt(args[args.indexOf("--threads") + 1])
  : 4;

// Get all E2E test files
const e2eDir = path.join(__dirname, "..", "cypress", "e2e");
const testFiles = fs
  .readdirSync(e2eDir)
  .filter((file) => file.endsWith(".cy.ts"))
  .map((file) => path.join("cypress", "e2e", file));

console.log(
  `🚀 Running ${testFiles.length} E2E tests in parallel with ${threads} threads`
);

// Split test files into groups
const chunkSize = Math.ceil(testFiles.length / threads);
const testGroups = [];
for (let i = 0; i < testFiles.length; i += chunkSize) {
  testGroups.push(testFiles.slice(i, i + chunkSize));
}

console.log(
  `📊 Test groups: ${testGroups.map((group) => group.length).join(", ")} tests each`
);

// Run each group in parallel
const processes = testGroups.map((group, index) => {
  const specArg = group.join(",");
  console.log(`🔄 Starting group ${index + 1}: ${group.length} tests`);

  const child = spawn("npx", ["cypress", "run", "--spec", specArg], {
    stdio: "pipe",
    shell: true,
  });

  let output = "";
  let errorOutput = "";

  child.stdout.on("data", (data) => {
    output += data.toString();
  });

  child.stderr.on("data", (data) => {
    errorOutput += data.toString();
  });

  child.on("close", (code) => {
    if (code === 0) {
      console.log(`✅ Group ${index + 1} completed successfully`);
    } else {
      console.log(`❌ Group ${index + 1} failed with code ${code}`);
      console.log("Error output:", errorOutput);
    }
  });

  return { child, index, output, errorOutput };
});

// Wait for all processes to complete
Promise.all(
  processes.map(({ child }) => {
    return new Promise((resolve) => {
      child.on("close", (code) => resolve(code));
    });
  })
).then((codes) => {
  const failed = codes.filter((code) => code !== 0).length;
  const total = codes.length;

  console.log(`\n🎯 Parallel execution completed:`);
  console.log(`   ✅ Successful groups: ${total - failed}`);
  console.log(`   ❌ Failed groups: ${failed}`);

  if (failed > 0) {
    console.log("\n📋 Group results:");
    processes.forEach(({ index, output, errorOutput }) => {
      console.log(
        `   Group ${index + 1}: ${errorOutput ? "❌ Failed" : "✅ Passed"}`
      );
    });
    process.exit(1);
  } else {
    console.log("🎉 All test groups passed!");
    process.exit(0);
  }
});

// Handle process termination
process.on("SIGINT", () => {
  console.log("\n🛑 Stopping all test processes...");
  processes.forEach(({ child }) => child.kill("SIGINT"));
  process.exit(1);
});
