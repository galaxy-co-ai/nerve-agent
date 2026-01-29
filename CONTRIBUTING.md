# Contributing to Nerve Agent

Thank you for your interest in contributing to Nerve Agent! This document provides guidelines and information for contributors.

## Getting Started

1. **Fork the repository** and clone it locally
2. **Install dependencies**: `cd apps/web && npm install`
3. **Set up environment**: Copy `.env.example` to `.env.local` and fill in required values
4. **Run the dev server**: `npm run dev`

## Development Workflow

### Before You Start

- Check [existing issues](https://github.com/galaxy-co-ai/nerve-agent/issues) to see if your idea is already being discussed
- For large changes, open an issue first to discuss your approach
- Read the specs in `/specs/` to understand the system design

### Making Changes

1. Create a new branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Run validation: `npm run validate` (TypeScript + build check)
4. Commit with clear messages (see below)
5. Push and open a Pull Request

### Commit Messages

Use clear, descriptive commit messages:

```
feat: Add sprint velocity chart
fix: Resolve timer not stopping on task completion
docs: Update API documentation
style: Format code with prettier
refactor: Extract time tracking logic to separate module
test: Add tests for project creation
```

## Code Standards

### TypeScript

- Strict mode is enabled
- Use proper types (avoid `any`)
- Export types from dedicated files when reused

### React/Next.js

- Server Components by default
- Client Components only when needed (interactivity, hooks)
- Use `use server` for server actions

### Styling

- Tailwind CSS for all styling
- shadcn/ui components (we have Pro access)
- Follow existing patterns in the codebase

### Database

- Prisma for all database operations
- Add migrations for schema changes
- Update `specs/data-models.md` for significant model changes

## Pull Request Process

1. **Fill out the PR template** completely
2. **Link related issues** using "Fixes #123" or "Relates to #123"
3. **Ensure CI passes** - PRs with failing checks won't be reviewed
4. **Request review** from maintainers
5. **Address feedback** promptly

### PR Checklist

- [ ] Code compiles without errors (`npm run typecheck`)
- [ ] Build succeeds (`npm run build`)
- [ ] No new TypeScript errors or warnings
- [ ] Follows existing code patterns
- [ ] Includes tests for new functionality (when applicable)
- [ ] Updates documentation (when applicable)

## What We're Looking For

### High-Priority Contributions

- Bug fixes with clear reproduction steps
- Performance improvements with benchmarks
- Accessibility improvements
- Documentation improvements
- Test coverage

### Feature Contributions

Before building a new feature:
1. Check if there's a spec for it in `/specs/`
2. Open an issue to discuss if no spec exists
3. Get approval before starting significant work

## Communication

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions, ideas, and general conversation
- **Pull Requests**: Code contributions

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before participating.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
