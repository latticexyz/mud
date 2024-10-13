---
"@latticexyz/block-logs-stream": patch
"@latticexyz/cli": patch
"@latticexyz/common": patch
"@latticexyz/config": patch
"@latticexyz/dev-tools": patch
"@latticexyz/explorer": patch
"@latticexyz/faucet": patch
"@latticexyz/protocol-parser": patch
"@latticexyz/schema-type": patch
"@latticexyz/stash": patch
"@latticexyz/store-indexer": patch
"@latticexyz/store-sync": patch
"@latticexyz/store": patch
"@latticexyz/world": patch
"create-mud": patch
---

Bumped viem to v2.21.19.

MUD projects using these packages should do the same to ensure no type errors due to mismatched versions:

```
pnpm recursive up viem@2.21.19
```
