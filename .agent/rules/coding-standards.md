---
description: "KalshIQ coding standards — PEP 8 for Python, TypeScript strict for frontend."
---

# KalshIQ Coding Standards

## Python (Backend)

1. **PEP 8 compliance** — all Python code must follow PEP 8. Maximum line length: 120 characters.
2. **Type hints** — all function signatures must include type annotations (args + return).
3. **Docstrings** — every module, class, and public function must have a Google-style docstring.
4. **Imports** — use `isort` ordering: stdlib → third-party → local. One import per line for `from` imports.
5. **Naming** — `snake_case` for functions/variables, `PascalCase` for classes, `UPPER_SNAKE_CASE` for constants.
6. **No bare `except`** — always specify the exception type.
7. **Logging** — use the `logging` module, never `print()` in production code.
8. **Security** — never log secrets, API keys, or private key contents.

## TypeScript (Frontend)

1. **Strict mode** — `tsconfig.json` must have `"strict": true`.
2. **Explicit types** — avoid `any`. Use `unknown` if the type is truly unknown, then narrow.
3. **Component naming** — PascalCase for React components, kebab-case for file names.
4. **Props interfaces** — define explicit `Props` interfaces for all components.
5. **No default exports** — prefer named exports for better refactoring support (except for Next.js pages/layouts).
6. **Client/Server** — always mark client components with `"use client"` at the top. Server components are the default.
7. **ESLint** — Next.js ESLint config must pass with zero warnings.

## General

- Commit messages: Conventional Commits format (`feat:`, `fix:`, `chore:`, etc.).
- Environment variables: never hardcode secrets. Use `.env` files excluded from Git.
- All new files must include a top-level module docstring or comment explaining purpose.
