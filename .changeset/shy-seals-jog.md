---
"@latticexyz/world-modules": patch
"@latticexyz/store": patch
"@latticexyz/world": patch
---

Refactor the codebase in a number of ways:

- Simplified Schema library validation loop by prioritizing static and dynamic fields.
- Replaced redundant Memory.copy with identity precompile call.
- Optimized leftMask function by returning a right mask directly.
- Resolved ResourceId.sol `using` inconsistency and reduced duplication.
- Standardized integer base in assembly blocks (hexadecimal/decimal).
- Aligned pointer usage in Slice library (self.pointer()).
- Improved EIP-165 support using interface type ID.
- Refactored FieldLayout.numFields using numStaticFields and numDynamicFields.
- Addressed inconsistency in Slice.sol and Schema.sol leading underscores.
- Standardized initialization (zero/default) across the codebase.
- Optimized StoreCore.getFieldLayout function using Tables.\_getFieldLayout.
- Ensured consistency in WorldContextConsumer.\_world using StoreSwitch.
- Made WorldFactory `coreModule` immutable as it's never changed.
- Corrected parameter type in WorldRegistrationSystem.registerSystem.
- Simplified Bytes library slice functions with named return variables.
- Streamlined getSubslice validation condition with a concise statement.
- Eliminated unnecessary extcodesize opcode in Create2.deploy call check.
