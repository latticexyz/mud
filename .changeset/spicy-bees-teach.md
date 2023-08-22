---
"@latticexyz/react": major
---

Removes `useRow` and `useRows` hooks, previously powered by `store-cache`, which is now deprecated. Please use `recs` and the corresponding `useEntityQuery` and `useComponentValue` hooks. We'll have more hooks soon for SQL.js sync backends.
