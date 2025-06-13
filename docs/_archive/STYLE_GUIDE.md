# Project Style Guide

This document outlines the UI/UX design principles, visual styling, component guidelines, and accessibility standards for our projects. Adhering to this guide ensures a consistent, modern, and user-friendly experience.

## I. Core UI/UX Principles

-   **Clarity & Simplicity:** Interfaces should be intuitive and easy to understand. Avoid clutter and unnecessary complexity.
-   **Consistency:** UI elements, interactions, and terminology should be consistent throughout the application.
-   **User Control & Freedom:** Users should feel in control. Provide clear navigation, undo options where appropriate, and prevent errors.
-   **Feedback:** Provide timely and clear feedback for user actions (e.g., loading states, success/error messages).
-   **Efficiency:** Design workflows that allow users to accomplish tasks efficiently.
-   **Accessibility (WCAG):** Strive to meet WCAG AA standards. Ensure designs are usable by people with diverse abilities.
-   **Terminology Consistency**: Maintain consistent terminology throughout the application, UI text, code comments, and documentation. For instance, the project has standardized on using 'SmartMenu' instead of 'Widget' where applicable to align with product branding. This consistency should extend to the naming of corresponding code components (e.g., a UI panel labeled 'Branding Panel' would ideally have a component named `BrandingPanel.tsx` or similar, following the conventions in `DEVELOPMENT_GUIDE.md` and `PROJECT_UNIFICATION_PLAN.md`).

## II. Visual Design

### A. Color Palette
-   **Primary Accent Color:** Brand Blue (e.g., `#007bff` - specify the exact hex code for the project). Used for primary actions, links, and key highlights.
-   **Secondary Colors:** Shades of blue, grays, and white.
    -   Light Blue (e.g., `#ADD8E6`)
    -   Dark Blue (e.g., `#0056b3`)
    -   Neutral Grays (e.g., `#f8f9fa` for backgrounds, `#6c757d` for secondary text, `#ced4da` for borders).
    -   White (e.g., `#FFFFFF`) for backgrounds and text on dark backgrounds.
-   **Status Colors:**
    -   Success: Green (e.g., `#28a745`)
    -   Error/Danger: Red (e.g., `#dc3545`)
    -   Warning: Yellow/Orange (e.g., `#ffc107`)
    -   Info: Teal/Light Blue (e.g., `#17a2b8`)

### B. Typography
-   **Primary Font:** Open Sans (for body text, labels).
-   **Secondary Font (Headings):** Roboto (for headings, prominent titles).
-   **Font Weights:**
    -   Regular (400) for body text.
    -   Semi-Bold (600) for labels, sub-headings.
    -   Bold (700) for main headings, important text.
-   **Font Sizes (example scale):**
    -   Body: 14px-16px
    -   Small Text/Captions: 12px
    -   Sub-headings: 18px-20px
    -   Main Headings: 24px-32px
-   **Line Height:** Aim for 1.5 - 1.7 for body text for readability.

### C. Spacing & Layout
-   **Responsive Grid System:** Utilize a responsive grid (e.g., MUI Grid, CSS Grid/Flexbox) for page layouts.
-   **Padding & Margins:** Use a consistent spacing scale (e.g., multiples of 4px or 8px).
    -   Increased padding within components for a less cluttered look.
-   **Border Radius:** Subtle border radius (e.g., 4px-8px) for a modern feel on cards, buttons, inputs.

### D. Logo Usage
-   *(Guidelines on logo variations, placement, sizing, and clear space will be added here.)*

### E. Iconography
-   **Preferred Icon Set:** (e.g., Material Icons, Font Awesome - specify the set)
-   **Usage:** Guidelines for icon size, color, and context of use.
-   **Custom Icons:** Process for requesting or creating custom icons.

### F. Imagery and Illustrations
-   **Style:** (e.g., Photography, custom illustrations, stock imagery guidelines)
-   **Usage:** Guidelines for aspect ratios, resolutions, and placement.
-   **Tone:** Ensure imagery aligns with the brand's tone and message.

## III. Component Styling Guidelines

### A. General
-   **Modern & Clean:** Strive for a modern, uncluttered appearance.
-   **Interactive Elements:**
    -   Buttons, links, and clickable items should have clear hover and focus states (e.g., subtle background change, underline, border).
    -   Use pointer cursor for clickable elements.
-   **Shadows:** Use subtle shadows for depth on elements like cards or modals.
-   **Primary UI Library (Material-UI)**: This project primarily uses Material-UI (MUI) as its component library. Leverage MUI components (e.g., `Button`, `TextField`, `Card`, `Grid`) and its styling capabilities (`sx` prop, `styled()` API, theming) wherever possible. This promotes UI consistency, reduces the need for custom CSS, and aligns with the project's development standards. Refer to `DEVELOPMENT_GUIDE.md` for any project-specific MUI theming details.

### B. Specific Components (Examples)
-   **Headers/Titles:**
    -   Stronger header hierarchy.
    -   Use primary accent color (blue) for main page titles or section headers, potentially with a subtle divider underneath.
-   **Buttons:**
    -   Primary actions: Brand blue background, white text.
    -   Secondary/Cancel actions: Light gray or white background, blue text or dark gray text.
    -   Right-align action buttons (Save/Cancel) in forms or dialogs.
-   **Inputs & Forms (e.g., MUI TextField):**
    -   Full-width for primary input fields where appropriate (e.g., "Order URL").
    -   Clear labels, placeholder text, and validation messages.
    -   Bold labels, potentially placed below for elements like switches or grouped radio buttons.
-   **Switches & Selects:**
    -   Can be grouped in a single row, evenly spaced, with bold labels below if appropriate for the context.
-   **Color Pickers:**
    -   Display in a single row if multiple.
    -   Each with a clear label (e.g., underneath).
    -   Subtle shadow and pointer cursor.
-   **Navigation:**
    -   Sidebar navigation is preferred for admin panels.
    -   Clear visual distinction for active/selected navigation items.
-   **Modals/Dialogs:**
    -   *(Guidelines for backdrop, positioning, header/footer, close mechanisms, and focus management.)*
    -   **States:** (e.g., default, with forms, confirmation dialogs)
-   **Cards:**
    -   *(Guidelines for structure, shadow, hover effects, and content hierarchy within cards.)*
    -   **Variants:** (e.g., informational, actionable, with media)
-   **Tables:**
    -   *(Guidelines for headers, row styling, pagination, sorting indicators, and responsive behavior.)*
    -   **States:** (e.g., hover rows, selected rows)
    -   **Inline Editing**: For data tables where quick modifications are beneficial (e.g., SmartMenu list), inline editing is a preferred interaction pattern. Design and implement inline editors that are intuitive and integrate smoothly with table rows. This might involve using popovers (like `SmartMenuInlineEditor.tsx`), expandable row details, or directly editable cells, depending on the complexity of the data being edited.
-   **Tooltips & Popovers:**
    -   *(Guidelines for appearance, positioning, trigger behavior, and content length.)*
-   **Notifications & Alerts:**
    -   *(Guidelines for different types (info, success, warning, error), positioning, and dismissibility.)*
    -   **Variants:** (e.g., toast, inline, banner)

## IV. Tone of Voice and Copywriting

-   **Overall Tone:** (e.g., Professional yet friendly, clear and concise, encouraging)
-   **Terminology:** Use consistent and clear terminology. Avoid jargon where possible or explain it.
-   **Headings & Titles:** Should be informative and concise.
-   **Button Text & CTAs:** Action-oriented and clear (e.g., "Save Changes", "Learn More", "Get Started").
-   **Error Messages:** Empathetic, clear, and instructive. Guide the user on how to resolve the issue.
-   **Success Messages:** Affirmative and clear.
-   **Empty States:** Encouraging and provide guidance on next steps.

## V. Tools and Resources

-   **Design System/UI Kit:** (Link to Figma, Sketch, or other design files)
-   **Component Library:** (Link to Storybook, or component documentation). If Storybook is used, its organizational structure (e.g., story paths and hierarchies) should mirror the new component directory structure outlined in the `DEVELOPMENT_GUIDE.md` to ensure easy navigation and discovery.
-   **Brand Assets:** (Link to logo files, approved imagery)
-   **Accessibility Checkers:** (e.g., WAVE, Axe)

## VI. Accessibility (WCAG AA)

-   **Keyboard Navigation:** All interactive elements must be focusable and operable via keyboard.
-   **Semantic HTML:** Use appropriate HTML5 tags for structure.
-   **ARIA Attributes:** Use ARIA roles and attributes where necessary to enhance accessibility for assistive technologies.
-   **Color Contrast:** Ensure sufficient color contrast between text and background (at least 4.5:1 for normal text, 3:1 for large text).
-   **Image Alt Text:** Provide descriptive alt text for all informative images.
-   **Form Labels:** All form inputs must have associated labels.
-   **Focus Management:** Manage focus appropriately, especially in modals and dynamic content changes.

---
*This style guide is a living document. It should be updated as design language evolves and new components are introduced. Regular reviews should be scheduled to ensure its relevance and accuracy.*
