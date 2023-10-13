---
"@latticexyz/cli": minor
---

Added a `--alwaysRunPostDeploy` flag to deploys (`deploy`, `test`, `dev-contracts` commands) to always run `PostDeploy.s.sol` script after each deploy. By default, `PostDeploy.s.sol` is only run once after a new world is deployed.

This is helpful if you want to continue a deploy that may not have finished (due to an error or otherwise) or to run deploys with an idempotent `PostDeploy.s.sol` script.
