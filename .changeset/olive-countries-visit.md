---
"@latticexyz/explorer": patch
---

Previously, queries could only be executed if they had changed, as data fetching was tied to query updates. Now, it’s possible to trigger a new table data fetch explicitly, regardless of whether the query has changed.
