# Feature Branch Workflow

## Branch Strategy

The `main` branch is the production branch. It should always be stable and deployable.

### Branch Naming Convention

```
main                          # Production branch (stable, deployable)
├── develop                    # Development integration branch (optional)
├── feature/cart-system       # Feature branch for cart implementation
├── feature/checkout-flow     # Feature branch for checkout
├── fix/product-edit-bug      # Bug fix branch
├── refactor/auth-module      # Refactoring branch
└── hotfix/security-patch     # Urgent production fix
```

### Workflow

1. **Create a feature branch from main:**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-name
   ```

2. **Develop and commit:**
   ```bash
   git add -A
   git commit -m "feat: description of change"
   ```

3. **Push the feature branch:**
   ```bash
   git push -u origin feature/your-feature-name
   ```

4. **Create a Pull Request on GitHub:**
   - Base: main
   - Title: clear description
   - Review: verify lint, type check, build pass

5. **Merge to main only after:**
   - Lint passes (`npm run lint`)
   - Type check passes (`npx tsc --noEmit`)
   - Build succeeds (`npm run build`)
   - Manual testing if needed

6. **After merge, delete the feature branch:**
   ```bash
   git checkout main
   git pull origin main
   git branch -d feature/your-feature-name
   git push origin --delete feature/your-feature-name
   ```

### Commit Message Convention

```
feat:     new feature
fix:      bug fix
refactor: code restructuring (no new features)
style:    formatting, CSS changes
docs:     documentation only
test:     adding tests
chore:    build tasks, configs, dependencies
hotfix:   urgent production fix
```

### Rules

- NEVER commit directly to `main` for new features
- ALWAYS create a feature branch
- ALWAYS verify lint + type check + build before merging
- Keep feature branches short-lived (merge within a few days)
- Squash commits on merge for clean history