---
"@latticexyz/cli": patch
"@latticexyz/common": minor
"@latticexyz/store": minor
"@latticexyz/world": patch
---

Generated table libraries now have a set of functions prefixed with `_` that always use their own storage for read/write.
This saves gas for use cases where the functionality to dynamically determine which `Store` to use for read/write is not needed, e.g. root systems in a `World`, or when using `Store` without `World`.

We decided to continue to always generate a set of functions that dynamically decide which `Store` to use, so that the generated table libraries can still be imported by non-root systems.

```solidity
library Counter {
  // Dynamically determine which store to write to based on the context
  function set(uint32 value) internal;

  // Always write to own storage
  function _set(uint32 value) internal;

  // ... equivalent functions for all other Store methods
}
```
