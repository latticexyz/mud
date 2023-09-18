---
"@latticexyz/store": major
"@latticexyz/world": patch
---

Store's `getRecord` has been updated to return `staticData`, `encodedLengths`, and `dynamicData` instead of a single `data` blob, to match the new behaviour of Store setter methods.

If you use codegenerated libraries, you will only need to update `encode` calls.

```diff
- bytes memory data = Position.encode(x, y);
+ (bytes memory staticData, PackedCounter encodedLengths, bytes memory dynamicData) = Position.encode(x, y);
```
