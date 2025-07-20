#!/bin/bash

# Usage: ./scripts/complete-phase.sh "PHASE-FILENAME"
# Example: ./scripts/complete-phase.sh "PHASE-4-CACHE-ADVANCED"

if [ $# -ne 1 ]; then
    echo "Usage: $0 \"PHASE-FILENAME\""
    echo "Example: $0 \"PHASE-4-CACHE-ADVANCED\""
    exit 1
fi

PHASE_FILENAME=$1
CURRENT_PATH="docs/phases/current/${PHASE_FILENAME}.md"
COMPLETED_PATH="docs/phases/completed/${PHASE_FILENAME}-COMPLETED.md"

# Check if phase file exists
if [ ! -f "$CURRENT_PATH" ]; then
    echo "❌ Phase file not found: $CURRENT_PATH"
    echo "Available phases:"
    ls -1 docs/phases/current/*.md 2>/dev/null | sed 's|docs/phases/current/||' | sed 's|.md||' || echo "No phases found"
    exit 1
fi

# Move to completed directory
mv "$CURRENT_PATH" "$COMPLETED_PATH"

# Update status in the file
sed -i '' 's/Status: In Progress/Status: Completed/' "$COMPLETED_PATH"
sed -i '' 's/Status: Planning/Status: Completed/' "$COMPLETED_PATH"
sed -i '' "s/Actual End Date: TBD/Actual End Date: $(date +%Y-%m-%d)/" "$COMPLETED_PATH"

# Update progress tracking
sed -i '' 's/Status: On Track/Status: Completed/' "$COMPLETED_PATH"
sed -i '' 's/Status: Behind/Status: Completed/' "$COMPLETED_PATH"
sed -i '' 's/Status: Ahead/Status: Completed/' "$COMPLETED_PATH"

echo "✅ Completed ${PHASE_FILENAME}"
echo "📁 Moved to: ${COMPLETED_PATH}"
echo ""
echo "📝 Next steps:"
echo "1. Review the completed phase"
echo "2. Update project file to mark phase as completed"
echo "3. Run: node scripts/docs/track-sprint-progress.js"
echo "4. Create next phase if needed: ./scripts/docs/new-phase.sh \"Project\" \"Title\" \"Number\"" 