---
"@latticexyz/common": patch
---

Added an export for the root namespace string, which can be imported like so:

```
import { ROOT_NAMESPACE } from "@latticexyz/common";

if (namespace === ROOT_NAMESPACE) {
    ...
}
```
