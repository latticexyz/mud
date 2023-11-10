---
"@latticexyz/cli": minor
---

Deploys now validate contract size before deploying and warns when a contract is over or close to the size limit (24kb). This should help identify the most common cause of "evm revert" errors during system and module contract deploys.
