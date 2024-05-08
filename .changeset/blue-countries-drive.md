---
"@latticexyz/cli": patch
---

The deploy CLI now uses logs to find registered function selectors and their corresponding function signatures.
Previously only function signatures were fetched via logs and then mapped to function selectors via `getRecord` calls,
but this approach failed for namespaced function selectors of non-root system,
because the function signature table includes both the namespaced and non-namespaced signature but the function selector table only includes the namespaced selector that is registered on the world. 
