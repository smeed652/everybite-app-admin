# EveryBite Admin - Style Guide

This document defines the design system and UI/UX standards for the EveryBite Admin, ensuring consistency and accessibility across the application.

## Table of Contents
- [Design Principles](#design-principles)
- [Color Palette](#color-palette)
- [Typography](#typography)
- [Spacing & Layout](#spacing--layout)
- [Component Library](#component-library)
- [Accessibility](#accessibility)
- [Design Resources](#design-resources)

## Design Principles

### 1. Clarity & Simplicity
- Interfaces should be intuitive and minimize cognitive load
- Use clear, concise language
- Eliminate unnecessary elements

### 2. Consistency
- Maintain uniform styling across all components
- Use consistent spacing, colors, and interactions
- Follow established patterns throughout the application

### 3. Efficiency
- Design for common user tasks
- Minimize clicks and scrolling
- Provide keyboard shortcuts for power users

### 4. Feedback
- Provide immediate feedback for user actions
- Use appropriate loading states
- Show success/error messages clearly

## Color Palette

### Primary Colors
- **Primary Blue**: `#2563eb` (Actions, buttons, links)
- **Primary Hover**: `#1d4ed8`
- **Primary Active**: `#1e40af`

### Secondary Colors
- **Success**: `#10b981`
- **Warning**: `#f59e0b`
- **Error**: `#ef4444`
- **Info**: `#3b82f6`

### Neutral Colors
- **Gray 900**: `#111827` (Text)
- **Gray 700**: `#374151` (Secondary text)
- **Gray 300**: `#d1d5db` (Borders)
- **Gray 100**: `#f3f4f6` (Backgrounds)
- **White**: `#ffffff` (Cards, content)

## Typography

### Font Family
- **Primary**: Inter (via Google Fonts)
- **Monospace**: JetBrains Mono (for code)

### Font Sizes
- **Display**: 3rem (48px)
- **Heading 1**: 2.25rem (36px)
- **Heading 2**: 1.875rem (30px)
- **Heading 3**: 1.5rem (24px)
- **Heading 4**: 1.25rem (20px)
- **Body Large**: 1.125rem (18px)
- **Body**: 1rem (16px)
- **Small**: 0.875rem (14px)
- **X-Small**: 0.75rem (12px)

### Font Weights
- **Regular**: 400
- **Medium**: 500
- **Semi-bold**: 600
- **Bold**: 700

## Spacing & Layout

### Spacing Scale
- **Base Unit**: 4px
- **Scale**: 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 72, 80, 96, 128, 160, 192, 224, 256

### Layout
- **Max Content Width**: 1280px
- **Sidebar Width**: 256px (collapsed: 72px)
- **Header Height**: 64px
- **Border Radius**: 6px (default), 12px (cards), 9999px (pill)
- **Box Shadow**: 
  - sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)
  - md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
  - lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)

## Component Library

### Buttons
- **Primary**: Blue background, white text
- **Secondary**: White background, blue border, blue text
- **Tertiary**: Transparent background, blue text
- **Danger**: Red background, white text
- **Sizes**: Small (32px), Medium (40px), Large (48px)
- **States**: Default, Hover, Active, Focus, Disabled

### Forms
- **Input Height**: 40px
- **Input Padding**: 12px
- **Label**: 14px, 600 weight, 4px bottom margin
- **Helper Text**: 12px, 400 weight, 4px top margin
- **Error State**: Red border, red helper text

### Data Display
- **Cards**: White background, border radius 12px, shadow-sm
- **Tables**: 
  - Header: 14px, 600 weight, gray.700
  - Cell: 14px, 400 weight, gray.900
  - Row Hover: gray.50 background
  - Border: 1px solid gray.200

### Navigation
- **Sidebar**: 
  - Active Item: blue.50 background, blue.600 text, blue.600 left border
  - Hover: gray.50 background
  - Icon Size: 20px
  - Text: 14px, 500 weight
- **Breadcrumbs**: 14px, gray.700

## Accessibility

### Color Contrast
- **Normal Text**: 4.5:1 minimum
- **Large Text (18px+)**: 3:1 minimum
- **UI Components**: 3:1 minimum

### Keyboard Navigation
- All interactive elements must be focusable
- Visible focus states for keyboard users
- Logical tab order
- Skip to main content link

### ARIA
- Use semantic HTML elements
- Provide appropriate ARIA attributes
- Test with screen readers

## Design Resources

### Design Tokens
```typescript
// colors.ts
export const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  // ... other colors
};

// spacing.ts
export const spacing = {
  px: '1px',
  0.5: '0.125rem', // 2px
  1: '0.25rem',    // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem',     // 8px
  // ... up to 96 (384px)
};
```

### Design System
- [Figma Design System](https://www.figma.com/your-design-system)
- [Storybook Components](http://localhost:6006/)
- [Icon Library](https://lucide.dev/)

### Development Resources
- [Tailwind CSS](https://tailwindcss.com/)
- [Headless UI](https://headlessui.com/)
- [Radix UI](https://www.radix-ui.com/)

---
*This is a living document. Last updated: June 2025*
