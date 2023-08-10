---
"@latticexyz/cli": major
"@latticexyz/std-client": major
"@latticexyz/store-sync": major
"@latticexyz/store": patch
"@latticexyz/world": patch
"create-mud": major
---

RECS components are now dynamically created and inferred from your MUD config when using `syncToRecs`.

To migrate existing projects after upgrading to this MUD version:

1. Remove `contractComponents.ts` from `client/src/mud`
2. Remove `components` argument from `syncToRecs`
3. Update `build:mud` and `dev` scripts in `contracts/package.json` to remove tsgen

   ```diff
   - "build:mud": "mud tablegen && mud worldgen && mud tsgen --configPath mud.config.ts --out ../client/src/mud",
   + "build:mud": "mud tablegen && mud worldgen",
   ```

   ```diff
   - "dev": "pnpm mud dev-contracts --tsgenOutput ../client/src/mud",
   + "dev": "pnpm mud dev-contracts",
   ```


