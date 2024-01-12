---
"@latticexyz/store": patch
---

Storage events are now emitted after "before" hooks, so that the resulting logs are now correctly ordered and reflect onchain logic. This resolves issues with store writes and event emissions happening in "before" hooks.
