---
"@latticexyz/common": minor
---

Renames `resourceIdToHex` to `resourceToHex` and `hexToResourceId` to `hexToResource`, to better distinguish between a resource ID (hex value) and a resource reference (type, namespace, name).

Previous methods still exist but are now deprecated to ease migration and reduce breaking changes. These will be removed in a future version.

Also removes the previously deprecated and now-unused table ID utils (replaced by these resource ID utils).
