---
"@latticexyz/block-logs-stream": patch
"@latticexyz/cli": patch
"@latticexyz/common": patch
"@latticexyz/config": patch
"@latticexyz/dev-tools": patch
"@latticexyz/faucet": patch
"@latticexyz/protocol-parser": patch
"@latticexyz/query": patch
"@latticexyz/schema-type": patch
"@latticexyz/store-indexer": patch
"@latticexyz/store-sync": patch
"@latticexyz/store": patch
"@latticexyz/world": patch
"create-mud": patch
---

Bumped viem to `2.19.8` and abitype to `1.0.5`.

MUD projects using viem or abitype should do the same to ensure no type errors due to mismatched versions:

```
pnpm recursive up viem@2.19.8 abitype@1.0.5
```
