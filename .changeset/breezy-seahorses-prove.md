---
"@latticexyz/utils": major
---

Removed `keccak256` and `keccak256Coord` hash utils in favor of [viem's `keccak256`](https://viem.sh/docs/utilities/keccak256.html#keccak256).

```diff
- import { keccak256 } from "@latticexyz/utils";
+ import { keccak256, toHex } from "viem";

- const hash = keccak256("some string");
+ const hash = keccak256(toHex("some string"));
```

```diff
- import { keccak256Coord } from "@latticexyz/utils";
+ import { encodeAbiParameters, keccak256, parseAbiParameters } from "viem";

  const coord = { x: 1, y: 1 };
- const hash = keccak256Coord(coord);
+ const hash = keccak256(encodeAbiParameters(parseAbiParameters("int32, int32"), [coord.x, coord.y]));
```
