---
"@latticexyz/gas-report": minor
---

Allow the `gas-report` CLI to parse logs via `stdin`, so it can be used with custom test commands (e.g. `mud test`).

Usage:

```sh
# replace `forge test -vvv` with the custom test command
GAS_REPORTER_ENABLED=true forge test -vvv | pnpm gas-report --stdin
```
