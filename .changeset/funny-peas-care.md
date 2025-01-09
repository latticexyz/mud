---
"@latticexyz/explorer": patch
---

Added support for ERC-4337 bundled transactions, monitoring them by either listening to chain blocks or using the `observer` transport wrapper. Each user operation within a bundled transaction is displayed as an individual transaction in the Observe tab.
