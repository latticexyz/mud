---
"@latticexyz/common": minor
---

Added a `unique` helper to `@latticexyz/common/utils` to narrow an array to its unique elements.

```ts
import { unique } from "@latticexyz/common/utils";

unique([1, 2, 1, 4, 3, 2]);
// [1, 2, 4, 3]
```
