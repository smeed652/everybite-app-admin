# Documentation Cleanup and Reorganization Plan

## 📋 Current State Assessment

The docs directory has grown significantly and contains overlapping, outdated, and poorly organized documentation. This plan outlines the cleanup and reorganization needed.

## 🎯 Goals

1. **Eliminate duplication** - Remove or merge duplicate documents
2. **Archive outdated content** - Move obsolete docs to `_archive/`
3. **Improve navigation** - Create clear structure and index
4. **Update references** - Ensure all cross-references are accurate
5. **Consolidate information** - Merge related documents where appropriate

## 📁 Proposed New Structure

```
docs/
├── README.md                    # Main documentation index
├── sprints/                     # ✅ Keep - Sprint planning (current system)
├── projects/                    # ✅ Keep - Project overviews (current system)
├── phases/                      # ✅ Keep - Phase tracking (current system)
├── templates/                   # ✅ Keep - Reusable templates (current system)
├── guides/                      # 🆕 Consolidated guides
│   ├── development.md           # Merged development guide
│   ├── deployment.md            # Merged deployment guide
│   ├── testing.md               # Merged testing guide
│   ├── style-guide.md           # Consolidated style guide
│   └── git-workflow.md          # Git workflow guide
├── architecture/                # 🆕 Architecture documentation
│   ├── overview.md              # System architecture overview
│   ├── caching.md               # Caching architecture
│   ├── security.md              # Security architecture
│   └── dirty-state-handling.md  # ✅ Keep - Current implementation
├── api/                         # 🆕 API documentation
│   ├── graphql.md               # GraphQL API guide
│   ├── lambda.md                # Lambda functions
│   └── metabase.md              # Metabase integration
├── storybook/                   # ✅ Keep - Storybook documentation
├── _archive/                    # ✅ Keep - Outdated documentation
└── scripts/                     # ✅ Keep - Documentation automation
```

## 🔍 Document Analysis

### Documents to Keep and Consolidate

#### **Development Guides** → `guides/development.md`

- `active/DEVELOPMENT-GUIDE.MD` (28KB) - **Primary source**
- `active/DEVELOPMENT-STYLE-GUIDE.md` (16KB) - **Merge into development.md**
- `_archive/development-guide.md` (8.3KB) - **Archive (outdated)**

#### **Deployment Guides** → `guides/deployment.md`

- `active/DEPLOYMENT.MD` (5.1KB) - **Primary source**
- `active/AMPLIFY-DEPLOYMENT-STRATEGY.md` (7.0KB) - **Merge into deployment.md**
- `active/AMPLIFY-DEPLOYMENT-GATES.md` (5.0KB) - **Merge into deployment.md**
- `active/AMPLIFY-REGION-MIGRATION.md` (8.6KB) - **Merge into deployment.md**
- `active/AMPLIFY-MIGRATION-QUICK-REFERENCE.md` (3.6KB) - **Merge into deployment.md**
- `active/AMPLIFY-YAML-RULES.md` (2.9KB) - **Merge into deployment.md**

#### **Style Guides** → `guides/style-guide.md`

- `active/STYLE-GUIDE.MD` (4.8KB) - **Primary source**
- `_archive/STYLE_GUIDE.md` (9.0KB) - **Archive (outdated)**

#### **Testing Guides** → `guides/testing.md`

- `active/TESTING.MD` (1.9KB) - **Primary source**
- `active/testing-strategy.md` (3.3KB) - **Merge into testing.md**

#### **Git Workflow** → `guides/git-workflow.md`

- `GIT_WORKFLOW.md` (8.7KB) - **Keep as is**
- `GIT_QUICK_REFERENCE.md` (2.8KB) - **Merge into git-workflow.md**

#### **Architecture** → `architecture/`

- `active/ARCHITECTURE-OVERVIEW.MD` (1.9KB) → `architecture/overview.md`
- `active/TECH-STACK.MD` (5.2KB) → `architecture/tech-stack.md`
- `CACHING-CONTROLS.md` (4.8KB) → `architecture/caching.md`
- `active/DAILY_SNAPSHOT_CACHING.md` (5.8KB) → `architecture/caching.md`
- `active/SECURITY-POLICIES.MD` (2.6KB) → `architecture/security.md`

#### **API Documentation** → `api/`

- `active/GRAPHQL-GUIDE.MD` (8.5KB) → `api/graphql.md`
- `active/AWS Cognito Token.md` (3.1KB) → `api/auth.md`

### Documents to Archive

#### **Outdated/Obsolete**

- `_archive/` directory contents - **Already archived**
- `active/NAVIGATION-REDESIGN-PLAN.md` - **Completed project**
- `active/PROJECT-PLAN.MD` - **Outdated project plan**
- `active/PRD.MD` (48KB) - **Large, may be outdated**

#### **Duplicate Information**

- `_archive/GRAPHQL_API_SETUP_GUIDE.md` - **Duplicate of active/GRAPHQL-GUIDE.MD**
- `_archive/development-guide.md` - **Outdated version**

### Documents to Keep As-Is

#### **Current System**

- `sprints/` - **Current sprint system**
- `projects/` - **Current project system**
- `phases/` - **Current phase system**
- `templates/` - **Current template system**
- `storybook/` - **Current Storybook docs**

#### **Specific Documents**

- `README.md` - **Main documentation index**
- `architecture/dirty-state-handling.md` - **Current implementation**

## 🚀 Implementation Plan

### Phase 1: Preparation (30 minutes)

1. **Create new directory structure**
2. **Backup current docs** (git commit)
3. **Create consolidation templates**

### Phase 2: Consolidation (2 hours)

1. **Merge development guides**
2. **Merge deployment guides**
3. **Merge style guides**
4. **Merge testing guides**
5. **Merge git workflow guides**

### Phase 3: Reorganization (1 hour)

1. **Move documents to new structure**
2. **Update cross-references**
3. **Archive outdated content**
4. **Create new index**

### Phase 4: Validation (30 minutes)

1. **Test all links**
2. **Verify navigation**
3. **Update any remaining references**

## 📊 Expected Outcomes

### **Before Cleanup:**

- **~50 documents** scattered across multiple directories
- **Significant duplication** between active and archive
- **Poor navigation** - hard to find relevant information
- **Outdated content** mixed with current information

### **After Cleanup:**

- **~20 organized documents** in clear structure
- **No duplication** - single source of truth for each topic
- **Clear navigation** with main index
- **Current information** only, outdated content archived

## ⚠️ Risks and Mitigations

### **Risks:**

- **Breaking links** - External references to docs
- **Losing information** - Accidentally removing important content
- **Time investment** - 2-3 hours of cleanup work

### **Mitigations:**

- **Git backup** - All changes tracked in version control
- **Gradual approach** - Archive first, then reorganize
- **Validation** - Test all links after reorganization
- **Documentation** - Update this plan as we go

## 🎯 Success Criteria

- [ ] **No duplicate information** across docs
- [ ] **Clear navigation structure** with main index
- [ ] **All cross-references updated** and working
- [ ] **Outdated content archived** but preserved
- [ ] **Current information easily findable**
- [ ] **Reduced total document count** by 50%+
