---
"@latticexyz/common": minor
---

`createContract` now has an `onWrite` callback so you can observe writes. This is useful for wiring up the transanction log in MUD dev tools.

```ts
import { createContract, ContractWrite } from "@latticexyz/common";
import { Subject } from "rxjs";

const write$ = new Subject<ContractWrite>();
creactContract({
  ...
  onWrite: (write) => write$.next(write),
});
```
