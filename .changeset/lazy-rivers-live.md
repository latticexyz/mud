---
"@latticexyz/store-indexer": patch
---

Fixed the `distance_from_follow_block` gauge to be a positive number if the latest processed block is lagging behind the latest remote block.
