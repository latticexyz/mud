---
"@latticexyz/store": patch
"@latticexyz/world": patch
---

`defineStore` and `defineWorld` now maps your `enums` to usable, strongly-typed enums on `enumValues`.

```ts
const config = defineStore({
  enums: {
    TerrainType: ["Water", "Grass", "Sand"],
  },
});

config.enumValues.TerrainType.Water;
//                              ^? (property) Water: 0

config.enumValues.TerrainType.Grass;
//                              ^? (property) Grass: 1
```

This allows for easier referencing of enum values (i.e. `uint8` equivalent) in contract calls.

```ts
writeContract({
  // …
  functionName: "setTerrainType",
  args: [config.enumValues.TerrainType.Grass],
});
```
