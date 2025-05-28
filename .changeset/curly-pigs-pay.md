---
"@latticexyz/store-sync": patch
---

The sync stack now skips store logs with invalid key tuples instead of throwing errors.

MUD doesn’t validate schemas for onchain writes or deletions, it's the developer's responsibility to use correct encoding.
Using the wrong key schema onchain is effectively a no-op, since the data ends up in a storage slot that won’t be read when using the correct schema.
The expectation is that the sync stack ignores these no-op logs, but it was previously throwing during decode.
