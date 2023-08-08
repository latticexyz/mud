---
"@latticexyz/cli": patch
"@latticexyz/network": major
"@latticexyz/protocol-parser": major
"@latticexyz/services": major
"@latticexyz/store-sync": major
"@latticexyz/store": major
---

Reverse PackedCounter encoding, to optimize gas for bitshifts.
Ints are right-aligned, shifting using an index is straightforward if they are indexed right-to-left.

- Previous encoding: (7 bytes | accumulator),(5 bytes | counter 1),...,(5 bytes | counter 5)
- New encoding: (5 bytes | counter 5),...,(5 bytes | counter 1),(7 bytes | accumulator)
