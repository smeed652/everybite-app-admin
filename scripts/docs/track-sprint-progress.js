#!/usr/bin/env node
/* eslint-env node */

const fs = require("fs");
const path = require("path");

class SprintProgressTracker {
  constructor() {
    this.sprintsDir = "docs/sprints";
    this.phasesDir = "docs/phases/current";
  }

  updateCurrentSprint() {
    const currentSprint = this.getCurrentSprintFile();
    if (!currentSprint) {
      console.log("❌ No current sprint file found");
      return;
    }

    const phases = this.getCurrentPhases();
    if (phases.length === 0) {
      console.log("ℹ️ No current phases found");
      return;
    }

    const progress = this.calculateOverallProgress(phases);
    this.updateSprintProgress(currentSprint, progress);
  }

  getCurrentSprintFile() {
    try {
      const sprintFiles = fs
        .readdirSync(this.sprintsDir)
        .filter((f) => f.endsWith(".md"))
        .sort()
        .reverse();

      return sprintFiles[0]; // Most recent
    } catch (error) {
      console.error("Error reading sprints directory:", error.message);
      return null;
    }
  }

  getCurrentPhases() {
    try {
      if (!fs.existsSync(this.phasesDir)) {
        return [];
      }

      return fs
        .readdirSync(this.phasesDir)
        .filter((f) => f.endsWith(".md"))
        .map((f) => path.join(this.phasesDir, f));
    } catch (error) {
      console.error("Error reading phases directory:", error.message);
      return [];
    }
  }

  calculateOverallProgress(phases) {
    let totalTasks = 0;
    let completedTasks = 0;
    const phaseProgress = [];

    phases.forEach((phasePath) => {
      try {
        const content = fs.readFileSync(phasePath, "utf8");
        const phaseName = path.basename(phasePath, ".md");

        // Count tasks in this phase
        const tasks = content.match(/\[ \]/g) || [];
        const done = content.match(/\[x\]/g) || [];

        // For now, use manual override for Phase 4 (25 active tasks) and Phase 5 (deferred)
        let phaseTotal = tasks.length;
        let phaseCompleted = done.length;

        if (phaseName.includes("PHASE-4-APOLLO-DASHBOARD-FIXES")) {
          phaseTotal = 25; // Manual override: 25 active tasks
        } else if (phaseName.includes("PHASE-5-CACHE-ADVANCED")) {
          phaseTotal = 0; // Manual override: Phase 5 is deferred
        }

        totalTasks += phaseTotal;
        completedTasks += phaseCompleted;

        if (phaseTotal > 0) {
          const phasePercentage = Math.round(
            (phaseCompleted / phaseTotal) * 100
          );
          phaseProgress.push({
            name: phaseName,
            completed: phaseCompleted,
            total: phaseTotal,
            percentage: phasePercentage,
          });
        }
      } catch (error) {
        console.error(`Error reading phase ${phasePath}:`, error.message);
      }
    });

    return {
      completed: completedTasks,
      total: totalTasks,
      percentage:
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      phaseProgress,
    };
  }

  updateSprintProgress(sprintFile, progress) {
    const filePath = path.join(this.sprintsDir, sprintFile);

    try {
      let content = fs.readFileSync(filePath, "utf8");

      // Create progress section
      const progressSection = this.createProgressSection(progress);

      // Update or add progress section
      if (content.includes("## 📊 Progress Tracking")) {
        content = content.replace(
          /## 📊 Progress Tracking[\s\S]*?(?=##|$)/,
          progressSection
        );
      } else {
        // Insert after the focus section or at the beginning
        if (content.includes("## 🎯 Focus")) {
          content = content.replace(
            /## 🎯 Focus/,
            `## 🎯 Focus\n\n${progressSection}`
          );
        } else {
          // Add after the title
          content = content.replace(/^(# .*?\n)/, `$1\n${progressSection}\n`);
        }
      }

      fs.writeFileSync(filePath, content);
      console.log(
        `✅ Updated ${sprintFile} - ${progress.percentage}% complete (${progress.completed}/${progress.total} tasks)`
      );

      // Log phase breakdown
      if (progress.phaseProgress.length > 0) {
        console.log("📊 Phase Breakdown:");
        progress.phaseProgress.forEach((phase) => {
          console.log(
            `  ${phase.name}: ${phase.percentage}% (${phase.completed}/${phase.total})`
          );
        });
      }
    } catch (error) {
      console.error(`Error updating sprint file ${sprintFile}:`, error.message);
    }
  }

  createProgressSection(progress) {
    let section = `## 📊 Progress Tracking\n`;
    section += `- **Overall Progress**: ${progress.percentage}% (${progress.completed}/${progress.total} tasks complete)\n`;

    if (progress.phaseProgress.length > 0) {
      section += `\n**Phase Breakdown**:\n`;
      progress.phaseProgress.forEach((phase) => {
        section += `- **${phase.name}**: ${phase.percentage}% (${phase.completed}/${phase.total} tasks)\n`;
      });
    }

    return section;
  }
}

// Run if called directly
if (require.main === module) {
  const tracker = new SprintProgressTracker();
  tracker.updateCurrentSprint();
}

module.exports = SprintProgressTracker;
