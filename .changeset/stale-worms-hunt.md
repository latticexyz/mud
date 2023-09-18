---
"@latticexyz/store": major
---

Store events now use an `indexed` `tableId`. This adds ~100 gas per write, but means we our sync stack can filter events by table.
