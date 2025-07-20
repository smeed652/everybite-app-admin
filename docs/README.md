# Documentation System

This directory contains the enhanced documentation system for the EveryBite Admin application, organized by sprints and stories using standard agile methodology.

## 📁 Directory Structure

```
docs/
├── architecture/               # Architectural patterns and decisions
│   ├── data-processing-pattern.md  # General data handling pattern
│   ├── widget-analytics-architecture.md  # Widget-specific implementation
│   └── README.md              # Architecture documentation guide
├── sprints/                    # Sprint planning and tracking
│   ├── 2025-07-20_sprint-11.md # Current sprint
│   ├── 2025-07-20_sprint-release-tagging.md # Previous sprints
│   └── ...
├── stories/                    # User stories and implementation
│   ├── current/                # Active stories
│   │   └── STORY-1-TEST-SUITE-RESTORATION-SPRINT-11.md
│   ├── completed/              # Completed stories
│   │   └── STORY-1-DATA-PROCESSING-FOUNDATION-SPRINT-9.md
│   └── future/                 # Future stories
│       └── STORY-1-ADVANCED-OPTIMIZATION-SPRINT-12.md
├── active/                     # Active documentation and guides
│   ├── RELEASE-TAGGING-GUIDE.md
│   ├── LAMBDA-TESTING-STRATEGY.md
│   └── ...
└── templates/                  # Reusable templates
    ├── story-template.md
    └── ...
```

## 🚀 Getting Started

### 1. Create a New Story

```bash
./scripts/docs/new-story.sh "Sprint Number" "Story Title" "Story Number"
```

**Example:**

```bash
./scripts/docs/new-story.sh "11" "Test Suite Restoration" "1"
```

### 2. Track Progress

```bash
node scripts/docs/track-sprint-progress.js
```

This automatically updates sprint files with current progress from story files.

### 3. Complete a Story

```bash
./scripts/docs/complete-story.sh "STORY-FILENAME"
```

**Example:**

```bash
./scripts/docs/complete-story.sh "STORY-1-TEST-SUITE-RESTORATION-SPRINT-11"
```

### 4. Create Release Tag

```bash
npm run release:tag v1.2.0 "Feature release: Test suite restoration"
```

This creates a release tag and updates story documentation with the release information.

## 📋 Workflow

### Sprint Planning

1. Create or update sprint file in `docs/sprints/`
2. Create story files using `scripts/docs/new-story.sh`
3. Assign story points and estimate effort
4. Plan sprint capacity and velocity

### During Sprint

1. Update task checkboxes in story files as you work
2. Run `scripts/docs/track-sprint-progress.js` to update sprint progress
3. Update story status (Planning → In Progress → Completed)
4. Track story point completion

### Sprint Completion

1. Complete stories using `scripts/docs/complete-story.sh`
2. Move completed stories to `docs/stories/completed/`
3. Create release tags for completed features
4. Update story documentation with release information
5. Archive sprint file if all stories are complete

## 📊 Progress Tracking

The system automatically tracks:

- **Overall sprint progress** based on all active stories
- **Individual story progress** based on task completion
- **Story point completion** and velocity tracking
- **Release tag tracking** for completed features

## 🎯 Scope Management

Each story includes a scope section that defines:

### **Approved Areas (No Permission Required):**

- Files and directories that can be modified without asking permission
- Typically includes story-specific code and documentation
- Allows for efficient work within the story's scope

### **Ask Permission Required:**

- Files and directories that require explicit permission to modify
- Includes core architecture, configuration, and other stories
- Prevents unintended changes outside the story's scope

## 🏷️ Release Tracking

Each story includes release tag information:

- **Release Tags**: Links stories to specific releases
- **Build Numbers**: Tracks which build included the story
- **Release Messages**: Describes what was released
- **Target Releases**: Planned releases for current stories

### Progress Indicators

- `[ ]` - Task not started
- `[x]` - Task completed
- `[~]` - Task in progress (optional)

### Story Points

- **Story points** reflect task complexity, not time
- **Velocity tracking** helps with future sprint planning
- **Story point completion** shows sprint progress

## 🔗 Cross-References

Each document includes references to related files:

- **Sprint files** reference active stories
- **Story files** reference sprint and previous stories
- **Release tags** link stories to specific releases

## 📝 Templates

### Story Template

Located at `docs/templates/story-template.md`, includes:

- Overview and metadata
- Goals and objectives
- Implementation steps
- Success criteria
- Risk assessment
- Progress tracking
- Story points and velocity

### Customization

Templates can be customized for specific sprint needs. Copy the template and modify as needed.

## 🤖 Automation

### Progress Tracking

The `scripts/docs/track-sprint-progress.js` script:

- Scans all active story files
- Calculates overall progress and story point completion
- Updates sprint files automatically
- Provides detailed story breakdown

### File Management

- `scripts/docs/new-story.sh` - Creates new story files from template
- `scripts/docs/complete-story.sh` - Marks stories as completed and moves them
- `scripts/workflow/create-release-tag.sh` - Creates release tags and updates documentation

## 📈 Best Practices

### Story Management

- Keep stories focused and manageable (1-2 weeks max)
- Update progress regularly (daily/weekly)
- Use clear, actionable task descriptions
- Include success criteria for each task
- Assign appropriate story points based on complexity

### Documentation

- Keep cross-references up-to-date
- Use consistent naming conventions
- Include relevant code paths and links
- Document decisions and rationale

### Automation

- Run progress tracking regularly (`scripts/docs/track-sprint-progress.js`)
- Use scripts for repetitive tasks (`scripts/docs/`)
- Create release tags for completed features
- Keep templates updated
- Validate file structure periodically

## 🛠️ Maintenance

### Regular Tasks

- Update progress tracking weekly
- Archive completed stories monthly
- Create release tags for completed features
- Review and update templates quarterly
- Clean up outdated references

### File Organization

- Keep current work in `current/` directory
- Move completed work to `completed/` directory
- Maintain consistent naming conventions
- Use descriptive filenames
- Include release tags in story documentation

## 📞 Support

For questions or issues with the documentation system:

1. Check this README first
2. Review existing examples in the directories
3. Use the provided scripts for common tasks
4. Update this README when making changes
