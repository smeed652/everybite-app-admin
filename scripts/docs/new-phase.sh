#!/bin/bash

# Usage: ./scripts/new-phase.sh "Project Name" "Phase Title" "Phase Number"

if [ $# -ne 3 ]; then
    echo "Usage: $0 \"Project Name\" \"Phase Title\" \"Phase Number\""
    echo "Example: $0 \"Cache Management\" \"Advanced Features\" 4"
    exit 1
fi

PROJECT_NAME=$1
PHASE_TITLE=$2
PHASE_NUMBER=$3

# Create filename
FILENAME="PHASE-${PHASE_NUMBER}-${PROJECT_NAME// /-}.md"
FILEPATH="docs/phases/current/${FILENAME}"

# Check if file already exists
if [ -f "$FILEPATH" ]; then
    echo "❌ Phase file already exists: $FILEPATH"
    exit 1
fi

# Create phase file from template
cat > "$FILEPATH" << 'EOF'
# Phase PHASE_NUMBER: PROJECT_NAME - PHASE_TITLE

## 📋 Overview
- **Project**: PROJECT_NAME
- **Sprint**: Sprint 9 - Cache Management & UI Enhancement
- **Phase**: PHASE_NUMBER
- **Status**: Planning
- **Start Date**: START_DATE
- **Target End Date**: TBD
- **Actual End Date**: TBD

## 🎯 Goals & Objectives
- [ ] Goal 1
- [ ] Goal 2
- [ ] Goal 3

## 📝 Implementation Steps
### Step 1: [Description]
- [ ] Task 1.1
- [ ] Task 1.2
- [ ] Task 1.3

### Step 2: [Description]
- [ ] Task 2.1
- [ ] Task 2.2
- [ ] Task 2.3

### Step 3: [Description]
- [ ] Task 3.1
- [ ] Task 3.2
- [ ] Task 3.3

## ✅ Success Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## 🔗 Dependencies
- [ ] Dependency 1
- [ ] Dependency 2
- [ ] Dependency 3

## ⏱️ Timeline
- **Week 1**: [Tasks]
- **Week 2**: [Tasks]
- **Week 3**: [Tasks]

## ⚠️ Risk Assessment
- **High Risk**: [Description]
- **Medium Risk**: [Description]
- **Low Risk**: [Description]

## 📊 Progress Tracking
- **Tasks Completed**: 0/0
- **Progress**: 0%
- **Status**: Planning

## 🔗 References
- **Sprint**: `docs/sprints/2025-01-15_sprint-9.md`
- **Project**: `docs/projects/PROJECT_LOWER-management.md`
- **Previous Phase**: [Link to previous phase if applicable]
- **Code**: [Relevant code paths]

## 📝 Notes
[Any additional notes, decisions, or observations]
EOF

# Replace placeholders
sed -i '' "s/PHASE_NUMBER/$PHASE_NUMBER/g" "$FILEPATH"
sed -i '' "s/PROJECT_NAME/$PROJECT_NAME/g" "$FILEPATH"
sed -i '' "s/PHASE_TITLE/$PHASE_TITLE/g" "$FILEPATH"
sed -i '' "s/START_DATE/$(date +%Y-%m-%d)/g" "$FILEPATH"
sed -i '' "s/PROJECT_LOWER/$(echo "$PROJECT_NAME" | tr '[:upper:]' '[:lower:]')/g" "$FILEPATH"

echo "✅ Created Phase ${PHASE_NUMBER} for ${PROJECT_NAME}"
echo "📁 File: ${FILEPATH}"
echo ""
echo "📝 Next steps:"
echo "1. Edit the phase file to add specific goals and tasks"
echo "2. Update the project file to reference this phase"
echo "3. Run: node scripts/docs/track-sprint-progress.js" 