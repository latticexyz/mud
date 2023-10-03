---
"@latticexyz/gas-report": patch
---

Pass through `stdin` logs in `gas-report`. Since the script piping in logs to `gas-report` can be long-running, it is useful to see its logs to know if it's stalling.
