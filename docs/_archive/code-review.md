# Code Review Guidelines

## Review Process

### Before Submitting a PR
1. Self-review your changes
2. Ensure tests pass
3. Update documentation if needed
4. Follow the PR template

### Review Checklist
- [ ] Code is functional and meets requirements
- [ ] Follows project coding standards
- [ ] Includes appropriate tests
- [ ] Documentation is updated
- [ ] No commented-out code
- [ ] No console.log statements in production code
- [ ] Error handling is appropriate
- [ ] Performance considerations addressed

## Code Quality Standards

### General
- Follow SOLID principles
- Keep functions small and focused
- Use meaningful names
- Follow DRY principle
- Keep files under 400 lines

### JavaScript/TypeScript
- Use TypeScript for type safety
- Prefer const over let
- Use arrow functions for callbacks
- Avoid any type
- Use optional chaining and nullish coalescing

### React Specific
- Use functional components with hooks
- Follow React Hooks rules
- Use proper prop types or TypeScript interfaces
- Memoize expensive calculations
- Use proper dependency arrays

## Review Etiquette

### As a Reviewer
- Be constructive and kind
- Explain the "why" behind suggestions
- Focus on the code, not the person
- Acknowledge good patterns
- Be timely with reviews

### As a Reviewee
- Be open to feedback
- Ask for clarification if needed
- Don't take feedback personally
- Explain your reasoning when pushing back
- Thank reviewers for their time

## Common Issues to Flag

### Security
- Hardcoded secrets
- SQL injection risks
- XSS vulnerabilities
- Insecure dependencies

### Performance
- Unnecessary re-renders
- Memory leaks
- Large bundle sizes
- Inefficient data fetching

### Maintainability
- Overly complex logic
- Magic numbers/strings
- Inconsistent patterns
- Missing error handling

## Review Tools
- ESLint for code quality
- Prettier for formatting
- SonarQube for static analysis
- BundleAnalyzer for bundle size

## Review Response Time
- Urgent: 2 hours
- Normal: 24 hours
- Low priority: 48 hours

## Escalation Process
1. Discuss in PR comments
2. Schedule a pairing session if needed
3. Involve tech lead if no consensus
4. Document decisions in PR

## Continuous Improvement
- Retrospect on review process
- Share learnings with team
- Update guidelines as needed
- Track review metrics
