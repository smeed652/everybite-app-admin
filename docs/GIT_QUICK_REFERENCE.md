# Git Workflow Quick Reference

## 🚀 Daily Commands

| Task                 | Command                                           |
| -------------------- | ------------------------------------------------- |
| Check status         | `./scripts/git-workflow.sh status`                |
| Start feature        | `./scripts/git-workflow.sh create-feature <name>` |
| Finish feature       | `./scripts/git-workflow.sh finish-feature <name>` |
| Deploy to staging    | `./scripts/git-workflow.sh deploy-staging`        |
| Deploy to production | `./scripts/git-workflow.sh deploy-production`     |

## 🚨 Emergency Commands

| Task          | Command                                          |
| ------------- | ------------------------------------------------ |
| Create hotfix | `./scripts/git-workflow.sh create-hotfix <name>` |
| Deploy hotfix | `./scripts/git-workflow.sh finish-hotfix <name>` |

## 📋 Branch Flow

```
feature branch → develop → staging → main
     ↑                                    ↓
     └────────── hotfix branch ←──────────┘
```

## 🔒 Branch Protection

- **main**: Requires PR + approval + tests
- **staging**: Requires PR + approval + tests
- **develop**: Requires PR + approval

## 📝 Commit Messages

```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug"
git commit -m "docs: update documentation"
git commit -m "chore: update dependencies"
```

## 🌍 Environments

| Branch    | Environment | URL                    |
| --------- | ----------- | ---------------------- |
| `main`    | Production  | AWS Amplify Production |
| `staging` | Staging     | AWS Amplify Staging    |
| `develop` | Development | AWS Amplify Develop    |

## ⚡ Common Workflows

### New Feature Development

```bash
./scripts/git-workflow.sh create-feature my-feature
# ... make changes ...
git add . && git commit -m "feat: implement my feature"
./scripts/git-workflow.sh finish-feature my-feature
```

### Deploy to Production

```bash
./scripts/git-workflow.sh deploy-staging
# ... test in staging ...
./scripts/git-workflow.sh deploy-production
```

### Emergency Fix

```bash
./scripts/git-workflow.sh create-hotfix critical-fix
# ... make urgent changes ...
git add . && git commit -m "fix: resolve critical issue"
./scripts/git-workflow.sh finish-hotfix critical-fix
```

## 🆘 Troubleshooting

| Issue             | Solution                       |
| ----------------- | ------------------------------ |
| Merge conflicts   | Resolve manually, then commit  |
| Wrong branch      | Use `git checkout <branch>`    |
| Lost changes      | Check `git reflog`             |
| Force push needed | Only on `develop` (team leads) |

## 📞 Need Help?

- Check `./scripts/git-workflow.sh help`
- Read full guide: `docs/GIT_WORKFLOW.md`
- Ask team lead for assistance
