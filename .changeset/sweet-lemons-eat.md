---
"@latticexyz/store": patch
"@latticexyz/world": patch
---

`defineStore` and `defineWorld` now maps your `enums` to usable, strongly-typed enums on `mappedEnums`.

```ts
const config = defineStore({
  enums: {
    TerrainType: ["Water", "Grass", "Sand"],
  },
});

config.mappedEnums.TerrainType.Water;
//                              ^? (property) Water: 0

config.mappedEnums.TerrainType.Grass;
//                              ^? (property) Grass: 1
```

This should allow for easier referencing of enum elements in contract calls.

```ts
writeContract({
  // …
  functionName: "setTerrainType",
  args: [config.mappedEnums.TerrainType.Grass],
});
```
