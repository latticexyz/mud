---
"@latticexyz/protocol-parser": minor
---

feat: add `encodeKeyTuple`, a util to encode key tuples in Typescript (equivalent to key tuple encoding in Solidity and inverse of `decodeKeyTuple`).
Example:

```ts
encodeKeyTuple({ staticFields: ["uint256", "int32", "bytes16", "address", "bool", "int8"], dynamicFields: [] }, [
  42n,
  -42,
  "0x12340000000000000000000000000000",
  "0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF",
  true,
  3,
]);
// [
//  "0x000000000000000000000000000000000000000000000000000000000000002a",
//  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd6",
//  "0x1234000000000000000000000000000000000000000000000000000000000000",
//  "0x000000000000000000000000ffffffffffffffffffffffffffffffffffffffff",
//  "0x0000000000000000000000000000000000000000000000000000000000000001",
//  "0x0000000000000000000000000000000000000000000000000000000000000003",
// ]
```
