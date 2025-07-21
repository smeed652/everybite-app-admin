# Deferred Work Reference Template

## Purpose

This template helps stories reference and update the deferred work backlog. Use this when you encounter work that should be deferred or when you're ready to pick up deferred work.

---

## 📋 How to Handle Deferred Work

### **When You Encounter Work That Should Be Deferred:**

1. **Add to Deferred Work Backlog** (`docs/stories/future/DEFERRED-WORK-BACKLOG.md`)
2. **Include in Story Documentation** - Reference the deferred work in your story
3. **Update Story Scope** - Remove deferred items from current story scope
4. **Document Reasoning** - Explain why the work was deferred

### **When You're Ready to Pick Up Deferred Work:**

1. **Review Deferred Work Backlog** for relevant items
2. **Create New Story** or add to existing story scope
3. **Update Dependencies** - Check if dependencies are resolved
4. **Move Items** from deferred backlog to active story
5. **Update Priorities** based on current business needs

---

## 📝 Template for Story Documentation

### **Deferred Work Section (Add to Story Documentation)**

```markdown
## 🔄 Deferred Work

### **Items Deferred from This Story:**

- [ ] **Item Name**: Brief description
  - **Reason**: Why it was deferred
  - **Dependencies**: What needs to happen first
  - **Effort**: Estimated time
  - **Priority**: High/Medium/Low
  - **Added to**: `docs/stories/future/DEFERRED-WORK-BACKLOG.md`

### **Items Picked Up from Deferred Work:**

- [x] **Item Name**: Brief description
  - **Source**: Deferred Work Backlog
  - **Dependencies Resolved**: What changed to make this possible
  - **Effort**: Actual time taken
  - **Removed from**: `docs/stories/future/DEFERRED-WORK-BACKLOG.md`
```

---

## 🎯 Best Practices

### **When to Defer Work:**

- **Scope Creep**: Work that expands beyond original story scope
- **Dependencies**: Work that depends on other stories or external factors
- **Priority**: Work that's lower priority than current story goals
- **Complexity**: Work that would significantly extend story timeline
- **Risk**: Work that introduces significant risk or uncertainty

### **When to Pick Up Deferred Work:**

- **Dependencies Resolved**: Blocking dependencies are now complete
- **Sprint Capacity**: Team has capacity for additional work
- **Business Priority**: Work has become higher priority
- **Risk Mitigation**: Work helps reduce technical debt or risk
- **User Impact**: Work significantly improves user experience

### **Documentation Standards:**

- **Clear Reasoning**: Always explain why work was deferred
- **Dependencies**: List what needs to happen before work can resume
- **Effort Estimates**: Provide rough time estimates for planning
- **Priority Levels**: Use consistent priority terminology
- **Source Tracking**: Always reference the original story

---

## 📊 Example Usage

### **Example 1: Deferring Work During Story Development**

```markdown
## 🔄 Deferred Work

### **Items Deferred from This Story:**

- [ ] **E2E Test Implementation**: Complete Cypress test suite
  - **Reason**: UI design refactor will change component structure
  - **Dependencies**: UI design refactor completion
  - **Effort**: ~5 days
  - **Priority**: Medium
  - **Added to**: `docs/stories/future/DEFERRED-WORK-BACKLOG.md`
```

### **Example 2: Picking Up Deferred Work**

```markdown
## 🔄 Deferred Work

### **Items Picked Up from Deferred Work:**

- [x] **E2E Test Implementation**: Complete Cypress test suite
  - **Source**: Deferred Work Backlog (Story 1 - Test Suite Restoration)
  - **Dependencies Resolved**: UI design refactor completed
  - **Effort**: 4 days (actual)
  - **Removed from**: `docs/stories/future/DEFERRED-WORK-BACKLOG.md`
```

---

## 🔗 Related Files

- **Deferred Work Backlog**: `docs/stories/future/DEFERRED-WORK-BACKLOG.md`
- **Out-of-Scope Tasks Template**: `docs/templates/out-of-scope-tasks-template.md`
- **Story Agreement Template**: `docs/templates/story-agreement-template.md`

---

_Last Updated: 2025-01-15_
_Usage: Reference this template when handling deferred work in stories_
