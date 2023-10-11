---
"@latticexyz/cli": major
---

`deploy`, `test`, `dev-contracts` were overhauled using a declarative deployment approach under the hood. Deploys are now idempotent and re-running them will introspect the world and figure out the minimal changes necessary to bring the world into alignment with its config: adding tables, adding/upgrading systems, changing access control, etc.

The following CLI arguments are now removed from these commands:

- `--debug` (you can now adjust CLI output with `DEBUG` environment variable, e.g. `DEBUG=mud:*`)
- `--priorityFeeMultiplier` (now calculated automatically)
- `--disableTxWait` (everything is now parallelized with smarter nonce management)
- `--pollInterval` (we now lean on viem defaults and we don't wait/poll until the very end of the deploy)
