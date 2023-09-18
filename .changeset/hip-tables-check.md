---
"@latticexyz/store": major
"@latticexyz/world": major
---

Store's `getRecord` has been updated to return `staticData`, `encodedLengths`, and `dynamicData` instead of a single `data` blob, to match the new behaviour of Store setter methods.

If you use codegenerated libraries, you will only need to update `encode` calls.

```diff
- bytes memory data = Mixed.encode(mixed.u32, mixed.u128, mixed.a32, mixed.s);
+ (bytes memory staticData, PackedCounter encodedLengths, bytes memory dynamicData) = Mixed.encode(mixed.u32, mixed.u128, mixed.a32, mixed.s);
```
