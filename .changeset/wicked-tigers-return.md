---
"@latticexyz/protocol-parser": minor
---

Adds `decodeKey`, `decodeValue`, `encodeKey`, and `encodeValue` helpers to decode/encode from key/value schemas. Deprecates previous methods that use a schema object with static/dynamic field arrays, originally attempting to model our on-chain behavior but ended up not very ergonomic when working with table configs.
