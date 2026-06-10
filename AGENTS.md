# Agent Git Guide

## Identity (global)
- Name: `Developer`
- Email: `developer@example.com`

## Remote
- Origin: `git@github.com:IDCLofficial/ministry-of-primary-education.git`
- Auth: SSH key

## Workflow

### Branch strategy
- **`main`** — production. Never commit directly.
- **`fixes`** — upstream staging branch.
- Feature branches branch off `main` or from other feature branches:
  - `fixes-result-checking-updates`
  - `signatures-and-constants` (current)
- Always push your current feature branch, not `main`.

### Before committing
1. `git status` — see what's changed
2. `git diff --stat` — overview of changes
3. `git diff` — review actual diffs
4. Never stage secrets, `.env`, `node_modules/`, large build artifacts

### Commit style
- Use conventional commits: `type: short description`
- Types: `feat:`, `fix:`, `refactor:`, `revert:`, `docs:`, `chore:`
- All lowercase, no period at end
- Present tense, imperative mood
- Examples: `fix: handle missing fields gracefully`, `feat: add download button to student info card`

### Commit & push
```bash
git add <files>
git commit -m "type: description"
git push origin <current-branch>
```

### Amending (only if commit hasn't been pushed yet)
```bash
git add <files>
git commit --amend --no-edit
```

## Project conventions
- `npm run lint` / `npx tsc --noEmit` to verify before pushing
- No git hooks are active (all `.sample` files only)
- `.gitignore` covers: `node_modules/`, `.next/`, `out/`, `build/`, `coverage/`, `.DS_Store`
