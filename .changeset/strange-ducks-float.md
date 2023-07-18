---
"@latticexyz/common": minor
---

`TableId.toHex()` now truncates name/namespace to 16 bytes each, to properly fit into a `bytes32` hex string.

Also adds a few utils we'll need in the indexer:
- `bigIntMin` is similar to `Math.min` but for `bigint`s
- `bigIntMax` is similar to `Math.max` but for `bigint`s
- `bigIntSort` for sorting an array of `bigint`s
- `chunk` to split an array into chunks
- `wait` returns a `Promise` after specified number of milliseconds
