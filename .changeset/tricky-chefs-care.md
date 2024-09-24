---
"@latticexyz/cli": patch
---

Adjusted deploy order so that the world deploy happens before everything else to avoid spending gas on system contract deploys, etc. if a world cannot be created first.
