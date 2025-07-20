# Documentation Scripts

This directory contains automation scripts for the enhanced documentation system.

## 📁 Scripts Overview

### `track-sprint-progress.js`

**Purpose**: Automatically updates sprint files with current progress from phase files.

**Usage**:

```bash
node scripts/docs/track-sprint-progress.js
```

**What it does**:

- Scans all active phase files in `docs/phases/current/`
- Calculates overall progress based on task completion
- Updates the most recent sprint file with progress information
- Provides detailed phase breakdown

**Output Example**:

```
✅ Updated 2025-07-28_sprint-8.md - 25% complete (15/60 tasks)
📊 Phase Breakdown:
  PHASE-4-CACHE-ADVANCED: 30% (12/40 tasks)
  PHASE-2-User-Management: 15% (3/20 tasks)
```

### `new-phase.sh`

**Purpose**: Creates new phase files from template.

**Usage**:

```bash
./scripts/docs/new-phase.sh "Project Name" "Phase Title" "Phase Number"
```

**Example**:

```bash
./scripts/docs/new-phase.sh "Cache Management" "Advanced Features" 4
```

**What it does**:

- Creates a new phase file in `docs/phases/current/`
- Populates it with template content
- Replaces placeholders with actual values
- Provides next steps guidance

### `complete-phase.sh`

**Purpose**: Marks phases as completed and moves them to the completed directory.

**Usage**:

```bash
./scripts/docs/complete-phase.sh "PHASE-FILENAME"
```

**Example**:

```bash
./scripts/docs/complete-phase.sh "PHASE-4-CACHE-ADVANCED"
```

**What it does**:

- Moves phase file from `current/` to `completed/`
- Updates status to "Completed"
- Sets actual end date
- Provides next steps guidance

## 🔧 Script Dependencies

All scripts depend on the following directory structure:

```
docs/
├── sprints/           # Sprint files (YYYY-MM-DD_sprint-X.md)
├── phases/
│   ├── current/       # Active phase files
│   └── completed/     # Completed phase files
└── projects/          # Project overview files
```

## 📊 Progress Tracking Format

Scripts expect the following format in phase files:

- `[ ]` - Task not started
- `[x]` - Task completed
- `[~]` - Task in progress (optional)

## 🚀 Quick Start

1. **Create a new phase**:

   ```bash
   ./scripts/docs/new-phase.sh "My Project" "My Phase" 1
   ```

2. **Track progress daily**:

   ```bash
   node scripts/docs/track-sprint-progress.js
   ```

3. **Complete a phase**:
   ```bash
   ./scripts/docs/complete-phase.sh "PHASE-1-MY-PROJECT"
   ```

## 🔗 Related Documentation

- **Main docs README**: `docs/README.md`
- **Phase template**: `docs/templates/phase-template.md`
- **Project structure**: See `docs/` directory

## 🛠️ Maintenance

- Scripts are designed to be idempotent (safe to run multiple times)
- All scripts include error handling and validation
- Scripts provide clear feedback and next steps
- File operations are safe and non-destructive
