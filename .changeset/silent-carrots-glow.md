---
"@latticexyz/cli": minor
---

CLI `deploy`, `test`, `dev-contracts` no longer run `forge clean` before each deploy. We previously cleaned to ensure no outdated artifacts were checked into git (ABIs, typechain types, etc.). Now that all artifacts are gitignored, we can let forge use its cache again.
