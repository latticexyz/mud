---
"@latticexyz/world": patch
---

Removed an access control check for when the `World` is calling itself.
The `World` should not have implicit access to all resources, but only to those where it actually has access based on the `namespaceId` or `resourceId`.
