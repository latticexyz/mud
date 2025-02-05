---
"@latticexyz/store-consumer": patch
"@latticexyz/store": patch
"@latticexyz/world-module-erc20": patch
"@latticexyz/world": patch
---

Updates `WithWorld` to be a `System`, so that functions in child contracts that use the `onlyWorld` or `onlyNamespace` modifiers must be called through the world in order to safely support calls from systems.
