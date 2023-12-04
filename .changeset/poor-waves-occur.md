---
"@latticexyz/common": minor
---

Added `unique` and `groupBy` array helpers to `@latticexyz/common/utils`.

```ts
import { unique } from "@latticexyz/common/utils";

unique([1, 2, 1, 4, 3, 2]);
// [1, 2, 4, 3]
```

```ts
import { groupBy } from "@latticexyz/common/utils";

const records = [
  { type: "cat", name: "Bob" },
  { type: "cat", name: "Spot" },
  { type: "dog", name: "Rover" },
];
Object.fromEntries(groupBy(records, (record) => record.type));
// {
//   "cat": [{ type: "cat", name: "Bob" }, { type: "cat", name: "Spot" }],
//   "dog: [{ type: "dog", name: "Rover" }]
// }
```
