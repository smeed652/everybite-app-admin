# Navigation Redesign Plan

## Overview

Redesign the left-hand navigation sidebar to follow modern design patterns inspired by shadcn UI examples, improving user experience, scalability, and maintainability.

## Current State Analysis

### Existing Navigation Structure

- **Location**: `src/components/Layout.tsx`
- **Current Sections**: Home, Admin, Documents
- **Features**: Mobile-responsive with Sheet component, SmartMenusNav with expandable submenu
- **Issues**: Basic styling, limited hierarchy, no organization context

### Current Navigation Items

```
Home
├── Dashboard

Admin
├── Users
├── Metabase Users
└── Cache Management

Documents
└── Reports (disabled)

SmartMenus (separate component)
├── List
├── Basics (when in detail view)
├── Features (when in detail view)
└── Marketing (when in detail view)
```

## Proposed New Structure

### 1. Organization Header (Top Section)

```
┌─────────────────────────┐
│ [Icon] EveryBite Admin  │ ← Organization name
│         Enterprise      │ ← Plan/Type indicator
│              [▼]        │ ← Dropdown for org switching
└─────────────────────────┘
```

**Features:**

- Organization branding and context
- Plan/type indicator (Enterprise, Pro, Basic)
- Dropdown for organization switching (future feature)
- Consistent with shadcn design patterns

### 2. Platform Section

```
Platform
├── Dashboard [Gauge icon]
├── Analytics [Chart icon] (future)
└── Settings [Gear icon] (future)
```

**Purpose:** Core platform functionality and overview

### 3. Admin Section

```
Admin
├── Users [Users icon]
├── Metabase Users [Database icon]
└── Cache Management [Settings icon]
```

**Purpose:** Administrative tools and user management

### 4. SmartMenus Section (Expandable)

```
SmartMenus [Menu icon] [▼]
├── List
├── [Current SmartMenu] (if in detail view)
│   ├── Basics
│   ├── Features
│   └── Marketing
└── [More...] (future)
```

**Purpose:** Core product functionality with context-aware navigation

### 5. User Profile (Bottom)

```
┌─────────────────────────┐
│ [Avatar] User Name      │
│         user@email.com  │
│              [▼]        │ ← User menu dropdown
└─────────────────────────┘
```

**Features:**

- User avatar and information
- Dropdown menu with settings, profile, logout
- Consistent with modern design patterns

## Implementation Plan

### Phase 1: Core Navigation Components (Week 1)

**Goal:** Create reusable navigation components with proper TypeScript interfaces

#### 1.1 OrganizationSwitcher Component

```tsx
// src/components/navigation/OrganizationSwitcher.tsx
interface OrganizationSwitcherProps {
  organization: {
    name: string;
    type: "Enterprise" | "Pro" | "Basic";
    icon?: string;
  };
  onOrganizationChange?: (orgId: string) => void;
}
```

**Features:**

- Organization branding display
- Plan/type indicator
- Dropdown trigger (future implementation)
- Responsive design

#### 1.2 NavigationSection Component

```tsx
// src/components/navigation/NavigationSection.tsx
interface NavigationSectionProps {
  title: string;
  children: ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}
```

**Features:**

- Section header with title
- Optional collapsible functionality
- Consistent spacing and typography
- Accessibility support

#### 1.3 NavigationItem Component

```tsx
// src/components/navigation/NavigationItem.tsx
interface NavigationItemProps {
  icon?: LucideIcon;
  label: string;
  to?: string;
  onClick?: () => void;
  badge?: string | number;
  disabled?: boolean;
  isActive?: boolean;
}
```

**Features:**

- Icon and label display
- Active state styling
- Badge support for notifications
- Keyboard navigation
- Hover and focus states

#### 1.4 UserProfile Component

```tsx
// src/components/navigation/UserProfile.tsx
interface UserProfileProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  onLogout: () => void;
  onSettings?: () => void;
}
```

**Features:**

- User avatar and information display
- Dropdown menu with actions
- Logout functionality
- Settings access (future)

### Phase 2: Layout Integration (Week 2)

**Goal:** Update Layout component to use new navigation structure

#### 2.1 Update Layout.tsx

- Replace existing navigation with new components
- Maintain mobile responsiveness
- Preserve existing functionality
- Add proper TypeScript types

#### 2.2 Update SmartMenusNav.tsx

- Refactor to use new NavigationItem component
- Improve expandable behavior
- Better context-aware navigation
- Consistent styling with new design

#### 2.3 Mobile Navigation

- Update Sheet component for mobile
- Ensure touch-friendly interactions
- Maintain accessibility
- Test responsive behavior

### Phase 3: Visual Design & Polish (Week 3)

**Goal:** Implement modern styling and interactions

#### 3.1 Styling Improvements

- Better spacing and typography hierarchy
- Improved hover and active states
- Consistent icon sizing and alignment
- Smooth transitions and animations

#### 3.2 Interactive Features

- Organization switcher dropdown (placeholder)
- User profile dropdown
- Keyboard navigation support
- Collapsible sections

#### 3.3 Accessibility Enhancements

- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- Focus management

### Phase 4: Advanced Features (Future)

**Goal:** Add enterprise-level navigation features

#### 4.1 Context-Aware Navigation

- Show current SmartMenu in navigation when in detail view
- Breadcrumb-style navigation for deep pages
- Recent items or favorites

#### 4.2 Organization Management

- Organization switching functionality
- Multi-tenant support
- Role-based navigation

#### 4.3 Enhanced User Experience

- Search functionality
- Quick actions
- Notifications integration
- Customizable navigation

## Technical Requirements

### Dependencies

- Existing shadcn/ui components
- Lucide React icons
- React Router for navigation
- Tailwind CSS for styling

### File Structure

```
src/components/navigation/
├── OrganizationSwitcher.tsx
├── NavigationSection.tsx
├── NavigationItem.tsx
├── UserProfile.tsx
├── NavigationMenu.tsx
└── __tests__/
    ├── OrganizationSwitcher.test.tsx
    ├── NavigationSection.test.tsx
    ├── NavigationItem.test.tsx
    └── UserProfile.test.tsx
```

### Testing Strategy

- Unit tests for each component
- Integration tests for navigation flow
- Accessibility testing
- Responsive design testing
- E2E tests for critical paths

## Success Criteria

### Functional Requirements

- [ ] All existing navigation functionality preserved
- [ ] Mobile responsiveness maintained
- [ ] Accessibility standards met (WCAG 2.1 AA)
- [ ] Keyboard navigation fully functional
- [ ] Screen reader compatibility

### Design Requirements

- [ ] Consistent with shadcn design patterns
- [ ] Modern, professional appearance
- [ ] Clear visual hierarchy
- [ ] Smooth animations and transitions
- [ ] Responsive across all screen sizes

### Technical Requirements

- [ ] TypeScript interfaces properly defined
- [ ] Component reusability demonstrated
- [ ] Performance optimized
- [ ] No breaking changes to existing functionality
- [ ] Comprehensive test coverage

## Risk Assessment

### Low Risk

- Component creation and styling
- Basic functionality implementation
- Mobile responsiveness

### Medium Risk

- Integration with existing Layout component
- Maintaining backward compatibility
- Accessibility compliance

### High Risk

- Breaking existing navigation functionality
- Performance impact on large navigation trees
- User experience disruption during transition

## Migration Strategy

### Phase 1: Parallel Development

- Create new components alongside existing ones
- Maintain existing functionality
- Test new components in isolation

### Phase 2: Gradual Integration

- Replace sections one at a time
- Maintain fallback to old navigation
- Monitor for issues

### Phase 3: Full Migration

- Complete replacement of old navigation
- Remove deprecated code
- Update documentation

## Timeline

| Phase   | Duration | Deliverables               |
| ------- | -------- | -------------------------- |
| Phase 1 | 1 week   | Core navigation components |
| Phase 2 | 1 week   | Layout integration         |
| Phase 3 | 1 week   | Visual design and polish   |
| Phase 4 | Future   | Advanced features          |

**Total Estimated Time:** 3 weeks for core implementation

## Next Steps

1. **Immediate Priority:** Fix CI/CD issues
2. **Phase 1 Start:** Create OrganizationSwitcher component
3. **Testing:** Implement comprehensive test suite
4. **Documentation:** Update component documentation
5. **Review:** Code review and stakeholder approval

---

_This document should be updated as the implementation progresses and requirements evolve._
