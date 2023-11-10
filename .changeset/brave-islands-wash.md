---
"@latticexyz/cli": minor
---

Deploys now validate contract size before deploying and throws an error when a contract is over the size limit (24kb). This should help with the most common "evm revert" errors during system and module contract deploys.
