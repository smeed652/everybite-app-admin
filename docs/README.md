# Documentation System

This directory contains the enhanced documentation system for the EveryBite Admin application, organized by sprints, projects, and phases.

## 📁 Directory Structure

```
docs/
├── architecture/               # Architectural patterns and decisions
│   ├── data-processing-pattern.md  # General data handling pattern
│   ├── widget-analytics-architecture.md  # Widget-specific implementation
│   └── README.md              # Architecture documentation guide
├── sprints/                    # Sprint planning and tracking
│   ├── 2025-01-15_sprint-9.md # Current sprint
│   ├── 2025-07-28_sprint-8.md # Previous sprints
│   └── ...
├── projects/                   # Project overviews and status
│   ├── cache-management.md     # Cache management project
│   ├── user-management.md      # User management project
│   └── ...
├── phases/                     # Detailed phase tracking
│   ├── current/                # Active phases
│   │   ├── PHASE-4-CACHE-ADVANCED.md
│   │   └── ...
│   ├── completed/              # Completed phases
│   │   ├── PHASE-3-CACHE-UI-COMPLETED.md
│   │   └── ...
│   └── ...
└── templates/                  # Reusable templates
    ├── phase-template.md
    └── ...
```

## 🚀 Getting Started

### 1. Create a New Phase

```bash
./scripts/docs/new-phase.sh "Project Name" "Phase Title" "Phase Number"
```

**Example:**

```bash
./scripts/docs/new-phase.sh "Cache Management" "Advanced Features" 4
```

### 2. Track Progress

```bash
node scripts/docs/track-sprint-progress.js
```

This automatically updates sprint files with current progress from phase files.

### 3. Complete a Phase

```bash
./scripts/docs/complete-phase.sh "PHASE-FILENAME"
```

**Example:**

```bash
./scripts/docs/complete-phase.sh "PHASE-4-CACHE-ADVANCED"
```

## 📋 Workflow

### Sprint Planning

1. Create or update sprint file in `docs/sprints/`
2. Create phase files for each project using `scripts/docs/new-phase.sh`
3. Update project files to reference new phases

### During Sprint

1. Update task checkboxes in phase files as you work
2. Run `scripts/docs/track-sprint-progress.js` to update sprint progress
3. Update phase status (Planning → In Progress → Completed)

### Sprint Completion

1. Complete phases using `scripts/docs/complete-phase.sh`
2. Move completed phases to `docs/phases/completed/`
3. Update project files to mark phases as completed
4. Archive sprint file if all phases are complete

## 📊 Progress Tracking

The system automatically tracks:

- **Overall sprint progress** based on all active phases
- **Individual phase progress** based on task completion
- **Project progress** across multiple phases

### Progress Indicators

- `[ ]` - Task not started
- `[x]` - Task completed
- `[~]` - Task in progress (optional)

## 🔗 Cross-References

Each document includes references to related files:

- **Sprint files** reference active phases
- **Phase files** reference sprint and project files
- **Project files** list all phases and current status

## 📝 Templates

### Phase Template

Located at `docs/templates/phase-template.md`, includes:

- Overview and metadata
- Goals and objectives
- Implementation steps
- Success criteria
- Risk assessment
- Progress tracking

### Customization

Templates can be customized for specific project needs. Copy the template and modify as needed.

## 🤖 Automation

### Progress Tracking

The `scripts/docs/track-sprint-progress.js` script:

- Scans all active phase files
- Calculates overall progress
- Updates sprint files automatically
- Provides detailed phase breakdown

### File Management

- `scripts/docs/new-phase.sh` - Creates new phase files from template
- `scripts/docs/complete-phase.sh` - Marks phases as completed and moves them

## 📈 Best Practices

### Phase Management

- Keep phases focused and manageable (1-2 weeks max)
- Update progress regularly (daily/weekly)
- Use clear, actionable task descriptions
- Include success criteria for each task

### Documentation

- Keep cross-references up-to-date
- Use consistent naming conventions
- Include relevant code paths and links
- Document decisions and rationale

### Automation

- Run progress tracking regularly (`scripts/docs/track-sprint-progress.js`)
- Use scripts for repetitive tasks (`scripts/docs/`)
- Keep templates updated
- Validate file structure periodically

## 🛠️ Maintenance

### Regular Tasks

- Update progress tracking weekly
- Archive completed phases monthly
- Review and update templates quarterly
- Clean up outdated references

### File Organization

- Keep current work in `current/` directory
- Move completed work to `completed/` directory
- Maintain consistent naming conventions
- Use descriptive filenames

## 📞 Support

For questions or issues with the documentation system:

1. Check this README first
2. Review existing examples in the directories
3. Use the provided scripts for common tasks
4. Update this README when making changes
