# Deferred Items Tracking

This document tracks all items that have been deferred from active development, including reasons for deferral and future considerations.

## 📋 Deferred Items

### 1. Advanced Cache Features (Phase 5)

**Original Location**: Phase 4 - Cache Management Advanced Features (now Phase 5)  
**Deferred Date**: 2025-01-15  
**Status**: Deferred - Waiting for Phase 4 critical fixes

#### **Reason for Deferral**

Phase 4 critical fixes (Apollo client issues, dashboard 0 values, quarterly metrics) must be resolved before implementing advanced cache features. Core functionality must work correctly before adding advanced features.

#### **Deferred Features**

- **Scheduled Cache Refresh**: AWS Lambda + EventBridge implementation
- **Progress Indicators**: Loading states and progress bars for cache operations
- **Performance Optimization**: Cache hit/miss analytics and memory monitoring
- **Comprehensive Testing**: Unit, integration, and E2E tests for cache system
- **Documentation**: Cache management best practices and runbooks

#### **Future Considerations**

- **Phase 4 Completion**: Must complete critical Apollo/dashboard fixes first
- **Core Functionality**: Ensure all basic features work correctly
- **Test Coverage**: All tests must pass before adding advanced features
- **User Experience**: Core UX must be solid before advanced enhancements

#### **Alternative Focus**

While this is deferred, focus on:

- Fixing dashboard 0 values issue
- Resolving quarterly metrics query problems
- Updating test coverage for Lambda architecture
- Ensuring core application functionality works

#### **Re-evaluation Criteria**

- When Phase 4 critical fixes are completed
- When dashboard shows correct metrics (not 0 values)
- When quarterly metrics query returns actual data
- When all 303 tests pass (0 failures)

---

## 🎯 Deferral Guidelines

### **When to Defer an Item**

- **Architectural uncertainty** - Need more information or decisions
- **Resource constraints** - Team capacity or time limitations
- **Dependency issues** - Waiting for other work to complete
- **Priority changes** - Higher priority items take precedence
- **Technical complexity** - Need more research or planning

### **How to Defer an Item**

1. **Update TODO.md** - Mark as "Deferred" with reason
2. **Update phase plan** - Mark step as "(DEFERRED)"
3. **Add to this file** - Document reason and future considerations
4. **Update progress tracking** - Exclude from current sprint calculations
5. **Set re-evaluation criteria** - Define when to reconsider

### **Re-evaluation Process**

1. **Regular review** - Monthly review of deferred items
2. **Criteria check** - Evaluate against re-evaluation criteria
3. **Priority assessment** - Compare with current priorities
4. **Resource check** - Ensure team capacity for implementation
5. **Decision** - Reactivate, keep deferred, or archive

---

## 📊 Deferral Statistics

- **Total Deferred Items**: 1
- **Dependency Issues**: 1 (waiting for Phase 4 completion)
- **Architectural Decisions**: 0
- **Resource Constraints**: 0

---

## 🔗 Related Documents

- **TODO.md** - Main project TODO list
- **docs/phases/current/PHASE-4-APOLLO-DASHBOARD-FIXES.md** - Current Phase 4 plan
- **docs/phases/current/PHASE-5-CACHE-ADVANCED.md** - Deferred Phase 5 plan
- **docs/DOCS-CLEANUP-PLAN.md** - Documentation cleanup plan
