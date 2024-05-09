---
"@latticexyz/store": patch
"@latticexyz/world": patch
---

`defineStore` and `defineWorld` now convert `enums` to usable, strongly-typed enums in TS.

```ts
const config = defineStore({
  enums: {
    TerrainType: ["Water", "Grass", "Sand"],
  },
});

config.enums.TerrainType.Water;
//                         ^? (property) Water: 0

config.enums.TerrainType.Grass;
//                         ^? (property) Grass: 1
```

This should allow for easier referencing of enum elements in contract calls.

```ts
writeContract({
  // …
  functionName: "setTerrainType",
  args: [config.enums.TerrainType.Grass],
});
```
