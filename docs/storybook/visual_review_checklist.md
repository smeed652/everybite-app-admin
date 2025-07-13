# Storybook Visual Review Checklist

Use this when finishing or reviewing **any** story. Mark items as complete in PRs.

## 1. Render & Interaction
- [ ] Story renders without red error overlay or console errors.
- [ ] Component interactive states work (hover, focus, active, disabled).
- [ ] Controls panel updates props and preview reacts live.

## 2. Layout & Spacing
- [ ] No unexpected overflow or scrollbars at 1280×800 viewport.
- [ ] Adequate whitespace between component and edges (8–24 px).
- [ ] Content scales down to mobile viewport (375 px) without clipping.

## 3. Theme & Color
- [ ] Light mode looks correct.
- [ ] Dark-mode toggle shows acceptable contrast.
- [ ] Brand colors match Tailwind theme tokens.

## 4. Accessibility
- [ ] a11y addon shows **0 violations**.
- [ ] Interactive elements are keyboard-focusable in logical order.
- [ ] ARIA labels/roles present where appropriate.

## 5. States & Edge Cases
- [ ] Default, hover/focus, disabled variants demonstrated.
- [ ] Loading / empty / error states (use MSW mocks where needed).
- [ ] Long text truncation or wrapping handled gracefully.

## 6. Docs Tab
- [ ] Title and description explain component purpose.
- [ ] Props table generated and accurate.
- [ ] Usage example snippet present.

## 7. Visual Regression (Chromatic/Percy)
- [ ] Snapshot added or updated deliberately (review diffs).

## 8. Performance
- [ ] Canvas loads in <100 ms on local machine.
- [ ] No heavy console warnings (e.g., prop-type errors).

---
Maintain this checklist; add new global requirements (e.g., RTL support) as the design system evolves.
