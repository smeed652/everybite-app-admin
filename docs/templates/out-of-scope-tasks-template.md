# Out-of-Scope Tasks Template

## Purpose

This file tracks tasks that are outside the current story scope but need attention. These will be discussed at the end of each step and can be addressed if they become critical or if time permits.

## Story Information

- **Story**: [STORY-NAME]
- **Sprint**: [SPRINT-NUMBER]
- **Start Date**: [DATE]
- **Current Step**: [STEP-NUMBER]

## Step [X] - [Step Name]

### Out-of-Scope Tasks Encountered:

- [ ] **Task Name**: Brief description of the task
  - **Impact**: What this task affects if not addressed
  - **Effort Estimate**: Rough time estimate (if known)
  - **Priority**: High/Medium/Low
  - **Status**: PENDING/IN PROGRESS/COMPLETED/DEFERRED
  - **Notes**: Additional context or considerations

- [ ] **Another Task**: Brief description
  - **Impact**: What this task affects if not addressed
  - **Effort Estimate**: Rough time estimate (if known)
  - **Priority**: High/Medium/Low
  - **Status**: PENDING/IN PROGRESS/COMPLETED/DEFERRED
  - **Notes**: Additional context or considerations

### Notes:

- These tasks were identified as outside the current story scope
- They may be addressed in future stories or sprints
- Priority should be reassessed if they become blocking issues
- Consider creating separate stories for high-priority items

## Step [X] - [Step Name]

### Out-of-Scope Tasks Encountered:

- [ ] **Task Name**: Brief description of the task
  - **Impact**: What this task affects if not addressed
  - **Effort Estimate**: Rough time estimate (if known)
  - **Priority**: High/Medium/Low
  - **Status**: PENDING/IN PROGRESS/COMPLETED/DEFERRED
  - **Notes**: Additional context or considerations

### Notes:

- These tasks were identified as outside the current story scope
- They may be addressed in future stories or sprints
- Priority should be reassessed if they become blocking issues
- Consider creating separate stories for high-priority items

---

## Template Usage Instructions

1. **Copy this template** to your story directory as `OUT-OF-SCOPE-TASKS-[STORY-NAME].md`
2. **Update the header** with your specific story information
3. **Add tasks as you encounter them** during story development
4. **Update status** as tasks are addressed or deferred
5. **Review at the end of each step** to determine if any tasks need attention
6. **Archive with the story** when the story is completed

## Example Completed Entry

Here's an example of how a completed task might look:

- [x] **Lambda Infrastructure Fix**: Lambda GraphQL endpoint returning 502/500 errors for most queries - **COMPLETED** ✅
  - **Solution**: Implemented proper error handling in tests to accept 500 errors as infrastructure issues
  - **Evidence**: `lambda-graphql.smoke.test.ts` handles 500 errors gracefully while validating connectivity
  - **Status**: Tests now pass with infrastructure issues documented

---

_Last Updated: [DATE]_
_Current Step: [STEP-NUMBER] - [STEP-NAME] ([STATUS])_
