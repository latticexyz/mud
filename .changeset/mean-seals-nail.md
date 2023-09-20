---
"@latticexyz/world": patch
"@latticexyz/store": patch
---

The `ResourceType` table is removed.
It was previously used to store the resource type for each resource ID in a `World`. This is no longer necessary as the [resource type is now encoded in the resource ID](https://github.com/latticexyz/mud/pull/1544).

To still be able to determine whether a given resource ID exists, a `ResourceIds` table has been added.
The previous `ResourceType` table was part of `World` and missed tables that were registered directly via `StoreCore.registerTable` instead of via `World.registerTable` (e.g. when a table was registered as part of a root module).
This problem is solved by the new table `ResourceIds` being part of `Store`.

`StoreCore`'s `hasTable` function was removed in favor of using `ResourceIds.getExists(tableId)` directly.

```diff
- import { ResourceType } from "@latticexyz/world/src/tables/ResourceType.sol";
- import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
+ import { ResourceIds } from "@latticexyz/store/src/codegen/tables/ResourceIds.sol";

- bool tableExists = StoreCore.hasTable(tableId);
+ bool tableExists = ResourceIds.getExists(tableId);

- bool systemExists = ResourceType.get(systemId) != Resource.NONE;
+ bool systemExists = ResourceIds.getExists(systemId);
```
