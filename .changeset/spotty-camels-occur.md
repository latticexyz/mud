---
"@latticexyz/cli": patch
"@latticexyz/world-module-metadata": patch
---

Added metadata module to be automatically installed during world deploy. This module allows for tagging any resource with arbitrary metadata. Internally, we'll use this to tag resources with labels onchain so that we can use labels to create a MUD project from an existing world.
