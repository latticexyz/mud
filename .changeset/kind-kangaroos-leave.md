---
"@latticexyz/cli": patch
---

Fixed a dev runner bug where the state block of a previous deploy was not updated during a redeploy, causing failed deploys due to fetching outdated world state.
