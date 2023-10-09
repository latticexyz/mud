---
"@latticexyz/common": minor
---

Renames `resourceIdToHex` to `resourceToHex` and `hexToResourceId` to `hexToResource`, to better distinguish between a resource ID (hex value) and a resource reference (type, namespace, name).

```diff
- resourceIdToHex({ type: 'table', namespace: '', name: 'Position' });
+ resourceToHex({ type: 'table', namespace: '', name: 'Position' });
```

```diff
- hexToResourceId('0x...');
+ hexToResource('0x...');
```

Previous methods still exist but are now deprecated to ease migration and reduce breaking changes. These will be removed in a future version.

Also removes the previously deprecated and unused table ID utils (replaced by these resource ID utils).
