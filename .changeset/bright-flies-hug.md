---
"@latticexyz/cli": patch
---

`dev-contracts` will no longer bail when there was an issue with deploying (e.g. typo in contracts) and instead wait for file changes before retrying.
