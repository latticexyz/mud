---
"@latticexyz/cli": minor
---

- update the `set-version` cli command to work with the new release process by adding two new options:
  - `--tag`: install the latest version of the given tag. For snapshot releases tags correspond to the branch name, commits to `main` result in an automatic snapshot release, so `--tag main` is equivalent to what used to be `-v canary`
  - `--commit`: install a version based on a given commit hash. Since commits from `main` result in an automatic snapshot release it works for all commits on main, and it works for manual snapshot releases from branches other than main
- `set-version` now updates all `package.json` nested below the current working directory (expect `node_modules`), so no need for running it each workspace of a monorepo separately.

Example:

```bash
pnpm mud set-version --tag main && pnpm install
pnpm mud set-version --commit db19ea39 && pnpm install
```
